import { describe, expect, it } from 'vitest';
import { appendValue, createDie, type Die, type DieType, type Faces } from './die';
import {
  isLocked,
  lockState,
  mergeProfile,
  pushBlockedBy,
  PUSH_PROFILES,
  type LockState,
  type PushBlocker,
  type PushProfile,
  type PushProfileOverride,
  type StressBehaviour,
} from './push-profile';
import { DICE_TYPES, score } from './success';

const NO_ONES = {
  attribute: false,
  skill: false,
  gear: false,
  artifact: false,
  bonus: false,
  stress: false,
} as const;

/** A fixture, not a preset. The four presets are data and land in Unit 1.5. */
function fixture(overrides: Partial<PushProfile> = {}): PushProfile {
  return {
    id: 'fixture',
    label: 'Fixture',
    description: 'A profile written for this test only.',
    lockSuccesses: true,
    lockOnesBy: NO_ONES,
    maxPushes: 1,
    cost: { source: 'bane', unit: 'ratingPoint', perUnit: 1 },
    stressBehaviour: 'none',
    blockers: [],
    ...overrides,
  };
}

const rolled = (type: DieType, faces: Faces, face: number, manualLock = false) =>
  appendValue({ ...createDie(`${type}-1`, type, faces), manualLock }, face);

describe('lockState', () => {
  it('separates a rule lock, a player choice and a die going back in the cup', () => {
    const profile = fixture();
    const states = [
      lockState(rolled('attribute', 6, 6), profile),
      lockState(rolled('attribute', 6, 3, true), profile),
      lockState(rolled('attribute', 6, 3), profile),
    ];
    expect(states, 'the tray renders three states, so the return holds three').toEqual([
      'rule',
      'choice',
      'loose',
    ]);
    expect(new Set(states).size).toBe(3);
  });

  it('lets a rule lock outrank a player choice', () => {
    // The player cannot release a die the rules hold, so the reason is the rule.
    expect(lockState(rolled('skill', 6, 6, true), fixture())).toBe('rule');
  });

  it('reads lockSuccesses from the profile, not from the dice type', () => {
    const loose = fixture({ lockSuccesses: false });
    expect(lockState(rolled('attribute', 6, 6), loose)).toBe('loose');
    expect(lockState(rolled('artifact', 8, 6), fixture()), 'any artifact success locks').toBe(
      'rule',
    );
  });

  it('reads lockOnesBy per dice type', () => {
    const profile = fixture({
      lockSuccesses: false,
      lockOnesBy: { ...NO_ONES, attribute: true, gear: true, stress: true },
    });
    expect(lockState(rolled('attribute', 6, 1), profile)).toBe('rule');
    expect(lockState(rolled('gear', 6, 1), profile)).toBe('rule');
    expect(lockState(rolled('stress', 6, 1), profile)).toBe('rule');
    expect(lockState(rolled('skill', 6, 1), profile), 'skill 1s stay loose here').toBe('loose');
    expect(lockState(rolled('bonus', 6, 1), profile), 'a bonus die is inert').toBe('loose');
  });

  it('leaves a die that has not rolled loose until the player keeps it', () => {
    const profile = fixture({ lockSuccesses: true, lockOnesBy: { ...NO_ONES, stress: true } });
    const fresh = createDie('stress-1', 'stress', 6, 1);
    expect(lockState(fresh, profile)).toBe('loose');
    expect(lockState({ ...fresh, manualLock: true }, profile)).toBe('choice');
  });

  it('honours the flat artifact toggle when it reads a success', () => {
    const profile = fixture();
    expect(lockState(rolled('artifact', 12, 7), profile, 'artifactFlat')).toBe('rule');
    expect(lockState(rolled('artifact', 12, 5), profile, 'artifactFlat')).toBe('loose');
  });
});

