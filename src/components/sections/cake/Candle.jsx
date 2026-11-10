import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion.js';
import './cake3d.css';

/**
 * One candle, standing on the top tier of a cake she can turn.
 *
 * The slot around it is placed in 3D (rotate to its angle, push out to the ring
 * radius). The `__face` inside the button then rotates by the *negative* of that
 * angle plus the cake's current turn, so the candle always presents the same
 * side to her — which is exactly right, because a candle is a cylinder and a
 * cylinder looks the same from every side. The flame is a billboard too, so it
 * never goes edge-on and disappears.
 *
 * Lit, it breathes; clicked, it goes out with a curl of smoke. Out, it can be
 * clicked again to relight — the cake is never a dead end.
 */
export function Candle({ index, total, lit, angle = 0, onExtinguish, onRelight }) {
  const reduced = usePrefersReducedMotion();
  const label = lit
    ? `Candle ${index + 1} of ${total} — lit. Activate to blow it out.`
    : `Candle ${index + 1} of ${total} — blown out. Activate to light it again.`;

  const act = () => (lit ? onExtinguish() : onRelight());

  return (
    <motion.button
      type="button"
      className={`candle ${lit ? 'is-lit' : 'is-out'}`.trim()}
      // the slot already carries --a for the 3D transform; setting it here too
      // keeps the flame's counter-rotation correct if a caller renders a candle
      // outside a slot
      style={{ '--i': index, '--a': `${angle.toFixed(2)}deg` }}
      onClick={act}
      aria-label={label}
      aria-pressed={!lit}
      whileHover={reduced ? undefined : { scale: 1.08 }}
      whileTap={reduced ? undefined : { scale: 0.9 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      data-candle={index}
    >
      <span className="candle__face">
        <span className="candle__halo" aria-hidden="true" />

        <motion.span
          className="candle__flame"
          aria-hidden="true"
          initial={false}
          animate={lit ? { scale: 1, opacity: 1 } : { scale: 0.1, opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.42, ease: [0.4, 0, 0.2, 1] }}
        >
          <span className="candle__flame-core" />
        </motion.span>

        <span className="candle__smoke" aria-hidden="true" />

        <span className="candle__stick" aria-hidden="true">
          <span className="candle__stripe" />
          <span className="candle__wick" />
        </span>
      </span>
    </motion.button>
  );
}

export default Candle;
