// The settings record, its migration, and its store. Pure: no browser API is
// named here, no module-level mutable state, no random source. The store is an
// argument, and `localStorage` satisfies it, so this file stays testable under
// a plain test runner. Unit 4.1 built the migration. Unit 3.7 added the
// permanent fall to flat dice, because the flag has to survive a restart and a
// second store would have split the record in two. Unit 3.6 added the two sound
// fields for the same reason.
//
// `migrate` takes whatever came out of storage and returns a record the
// application can use. Storage holds user-editable text on every platform, so
// nothing read from it is trusted: the input is `unknown` and every field is
// read through a validator.
//
// Two rules keep this readable when a fifth version arrives:
//   1. A stored version below the current one runs its step in `MIGRATIONS`.
//   2. Anything else — a future version, a missing version, a value that is
//      not a record — reads as the defaults. It never throws.

import type { ArtifactFaces, Mode, PoolCounts } from '../rules/pool';
import { PUSH_PROFILES } from '../rules/push-profile';
import type { CurveId } from '../rules/success';
import type { ThemeId } from '../theme/themes';
import { THEME_IDS } from '../theme/themes';

/** The two curves an artifact die takes. The other curves belong to other types. */
export type ArtifactCurveId = Extract<CurveId, 'artifactEscalating' | 'artifactFlat'>;

/**
 * The version of the record this build writes. Version 1 is the same record
 * without `artifactCurve`. Version 2 is the same record without
 * `flatFallback`. Version 3 is the same record without the two sound fields.
 * Version 4 is the same record without the three theme axes. Version 5 is the
 * same record without the saved pool presets.
 * No record below the current version ever reached a user, because nothing has
 * shipped — they exist so the migration chain has steps to run and steps to
 * prove.
 */
export const SETTINGS_VERSION = 6;

/**
 * One saved pool, under a name the player wrote.
 *
 * The preset holds `PoolCounts`, which is what `poolBuilder` takes, so a
 * recalled preset goes straight back into the rules core. Step mode is not
 * saved: its pool is one index on the ladder plus the extras, and Unit 4.3 asks
 * for a named pool.
 *
 * **The name is user-editable text.** Storage keeps it exactly as the player
 * typed it, markup and all, and nothing here escapes it or strips it. Every
 * reader must therefore treat it as untrusted, and the interface must put it on
 * the screen through `textContent`. Constraint 8 exists for these strings.
 */
export interface PoolPreset {
  readonly name: string;
  readonly counts: PoolCounts;
}

/** How many presets one player may keep. */
export const MAX_POOL_PRESETS = 20;

/**
 * How long a preset name may be, counted in code points, so an emoji counts as
 * the one character the player sees rather than as its two code units.
 */
export const MAX_PRESET_NAME_CHARS = 60;

/** The most dice of one type a stored preset may name. */
export const MAX_DICE_PER_TYPE = 24;

export interface Settings {
  readonly version: typeof SETTINGS_VERSION;
  readonly mode: Mode;
  /** The id of a shipping push profile. A retired id reads as the default. */
  readonly presetId: string;
  readonly artifactCurve: ArtifactCurveId;
  /**
   * The permanent fall to flat dice.
   *
   * The capability probe sets it when the platform is below the bar, and a
   * lost WebGL context sets it too. The fall is permanent: nothing clears it
   * except the settings toggle Phase 4 builds. A fall that healed by itself
   * would put a player back on a black canvas on the next throw.
   */
  readonly flatFallback: boolean;
  /**
   * Whether the tray makes a sound. Off, until the player asks for it.
   *
   * A browser refuses to play audio the player did not ask for, and a dice
   * roller that made a noise on the first throw would be turned off rather than
   * turned down. `src/tray/sound.ts` builds no `AudioContext` at all while this
   * is false.
   */
  readonly soundEnabled: boolean;
  /** How loud, from 0 to 1. Zero is silent and is not the same as off. */
  readonly soundVolume: number;
  /**
   * The three theme axes. They are independent and a player mixes them freely,
   * so they are three fields and not one. A retired id reads as the default,
   * the same way a retired push profile does. `src/theme/themes.ts` holds the
   * rows.
   */
  readonly diceThemeId: ThemeId;
  readonly traySurfaceId: ThemeId;
  readonly interfacePaletteId: ThemeId;
  /**
   * The saved pools, in the order the player put them in. The order is data, so
   * it is a list and not a map. The name is the identity of a preset.
   */
  readonly poolPresets: readonly PoolPreset[];
}

