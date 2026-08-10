import { describe, expect, it } from 'vitest';
import { buildPool, emptyBuilder, STEP_LADDER, switchMode } from '../rules/pool';
import type { AppState, CountKey } from './state';
import {
  ARTIFACT_LADDER,
  builderOf,
  composition,
  difficultyPreview,
  emptyState,
  ladderLabel,
  nudge,
  poolCells,
  POOL_CAPS,
  signedDifficulty,
  throwDice,
  withDifficulty,
  withMode,
} from './state';

/** The pool the drawn screen holds: 5, 5, 3, no artifact, 2 and 10 stress. */
function drawnPool(): AppState {
  let state = emptyState('pool');
  for (const [key, count] of [
    ['attribute', 5],
    ['skill', 5],
    ['gear', 3],
    ['bonus', 2],
    ['stress', 10],
  ] as const) {
    for (let taken = 0; taken < count; taken += 1) {
      state = nudge(state, key, 1);
    }
  }
  return state;
}

describe('the tiles', () => {
  it('holds one tile per counted type in pool mode and merges the pair in step mode', () => {
    expect(poolCells(emptyState('pool')).map((cell) => cell.key)).toEqual([
      'attribute',
      'skill',
      'gear',
      'artifact',
      'bonus',
      'stress',
    ]);
    // The ladder gives both sizes from one index, so the two tiles become one.
    expect(poolCells(emptyState('step')).map((cell) => cell.key)).toEqual([
      'step',
      'gear',
      'artifact',
      'bonus',
      'stress',
    ]);
  });

  it('stops every tile at the cap Decision 1 fixes, and at zero', () => {
    const keys = Object.keys(POOL_CAPS) as CountKey[];
    let checked = 0;
    for (const key of keys) {
      let up = emptyState('pool');
      for (let taken = 0; taken < POOL_CAPS[key] + 3; taken += 1) {
        up = nudge(up, key, 1);
      }
      expect(up.counts[key], `${key} stops at its cap`).toBe(POOL_CAPS[key]);
      expect(nudge(nudge(up, key, -POOL_CAPS[key]), key, -1).counts[key]).toBe(0);
      checked += 1;
    }
    expect(checked, 'every capped type was measured').toBe(keys.length);
    expect(checked).toBe(6);
  });

  it('steps the artifact tile along its enumerated ladder', () => {
    let state = emptyState('pool');
    const read: string[] = [];
    for (let taken = 0; taken <= POOL_CAPS.artifact; taken += 1) {
      read.push(poolCells(state)[3]?.value ?? '');
      state = nudge(state, 'artifact', 1);
    }
    expect(read).toEqual(['none', 'd8', 'd10', 'd12', 'd12 + d8', 'd12 + d10', 'd12 + d12']);
    expect(read.length).toBe(ARTIFACT_LADDER.length);
    // The dice reach the core, not just the label.
    expect(buildPool(builderOf(state)).map((die) => die.faces)).toEqual([12, 12]);
  });

  it('steps the ladder tile over every state the core holds', () => {
    let state = emptyState('step');
    const read: string[] = [];
    for (let taken = 0; taken < STEP_LADDER.length; taken += 1) {
      read.push(ladderLabel(state.step));
      state = nudge(state, 'step', 1);
    }
    expect(read).toEqual([
      'd6',
      'd6 + d6',
      'd8 + d6',
      'd8 + d8',
      'd10 + d8',
      'd10 + d10',
      'd12 + d10',
      'd12 + d12',
    ]);
    expect(read.length).toBe(STEP_LADDER.length);
  });
});

