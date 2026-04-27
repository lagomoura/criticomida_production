import type { OpenStatusInfo } from '../types/restaurant';

const CLOSED_TOKENS = ['cerrado', 'closed'];

const DAY_INDEX_BY_KEY: Record<string, number> = {
  domingo: 0, sunday: 0,
  lunes: 1, monday: 1,
  martes: 2, tuesday: 2,
  'miércoles': 3, miercoles: 3, wednesday: 3,
  jueves: 4, thursday: 4,
  viernes: 5, friday: 5,
  'sábado': 6, sabado: 6, saturday: 6,
};

interface RangeMinutes {
  startMin: number;
  endMin: number;
  endsNextDay: boolean;
}

function parseClock(token: string): number | null {
  const cleaned = token.trim().toLowerCase().replace(/\s+/g, '');
  const m = cleaned.match(/^(\d{1,2})(?::(\d{2}))?(am|pm|a\.m\.|p\.m\.)?$/);
  if (!m) return null;
  let hour = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const ampm = m[3]?.replace(/\./g, '');
  if (ampm === 'pm' && hour < 12) hour += 12;
  if (ampm === 'am' && hour === 12) hour = 0;
  if (hour < 0 || hour > 24 || min < 0 || min > 59) return null;
  return hour * 60 + min;
}

function parseRanges(rest: string): RangeMinutes[] {
  const lower = rest.toLowerCase();
  if (CLOSED_TOKENS.some((t) => lower.includes(t))) return [];

  // Split on commas first (multiple ranges per day) then on en/em dash or hyphen
  const segments = rest.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
  const ranges: RangeMinutes[] = [];
  for (const seg of segments) {
    const parts = seg.split(/\s*[–—-]\s*/);
    if (parts.length !== 2) continue;
    const start = parseClock(parts[0]);
    const end = parseClock(parts[1]);
    if (start === null || end === null) continue;
    const endsNextDay = end <= start;
    ranges.push({ startMin: start, endMin: end, endsNextDay });
  }
  return ranges;
}

interface DayEntry {
  dayIndex: number;
  label: string;
  rest: string;
  ranges: RangeMinutes[];
}

function parseDayEntry(line: string): DayEntry | null {
  const idx = line.indexOf(':');
  if (idx === -1) return null;
  const dayWord = line.slice(0, idx).trim().toLowerCase();
  const rest = line.slice(idx + 1).trim();
  const dayIndex = DAY_INDEX_BY_KEY[dayWord];
  if (dayIndex === undefined) return null;
  return {
    dayIndex,
    label: line.slice(0, idx).trim(),
    rest,
    ranges: parseRanges(rest),
  };
}

function formatHHMM(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Best-effort parser for Google weekday_text strings.
 * Examples accepted:
 *  - "Monday: 9:00 AM – 10:00 PM"
 *  - "lunes: 9:00 – 22:00"
 *  - "domingo: Cerrado"
 * If a line can't be parsed, isOpen is null and only todayLabel is returned.
 */
export function parseOpeningHours(
  weekdayText: string[] | null | undefined,
  now: Date = new Date(),
): OpenStatusInfo {
  if (!weekdayText || weekdayText.length === 0) {
    return { isOpen: false, hasHours: false };
  }

  const entries: DayEntry[] = [];
  for (const line of weekdayText) {
    const e = parseDayEntry(line);
    if (e) entries.push(e);
  }
  if (entries.length === 0) {
    return { isOpen: false, hasHours: false, todayLabel: weekdayText[0] };
  }

  const todayDow = now.getDay();
  const todayMinutes = now.getHours() * 60 + now.getMinutes();

  const today = entries.find((e) => e.dayIndex === todayDow);
  const yesterdayDow = (todayDow + 6) % 7;
  const yesterday = entries.find((e) => e.dayIndex === yesterdayDow);
  const todayLabel = today?.rest;

  // Check yesterday's overnight range first
  if (yesterday) {
    for (const range of yesterday.ranges) {
      if (range.endsNextDay && todayMinutes < range.endMin) {
        return {
          isOpen: true,
          closesAt: formatHHMM(range.endMin),
          hasHours: true,
          todayLabel,
        };
      }
    }
  }

  // Check today's ranges
  if (today) {
    for (const range of today.ranges) {
      const within = range.endsNextDay
        ? todayMinutes >= range.startMin
        : todayMinutes >= range.startMin && todayMinutes < range.endMin;
      if (within) {
        const closeMin = range.endsNextDay
          ? range.endMin // tomorrow's
          : range.endMin;
        return {
          isOpen: true,
          closesAt: formatHHMM(closeMin),
          hasHours: true,
          todayLabel,
        };
      }
    }

    // Find next opening today
    const upcoming = today.ranges
      .filter((r) => r.startMin > todayMinutes)
      .sort((a, b) => a.startMin - b.startMin)[0];
    if (upcoming) {
      return {
        isOpen: false,
        opensAt: formatHHMM(upcoming.startMin),
        hasHours: true,
        todayLabel,
      };
    }
  }

  // Find next opening day in the next 7 days
  for (let offset = 1; offset <= 7; offset += 1) {
    const dow = (todayDow + offset) % 7;
    const day = entries.find((e) => e.dayIndex === dow);
    if (day && day.ranges.length > 0) {
      const first = day.ranges[0];
      return {
        isOpen: false,
        opensAt: `${day.label} ${formatHHMM(first.startMin)}`,
        hasHours: true,
        todayLabel,
      };
    }
  }

  return { isOpen: false, hasHours: true, todayLabel };
}
