// The override panel's model — Unit 4.2.
//
// Pure. No browser API is named here and no module-level value changes, so the
// whole model runs under a plain test runner. `src/app.tsx` draws what this
// file describes and decides nothing of its own.
//
// **The panel is generated from the profile record.** Nothing here lists the
// fields of a push profile. The walk below reads the record the rules core
// holds, and every leaf of that record becomes one row of the panel, so a field
// added to `PushProfile` later appears on the screen with no edit to this file.
// `src/settings/profile-fields.test.ts` counts the rows against a second walk
// of the record, so a field the panel stops drawing turns that check red.
//
// **An override is a change on top of the chosen preset**, never a copy of one.
// `mergeProfile` in the rules core applies it, and this file only says which
// leaf changed. A leaf put back to the preset's own value leaves the override
// altogether, so an override always names a real difference.
//
// Two rules decide what a leaf may hold, and both come from the record:
//   1. The editor follows the run-time type of the value the preset holds.
//   2. A text value belongs to a domain or it is not editable at all. The
//      identifier, the name and the description of a profile are its identity,
//      they belong to no domain, and they are therefore read-only by rule
//      rather than by a list of exceptions.

import type { PushProfile, PushProfileOverride } from '../rules/push-profile';
import {
  mergeProfile,
  PUSH_BLOCKERS,
  PUSH_COST_SOURCES,
  PUSH_COST_UNITS,
  PUSH_PROFILES,
  STRESS_BEHAVIOURS,
} from '../rules/push-profile';

/** What kind of control one leaf takes. `text` takes none: it is read-only. */
export type FieldKind = 'toggle' | 'number' | 'choice' | 'set' | 'text';

/** What one leaf of the record holds. */
export type FieldValue = boolean | number | string | readonly string[];

/** One value a choice or a set may take, with the words the player reads. */
export interface FieldOption {
  readonly value: string;
  readonly label: string;
}

/** One row of the panel. */
export interface ProfileField {
  /** The place in the record, as `['cost', 'unit']`. */
  readonly path: readonly string[];
  /** The `data-el` name, derived from the path. */
  readonly id: string;
  readonly label: string;
  readonly kind: FieldKind;
  readonly value: FieldValue;
  /** The values a choice or a set may take. Empty for every other kind. */
  readonly options: readonly FieldOption[];
  /** True while this leaf differs from the preset the override sits on. */
  readonly changed: boolean;
}

/**
 * Every domain a text value may belong to, taken from the rules core.
 *
 * The lists are the core's own, built from total records there, so a member
 * added to a union reaches this panel without an edit here. The domains must
 * not overlap, because a value names its own domain — the test asserts that by
 * counting the members against the size of their union.
 */
export const FIELD_DOMAINS: readonly (readonly string[])[] = [
  PUSH_COST_SOURCES,
  PUSH_COST_UNITS,
  STRESS_BEHAVIOURS,
  PUSH_BLOCKERS,
];

/** The domain that holds a value, or null where no domain does. */
export function domainOf(value: string): readonly string[] | null {
  return FIELD_DOMAINS.find((domain) => domain.includes(value)) ?? null;
}

/** One leaf of a record. An array is one leaf, because its order is data. */
interface Leaf {
  readonly path: readonly string[];
  readonly value: unknown;
}

/**
 * Every leaf of a record, in the order the record declares its keys.
 *
 * The rule matches the one `src/log/entry.test.ts` counts the profile hash
 * with: an array is a leaf, and every other object is walked into.
 */
export function leavesOf(value: unknown, prefix: readonly string[] = []): readonly Leaf[] {
  if (Array.isArray(value) || value === null || typeof value !== 'object') {
    return [{ path: [...prefix], value }];
  }
  const record = value as Record<string, unknown>;
  return Object.keys(record).flatMap((key) => leavesOf(record[key], [...prefix, key]));
}

/** The value at one path, or undefined where the record does not reach it. */
function at(record: unknown, path: readonly string[]): unknown {
  let held: unknown = record;
  for (const step of path) {
    if (held === null || typeof held !== 'object') return undefined;
    held = (held as Record<string, unknown>)[step];
  }
  return held;
}

