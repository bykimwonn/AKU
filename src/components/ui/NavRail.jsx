import { motion } from 'framer-motion';
import { SECTIONS } from '../../config/sections.js';
import './chrome.css';

/**
 * Desktop-only rail of chapter dots. Hidden below 900px, where the Chapters
 * button in the header does the same job with bigger touch targets.
 */
export function NavRail({ active, onJump, visible = true }) {
  if (!visible) return null;

  return (
    <motion.nav
      className="navrail"
      aria-label="Chapters"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {SECTIONS.map((section) => (
        <button
          key={section.id}
          type="button"
          className={`navrail__item ${active === section.id ? 'is-active' : ''}`.trim()}
          onClick={() => onJump(section.id)}
          aria-current={active === section.id ? 'true' : undefined}
          aria-label={`Go to ${section.label}`}
        >
          <span className="navrail__label">{section.label}</span>
          <span className="navrail__dot" aria-hidden="true" />
        </button>
      ))}
    </motion.nav>
  );
}

export default NavRail;
