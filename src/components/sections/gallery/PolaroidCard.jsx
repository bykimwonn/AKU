import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion.js';
import { EASE } from '../../ui/Reveal.jsx';
import { MemoryArt } from './MemoryArt.jsx';
import './gallery.css';

/** Deterministic, gentle scatter so the grid feels pinned to a wall, not tabled. */
const TILTS = [-2.1, 1.5, -1.2, 2.3, -1.7, 1.1];

/**
 * One frame in the gallery: a drawing, a handwritten line, and a tap that
 * opens it properly. It is a real button, so it works with a keyboard, a thumb,
 * or a screen reader. The drawing itself is decorative — the title carries the
 * meaning, and the full sentence is read out inside the viewer.
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
        aria-label={`Open frame: ${item.title}. ${item.line}`}
        whileHover={reduced ? undefined : { y: -10, rotate: 0, scale: 1.02 }}
        whileFocus={reduced ? undefined : { y: -10, rotate: 0 }}
        whileTap={reduced ? undefined : { scale: 0.985 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <span className="polaroid__frame">
          <MemoryArt art={item.art} tone={item.tone} className="polaroid__art" />
          <span className="polaroid__gloss" aria-hidden="true" />
        </span>

        <span className="polaroid__meta">
          <span className="polaroid__caption">{item.title}</span>
          <span className="polaroid__index" aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
        </span>
      </motion.button>
    </motion.li>
  );
}

export default PolaroidCard;
