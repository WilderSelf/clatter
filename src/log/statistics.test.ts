// The three statistics, and the rule that gives them their value: they read the
// stored derived values and never re-derive one.
//
// The hand-built fixture below is also a trap for a re-deriving reader. Every
// cell holds the value 2, which is worth no successes on any curve, while the
// stored `successes` of those same cells say otherwise. A summary that read
// `cell.value` and asked the success table again would report zero successes
// everywhere and fail the first test in this file.
//
// The expectations are written out as literals, computed by hand from the table
// of cases. Nothing in this file calls `summariseLog` to work out what
// `summariseLog` should answer.

import { describe, expect, it } from 'vitest';
import type { Faces } from '../rules/die';
import { buildPool, poolBuilder } from '../rules/pool';
import { push, pushCost } from '../rules/push';
import type { PushCostUnit, PushProfile } from '../rules/push-profile';
import { mergeProfile, PUSH_PROFILES } from '../rules/push-profile';
import type { RollResult } from '../rules/roll';
import { roll, successCount } from '../rules/roll';
import { seededRandom } from '../rules/seeded-random';
import { createLogEntry } from './entry';
import type { LogEntry, LoggedDie } from './entry';
import { PAID_OFF_DEFINITION, summariseLog } from './statistics';

/**
 * A face worth no successes on any curve. Every cell of the hand-built log
 * holds it, so a summary that re-derived from the value would answer zero.
 */
const INERT_FACE = 2;

interface Case {
  readonly name: string;
  readonly poolSize: number;
  /** Successes stored at each generation, oldest first. */
  readonly successesPerGeneration: readonly number[];
  readonly costType: PushCostUnit;
  readonly costAmount: number;
}

/** The first `successes` dice of the pool each score one at that generation. */
function loggedDice(one: Case): LoggedDie[] {
  return Array.from({ length: one.poolSize }, (_, die) => ({
    type: 'attribute' as const,
    faces: 6 as Faces,
    cells: one.successesPerGeneration.map((successes) => ({
      value: INERT_FACE,
      successes: die < successes ? 1 : 0,
      locked: false,
    })),
  }));
}

function fixtureEntry(one: Case): LogEntry {
  const generations = one.successesPerGeneration.length;
  return {
    rollId: one.name,
    timestampIso: '2026-08-09T09:00:00.000Z',
    ruleset: 'a-profile-the-summary-never-reads',
    profileHash: 'a-hash-the-summary-never-reads',
    mode: 'pool',
    dice: loggedDice(one),
    successes: one.successesPerGeneration[generations - 1] ?? 0,
    banes: 0,
    pushCount: generations - 1,
    costType: one.costType,
    costAmount: one.costAmount,
    stressBefore: 0,
    stressAfter: 0,
    note: '',
  };
}

/** The six cases, named. The count below is asserted against this list. */
const CASES: readonly Case[] = [
  {
    name: 'three dice, no push, no success',
    poolSize: 3,
    successesPerGeneration: [0],
    costType: 'ratingPoint',
    costAmount: 0,
  },
  {
    name: 'three dice, no push, one success',
    poolSize: 3,
    successesPerGeneration: [1],
    costType: 'ratingPoint',
    costAmount: 0,
  },
  {
    name: 'three dice, one push, none to two',
    poolSize: 3,
    successesPerGeneration: [0, 2],
    costType: 'ratingPoint',
    costAmount: 2,
  },
  {
    name: 'five dice, one push, two to two',
    poolSize: 5,
    successesPerGeneration: [2, 2],
    costType: 'ratingPoint',
    costAmount: 1,
  },
  {
    name: 'five dice, two pushes, one to one',
    poolSize: 5,
    successesPerGeneration: [1, 1, 1],
    costType: 'complicationCheck',
    costAmount: 3,
  },
  {
    name: 'five dice, one push, three to two',
    poolSize: 5,
    successesPerGeneration: [3, 2],
    costType: 'healthPoint',
    costAmount: 1,
  },
];

const FIXTURE: readonly LogEntry[] = CASES.map(fixtureEntry);

