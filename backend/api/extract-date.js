'use strict';

const { handleCors } = require('./_utils/cors');
const { getClient } = require('./_utils/openai');

// Simple in-process cache — avoids double-calling OpenAI for the same text
const cache = new Map();

function buildPrompt() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm   = String(now.getMonth() + 1).padStart(2, '0');
  const dd   = String(now.getDate()).padStart(2, '0');
  const today = `${yyyy}-${mm}-${dd}`;
  const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const dayName = days[now.getDay()];

  return `Tu es Flowmate. Aujourd'hui nous sommes ${dayName} ${today}.

Extrais les informations temporelles de la pensée suivante.
Retourne uniquement du JSON valide avec cette structure exacte :
{"hasDate":true,"title":"titre déduit (max 60 caractères)","date":"YYYY-MM-DD","time":"HH:MM","duration":60}

Si aucune information temporelle n'est présente, retourne :
{"hasDate":false}

Règles :
- Résous les dates relatives ("demain", "lundi prochain", "dans 3 jours") par rapport à aujourd'hui.
- "time" est optionnel. Si absent, omets-le.
- "duration" est en minutes, défaut 60.
- Le titre doit être court et descriptif.

Exemples :
- "rendez-vous chez le dentiste demain à 14h" → {"hasDate":true,"title":"dentiste","date":"${addDays(today,1)}","time":"14:00","duration":60}
- "penser à acheter du lait" → {"hasDate":false}
- "réunion projet mercredi 10h" → {"hasDate":true,"title":"réunion projet","date":"${nextWeekday(now,3)}","time":"10:00","duration":60}`;
}

function addDays(dateStr, n) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function nextWeekday(now, targetDay) {
  const d = new Date(now);
  const diff = (targetDay - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text } = req.body || {};
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text required' });
  }

  const key = text.trim().toLowerCase();
  if (cache.has(key)) return res.json(cache.get(key));

  try {
    const client = getClient();
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.1,
      max_tokens: 120,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: buildPrompt() },
        { role: 'user', content: text.trim() },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? '{"hasDate":false}';
    const parsed = JSON.parse(raw);
    const result = parsed.hasDate ? {
      hasDate: true,
      title:    String(parsed.title   ?? text.slice(0, 60)).trim(),
      date:     String(parsed.date    ?? '').trim(),
      time:     parsed.time ? String(parsed.time).trim() : null,
      duration: Number(parsed.duration ?? 60),
    } : { hasDate: false };

    cache.set(key, result);
    return res.json(result);
  } catch (err) {
    console.error('extract-date error', err);
    return res.json({ hasDate: false });
  }
};
