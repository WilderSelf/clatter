// Rules core. No browser API, no module-level mutable state.
// The stress rules come from specs/0001-rules-model.md. The "A 1 costs" column
// of the dice table reads "yes, and on the first roll too" for a stress die,
// and the third push profile calls for a complication check on that 1.
//
// The stress counter belongs to the application, which owns it and persists it.
// The core takes it in as `stressBefore` on the roll request and hands it back
// as the derived `stressAfter`. A counter held in this module would be module
// state, and every result would then depend on the calls before it.
//
// Every line of the table below is written for this repository. No complication
// text is taken from any other work.

import type { RandomSource } from './random';
import type { RollResult } from './roll';

/** A stress die that has shown a 1, and the generation it first showed it at. */
export interface ComplicationTrigger {
  readonly dieId: string;
  /** 0 is the first roll. A stress 1 costs on the first roll as well. */
  readonly generation: number;
}

/**
 * Every complication check the roll calls for, in pool order.
 *
 * The whole history matrix is read, not only the newest generation, so a 1 on
 * the first roll triggers a check as surely as a 1 on a push. A locked stress
 * die repeats its 1 into later generations, so each die reports the generation
 * where its 1 first showed and reports it once.
 */
export function complicationTriggers(result: RollResult): readonly ComplicationTrigger[] {
  return result.dice
    .filter((die) => die.type === 'stress')
    .map((die) => ({ dieId: die.id, generation: die.values.indexOf(1) }))
    .filter((trigger) => trigger.generation >= 0);
}

/**
 * The complications. Plain, generic, and fit for any setting: a tool fails, a
 * sound carries, footing gives way, somebody notices, time runs out.
 *
 * This is data. The user may replace it or extend it, and the selector below
 * reaches every entry of a table of any length.
 */
export const COMPLICATIONS: readonly string[] = [
  'A tool slips out of true, and you need a moment to set it right.',
  'A sound carries further than you meant, and the wrong ear hears it.',
  'The footing gives way, and you lose the place you had.',
  'A stranger stops to watch you work, and remembers your face.',
  'The task takes far longer than you planned for.',
  'Something you carried is no longer with you.',
  'A light fails, and you finish the work in the dark.',
  'A fastening comes loose at the worst moment.',
  'You leave a clear mark of your passing behind you.',
  'The way you came is shut, and you must find another.',
  'A small injury slows one hand for a while.',
  'The person you counted on is not where you agreed to meet.',
];

/** The die the selector throws. It covers the shipped table in one draw. */
const SELECTOR_FACES = 12;

/**
 * A uniform index over `count` entries.
 *
 * The random source deals in die faces, so the selector combines as many d12
 * draws as the table needs and rejects the remainder above the last whole
 * block. Rejection keeps every entry equally likely, and combining draws keeps
 * a table longer than twelve entries reachable.
 */
function selectIndex(count: number, random: RandomSource): number {
  if (count < 1) {
    throw new Error('a complication table needs at least one entry');
  }
  for (;;) {
    let range = SELECTOR_FACES;
    let draw = random.face(SELECTOR_FACES) - 1;
    while (range < count) {
      draw = draw * SELECTOR_FACES + (random.face(SELECTOR_FACES) - 1);
      range *= SELECTOR_FACES;
    }
    if (draw < range - (range % count)) {
      return draw % count;
    }
  }
}

/** One complication, drawn at random. The table is an argument, so it is data. */
export function drawComplication(
  random: RandomSource,
  table: readonly string[] = COMPLICATIONS,
): string {
  const entry = table[selectIndex(table.length, random)];
  if (entry === undefined) {
    throw new Error('the complication selector left the table');
  }
  return entry;
}
