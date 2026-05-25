import { useContext } from 'react';
import { ThoughtContext } from '../context/ThoughtContext';

export function useThoughts() {
  const ctx = useContext(ThoughtContext);
  if (!ctx) throw new Error('useThoughts must be used within ThoughtProvider');
  return ctx;
}
