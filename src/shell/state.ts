// The application state and every reading the screen takes from it.
//
// Pure. No browser API is named here and no module-level value changes, so the
// whole store runs under a plain test runner. The shell imports this file and
// this file imports the rules core. The core imports neither. Constraint 3.
//
// Nothing here decides a rule. The pool, the step sizes and the effect of the
// difficulty all come from `src/rules/pool.ts`, and this file only holds what
// the player has typed and asks the core what it means.

import type { Die, DieType } from '../rules/die';
import type { Faces } from '../rules/die';
import { latestValue } from '../rules/die';
import type { ArtifactFaces, Builder, DiceSpec, Mode, StepDice } from '../rules/pool';
import {
  applyDifficulty,
  buildPool,
  firstRoll,
  MODIFIER_LIMIT,
  poolBuilder,
  START_STEP_DICE,
  stepBuilder,
  steppedDice,
  STEP_SIZES,
} from '../rules/pool';
import type { PushPreviewOutcome } from '../rules/push';
import { generations, previewPush, push } from '../rules/push';
import type { LockState, PushCostUnit, PushProfile } from '../rules/push-profile';
import { isLocked, lockState, PUSH_PROFILES } from '../rules/push-profile';
import type { RandomSource } from '../rules/random';
import type { RollResult } from '../rules/roll';
import { baneCount, successCount } from '../rules/roll';
import { score } from '../rules/success';
import { clickDie } from '../tray/affordance';

/**
 * The artifact tile steps along an enumerated ladder. One rating gives a size
 * and a count, so the tile holds one number and the pool holds the dice that
 * number names.
 *
 * The ladder is an interface affordance and not a rule. `specs/0001-rules-model.md`
 * says which faces an artifact die has and what each face scores. It says
 * nothing about how a rating becomes dice, so the mapping lives here beside the
 * tile that steps it, and never in the core.
 */
export const ARTIFACT_LADDER: readonly (readonly ArtifactFaces[])[] = [
  [],
  [8],
  [10],
  [12],
  [12, 8],
  [12, 10],
  [12, 12],
];

/**
 * The most dice of each type one pool holds. Decision 1 in
 * `docs/design/0012-settled-decisions.md` fixes every number: 5 attribute, 5
 * skill, 3 gear and 2 bonus, with an artifact rating of 6 and 10 stress points.
 *
 * These caps are not the tray ceiling. `worstCaseState` below derives what they
 * put on the table, and a push adds more dice on top of that.
 */
export const POOL_CAPS = {
  attribute: 5,
  skill: 5,
  gear: 3,
  artifact: ARTIFACT_LADDER.length - 1,
  bonus: 2,
  stress: 10,
} as const;

/**
 * The positions of the skill tile in step mode, smallest first.
 *
 * "No skill die" sits below the smallest size, because the two scales are
 * independent: a player with no skill rolls the attribute die alone at whatever
 * size it holds. The attribute tile steps `STEP_SIZES` itself and holds no such
 * position, because a step roll always throws an attribute die.
 *
 * These positions are an interface affordance. The core takes sizes.
 */
export const SKILL_STEPS: readonly (Faces | null)[] = [null, ...STEP_SIZES];

/** One counted tile per dice type. The artifact number is a ladder rating. */
export type CountKey = keyof typeof POOL_CAPS;

export type Counts = Readonly<Record<CountKey, number>>;

const ZERO_COUNTS: Counts = Object.freeze({
  attribute: 0,
  skill: 0,
  gear: 0,
  artifact: 0,
  bonus: 0,
  stress: 0,
});

/**
 * The profile the application rolls under.
 *
 * The drawn screen shows the third preset, where the price of a push is a
 * stress rise and a stress bane stops the sequence. Section 7 of
 * `docs/design/0002-screen-design.md` names it. Unit 4.1 turns this into a
 * choice behind the disclosure, and nothing here branches on the id.
 */
export const DEFAULT_PROFILE_ID = 'pool-stress-and-complications';

