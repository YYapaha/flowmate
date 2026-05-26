import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightPalette, darkPalette } from '../theme';

const THEME_KEY = '@flowmate:themeMode';
const VALID_MODES = ['system', 'light', 'dark'];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null
  const [mode, setModeState] = useState('system');

  // Restore persisted preference
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then(stored => { if (VALID_MODES.includes(stored)) setModeState(stored); })
      .catch(() => {});
  }, []);

  const setMode = useCallback(async (newMode) => {
    if (!VALID_MODES.includes(newMode)) return;
    setModeState(newMode);
    try { await AsyncStorage.setItem(THEME_KEY, newMode); } catch {}
  }, []);

  const isDark =
    mode === 'dark' ||
    (mode === 'system' && systemScheme === 'dark');

  const colors = isDark ? darkPalette : lightPalette;

  const value = useMemo(
    () => ({ colors, isDark, mode, setMode }),
    [colors, isDark, mode, setMode],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
