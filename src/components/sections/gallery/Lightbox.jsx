import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion.js';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Overlay } from '../../ui/Overlay.jsx';
import { EASE } from '../../ui/Reveal.jsx';
import { EmptyFrame } from './PolaroidCard.jsx';
import './gallery.css';

/**
 * The expanded photograph: previous / next, a caption, a counter, arrow keys,
 * and a swipe on touch screens. One item? The arrows politely disappear.
 */
export function Lightbox({ open, items = [], index = 0, onClose, onStep }) {
  const reduced = usePrefersReducedMotion();
  const [direction, setDirection] = useState(0);
  const touchStart = useRef(null);

  const item = items[index];
  const many = items.length > 1;

  const step = (delta) => {
    setDirection(delta);
    onStep?.(delta);
  };

  useEffect(() => {
    if (!open || !many) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        step(1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        step(-1);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, many, items.length]);

  const onTouchStart = (event) => {
    touchStart.current = event.changedTouches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event) => {
    if (touchStart.current === null || !many) return;
    const delta = (event.changedTouches[0]?.clientX ?? 0) - touchStart.current;
    touchStart.current = null;
    if (Math.abs(delta) > 46) step(delta < 0 ? 1 : -1);
  };

  if (!item) return null;

  return (
    <Overlay
      open={open}
      onClose={onClose}
      tone="night"
      size="photo"
      eyebrow={item.placeholder ? 'Empty frame' : `Memory ${index + 1} of ${items.length}`}
      title={item.caption}
      closeLabel="Close the photograph"
    >
      <div className="lightbox" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="lightbox__stage">
          {many ? (
            <button
              type="button"
              className="lightbox__btn lightbox__side lightbox__side--prev"
              onClick={() => step(-1)}
              aria-label="Previous photograph"
            >
              <ChevronLeft size={20} strokeWidth={1.6} aria-hidden="true" />
            </button>
          ) : null}

          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={item.id}
              className="lightbox__media"
              initial={reduced ? false : { opacity: 0, x: direction >= 0 ? 44 : -44 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? undefined : { opacity: 0, x: direction >= 0 ? -44 : 44 }}
              transition={{ duration: reduced ? 0 : 0.5, ease: EASE }}
            >
              {item.placeholder ? (
                <div className="lightbox__empty">
                  <EmptyFrame tone={item.tone} />
                </div>
              ) : (
                <img
                  className="lightbox__img"
                  src={item.src}
                  alt={item.alt || item.caption}
                  draggable="false"
                />
              )}
            </motion.div>
          </AnimatePresence>

          {many ? (
            <button
              type="button"
              className="lightbox__btn lightbox__side lightbox__side--next"
              onClick={() => step(1)}
              aria-label="Next photograph"
            >
              <ChevronRight size={20} strokeWidth={1.6} aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <figcaption className="lightbox__caption">
          <span className="lightbox__caption-text">{item.caption}</span>
          {item.date ? <span className="lightbox__caption-date">{item.date}</span> : null}
          {items.length > 1 ? (
            <span className="lightbox__counter">
              {index + 1} / {items.length}
            </span>
          ) : null}
        </figcaption>

        {many ? (
          <div className="lightbox__nav">
            <button
              type="button"
              className="lightbox__btn"
              onClick={() => step(-1)}
              aria-label="Previous photograph"
            >
              <ChevronLeft size={20} strokeWidth={1.6} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="lightbox__btn"
              onClick={() => step(1)}
              aria-label="Next photograph"
            >
              <ChevronRight size={20} strokeWidth={1.6} aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>
    </Overlay>
  );
}

export default Lightbox;
