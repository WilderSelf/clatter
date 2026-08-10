// The plan's acceptance for Unit 4.1: an unknown stored version falls back to
// defaults without throwing.
//
// The table below holds that case and the neighbours that would otherwise be
// found in production. The count of cases is asserted against the
// enumeration in `ENUMERATED_CASES`, so a case dropped from the table fails
// here instead of going quiet. Unit 3.7 added three, because the permanent fall
// to flat dice added a field and a migration step. Unit 3.6 added four, because
// sound added two fields and another step. Unit 4.8 added three, because the
// three theme axes added three fields and another step. Unit 4.3 added the last
// six, because the saved pool presets added a list of user text, its two caps
// and another step. Units 4.1 and 4.2 added the last six, because the
// push-profile override added a field, another step, and four ways a stored
// override is unusable.
//
// The allowed values are written out again in this file. Reading them from the
// module under test would let the module answer its own question.

import { describe, expect, it } from 'vitest';
import type { PoolCounts } from '../rules/pool';
import { firstRoll, poolBuilder } from '../rules/pool';
import { PUSH_PROFILES } from '../rules/push-profile';
import { seededRandom } from '../rules/seeded-random';
import type { PresetOutcome, Settings, SettingsStore } from './settings';
import {
  DEFAULT_SETTINGS,
  deletePoolPreset,
  migrate,
  movePoolPreset,
  readSettings,
  recallPoolPreset,
  recordFlatFallback,
  savePoolPreset,
  SETTINGS_KEY,
  SETTINGS_VERSION,
  writeSettings,
} from './settings';

/** The twenty-six cases the plan and the unit briefs name, in the order listed. */
const ENUMERATED_CASES = [
  'an unknown future version',
  'a known older version',
  'a missing version field',
  'null',
  'undefined',
  'a string',
  'an array',
  'an object of the wrong shape',
  'a valid version with one field of the wrong type',
  'a preset id that no longer ships',
  'a version 2 record from before the permanent fall existed',
  'a permanent fall flag that is not a boolean',
  'a stored permanent fall of true',
  'a version 3 record from before sound existed',
  'a sound volume above the top of the range',
  'a sound volume that is not a number',
  'a sound flag that is not a boolean',
  'a version 4 record from before the theme axes existed',
  'a dice theme id that no longer ships',
  'a tray surface id that is not a string',
  'a version 5 record from before the pool presets existed',
  'a pool preset list that is not an array',
  'a pool preset with a name that is not a string',
  'a pool preset name longer than the cap',
  'more pool presets than the cap',
  'a pool preset with a dice count out of range',
  'a version 6 record from before the profile override existed',
  'a profile override that is not a record',
  'a profile override naming a field the panel cannot edit',
  'a profile override with a value outside its domain',
  'a profile override that repeats the preset',
  'a profile override the panel can edit',
] as const;

/** The six theme names, written out again for the same reason as the modes. */
const THEME_NAMES = ['ember', 'ash', 'verdigris', 'bone', 'void', 'cobalt'];

/**
 * The two preset caps, written out again for the same reason as the modes.
 * Reading them from the module under test would let the module answer its own
 * question.
 */
const PRESET_LIMIT = 20;
const NAME_LIMIT = 60;

interface Case {
  readonly name: (typeof ENUMERATED_CASES)[number];
  readonly stored: unknown;
  /**
   * What the migrated record must hold, field by field. A field the case does
   * not name must read as the default.
   *
   * Every case carries this, and `assertEveryField` walks the fields of the
   * default record rather than the fields a case names, so a case that says
   * nothing still asserts the whole record. Bounding each field to its allowed
   * values is not enough on its own: `assertUsable` passed every case while the
   * unknown-version case was never compared against the defaults at all.
   */
  readonly expect?: Partial<Settings>;
}

