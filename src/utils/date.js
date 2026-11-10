/**
 * Date helpers for the optional countdown / count-up line.
 * Config gives us 'YYYY-MM-DD' (only month and day matter) or 'auto'.
 */

const DAY = 86400000;

function startOfDay(date) {
  const copy = new Date(date.getTime());
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function parseConfigured(value) {
  if (typeof value !== 'string') return null;
  const match = value.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const date = new Date(year, month - 1, day);
  // Reject impossible dates like 2026-02-30, which JS would silently roll over.
  if (date.getMonth() !== month - 1 || date.getDate() !== day) return null;

  return { month: date.getMonth(), day: date.getDate(), year: date.getFullYear() };
}

export function daysBetween(a, b) {
  return Math.round((b.getTime() - a.getTime()) / DAY);
}

/**
 * Returns a small description object for the birthday line.
 *  kind: 'today' | 'upcoming' | 'past' | 'hidden'
 */
export function describeBirthday(value, now = new Date()) {
  const today = startOfDay(now);
  const parsed = parseConfigured(value);

  if (!parsed) {
    // 'auto' (or empty / malformed) → today is always the day.
    return { kind: 'today', days: 0, isToday: true, next: today, label: 'Today, the day itself.' };
  }

  let next = new Date(today.getFullYear(), parsed.month, parsed.day);
  if (next < today) next = new Date(today.getFullYear() + 1, parsed.month, parsed.day);

  const days = daysBetween(today, next);

  if (days === 0) {
    return { kind: 'today', days: 0, isToday: true, next, label: 'Today, the day itself.' };
  }

  // Is the birthday we were given *this year* in the past (i.e. counting up)?
  const thisYear = new Date(today.getFullYear(), parsed.month, parsed.day);
  if (next.getFullYear() !== thisYear.getFullYear()) {
    const since = daysBetween(thisYear, today);
    return {
      kind: 'past',
      days: since,
      isToday: false,
      next,
      label: `${since} ${since === 1 ? 'day' : 'days'} since her day — ${days} to go around again.`,
    };
  }

  return {
    kind: 'upcoming',
    days,
    isToday: false,
    next,
    label: `${days} ${days === 1 ? 'day' : 'days'} until her day.`,
  };
}

export function formatLongDate(date) {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return date.toDateString();
  }
}
