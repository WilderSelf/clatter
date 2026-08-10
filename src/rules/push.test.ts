import { describe, expect, it } from 'vitest';
import type { DieType, Faces } from './die';
import { appendValue, createDie } from './die';
import type { PushProfile } from './push-profile';
import { PUSH_PROFILES } from './push-profile';
import type { RollResult } from './roll';
import { score } from './success';
import { previewPush, push, pushCost, type PushedRoll, type PushOutcome } from './push';

// ---------------------------------------------------------------------------
// The spec, restated. Nothing below reads a profile's lock fields through the
// module's helpers, and nothing calls `isLocked`, `lockState` or the pushable
// derivation to build an expectation. A resolver that drifts from
// specs/0001-rules-model.md therefore moves the module and this file apart.
// ---------------------------------------------------------------------------

/**
 * Every success curve in the spec's "Success curves" section pays its first
 * success at a face of 6, on a d6, a d8, a d10 and a d12 alike. So "the die
 * scored" and "the face is 6 or more" are the same statement, and the lock rule
 * below needs no success table.
 */
const FIRST_SUCCESS_FACE = 6;

interface SpecRow {
  readonly id: string;
  readonly lockSuccesses: boolean;
  /** The dice types whose 1s lock, from the "Locks on push" column. */
  readonly lockOnes: readonly DieType[];
  readonly maxPushes: number | 'noLimit';
  /** `bane` charges per 1 still showing. `push` charges once per push. */
  readonly costPer: 'bane' | 'push';
  /** The dice types whose 1s the profile charges for. Empty when it charges per push. */
  readonly costTypes: readonly DieType[];
  readonly perUnit: number;
  /** Profile 3 raises stress by one before the re-roll. */
  readonly addsStress: boolean;
  readonly blocksOnStressOne: boolean;
}

/**
 * The four presets of the spec's "Push profiles" section, restated.
 *
 * 1. Locks successes and 1s, so the 1s of the "Locks on push" column lock. Each
 *    attribute 1 costs a point of that attribute and each gear 1 lowers that
 *    gear, so both types pay. Skill 1s are inert and artifact dice never
 *    degrade.
 * 2. Locks successes only. A 1 carries no meaning. The referee gains one point
 *    per push, so the cost reads no dice.
 * 3. Locks successes only. Stress rises by one before the re-roll. A 1 on a
 *    stress die calls for a complication check and stops every further push.
 * 4. Locks successes and 1s. Each 1 still showing costs one point of health,
 *    physical or mental according to the attribute rolled, so the attribute
 *    dice pay it.
 */
const SPEC: readonly SpecRow[] = [
  {
    id: 'pool-banes-damage-ratings',
    lockSuccesses: true,
    lockOnes: ['attribute', 'gear', 'stress'],
    maxPushes: 1,
    costPer: 'bane',
    costTypes: ['attribute', 'gear'],
    perUnit: 1,
    addsStress: false,
    blocksOnStressOne: false,
  },
  {
    id: 'pool-referee-gains-a-point',
    lockSuccesses: true,
    lockOnes: [],
    maxPushes: 1,
    costPer: 'push',
    costTypes: [],
    perUnit: 1,
    addsStress: false,
    blocksOnStressOne: false,
  },
  {
    id: 'pool-stress-and-complications',
    lockSuccesses: true,
    lockOnes: [],
    maxPushes: 'noLimit',
    costPer: 'bane',
    costTypes: ['stress'],
    perUnit: 1,
    addsStress: true,
    blocksOnStressOne: true,
  },
  {
    id: 'step-banes-cost-health',
    lockSuccesses: true,
    lockOnes: ['attribute', 'gear', 'stress'],
    maxPushes: 1,
    costPer: 'bane',
    costTypes: ['attribute'],
    perUnit: 1,
    addsStress: false,
    blocksOnStressOne: false,
  },
];

// ---------------------------------------------------------------------------
// Fixture rolls, built by hand.
// ---------------------------------------------------------------------------

/**
 * The face the injected source returns. No fixture die shows it, so a die that
 * carries this face at the pushed generation was thrown, and a die that does
 * not was kept. That is how the re-thrown set is read out of the matrix instead
 * of out of the value the resolver reports.
 *
 * 4 scores nothing on any curve and is not a 1, so it changes no lock state.
 */
const REROLL_FACE = 4;

interface FixtureDie {
  readonly type: DieType;
  readonly faces: Faces;
  readonly face: number;
  readonly manualLock?: boolean;
}