const CASES: readonly Case[] = [
  {
    name: 'an unknown future version',
    stored: { version: 99, mode: 'step', presetId: 'step-banes-cost-health', curveOfTheFuture: 7 },
  },
  {
    name: 'a known older version',
    stored: { version: 1, mode: 'step', presetId: 'pool-referee-gains-a-point' },
    expect: { mode: 'step', presetId: 'pool-referee-gains-a-point' },
  },
  {
    name: 'a missing version field',
    stored: { mode: 'step', presetId: 'step-banes-cost-health', artifactCurve: 'artifactFlat' },
  },
  { name: 'null', stored: null },
  { name: 'undefined', stored: undefined },
  { name: 'a string', stored: '{"version":2}' },
  { name: 'an array', stored: [{ version: 2, mode: 'pool' }] },
  { name: 'an object of the wrong shape', stored: { theme: 'dark', volume: 0.5 } },
  {
    name: 'a valid version with one field of the wrong type',
    stored: {
      version: SETTINGS_VERSION,
      mode: 7,
      presetId: 'step-banes-cost-health',
      artifactCurve: 'artifactFlat',
    },
    // The mode is the only field the record spoils, so the mode is the only
    // field that falls back.
    expect: { presetId: 'step-banes-cost-health', artifactCurve: 'artifactFlat' },
  },
  {
    name: 'a preset id that no longer ships',
    stored: {
      version: SETTINGS_VERSION,
      mode: 'pool',
      presetId: 'a-profile-this-build-no-longer-carries',
      artifactCurve: 'artifactEscalating',
    },
  },
  {
    name: 'a version 2 record from before the permanent fall existed',
    stored: {
      version: 2,
      mode: 'step',
      presetId: 'step-banes-cost-health',
      artifactCurve: 'artifactFlat',
    },
    expect: { mode: 'step', presetId: 'step-banes-cost-health', artifactCurve: 'artifactFlat' },
  },
  {
    name: 'a permanent fall flag that is not a boolean',
    stored: {
      version: SETTINGS_VERSION,
      mode: 'pool',
      presetId: 'pool-banes-damage-ratings',
      artifactCurve: 'artifactEscalating',
      flatFallback: 'yes',
    },
    expect: { presetId: 'pool-banes-damage-ratings' },
  },
  {
    name: 'a stored permanent fall of true',
    stored: {
      version: SETTINGS_VERSION,
      mode: 'pool',
      presetId: 'pool-banes-damage-ratings',
      artifactCurve: 'artifactEscalating',
      flatFallback: true,
    },
    expect: { presetId: 'pool-banes-damage-ratings', flatFallback: true },
  },
  {
    name: 'a version 3 record from before sound existed',
    stored: {
      version: 3,
      mode: 'step',
      presetId: 'step-banes-cost-health',
      artifactCurve: 'artifactFlat',
      flatFallback: true,
    },
    expect: {
      mode: 'step',
      presetId: 'step-banes-cost-health',
      artifactCurve: 'artifactFlat',
      flatFallback: true,
    },
  },
  {
    name: 'a sound volume above the top of the range',
    stored: { version: SETTINGS_VERSION, soundEnabled: true, soundVolume: 11 },
    expect: { soundEnabled: true },
  },
  {
    name: 'a sound volume that is not a number',
    stored: { version: SETTINGS_VERSION, soundEnabled: true, soundVolume: 'loud' },
    expect: { soundEnabled: true },
  },
  {
    name: 'a sound flag that is not a boolean',
    stored: { version: SETTINGS_VERSION, soundEnabled: 'yes', soundVolume: 0.25 },
    expect: { soundVolume: 0.25 },
  },
  {
    name: 'a version 4 record from before the theme axes existed',
    stored: {
      version: 4,
      mode: 'step',
      presetId: 'step-banes-cost-health',
      artifactCurve: 'artifactFlat',
      flatFallback: true,
      soundEnabled: true,
      soundVolume: 0.25,
    },
    expect: {
      mode: 'step',
      presetId: 'step-banes-cost-health',
      artifactCurve: 'artifactFlat',
      flatFallback: true,
      soundEnabled: true,
      soundVolume: 0.25,
    },
  },
  {
    name: 'a dice theme id that no longer ships',
    stored: {
      version: SETTINGS_VERSION,
      diceThemeId: 'a-theme-this-build-no-longer-carries',
      traySurfaceId: 'void',
      interfacePaletteId: 'cobalt',
    },
    expect: { traySurfaceId: 'void', interfacePaletteId: 'cobalt' },
  },
  {
    name: 'a tray surface id that is not a string',
    stored: {
      version: SETTINGS_VERSION,
      diceThemeId: 'ember',
      traySurfaceId: 11,
      interfacePaletteId: null,
    },
    expect: { diceThemeId: 'ember' },
  },
  {
    name: 'a version 5 record from before the pool presets existed',
    stored: {
      version: 5,
      mode: 'step',
      presetId: 'step-banes-cost-health',
      artifactCurve: 'artifactFlat',
      flatFallback: true,
      soundEnabled: true,
      soundVolume: 0.25,
      diceThemeId: 'void',
      traySurfaceId: 'ember',
      interfacePaletteId: 'cobalt',
    },
    expect: {
      mode: 'step',
      presetId: 'step-banes-cost-health',
      artifactCurve: 'artifactFlat',
      flatFallback: true,
      soundEnabled: true,
      soundVolume: 0.25,
      diceThemeId: 'void',
      traySurfaceId: 'ember',
      interfacePaletteId: 'cobalt',
    },
  },
  {
    name: 'a pool preset list that is not an array',
    stored: { version: SETTINGS_VERSION, poolPresets: { first: { name: 'a', counts: {} } } },
  },
  {
    name: 'a pool preset with a name that is not a string',
    stored: { version: SETTINGS_VERSION, poolPresets: [{ name: 7, counts: { attribute: 2 } }] },
  },
  {
    name: 'a pool preset name longer than the cap',
    stored: {
      version: SETTINGS_VERSION,
      poolPresets: [{ name: 'n'.repeat(NAME_LIMIT + 1), counts: { attribute: 2 } }],
    },
  },
  {
    name: 'more pool presets than the cap',
    stored: {
      version: SETTINGS_VERSION,
      poolPresets: Array.from({ length: PRESET_LIMIT + 5 }, (_, index) => ({
        name: `pool ${index}`,
        counts: { attribute: 2 },
      })),
    },
    expect: {
      poolPresets: Array.from({ length: PRESET_LIMIT }, (_, index) => ({
        name: `pool ${index}`,
        counts: { attribute: 2 },
      })),
    },
  },
  {
    name: 'a pool preset with a dice count out of range',
    stored: {
      version: SETTINGS_VERSION,
      poolPresets: [{ name: 'a huge pool', counts: { attribute: 1e9 } }],
    },
  },
  {
    name: 'a version 6 record from before the profile override existed',
    stored: {
      version: 6,
      mode: 'step',
      presetId: 'step-banes-cost-health',
      artifactCurve: 'artifactFlat',
      flatFallback: true,
      soundEnabled: true,
      soundVolume: 0.25,
      diceThemeId: 'void',
      traySurfaceId: 'ember',
      interfacePaletteId: 'cobalt',
      poolPresets: [],
    },
    expect: {
      mode: 'step',
      presetId: 'step-banes-cost-health',
      artifactCurve: 'artifactFlat',
      flatFallback: true,
      soundEnabled: true,
      soundVolume: 0.25,
      diceThemeId: 'void',
      traySurfaceId: 'ember',
      interfacePaletteId: 'cobalt',
    },
  },
  {
    name: 'a profile override that is not a record',
    stored: { version: SETTINGS_VERSION, profileOverride: ['maxPushes', 2] },
  },
  {
    // The identifier, the name and the description are the identity of a
    // profile. No control edits them, so no stored record may either.
    name: 'a profile override naming a field the panel cannot edit',
    stored: {
      version: SETTINGS_VERSION,
      profileOverride: { id: 'a-profile-of-my-own', label: 'mine', description: 'mine' },
    },
  },
  {
    name: 'a profile override with a value outside its domain',
    stored: {
      version: SETTINGS_VERSION,
      profileOverride: { cost: { unit: 'goldPiece', source: 'bane' }, maxPushes: -4 },
    },
  },
  {
    // A leaf that repeats the preset is not an override at all, so it is
    // dropped and the reset control and the panel marks stay honest.
    name: 'a profile override that repeats the preset',
    stored: {
      version: SETTINGS_VERSION,
      presetId: 'pool-banes-damage-ratings',
      profileOverride: { lockSuccesses: true, blockers: [] },
    },
    expect: { presetId: 'pool-banes-damage-ratings' },
  },
  {
    name: 'a profile override the panel can edit',
    stored: {
      version: SETTINGS_VERSION,
      presetId: 'pool-banes-damage-ratings',
      profileOverride: {
        maxPushes: 4,
        lockOnesBy: { skill: true },
        blockers: ['stressOneShowing'],
      },
    },
    expect: {
      presetId: 'pool-banes-damage-ratings',
      profileOverride: {
        maxPushes: 4,
        lockOnesBy: { skill: true },
        blockers: ['stressOneShowing'],
      },
    },
  },
];

