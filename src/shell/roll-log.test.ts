// The entry a throw writes, held against the rules core.
//
// **The core is the oracle.** Nothing below compares a stored value with a
// number written by hand. Every field is compared with what `score`, `isLocked`,
// `successCount`, `baneCount`, `generations` and `pushCost` answer for the same
// dice under the profile the screen held at the moment of the throw. A hand
// written expectation would pin the code that produced it, not the rules.
//
// The write path itself needs a database, so it is measured in the browser:
// `node scripts/browser.mjs --history` reads the rolls back out of IndexedDB.
// A queued write is not a landed write, and this file cannot tell the two apart.

import { describe, expect, it } from 'vitest';
import type { Die } from '../rules/die';
import { profileHash } from '../log/entry';
import type { PushProfile } from '../rules/push-profile';
import { isLocked, PUSH_PROFILES } from '../rules/push-profile';
import { generations, pushCost } from '../rules/push';
import { baneCount, successCount } from '../rules/roll';
import type { ArtifactCurveId } from '../rules/success';
import { curveFor, score } from '../rules/success';
import { seededRandom } from '../rules/seeded-random';
import { entryForThrow } from './roll-log';
import type { AppState, Counts } from './state';
import { emptyState, profileOf, pushNow, rollNow, withArtifactCurve, withPreset } from './state';

/** A pool with every dice type in it, so no type goes unmeasured. */
const POOL: Counts = { attribute: 3, skill: 2, gear: 2, artifact: 6, bonus: 1, stress: 4 };

const SEQUENCE = { rollId: 'r-test', timestampIso: '2026-08-10T09:15:00.000Z', stressBefore: 4 };

function built(counts: Counts = POOL): AppState {
  return { ...emptyState('pool'), counts };
}

/** The die of the live result that carries one logged column, by position. */
function dieAt(die: Die, generation: number): Die {
  return { ...die, values: die.values.slice(0, generation + 1) };
}

