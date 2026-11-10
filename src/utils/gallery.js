import siteConfig from '../config/site.config.js';

const TONES = ['gold', 'rose', 'plum', 'cream'];

/**
 * Build the gallery from the config.
 *
 * The frames are original drawings (see components/sections/gallery/MemoryArt.jsx),
 * so the gallery is complete on its own — nothing has to be photographed, and
 * nobody else's face ever turns up posing as a memory. An omitted `tone` is
 * filled in so the grid alternates, and a frame without a `line` still shows its
 * title instead of a hole.
 */
export function buildGallery(config = siteConfig) {
  const cards = Array.isArray(config.gallery?.cards) ? config.gallery.cards : [];

  const items = cards
    .filter((card) => card && (card.title || card.line))
    .map((card, index) => ({
      id: card.id || `frame-${index}`,
      art: card.art || 'wish',
      tone: card.tone || TONES[index % TONES.length],
      title: card.title || 'For you',
      line: card.line || '',
    }));

  return { items, count: items.length };
}

export default buildGallery;
