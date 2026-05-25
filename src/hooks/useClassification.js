import { useCallback, useRef } from 'react';
import { classifyThought } from '../services/api';

export function useClassification() {
  const cache = useRef(new Map());

  const classify = useCallback(async (id, text, onResult) => {
    const key = text.trim().toLowerCase();
    if (cache.current.has(key)) {
      onResult(id, cache.current.get(key));
      return;
    }
    try {
      const tag = await classifyThought(text);
      cache.current.set(key, tag);
      onResult(id, tag);
    } catch {
      onResult(id, 'autre');
    }
  }, []);

  return { classify };
}