describe('the three statistics over a hand-built log', () => {
  it('answers the success rate by pool size', () => {
    const stats = summariseLog(FIXTURE);

    // Pool size 3: three rolls, ending 0, 1 and 2 successes. Two of the three
    // end with a success.
    // Pool size 5: three rolls, ending 2, 1 and 2 successes. All three do.
    expect(stats.byPoolSize).toStrictEqual([
      { poolSize: 3, rolls: 3, rollsWithASuccess: 2, successes: 3, successRate: 2 / 3 },
      { poolSize: 5, rolls: 3, rollsWithASuccess: 3, successes: 5, successRate: 1 },
    ]);

    // The denominator, counted twice. Every entry lands in exactly one row.
    const rolls = stats.byPoolSize.reduce((total, row) => total + row.rolls, 0);
    expect(stats.entriesRead, 'the summary read every entry').toBe(FIXTURE.length);
    expect(rolls, 'every entry landed in exactly one pool-size row').toBe(stats.entriesRead);
    expect(stats.entriesRead, 'an empty log must not pass this test silently').toBeGreaterThan(0);
    expect(FIXTURE.length, 'the fixture holds one entry per named case').toBe(CASES.length);
    expect(CASES.length, 'the case list holds six cases').toBe(6);
    expect(new Set(CASES.map((one) => one.name)).size, 'no case is listed twice').toBe(6);
  });

  it('answers the push outcomes', () => {
    const stats = summariseLog(FIXTURE);

    // Four of the six cases pushed: 1, 1, 2 and 1 pushes, which is 5.
    // Successes before the first push: 0, 2, 1 and 3, which is 6.
    // Successes at the end: 2, 2, 1 and 2, which is 7.
    // Cost: two rating points plus one, three complication checks, one health
    // point, and no referee point. The two unpushed rolls pay nothing.
    expect(stats.pushes).toStrictEqual({
      pushedRolls: 4,
      pushes: 5,
      better: 1,
      same: 2,
      worse: 1,
      successesBefore: 6,
      successesAfter: 7,
      costByUnit: {
        ratingPoint: 3,
        healthPoint: 1,
        refereePoint: 0,
        complicationCheck: 0 + 3,
      },
    });

    // The denominators, each counted a second way from the case table.
    const pushed = CASES.filter((one) => one.successesPerGeneration.length > 1);
    expect(stats.pushes.pushedRolls, 'the pushed rolls of the case table').toBe(pushed.length);
    expect(
      stats.pushes.better + stats.pushes.same + stats.pushes.worse,
      'every pushed roll is better, the same or worse, and never two of them',
    ).toBe(stats.pushes.pushedRolls);
    expect(stats.pushes.pushes, 'the pushes of the case table, counted a second way').toBe(
      pushed.reduce((total, one) => total + one.successesPerGeneration.length - 1, 0),
    );
  });

  it('answers how often pushing paid off, and says what that means', () => {
    const stats = summariseLog(FIXTURE);
    // One of the four pushed rolls ended with more successes than it held
    // before its first push.
    expect(stats.paidOffRate).toBe(1 / 4);
    expect(stats.paidOffDefinition, 'the definition travels with the number').toBe(
      PAID_OFF_DEFINITION,
    );
    expect(PAID_OFF_DEFINITION, 'the definition names what it compares').toContain('successes');
    expect(PAID_OFF_DEFINITION, 'the definition names what it leaves out').toContain('cost');
  });
});

describe('the degenerate logs, each answered rather than divided by zero', () => {
  const DEGENERATE = ['no rolls', 'no pushes', 'one roll'] as const;

  it('answers an empty log with zero entries and a null rate', () => {
    const stats = summariseLog([]);
    expect(stats.entriesRead).toBe(0);
    expect(stats.byPoolSize).toStrictEqual([]);
    expect(stats.pushes.pushedRolls).toBe(0);
    expect(stats.pushes.pushes).toBe(0);
    expect(stats.pushes.successesBefore).toBe(0);
    expect(stats.pushes.successesAfter).toBe(0);
    expect(stats.paidOffRate, 'no push has no answer, and zero would be an answer').toBeNull();
  });

  it('answers a log with no push with a null rate, not a zero and not a NaN', () => {
    const unpushed = FIXTURE.filter((entry) => entry.pushCount === 0);
    expect(unpushed.length, 'the fixture holds unpushed rolls to select').toBe(2);
    const stats = summariseLog(unpushed);
    expect(stats.entriesRead).toBe(2);
    expect(stats.pushes.pushedRolls).toBe(0);
    expect(stats.paidOffRate).toBeNull();
    expect(stats.paidOffRate, 'null is not the number zero').not.toBe(0);
    expect(Number.isNaN(stats.paidOffRate), 'nothing was divided by zero').toBe(false);
    expect(stats.pushes.costByUnit.ratingPoint, 'an unpushed roll pays nothing').toBe(0);
  });

  it('answers one roll with one row', () => {
    const one = FIXTURE[1];
    expect(one, 'the fixture holds the roll that scored one success').toBeDefined();
    const stats = summariseLog(one === undefined ? [] : [one]);
    expect(stats.entriesRead).toBe(1);
    expect(stats.byPoolSize).toStrictEqual([
      { poolSize: 3, rolls: 1, rollsWithASuccess: 1, successes: 1, successRate: 1 },
    ]);
    expect(stats.paidOffRate, 'the one roll never pushed').toBeNull();
  });

  it('covers every degenerate case the unit named', () => {
    expect(DEGENERATE.length, 'three degenerate cases, one test each').toBe(3);
  });
});

