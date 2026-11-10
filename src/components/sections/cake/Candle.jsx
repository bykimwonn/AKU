import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion.js';
import './cake.css';

/**
 * One candle. Lit, it breathes; clicked, it goes out with a curl of smoke.
 * Out, it can be clicked again to relight — so the cake is never a dead end.
 */
export function Candle({ index, total, lit, onExtinguish, onRelight }) {
  const reduced = usePrefersReducedMotion();
  const label = lit
    ? `Candle ${index + 1} of ${total} — lit. Activate to blow it out.`
    : `Candle ${index + 1} of ${total} — blown out. Activate to light it again.`;

  const act = () => (lit ? onExtinguish() : onRelight());

  return (
    <motion.button
      type="button"
      className={`candle ${lit ? 'is-lit' : 'is-out'}`.trim()}
      style={{ '--i': index }}
      onClick={act}
      aria-label={label}
      aria-pressed={!lit}
      whileHover={reduced ? undefined : { scale: 1.06 }}
      whileTap={reduced ? undefined : { scale: 0.94 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      data-candle={index}
    >
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
        <span className="candle__wick" />
      </span>
    </motion.button>
  );
}

export default Candle;
