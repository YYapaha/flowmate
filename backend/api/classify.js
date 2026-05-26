'use strict';

const { handleCors } = require('./_utils/cors');
const { classifyCache } = require('./_utils/cache');
const { getClient } = require('./_utils/openai');

// Canonical display forms (with accents) — returned to the mobile app
const VALID_TAGS = new Set([
  'tâche', 'idée', 'rendez-vous', 'émotion', 'rappel',
  'routine', 'achat', 'santé', 'travail', 'autre',
]);

// Map every variant the model might produce → canonical form
const NORMALIZE = {
  'tache':       'tâche',   'tâche':       'tâche',
  'idee':        'idée',    'idée':        'idée',
  'emotion':     'émotion', 'émotion':     'émotion',
  'rappel':      'rappel',
  'rendez-vous': 'rendez-vous',
  'routine':     'routine',
  'achat':       'achat',
  'sante':       'santé',   'santé':       'santé',
  'travail':     'travail',
  'autre':       'autre',
};

const SYSTEM = `Tu es Flowmate, un assistant bienveillant pour personnes TDAH.

Classe la pensée de l'utilisateur dans l'une des catégories suivantes, en te basant sur les exemples.

Catégories :
- tâche : action à faire une fois (ex: "préparer dossier pour demain", "appeler le médecin")
- idée : concept, inspiration, réflexion (ex: "et si on organisait un atelier cuisine")
- rendez-vous : réunion, appel programmé, événement social (ex: "meeting avec Estelle à 14h")
- émotion : ressenti, humeur, sentiment (ex: "je me sens fatigué", "stressé par le travail")
- rappel : information à ne pas oublier (ex: "anniversaire de Sophie le 10 juin")
- routine : action répétitive quotidienne ou hebdomadaire (ex: "nourrir les chiens", "minoxidil", "mettre le réveil", "méditation du matin")
- achat : besoin matériel, course (ex: "acheter du lait", "commander cartouches imprimante")
- santé : soin, médicament, exercice, bien-être (ex: "prendre vitamine D", "séance kiné")
- travail : spécifique au contexte professionnel (ex: "relire le rapport", "définir objectifs trimestre")
- autre : aucun des ci-dessus

Ne réponds que par le nom de la catégorie, en minuscules, sans mot supplémentaire.
N'utilise pas d'émoticônes, pas d'exclamations, pas de commentaire.

Exemples :
- "nourrir les chiens ce soir" → routine
- "minoxidil avant de dormir" → santé
- "préparer réunion projet X" → tâche
- "demain 10h appel avec Claire" → rendez-vous
- "j'ai peur de rater mon examen" → émotion
- "ne pas oublier d'acheter du pain" → rappel`;

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
      temperature: 0.1,
      max_tokens: 10,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: text.trim() },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim().toLowerCase() ?? '';
    const tag = NORMALIZE[raw] ?? 'autre';

    classifyCache.set(key, tag);
    return res.json({ tag });
  } catch (err) {
    console.error('classify error', err);
    return res.json({ tag: 'autre' });
  }
};
