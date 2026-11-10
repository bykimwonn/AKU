/* ═══════════════════════════════════════════════════════════════════════════
   A LITTLE UNIVERSE OF LOVE  —  ALL THE WORDS
   ═══════════════════════════════════════════════════════════════════════════

   Everything on the website lives in this file. It is already finished — you
   do not have to add photographs, audio or a single sentence to make it work.

   • Text between the quotes can be rewritten whenever you like.
   • "paragraphs" / "cards" arrays = one entry per paragraph or frame.
   • Leave a field as "" and the site quietly hides it (nothing breaks).
   • Tokens: {name} = her name in a sentence, {NAME} = the display version.

   After editing, save. The live site updates instantly while `npm run dev`
   is running; for the deployed version run `npm run build` and redeploy.
═══════════════════════════════════════════════════════════════════════════ */

export const siteConfig = {
  /* ───────────────────────── 1. THE BASICS ───────────────────────── */

  brand: {
    /** Browser tab title and the link preview title. */
    title: '{NAME} — A Little Universe Of Love',
    /** Small label in the top corner of the site. */
    wordmark: "{short}'s Little Universe",
    /** Under the wordmark on the opening screen. */
    edition: 'A birthday experience',
  },

  recipient: {
    /** Uppercase display name on the opening screen. */
    name: 'AKUDZWEISHE',
    /**
     * The name you actually call her. Used where the full name would be too
     * much: the top-bar label, the second letter, the cake, the last line.
     * Spell it however you like.
     */
    short: 'Aku',
    /** How she is addressed in the handwritten places. */
    handwritten: 'Akudzweishe',
    /** Used inside sentences, e.g. "Dear {salutation}". */
    salutation: 'Akudzweishe',
  },

  /** Whoever made this. Used by the signature block at the end of the letters. */
  sender: {
    name: 'Bongani Tshuma',
  },

  /**
   * Her birthday, 'YYYY-MM-DD' — only the month and day are read. The goodbye
   * screen counts down to it, and on the day itself says so instead.
   * 'auto' would treat every day as the day.
   */
  birthdayDate: '2026-11-11',

  /* ───────────────────────── 2. THE SIGNATURE ─────────────────────────
     Appears at the end of both letters and once, large, at the very end.  */

  signature: {
    /** Tiny line above the name. */
    eyebrow: 'From',
    /** Handwritten. */
    name: 'Bongani Tshuma',
    /** The words under the name, set in capitals with rules around them. */
    line: 'I love you',
    /** Optional last whisper beneath the signature. "" hides it. */
    whisper: 'Today, tomorrow, and every ordinary day in between.',
  },

  /* ───────────────────────── 3. SECTION 1 — THE OPENING ───────────────────────── */

  welcome: {
    kicker: 'Some people deserve more than an ordinary birthday wish.',
    name: '{NAME}',
    tagline: 'A little universe made just for you.',
    cta: 'Open Your Surprise ♡',
    /** Tiny line under the button. */
    hint: 'Sound on, if you can. Headphones feel better.',
  },

  /* ───────────────────────── 4. SECTION 2 — THE ENVELOPE ───────────────────────── */

  envelope: {
    eyebrow: 'Chapter One',
    title: 'A letter, sealed until now',
    subtitle: 'Tap the envelope to open it.',
    greeting: 'My dearest {name},',
    intro: [
      'I tried to write you an ordinary birthday message and kept failing, because ordinary has never felt like enough for you. So instead I built you a small world — seven rooms, two letters, three gifts and a cake that refuses to behave until you blow out the candles.',
      'Nothing in here needs you to be impressive, or entertaining, or worth it. You already are, and that was never the point. The point is that today somebody made you something by hand, on purpose, because of who you are.',
    ],
    body: [
      'There are people who walk into a room and quietly make it better without trying. You are one of those people, and I don’t think you hear that often enough.',
      'You matter — not for what you do for anyone, not for what you achieve, but for who you are when nobody is watching. Kind. Stubborn about the things that are actually good. And far harder on yourself than this world ever had the right to make you.',
      'There is one more thing I want to say, and it is not a difficult one: your name has always sounded to me like a blessing. So today let the whole day be that. Praise for the person you are, and gratitude that I got to be somewhere near it.',
      'Read it slowly. Stay on the lines that land. There are three gifts further down, and a cake that only gives up its wish to someone brave enough to blow it out.',
    ],
    signOff: 'All my love, always',
    /** The button at the foot of the letter: it closes the letter and moves on. */
    continueLabel: 'Keep going — six frames next',
  },

  /* ───────────────────────── 5. SECTION 3 — THE FRAMES ─────────────────────────
     Six drawings, each with one true sentence. No photographs required —
     `art` chooses the illustration: dawn · night · bloom · letters · storm · wish */

  gallery: {
    eyebrow: 'Chapter Two',
    title: 'Six frames, drawn for you',
    subtitle:
      'I left the photographs out and made these instead, so that every frame would say exactly what I mean. Tap one to step inside.',
    cards: [
      {
        id: 'dawn',
        art: 'dawn',
        tone: 'gold',
        title: 'You, at first light',
        line: 'You are the rare person who makes a morning feel like good news.',
      },
      {
        id: 'night',
        art: 'night',
        tone: 'plum',
        title: 'You, when it gets late',
        line: 'You answer when almost everyone else has gone quiet. I have never once taken that for granted.',
      },
      {
        id: 'bloom',
        art: 'bloom',
        tone: 'rose',
        title: 'How you grow',
        line: 'You have been planted in such poor soil and you keep flowering anyway. That is not luck. That is you.',
      },
      {
        id: 'letters',
        art: 'letters',
        tone: 'cream',
        title: 'What you don’t say',
        line: 'Even the things you keep to yourself land softer than most people’s compliments.',
      },
      {
        id: 'storm',
        art: 'storm',
        tone: 'plum',
        title: 'You, in the hard season',
        line: 'When the year got loud, you got quieter and steadier. I noticed. I noticed all of it.',
      },
      {
        id: 'wish',
        art: 'wish',
        tone: 'gold',
        title: 'The wish I keep',
        line: 'That this year treats you the way you treat everybody else. That would be more than enough.',
      },
    ],
  },

  /* ───────────────────────── 6. SECTION 4 — THE HEARTFELT LETTER ───────────────────────── */

  letter: {
    eyebrow: 'Chapter Three',
    title: 'Things I Don’t Always Say...',
    subtitle: 'Written slowly, on purpose.',

    /** The line above the letter. '' hides it. */
    greeting: 'My dearest {short},',

    paragraphs: [
      'I don’t say it often enough, so let me say it plainly: I’m glad you exist. Of all the ways a person can move through this world, you chose to move through it gently — and that has not gone unnoticed, even on the days it felt like it had.',
      'You carry things you never asked to carry, and you still leave room in yourself to be kind to other people. That isn’t ordinary. Most people never notice it. I do.',
      'Thank you for the ways you show up — the ones people talk about, and the ones nobody will ever thank you for. The quiet effort is the rarest kind, and it is the kind that changes lives. Including one or two of mine.',
      'When you doubt yourself, don’t take my word for it. Look instead at what you have already survived, and at what you built afterwards out of the pieces. That record speaks far better for you than any compliment I could write.',
      'I hope this year is kinder than the last one. I hope you find rest that actually restores you, work that pays you what you’re worth, and love that never asks you to be smaller in order to be easier to love.',
      'I hope your dreams stop being dreams. You already did the hard, unglamorous part — you kept wanting them, even quietly. Now go and take them. The world is far less solid than it pretends to be.',
      'And on the days you forget all of this, come back here and re-read it, so you leave with the same thing I leave with whenever I think of you: the steady, unremarkable certainty that you are valued, you are thought of, and good things are allowed to happen to you.',
    ],

    /** Ends the letter, before the signature. */
    closing:
      'Happy birthday, {name}. And now the part I have been circling all the way down here, the one that was the real reason for all of it: I love you. Not as an opening line, not as a goodbye — as a fact, with no conditions attached to it.',
  },

  /* ───────────────────────── 7. SECTION 5 — THE THREE GIFTS ───────────────────────── */

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
          'Most people move through the world half-asleep. You don’t. Being around you feels like being seen, and being seen is one of the rarest things one person can hand another.',
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
          'So today, just for today, believe it. Not because I said so — because today is yours, and you are allowed to enjoy what you are without justifying it first.',
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

  /* ───────────────────────── 8. SECTION 6 — THE CAKE ───────────────────────── */

  cake: {
    eyebrow: 'Chapter Five',
    title: 'One last thing before you go',
    subtitle: 'Make a wish, {short}, then blow out the candles — or tap them one by one.',
    /** How many candles on the cake. 1–9 works best on small screens. */
    candleCount: 5,
    /** Shown under the cake until she touches it. */
    dragHint: 'Drag the cake to turn it — the far side has candles too',
    /** Shown on the cake before the candles are out. */
    prompt: 'Something is missing. The candles are still lit.',
    /** Shown after every candle is out. */
    headline: 'HAPPY BIRTHDAY, {NAME}!',
    message:
      'May life give you countless reasons to smile. May your dreams find their way into reality, and may this new chapter bring you happiness, peace and beautiful memories.',
    relightLabel: 'Light them again',
  },

  /* ───────────────────────── 9. SECTION 7 — THE GOODBYE ───────────────────────── */

  goodbye: {
    line1: 'Made with love, especially for you, {short}.',
    line2: 'Some moments deserve to last forever.',
    replayLabel: 'Relive it from the beginning',
    /** Under the replay button. */
    footnote: 'Come back any time you need reminding. It stays right here — and so do I.',
  },

  /* ───────────────────────── 10. MUSIC ───────────────────────── */

  music: {
    /**
     * '' = the site plays a soft original ambient loop generated in the
     * browser (nothing to download, no copyright to clear). If you ever want a
     * specific song, drop one file in public/audio/ and write its name here,
     * e.g. 'audio/our-song.mp3'.
     */
    src: '',
    /** Label shown in the player if you add your own file. */
    title: 'For you, on repeat',
    /** The generated loop's title (shown in generated mode). */
    generatedTitle: 'Golden Hour — ambient (generated)',
    /**
     * Start the music at the moment she clicks "Open Your Surprise". That click
     * is a real interaction, so nothing autoplays. If she pauses it, it never
     * starts again on its own.
     */
    startOnOpen: true,
    /** 0–1 loudness the music begins at. */
    defaultVolume: 0.55,
    /** Remember her volume (and mute) between visits. */
    remember: true,
  },

  /* ───────────────────────── 11. TUNING (safe to ignore) ───────────────────────── */

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
