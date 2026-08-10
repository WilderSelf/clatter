// The file the import control is handed — Unit 4.6.
//
// `src/log/csv.ts` reads TEXT. This file reads a FILE, and the difference is the
// whole point of it: the size is judged on the file itself, before one byte of
// it is read into the page. A cap that reads `text.length` has already asked the
// browser for the whole document, which is the allocation the cap exists to
// refuse.
//
// Nothing here parses. It refuses, or it hands the text to `importCsv`.

import { importCsv, MAX_IMPORT_BYTES } from './csv';
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
  | { readonly kind: 'refused'; readonly reason: string };

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
 * Read a picked file into a log, or refuse it.
 *
 * The size is judged first, on the file, and a refused file is never read. The
 * refusal names its cause, because a player who is told "no" and not "why" tries
 * the same file again.
 */
export async function readImportFile(file: PickedFile): Promise<ImportOutcome> {
  if (file.size > MAX_IMPORT_BYTES) {
    return {
      kind: 'refused',
      reason:
        `This file is too large to read. It holds ${fileSizeReading(file.size)}. The limit is ` +
        `${fileSizeReading(MAX_IMPORT_BYTES)}. No part of the file was read.`,
    };
  }
  if (file.size === 0) {
    return { kind: 'refused', reason: 'This file is empty. Pick a log this application wrote.' };
  }
  let text: string;
  try {
    text = await file.text();
  } catch (error) {
    return {
      kind: 'refused',
      reason: `This file could not be read. ${error instanceof Error ? error.message : String(error)}`,
    };
  }
  try {
    const entries = importCsv(text);
    if (entries.length === 0) {
      return { kind: 'refused', reason: 'This file holds a header and no roll. Nothing was read.' };
    }
    return { kind: 'read', entries };
  } catch (error) {
    return {
      kind: 'refused',
      reason: `This file is not a log this application wrote. ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}
