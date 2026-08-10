// Rules core. No browser API, no module-level mutable state.
// The curves and the dice-type rows come from specs/0001-rules-model.md,
// sections "Dice types" and "Success curves".
//
// The rules are data. A new variant is a new row in DICE_TYPES or a new entry
// in CURVES. No resolver branches on a dice type.

import type { Die, DieType, Faces } from './die';
import { latestValue } from './die';

export type CurveId = 'pool' | 'step' | 'artifactEscalating' | 'artifactFlat';

interface Threshold {
  /** The lowest face value that pays this many successes. */
  readonly atLeast: number;
  readonly successes: number;
}

/**
 * The threshold rule of each curve, in rising order. The highest threshold a
 * face reaches wins. Every face below the first threshold scores nothing.
 */
const CURVES: Readonly<Record<CurveId, readonly Threshold[]>> = {
  pool: [{ atLeast: 6, successes: 1 }],
  step: [
    { atLeast: 6, successes: 1 },
    { atLeast: 10, successes: 2 },
  ],
  artifactEscalating: [
    { atLeast: 6, successes: 1 },
    { atLeast: 8, successes: 2 },
    { atLeast: 10, successes: 3 },
    { atLeast: 12, successes: 4 },
  ],
  artifactFlat: [
    { atLeast: 6, successes: 1 },
    { atLeast: 10, successes: 2 },
  ],
};

export interface DiceTypeRow {
  readonly type: DieType;
  readonly curve: CurveId;
  /** Every face count this type allows on this curve. */
  readonly faces: readonly Faces[];
}

/**
 * One row per dice type and curve. The first row of a type that allows a face
 * count carries that die's default curve.
 *
 * Attribute and skill dice take the pool curve at six faces and the step curve
 * in step mode. Artifact dice are always step dice, in both modes, so they hold
 * no pool row and no six-face entry.
 */
export const DICE_TYPES: readonly DiceTypeRow[] = [
  { type: 'attribute', curve: 'pool', faces: [6] },
  { type: 'attribute', curve: 'step', faces: [6, 8, 10, 12] },
  { type: 'skill', curve: 'pool', faces: [6] },
  { type: 'skill', curve: 'step', faces: [6, 8, 10, 12] },
  { type: 'gear', curve: 'pool', faces: [6] },
  { type: 'artifact', curve: 'artifactEscalating', faces: [8, 10, 12] },
  { type: 'artifact', curve: 'artifactFlat', faces: [8, 10, 12] },
  { type: 'bonus', curve: 'pool', faces: [6] },
  { type: 'stress', curve: 'pool', faces: [6] },
];

export type TableKey = `${DieType}:${CurveId}:${Faces}`;

export function tableKey(type: DieType, curve: CurveId, faces: Faces): TableKey {
  return `${type}:${curve}:${faces}`;
}

/** One entry per face, generated from the threshold rule. Index 0 is face 1. */
function generateTable(curve: CurveId, faces: Faces): readonly number[] {
  const thresholds = CURVES[curve];
  return Array.from({ length: faces }, (_unused, index) => {
    const face = index + 1;
    let successes = 0;
    for (const threshold of thresholds) {
      if (face >= threshold.atLeast) {
        successes = threshold.successes;
      }
    }
    return successes;
  });
}

/**
 * Every table is sized to its face count, so an impossible row — a `>= 12`
 * entry on a d10 — cannot be written.
 */
export const SUCCESS_TABLE: ReadonlyMap<TableKey, readonly number[]> = new Map(
  DICE_TYPES.flatMap((row) =>
    row.faces.map(
      (faces) => [tableKey(row.type, row.curve, faces), generateTable(row.curve, faces)] as const,
    ),
  ),
);

/** The curve a die of this type and size takes when no toggle overrides it. */
export function defaultCurve(type: DieType, faces: Faces): CurveId {
  const row = DICE_TYPES.find((each) => each.type === type && each.faces.includes(faces));
  if (row === undefined) {
    throw new Error(`no success curve for a ${type} die of ${faces} faces`);
  }
  return row.curve;
}

/**
 * The two curves an artifact die may take. Every other type has one curve, so
 * this is the only choice the player is offered. Unit 4.1 stores it.
 */
export type ArtifactCurveId = Extract<CurveId, 'artifactEscalating' | 'artifactFlat'>;

/** Both artifact curves, as a list. A settings control walks it. */
export const ARTIFACT_CURVE_IDS: readonly ArtifactCurveId[] = [
  'artifactEscalating',
  'artifactFlat',
];

/**
 * The curve one die takes under a chosen artifact curve, or `undefined` where
 * the die takes its own default.
 *
 * One answer, read by the screen, by the log and by the roll. Two readers with
 * two copies of this rule would price one artifact die two ways.
 */
export function curveFor(
  die: Die,
  artifactCurve: ArtifactCurveId | undefined,
): CurveId | undefined {
  return die.type === 'artifact' ? artifactCurve : undefined;
}

/**
 * The successes the die's newest face is worth, read from the table.
 * A die that has not rolled scores nothing.
 */
export function score(die: Die, curve: CurveId = defaultCurve(die.type, die.faces)): number {
  const face = latestValue(die);
  if (face === null) {
    return 0;
  }
  const key = tableKey(die.type, curve, die.faces);
  const table = SUCCESS_TABLE.get(key);
  if (table === undefined) {
    throw new Error(`no success table for ${key}`);
  }
  const successes = table[face - 1];
  if (successes === undefined) {
    throw new Error(`face ${face} is outside a d${die.faces}`);
  }
  return successes;
}
