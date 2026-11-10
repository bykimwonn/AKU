import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { resolveTrackSrc, useMusicEngine } from '../src/hooks/useMusicEngine.js';

/** A tiny stand-in for HTMLAudioElement that keeps the event API. */
class FakeAudio extends EventTarget {
  static instances = [];
  constructor(src) {
    super();
    this.src = src;
    this.volume = 1;
    this.muted = false;
    this.paused = true;
    this.loop = false;
    this.preload = '';
    this.play = vi.fn(async () => {
      this.paused = false;
      this.dispatchEvent(new Event('play'));
    });
    this.pause = vi.fn(() => {
      this.paused = true;
      this.dispatchEvent(new Event('pause'));
    });
    FakeAudio.instances.push(this);
  }
}

const baseConfig = {
  recipient: { name: 'AKUDZWEISHE', salutation: 'Akudzweishe' },
  music: {},
};

beforeEach(() => {
  FakeAudio.instances = [];
  window.Audio = FakeAudio;
  window.localStorage.clear();
});

afterEach(() => {
  delete window.Audio;
});

describe('resolveTrackSrc', () => {
  it('accepts the three shapes an owner is likely to type', () => {
    for (const written of ['audio/song.mp3', './audio/song.mp3', '/audio/song.mp3']) {
      expect(resolveTrackSrc(written)).toMatch(/\/audio\/song\.mp3$/);
    }
  });

  it('passes absolute URLs through untouched', () => {
    expect(resolveTrackSrc('https://example.com/a.mp3')).toBe('https://example.com/a.mp3');
  });

  it('returns an empty string for an empty config value', () => {
    expect(resolveTrackSrc('')).toBe('');
    expect(resolveTrackSrc(undefined)).toBe('');
  });
});

describe('useMusicEngine', () => {
  it('uses the owner file when music.src is set', async () => {
    const { result } = renderHook(() =>
      useMusicEngine({ ...baseConfig, music: { src: 'audio/song.mp3', title: 'Our song' } }),
    );

    expect(result.current.mode).toBe('file');
    expect(result.current.hasTrack).toBe(true);
    expect(result.current.label).toBe('Our song');

    await act(async () => {
      await result.current.play();
    });

    expect(FakeAudio.instances[0].play).toHaveBeenCalled();
    await waitFor(() => expect(result.current.playing).toBe(true));

    act(() => result.current.pause());
    await waitFor(() => expect(result.current.playing).toBe(false));
  });

  it('falls back to the generated loop, and reports politely if the browser refuses', async () => {
    const { result } = renderHook(() => useMusicEngine({ ...baseConfig, music: { src: '' } }));

    expect(result.current.mode).toBe('generated');
    expect(result.current.label).toContain('ambient');

    // window.AudioContext is deleted in setup.js — the site must not throw.
    await act(async () => {
      const ok = await result.current.play();
      expect(ok).toBe(false);
    });
    expect(result.current.error).toMatch(/cannot generate/i);
  });

  it('never autoplays: startOnOpen is skipped once the visitor paused before', async () => {
    window.localStorage.setItem('aku.music.settings', JSON.stringify({ intent: 'paused', volume: 0.4 }));

    const { result } = renderHook(() =>
      useMusicEngine({ ...baseConfig, music: { src: 'audio/song.mp3', startOnOpen: true } }),
    );

    await act(async () => {
      result.current.maybeAutoStart();
    });

    expect(FakeAudio.instances).toHaveLength(1); // ready, but silent
    expect(FakeAudio.instances[0].play).not.toHaveBeenCalled();
    expect(result.current.playing).toBe(false);
  });

  it('starts on the opening click when that is allowed', async () => {
    const { result } = renderHook(() =>
      useMusicEngine({ ...baseConfig, music: { src: 'audio/song.mp3', startOnOpen: true } }),
    );

    await act(async () => {
      result.current.maybeAutoStart();
    });

    await waitFor(() => expect(result.current.playing).toBe(true));
  });

  it('keeps volume and mute in step with the audio element', async () => {
    const { result } = renderHook(() =>
      useMusicEngine({ ...baseConfig, music: { src: 'audio/song.mp3', defaultVolume: 0.5 } }),
    );

    act(() => result.current.setVolume(0.82));
    expect(result.current.volume).toBeCloseTo(0.82);
    expect(FakeAudio.instances[0].volume).toBeCloseTo(0.82);

    act(() => result.current.toggleMute());
    expect(result.current.muted).toBe(true);
    expect(FakeAudio.instances[0].muted).toBe(true);

    act(() => result.current.toggleMute());
    expect(result.current.muted).toBe(false);
  });

  it('never plays again on its own once she has stopped it', async () => {
    const { result } = renderHook(() =>
      useMusicEngine({ ...baseConfig, music: { src: 'audio/song.mp3', startOnOpen: true } }),
    );

    await act(async () => {
      await result.current.play();
    });
    await waitFor(() => expect(result.current.playing).toBe(true));

    act(() => result.current.pause());
    expect(JSON.parse(window.localStorage.getItem('aku.music.settings')).intent).toBe('paused');

    // a second visit: the opening click must not startle her with sound again
    FakeAudio.instances[0].play.mockClear();
    const { result: second } = renderHook(() =>
      useMusicEngine({ ...baseConfig, music: { src: 'audio/song.mp3', startOnOpen: true } }),
    );
    await act(async () => {
      second.current.maybeAutoStart();
    });
    expect(FakeAudio.instances[1].play).not.toHaveBeenCalled();
    expect(second.current.playing).toBe(false);
  });

  it('remembers settings only when memory is allowed', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');

    const { result: remember } = renderHook(() =>
      useMusicEngine({ ...baseConfig, music: { src: 'audio/a.mp3' } }),
    );
    act(() => remember.current.setVolume(0.3));
    expect(setItem).toHaveBeenCalled();

    setItem.mockClear();
    const { result: forgetful } = renderHook(() =>
      useMusicEngine({ ...baseConfig, music: { src: 'audio/a.mp3', remember: false } }),
    );
    act(() => forgetful.current.setVolume(0.9));
    expect(setItem).not.toHaveBeenCalled();

    setItem.mockRestore();
  });
});