describe('isLocked', () => {
  it('answers true for both locked states and false for the cup', () => {
    const profile = fixture({ lockOnesBy: { ...NO_ONES, attribute: true } });
    expect(isLocked(rolled('attribute', 6, 6), profile)).toBe(true);
    expect(isLocked(rolled('attribute', 6, 1), profile)).toBe(true);
    expect(isLocked(rolled('attribute', 6, 3, true), profile)).toBe(true);
    expect(isLocked(rolled('attribute', 6, 3), profile)).toBe(false);
  });
});

// ===========================================================================
// Unit 1.5 — the four presets and the override merge.
//
// The spec is restated by hand below. Nothing in this section reads
// PUSH_PROFILES to build an expectation, so a preset that drifts from
// specs/0001-rules-model.md moves the module and this file apart.
// ===========================================================================

/** Every dice type, written out. `DICE_TYPES` is the second enumeration. */
const ALL_TYPES: readonly DieType[] = ['attribute', 'skill', 'gear', 'artifact', 'bonus', 'stress'];

interface SpecProfile {
  readonly id: string;
  readonly lockSuccesses: boolean;
  /** The types whose 1s lock, from the "Locks on push" column. */
  readonly lockOnes: readonly DieType[];
  /** `'noLimit'` where the spec states no push count for the profile. */
  readonly maxPushes: number | 'noLimit';
  readonly cost: PushProfile['cost'];
  readonly stressBehaviour: StressBehaviour;
  readonly blockers: readonly PushBlocker[];
}

/**
 * The four presets of specs/0001-rules-model.md, section "Push profiles",
 * restated. The types whose 1s lock come from the "Dice types" table, which
 * profile 1 confirms: skill 1s inert, artifact dice never degrade.
 *
 * Profile 3 is the one profile the spec gives no push count, so its limit is
 * the stress blocker and not a number.
 */
const SPEC: readonly SpecProfile[] = [
  {
    id: 'pool-banes-damage-ratings',
    lockSuccesses: true,
    lockOnes: ['attribute', 'gear', 'stress'],
    maxPushes: 1,
    cost: { source: 'bane', unit: 'ratingPoint', perUnit: 1 },
    stressBehaviour: 'none',
    blockers: [],
  },
  {
    id: 'pool-referee-gains-a-point',
    lockSuccesses: true,
    lockOnes: [],
    maxPushes: 1,
    cost: { source: 'push', unit: 'refereePoint', perUnit: 1 },
    stressBehaviour: 'none',
    blockers: [],
  },
  {
    id: 'pool-stress-and-complications',
    lockSuccesses: true,
    lockOnes: [],
    maxPushes: 'noLimit',
    cost: { source: 'bane', unit: 'complicationCheck', perUnit: 1 },
    stressBehaviour: 'addBeforeReroll',
    blockers: ['stressOneShowing'],
  },
  {
    id: 'step-banes-cost-health',
    lockSuccesses: true,
    lockOnes: ['attribute', 'gear', 'stress'],
    maxPushes: 1,
    cost: { source: 'bane', unit: 'healthPoint', perUnit: 1 },
    stressBehaviour: 'none',
    blockers: [],
  },
];

type FixtureKind = 'success' | 'bane' | 'middling' | 'kept';

interface FixtureDie {
  readonly type: DieType;
  readonly faces: Faces;
  readonly face: number;
  readonly kind: FixtureKind;
  readonly manualLock: boolean;
}

/**
 * One hand-built roll. Every dice type appears with a success, a 1 and a
 * middling face, plus a second middling face the player keeps by choice, so
 * every profile meets all three lock states on every type.
 *
 * An artifact die is always a step die, so it is a d8 here and its middling
 * face is 5. A d6 pays a success on a 6 only, so 3 is middling.
 */
const FIXTURE_ROWS: readonly { type: DieType; faces: Faces; success: number; middling: number }[] =
  [
    { type: 'attribute', faces: 6, success: 6, middling: 3 },
    { type: 'skill', faces: 6, success: 6, middling: 3 },
    { type: 'gear', faces: 6, success: 6, middling: 3 },
    { type: 'artifact', faces: 8, success: 8, middling: 5 },
    { type: 'bonus', faces: 6, success: 6, middling: 3 },
    { type: 'stress', faces: 6, success: 6, middling: 3 },
  ];

