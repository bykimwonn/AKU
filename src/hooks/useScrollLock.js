import { useEffect } from 'react';

/**
 * Freezes the page behind an overlay without the layout jumping (the scrollbar
 * width is compensated for) and puts the visitor back where they were.
 */
export function useScrollLock(locked) {
  useEffect(() => {
    if (!locked) return undefined;
    const body = document.body;
    const gutter = window.innerWidth - document.documentElement.clientWidth;
    const previousY = window.scrollY;

    if (gutter > 0) body.style.setProperty('--lock-gutter', `${gutter}px`);
    body.classList.add('is-locked');

    return () => {
      body.classList.remove('is-locked');
      body.style.removeProperty('--lock-gutter');
      window.scrollTo({ top: previousY, behavior: 'auto' });
    };
  }, [locked]);
}

export default useScrollLock;
