/* ═══════════════════════════════════════════════════════════════════════════
   A LITTLE UNIVERSE OF LOVE  —  PERSONALISATION FILE
   ═══════════════════════════════════════════════════════════════════════════

   This is the ONLY file you need to edit to make this website hers.

   • Everything between the quotes is plain text you can rewrite.
   • "paragraphs" arrays = one entry per paragraph. Add or remove as you like.
   • Leave a field as "" and the website will quietly hide it (nothing breaks).
   • After editing, save the file. The browser updates instantly while
     `npm run dev` is running.

   Photos and music are NOT stored here — see the folders:
      src/assets/photos/   → drop image files here (they appear automatically)
      public/audio/        → drop one music file here, then set `music.src`
   Full instructions are in README.md.

   NOTE ON WORDING: the default text below is written to be warm but honest —
   it never invents memories or claims a relationship. Replace it with your own
   true words wherever you can. Specific always beats poetic.
═══════════════════════════════════════════════════════════════════════════ */

export const siteConfig = {
  /* ───────────────────────── 1. THE BASICS ───────────────────────── */

  brand: {
    /** Shown in the browser tab and used as the share title. */
    title: '{NAME} — A Little Universe Of Love',
    /** Small label in the top corner of the site. */
    wordmark: 'A Little Universe Of Love',
    /** Shown next to the wordmark on the intro screen. */
    edition: 'A birthday experience',
  },

  recipient: {
    /** Uppercase display name on the opening screen. */
    name: 'AKUDZWEISHE',
    /**
     * Tokens you can use anywhere below: {name} = her name as written in
     * sentences, {NAME} = the uppercase display name.
     */
    /** How she is addressed in the letters (handwritten style). */
    handwritten: 'Akudzweishe',
    /** Used inside sentences, e.g. "Dear {salutation}". */
    salutation: 'Akudzweishe',
  },

  /** Whoever made the site. Leave "" for an anonymous, signature-free letter. */
  sender: {
    name: '',
  },

  /**
   * The birthday. Accepts 'YYYY-MM-DD' (month/day are what count).
   * 'auto' = treat today as the day, so the site always reads correctly.
   * Change to something like '2026-12-03' to get a real countdown / count-up.
   */
  birthdayDate: 'auto',

  /* ───────────────────────── 2. SECTION 1 — THE OPENING ───────────────────────── */

  welcome: {
    kicker: 'Some people deserve more than an ordinary birthday wish.',
    name: '{NAME}',
    tagline: 'A little universe made just for you.',
    cta: 'Open Your Surprise ♡',
    /** Tiny line under the button. */
    hint: 'Sound on, if you can. Headphones feel better.',
  },

  /* ───────────────────────── 3. SECTION 2 — THE ENVELOPE ───────────────────────── */

  envelope: {
    eyebrow: 'Chapter One',
    title: 'A letter, sealed until now',
    subtitle: 'Tap the envelope to open it.',
    /** The opening of the letter, shown first inside the letter. */
    greeting: 'Dear {name},',
    intro: [
      'I wanted to do something a little different for you. Something that goes beyond an ordinary birthday message. Something you can open, explore and revisit whenever you want to remember how special you are.',
      'So I created this little corner of the world, especially for you.',
    ],
    /** The rest of the letter. Add or remove paragraphs freely. */
    body: [
      'There are people who walk into a room and quietly make it better without trying. You are one of those people, and I don’t think you hear that often enough.',
      'You matter — not because of what you do for anyone, not because of what you achieve, but because of who you are when nobody is watching. Kind. Stubborn about the things that are actually good. And far harder on yourself than this world ever needs you to be.',
      'Today is the day that person arrived. That is the only reason this little universe exists: so that on the birthdays, and on the ordinary Tuesdays too, you have somewhere to go and be reminded.',
      'Read it slowly. There are three gifts hiding further down, and a cake that will not behave until you blow out the candles.',
    ],
    signOff: 'Always in your corner',
  },

  /* ───────────────────────── 4. SECTION 3 — THE MEMORY GALLERY ───────────────────────── */

  gallery: {
    eyebrow: 'Chapter Two',
    title: 'A gallery of good days',
    subtitle:
      'The photographs go here. Every picture you add earns its own frame, its own caption, and its own place in this universe.',
    /**
     * Optional captions for your own photos, matched by file name.
     * You do NOT need this list — photos dropped in src/assets/photos/ appear
     * automatically even if you never touch this array. Use it only to give a
     * photo a proper caption and date.
     *
     *   { file: 'beach.jpg', caption: 'The day we finally made it to the sea.', date: 'Aug 2024' }
     */
    items: [
      // { file: 'example.jpg', caption: 'Your caption here.', date: 'Month Year' },
    ],
    /**
     * What the visitor sees before any photographs have been added.
     * These are honest placeholders — never somebody else's face pretending to
     * be a memory. Replace the whole array with real photos and it disappears.
     */
    placeholders: [
      { caption: 'A moment worth keeping', date: '', tone: 'rose' },
      { caption: 'The smile that says everything', date: '', tone: 'gold' },
      { caption: 'Somewhere golden', date: '', tone: 'plum' },
      { caption: 'The best of you, unposed', date: '', tone: 'cream' },
      { caption: 'Sunlight, saved', date: '', tone: 'gold' },
      { caption: 'Proof of joy', date: '', tone: 'rose' },
    ],
    /** Small print under the grid — only shown while frames are empty. */
    ownerNote:
      'Empty frames for now — add your own photographs to src/assets/photos/ and they will appear here instantly.',
  },

  /* ───────────────────────── 5. SECTION 4 — THE HEARTFELT LETTER ───────────────────────── */

  letter: {
    eyebrow: 'Chapter Three',
    title: 'Things I Don’t Always Say...',
    subtitle: 'Written slowly, on purpose.',

    /** The line above the letter. '' hides it. */
    greeting: 'Dear {name},',

    paragraphs: [
      'I don’t say it often enough, so let me say it plainly: I’m glad you exist. Of all the ways a person can move through this world, you chose to move through it gently — and that has not gone unnoticed, even on the days it felt like it had.',
      'You carry things you never asked to carry, and you still leave room in yourself to be kind to other people. That isn’t ordinary. Most people never notice it. I do.',
      'Thank you for the ways you show up — the ones people talk about, and the ones nobody will ever thank you for. The quiet effort is the rarest kind, and it is the kind that changes lives. Including one or two of mine.',
      'When you doubt yourself, please don’t take my word for it. Look instead at what you have already survived, and at what you built afterwards with the pieces. That record speaks far better for you than any compliment I could write.',
      'I hope this year is kinder than the last one. I hope you find rest that actually restores you, work that pays you what you’re worth, and love that never asks you to be smaller to be easier to love.',
      'I hope your dreams stop being dreams. You already did the hard, unglamorous part — you kept wanting them, even quietly. Now let yourself go and take them. The world is less solid than it pretends to be.',
      'And on the days you forget all of this, I hope you come back here and re-read it, so you leave with the same thing I leave with when I think of you: the steady, unremarkable certainty that you are valued, you are thought of, and good things are allowed to happen to you.',
    ],

    /** Ends the letter. Written after the last paragraph. */
    closing: 'Happy birthday, {name}.',
  },

  /* ───────────────────────── 6. SECTION 5 — THE THREE GIFTS ───────────────────────── */

  gifts: {
    eyebrow: 'Chapter Four',
    title: 'Three things, wrapped',
    subtitle: 'One at a time. Each opens differently.',

    items: [
      {
        id: 'appreciation',
        label: 'Something I Appreciate About You',
        kicker: 'Gift One',
        title: 'You notice people',
        accent: 'blush',
        paragraphs: [
          'What I appreciate most about you is that you pay attention — to the tone of a voice, to the thing someone mentioned once and clearly wanted but would never ask for twice.',
          'Most people move through the world half-asleep. You don’t. Being around you feels like being seen, and being seen is one of the rarest things one person can give another.',
          'You give that without announcing it. That is the part worth saying out loud.',
        ],
      },
      {
        id: 'secret',
        label: 'A Little Secret',
        kicker: 'Gift Two',
        title: 'The secret, since you asked',
        accent: 'gold',
        paragraphs: [
          'Here is the secret: you don’t have to earn a good day.',
          'You’ve spent so long proving yourself to a jury that was never real — working for rest instead of taking it, auditioning for people who only ever wanted you to be yourself. Worth isn’t a bill you settle.',
          'So today, just for today, believe it. Not because I said so, but because today is yours and you are allowed to enjoy what you are without justifying it first.',
        ],
      },
      {
        id: 'wish',
        label: 'A Wish For Your Future',
        kicker: 'Gift Three',
        title: 'What I wish you',
        accent: 'rose',
        paragraphs: [
          'A home that feels like exhaling. A year where the worries are small enough to laugh about.',
          'Money that arrives easily and stays. Work that never costs you your peace.',
          'Health that lets you actually use everything you’ve prayed for. Friends who are boring in all the right ways — steady, reliable, always picking up.',
          'Love that is calm rather than confusing. And the kind of year where you keep catching yourself saying: “honestly, things are going well.”',
        ],
      },
    ],
  },

  /* ───────────────────────── 7. SECTION 6 — THE CAKE ───────────────────────── */

  cake: {
    eyebrow: 'Chapter Five',
    title: 'One last thing before you go',
    subtitle: 'Make a wish, then blow out the candles — or tap them one by one.',
    /** How many candles on the cake. 1–9 works best on small screens. */
    candleCount: 5,
    /** Shown on the cake before the candles are out. */
    prompt: 'Something is missing. The candles are still lit.',
    /** Shown after every candle is out. */
    headline: 'HAPPY BIRTHDAY, {NAME}!',
    message:
      'May life give you countless reasons to smile. May your dreams find their way into reality, and may this new chapter bring you happiness, peace and beautiful memories.',
    relightLabel: 'Light them again',
  },

  /* ───────────────────────── 8. SECTION 7 — THE GOODBYE ───────────────────────── */

  goodbye: {
    line1: 'Made with love, especially for you.',
    line2: 'Some moments deserve to last forever.',
    replayLabel: 'Relive it from the beginning',
    /** Shown under the replay button; "" hides the whole line. */
    footnote: '',
  },

  /* ───────────────────────── 9. MUSIC ───────────────────────── */

  music: {
    /**
     * Your own song: put one audio file in `public/audio/` and write its name
     * here, e.g. 'audio/our-song.mp3'  (no leading slash needed).
     * Leave it as '' and the site plays a soft, original ambient piano loop
     * generated in the browser instead — free to use, no copyright worries.
     */
    src: '',
    /** Label shown in the player while your own file is playing. */
    title: 'For you, on repeat',
    /** The generated loop's title (shown only in generated mode). */
    generatedTitle: 'Golden Hour — ambient (generated)',
    /**
     * Start the music at the moment the visitor clicks "Open Your Surprise".
     * That click is a real interaction, so nothing autoplays. If it feels too
     * forward, set this to false and let her start it from the player.
     */
    startOnOpen: true,
    /** 0–1 loudness the music begins at. */
    defaultVolume: 0.55,
    /**
     * Remember her volume (and whether she muted it) between visits, so the
     * site never surprises her with sound twice.
     */
    remember: true,
  },

  /* ───────────────────────── 10. TUNING (safe to ignore) ───────────────────────── */

  effects: {
    /** Floating rose petals across the whole site. */
    petals: true,
    /** Twinkling stars and drifting light in the opening screen. */
    starfield: true,
    /** Confetti when every candle goes out. */
    confetti: true,
  },
};

export default siteConfig;
