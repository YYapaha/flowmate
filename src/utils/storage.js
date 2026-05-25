import AsyncStorage from '@react-native-async-storage/async-storage';

const THOUGHTS_KEY = '@flowmate:thoughts';
const DRAFT_KEY = '@flowmate:draft';

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