describe('a mode switch clears the pool', () => {
  it('empties a built pool, and the core agrees about what a switch keeps', () => {
    const built = drawnPool();
    expect(throwDice(built).length, 'the pool was built before the switch').toBe(25);

    const switched = withMode(built, 'step');
    expect(switched.mode).toBe('step');
    // Step mode always holds the first rung of the ladder, so the empty step
    // pool is that one die and nothing the player added.
    expect(throwDice(switched), 'no pool die survived the switch').toEqual(
      buildPool(emptyBuilder('step')),
    );
    expect(throwDice(switched).length).toBe(1);
    // The core owns the answer. This compares the shell against it rather than
    // restating it: `switchMode` is what the rules say a switch keeps.
    expect(builderOf(switched)).toEqual(switchMode(builderOf(built), 'step'));

    // Back again, from a step pool that holds extras.
    const withExtras = nudge(nudge(switched, 'gear', 1), 'stress', 1);
    expect(throwDice(withExtras).length).toBeGreaterThan(0);
    const back = withMode(withExtras, 'pool');
    expect(throwDice(back).length).toBe(0);
    expect(builderOf(back)).toEqual(switchMode(builderOf(withExtras), 'pool'));
  });

  it('drops the difficulty with the pool', () => {
    const hard = withDifficulty(drawnPool(), 3);
    expect(hard.difficulty).toBe(3);
    expect(withMode(hard, 'step').difficulty).toBe(0);
  });
});

describe('what the live region says', () => {
  it('names every part of the pool, and says so when there is none', () => {
    expect(composition(throwDice(emptyState('pool')))).toBe(
      'The throw takes no dice. A roll of no dice fails.',
    );
    expect(composition(throwDice(nudge(emptyState('pool'), 'attribute', 1)))).toBe(
      'The throw takes 1 die. 1 attribute.',
    );
    expect(composition(throwDice(drawnPool()))).toBe(
      'The throw takes 25 dice. 5 attribute, 5 skill, 3 gear, 2 bonus, 10 stress.',
    );
  });

  it('names the size of a die that is not six-faced', () => {
    const withArtifact = nudge(nudge(emptyState('pool'), 'attribute', 1), 'artifact', 4);
    expect(composition(throwDice(withArtifact))).toBe(
      'The throw takes 3 dice. 1 attribute, 1 artifact d8, 1 artifact d12.',
    );
  });

  it('reports the dice the difficulty will really throw', () => {
    const easier = withDifficulty(drawnPool(), 2);
    expect(composition(throwDice(easier))).toBe(
      'The throw takes 27 dice. 5 attribute, 5 skill, 3 gear, 4 bonus, 10 stress.',
    );
  });
});

describe('what the difficulty will do', () => {
  it('prints the effect on a pool before the roll', () => {
    const pool = drawnPool();
    expect(difficultyPreview(pool)).toBe('The next roll takes no dice away and adds none.');
    expect(difficultyPreview(withDifficulty(pool, 1))).toBe('The next roll adds 1 bonus die.');
    expect(difficultyPreview(withDifficulty(pool, 3))).toBe('The next roll adds 3 bonus dice.');
    expect(difficultyPreview(withDifficulty(pool, -2))).toBe('The next roll takes 2 dice away.');
    // The core takes skill dice first, so the sentence follows the core and not
    // a rule of its own.
    expect(throwDice(withDifficulty(pool, -2)).filter((die) => die.type === 'skill').length).toBe(
      3,
    );
  });

  it('prints the pair a step roll will use', () => {
    let state = emptyState('step');
    for (let taken = 0; taken < 4; taken += 1) {
      state = nudge(state, 'step', 1);
    }
    expect(state.step).toBe(4);
    expect(difficultyPreview(state)).toBe('The next roll rolls a d10 and a d8.');
    expect(difficultyPreview(withDifficulty(state, 2))).toBe(
      'The next roll rolls a d12 and a d10.',
    );
    // The modifier is clamped to −3 first, which lands on the lowest rung.
    expect(difficultyPreview(withDifficulty(state, -9))).toBe('The next roll rolls a d6 and a d6.');
    expect(difficultyPreview(withDifficulty(nudge(state, 'step', -2), -3))).toBe(
      'The next roll rolls one d6.',
    );
  });

  it('holds the modifier inside the range the core allows', () => {
    expect(withDifficulty(emptyState('pool'), 9).difficulty).toBe(3);
    expect(withDifficulty(emptyState('pool'), -9).difficulty).toBe(-3);
    expect([3, 0, -3].map(signedDifficulty)).toEqual(['+3', '0', '−3']);
  });
});
