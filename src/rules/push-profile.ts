// Rules core. No browser API, no module-level mutable state.
// The record shape comes from specs/0001-rules-model.md, section "Push profiles".
//
// A push profile is a record, not a code path. The four presets below are data.
// A fifth cost model is a new row, or an override the user builds at Unit 4.2.
// Nothing here branches on a preset.

import type { Die, DieType } from './die';
import { latestValue } from './die';
import type { CurveId } from './success';
import { defaultCurve, score } from './success';

export type PushBlocker = 'stressOneShowing';

export type StressBehaviour = 'none' | 'addBeforeReroll';

/**
 * What the cost is counted from: every bane still showing, or the push itself.
 * A union, not a string, so a typo cannot become a silent new cost type.
 */
export type PushCostSource = 'bane' | 'push';

/**
 * What one unit of the cost is. The four presets fix this domain.
 *
 * `ratingPoint` is one point off the rating that rolled the bane — one point of
 * that attribute, or one step of that gear die.
 */
export type PushCostUnit = 'ratingPoint' | 'healthPoint' | 'refereePoint' | 'complicationCheck';

export interface PushCost {
  readonly source: PushCostSource;
  readonly unit: PushCostUnit;
  readonly perUnit: number;
}

export interface PushProfile {
  readonly id: string;
  /** Descriptive text only. Never a product name. */
  readonly label: string;
  readonly description: string;
  readonly lockSuccesses: boolean;
  readonly lockOnesBy: Readonly<Record<DieType, boolean>>;
  readonly maxPushes: number;
  readonly cost: PushCost;
  readonly stressBehaviour: StressBehaviour;
  readonly blockers: readonly PushBlocker[];
}

/**
 * The three states the tray renders: a die the rules hold, a die the player
 * keeps by choice, and a die that goes back in the cup.
 */
export type LockState = 'rule' | 'choice' | 'loose';

/**
 * A rule lock outranks a player choice, because the player cannot release it.
 */
export function lockState(
  die: Die,
  profile: PushProfile,
  curve: CurveId = defaultCurve(die.type, die.faces),
): LockState {
  if (profile.lockSuccesses && score(die, curve) > 0) {
    return 'rule';
  }
  if (profile.lockOnesBy[die.type] && latestValue(die) === 1) {
    return 'rule';
  }
  return die.manualLock ? 'choice' : 'loose';
}

/** True when the die stays on the table. Read `lockState` for the reason. */
export function isLocked(die: Die, profile: PushProfile, curve?: CurveId): boolean {
  return lockState(die, profile, curve) !== 'loose';
}

/**
 * One predicate per blocker, so the record stays total over the union. A new
 * blocker cannot be added without the reader that answers it.
 */
const BLOCKER_READS: Readonly<Record<PushBlocker, (die: Die) => boolean>> = {
  stressOneShowing: (die) => die.type === 'stress' && latestValue(die) === 1,
};

/**
 * The blocker that refuses the push, or `null` when no blocker applies. The
 * push-count limit is separate and belongs to the resolver at Unit 1.6.
 */
export function pushBlockedBy(dice: readonly Die[], profile: PushProfile): PushBlocker | null {
  return profile.blockers.find((blocker) => dice.some(BLOCKER_READS[blocker])) ?? null;
}

// ---------------------------------------------------------------------------
// The four presets. Every value comes from specs/0001-rules-model.md, sections
// "Dice types" and "Push profiles". Every string is written fresh.
// ---------------------------------------------------------------------------

/**
 * The "Locks on push" column of the dice-type table, read as: whose 1s carry a
 * cost. A profile that locks 1s takes this row unless the spec narrows it.
 */
const ONES_BY_TYPE_TABLE: Readonly<Record<DieType, boolean>> = {
  attribute: true,
  skill: false,
  gear: true,
  artifact: false,
  bonus: false,
  stress: true,
};

/** A profile where a 1 means nothing on any die. */
const ONES_MEAN_NOTHING: Readonly<Record<DieType, boolean>> = {
  attribute: false,
  skill: false,
  gear: false,
  artifact: false,
  bonus: false,
  stress: false,
};

/**
 * No limit on the number of pushes. The stress blocker ends the sequence
 * instead. This is a finite integer rather than `Infinity`, because a profile
 * is stored and `JSON.stringify` turns `Infinity` into `null`.
 */
