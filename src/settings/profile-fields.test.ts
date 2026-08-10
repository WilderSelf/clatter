// The override panel's model — Unit 4.2.
//
// The claim under test is that the panel is GENERATED from the push-profile
// record. Every check below therefore counts against a walk of that record
// written in this file, never against the walk the module under test uses, and
// never against a list of field names. A field the panel stops describing turns
// these checks red, and a field added to the record raises the denominator.
//
// The walk here follows the same rule `src/log/entry.test.ts` counts the
// profile hash with: an array is one leaf, because its order is data.

import { describe, expect, it } from 'vitest';
import type { PushProfile, PushProfileOverride } from '../rules/push-profile';
import { mergeProfile, PUSH_PROFILES, profileById } from '../rules/push-profile';
import type { FieldValue, ProfileField } from './profile-fields';
import {
  FIELD_DOMAINS,
  NO_OVERRIDE,
  isUnchanged,
  normaliseOverride,
  profileFields,
  sanitiseOverride,
  withFieldValue,
} from './profile-fields';

/** A second walk of the record, written here so the panel cannot count itself. */
function leafPaths(value: unknown, prefix: readonly string[] = []): string[][] {
  if (Array.isArray(value) || value === null || typeof value !== 'object') {
    return [[...prefix]];
  }
  const record = value as Record<string, unknown>;
  return Object.keys(record).flatMap((key) => leafPaths(record[key], [...prefix, key]));
}

function valueAt(record: unknown, path: readonly string[]): unknown {
  let held: unknown = record;
  for (const step of path) {
    if (held === null || typeof held !== 'object') return undefined;
    held = (held as Record<string, unknown>)[step];
  }
  return held;
}

const FIRST = profileById('pool-banes-damage-ratings');

/** A value the field does not hold now, whatever kind it is. */
function otherValue(field: ProfileField): FieldValue {
  if (field.kind === 'toggle') return field.value !== true;
  if (field.kind === 'number') return field.value === 0 ? 1 : 0;
  if (field.kind === 'choice') {
    const other = field.options.find((option) => option.value !== field.value);
    if (other === undefined) throw new Error(`the field ${field.id} offers one value only`);
    return other.value;
  }
  const held = Array.isArray(field.value) ? field.value : [];
  const first = field.options[0];
  if (first === undefined) throw new Error(`the field ${field.id} offers no values`);
  return held.length === 0 ? [first.value] : [];
}

describe('the domains a field draws from', () => {
  it('do not overlap, so a value names one domain and only one', () => {
    const members = FIELD_DOMAINS.flatMap((domain) => [...domain]);
    expect(members.length, 'the domains hold values at all').toBeGreaterThan(0);
    expect(new Set(members).size, 'two domains hold the same value').toBe(members.length);
    let counted = 0;
    for (const domain of FIELD_DOMAINS) {
      expect(domain.length, 'a domain holds no values').toBeGreaterThan(0);
      counted += 1;
    }
    expect(counted, 'every domain was read').toBe(FIELD_DOMAINS.length);
  });
});

