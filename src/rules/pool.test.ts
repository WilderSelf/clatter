import { describe, expect, it } from 'vitest';
import type { Faces } from './die';
import { latestValue } from './die';
import type { RandomSource } from './random';
import { seededRandom } from './seeded-random';
import {
  STEP_LADDER,
  addDice,
  addHelp,
  applyDifficulty,
  buildPool,
  emptyBuilder,
  firstRoll,
  ladderState,
  poolBuilder,
  stepBuilder,
  stepIndex,
  switchMode,
  type Builder,
  type LadderState,
  type StepBuilder,
} from './pool';

// The ladder below is the test's own reading of specs/0001-rules-model.md,
// section "The step ladder". It never reads STEP_LADDER, so a changed entry
// moves the two apart.
const SPEC_LADDER: readonly (readonly Faces[])[] = [
  [6], // 0: d6
  [6, 6], // 1: d6 + d6
  [8, 6], // 2: d8 + d6
  [8, 8], // 3: d8 + d8
  [10, 8], // 4: d10 + d8
  [10, 10], // 5: d10 + d10
  [12, 10], // 6: d12 + d10
  [12, 12], // 7: d12 + d12
];

/** Difficulty runs from +3 to -3. */
const OFFSETS: readonly number[] = [-3, -2, -1, 0, 1, 2, 3];

const TOP = SPEC_LADDER.length - 1;

/** 8 states x 7 offsets. The denominator of the full table. */
const CASE_PRODUCT = SPEC_LADDER.length * OFFSETS.length;

/**
 * The cases where the offset leaves the list and the clamp absorbs it, counted
 * per start state: 3 + 2 + 1 + 0 + 0 + 1 + 2 + 3.
 */
const CLAMPED_COUNT = 12;

/** The clamp restated here, so the expectation never calls stepIndex. */
function expectedIndex(start: number, offset: number): number {
  return Math.min(TOP, Math.max(0, start + offset));
}

function pairOf(state: LadderState): readonly Faces[] {
  return state.skill === null ? [state.attribute] : [state.attribute, state.skill];
}

function show(pair: readonly Faces[] | undefined): string {
  return (pair ?? []).map((faces) => `d${faces}`).join(' + ');
}

/** A source that reports how many faces the caller drew. */
function countingRandom(seed: number): { source: RandomSource; draws: () => number } {
  const inner = seededRandom(seed);
  let draws = 0;
  return {
    source: {
      face(faces: Faces): number {
        draws += 1;
        return inner.face(faces);
      },
    },
    draws: () => draws,
  };
}

function typesOf(builder: Builder): string[] {
  return buildPool(builder).map((die) => `${die.type}:d${die.faces}`);
}

