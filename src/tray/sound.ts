// Tray sound. Every sound is made here, in code, with the Web Audio API.
//
// The repository holds no audio file and fetches none. Unit 3.1 deleted the
// library's own 540,987 bytes of them, and a sample taken from anywhere else is
// a dependency and a licence question at once.
//
// The tray the sound describes is a wooden die on a leather mat over a table.
// A voice is a short burst of noise through two band-pass filters and one
// low-pass filter. The low band is the body of the wood and carries the weight.
// The mid band is the knock of the contact itself. The low-pass is the leather,
// which damps the high end hard. A single narrow band with no low content and
// no roll-off above is what makes a synthesised impact sound tinny.
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
  /** The centre of the knock band, in hertz. */
  readonly hz: number;
  /** The width of the knock band. A low number is broad, which reads as wood. */
  readonly q: number;
  /** Peak gain of this voice alone, before the volume the player set. */
  readonly level: number;
  /** How long it takes to fall to silence. The body sets this, not the knock. */
  readonly seconds: number;
  /** The centre of the body band, in hertz. */
  readonly bodyHz: number;
  /** The part of `level` the body carries. The knock carries the rest. */
  readonly bodyShare: number;
  /** How long the knock lasts. Shorter than `seconds`, and that is the weight. */
  readonly knockSeconds: number;
}

/** The width of every body band. Broad enough to read as wood, not as a bell. */
const BODY_Q = 1.1;

/**
 * The two timbres. Both are wood, and the surface under the dice is leather.
 *
 * A die meeting a die is the rattle: a knock of wood on wood, with a short body
 * under it. A die meeting a wall or the mat is the clatter: a thud, where the
 * low band carries most of the level and outlasts the knock by a long way.
 * Leather absorbs the high end, so neither timbre has a bright band at all.
 */
const TIMBRE: Record<TrayImpact['kind'], Omit<Voice, 'level'>> = {
  die: { hz: 950, q: 0.7, seconds: 0.075, bodyHz: 220, bodyShare: 0.45, knockSeconds: 0.045 },
  surface: { hz: 330, q: 0.8, seconds: 0.17, bodyHz: 120, bodyShare: 0.75, knockSeconds: 0.075 },
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
  // Both bands move together, so a voice keeps its shape as the pitch moves.
  const pitch = 1 + PITCH_SPREAD * (2 * spread - 1);
  const length = 0.7 + 0.6 * spread;
  return {
    hz: timbre.hz * pitch,
    q: timbre.q,
    // The square root, because loudness is heard on a curve. A light touch
    // stays audible and a heavy landing still stands well above it.
    level: Math.sqrt(loudness),
    seconds: timbre.seconds * length,
    bodyHz: timbre.bodyHz * pitch,
    bodyShare: timbre.bodyShare,
    knockSeconds: timbre.knockSeconds * length,
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

/**
 * Where the leather stops the sound, in hertz.
 *
 * This is the single largest part of the cure for a tinny tray. A wooden die on
 * a leather mat has almost nothing above two kilohertz.
 */
const DAMPING_HZ = 1800;

/**
 * The Q of that low-pass, which the Web Audio specification reads in decibels
 * for a low-pass and a high-pass, and as a plain number for a band-pass. This
 * value is 20*log10(1/sqrt(2)), which is the flat corner. Do not write 0.707
 * here: under the decibel reading that is a resonant peak at the corner, which
 * is the brightness this filter exists to remove.
 */
const DAMPING_Q = -3.01;

/**
 * How many band-pass filters cover one kilohertz of white noise.
 *
 * A band-pass passes what its width lets through, and a band is `hz / q` wide.
 * A low body band is therefore far narrower than a mid knock band and would be
 * inaudible at the same gain. Each band is scaled against this width, so a
 * share of the level means a share of what the player hears.
 */
const BAND_WIDTH_REFERENCE = 1200;

/**
 * The trim that holds the tray at the loudness it had before the timbres
 * changed. Measured: at this value the loudest single voice of either timbre
 * peaks at 0.42 to 0.46, against the 0.47 the old single-band voice reached.
 */
const VOICE_GAIN = 3;

/** One band of one voice: a band-pass, then its own fall to silence. */
function playBand(
  ctx: BaseAudioContext,
  source: AudioNode,
  destination: AudioNode,
  hz: number,
  q: number,
  level: number,
  at: number,
  seconds: number,
): void {
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = hz;
  filter.Q.value = q;
  const gain = ctx.createGain();
  const peak = level * VOICE_GAIN * Math.sqrt((BAND_WIDTH_REFERENCE * q) / hz);
  gain.gain.setValueAtTime(peak, at);
  gain.gain.exponentialRampToValueAtTime(SILENCE, at + seconds);
  source.connect(filter).connect(gain).connect(destination);
}

/**
 * How many filters one voice builds: two band-passes and one low-pass.
 *
 * A check counts filters against voices, so this number is the bridge between
 * them. It is exported for that check alone.
 */
export const FILTERS_PER_VOICE = 3;

/** Build one voice and start it. Nothing is kept: the nodes free themselves. */
export function playVoice(
  ctx: BaseAudioContext,
  destination: AudioNode,
  voice: Voice,
  at: number,
): void {
  const source = ctx.createBufferSource();
  source.buffer = noiseOf(ctx);
  // The leather sits between both bands and the player, so one low-pass takes
  // the whole voice and not one band of it.
  const damping = ctx.createBiquadFilter();
  damping.type = 'lowpass';
  damping.frequency.value = DAMPING_HZ;
  damping.Q.value = DAMPING_Q;
  damping.connect(destination);
  const share = voice.bodyShare;
  playBand(
    ctx,
    source,
    damping,
    voice.hz,
    voice.q,
    voice.level * (1 - share),
    at,
    voice.knockSeconds,
  );
  playBand(ctx, source, damping, voice.bodyHz, BODY_Q, voice.level * share, at, voice.seconds);
  source.start(at);
  // The body is the long band, so the voice lasts as long as the body does.
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