export interface AppState {
  readonly mode: Mode;
  readonly counts: Counts;
  /** The rated pair. Step mode reads it, pool mode ignores it. */
  readonly stepDice: StepDice;
  readonly difficulty: number;
  /** The builder is open at rest A and collapsed at rest B. */
  readonly builderOpen: boolean;
  readonly sheetOpen: boolean;
  /** The push profile in force, by id. Unit 4.1 lets the player change it. */
  readonly profileId: string;
  /** The dice on the table, or `null` while the table is empty. */
  readonly result: RollResult | null;
  /** The dice the last throw moved. Those dice shake and no other does. */
  readonly thrown: readonly string[];
}

export function emptyState(mode: Mode): AppState {
  return {
    mode,
    counts: ZERO_COUNTS,
    stepDice: START_STEP_DICE,
    difficulty: 0,
    builderOpen: true,
    sheetOpen: false,
    profileId: DEFAULT_PROFILE_ID,
    result: null,
    thrown: [],
  };
}

/** The profile record itself. An unknown id is a fault, not a fallback. */
export function profileOf(state: AppState): PushProfile {
  const held = PUSH_PROFILES.find((profile) => profile.id === state.profileId);
  if (held === undefined) {
    throw new Error(`no push profile is named ${state.profileId}`);
  }
  return held;
}

function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value));
}

function repeat(spec: DiceSpec, count: number): DiceSpec[] {
  return Array.from({ length: Math.max(0, count) }, () => spec);
}

function artifactDice(rating: number): readonly ArtifactFaces[] {
  return ARTIFACT_LADDER[clamp(rating, 0, POOL_CAPS.artifact)] ?? [];
}

/** The builder the core takes, built from what the player has typed. */
export function builderOf(state: AppState): Builder {
  const artifact = artifactDice(state.counts.artifact);
  if (state.mode === 'pool') {
    return poolBuilder({ ...state.counts, artifact });
  }
  // The rated pair gives the attribute and the skill die. Gear, artifact, bonus
  // and stress dice are extras the core adds to a step roll unchanged.
  return stepBuilder(state.stepDice, [
    ...repeat({ type: 'gear', faces: 6 }, state.counts.gear),
    ...artifact.map((faces): DiceSpec => ({ type: 'artifact', faces })),
    ...repeat({ type: 'bonus', faces: 6 }, state.counts.bonus),
    ...repeat({ type: 'stress', faces: 6 }, state.counts.stress),
  ]);
}

/**
 * The dice the next throw takes, with the difficulty already applied.
 *
 * One derivation serves the status line, the live region and the roll button,
 * so no two of them can disagree about how many dice a throw takes.
 */
export function throwDice(state: AppState): readonly Die[] {
  return buildPool(applyDifficulty(builderOf(state), state.difficulty));
}

/** A tile of the pool bar. The bar is one control and each tile is one visit. */
export interface PoolCell {
  /** The `data-el` name, as `docs/design/0002-screen-design.md` section 6 fixes it. */
  readonly id: string;
  readonly label: string;
  /** What the tile prints where the number goes. */
  readonly value: string;
  /** What a screen reader reads for the value. */
  readonly valueText: string;
  readonly count: number;
  readonly max: number;
  readonly atCap: boolean;
  /**
   * True while the tile puts no die on the table. The screen dims such a tile.
   * It is not `count === 0`: a step attribute tile at its smallest size still
   * rolls a die, and a step skill tile at its lowest position rolls none.
   */
  readonly empty: boolean;
  readonly key: CountKey;
}

/** The two tiles that hold a die size in step mode and a count in pool mode. */
type SizeKey = 'attribute' | 'skill';

const COUNTED_CELLS: readonly (readonly [CountKey, string])[] = [
  ['attribute', 'attribute'],
  ['skill', 'skill'],
  ['gear', 'gear'],
  ['artifact', 'artifact'],
  ['bonus', 'bonus'],
  ['stress', 'stress'],
];