/**
 * The allowed values, restated here. A record is usable when every field holds
 * one of them and the version is the one this build writes.
 */
function assertUsable(settings: Settings, caseName: string): void {
  expect(settings.version, `${caseName}: the version is the one this build writes`).toBe(
    SETTINGS_VERSION,
  );
  expect(['pool', 'step'], `${caseName}: the mode is one of the two modes`).toContain(
    settings.mode,
  );
  expect(
    PUSH_PROFILES.map((profile) => profile.id),
    `${caseName}: the preset id names a profile this build ships`,
  ).toContain(settings.presetId);
  expect(
    ['artifactEscalating', 'artifactFlat'],
    `${caseName}: the artifact curve is one of the two artifact curves`,
  ).toContain(settings.artifactCurve);
  expect(typeof settings.flatFallback, `${caseName}: the permanent fall flag is a boolean`).toBe(
    'boolean',
  );
  expect(typeof settings.soundEnabled, `${caseName}: the sound flag is a boolean`).toBe('boolean');
  expect(
    settings.soundVolume,
    `${caseName}: the volume is a level from 0 to 1`,
  ).toBeGreaterThanOrEqual(0);
  expect(
    settings.soundVolume,
    `${caseName}: the volume is a level from 0 to 1`,
  ).toBeLessThanOrEqual(1);
  let axesChecked = 0;
  for (const chosen of [
    settings.diceThemeId,
    settings.traySurfaceId,
    settings.interfacePaletteId,
  ]) {
    expect(THEME_NAMES, `${caseName}: the theme id names a preset this build ships`).toContain(
      chosen,
    );
    axesChecked += 1;
  }
  expect(axesChecked, `${caseName}: all three theme axes were read`).toBe(3);
  expect(Array.isArray(settings.poolPresets), `${caseName}: the presets are a list`).toBe(true);
  expect(
    settings.poolPresets.length,
    `${caseName}: the list is at or under the cap`,
  ).toBeLessThanOrEqual(PRESET_LIMIT);
  for (const preset of settings.poolPresets) {
    expect(typeof preset.name, `${caseName}: a preset name is text`).toBe('string');
    expect(preset.name.length, `${caseName}: a preset name is not empty`).toBeGreaterThan(0);
    expect(
      [...preset.name].length,
      `${caseName}: a preset name is at or under the cap`,
    ).toBeLessThanOrEqual(NAME_LIMIT);
    expect(typeof preset.counts, `${caseName}: a preset holds a pool`).toBe('object');
  }
  expect(
    new Set(settings.poolPresets.map((preset) => preset.name)).size,
    `${caseName}: no name is held twice`,
  ).toBe(settings.poolPresets.length);
  // The override is a record, it names only leaves the panel can edit, and
  // every leaf it names really differs from the preset. The domains are written
  // out again here, because reading them from the module under test would let
  // the module answer its own question.
  const override = settings.profileOverride as Record<string, unknown>;
  expect(typeof override, `${caseName}: the override is a record`).toBe('object');
  expect(Array.isArray(override), `${caseName}: the override is not a list`).toBe(false);
  const preset = PUSH_PROFILES.find((each) => each.id === settings.presetId);
  for (const key of Object.keys(override)) {
    expect(
      ['id', 'label', 'description'],
      `${caseName}: the override names the identity field ${key}`,
    ).not.toContain(key);
    expect(
      Object.keys(preset ?? {}),
      `${caseName}: the override names a field of a profile`,
    ).toContain(key);
    expect(
      JSON.stringify(override[key]),
      `${caseName}: the override repeats the preset at ${key}`,
    ).not.toBe(JSON.stringify((preset as unknown as Record<string, unknown>)[key]));
  }
}