const FIXTURE: readonly FixtureDie[] = FIXTURE_ROWS.flatMap((row) => [
  { type: row.type, faces: row.faces, face: row.success, kind: 'success', manualLock: false },
  { type: row.type, faces: row.faces, face: 1, kind: 'bane', manualLock: false },
  { type: row.type, faces: row.faces, face: row.middling, kind: 'middling', manualLock: false },
  { type: row.type, faces: row.faces, face: row.middling, kind: 'kept', manualLock: true },
]);

function fixtureDie(entry: FixtureDie, index: number): Die {
  const base = createDie(`${entry.type}-${entry.kind}-${index}`, entry.type, entry.faces);
  return appendValue({ ...base, manualLock: entry.manualLock }, entry.face);
}

/** The lock rule restated: a success locks, then a 1 locks, then the player. */
function expectedLock(spec: SpecProfile, entry: FixtureDie): LockState {
  if (spec.lockSuccesses && entry.kind === 'success') {
    return 'rule';
  }
  if (spec.lockOnes.includes(entry.type) && entry.kind === 'bane') {
    return 'rule';
  }
  return entry.manualLock ? 'choice' : 'loose';
}

function specFor(id: string): SpecProfile {
  const row = SPEC.find((each) => each.id === id);
  if (row === undefined) {
    throw new Error(`no spec row for ${id}`);
  }
  return row;
}

function preset(id: string): PushProfile {
  const found = PUSH_PROFILES.find((each) => each.id === id);
  if (found === undefined) {
    throw new Error(`no preset ${id}`);
  }
  return found;
}

/** Every state each profile reads over the whole fixture, in fixture order. */
function lockStatesOver(profile: PushProfile): LockState[] {
  return FIXTURE.map((entry, index) => lockState(fixtureDie(entry, index), profile));
}

describe('the fixture roll', () => {
  it('holds every dice type with a success, a 1 and a middling face', () => {
    expect(new Set(FIXTURE_ROWS.map((row) => row.type))).toEqual(new Set(ALL_TYPES));
    expect(new Set(DICE_TYPES.map((row) => row.type)), 'a second enumeration').toEqual(
      new Set(ALL_TYPES),
    );
    expect(FIXTURE.length, 'six types, four dice each').toBe(FIXTURE_ROWS.length * 4);

    let scored = 0;
    for (const [index, entry] of FIXTURE.entries()) {
      const die = fixtureDie(entry, index);
      const successes = score(die);
      if (entry.kind === 'success') {
        expect(successes, `${entry.type} d${entry.faces} face ${entry.face}`).toBeGreaterThan(0);
      } else {
        expect(successes, `${entry.type} d${entry.faces} face ${entry.face}`).toBe(0);
      }
      scored += 1;
    }
    expect(scored).toBe(FIXTURE.length);
  });
});

