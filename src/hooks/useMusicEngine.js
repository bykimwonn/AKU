import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import siteConfig from '../config/site.config.js';
import { ambientSupported, createAmbientEngine } from '../audio/ambientEngine.js';
import { clamp, store } from '../utils/text.js';

const STORAGE_KEY = 'aku.music.settings';

/**
 * Turn whatever the owner typed in `music.src` into a real URL.
 * 'audio/song.mp3', './audio/song.mp3' and '/audio/song.mp3' all work, and a
 * full https:// URL is passed straight through.
 */
export function resolveTrackSrc(src) {
  const value = (src || '').trim();
  if (!value) return '';
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
    return value;
  }
  const relative = value.replace(/^\.?\/+/, '');
  if (typeof document === 'undefined') return relative;
  try {
    return new URL(relative, document.baseURI).href;
  } catch {
    return relative;
  }
}

/**
 * One music system for the whole site: it lives in <App/>, so nothing stops
 * when the visitor scrolls, opens a gift or jumps between sections.
 *
 * Two modes, decided by the config:
 *   'file'      → the owner's own song from public/audio/ (or any URL)
 *   'generated' → the built-in ambient engine (no asset, no copyright)
 */
export function useMusicEngine(config = siteConfig) {
  const music = config.music || {};
  const trackSrc = useMemo(() => resolveTrackSrc(music.src), [music.src]);
  const mode = trackSrc ? 'file' : 'generated';

  const label =
    mode === 'file'
      ? music.title || 'For you, on repeat'
      : music.generatedTitle || 'Golden Hour — ambient (generated)';

  const remembered = useMemo(
    () => (music.remember === false ? null : store.get(STORAGE_KEY)),
    [music.remember],
  );

  const initialVolume = clamp(remembered?.volume ?? music.defaultVolume ?? 0.55, 0, 1);

  const [playing, setPlaying] = useState(false);
  const [volume, setVolumeState] = useState(initialVolume);
  const [muted, setMuted] = useState(Boolean(remembered?.muted));
  const [error, setError] = useState('');


  const audioRef = useRef(null);
  const engineRef = useRef(null);
  const settingsRef = useRef({ volume: initialVolume, muted: Boolean(remembered?.muted) });

  const remember = useCallback(
    (patch) => {
      if (music.remember === false) return;
      store.set(STORAGE_KEY, { volume, muted, ...patch });
    },
    [music.remember, volume, muted],
  );

  /* ── the <audio> element, only built when a real file was configured ──
     Note the dependency list: creating the element must never depend on the
     volume, or moving the slider would rebuild the player and skip the music. */
  useEffect(() => {
    if (mode !== 'file' || typeof Audio === 'undefined') return undefined;
    const audio = new Audio(trackSrc);
    audio.loop = true;
    audio.preload = 'metadata';
    audio.volume = settingsRef.current.volume;
    audio.muted = settingsRef.current.muted;

    const onPlay = () => {
      setPlaying(true);
      setError('');
    };
    const onPause = () => setPlaying(false);
    const onFail = () => {
      setError('That audio file could not be played — check music.src in the config.');
      setPlaying(false);
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('error', onFail);
    audioRef.current = audio;

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('error', onFail);
      audio.pause();
      audioRef.current = null;
    };
  }, [mode, trackSrc]);

  /* keep the element's volume in step with the slider */
  useEffect(() => {
    settingsRef.current = { volume, muted };
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = muted;
    }
    engineRef.current?.setVolume(muted ? 0 : volume);
  }, [volume, muted]);

  useEffect(
    () => () => {
      engineRef.current?.dispose?.();
      engineRef.current = null;
    },
    [],
  );

  const play = useCallback(async () => {
    setError('');
    if (mode === 'file') {
      const audio = audioRef.current;
      if (!audio) return false;
      audio.volume = volume;
      audio.muted = muted;
      try {
        await audio.play();
        setPlaying(true);
        return true;
      } catch {
        setError('Press play once more — browsers like the gesture to be closer.');
        setPlaying(false);
        return false;
      }
    }
    if (!ambientSupported()) {
      setError('This browser cannot generate the ambient loop. Add a music file instead.');
      return false;
    }
    if (!engineRef.current) {
      engineRef.current = createAmbientEngine({ volume: muted ? 0 : volume });
    }
    const ok = await engineRef.current.start();
    setPlaying(Boolean(ok));
    if (!ok) setError('The browser blocked the audio. Tap play again.');
    return Boolean(ok);
  }, [mode, volume, muted]);

  const pause = useCallback(() => {
    if (mode === 'file') audioRef.current?.pause();
    else engineRef.current?.stop();
    setPlaying(false);
    // Stopping it is a decision: remember it, and never auto-start again.
    if (music.remember !== false) store.set(STORAGE_KEY, { volume, muted, intent: 'paused' });
  }, [mode, music.remember, volume, muted]);

  const toggle = useCallback(() => {
    if (playing) pause();
    else play();
  }, [playing, pause, play]);

  const setVolume = useCallback(
    (next) => {
      const value = clamp(next, 0, 1);
      setVolumeState(value);
      if (value > 0) setMuted(false);
      remember({ volume: value });
    },
    [remember],
  );

  const toggleMute = useCallback(() => {
    setMuted((current) => {
      const next = !current;
      store.set(STORAGE_KEY, { volume, muted: next });
      return next;
    });
  }, [volume]);

  /** Called from the "Open Your Surprise" click, if the config allows it. */
  const maybeAutoStart = useCallback(() => {
    if (music.startOnOpen === false) return;
    if (remembered?.intent === 'paused') return; // she paused it before — respect that
    play();
  }, [music.startOnOpen, play, remembered?.intent]);

  /* One stable-ish object per state change, so the shell can memoise its handlers. */
  return useMemo(
    () => ({
      mode,
      supported: mode === 'file' ? typeof Audio !== 'undefined' : ambientSupported(),
      hasTrack: Boolean(trackSrc),
      playing,
      volume,
      muted,
      error,
      label,
      play,
      pause,
      toggle,
      setVolume,
      toggleMute,
      maybeAutoStart,
    }),
    [
      mode,
      trackSrc,
      playing,
      volume,
      muted,
      error,
      label,
      play,
      pause,
      toggle,
      setVolume,
      toggleMute,
      maybeAutoStart,
    ],
  );
}

export default useMusicEngine;
