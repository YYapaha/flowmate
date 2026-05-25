'use strict';

const { handleCors } = require('./_utils/cors');
const { classifyCache } = require('./_utils/cache');
const { getClient } = require('./_utils/openai');

const VALID_TAGS = ['tâche', 'idée', 'rendez-vous', 'émotion', 'rappel', 'autre'];

const SYSTEM = `Tu es un assistant de classification.
Classifie la pensée utilisateur en exactement un de ces tags (en minuscules, sans accent sur "tâche") :
tâche, idée, rendez-vous, émotion, rappel, autre
Réponds avec le tag uniquement, sans ponctuation ni explication.`;

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text } = req.body || {};
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text required' });
  }

  const key = text.trim().toLowerCase();

  const cached = classifyCache.get(key);
  if (cached) return res.json({ tag: cached });

  try {
    const client = getClient();
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      max_tokens: 10,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: text.trim() },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim().toLowerCase() ?? 'autre';
    const tag = VALID_TAGS.includes(raw) ? raw : 'autre';

    classifyCache.set(key, tag);
    return res.json({ tag });
  } catch (err) {
    console.error('classify error', err);
    return res.json({ tag: 'autre' });
  }
};
