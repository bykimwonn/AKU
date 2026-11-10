import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion.js';
import { EASE, Reveal } from '../../ui/Reveal.jsx';
import './gifts.css';

/**
 * A wrapped box, not a button pretending to be one: the lid and bow really
 * leave, light spills out of the gap, and each box drifts on its own beat.
 */
export function GiftBox({ gift, index, opening, unwrapped, onOpen }) {
  const reduced = usePrefersReducedMotion();
  const lidOff = opening || unwrapped;

  return (
    <Reveal as="li" className="gift-item" y={40} blur={7} delay={index * 0.08}>
      <div className="gift-float" style={{ '--i': index }}>
        <motion.button
          type="button"
          className={`gift gift--${gift.accent || 'blush'} ${lidOff ? 'is-open' : ''}`.trim()}
          onClick={onOpen}
          aria-label={`${gift.kicker || ''} — ${gift.label}`}
          whileHover={reduced ? undefined : { y: -8 }}
          whileTap={reduced ? undefined : { scale: 0.98 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <span className="gift__halo" aria-hidden="true" />

          <span className="gift__prop" aria-hidden="true">
          <span className="gift__box">
            <i className="gift__ribbon gift__ribbon--v" />
            <i className="gift__ribbon gift__ribbon--h" />
            <span className="gift__spill" />
          </span>

          <motion.span
            className="gift__lid"
            aria-hidden="true"
            initial={false}
            animate={
              lidOff
                ? { y: '-192%', x: '-7%', rotate: -17, opacity: 0 }
                : { y: '0%', x: '0%', rotate: 0, opacity: 1 }
            }
            transition={{ duration: reduced ? 0 : 0.75, ease: EASE }}
          >
            <i className="gift__ribbon gift__ribbon--v" />
            <span className="gift__bow">
              <i />
              <i />
              <b />
            </span>
          </motion.span>
          </span>

          <span className="gift__face">
            <span className="gift__kicker">{gift.kicker}</span>
            <span className="gift__label">{gift.label}</span>
            <span className="gift__action">
              {unwrapped ? 'Unwrap again' : 'Unwrap'}
              <span className="gift__action-dot" aria-hidden="true" />
            </span>
          </span>
        </motion.button>
      </div>
    </Reveal>
  );
}

export default GiftBox;
