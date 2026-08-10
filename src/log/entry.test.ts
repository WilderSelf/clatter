// The log entry and the profile hash.
//
// specs/0001-rules-model.md gives the reason the hash exists: without it "a
// later profile edit silently rewrites campaign history, and an export/
// re-import equality check still passes because both sides re-derive the same
// wrong way". The last test in this file is that defect, held still.

import { describe, expect, it } from 'vitest';
import { buildPool, poolBuilder } from '../rules/pool';
import { push } from '../rules/push';
import type { PushProfile } from '../rules/push-profile';
import { mergeProfile, PUSH_PROFILES } from '../rules/push-profile';
import { roll, successCount } from '../rules/roll';
import { seededRandom } from '../rules/seeded-random';
import { createLogEntry, profileHash } from './entry';

function preset(id: string): PushProfile {
  const found = PUSH_PROFILES.find((each) => each.id === id);
  if (found === undefined) {
    throw new Error(`no preset ${id}`);
  }
  return found;
}

/**
 * Every leaf of the record. An array counts as one leaf, because its order is
 * data and a member of it is not a field of the profile.
 */
function leafPaths(value: unknown, prefix: readonly string[] = []): string[][] {
  if (Array.isArray(value)) {
    return [[...prefix]];
  }
  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return Object.keys(record).flatMap((key) => leafPaths(record[key], [...prefix, key]));
  }
  return [[...prefix]];
}

/** A copy of the profile with one leaf changed, whatever type that leaf holds. */
function changeLeaf(profile: PushProfile, path: readonly string[]): PushProfile {
  const copy = JSON.parse(JSON.stringify(profile)) as Record<string, unknown>;
  let holder = copy;
  for (const step of path.slice(0, -1)) {
    holder = holder[step] as Record<string, unknown>;
  }
  const last = path.at(-1) ?? '';
  const current = holder[last];
  if (typeof current === 'boolean') {
    holder[last] = !current;
  } else if (typeof current === 'number') {
    holder[last] = current + 1;
  } else if (Array.isArray(current)) {
    holder[last] = current.length === 0 ? ['stressOneShowing'] : [];
  } else {
    holder[last] = `${String(current)} changed`;
  }
  return copy as unknown as PushProfile;
}

/** The same record with every key order reversed, at every level. */
function reversedKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(reversedKeys);
  }
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).reverse();
    return Object.fromEntries(entries.map(([key, held]) => [key, reversedKeys(held)]));
  }
  return value;
}

describe('the profile hash', () => {
  it('gives one answer to the same profile, whatever order the keys came in', () => {
    let compared = 0;
    for (const profile of PUSH_PROFILES) {
      const shuffled = reversedKeys(profile) as PushProfile;
      expect(Object.keys(shuffled)[0], 'the clone really did move the keys').not.toBe(
        Object.keys(profile)[0],
      );
      expect(profileHash(shuffled), `preset ${profile.id} hashed differently by key order`).toBe(
        profileHash(profile),
      );
      compared += 1;
    }
    expect(compared, 'every shipped preset was compared').toBe(PUSH_PROFILES.length);
  });

  it('holds the same digest across runs', () => {
    // A pinned digest. It moves when a preset moves, which is the point of the
    // hash. It must never move because the serialisation drifted.
    expect(profileHash(preset('pool-referee-gains-a-point'))).toBe(
      '36f6bccb6a28423228b35d40196d719f7d2fb6215e4dff21a70ba0ac95fd202b',
    );
  });

  it('changes when any one field of the profile changes', () => {
    const profile = preset('pool-banes-damage-ratings');
    const paths = leafPaths(profile);
    // The denominator comes from the profile's own key list, so a field added
    // later raises it and this line goes red rather than staying unhashed.
    expect(Object.keys(profile).length, 'top-level fields of a push profile').toBe(9);
    expect(paths.length, 'leaf fields of a push profile').toBe(16);

    const base = profileHash(profile);
    const digests = new Set<string>();
    let changed = 0;
    for (const path of paths) {
      const digest = profileHash(changeLeaf(profile, path));
      expect(digest, `the hash ignored the field ${path.join('.')}`).not.toBe(base);
      digests.add(digest);
      changed += 1;
    }
    expect(changed, 'every leaf field was changed once').toBe(paths.length);
    expect(digests.size, 'no two changed fields gave the same digest').toBe(paths.length);
  });
});

