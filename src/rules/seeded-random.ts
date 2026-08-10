// Test-only source. The shipping path uses cryptoRandom from ./random and never
// imports this file. A test in random.test.ts holds that rule.

import { fromWords, type RandomSource } from './random';

/**
 * A deterministic source for tests. xorshift32, which cannot leave state 0, so
 * a seed of 0 is replaced. The state is a closure variable, not module state.
 */
export function seededRandom(seed: number): RandomSource {
  let state = seed >>> 0 || 0x9e3779b9;
  return fromWords(() => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state;
  });
}