/** The largest step die, read off the scale and never typed. */
function topSize(): Faces {
  const faces = STEP_SIZES[STEP_SIZES.length - 1];
  if (faces === undefined) {
    throw new Error('the step scale holds no size');
  }
  return faces;
}

/** The positions one size tile steps over. */
function sizeSteps(key: SizeKey): readonly (Faces | null)[] {
  return key === 'attribute' ? STEP_SIZES : SKILL_STEPS;
}

/** Where one rated die sits on its own tile. */
function sizePosition(dice: StepDice, key: SizeKey): number {
  return sizeSteps(key).indexOf(key === 'attribute' ? dice.attribute : dice.skill);
}

/**
 * The attribute tile or the skill tile in step mode. Each one steps its own die
 * size, and neither reads the other, because the two scales are independent.
 */
function sizeCell(key: SizeKey, dice: StepDice): PoolCell {
  const steps = sizeSteps(key);
  const count = sizePosition(dice, key);
  const faces = steps[count] ?? null;
  const max = steps.length - 1;
  return {
    id: `pool-cell-${key}`,
    label: key,
    value: faces === null ? 'none' : `d${faces}`,
    valueText: faces === null ? `no ${key} die` : `a d${faces}`,
    count,
    max,
    atCap: count >= max,
    empty: faces === null,
    key,
  };
}

function countedCell(key: CountKey, label: string, count: number): PoolCell {
  const max = POOL_CAPS[key];
  if (key === 'artifact') {
    const dice = artifactDice(count);
    const value = count === 0 ? 'none' : dice.map((faces) => `d${faces}`).join(' + ');
    return {
      id: 'pool-cell-artifact',
      label,
      value,
      valueText: count === 0 ? 'none' : value.replace(' + ', ' and '),
      count,
      max,
      atCap: count >= max,
      empty: count === 0,
      key,
    };
  }
  return {
    id: `pool-cell-${key}`,
    label,
    value: String(count),
    valueText: count === 1 ? '1 die' : `${count} dice`,
    count,
    max,
    atCap: count >= max,
    empty: count === 0,
    key,
  };
}

/**
 * The tiles of the pool bar, in the order the keyboard walks them.
 *
 * **Both modes hold the same six tiles.** Step mode changes what the attribute
 * tile and the skill tile carry — a die size instead of a count — and nothing
 * else. The two scales are independent, so each of the two tiles steps its own
 * size. Section 5 of `docs/design/0002-screen-design.md` draws it.
 */
export function poolCells(state: AppState): readonly PoolCell[] {
  return COUNTED_CELLS.map(([key, label]) =>
    state.mode === 'step' && (key === 'attribute' || key === 'skill')
      ? sizeCell(key, state.stepDice)
      : countedCell(key, label, state.counts[key]),
  );
}

/** Step one die size up or down. Each scale stops at its own two ends. */
function nudgeSize(dice: StepDice, key: SizeKey, delta: number): StepDice {
  const steps = sizeSteps(key);
  const at = clamp(sizePosition(dice, key) + delta, 0, steps.length - 1);
  const faces = steps[at] ?? null;
  if (key === 'skill') {
    return { ...dice, skill: faces };
  }
  return faces === null ? dice : { ...dice, attribute: faces };
}

/** Move one tile up or down. Every tile stops at its own cap and at zero. */
export function nudge(state: AppState, key: CountKey, delta: number): AppState {
  if (state.mode === 'step' && (key === 'attribute' || key === 'skill')) {
    return { ...state, stepDice: nudgeSize(state.stepDice, key, delta) };
  }
  return {
    ...state,
    counts: { ...state.counts, [key]: clamp(state.counts[key] + delta, 0, POOL_CAPS[key]) },
  };
}

export function withDifficulty(state: AppState, value: number): AppState {
  return { ...state, difficulty: clamp(value, -MODIFIER_LIMIT, MODIFIER_LIMIT) };
}

