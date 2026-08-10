// CSV export and import.
//
// The round trip is the acceptance criterion of Unit 4.6: export, re-import,
// assert the log is identical including `profile_hash`. An equality check is
// the classic check that cannot fail, so the comparison counts the fields it
// compared and names the field that differs.

import { describe, expect, it } from 'vitest';
import type { Mode } from '../rules/pool';
import { firstRoll, poolBuilder, stepBuilder } from '../rules/pool';
import { push } from '../rules/push';
import type { PushProfile } from '../rules/push-profile';
import { mergeProfile, PUSH_PROFILES } from '../rules/push-profile';
import { seededRandom } from '../rules/seeded-random';
import { createLogEntry, profileHash } from './entry';
import type { LogEntry } from './entry';
import {
  csvParts,
  CSV_COLUMNS,
  exportCsv,
  exportCsvInChunks,
  importCsv,
  MAX_IMPORT_CHARS,
} from './csv';

const MODES: readonly Mode[] = ['pool', 'step'];
const PUSHED: readonly boolean[] = [true, false];

/** Notes that exercise every escape the writer owns. */
const NOTES: readonly string[] = [
  '',
  '=1+1',
  'a note, with a comma',
  'a note with "quotes"',
  'a note\nover two lines',
  '@SUM(A1)',
  "'already quoted",
  '-5 to the pool',
];

function builderFor(mode: Mode) {
  return mode === 'pool'
    ? poolBuilder({ attribute: 2, skill: 1, gear: 1, artifact: [8] })
    : stepBuilder({ attribute: 10, skill: 8 }, [
        { type: 'gear', faces: 6 },
        { type: 'artifact', faces: 10 },
      ]);
}

/** One entry per profile, mode and push choice. Every push is asserted to land. */
function buildLog(): readonly LogEntry[] {
  const entries: LogEntry[] = [];
  let ordinal = 0;
  let pushesMade = 0;
  for (const profile of PUSH_PROFILES) {
    for (const mode of MODES) {
      for (const pushed of PUSHED) {
        const random = seededRandom(1000 + ordinal);
        const outcome = firstRoll(builderFor(mode), random, 2);
        if (outcome.kind !== 'rolled') {
          throw new Error('the fixture pool rolled nothing');
        }
        let result = { dice: outcome.dice, stressAfter: outcome.stressAfter };
        let pushCount = 0;
        if (pushed) {
          const after = push(result, profile, random);
          if (after.kind !== 'pushed') {
            throw new Error(`the fixture push under ${profile.id} was refused: ${after.reason}`);
          }
          result = { dice: after.dice, stressAfter: after.stressAfter };
          pushCount = 1;
          pushesMade += 1;
        }
        entries.push(
          createLogEntry({
            rollId: `roll-${ordinal}`,
            timestampIso: `2026-08-09T09:00:${String(ordinal).padStart(2, '0')}.000Z`,
            mode,
            result,
            profile,
            stressBefore: 2,
            note: NOTES[ordinal % NOTES.length] ?? '',
          }),
        );
        expect(entries.at(-1)?.pushCount, 'the entry recorded the push').toBe(pushCount);
        ordinal += 1;
      }
    }
  }
  expect(pushesMade, 'every push case pushed').toBe(PUSH_PROFILES.length * MODES.length);
  return entries;
}

/** Non-null cells, counted die by die. The writer walks generation by generation. */
function cellCount(entries: readonly LogEntry[]): number {
  return entries
    .flatMap((entry) => entry.dice)
    .flatMap((die) => die.cells)
    .filter((cell) => cell !== null).length;
}

function nullCount(entries: readonly LogEntry[]): number {
  return entries
    .flatMap((entry) => entry.dice)
    .flatMap((die) => die.cells)
    .filter((cell) => cell === null).length;
}

function preset(id: string): PushProfile {
  const found = PUSH_PROFILES.find((each) => each.id === id);
  if (found === undefined) {
    throw new Error(`no preset ${id}`);
  }
  return found;
}

