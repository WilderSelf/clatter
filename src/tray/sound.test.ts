// Unit 3.6. The parts of the sound engine that need no browser.
//
// The browser half — that no `AudioContext` is built until the player asks for
// one, that the context stays suspended until a gesture, that the collisions of
// a real throw drive the count, and that a level of zero renders silence — is
// the `--sound` mode of `scripts/browser.mjs`. It needs a real audio graph and
// a real physics world, and it stays out of `validate` for the same reason
// every other browser mode does.
//
// What is asserted here is the accounting and the gate: a collision handed to a
// silent engine builds nothing and starts nothing.

import { describe, expect, it } from 'vitest';
import type { TrayImpact } from './vendor/dice-tray.js';
import {
  clampVolume,
  createSoundEngine,
  FILTERS_PER_VOICE,
  LOUDEST_AT,
  SILENT_BELOW,
  voiceOf,
} from './sound';

/** A collision, named so a failure says which one. */
function impact(kind: TrayImpact['kind'], speed: number, self = 1, other = 2): TrayImpact {
  return { kind, speed, self, other };
}

interface FakeGain {
  gain: { value: number; setValueAtTime(value: number, at: number): void };
}
interface FakeFilter {
  frequency: { value: number };
}

/**
 * Enough of a `BaseAudioContext` for the engine to run under a plain runner.
 *
 * It records what was built rather than what was heard. The first gain is the
 * one the engine connects to the destination, so `gains[0]` is the output the
 * player's volume must reach, and every voice builds `FILTERS_PER_VOICE`
 * filters.
 */
function fakeContext(): {
  ctx: BaseAudioContext;
  gains: FakeGain[];
  filters: FakeFilter[];
  levels: number[];
} {
  const gains: FakeGain[] = [];
  const filters: FakeFilter[] = [];
  const levels: number[] = [];
  const ctx = {
    sampleRate: 48000,
    currentTime: 0,
    destination: {},
    createBuffer: (channels: number, length: number, sampleRate: number) => ({
      length,
      sampleRate,
      numberOfChannels: channels,
      getChannelData: (): Float32Array => new Float32Array(length),
    }),
    createBufferSource: () => ({
      buffer: null,
      connect: (next: unknown) => next,
      start: (): void => {},
      stop: (): void => {},
    }),
    createBiquadFilter: () => {
      const filter = {
        type: '',
        frequency: { value: 0 },
        Q: { value: 0 },
        connect: (next: unknown) => next,
      };
      filters.push(filter);
      return filter;
    },
    createGain: () => {
      const gain = {
        gain: {
          value: 1,
          setValueAtTime: (value: number): void => {
            levels.push(value);
          },
          exponentialRampToValueAtTime: (): void => {},
        },
        connect: (next: unknown) => next,
      };
      gains.push(gain);
      return gain;
    },
    createDynamicsCompressor: () => ({
      threshold: { value: 0 },
      knee: { value: 0 },
      ratio: { value: 0 },
      attack: { value: 0 },
      release: { value: 0 },
      connect: (next: unknown) => next,
    }),
  };
  return { ctx: ctx as unknown as BaseAudioContext, gains, filters, levels };
}

describe('voiceOf', () => {
  it('says nothing at all below the floor', () => {
    expect(voiceOf(impact('die', SILENT_BELOW), 0.5)).toBeNull();
    expect(voiceOf(impact('surface', 0), 0.5)).toBeNull();
    expect(voiceOf(impact('die', SILENT_BELOW + 1), 0.5)).not.toBeNull();
  });

  it('makes a heavy impact louder than a glancing one', () => {
    const glancing = voiceOf(impact('die', SILENT_BELOW + 40), 0.5);
    const heavy = voiceOf(impact('die', LOUDEST_AT), 0.5);
    expect(glancing?.level).toBeGreaterThan(0);
    expect(heavy?.level).toBeGreaterThan(glancing?.level ?? 1);
    expect(heavy?.level).toBeCloseTo(1);
  });

  it('gives a die and the table two different sounds', () => {
    const rattle = voiceOf(impact('die', LOUDEST_AT), 0.5);
    const clatter = voiceOf(impact('surface', LOUDEST_AT), 0.5);
    expect(rattle?.hz).toBeGreaterThan(clatter?.hz ?? Infinity);
    expect(clatter?.seconds).toBeGreaterThan(rattle?.seconds ?? Infinity);
  });

  it('gives every voice a body that is lower than its knock and outlasts it', () => {
    // Weight is this property and nothing else: a low band under the contact,
    // carrying real level, still sounding after the knock has gone. A voice
    // whose body died with its knock reads as a click however low it is tuned.
    for (const kind of ['die', 'surface'] as const) {
      const voice = voiceOf(impact(kind, LOUDEST_AT), 0.5);
      expect(voice?.bodyHz, `${kind}: the body sits under the knock`).toBeLessThan(voice?.hz ?? 0);
      expect(voice?.seconds, `${kind}: the body outlasts the knock`).toBeGreaterThan(
        voice?.knockSeconds ?? Infinity,
      );
      expect(voice?.bodyShare, `${kind}: the body carries real level`).toBeGreaterThan(0.25);
    }
    // Leather takes the knock out of a landing and leaves the thud. Wood on
    // wood keeps more of its knock.
    const die = voiceOf(impact('die', LOUDEST_AT), 0.5);
    const surface = voiceOf(impact('surface', LOUDEST_AT), 0.5);
    expect(surface?.bodyShare, 'the mat is more body than the dice are').toBeGreaterThan(
      die?.bodyShare ?? 1,
    );
  });

  it('moves the pitch and the length with the spread it is given', () => {
    const low = voiceOf(impact('die', LOUDEST_AT), 0);
    const high = voiceOf(impact('die', LOUDEST_AT), 0.999);
    expect(high?.hz).toBeGreaterThan(low?.hz ?? Infinity);
    expect(high?.seconds).toBeGreaterThan(low?.seconds ?? Infinity);
    // The same collision, so the loudness may not move with the spread.
    expect(high?.level).toBe(low?.level);
  });
});

