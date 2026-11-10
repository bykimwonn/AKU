import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion.js';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Overlay } from '../../ui/Overlay.jsx';
import { EASE } from '../../ui/Reveal.jsx';
import { MemoryArt } from './MemoryArt.jsx';
import './gallery.css';

/**
 * The expanded frame: the drawing large, the sentence under it, previous / next
 * buttons, a counter, arrow keys and a swipe on touch screens. One frame only?
 * The arrows politely disappear.
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
      eyebrow={`Frame ${index + 1} of ${items.length}`}
      title={item.title}
      closeLabel="Close the frame"
    >
      <div className="lightbox" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="lightbox__stage">
          {many ? (
            <button
              type="button"
              className="lightbox__btn lightbox__side lightbox__side--prev"
              onClick={() => step(-1)}
              aria-label="Previous frame"
            >
              <ChevronLeft size={20} strokeWidth={1.6} aria-hidden="true" />
            </button>
          ) : null}

          <AnimatePresence initial={false} mode="wait">
            <motion.figure
              key={item.id}
              className="lightbox__art"
              initial={reduced ? false : { opacity: 0, x: direction >= 0 ? 44 : -44 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? undefined : { opacity: 0, x: direction >= 0 ? -44 : 44 }}
              transition={{ duration: reduced ? 0 : 0.5, ease: EASE }}
            >
              <MemoryArt art={item.art} tone={item.tone} />
            </motion.figure>
          </AnimatePresence>

          {many ? (
            <button
              type="button"
              className="lightbox__btn lightbox__side lightbox__side--next"
              onClick={() => step(1)}
              aria-label="Next frame"
            >
              <ChevronRight size={20} strokeWidth={1.6} aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <figcaption className="lightbox__caption">
          {item.line ? <p className="lightbox__line">{item.line}</p> : null}
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
              aria-label="Previous frame"
            >
              <ChevronLeft size={20} strokeWidth={1.6} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="lightbox__btn"
              onClick={() => step(1)}
              aria-label="Next frame"
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