describe('the export schema', () => {
  it('is the twenty columns the plan fixed, in order', () => {
    expect(CSV_COLUMNS.join(',')).toBe(
      'roll_id,timestamp_iso,ruleset,profile_hash,mode,generation,die_index,die_type,die_faces,' +
        'value,locked,die_successes,roll_successes,roll_banes,push_count,cost_type,cost_amount,' +
        'stress_before,stress_after,note',
    );
    expect(CSV_COLUMNS.length).toBe(20);
  });

  it('writes one field per column on every row', () => {
    const parts = csvParts(buildLog());
    let counted = 0;
    for (const part of parts) {
      // A note may hold a comma inside quotes, so count the quoted rows apart.
      if (!part.includes('"')) {
        expect(part.trimEnd().split(',').length, 'fields on one row').toBe(CSV_COLUMNS.length);
        counted += 1;
      }
    }
    expect(counted, 'most rows carry no quoted field').toBeGreaterThan(parts.length / 2);
  });
});

describe('the export', () => {
  it('emits one row per non-null cell and no row for a null', () => {
    const entries = buildLog();
    const parts = csvParts(entries);
    const cells = cellCount(entries);
    expect(nullCount(entries), 'the log holds dice that did not exist at the first roll').toBe(
      PUSH_PROFILES.filter((profile) => profile.stressBehaviour === 'addBeforeReroll').length *
        MODES.length,
    );
    expect(parts.length, 'one header plus one row per non-null cell').toBe(cells + 1);
  });

  it('builds a list of pieces and never one joined string', () => {
    const parts = csvParts(buildLog());
    const whole = parts.join('');
    expect(parts.length, 'the document is in pieces').toBeGreaterThan(100);
    expect(
      Math.max(...parts.map((part) => part.length)),
      'no single piece holds the document',
    ).toBeLessThan(whole.length / 10);
  });

  it('hands the pieces to a Blob unjoined', async () => {
    const entries = buildLog();
    const blob = exportCsv(entries);
    expect(blob.type).toBe('text/csv;charset=utf-8');
    expect(await blob.text()).toBe(csvParts(entries).join(''));
  });

  it('builds the same file in chunks, and hands the thread back once per chunk', async () => {
    const entries = buildLog();
    const rollsPerChunk = 3;
    let handedBack = 0;
    const exported = await exportCsvInChunks(entries, rollsPerChunk, () => {
      handedBack += 1;
      return Promise.resolve();
    });
    expect(exported.chunks, 'one chunk per group of rolls').toBe(
      Math.ceil(entries.length / rollsPerChunk),
    );
    expect(handedBack, 'the thread goes back once per chunk').toBe(exported.chunks);
    expect(exported.parts, 'one header plus one row per non-null cell').toBe(
      cellCount(entries) + 1,
    );
    expect(exported.blob.type).toBe('text/csv;charset=utf-8');
    expect(await exported.blob.text(), 'the same file as the one-task export').toBe(
      csvParts(entries).join(''),
    );
  });

  it('makes a note of =1+1 inert', () => {
    const profile = preset('pool-referee-gains-a-point');
    const outcome = firstRoll(poolBuilder({ attribute: 2 }), seededRandom(5), 0);
    if (outcome.kind !== 'rolled') {
      throw new Error('the fixture pool rolled nothing');
    }
    const entry = createLogEntry({
      rollId: 'r-1',
      timestampIso: '2026-08-09T09:00:00.000Z',
      mode: 'pool',
      result: outcome,
      profile,
      stressBefore: 0,
      note: '=1+1',
    });
    const text = csvParts([entry]).join('');
    expect(text, 'the note is quote-prefixed').toContain(",'=1+1\r\n");
    expect(text, 'the raw formula never reaches the file').not.toContain(',=1+1\r\n');
    const back = importCsv(text);
    expect(back[0]?.note, 'the note comes back as the user typed it').toBe('=1+1');
  });
});