interface FixtureRoll {
  readonly name: string;
  readonly dice: readonly FixtureDie[];
}

/** An artifact die is always a step die, so every fixture artifact die is a d8. */
const FIXTURE_ROLLS: readonly FixtureRoll[] = [
  {
    name: 'a mixed pool',
    dice: [
      { type: 'attribute', faces: 6, face: 6 },
      { type: 'attribute', faces: 6, face: 1 },
      { type: 'attribute', faces: 6, face: 3 },
      { type: 'attribute', faces: 6, face: 2, manualLock: true },
      { type: 'skill', faces: 6, face: 1 },
      { type: 'skill', faces: 6, face: 5 },
      { type: 'gear', faces: 6, face: 1 },
      { type: 'gear', faces: 6, face: 6 },
      { type: 'artifact', faces: 8, face: 8 },
      { type: 'artifact', faces: 8, face: 3 },
      { type: 'bonus', faces: 6, face: 2 },
      { type: 'stress', faces: 6, face: 3 },
    ],
  },
  {
    name: 'every die loose',
    dice: [
      { type: 'attribute', faces: 6, face: 3 },
      { type: 'skill', faces: 6, face: 2 },
      { type: 'gear', faces: 6, face: 5 },
      { type: 'artifact', faces: 8, face: 5 },
      { type: 'bonus', faces: 6, face: 3 },
      { type: 'stress', faces: 6, face: 2 },
    ],
  },
  {
    name: 'every die a success',
    dice: [
      { type: 'attribute', faces: 6, face: 6 },
      { type: 'skill', faces: 6, face: 6 },
      { type: 'gear', faces: 6, face: 6 },
      { type: 'artifact', faces: 8, face: 8 },
      { type: 'bonus', faces: 6, face: 6 },
      { type: 'stress', faces: 6, face: 6 },
    ],
  },
  {
    name: 'a stress die shows a 1',
    dice: [
      { type: 'attribute', faces: 6, face: 3 },
      { type: 'skill', faces: 6, face: 6 },
      { type: 'stress', faces: 6, face: 1 },
    ],
  },
  {
    name: 'no stress die at all',
    dice: [
      { type: 'attribute', faces: 6, face: 3 },
      { type: 'attribute', faces: 6, face: 6 },
      { type: 'skill', faces: 6, face: 2 },
    ],
  },
];

/** Rolls times presets. The counted denominator of the matrix tests. */
const PAIRS = FIXTURE_ROLLS.length * SPEC.length;

type Entry = FixtureDie & { readonly id: string };

/**
 * One generation, built by hand. Ids follow the `type-ordinal` scheme of
 * `buildPool`. `stressBefore` is the counter the application holds, which
 * reaches the resolver as the roll's `stressAfter`.
 */
function buildRoll(
  roll: FixtureRoll,
  stressBefore = 0,
): { result: RollResult; entries: readonly Entry[] } {
  const seen = new Map<DieType, number>();
  const entries: Entry[] = roll.dice.map((entry) => {
    const ordinal = (seen.get(entry.type) ?? 0) + 1;
    seen.set(entry.type, ordinal);
    return { ...entry, id: `${entry.type}-${ordinal}` };
  });
  const dice = entries.map((entry) =>
    appendValue(
      { ...createDie(entry.id, entry.type, entry.faces), manualLock: entry.manualLock === true },
      entry.face,
    ),
  );
  return { result: { dice, stressAfter: stressBefore }, entries };
}

/** The fields a die carries. Nothing here holds a stress counter. */
const DIE_FIELDS: readonly string[] = ['faces', 'id', 'manualLock', 'type', 'values'];

/**
 * The lock rule restated: a success locks where the profile locks successes,
 * then a 1 locks where the profile charges that type, then the player's choice.
 */
function expectedLocked(spec: SpecRow, entry: Entry): boolean {
  if (spec.lockSuccesses && entry.face >= FIRST_SUCCESS_FACE) {
    return true;
  }
  if (spec.lockOnes.includes(entry.type) && entry.face === 1) {
    return true;
  }
  return entry.manualLock === true;
}

function expectedRefusal(
  spec: SpecRow,
  entries: readonly Entry[],
  pushesSoFar: number,
): 'atPushLimit' | 'blocked' | null {
  const limit = spec.maxPushes === 'noLimit' ? Number.MAX_SAFE_INTEGER : spec.maxPushes;
  if (pushesSoFar >= limit) {
    return 'atPushLimit';
  }
  if (
    spec.blocksOnStressOne &&
    entries.some((entry) => entry.type === 'stress' && entry.face === 1)
  ) {
    return 'blocked';
  }
  return null;
}