describe('a log entry', () => {
  it('stores the derived values and the hash of the profile that made them', () => {
    const profile = preset('pool-stress-and-complications');
    const random = seededRandom(4242);
    const pool = buildPool(poolBuilder({ attribute: 2, skill: 1, gear: 1, artifact: [8] }));
    const first = roll({ dice: pool, stressBefore: 1 }, random);
    const pushed = push(first, profile, random);
    expect(pushed.kind, 'the fixture push went through').toBe('pushed');
    if (pushed.kind !== 'pushed') {
      return;
    }
    const entry = createLogEntry({
      rollId: 'r-1',
      timestampIso: '2026-08-09T09:00:00.000Z',
      mode: 'pool',
      result: pushed,
      profile,
      stressBefore: 1,
      note: 'a note',
    });

    expect(entry.ruleset).toBe(profile.id);
    expect(entry.profileHash).toBe(profileHash(profile));
    expect(entry.pushCount).toBe(1);
    expect(entry.stressBefore).toBe(1);
    expect(entry.stressAfter).toBe(pushed.stressAfter);
    expect(entry.costAmount).toBe(pushed.cost.total);
    expect(entry.costType).toBe(profile.cost.unit);
    // successCount is the core's own derivation over the newest generation. It
    // reaches the same number by a different route.
    expect(entry.successes).toBe(successCount(pushed));

    expect(entry.dice.length, 'one column per die, including the added stress die').toBe(
      pushed.dice.length,
    );
    const nulls = entry.dice.flatMap((die) => die.cells).filter((cell) => cell === null).length;
    const late = pushed.dice.filter((die) => die.values[0] === null).length;
    expect(late, 'the profile added one stress die at the second generation').toBe(1);
    expect(nulls, 'a die that did not exist yet holds one null per earlier generation').toBe(late);
    const added = entry.dice.at(-1);
    expect(added?.type).toBe('stress');
    expect(added?.cells[0], 'the added die did not exist at the first generation').toBeNull();
    expect(added?.cells[1], 'the added die took part in the push').not.toBeNull();
  });

  it('reads the artifact curve the settings chose', () => {
    const profile = preset('pool-banes-damage-ratings');
    const random = seededRandom(7);
    const pool = buildPool(poolBuilder({ artifact: [12, 12, 12, 12] }));
    const first = roll({ dice: pool, stressBefore: 0 }, random);
    const input = {
      rollId: 'r-1',
      timestampIso: 't',
      mode: 'pool' as const,
      profile,
      stressBefore: 0,
    };
    const escalating = createLogEntry({ ...input, result: first });
    const flat = createLogEntry({ ...input, result: first, artifactCurve: 'artifactFlat' });
    expect(escalating.successes, 'the escalating curve pays more on a d12').toBeGreaterThan(
      flat.successes,
    );
  });
});

describe('the stored hash outlives an edit of the profile', () => {
  it('still reports the profile the roll was made under', () => {
    const before = preset('pool-banes-damage-ratings');
    const random = seededRandom(11);
    const first = roll({ dice: buildPool(poolBuilder({ attribute: 3 })), stressBefore: 0 }, random);
    const entry = createLogEntry({
      rollId: 'r-1',
      timestampIso: '2026-08-09T09:00:00.000Z',
      mode: 'pool',
      result: first,
      profile: before,
      stressBefore: 0,
    });

    // The user opens the override panel and raises the push limit.
    const after = mergeProfile(before, { maxPushes: 3 });
    expect(after.maxPushes, 'the edit landed').not.toBe(before.maxPushes);

    // A reader that re-derived the hash from the current profile would report
    // the edited profile against a roll made under the old one. The stored
    // value does not move.
    expect(entry.profileHash).toBe(profileHash(before));
    expect(entry.profileHash, 'the entry followed the edit').not.toBe(profileHash(after));
  });
});