describe('the four presets', () => {
  it('ships exactly the four the spec lists', () => {
    expect(SPEC.length).toBe(4);
    expect(PUSH_PROFILES.length).toBe(SPEC.length);
    expect(PUSH_PROFILES.map((each) => each.id)).toEqual(SPEC.map((each) => each.id));
  });

  it('carries the spec value in every field except the written strings', () => {
    let rows = 0;
    for (const profile of PUSH_PROFILES) {
      const spec = specFor(profile.id);
      expect(profile.lockSuccesses, `${profile.id} lockSuccesses`).toBe(spec.lockSuccesses);
      expect(profile.stressBehaviour, `${profile.id} stressBehaviour`).toBe(spec.stressBehaviour);
      expect(profile.cost, `${profile.id} cost`).toEqual(spec.cost);
      expect(profile.blockers, `${profile.id} blockers`).toEqual(spec.blockers);
      if (spec.maxPushes === 'noLimit') {
        expect(profile.maxPushes, `${profile.id} maxPushes`).toBeGreaterThan(1000);
        expect(Number.isFinite(profile.maxPushes), `${profile.id} survives JSON`).toBe(true);
      } else {
        expect(profile.maxPushes, `${profile.id} maxPushes`).toBe(spec.maxPushes);
      }
      rows += 1;
    }
    expect(rows).toBe(SPEC.length);
  });

  it('writes its own label and description', () => {
    for (const profile of PUSH_PROFILES) {
      expect(profile.label.length, `${profile.id} label`).toBeGreaterThan(0);
      expect(profile.description.length, `${profile.id} description`).toBeGreaterThan(40);
    }
    expect(new Set(PUSH_PROFILES.map((each) => each.label)).size).toBe(PUSH_PROFILES.length);
  });

  it('reads a lock state for every preset and every dice type', () => {
    let pairs = 0;
    for (const profile of PUSH_PROFILES) {
      const spec = specFor(profile.id);
      for (const type of ALL_TYPES) {
        const entries = FIXTURE.map((entry, index) => ({ entry, index })).filter(
          ({ entry }) => entry.type === type,
        );
        expect(entries.length, `${profile.id} / ${type} fixture size`).toBe(4);
        const actual = entries.map(({ entry, index }) =>
          lockState(fixtureDie(entry, index), profile),
        );
        const expected = entries.map(({ entry }) => expectedLock(spec, entry));
        expect(actual, `${profile.id} / ${type}`).toEqual(expected);
        pairs += 1;
      }
    }
    const denominator = PUSH_PROFILES.length * ALL_TYPES.length;
    expect(denominator, 'four presets by six dice types').toBe(24);
    expect(pairs).toBe(denominator);
  });

  it('keeps the three lock states apart across the matrix', () => {
    const seen = new Set(PUSH_PROFILES.flatMap((profile) => lockStatesOver(profile)));
    expect(seen, 'Unit 3.5 renders all three').toEqual(new Set(['rule', 'choice', 'loose']));
  });

  it('separates the two pool profiles on their treatment of a 1', () => {
    const damaging = preset('pool-banes-damage-ratings');
    const refereePoint = preset('pool-referee-gains-a-point');
    const attributeOne = fixtureDie(
      { type: 'attribute', faces: 6, face: 1, kind: 'bane', manualLock: false },
      0,
    );
    expect(lockState(attributeOne, damaging)).toBe('rule');
    expect(lockState(attributeOne, refereePoint)).toBe('loose');
    expect(lockStatesOver(damaging)).not.toEqual(lockStatesOver(refereePoint));
  });

  it('cannot be edited through a caller', () => {
    for (const profile of PUSH_PROFILES) {
      expect(Object.isFrozen(profile), profile.id).toBe(true);
      expect(Object.isFrozen(profile.lockOnesBy), `${profile.id} lockOnesBy`).toBe(true);
      expect(Object.isFrozen(profile.cost), `${profile.id} cost`).toBe(true);
      expect(Object.isFrozen(profile.blockers), `${profile.id} blockers`).toBe(true);
    }
    expect(Object.isFrozen(PUSH_PROFILES)).toBe(true);
    const target = preset('pool-banes-damage-ratings') as { maxPushes: number };
    expect(() => {
      target.maxPushes = 99;
    }).toThrow(TypeError);
  });
});

describe('pushBlockedBy', () => {
  const stressOne = fixtureDie(
    { type: 'stress', faces: 6, face: 1, kind: 'bane', manualLock: false },
    0,
  );
  const stressThree = fixtureDie(
    { type: 'stress', faces: 6, face: 3, kind: 'middling', manualLock: false },
    1,
  );

  it('refuses a push once a stress die shows a 1', () => {
    const stressProfile = preset('pool-stress-and-complications');
    expect(pushBlockedBy([...FIXTURE.map(fixtureDie), stressOne], stressProfile)).toBe(
      'stressOneShowing',
    );
    expect(pushBlockedBy([stressThree], stressProfile), 'no 1 showing, so no blocker').toBeNull();
  });

  it('leaves the other three profiles unblocked by the same roll', () => {
    let checked = 0;
    for (const profile of PUSH_PROFILES) {
      if (profile.blockers.length > 0) {
        continue;
      }
      expect(pushBlockedBy([stressOne], profile), profile.id).toBeNull();
      checked += 1;
    }
    expect(checked, 'three of the four carry no blocker').toBe(3);
  });
});

