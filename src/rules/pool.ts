// Rules core. No browser API, no module-level mutable state.
// The step dice, the difficulty range, the removal order, the help limit and
// the mode switch come from specs/0001-rules-model.md, sections "Step dice —
// two independent scales" and "Other rules".

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
 * A step-mode pair.
 *
 * The attribute and the skill are rated on two independent scales, so all
 * sixteen size pairs are expressible, a d12 beside a d6 among them. A skill of
 * `null` is no skill die at all, and it is independent of the attribute size:
 * the player rolls the attribute die alone, at whatever size it holds.
 */
export interface StepDice {
  readonly attribute: Faces;
  readonly skill: Faces | null;
}

/** The four sizes of a step die, smallest first. Both scales run over it. */
export const STEP_SIZES: readonly Faces[] = [6, 8, 10, 12];

/** Where a step pool starts: the smallest attribute and no skill die. */
export const START_STEP_DICE: StepDice = { attribute: 6, skill: null };

/** Difficulty runs from +3 to -3. There is no target number. */
export const MODIFIER_LIMIT = 3;

/** Three helpers, one die each. */
export const HELPER_LIMIT = 3;

/** A negative modifier takes skill dice first, then gear, then attribute. */
export const REMOVAL_ORDER: readonly DieType[] = ['skill', 'gear', 'attribute'];

function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value));
}

function rankOf(faces: Faces): number {
  return STEP_SIZES.indexOf(faces);
}

/** The size at one rank of the scale. Both ends of the scale clamp. */
function sizeAt(rank: number): Faces {
  const size = STEP_SIZES[clamp(rank, 0, STEP_SIZES.length - 1)];
  if (size === undefined) {
    throw new Error(`no step size at rank ${rank}`);
  }
  return size;
}

/**
 * How one modifier splits across the two dice, as data rather than as branching
 * code. The row is chosen by the modifier alone. The first number is the steps
 * the lower-rated die takes and the second is the steps the higher-rated one
 * takes, so a modifier raises the weaker die first and lowers the stronger die
 * first. On a tie the attribute counts as the lower die.
 *
 * The rows are read off the progression the earlier eight-state list held, so
 * every pair that list could express steps exactly as it did.
 */
const MODIFIER_SPLIT: readonly (readonly [number, number])[] = [
  [-1, -2], // -3
  [-1, -1], // -2
  [0, -1], // -1
  [0, 0], //  0
  [1, 0], // +1
  [1, 1], // +2
  [2, 1], // +3
];

/**
 * The sizes a modifier rolls, from the base pair and the modifier alone.
 *
 * **It reads the base pair and never a pair it produced earlier.** The base and
 * the modifier are both stored, so `+2` and then `-1` is the stored integer
 * `+1` and lands where a single `+1` lands, and `-n` after `+n` returns the
 * base whether the sizes clamped or not. A rule that stepped the pair it last
 * produced would be path-dependent, and `+2` then `-1` would not reliably equal
 * `+1`. That is the defect the earlier eight-state list was written to avoid,
 * and a stored modifier avoids it without tying the two scales together.
 */
export function steppedDice(base: StepDice, modifier: number): StepDice {
  const split = MODIFIER_SPLIT[clamp(modifier, -MODIFIER_LIMIT, MODIFIER_LIMIT) + MODIFIER_LIMIT];
  if (split === undefined) {
    throw new Error(`no modifier split for ${modifier}`);
  }
  const [lower, higher] = split;
  if (base.skill === null) {
    // No skill die stays no skill die. The whole modifier falls on the lone
    // attribute die, which is what the pair would have taken between them.
    return { attribute: sizeAt(rankOf(base.attribute) + lower + higher), skill: null };
  }
  const attributeIsLower = rankOf(base.attribute) <= rankOf(base.skill);
  return {
    attribute: sizeAt(rankOf(base.attribute) + (attributeIsLower ? lower : higher)),
    skill: sizeAt(rankOf(base.skill) + (attributeIsLower ? higher : lower)),
  };
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

/**
 * Step mode. The base pair is what the player rated, and `modifier` is the
 * stored difficulty. The rolled sizes are computed from the two when the pool
 * is built, so nothing ever writes a stepped size back over a base one.
 */
export interface StepBuilder extends StepDice {
  readonly mode: 'step';
  readonly modifier: number;
  /** Gear, artifact, bonus and stress dice, added to the step roll unchanged. */
  readonly dice: readonly DiceSpec[];
}

export type Builder = PoolBuilder | StepBuilder;

/** The types a step-dice roll takes on top of the rated pair. */
const STEP_EXTRA_TYPES: readonly DieType[] = ['gear', 'artifact', 'bonus', 'stress'];

export function emptyBuilder(mode: Mode): Builder {
  return mode === 'pool' ? { mode, dice: [] } : { mode, ...START_STEP_DICE, modifier: 0, dice: [] };
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

/** Step mode. The rated pair gives the attribute and skill dice. */
export function stepBuilder(base: StepDice, extras: readonly DiceSpec[] = []): StepBuilder {
  const built: StepBuilder = { mode: 'step', ...base, modifier: 0, dice: [] };
  return extras.reduce<StepBuilder>((builder, spec) => addDice(builder, spec, 1), built);
}

export function addDice<B extends Builder>(builder: B, spec: DiceSpec, count = 1): B {
  if (builder.mode === 'step' && !STEP_EXTRA_TYPES.includes(spec.type)) {
    throw new Error(`step mode takes its ${spec.type} die from its size, not from the pool`);
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
 *
 * Step mode adds the modifier to the one the builder already holds and changes
 * no size. `toSpecs` computes the sizes from the base pair and that total, so
 * two calls compose as arithmetic: `+2` and then `-1` holds `+1`.
 */
export function applyDifficulty<B extends Builder>(builder: B, modifier: number): B {
  const size = clamp(modifier, -MODIFIER_LIMIT, MODIFIER_LIMIT);
  if (builder.mode === 'step') {
    return {
      ...builder,
      modifier: clamp(builder.modifier + size, -MODIFIER_LIMIT, MODIFIER_LIMIT),
    };
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
  // The sizes are computed here, from the base pair and the stored modifier.
  // The builder keeps both, so no stepped size is ever read back as a base.
  const rolled = steppedDice(builder, builder.modifier);
  const pair: DiceSpec[] = [{ type: 'attribute', faces: rolled.attribute }];
  if (rolled.skill !== null) {
    pair.push({ type: 'skill', faces: rolled.skill });
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
