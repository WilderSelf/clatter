// Tray sound. Every sound is made here, in code, with the Web Audio API.
//
// The repository holds no audio file and fetches none. Unit 3.1 deleted the
// library's own 540,987 bytes of them, and a sample taken from anywhere else is
// a dependency and a licence question at once. A voice is a short burst of
// noise through a band-pass filter, which is what a small hard object striking
// another one sounds like.
//
// Two properties this module owes the player:
//
//   1. Nothing is built until the player turns sound on. No `AudioContext`
//      exists while sound is off, so there is nothing for a browser to refuse
//      and nothing to leak on a page the player never asked to hear.
//   2. Nothing here resumes a context. A context is born suspended, and
//      `resume` is a separate call the application makes from inside a user
//      gesture. A module that resumed itself would make a noise the player
//      never asked for.
//
// Every voice comes from a collision the physics world reported, through the
// `onImpact` hook of the vendored tray. There is no timer here and no schedule:
// a sound exists because two bodies met.

import type { TrayImpact } from './vendor/dice-tray.js';

export type { TrayImpact };

/**
 * Below this closing speed a collision is not heard.
 *
 * The unit is tray units a second, along the contact normal. A die is 100 units
 * across and gravity runs at 3,920 units a second squared, so these two numbers
 * are large. They are recorded from a measured throw — see the Unit 3.6 row in
 * LEDGER.md for the distribution they were read off.
 */
export const SILENT_BELOW = 120;

/** At this closing speed a collision is as loud as this tray gets. */
export const LOUDEST_AT = 2400;

/** Where an exponential fall stops. A ramp may not reach zero. */
const SILENCE = 0.0001;

/** How far a voice moves in pitch, either way, as a fraction of its timbre. */
const PITCH_SPREAD = 0.35;

/** One sound the tray makes. Pure data, so a check can read it without audio. */
export interface Voice {
  /** The centre of the band-pass, in hertz. */
  readonly hz: number;
  readonly q: number;
  /** Peak gain of this voice alone, before the volume the player set. */
  readonly level: number;
  /** How long it takes to fall to silence. */
  readonly seconds: number;
}

/**
 * The two timbres.
 *
 * A die meeting a die is the rattle: bright and short, two small hard objects.
 * A die meeting a wall or the desk is the clatter: lower and longer, because
 * the table under it is large and carries the sound.
 */
const TIMBRE: Record<TrayImpact['kind'], { hz: number; q: number; seconds: number }> = {
  die: { hz: 2400, q: 1.6, seconds: 0.05 },
  surface: { hz: 780, q: 0.9, seconds: 0.13 },
};

/**
 * The voice one collision makes, or null when it is too soft to hear.
 *
 * `spread` is a fraction from 0 up to 1 and moves the pitch and the length, so
 * twelve dice landing together do not make one sound twelve times. The caller
 * draws it. This function decides nothing and reads nothing.
 */
export function voiceOf(impact: TrayImpact, spread: number): Voice | null {
  if (!(impact.speed > SILENT_BELOW)) return null;
  const timbre = TIMBRE[impact.kind];
  const loudness = Math.min(1, (impact.speed - SILENT_BELOW) / (LOUDEST_AT - SILENT_BELOW));
  return {
    hz: timbre.hz * (1 + PITCH_SPREAD * (2 * spread - 1)),
    q: timbre.q,
    // The square root, because loudness is heard on a curve. A light touch
    // stays audible and a heavy landing still stands well above it.
    level: Math.sqrt(loudness),
    seconds: timbre.seconds * (0.7 + 0.6 * spread),
  };
}

/** How long the shared noise burst is. Longer than the longest voice. */
const NOISE_SECONDS = 0.25;

const NOISE = new WeakMap<BaseAudioContext, AudioBuffer>();

/**
 * One burst of noise per context, shared by every voice.
 *
 * The samples come from a generator with a fixed start, not from a random
 * source. The buffer is one fixed waveform and every voice reads the same one:
 * the variety a player hears comes from the filter and the length. A fixed
 * waveform also makes an offline render repeat exactly, which is what the
 * `--sound` mode of the browser harness measures a peak against.
 */
function noiseOf(ctx: BaseAudioContext): AudioBuffer {
  const held = NOISE.get(ctx);
  if (held) return held;
  const buffer = ctx.createBuffer(1, Math.ceil(NOISE_SECONDS * ctx.sampleRate), ctx.sampleRate);
  const samples = buffer.getChannelData(0);
  // A 32-bit xorshift. It makes no decision and is not a random source, so
  // Constraint 7 has nothing to say about it. It fills a waveform with
  // something that carries no pitch of its own.
  let state = 0x9e3779b9;
  for (let i = 0; i < samples.length; i += 1) {
    state = (state ^ (state << 13)) >>> 0;
    state = state ^ (state >>> 17);
    state = (state ^ (state << 5)) >>> 0;
    samples[i] = state / 2147483648 - 1;
  }
  NOISE.set(ctx, buffer);
  return buffer;
}