/**
 * Switch the mode. The built pool is destroyed, which is why the switch lives
 * behind the disclosure and not one tap from the throw. The table is cleared
 * with it, because a roll of the old pool cannot be pushed under the new one.
 */
export function withMode(state: AppState, mode: Mode): AppState {
  return { ...emptyState(mode), sheetOpen: state.sheetOpen, profileId: state.profileId };
}

/**
 * The state that puts the most dice on the table with one throw: every tile at
 * its cap, both step dice at the top of their scales, and the difficulty at its
 * limit.
 *
 * Step mode reaches a smaller table than pool mode, because it rolls two dice
 * whatever their sizes are and its difficulty steps those sizes instead of
 * adding bonus dice. The drawn screen is therefore measured in pool mode, which
 * is the worst case of the two.
 *
 * This is the one derivation of the draw target. `throwDice(worstCaseState())`
 * counts it, and `docs/design/0013-screen-final.html` is drawn at that count.
 * Nothing states the number in prose or in a second constant. Raise a cap,
 * lengthen `ARTIFACT_LADDER` or widen `MODIFIER_LIMIT` and the count moves, so
 * the check in `src/shell/drawn-screen.test.ts` names the layout for a
 * re-measure.
 *
 * A push adds dice on top of this. Profile 3 adds one stress die per push and
 * holds no push limit, so the tray itself has no ceiling. Decision 1 records
 * that the layout is drawn for this number and scrolls past it.
 */
export function worstCaseState(mode: Mode = 'pool'): AppState {
  return {
    ...emptyState(mode),
    counts: { ...POOL_CAPS },
    stepDice: { attribute: topSize(), skill: topSize() },
    difficulty: MODIFIER_LIMIT,
    builderOpen: false,
  };
}

const TYPE_ORDER: readonly DieType[] = [
  'attribute',
  'skill',
  'gear',
  'artifact',
  'bonus',
  'stress',
];

function plural(count: number): string {
  return count === 1 ? 'die' : 'dice';
}

/**
 * What the pool holds, in one sentence, for the live region.
 *
 * It counts the dice the core built, not the numbers on the tiles, so a tile
 * that stopped at its cap and a difficulty that added or took dice away are
 * both already in the answer.
 */
export function composition(dice: readonly Die[]): string {
  if (dice.length === 0) {
    return 'The throw takes no dice. A roll of no dice fails.';
  }
  const parts: string[] = [];
  for (const type of TYPE_ORDER) {
    const held = dice.filter((die) => die.type === type);
    for (const faces of [6, 8, 10, 12]) {
      const count = held.filter((die) => die.faces === faces).length;
      if (count > 0) {
        parts.push(faces === 6 ? `${count} ${type}` : `${count} ${type} d${faces}`);
      }
    }
  }
  return `The throw takes ${dice.length} ${plural(dice.length)}. ${parts.join(', ')}.`;
}

/** The difficulty, printed the way the tile prints it. */
export function signedDifficulty(value: number): string {
  if (value === 0) return '0';
  return value > 0 ? `+${value}` : `−${Math.abs(value)}`;
}

/**
 * What the difficulty will do to the next throw, before the player rolls.
 *
 * The answer is measured against the core rather than restated: the pool is
 * built twice, once with the modifier and once without it, and the difference
 * between the two is what the sentence reports.
 */
export function difficultyPreview(state: AppState): string {
  if (state.mode === 'step') {
    // The core answers from the rated pair and the modifier, so the sentence
    // names the sizes the next roll really throws.
    const after = steppedDice(state.stepDice, state.difficulty);
    return after.skill === null
      ? `The next roll rolls one d${after.attribute}.`
      : `The next roll rolls a d${after.attribute} and a d${after.skill}.`;
  }
  const builder = builderOf(state);
  const before = buildPool(builder).length;
  const after = buildPool(applyDifficulty(builder, state.difficulty)).length;
  if (after > before) {
    return `The next roll adds ${after - before} bonus ${plural(after - before)}.`;
  }
  if (after < before) {
    return `The next roll takes ${before - after} ${plural(before - after)} away.`;
  }
  return 'The next roll takes no dice away and adds none.';
}

