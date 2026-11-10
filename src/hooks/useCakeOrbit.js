import { useCallback, useEffect, useRef, useState } from 'react';
import { clamp } from '../utils/text.js';

/**
 * Drag-to-turn a CSS-3D object, with weight.
 *
 * Everything is written straight to CSS custom properties on the stage element
 * inside one rAF loop — React never re-renders while the cake spins, which is
 * the difference between a 3D cake and a janky one on a mid-range phone.
 *
 *   · drag with a finger or a mouse to orbit (horizontal = yaw, vertical = tilt)
 *   · let go and it keeps turning, then settles (inertia, then ease to rest)
 *   · nothing pressed: a slow idle drift, off entirely for reduced motion
 *   · keyboard: ← → nudge the yaw, ↑ ↓ the tilt (Alt is left alone — that is the
 *     chapter shortcut)
 *
 * The tilt is clamped so she can never flip the cake and see under the plate.
 */
const TILT_MIN = 6;
const TILT_MAX = 52;
const IDLE_SPEED = 0.014; // deg per ms — one turn in ~7 hours of staring
const SETTLE_SPEED = 3.6; // deg per ms of easing toward the target
const FRICTION = 0.94;

export function useCakeOrbit({ reduced = false, initialYaw = -14, initialTilt = 22 } = {}) {
  const stageRef = useRef(null);
  const state = useRef({
    yaw: initialYaw,
    tilt: initialTilt,
    targetYaw: initialYaw,
    targetTilt: initialTilt,
    velocity: 0,
    dragging: false,
    lastX: 0,
    lastY: 0,
    lastTime: 0,
    frame: 0,
  });
  const [dragging, setDragging] = useState(false);

  const paint = useCallback(() => {
    const node = stageRef.current;
    if (!node) return;
    const s = state.current;
    node.style.setProperty('--yaw', `${s.yaw.toFixed(2)}deg`);
    node.style.setProperty('--tilt', `${s.tilt.toFixed(2)}deg`);
  }, []);

  // The loop only runs while something is moving; it parks itself afterwards.
  const run = useCallback(() => {
    const s = state.current;
    if (s.frame) return;
    if (typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function') return;

    let previous = performance.now();

    const tick = (now) => {
      const delta = Math.min(64, now - previous);
      previous = now;
      let moving = false;

      if (!s.dragging) {
        // inertia: a flick keeps spinning, then hands over to the settle
        if (Math.abs(s.velocity) > 0.002) {
          s.targetYaw += s.velocity * delta;
          s.velocity *= FRICTION;
          moving = true;
        } else if (!reduced) {
          s.targetYaw += IDLE_SPEED * delta;
          moving = true;
        }

        if (s.velocity !== 0 && Math.abs(s.velocity) <= 0.002) s.velocity = 0;
      }

      const dyaw = s.targetYaw - s.yaw;
      const dtilt = s.targetTilt - s.tilt;
      if (Math.abs(dyaw) > 0.02 || Math.abs(dtilt) > 0.02) {
        s.yaw += dyaw * Math.min(1, (SETTLE_SPEED * delta) / 100);
        s.tilt += dtilt * Math.min(1, (SETTLE_SPEED * delta) / 100);
        moving = true;
      } else {
        s.yaw = s.targetYaw;
        s.tilt = s.targetTilt;
      }

      paint();

      if (moving || s.dragging) {
        s.frame = window.requestAnimationFrame(tick);
      } else {
        s.frame = 0;
      }
    };

    s.frame = window.requestAnimationFrame(tick);
  }, [paint, reduced]);

  useEffect(() => {
    run();
    return () => {
      const s = state.current;
      if (s.frame && typeof window !== 'undefined') window.cancelAnimationFrame(s.frame);
      s.frame = 0;
    };
  }, [run]);

  const onPointerDown = useCallback(
    (event) => {
      // Middle/right button and anything inside a control are none of our business.
      if (event.button != null && event.button !== 0) return;
      if (event.target instanceof Element && event.target.closest('button, a, input')) return;
      const s = state.current;
      s.dragging = true;
      s.velocity = 0;
      s.lastX = event.clientX;
      s.lastY = event.clientY;
      s.lastTime = event.timeStamp || 0;
      setDragging(true);
      event.currentTarget.setPointerCapture?.(event.pointerId);
      run();
    },
    [run],
  );

  const onPointerMove = useCallback((event) => {
    const s = state.current;
    if (!s.dragging) return;
    const now = event.timeStamp || 0;
    const dx = event.clientX - s.lastX;
    const dy = event.clientY - s.lastY;
    const dt = Math.max(8, now - (s.lastTime || now));

    s.targetYaw += dx * 0.42;
    s.targetTilt = clamp(s.targetTilt - dy * 0.22, TILT_MIN, TILT_MAX);
    s.velocity = clamp((dx * 0.42) / dt, -0.9, 0.9);

    s.lastX = event.clientX;
    s.lastY = event.clientY;
    s.lastTime = now;
  }, []);

  const stop = useCallback(
    (event) => {
      const s = state.current;
      if (!s.dragging) return;
      s.dragging = false;
      setDragging(false);
      event?.currentTarget?.releasePointerCapture?.(event.pointerId);
      run();
    },
    [run],
  );

  const onKeyDown = useCallback(
    (event) => {
      if (event.altKey || event.metaKey || event.ctrlKey) return;
      const keys = { ArrowLeft: 1, ArrowRight: -1, ArrowUp: 2, ArrowDown: -2 };
      const which = keys[event.key];
      if (!which) return;
      const s = state.current;
      event.preventDefault();
      s.velocity = 0;
      if (which === 1 || which === -1) s.targetYaw += which * 24;
      else s.targetTilt = clamp(s.targetTilt + which * 7, TILT_MIN, TILT_MAX);
      run();
    },
    [run],
  );

  return {
    stageRef,
    dragging,
    /** `spin` tells CSS (and the tests) whether the unattended drift is allowed. */
    spin: !reduced,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: stop,
      onPointerCancel: stop,
      onLostPointerCapture: stop,
      onKeyDown,
    },
  };
}

export default useCakeOrbit;