/**
 * The domain an array leaf draws its members from.
 *
 * An array that holds a member names its own domain. An empty array holds
 * nothing to read, so the same leaf is read across the shipped presets, which
 * is a second reading off data rather than a list of field names. A leaf no
 * preset ever fills has no domain, and the panel then shows it read-only rather
 * than drawing a control with nothing in it.
 */
function domainForList(
  path: readonly string[],
  members: readonly unknown[],
): readonly string[] | null {
  const seen = [
    ...members,
    ...PUSH_PROFILES.flatMap((profile) => {
      const held = at(profile, path);
      return Array.isArray(held) ? (held as unknown[]) : [];
    }),
  ];
  for (const member of seen) {
    if (typeof member === 'string') {
      const domain = domainOf(member);
      if (domain !== null) return domain;
    }
  }
  return null;
}

/** The kind of control one value takes, and the domain behind it. */
function editorFor(
  path: readonly string[],
  value: unknown,
): { readonly kind: FieldKind; readonly domain: readonly string[] } {
  if (typeof value === 'boolean') return { kind: 'toggle', domain: [] };
  if (typeof value === 'number') return { kind: 'number', domain: [] };
  if (typeof value === 'string') {
    const domain = domainOf(value);
    return domain === null ? { kind: 'text', domain: [] } : { kind: 'choice', domain };
  }
  if (Array.isArray(value)) {
    const domain = domainForList(path, value as unknown[]);
    return domain === null ? { kind: 'text', domain: [] } : { kind: 'set', domain };
  }
  return { kind: 'text', domain: [] };
}

/** `perUnit` becomes `per unit`, and `blockers` stays as it is. */
function spaced(word: string): string {
  return word.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
}