// ---------------------------------------------------------------------------
// The throw — Unit 2.2
//
// Every answer below comes from the rules core. This file throws nothing,
// locks nothing and prices nothing: `firstRoll`, `push`, `previewPush`,
// `isLocked` and `score` decide, and the screen renders what they say.
// ---------------------------------------------------------------------------

/**
 * Throw the built pool. A pool of no dice fails automatically and draws nothing
 * from the random source, so the table stays empty and the builder still
 * collapses. Both rest states of section 1 stay reachable from an empty pool.
 */
export function rollNow(state: AppState, random: RandomSource): AppState {
  const outcome = firstRoll(
    applyDifficulty(builderOf(state), state.difficulty),
    random,
    state.counts.stress,
  );
  if (outcome.kind === 'automaticFailure') {
    return { ...state, builderOpen: false, result: null, thrown: [] };
  }
  const result: RollResult = { dice: outcome.dice, stressAfter: outcome.stressAfter };
  return {
    ...state,
    builderOpen: false,
    result,
    thrown: result.dice.map((die) => die.id),
  };
}

/** What the push would cost, or `null` while the table is empty. */
export function pushPreview(state: AppState): PushPreviewOutcome | null {
  return state.result === null ? null : previewPush(state.result, profileOf(state));
}

/** True while the push button may be pressed. The core refuses, never the shell. */
export function canPush(state: AppState): boolean {
  const preview = pushPreview(state);
  return preview !== null && preview.kind === 'available' && preview.rerollCount > 0;
}

/**
 * Push. The core re-throws the loose dice and repeats every locked value, so
 * the kept dice keep their faces and their identities.
 *
 * The stress counter belongs to the application, and Decision 1 caps it at ten.
 * The core hands back the stress the profile derived, and the cap is applied
 * here, where the counter lives.
 */
export function pushNow(state: AppState, random: RandomSource): AppState {
  if (state.result === null) return state;
  const pushed = push(state.result, profileOf(state), random);
  if (pushed.kind === 'refused') return state;
  return {
    ...state,
    result: { dice: pushed.dice, stressAfter: pushed.stressAfter },
    thrown: pushed.rerolled,
    counts: {
      ...state.counts,
      stress: Math.min(POOL_CAPS.stress, pushed.stressAfter),
    },
  };
}

/** Keep a die by choice, or release one. A rule lock refuses and nothing moves. */
export function toggleDie(state: AppState, id: string): AppState {
  if (state.result === null) return state;
  return {
    ...state,
    result: { ...state.result, dice: clickDie(state.result.dice, id, profileOf(state)) },
    thrown: [],
  };
}

/** The two zones of the tray. Pool order holds inside each one. Decision 4. */
export function zonesOf(state: AppState): {
  readonly kept: readonly Die[];
  readonly loose: readonly Die[];
} {
  const profile = profileOf(state);
  const dice = state.result?.dice ?? [];
  return {
    kept: dice.filter((die) => isLocked(die, profile)),
    loose: dice.filter((die) => !isLocked(die, profile)),
  };
}

/** The short name a die carries on the table, as `At1` or `St10`. */
const TYPE_TAG: Readonly<Record<DieType, string>> = {
  attribute: 'At',
  skill: 'Sk',
  gear: 'Ge',
  artifact: 'Ar',
  bonus: 'Bo',
  stress: 'St',
};

export function dieTag(die: Die): string {
  return `${TYPE_TAG[die.type]}${die.id.slice(die.type.length + 1)}`;
}

/** The `data-el` name of one die, as section 6 fixes it: `die-at1`. */
export function dieElement(die: Die): string {
  return `die-${dieTag(die).toLowerCase()}`;
}

