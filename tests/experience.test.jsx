import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Confetti is a canvas effect; the tests care about the moment, not the particles.
vi.mock('canvas-confetti', () => {
  const fn = vi.fn();
  fn.shapeFromPath = vi.fn(() => ({ type: 'path' }));
  return { default: fn };
});

import { MotionConfig } from 'framer-motion';
import App from '../src/App.jsx';
import siteConfig from '../src/config/site.config.js';
import { interpolate } from '../src/utils/text.js';

const LETTER_OPENING = /I tried to write you an ordinary birthday message/;

/** The whole site, mounted the way the browser mounts it. */
function renderExperience() {
  return render(<App />);
}

async function openExperience(user) {
  const button = await screen.findByRole('button', { name: /open your surprise/i });
  await user.click(button);
  await screen.findByRole('heading', { name: /a letter, sealed until now/i });
}

beforeEach(() => {
  document.body.className = '';
});

afterEach(() => {
  // tests must not leak a media-query override into the next render
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }));
});

describe('the opening screen', () => {
  it('greets her by name and offers exactly one way in', async () => {
    const user = userEvent.setup();
    renderExperience();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(siteConfig.recipient.name);
    expect(screen.getByText(/a little universe made just for you/i)).toBeInTheDocument();
    expect(screen.getByText(/some people deserve more than an ordinary birthday wish/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open your surprise/i })).toBeInTheDocument();

    // Nothing else is reachable until she opts in.
    expect(screen.getByRole('main')).toHaveAttribute('inert');
    expect(document.body).toHaveClass('is-locked');
  });

  it('unlocks the page and moves to the first chapter when the button is used', async () => {
    const user = userEvent.setup();
    renderExperience();
    await openExperience(user);

    await waitFor(() => expect(document.body).not.toHaveClass('is-locked'));
    expect(screen.getByRole('main')).not.toHaveAttribute('inert');
  });
});

