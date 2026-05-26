import React, { createContext, useReducer, useEffect, useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { loadThoughts, saveThoughts } from '../utils/storage';
import { classifyThought } from '../services/api';

export const ThoughtContext = createContext(null);

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
    default:
      return state;
  }
}

export function ThoughtProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { thoughts: [], loaded: false });
  const [classifyingIds, setClassifyingIds] = useState(new Set());
  const isInitialLoad = useRef(true);
  const sessionCache = useRef(new Map()); // normalized text → tag
  const retryQueue = useRef([]);          // [{id, text}] — failed classifications
  const pendingBatch = useRef([]);        // [{id, text}] — debounce accumulator
  const batchTimer = useRef(null);
  const alertShown = useRef(false);       // throttle error Alert to once per burst

  // Load from storage on mount
  useEffect(() => {
    loadThoughts().then(thoughts => dispatch({ type: 'LOAD', payload: thoughts }));
  }, []);

  // Persist after every change, skip the initial hydration
  useEffect(() => {
    if (!state.loaded) return;
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    saveThoughts(state.thoughts).catch(() => {
      Alert.alert('Erreur', 'Impossible de sauvegarder tes pensées.');
    });
  }, [state.thoughts, state.loaded]);

  // Core async classification — cache + haptic + error handling
  const classify = useCallback(async (id, text) => {
    const key = text.trim().toLowerCase();

    if (sessionCache.current.has(key)) {
      dispatch({ type: 'UPDATE_TAG', id, tag: sessionCache.current.get(key) });
      return;
    }

    setClassifyingIds(prev => { const s = new Set(prev); s.add(id); return s; });
    try {
      const tag = await classifyThought(text);
      sessionCache.current.set(key, tag);
      dispatch({ type: 'UPDATE_TAG', id, tag });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      alertShown.current = false;
    } catch {
      // Keep tag as "en cours" — visually signals pending state; add to retry queue
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
  }, []); // dispatch & setClassifyingIds are guaranteed stable by React

  // Debounced batch: accumulate for 2 s, then flush unique texts only
  const scheduleClassify = useCallback((id, text) => {
    pendingBatch.current.push({ id, text });
    clearTimeout(batchTimer.current);
    batchTimer.current = setTimeout(() => {
      const batch = [...pendingBatch.current];
      pendingBatch.current = [];
      const seen = new Set();
      batch.forEach(({ id: bId, text: bText }) => {
        const key = bText.trim().toLowerCase();
        // For duplicate texts the session cache makes the second call instant
        if (!seen.has(key)) seen.add(key);
        classify(bId, bText);
      });
    }, 2_000);
  }, [classify]);

  // On load: re-classify any thought still tagged "en cours" (from a previous failed session)
  useEffect(() => {
    if (!state.loaded) return;
    state.thoughts
      .filter(t => !t.archived && t.tag === 'en cours')
      .forEach(t => scheduleClassify(t.id, t.text));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.loaded]); // intentionally fires only once when loaded flips to true

  // Retry queue: flush after 30 s
  useEffect(() => {
    const timer = setTimeout(() => {
      const items = retryQueue.current.splice(0);
      items.forEach(({ id, text }) => classify(id, text));
    }, 30_000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup batch timer on unmount
  useEffect(() => () => clearTimeout(batchTimer.current), []);

  const addThought = useCallback((text) => {
    const thought = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text,
      tag: 'en cours',
      createdAt: new Date().toISOString(),
      archived: false,
      steps: null,
    };
    dispatch({ type: 'ADD', payload: thought });
    scheduleClassify(thought.id, text);
    return thought.id;
  }, [scheduleClassify]);

  const archiveThought = useCallback((id) => {
    dispatch({ type: 'ARCHIVE', id });
  }, []);

  const deleteThought = useCallback((id) => {
    dispatch({ type: 'DELETE', id });
  }, []);

  const updateTag = useCallback((id, tag) => {
    dispatch({ type: 'UPDATE_TAG', id, tag });
  }, []);

  const updateSteps = useCallback((id, steps) => {
    dispatch({ type: 'UPDATE_STEPS', id, steps });
  }, []);

  return (
    <ThoughtContext.Provider
      value={{
        thoughts: state.thoughts,
        loaded: state.loaded,
        classifyingIds,
        addThought,
        archiveThought,
        deleteThought,
        updateTag,
        updateSteps,
      }}
    >
      {children}
    </ThoughtContext.Provider>
  );
}
