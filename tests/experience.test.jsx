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

const LETTER_OPENING = /I wanted to do something a little different for you\./;

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
    expect(within(dialog).getByText(/so i created this little corner of the world/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/dear akudzweishe,/i)).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    // …and it can be read again, so nobody is left with a one-shot surprise.
    await user.click(screen.getByRole('button', { name: /read the letter again/i }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});

describe('the gallery', () => {
  it('shows empty frames rather than somebody else’s photographs', async () => {
    const user = userEvent.setup();
    renderExperience();
    await openExperience(user);

    const frames = await screen.findAllByRole('button', { name: /empty frame/i });
    const expected = siteConfig.gallery.placeholders.length;
    expect(frames).toHaveLength(expected);
    expect(frames.length).toBeGreaterThan(0);
  });

  it('expands a frame, steps through the gallery and closes', async () => {
    const user = userEvent.setup();
    renderExperience();
    await openExperience(user);

    const frames = await screen.findAllByRole('button', { name: /empty frame|open photograph/i });
    await user.click(frames[0]);

    const dialog = await screen.findByRole('dialog');
    expect(await within(dialog).findByText(`1 / ${siteConfig.gallery.placeholders.length}`)).toBeInTheDocument();

    await user.keyboard('{ArrowRight}');
    expect(await within(dialog).findByText(`2 / ${siteConfig.gallery.placeholders.length}`)).toBeInTheDocument();

    await user.keyboard('{ArrowLeft}');
    await user.keyboard('{ArrowLeft}');
    expect(await within(dialog).findByText(`${siteConfig.gallery.placeholders.length} / ${siteConfig.gallery.placeholders.length}`)).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: /close the photograph/i }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
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

    expect(screen.getByText(siteConfig.goodbye.line1)).toBeInTheDocument();
    expect(screen.getByText(siteConfig.goodbye.line2)).toBeInTheDocument();
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

    // 3. the candles still go out, and the wish still arrives
    await user.click(await screen.findByRole('button', { name: /blow them all out/i }));
    expect(
      await screen.findByRole('heading', { name: /happy birthday, akudzweishe/i }),
    ).toBeInTheDocument();
  });
});
