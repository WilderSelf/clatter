import { describe, expect, it } from 'vitest';
import type { Die, DieType, Faces } from './die';
import { createDie, latestValue } from './die';
import { buildPool, poolBuilder } from './pool';
import { seededRandom } from './seeded-random';
import { score } from './success';
import { baneCount, roll, successCount } from './roll';

// ---------------------------------------------------------------------------
// The spec, restated. Nothing below reads SUCCESS_TABLE, DICE_TYPES or CURVES,
// so a skewed table moves the module and this file apart.
// ---------------------------------------------------------------------------

/**
 * A curve as its thresholds in rising order, from specs/0001-rules-model.md,
 * section "Success curves". The k-th threshold pays k successes, so
 * `P(score >= k)` is `(faces - thresholds[k - 1] + 1) / faces`.
 *
 * Pool die: 6 -> 1. Step die: below 6 -> 0, 6 to 9 -> 1, 10 and above -> 2.
 * Artifact die, escalating: >=6 -> 1, >=8 -> 2, >=10 -> 3, >=12 -> 4.
 */
const POOL_CURVE: readonly number[] = [6];
const STEP_CURVE: readonly number[] = [6, 10];
const ARTIFACT_ESCALATING: readonly number[] = [6, 8, 10, 12];

interface SpecRow {
  readonly type: DieType;
  readonly faces: readonly Faces[];
  readonly thresholds: readonly number[];
}

/**
 * One row per dice type and face count, from the spec's "Dice types" table.
 * An attribute or skill die is a pool die at six faces and a step die above
 * that. An artifact die is always a step die and never has six faces. Gear,
 * bonus and stress dice are six-faced pool dice.
 */
const SPEC_ROWS: readonly SpecRow[] = [
  { type: 'attribute', faces: [6], thresholds: POOL_CURVE },
  { type: 'attribute', faces: [8, 10, 12], thresholds: STEP_CURVE },
  { type: 'skill', faces: [6], thresholds: POOL_CURVE },
  { type: 'skill', faces: [8, 10, 12], thresholds: STEP_CURVE },
  { type: 'gear', faces: [6], thresholds: POOL_CURVE },
  { type: 'artifact', faces: [8, 10, 12], thresholds: ARTIFACT_ESCALATING },
  { type: 'bonus', faces: [6], thresholds: POOL_CURVE },
  { type: 'stress', faces: [6], thresholds: POOL_CURVE },
];

/** Every dice type and face count the spec allows. 14, computed here. */
const COMBINATIONS = SPEC_ROWS.reduce((total, row) => total + row.faces.length, 0);

interface Combination {
  readonly key: string;
  readonly type: DieType;
  readonly faces: Faces;
  /** `P(score >= k)` for k = 1, 2, ... Only reachable thresholds are listed. */
  readonly successRates: readonly number[];
  /** A bane is a 1, so every die banes on one face of the die. */
  readonly baneRate: number;
}

const COMBINATION_LIST: readonly Combination[] = SPEC_ROWS.flatMap((row) =>
  row.faces.map((faces) => ({
    key: `${row.type} d${faces}`,
    type: row.type,
    faces,
    successRates: row.thresholds
      .filter((threshold) => threshold <= faces)
      .map((threshold) => (faces - threshold + 1) / faces),
    baneRate: 1 / faces,
  })),
);

/** One success rate per reachable threshold, plus one bane rate, per combination. */
const INDICATORS = COMBINATION_LIST.reduce(
  (total, combination) => total + combination.successRates.length + 1,
  0,
);

const SEEDS: readonly number[] = [
  1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765, 10946,
];

const ROLLS = 10_000;

/** At least 19 of the 20 seeds must hold every bound. */
const SEEDS_REQUIRED = 19;

