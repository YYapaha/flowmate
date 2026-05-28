import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightPalette, darkPalette, Shadows } from '../theme';

const THEME_KEY = '@flowmate:themeMode';
const STORM_KEY = '@flowmate:stormMode';
const VALID_MODES = ['system', 'light', 'dark'];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null
  const [mode, setModeState] = useState('system');
  const [stormMode, setStormModeState] = useState(false);

  // Restore persisted preferences
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then(stored => { if (VALID_MODES.includes(stored)) setModeState(stored); })
      .catch(() => {});
    AsyncStorage.getItem(STORM_KEY)
      .then(stored => { if (stored === 'true') setStormModeState(true); })
      .catch(() => {});
  }, []);

  const setMode = useCallback(async (newMode) => {
    if (!VALID_MODES.includes(newMode)) return;
    setModeState(newMode);
    try { await AsyncStorage.setItem(THEME_KEY, newMode); } catch {}
  }, []);

  const setStormMode = useCallback(async (val) => {
    setStormModeState(val);
    try { await AsyncStorage.setItem(STORM_KEY, val ? 'true' : 'false'); } catch {}
  }, []);

  const isDark =
    mode === 'dark' ||
    (mode === 'system' && systemScheme === 'dark');

  const colors = isDark ? darkPalette : lightPalette;

  const shadowSoft = useMemo(() => ({
    ...Shadows.soft,
    shadowColor: isDark ? '#000' : '#3E3A35',
  }), [isDark]);

  const value = useMemo(
    () => ({ colors, isDark, mode, setMode, stormMode, setStormMode, shadowSoft }),
    [colors, isDark, mode, setMode, stormMode, setStormMode, shadowSoft],
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