// --- The override merge -----------------------------------------------------

/** Every field of the record, written out. `Object.keys` is the denominator. */
const FIELDS: readonly (keyof PushProfile)[] = [
  'id',
  'label',
  'description',
  'lockSuccesses',
  'lockOnesBy',
  'maxPushes',
  'cost',
  'stressBehaviour',
  'blockers',
];

/** One value per field, each different from the base preset's value. */
const OVERRIDES: { readonly [K in keyof PushProfile]: PushProfile[K] } = {
  id: 'a-variant-the-user-built',
  label: 'A cost model the user wrote',
  description: 'A record built by the override panel.',
  lockSuccesses: false,
  lockOnesBy: {
    attribute: false,
    skill: true,
    gear: false,
    artifact: true,
    bonus: true,
    stress: false,
  },
  maxPushes: 3,
  cost: { source: 'push', unit: 'refereePoint', perUnit: 2 },
  stressBehaviour: 'addBeforeReroll',
  blockers: ['stressOneShowing'],
};

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object') {
    for (const each of Object.values(value as object)) {
      deepFreeze(each);
    }
    Object.freeze(value);
  }
  return value;
}

describe('mergeProfile', () => {
  const base = preset('pool-banes-damage-ratings');

  it('covers every field of the record', () => {
    expect([...FIELDS].sort()).toEqual(Object.keys(base).sort());
    let changed = 0;
    for (const field of FIELDS) {
      const override = { [field]: OVERRIDES[field] } as PushProfileOverride;
      const merged = mergeProfile(base, override);
      expect(merged[field], `${field} did not land`).toEqual(OVERRIDES[field]);
      expect(merged[field], `${field} matched the preset, so it proves nothing`).not.toEqual(
        base[field],
      );
      for (const other of FIELDS) {
        if (other !== field) {
          expect(merged[other], `an override of ${field} moved ${other}`).toEqual(base[other]);
        }
      }
      changed += 1;
    }
    expect(changed).toBe(FIELDS.length);
    expect(FIELDS.length).toBe(9);
  });

  it('merges one checkbox of lockOnesBy without touching the other five', () => {
    const merged = mergeProfile(base, { lockOnesBy: { skill: true } });
    expect(merged.lockOnesBy).toEqual({ ...base.lockOnesBy, skill: true });
    expect(merged.cost).toEqual(base.cost);
  });

  it('merges one part of the cost record', () => {
    const merged = mergeProfile(base, { cost: { perUnit: 2 } });
    expect(merged.cost).toEqual({ ...base.cost, perUnit: 2 });
  });

  it('reads an undefined value as an untouched control', () => {
    const merged = mergeProfile(base, { label: undefined, maxPushes: undefined });
    expect(merged.label).toBe(base.label);
    expect(merged.maxPushes).toBe(base.maxPushes);
  });

  it('changes neither input', () => {
    const source = deepFreeze(structuredClone(base) as PushProfile);
    const override = deepFreeze({
      lockOnesBy: { skill: true },
      blockers: ['stressOneShowing'],
    } as PushProfileOverride);
    const beforeBase = structuredClone(source);
    const beforeOverride = structuredClone(override);

    const merged = mergeProfile(source, override);

    expect(source).toEqual(beforeBase);
    expect(override).toEqual(beforeOverride);
    expect(merged).not.toBe(source);
    expect(merged.lockOnesBy).not.toBe(source.lockOnesBy);
  });

  it('returns a record a caller cannot edit either', () => {
    const merged = mergeProfile(base, { maxPushes: 2 });
    expect(Object.isFrozen(merged)).toBe(true);
    expect(Object.isFrozen(merged.lockOnesBy)).toBe(true);
    expect(Object.isFrozen(merged.cost)).toBe(true);
    expect(Object.isFrozen(merged.blockers)).toBe(true);
  });
});