describe('the panel', () => {
  it('draws one row for every leaf of the record, over every preset', () => {
    let comparedPresets = 0;
    let comparedLeaves = 0;
    for (const preset of PUSH_PROFILES) {
      const drawn = profileFields(preset);
      const walked = leafPaths(preset).map((path) => path.join('.'));
      // The denominator is the second walk, not the panel's own list.
      expect(walked.length, `${preset.id}: the record holds leaves`).toBeGreaterThan(10);
      expect(
        drawn.map((field) => field.path.join('.')),
        `${preset.id}: the panel and the record name different leaves`,
      ).toStrictEqual(walked);
      expect(
        new Set(drawn.map((field) => field.id)).size,
        `${preset.id}: an id is used twice`,
      ).toBe(drawn.length);
      for (const field of drawn) {
        expect(field.label.length, `${preset.id}: ${field.id} carries no label`).toBeGreaterThan(0);
        expect(
          field.value,
          `${preset.id}: ${field.id} does not show the value the record holds`,
        ).toStrictEqual(valueAt(preset, field.path));
        for (const option of field.options) {
          expect(option.label.length, `${field.id}: an option carries no words`).toBeGreaterThan(0);
        }
        if (field.kind === 'choice' || field.kind === 'set') {
          expect(field.options.length, `${field.id}: the control offers nothing`).toBeGreaterThan(
            0,
          );
        }
        comparedLeaves += 1;
      }
      comparedPresets += 1;
    }
    expect(comparedPresets, 'every shipped preset was drawn').toBe(PUSH_PROFILES.length);
    expect(comparedLeaves, 'every leaf of every preset was read').toBe(
      PUSH_PROFILES.reduce((total, preset) => total + leafPaths(preset).length, 0),
    );
  });

  it('shows the merged value, not the preset value, where an override sits on top', () => {
    const override: PushProfileOverride = { maxPushes: 9 };
    const shown = profileFields(FIRST, override).find(
      (field) => field.path.join('.') === 'maxPushes',
    );
    expect(shown?.value, 'the panel shows what the rules now say').toBe(9);
    expect(shown?.changed, 'and marks the row as changed').toBe(true);
    expect(
      profileFields(FIRST, override).filter((field) => field.changed).length,
      'no other row is marked',
    ).toBe(1);
  });

  it('makes every editable leaf edit that leaf, and nothing else', () => {
    const drawn = profileFields(FIRST);
    const editable = drawn.filter((field) => field.kind !== 'text');
    // Both denominators come from the record: the leaves it holds, and the
    // leaves whose value belongs to a domain or is not text at all.
    const textLeaves = leafPaths(FIRST).filter(
      (path) => typeof valueAt(FIRST, path) === 'string' && !inADomain(valueAt(FIRST, path)),
    );
    expect(editable.length, 'the panel edits nothing').toBeGreaterThan(0);
    expect(editable.length, 'the editable rows are the leaves that are not free text').toBe(
      leafPaths(FIRST).length - textLeaves.length,
    );

    let edited = 0;
    for (const field of editable) {
      const wanted = otherValue(field);
      const override = withFieldValue(FIRST, NO_OVERRIDE, field.path, wanted);
      const merged = mergeProfile(FIRST, override);
      expect(
        valueAt(merged, field.path),
        `${field.id}: the change did not reach the profile`,
      ).toStrictEqual(wanted);
      // Every other leaf still reads the preset, so one control moves one leaf.
      for (const path of leafPaths(FIRST)) {
        if (path.join('.') === field.path.join('.')) continue;
        expect(
          valueAt(merged, path),
          `${field.id}: the change also moved ${path.join('.')}`,
        ).toStrictEqual(valueAt(FIRST, path));
      }
      edited += 1;
    }
    expect(edited, 'every editable leaf was edited once').toBe(editable.length);
  });

  it('drops a leaf the player puts back, so the panel and the reset agree', () => {
    const field = profileFields(FIRST).find((each) => each.path.join('.') === 'lockSuccesses');
    if (field === undefined) throw new Error('the record no longer holds lockSuccesses');
    const changed = withFieldValue(FIRST, NO_OVERRIDE, field.path, false);
    expect(isUnchanged(FIRST, changed), 'a real change reads as a change').toBe(false);
    const back = withFieldValue(FIRST, changed, field.path, true);
    expect(back, 'the leaf left the override').toStrictEqual({});
    expect(isUnchanged(FIRST, back), 'the preset is in force again').toBe(true);
  });

  it('returns to the unmodified preset from every leaf changed at once', () => {
    let override: PushProfileOverride = NO_OVERRIDE;
    let changed = 0;
    for (const field of profileFields(FIRST)) {
      if (field.kind === 'text') continue;
      override = withFieldValue(FIRST, override, field.path, otherValue(field));
      changed += 1;
    }
    expect(changed, 'the record was changed at every editable leaf').toBeGreaterThan(0);
    expect(
      JSON.stringify(mergeProfile(FIRST, override)),
      'the profile in force still equals the preset',
    ).not.toBe(JSON.stringify(FIRST));
    expect(
      JSON.stringify(mergeProfile(FIRST, NO_OVERRIDE)),
      'the reset did not return the preset',
    ).toBe(JSON.stringify(FIRST));
    expect(isUnchanged(FIRST, NO_OVERRIDE), 'the reset reads as unchanged').toBe(true);
  });

  it('refuses to override the identity of a profile, by every route', () => {
    let refused = 0;
    for (const field of profileFields(FIRST)) {
      if (field.kind !== 'text') continue;
      const byControl = withFieldValue(FIRST, NO_OVERRIDE, field.path, 'a name of my own');
      expect(byControl, `${field.id}: a control changed the identity`).toStrictEqual({});
      const byStore = sanitiseOverride(FIRST, buildAt(field.path, 'a name of my own'));
      expect(byStore, `${field.id}: a stored record changed the identity`).toStrictEqual({});
      refused += 1;
    }
    // The three identity leaves are the free-text ones, counted off the record.
    expect(refused, 'the identity leaves were all refused').toBe(
      leafPaths(FIRST).filter(
        (path) => typeof valueAt(FIRST, path) === 'string' && !inADomain(valueAt(FIRST, path)),
      ).length,
    );
    expect(refused, 'the record holds identity leaves at all').toBeGreaterThan(0);
  });
});