describe('the envelope', () => {
  it('opens a letter that can be closed with the keyboard', async () => {
    const user = userEvent.setup();
    renderExperience();
    await openExperience(user);

    await user.click(screen.getByRole('button', { name: /open the envelope/i }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(LETTER_OPENING)).toBeInTheDocument();
    expect(within(dialog).getByText(/so instead i built you a small world/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/Bongani Tshuma/)).toBeInTheDocument();
    expect(within(dialog).getByText(/I love you/)).toBeInTheDocument();
    expect(within(dialog).getByText(/my dearest akudzweishe,/i)).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    // …and it can be read again, so nobody is left with a one-shot surprise.
    await user.click(screen.getByRole('button', { name: /read the letter again/i }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});

describe('the envelope hand-off', () => {
  it('"Keep going" closes the letter and glides to the next chapter', async () => {
    const user = userEvent.setup();
    renderExperience();
    await openExperience(user);

    // Record every scroll the app asks for, and which section asked for it.
    // (setup.js installs scrollIntoView with defineProperty, so it has to be
    // replaced the same way.)
    const scrolls = [];
    const original = Element.prototype.scrollIntoView;
    const install = (fn) =>
      Object.defineProperty(Element.prototype, 'scrollIntoView', {
        configurable: true,
        writable: true,
        value: fn,
      });
    install(function patched(options) {
      scrolls.push({ id: this?.id, options });
    });

    try {
      // the opening screen hands the page to chapter one a beat later — that
      // is not the scroll under test, so start counting from after it

      await waitFor(() => expect(document.body).not.toHaveClass('is-locked'));
      // The opening screen hands over to chapter one on a 60ms timer; let that
      // land before starting to count, or it looks like part of the hand-off.
      await new Promise((resolve) => setTimeout(resolve, 120));
      scrolls.length = 0;

      await user.click(screen.getByRole('button', { name: /open the envelope/i }));
      const dialog = await screen.findByRole('dialog');
      const keepGoing = within(dialog).getByRole('button', { name: /keep going/i });
      expect(keepGoing).toHaveTextContent('six frames next');

      await user.click(keepGoing);

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      await waitFor(() => expect(document.body).not.toHaveClass('is-locked'));

      // The jump lands on the gallery, smoothly, exactly once.
      const toGallery = scrolls.filter((entry) => entry.id === 'gallery');
      expect(toGallery).toHaveLength(1);
      expect(toGallery[0].options).toMatchObject({ block: 'start', behavior: 'smooth' });
      // and nowhere else was scrolled to, so she is not left at the envelope
      expect(scrolls.map((entry) => entry.id)).toEqual(['gallery']);
    } finally {
      install(original);
    }
  });
});

describe('the gallery', () => {
  it('shows the six drawn frames, complete on their own', async () => {
    const user = userEvent.setup();
    renderExperience();
    await openExperience(user);

    const frames = await screen.findAllByRole('button', { name: /open frame:/i });
    expect(frames).toHaveLength(siteConfig.gallery.cards.length);
    // Every frame is a real sentence, not an invitation to add something.
    frames.forEach((frame, index) =>
      expect(frame.getAttribute('aria-label')).toContain(siteConfig.gallery.cards[index].line),
    );
  });

  it('expands a frame, steps through the gallery and closes', async () => {
    const user = userEvent.setup();
    renderExperience();
    await openExperience(user);

    const total = siteConfig.gallery.cards.length;
    const frames = await screen.findAllByRole('button', { name: /open frame:/i });
    await user.click(frames[0]);

    const dialog = await screen.findByRole('dialog');
    expect(await within(dialog).findByText(`1 / ${total}`)).toBeInTheDocument();
    await user.keyboard('{ArrowRight}');
    expect(await within(dialog).findByText(`2 / ${total}`)).toBeInTheDocument();

    await user.keyboard('{ArrowLeft}');
    await user.keyboard('{ArrowLeft}');
    expect(await within(dialog).findByText(`${total} / ${total}`)).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: /close the frame/i }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('draws each frame as inline art, so there is nothing to load and nothing broken', async () => {
    const user = userEvent.setup();
    renderExperience();
    await openExperience(user);

    const frames = await screen.findAllByRole('button', { name: /open frame:/i });
    frames.forEach((frame) => {
      expect(frame.querySelector('svg.memory-art')).not.toBeNull();
    });
    // No photographs, therefore no broken image icons, ever.
    expect(document.querySelectorAll('.polaroid img')).toHaveLength(0);
  });

  it('shows the sentence written for the frame she opened', async () => {
    const user = userEvent.setup();
    renderExperience();
    await openExperience(user);

    const cards = siteConfig.gallery.cards;
    const frames = await screen.findAllByRole('button', { name: /open frame:/i });
    await user.click(frames[2]);

    const dialog = await screen.findByRole('dialog');
    expect(await within(dialog).findByText(cards[2].line)).toBeInTheDocument();
    expect(within(dialog).getByText(cards[2].title)).toBeInTheDocument();
  });
});

describe('the heartfelt letter', () => {
  it('renders every paragraph from the config', async () => {
    const user = userEvent.setup();
    renderExperience();
    await openExperience(user);

    expect(screen.getByRole('heading', { name: /things i don.t always say/i })).toBeInTheDocument();

    const article = screen.getByRole('article');
    siteConfig.letter.paragraphs.forEach((paragraph) => {
      expect(within(article).getByText(paragraph)).toBeInTheDocument();
    });
    expect(within(article).getByText(siteConfig.letter.closing.replace('{name}', siteConfig.recipient.salutation))).toBeInTheDocument();
  });
});

describe('the three gifts', () => {
  it('each gift unwraps into its own message and can be wrapped back up', async () => {
    const user = userEvent.setup();
    renderExperience();
    await openExperience(user);

    for (const gift of siteConfig.gifts.items) {
      const box = await screen.findByRole('button', { name: new RegExp(gift.label, 'i') });
      await user.click(box);

      const dialog = await screen.findByRole('dialog');
      await waitFor(() => expect(within(dialog).getByText(gift.paragraphs[0])).toBeInTheDocument());
      await user.click(within(dialog).getByRole('button', { name: /wrap it back up/i }));
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    }

    expect(screen.getByText(/all three unwrapped/i)).toBeInTheDocument();
  });
});

describe('the nickname', () => {
  it('appears where a whole name would be too much', async () => {
    const user = userEvent.setup();
    renderExperience();
    await openExperience(user);

    const short = siteConfig.recipient.short;
    // the top-bar label, the second letter, the cake and the last line
    expect(screen.getByText(`${short}'s Little Universe`)).toBeInTheDocument();
    expect(screen.getByText(`My dearest ${short},`)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`Make a wish, ${short},`, 'i'))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`especially for you, ${short}\\.`))).toBeInTheDocument();
    // the sealed letter is the formal one — it keeps her full name
    expect(screen.getByText(/My dearest Akudzweishe,/)).toBeInTheDocument();
  });
});

describe('the cake', () => {
  const candleCount = siteConfig.cake.candleCount;

  it('lets every candle be blown out one at a time and then celebrates', async () => {
    const user = userEvent.setup();
    renderExperience();
    await openExperience(user);

    const candles = await screen.findAllByRole('button', { name: /candle \d+ of \d+/i });
    expect(candles).toHaveLength(candleCount);

    for (let index = 0; index < candleCount; index += 1) {
      const [first] = await screen.findAllByRole('button', { name: /lit\. activate to blow it out/i });
      await user.click(first);
    }

    expect(await screen.findByRole('heading', { name: /happy birthday, akudzweishe/i })).toBeInTheDocument();
    expect(screen.getByText(siteConfig.cake.message)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /blow them all out/i })).toBeDisabled();
  });

  it('blows out the whole row at once and can relight them', async () => {
    const user = userEvent.setup();
    renderExperience();
    await openExperience(user);

    await user.click(await screen.findByRole('button', { name: /blow them all out/i }));

    // The gust puts out one candle every 150ms, so the wish lands a beat later.
    expect(
      await screen.findByRole('heading', { name: /happy birthday, akudzweishe/i }, { timeout: 3000 }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /light them again/i }));
    const relit = await screen.findAllByRole('button', { name: /lit\. activate to blow it out/i });
    expect(relit).toHaveLength(candleCount);

    // the wish fades away rather than vanishing, so give it a moment
    await waitFor(
      () =>
        expect(screen.queryByRole('heading', { name: /happy birthday, akudzweishe/i })).not.toBeInTheDocument(),
      { timeout: 3000 },
    );
  });
});

