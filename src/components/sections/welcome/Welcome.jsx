import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion.js';
import siteConfig from '../../../config/site.config.js';
import { interpolate } from '../../../utils/text.js';
import { EASE } from '../../ui/Reveal.jsx';
import './welcome.css';

/**
 * SECTION 1 — the prologue.
 *
 * Nothing scrolls here. The whole screen is one held breath: a name, a promise,
 * and a single button. The stars are painted on a canvas behind it; the letters
 * of her name arrive one at a time.
 */
export function Welcome({ onOpen, musicHint = true }) {
  const reduced = usePrefersReducedMotion();
  const { welcome, recipient, brand } = siteConfig;
  const name = interpolate(welcome.name || recipient.name);
  const letters = name.split('');

  const open = () => onOpen?.();

  return (
    <motion.div
      className="welcome"
      initial={{ opacity: 1 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.035, filter: 'blur(10px)' }}
      transition={{ duration: reduced ? 0.15 : 1.05, ease: EASE }}
    >
      <div className="welcome__glow" aria-hidden="true" />

      <svg className="welcome__orbit" viewBox="0 0 600 600" aria-hidden="true" focusable="false">
        <g className="welcome__orbit-spin">
          <circle cx="300" cy="300" r="236" fill="none" stroke="rgba(216,183,122,0.22)" strokeWidth="1" strokeDasharray="2 13" />
          <circle cx="300" cy="300" r="186" fill="none" stroke="rgba(235,198,211,0.14)" strokeWidth="1" />
          <circle cx="300" cy="64" r="3.4" fill="#D8B77A" />
          <circle cx="118" cy="404" r="2.2" fill="#EBC6D3" />
        </g>
      </svg>

      <div className="welcome__inner">
        <motion.p
          className="u-eyebrow welcome__kicker"
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.15 }}
        >
          {interpolate(welcome.kicker)}
        </motion.p>

        <h1 className="welcome__name" aria-label={name} style={{ '--letters': letters.length }}>
          {letters.map((letter, index) => (
            <motion.span
              key={`${letter}-${index}`}
              className="welcome__letter"
              aria-hidden="true"
              initial={reduced ? false : { opacity: 0, y: '0.42em', filter: 'blur(14px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{
                duration: reduced ? 0 : 1.25,
                ease: EASE,
                delay: reduced ? 0 : 0.35 + index * 0.075,
              }}
            >
              {letter}
            </motion.span>
          ))}
        </h1>

        <motion.p
          className="welcome__tagline u-hand"
          initial={reduced ? false : { opacity: 0, y: 16, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1.2, ease: EASE, delay: reduced ? 0 : 1.15 }}
        >
          {interpolate(welcome.tagline)}
        </motion.p>

        <motion.div
          className="welcome__cta-wrap"
          initial={reduced ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: reduced ? 0 : 1.5 }}
        >
          <button type="button" className="welcome__cta" onClick={open} data-autofocus>
            <span className="welcome__cta-shine" aria-hidden="true" />
            <span className="welcome__cta-label">{interpolate(welcome.cta)}</span>
          </button>

          {musicHint && welcome.hint ? (
            <p className="welcome__hint">{interpolate(welcome.hint)}</p>
          ) : null}
        </motion.div>
      </div>

      <motion.div
        className="welcome__foot"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: reduced ? 0 : 2.1 }}
      >
        <span className="welcome__foot-line" aria-hidden="true" />
        <span className="welcome__foot-text">{interpolate(brand.edition)}</span>
        <span className="welcome__foot-line" aria-hidden="true" />
      </motion.div>
    </motion.div>
  );
}

export default Welcome;
