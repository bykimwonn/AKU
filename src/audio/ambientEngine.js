/**
 * Golden Hour — a tiny generative ambient piano.
 *
 * The site ships with music it makes itself: a slow four-chord loop in
 * A♭ major with a sparse pentatonic "music box" melody, run through a
 * convolution reverb built from filtered noise. Nothing is downloaded, nothing
 * is copyrighted, and it fades in gently instead of hitting the visitor.
 *
 * It only ever starts from a click (see useMusicEngine), and if the owner puts
 * their own song in public/audio/ the config switches to that file instead —
 * this engine is then never even created.
 */

const A4 = 440;
const midiToFreq = (note) => A4 * 2 ** ((note - 69) / 12);

const CHORD_SECONDS = 8;
const LOOKAHEAD = 0.4;
const TICK_MS = 25;

/** A♭  —  F♭m  —  D♭  —  E♭  (the "emotional but unhurried" loop) */
const PROGRESSION = [
  { name: 'Abmaj9', notes: [44, 56, 60, 63, 70] },
  { name: 'Fm7', notes: [41, 53, 56, 60, 63] },
  { name: 'Dbmaj9', notes: [37, 49, 53, 56, 60] },
  { name: 'Eb6/9', notes: [39, 51, 58, 63, 67] },
];

/** A♭ major pentatonic, kept in a gentle singing register. */
const MELODY_POOL = [68, 70, 72, 75, 77, 80];

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function createReverbImpulse(ctx, seconds = 3.2, decay = 2.6) {
  const rate = ctx.sampleRate;
  const length = Math.max(1, Math.floor(rate * seconds));
  const buffer = ctx.createBuffer(2, length, rate);
  for (let channel = 0; channel < 2; channel += 1) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i += 1) {
      const t = i / length;
      // Decaying noise tail with a touch of early-reflection smear.
      data[i] = (Math.random() * 2 - 1) * (1 - t) ** decay * (i < rate * 0.012 ? 0.4 : 1);
    }
  }
  return buffer;
}

export function ambientSupported() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.AudioContext || window.webkitAudioContext);
}

