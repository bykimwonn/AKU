import { motion } from 'framer-motion';
import siteConfig from '../../config/site.config.js';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js';
import { interpolate } from '../../utils/text.js';
import './signature.css';

/** The drawn underline under the name — one continuous stroke, inked on view. */
function Flourish({ reduced }) {
  return (
    <motion.svg
      className="signature__flourish"
      viewBox="0 0 220 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
      initial={reduced ? false : { pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true, margin: '-8%' }}
      transition={{ duration: 1.35, ease: [0.16, 1, 0.3, 1], delay: reduced ? 0 : 0.15 }}
    >
      <path
        d="M6 11 C46 3 74 15 110 8 C146 1 174 13 214 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

/**
 * The signature block: her words, my name, and the line that was always the
 * point. Used at the end of both letters and once, large, at the very end.
 *
 * Text comes from `signature` (and `sender.name`) in the config; if the
 * signature is left empty the letters fall back to the plain sender name, and
 * with no sender at all nothing renders — a signature should never appear
 * half-written.
 *
 * @param {{ size?: 'sm' | 'lg', tone?: 'night' | 'paper', align?: 'center' | 'start', className?: string }} props
 */
export function Signature({
  size = 'sm',
  tone = 'night',
  align = 'center',
  className = '',
  ...rest
}) {
  const config = siteConfig.signature || {};
  const sender = siteConfig.sender?.name?.trim() || '';
  const name = (config.name || sender).trim();
  const reduced = usePrefersReducedMotion();

  if (!name) return null;

  const eyebrow = (config.eyebrow || '').trim();
  const line = (config.line || '').trim();
  const whisper = (config.whisper || '').trim();
  const showLine = line && line.toLowerCase() !== name.toLowerCase();

  return (
    <div
      className={`signature signature--${size} signature--${tone} signature--${align} ${className}`.trim()}
      {...rest}
    >
      {eyebrow ? <p className="signature__eyebrow">{interpolate(eyebrow)}</p> : null}

      <p className="signature__name u-hand">{name}</p>
      <Flourish reduced={reduced} />

      {showLine ? (
        <p className="signature__line">
          <span className="signature__rule" aria-hidden="true" />
          {interpolate(line)}
          <span className="signature__rule" aria-hidden="true" />
        </p>
      ) : null}

      {whisper ? <p className="signature__whisper">{interpolate(whisper)}</p> : null}
    </div>
  );
}

export default Signature;
