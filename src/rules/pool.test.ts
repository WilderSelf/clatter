import { describe, expect, it } from 'vitest';
import type { Faces } from './die';
import { latestValue } from './die';
import type { RandomSource } from './random';
import { seededRandom } from './seeded-random';
import {
  STEP_SIZES,
  addDice,
  addHelp,
  applyDifficulty,
  buildPool,
  emptyBuilder,
  firstRoll,
  poolBuilder,
  stepBuilder,
  switchMode,
  type Builder,
  type StepBuilder,
  type StepDice,
} from './pool';

// Everything below is the test's own reading of specs/0001-rules-model.md,
// section "Step dice — two independent scales". It never reads the module's
// split table for an expectation, so a changed row moves the two apart.

/** The four sizes of a step die, smallest first. */
const SPEC_SIZES: readonly Faces[] = [6, 8, 10, 12];

/** Every skill state, absence included. Absence is independent of the size. */
const SPEC_SKILL: readonly (Faces | null)[] = [null, 6, 8, 10, 12];

/** Difficulty runs from +3 to -3. */
const OFFSETS: readonly number[] = [-3, -2, -1, 0, 1, 2, 3];

/**
 * The split the spec states: the steps the lower-rated die takes and the steps
 * the higher-rated one takes, keyed by the modifier. On a tie the attribute is
 * the lower die.
 */
const SPEC_SPLIT: Readonly<Record<string, readonly [number, number]>> = {
  '-3': [-1, -2],
  '-2': [-1, -1],
  '-1': [0, -1],
  '0': [0, 0],
  '1': [1, 0],
  '2': [1, 1],
  '3': [2, 1],
};

const TOP_RANK = SPEC_SIZES.length - 1;

function specRank(faces: Faces): number {
  return SPEC_SIZES.indexOf(faces);
}

/** The steps the spec gives each die, before any clamp. */
function rawRanks(base: StepDice, offset: number): readonly number[] {
  const split = SPEC_SPLIT[String(offset)];
  if (split === undefined) throw new Error(`the spec states no split for ${offset}`);
  const [lower, higher] = split;
  if (base.skill === null) {
    return [specRank(base.attribute) + lower + higher];
  }
  const attributeIsLower = specRank(base.attribute) <= specRank(base.skill);
  return [
    specRank(base.attribute) + (attributeIsLower ? lower : higher),
    specRank(base.skill) + (attributeIsLower ? higher : lower),
  ];
}

/** The clamp restated here, so no expectation calls the module. */
function specSize(rank: number): Faces {
  const faces = SPEC_SIZES[Math.min(TOP_RANK, Math.max(0, rank))];
  if (faces === undefined) throw new Error(`the spec states no size at rank ${rank}`);
  return faces;
}

/** What the spec says one base pair rolls under one modifier. */
function wanted(base: StepDice, offset: number): StepDice {
  const ranks = rawRanks(base, offset);
  const attribute = specSize(ranks[0] ?? 0);
  return base.skill === null
    ? { attribute, skill: null }
    : { attribute, skill: specSize(ranks[1] ?? 0) };
}

/** Every base pair the model holds: four attribute sizes by five skill states. */
function everyBase(): StepDice[] {
  return SPEC_SIZES.flatMap((attribute) => SPEC_SKILL.map((skill) => ({ attribute, skill })));
}

/**
 * The sizes a step builder really rolls, read back off the built pool, after
 * the modifiers are applied in the order given. This is the path the screen
 * takes, so a rule that stepped a size it had already stepped is visible here.
 */
function rolled(base: StepDice, ...offsets: readonly number[]): StepDice {
  const builder = offsets.reduce<StepBuilder>(
    (held, offset) => applyDifficulty(held, offset),
    stepBuilder(base),
  );
  const dice = buildPool(builder);
  const attribute = dice.find((die) => die.type === 'attribute');
  if (attribute === undefined) throw new Error('a step roll holds no attribute die');
  return {
    attribute: attribute.faces,
    skill: dice.find((die) => die.type === 'skill')?.faces ?? null,
  };
}