describe('the step ladder, over the full 56-case table', () => {
  it('lands on the enumerated state for every start and every offset', () => {
    let checked = 0;

    for (let start = 0; start < SPEC_LADDER.length; start += 1) {
      for (const offset of OFFSETS) {
        const want = expectedIndex(start, offset);
        const wantPair = SPEC_LADDER[want];
        const landed = stepIndex(start, offset);

        expect(landed, `state ${start} offset ${offset} lands on state ${want}`).toBe(want);
        expect(
          pairOf(ladderState(landed)),
          `state ${start} offset ${offset}: state ${want} is ${show(wantPair)}`,
        ).toEqual(wantPair);
        checked += 1;
      }
    }

    expect(checked, 'every case of the product ran').toBe(CASE_PRODUCT);
    expect(CASE_PRODUCT, '8 states x 7 offsets').toBe(56);
    expect(STEP_LADDER.length, 'the spec enumerates eight states').toBe(SPEC_LADDER.length);
    expect(OFFSETS.length, 'the difficulty range holds seven offsets').toBe(7);
  });

  it('holds every enumerated state in order, and no state the spec does not name', () => {
    let checked = 0;
    for (let index = 0; index < SPEC_LADDER.length; index += 1) {
      const want = SPEC_LADDER[index];
      expect(pairOf(ladderState(index)), `state ${index} is ${show(want)}`).toEqual(want);
      checked += 1;
    }
    expect(checked, 'the ladder check ran once per enumerated state').toBe(SPEC_LADDER.length);
    expect(STEP_LADDER.length, 'the module holds no extra state').toBe(SPEC_LADDER.length);
  });

  it('reverses +n with -n, except where the clamp absorbs the offset', () => {
    let reversible = 0;
    let clamped = 0;

    for (let start = 0; start < SPEC_LADDER.length; start += 1) {
      for (const offset of OFFSETS) {
        const raw = start + offset;
        const back = stepIndex(stepIndex(start, offset), -offset);

        if (raw >= 0 && raw <= TOP) {
          expect(back, `state ${start}: ${offset} then ${-offset} returns ${start}`).toBe(start);
          reversible += 1;
          continue;
        }
        // The offset leaves the list. The end of the list absorbs it, so the
        // pair is not reversible. This is the stated exception.
        const wantBack = expectedIndex(expectedIndex(start, offset), -offset);
        expect(
          back,
          `state ${start} offset ${offset}: the clamp absorbed it and returns ${wantBack}`,
        ).toBe(wantBack);
        expect(back, `state ${start} offset ${offset}: the start state is lost`).not.toBe(start);
        clamped += 1;
      }
    }

    expect(reversible + clamped, 'every case of the product ran').toBe(CASE_PRODUCT);
    expect(clamped, 'the clamp absorbs 3 + 2 + 1 + 0 + 0 + 1 + 2 + 3 offsets').toBe(CLAMPED_COUNT);
    expect(reversible, 'the rest reverse').toBe(CASE_PRODUCT - CLAMPED_COUNT);
  });
});

describe('pool construction', () => {
  it('builds a pool from counts per dice type', () => {
    const builder = poolBuilder({
      attribute: 3,
      skill: 2,
      gear: 1,
      artifact: [10],
      bonus: 1,
      stress: 2,
    });
    expect(typesOf(builder)).toEqual([
      'attribute:d6',
      'attribute:d6',
      'attribute:d6',
      'skill:d6',
      'skill:d6',
      'gear:d6',
      'artifact:d10',
      'bonus:d6',
      'stress:d6',
      'stress:d6',
    ]);
    expect(
      buildPool(builder).map((die) => die.id),
      'each die of a type carries its own ordinal',
    ).toContain('attribute-3');
    expect(
      buildPool(builder).every((die) => die.values.length === 0),
      'a built pool has not rolled',
    ).toBe(true);
  });

  it('adds gear, artifact, bonus and stress dice to a step roll unchanged', () => {
    const builder = stepBuilder(4, [
      { type: 'gear', faces: 6 },
      { type: 'artifact', faces: 12 },
      { type: 'bonus', faces: 6 },
      { type: 'stress', faces: 6 },
    ]);
    expect(typesOf(builder), 'state 4 is d10 + d8, then the added dice').toEqual([
      'attribute:d10',
      'skill:d8',
      'gear:d6',
      'artifact:d12',
      'bonus:d6',
      'stress:d6',
    ]);
  });

  it('takes the step attribute and skill dice from the ladder only', () => {
    const builder = stepBuilder(2);
    expect(typesOf(builder)).toEqual(['attribute:d8', 'skill:d6']);
    expect(typesOf(stepBuilder(0)), 'state 0 is a lone die').toEqual(['attribute:d6']);
    expect(
      () => addDice(builder, { type: 'skill', faces: 8 }),
      'a step pool takes no loose skill die',
    ).toThrow();
  });

  it('adds one die per helper, three helpers at most', () => {
    expect(buildPool(addHelp(poolBuilder({ attribute: 1 }), 2)).length).toBe(3);
    expect(
      buildPool(addHelp(poolBuilder({ attribute: 1 }), 9)).length,
      'three helpers cap it',
    ).toBe(4);
    expect(buildPool(addHelp(poolBuilder({ attribute: 1 }), 0)).length).toBe(1);
  });

  it('discards the built pool on a mode switch', () => {
    const built = addHelp(poolBuilder({ attribute: 3, skill: 2 }), 3);
    expect(buildPool(built).length, 'the pool is really built first').toBe(8);

    const stepped = switchMode(built, 'step');
    expect(stepped.mode).toBe('step');
    expect((stepped as StepBuilder).step, 'the new builder starts at state 0').toBe(0);
    expect(stepped.dice, 'the mode switch discards the dice, it does not convert them').toEqual([]);
    expect(switchMode(stepped, 'pool')).toEqual(emptyBuilder('pool'));
  });
});

