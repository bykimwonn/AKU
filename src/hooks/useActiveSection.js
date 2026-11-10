import { useCallback, useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../utils/text.js';
import { scrollHandoff } from '../utils/scrollHandoff.js';

/**
 * Watches the sections so the navigation always knows where the visitor is,
 * and provides a smooth "jump to section" that works on phones too.
 */
export function useActiveSection(ids = []) {
  const [active, setActive] = useState(ids[0] ?? '');
  const ratiosRef = useRef(new Map());

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratiosRef.current.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        let best = '';
        let bestRatio = 0;
        for (const [id, ratio] of ratiosRef.current) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = id;
          }
        }
        if (best) setActive(best);
      },
      { rootMargin: '-20% 0px -45% 0px', threshold: [0, 0.15, 0.35, 0.6, 0.9] },
    );

    const seen = new Set();
    const attach = () => {
      for (const id of ids) {
        if (seen.has(id)) continue;
        const node = document.getElementById(id);
        if (!node) continue;
        seen.add(id);
        observer.observe(node);
      }
    };

    attach();
    // Sections mount after the first paint in some cases; try once more.
    const later = window.setTimeout(attach, 250);

    return () => {
      window.clearTimeout(later);
      observer.disconnect();
      ratiosRef.current.clear();
    };
  }, [ids]);

  const goTo = useCallback((id) => {
    const node = document.getElementById(id);
    if (!node) return;

    // Asked from inside an overlay? Hand it to the lock instead: scrolling now
    // would be undone the moment the overlay lets go of the page.
    if (scrollHandoff.isLocked()) {
      scrollHandoff.request(id);
      return;
    }

    node.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    });
  }, []);

  return { active, goTo };
}

export default useActiveSection;