function show(dice: StepDice): string {
  return dice.skill === null ? `d${dice.attribute}` : `d${dice.attribute} + d${dice.skill}`;
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

describe('the step dice, over the whole space of base pairs and modifiers', () => {
  it('rolls the sizes the split table names, for every base pair and every modifier', () => {
    const bases = everyBase();
    let checked = 0;

    for (const base of bases) {
      for (const offset of OFFSETS) {
        const want = wanted(base, offset);
        expect(rolled(base, offset), `${show(base)} at ${offset} rolls ${show(want)}`).toEqual(
          want,
        );
        checked += 1;
      }
    }

    // The denominator is counted off the enumeration itself, and the
    // enumeration is counted off the two scales the spec states.
    expect(checked, 'every case of the space ran').toBe(bases.length * OFFSETS.length);
    expect(bases.length, 'four attribute sizes by five skill states').toBe(
      SPEC_SIZES.length * SPEC_SKILL.length,
    );
    expect(SPEC_SIZES.length, 'the attribute scale holds four sizes').toBe(4);
    expect(SPEC_SKILL.length, 'the skill scale holds four sizes and absence').toBe(5);
    expect(OFFSETS.length, 'the difficulty range holds seven offsets').toBe(7);
    expect(STEP_SIZES, 'the module holds the scale the spec states').toEqual(SPEC_SIZES);
  });

  it('expresses a large attribute beside a small skill, and a skill-less roll at any size', () => {
    // Neither case existed while one index named both dice, and the reference
    // permits both.
    expect(rolled({ attribute: 12, skill: 6 }, 0)).toEqual({ attribute: 12, skill: 6 });
    expect(rolled({ attribute: 6, skill: 12 }, 0)).toEqual({ attribute: 6, skill: 12 });
    expect(rolled({ attribute: 12, skill: null }, 0)).toEqual({ attribute: 12, skill: null });
    expect(
      buildPool(stepBuilder({ attribute: 12, skill: null })).map(
        (die) => `${die.type}:d${die.faces}`,
      ),
      'no skill die means the attribute die rolls alone, at its own size',
    ).toEqual(['attribute:d12']);
  });

  it('returns the base pair when -n follows +n, over the whole space', () => {
    let checked = 0;
    for (const base of everyBase()) {
      for (const offset of OFFSETS) {
        expect(
          rolled(base, offset, -offset),
          `${show(base)}: ${offset} then ${-offset} returns ${show(base)}`,
        ).toEqual(base);
        checked += 1;
      }
    }
    // The base and the modifier are stored apart, so the round trip holds even
    // where the sizes clamped. The earlier eight-state list lost the base in
    // exactly those cases.
    expect(checked, 'every case of the space ran').toBe(everyBase().length * OFFSETS.length);
  });

  it('composes two modifiers into their sum, over the whole space', () => {
    let checked = 0;
    for (const base of everyBase()) {
      for (const first of OFFSETS) {
        for (const second of OFFSETS) {
          const sum = first + second;
          if (Math.abs(sum) > 3) continue;
          expect(
            rolled(base, first, second),
            `${show(base)}: ${first} then ${second} lands where ${sum} lands`,
          ).toEqual(rolled(base, sum));
          checked += 1;
        }
      }
    }
    // The property the enumerated list existed to guarantee. 37 of the 49
    // ordered offset pairs keep their sum inside the range.
    expect(rolled({ attribute: 8, skill: 6 }, 2, -1), '+2 then -1 is +1').toEqual(
      rolled({ attribute: 8, skill: 6 }, 1),
    );
    expect(checked, 'every pair whose sum stays in range ran').toBe(everyBase().length * 37);
  });

  it('clamps at both ends of the scale, and the clamp bites in 44 of the 140 cases', () => {
    const perOffset = new Map<number, number>();
    let clamped = 0;
    let low = 0;
    let high = 0;
    let checked = 0;

    for (const base of everyBase()) {
      for (const offset of OFFSETS) {
        const ranks = rawRanks(base, offset);
        const under = ranks.some((rank) => rank < 0);
        const over = ranks.some((rank) => rank > TOP_RANK);
        const sizes = rolled(base, offset);
        if (under) {
          expect(
            [sizes.attribute, sizes.skill],
            `${show(base)} at ${offset}: a die sits on the smallest size`,
          ).toContain(SPEC_SIZES[0]);
          low += 1;
        }
        if (over) {
          expect(
            [sizes.attribute, sizes.skill],
            `${show(base)} at ${offset}: a die sits on the largest size`,
          ).toContain(SPEC_SIZES[TOP_RANK]);
          high += 1;
        }
        if (under || over) {
          clamped += 1;
          perOffset.set(offset, (perOffset.get(offset) ?? 0) + 1);
        }
        checked += 1;
      }
    }

    expect(checked, 'every case of the space ran').toBe(everyBase().length * OFFSETS.length);
    expect(checked, 'four attribute sizes, five skill states, seven offsets').toBe(140);
    // Counted per modifier, and symmetric because the split table is.
    expect(
      OFFSETS.map((offset) => perOffset.get(offset) ?? 0),
      'the clamp bites at -3 to +3',
    ).toEqual([11, 9, 2, 0, 2, 9, 11]);
    expect(clamped, 'the same cases, summed').toBe(44);
    expect([low, high], 'both ends of the scale are reached, equally often').toEqual([22, 22]);
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
    const builder = stepBuilder({ attribute: 10, skill: 8 }, [
      { type: 'gear', faces: 6 },
      { type: 'artifact', faces: 12 },
      { type: 'bonus', faces: 6 },
      { type: 'stress', faces: 6 },
    ]);
    expect(typesOf(builder), 'the rated pair first, then the added dice').toEqual([
      'attribute:d10',
      'skill:d8',
      'gear:d6',
      'artifact:d12',
      'bonus:d6',
      'stress:d6',
    ]);
  });

  it('takes the step attribute and skill dice from the rated pair only', () => {
    const builder = stepBuilder({ attribute: 8, skill: 6 });
    expect(typesOf(builder)).toEqual(['attribute:d8', 'skill:d6']);
    expect(
      typesOf(stepBuilder({ attribute: 6, skill: null })),
      'no skill die is a lone die',
    ).toEqual(['attribute:d6']);
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
    expect(
      typesOf(stepped),
      'the new builder starts at the smallest attribute and no skill die',
    ).toEqual(['attribute:d6']);
    expect((stepped as StepBuilder).modifier, 'and at no difficulty').toBe(0);
    expect(stepped.dice, 'the mode switch discards the dice, it does not convert them').toEqual([]);
    expect(switchMode(stepped, 'pool')).toEqual(emptyBuilder('pool'));
  });
});

describe('difficulty', () => {
  it('steps the two die sizes in step mode and stores the modifier', () => {
    const builder = stepBuilder({ attribute: 8, skill: 8 });
    expect(typesOf(applyDifficulty(builder, 2)), 'both dice take one step').toEqual([
      'attribute:d10',
      'skill:d10',
    ]);
    expect(applyDifficulty(builder, 9).modifier, 'the modifier is clamped to +3 first').toBe(3);
    expect(applyDifficulty(builder, -9).modifier, 'and to -3').toBe(-3);
    expect(
      applyDifficulty(builder, 9).attribute,
      'the base pair is untouched, whatever the modifier',
    ).toBe(builder.attribute);
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
