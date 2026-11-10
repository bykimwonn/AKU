import './memory-art.css';

/**
 * Six original line drawings for the gallery frames.
 *
 * They exist so the gallery can be finished and personal without anybody's
 * photograph in it: each frame is a small hand-drawn scene plus one true
 * sentence. Everything is inline SVG (no image files, no network requests),
 * drawn on a 120 × 150 canvas so it fills the 4:5 frame exactly.
 *
 * Colour rule: `currentColor` follows the card's tone (set in CSS), while the
 * gold accents are fixed so every frame still reads as part of the same set.
 */

const GOLD = '#D8B77A';
const BLUSH = '#EBC6D3';
const CREAM = '#FFFDFC';

/* Sun coming up over still water: a half-disc, three arcs of light, two birds. */
function Dawn() {
  return (
    <>
      <circle cx="60" cy="88" r="17" fill={GOLD} opacity="0.34" />
      <circle cx="60" cy="88" r="11" fill={GOLD} opacity="0.5" />
      <path d="M34 88 A26 26 0 0 1 86 88" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
      <path d="M27 88 A33 33 0 0 1 93 88" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.32" />
      <path d="M20 88 A40 40 0 0 1 100 88" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.18" />
      <path d="M12 88 h96" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.72" />
      <g className="memory-art__drift">
        <path d="M24 99 h20 M52 106 h30 M36 114 h22 M70 121 h18" stroke={GOLD} strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      </g>
      <g className="memory-art__float">
        <path d="M30 42 q4-4 8 0 q4-4 8 0 M56 32 q3.4-3.4 6.8 0 q3.4-3.4 6.8 0" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      </g>
    </>
  );
}

/* Crescent moon over a low hill, with stars that keep twinkling. */
function Night() {
  return (
    <>
      <path
        d="M84 34 A19 19 0 1 0 84 72 A15 15 0 1 1 84 34 Z"
        fill={BLUSH}
        opacity="0.82"
      />
      <circle cx="79" cy="53" r="30" fill={BLUSH} opacity="0.07" />
      <g className="memory-art__twinkle" fill={CREAM}>
        <circle cx="30" cy="34" r="1.5" opacity="0.8" />
        <circle cx="46" cy="52" r="1.1" opacity="0.55" />
        <circle cx="24" cy="66" r="1.3" opacity="0.65" />
        <circle cx="60" cy="26" r="1" opacity="0.5" />
      </g>
      <path
        d="M38 24 l1.6 4.4 4.4 1.6 -4.4 1.6 -1.6 4.4 -1.6-4.4 -4.4-1.6 4.4-1.6 Z"
        fill={GOLD}
        opacity="0.72"
      />
      <path
        d="M8 118 q22-16 46-6 q20 8 44-4 v42 H8 Z"
        fill="currentColor"
        opacity="0.22"
      />
      <path d="M8 118 q22-16 46-6 q20 8 44-4" fill="none" stroke="currentColor" strokeWidth="1.3" opacity="0.6" />
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.62">
        <path d="M92 112 v-13" />
        <path d="M92 103 q-7-2-8-9 M92 105 q7-2 8-8" />
      </g>
    </>
  );
}

/* One flower opening out of hard ground — the set's quietest image. */
function Bloom() {
  const petals = [0, 72, 144, 216, 288];
  return (
    <>
      <g className="memory-art__sway">
        <path d="M60 130 C55 112 65 98 60 78" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        <path d="M59 112 q-15 2-19-10 q14-3 19 10 Z" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="0.9" />
        <path d="M61 100 q15 1 19-11 q-14-3-19 11 Z" fill="currentColor" opacity="0.24" stroke="currentColor" strokeWidth="0.9" />
        <g transform="translate(60 62)">
          {petals.map((angle) => (
            <ellipse
              key={angle}
              cx="0"
              cy="-15"
              rx="8.5"
              ry="15"
              transform={`rotate(${angle})`}
              fill="currentColor"
              fillOpacity="0.26"
              stroke="currentColor"
              strokeOpacity="0.72"
              strokeWidth="1.2"
            />
          ))}
          <circle r="5.5" fill={GOLD} opacity="0.85" />
        </g>
      </g>
      <path d="M40 133 h40" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.45" />
      <path d="M30 139 h60" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.22" />
    </>
  );
}

