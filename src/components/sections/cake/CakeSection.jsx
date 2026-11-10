import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion.js';
import { Flame, Wind } from 'lucide-react';
import siteConfig from '../../../config/site.config.js';
import { celebrate } from '../../../utils/celebrate.js';
import { clamp, interpolate } from '../../../utils/text.js';
import { SectionShell } from '../../ui/SectionShell.jsx';
import { Stagger, StaggerItem } from '../../ui/Stagger.jsx';
import { EASE } from '../../ui/Reveal.jsx';
import { Candle } from './Candle.jsx';
import { CakeBody } from './CakeBody.jsx';
import './cake.css';

const COUNT = clamp(Number(siteConfig.cake?.candleCount ?? 5) || 5, 1, 9);

/**
 * SECTION 6 — the cake.
 *
 * Tap a candle to blow it out, or use the "blow" button for the whole gust at
 * once. When the last flame goes out: confetti, petals, and the final message.
 * Candles can be relit (individually, or all at once) so nothing is a dead end.
 */
export function CakeSection() {
  const cake = siteConfig.cake;
  const reduced = usePrefersReducedMotion();
  const [lit, setLit] = useState(() => Array.from({ length: COUNT }, () => true));
  const [blowing, setBlowing] = useState(false);
  const [celebrated, setCelebrated] = useState(false);
  const timersRef = useRef([]);

  const allOut = lit.every((on) => !on);
  const anyOut = lit.some((on) => !on);

  useEffect(() => () => timersRef.current.forEach(window.clearTimeout), []);

  const extinguish = (index) => {
    setLit((current) => {
      if (!current[index]) return current;
      const next = [...current];
      next[index] = false;
      return next;
    });
  };

  const relight = (index) => {
    setLit((current) => {
      if (current[index]) return current;
      const next = [...current];
      next[index] = true;
      return next;
    });
    setCelebrated(false);
  };

  // The celebration is driven by an effect so it fires exactly once, whether the
  // last candle was tapped or blown out in a gust.
  useEffect(() => {
    if (!allOut || celebrated) return;
    setCelebrated(true);
    celebrate({ big: true });
  }, [allOut, celebrated]);

  const gust = () => {
    if (blowing) return;
    const targets = lit.map((on, index) => (on ? index : -1)).filter((index) => index >= 0);
    if (!targets.length) return;

    if (reduced) {
      setLit((current) => current.map(() => false));
      return;
    }

    setBlowing(true);
    timersRef.current.forEach(window.clearTimeout);
    timersRef.current = targets.map((index, order) =>
      window.setTimeout(() => extinguish(index), 420 + order * 150),
    );
    timersRef.current.push(window.setTimeout(() => setBlowing(false), 420 + targets.length * 150 + 320));
  };

  const relightAll = () => {
    timersRef.current.forEach(window.clearTimeout);
    timersRef.current = [];
    setBlowing(false);
    setLit(() => Array.from({ length: COUNT }, () => true));
    setCelebrated(false);
  };

  return (
    <SectionShell
      id="cake"
      tone="night"
      eyebrow={cake.eyebrow}
      title={cake.title}
      subtitle={cake.subtitle}
      className="cake-section"
    >
      <div className={`cake-scene ${allOut ? 'is-done' : ''} ${blowing ? 'is-blowing' : ''}`}>
        <motion.span className="cake-scene__light" aria-hidden="true" animate={{ opacity: allOut ? 0.35 : 1 }} transition={{ duration: 1.2 }} />

        <div className="cake-scene__candles" role="group" aria-label="Candles">
          {lit.map((on, index) => (
            <Candle
              key={index}
              index={index}
              total={COUNT}
              lit={on}
              reduced={reduced}
              onExtinguish={() => extinguish(index)}
              onRelight={() => relight(index)}
            />
          ))}
        </div>

        <CakeBody litCount={lit.filter(Boolean).length} />
      </div>

      <div className="cake__controls">
        <p className="cake__prompt" role="status" aria-live="polite">
          {allOut
            ? 'Every candle is out. Your wish is on its way.'
            : anyOut
              ? `${lit.filter(Boolean).length} still burning — ${COUNT - lit.filter(Boolean).length} out.`
              : cake.prompt}
        </p>

        <div className="cake__buttons">
          <button
            type="button"
            className="btn-solid cake__blow"
            onClick={gust}
            disabled={allOut || blowing}
          >
            <Wind size={16} strokeWidth={1.8} aria-hidden="true" />
            {blowing ? 'Blowing…' : 'Blow them all out'}
          </button>

          {anyOut ? (
            <button type="button" className="btn-ghost btn-ghost--night" onClick={relightAll}>
              <Flame size={16} strokeWidth={1.8} aria-hidden="true" />
              {cake.relightLabel}
            </button>
          ) : null}
        </div>
      </div>

      <AnimatePresence>
        {allOut ? (
          <motion.div
            className="cake__wish"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 34, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.2 : 1.15, ease: EASE, delay: reduced ? 0 : 0.25 }}
          >
            <span className="cake__wish-glow" aria-hidden="true" />
            <Stagger as="div" className="cake__wish-inner" step={0.16} delay={0.1}>
              <StaggerItem as="h3" className="cake__wish-headline">
                {interpolate(cake.headline)}
              </StaggerItem>
              <StaggerItem as="p" className="cake__wish-message">
                {interpolate(cake.message)}
              </StaggerItem>
            </Stagger>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </SectionShell>
  );
}

export default CakeSection;
