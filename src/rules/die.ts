// Rules core. No browser API, no module-level mutable state.
// The generation model comes from specs/0001-rules-model.md, section
// "Generations and the history matrix".

export type DieType = 'attribute' | 'skill' | 'gear' | 'artifact' | 'bonus' | 'stress';

export type Faces = 6 | 8 | 10 | 12;

export interface Die {
  readonly id: string;
  readonly type: DieType;
  readonly faces: Faces;
  /** One entry per generation, append-only. `null` means the die did not exist then. */
  readonly values: readonly (number | null)[];
  readonly manualLock: boolean;
}

/**
 * A die that first appears at `generation` carries `null` for every earlier
 * generation, so the history matrix stays rectangular.
 */
export function createDie(
  id: string,
  type: DieType,
  faces: Faces,
  generation = 0,
  manualLock = false,
): Die {
  return { id, type, faces, values: new Array<number | null>(generation).fill(null), manualLock };
}

/** The value of the newest generation, or `null` before the die exists. */
export function latestValue(die: Die): number | null {
  return die.values.length === 0 ? null : (die.values[die.values.length - 1] ?? null);
}

/** Append one generation. The input die is not changed. */
export function appendValue(die: Die, value: number | null): Die {
  return { ...die, values: [...die.values, value] };
}

/** A locked die repeats its previous value, so the matrix stays rectangular. */
export function keepValue(die: Die): Die {
  return appendValue(die, latestValue(die));
}
