// Rules core. No browser API, no module-level mutable state.
// The generation model and the derived-value rule come from
// specs/0001-rules-model.md, sections "Generations and the history matrix" and
// "Derived values".
//
// The success count and the bane count are derived. They are computed on
// demand and are never written into the live model, because the spec forbids
// that. The log is the one place that stores them, and the log is Unit 4.4.

import type { Die, DieType } from './die';
import { appendValue, latestValue } from './die';
import type { RandomSource } from './random';
import type { ArtifactCurveId } from './success';
import { curveFor, score } from './success';

/**
 * What the application asks the core to throw. `stressBefore` is the stress
 * counter the application holds and persists. The core reads it, never stores
 * it, and hands it back as `stressAfter`. A counter kept in this module would
 * be module state, and every call would then depend on the calls before it.
 */
export interface RollRequest {
  readonly dice: readonly Die[];
  readonly stressBefore: number;
}

/**
 * One generation of a pool. `dice` is the whole history matrix, so the newest
 * generation is the last entry of every row.
 *
 * `stressAfter` is derived. It is `stressBefore` plus what the profile added,
 * and a first roll adds none. It is never written onto a die.
 */
export interface RollResult {
  readonly dice: readonly Die[];
  readonly stressAfter: number;
}

/**
 * Throw every die in the request once and append the result as a new
 * generation. The input dice are not changed, and no die object is changed.
 *
 * A pool straight from `buildPool` holds no values, so this call gives the
 * generation-0 values.
 */
export function roll(request: RollRequest, random: RandomSource): RollResult {
  return {
    dice: request.dice.map((die) => appendValue(die, random.face(die.faces))),
    stressAfter: request.stressBefore,
  };
}

/**
 * The successes the newest generation is worth, read from the success tables.
 *
 * `artifactCurve` is the curve the artifact dice run under. It is the one
 * choice a player has over a curve, and `curveFor` decides which dice it
 * reaches. Left out, every die takes its own default curve.
 */
export function successCount(result: RollResult, artifactCurve?: ArtifactCurveId): number {
  return result.dice.reduce((total, die) => total + score(die, curveFor(die, artifactCurve)), 0);
}

/** A bane is a 1. Stress dice cost on a 1 on the first roll too. */
export function baneCount(result: RollResult): Record<DieType, number> {
  const banes: Record<DieType, number> = {
    attribute: 0,
    skill: 0,
    gear: 0,
    artifact: 0,
    bonus: 0,
    stress: 0,
  };
  for (const die of result.dice) {
    if (latestValue(die) === 1) {
      banes[die.type] += 1;
    }
  }
  return banes;
}
