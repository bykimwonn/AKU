import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js';
import { BookOpen, X } from 'lucide-react';
import { SECTIONS } from '../../config/sections.js';
import { EASE } from './Reveal.jsx';
import { MusicPlayer } from './MusicPlayer.jsx';
import './chrome.css';

/**
 * The fixed header: the wordmark, a "chapters" list (this is how she jumps
 * around on a phone), and the music player. It fades away while the opening
 * screen is still on screen, because the opening screen is the prologue.
 */
export function TopBar({ visible, wordmark, active, onJump, music }) {
  const [openChapters, setOpenChapters] = useState(false);
  const wrapRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!openChapters) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setOpenChapters(false);
    };
    const onClick = (event) => {
      if (!wrapRef.current?.contains(event.target)) setOpenChapters(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onClick);
    };
  }, [openChapters]);

  const jump = (id) => {
    setOpenChapters(false);
    onJump(id);
  };

  return (
    <AnimatePresence>
      {visible ? (
        <motion.header
          className="topbar"
          initial={reduced ? false : { y: -28, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduced ? undefined : { y: -20, opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.7, ease: EASE, delay: reduced ? 0 : 0.15 }}
          ref={wrapRef}
        >
          <div className="topbar__inner">
            <button type="button" className="topbar__brand" onClick={() => jump(SECTIONS[0].id)}>
              <span className="topbar__mark" aria-hidden="true">
                <i />
              </span>
              <span className="topbar__wordmark">{wordmark}</span>
            </button>

            <nav className="topbar__actions" aria-label="Chapters and sound">
              <div className="topbar__chapters">
                <button
                  type="button"
                  className="topbar__chapters-btn"
                  onClick={() => setOpenChapters((value) => !value)}
                  aria-expanded={openChapters}
                  aria-controls="chapter-list"
                >
                  {openChapters ? (
                    <X size={16} strokeWidth={1.8} aria-hidden="true" />
                  ) : (
                    <BookOpen size={16} strokeWidth={1.8} aria-hidden="true" />
                  )}
                  <span>Chapters</span>
                </button>

                <AnimatePresence initial={false}>
                  {openChapters ? (
                    <motion.ul
                      id="chapter-list"
                      className="chapter-list"
                      key="chapters"
                      role="menu"
                      initial={reduced ? false : { opacity: 0, y: -10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={reduced ? undefined : { opacity: 0, y: -8, scale: 0.99 }}
                      transition={{ duration: reduced ? 0 : 0.3, ease: EASE }}
                    >
                      {SECTIONS.map((section, index) => (
                        <li key={section.id} role="none">
                          <button
                            type="button"
                            role="menuitem"
                            className={`chapter-list__item ${active === section.id ? 'is-active' : ''}`}
                            onClick={() => jump(section.id)}
                            aria-current={active === section.id ? 'true' : undefined}
                          >
                            <span className="chapter-list__no">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <span className="chapter-list__label">{section.label}</span>
                            <span className="chapter-list__hint">{section.hint}</span>
                          </button>
                        </li>
                      ))}
                    </motion.ul>
                  ) : null}
                </AnimatePresence>
              </div>

              <MusicPlayer music={music} compact />
            </nav>
          </div>
        </motion.header>
      ) : null}
    </AnimatePresence>
  );
}

export default TopBar;
