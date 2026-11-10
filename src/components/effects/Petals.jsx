import { useRef } from 'react';
import { useCanvasLayer } from '../../hooks/useCanvasLayer.js';
import './petals.css';

const TONES = [
  [235, 198, 211], // blush
  [228, 170, 190], // deeper rose
  [248, 240, 235], // cream
  [216, 183, 122], // a single gold petal, occasionally
];

function petalPath(ctx, size) {
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.bezierCurveTo(size * 0.82, -size * 0.7, size * 0.98, size * 0.42, 0, size * 1.06);
  ctx.bezierCurveTo(-size * 0.98, size * 0.42, -size * 0.82, -size * 0.7, 0, -size);
  ctx.closePath();
}

/**
 * Rose petals falling over the whole experience. Purely decorative, so it is
 * aria-hidden, pointer-events none, and it stops entirely when the visitor has
 * asked for reduced motion (see useCanvasLayer).
 */
export function Petals({ density = 1, className = '' }) {
  const ref = useRef(null);

  const makePetal = (width, height, { seedling = false } = {}) => {
    const depth = 0.42 + Math.random() * 0.58;
    const tone = TONES[Math.floor(Math.random() * (Math.random() < 0.09 ? TONES.length : 3))];
    return {
      x: Math.random() * width,
      y: seedling ? Math.random() * height : -40 - Math.random() * height * 0.4,
      size: (7 + Math.random() * 11) * depth,
      depth,
      vy: (16 + Math.random() * 26) * depth,
      vx: (Math.random() - 0.5) * 12,
      spin: (Math.random() - 0.5) * 1.1,
      angle: Math.random() * Math.PI * 2,
      sway: 0.5 + Math.random() * 0.9,
      swayPhase: Math.random() * Math.PI * 2,
      swayAmp: 14 + Math.random() * 26,
      alpha: 0.28 + depth * 0.5,
      tone,
    };
  };

  const setup = (width, height) => {
    const count = Math.round(Math.min(34, Math.max(10, (width * height) / 58000)) * density);
    return { petals: Array.from({ length: count }, () => makePetal(width, height, { seedling: true })) };
  };

  const frame = (ctx, width, height, state, t, dt) => {
    if (!state) return;
    for (const petal of state.petals) {
      petal.y += petal.vy * dt;
      petal.x += (petal.vx + Math.sin(t * petal.sway + petal.swayPhase) * petal.swayAmp * 0.35) * dt;
      petal.angle += petal.spin * dt;

      if (petal.y - petal.size > height) {
        Object.assign(petal, makePetal(width, height));
        continue;
      }
      if (petal.x < -60) petal.x = width + 40;
      if (petal.x > width + 60) petal.x = -40;

      const flip = Math.cos(t * petal.sway * 0.8 + petal.swayPhase);
      const [r, g, b] = petal.tone;

      ctx.save();
      ctx.translate(petal.x, petal.y);
      ctx.rotate(petal.angle);
      ctx.scale(Math.max(0.22, Math.abs(flip)), 1);

      const gradient = ctx.createLinearGradient(0, -petal.size, 0, petal.size);
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${petal.alpha})`);
      gradient.addColorStop(1, `rgba(${Math.max(0, r - 46)}, ${Math.max(0, g - 58)}, ${Math.max(0, b - 44)}, ${petal.alpha * 0.72})`);

      ctx.fillStyle = gradient;
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${petal.alpha * 0.35})`;
      ctx.shadowBlur = 8 * petal.depth;
      petalPath(ctx, petal.size);
      ctx.fill();
      ctx.restore();
    }
  };

  return <canvas ref={ref} className={`petals ${className}`.trim()} aria-hidden="true" />;
}

export default Petals;
