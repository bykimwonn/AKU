import { motion, useScroll, useSpring } from 'framer-motion';
import './chrome.css';

/** A single hairline of gold across the top: how far through the experience she is. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  return (
    <motion.div
      className="progress"
      style={{ scaleX }}
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    />
  );
}

export default ScrollProgress;