const MODES: readonly Mode[] = ['pool', 'step'];

const ARTIFACT_CURVES: readonly ArtifactCurveId[] = ['artifactEscalating', 'artifactFlat'];

export const DEFAULT_SETTINGS: Settings = Object.freeze({
  version: SETTINGS_VERSION,
  mode: 'pool',
  presetId: 'pool-banes-damage-ratings',
  artifactCurve: 'artifactEscalating',
  flatFallback: false,
  soundEnabled: false,
  soundVolume: 0.5,
  // The neutral row on every axis. `ash` dice are the Unit 3.3 table and the
  // `ash` surface is the one Unit 3.2 shipped, so the defaults change nothing
  // a player already sees.
  diceThemeId: 'ash',
  traySurfaceId: 'ash',
  interfacePaletteId: 'ash',
  poolPresets: Object.freeze([]),
});

type StoredRecord = Readonly<Record<string, unknown>>;

/** An array and `null` are both `object`. Neither is a settings record. */
function isRecord(value: unknown): value is StoredRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

/** A stored volume outside 0 to 1, or one that is not a number, reads as the default. */
function volumeLevel(value: unknown): number {
  return typeof value === 'number' && value >= 0 && value <= 1
    ? value
    : DEFAULT_SETTINGS.soundVolume;
}

/** The length a name is measured at. An emoji is one character, not two. */
function nameLength(name: string): number {
  return [...name].length;
}

/**
 * One key per counted dice type. `Required` makes a seventh type a type error
 * here, so a new type cannot reach storage unvalidated.
 */
const ZERO_COUNTS: Required<Omit<PoolCounts, 'artifact'>> = {
  attribute: 0,
  skill: 0,
  gear: 0,
  bonus: 0,
  stress: 0,
};

/** An artifact die is always a step die, so six faces is unwritable. */
const ARTIFACT_FACES: readonly ArtifactFaces[] = [8, 10, 12];

function diceCount(value: unknown): number | null {
  return typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= MAX_DICE_PER_TYPE
    ? value
    : null;
}

/**
 * A stored pool, or null where it is unusable. One bad field drops the whole
 * preset, because half a pool is not a pool the player named.
 */
function poolCounts(value: unknown): PoolCounts | null {
  if (!isRecord(value)) {
    return null;
  }
  const counts: Record<string, unknown> = {};
  for (const key of Object.keys(ZERO_COUNTS)) {
    if (value[key] === undefined) {
      continue;
    }
    const held = diceCount(value[key]);
    if (held === null) {
      return null;
    }
    counts[key] = held;
  }
  const artifact = value['artifact'];
  if (artifact !== undefined) {
    if (!Array.isArray(artifact) || artifact.length > MAX_DICE_PER_TYPE) {
      return null;
    }
    if (!artifact.every((faces) => ARTIFACT_FACES.includes(faces as ArtifactFaces))) {
      return null;
    }
    counts['artifact'] = [...(artifact as ArtifactFaces[])];
  }
  return counts as PoolCounts;
}

/**
 * The stored presets, in their stored order. An unusable preset is dropped and
 * the list is cut at the cap. The name is kept exactly as it was stored: it is
 * user text, and changing one character of it here would be mangling it.
 */
function poolPresetList(value: unknown): readonly PoolPreset[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const kept: PoolPreset[] = [];
  for (const each of value) {
    if (kept.length >= MAX_POOL_PRESETS) {
      break;
    }
    if (!isRecord(each)) {
      continue;
    }
    const name = each['name'];
    const counts = poolCounts(each['counts']);
    if (typeof name !== 'string' || name.length === 0 || nameLength(name) > MAX_PRESET_NAME_CHARS) {
      continue;
    }
    if (counts === null || kept.some((held) => held.name === name)) {
      continue;
    }
    kept.push({ name, counts });
  }
  return kept;
}

