// The roll log entry and the profile hash.
//
// This module is not the rules core. It reads the core and imports
// `node:crypto`, which the core may never do.
//
// specs/0001-rules-model.md, section "Derived values":
//
//   All computed, never stored in the live model. The log is different. A log
//   entry stores its derived values AND a hash of the profile that produced
//   them. Otherwise a later profile edit silently rewrites campaign history,
//   and an export/re-import equality check still passes because both sides
//   re-derive the same wrong way.
//
// So every derived number the log shows is written into the entry once, at the
// moment of the roll, and nothing reads it back through the profile again.

import { createHash } from 'node:crypto';
import type { Die, DieType, Faces } from '../rules/die';
import type { Mode } from '../rules/pool';
import { pushCost } from '../rules/push';
import type { PushCostUnit, PushProfile } from '../rules/push-profile';
import { isLocked } from '../rules/push-profile';
import type { RollResult } from '../rules/roll';
import { baneCount } from '../rules/roll';
import type { CurveId } from '../rules/success';
import { score } from '../rules/success';

/** The two curves an artifact die may take. Every other type has one curve. */
export type ArtifactCurve = Extract<CurveId, 'artifactEscalating' | 'artifactFlat'>;

/**
 * One die at one generation, with the values that die was worth at the time.
 * A generation the die did not exist at holds `null` instead of a cell.
 */
export interface DieCell {
  readonly value: number;
  readonly successes: number;
  readonly locked: boolean;
}

/**
 * One column of the history matrix, as the log keeps it.
 *
 * The die carries no identifier. The export schema names the die by its
 * position in the roll, so an identifier would not survive a round trip, and a
 * field the log cannot read back is a field the log must not hold.
 */
export interface LoggedDie {
  readonly type: DieType;
  readonly faces: Faces;
  /** One entry per generation. `null` means the die did not exist then. */
  readonly cells: readonly (DieCell | null)[];
}

/** A completed roll, with its derived values and the hash of its profile. */
export interface LogEntry {
  readonly rollId: string;
  readonly timestampIso: string;
  /** The identifier of the profile that produced the roll. */
  readonly ruleset: string;
  /** The hash of that whole profile, as it stood at the moment of the roll. */
  readonly profileHash: string;
  readonly mode: Mode;
  readonly dice: readonly LoggedDie[];
  /** Successes over the newest generation. Derived once, then stored. */
  readonly successes: number;
  /** Banes over the newest generation, every type together. */
  readonly banes: number;
  readonly pushCount: number;
  readonly costType: PushCostUnit;
  readonly costAmount: number;
  readonly stressBefore: number;
  readonly stressAfter: number;
  /** User text. It is rendered, so every reader must treat it as untrusted. */
  readonly note: string;
}

export interface LogInput {
  readonly rollId: string;
  readonly timestampIso: string;
  readonly mode: Mode;
  readonly result: RollResult;
  readonly profile: PushProfile;
  readonly stressBefore: number;
  /** The curve the artifact dice ran under. Defaults to the escalating one. */
  readonly artifactCurve?: ArtifactCurve;
  readonly note?: string;
}

/**
 * Sort the keys of every object, so two records that differ only in key order
 * serialise the same way. `JSON.stringify` calls a replacer at every level and
 * then walks into what the replacer returns, so one function covers the whole
 * tree. An array keeps its order, because the order of an array is data.
 */
function sortedKeys(_key: string, value: unknown): unknown {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return value;
  }
  const entries = Object.entries(value as Record<string, unknown>);
  entries.sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0));
  return Object.fromEntries(entries);
}

/**
 * A hash of the whole profile. Stable across runs and across key order,
 * sensitive to every field.
 *
 * The hash is what makes a log entry outlive an edit of the profile that
 * produced it. Read it, never re-derive it.
 */
export function profileHash(profile: PushProfile): string {
  return createHash('sha256').update(JSON.stringify(profile, sortedKeys)).digest('hex');
}

/** An artifact die takes the curve the settings chose. Every other type has one. */
function curveOf(die: Die, artifactCurve: ArtifactCurve | undefined): CurveId | undefined {
  return die.type === 'artifact' ? artifactCurve : undefined;
}

/**
 * The die as it stood at one generation. `score` and `isLocked` both read the
 * newest value, so a shortened copy asks them about an older generation.
 */
function dieAt(die: Die, generation: number): Die {
  return { ...die, values: die.values.slice(0, generation + 1) };
}

function cellsOf(
  die: Die,
  profile: PushProfile,
  artifactCurve: ArtifactCurve | undefined,
): readonly (DieCell | null)[] {
  const curve = curveOf(die, artifactCurve);
  return die.values.map((value, generation) => {
    if (value === null) {
      return null;
    }
    const view = dieAt(die, generation);
    return { value, successes: score(view, curve), locked: isLocked(view, profile, curve) };
  });
}

/**
 * Write one completed roll into the log.
 *
 * Every derived number is computed here and kept. The profile is hashed here
 * and kept. Nothing downstream needs the profile again, so a later edit of the
 * profile cannot rewrite this entry.
 */
export function createLogEntry(input: LogInput): LogEntry {
  const { result, profile, artifactCurve } = input;
  if (result.dice.length === 0) {
    throw new Error('a log entry needs at least one die');
  }
  const dice: LoggedDie[] = result.dice.map((die) => ({
    type: die.type,
    faces: die.faces,
    cells: cellsOf(die, profile, artifactCurve),
  }));
  const generations = dice.reduce((longest, die) => Math.max(longest, die.cells.length), 0);
  const newest = generations - 1;
  const successes = dice.reduce((total, die) => total + (die.cells[newest]?.successes ?? 0), 0);
  const banes = Object.values(baneCount(result)).reduce((total, count) => total + count, 0);
  return {
    rollId: input.rollId,
    timestampIso: input.timestampIso,
    ruleset: profile.id,
    profileHash: profileHash(profile),
    mode: input.mode,
    dice,
    successes,
    banes,
    pushCount: Math.max(0, generations - 1),
    costType: profile.cost.unit,
    costAmount: pushCost(result, profile).total,
    stressBefore: input.stressBefore,
    stressAfter: result.stressAfter,
    note: input.note ?? '',
  };
}
