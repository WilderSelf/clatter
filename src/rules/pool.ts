// Rules core. No browser API, no module-level mutable state.
// The step ladder, the difficulty range, the removal order, the help limit and
// the mode switch come from specs/0001-rules-model.md, sections "The step
// ladder — enumerated, not procedural" and "Other rules".

import type { Die, DieType, Faces } from './die';
import { createDie } from './die';
import type { RandomSource } from './random';
import type { RollResult } from './roll';
import { roll } from './roll';

export type Mode = 'pool' | 'step';

/** An artifact die is always a step die, so a six-faced one is unwritable. */
export type ArtifactFaces = Exclude<Faces, 6>;

export interface DiceSpec {
  readonly type: DieType;
  readonly faces: Faces;
}

/**
 * One state of the step ladder. State 0 holds a lone attribute die, so the
 * skill die is absent there.
 */
export interface LadderState {
  readonly attribute: Faces;
  readonly skill: Faces | null;
}

/**
 * The eight states, in order. A modifier is an index offset into this list.
 *
 * Prose rules that step the lower die up and the higher die down are
 * path-dependent, so `+2` then `-1` would not reliably equal `+1`. An index
 * offset makes reversibility true by construction. Do not replace this list
 * with a procedural stepping rule.
 */
export const STEP_LADDER: readonly LadderState[] = [
  { attribute: 6, skill: null },
  { attribute: 6, skill: 6 },
  { attribute: 8, skill: 6 },
  { attribute: 8, skill: 8 },
  { attribute: 10, skill: 8 },
  { attribute: 10, skill: 10 },
  { attribute: 12, skill: 10 },
  { attribute: 12, skill: 12 },
];

const LAST_STEP = STEP_LADDER.length - 1;

/** Difficulty runs from +3 to -3. There is no target number. */
export const MODIFIER_LIMIT = 3;

/** Three helpers, one die each. */
export const HELPER_LIMIT = 3;

/** A negative modifier takes skill dice first, then gear, then attribute. */
export const REMOVAL_ORDER: readonly DieType[] = ['skill', 'gear', 'attribute'];

function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value));
}

/** The ceiling and the floor of the ladder are the ends of the list. */
export function stepIndex(index: number, offset: number): number {
  return clamp(index + offset, 0, LAST_STEP);
}

export function ladderState(index: number): LadderState {
  const state = STEP_LADDER[clamp(index, 0, LAST_STEP)];
  if (state === undefined) {
    throw new Error(`no step-ladder state at index ${index}`);
  }
  return state;
}

/** Counts per dice type. An artifact die carries its own size, so it is listed. */
export interface PoolCounts {
  readonly attribute?: number;
  readonly skill?: number;
  readonly gear?: number;
  readonly bonus?: number;
  readonly stress?: number;
  readonly artifact?: readonly ArtifactFaces[];
}

export interface PoolBuilder {
  readonly mode: 'pool';
  readonly dice: readonly DiceSpec[];
}

export interface StepBuilder {
  readonly mode: 'step';
  /** An index into STEP_LADDER. */
  readonly step: number;
  /** Gear, artifact, bonus and stress dice, added to the step roll unchanged. */
  readonly dice: readonly DiceSpec[];
}

export type Builder = PoolBuilder | StepBuilder;

/** The types a step-dice roll takes on top of the ladder pair. */
const STEP_EXTRA_TYPES: readonly DieType[] = ['gear', 'artifact', 'bonus', 'stress'];

export function emptyBuilder(mode: Mode): Builder {
  return mode === 'pool' ? { mode, dice: [] } : { mode, step: 0, dice: [] };
}

/**
 * A mode switch discards the built pool and gives the empty builder for the new
 * mode. No conversion between the two modes exists.
 */
export function switchMode(_discarded: Builder, mode: Mode): Builder {
  return emptyBuilder(mode);
}

function repeat(spec: DiceSpec, count: number): DiceSpec[] {
  return Array.from({ length: Math.max(0, count) }, () => spec);
}