function shippingPreset(value: unknown): string {
  return PUSH_PROFILES.some((profile) => profile.id === value)
    ? (value as string)
    : DEFAULT_SETTINGS.presetId;
}

/**
 * One step per older version, from that version to the next one. A step reads
 * an untrusted record and returns an untrusted record — the field validators
 * below run afterwards either way, so a step only has to raise the version and
 * supply what the new version added.
 */
const MIGRATIONS: Readonly<Record<number, (stored: StoredRecord) => StoredRecord>> = {
  1: (stored) => ({ ...stored, version: 2, artifactCurve: DEFAULT_SETTINGS.artifactCurve }),
  2: (stored) => ({ ...stored, version: 3, flatFallback: DEFAULT_SETTINGS.flatFallback }),
  3: (stored) => ({
    ...stored,
    version: 4,
    soundEnabled: DEFAULT_SETTINGS.soundEnabled,
    soundVolume: DEFAULT_SETTINGS.soundVolume,
  }),
  4: (stored) => ({
    ...stored,
    version: 5,
    diceThemeId: DEFAULT_SETTINGS.diceThemeId,
    traySurfaceId: DEFAULT_SETTINGS.traySurfaceId,
    interfacePaletteId: DEFAULT_SETTINGS.interfacePaletteId,
  }),
  5: (stored) => ({ ...stored, version: 6, poolPresets: [] }),
};

/** Bounds the chain, so a step that forgets to raise the version cannot loop. */
const MAX_STEPS = Object.keys(MIGRATIONS).length;

export function migrate(stored: unknown): Settings {
  if (!isRecord(stored)) {
    return DEFAULT_SETTINGS;
  }
  let record = stored;
  for (let taken = 0; taken < MAX_STEPS; taken += 1) {
    const step = MIGRATIONS[record['version'] as number];
    if (step === undefined) {
      break;
    }
    record = step(record);
  }
  if (record['version'] !== SETTINGS_VERSION) {
    return DEFAULT_SETTINGS;
  }
  return {
    version: SETTINGS_VERSION,
    mode: oneOf(record['mode'], MODES, DEFAULT_SETTINGS.mode),
    presetId: shippingPreset(record['presetId']),
    artifactCurve: oneOf(record['artifactCurve'], ARTIFACT_CURVES, DEFAULT_SETTINGS.artifactCurve),
    flatFallback: record['flatFallback'] === true,
    soundEnabled: record['soundEnabled'] === true,
    soundVolume: volumeLevel(record['soundVolume']),
    diceThemeId: oneOf(record['diceThemeId'], THEME_IDS, DEFAULT_SETTINGS.diceThemeId),
    traySurfaceId: oneOf(record['traySurfaceId'], THEME_IDS, DEFAULT_SETTINGS.traySurfaceId),
    interfacePaletteId: oneOf(
      record['interfacePaletteId'],
      THEME_IDS,
      DEFAULT_SETTINGS.interfacePaletteId,
    ),
    poolPresets: poolPresetList(record['poolPresets']),
  };
}

// ---------------------------------------------------------------------------
// The store
//
// The application holds the settings. This half only reads them out of a store
// and writes them back, and it never throws: a browser in private mode refuses
// to write, and a browser with storage turned off refuses to read.
// ---------------------------------------------------------------------------

/** The part of `Storage` this module uses. `localStorage` satisfies it. */
export interface SettingsStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const SETTINGS_KEY = 'clatter.settings';

/** Read the stored record. Anything unusable reads as the defaults. */
export function readSettings(store: SettingsStore | null | undefined): Settings {
  if (!store) {
    return DEFAULT_SETTINGS;
  }
  let text: string | null;
  try {
    text = store.getItem(SETTINGS_KEY);
  } catch {
    return DEFAULT_SETTINGS;
  }
  if (text === null) {
    return DEFAULT_SETTINGS;
  }
  try {
    return migrate(JSON.parse(text));
  } catch {
    // Not valid JSON. `migrate` handles every other unusable value.
    return DEFAULT_SETTINGS;
  }
}