/** What the screen draws for one die, and what a screen reader hears. */
export interface DieView {
  readonly die: Die;
  readonly element: string;
  readonly tag: string;
  readonly value: number | null;
  readonly state: LockState;
  readonly successes: number;
  readonly bane: boolean;
  /** The state word the caption prints beside the tag. */
  readonly word: string;
  /** The accessible name. Shape and colour carry the same facts to the eye. */
  readonly label: string;
}

const STATE_WORD: Readonly<Record<LockState, string>> = {
  rule: 'kept',
  choice: 'yours',
  loose: 'back',
};

const STATE_SENTENCE: Readonly<Record<LockState, string>> = {
  rule: 'The rules keep it on the table.',
  choice: 'You keep it on the table. Press to send it back.',
  loose: 'It goes back in the cup. Press to keep it.',
};

export function dieView(die: Die, profile: PushProfile): DieView {
  const value = latestValue(die);
  const state = lockState(die, profile);
  const successes = score(die);
  const bane = value === 1;
  const worth =
    successes === 0 ? '' : successes === 1 ? ' One success.' : ` ${successes} successes.`;
  return {
    die,
    element: dieElement(die),
    tag: dieTag(die),
    value,
    state,
    successes,
    bane,
    word: STATE_WORD[state],
    label:
      `${dieTag(die)} shows ${value === null ? 'nothing' : value}.` +
      worth +
      (bane ? ' A bane.' : '') +
      ` ${STATE_SENTENCE[state]}`,
  };
}

/** What the status line reads. Every figure is derived, never stored. */
export interface Readout {
  readonly successes: number;
  readonly banes: number;
  readonly dice: number;
  readonly stress: number;
  readonly pushes: number;
}

export function readout(state: AppState): Readout {
  const result = state.result;
  return {
    successes: result === null ? 0 : successCount(result),
    banes:
      result === null
        ? 0
        : Object.values(baneCount(result)).reduce((total, each) => total + each, 0),
    dice: result === null ? 0 : result.dice.length,
    stress: state.counts.stress,
    pushes: result === null ? 0 : Math.max(0, generations(result.dice) - 1),
  };
}

/**
 * What one push costs, in the unit the profile charges. Keyed by `cost.unit`,
 * which is a data field, so a fifth cost model is a new row here as well.
 */
const COST_SENTENCE: Readonly<Record<PushCostUnit, (total: number) => string>> = {
  ratingPoint: (total) => `The banes cost ${total} rating ${total === 1 ? 'point' : 'points'}.`,
  healthPoint: (total) => `The banes cost ${total} ${total === 1 ? 'point' : 'points'} of health.`,
  refereePoint: (total) => `The referee gains ${total} ${total === 1 ? 'point' : 'points'}.`,
  complicationCheck: () => 'A complication check is due.',
};

/**
 * The sentence on the cost row. It reads `previewPush` and never recomputes a
 * cost, so the number the player commits to is the number the rules apply.
 */
export function costLine(state: AppState): string {
  const preview = pushPreview(state);
  if (preview === null) {
    return 'No dice are on the table.';
  }
  if (preview.kind === 'refused') {
    return preview.reason === 'atPushLimit'
      ? 'No push is left. This roll is at the push limit.'
      : 'A stress die shows a bane. No push is left.';
  }
  const price =
    preview.cost.total === 0 ? '' : ` ${COST_SENTENCE[preview.cost.unit](preview.cost.total)}`;
  return `Push again — throw ${preview.rerollCount} ` + `${plural(preview.rerollCount)}.${price}`;
}

/** What the push button prints under its own name: the count and the stress. */
export function pushNote(state: AppState): string {
  const preview = pushPreview(state);
  if (preview === null || preview.kind === 'refused') {
    return 'no push is left';
  }
  const stress = Math.min(POOL_CAPS.stress, preview.stressAfter);
  return `${preview.rerollCount} ${plural(preview.rerollCount)}, stress ${stress}`;
}
