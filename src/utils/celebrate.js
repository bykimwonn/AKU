import confetti from 'canvas-confetti';
import siteConfig from '../config/site.config.js';
import { prefersReducedMotion } from './text.js';

const PALETTE = ['#d8b77a', '#ebc6d3', '#fffdfc', '#f8f0eb', '#c99a6f', '#b8628a'];

let petalShape = null;

/** A rose-petal confetti shape, if this browser can do custom paths. */
function getPetals() {
  if (petalShape !== null) return petalShape;
  try {
    if (typeof confetti.shapeFromPath !== 'function') return (petalShape = false);
    petalShape = confetti.shapeFromPath({
      path: 'M10 0C15 0 20 5 20 10c0 6-6 10-10 14C6 20 0 16 0 10 0 5 5 0 10 0z',
      fill: true,
    });
  } catch {
    petalShape = false;
  }
  return petalShape;
}

function fire(options) {
  try {
    confetti({
      zIndex: 120,
      colors: PALETTE,
      disableForReducedMotion: true,
      random: Math.random,
      ...options,
    });
  } catch {
    /* confetti is a nicety; it must never break the moment */
  }
}

/**
 * The celebration: three soft volleys of gold, blush and rose petals, plus a
 * short drift of petals from the top of the screen.
 *
 * Returns immediately if the visitor asked for reduced motion or if
 * `effects.confetti` is switched off in the config.
 */
export function celebrate({ big = false } = {}) {
  if (prefersReducedMotion()) return false;
  if (siteConfig.effects?.confetti === false) return false;

  const petals = getPetals();
  const shapes = petals ? ['circle', 'square', petals] : ['circle', 'square'];

  fire({
    particleCount: big ? 130 : 90,
    spread: 78,
    startVelocity: 42,
    gravity: 0.92,
    scalar: 0.95,
    ticks: 260,
    origin: { y: 0.64 },
    shapes,
  });

  window.setTimeout(() => {
    fire({
      particleCount: big ? 60 : 42,
      angle: 58,
      spread: 62,
      startVelocity: 46,
      gravity: 0.9,
      ticks: 240,
      origin: { x: 0, y: 0.66 },
      shapes,
    });
    fire({
      particleCount: big ? 60 : 42,
      angle: 122,
      spread: 62,
      startVelocity: 46,
      gravity: 0.9,
      ticks: 240,
      origin: { x: 1, y: 0.66 },
      shapes,
    });
  }, 220);

  window.setTimeout(() => {
    fire({
      particleCount: big ? 46 : 26,
      spread: 120,
      startVelocity: 12,
      gravity: 0.42,
      decay: 0.96,
      ticks: 420,
      scalar: 1.15,
      origin: { y: -0.05 },
      shapes: petals ? [petals] : ['circle'],
    });
  }, 520);

  return true;
}

/** One polite little pop, used when a gift is unwrapped. */
export function sparkle(origin = { x: 0.5, y: 0.6 }, count = 22) {
  if (prefersReducedMotion()) return false;
  if (siteConfig.effects?.confetti === false) return false;
  const petals = getPetals();
  fire({
    particleCount: count,
    spread: 64,
    startVelocity: 26,
    gravity: 0.72,
    ticks: 160,
    scalar: 0.7,
    origin,
    shapes: petals ? ['circle', petals] : ['circle'],
  });
  return true;
}

export default celebrate;