describe('difficulty', () => {
  it('steps the ladder index in step mode', () => {
    const builder = stepBuilder(3);
    expect(typesOf(applyDifficulty(builder, 2)), '3 + 2 is state 5').toEqual([
      'attribute:d10',
      'skill:d10',
    ]);
    expect(applyDifficulty(builder, 9).step, 'the modifier is clamped to +3 first').toBe(6);
    expect(applyDifficulty(builder, -9).step, 'and to -3').toBe(0);
  });

  it('adds dice for a positive modifier in pool mode', () => {
    const bigger = applyDifficulty(poolBuilder({ attribute: 2 }), 3);
    expect(typesOf(bigger)).toEqual([
      'attribute:d6',
      'attribute:d6',
      'bonus:d6',
      'bonus:d6',
      'bonus:d6',
    ]);
  });

  it('removes skill dice first, then gear, then attribute', () => {
    // Every removable type is present, so the order is observable.
    const full = poolBuilder({ attribute: 2, skill: 2, gear: 2, bonus: 1 });
    const count = (builder: Builder, type: string) =>
      buildPool(builder).filter((die) => die.type === type).length;

    const one = applyDifficulty(full, -1);
    expect(
      [count(one, 'skill'), count(one, 'gear'), count(one, 'attribute')],
      '-1 takes a skill die',
    ).toEqual([1, 2, 2]);

    const three = applyDifficulty(full, -3);
    expect(
      [count(three, 'skill'), count(three, 'gear'), count(three, 'attribute')],
      '-3 takes both skill dice, then one gear die',
    ).toEqual([0, 1, 2]);

    const stripped = applyDifficulty(
      poolBuilder({ attribute: 1, skill: 1, gear: 1, bonus: 1 }),
      -3,
    );
    expect(
      typesOf(stripped),
      'skill, then gear, then attribute go, and the bonus die is not removable',
    ).toEqual(['bonus:d6']);
    expect(count(three, 'bonus'), 'removal never reaches a bonus die').toBe(1);
  });
});

describe('zero dice', () => {
  it('is an automatic failure and draws nothing', () => {
    const empty = applyDifficulty(poolBuilder({ skill: 1 }), -3);
    expect(buildPool(empty).length, 'the pool really is empty').toBe(0);

    const counter = countingRandom(7);
    const outcome = firstRoll(empty, counter.source);

    expect(outcome.kind, 'zero dice is its own outcome, not an empty roll').toBe(
      'automaticFailure',
    );
    expect(counter.draws(), 'an automatic failure rolls no die').toBe(0);
  });

  it('is not what a pool with dice returns, and that pool draws once per die', () => {
    const builder = poolBuilder({ attribute: 2, skill: 1 });
    const counter = countingRandom(7);
    const outcome = firstRoll(builder, counter.source);

    expect(outcome.kind).toBe('rolled');
    expect(counter.draws(), 'one draw per die in the pool').toBe(3);
    if (outcome.kind !== 'rolled') {
      return;
    }
    for (const die of outcome.dice) {
      const face = latestValue(die);
      expect(face, `${die.id} rolled a face`).not.toBeNull();
      expect(face ?? 0, `${die.id} rolled inside its faces`).toBeGreaterThanOrEqual(1);
      expect(face ?? 0, `${die.id} rolled inside its faces`).toBeLessThanOrEqual(die.faces);
    }
  });
});