describe('the 3D cake', () => {
  const yawOf = (stage) => Number.parseFloat(stage.style.getPropertyValue('--yaw') || '0');

  async function readyCake(user) {
    renderExperience();
    await openExperience(user);
    const stage = await screen.findByRole('group', { name: /birthday cake/i });
    await waitFor(() => expect(stage.style.getPropertyValue('--yaw')).toBeTruthy());
    return stage;
  }

  it('turns under her finger', async () => {
    const user = userEvent.setup();
    const stage = await readyCake(user);

    expect(stage).toHaveAttribute('data-spin', 'on');
    const before = yawOf(stage);

    stage.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, clientX: 40, buttons: 1 }));
    await waitFor(() => expect(stage).toHaveClass('is-grabbing'));

    stage.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, clientX: 190 }));
    // 150px of drag is ~63° of turn; the idle drift alone moves under 3° a second
    await waitFor(() => expect(Math.abs(yawOf(stage) - before)).toBeGreaterThan(20), {
      timeout: 3000,
    });

    stage.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, clientX: 190 }));
    await waitFor(() => expect(stage).not.toHaveClass('is-grabbing'));
  });

  it('hides the drag hint the first time she touches it', async () => {
    const user = userEvent.setup();
    const stage = await readyCake(user);
    const cue = document.querySelector('.cake3d__cue');
    expect(cue).toHaveTextContent(/drag the cake/i);
    expect(cue).not.toHaveClass('is-hidden');

    await user.click(screen.getByRole('button', { name: /candle 1 of/i }));
    stage.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, clientX: 20, buttons: 1 }));
    await waitFor(() => expect(document.querySelector('.cake3d__cue')).toHaveClass('is-hidden'));
  });

  it('turns with the arrow keys too, and never steals the chapter shortcut', async () => {
    const user = userEvent.setup();
    const stage = await readyCake(user);
    const before = yawOf(stage);

    stage.focus();
    await user.keyboard('{ArrowLeft}');
    await waitFor(() => expect(Math.abs(yawOf(stage) - before)).toBeGreaterThan(12), { timeout: 3000 });

    // Alt+↓ is the site's "next chapter" chord, so the cake must not turn for it.
    // Let the cake settle first: it eases toward its target and drifts slowly on
    // its own, so an exact-equality check here would be a race, not a test.
    await new Promise((resolve) => setTimeout(resolve, 420));
    const altBefore = yawOf(stage);
    await user.keyboard('{Alt>}{ArrowDown}{/Alt>}');
    await new Promise((resolve) => setTimeout(resolve, 420));
    // a real nudge would be 24°; nothing but the idle drift should have happened
    expect(Math.abs(yawOf(stage) - altBefore)).toBeLessThan(12);
  });

  it('stands the candles around the icing as real buttons', async () => {
    const user = userEvent.setup();
    await readyCake(user);

    const slots = document.querySelectorAll('.candle-slot');
    const candles = await screen.findAllByRole('button', { name: /candle \d of 5 — lit/i });
    expect(slots).toHaveLength(5);
    expect(candles).toHaveLength(5);
    // each slot is rotated to its place on the ring, so the angles differ
    const angles = [...slots].map((slot) => slot.style.getPropertyValue('--a'));
    expect(new Set(angles).size).toBe(5);
    // the geometry itself is decoration: it must never intercept a click
    expect(document.querySelector('.geo')).toHaveAttribute('aria-hidden', 'true');
  });

  it('lets the whole cake go out without losing the wish', async () => {
    const user = userEvent.setup();
    await readyCake(user);

    await user.click(screen.getByRole('button', { name: /blow them all out/i }));
    await screen.findByRole('heading', { name: /happy birthday, akudzweishe/i }, { timeout: 3000 });
    expect(document.querySelector('.cake3d')).toHaveClass('is-done');
    expect(await screen.findAllByRole('button', { name: /light it again/i })).toHaveLength(5);
  });
});

