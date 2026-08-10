import { describe, expect, it } from 'vitest';
import { buildPool, poolBuilder } from './pool';
import { push } from './push';
import type { PushProfile } from './push-profile';
import { PUSH_PROFILES } from './push-profile';
import type { RandomSource } from './random';
import { roll } from './roll';
import { seededRandom } from './seeded-random';
import { COMPLICATIONS, complicationTriggers, drawComplication } from './stress';

/**
 * A source that returns the listed faces in order. The forced values make the
 * expectation hand-written rather than derived from the module under test.
 */
function forced(faces: readonly number[]): RandomSource {
  const queue = [...faces];
  return {
    face(): number {
      const next = queue.shift();
      if (next === undefined) {
        throw new Error('the forced source ran out of faces');
      }
      return next;
    },
  };
}

function preset(id: string): PushProfile {
  const found = PUSH_PROFILES.find((each) => each.id === id);
  if (found === undefined) {
    throw new Error(`no preset ${id}`);
  }
  return found;
}

/** One attribute die then one stress die, in that order. */
function stressPool() {
  return buildPool(poolBuilder({ attribute: 1, stress: 1 }));
}

// ---------------------------------------------------------------------------
// The spec's dice table says a stress 1 costs "yes, and on the first roll too".
// A check that only reads the newest generation of a pushed roll would miss the
// first roll, so both cases are asserted and the generation is named.
// ---------------------------------------------------------------------------

describe('the complication check', () => {
  it('fires on a stress 1 on the first roll, at generation 0', () => {
    const pool = stressPool();
    // The attribute die shows 3 and the stress die shows 1. Nothing is pushed.
    const result = roll({ dice: pool, stressBefore: 1 }, forced([3, 1]));

    expect(
      result.dice.map((die) => die.values.length),
      'this roll holds one generation, so no push has happened',
    ).toEqual([1, 1]);
    expect(complicationTriggers(result), 'the first roll calls for a check').toEqual([
      { dieId: 'stress-1', generation: 0 },
    ]);
  });

  it('fires on a stress 1 that first shows on a push, at generation 1', () => {
    const first = roll({ dice: stressPool(), stressBefore: 1 }, forced([3, 3]));
    expect(complicationTriggers(first), 'no stress die shows a 1 yet').toEqual([]);

    // Profile 3 locks successes only, so both dice are loose, and it adds one
    // stress die before the throw. Draw order is attribute-1, stress-1, stress-2.
    const outcome = push(first, preset('pool-stress-and-complications'), forced([2, 1, 5]));
    if (outcome.kind !== 'pushed') {
      throw new Error(`the push was refused with ${outcome.reason}`);
    }

    expect(complicationTriggers(outcome), 'the 1 arrived at the pushed generation').toEqual([
      { dieId: 'stress-1', generation: 1 },
    ]);
  });

  it('fires for a stress die that the push itself added, at that same generation', () => {
    const first = roll({ dice: stressPool(), stressBefore: 1 }, forced([3, 3]));
    const outcome = push(first, preset('pool-stress-and-complications'), forced([2, 5, 1]));
    if (outcome.kind !== 'pushed') {
      throw new Error(`the push was refused with ${outcome.reason}`);
    }

    expect(outcome.stressAdded, 'the push raised stress by one').toBe('stress-2');
    expect(
      outcome.dice.find((die) => die.id === 'stress-2')?.values,
      'the added die is blank before it existed',
    ).toEqual([null, 1]);
    expect(complicationTriggers(outcome), 'the added die called for the check').toEqual([
      { dieId: 'stress-2', generation: 1 },
    ]);
  });

  it('reports a locked stress 1 once, at the generation it first showed', () => {
    // Profile 1 locks the 1s of a stress die, so the value repeats into the
    // pushed generation. The check must not read the repeat as a second event.
    const first = roll({ dice: stressPool(), stressBefore: 1 }, forced([3, 1]));
    const outcome = push(first, preset('pool-banes-damage-ratings'), forced([4]));
    if (outcome.kind !== 'pushed') {
      throw new Error(`the push was refused with ${outcome.reason}`);
    }

    expect(
      outcome.dice.find((die) => die.id === 'stress-1')?.values,
      'the locked die repeated its 1',
    ).toEqual([1, 1]);
    expect(complicationTriggers(outcome), 'one die, one check').toEqual([
      { dieId: 'stress-1', generation: 0 },
    ]);
  });

  it('stays silent when no stress die shows a 1', () => {
    const withStress = roll({ dice: stressPool(), stressBefore: 1 }, forced([1, 6]));
    expect(
      complicationTriggers(withStress),
      'an attribute 1 is a bane, not a complication check',
    ).toEqual([]);

    const noStress = roll(
      { dice: buildPool(poolBuilder({ attribute: 2 })), stressBefore: 0 },
      forced([1, 1]),
    );
    expect(complicationTriggers(noStress), 'a pool with no stress die calls for nothing').toEqual(
      [],
    );
  });
});

