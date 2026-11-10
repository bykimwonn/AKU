import { describe, expect, it } from 'vitest';
import siteConfig from '../src/config/site.config.js';
import { buildGallery } from '../src/utils/gallery.js';
import { ART_KEYS } from '../src/components/sections/gallery/MemoryArt.jsx';
import { describeBirthday } from '../src/utils/date.js';
import { interpolate } from '../src/utils/text.js';
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
      'recipient.short': siteConfig.recipient.short,
      'envelope.continueLabel': siteConfig.envelope.continueLabel,
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

  it('asks the same questions of the gallery frames', () => {
    const cards = siteConfig.gallery.cards;
    expect(cards.length).toBeGreaterThanOrEqual(4);
    cards.forEach((card) => {
      expect(card.title).toBeTruthy();
      // Every frame has to say something — it is the whole point of the chapter.
      expect(card.line.trim().length).toBeGreaterThan(20);
      expect(ART_KEYS, `"${card.art}" is not a drawing that exists`).toContain(card.art);
    });
    expect(new Set(cards.map((card) => card.art)).size).toBe(cards.length);
  });

  it('signs the letters with a real name and the line she should hear', () => {
    expect(siteConfig.sender.name).toBe('Bongani Tshuma');
    expect(siteConfig.signature.name).toBe('Bongani Tshuma');
    expect(siteConfig.signature.line.toLowerCase()).toBe('i love you');
    // Nothing in the finished site may read like an instruction to the owner.
    const visible = JSON.stringify({
      gallery: siteConfig.gallery,
      envelope: siteConfig.envelope,
      letter: siteConfig.letter,
      gifts: siteConfig.gifts,
      cake: siteConfig.cake,
      goodbye: siteConfig.goodbye,
    });
    for (const phrase of ['src/assets', 'config', 'placeholder', 'npm run', 'add your own', 'drop ']) {
      expect(visible.toLowerCase(), `the visitor should never see "${phrase}"`).not.toContain(phrase);
    }
  });

  it('never leans on a weekday to make a point', () => {
    // "every ordinary Tuesday" reads as a random day unless you already know the
    // idiom — the copy says what it means instead, in plain words.
    const visible = JSON.stringify({
      signature: siteConfig.signature,
      envelope: siteConfig.envelope,
      letter: siteConfig.letter,
      gifts: siteConfig.gifts,
      cake: siteConfig.cake,
      goodbye: siteConfig.goodbye,
      welcome: siteConfig.welcome,
      gallery: siteConfig.gallery,
    });
    expect(visible).not.toMatch(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
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

describe('the birthday is tomorrow, not today', () => {
  it('counts down from the configured date', () => {
    expect(siteConfig.birthdayDate).toBe('2026-11-11');
    // the night before: one day to go, singular
    const eve = describeBirthday(siteConfig.birthdayDate, new Date(2026, 10, 10));
    expect(eve).toMatchObject({ kind: 'upcoming', days: 1 });
    expect(eve.label).toBe('1 day until her day.');
    // on the day itself the site stops counting
    const day = describeBirthday(siteConfig.birthdayDate, new Date(2026, 10, 11));
    expect(day.kind).toBe('today');
    expect(day.isToday).toBe(true);
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

  it('knows the everyday nickname as well as the display name', () => {
    const short = siteConfig.recipient.short;
    expect(interpolate('My dearest {short},')).toBe(`My dearest ${short},`);
    expect(interpolate('{SHORT}')).toBe(short.toUpperCase());
    // the nickname is used where a whole name would be too much
    expect(interpolate(siteConfig.brand.wordmark)).toBe(`${short}'s Little Universe`);
    expect(siteConfig.letter.greeting).toContain('{short}');
    expect(siteConfig.cake.subtitle).toContain('{short}');
    expect(siteConfig.goodbye.line1).toContain('{short}');
    // and the sealed letter keeps her full name
    expect(siteConfig.envelope.greeting).toContain('{name}');
  });

  it('leaves an unknown token visible instead of swallowing it', () => {
    expect(interpolate('Hello {shrot}')).toBe('Hello {shrot}');
  });

});

describe('the gallery builder', () => {
  it('turns the config into frames that need nothing added', () => {
    const gallery = buildGallery(siteConfig);
    expect(gallery.count).toBe(siteConfig.gallery.cards.length);
    expect(gallery.items).toHaveLength(gallery.count);
    gallery.items.forEach((item) => {
      expect(item.art).toBeTruthy();
      expect(['gold', 'rose', 'plum', 'cream']).toContain(item.tone);
      expect(item.title).toBeTruthy();
    });
  });

  it('fills in a tone and skips an empty card instead of showing a hole', () => {
    const gallery = buildGallery({
      gallery: {
        cards: [{ title: 'One', line: 'A line.', art: 'dawn' }, {}, { title: 'Two', tone: 'gold' }],
      },
    });
    expect(gallery.items).toHaveLength(2);
    expect(gallery.items[0].tone).toBe('gold');
    expect(gallery.items[1]).toMatchObject({ title: 'Two', tone: 'gold', line: '' });
  });

  it('survives a config with no gallery at all', () => {
    expect(buildGallery({}).items).toEqual([]);
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
