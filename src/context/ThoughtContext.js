import React, { createContext, useReducer, useEffect, useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { loadThoughts, saveThoughts } from '../utils/storage';
import { classifyThought, extractDate } from '../services/api';

// ─── Tag normalisation ────────────────────────────────────────────────────────
const KNOWN_TAGS = new Set([
  'tâche', 'idée', 'rendez-vous', 'émotion', 'rappel',
  'routine', 'achat', 'santé', 'travail', 'autre',
]);

function normalizeTag(raw) {
  const t = (raw ?? '').trim().toLowerCase();
  return KNOWN_TAGS.has(t) ? t : 'autre';
}

// ─── Context ──────────────────────────────────────────────────────────────────
export const ThoughtContext = createContext(null);

// ─── Reducer ──────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return { thoughts: action.payload, loaded: true };
    case 'ADD':
      return { ...state, thoughts: [action.payload, ...state.thoughts] };
    case 'ARCHIVE':
      return {
        ...state,
        thoughts: state.thoughts.map(t =>
          t.id === action.id ? { ...t, archived: true } : t
        ),
      };
    case 'DELETE':
      return { ...state, thoughts: state.thoughts.filter(t => t.id !== action.id) };
    case 'UPDATE_TAG':
      return {
        ...state,
        thoughts: state.thoughts.map(t =>
          t.id === action.id ? { ...t, tag: action.tag } : t
        ),
      };
    case 'UPDATE_STEPS':
      return {
        ...state,
        thoughts: state.thoughts.map(t =>
          t.id === action.id ? { ...t, steps: action.steps } : t
        ),
      };
    case 'UPDATE_REMINDER':
      return {
        ...state,
        thoughts: state.thoughts.map(t =>
          t.id === action.id ? { ...t, reminder: action.reminder } : t
        ),
      };
    default:
      return state;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ThoughtProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { thoughts: [], loaded: false });
  const [classifyingIds, setClassifyingIds] = useState(new Set());
  const isInitialLoad = useRef(true);
  const sessionCache  = useRef(new Map()); // text key → tag
  const retryQueue    = useRef([]);         // [{id, text}] failed classifications
  const pendingBatch  = useRef([]);         // [{id, text}] debounce accumulator
  const batchTimer    = useRef(null);
  const alertShown    = useRef(false);

  // ── Persistence ──────────────────────────────────────────────────────────
  useEffect(() => {
    loadThoughts().then(thoughts => dispatch({ type: 'LOAD', payload: thoughts }));
  }, []);

  useEffect(() => {
    if (!state.loaded) return;
    if (isInitialLoad.current) { isInitialLoad.current = false; return; }
    saveThoughts(state.thoughts).catch(() =>
      Alert.alert('Erreur', 'Impossible de sauvegarder tes pensées.')
    );
  }, [state.thoughts, state.loaded]);

  // ── Classification ───────────────────────────────────────────────────────
  const classify = useCallback(async (id, text) => {
    const key = text.trim().toLowerCase();
    if (sessionCache.current.has(key)) {
      dispatch({ type: 'UPDATE_TAG', id, tag: sessionCache.current.get(key) });
      return;
    }
    setClassifyingIds(prev => { const s = new Set(prev); s.add(id); return s; });
    try {
      const tag = normalizeTag(await classifyThought(text));
      sessionCache.current.set(key, tag);
      dispatch({ type: 'UPDATE_TAG', id, tag });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      alertShown.current = false;
    } catch {
      retryQueue.current.push({ id, text });
      if (!alertShown.current) {
        alertShown.current = true;
        Alert.alert(
          'Classification indisponible',
          'Classification temporairement indisponible, réessai automatique plus tard.',
          [{ text: 'OK' }],
        );
      }
    } finally {
      setClassifyingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    }
  }, []);

  const scheduleClassify = useCallback((id, text) => {
    pendingBatch.current.push({ id, text });
    clearTimeout(batchTimer.current);
    batchTimer.current = setTimeout(() => {
      const batch = [...pendingBatch.current];
      pendingBatch.current = [];
      const seen = new Set();
      batch.forEach(({ id: bId, text: bText }) => {
        const key = bText.trim().toLowerCase();
        if (!seen.has(key)) seen.add(key);
        classify(bId, bText);
      });
    }, 2_000);
  }, [classify]);

  useEffect(() => {
    if (!state.loaded) return;
    state.thoughts
      .filter(t => !t.archived && t.tag === 'en cours')
      .forEach(t => scheduleClassify(t.id, t.text));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.loaded]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const items = retryQueue.current.splice(0);
      items.forEach(({ id, text }) => classify(id, text));
    }, 30_000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => clearTimeout(batchTimer.current), []);

  // ── Date extraction (non-blocking, fire-and-forget) ───────────────────────
  const extractReminderAsync = useCallback(async (id, text) => {
    try {
      const reminder = await extractDate(text);
      if (reminder?.hasDate) {
        dispatch({ type: 'UPDATE_REMINDER', id, reminder });
      }
    } catch {
      // reminder extraction is optional — silent fail
    }
  }, []);

  // ── CRUD ─────────────────────────────────────────────────────────────────
  const addThought = useCallback((text) => {
    const thought = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text,
      tag: 'en cours',
      reminder: null,
      createdAt: new Date().toISOString(),
      archived: false,
      steps: null,
    };
    dispatch({ type: 'ADD', payload: thought });
    scheduleClassify(thought.id, text);
    extractReminderAsync(thought.id, text);
    return thought.id;
  }, [scheduleClassify, extractReminderAsync]);

  /** Crée directement un rappel depuis l'écran Calendrier (sans passer par l'IA). */
  const addManualReminder = useCallback((title, date, time, description) => {
    const thought = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text: description || title,
      tag: 'rappel',
      reminder: { hasDate: true, title: title.trim(), date, time: time || null, duration: 60 },
      createdAt: new Date().toISOString(),
      archived: false,
      steps: null,
    };
    dispatch({ type: 'ADD', payload: thought });
    return thought.id;
  }, []);

  const archiveThought = useCallback((id) => dispatch({ type: 'ARCHIVE', id }), []);
  const deleteThought  = useCallback((id) => dispatch({ type: 'DELETE',  id }), []);
  const updateTag      = useCallback((id, tag)   => dispatch({ type: 'UPDATE_TAG',      id, tag }),   []);
  const updateSteps    = useCallback((id, steps)  => dispatch({ type: 'UPDATE_STEPS',    id, steps }), []);
  const updateReminder = useCallback((id, reminder) => dispatch({ type: 'UPDATE_REMINDER', id, reminder }), []);

  return (
    <ThoughtContext.Provider
      value={{
        thoughts: state.thoughts,
        loaded: state.loaded,
        classifyingIds,
        addThought,
        addManualReminder,
        archiveThought,
        deleteThought,
        updateTag,
        updateSteps,
        updateReminder,
      }}
    >
      {children}
    </ThoughtContext.Provider>
  );
}
