// Rules core. No browser API, no module-level mutable state.
// The generation rule comes from specs/0001-rules-model.md, section
// "Generations and the history matrix". The cost models come from section
// "Push profiles" and from the "A 1 costs" column of section "Dice types".
//
// The pushable set is derived once, in `planPush`, and both `push` and
// `previewPush` read that one derivation. A second derivation would drift, and
// the number the player reads before the throw would stop matching the number
// the rules then apply. The preview therefore lives here and not in the
// interface, so Unit 4.x renders this answer instead of computing its own.

import type { Die, DieType } from './die';
import { appendValue, createDie, keepValue } from './die';
import type { PushBlocker, PushCostUnit, PushProfile } from './push-profile';
import { isLocked, pushBlockedBy } from './push-profile';
import type { RandomSource } from './random';
import type { RollResult } from './roll';
import { baneCount } from './roll';

/** Why the push was refused. The record names the reason instead of throwing. */
export type PushRefusalReason = 'atPushLimit' | 'blocked';

export interface PushRefusal {
  readonly kind: 'refused';
  readonly reason: PushRefusalReason;
  /** The blocker that refused, or `null` when the push count refused. */
  readonly blocker: PushBlocker | null;
}

/**
 * What the push costs, in the unit the profile names. `byType` carries the
 * share of each dice type, so the interface can read one attribute point and
 * one gear step out of the same `ratingPoint` total. The resource point of
 * profile 1 is the attribute entry of that readout.
 */
export interface PushCostReadout {
  readonly unit: PushCostUnit;
  readonly total: number;
  readonly byType: Readonly<Record<DieType, number>>;
}

export interface PushPreview {
  readonly kind: 'available';
  /** How many dice go back in the cup. */
  readonly rerollCount: number;
  /** The dice that go back in the cup, in pool order. */
  readonly rerolled: readonly string[];
  /** The stress die this push adds before the throw, or `null`. */
  readonly stressAdded: string | null;
  /**
   * The stress the player will hold after this push. Derived from the stress
   * that came in with the roll plus what the profile adds, so the player reads
   * the new number before the commitment.
   */
  readonly stressAfter: number;
  readonly cost: PushCostReadout;
  /** Pushes already spent on this roll, derived from the generation count. */
  readonly pushesSoFar: number;
}

export interface PushedRoll extends RollResult {
  readonly kind: 'pushed';
  readonly rerolled: readonly string[];
  readonly stressAdded: string | null;
  /**
   * The price of this push, read before the throw. It is the number the player
   * committed to. For the cost still standing after the throw, call `pushCost`
   * on the new result.
   */
  readonly cost: PushCostReadout;
  /** The index of the generation this push appended. */
  readonly generation: number;
}

export type PushPreviewOutcome = PushPreview | PushRefusal;
export type PushOutcome = PushedRoll | PushRefusal;

/**
 * Which dice types pay each cost unit, from the "A 1 costs" column of the
 * spec's dice table, narrowed by the profile that charges the unit.
 *
 * - `ratingPoint`: an attribute 1 costs a point of that attribute, a gear 1
 *   lowers that gear by one step. A skill 1 is inert and an artifact die never
 *   degrades.
 * - `healthPoint`: the point is physical or mental according to the attribute
 *   rolled, so the attribute dice carry it.
 * - `complicationCheck`: a 1 on a stress die calls for a check.
 * - `refereePoint`: charged per push, so it reads no dice and its row is empty.
 *
 * Keyed by `cost.unit`, which is a data field. Nothing here branches on a
 * profile id, so a fifth cost model stays a new row.
 */
const COST_BEARING_TYPES: Readonly<Record<PushCostUnit, readonly DieType[]>> = {
  ratingPoint: ['attribute', 'gear'],
  healthPoint: ['attribute'],
  refereePoint: [],
  complicationCheck: ['stress'],
};

/**
 * What a roll costs under a profile. Derived, never stored, as the spec's
 * "Derived values" section requires.
 */
