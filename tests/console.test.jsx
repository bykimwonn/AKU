import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('canvas-confetti', () => {
  const fn = vi.fn();
  fn.shapeFromPath = vi.fn(() => ({ type: 'path' }));
  return { default: fn };
});

import App from '../src/App.jsx';

/**
 * Nothing should be shouting into the console. This walks the whole experience
 * once and fails on any React warning or uncaught error — the sort of thing
 * that is easy to miss and annoying to find later.
 */
describe('the browser console', () => {
  let errors;
  let warns;

  beforeEach(() => {
    errors = [];
    warns = [];
    vi.spyOn(console, 'error').mockImplementation((...args) => errors.push(args.join(' ')));
    vi.spyOn(console, 'warn').mockImplementation((...args) => warns.push(args.join(' ')));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('stays quiet while the visitor does everything', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('button', { name: /open your surprise/i }));
    await waitFor(() => expect(screen.queryByRole('main')).not.toHaveAttribute('inert'));

    await user.click(screen.getByRole('button', { name: /open the envelope/i }));
    const dialog = await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: /close the letter/i }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    void dialog;

    const frame = (await screen.findAllByRole('button', { name: /empty frame/i }))[0];
    await user.click(frame);
    await user.keyboard('{ArrowRight}');
    await user.keyboard('{Escape}');

    await user.click(await screen.findByRole('button', { name: /a little secret/i }));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
    await user.keyboard('{Escape}');

    await user.click(await screen.findByRole('button', { name: /blow them all out/i }));
    await waitFor(() => expect(screen.getAllByText(/candle/i).length).toBeGreaterThan(0));

    await user.click(screen.getByRole('button', { name: /adjust volume/i }));
    const slider = await screen.findByLabelText('Music volume');
    await user.type(slider, '{ArrowRight}');

    await user.click(screen.getByRole('button', { name: /chapters/i }));
    await user.click(await screen.findByRole('menuitem', { name: /the cake/i }));

    expect(errors).toEqual([]);
    expect(warns).toEqual([]);
  });
});
