'use strict';

const { handleCors } = require('./_utils/cors');
const { getClient } = require('./_utils/openai');

const SYSTEM = `Tu es Flowmate. Tu parles comme un·e ami·e direct·e et calme — pas comme un coach, pas comme un robot.
En une seule phrase (max 60 tokens), résume ce que la personne a posé aujourd'hui.
Ton : frank, sobre, sans fioriture. Pas d'encouragement forcé, pas d'exclamation, pas de "bravo".
Constate, ne juge pas. Ne donne pas de conseil. Ne mentionne pas de chiffres ni de pourcentages.
Exemples de ton juste : "Tu as posé pas mal de choses ce matin." / "Quelques idées en attente, et une tâche qui revient souvent."
Exemples à éviter : "Super journée productive !" / "Tu as accompli beaucoup de choses aujourd'hui !"`;


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
