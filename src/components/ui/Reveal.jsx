import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js';
import './reveal.css';

export const EASE = [0.16, 1, 0.3, 1];

/**
 * The house animation: rise + soften + settle, triggered as the element enters
 * the viewport. With "reduce motion" on, it renders plain markup — no
 * transforms, no fades, nothing to sit and wait for.
 */
export function Reveal({
  as = 'div',
  children,
  delay = 0,
  y = 26,
  blur = 6,
  once = true,
  inView = true,
  className,
  ...rest
}) {
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    const Tag = as;
    return (
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    );
  }

  const Tag = motion[as] || motion.div;

  return (
    <Tag
      className={className}
      variants={{
        hidden: { opacity: 0, y, filter: `blur(${blur}px)` },
        show: {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: { duration: 0.95, ease: EASE, delay },
        },
      }}
      {...(inView
        ? {
            initial: 'hidden',
            whileInView: 'show',
            viewport: { once, margin: '0px 0px -8% 0px' },
          }
        : { initial: 'hidden', animate: 'show' })}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * Word-by-word cinematic reveal for the big lines. The animated copy is hidden
 * from assistive tech and the real sentence is right next to it, so nothing is
 * ever lost — only staged.
 */
export function RevealWords({ text = '', className = '', step = 0.055, delay = 0 }) {
  const reduced = usePrefersReducedMotion();
  const words = String(text).split(' ');

  if (reduced) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={`${className} reveal-words`}>
      <span className="sr-only">{text}</span>
      <motion.span
        className="reveal-words__line"
        aria-hidden="true"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '0px 0px -6% 0px' }}
        variants={{
          show: { transition: { staggerChildren: step, delayChildren: delay } },
        }}
      >
        {words.map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            className="word"
            variants={{
              hidden: { opacity: 0, y: '0.45em', filter: 'blur(6px)' },
              show: {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                transition: { duration: 0.9, ease: EASE },
              },
            }}
          >
            {word}
            {index < words.length - 1 ? ' ' : ''}
          </motion.span>
        ))}
      </motion.span>
    </span>
  );
}

export default Reveal;
