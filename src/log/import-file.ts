// The file the import control is handed — Unit 4.6, with Unit 4.10's words.
//
// `src/log/csv.ts` reads TEXT. This file reads a FILE, and the difference is the
// whole point of it: the size is judged on the file itself, before one byte of
// it is read into the page. A cap that reads `text.length` has already asked the
// browser for the whole document, which is the allocation the cap exists to
// refuse.
//
// Nothing here parses. It refuses, or it hands the text to `importCsv`.
//
// ---------------------------------------------------------------------------
// Unit 4.10: a refusal carries a CODE, and the words come off the code
// ---------------------------------------------------------------------------
//
// `importCsv` throws a message naming a column, a line and a value, because the
// person holding the file needs all three to repair it. **A column name is a
// code identifier and no code identifier may reach a player.** Unit 4.4 found
// `1 ratingPoint` and `pool-banes-damage-ratings` printed on a screen, and only
// a capture caught them.
//
// So a refusal carries `rejection`, and `IMPORT_REJECTION_WORDS` holds one
// sentence per code. The thrown message is kept in `detail`, which the screen
// never prints. The two sets are asserted equal, so a rejection added to the
// parser cannot reach a player with no words.

import type { CsvRejection } from './csv';
import { CsvRejected, importCsv, MAX_IMPORT_BYTES } from './csv';
import type { LogEntry } from './entry';

/**
 * The cap this file applies, re-stated nowhere.
 *
 * `src/log/csv.ts` holds it, beside the character cap it is derived from, and
 * carries the inequality that makes one number serve both.
 *
 * **The room between a full export and this cap is small and the owner owes a
 * decision on it.** `scripts/browser.mjs --log-csv` measures the real file on
 * every run and both cap checks go red the day it stops fitting.
 */
export { MAX_IMPORT_BYTES };

/**
 * Every way an import is refused: the parser's nine, and this file's three.
 *
 * The three here are about the FILE and the parser never sees them: a file over
 * the cap, a file of no bytes, and a file the browser would not read.
 */
export type ImportRejection = CsvRejection | 'empty-file' | 'unreadable' | 'no-rolls';

/**
 * One sentence per rejection, for the player.
 *
 * Each one says what happened and what to do next, and none of them names a
 * column, a line, a value or any other identifier. `src/shell/faults.test.ts`
 * asserts the whole table against the shape of an identifier, and asserts the
 * keys against the union above.
 */
export const IMPORT_REJECTION_WORDS: Readonly<Record<ImportRejection, string>> = {
  'too-large': 'This file is too large to read. Export a shorter log and import that.',
  'no-header': 'This file has no first line. Pick a log this application wrote.',
  'unfinished-quote':
    'This file stops in the middle of a quoted value. Export the log again and import the new file.',
  'wrong-header':
    'The first line of this file is not the one this application writes. Pick a log this application wrote.',
  'wrong-row': 'One line of this file holds the wrong number of values. The file is damaged.',
  'bad-value': 'One value in this file is not one this application writes. The file is damaged.',
  'duplicate-roll': 'This file holds one roll twice. Export the log again and import the new file.',
  'mixed-roll': 'This file gives one roll two different sets of readings. The file is damaged.',
  'broken-roll': 'One roll in this file is missing some of its dice. The file is damaged.',
  'empty-file': 'This file holds nothing. Pick a log this application wrote.',
  unreadable: 'This file could not be read. Pick it again, or copy it somewhere else first.',
  'no-rolls': 'This file holds a first line and no roll. Nothing was read.',
};

/**
 * What the import control needs of the picked file.
 *
 * A `File` satisfies it. A test hands over its own, whose `text` counts its
 * calls, because "the size is judged before the file is read" is a claim about
 * the order of two calls and is only provable by counting the second one.
 */
export interface PickedFile {
  readonly name: string;
  readonly size: number;
  text(): Promise<string>;
}

export type ImportOutcome =
  | { readonly kind: 'read'; readonly entries: readonly LogEntry[] }
  | {
      readonly kind: 'refused';
      readonly rejection: ImportRejection;
      /** The words the player reads. It names no identifier. */
      readonly reason: string;
      /**
       * What the parser said, for the person holding the file.
       *
       * **The screen never prints it.** It names a column, a line and a value,
       * and all three are identifiers.
       */
      readonly detail: string;
    };

/**
 * How large a file reads to a player.
 *
 * The exact count follows the rounded one, because a file one byte over the cap
 * rounds to the same megabyte as the cap and a refusal that named two equal
 * numbers would read as a contradiction. Measured on 2026-08-10: the first
 * draft said "It holds 32.0 MB and the limit is 32.0 MB".
 */
export function fileSizeReading(bytes: number): string {
  if (bytes < 1024) return `${bytes} bytes`;
  const rounded =
    bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;
  return `${rounded} (${bytes} bytes)`;
}

/**
 * Build a refusal.
 *
 * `extra` is a sentence of plain numbers, and only the size refusal carries
 * one. A player who is told a file is too large must be told how large it is,
 * or the words give nothing to act on.
 */
function refuse(rejection: ImportRejection, detail: string, extra = ''): ImportOutcome {
  const words = IMPORT_REJECTION_WORDS[rejection];
  return {
    kind: 'refused',
    rejection,
    reason: extra === '' ? words : `${words} ${extra}`,
    detail,
  };
}

/**
 * Read a picked file into a log, or refuse it.
 *
 * The size is judged first, on the file, and a refused file is never read. The
 * refusal names its cause, because a player who is told "no" and not "why" tries
 * the same file again.
 */
export async function readImportFile(file: PickedFile): Promise<ImportOutcome> {
  if (file.size > MAX_IMPORT_BYTES) {
    return refuse(
      'too-large',
      `the file holds ${fileSizeReading(file.size)} against a limit of ` +
        `${fileSizeReading(MAX_IMPORT_BYTES)}. No part of the file was read.`,
      `It holds ${fileSizeReading(file.size)}. The limit is ` +
        `${fileSizeReading(MAX_IMPORT_BYTES)}. No part of the file was read.`,
    );
  }
  if (file.size === 0) {
    return refuse('empty-file', 'the file holds 0 bytes');
  }
  let text: string;
  try {
    text = await file.text();
  } catch (error) {
    return refuse('unreadable', error instanceof Error ? error.message : String(error));
  }
  try {
    const entries = importCsv(text);
    if (entries.length === 0) {
      return refuse('no-rolls', 'the file parsed to zero rolls');
    }
    return { kind: 'read', entries };
  } catch (error) {
    // A parser rejection carries its own code. Anything else is a fault of this
    // application rather than of the file, and it takes the same words as a
    // damaged line, because the player can do nothing else about either.
    if (error instanceof CsvRejected) return refuse(error.rejection, error.message);
    return refuse('bad-value', error instanceof Error ? error.message : String(error));
  }
}
