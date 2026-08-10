// The browser-free half of the Unit 3.5 affordance.
//
// The click answer is a pure function of the die and the profile, so it is
// measured here rather than in a browser. The shape claim needs a renderer and
// lives in `scripts/browser.mjs --affordance`.
//
// Every colour number below is computed from the hex values in `affordance.ts`
// and `scene.ts`. Neither module states a measurement of its own, so nothing
// here reads the constant it bounds.

import { describe, expect, it } from 'vitest';
import { appendValue, createDie, type Die } from '../rules/die';
import { lockState, PUSH_PROFILES, type LockState } from '../rules/push-profile';
import { clickDie, clickOutcome, LOCK_MARKER_COLOR, type ClickOutcome } from './affordance';
import { TRAY_SURFACE_COLOR } from './scene';

/** Successes lock, and a 1 on an attribute or a gear die locks as well. */
const PROFILE = PUSH_PROFILES[0]!;

/**
 * Three dice per state, over the four face counts, built so the rules core
 * decides each one. Nothing here writes a state: `lockState` reads it back
 * below and the test asserts the fixture holds all three.
 */
const POOL: readonly Die[] = [
  // Rule locks: a success, and a 1 on a die whose 1 costs a rating point.
  appendValue(createDie('rule-a', 'attribute', 6), 6),
  appendValue(createDie('rule-b', 'gear', 6), 1),
  appendValue(createDie('rule-c', 'attribute', 12), 12),
  // Player choices: no rule holds them and the player set the flag.
  appendValue(createDie('choice-a', 'skill', 6, 0, true), 3),
  appendValue(createDie('choice-b', 'skill', 10, 0, true), 4),
  appendValue(createDie('choice-c', 'bonus', 6, 0, true), 5),
  // Loose: no rule, no flag.
  appendValue(createDie('loose-a', 'skill', 6), 2),
  appendValue(createDie('loose-b', 'artifact', 8), 1),
  appendValue(createDie('loose-c', 'skill', 12), 3),
];

const stateOf = (die: Die): LockState => lockState(die, PROFILE);

describe('the fixture', () => {
  it('holds all three states, counted against the pool size', () => {
    const counts = { rule: 0, choice: 0, loose: 0 };
    for (const die of POOL) counts[stateOf(die)] += 1;
    expect(counts).toEqual({ rule: 3, choice: 3, loose: 3 });
    expect(counts.rule + counts.choice + counts.loose).toBe(POOL.length);
  });
});

describe('clickOutcome', () => {
  it('refuses a rule lock and toggles the other two, over the whole pool', () => {
    const expected: Record<LockState, ClickOutcome> = {
      rule: 'refused',
      choice: 'released',
      loose: 'kept',
    };
    const got = POOL.map((die) => [die.id, clickOutcome(die, PROFILE)]);
    expect(got).toEqual(POOL.map((die) => [die.id, expected[stateOf(die)]]));
    expect(got).toHaveLength(POOL.length);
  });
});

describe('clickDie', () => {
  it('moves every choice and loose die and no rule-locked die', () => {
    const moved: string[] = [];
    const held: string[] = [];
    for (const die of POOL) {
      const after = clickDie(POOL, die.id, PROFILE);
      const now = after.find((one) => one.id === die.id)!;
      (now.manualLock === die.manualLock ? held : moved).push(die.id);
      // Only the die that was clicked may change.
      const others = after.filter((one) => one.id !== die.id);
      expect(others).toEqual(POOL.filter((one) => one.id !== die.id));
    }
    expect(held).toEqual(POOL.filter((die) => stateOf(die) === 'rule').map((die) => die.id));
    expect(moved).toEqual(POOL.filter((die) => stateOf(die) !== 'rule').map((die) => die.id));
    expect(held.length + moved.length).toBe(POOL.length);
  });

  it('sends a loose die to choice and a choice die back to loose', () => {
    const loose = POOL.find((die) => stateOf(die) === 'loose')!;
    const kept = clickDie(POOL, loose.id, PROFILE).find((die) => die.id === loose.id)!;
    expect(stateOf(kept)).toBe('choice');
    expect(stateOf(clickDie([kept], kept.id, PROFILE)[0]!)).toBe('loose');
  });

  it('changes neither the pool it is given nor any die in it', () => {
    const before = structuredClone(POOL);
    clickDie(POOL, 'loose-a', PROFILE);
    expect(POOL).toEqual(before);
  });

  it('gives the pool back unchanged for an id it does not hold', () => {
    expect(clickDie(POOL, 'no-such-die', PROFILE)).toEqual(POOL);
  });
});

// ---------------------------------------------------------------------------
// The colour axis. Shape carries the state; these numbers say the colour is a
// second, redundant carrier and not a weak one.
// ---------------------------------------------------------------------------

/** WCAG 1.4.11, the floor for a graphical object that carries meaning. */
const MIN_SURFACE_CONTRAST = 3;
/** The floor between the two marks, so the pair reads in greyscale as well. */
const MIN_MARK_CONTRAST = 2;

type Rgb = [number, number, number];

function toLinear(hex: string): Rgb {
  const channels = [1, 3, 5].map((start) => {
    const value = Number.parseInt(hex.slice(start, start + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return [channels[0] ?? 0, channels[1] ?? 0, channels[2] ?? 0];
}

function luminance([r, g, b]: Rgb): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: Rgb, b: Rgb): number {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (high + 0.05) / (low + 0.05);
}

describe('LOCK_MARKER_COLOR', () => {
  const marks = Object.keys(LOCK_MARKER_COLOR) as (keyof typeof LOCK_MARKER_COLOR)[];

  it('covers the two marked states and no others', () => {
    expect(marks.sort()).toEqual(['choice', 'rule']);
  });

  it.each(marks)('separates %s from the tray surface', (mark) => {
    const measured = contrast(toLinear(LOCK_MARKER_COLOR[mark]), toLinear(TRAY_SURFACE_COLOR));
    expect(measured).toBeGreaterThanOrEqual(MIN_SURFACE_CONTRAST);
  });

  it('separates the two marks from each other in luminance', () => {
    const measured = contrast(toLinear(LOCK_MARKER_COLOR.rule), toLinear(LOCK_MARKER_COLOR.choice));
    expect(measured).toBeGreaterThanOrEqual(MIN_MARK_CONTRAST);
  });
});
