import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js';
import { EASE } from './Reveal.jsx';

/**
 * A short staged entrance for content that is already on screen (inside an
 * overlay). Children fade up in sequence; with reduced motion they simply
 * appear. Unlike Reveal, this never waits on scroll — nothing can get stuck
 * invisible behind an overlay.
 */
export function Stagger({
  as = 'div',
  children,
  step = 0.11,
  delay = 0.05,
  className = '',
  ...rest
}) {
  const reduced = usePrefersReducedMotion();
  const Tag = reduced ? as : motion[as] || motion.div;

  if (reduced) {
    return (
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      className={className}
      variants={{ visible: { transition: { staggerChildren: step, delayChildren: delay } } }}
      initial="hidden"
      animate="visible"
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function StaggerItem({ as = 'div', children, y = 18, className = '', ...rest }) {
  const reduced = usePrefersReducedMotion();
  const Tag = reduced ? as : motion[as] || motion.div;

  if (reduced) {
    return (
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      className={className}
      variants={{
        hidden: { opacity: 0, y, filter: 'blur(5px)' },
        visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: EASE } },
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default Stagger;
