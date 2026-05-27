import AsyncStorage from '@react-native-async-storage/async-storage';

const THOUGHTS_KEY = '@flowmate:thoughts';
const DRAFT_KEY    = '@flowmate:draft';
const DRAWERS_KEY  = '@flowmate:drawers';

export async function loadThoughts() {
  try {
    const raw = await AsyncStorage.getItem(THOUGHTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('loadThoughts failed:', e);
    return [];
  }
}

export async function saveThoughts(thoughts) {
  await AsyncStorage.setItem(THOUGHTS_KEY, JSON.stringify(thoughts));
}

export async function loadDraft() {
  try {
    return await AsyncStorage.getItem(DRAFT_KEY);
  } catch {
    return null;
  }
}

export async function saveDraft(text) {
  try {
    if (text) {
      await AsyncStorage.setItem(DRAFT_KEY, text);
    } else {
      await AsyncStorage.removeItem(DRAFT_KEY);
    }
  } catch {
    // silent — draft is best-effort
  }
}

export async function loadDrawers() {
  try {
    const raw = await AsyncStorage.getItem(DRAWERS_KEY);
    return raw ? JSON.parse(raw) : null; // null → caller uses defaults
  } catch {
    return null;
  }
}

export async function saveDrawers(drawers) {
  try {
    await AsyncStorage.setItem(DRAWERS_KEY, JSON.stringify(drawers));
  } catch (e) {
    console.error('saveDrawers failed:', e);
  }
}
