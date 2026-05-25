import React, { createContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { loadThoughts, saveThoughts } from '../utils/storage';

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
  const isInitialLoad = useRef(true);

  useEffect(() => {
    loadThoughts().then(thoughts => dispatch({ type: 'LOAD', payload: thoughts }));
  }, []);

  // Persist to AsyncStorage after every change, skip the initial load
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
    return thought.id;
  }, []);

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
      value={{ thoughts: state.thoughts, loaded: state.loaded, addThought, archiveThought, deleteThought, updateTag, updateSteps }}
    >
      {children}
    </ThoughtContext.Provider>
  );
}
