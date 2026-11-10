import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../utils/text.js';

/**
 * Shared plumbing for the decorative canvases (stars, petals, sparks).
 *
 *  setup(width, height, previousState) → state   (re-run on resize)
 *  frame(ctx, width, height, state, seconds, delta)
 *
 * Handles device-pixel-ratio, resizing, pausing when the tab is hidden and —
 * importantly — honouring "reduce motion": in that mode a single still frame is
 * painted and no animation loop is started at all.
 */
export function useCanvasLayer(canvasRef, { setup, frame, enabled = true }) {
  const stateRef = useRef(null);
  const frameRef = useRef(frame);
  const setupRef = useRef(setup);

  frameRef.current = frame;
  setupRef.current = setup;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const reduced = prefersReducedMotion();
    let width = 0;
    let height = 0;
    let raf = 0;
    let last = 0;
    let elapsed = 0;
    let stopped = false;

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width || window.innerWidth));
      height = Math.max(1, Math.round(rect.height || window.innerHeight));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const build = () => {
      stateRef.current = setupRef.current?.(width, height, stateRef.current) ?? null;
    };

    const paint = (delta) => {
      ctx.clearRect(0, 0, width, height);
      frameRef.current?.(ctx, width, height, stateRef.current, elapsed, delta);
    };

    const loop = (now) => {
      if (stopped) return;
      const delta = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
      last = now;
      elapsed += delta;
      paint(delta);
      raf = window.requestAnimationFrame(loop);
    };

    const start = () => {
      if (reduced) return;
      if (raf) return;
      last = 0;
      raf = window.requestAnimationFrame(loop);
    };

    const stop = () => {
      if (!raf) return;
      window.cancelAnimationFrame(raf);
      raf = 0;
    };

    const resize = () => {
      size();
      build();
      paint(0);
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    size();
    build();
    paint(0); // one frame immediately, so nothing is ever blank
    if (!reduced) start();

    const observer =
      typeof ResizeObserver === 'function'
        ? new ResizeObserver(() => resize())
        : null;
    observer?.observe(canvas);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stopped = true;
      stop();
      observer?.disconnect();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [canvasRef, enabled]);
}

export default useCanvasLayer;
