import siteConfig from '../config/site.config.js';
import { prettifyFileName } from './text.js';

/**
 * Every image inside src/assets/photos/ is picked up automatically by Vite and
 * bundled (hashed + compressed) — the owner just drops files in the folder.
 */
const discovered = import.meta.glob(
  '../assets/photos/*.{jpg,jpeg,JPG,JPEG,png,PNG,webp,WEBP,avif,AVIF,gif}',
  { eager: true, import: 'default' },
);

/** "02-beach.jpg" sorts before "10-party.jpg"; unknown names sort alphabetically. */
function sortKey(path) {
  return path
    .replace(/^.*\//, '')
    .toLowerCase()
    .replace(/^(\d+)[-_ ]*/, (match, digits) => `${digits.padStart(4, '0')}~`);
}

/**
 * Build the gallery.
 *
 *  • Photos found in src/assets/photos/ appear automatically, in file-name order.
 *  • Captions/dates from `gallery.items` in the config are matched by file name.
 *  • A `gallery.items` entry with its own `src` (a full URL) is also allowed.
 *  • With no photos at all, the elegant placeholder frames are rendered instead.
 */
export function buildGallery(config = siteConfig) {
  const configured = Array.isArray(config.gallery?.items) ? config.gallery.items : [];

  const metaByFile = new Map();
  for (const item of configured) {
    if (item?.file) metaByFile.set(String(item.file).toLowerCase(), item);
  }

  const used = new Set();
  const local = Object.entries(discovered)
    .sort(([a], [b]) => sortKey(a).localeCompare(sortKey(b)))
    .map(([path, src]) => {
      const file = path.replace(/^.*\//, '');
      used.add(file.toLowerCase());
      const meta = metaByFile.get(file.toLowerCase());
      return {
        id: `photo-${file}`,
        file,
        src,
        caption: meta?.caption?.trim() || prettifyFileName(file),
        date: meta?.date?.trim() || '',
        alt: meta?.alt?.trim() || '',
        placeholder: false,
      };
    });

  const external = configured
    .filter((item) => item?.src && !used.has(String(item.file || '').toLowerCase()))
    .map((item, index) => {
      // A URL is not a caption: use the last path segment instead.
      const name = item.file || String(item.src).split('/').pop().split('?')[0];
      return {
        id: `photo-external-${index}`,
        file: name,
        src: item.src,
        caption: item.caption?.trim() || prettifyFileName(name),
        date: item.date?.trim() || '',
        alt: item.alt?.trim() || '',
        placeholder: false,
      };
    });

  const photos = [...local, ...external];

  const placeholders = (config.gallery?.placeholders || []).map((item, index) => ({
    id: `placeholder-${index}`,
    caption: item.caption || 'A moment worth keeping',
    date: item.date || '',
    tone: item.tone || ['rose', 'gold', 'plum', 'cream'][index % 4],
    placeholder: true,
  }));

  return {
    photos,
    placeholders,
    items: photos.length ? photos : placeholders,
    hasPhotos: photos.length > 0,
  };
}