/**
 * The z multiplier is a confidence level, not a tolerance on the rate. There is
 * no epsilon anywhere in this file: every bound is `z * sqrt(p * (1 - p) / n)`
 * from the n and the p of that indicator.
 *
 * At z = 4.5 the two-sided per-indicator false-failure probability is about
 * 6.8e-6. `INDICATORS` counts what one seed checks, which is 38 while the spec
 * table stands as it is, so a seed fails by chance about 2.6e-4 of the time,
 * and two or more of 20 seeds fail about 1.3e-5 of the time. The 19-of-20 rule
 * is therefore not itself flaky.
 *
 * The bound stays far narrower than the defect it must catch. Changing one
 * entry of a success table moves some `P(score >= k)` by exactly one face,
 * which is at least 1/12, or 0.0833. The widest bound this file computes is
 * 4.5 * sqrt(0.25 / 10000), or 0.0225. The smallest defect is therefore at
 * least 3.7 times the widest tolerance.
 */
const Z = 4.5;

function bound(p: number, n: number): number {
  return Z * Math.sqrt((p * (1 - p)) / n);
}

interface Tally {
  observations: number;
  banes: number;
  /** One counter per reachable threshold. */
  atLeast: number[];
  /** Scores above the top reachable threshold. The spec allows none. */
  aboveTop: number;
}

function zeroByType(): Record<DieType, number> {
  return { attribute: 0, skill: 0, gear: 0, artifact: 0, bonus: 0, stress: 0 };
}

describe('roll', () => {
  it('does not change the pool it is given', () => {
    const pool = buildPool(poolBuilder({ attribute: 2, skill: 1, gear: 1, stress: 1 }));
    for (const die of pool) {
      Object.freeze(die.values);
      Object.freeze(die);
    }
    Object.freeze(pool);
    const before = JSON.stringify(pool);

    // A frozen object throws on a write, because a module is always strict.
    const result = roll({ dice: pool, stressBefore: 0 }, seededRandom(42));

    expect(JSON.stringify(pool), 'the input pool is unchanged').toBe(before);
    expect(
      pool.map((die) => die.values),
      'no die in the input pool took a value',
    ).toEqual([[], [], [], [], []]);
    expect(
      result.dice.map((die) => die.values.length),
      'every die in the result holds one generation',
    ).toEqual([1, 1, 1, 1, 1]);
    expect(result.dice[0], 'the result holds new die objects').not.toBe(pool[0]);
  });

  it('counts successes and banes from a fixture roll', () => {
    // Values are forced, so the expectation is hand-written and not derived.
    const faces = [6, 1, 1, 4, 1];
    const forced = { face: () => faces.shift() ?? 0 };
    const pool = buildPool(poolBuilder({ attribute: 2, skill: 1, gear: 1, stress: 1 }));
    const result = roll({ dice: pool, stressBefore: 2 }, forced);

    expect(result.dice.map(latestValue), 'the forced values landed in order').toEqual([
      6, 1, 1, 4, 1,
    ]);
    expect(successCount(result), 'one 6 on a pool die is one success').toBe(1);
    expect(baneCount(result), 'a bane is a 1, counted by type').toEqual({
      attribute: 1,
      skill: 1,
      gear: 0,
      artifact: 0,
      stress: 1,
      bonus: 0,
    });
  });

  it('carries the stress the request came with, and writes it onto no die', () => {
    const pool = buildPool(poolBuilder({ attribute: 1, stress: 3 }));
    const result = roll({ dice: pool, stressBefore: 3 }, seededRandom(11));

    expect(result.stressAfter, 'a first roll adds no stress of its own').toBe(3);
    let read = 0;
    for (const die of result.dice) {
      expect(Object.keys(die).sort(), `${die.id} carries no stress field`).toEqual([
        'faces',
        'id',
        'manualLock',
        'type',
        'values',
      ]);
      read += 1;
    }
    expect(read, 'every die in the roll was read').toBe(pool.length);
    expect(pool.length, 'one attribute die and three stress dice').toBe(4);
  });
});