describe('entryForThrow', () => {
  it('writes the roll that happened, cell by cell, with the core as the oracle', () => {
    // One roll and two pushes, so the entry carries three generations and the
    // check crosses a die that locked early and a die the push added.
    // Seed 3 is the fixture: it clears the stress-bane blocker twice, so both
    // pushes go through, and the second push adds a die, which is what puts a
    // `null` cell in the matrix. The seed is chosen by search over the core and
    // the assertions below name every property it was chosen for.
    let state = rollNow(built(), seededRandom(3));
    state = pushNow(state, seededRandom(1003));
    state = pushNow(state, seededRandom(2003));
    const result = state.result;
    expect(result, 'the fixture must put dice on the table').not.toBeNull();
    if (result === null) return;

    const entry = entryForThrow(state, SEQUENCE);
    expect(entry).not.toBeNull();
    if (entry === null) return;

    const profile: PushProfile = profileOf(state);
    const curveOf = (die: Die): ArtifactCurveId | undefined =>
      curveFor(die, state.artifactCurve) as ArtifactCurveId | undefined;

    // The denominator is counted a second way: the cells the entry holds, and
    // the cells the live result holds, over the dice AND the generations. A
    // column the entry dropped fails the sum before any value is compared.
    const cellsInTheEntry = entry.dice.reduce((total, die) => total + die.cells.length, 0);
    const cellsInTheResult = result.dice.reduce((total, die) => total + die.values.length, 0);
    expect(entry.dice.length, 'one logged die per die on the table').toBe(result.dice.length);
    expect(cellsInTheEntry, 'one cell per generation of every die').toBe(cellsInTheResult);
    expect(result.dice.length).toBeGreaterThan(10);
    expect(generations(result.dice), 'a roll and two pushes are three generations').toBe(3);

    let compared = 0;
    let filled = 0;
    for (const [at, die] of result.dice.entries()) {
      const logged = entry.dice[at];
      expect(logged, `die ${at} is in the entry`).toBeDefined();
      if (logged === undefined) continue;
      expect(logged.type, `the type of die ${at}`).toBe(die.type);
      expect(logged.faces, `the faces of die ${at}`).toBe(die.faces);
      for (const [generation, value] of die.values.entries()) {
        const cell = logged.cells[generation];
        compared += 1;
        if (value === null) {
          expect(cell, `die ${at} did not exist at generation ${generation}`).toBeNull();
          continue;
        }
        filled += 1;
        const view = dieAt(die, generation);
        expect(cell?.value, `the face of die ${at} at generation ${generation}`).toBe(value);
        expect(cell?.successes, `the successes of die ${at} at generation ${generation}`).toBe(
          score(view, curveOf(die)),
        );
        expect(cell?.locked, `the lock of die ${at} at generation ${generation}`).toBe(
          isLocked(view, profile, curveOf(die)),
        );
      }
    }
    // Three assertions were made per filled cell and one per empty cell, so the
    // two counts below are the denominator this check ran over.
    expect(compared, 'every cell of every die was compared').toBe(cellsInTheResult);
    expect(filled, 'the roll holds cells a die really existed at').toBeGreaterThan(0);
    expect(compared).toBeGreaterThan(filled);

    // The roll-level values, each against the core's own answer.
    expect(entry.successes, 'the successes of the newest generation').toBe(
      successCount(result, state.artifactCurve),
    );
    expect(entry.banes, 'the banes of the newest generation').toBe(
      Object.values(baneCount(result)).reduce((total, count) => total + count, 0),
    );
    expect(entry.pushCount, 'the pushes').toBe(generations(result.dice) - 1);
    expect(entry.costAmount, 'the cost of the push').toBe(pushCost(result, profile).total);
    expect(entry.costType).toBe(profile.cost.unit);
    expect(entry.stressAfter, 'the stress the core answered').toBe(result.stressAfter);
    expect(entry.stressBefore, 'the stress before the FIRST throw of this roll').toBe(
      SEQUENCE.stressBefore,
    );
    expect(entry.mode).toBe(state.mode);
    expect(entry.rollId).toBe(SEQUENCE.rollId);
    expect(entry.timestampIso).toBe(SEQUENCE.timestampIso);
  });

  it('carries the artifact curve the screen held, so the successes follow it', () => {
    // The two curves pay differently on a d12, and the artifact tile at rating
    // 6 puts two d12 dice on the table. A builder that passed no curve, or the
    // other one, changes what the entry stores.
    const seed = 3;
    let escalating = withArtifactCurve(built(), 'artifactEscalating');
    escalating = rollNow(escalating, seededRandom(seed));
    let flat = withArtifactCurve(built(), 'artifactFlat');
    flat = rollNow(flat, seededRandom(seed));

    const one = entryForThrow(escalating, SEQUENCE);
    const two = entryForThrow(flat, SEQUENCE);
    expect(one).not.toBeNull();
    expect(two).not.toBeNull();
    if (one === null || two === null) return;

    expect(one.successes, 'the escalating curve, as the core scores it').toBe(
      successCount(escalating.result!, 'artifactEscalating'),
    );
    expect(two.successes, 'the flat curve, as the core scores it').toBe(
      successCount(flat.result!, 'artifactFlat'),
    );
    // The two rolls come from one seed, so the faces are the same and the only
    // thing that can move the successes is the curve.
    const faces = (state: AppState): string =>
      (state.result?.dice ?? []).map((die) => `${die.id}:${die.values.join('/')}`).join(',');
    expect(faces(escalating), 'one seed, one set of faces').toBe(faces(flat));
    expect(one.successes, 'the curve reached the entry').not.toBe(two.successes);
  });

  it('stores the hash of the profile the roll was thrown under', () => {
    // Units 4.1 and 4.2 make the profile changeable at run time, and Decision 10
    // clears the table on a change, so the two rolls below are two throws under
    // two rule sets and never one roll re-priced.
    const first = PUSH_PROFILES[0];
    const second = PUSH_PROFILES[1];
    expect(first).toBeDefined();
    expect(second).toBeDefined();
    if (first === undefined || second === undefined) return;

    const before = rollNow(withPreset(built(), first.id), seededRandom(5));
    const cleared = withPreset(before, second.id);
    expect(cleared.result, 'Decision 10: a change of rules clears the table').toBeNull();
    const after = rollNow(cleared, seededRandom(5));

    const one = entryForThrow(before, { ...SEQUENCE, rollId: 'r-1' });
    const two = entryForThrow(after, { ...SEQUENCE, rollId: 'r-2' });
    expect(one?.profileHash, 'the hash of the profile in force at the first throw').toBe(
      profileHash(profileOf(before)),
    );
    expect(two?.profileHash, 'the hash of the profile in force at the second throw').toBe(
      profileHash(profileOf(after)),
    );
    expect(one?.ruleset).toBe(first.id);
    expect(two?.ruleset).toBe(second.id);
    expect(one?.profileHash, 'two rule sets, two digests').not.toBe(two?.profileHash);
  });

  it('writes nothing for a throw that put no dice on the table', () => {
    // A pool of no dice fails automatically, draws nothing from the random
    // source and leaves the table empty. `createLogEntry` refuses a roll of no
    // dice, so the answer must be null rather than a throw.
    const empty = rollNow(
      built({ ...POOL, attribute: 0, skill: 0, gear: 0, artifact: 0, bonus: 0, stress: 0 }),
      seededRandom(2),
    );
    expect(empty.lastThrow).toBe('roll');
    expect(empty.result).toBeNull();
    expect(entryForThrow(empty, SEQUENCE)).toBeNull();
  });
});
