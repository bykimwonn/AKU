import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion.js';
import { RotateCcw } from 'lucide-react';
import siteConfig from '../../../config/site.config.js';
import { interpolate } from '../../../utils/text.js';
import { describeBirthday } from '../../../utils/date.js';
import { EASE, Reveal } from '../../ui/Reveal.jsx';
import { Signature } from '../../ui/Signature.jsx';
import './goodbye.css';

/**
 * SECTION 7 — the last screen.
 *
 * A constellation that draws itself, two lines, and a way back to the
 * beginning. Nothing else.
 */
export function GoodbyeSection({ onReplay }) {
  const reduced = usePrefersReducedMotion();
  const goodbye = siteConfig.goodbye;
  const birthday = describeBirthday(siteConfig.birthdayDate);

  return (
    <section
      id="goodbye"
      className="goodbye section section--night section--stage"
      aria-labelledby="goodbye-title"
    >
      <div className="goodbye__inner">
        <motion.svg
          className="goodbye__constellation"
          viewBox="0 0 260 120"
          role="img"
          aria-label="A small constellation joined into a heart"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: EASE }}
        >
          <path
            className="goodbye__lines"
            d="M130 104C104 86 78 70 66 54 55 39 60 20 78 16c13-3 24 4 30 13h0c6-9 17-16 30-13 18 4 23 23 12 38-12 16-38 32-64 50z"
            fill="none"
            stroke="rgba(216,183,122,0.55)"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {[
            [130, 104],
            [66, 54],
            [78, 16],
            [108, 29],
            [130, 29],
            [152, 29],
            [182, 16],
            [194, 54],
          ].map(([cx, cy], index) => (
            <motion.circle
              key={`${cx}-${cy}`}
              cx={cx}
              cy={cy}
              r="2.4"
              fill="#ebc6d3"
              initial={reduced ? false : { opacity: 0, scale: 0.2 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: EASE, delay: reduced ? 0 : 0.5 + index * 0.11 }}
            />
          ))}
        </motion.svg>

        <h2 id="goodbye-title" className="sr-only">
          Goodbye
        </h2>

        <Reveal as="p" className="goodbye__line1" y={26} blur={8} delay={0.1}>
          {interpolate(goodbye.line1)}
        </Reveal>

        <Reveal as="p" className="goodbye__line2 u-hand" y={20} blur={6} delay={0.28}>
          {interpolate(goodbye.line2)}
        </Reveal>

        <Reveal className="goodbye__sign" y={26} blur={9} delay={0.34}>
          <Signature size="lg" />
        </Reveal>

        <Reveal className="goodbye__actions" y={18} delay={0.5}>
          <button type="button" className="btn-solid" onClick={onReplay}>
            <RotateCcw size={15} strokeWidth={1.9} aria-hidden="true" />
            {interpolate(goodbye.replayLabel)}
          </button>

          {birthday.kind === 'today' ? (
            <p className="goodbye__count">
              <span className="goodbye__count-dot" aria-hidden="true" />
              It is the day — no countdown needed.
            </p>
          ) : (
            <p className="goodbye__count">{birthday.label}</p>
          )}

          {goodbye.footnote ? (
            <p className="goodbye__footnote">{interpolate(goodbye.footnote)}</p>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}

export default GoodbyeSection;
