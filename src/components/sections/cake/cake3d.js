/**
 * Geometry for the 3D cake — pure maths, no DOM, so it can be tested on its own.
 *
 * The cake is built the way a CSS 3D cylinder has to be built: a ring of thin
 * vertical strips, each rotated to its angle and pushed out by the radius, plus a
 * foreshortened disc for the top face. Nothing here knows about pixels — every
 * value is either an angle or a coefficient that CSS multiplies by its own size
 * variable, which is what lets the cake scale from a 360px phone to a 1600px
 * desktop without a single media query in the geometry.
 */

const DEG = 180 / Math.PI;

/**
 * The cake's proportions, in one place, as multiples of a single CSS unit
 * (`--u`). Every number is a coefficient, never a pixel: the CSS multiplies it
 * by the unit, so the cake scales from a 360px phone to a desktop without the
 * geometry knowing anything about the viewport. `base` is how far above the
 * floor each piece stands, so the top tier and the candles agree on where the
 * icing surface is.
 */
export const LAYOUT = {
  bottom: { r: 1.02, h: 0.66, base: 0, strips: 24, drips: 13, frost: '#e9c1d0', sponge: '#3d1828' },
  top: { r: 0.7, h: 0.52, base: 0.66, strips: 20, drips: 10, frost: '#f2d3de', sponge: '#4a2033' },
  plate: { r: 1.34 },
  /** Candles stand on the top tier, inside the frosting. */
  candles: { r: 0.44, base: 1.18, height: 0.4 },
};

/** Round a strip's width as a fraction of `radius × 2π / count`, plus overlap. */
export function stripWidthCoefficient(count) {
  return (2 * Math.PI) / Math.max(3, count);
}

/**
 * The strips making up a cylinder wall.
 *
 * `lightDeg` is where the key light sits, in the cake's own frame. Brightness is
 * Lambert-style (cos of the angle to the light), lifted so no face ever goes
 * black — a black face on a dark stage reads as a hole, not as shadow.
 *
 * Strips are cut `seamGap` narrower than the ideal arc: enough for the facets to
 * read as facets (that is what sells the rotation) and not so much that the
 * cake turns into a picket fence.
 */
export function cylinderStrips({ count = 20, lightDeg = -38, lift = 0.34, range = 0.66, seamGap = 0.03 } = {}) {
  const n = Math.max(3, Math.round(count));
  const step = 360 / n;
  const width = stripWidthCoefficient(n) * (1 - seamGap);
  const strips = [];

  for (let i = 0; i < n; i += 1) {
    // Centre of the strip; -90° puts strip 0 facing the viewer.
    const angle = i * step - 90;
    const lambert = Math.max(0, Math.cos((angle - lightDeg) / DEG));
    const brightness = Number((lift + range * lambert).toFixed(3));
    const facing = Math.cos(angle / DEG); // 1 = toward the viewer
    strips.push({
      key: `s${i}`,
      index: i,
      angle,
      step,
      brightness,
      facing: Number(facing.toFixed(3)),
      /**
       * CSS only: the strip places and lights itself with these, while the size
       * (--r/--h) is inherited from its tier. Deliberately no `--h` here — a
       * unitless number in a custom property would silently invalidate
       * `height: var(--h)` on the strip and collapse the whole wall.
       */
      style: {
        '--a': `${angle.toFixed(2)}deg`,
        '--sw': width.toFixed(5),
        '--lit': brightness.toFixed(3),
      },
    });
  }

  return strips;
}

/**
 * Things that sit *around* the cake at a given height: drips, sprinkles, candles.
 * `arc` limits them to the front (drips all the way round, candles spread out).
 */
export function ringPositions({ count = 6, radius = 1, y = 0, arc = 360, offsetDeg = 0 } = {}) {
  const n = Math.max(1, Math.round(count));
  const span = Math.min(360, Math.max(1, arc));
  const step = span >= 360 ? 360 / n : span / Math.max(1, n - 1);
  const start = offsetDeg - span / 2;
  const items = [];

  for (let i = 0; i < n; i += 1) {
    const angle = (span >= 360 ? start + i * step : start + i * step) - 90;
    const radians = angle / DEG;
    items.push({
      key: `r${i}`,
      index: i,
      angle,
      /** how much of the ring radius this item sits out at, as a coefficient */
      radius,
      y,
      sin: Math.sin(radians),
      cos: Math.cos(radians),
      facing: Math.cos(radians),
    });
  }

  return items;
}

/**
 * Candles are placed on the top tier, spread across the whole ring so turning the
 * cake reveals the ones on the far side (they stay clickable: the geometry never
 * eats a click). `arc < 360` would hide some behind the cake forever, so we don't.
 */
export function candleRing(count, { radius = 0.58, y = 1, offsetDeg = 0 } = {}) {
  return ringPositions({ count, radius, y, arc: 360, offsetDeg });
}

/** Painter's order for anything that must be DOM-sorted (fallbacks, tests). */
export function sortByDepth(items) {
  return [...items].sort((a, b) => a.cos - b.cos);
}

/** Where the key light should sit for a strip to be at its brightest. */
export function brightestStrip(strips) {
  return strips.reduce((best, strip) => (strip.brightness > best.brightness ? strip : best), strips[0]);
}

export default { LAYOUT, cylinderStrips, ringPositions, candleRing, sortByDepth, stripWidthCoefficient };