/** Build one voice and start it. Nothing is kept: the nodes free themselves. */
export function playVoice(
  ctx: BaseAudioContext,
  destination: AudioNode,
  voice: Voice,
  at: number,
): void {
  const source = ctx.createBufferSource();
  source.buffer = noiseOf(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = voice.hz;
  filter.Q.value = voice.q;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(voice.level, at);
  gain.gain.exponentialRampToValueAtTime(SILENCE, at + voice.seconds);
  source.connect(filter).connect(gain).connect(destination);
  source.start(at);
  source.stop(at + voice.seconds);
}

/**
 * What became of every collision the engine was handed.
 *
 * The four numbers add up: `impacts` equals `paired` plus `quiet` plus
 * `triggers` plus whatever arrived while sound was off. A check that compares
 * them against a count taken outside this module can see a collision the engine
 * dropped, and can see a sound this module made without one.
 */
export interface SoundCounts {
  /** Every collision handed in, sound on or off. */
  readonly impacts: number;
  /** The second report of one die-on-die contact. */
  readonly paired: number;
  /** Too soft to hear. */
  readonly quiet: number;
  /** Voices started. */
  readonly triggers: number;
}

export interface SoundEngine {
  readonly enabled: boolean;
  readonly volume: number;
  /** The context, or null while none has been built. */
  readonly context: BaseAudioContext | null;
  /** The gain every voice passes through, or null while none has been built. */
  readonly output: GainNode | null;
  readonly counts: SoundCounts;
  /** Turn sound on and build the context. The context stays suspended. */
  enable(): void;
  disable(): void;
  setVolume(level: number): void;
  /** Start the audio clock. Call this from inside a user gesture. */
  resume(): Promise<void>;
  /** Take one collision from the tray. */
  impact(event: TrayImpact): void;
}

export interface SoundEngineOptions {
  /** The stored setting. Off by default. */
  readonly enabled?: boolean;
  /** The stored level, from 0 to 1. */
  readonly volume?: number;
  /** A seam. The default builds a browser `AudioContext`. */
  readonly createContext?: () => BaseAudioContext;
  /** A seam. The default draws a fraction from `crypto.getRandomValues`. */
  readonly spread?: () => number;
}

/** Constraint 7: randomness comes from crypto, never from `Math.random`. */
function cryptoFraction(): number {
  const words = new Uint32Array(1);
  globalThis.crypto.getRandomValues(words);
  return (words[0] as number) / 4294967296;
}

/** A level outside the range reads as the nearest end of it. */
export function clampVolume(level: number): number {
  // Written this way round so that a value which is not a number reads as 0.
  if (!(level > 0)) return 0;
  return Math.min(1, level);
}

export function createSoundEngine(options: SoundEngineOptions = {}): SoundEngine {
  const createContext = options.createContext ?? ((): BaseAudioContext => new AudioContext());
  const spread = options.spread ?? cryptoFraction;
  let enabled = options.enabled === true;
  let volume = clampVolume(options.volume ?? 1);
  let built: { ctx: BaseAudioContext; gain: GainNode } | null = null;
  const counts = { impacts: 0, paired: 0, quiet: 0, triggers: 0 };

  /** Build the context, once. Nothing calls this while sound is off. */
  function build(): { ctx: BaseAudioContext; gain: GainNode } {
    if (built) return built;
    const ctx = createContext();
    const gain = ctx.createGain();
    gain.gain.value = volume;
    // Twelve dice land inside a second and their voices overlap. Their sum
    // passes 1 and the output would clip, which is heard as a tear rather than
    // as loudness. These five numbers hold a limiter rather than the default
    // compressor, which starts at -24 dB and would flatten every quiet die.
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -6;
    limiter.knee.value = 0;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.002;
    limiter.release.value = 0.15;
    gain.connect(limiter).connect(ctx.destination);
    built = { ctx, gain };
    return built;
  }

  return {
    get enabled(): boolean {
      return enabled;
    },
    get volume(): number {
      return volume;
    },
    get context(): BaseAudioContext | null {
      return built?.ctx ?? null;
    },
    get output(): GainNode | null {
      return built?.gain ?? null;
    },
    get counts(): SoundCounts {
      return { ...counts };
    },
    enable(): void {
      enabled = true;
      build();
    },
    disable(): void {
      enabled = false;
    },
    setVolume(level: number): void {
      volume = clampVolume(level);
      if (built) built.gain.gain.value = volume;
    },
    async resume(): Promise<void> {
      // `resume` belongs to `AudioContext`, not to every `BaseAudioContext`.
      // An offline context renders on demand and has no clock to start.
      const live = built?.ctx as AudioContext | undefined;
      if (live?.resume) await live.resume();
    },
    impact(event: TrayImpact): void {
      counts.impacts += 1;
      if (!enabled) return;
      // Cannon reports a new die-on-die contact on both bodies. One contact,
      // one sound: the report from the higher id is the same collision again.
      if (event.kind === 'die' && event.self > event.other) {
        counts.paired += 1;
        return;
      }
      const voice = voiceOf(event, spread());
      if (!voice) {
        counts.quiet += 1;
        return;
      }
      const { ctx, gain } = build();
      counts.triggers += 1;
      playVoice(ctx, gain, voice, ctx.currentTime);
    },
  };
}
