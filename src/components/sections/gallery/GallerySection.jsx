import { useMemo, useState } from 'react';
import siteConfig from '../../../config/site.config.js';
import { buildGallery } from '../../../utils/photos.js';
import { SectionShell } from '../../ui/SectionShell.jsx';
import { Reveal } from '../../ui/Reveal.jsx';
import { PolaroidCard } from './PolaroidCard.jsx';
import { Lightbox } from './Lightbox.jsx';
import './gallery.css';

const IS_DEV = import.meta.env.DEV;

/**
 * SECTION 3 — the memory gallery.
 *
 * Photographs are discovered automatically from src/assets/photos/ (see
 * utils/photos.js). Until someone drops files in there, the grid shows honest
 * empty frames instead of somebody else's face.
 */
export function GallerySection() {
  const gallery = siteConfig.gallery;
  const { items, hasPhotos } = useMemo(() => buildGallery(siteConfig), []);
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

      {hasPhotos ? (
        <Reveal as="p" className="gallery__foot" y={12} blur={3}>
          {items.length} {items.length === 1 ? 'frame' : 'frames'} — tap any of them to see it
          properly.
        </Reveal>
      ) : null}

      {IS_DEV && !hasPhotos ? (
        <p className="gallery__ownernote" role="note">
          {gallery.ownerNote}
        </p>
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
