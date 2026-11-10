import siteConfig from '../config/site.config.js';

/**
 * Tiny text helpers so the config file can stay readable.
 *
 *   {name}      her name as written in a sentence   → "Akudzweishe"
 *   {NAME}      the display version                 → "AKUDZWEISHE"
 *   {short}     the everyday nickname               → "Aku"
 *   {SHORT}     the nickname, shouting               → "AKU"
 *
 * A token with nothing to expand to is left alone, so a typo in the config
 * shows up as a visible `{shrot}` rather than silently vanishing.
 */
export function tokenMap(config = siteConfig) {
  const short = config.recipient.short || config.recipient.salutation || config.recipient.name;
  return {
    name: config.recipient.salutation || config.recipient.name,
    NAME: config.recipient.name || config.recipient.salutation,
    short,
    SHORT: short ? String(short).toUpperCase() : '',
  };
}

export function interpolate(value, config = siteConfig) {
  if (typeof value !== 'string') return value;
  const map = tokenMap(config);
  return value.replace(/\{(name|NAME|short|SHORT)\}/g, (_, key) => map[key] || value);
}

/** Interpolate a string or an array of strings. */
export function interpolateAll(value, config = siteConfig) {
  if (Array.isArray(value)) return value.map((line) => interpolate(line, config));
  return interpolate(value, config);
}

/** True when the visitor asked the OS to reduce motion. */
export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Small localStorage wrapper that never throws (private mode, SSR, tests). */
export const store = {
  get(key, fallback = null) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore — remembering settings is a nicety, not a requirement */
    }
  },
};

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