/** `perUnit` becomes `per-unit`, for a `data-el` name. */
function kebab(word: string): string {
  return word.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * The words one field is called by.
 *
 * A path this table does not name still gets a label, taken from the path
 * itself, so a field added to the record is drawn and named without an edit.
 * The table exists to say the same thing in the vocabulary the screen already
 * uses: success, bane, push, cost and stress.
 */
const FIELD_WORDS: Readonly<Record<string, string>> = {
  lockSuccesses: 'keep every success',
  lockOnesBy: 'keep banes',
  maxPushes: 'push limit',
  cost: 'cost',
  source: 'counted from',
  unit: 'measured in',
  perUnit: 'amount per unit',
  stressBehaviour: 'stress',
  blockers: 'no push while',
  id: 'identifier',
  label: 'name',
  description: 'what it does',
};

/** The words one value of a domain is called by, for the same reason. */
const OPTION_WORDS: Readonly<Record<string, string>> = {
  bane: 'each bane still showing',
  push: 'the push itself',
  ratingPoint: 'a rating point',
  healthPoint: 'a point of health',
  refereePoint: 'a referee point',
  complicationCheck: 'a complication check',
  none: 'no die is added',
  addBeforeReroll: 'a stress die joins the push',
  stressOneShowing: 'a stress die shows a bane',
};

function labelFor(path: readonly string[]): string {
  const own = path[path.length - 1] ?? '';
  const parent = path.length > 1 ? (path[path.length - 2] ?? '') : '';
  const words = FIELD_WORDS[own] ?? spaced(own);
  if (parent === '') return words;
  return `${FIELD_WORDS[parent] ?? spaced(parent)}: ${words}`;
}

function optionsFor(domain: readonly string[]): readonly FieldOption[] {
  return domain.map((value) => ({ value, label: OPTION_WORDS[value] ?? spaced(value) }));
}

/** Two leaf values, compared. An array is compared by its members in order. */
function sameValue(left: unknown, right: unknown): boolean {
  if (Array.isArray(left) || Array.isArray(right)) {
    return JSON.stringify(left) === JSON.stringify(right);
  }
  return left === right;
}

/**
 * The panel, one row per leaf of the record.
 *
 * `base` is the preset the player chose and `override` is the change on top of
 * it. Every row reads the merged value, so the panel shows the rules in force
 * and never a half of them.
 */
export function profileFields(
  base: PushProfile,
  override: PushProfileOverride = {},
): readonly ProfileField[] {
  const merged = mergeProfile(base, override);
  return leavesOf(merged).map(({ path, value }) => {
    const { kind, domain } = editorFor(path, value);
    return {
      path,
      id: `override-${path.map(kebab).join('-')}`,
      label: labelFor(path),
      kind,
      value: value as FieldValue,
      options: kind === 'choice' || kind === 'set' ? optionsFor(domain) : [],
      changed: !sameValue(value, at(base, path)),
    };
  });
}

/** Put one value into a record at a path, as a new record at every level. */
function put(record: Record<string, unknown>, path: readonly string[], value: unknown): void {
  const last = path[path.length - 1] ?? '';
  let held = record;
  for (const step of path.slice(0, -1)) {
    const next = held[step];
    const branch = next !== null && typeof next === 'object' ? { ...(next as object) } : {};
    held[step] = branch;
    held = branch as Record<string, unknown>;
  }
  held[last] = value;
}

/**
 * The override, holding only the leaves that really differ from the preset.
 *
 * It drops a leaf the player put back, so an override always names a real
 * difference, and it drops every leaf the panel cannot edit, so the identity of
 * a profile cannot be overridden through any route. That rule lives here alone
 * and both the panel and the store read it.
 */
export function normaliseOverride(
  base: PushProfile,
  override: PushProfileOverride,
): PushProfileOverride {
  const merged = mergeProfile(base, override);
  const kept: Record<string, unknown> = {};
  for (const { path, value } of leavesOf(base)) {
    const held = at(merged, path);
    if (editorFor(path, value).kind === 'text') continue;
    if (sameValue(held, value)) continue;
    put(kept, path, Array.isArray(held) ? [...(held as unknown[])] : held);
  }
  // The record is built leaf by leaf, so the shape is proved by the walk above
  // and not by the type. Every leaf came from a path of the base record.
  return kept as PushProfileOverride;
}

/** True while the profile in force is the preset, unchanged. */
export function isUnchanged(base: PushProfile, override: PushProfileOverride): boolean {
  return Object.keys(normaliseOverride(base, override)).length === 0;
}

/**
 * The override after one control moved. A value equal to the preset's own
 * leaves the override, which is what makes the reset control and the per-row
 * mark agree with each other.
 */
export function withFieldValue(
  base: PushProfile,
  override: PushProfileOverride,
  path: readonly string[],
  value: FieldValue,
): PushProfileOverride {
  const next: Record<string, unknown> = JSON.parse(JSON.stringify(override)) as Record<
    string,
    unknown
  >;
  put(next, path, value);
  return normaliseOverride(base, next as PushProfileOverride);
}

/** The override with nothing in it. The player is back on the preset. */
export const NO_OVERRIDE: PushProfileOverride = Object.freeze({});

/**
 * A stored override, read as untrusted text.
 *
 * Storage holds user-editable text on every platform, so every leaf is read
 * through the same rule the panel draws it by: the run-time type of the
 * preset's own value decides what is allowed, and a text leaf is refused
 * outright. Nothing throws, and an unusable leaf is dropped rather than
 * defaulting the whole record, because the leaves are independent.
 */
export function sanitiseOverride(base: PushProfile, stored: unknown): PushProfileOverride {
  if (stored === null || typeof stored !== 'object' || Array.isArray(stored)) {
    return NO_OVERRIDE;
  }
  const kept: Record<string, unknown> = {};
  for (const { path, value } of leavesOf(base)) {
    const { kind, domain } = editorFor(path, value);
    const held = at(stored, path);
    if (held === undefined) continue;
    if (kind === 'toggle' && typeof held === 'boolean') {
      put(kept, path, held);
    } else if (
      kind === 'number' &&
      typeof held === 'number' &&
      Number.isInteger(held) &&
      held >= 0 &&
      held <= Number.MAX_SAFE_INTEGER
    ) {
      put(kept, path, held);
    } else if (kind === 'choice' && typeof held === 'string' && domain.includes(held)) {
      put(kept, path, held);
    } else if (kind === 'set' && Array.isArray(held)) {
      // The domain's own order, so a stored list cannot re-order the record and
      // a member held twice is held once.
      put(
        kept,
        path,
        domain.filter((member) => (held as unknown[]).includes(member)),
      );
    }
  }
  return normaliseOverride(base, kept as PushProfileOverride);
}
