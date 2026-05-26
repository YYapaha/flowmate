const MONTHS_SHORT = [
  'jan.', 'fév.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sep.', 'oct.', 'nov.', 'déc.',
];

/**
 * Formate un rappel pour l'affichage dans un badge compact.
 * Exemples : "26 mai · 14:00" / "3 juin"
 */
export function formatReminderBadge(reminder) {
  if (!reminder?.hasDate || !reminder.date) return null;
  const [, m, d] = reminder.date.split('-');
  const dateStr = `${parseInt(d, 10)} ${MONTHS_SHORT[parseInt(m, 10) - 1]}`;
  return reminder.time ? `${dateStr} · ${reminder.time}` : dateStr;
}

export function formatRelativeTime(isoString) {
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  if (diffHour < 24) return `il y a ${diffHour} h`;
  if (diffDay === 1) return 'hier';
  return `il y a ${diffDay} j`;
}