describe('the round trip', () => {
  it('gives back an identical log, profile_hash included', () => {
    const entries = buildLog();
    expect(entries.length, 'four presets, two modes, pushed and unpushed').toBe(
      PUSH_PROFILES.length * MODES.length * PUSHED.length,
    );
    const back = importCsv(csvParts(entries).join(''));
    expect(back.length, 'every roll came back').toBe(entries.length);

    const keys = Object.keys(entries[0] ?? {}) as (keyof LogEntry)[];
    expect(keys.length, 'fields of a log entry').toBe(14);
    let compared = 0;
    for (const [index, original] of entries.entries()) {
      const copy = back[index];
      expect(copy, `roll ${original.rollId} came back`).toBeDefined();
      for (const key of keys) {
        expect(copy?.[key], `field ${key} of roll ${original.rollId}`).toEqual(original[key]);
        compared += 1;
      }
    }
    expect(compared, 'every field of every roll was compared').toBe(entries.length * keys.length);
  });

  it('keeps the hash of the profile the roll was made under, not the edited one', () => {
    const before = preset('pool-banes-damage-ratings');
    const outcome = firstRoll(poolBuilder({ attribute: 3 }), seededRandom(23), 0);
    if (outcome.kind !== 'rolled') {
      throw new Error('the fixture pool rolled nothing');
    }
    const entry = createLogEntry({
      rollId: 'r-1',
      timestampIso: '2026-08-09T09:00:00.000Z',
      mode: 'pool',
      result: outcome,
      profile: before,
      stressBefore: 0,
    });

    const after = mergeProfile(before, { maxPushes: 3, lockSuccesses: false });
    const text = csvParts([entry]).join('');
    expect(text, 'the export names the profile the roll was made under').toContain(
      profileHash(before),
    );
    expect(text, 'the export followed the edit').not.toContain(profileHash(after));
    expect(importCsv(text)[0]?.profileHash).toBe(profileHash(before));
  });
});

describe('the import refuses a file it cannot trust', () => {
  const good = (): string => csvParts(buildLog()).join('');

  it('names an unknown column', () => {
    const text = good().replace('die_faces', 'die_sides');
    expect(() => importCsv(text)).toThrow(
      'csv import: column 9 is named "die_sides". The export schema holds no such column.',
    );
  });

  it('names a header that is out of order', () => {
    const text = good().replace('roll_id,timestamp_iso', 'timestamp_iso,roll_id');
    expect(() => importCsv(text)).toThrow(
      'csv import: the header is out of order. Column 1 must be "roll_id" and it is "timestamp_iso".',
    );
  });

  it('names a header that holds the wrong number of columns', () => {
    const text = good().replace('roll_id,timestamp_iso', 'roll_id');
    expect(() => importCsv(text)).toThrow('csv import: the header holds 19 columns.');
  });

  it('names a duplicate roll_id', () => {
    const parts = csvParts(buildLog());
    const first = parts[1] ?? '';
    // The first roll's block reappears after the log is over.
    expect(() => importCsv([...parts, first].join(''))).toThrow(
      'csv import: roll "roll-0" appears twice. Every roll must hold one block of rows.',
    );
  });

  it('names an oversized file', () => {
    const text = 'x'.repeat(MAX_IMPORT_CHARS + 1);
    expect(() => importCsv(text)).toThrow(
      `csv import: the file holds ${MAX_IMPORT_CHARS + 1} characters, over the limit of ${MAX_IMPORT_CHARS}.`,
    );
  });

  it('names a repeated cell, a field that is not a count, and an unclosed quote', () => {
    const parts = csvParts(buildLog());
    const row = parts[1] ?? '';
    expect(() => importCsv([...parts.slice(0, 2), row, ...parts.slice(2)].join(''))).toThrow(
      'csv import: roll "roll-0" holds two rows for die 0 at generation 0.',
    );
    expect(() => importCsv([parts[0], row.replace(',6,', ',six,')].join(''))).toThrow(
      'column "die_faces" holds "six"',
    );
    expect(() => importCsv([parts[0], '"unclosed'].join(''))).toThrow(
      'csv import: a quoted field never closes.',
    );
  });

  it('names a row that disagrees with the rest of its roll', () => {
    const parts = csvParts(buildLog());
    const row = (parts[2] ?? '').replace('roll-0,2026', 'roll-0,1999');
    expect(() => importCsv([parts[0], parts[1], row].join(''))).toThrow(
      'csv import: line 3 gives roll "roll-0" a second set of roll-level values.',
    );
  });

  it('refuses an empty file', () => {
    expect(() => importCsv('')).toThrow('csv import: the file is empty.');
  });
});