describe('the goodbye', () => {
  it('plays the whole thing again', async () => {
    const user = userEvent.setup();
    renderExperience();
    await openExperience(user);

    await user.click(await screen.findByRole('button', { name: /relive it from the beginning/i }));

    expect(await screen.findByRole('button', { name: /open your surprise/i })).toBeInTheDocument();
    expect(document.body).toHaveClass('is-locked');
  });

  it('speaks the two closing lines', async () => {
    const user = userEvent.setup();
    renderExperience();
    await openExperience(user);

    expect(screen.getByText(interpolate(siteConfig.goodbye.line1))).toBeInTheDocument();
    expect(screen.getByText(interpolate(siteConfig.goodbye.line2))).toBeInTheDocument();
  });

  it('signs the very end, in full, with the line that matters', async () => {
    const user = userEvent.setup();
    renderExperience();
    await openExperience(user);

    const sign = document.querySelector('.goodbye__sign .signature');
    expect(sign).not.toBeNull();
    expect(sign.querySelector('.signature__eyebrow')).toHaveTextContent(
      siteConfig.signature.eyebrow,
    );
    expect(sign.querySelector('.signature__name')).toHaveTextContent(siteConfig.sender.name);
    expect(sign.querySelector('.signature__line')).toHaveTextContent(siteConfig.signature.line);
    expect(sign.querySelector('.signature__whisper')).toHaveTextContent(siteConfig.signature.whisper);
    // Her name is not signed anywhere — the signature block is the only one.
    expect(sign.querySelectorAll('.signature__name')).toHaveLength(1);
  });
});

describe('the navigation', () => {
  it('chapter buttons jump to their section', async () => {
    const user = userEvent.setup();
    renderExperience();
    await openExperience(user);

    await user.click(screen.getByRole('button', { name: /^go to the cake$/i }));
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it('walks the chapters with Alt+arrow and toggles music with M', async () => {
    const user = userEvent.setup();
    renderExperience();
    await openExperience(user);

    await user.keyboard('{Alt>}[ArrowDown]{/Alt}');
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });
});

describe('reduced motion', () => {
  it('still delivers every interactive moment, just without the movement', async () => {
    // Two layers, both pinned: MotionConfig silences framer's own animations and
    // the media query is what the site's own reduced-motion hook reads.
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: /prefers-reduced-motion/.test(query),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }));

    const user = userEvent.setup();
    render(
      <MotionConfig reducedMotion="always">
        <App />
      </MotionConfig>,
    );

    // 1. the door still opens
    await user.click(await screen.findByRole('button', { name: /open your surprise/i }));
    expect(await screen.findByRole('heading', { name: /a letter, sealed until now/i })).toBeInTheDocument();
    expect(document.body).not.toHaveClass('is-locked');

    // 2. the letter opens immediately, with no waiting on an animation
    await user.click(screen.getByRole('button', { name: /open the envelope/i }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(LETTER_OPENING)).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: /close the letter/i }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    // 3. the cake does not turn by itself, but she can still turn it
    const stage = document.querySelector('.cake3d');
    expect(stage).toHaveAttribute('data-spin', 'off');
    expect(stage).toHaveAttribute('tabindex', '0');

    // 4. the candles still go out, and the wish still arrives
    await user.click(await screen.findByRole('button', { name: /blow them all out/i }));
    expect(
      await screen.findByRole('heading', { name: /happy birthday, akudzweishe/i }),
    ).toBeInTheDocument();
  });
});
