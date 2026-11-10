# A Little Universe Of Love

A personalised, interactive birthday experience for **AKUDZWEISHE** — built as a single-page
React app: a cinematic opening, a sealed envelope, a memory gallery, a long letter, three
wrapped gifts, a cake with real candles, and a goodbye worth replaying.

No backend. No database. No accounts. Everything she reads lives in **one config file**, every
photograph in **one folder**, and the song in **one more folder**.

```
npm install     →   npm run dev   →   open the printed http://localhost:5173
```

---

## 1. Contents at a glance

| Chapter | What she sees | Where the words live |
| --- | --- | --- |
| 1. Opening | Her name in gold, a starfield, one button | `welcome` |
| 2. The envelope | A wax-sealed letter that opens, then unfolds into a readable letter | `envelope` |
| 3. The gallery | Polaroid frames, click to enlarge, prev/next, swipe on phones | `gallery` + `src/assets/photos/` |
| 4. Things I Don't Always Say… | The long letter, set on paper | `letter` |
| 5. Three gifts | Three boxes; each opens with its own reveal effect | `gifts` |
| 6. The cake | Candles you can blow out (or tap), confetti, then the final message | `cake` |
| 7. Goodbye | A constellation that draws itself, and a replay button | `goodbye` |

Plus the always-there bits: a header with a **Chapters** menu, a **music player**, a gold reading
progress line, floating rose petals, and — on desktop — a rail of chapter dots.

---

## 2. Make it hers

### 2.1 The words — one file

**`src/config/site.config.js`** is the only file you need to open. It is commented, and every
field has a sensible default so the site never shows a hole.

```js
recipient: {
  name: 'AKUDZWEISHE',        // the big display name
  salutation: 'Akudzweishe',  // how she is addressed in sentences
},
sender: { name: '' },         // put your name here to sign the letters
birthdayDate: 'auto',         // 'auto' = today, or '2026-12-03'
```

Two tokens work anywhere in the text, so you never type her name twice:

- `{name}` → `recipient.salutation`
- `{NAME}` → `recipient.name`

`paragraphs` / `intro` / `body` are arrays — **one entry per paragraph**. Add as many as you like;
the layout absorbs them. Leave any optional string `""` and that line hides itself.

> **A note on honesty.** The default copy is written to be warm without inventing anything: no
> shared memories, no claims about a relationship, no "since the day we met". When you replace it,
> the specific and true always beats the poetic and generic — one real detail is worth ten
> beautiful sentences.

### 2.2 Photographs — one folder

```
src/assets/photos/
   01-her-laugh.jpg
   02-golden-hour.jpg
   …
```

- Drop in **JPG / PNG / WebP / AVIF / GIF**; they appear in the gallery automatically, in file-name
  order (a leading number is a handy way to sequence them).
- **No code changes required.** Captions default to a tidied version of the file name.
- Want real captions and dates? Add them to `gallery.items`:

```js
items: [
  { file: '01-her-laugh.jpg', caption: 'The laugh that fixes a bad day.', date: 'June 2025' },
  { file: '02-golden-hour.jpg', caption: 'Golden hour, and you in it.',  date: 'December 2025' },
],
```

- Frames are cropped **4:5 portrait** (`object-fit: cover`), so portrait photos lose nothing.
- Long edge **~1600px** is plenty; Vite compresses and hashes them at build time. 6–9 photos is
  the sweet spot.
- Until there are photos, the gallery shows **empty frames** — deliberate. Stray internet photos
  of strangers pretending to be your memories would cheapen the whole thing.
- `npm run dev` shows a small reminder line about the folder. It is dev-only (`import.meta.env.DEV`),
  so it never appears in the deployed site.

### 2.3 Music — one file, or none at all

The site already has music: a soft, original ambient piano loop (`src/audio/ambientEngine.js`)
generated live by the Web Audio API — a slow A♭ loop with a sparse melody, reverb and a gentle
fade-in. Nothing is downloaded, and nothing is copyrighted.

To use **your own song** instead:

1. Put the file in `public/audio/` — e.g. `public/audio/our-song.mp3` (keep it under ~10 MB).
2. Point the config at it:

```js
music: {
  src: 'audio/our-song.mp3',
  title: 'The one we danced to',
  startOnOpen: true,     // begins on the click of “Open Your Surprise”, never before a gesture
  defaultVolume: 0.55,
  remember: true,        // remembers her volume / mute between visits
}
```

Rules the player follows: it never autoplays (the opening click is the gesture), it survives every
section and overlay so the song never restarts, and `M` toggles play/pause from the keyboard. Only
use a recording you have the right to share — a streaming-service link will not work.