describe('clampVolume', () => {
  it('holds a level inside 0 to 1 and reads anything else as an end of it', () => {
    expect(clampVolume(0.25)).toBe(0.25);
    expect(clampVolume(0)).toBe(0);
    expect(clampVolume(-3)).toBe(0);
    expect(clampVolume(11)).toBe(1);
    expect(clampVolume(Number.NaN)).toBe(0);
  });
});

describe('the sound engine', () => {
  it('builds no context and starts no voice while sound is off', () => {
    let contexts = 0;
    const engine = createSoundEngine({
      enabled: false,
      createContext: () => {
        contexts += 1;
        return fakeContext().ctx;
      },
    });
    for (let i = 0; i < 20; i += 1) engine.impact(impact('surface', LOUDEST_AT, 1, 0));

    expect(contexts, 'nothing built an audio context').toBe(0);
    expect(engine.context, 'the engine holds no context').toBeNull();
    expect(engine.counts.triggers, 'no voice started').toBe(0);
    expect(engine.counts.impacts, 'every collision was still counted').toBe(20);
  });

  it('builds one context when the player turns sound on, and the volume reaches the output', () => {
    const fake = fakeContext();
    let contexts = 0;
    const engine = createSoundEngine({
      volume: 0.25,
      createContext: () => {
        contexts += 1;
        return fake.ctx;
      },
    });
    engine.enable();
    engine.enable();

    expect(contexts, 'one context, however often the player turns it on').toBe(1);
    expect(engine.output, 'the engine holds an output gain').not.toBeNull();
    expect(fake.gains[0]?.gain.value, 'the stored level reached the output gain').toBe(0.25);
    engine.setVolume(0.8);
    expect(fake.gains[0]?.gain.value, 'a new level reaches the same gain').toBe(0.8);
  });

  it('accounts for every collision it was handed', () => {
    const fake = fakeContext();
    const engine = createSoundEngine({ createContext: () => fake.ctx, spread: () => 0.5 });
    engine.enable();

    const stream: TrayImpact[] = [
      impact('surface', LOUDEST_AT, 3, 0), // heard
      impact('surface', 10, 3, 0), // too soft
      impact('die', LOUDEST_AT, 3, 7), // heard
      impact('die', LOUDEST_AT, 7, 3), // the same contact, reported again
      impact('die', 5, 3, 7), // too soft
    ];
    for (const one of stream) engine.impact(one);

    const counts = engine.counts;
    expect(counts.impacts, 'every collision counted').toBe(stream.length);
    expect(counts.triggers, 'two voices').toBe(2);
    expect(counts.paired, 'one second report of one contact').toBe(1);
    expect(counts.quiet, 'two below the floor').toBe(2);
    expect(
      counts.paired + counts.quiet + counts.triggers,
      'the three outcomes account for the whole stream',
    ).toBe(counts.impacts);
    // Filters against voices, at the fixed rate one voice builds them. The
    // constant is the bridge, so the check still catches a voice that reached
    // the graph with no filter at all, and an impact that made two voices.
    expect(fake.filters.length, 'every voice built its whole filter chain').toBe(
      counts.triggers * FILTERS_PER_VOICE,
    );
  });

  it('is silent at a level of zero, and a level of zero is not the same as off', () => {
    const fake = fakeContext();
    const engine = createSoundEngine({ volume: 0, createContext: () => fake.ctx });
    engine.enable();
    engine.impact(impact('surface', LOUDEST_AT, 1, 0));

    expect(fake.gains[0]?.gain.value, 'the output gain is shut').toBe(0);
    expect(engine.counts.triggers, 'the collision still started a voice').toBe(1);
    expect(engine.context, 'a context exists, which is what off does not have').not.toBeNull();
  });
});