function zeroByType(): Record<DieType, number> {
  return { attribute: 0, skill: 0, gear: 0, artifact: 0, bonus: 0, stress: 0 };
}

function expectedCostByType(spec: SpecRow, entries: readonly Entry[]): Record<DieType, number> {
  const byType = zeroByType();
  if (spec.costPer === 'push') {
    return byType;
  }
  for (const type of spec.costTypes) {
    byType[type] =
      entries.filter((entry) => entry.type === type && entry.face === 1).length * spec.perUnit;
  }
  return byType;
}

function expectedCostTotal(spec: SpecRow, entries: readonly Entry[]): number {
  return spec.costPer === 'push'
    ? spec.perUnit
    : Object.values(expectedCostByType(spec, entries)).reduce((total, each) => total + each, 0);
}

/** Counts every draw and the die size each draw asked for. */
function countingSource(value: number) {
  const requested: Faces[] = [];
  return {
    requested,
    face(faces: Faces): number {
      requested.push(faces);
      return value;
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

function pushed(outcome: PushOutcome, label: string): PushedRoll {
  if (outcome.kind !== 'pushed') {
    throw new Error(`${label}: the push was refused with ${outcome.reason}`);
  }
  return outcome;
}

function sorted(values: readonly (string | number)[]): (string | number)[] {
  return [...values].sort((left, right) => String(left).localeCompare(String(right)));
}

describe('the fixture rolls', () => {
  it('cannot collide with the re-throw marker, and score where the restated rule says', () => {
    let checked = 0;
    for (const roll of FIXTURE_ROLLS) {
      for (const entry of buildRoll(roll).entries) {
        expect(entry.face, `${roll.name}/${entry.id} must not wear the marker`).not.toBe(
          REROLL_FACE,
        );
        expect(entry.face).toBeGreaterThanOrEqual(1);
        expect(entry.face).toBeLessThanOrEqual(entry.faces);
        // The success tables are the second enumeration of the restated rule.
        const die = appendValue(createDie(entry.id, entry.type, entry.faces), entry.face);
        expect(score(die) > 0, `${roll.name}/${entry.id} face ${entry.face}`).toBe(
          entry.face >= FIRST_SUCCESS_FACE,
        );
        checked += 1;
      }
    }
    expect(checked, 'every fixture die was read').toBe(
      FIXTURE_ROLLS.reduce((total, roll) => total + roll.dice.length, 0),
    );
    const marker = appendValue(createDie('marker', 'attribute', 6), REROLL_FACE);
    expect(score(marker), 'the marker scores nothing, so it changes no lock state').toBe(0);
    expect(REROLL_FACE, 'the marker is not a bane either').not.toBe(1);
  });
});

describe('push', () => {
  it('re-throws exactly the dice the restated lock rules leave loose', () => {
    let pairs = 0;
    let refusals = 0;
    let draws = 0;
    let expectedDraws = 0;

    for (const roll of FIXTURE_ROLLS) {
      for (const spec of SPEC) {
        const label = `${spec.id} / ${roll.name}`;
        const { result, entries } = buildRoll(roll);
        const source = countingSource(REROLL_FACE);
        const outcome = push(result, preset(spec.id), source);

        if (expectedRefusal(spec, entries, 0) !== null) {
          expect(outcome.kind, `${label}: the restated rules refuse this push`).toBe('refused');
          expect(source.requested.length, `${label}: a refused push drew from the source`).toBe(0);
          refusals += 1;
          continue;
        }

        const after = pushed(outcome, label);
        const generation = 1;

        // The dice this push added, read as the ids that were not there before.
        const before = new Set(entries.map((entry) => entry.id));
        const added = after.dice.filter((die) => !before.has(die.id)).map((die) => die.id);
        expect(added.length, `${label}: dice added before the throw`).toBe(spec.addsStress ? 1 : 0);

        const expectedThrown = [
          ...entries.filter((entry) => !expectedLocked(spec, entry)).map((entry) => entry.id),
          ...added,
        ];
        // Read out of the matrix, not out of the value the resolver reports.
        const thrown = after.dice
          .filter((die) => die.values[generation] === REROLL_FACE)
          .map((die) => die.id);

        expect(
          {
            extra: thrown.filter((id) => !expectedThrown.includes(id)),
            missing: expectedThrown.filter((id) => !thrown.includes(id)),
          },
          `${label}: the push threw the wrong dice`,
        ).toEqual({ extra: [], missing: [] });

        expect(after.rerolled.length, `${label}: the reported set matches the matrix`).toBe(
          thrown.length,
        );
        expect(sorted(after.rerolled), `${label}: the reported set`).toEqual(sorted(thrown));
        expect(source.requested.length, `${label}: draws`).toBe(expectedThrown.length);
        expect(
          sorted(source.requested),
          `${label}: every draw asked for the size of the die it re-threw`,
        ).toEqual(
          sorted(
            expectedThrown.map(
              (id) => after.dice.find((die) => die.id === id)?.faces ?? Number.NaN,
            ),
          ),
        );
        expect(
          new Set(after.dice.map((die) => die.values.length)),
          `${label}: the matrix stays rectangular`,
        ).toEqual(new Set([generation + 1]));
        expect(after.generation, `${label}: the appended generation`).toBe(generation);

        draws += source.requested.length;
        expectedDraws += expectedThrown.length;
        pairs += 1;
      }
    }

    expect(pairs + refusals, 'every roll met every preset').toBe(PAIRS);
    expect(PAIRS, 'five fixture rolls by four presets').toBe(20);
    expect(draws).toBe(expectedDraws);
    expect(draws, 'k > 0 over the matrix, so no pair passed on two empty sets').toBeGreaterThan(0);
  });

  it('does not change the roll it is given', () => {
    const { result } = buildRoll(FIXTURE_ROLLS[0] as FixtureRoll);
    for (const die of result.dice) {
      Object.freeze(die.values);
      Object.freeze(die);
    }
    Object.freeze(result.dice);
    Object.freeze(result);
    const before = structuredClone(result) as RollResult;

    // A frozen object throws on a write, because a module is always strict.
    const after = pushed(
      push(result, preset('pool-stress-and-complications'), countingSource(3)),
      'freeze',
    );

    expect(result, 'the input roll is unchanged').toEqual(before);
    expect(
      result.dice.map((die) => die.values.length),
      'no die in the input took a second generation',
    ).toEqual(result.dice.map(() => 1));
    expect(after.dice[0], 'the outcome holds new die objects').not.toBe(result.dice[0]);
    expect(after.dice.length, 'the outcome carries the added stress die').toBe(
      result.dice.length + 1,
    );
  });
});

// ---------------------------------------------------------------------------
// The defect this unit exists to not have: a stress die added AFTER the throw
// sits blank until the next push, and the player throws one die too few. The
// spec says stress rises by one BEFORE the re-roll, so the new die joins that
// same push.
// ---------------------------------------------------------------------------

describe('profile 3, stress rises before the re-roll', () => {
  it('adds the stress die before the throw, so the new stress die takes part in that same push', () => {
    const spec = SPEC[2] as SpecRow;
    expect(spec.id, 'the third preset is the stress profile').toBe('pool-stress-and-complications');
    const roll = FIXTURE_ROLLS[4] as FixtureRoll;
    expect(
      roll.dice.some((die) => die.type === 'stress'),
      'this roll starts with no stress die, so stress rises from zero',
    ).toBe(false);

    const { result, entries } = buildRoll(roll);
    const source = countingSource(REROLL_FACE);
    const outcome = pushed(push(result, preset(spec.id), source), 'stress');

    const added = outcome.dice.filter((die) => !entries.some((entry) => entry.id === die.id));
    expect(added.length, 'the push raised stress by one').toBe(1);
    const stressDie = added[0];
    if (stressDie === undefined) {
      throw new Error('no stress die was added');
    }
    expect(stressDie.type).toBe('stress');
    expect(stressDie.faces, 'a stress die is a d6').toBe(6);
    expect(outcome.stressAdded, 'the outcome names the die it added').toBe(stressDie.id);

    // Before the push it did not exist, and at the pushed generation it holds a
    // thrown value. A die added after the throw would read null here.
    expect(stressDie.values.length, 'one entry per generation').toBe(2);
    expect(stressDie.values[0], 'null for every generation before it appeared').toBeNull();
    expect(stressDie.values[1], 'the new stress die was thrown in this same push').toBe(
      REROLL_FACE,
    );

    const loose = entries.filter((entry) => !expectedLocked(spec, entry)).map((entry) => entry.id);
    expect(loose.length, 'the roll holds loose dice of its own').toBeGreaterThan(0);
    expect(
      source.requested.length,
      'the draw count covers the loose dice and the new stress die',
    ).toBe(loose.length + 1);
    expect(outcome.rerolled, 'the new stress die is in the thrown set').toContain(stressDie.id);
    expect(
      previewPush(result, preset(spec.id)),
      'the preview announces the same die',
    ).toMatchObject({ stressAdded: stressDie.id, rerollCount: loose.length + 1 });
  });

  it('leaves the other three presets adding no stress die', () => {
    let checked = 0;
    for (const spec of SPEC) {
      if (spec.addsStress) {
        continue;
      }
      const { result, entries } = buildRoll(FIXTURE_ROLLS[4] as FixtureRoll);
      const outcome = pushed(push(result, preset(spec.id), countingSource(REROLL_FACE)), spec.id);
      expect(outcome.dice.length, spec.id).toBe(entries.length);
      expect(outcome.stressAdded, spec.id).toBeNull();
      checked += 1;
    }
    expect(checked, 'three of the four presets raise no stress').toBe(3);
  });
});

// ---------------------------------------------------------------------------
// Unit 1.7. The application owns the stress counter. It passes the counter in
// on the roll and reads the new value back off the push. Nothing here counts
// the stress dice on the table to find the current stress.
// ---------------------------------------------------------------------------

describe('stressAfter', () => {
  /** Counters the application might hold. A push is asked for at each one. */
  const STRESS_VALUES: readonly number[] = [0, 1, 4];

  it('is the counter that came in plus what the profile adds, and no die stores it', () => {
    let compared = 0;
    let raised = 0;

    for (const spec of SPEC) {
      for (const stressBefore of STRESS_VALUES) {
        const label = `${spec.id} / stress ${stressBefore}`;
        // The fixture with no stress die of its own, so the counter is the only
        // source of the number. A count of the stress dice would read zero.
        const { result } = buildRoll(FIXTURE_ROLLS[4] as FixtureRoll, stressBefore);
        expect(result.stressAfter, `${label}: the roll carries the counter in`).toBe(stressBefore);

        const profile = preset(spec.id);
        const expected = stressBefore + (spec.addsStress ? 1 : 0);
        const preview = previewPush(result, profile);
        if (preview.kind !== 'available') {
          throw new Error(`${label}: the preview refused this push`);
        }
        expect(preview.stressAfter, `${label}: read before the throw`).toBe(expected);

        const after = pushed(push(result, profile, countingSource(REROLL_FACE)), label);
        expect(after.stressAfter, `${label}: the counter plus what the profile adds`).toBe(
          expected,
        );
        for (const die of after.dice) {
          expect(Object.keys(die).sort(), `${label}: ${die.id} stores no stress`).toEqual(
            DIE_FIELDS,
          );
        }
        raised += expected - stressBefore;
        compared += 1;
      }
    }

    expect(compared, 'every preset met every counter value').toBe(
      SPEC.length * STRESS_VALUES.length,
    );
    expect(SPEC.length * STRESS_VALUES.length, 'four presets by three counters').toBe(12);
    expect(raised, 'one preset of four raised stress at each counter').toBe(STRESS_VALUES.length);
  });

  it('names the added die from the counter, not from the dice on the table', () => {
    const profile = preset('pool-stress-and-complications');
    const roll = FIXTURE_ROLLS[4] as FixtureRoll;
    expect(
      roll.dice.some((die) => die.type === 'stress'),
      'the table holds no stress die, so only the counter can name the next one',
    ).toBe(false);

    const { result } = buildRoll(roll, 4);
    const first = pushed(push(result, profile, countingSource(REROLL_FACE)), 'first push');
    expect(first.stressAdded, 'the fifth stress point takes the fifth id').toBe('stress-5');
    expect(first.stressAfter, 'stress rose from four to five').toBe(5);

    const second = pushed(push(first, profile, countingSource(REROLL_FACE)), 'second push');
    expect(second.stressAdded, 'the sixth stress point takes the sixth id').toBe('stress-6');
    expect(second.stressAfter, 'the counter chains through the pushes').toBe(6);
    expect(new Set(second.dice.map((die) => die.id)).size, 'every die keeps its own column').toBe(
      second.dice.length,
    );
  });
});

describe('a refused push', () => {
  it('names the push limit and draws nothing', () => {
    const profile = preset('pool-banes-damage-ratings');
    const { result } = buildRoll(FIXTURE_ROLLS[0] as FixtureRoll);
    const first = pushed(push(result, profile, countingSource(REROLL_FACE)), 'first push');
    expect(first.generation, 'the first push is allowed and appends generation 1').toBe(1);

    const source = countingSource(REROLL_FACE);
    const second = push(first, profile, source);
    expect(second.kind).toBe('refused');
    if (second.kind !== 'refused') {
      throw new Error('the second push was not refused');
    }
    expect(second.reason).toBe('atPushLimit');
    expect(second.blocker, 'the limit refused, not a blocker').toBeNull();
    expect(source.requested.length, 'a refused push drew from the source').toBe(0);
    expect(previewPush(first, profile), 'the preview refuses it too').toEqual(second);
  });

  it('names the blocker and draws nothing', () => {
    const profile = preset('pool-stress-and-complications');
    const { result } = buildRoll(FIXTURE_ROLLS[3] as FixtureRoll);
    const source = countingSource(REROLL_FACE);
    const outcome = push(result, profile, source);

    expect(outcome.kind).toBe('refused');
    if (outcome.kind !== 'refused') {
      throw new Error('a stress 1 did not refuse the push');
    }
    expect(outcome.reason).toBe('blocked');
    expect(outcome.blocker).toBe('stressOneShowing');
    expect(source.requested.length, 'a refused push drew from the source').toBe(0);
    expect(previewPush(result, profile), 'the preview refuses it too').toEqual(outcome);
  });
});

describe('previewPush', () => {
  it('reports the re-throw count and the cost the push then applies', () => {
    let compared = 0;
    let costSeen = 0;

    for (const roll of FIXTURE_ROLLS) {
      for (const spec of SPEC) {
        const label = `${spec.id} / ${roll.name}`;
        const { result, entries } = buildRoll(roll);
        const profile = preset(spec.id);
        const preview = previewPush(result, profile);
        const source = countingSource(REROLL_FACE);
        const outcome = push(result, profile, source);

        if (preview.kind === 'refused') {
          expect(outcome, `${label}: both refuse the same way`).toEqual(preview);
          expect(source.requested.length, `${label}: a refused push drew`).toBe(0);
          compared += 1;
          continue;
        }

        const after = pushed(outcome, label);
        expect(preview.rerollCount, `${label}: the preview count equals the draws`).toBe(
          source.requested.length,
        );
        expect(preview.rerollCount, `${label}: the preview count equals the thrown set`).toBe(
          after.rerolled.length,
        );
        expect(preview.rerolled, `${label}: the same dice`).toEqual(after.rerolled);
        expect(preview.stressAdded, `${label}: the same added die`).toBe(after.stressAdded);
        expect(preview.cost, `${label}: the same cost`).toEqual(after.cost);
        expect(preview.cost.total, `${label}: the restated cost`).toBe(
          expectedCostTotal(spec, entries),
        );
        expect(preview.cost.byType, `${label}: the restated cost by type`).toEqual(
          expectedCostByType(spec, entries),
        );
        expect(preview.pushesSoFar, `${label}: no push spent yet`).toBe(0);
        costSeen += preview.cost.total;
        compared += 1;
      }
    }

    expect(compared, 'every fixture roll met every preset').toBe(PAIRS);
    expect(PAIRS, 'five fixture rolls by four presets').toBe(20);
    expect(costSeen, 'the compared costs are not all zero').toBeGreaterThan(0);
  });

  it('draws nothing, because it takes no random source', () => {
    expect(previewPush.length, 'the preview takes a roll and a profile only').toBe(2);
  });
});

describe('pushCost', () => {
  it('reads the cost out of the unit, so a new cost model stays a data row', () => {
    let checked = 0;
    for (const spec of SPEC) {
      const { result, entries } = buildRoll(FIXTURE_ROLLS[0] as FixtureRoll);
      const readout = pushCost(result, preset(spec.id));
      expect(readout.total, spec.id).toBe(expectedCostTotal(spec, entries));
      expect(readout.byType, spec.id).toEqual(expectedCostByType(spec, entries));
      checked += 1;
    }
    expect(checked).toBe(SPEC.length);
    // The mixed pool carries an attribute 1 and a gear 1, so the two per-type
    // profiles cannot both read zero.
    expect(
      pushCost(
        buildRoll(FIXTURE_ROLLS[0] as FixtureRoll).result,
        preset('pool-banes-damage-ratings'),
      ).total,
      'one attribute 1 and one gear 1',
    ).toBe(2);
    expect(
      pushCost(buildRoll(FIXTURE_ROLLS[0] as FixtureRoll).result, preset('step-banes-cost-health'))
        .total,
      'one attribute 1, and a gear 1 costs no health',
    ).toBe(1);
  });
});
