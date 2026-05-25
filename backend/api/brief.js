'use strict';

const { handleCors } = require('./_utils/cors');
const { getClient } = require('./_utils/openai');

const SYSTEM = `Tu es Flowmate, un assistant bienveillant pour les personnes TDAH.
En une seule phrase courte et douce (max 60 tokens), fais un bref résumé des pensées du jour.
Sois neutre, chaleureux, sans jugement. Pas de conseil, pas de liste. Juste une phrase.`;

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { thoughts } = req.body || {};
  if (!Array.isArray(thoughts) || thoughts.length === 0) {
    return res.status(400).json({ error: 'thoughts array required' });
  }

  const content = thoughts.slice(0, 20).map((t, i) => `${i + 1}. ${t}`).join('\n');

  try {
    const client = getClient();
    const completion = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      max_tokens: 60,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: `Voici mes pensées du jour :\n${content}` },
      ],
    });

    const brief = completion.choices[0]?.message?.content?.trim() ?? '';
    return res.json({ brief });
  } catch (err) {
    console.error('brief error', err);
    return res.status(500).json({ error: 'brief failed' });
  }
};
