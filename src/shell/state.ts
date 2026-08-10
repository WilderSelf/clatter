// The application state and every reading the screen takes from it.
//
// Pure. No browser API is named here and no module-level value changes, so the
// whole store runs under a plain test runner. The shell imports this file and
// this file imports the rules core. The core imports neither. Constraint 3.
//
// Nothing here decides a rule. The pool, the step ladder and the effect of the
// difficulty all come from `src/rules/pool.ts`, and this file only holds what
// the player has typed and asks the core what it means.

import type { Die, DieType } from '../rules/die';
import type { ArtifactFaces, Builder, DiceSpec, Mode } from '../rules/pool';
import {
  applyDifficulty,
  buildPool,
  ladderState,
  MODIFIER_LIMIT,
  poolBuilder,
  stepBuilder,
  stepIndex,
  STEP_LADDER,
} from '../rules/pool';

/**
 * The artifact tile steps along an enumerated ladder, in the manner of
 * `STEP_LADDER`. One rating gives a size and a count, so the tile holds one
 * number and the pool holds the dice that number names.
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
 * The most dice of each type one pool holds, from Decision 1 in
 * `docs/design/0012-settled-decisions.md`: 5 attribute, 5 skill, 3 gear and 2
 * bonus make a pool of 15, and 10 stress dice bring the tray to its 25-die
 * ceiling.
 */
export const POOL_CAPS = {
  attribute: 5,
  skill: 5,
  gear: 3,
  artifact: ARTIFACT_LADDER.length - 1,
  bonus: 2,
  stress: 10,
} as const;

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

export interface AppState {
  readonly mode: Mode;
  readonly counts: Counts;
  /** An index into `STEP_LADDER`. Step mode reads it, pool mode ignores it. */
  readonly step: number;
  readonly difficulty: number;
  /** The builder is open at rest A and collapsed at rest B. */
  readonly builderOpen: boolean;
  readonly sheetOpen: boolean;
}

export function emptyState(mode: Mode): AppState {
  return {
    mode,
    counts: ZERO_COUNTS,
    step: 0,
    difficulty: 0,
    builderOpen: true,
    sheetOpen: false,
  };
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
  // The ladder gives the attribute and the skill die. Gear, artifact, bonus and
  // stress dice are extras the core adds to a step roll unchanged.
  return stepBuilder(state.step, [
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
  /** The counted type, or `step` for the merged ladder tile. */
  readonly key: CountKey | 'step';
}

const COUNTED_CELLS: readonly (readonly [CountKey, string])[] = [
  ['attribute', 'attribute'],
  ['skill', 'skill'],
  ['gear', 'gear'],
  ['artifact', 'artifact'],
  ['bonus', 'bonus'],
  ['stress', 'stress'],
];

/** The ladder pair, as the merged tile prints it. */
export function ladderLabel(step: number): string {
  const state = ladderState(step);
  return state.skill === null ? `d${state.attribute}` : `d${state.attribute} + d${state.skill}`;
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
    key,
  };
}

/**
 * The tiles of the pool bar, in the order the keyboard walks them.
 *
 * Step mode merges the attribute tile and the skill tile into one ladder tile,
 * because the ladder gives both sizes from one index. Section 5 of
 * `docs/design/0002-screen-design.md` settles that, and `STEP_LADDER` is why: a
 * pair of independent size pickers is path-dependent and an index is not.
 */
export function poolCells(state: AppState): readonly PoolCell[] {
  const counted = COUNTED_CELLS.filter(
    ([key]) => state.mode === 'pool' || (key !== 'attribute' && key !== 'skill'),
  ).map(([key, label]) => countedCell(key, label, state.counts[key]));
  if (state.mode === 'pool') {
    return counted;
  }
  const max = STEP_LADDER.length - 1;
  return [
    {
      id: 'pool-cell-ladder',
      label: 'step dice',
      value: ladderLabel(state.step),
      valueText: ladderLabel(state.step).replace(' + ', ' and '),
      count: state.step,
      max,
      atCap: state.step >= max,
      key: 'step',
    },
    ...counted,
  ];
}

/** Move one tile up or down. Every tile stops at its own cap and at zero. */
export function nudge(state: AppState, key: CountKey | 'step', delta: number): AppState {
  if (key === 'step') {
    return { ...state, step: stepIndex(state.step, delta) };
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
 * behind the disclosure and not one tap from the throw.
 */
export function withMode(state: AppState, mode: Mode): AppState {
  return { ...emptyState(mode), sheetOpen: state.sheetOpen };
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
    const after = ladderState(stepIndex(state.step, state.difficulty));
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
