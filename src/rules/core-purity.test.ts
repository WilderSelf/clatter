// Constraint 3: the rules core holds no module-level mutable state.
//
// Two checks cover that claim, and they catch different faults.
//
// 1. The shuffled order in vite.config.ts catches state that one test leaves
//    behind for the next. Vitest gives each test file its own module registry,
//    so the shuffle that matters there is the order of the tests inside a file.
// 2. This file catches state that changes an answer after the first call. It
//    holds one test, so its first call to the core is the first call the module
//    registry ever sees, and a warm-up counter cannot hide behind an earlier
//    test. The same question is asked three times and the answers are compared.

import { describe, expect, it } from 'vitest';
import { buildPool, poolBuilder } from './pool';
import { push } from './push';
import type { PushProfile } from './push-profile';
import { PUSH_PROFILES } from './push-profile';
import { roll } from './roll';
import { seededRandom } from './seeded-random';
import { complicationTriggers, drawComplication } from './stress';

function preset(id: string): PushProfile {
  const found = PUSH_PROFILES.find((each) => each.id === id);
  if (found === undefined) {
    throw new Error(`no preset ${id}`);
  }
  return found;
}

/** One pass over the core, from a fresh seeded source every time. */
function answer(): string {
  const random = seededRandom(9001);
  const pool = buildPool(poolBuilder({ attribute: 2, skill: 1, gear: 1, stress: 1 }));
  const first = roll({ dice: pool, stressBefore: 2 }, random);
  const outcome = push(first, preset('pool-stress-and-complications'), random);
  return JSON.stringify({
    first,
    outcome,
    triggers: complicationTriggers(first),
    complication: drawComplication(seededRandom(31)),
  });
}

describe('the core answers from its inputs alone', () => {
  it('gives one answer to the same question, however many calls came before', () => {
    const answers = [answer(), answer(), answer()];
    let compared = 0;
    for (const later of answers.slice(1)) {
      expect(later, 'a later call answered differently from the first').toBe(answers[0]);
      compared += 1;
    }
    expect(compared, 'two later answers were compared with the first').toBe(answers.length - 1);
    expect(
      answers[0]?.length ?? 0,
      'the answer carries a whole roll and a whole push',
    ).toBeGreaterThan(100);
  });
});