export function createAmbientEngine({ volume = 0.6 } = {}) {
  let ctx = null;
  let master = null;
  let mix = null;
  let reverbSend = null;
  let delaySend = null;
  let padVoice = null;
  let timer = null;
  let nextChordAt = 0;
  let chordIndex = 0;
  let running = false;
  let level = volume;

  function build() {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    ctx = new AudioCtor();

    master = ctx.createGain();
    master.gain.value = 0;

    const glue = ctx.createDynamicsCompressor();
    glue.threshold.value = -22;
    glue.knee.value = 24;
    glue.ratio.value = 3.2;
    glue.attack.value = 0.01;
    glue.release.value = 0.35;

    mix = ctx.createGain();
    mix.gain.value = 0.85;
    mix.connect(glue);
    glue.connect(master);
    master.connect(ctx.destination);

    // ── space: reverb plate made of noise
    const convolver = ctx.createConvolver();
    convolver.buffer = createReverbImpulse(ctx);
    const reverbOut = ctx.createGain();
    reverbOut.gain.value = 0.9;
    reverbSend = ctx.createGain();
    reverbSend.gain.value = 1;
    reverbSend.connect(convolver);
    convolver.connect(reverbOut);
    reverbOut.connect(mix);

    // ── a soft dotted echo on the melody only
    const delay = ctx.createDelay(1.5);
    delay.delayTime.value = 0.42;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.26;
    const delayTone = ctx.createBiquadFilter();
    delayTone.type = 'lowpass';
    delayTone.frequency.value = 2400;
    delaySend = ctx.createGain();
    delaySend.gain.value = 1;
    delaySend.connect(delay);
    delay.connect(delayTone);
    delayTone.connect(feedback);
    feedback.connect(delay);
    const delayOut = ctx.createGain();
    delayOut.gain.value = 0.32;
    delayTone.connect(delayOut);
    delayOut.connect(mix);

    // ── pad: warm low-passed strings/air under everything
    const padBus = ctx.createGain();
    padBus.gain.value = 0.15;
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.value = 900;
    padFilter.Q.value = 0.6;
    padBus.connect(padFilter);
    padFilter.connect(mix);
    padFilter.connect(reverbSend);

    const shimmer = ctx.createGain();
    shimmer.gain.value = 0.045;
    padFilter.connect(shimmer);
    shimmer.connect(delaySend);

    padVoice = { bus: padBus, filter: padFilter };

    // Slow breathing on the pad filter, so it never sounds static.
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.045;
    lfoGain.gain.value = 260;
    lfo.connect(lfoGain);
    lfoGain.connect(padFilter.frequency);
    lfo.start();
  }

  function playPadChord(chord, at) {
    const { bus } = padVoice;
    const attack = 2.6;
    const release = 3.6;
    const hold = CHORD_SECONDS + 1.2;

    chord.notes.forEach((note, index) => {
      const freq = midiToFreq(note);
      const voice = ctx.createGain();
      voice.gain.setValueAtTime(0.0001, at);
      voice.gain.linearRampToValueAtTime(index === 0 ? 0.5 : 0.34, at + attack);
      voice.gain.setValueAtTime(index === 0 ? 0.5 : 0.34, at + hold - release);
      voice.gain.exponentialRampToValueAtTime(0.0001, at + hold);

      const oscA = ctx.createOscillator();
      oscA.type = 'sine';
      oscA.frequency.value = freq;
      const oscB = ctx.createOscillator();
      oscB.type = 'triangle';
      oscB.frequency.value = freq;
      oscB.detune.value = index % 2 ? 6 : -7;

      const trimB = ctx.createGain();
      trimB.gain.value = 0.35;

      oscA.connect(voice);
      oscB.connect(trimB);
      trimB.connect(voice);
      voice.connect(bus);

      oscA.start(at);
      oscB.start(at);
      oscA.stop(at + hold + 0.2);
      oscB.stop(at + hold + 0.2);
    });
  }

  function playBell(note, at, gain = 0.28) {
    const freq = midiToFreq(note);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, at);
    env.gain.linearRampToValueAtTime(gain, at + 0.012);
    env.gain.exponentialRampToValueAtTime(0.0001, at + 2.9);

    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = 4200;

    const fundamental = ctx.createOscillator();
    fundamental.type = 'sine';
    fundamental.frequency.value = freq;

    const bloom = ctx.createOscillator();
    bloom.type = 'triangle';
    bloom.frequency.value = freq * 2.004;
    const bloomTrim = ctx.createGain();
    bloomTrim.gain.value = 0.18;

    const strike = ctx.createOscillator();
    strike.type = 'sine';
    strike.frequency.value = freq * 4.01;
    const strikeTrim = ctx.createGain();
    strikeTrim.gain.setValueAtTime(0.06, at);
    strikeTrim.gain.exponentialRampToValueAtTime(0.0001, at + 0.22);

    fundamental.connect(tone);
    bloom.connect(bloomTrim);
    bloomTrim.connect(tone);
    strike.connect(strikeTrim);
    strikeTrim.connect(tone);
    tone.connect(env);
    env.connect(mix);
    env.connect(reverbSend);
    env.connect(delaySend);

    [fundamental, bloom, strike].forEach((osc) => {
      osc.start(at);
      osc.stop(at + 3.1);
    });
  }

  function schedule() {
    if (!ctx) return;
    const horizon = ctx.currentTime + LOOKAHEAD;

    while (nextChordAt < horizon) {
      const chord = PROGRESSION[chordIndex % PROGRESSION.length];
      playPadChord(chord, nextChordAt);

      // Two or three bells per chord, resting as often as sounding.
      const notes = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < notes; i += 1) {
        if (Math.random() < 0.24) continue;
        const at = nextChordAt + i * randomBetween(1.5, 2.6) + randomBetween(0, 0.4);
        if (at > nextChordAt + CHORD_SECONDS - 0.5) break;
        playBell(pick(MELODY_POOL), at, randomBetween(0.16, 0.3));
        if (Math.random() < 0.22) {
          playBell(pick(MELODY_POOL) - 12, at + 0.16, 0.12);
        }
      }

      chordIndex += 1;
      nextChordAt += CHORD_SECONDS;
    }
  }

  function tick() {
    try {
      schedule();
    } catch {
      /* a node hit the end of its life — the next tick will be fine */
    }
  }

  return {
    get isPlaying() {
      return running;
    },

    async start() {
      if (!ambientSupported()) return false;
      if (!ctx) build();
      if (ctx.state === 'suspended') {
        try {
          await ctx.resume();
        } catch {
          return false;
        }
      }
      if (running) return true;
      running = true;
      nextChordAt = ctx.currentTime + 0.15;
      chordIndex = 0;
      schedule();
      timer = window.setInterval(tick, TICK_MS);
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), now);
      master.gain.linearRampToValueAtTime(level, now + 3);
      return true;
    },

    /** Fade out, then stop scheduling. The graph stays warm for a quick resume. */
    async stop() {
      if (!ctx || !running) return;
      running = false;
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), now);
      master.gain.linearRampToValueAtTime(0.0001, now + 1.1);
      window.clearInterval(timer);
      timer = null;
      window.setTimeout(() => {
        if (!running && ctx && ctx.state === 'running') {
          ctx.suspend().catch(() => {});
        }
      }, 1300);
    },

    setVolume(next) {
      level = Math.max(0, Math.min(1, next));
      if (!ctx || !running) {
        if (ctx && !running) master.gain.value = 0;
        return;
      }
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(level, now + 0.18);
    },

    async dispose() {
      window.clearInterval(timer);
      timer = null;
      running = false;
      if (!ctx) return;
      try {
        await ctx.close();
      } catch {
        /* already closed */
      }
      ctx = null;
    },
  };
}
