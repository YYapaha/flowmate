import { API_URL } from '../config';

const TIMEOUT_MS = 10_000;

async function post(path, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`${path} ${res.status}`);
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function classifyThought(text) {
  const data = await post('/api/classify', { text });
  return data.tag ?? 'autre';
}

export async function fetchBrief(thoughts) {
  const data = await post('/api/brief', { thoughts });
  return data.brief ?? '';
}

export async function decomposeThought(text) {
  const data = await post('/api/decompose', { text });
  return Array.isArray(data.steps) ? data.steps : [];
}

export async function extractDate(text) {
  const data = await post('/api/extract-date', { text });
  return data ?? { hasDate: false };
}
