import { describe, expect, it } from 'vitest';
import {
  LAYOUT,
  brightestStrip,
  candleRing,
  cylinderStrips,
  ringPositions,
  sortByDepth,
  stripWidthCoefficient,
} from '../src/components/sections/cake/cake3d.js';

/**
 * The cake is built from maths rather than a picture, so the maths is the part
 * worth pinning down: a wall of strips that reads as a cylinder, and a layout
 * where the tiers and the candles agree on where the icing surface is.
 */
/** Angle between two directions: 0 = the same way, 180 = opposite. */
const circDist = (a, b) => Math.abs((((a - b + 540) % 360) - 180));

describe('the cake geometry', () => {
  it('makes every strip exactly as wide as it needs to be', () => {
    // 2πr / n — the ring of strips has to close on itself without gaps.
    expect(stripWidthCoefficient(20)).toBeCloseTo((2 * Math.PI) / 20, 6);
    expect(stripWidthCoefficient(1)).toBe(stripWidthCoefficient(3)); // never divide by ~0
  });

  it('wraps the wall evenly and never leaves a face black', () => {
    const strips = cylinderStrips({ count: 24, height: 0.66, lightDeg: -34, lift: 0.34, range: 0.66 });
    expect(strips).toHaveLength(24);

    const step = 360 / 24;
    strips.forEach((strip, index) => {
      expect(strip.angle).toBeCloseTo(index * step - 90, 6);
      expect(strip.brightness).toBeGreaterThanOrEqual(0.34);
      expect(strip.brightness).toBeLessThanOrEqual(1);
      expect(strip.style['--a']).toBe(`${strip.angle.toFixed(2)}deg`);
    });

    // the brightest face is the one the key light is aimed at
    const lit = brightestStrip(strips);
    expect(circDist(lit.angle, -34)).toBeLessThanOrEqual(step / 2);
    expect(lit.brightness).toBeGreaterThan(0.95);

    // everything more than a quarter turn away is held at the lift — one flat,
    // dim hemisphere, never a black hole on a dark stage
    const back = strips.filter((strip) => circDist(strip.angle, -34) > 90 + step / 2);
    expect(back.length).toBeGreaterThanOrEqual(10);
    back.forEach((strip) => expect(strip.brightness).toBe(0.34));

    // and the shading is mirror-symmetric about the light, which is what makes
    // the ring of strips read as a round object rather than a fan of cards
    const byAngle = new Map(strips.map((strip) => [Number(strip.angle.toFixed(2)), strip.brightness]));
    strips.forEach((strip) => {
      const twin = Number((2 * -34 - strip.angle).toFixed(2));
      const value = byAngle.get(twin) ?? byAngle.get(Number((twin + 360).toFixed(2)));
      if (value !== undefined) expect(strip.brightness).toBeCloseTo(value, 3);
    });
  });

  it('is symmetric about the light, which is what makes it read as round', () => {
    const strips = cylinderStrips({ count: 16, lightDeg: 0 });
    const byAngle = new Map(strips.map((s) => [Number(s.angle.toFixed(2)), s.brightness]));
    const pairs = [...byAngle.entries()].filter(([angle]) => angle > -90);
    pairs.forEach(([angle, brightness]) => {
      const mirrored = Number((angle + 180 + 180).toFixed(2)) % 360;
      const twin = byAngle.get(mirrored) ?? byAngle.get(mirrored - 360);
      if (twin !== undefined && Math.abs(mirrored - angle) > 0.01) {
        // opposite sides of the light differ, adjacent pairs do not blow up
        expect(brightness).toBeGreaterThanOrEqual(0.34);
      }
    });

    // facing the viewer is +1, facing away is -1
    const front = strips.find((s) => Math.abs(s.facing - 1) < 0.2);
    expect(front).toBeTruthy();
  });

  it('spreads a full ring evenly but an arc edge to edge', () => {
    const full = ringPositions({ count: 6, radius: 1, arc: 360 });
    const steps = full.slice(1).map((item, index) => item.angle - full[index].angle);
    steps.forEach((delta) => expect(delta).toBeCloseTo(60, 6));

    const arc = ringPositions({ count: 3, radius: 1, arc: 120 });
    expect(arc[0].angle).toBeCloseTo(-90 - 60, 6);
    expect(arc[2].angle).toBeCloseTo(-90 + 60, 6);
    expect(arc[1].angle).toBeCloseTo(-90, 6);
  });

  it('puts every candle on the icing, at the same height, none on top of another', () => {
    const ring = candleRing(5, { radius: LAYOUT.candles.r, y: LAYOUT.candles.base });
    expect(ring).toHaveLength(5);
    expect(new Set(ring.map((c) => c.angle.toFixed(3))).size).toBe(5);
    ring.forEach((candle) => {
      expect(candle.radius).toBe(LAYOUT.candles.r);
      expect(candle.y).toBe(LAYOUT.candles.base);
      expect(Math.hypot(candle.sin, candle.cos)).toBeCloseTo(1, 6);
    });
  });

  it('keeps the tiers and the candles in agreement', () => {
    // the top tier stands exactly on the bottom one…
    expect(LAYOUT.bottom.base + LAYOUT.bottom.h).toBeCloseTo(LAYOUT.top.base, 6);
    // …and the candles stand exactly on the top one's icing
    expect(LAYOUT.top.base + LAYOUT.top.h).toBeCloseTo(LAYOUT.candles.base, 6);
    // the plate is wider than the cake, or it would look like it floats
    expect(LAYOUT.plate.r).toBeGreaterThan(LAYOUT.bottom.r);
    // candles must sit inside the top tier's rim, not on its edge
    expect(LAYOUT.candles.r).toBeLessThan(LAYOUT.top.r);
  });

  it('sorts back-to-front for anything that needs painting in order', () => {
    const items = ringPositions({ count: 4, radius: 1, arc: 360 });
    const sorted = sortByDepth(items);
    expect(sorted[0].cos).toBeLessThanOrEqual(sorted.at(-1).cos);
    // the input is left alone — the ring is reused by more than one caller
    expect(items.map((item) => item.index)).toEqual([0, 1, 2, 3]);
  });
});