/** True while a value belongs to one of the domains the core publishes. */
function inADomain(value: unknown): boolean {
  return FIELD_DOMAINS.some((domain) => domain.includes(value as string));
}

/** A record holding one value at one path, for the stored-override checks. */
function buildAt(path: readonly string[], value: unknown): Record<string, unknown> {
  const record: Record<string, unknown> = {};
  let held = record;
  for (const step of path.slice(0, -1)) {
    const branch: Record<string, unknown> = {};
    held[step] = branch;
    held = branch;
  }
  held[path[path.length - 1] ?? ''] = value;
  return record;
}

describe('a stored override', () => {
  it('takes a value of the right kind and refuses one of the wrong kind, leaf by leaf', () => {
    let read = 0;
    for (const field of profileFields(FIRST)) {
      if (field.kind === 'text') continue;
      const wanted = otherValue(field);
      const good = sanitiseOverride(FIRST, buildAt(field.path, wanted));
      expect(
        valueAt(mergeProfile(FIRST, good), field.path),
        `${field.id}: a usable stored value was dropped`,
      ).toStrictEqual(wanted);
      // A record is never a usable value for any leaf of a push profile.
      const bad = sanitiseOverride(FIRST, buildAt(field.path, { wrong: 'kind' }));
      expect(bad, `${field.id}: an unusable stored value was kept`).toStrictEqual({});
      read += 1;
    }
    expect(read, 'every editable leaf was read out of storage').toBeGreaterThan(0);
  });

  it('keeps the domain order of a set, so a stored list cannot re-order the record', () => {
    const blockers = profileFields(FIRST).find((field) => field.kind === 'set');
    if (blockers === undefined) throw new Error('the record holds no set field');
    const every = blockers.options.map((option) => option.value);
    const stored = sanitiseOverride(FIRST, buildAt(blockers.path, [...every].reverse()));
    expect(
      valueAt(mergeProfile(FIRST, stored), blockers.path),
      'the stored order reached the record',
    ).toStrictEqual(every);
  });

  it('reads as no override at all from a value that is not a record', () => {
    let read = 0;
    for (const stored of [null, undefined, 'maxPushes=2', 7, ['maxPushes', 2], true]) {
      expect(sanitiseOverride(FIRST, stored), `a stored ${typeof stored} was read`).toStrictEqual(
        {},
      );
      read += 1;
    }
    expect(read, 'six unusable stored values were read').toBe(6);
  });
});

describe('an override built against one preset', () => {
  it('drops the leaves the next preset already holds when the player changes preset', () => {
    const second = profileById('pool-referee-gains-a-point');
    // The first preset locks banes on attribute dice and the second does not,
    // so the same override is a real change on one and no change on the other.
    const override = withFieldValue(second, NO_OVERRIDE, ['lockOnesBy', 'attribute'], true);
    expect(isUnchanged(second, override), 'the change is real on the preset it was made on').toBe(
      false,
    );
    const carried: PushProfile = mergeProfile(FIRST, normaliseOverride(FIRST, override));
    expect(JSON.stringify(carried), 'it stopped being a change on the other preset').toBe(
      JSON.stringify(FIRST),
    );
  });
});
