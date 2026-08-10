// The file the import control is handed — Unit 4.6.
//
// The claim this file exists for is an ORDER: the size is judged before the
// file is read. An order between two calls is only provable by counting the
// second one, so every fake file here counts its own `text()` calls and a
// refusal must leave that count at zero.

import { describe, expect, it } from 'vitest';
import { csvParts, CsvRejected, importCsv, MAX_IMPORT_CHARS } from './csv';
import type { LogEntry } from './entry';
import type { ImportRejection } from './import-file';
import {
  fileSizeReading,
  IMPORT_REJECTION_WORDS,
  MAX_IMPORT_BYTES,
  readImportFile,
} from './import-file';

/** A file that counts every read of itself. */
function fakeFile(text: string, size = new TextEncoder().encode(text).length) {
  const reads = { count: 0 };
  return {
    reads,
    file: {
      name: 'log.csv',
      size,
      text(): Promise<string> {
        reads.count += 1;
        return Promise.resolve(text);
      },
    },
  };
}

function entry(at: number, over: Partial<LogEntry> = {}): LogEntry {
  return {
    rollId: `r-${at}`,
    timestampIso: new Date(Date.UTC(2026, 7, 9, 12, at)).toISOString(),
    ruleset: 'pool-stress-and-complications',
    profileHash: `${at}`.repeat(64).slice(0, 64),
    mode: 'pool',
    dice: [
      { type: 'attribute', faces: 6, cells: [{ value: 6, successes: 1, locked: true }] },
      { type: 'stress', faces: 6, cells: [{ value: 1, successes: 0, locked: true }] },
    ],
    successes: 1,
    banes: 1,
    pushCount: 0,
    costType: 'complicationCheck',
    costAmount: 0,
    stressBefore: at,
    stressAfter: at + 1,
    note: '',
    ...over,
  };
}

describe('the picked file', () => {
  it('refuses a file over the cap WITHOUT reading one byte of it', async () => {
    // The text is short and legal. Only the stated size is over the cap, so a
    // guard that read the text first would parse it happily and pass.
    const good = csvParts([entry(1)]).join('');
    const { file, reads } = fakeFile(good, MAX_IMPORT_BYTES + 1);
    const outcome = await readImportFile(file);
    expect(outcome.kind).toBe('refused');
    expect(reads.count, 'a refused file is never read').toBe(0);
    if (outcome.kind !== 'refused') return;
    expect(outcome.reason).toContain('too large');
    expect(outcome.reason).toContain(fileSizeReading(MAX_IMPORT_BYTES));
    expect(outcome.reason).toContain('No part of the file was read');
  });

  it('reads a file exactly on the cap, so the boundary is the cap and not one below it', async () => {
    const good = csvParts([entry(1)]).join('');
    const { file, reads } = fakeFile(good, MAX_IMPORT_BYTES);
    const outcome = await readImportFile(file);
    expect(outcome.kind, 'the cap is a ceiling, not an exclusive bound').toBe('read');
    expect(reads.count).toBe(1);
  });

  it('holds the byte cap and the character cap at one number, for a stated reason', () => {
    // UTF-8 never spends fewer bytes than the string spends UTF-16 code units,
    // so a file inside the byte cap is always inside the character cap. The
    // inequality is asserted rather than described, over a corpus that covers
    // all four UTF-8 lengths.
    expect(MAX_IMPORT_BYTES).toBe(MAX_IMPORT_CHARS);
    const corpus = ['a', 'é', '€', '\u{1F3B2}', 'a,b\r\n"c"', 'naïve dé', ''];
    for (const text of corpus) {
      const bytes = new TextEncoder().encode(text).length;
      expect(bytes, `"${text}" spends at least one byte per code unit`).toBeGreaterThanOrEqual(
        text.length,
      );
    }
  });

  it('reads a real export back into the entries it was written from', async () => {
    const log = [entry(1), entry(2, { note: '=1+1' })];
    const { file, reads } = fakeFile(csvParts(log).join(''));
    const outcome = await readImportFile(file);
    expect(outcome.kind).toBe('read');
    expect(reads.count).toBe(1);
    if (outcome.kind !== 'read') return;
    expect(outcome.entries).toEqual(log);
  });

  it('names the cause of every other refusal, and reads the file at most once', async () => {
    const cases: readonly (readonly [string, ImportRejection, string])[] = [
      ['an empty file', 'empty-file', ''],
      ['a file that is not a log', 'wrong-header', 'name,age\r\nada,36\r\n'],
      ['a header with no roll', 'no-rolls', csvParts([]).join('')],
    ];
    for (const [what, rejection, text] of cases) {
      const { file, reads } = fakeFile(text);
      const outcome = await readImportFile(file);
      expect(outcome.kind, what).toBe('refused');
      if (outcome.kind !== 'refused') continue;
      expect(outcome.rejection, what).toBe(rejection);
      expect(outcome.reason, what).toBe(IMPORT_REJECTION_WORDS[rejection]);
      expect(reads.count, `${what} is read at most once`).toBeLessThanOrEqual(1);
    }
  });

  it('keeps the browser’s own words out of the refusal a player reads', async () => {
    // Unit 4.10. `NotReadableError` is a code identifier, and no code
    // identifier reaches a player. It stays in `detail`, which nothing draws.
    const outcome = await readImportFile({
      name: 'gone.csv',
      size: 10,
      text: () => Promise.reject(new Error('NotReadableError')),
    });
    expect(outcome.kind).toBe('refused');
    if (outcome.kind !== 'refused') return;
    expect(outcome.rejection).toBe('unreadable');
    expect(outcome.reason).toBe(IMPORT_REJECTION_WORDS['unreadable']);
    expect(outcome.reason, 'the player reads no error name').not.toContain('NotReadableError');
    expect(outcome.detail, 'and the person holding the file still can').toContain(
      'NotReadableError',
    );
  });

  it('carries a code for every rejection the parser can raise', () => {
    // The parser names a column, a line and a value, because a person repairing
    // the file needs all three. The screen reads the code instead. Both halves
    // of that split are asserted here: the code, and the message.
    const cases: readonly (readonly [string, ImportRejection, string])[] = [
      ['an unknown column', 'wrong-header', 'name,age\r\nada,36\r\n'],
      ['no header at all', 'no-header', ''],
      [
        'a value the schema refuses',
        'bad-value',
        csvParts([entry(1)])
          .join('')
          .replace(',pool,0,0,', ',pool,x,0,'),
      ],
    ];
    for (const [what, rejection, text] of cases) {
      let raised: unknown = null;
      try {
        importCsv(text);
      } catch (error) {
        raised = error;
      }
      expect(raised instanceof CsvRejected, what).toBe(true);
      if (!(raised instanceof CsvRejected)) continue;
      expect(raised.rejection, what).toBe(rejection);
      expect(IMPORT_REJECTION_WORDS[raised.rejection], `${what} has words`).toBeTruthy();
    }
  });

  it('reads a size a player can judge, and never two equal numbers', () => {
    expect(fileSizeReading(512)).toBe('512 bytes');
    expect(fileSizeReading(2048)).toBe('2.0 KB (2048 bytes)');
    expect(fileSizeReading(33_554_432)).toBe('32.0 MB (33554432 bytes)');
    // A file one byte over the cap rounds to the same megabyte as the cap, so
    // the exact count is what makes the refusal readable rather than a
    // contradiction.
    expect(fileSizeReading(MAX_IMPORT_BYTES + 1)).not.toBe(fileSizeReading(MAX_IMPORT_BYTES));
  });
});
