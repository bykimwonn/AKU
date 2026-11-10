import { useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js';
import { X } from 'lucide-react';
import { EASE } from './Reveal.jsx';
import { useScrollLock } from '../../hooks/useScrollLock.js';
import './overlay.css';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The one modal in the site. Used by the letter, the three gifts and the photo
 * viewer. Rules it enforces for the visitor:
 *   • Esc closes it, the backdrop closes it, and there is always a visible
 *     close button — nobody gets stuck inside an animation.
 *   • Focus moves in, is trapped while open, and returns to the trigger.
 *   • The page behind stops scrolling but keeps its position.
 *   • Reduced motion → it appears, it does not fly.
 */
export function Overlay({
  open,
  onClose,
  title,
  eyebrow,
  size = 'content',
  tone = 'paper',
  className = '',
  children,
  footer,
  closeLabel = 'Close',
}) {
  const panelRef = useRef(null);
  const restoreRef = useRef(null);
  const reduced = usePrefersReducedMotion();
  const titleId = useId();

  useScrollLock(open);

  useEffect(() => {
    if (!open) return undefined;
    restoreRef.current = document.activeElement;
    const panel = panelRef.current;
    const focusTarget = panel?.querySelector('[data-autofocus]') || panel?.querySelector(FOCUSABLE) || panel;
    const raf = window.requestAnimationFrame(() => focusTarget?.focus?.());

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose?.();
        return;
      }
      if (event.key !== 'Tab' || !panel) return;
      const focusables = [...panel.querySelectorAll(FOCUSABLE)].filter(
        (node) => node.offsetWidth || node.offsetHeight || node === document.activeElement,
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      window.cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKeyDown, true);
      const trigger = restoreRef.current;
      if (trigger && typeof trigger.focus === 'function') trigger.focus();
    };
  }, [open, onClose]);

  const onBackdrop = useCallback(
    (event) => {
      if (event.target === event.currentTarget) onClose?.();
    },
    [onClose],
  );

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className={`overlay overlay--${tone} overlay--${size} ${className}`.trim()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.01 : 0.34, ease: 'easeOut' }}
          onClick={onBackdrop}
          role="presentation"
        >
          <motion.div
            ref={panelRef}
            className="overlay__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 34, scale: 0.975 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 22, scale: 0.985 }}
            transition={{ duration: reduced ? 0.01 : 0.62, ease: EASE }}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="overlay__head">
              <div className="overlay__titles">
                {eyebrow ? <p className="u-eyebrow overlay__eyebrow">{eyebrow}</p> : null}
                {title ? (
                  <h3 id={titleId} className="overlay__title">
                    {title}
                  </h3>
                ) : null}
              </div>
              <button type="button" className="overlay__close" onClick={onClose} aria-label={closeLabel}>
                <X size={18} strokeWidth={1.6} aria-hidden="true" />
              </button>
            </header>

            <div className="overlay__body">{children}</div>

            {footer ? <footer className="overlay__foot">{footer}</footer> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

export default Overlay;
