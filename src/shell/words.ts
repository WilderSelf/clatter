// The words the history destination and its charts share.
//
// It sits in its own module so `statistics.tsx` and `history.tsx` can both read
// it without importing each other. A cycle between two view modules works until
// the order of the two imports changes, and then it does not.
//
// Nothing here derives a rule. `COST_NOUN` turns a stored cost unit into the
// words a player reads, and the stored amount is printed beside it unchanged.

import type { PushCostUnit } from '../rules/push-profile';

/** `1 die`, `3 dice`. One name per thing, and the count in front of it. */
export function plural(count: number, one: string, many: string): string {
  return count === 1 ? `1 ${one}` : `${count} ${many}`;
}

/**
 * The cost unit in the words a player reads, singular and plural.
 *
 * It is keyed by the union, so a fifth cost unit is a type error here until it
 * has words. Unit 4.7 records why the four are never added together: they are
 * different things, so a sum over a campaign that used more than one profile
 * would add unlike quantities.
 */
export const COST_NOUN: Readonly<Record<PushCostUnit, readonly [string, string]>> = {
  ratingPoint: ['rating point', 'rating points'],
  healthPoint: ['point of health', 'points of health'],
  refereePoint: ['referee point', 'referee points'],
  complicationCheck: ['complication check', 'complication checks'],
};

export function costReading(amount: number, unit: PushCostUnit): string {
  const words = COST_NOUN[unit];
  return plural(amount, words[0], words[1]);
}
