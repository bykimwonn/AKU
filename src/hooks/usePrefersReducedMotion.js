import { useReducedMotion } from 'framer-motion';
import { prefersReducedMotion } from '../utils/text.js';

/**
 * ONE answer to "should I skip this animation?", for the whole site.
 *
 * Reading it from a single place matters because the question has real
 * consequences: the opening of the envelope, the lid of a gift and the gust on
 * the candles all sit behind a short timer, and every one of them hands control
 * back immediately when motion is reduced. It also covers the CSS-only effects
 * (petals, stars, confetti), which framer cannot see.
 */
export function usePrefersReducedMotion() {
  const framerFlag = useReducedMotion();
  return Boolean(framerFlag) || prefersReducedMotion();
}

export default usePrefersReducedMotion;
