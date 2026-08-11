// The browser-free half of the Unit 3.5 affordance.
//
// The click answer is a pure function of the die and the profile, so it is
// measured here rather than in a browser. The shape claim needs a renderer and
// lives in `scripts/browser.mjs --affordance`.
//
// Every colour number below is computed from the rows of `themes.ts`, through
// the token map `affordance.ts` holds. Neither module states a measurement of
// its own, so nothing here reads the constant it bounds, and the arithmetic is
// this file's own copy rather than `contrast.ts`.

import { describe, expect, it } from 'vitest';
import { appendValue, createDie, type Die } from '../rules/die';
import { lockState, PUSH_PROFILES, type LockState } from '../rules/push-profile';
import {
  INTERFACE_PALETTES,
  THEME_IDS,
  TRAY_SURFACES,
  type InterfacePalette,
  type ThemeId,
} from '../theme/themes';
import {
  clickDie,
  clickOutcome,
  lockMarkerColours,
  type ClickOutcome,
  type MarkedState,
} from './affordance';

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

const MARKED: readonly MarkedState[] = ['rule', 'choice'];

/** The mark colours one theme names. */
const marksOf = (id: ThemeId): Readonly<Record<MarkedState, string>> =>
  lockMarkerColours(INTERFACE_PALETTES[id]);

/** Every colour a palette holds, so a mark can be traced back to a row. */
const valuesOf = (palette: InterfacePalette): string[] =>
  Object.values(palette).map((colour) => colour.toUpperCase());

const ratio = (a: string, b: string): number => contrast(toLinear(a), toLinear(b));

describe('the lock marker colours', () => {
  it('names the two marked states and no others', () => {
    expect(Object.keys(marksOf('leather')).sort()).toEqual(['choice', 'rule']);
  });

  // **The mark follows the theme.** The claim is not that the colour came out
  // of some palette. It is that the colour came out of THIS theme's palette and
  // out of no other one, so a row is what moves it. A colour held in
  // `affordance.ts` fails both halves: it is in no palette, and it is the same
  // for all six rows.
  it.each(MARKED)('draws %s out of the row the theme names, and out of no other', (mark) => {
    const drawn = THEME_IDS.map((id) => marksOf(id)[mark].toUpperCase());
    expect(drawn).toHaveLength(THEME_IDS.length);
    expect(new Set(drawn).size).toBe(THEME_IDS.length);
    const stray = THEME_IDS.flatMap((id, at) => {
      const mine = drawn[at]!;
      const mineIsHers = valuesOf(INTERFACE_PALETTES[id]).includes(mine);
      const elsewhere = THEME_IDS.filter(
        (other) => other !== id && valuesOf(INTERFACE_PALETTES[other]).includes(mine),
      );
      return mineIsHers && elsewhere.length === 0
        ? []
        : [`${id} ${mark} is ${mine}, in its own row=${mineIsHers}, also in [${elsewhere}]`];
    });
    expect(stray).toEqual([]);
  });

  // Every mark against every surface, and not the six matched pairs alone: a
  // theme a player builds derives the palette and keeps a SHIPPED tray row, so
  // any palette can land on any of the six tables. `css-vars.ts` settles that.
  it.each(MARKED)('keeps %s clear of every tray surface', (mark) => {
    const readings = THEME_IDS.flatMap((id) =>
      THEME_IDS.map((table) => ({
        pair: `${id} ${mark} on the ${table} table`,
        measured: ratio(marksOf(id)[mark], TRAY_SURFACES[table]),
      })),
    );
    expect(readings).toHaveLength(THEME_IDS.length ** 2);
    expect(readings.filter((one) => one.measured < MIN_SURFACE_CONTRAST)).toEqual([]);
  });

  it('separates the two marks from each other in luminance, in every theme', () => {
    const readings = THEME_IDS.map((id) => ({
      pair: `the two marks of ${id}`,
      measured: ratio(marksOf(id).rule, marksOf(id).choice),
    }));
    expect(readings).toHaveLength(THEME_IDS.length);
    expect(readings.filter((one) => one.measured < MIN_MARK_CONTRAST)).toEqual([]);
  });

  // The measurement that keeps the success and bane marks OUT of the theme,
  // taken here beside the one that puts the lock marks into it. The two read as
  // one shade in greyscale, so hue is the whole of their colour separation and
  // a theme that moved it would leave them nothing. The lock marks are the
  // other case, which the reading above states.
  it('finds the success and bane marks separated by hue alone, in every theme', () => {
    const readings = THEME_IDS.map((id) => ({
      pair: `the success and bane marks of ${id}`,
      measured: ratio(INTERFACE_PALETTES[id].markSuccess, INTERFACE_PALETTES[id].markBane),
    }));
    expect(readings).toHaveLength(THEME_IDS.length);
    expect(readings.filter((one) => one.measured >= MIN_MARK_CONTRAST)).toEqual([]);
  });
});
