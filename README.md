# AKUDZWEISHE — A Little Universe Of Love

A complete, interactive birthday website — a single-page React app with a cinematic opening, a
sealed letter, six drawn frames, a long letter, three gifts, a cake with candles she has to blow
out, and a goodbye that signs itself **Bongani Tshuma · I love you**.

**It is finished.** Nothing has to be photographed, downloaded, or written for the site to work.
The words are in one file if you ever want to change them; the drawings are code, not assets.

```
npm install   →   npm run dev   →   open the printed http://localhost:5173
```

Live site: **https://bykimwonn.github.io/AKU/** (GitHub Pages, built from `dist/` on the
`gh-pages` branch — see §4).

---

## 1. What she goes through

| # | Chapter | What happens | Config key |
| --- | --- | --- | --- |
| 1 | Opening | Her name in gold, letters arriving one at a time, a starfield with drifting light, one button. The page behind stays locked until she presses it. | `welcome` |
| 2 | The envelope | A wax seal cracks, the flap swings back in 3D, the page lifts out of the pocket, and the letter opens as a readable sheet. Re-openable, `Esc`-closable. | `envelope` |
| 3 | Six frames | Six original line drawings taped to a dark wall — crooked until touched, then opening into a viewer with prev/next, arrow keys and swipe. Each carries one sentence. | `gallery` |
| 4 | Things I Don't Always Say… | The long letter on paper: drop cap, 1.95 line-height, paragraphs that settle as they arrive. | `letter` |
| 5 | Three gifts | Three boxes; the lid and bow fly off and light spills out. Each reveal is different — lines write themselves out, a creased note unfolds, wishes rise with sparks. | `gifts` |
| 6 | The cake | Two tiers, dripping frosting, candles flickering on their own timings. Tap one out for a curl of smoke or blow the whole row in one gust → confetti, petals, the final message. Any candle can be relit. | `cake` |
| 7 | Goodbye | A constellation draws itself, the closing lines, **the signature**, and a replay button. | `goodbye`, `signature` |

Always present: a header with a **Chapters** menu, the **music player**, a gold reading-progress
line, floating rose petals, and a rail of chapter dots on desktop.

---

## 2. Editing the words (optional)

**`src/config/site.config.js`** is the only file to open. Every field is commented; leaving a
field `""` hides it quietly rather than breaking the page.

```js
recipient: { name: 'AKUDZWEISHE', salutation: 'Akudzweishe' },
sender:    { name: 'Bongani Tshuma' },
birthdayDate: 'auto',        // or '2026-11-20' for a real countdown / count-up
signature: {
  eyebrow: 'From',
  name: 'Bongani Tshuma',
  line: 'I love you',
  whisper: 'Today, tomorrow, and every ordinary Tuesday in between.',
},
```

Tokens: `{name}` and `{NAME}` are replaced anywhere in the copy with the recipient's name —
useful if a sentence needs her name in it.

### The six frames

Each frame is `{ id, art, tone, title, line }`. `art` chooses the drawing —
`dawn · night · bloom · letters · storm · wish` — and `tone` the wash (`gold · rose · plum ·
cream`). An unknown `art` falls back to `wish`, so a typo can never show her a blank card.
Add or remove frames freely: the grid, the counter and the prev/next buttons all follow.

### Music

`music.src: ''` (the default) plays a soft **original ambient loop generated in the browser**
by `src/audio/ambientEngine.js` — an A♭ chord loop with a sparse music-box melody and convolution
reverb. Nothing to download, nothing copyrighted, no audio file in the repo.

Want a specific song instead? Put one file in `public/audio/` and set
`music.src: 'audio/our-song.mp3'`. It still never autoplays: it starts on the click that opens
the site, and if she pauses it once, it stays paused. Volume and mute are remembered between
visits.

### Turning things off

```js
effects: { petals: true, starfield: true, confetti: true }
```

Any of these can be set to `false`. Separately, everything on the site already honours the
visitor's own "reduce motion" setting: the petals, stars, confetti and staged animations stand
down, and every interactive moment still delivers.

---

## 3. Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server with hot reload. |
| `npm run test:run` | The whole test suite (45 tests, jsdom). |
| `npm run build` | Production build into `dist/`. |
| `npm run preview` | Serves the built `dist/` locally — the closest thing to the real deployment. |

Node 20.19+ or 22+ is required (Vite 8).

---

## 4. Deploying (GitHub Pages — already set up)

The site is deployed to **`https://bykimwonn.github.io/AKU/`** from the **`gh-pages`** branch,
which contains a built copy of `dist/`. Pages was enabled with `gh api`, and `vite.config.js`
uses `base: './'` with a `public/.nojekyll` file, so it works on a project sub-path.

After **any** change, rebuild and republish:

```bash
npm run build && npx gh-pages -d dist --message "Update the site"
```

Your URL does not change and it takes about a minute to go live. Also handy:

```bash
gh run list --repo bykimwonn/AKU            # if you ever switch to a workflow
gh api repos/bykimwonn/AKU/pages --jq .status
```

**Other hosts.** Netlify Drop (drag the whole `dist` folder onto app.netlify.com/drop),
Vercel (`npx vercel --prod`), or Render → *Static Site* with build command `npm run build`,
publish directory `dist`, and env var `NODE_VERSION=22`. No configuration is needed for
Netlify/Vercel; Render needs those three settings. `base: './'` means the same `dist` works on
all of them.

**Who else can see it.** A Pages site is public — anyone with the link can open it, and this
repository is public too, so the source (and every previous version of the words) is readable by
anybody. If that ever stops feeling fine: make the repo private, or move the deployment to
Netlify/Render and put a password on it.

---

## 5. Keyboard & accessibility

- `Alt` + `↑` / `↓` walks between chapters.
- `M` toggles the music.
- `Esc` closes any open letter, gift or frame.
- `←` / `→` step through the gallery frames; on a phone you can swipe.
- A skip link appears for keyboard users, focus is trapped inside overlays and returned to the
  control that opened them, and every interactive thing is a real `<button>`.

---

## 6. What was actually verified

- `npm run test:run` → **45 passing**: the opening gate, the envelope (open, re-read, `Esc`),
  the gallery (frames, opening, arrow-key stepping, the sentence inside, no broken `<img>`),
  all three gifts opening and closing, candles one-by-one *and* in a gust, the celebration,
  relighting, chapter jumps, the player's play/pause/volume/mute and pause-persistence, the
  config contract (a missing required field fails, naming itself), and the reduced-motion path
  through the same interactions.
- A dedicated test walks the entire site and fails on **any** `console.error` or `console.warn`.
- `npm run build` succeeds; every `url()` and font referenced by the built CSS resolves, and the
  asset paths are relative so a sub-path deploy works.
- Not verified here: pixel-level rendering in a real browser (the sandbox can't install a browser
  binary). Open it on a phone once before sending the link.

---

## 7. How the code is arranged

```
src/
  App.jsx               ← the entering gate, active-section tracking, keyboard shortcuts
  config/site.config.js ← every word on the site, including the signature
  config/sections.js    ← the chapter list the nav and shortcuts read
  styles/               ← tokens.css (palette, type scale), base, buttons, app
  hooks/                ← music engine, active section, canvas layers, scroll lock, reduced motion
  utils/                ← text tokens, birthday dates, gallery builder, confetti
  audio/ambientEngine.js← the generative loop (Web Audio)
  components/ui/        ← SectionShell, Overlay, Reveal, Stagger, Signature, MusicPlayer, TopBar,
                          NavRail, ScrollProgress
  components/effects/   ← petals + starfield canvases
  components/sections/  ← welcome, envelope, gallery, letter, gifts, cake, goodbye
                          (each component owns its own .css; the gallery's drawings live in
                           gallery/MemoryArt.jsx)
tests/                  ← experience, music, console, config
```

Sections are data-driven and never reach into each other's state: they read the config, keep
their own open/closed state, and hand off with `onJump(sectionId)`. Adding a chapter means adding
an entry to `src/config/sections.js` and rendering a component in `App.jsx`.

Two conventions worth knowing before editing:

- Anything Framer Motion animates must not also have a CSS `transform` animation on the same
  element — a wrapper owns the CSS transform, the inner element owns Framer's.
- Reduced motion is read through `src/hooks/usePrefersReducedMotion.js` everywhere, never
  directly from the media query or from Framer's hook alone.

---

## 8. Troubleshooting

| Symptom | Fix |
| --- | --- |
| The page never appears (blank) | JavaScript is off, or the build wasn't run after an edit. Check `npm run build` output for a syntax error in the config — a missing comma is the usual one. |
| The letters look wrong after editing the config | A stray `"` or `,` broke the file. `node -e "import('./src/config/site.config.js')"` will point at the line. |
| Music doesn't start | It never autoplays. Press the player, or click "Open Your Surprise" with `music.startOnOpen: true`. On a phone, one tap anywhere first is required by the browser. |
| The ambient loop is silent on a very old browser | No Web Audio support → the player says so and stays out of the way. Add a file in `public/audio/` for a real track. |
| Animations feel absent | The device has "reduce motion" on. That is intended behaviour, and every interaction still works. |
| The deployed site looks stale | Rebuild and republish (`npm run build && npx gh-pages -d dist`). The `gh-pages` branch is a snapshot, not a live view of `main`. |
| Candles/frames overflow on a small phone | Lower `cake.candleCount`; the gallery grid reflows on its own. |
