import { useMemo, useState } from 'react';
import siteConfig from '../../../config/site.config.js';
import { buildGallery } from '../../../utils/gallery.js';
import { SectionShell } from '../../ui/SectionShell.jsx';
import { Reveal } from '../../ui/Reveal.jsx';
import { PolaroidCard } from './PolaroidCard.jsx';
import { Lightbox } from './Lightbox.jsx';
import './gallery.css';

/**
 * SECTION 3 — the gallery of frames.
 *
 * Six drawings, six sentences, all written and drawn for her. They sit on a
 * dark wall like polaroids: taped, slightly crooked, straightening when she
 * touches one, opening into a viewer when she taps it.
 */
export function GallerySection() {
  const gallery = siteConfig.gallery;
  const { items } = useMemo(() => buildGallery(siteConfig), []);
  const [openIndex, setOpenIndex] = useState(-1);

  const isOpen = openIndex >= 0;
  const step = (delta) =>
    setOpenIndex((current) => (current + delta + items.length) % items.length);

  return (
    <SectionShell
      id="gallery"
      tone="night"
      eyebrow={gallery.eyebrow}
      title={gallery.title}
      subtitle={gallery.subtitle}
      className="gallery-section"
    >
      <ul className="polaroid-grid">
        {items.map((item, index) => (
          <PolaroidCard
            key={item.id}
            item={item}
            index={index}
            onOpen={() => setOpenIndex(index)}
          />
        ))}
      </ul>

      {items.length > 1 ? (
        <Reveal as="p" className="gallery__foot" y={12} blur={3}>
          {items.length} frames on the wall — tap any of them to step closer.
        </Reveal>
      ) : null}

      <Lightbox
        open={isOpen}
        items={items}
        index={isOpen ? openIndex : 0}
        onClose={() => setOpenIndex(-1)}
        onStep={step}
      />
    </SectionShell>
  );
}

export default GallerySection;
