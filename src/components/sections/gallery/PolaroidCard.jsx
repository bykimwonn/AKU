import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion.js';
import { EASE } from '../../ui/Reveal.jsx';
import './gallery.css';

/** Deterministic, gentle scatter so the grid feels pinned to a wall, not tabled. */
const TILTS = [-2.1, 1.5, -1.2, 2.3, -1.7, 1.1, -2.4, 1.9];

export function EmptyFrame({ tone = 'rose' }) {
  return (
    <span className={`empty-frame empty-frame--${tone}`} aria-hidden="true">
      <span className="empty-frame__glow" />
      <svg viewBox="0 0 120 150" className="empty-frame__art" focusable="false">
        <path
          d="M12 118 L44 74 L66 100 L82 84 L108 118"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.55"
        />
        <circle cx="84" cy="36" r="13" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.42" />
        <path d="M12 132 h96" stroke="currentColor" strokeWidth="1" opacity="0.22" />
      </svg>
      <span className="empty-frame__label">empty frame</span>
    </span>
  );
}

/**
 * One polaroid in the gallery. It is a real button, so it works with a
 * keyboard, a thumb, or a screen reader — and the photograph itself stays
 * decorative because the caption carries the meaning.
 */
export function PolaroidCard({ item, index, onOpen }) {
  const reduced = usePrefersReducedMotion();
  const tilt = reduced ? 0 : TILTS[index % TILTS.length];

  return (
    <motion.li
      className="polaroid-item"
      initial={reduced ? false : { opacity: 0, y: 42, rotate: tilt * 1.8 }}
      whileInView={{ opacity: 1, y: 0, rotate: tilt }}
      viewport={{ once: true, margin: '0px 0px -6% 0px' }}
      transition={{ duration: 0.95, ease: EASE, delay: (index % 4) * 0.07 }}
    >
      <motion.button
        type="button"
        className="polaroid"
        onClick={onOpen}
        aria-label={
          item.placeholder
            ? `Empty frame — ${item.caption}`
            : `Open photograph: ${item.caption}${item.date ? `, ${item.date}` : ''}`
        }
        whileHover={reduced ? undefined : { y: -10, rotate: 0, scale: 1.02 }}
        whileFocus={reduced ? undefined : { y: -10, rotate: 0 }}
        whileTap={reduced ? undefined : { scale: 0.985 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <span className="polaroid__frame">
          {item.placeholder ? (
            <EmptyFrame tone={item.tone} />
          ) : (
            <img
              className="polaroid__photo"
              src={item.src}
              alt=""
              loading={index < 3 ? 'eager' : 'lazy'}
              decoding="async"
              draggable="false"
            />
          )}
          <span className="polaroid__gloss" aria-hidden="true" />
        </span>

        <span className="polaroid__meta">
          <span className="polaroid__caption">{item.caption}</span>
          {item.date ? <span className="polaroid__date">{item.date}</span> : null}
        </span>
      </motion.button>
    </motion.li>
  );
}

export default PolaroidCard;