### 2.4 Tuning

```js
effects: { petals: true, starfield: true, confetti: true }
```

Turn any of them off for a lighter page on old phones. All three already stand down completely
when the visitor's device asks for reduced motion.

---

## 3. Commands

| Command | Does |
| --- | --- |
| `npm install` | one time |
| `npm run dev` | dev server with hot reload — edit the config and watch it change |
| `npm run build` | production build into `dist/` |
| `npm run preview` | serves the built site locally, to check it before deploying |
| `npm run test` / `npm run test:run` | the vitest suite (interactions, config contract, music) |

The same commands work in **PowerShell** on Windows, and in any other shell.

---

## 4. Putting it online

`vite.config.js` sets `base: './'`, and `public/.nojekyll` is already there, so the build works on
a domain root, in a GitHub Pages project folder, or opened straight from disk.

### GitHub Pages (free, ~2 minutes)

```bash
npm run build
npx gh-pages -d dist          # or: push dist/ to a gh-pages branch
```

Then enable *Settings → Pages → Branch: gh-pages*. Your URL is
`https://<user>.github.io/<repo>/`.

### Netlify / Vercel / Cloudflare Pages

Build command `npm run build`, publish directory `dist`. Nothing else to configure.

### Anywhere else

Upload the contents of `dist/` to any static host. It is one HTML file, one JS bundle, one CSS file
and the images — no server code to run.

**Think about who else has the link.** A birthday page like this is not secret by design: anyone
with the URL can read it. If that matters, host it on a service that can password-protect it (Netlify
and Vercel both offer site password protection), or keep it on a private/unlisted URL and just tell
her where to find it.

---

## 5. What was verified

- **42 automated tests** (`npm run test:run`) drive the real components: opening the experience,
  the envelope's letter, re-reading it, the gallery lightbox and its arrow keys, all three gifts
  opening and closing, candles going out one by one *and* in one gust, the celebration, relighting,
  chapter jumps, the music player's play/pause/volume/mute, the reduced-motion path through the same
  interactions, and the rule that a paused song is never auto-started again.
- Adding photographs was verified by dropping real files into the folder and rendering the
  gallery: they appear in name order, captions come from the file name unless configured, and the
  empty frames disappear.
- A **console test** walks the whole site and fails on any React warning or error — currently silent.
- `npm run build` completes with no errors and no unresolved imports; every route in the app is an
  anchor on one page, so there are no links that can break.
- The config is covered by a **contract test**: if a required field is deleted, a test fails with the
  field's name rather than the site showing her an empty section.

Not verified in this environment: pixel-level rendering in a real browser (no browser binary was
available here). Run `npm run dev`, look at it on your phone as well as your laptop, and adjust
`--section-y` / `--gutter` in `src/styles/tokens.css` if you want more or less air.

---

## 6. Layout of the code

```
src/
  config/
    site.config.js      ← everything she reads
    sections.js         ← the chapter list used by the navigation
  components/
    effects/            ← starfield + rose petals (canvas), one file each
    ui/                 ← Reveal, SectionShell, Overlay, Stagger, TopBar, NavRail,
                          ScrollProgress, MusicPlayer  (+ their .css)
    sections/
      welcome/  envelope/  gallery/  letter/  gifts/  cake/  goodbye/
                          ← one folder per chapter: component(s) + its own CSS
  hooks/                ← useMusicEngine, useActiveSection, useScrollLock,
                          useCanvasLayer, usePrefersReducedMotion
  utils/                ← text, date, photos, celebrate (confetti)
  audio/ambientEngine.js ← the generated loop
  styles/               ← tokens.css (palette, type scale), base.css, buttons.css, app.css
tests/                  ← the vitest suite
```

Every section owns its component and its stylesheet, so deleting or reordering a chapter means
touching one folder plus `App.jsx`.

### If something misbehaves

| Symptom | Fix |
| --- | --- |
| Photos don't show | Check the extension and the folder (`src/assets/photos/`, not `public/`). Restart `npm run dev` so the glob re-runs. |
| Own song doesn't play | `music.src` must match the file name **exactly**, including case: `audio/Our-Song.mp3`. Check the browser console for a 404. |
| Fonts look different | They are bundled (`@fontsource`), so this means the build is stale — `rm -rf dist node_modules/.vite && npm run build`. |
| Page feels heavy on an old phone | `effects: { petals: false, starfield: false }`. |
| Music starts where you didn't want it | `music.startOnOpen: false` — she can start it from the player. |

---

Made with love, especially for her.