/** Write the record. Returns false when the browser refused the write. */
export function writeSettings(
  store: SettingsStore | null | undefined,
  settings: Settings,
): boolean {
  if (!store) {
    return false;
  }
  try {
    store.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
}

/**
 * Record the permanent fall to flat dice.
 *
 * It reads the stored record first, so it keeps every other field. It is safe
 * to call twice, because the flag is already true the second time.
 */
export function recordFlatFallback(store: SettingsStore | null | undefined): Settings {
  const fallen: Settings = { ...readSettings(store), flatFallback: true };
  writeSettings(store, fallen);
  return fallen;
}

// ---------------------------------------------------------------------------
// The saved pools
//
// Four operations over the record: name a pool, recall it, reorder and delete.
// Each one takes a record and answers a new record, so the caller writes the
// answer back through `writeSettings` and no second store exists.
//
// The name is the identity of a preset. A save under a name the record already
// holds REPLACES that preset where it stands, because two rows a player cannot
// tell apart is worse than one row that moved.
// ---------------------------------------------------------------------------

/** Why the operation was refused. A refusal is a record, never an exception. */
export type PresetRefusal = 'emptyName' | 'nameTooLong' | 'atPresetLimit' | 'noSuchPreset';

export type PresetOutcome =
  | { readonly kind: 'saved'; readonly settings: Settings }
  | { readonly kind: 'refused'; readonly reason: PresetRefusal };

/** Save a pool under a name, or replace the pool already under that name. */
export function savePoolPreset(
  settings: Settings,
  name: string,
  counts: PoolCounts,
): PresetOutcome {
  if (name.length === 0) {
    return { kind: 'refused', reason: 'emptyName' };
  }
  if (nameLength(name) > MAX_PRESET_NAME_CHARS) {
    return { kind: 'refused', reason: 'nameTooLong' };
  }
  const held = settings.poolPresets.findIndex((preset) => preset.name === name);
  if (held < 0 && settings.poolPresets.length >= MAX_POOL_PRESETS) {
    return { kind: 'refused', reason: 'atPresetLimit' };
  }
  const preset: PoolPreset = { name, counts };
  const poolPresets =
    held < 0
      ? [...settings.poolPresets, preset]
      : settings.poolPresets.map((each, index) => (index === held ? preset : each));
  return { kind: 'saved', settings: { ...settings, poolPresets } };
}

/** The pool saved under a name, ready for `poolBuilder`, or null. */
export function recallPoolPreset(settings: Settings, name: string): PoolCounts | null {
  return settings.poolPresets.find((preset) => preset.name === name)?.counts ?? null;
}

/** Move a preset to a place in the list. An index outside the list is clamped. */
export function movePoolPreset(settings: Settings, name: string, toIndex: number): PresetOutcome {
  const from = settings.poolPresets.findIndex((preset) => preset.name === name);
  if (from < 0) {
    return { kind: 'refused', reason: 'noSuchPreset' };
  }
  const moved = [...settings.poolPresets];
  const [taken] = moved.splice(from, 1);
  if (taken === undefined) {
    return { kind: 'refused', reason: 'noSuchPreset' };
  }
  const to = Math.min(Math.max(0, Math.trunc(toIndex)), moved.length);
  moved.splice(to, 0, taken);
  return { kind: 'saved', settings: { ...settings, poolPresets: moved } };
}

/** Delete the preset under a name. */
export function deletePoolPreset(settings: Settings, name: string): PresetOutcome {
  const poolPresets = settings.poolPresets.filter((preset) => preset.name !== name);
  if (poolPresets.length === settings.poolPresets.length) {
    return { kind: 'refused', reason: 'noSuchPreset' };
  }
  return { kind: 'saved', settings: { ...settings, poolPresets } };
}