const NO_PUSH_LIMIT = Number.MAX_SAFE_INTEGER;

/** Freeze every level, so a shared preset cannot be edited through a caller. */
function freezeProfile(profile: PushProfile): PushProfile {
  return Object.freeze({
    ...profile,
    lockOnesBy: Object.freeze({ ...profile.lockOnesBy }),
    cost: Object.freeze({ ...profile.cost }),
    blockers: Object.freeze([...profile.blockers]),
  });
}

/** Four presets, four cost models. The order matches the spec's list. */
const PRESETS: readonly PushProfile[] = [
  {
    id: 'pool-banes-damage-ratings',
    label: 'Pool, banes damage ratings',
    description:
      'Successes and banes both stay on the table. You may push once. Each bane on an ' +
      'attribute die costs one point of that attribute and gives you one resource point. ' +
      'Each bane on a gear die lowers that gear by one step. A bane on a skill die costs ' +
      'nothing, and an artifact die never degrades.',
    lockSuccesses: true,
    lockOnesBy: ONES_BY_TYPE_TABLE,
    maxPushes: 1,
    cost: { source: 'bane', unit: 'ratingPoint', perUnit: 1 },
    stressBehaviour: 'none',
    blockers: [],
  },
  {
    id: 'pool-referee-gains-a-point',
    label: 'Pool, the referee gains a point',
    description:
      'Only successes stay on the table. A bane carries no meaning. You may push once. ' +
      'Each push gives the referee one point to spend later.',
    lockSuccesses: true,
    lockOnesBy: ONES_MEAN_NOTHING,
    maxPushes: 1,
    cost: { source: 'push', unit: 'refereePoint', perUnit: 1 },
    stressBehaviour: 'none',
    blockers: [],
  },
  {
    id: 'pool-stress-and-complications',
    label: 'Pool, stress dice and complications',
    description:
      'Only successes stay on the table. Stress goes up by one before the re-roll, so the ' +
      'new stress die takes part in that same push. A bane on any stress die calls for a ' +
      'complication check, on the first roll as well. A stress die that shows a bane stops ' +
      'every further push.',
    lockSuccesses: true,
    lockOnesBy: ONES_MEAN_NOTHING,
    maxPushes: NO_PUSH_LIMIT,
    cost: { source: 'bane', unit: 'complicationCheck', perUnit: 1 },
    stressBehaviour: 'addBeforeReroll',
    blockers: ['stressOneShowing'],
  },
  {
    id: 'step-banes-cost-health',
    label: 'Step dice, banes cost health',
    description:
      'Successes and banes both stay on the table. You may push once. After the push, each ' +
      'bane still showing costs you one point of health. The attribute you rolled decides ' +
      'whether the point is physical or mental.',
    lockSuccesses: true,
    lockOnesBy: ONES_BY_TYPE_TABLE,
    maxPushes: 1,
    cost: { source: 'bane', unit: 'healthPoint', perUnit: 1 },
    stressBehaviour: 'none',
    blockers: [],
  },
];

export const PUSH_PROFILES: readonly PushProfile[] = Object.freeze(PRESETS.map(freezeProfile));

/**
 * A partial profile. The override panel at Unit 4.2 exposes every field, and it
 * may set one checkbox of `lockOnesBy` or one part of `cost` on its own.
 */
export type PushProfileOverride = Partial<Omit<PushProfile, 'lockOnesBy' | 'cost'>> & {
  readonly lockOnesBy?: Partial<Readonly<Record<DieType, boolean>>>;
  readonly cost?: Partial<PushCost>;
};

/** A key set to `undefined` is an untouched control, not an instruction. */
function definedOnly<T extends object>(source: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(source).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

/**
 * A preset plus an override, as a new frozen record. Neither input changes, and
 * a field the override does not name keeps the preset's value.
 */
export function mergeProfile(base: PushProfile, override: PushProfileOverride): PushProfile {
  return freezeProfile({
    ...base,
    ...definedOnly(override),
    lockOnesBy: { ...base.lockOnesBy, ...definedOnly(override.lockOnesBy ?? {}) },
    cost: { ...base.cost, ...definedOnly(override.cost ?? {}) },
    blockers: [...(override.blockers ?? base.blockers)],
  });
}