/** Pool mode. Attribute and skill dice are six-faced here. */
export function poolBuilder(counts: PoolCounts): PoolBuilder {
  return {
    mode: 'pool',
    dice: [
      ...repeat({ type: 'attribute', faces: 6 }, counts.attribute ?? 0),
      ...repeat({ type: 'skill', faces: 6 }, counts.skill ?? 0),
      ...repeat({ type: 'gear', faces: 6 }, counts.gear ?? 0),
      ...(counts.artifact ?? []).map((faces) => ({ type: 'artifact', faces }) as DiceSpec),
      ...repeat({ type: 'bonus', faces: 6 }, counts.bonus ?? 0),
      ...repeat({ type: 'stress', faces: 6 }, counts.stress ?? 0),
    ],
  };
}

/** Step mode. The ladder gives the attribute and skill dice. */
export function stepBuilder(index: number, extras: readonly DiceSpec[] = []): StepBuilder {
  const built: StepBuilder = { mode: 'step', step: clamp(index, 0, LAST_STEP), dice: [] };
  return extras.reduce<StepBuilder>((builder, spec) => addDice(builder, spec, 1), built);
}

export function addDice<B extends Builder>(builder: B, spec: DiceSpec, count = 1): B {
  if (builder.mode === 'step' && !STEP_EXTRA_TYPES.includes(spec.type)) {
    throw new Error(`step mode takes its ${spec.type} die from the ladder, not from the pool`);
  }
  return { ...builder, dice: [...builder.dice, ...repeat(spec, count)] };
}

function removeDice(dice: readonly DiceSpec[], count: number): readonly DiceSpec[] {
  const kept = [...dice];
  let left = count;
  for (const type of REMOVAL_ORDER) {
    for (let index = kept.length - 1; index >= 0 && left > 0; index -= 1) {
      if (kept[index]?.type === type) {
        kept.splice(index, 1);
        left -= 1;
      }
    }
  }
  return kept;
}

/**
 * Difficulty is dice added or removed, or die steps. The modifier is clamped to
 * the +3 to -3 range first.
 *
 * A positive modifier in pool mode adds bonus dice, because a bonus die scores
 * and carries no cost. A negative modifier removes dice in REMOVAL_ORDER, so
 * bonus, stress and artifact dice stay.
 */
export function applyDifficulty<B extends Builder>(builder: B, modifier: number): B {
  const size = clamp(modifier, -MODIFIER_LIMIT, MODIFIER_LIMIT);
  if (builder.mode === 'step') {
    return { ...builder, step: stepIndex(builder.step, size) };
  }
  if (size >= 0) {
    return addDice(builder, { type: 'bonus', faces: 6 }, size);
  }
  return { ...builder, dice: removeDice(builder.dice, -size) };
}

/** One die per helper, three helpers at most. */
export function addHelp<B extends Builder>(builder: B, helpers: number): B {
  return addDice(builder, { type: 'bonus', faces: 6 }, clamp(helpers, 0, HELPER_LIMIT));
}

function toSpecs(builder: Builder): readonly DiceSpec[] {
  if (builder.mode === 'pool') {
    return builder.dice;
  }
  const state = ladderState(builder.step);
  const pair: DiceSpec[] = [{ type: 'attribute', faces: state.attribute }];
  if (state.skill !== null) {
    pair.push({ type: 'skill', faces: state.skill });
  }
  return [...pair, ...builder.dice];
}

/** The dice the builder holds, at generation 0, with no value rolled. */
export function buildPool(builder: Builder): readonly Die[] {
  const seen = new Map<DieType, number>();
  return toSpecs(builder).map((spec) => {
    const ordinal = (seen.get(spec.type) ?? 0) + 1;
    seen.set(spec.type, ordinal);
    return createDie(`${spec.type}-${ordinal}`, spec.type, spec.faces);
  });
}

/** Zero dice is an automatic failure, not an empty roll. */
export type BuildOutcome =
  { readonly kind: 'automaticFailure' } | ({ readonly kind: 'rolled' } & RollResult);

/**
 * Build the pool and throw it once. A pool of zero dice fails automatically and
 * draws nothing from the random source.
 *
 * `stressBefore` is the counter the application holds. The core reads it and
 * hands back `stressAfter`, which a first roll leaves alone.
 */
export function firstRoll(builder: Builder, random: RandomSource, stressBefore = 0): BuildOutcome {
  const pool = buildPool(builder);
  if (pool.length === 0) {
    return { kind: 'automaticFailure' };
  }
  return { kind: 'rolled', ...roll({ dice: pool, stressBefore }, random) };
}
