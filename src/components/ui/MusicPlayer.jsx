import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js';
import { Pause, Play, Volume1, Volume2, VolumeX } from 'lucide-react';
import { EASE } from './Reveal.jsx';
import './chrome.css';

/**
 * The music control. Deliberately small: a play button, the track name, three
 * bars that move while sound is playing, and a volume slider that opens on
 * demand. It lives in the app shell, so it survives every section, overlay and
 * jump — the song never restarts.
 */
export function MusicPlayer({ music, compact = false }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const regionRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const onPointerDown = (event) => {
      if (!regionRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  if (!music) return null;

  const { playing, volume, muted, mode, label, error, toggle, setVolume, toggleMute } = music;
  const silenced = muted || volume === 0;
  const VolumeIcon = silenced ? VolumeX : volume > 0.6 ? Volume2 : Volume1;

  return (
    <div
      className={`player ${compact ? 'player--compact' : ''} ${playing ? 'is-playing' : ''}`.trim()}
      ref={regionRef}
    >
      <button
        type="button"
        className="player__toggle"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? 'Pause the music' : 'Play the music'}
      >
        <AnimatePresence initial={false} mode="wait" allowEnter={!reduced}>
          <motion.span
            key={playing ? 'pause' : 'play'}
            className="player__icon"
            initial={reduced ? false : { opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, scale: 0.7 }}
            transition={{ duration: reduced ? 0 : 0.22, ease: EASE }}
          >
            {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
          </motion.span>
        </AnimatePresence>
      </button>

      <div className="player__meta">
        <span className="player__title">{label}</span>
        <span className="player__sub">
          {mode === 'generated' ? 'generated live in your browser' : 'from the audio folder'}
        </span>
      </div>

      <span className="player__bars" aria-hidden="true">
        {[0, 1, 2, 3].map((index) => (
          <i key={index} style={{ '--i': index }} />
        ))}
      </span>

      <button
        type="button"
        className="player__vol-btn"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={`${id}-volume`}
        aria-label={silenced ? 'Unmute and adjust volume' : 'Adjust volume'}
      >
        <VolumeIcon size={17} strokeWidth={1.7} aria-hidden="true" />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={`${id}-volume`}
            className="player__volume"
            key="volume"
            initial={reduced ? false : { opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: reduced ? 0 : 0.28, ease: EASE }}
          >
            <label className="player__volume-label">
              <span className="sr-only">Music volume</span>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={Math.round((silenced ? 0 : volume) * 100)}
                onChange={(event) => setVolume(Number(event.target.value) / 100)}
                autoFocus
              />
            </label>
            <button type="button" className="player__mute" onClick={toggleMute}>
              {muted ? 'Unmute' : 'Mute'}
            </button>
            <span className="player__percent">{Math.round(volume * 100)}%</span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <span className="sr-only" role="status" aria-live="polite">
        {error || (playing ? 'Music playing' : 'Music paused')}
      </span>
    </div>
  );
}

export default MusicPlayer;
