import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion.js';
import { ArrowRight, MailOpen } from 'lucide-react';
import siteConfig from '../../../config/site.config.js';
import { interpolate } from '../../../utils/text.js';
import { SectionShell } from '../../ui/SectionShell.jsx';
import { Overlay } from '../../ui/Overlay.jsx';
import { EASE, Reveal } from '../../ui/Reveal.jsx';
import { Stagger, StaggerItem } from '../../ui/Stagger.jsx';
import { Signature } from '../../ui/Signature.jsx';
import './envelope.css';

/**
 * SECTION 2 — the envelope.
 *
 * A sealed letter that really opens: the wax seal cracks away, the flap swings
 * back in 3D, the page lifts out of the pocket — and then the letter unfolds
 * into something comfortable to read on any screen.
 */
export function EnvelopeSection({ onJump }) {
  const reduced = usePrefersReducedMotion();
  const envelope = siteConfig.envelope;
  const recipient = siteConfig.recipient;

  // 'sealed' → 'opening' (animation) → 'open'. The overlay is separate, so
  // closing the letter can never leave the visitor staring at a locked flap.
  const [phase, setPhase] = useState('sealed');
  const [letterOpen, setLetterOpen] = useState(false);
  const timerRef = useRef(0);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const revealLetter = useCallback(() => {
    setPhase('open');
    setLetterOpen(true);
  }, []);

  const handleClick = useCallback(() => {
    if (phase !== 'sealed') {
      setLetterOpen(true);
      return;
    }
    if (reduced) {
      revealLetter();
      return;
    }
    setPhase('opening');
    // Even if the animation is interrupted, the letter still arrives.
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(revealLetter, 880);
  }, [phase, reduced, revealLetter]);

  const sealed = phase === 'sealed';

  return (
    <SectionShell
      id="envelope"
      tone="night"
      eyebrow={envelope.eyebrow}
      title={envelope.title}
      subtitle={envelope.subtitle}
      className="envelope-section"
    >
      <Reveal className="envelope-stage" y={34} blur={8}>
        <motion.button
          type="button"
          className={`envelope ${sealed ? '' : 'is-open'}`.trim()}
          onClick={handleClick}
          aria-label={
            sealed ? 'Open the envelope and read the letter' : 'Read the letter again'
          }
          whileHover={reduced ? undefined : { y: -6, scale: 1.012 }}
          whileTap={reduced ? undefined : { scale: 0.994 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <span className="envelope__aura" aria-hidden="true" />
          <span className="envelope__back" aria-hidden="true" />

          <motion.span
            className="envelope__letter"
            aria-hidden="true"
            initial={false}
            animate={sealed ? { y: '2%', scale: 1 } : { y: '-42%', scale: 1.03 }}
            transition={{ duration: reduced ? 0 : 0.8, ease: EASE, delay: reduced ? 0 : 0.1 }}
          >
            <span className="envelope__letter-greeting u-hand">
              {interpolate(envelope.greeting)}
            </span>
            <span className="envelope__letter-lines" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </motion.span>

          <span className="envelope__pocket" aria-hidden="true">
            <span className="envelope__fold envelope__fold--left" />
            <span className="envelope__fold envelope__fold--right" />
          </span>

          <motion.span
            className="envelope__flap"
            aria-hidden="true"
            initial={false}
            animate={{ rotateX: sealed ? 0 : -172 }}
            transition={{ duration: reduced ? 0 : 0.95, ease: EASE }}
          />

          <motion.span
            className="envelope__seal"
            aria-hidden="true"
            initial={false}
            animate={
              sealed
                ? { scale: 1, rotate: 0, opacity: 1 }
                : { scale: 0.35, rotate: -28, opacity: 0, y: 30 }
            }
            transition={{ duration: reduced ? 0 : 0.55, ease: 'easeIn' }}
          >
            <span className="envelope__seal-mark">{(recipient.name || 'A').charAt(0)}</span>
          </motion.span>
        </motion.button>

        <p className="envelope__cue">
          {sealed ? (
            <>
              <span className="envelope__cue-ring" aria-hidden="true" />
              Tap the seal
            </>
          ) : (
            <>
              <MailOpen size={15} strokeWidth={1.6} aria-hidden="true" />
              Opened — tap to read it again
            </>
          )}
        </p>
      </Reveal>

      <Overlay
        open={letterOpen}
        onClose={() => setLetterOpen(false)}
        tone="paper"
        size="content"
        eyebrow={envelope.eyebrow}
        title="The letter"
        closeLabel="Close the letter"
        footer={
          <>
            <span className="envelope__foot-note">There is more below.</span>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setLetterOpen(false);
                onJump?.('gallery');
              }}
            >
              Keep going
              <ArrowRight size={15} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </>
        }
      >
        <article className="letter">
          <Stagger className="letter__flow" step={0.1}>
            <StaggerItem as="p" className="letter__greeting u-hand">
              {interpolate(envelope.greeting)}
            </StaggerItem>

            {envelope.intro.map((line, index) => (
              <StaggerItem as="p" key={`intro-${index}`} className="letter__text letter__text--lead">
                {line}
              </StaggerItem>
            ))}

            <StaggerItem as="hr" className="u-hairline letter__rule" />

            {envelope.body.map((line, index) => (
              <StaggerItem as="p" key={`body-${index}`} className="letter__text">
                {line}
              </StaggerItem>
            ))}

            <StaggerItem as="p" className="letter__signoff">
              <span className="letter__signoff-line">{envelope.signOff}</span>
            </StaggerItem>

            <StaggerItem as="div">
              <Signature tone="paper" />
            </StaggerItem>
          </Stagger>
        </article>
      </Overlay>
    </SectionShell>
  );
}

export default EnvelopeSection;
