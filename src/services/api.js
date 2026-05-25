import { API_URL } from '../config';

async function post(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} ${res.status}`);
  return res.json();
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