/**
 * The fields of the record, taken from the default record itself.
 *
 * A field added to `Settings` arrives here on the next run, so the comparison
 * below covers it without an edit. Naming the fields in this file instead would
 * make a new field invisible until somebody remembered it, which is how
 * `poolPresets` went uncompared for a whole unit.
 */
const FIELDS = Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[];

/**
 * Compare every field of a migrated record against what the case names, and
 * answer how many fields were compared.
 *
 * The count is returned rather than asserted here, so the caller holds one
 * denominator over the whole table: cases times fields.
 */
function assertEveryField(settings: Settings, each: Case): number {
  let compared = 0;
  for (const field of FIELDS) {
    const wanted = each.expect?.[field] ?? DEFAULT_SETTINGS[field];
    expect(settings[field], `${each.name}: ${field}`).toStrictEqual(wanted);
    compared += 1;
  }
  return compared;
}

/** Call `migrate` and name the case in the failure if it throws. */
function migrateCase(each: Case): Settings {
  try {
    return migrate(each.stored);
  } catch (error) {
    throw new Error(`the migration path for "${each.name}" threw: ${String(error)}`, {
      cause: error,
    });
  }
}

describe('migrate', () => {
  it('returns a usable record for every stored value, and never throws', () => {
    let exercised = 0;
    let fieldsCompared = 0;
    for (const each of CASES) {
      const migrated = migrateCase(each);
      assertUsable(migrated, each.name);
      // Bounded is not the same as right. `assertUsable` asks whether each
      // field holds an allowed value, and this asks which allowed value it
      // holds, over every field of the record and for every case in the table.
      fieldsCompared += assertEveryField(migrated, each);
      exercised += 1;
    }
    expect(exercised, 'every case in the table ran').toBe(CASES.length);
    expect(FIELDS.length, 'the record holds more than its version').toBeGreaterThan(1);
    expect(fieldsCompared, 'every field of the record was compared for every case').toBe(
      CASES.length * FIELDS.length,
    );
    expect(new Set(CASES.map((each) => each.name)).size, 'no case is listed twice').toBe(
      CASES.length,
    );
    expect(CASES.length, 'the table holds one case per enumerated case').toBe(
      ENUMERATED_CASES.length,
    );
    expect(ENUMERATED_CASES.length, 'the enumeration holds thirty-two cases').toBe(32);
  });

  it('cuts an over-long preset list at the cap and keeps the presets it holds', () => {
    // A migration that answered with an empty list would pass `assertUsable`,
    // so the truncation is measured here rather than only bounded.
    const stored = CASES.find((each) => each.name === 'more pool presets than the cap');
    expect(stored, 'the case is in the table').toBeDefined();
    const kept = migrate(stored?.stored).poolPresets;
    expect(kept.length, 'the list is cut at the cap, not emptied').toBe(PRESET_LIMIT);
    expect(kept[0]?.name, 'the first stored preset survives').toBe('pool 0');
    expect(kept.at(-1)?.name, 'the cut takes the tail').toBe(`pool ${PRESET_LIMIT - 1}`);
  });

  it('keeps a stored record this build wrote, so a fallback cannot hide as a pass', () => {
    // Every field differs from the default. A `migrate` that always answered
    // with the defaults would fail on all ten.
    const stored = {
      version: SETTINGS_VERSION,
      mode: 'step',
      presetId: 'step-banes-cost-health',
      artifactCurve: 'artifactFlat',
      flatFallback: true,
      soundEnabled: true,
      soundVolume: 0.25,
      diceThemeId: 'void',
      traySurfaceId: 'ember',
      interfacePaletteId: 'cobalt',
      poolPresets: [{ name: 'the quiet approach', counts: { attribute: 3, artifact: [8] } }],
      profileOverride: { maxPushes: 3, cost: { perUnit: 2 } },
    };
    expect(migrate(stored)).toStrictEqual(stored);
    expect(stored.mode).not.toBe(DEFAULT_SETTINGS.mode);
    expect(stored.presetId).not.toBe(DEFAULT_SETTINGS.presetId);
    expect(stored.artifactCurve).not.toBe(DEFAULT_SETTINGS.artifactCurve);
    expect(stored.flatFallback).not.toBe(DEFAULT_SETTINGS.flatFallback);
    expect(stored.soundEnabled).not.toBe(DEFAULT_SETTINGS.soundEnabled);
    expect(stored.soundVolume).not.toBe(DEFAULT_SETTINGS.soundVolume);
    expect(stored.diceThemeId).not.toBe(DEFAULT_SETTINGS.diceThemeId);
    expect(stored.traySurfaceId).not.toBe(DEFAULT_SETTINGS.traySurfaceId);
    expect(stored.interfacePaletteId).not.toBe(DEFAULT_SETTINGS.interfacePaletteId);
    expect(stored.poolPresets.length).not.toBe(DEFAULT_SETTINGS.poolPresets.length);
    expect(stored.profileOverride).not.toStrictEqual(DEFAULT_SETTINGS.profileOverride);
  });

  it('raises a version 1 record through every step and keeps what it held', () => {
    // Each step supplies what its version added. Neither discards the record.
    expect(migrate({ version: 1, mode: 'step', presetId: 'pool-referee-gains-a-point' })).toEqual({
      version: SETTINGS_VERSION,
      mode: 'step',
      presetId: 'pool-referee-gains-a-point',
      artifactCurve: DEFAULT_SETTINGS.artifactCurve,
      flatFallback: DEFAULT_SETTINGS.flatFallback,
      soundEnabled: DEFAULT_SETTINGS.soundEnabled,
      soundVolume: DEFAULT_SETTINGS.soundVolume,
      diceThemeId: DEFAULT_SETTINGS.diceThemeId,
      traySurfaceId: DEFAULT_SETTINGS.traySurfaceId,
      interfacePaletteId: DEFAULT_SETTINGS.interfacePaletteId,
      poolPresets: DEFAULT_SETTINGS.poolPresets,
      profileOverride: DEFAULT_SETTINGS.profileOverride,
    });
  });
});

