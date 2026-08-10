// The file the import control is handed — Unit 4.6.
//
// The claim this file exists for is an ORDER: the size is judged before the
// file is read. An order between two calls is only provable by counting the
// second one, so every fake file here counts its own `text()` calls and a
// refusal must leave that count at zero.

import { describe, expect, it } from 'vitest';
import { csvParts, MAX_IMPORT_CHARS } from './csv';
import type { LogEntry } from './entry';
import { fileSizeReading, MAX_IMPORT_BYTES, readImportFile } from './import-file';

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
    const cases: readonly (readonly [string, string, string])[] = [
      ['an empty file', '', 'empty'],
      ['a file that is not a log', 'name,age\r\nada,36\r\n', 'not a log this application wrote'],
      ['a header with no roll', csvParts([]).join(''), 'holds a header and no roll'],
    ];
    for (const [what, text, wanted] of cases) {
      const { file, reads } = fakeFile(text);
      const outcome = await readImportFile(file);
      expect(outcome.kind, what).toBe('refused');
      if (outcome.kind !== 'refused') continue;
      expect(outcome.reason, what).toContain(wanted);
      expect(reads.count, `${what} is read at most once`).toBeLessThanOrEqual(1);
    }
  });

  it('says why a file the browser could not read did not import', async () => {
    const outcome = await readImportFile({
      name: 'gone.csv',
      size: 10,
      text: () => Promise.reject(new Error('NotReadableError')),
    });
    expect(outcome.kind).toBe('refused');
    if (outcome.kind !== 'refused') return;
    expect(outcome.reason).toContain('could not be read');
    expect(outcome.reason).toContain('NotReadableError');
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