// ---------------------------------------------------------------------------
// The table is data, and every entry must be reachable. The counted denominator
// is the number of distinct entries the selector produced against the length of
// the table it was given, so an off-by-one that hides the last entry fails.
// ---------------------------------------------------------------------------

describe('the complication table', () => {
  /** Twelve entries need about 37 draws on average, so 600 is ample. */
  const DRAWS = 600;

  function drawMany(table: readonly string[], seed: number): Map<string, number> {
    const random = seededRandom(seed);
    const seen = new Map<string, number>();
    for (let index = 0; index < DRAWS; index += 1) {
      const entry = drawComplication(random, table);
      seen.set(entry, (seen.get(entry) ?? 0) + 1);
    }
    return seen;
  }

  it('holds distinct entries and no empty line', () => {
    expect(new Set(COMPLICATIONS).size, 'no entry is a copy of another').toBe(COMPLICATIONS.length);
    let read = 0;
    for (const entry of COMPLICATIONS) {
      expect(entry.trim().length, `entry ${read} carries text`).toBeGreaterThan(0);
      read += 1;
    }
    expect(read, 'every entry was read').toBe(COMPLICATIONS.length);
    expect(COMPLICATIONS.length, 'a dozen entries ship').toBe(12);
  });

  it('reaches every shipped entry, and reaches nothing else', () => {
    const seen = drawMany(COMPLICATIONS, 20260808);
    const missing = COMPLICATIONS.filter((entry) => !seen.has(entry));
    const unknown = [...seen.keys()].filter((entry) => !COMPLICATIONS.includes(entry));

    expect(missing, 'every entry of the table was drawn').toEqual([]);
    expect(unknown, 'the selector never left the table').toEqual([]);
    expect(seen.size, 'the distinct entries drawn equal the length of the table').toBe(
      COMPLICATIONS.length,
    );
    expect(
      [...seen.values()].reduce((total, count) => total + count, 0),
      'every draw was counted',
    ).toBe(DRAWS);
  });

  it('reaches every entry of a table the user extended past one die', () => {
    // Thirteen entries need more than one twelve-faced draw, so this covers the
    // path a shipped table of twelve never takes.
    const extended = [...COMPLICATIONS, 'A door that was open when you came is now barred.'];
    const seen = drawMany(extended, 4242);

    expect(
      extended.filter((entry) => !seen.has(entry)),
      'every entry of the extended table was drawn',
    ).toEqual([]);
    expect(seen.size, 'the distinct entries drawn equal the length of the table').toBe(
      extended.length,
    );
    expect(extended.length, 'twelve shipped entries and one the user added').toBe(13);
  });

  it('draws uniformly enough that no entry is rare by construction', () => {
    // A selector that folds two entries onto one index would leave one entry at
    // about half the share. The bound is far wider than the sampling noise and
    // far narrower than that defect.
    const seen = drawMany(COMPLICATIONS, 777);
    const share = DRAWS / COMPLICATIONS.length;
    let checked = 0;
    for (const entry of COMPLICATIONS) {
      expect(seen.get(entry) ?? 0, `${entry} is drawn about as often as the rest`).toBeGreaterThan(
        share / 2,
      );
      checked += 1;
    }
    expect(checked, 'every entry was measured').toBe(COMPLICATIONS.length);
  });
});
