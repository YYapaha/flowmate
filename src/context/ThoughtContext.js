import React, { createContext, useReducer, useEffect, useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { loadThoughts, saveThoughts, loadDrawers, saveDrawers } from '../utils/storage';
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

// ─── Default drawers ──────────────────────────────────────────────────────────
const NOW = new Date().toISOString();
const DEFAULT_DRAWERS = [
  { id: 'd-travail',   name: 'Travail',   tag: 'travail', createdAt: NOW, updatedAt: NOW },
  { id: 'd-idees',     name: 'Idées',     tag: 'idée',    createdAt: NOW, updatedAt: NOW },
  { id: 'd-courses',   name: 'Courses',   tag: 'achat',   createdAt: NOW, updatedAt: NOW },
  { id: 'd-sante',     name: 'Santé',     tag: 'santé',   createdAt: NOW, updatedAt: NOW },
  { id: 'd-personnel', name: 'Personnel', tag: 'autre',   createdAt: NOW, updatedAt: NOW },
];

// ─── Context ──────────────────────────────────────────────────────────────────
export const ThoughtContext = createContext(null);

// ─── Reducer ──────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return { ...state, thoughts: action.payload, loaded: true };

    case 'LOAD_DRAWERS':
      return { ...state, drawers: action.payload, drawersLoaded: true };

    case 'ADD':
      return { ...state, thoughts: [action.payload, ...state.thoughts] };

    case 'ARCHIVE':
      return {
        ...state,
        thoughts: state.thoughts.map(t =>
          t.id === action.id
            ? { ...t, archived: true, archivedAt: action.archivedAt }
            : t
        ),
      };

    case 'UNARCHIVE':
      return {
        ...state,
        thoughts: state.thoughts.map(t =>
          t.id === action.id
            ? { ...t, archived: false, archivedAt: null, updatedAt: action.updatedAt }
            : t
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

    case 'EDIT_REMINDER':
      return {
        ...state,
        thoughts: state.thoughts.map(t =>
          t.id === action.id
            ? {
                ...t,
                reminder: action.reminder,
                ...(action.text !== undefined ? { text: action.text } : {}),
                updatedAt: action.updatedAt,
              }
            : t
        ),
      };

    // ── Drawer CRUD ────────────────────────────────────────────────────────
    case 'ADD_DRAWER':
      return { ...state, drawers: [...state.drawers, action.payload] };

    case 'UPDATE_DRAWER':
      return {
        ...state,
        drawers: state.drawers.map(d =>
          d.id === action.id
            ? { ...d, ...action.updates, updatedAt: action.updatedAt }
            : d
        ),
      };

    case 'DELETE_DRAWER':
      return {
        ...state,
        drawers: state.drawers.filter(d => d.id !== action.id),
        // move orphaned thoughts back to Bureau
        thoughts: state.thoughts.map(t =>
          t.drawerId === action.id ? { ...t, drawerId: null } : t
        ),
      };

    // ── Thought ↔ Drawer movement ──────────────────────────────────────────
    case 'MOVE_TO_DRAWER':
      return {
        ...state,
        thoughts: state.thoughts.map(t =>
          t.id === action.thoughtId ? { ...t, drawerId: action.drawerId } : t
        ),
      };

    case 'MOVE_TO_BUREAU':
      return {
        ...state,
        thoughts: state.thoughts.map(t =>
          t.id === action.thoughtId ? { ...t, drawerId: null } : t
        ),
      };

    default:
      return state;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ThoughtProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, {
    thoughts: [],
    drawers: [],
    loaded: false,
    drawersLoaded: false,
  });
  const [classifyingIds, setClassifyingIds] = useState(new Set());
  const isInitialLoad        = useRef(true);
  const isInitialDrawerLoad  = useRef(true);
  const sessionCache         = useRef(new Map());
  const retryQueue           = useRef([]);
  const pendingBatch         = useRef([]);
  const batchTimer           = useRef(null);
  const alertShown           = useRef(false);

  // ── Persistence ───────────────────────────────────────────────────────────
  useEffect(() => {
    loadThoughts().then(thoughts => dispatch({ type: 'LOAD', payload: thoughts }));
  }, []);

  useEffect(() => {
    loadDrawers().then(drawers =>
      dispatch({ type: 'LOAD_DRAWERS', payload: drawers ?? DEFAULT_DRAWERS })
    );
  }, []);

  useEffect(() => {
    if (!state.loaded) return;
    if (isInitialLoad.current) { isInitialLoad.current = false; return; }
    saveThoughts(state.thoughts).catch(() =>
      Alert.alert('Erreur', 'Impossible de sauvegarder tes pensées.')
    );
  }, [state.thoughts, state.loaded]);

  useEffect(() => {
    if (!state.drawersLoaded) return;
    if (isInitialDrawerLoad.current) { isInitialDrawerLoad.current = false; return; }
    saveDrawers(state.drawers);
  }, [state.drawers, state.drawersLoaded]);

  // ── Classification ────────────────────────────────────────────────────────
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

  // ── Date extraction ───────────────────────────────────────────────────────
  const extractReminderAsync = useCallback(async (id, text) => {
    try {
      const reminder = await extractDate(text);
      if (reminder?.hasDate) {
        dispatch({ type: 'UPDATE_REMINDER', id, reminder });
      }
    } catch {
      // optional — silent fail
    }
  }, []);

  // ── CRUD : Thoughts ───────────────────────────────────────────────────────
  const addThought = useCallback((text) => {
    const thought = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text,
      tag: 'en cours',
      reminder: null,
      createdAt: new Date().toISOString(),
      archived: false,
      archivedAt: null,
      steps: null,
      drawerId: null,
    };
    dispatch({ type: 'ADD', payload: thought });
    scheduleClassify(thought.id, text);
    extractReminderAsync(thought.id, text);
    return thought.id;
  }, [scheduleClassify, extractReminderAsync]);

  const addManualReminder = useCallback((title, date, time, description) => {
    const thought = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text: description || title,
      tag: 'rappel',
      reminder: { hasDate: true, title: title.trim(), date, time: time || null, duration: 60 },
      createdAt: new Date().toISOString(),
      archived: false,
      archivedAt: null,
      isManualReminder: true,
      steps: null,
      drawerId: null,
    };
    dispatch({ type: 'ADD', payload: thought });
    return thought.id;
  }, []);

  const archiveThought   = useCallback((id) =>
    dispatch({ type: 'ARCHIVE',   id, archivedAt: new Date().toISOString() }), []);
  const unarchiveThought = useCallback((id) =>
    dispatch({ type: 'UNARCHIVE', id, updatedAt:  new Date().toISOString() }), []);
  const deleteThought    = useCallback((id) => dispatch({ type: 'DELETE', id }), []);
  const updateTag      = useCallback((id, tag)     => dispatch({ type: 'UPDATE_TAG',   id, tag }),     []);
  const updateSteps    = useCallback((id, steps)   => dispatch({ type: 'UPDATE_STEPS', id, steps }),   []);
  const updateReminder = useCallback((id, reminder) => dispatch({ type: 'UPDATE_REMINDER', id, reminder }), []);

  const editReminder = useCallback((id, newReminder, newText) => {
    dispatch({
      type: 'EDIT_REMINDER',
      id,
      reminder: { hasDate: true, ...newReminder },
      text: newText,
      updatedAt: new Date().toISOString(),
    });
  }, []);

  const clearReminder = useCallback((id) =>
    dispatch({ type: 'UPDATE_REMINDER', id, reminder: null }), []);

  // ── CRUD : Drawers ────────────────────────────────────────────────────────
  const createDrawer = useCallback((name, tag) => {
    const drawer = {
      id: `d-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      name: name.trim(),
      tag,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_DRAWER', payload: drawer });
    return drawer.id;
  }, []);

  const updateDrawer = useCallback((id, updates) => {
    dispatch({ type: 'UPDATE_DRAWER', id, updates, updatedAt: new Date().toISOString() });
  }, []);

  const deleteDrawer = useCallback((id) => {
    dispatch({ type: 'DELETE_DRAWER', id });
  }, []);

  const moveThoughtToDrawer = useCallback((thoughtId, drawerId) => {
    dispatch({ type: 'MOVE_TO_DRAWER', thoughtId, drawerId });
  }, []);

  const moveThoughtToBureau = useCallback((thoughtId) => {
    dispatch({ type: 'MOVE_TO_BUREAU', thoughtId });
  }, []);

  return (
    <ThoughtContext.Provider
      value={{
        thoughts: state.thoughts,
        drawers: state.drawers,
        loaded: state.loaded,
        drawersLoaded: state.drawersLoaded,
        classifyingIds,
        addThought,
        addManualReminder,
        archiveThought,
        unarchiveThought,
        deleteThought,
        updateTag,
        updateSteps,
        updateReminder,
        editReminder,
        clearReminder,
        createDrawer,
        updateDrawer,
        deleteDrawer,
        moveThoughtToDrawer,
        moveThoughtToBureau,
      }}
    >
      {children}
    </ThoughtContext.Provider>
  );
}
