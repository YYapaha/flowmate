'use strict';

const { handleCors } = require('./_utils/cors');
const { decomposeCache } = require('./_utils/cache');
const { getClient } = require('./_utils/openai');

const SYSTEM = `Tu es un assistant de décomposition de tâches pour personnes TDAH.
Décompose la tâche en 3 à 5 étapes concrètes, courtes et actionnables.
Réponds uniquement avec un tableau JSON de chaînes, ex: ["Étape 1", "Étape 2", "Étape 3"].
Pas de texte avant ou après. Juste le JSON.`;

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text } = req.body || {};
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text required' });
  }

  const key = text.trim().toLowerCase();

  const cached = decomposeCache.get(key);
  if (cached) return res.json({ steps: cached });

  try {
    const client = getClient();
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      max_tokens: 150,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: text.trim() },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? '[]';
    let steps;
    try {
      steps = JSON.parse(raw);
      if (!Array.isArray(steps)) throw new Error('not array');
      steps = steps.filter(s => typeof s === 'string').slice(0, 5);
    } catch {
      steps = [];
    }

    decomposeCache.set(key, steps);
    return res.json({ steps });
  } catch (err) {
    console.error('decompose error', err);
    return res.status(500).json({ error: 'decompose failed' });
  }
};
