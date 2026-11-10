import { useCallback, useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion.js';
import { ArrowLeft } from 'lucide-react';
import siteConfig from '../../../config/site.config.js';
import { interpolate } from '../../../utils/text.js';
import { SectionShell } from '../../ui/SectionShell.jsx';
import { Reveal } from '../../ui/Reveal.jsx';
import { Overlay } from '../../ui/Overlay.jsx';
import { GiftBox } from './GiftBox.jsx';
import { GiftReveal } from './GiftReveal.jsx';

import './gifts.css';

/**
 * SECTION 5 — three wrapped gifts.
 *
 * Each box has its own opening animation (the lid leaves, light spills out) and
 * each message is revealed with its own effect. Every gift can be closed and
 * unwrapped again as many times as she likes.
 */
export function GiftsSection() {
  const gifts = siteConfig.gifts;
  const reduced = usePrefersReducedMotion();
  const items = Array.isArray(gifts.items) ? gifts.items : [];

  const [opening, setOpening] = useState(null); // id being animated
  const [active, setActive] = useState(null); // id on screen
  const [unwrapped, setUnwrapped] = useState(() => new Set());
  const timerRef = useRef(0);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const open = useCallback(
    (id) => {
      setUnwrapped((current) => {
        if (current.has(id)) return current;
        const next = new Set(current);
        next.add(id);
        return next;
      });
      if (reduced) {
        setActive(id);
        return;
      }
      setOpening(id);
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        setOpening(null);
        setActive(id);
      }, 780);
    },
    [reduced],
  );

  const close = useCallback(() => {
    setActive(null);
    setOpening(null);
  }, []);

  const activeGift = items.find((gift) => gift.id === active);
  const allOpen = items.length > 0 && unwrapped.size === items.length;

  return (
    <SectionShell
      id="gifts"
      tone="night"
      eyebrow={gifts.eyebrow}
      title={gifts.title}
      subtitle={gifts.subtitle}
      className="gifts-section"
    >
      <ul className="gift-grid">
        {items.map((gift, index) => (
          <GiftBox
            key={gift.id}
            gift={gift}
            index={index}
            opening={opening === gift.id}
            unwrapped={unwrapped.has(gift.id)}
            onOpen={() => open(gift.id)}
          />
        ))}
      </ul>

      <Reveal as="p" className="gifts__status" y={10} blur={3}>
        {allOpen
          ? 'All three unwrapped. They stay yours.'
          : `${unwrapped.size} of ${items.length} unwrapped`}
      </Reveal>

      <Overlay
        open={Boolean(activeGift)}
        onClose={close}
        tone="paper"
        size="content"
        eyebrow={activeGift ? interpolate(activeGift.kicker || '') : ''}
        title={activeGift ? interpolate(activeGift.title) : ''}
        closeLabel="Close this gift"
        footer={
          <button type="button" className="btn-ghost" onClick={close} data-autofocus>
            <ArrowLeft size={15} strokeWidth={1.8} aria-hidden="true" />
            Wrap it back up
          </button>
        }
      >
        {activeGift ? (
          <GiftReveal gift={activeGift} index={items.findIndex((gift) => gift.id === active)} />
        ) : null}
      </Overlay>
    </SectionShell>
  );
}

export default GiftsSection;
