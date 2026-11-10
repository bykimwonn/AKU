import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion.js';
import { Heart, Sparkles, Lock } from 'lucide-react';
import { interpolate } from '../../../utils/text.js';
import { EASE } from '../../ui/Reveal.jsx';
import { Stagger, StaggerItem } from '../../ui/Stagger.jsx';
import './gifts.css';

/** Which of the three reveal effects this gift uses. */
function revealFor(gift, index) {
  if (gift?.reveal) return gift.reveal;
  return ['lines', 'unfold', 'sparks'][index % 3];
}

const ICONS = {
  lines: Heart,
  unfold: Lock,
  sparks: Sparkles,
};

/**
 * The message inside a gift. Same words, three different arrivals:
 *
 *   'lines'   — the appreciation writes itself out, line by line
 *   'unfold'  — the secret unfolds like a note that had been folded small
 *   'sparks'  — the wishes drift up as if they had just been made
 */
export function GiftReveal({ gift, index = 0 }) {
  const reduced = usePrefersReducedMotion();
  const variant = revealFor(gift, index);
  const Icon = ICONS[variant] || Heart;
  const paragraphs = (gift.paragraphs || [])
    .map((line) => interpolate(line))
    .filter(Boolean);

  if (variant === 'unfold') {
    return (
      <div className="gift-note">
        <motion.div
          className="gift-note__fold"
          initial={reduced ? false : { rotateX: -88, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          transition={{ duration: reduced ? 0 : 1.05, ease: EASE }}
        >
          <span className="gift-note__crease" aria-hidden="true" />
          <span className="gift-note__crease gift-note__crease--second" aria-hidden="true" />

          <p className="gift-note__eyebrow">
            <Icon size={14} strokeWidth={1.7} aria-hidden="true" />
            {interpolate(gift.kicker)}
          </p>

          {paragraphs.map((line, i) => (
            <motion.p
              key={`line-${i}`}
              className="gift-note__line"
              initial={reduced ? false : { opacity: 0, y: 14, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.85, ease: EASE, delay: reduced ? 0 : 0.35 + i * 0.18 }}
            >
              {line}
            </motion.p>
          ))}
        </motion.div>
      </div>
    );
  }

  if (variant === 'sparks') {
    return (
      <div className="gift-wishes">
        {!reduced ? (
          <span className="gift-wishes__sparks" aria-hidden="true">
            {Array.from({ length: 10 }, (_, i) => (
              <motion.i
                key={`spark-${i}`}
                initial={{ opacity: 0, y: 26, scale: 0.4 }}
                animate={{ opacity: [0, 1, 0], y: -34 - (i % 4) * 16, scale: [0.4, 1, 0.3] }}
                transition={{
                  duration: 2.6 + (i % 5) * 0.4,
                  delay: 0.2 + i * 0.22,
                  repeat: Infinity,
                  repeatDelay: 1.6 + (i % 3) * 0.5,
                  ease: 'easeOut',
                }}
                style={{ insetInlineStart: `${6 + i * 9.3}%` }}
              />
            ))}
          </span>
        ) : null}

        <p className="gift-wishes__eyebrow">
          <Icon size={14} strokeWidth={1.7} aria-hidden="true" />
          {interpolate(gift.kicker)}
        </p>

        <Stagger as="ul" className="gift-wishes__list" step={0.14}>
          {paragraphs.map((line, i) => (
            <StaggerItem as="li" key={`wish-${i}`} className="gift-wishes__item">
              <span className="gift-wishes__bullet" aria-hidden="true" />
              <span>{line}</span>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    );
  }

  /* 'lines' — the default, and the one used for appreciation */
  return (
    <div className="gift-lines">
      <p className="gift-lines__eyebrow">
        <Icon size={14} strokeWidth={1.7} aria-hidden="true" />
        {interpolate(gift.kicker)}
      </p>

      <Stagger className="gift-lines__flow" step={0.16} delay={0.1}>
        {paragraphs.map((line, i) => (
          <StaggerItem as="p" key={`para-${i}`} className="gift-lines__text" y={16}>
            {line}
            <motion.span
              className="gift-lines__rule"
              aria-hidden="true"
              initial={reduced ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: reduced ? 0 : 1.1, ease: EASE, delay: reduced ? 0 : 0.4 + i * 0.16 }}
            />
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}

export default GiftReveal;