/* Three letters, tied with a ribbon — everything written but never posted. */
function Letters() {
  return (
    <>
      <g transform="rotate(-5 60 96)" opacity="0.5">
        <rect x="28" y="86" width="66" height="40" rx="2.5" fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="1.2" />
      </g>
      <g transform="rotate(3 60 88)" opacity="0.72">
        <rect x="26" y="76" width="70" height="42" rx="2.5" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.2" />
      </g>
      <g className="memory-art__lift">
        <rect x="24" y="60" width="72" height="46" rx="3" fill={CREAM} fillOpacity="0.14" stroke="currentColor" strokeWidth="1.5" />
        <path d="M24 62 L60 90 L96 62" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" opacity="0.8" />
        <path d="M24 104 L46 84 M96 104 L74 84" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.45" />
        <path d="M60 52 v58" stroke={GOLD} strokeWidth="3" opacity="0.55" strokeLinecap="round" />
        <circle cx="60" cy="86" r="6.5" fill={GOLD} opacity="0.9" />
      </g>
      <g fill={GOLD} opacity="0.6">
        <path d="M30 40 l1.3 3.6 3.6 1.3 -3.6 1.3 -1.3 3.6 -1.3-3.6 -3.6-1.3 3.6-1.3 Z" />
        <path d="M92 34 l1.1 3 3 1.1 -3 1.1 -1.1 3 -1.1-3 -3-1.1 3-1.1 Z" />
      </g>
    </>
  );
}

/* Rain falling, and one steady light underneath it. */
function Storm() {
  return (
    <>
      <g opacity="0.9">
        <circle cx="44" cy="46" r="13" fill="currentColor" fillOpacity="0.3" />
        <circle cx="62" cy="39" r="17" fill="currentColor" fillOpacity="0.3" />
        <circle cx="80" cy="48" r="12" fill="currentColor" fillOpacity="0.3" />
        <rect x="44" y="46" width="36" height="15" rx="6" fill="currentColor" fillOpacity="0.3" />
        <path d="M34 53 q10 8 24 8 h14 q14 0 20-9" fill="none" stroke="currentColor" strokeWidth="1.3" opacity="0.6" />
      </g>
      <g className="memory-art__rain" stroke={BLUSH} strokeWidth="1.5" strokeLinecap="round" opacity="0.75">
        <path d="M44 68 l-5 13" />
        <path d="M58 68 l-5 13" />
        <path d="M72 68 l-5 13" />
        <path d="M51 84 l-5 13" />
        <path d="M65 84 l-5 13" />
      </g>
      <g className="memory-art__flicker">
        <path d="M60 106 q-9-10 0-20 q9 10 0 20 Z" fill={GOLD} opacity="0.85" />
        <circle cx="60" cy="101" r="16" fill={GOLD} opacity="0.12" />
      </g>
      <path d="M46 112 h28 l-4 8 h-20 Z" fill="currentColor" fillOpacity="0.35" stroke="currentColor" strokeWidth="1.1" />
      <path d="M30 128 h60" stroke="currentColor" strokeWidth="1" opacity="0.3" />
    </>
  );
}

/* A shooting star over a dotted horizon — the wish itself. */
function Wish() {
  return (
    <>
      <path d="M22 30 q22 16 36 34" fill="none" stroke={GOLD} strokeWidth="2.4" strokeLinecap="round" opacity="0.55" />
      <path d="M34 22 q20 14 32 30" fill="none" stroke={GOLD} strokeWidth="1.4" strokeLinecap="round" opacity="0.32" />
      <path d="M14 44 q18 12 30 24" fill="none" stroke={GOLD} strokeWidth="1" strokeLinecap="round" opacity="0.22" />
      <g className="memory-art__pulse" transform="translate(66 72)">
        <path
          d="M0 -26 C3 -9 9 -3 26 0 C9 3 3 9 0 26 C-3 9 -9 3 -26 0 C-9 -3 -3 -9 0 -26 Z"
          fill={GOLD}
          opacity="0.9"
        />
        <circle r="7" fill={CREAM} opacity="0.7" />
      </g>
      <g fill={BLUSH} opacity="0.6">
        <circle cx="96" cy="40" r="1.6" />
        <circle cx="30" cy="86" r="1.3" />
        <circle cx="104" cy="70" r="1.1" />
        <circle cx="52" cy="104" r="1.2" />
      </g>
      <path
        d="M14 122 q22 12 46 6 q22-6 46 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeDasharray="1 7"
        opacity="0.6"
      />
    </>
  );
}

const ART = {
  dawn: Dawn,
  night: Night,
  bloom: Bloom,
  letters: Letters,
  storm: Storm,
  wish: Wish,
};

/**
 * @param {{ art?: string, tone?: string, className?: string }} props
 * `art` picks the drawing, `tone` picks the wash and ink colour. An unknown key
 * falls back to the last frame, so a typo in the config can never show her a
 * blank card.
 */
export function MemoryArt({ art = 'wish', tone = 'rose', className = '' }) {
  const Scene = ART[art] || ART.wish;
  return (
    <svg
      className={`memory-art memory-art--${tone} ${className}`.trim()}
      viewBox="0 0 120 150"
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <Scene />
    </svg>
  );
}

export const ART_KEYS = Object.keys(ART);

export default MemoryArt;