export function pushCost(result: RollResult, profile: PushProfile): PushCostReadout {
  const { source, unit, perUnit } = profile.cost;
  const banes = baneCount(result);
  const bearing = source === 'bane' ? COST_BEARING_TYPES[unit] : [];
  const byType = Object.fromEntries(
    (Object.keys(banes) as DieType[]).map((type) => [
      type,
      bearing.includes(type) ? banes[type] * perUnit : 0,
    ]),
  ) as Record<DieType, number>;
  const fromBanes = Object.values(byType).reduce((total, each) => total + each, 0);
  return { unit, total: source === 'push' ? perUnit : fromBanes, byType };
}

/** The number of generations the matrix holds. The first roll is generation 0. */
function generations(dice: readonly Die[]): number {
  return dice.reduce((longest, die) => Math.max(longest, die.values.length), 0);
}

/**
 * A free id in the `stress-n` series, so the matrix keeps one column per die.
 *
 * The ordinal comes from the counter the application passed in, not from a
 * count of the stress dice on the table. The two agree while every stress point
 * carries a die, and the counter is the authority when they do not.
 */
function nextStressId(dice: readonly Die[], stressBefore: number): string {
  const taken = new Set(dice.map((die) => die.id));
  let ordinal = Math.max(0, stressBefore) + 1;
  while (taken.has(`stress-${ordinal}`)) {
    ordinal += 1;
  }
  return `stress-${ordinal}`;
}

interface Planned {
  readonly kind: 'planned';
  readonly preview: PushPreview;
  /** The dice the throw acts on, with any added stress die last. */
  readonly dice: readonly Die[];
}

/**
 * The one derivation. It answers whether the push is legal, which dice go back
 * in the cup, and what the push costs.
 *
 * A profile with `addBeforeReroll` raises stress by one **before** the throw,
 * so the new stress die is loose here and takes part in this same push. The
 * stress counter itself belongs to the application. It arrives on the roll as
 * `stressAfter`, and this function derives the next value from it.
 */
function planPush(result: RollResult, profile: PushProfile): Planned | PushRefusal {
  const generation = generations(result.dice);
  const pushesSoFar = Math.max(0, generation - 1);
  if (pushesSoFar >= profile.maxPushes) {
    return { kind: 'refused', reason: 'atPushLimit', blocker: null };
  }
  const blocker = pushBlockedBy(result.dice, profile);
  if (blocker !== null) {
    return { kind: 'refused', reason: 'blocked', blocker };
  }
  const stressBefore = result.stressAfter;
  const added =
    profile.stressBehaviour === 'addBeforeReroll'
      ? createDie(nextStressId(result.dice, stressBefore), 'stress', 6, generation)
      : null;
  const dice = added === null ? result.dice : [...result.dice, added];
  const rerolled = dice.filter((die) => !isLocked(die, profile)).map((die) => die.id);
  return {
    kind: 'planned',
    dice,
    preview: {
      kind: 'available',
      rerollCount: rerolled.length,
      rerolled,
      stressAdded: added === null ? null : added.id,
      stressAfter: stressBefore + (added === null ? 0 : 1),
      cost: pushCost(result, profile),
      pushesSoFar,
    },
  };
}

/**
 * What the push would cost and how many dice it would throw, without a random
 * source and without rolling. Key task 5: the player reads this before the
 * commitment.
 */
export function previewPush(result: RollResult, profile: PushProfile): PushPreviewOutcome {
  const plan = planPush(result, profile);
  return plan.kind === 'refused' ? plan : plan.preview;
}

/**
 * Throw the loose dice again and append the answer as a new generation. The
 * input is not changed, and no die object in it is changed.
 *
 * A locked die repeats its previous value, so the matrix stays rectangular. A
 * die that first appears at this generation carries `null` for every earlier
 * one, which `createDie` writes.
 */
export function push(result: RollResult, profile: PushProfile, random: RandomSource): PushOutcome {
  const plan = planPush(result, profile);
  if (plan.kind === 'refused') {
    return plan;
  }
  const loose = new Set(plan.preview.rerolled);
  const dice = plan.dice.map((die) =>
    loose.has(die.id) ? appendValue(die, random.face(die.faces)) : keepValue(die),
  );
  return {
    kind: 'pushed',
    dice,
    stressAfter: plan.preview.stressAfter,
    rerolled: plan.preview.rerolled,
    stressAdded: plan.preview.stressAdded,
    cost: plan.preview.cost,
    generation: generations(dice) - 1,
  };
}
