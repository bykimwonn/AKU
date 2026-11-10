import { useRef } from 'react';
import { useCanvasLayer } from '../../hooks/useCanvasLayer.js';
import './starfield.css';

/**
 * The night behind the opening screen: a fixed canvas of twinkling stars,
 * a few drifting motes of light, and a rare meteor. All drawn in 2D canvas, so
 * it costs almost nothing and never triggers layout.
 */
export function Starfield({ intensity = 1, className = '', ...rest }) {
  const ref = useRef(null);

  const setup = (width, height) => {
    const area = width * height;
    const count = Math.round(Math.min(230, Math.max(70, area / 8200)) * intensity);
    const stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.25 + 0.35,
      twinkle: 0.35 + Math.random() * 1.15,
      phase: Math.random() * Math.PI * 2,
      hue: Math.random(),
      drift: Math.random() * 3.5 + 0.6,
    }));

    const motes = Array.from({ length: Math.round(count / 9) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 16 + 8,
      speed: Math.random() * 9 + 4,
      sway: Math.random() * 0.6 + 0.18,
      phase: Math.random() * Math.PI * 2,
      alpha: Math.random() * 0.1 + 0.035,
    }));

    return { stars, motes, meteor: null, nextMeteor: 4 + Math.random() * 8 };
  };

  const frame = (ctx, width, height, state, t, dt) => {
    if (!state) return;
    ctx.globalCompositeOperation = 'lighter';

    // ── far glow: two enormous, barely-there nebulae
    for (const mote of state.motes) {
      mote.y -= mote.speed * dt;
      if (mote.y < -mote.r * 3) mote.y = height + mote.r * 3;
      const x = mote.x + Math.sin(t * mote.sway + mote.phase) * 26;
      const gradient = ctx.createRadialGradient(x, mote.y, 0, x, mote.y, mote.r * 3.4);
      gradient.addColorStop(0, `rgba(216, 183, 122, ${mote.alpha * 1.5})`);
      gradient.addColorStop(0.45, `rgba(235, 198, 211, ${mote.alpha * 0.6})`);
      gradient.addColorStop(1, 'rgba(235, 198, 211, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, mote.y, mote.r * 3.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── stars
    for (const star of state.stars) {
      const twinkle = 0.55 + 0.45 * Math.sin(t * star.twinkle + star.phase);
      const alpha = 0.22 + twinkle * 0.7;
      const color =
        star.hue > 0.72
          ? `rgba(216, 183, 122, ${alpha})`
          : star.hue > 0.34
            ? `rgba(255, 253, 252, ${alpha})`
            : `rgba(235, 198, 211, ${alpha})`;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r * (0.85 + twinkle * 0.35), 0, Math.PI * 2);
      ctx.fill();

      if (star.r > 1.15 && twinkle > 0.86) {
        ctx.strokeStyle = `rgba(255, 253, 252, ${alpha * 0.35})`;
        ctx.lineWidth = 0.7;
        const span = star.r * 5.5;
        ctx.beginPath();
        ctx.moveTo(star.x - span, star.y);
        ctx.lineTo(star.x + span, star.y);
        ctx.moveTo(star.x, star.y - span);
        ctx.lineTo(star.x, star.y + span);
        ctx.stroke();
      }
    }

    // ── one meteor at a time, rarely
    state.nextMeteor -= dt;
    if (!state.meteor && state.nextMeteor <= 0) {
      state.meteor = {
        x: Math.random() * width * 0.7 + width * 0.15,
        y: -40,
        vx: -(120 + Math.random() * 90),
        vy: 260 + Math.random() * 120,
        life: 1,
      };
    }
    if (state.meteor) {
      const m = state.meteor;
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      m.life -= dt * 0.5;
      if (m.life <= 0 || m.y > height + 60) {
        state.meteor = null;
        state.nextMeteor = 9 + Math.random() * 14;
      } else {
        const tailX = m.x - m.vx * 0.1;
        const tailY = m.y - m.vy * 0.1;
        const gradient = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        gradient.addColorStop(0, `rgba(255, 253, 252, ${0.55 * m.life})`);
        gradient.addColorStop(1, 'rgba(255, 253, 252, 0)');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
      }
    }

    ctx.globalCompositeOperation = 'source-over';
  };

  return (
    <canvas
      ref={ref}
      className={`starfield ${className}`.trim()}
      aria-hidden="true"
      {...rest}
    />
  );
}

export default Starfield;
