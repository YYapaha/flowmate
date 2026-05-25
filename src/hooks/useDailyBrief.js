import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchBrief } from '../services/api';

const BRIEF_DATE_KEY = '@flowmate:lastBriefDate';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function useDailyBrief(thoughts) {
  const [brief, setBrief] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (thoughts.length === 0) return;

    AsyncStorage.getItem(BRIEF_DATE_KEY).then(async (stored) => {
      if (stored === todayStr()) return;
      try {
        const texts = thoughts.slice(0, 20).map(t => t.text);
        const text = await fetchBrief(texts);
        if (text) {
          setBrief(text);
          setVisible(true);
        }
      } catch {
        // silent fail — brief is non-critical
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  const dismiss = useCallback(() => {
    setVisible(false);
    AsyncStorage.setItem(BRIEF_DATE_KEY, todayStr()).catch(() => {});
  }, []);

  return { brief, visible, dismiss };
}
