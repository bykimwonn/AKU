import { useMemo } from 'react';
import { LAYOUT, cylinderStrips, ringPositions } from './cake3d.js';
import './cake3d.css';

/** Deterministic wobble, so the icing drips are never machine-regular. */
function scatter(index, seed = 1) {
  const x = Math.sin((index + 1) * 12.9898 * seed) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * One cylinder: a ring of vertical strips, a top face, and — because it is a
 * cake — icing that drips over the front edge.
 *
 * No pixels are chosen here. `--r` (radius) and `--h` (height) are set in CSS off
 * a single `--u` unit, so the whole cake scales with the screen and the geometry
 * stays resolution-independent.
 */
function Tier({
  name,
  radius,
  height,
  base = 0,
  strips = 20,
  drips = 0,
  belt = false,
  frost,
  sponge,
  lightDeg = -34,
  children,
}) {
  // strips carry their own angle + lighting coefficients; see cake3d.js
  const walls = useMemo(() => cylinderStrips({ count: strips, lightDeg }), [strips, lightDeg]);

  const icing = useMemo(
    () =>
      drips
        ? ringPositions({ count: drips, radius: 1, arc: 360, offsetDeg: 0 }).map((item, index) => ({
            ...item,
            length: 0.5 + scatter(index, name.length) * 0.85,
            width: 0.72 + scatter(index, 3) * 0.5,
          }))
        : [],
    [drips, name],
  );

  return (
    <div
      className={`geo__tier geo__tier--${name} ${belt ? 'geo__tier--belt' : ''}`.trim()}
      // --frost/--sponge are the two colours every strip gradient mixes; giving
      // the tiers different ones is what makes them read as two flavours.
      style={{ '--r': radius, '--h': height, '--base': base, '--frost': frost, '--sponge': sponge }}
      data-tier={name}
    >
      {walls.map((strip) => (
        <span key={strip.key} className="geo__strip" style={strip.style} />
      ))}

      <span className="geo__cap">{children}</span>

      {icing.map((drip) => (
        <span
          key={drip.key}
          className="geo__drip"
          style={{
            '--a': `${drip.angle.toFixed(2)}deg`,
            '--len': drip.length.toFixed(3),
            '--w': drip.width.toFixed(3),
            '--shade': (0.1 + (1 - Math.max(0, drip.facing)) * 0.35).toFixed(3),
          }}
        />
      ))}
    </div>
  );
}

/**
 * The cake: a glass plate, a contact shadow on it, two burgundy tiers with blush
 * frosting, gold sprinkles lying on the icing, and a warm pool of candlelight
 * that fades as she blows the flames out.
 *
 * It is decoration, so the whole thing is aria-hidden — the candles are the
 * interactive part and they live beside this, as real buttons.
 */
export function CakeBody({ litCount = 0, total = 1, reduced = false }) {
  const glow = total > 0 ? Math.max(0, Math.min(1, litCount / total)) : 0;
  const sprinkles = useMemo(
    () =>
      ringPositions({ count: 14, radius: 0.86, arc: 360 }).map((item, index) => ({
        ...item,
        radius: 0.24 + scatter(index, 7) * 0.62,
        tone: scatter(index, 11) > 0.55 ? 'blush' : 'gold',
        size: 0.7 + scatter(index, 5) * 0.8,
      })),
    [],
  );

  return (
    <div
      className={`geo ${litCount > 0 ? 'is-lit' : 'is-resting'} ${reduced ? 'is-still' : ''}`.trim()}
      style={{ '--glow': glow.toFixed(3) }}
      aria-hidden="true"
    >
      <span className="geo__shadow" />

      <span className="geo__plate">
        <span className="geo__plate-rim" />
        <span className="geo__pool" />
      </span>

      <Tier
        name="bottom"
        radius={LAYOUT.bottom.r}
        height={LAYOUT.bottom.h}
        base={LAYOUT.bottom.base}
        strips={LAYOUT.bottom.strips}
        drips={LAYOUT.bottom.drips}
        frost={LAYOUT.bottom.frost}
        sponge={LAYOUT.bottom.sponge}
        belt
      />

      <Tier
        name="top"
        radius={LAYOUT.top.r}
        height={LAYOUT.top.h}
        base={LAYOUT.top.base}
        strips={LAYOUT.top.strips}
        drips={LAYOUT.top.drips}
        frost={LAYOUT.top.frost}
        sponge={LAYOUT.top.sponge}
      >
        {sprinkles.map((dot) => (
          <span
            key={dot.key}
            className={`geo__sprinkle geo__sprinkle--${dot.tone}`}
            style={{
              '--px': (dot.sin * dot.radius).toFixed(4),
              '--py': (dot.cos * dot.radius).toFixed(4),
              '--s': dot.size.toFixed(3),
              '--turn': `${(dot.angle * 2).toFixed(1)}deg`,
            }}
          />
        ))}
      </Tier>
    </div>
  );
}

export default CakeBody;
