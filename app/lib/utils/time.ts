const UNITS: Array<{ unit: Intl.RelativeTimeFormatUnit; seconds: number }> = [
  { unit: 'year', seconds: 60 * 60 * 24 * 365 },
  { unit: 'month', seconds: 60 * 60 * 24 * 30 },
  { unit: 'week', seconds: 60 * 60 * 24 * 7 },
  { unit: 'day', seconds: 60 * 60 * 24 },
  { unit: 'hour', seconds: 60 * 60 },
  { unit: 'minute', seconds: 60 },
  { unit: 'second', seconds: 1 },
];

/**
 * Returns a compact relative-time string (e.g. "hace 3 min", "hace 2 días").
 * Uses Intl.RelativeTimeFormat (works on server + client). Falls back to
 * `"justo ahora"` for <15s.
 */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const diffSeconds = Math.round((now.getTime() - then.getTime()) / 1000);

  if (diffSeconds >= 0 && diffSeconds < 15) {
    return 'justo ahora';
  }

  const absSeconds = Math.abs(diffSeconds);
  const match = UNITS.find(({ seconds }) => absSeconds >= seconds) ?? UNITS[UNITS.length - 1];
  const value = Math.round(diffSeconds / match.seconds) * -1;

  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto', style: 'short' });
  return rtf.format(value, match.unit);
}
