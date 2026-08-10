// Statistics over the roll log. Pure: no browser API is named here, no
// module-level mutable state, and no random source.
//
// **This module reads the stored derived values. It never re-derives one.**
//
// specs/0001-rules-model.md, section "Derived values", gives the reason: a log
// entry stores its derived values AND a hash of the profile that produced them,
// "otherwise a later profile edit silently rewrites campaign history". A
// statistics view that re-derived a number from the dice would undo that. A
// player who raised a cost in the override panel would see every past roll
// re-priced at the new rate, and the chart would report a campaign that never
// happened.
//
// So this module reads these fields of `LogEntry` and nothing else:
//
//   - `dice[].cells[]`, for whether a die existed at a generation and for the
//     successes that die was worth there. Both are stored.
//   - `successes`, the stored successes of the newest generation.
//   - `pushCount`, `costType` and `costAmount`, all stored.
//
// It never reads `cells[].value`, and it never calls `score`, `isLocked` or
// `pushCost`. Nothing here imports a push profile as a value, so no profile can
// reach this code to re-price a roll with.

import type { PushCostUnit } from '../rules/push-profile';
import type { LogEntry } from './entry';

/**
 * The definition of "the push paid off". It travels with the numbers, in the
 * returned record, because a statistic whose definition is implicit gets read
 * three different ways.
 *
 * Three other definitions were considered and rejected:
 *
 *   - Successes gained per unit of cost. Rejected. The four cost units are a
 *     rating point, a health point, a referee point and a complication check.
 *     They are different things, so a sum over a campaign that used more than
 *     one profile would add unlike quantities.
 *   - The roll crossed a target number. Rejected. The rules have no target
 *     number, as `src/rules/pool.ts` states, so there is no line to cross.
 *   - The last push alone gained successes. Rejected. A player pushes a roll,
 *     not a generation, and this would call a run of three pushes a failure
 *     when only the first one helped.
 */
export const PAID_OFF_DEFINITION =
  'A push paid off when the roll ends with more successes than it held before the first push. ' +
  'The comparison reads successes alone. The cost is reported beside it and is never ' +
  'subtracted, because the four cost units are different things and do not add together.';

/** One bar of the success-rate chart. */
export interface PoolSizeRow {
  /** How many dice the player threw at the first generation. */
  readonly poolSize: number;
  readonly rolls: number;
  /** Rolls that ended with one success or more. */
  readonly rollsWithASuccess: number;
  /** Successes over every roll of this size, from the stored value. */
  readonly successes: number;
  /**
   * `rollsWithASuccess` divided by `rolls`. A row exists only where a roll of
   * that size exists, so `rolls` is one or more and the division is safe.
   */
  readonly successRate: number;
}

/** What the pushes in the log produced and what they cost. */
export interface PushOutcomes {
  /** Rolls that pushed at least once. */
  readonly pushedRolls: number;
  /** Pushes over all of them. A roll that pushed twice counts twice. */
  readonly pushes: number;
  /** Rolls that ended with more, the same, or fewer successes than before. */
  readonly better: number;
  readonly same: number;
  readonly worse: number;
  /** Successes those rolls held at the first generation, before any push. */
  readonly successesBefore: number;
  /** Successes those rolls ended with. */
  readonly successesAfter: number;
  /**
   * The cost of those rolls, kept apart by unit. The units are different
   * things and are never summed. A roll that never pushed is not counted here,
   * because a stored cost on a first roll is the price of a push nobody bought.
   */
  readonly costByUnit: Readonly<Record<PushCostUnit, number>>;
}

export interface LogStatistics {
  /** How many entries the summary consumed. The denominator of every count. */
  readonly entriesRead: number;
  /** Ascending by pool size. Empty for an empty log. */
  readonly byPoolSize: readonly PoolSizeRow[];
  readonly pushes: PushOutcomes;
  /**
   * `pushes.better` divided by `pushes.pushedRolls`, or **null** where nothing
   * pushed. Null, not zero: a log with no push has no answer to the question,
   * and zero would read as "pushing never paid off".
   */
  readonly paidOffRate: number | null;
  /** `PAID_OFF_DEFINITION`, carried with the numbers it defines. */
  readonly paidOffDefinition: string;
}

/**
 * One key per cost unit, written as an object literal so a fifth unit becomes a
 * type error here rather than a silently dropped column.
 */
function emptyCostByUnit(): Record<PushCostUnit, number> {
  return { ratingPoint: 0, healthPoint: 0, refereePoint: 0, complicationCheck: 0 };
}

/**
 * How many dice the player threw first. A die that the push added carries
 * `null` at the first generation, so it is not part of the pool that was built.
 */
function poolSizeOf(entry: LogEntry): number {
  return entry.dice.filter((die) => (die.cells[0] ?? null) !== null).length;
}

/**
 * The successes of one generation, added up from the stored cells.
 *
 * Adding stored numbers is not re-deriving. Re-deriving would be reading
 * `cell.value` and asking the success table about it again.
 */
function successesAt(entry: LogEntry, generation: number): number {
  return entry.dice.reduce((total, die) => total + (die.cells[generation]?.successes ?? 0), 0);
}

interface Tally {
  poolSize: number;
  rolls: number;
  rollsWithASuccess: number;
  successes: number;
}

/**
 * The three statistics the log carries, over the entries handed in.
 *
 * An empty log answers with zero entries read, no rows and a null rate. It
 * does not throw and no count is divided by zero.
 */
export function summariseLog(entries: readonly LogEntry[]): LogStatistics {
  const tallies = new Map<number, Tally>();
  const costByUnit = emptyCostByUnit();
  let pushedRolls = 0;
  let pushes = 0;
  let better = 0;
  let same = 0;
  let worse = 0;
  let successesBefore = 0;
  let successesAfter = 0;

  for (const entry of entries) {
    const poolSize = poolSizeOf(entry);
    const tally = tallies.get(poolSize) ?? {
      poolSize,
      rolls: 0,
      rollsWithASuccess: 0,
      successes: 0,
    };
    tally.rolls += 1;
    tally.successes += entry.successes;
    if (entry.successes > 0) {
      tally.rollsWithASuccess += 1;
    }
    tallies.set(poolSize, tally);

    if (entry.pushCount > 0) {
      const before = successesAt(entry, 0);
      pushedRolls += 1;
      pushes += entry.pushCount;
      successesBefore += before;
      successesAfter += entry.successes;
      if (entry.successes > before) {
        better += 1;
      } else if (entry.successes === before) {
        same += 1;
      } else {
        worse += 1;
      }
      costByUnit[entry.costType] += entry.costAmount;
    }
  }

  const byPoolSize = [...tallies.values()]
    .sort((left, right) => left.poolSize - right.poolSize)
    .map((tally) => ({ ...tally, successRate: tally.rollsWithASuccess / tally.rolls }));

  return {
    entriesRead: entries.length,
    byPoolSize,
    pushes: {
      pushedRolls,
      pushes,
      better,
      same,
      worse,
      successesBefore,
      successesAfter,
      costByUnit,
    },
    paidOffRate: pushedRolls === 0 ? null : better / pushedRolls,
    paidOffDefinition: PAID_OFF_DEFINITION,
  };
}
