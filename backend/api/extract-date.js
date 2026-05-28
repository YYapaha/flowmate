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
- "réunion projet mercredi 10h" → {"hasDate":true,"title":"réunion projet","date":"${nextWeekday(now,3)}","time":"10:00","duration":60}
- "appel client le 15/06/2025" → {"hasDate":true,"title":"appel client","date":"2025-06-15","duration":60}
- "déjeuner 3 juillet 2025 à 12h30" → {"hasDate":true,"title":"déjeuner","date":"2025-07-03","time":"12:30","duration":60}`;
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

const MONTHS_FR = {
  janvier:1, février:2, fevrier:2, mars:3, avril:4, mai:5, juin:6,
  juillet:7, août:8, aout:8, septembre:9, octobre:10, novembre:11, décembre:12, decembre:12,
};

function regexFallback(text) {
  // jj/mm/aaaa ou jj-mm-aaaa
  const dmy = text.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
  }
  // jj mois aaaa (ex: "3 juillet 2025")
  const dmy2 = text.match(/\b(\d{1,2})\s+([\wéû]+)\s+(\d{4})\b/i);
  if (dmy2) {
    const [, d, mon, y] = dmy2;
    const m = MONTHS_FR[mon.toLowerCase()];
    if (m) return `${y}-${String(m).padStart(2,'0')}-${d.padStart(2,'0')}`;
  }
  return null;
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
    let result;
    if (parsed.hasDate) {
      const date = String(parsed.date ?? '').trim() || regexFallback(text) || '';
      result = {
        hasDate: !!date,
        title:    String(parsed.title ?? text.slice(0, 60)).trim(),
        date,
        time:     parsed.time ? String(parsed.time).trim() : null,
        duration: Number(parsed.duration ?? 60),
      };
    } else {
      const fallbackDate = regexFallback(text);
      result = fallbackDate
        ? { hasDate: true, title: text.slice(0, 60).trim(), date: fallbackDate, time: null, duration: 60 }
        : { hasDate: false };
    }

    cache.set(key, result);
    return res.json(result);
  } catch (err) {
    console.error('extract-date error', err);
    return res.json({ hasDate: false });
  }
};