// ---------------------------------------------------------------------------
// The rule with teeth: an edit of the profile does not move a past roll.
// ---------------------------------------------------------------------------

function preset(id: string): PushProfile {
  const found = PUSH_PROFILES.find((each) => each.id === id);
  if (found === undefined) {
    throw new Error(`no preset ${id}`);
  }
  return found;
}

/** One rolled and pushed result, so the test can price it a second way. */
interface Rolled {
  readonly result: RollResult;
  readonly entry: LogEntry;
}

function rolledAndPushed(profile: PushProfile, seeds: readonly number[]): Rolled[] {
  const rolled: Rolled[] = [];
  for (const seed of seeds) {
    const random = seededRandom(seed);
    const pool = buildPool(poolBuilder({ attribute: 4, gear: 2 }));
    const first = roll({ dice: pool, stressBefore: 0 }, random);
    const pushed = push(first, profile, random);
    if (pushed.kind !== 'pushed') {
      continue;
    }
    rolled.push({
      result: pushed,
      entry: createLogEntry({
        rollId: `r-${seed}`,
        timestampIso: '2026-08-09T09:00:00.000Z',
        mode: 'pool',
        result: pushed,
        profile,
        stressBefore: 0,
      }),
    });
  }
  return rolled;
}

describe('an edit of the profile does not move the statistics', () => {
  it('reports the cost the rolls were made under, not the cost of the edited profile', () => {
    const before = preset('pool-banes-damage-ratings');
    const rolled = rolledAndPushed(before, [1, 2, 3, 4, 5, 6, 7, 8]);
    expect(rolled.length, 'every seed pushed once').toBe(8);

    const entries = rolled.map((each) => each.entry);
    const stored = entries.reduce((total, entry) => total + entry.costAmount, 0);
    // The check cannot see a doubling of zero, so the fixture must really pay.
    expect(stored, 'the fixture rolls really pay a cost').toBeGreaterThan(0);

    const first = summariseLog(entries);
    expect(first.pushes.costByUnit.ratingPoint, 'the summary reads the stored cost').toBe(stored);

    // The player opens the override panel and doubles the price of a bane.
    const after = mergeProfile(before, { cost: { perUnit: 2 } });
    expect(after.cost.perUnit, 'the edit landed').toBe(before.cost.perUnit * 2);

    // The number a reader that re-derived from the current profile would print.
    const rederived = rolled.reduce((total, each) => total + pushCost(each.result, after).total, 0);
    expect(rederived, 'the edit really moves a re-derived price').toBe(stored * 2);

    const second = summariseLog(entries);
    expect(second, 'the whole summary is unmoved by the edit').toStrictEqual(first);
    expect(
      second.pushes.costByUnit.ratingPoint,
      'the summary followed the edited profile instead of the stored cost',
    ).not.toBe(rederived);
    expect(second.pushes.costByUnit.ratingPoint).toBe(stored);
  });

  it('reports the successes the artifact curve of the roll produced', () => {
    const profile = preset('pool-banes-damage-ratings');
    const random = seededRandom(7);
    const pool = buildPool(poolBuilder({ artifact: [12, 12, 12, 12] }));
    const result = roll({ dice: pool, stressBefore: 0 }, random);
    const entry = createLogEntry({
      rollId: 'r-1',
      timestampIso: '2026-08-09T09:00:00.000Z',
      mode: 'pool',
      result,
      profile,
      stressBefore: 0,
      artifactCurve: 'artifactFlat',
    });

    // `successCount` reads the default curve, which is the escalating one. It
    // is what a reader that re-derived from the dice would print, and on a d12
    // it pays more.
    const rederived = successCount(result);
    expect(rederived, 'the two curves really differ on this roll').toBeGreaterThan(entry.successes);

    const stats = summariseLog([entry]);
    const successes = stats.byPoolSize.reduce((total, row) => total + row.successes, 0);
    expect(successes, 'the summary reads the stored successes').toBe(entry.successes);
    expect(successes, 'the summary re-derived on the escalating curve').not.toBe(rederived);
  });
});
