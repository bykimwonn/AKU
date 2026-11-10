import { describe, expect, it } from 'vitest';
import siteConfig from '../src/config/site.config.js';
import { buildGallery } from '../src/utils/photos.js';
import { describeBirthday } from '../src/utils/date.js';
import { interpolate, prettifyFileName } from '../src/utils/text.js';
import { SECTIONS } from '../src/config/sections.js';

/**
 * The config file is the owner's editing surface, so it is treated as an API:
 * if a field goes missing, the site should say so here rather than show her a
 * blank section.
 */
describe('the personalisation config', () => {
  it('has every piece of content the sections need', () => {
    const required = {
      'recipient.name': siteConfig.recipient.name,
      'recipient.salutation': siteConfig.recipient.salutation,
      'welcome.kicker': siteConfig.welcome.kicker,
      'welcome.tagline': siteConfig.welcome.tagline,
      'welcome.cta': siteConfig.welcome.cta,
      'envelope.title': siteConfig.envelope.title,
      'envelope.greeting': siteConfig.envelope.greeting,
      'letter.title': siteConfig.letter.title,
      'gallery.title': siteConfig.gallery.title,
      'cake.headline': siteConfig.cake.headline,
      'cake.message': siteConfig.cake.message,
      'goodbye.line1': siteConfig.goodbye.line1,
      'goodbye.line2': siteConfig.goodbye.line2,
      'goodbye.replayLabel': siteConfig.goodbye.replayLabel,
      'music.defaultVolume': siteConfig.music.defaultVolume,
    };

    for (const [field, value] of Object.entries(required)) {
      expect(value, `${field} must not be empty`).toBeTruthy();
    }
  });

  it('carries non-empty prose everywhere the words matter', () => {
    expect(siteConfig.envelope.intro.length).toBeGreaterThanOrEqual(2);
    expect(siteConfig.envelope.body.length).toBeGreaterThanOrEqual(2);
    expect(siteConfig.letter.paragraphs.length).toBeGreaterThanOrEqual(4);
    expect(siteConfig.gifts.items).toHaveLength(3);

    for (const gift of siteConfig.gifts.items) {
      expect(gift.id).toBeTruthy();
      expect(gift.label).toBeTruthy();
      expect(gift.title).toBeTruthy();
      expect(gift.paragraphs.length).toBeGreaterThan(0);
      gift.paragraphs.forEach((line) => expect(line.trim().length).toBeGreaterThan(12));
    }
  });

  it('keeps every gift id unique so the modal can find it', () => {
    const ids = siteConfig.gifts.items.map((gift) => gift.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('asks the same questions of the gallery placeholders', () => {
    const frames = siteConfig.gallery.placeholders;
    expect(frames.length).toBeGreaterThanOrEqual(4);
    frames.forEach((frame) => expect(frame.caption).toBeTruthy());
  });

  it('lists a chapter for every section the app renders', () => {
    expect(SECTIONS.map((section) => section.id)).toEqual([
      'envelope',
      'gallery',
      'letter',
      'gifts',
      'cake',
      'goodbye',
    ]);
    SECTIONS.forEach((section) => {
      expect(section.label).toBeTruthy();
      expect(section.hint).toBeTruthy();
    });
  });

  it('keeps a candle count the cake can actually build', () => {
    expect(siteConfig.cake.candleCount).toBeGreaterThanOrEqual(1);
    expect(siteConfig.cake.candleCount).toBeLessThanOrEqual(9);
  });

  it('stays honest: no invented shared memories in the shipped copy', () => {
    const all = JSON.stringify(siteConfig).toLowerCase();
    // The default wording must not claim events that may never have happened.
    for (const phrase of ['the day we met', 'our first', 'since we were', 'every morning i']) {
      expect(all, `the config should not invent "${phrase}"`).not.toContain(phrase);
    }
  });
});

describe('name tokens', () => {
  it('replaces {name} and {NAME} in any string', () => {
    expect(interpolate('Happy birthday, {name}.')).toBe(
      `Happy birthday, ${siteConfig.recipient.salutation}.`,
    );
    expect(interpolate('HAPPY BIRTHDAY, {NAME}!')).toBe(`HAPPY BIRTHDAY, ${siteConfig.recipient.name}!`);
  });

  it('leaves text without tokens alone', () => {
    expect(interpolate('Nothing to swap here.')).toBe('Nothing to swap here.');
  });

  it('turns a camera file name into a readable caption', () => {
    expect(prettifyFileName('IMG_2043 (1).jpg')).toBe('Photo 2043');
    expect(prettifyFileName('garden-party.jpg')).toBe('Garden party');
    expect(prettifyFileName('DSC0012.png')).toBe('Photo 0012');
    expect(prettifyFileName('us two.jpg')).toBe('Us two');
    expect(prettifyFileName('03-garden-evening.png')).toBe('Garden evening');
    expect(prettifyFileName('her-smile.jpg.png')).toBe('Her smile');
    expect(prettifyFileName('')).toBe('A memory');
  });
});

describe('the gallery builder', () => {
  it('falls back to empty frames while no photographs exist', () => {
    const gallery = buildGallery(siteConfig);
    expect(gallery.hasPhotos).toBe(false);
    expect(gallery.items).toHaveLength(siteConfig.gallery.placeholders.length);
    gallery.items.forEach((item) => expect(item.placeholder).toBe(true));
  });

  it('accepts a captioned photo given as a URL in the config', () => {
    const gallery = buildGallery({
      ...siteConfig,
      gallery: {
        ...siteConfig.gallery,
        items: [{ src: 'https://example.com/a.jpg', caption: 'A framed test', date: 'Nov 2026' }],
      },
    });

    expect(gallery.hasPhotos).toBe(true);
    expect(gallery.items).toHaveLength(1);
    expect(gallery.items[0]).toMatchObject({
      caption: 'A framed test',
      date: 'Nov 2026',
      placeholder: false,
    });
  });

  it('uses a readable caption when a photo has no config entry', () => {
    const gallery = buildGallery({
      ...siteConfig,
      gallery: { ...siteConfig.gallery, items: [{ src: 'https://example.com/sunset-2.jpg' }] },
    });

    expect(gallery.items[0].caption).toBe('Sunset 2');
  });
});

describe('the birthday date', () => {
  it('treats today as the day when the config says auto', () => {
    const result = describeBirthday('auto');
    expect(result.kind).toBe('today');
    expect(result.isToday).toBe(true);
  });

  it('counts down to the next occurrence', () => {
    const today = new Date(2026, 10, 10); // 10 November 2026
    const soon = describeBirthday('2026-11-20', today);
    expect(soon.kind).toBe('upcoming');
    expect(soon.days).toBe(10);

    const nextYear = describeBirthday('2026-01-05', today);
    expect(nextYear.kind).toBe('past');
    expect(nextYear.days).toBeGreaterThan(300);
  });

  it('recognises the day itself', () => {
    const today = new Date(2026, 10, 10);
    const result = describeBirthday('2026-11-10', today);
    expect(result.kind).toBe('today');
    expect(result.days).toBe(0);
  });

  it('survives a typo in the config', () => {
    for (const bad of ['', 'not-a-date', '2026-13-45', null, undefined]) {
      expect(() => describeBirthday(bad)).not.toThrow();
      expect(describeBirthday(bad).kind).toBe('today');
    }
  });
});