describe('the roll distribution, over 20 seeds x 10,000 rolls', () => {
  it(
    'holds every success rate and every bane rate inside a binomial bound',
    { timeout: 120_000 },
    () => {
      // One die per dice type and face count, so a single pool covers the whole
      // enumeration and a missing type shows up as a missing key.
      const pool: readonly Die[] = COMBINATION_LIST.map((combination) =>
        createDie(combination.key, combination.type, combination.faces),
      );

      const failures: string[] = [];
      let seedsPassed = 0;
      let indicatorsChecked = 0;
      let combinationsChecked = 0;

      for (const seed of SEEDS) {
        const random = seededRandom(seed);
        const tallies = new Map<string, Tally>(
          COMBINATION_LIST.map((combination) => [
            combination.key,
            {
              observations: 0,
              banes: 0,
              atLeast: combination.successRates.map(() => 0),
              aboveTop: 0,
            },
          ]),
        );
        // The module's own aggregates, tied to the per-die counts below.
        let reportedSuccesses = 0;
        const reportedBanes = zeroByType();
        let countedSuccesses = 0;
        const countedBanes = zeroByType();

        for (let index = 0; index < ROLLS; index += 1) {
          const result = roll({ dice: pool, stressBefore: 0 }, random);
          reportedSuccesses += successCount(result);
          const banes = baneCount(result);
          for (const type of Object.keys(banes) as DieType[]) {
            reportedBanes[type] += banes[type];
          }
          for (const die of result.dice) {
            const tally = tallies.get(die.id);
            if (tally === undefined) {
              throw new Error(`no tally for ${die.id}`);
            }
            tally.observations += 1;
            if (latestValue(die) === 1) {
              tally.banes += 1;
              countedBanes[die.type] += 1;
            }
            const successes = score(die);
            countedSuccesses += successes;
            for (let k = 1; k <= tally.atLeast.length; k += 1) {
              if (successes >= k) {
                tally.atLeast[k - 1] = (tally.atLeast[k - 1] ?? 0) + 1;
              }
            }
            if (successes > tally.atLeast.length) {
              tally.aboveTop += 1;
            }
          }
        }

        expect(reportedSuccesses, `seed ${seed}: successCount matches the per-die scores`).toBe(
          countedSuccesses,
        );
        expect(reportedBanes, `seed ${seed}: baneCount matches the per-die banes`).toEqual(
          countedBanes,
        );

        let seedHeld = true;
        for (const combination of COMBINATION_LIST) {
          const tally = tallies.get(combination.key);
          if (tally === undefined) {
            throw new Error(`no tally for ${combination.key}`);
          }
          combinationsChecked += 1;
          expect(tally.observations, `${combination.key} rolled ${ROLLS} times`).toBe(ROLLS);
          expect(
            tally.aboveTop,
            `${combination.key}: no face may score above the top threshold the spec names`,
          ).toBe(0);

          const measurements: { label: string; measured: number; expected: number }[] = [
            {
              label: `${combination.key} banes`,
              measured: tally.banes / ROLLS,
              expected: combination.baneRate,
            },
            ...combination.successRates.map((expected, offset) => ({
              label: `${combination.key} successes>=${offset + 1}`,
              measured: (tally.atLeast[offset] ?? 0) / ROLLS,
              expected,
            })),
          ];

          for (const measurement of measurements) {
            indicatorsChecked += 1;
            const tolerance = bound(measurement.expected, ROLLS);
            if (Math.abs(measurement.measured - measurement.expected) > tolerance) {
              seedHeld = false;
              failures.push(
                `seed ${seed} ${measurement.label}: measured ${measurement.measured.toFixed(5)}, ` +
                  `expected ${measurement.expected.toFixed(5)} +- ${tolerance.toFixed(5)}`,
              );
            }
          }
        }
        if (seedHeld) {
          seedsPassed += 1;
        }
      }

      // Counted denominators. A silently skipped dice type, face count or
      // threshold lands here, not in a rate.
      expect(combinationsChecked, 'every combination was measured under every seed').toBe(
        COMBINATIONS * SEEDS.length,
      );
      expect(indicatorsChecked, 'every indicator was measured under every seed').toBe(
        INDICATORS * SEEDS.length,
      );
      expect(COMBINATION_LIST.length, 'the enumeration holds every spec combination').toBe(
        COMBINATIONS,
      );

      expect(
        seedsPassed,
        `${seedsPassed} of ${SEEDS.length} seeds held. ${failures.length} bounds broke. ` +
          failures.slice(0, 8).join(' | '),
      ).toBeGreaterThanOrEqual(SEEDS_REQUIRED);
    },
  );
});
