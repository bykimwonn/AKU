import { useEffect } from 'react';
import { prefersReducedMotion } from '../utils/text.js';
import { scrollHandoff } from '../utils/scrollHandoff.js';

/**
 * Freezes the page behind an overlay without the layout jumping (the scrollbar
 * width is compensated for) and puts the visitor back where they were.
 *
 * One exception, and it is the whole reason this hook is not a two-liner: if
 * the app asked to travel somewhere before unlocking (the letter's "Keep
 * going"), that request wins over the "put her back" restore.
 */
export function useScrollLock(locked) {
  useEffect(() => {
    if (!locked) return undefined;

    const body = document.body;
    const gutter = window.innerWidth - document.documentElement.clientWidth;
    const previousY = window.scrollY;

    if (gutter > 0) body.style.setProperty('--lock-gutter', `${gutter}px`);
    body.classList.add('is-locked');
    scrollHandoff.addLock();

    return () => {
      scrollHandoff.releaseLock();
      body.classList.remove('is-locked');
      body.style.removeProperty('--lock-gutter');

      const goToId = scrollHandoff.take();
      if (goToId) {
        // The page can move again: measure and glide to the chapter.
        const node = document.getElementById(goToId);
        if (node) {
          node.scrollIntoView({
            behavior: prefersReducedMotion() ? 'auto' : 'smooth',
            block: 'start',
          });
        }
        return;
      }

      // Otherwise undo whatever the lock did to the scroll position.
      if (window.scrollY !== previousY) {
        window.scrollTo({ top: previousY, behavior: 'auto' });
      }
    };
  }, [locked]);
}

export default useScrollLock;
