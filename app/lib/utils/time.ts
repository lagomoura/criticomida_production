const UNITS: Array<{ unit: Intl.RelativeTimeFormatUnit; seconds: number }> = [
  { unit: 'year', seconds: 60 * 60 * 24 * 365 },
  { unit: 'month', seconds: 60 * 60 * 24 * 30 },
  { unit: 'week', seconds: 60 * 60 * 24 * 7 },
  { unit: 'day', seconds: 60 * 60 * 24 },
  { unit: 'hour', seconds: 60 * 60 },
  { unit: 'minute', seconds: 60 },
  { unit: 'second', seconds: 1 },
];

const JUST_NOW: Record<string, string> = {
  es: 'justo ahora',
  en: 'just now',
  pt: 'agora mesmo',
};

/**
 * Compact relative-time string (e.g. "hace 3 min", "3 min ago"). Default
 * locale is 'es' so existing callers without a locale keep their previous
 * behavior.
 */
export function formatRelativeTime(
  iso: string,
  locale: string = 'es',
  now: Date = new Date(),
): string {
  const then = new Date(iso);
  const diffSeconds = Math.round((now.getTime() - then.getTime()) / 1000);

  if (diffSeconds >= 0 && diffSeconds < 15) {
    return JUST_NOW[locale] ?? JUST_NOW.es;
  }

  const absSeconds = Math.abs(diffSeconds);
  const match = UNITS.find(({ seconds }) => absSeconds >= seconds) ?? UNITS[UNITS.length - 1];
  const value = Math.round(diffSeconds / match.seconds) * -1;

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'short' });
  return rtf.format(value, match.unit);
}