/** A store that behaves. The test owns the text, so nothing hides in a real one. */
function fakeStore(seed: Record<string, string> = {}): SettingsStore & { held: typeof seed } {
  const held = { ...seed };
  return {
    held,
    getItem: (key) => held[key] ?? null,
    setItem: (key, value) => {
      held[key] = value;
    },
  };
}

describe('the settings store', () => {
  it('reads back what it wrote', () => {
    const store = fakeStore();
    const written: Settings = { ...DEFAULT_SETTINGS, mode: 'step', flatFallback: true };
    expect(writeSettings(store, written), 'the write was accepted').toBe(true);
    expect(store.held[SETTINGS_KEY], 'the record reached the store as text').toBeTypeOf('string');
    expect(readSettings(store)).toStrictEqual(written);
  });

  it('reads the defaults from an empty store, a broken store and no store at all', () => {
    const refusing: SettingsStore = {
      getItem: () => {
        throw new Error('this browser refuses storage');
      },
      setItem: () => {
        throw new Error('this browser refuses storage');
      },
    };
    let compared = 0;
    for (const store of [fakeStore(), fakeStore({ [SETTINGS_KEY]: 'not json' }), refusing, null]) {
      expect(readSettings(store)).toStrictEqual(DEFAULT_SETTINGS);
      compared += 1;
    }
    expect(compared, 'four stores were read').toBe(4);
    expect(writeSettings(refusing, DEFAULT_SETTINGS), 'a refused write says so').toBe(false);
    expect(writeSettings(null, DEFAULT_SETTINGS), 'a missing store says so').toBe(false);
  });

  it('records the permanent fall, keeps the other fields, and survives a second call', () => {
    const store = fakeStore();
    writeSettings(store, { ...DEFAULT_SETTINGS, mode: 'step', presetId: 'step-banes-cost-health' });

    const fallen = recordFlatFallback(store);
    expect(fallen.flatFallback, 'the fall is recorded').toBe(true);
    expect(fallen.mode, 'the mode survives the fall').toBe('step');
    expect(fallen.presetId, 'the preset survives the fall').toBe('step-banes-cost-health');
    expect(readSettings(store), 'the fall reached the store').toStrictEqual(fallen);
    expect(recordFlatFallback(store), 'a second fall changes nothing').toStrictEqual(fallen);
  });

  it('never clears the fall by itself, whatever else is written', () => {
    const store = fakeStore();
    recordFlatFallback(store);
    // A later write of an unrelated field must carry the flag, so a caller has
    // to read before it writes. This is the read path the toggle reverses.
    const held = readSettings(store);
    writeSettings(store, { ...held, mode: 'step' });
    expect(readSettings(store).flatFallback, 'the fall is still recorded').toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Unit 4.3 — the saved pools
//
// Name a pool, recall it, reorder and delete. Three presets, because a reorder
// over two is not observable: any move of one of two gives the same two orders.
// ---------------------------------------------------------------------------

/**
 * A name holding markup, both kinds of quote, an ampersand and an emoji, at 51
 * code points, which is inside the cap on the name length.
 */
const HOSTILE_NAME = '<img src=x onerror="alert(1)"> \'a\' "b" & <b>x</b> 🎲';

function saved(outcome: PresetOutcome, what: string): Settings {
  if (outcome.kind !== 'saved') {
    throw new Error(`${what} was refused: ${outcome.reason}`);
  }
  return outcome.settings;
}

const THREE_POOLS: readonly (readonly [string, PoolCounts])[] = [
  ['the quiet approach', { attribute: 3, skill: 2 }],
  ['the loud approach', { attribute: 4, gear: 1, artifact: [10] }],
  ['the last resort', { attribute: 2, skill: 1, gear: 1, bonus: 1, stress: 1 }],
];

function withThree(): Settings {
  return THREE_POOLS.reduce(
    (settings, [name, counts]) => saved(savePoolPreset(settings, name, counts), name),
    DEFAULT_SETTINGS,
  );
}

describe('the saved pools', () => {
  it('names a pool and keeps the order the names were saved in', () => {
    const settings = withThree();
    expect(settings.poolPresets.map((preset) => preset.name)).toStrictEqual([
      'the quiet approach',
      'the loud approach',
      'the last resort',
    ]);
    expect(settings.poolPresets.length, 'three pools were saved').toBe(THREE_POOLS.length);
    expect(DEFAULT_SETTINGS.poolPresets.length, 'the defaults are unchanged').toBe(0);
  });

  it('recalls a pool the rules core accepts, and answers null for a name it never held', () => {
    const settings = withThree();
    const recalled = recallPoolPreset(settings, 'the loud approach');
    expect(recalled, 'the pool came back').not.toBeNull();

    // The proof is a roll, not a comparison of records. Four attribute dice,
    // one gear die and one artifact die is six dice.
    const outcome = firstRoll(poolBuilder(recalled ?? {}), seededRandom(21));
    expect(outcome.kind, 'the rules core rolled the recalled pool').toBe('rolled');
    if (outcome.kind !== 'rolled') {
      return;
    }
    expect(outcome.dice.length, 'the recalled pool is the pool that was saved').toBe(6);
    expect(
      outcome.dice.filter((die) => die.type === 'artifact')[0]?.faces,
      'the artifact die kept its size',
    ).toBe(10);
    let rolled = 0;
    for (const die of outcome.dice) {
      expect(die.values.length, `${die.id} threw one generation`).toBe(1);
      rolled += 1;
    }
    expect(rolled, 'every die of the recalled pool was thrown').toBe(outcome.dice.length);

    expect(recallPoolPreset(settings, 'a name nobody saved')).toBeNull();
  });

  it('reorders, over three presets, where a move is observable', () => {
    const settings = withThree();
    const front = saved(movePoolPreset(settings, 'the last resort', 0), 'the move to the front');
    expect(front.poolPresets.map((preset) => preset.name)).toStrictEqual([
      'the last resort',
      'the quiet approach',
      'the loud approach',
    ]);
    const middle = saved(movePoolPreset(front, 'the last resort', 1), 'the move to the middle');
    expect(middle.poolPresets.map((preset) => preset.name)).toStrictEqual([
      'the quiet approach',
      'the last resort',
      'the loud approach',
    ]);
    const end = saved(movePoolPreset(middle, 'the quiet approach', 99), 'the move past the end');
    expect(
      end.poolPresets.map((preset) => preset.name),
      'an index past the end clamps',
    ).toStrictEqual(['the last resort', 'the loud approach', 'the quiet approach']);
    expect(end.poolPresets.length, 'a reorder loses no preset').toBe(THREE_POOLS.length);
    expect(settings.poolPresets.map((preset) => preset.name)[0], 'the input is unchanged').toBe(
      'the quiet approach',
    );
    expect(movePoolPreset(settings, 'a name nobody saved', 0)).toStrictEqual({
      kind: 'refused',
      reason: 'noSuchPreset',
    });
  });

  it('deletes one preset and leaves the others where they were', () => {
    const settings = withThree();
    const left = saved(deletePoolPreset(settings, 'the loud approach'), 'the delete');
    expect(left.poolPresets.map((preset) => preset.name)).toStrictEqual([
      'the quiet approach',
      'the last resort',
    ]);
    expect(recallPoolPreset(left, 'the loud approach'), 'the deleted pool is gone').toBeNull();
    expect(deletePoolPreset(left, 'the loud approach'), 'a second delete is refused').toStrictEqual(
      {
        kind: 'refused',
        reason: 'noSuchPreset',
      },
    );
  });

  it('replaces the pool under a name the record already holds, where it stands', () => {
    const settings = withThree();
    const again = saved(
      savePoolPreset(settings, 'the quiet approach', { attribute: 1 }),
      'the second save',
    );
    expect(again.poolPresets.length, 'no second row under the same name').toBe(THREE_POOLS.length);
    expect(again.poolPresets[0]?.name, 'the preset stayed where it was').toBe('the quiet approach');
    expect(recallPoolPreset(again, 'the quiet approach')).toStrictEqual({ attribute: 1 });
  });

  it('refuses a preset over the cap on the number of presets', () => {
    let settings: Settings = DEFAULT_SETTINGS;
    let stored = 0;
    for (let index = 0; index < PRESET_LIMIT; index += 1) {
      settings = saved(
        savePoolPreset(settings, `pool ${index}`, { attribute: 2 }),
        `pool ${index}`,
      );
      stored += 1;
    }
    expect(stored, 'the cap was reached one save at a time').toBe(PRESET_LIMIT);
    expect(settings.poolPresets.length, 'the record holds the cap').toBe(PRESET_LIMIT);
    expect(savePoolPreset(settings, 'one too many', { attribute: 2 })).toStrictEqual({
      kind: 'refused',
      reason: 'atPresetLimit',
    });
    // A replacement adds no row, so the cap does not block it.
    expect(
      savePoolPreset(settings, 'pool 0', { attribute: 3 }).kind,
      'a replacement is let through',
    ).toBe('saved');
  });

  it('refuses a name over the cap on the name length, and an empty name', () => {
    const settings = DEFAULT_SETTINGS;
    const longest = 'n'.repeat(NAME_LIMIT);
    expect(savePoolPreset(settings, longest, { attribute: 2 }).kind, 'the cap itself fits').toBe(
      'saved',
    );
    expect(savePoolPreset(settings, `${longest}n`, { attribute: 2 })).toStrictEqual({
      kind: 'refused',
      reason: 'nameTooLong',
    });
    // Counted in code points. Sixty emoji fit and sixty-one do not, so a name
    // is not measured in code units.
    expect(savePoolPreset(settings, '🎲'.repeat(NAME_LIMIT), { attribute: 2 }).kind).toBe('saved');
    expect(savePoolPreset(settings, '🎲'.repeat(NAME_LIMIT + 1), { attribute: 2 })).toStrictEqual({
      kind: 'refused',
      reason: 'nameTooLong',
    });
    expect(savePoolPreset(settings, '', { attribute: 2 })).toStrictEqual({
      kind: 'refused',
      reason: 'emptyName',
    });
  });

  it('round trips a hostile name through the store, byte for byte', () => {
    const store = fakeStore();
    const settings = saved(
      savePoolPreset(DEFAULT_SETTINGS, HOSTILE_NAME, { attribute: 2, gear: 1 }),
      'the hostile name',
    );
    expect(writeSettings(store, settings), 'the write was accepted').toBe(true);

    const read = readSettings(store);
    const name = read.poolPresets[0]?.name;
    expect(name, 'the name came back').toBe(HOSTILE_NAME);

    // Byte for byte, in UTF-8, so a lost surrogate half or a changed entity
    // cannot pass as equal text.
    const encoder = new TextEncoder();
    const before = encoder.encode(HOSTILE_NAME);
    const after = encoder.encode(name ?? '');
    expect(after.length, 'the same number of bytes came back').toBe(before.length);
    let compared = 0;
    for (const [index, byte] of before.entries()) {
      expect(after[index], `byte ${index} of the name changed`).toBe(byte);
      compared += 1;
    }
    expect(compared, 'every byte of the name was compared').toBe(before.length);
    expect(before.length, 'the name carries markup, quotes and an emoji').toBeGreaterThan(40);

    // Nothing was escaped, stripped or executed. The storage half keeps the
    // string. The interface must render it through `textContent`.
    expect(name, 'the markup is still there, unchanged').toContain('<img src=x');
    expect(name, 'the emoji survived').toContain('🎲');
    expect(
      recallPoolPreset(read, HOSTILE_NAME),
      'the pool is still recallable by that name',
    ).toStrictEqual({ attribute: 2, gear: 1 });
  });
});
