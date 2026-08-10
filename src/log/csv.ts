// CSV export and import for the roll log.
//
// Long format: one row per die per generation, with the roll-level fields
// repeated on every row. That shape pivots in a spreadsheet by dice type and by
// push count, which is what the log is exported for.
//
// Two rules from specs/0001-rules-model.md drive the shape:
//
// - "null renders blank and emits no CSV row". A die that did not exist at a
//   generation contributes nothing there.
// - The log stores its derived values and the hash of the profile. The importer
//   therefore reads those values and never re-derives them.
//
// Two decisions the plan settled, restated here because the code has to obey
// them and a reader must not have to guess:
//
// - An import REPLACES the log. `importCsv` returns the whole new log.
// - A duplicate `roll_id` is REJECTED, not merged and not renamed.

import type { DieType, Faces } from '../rules/die';
import type { Mode } from '../rules/pool';
import type { PushCostUnit } from '../rules/push-profile';
import type { DieCell, LoggedDie, LogEntry } from './entry';

/** The export schema, in order. The importer accepts this and nothing else. */
export const CSV_COLUMNS = [
  'roll_id',
  'timestamp_iso',
  'ruleset',
  'profile_hash',
  'mode',
  'generation',
  'die_index',
  'die_type',
  'die_faces',
  'value',
  'locked',
  'die_successes',
  'roll_successes',
  'roll_banes',
  'push_count',
  'cost_type',
  'cost_amount',
  'stress_before',
  'stress_after',
  'note',
] as const;

export type CsvColumn = (typeof CSV_COLUMNS)[number];

/**
 * The most characters an import reads. It refuses a file that would hold the
 * parser for minutes. The browser half checks the byte size of the file as
 * well, before it reads it.
 *
 * The room this leaves is small, and it is measured rather than assumed: a full
 * buffer of twelve-dice rolls is one file this application writes and must be
 * able to read back, so `--log-csv` exports one and compares it against this
 * number on every run.
 */
export const MAX_IMPORT_CHARS = 33_554_432;

const EOL = '\r\n';

/**
 * A field that opens with one of these reads as a formula in a spreadsheet, so
 * the writer puts a quote in front of it. The apostrophe is on the list as
 * well, or a note that already opens with one would not come back unchanged.
 */
const FORMULA_SIGILS = ['=', '+', '-', '@', "'"];

function inert(raw: string): string {
  return FORMULA_SIGILS.includes(raw.slice(0, 1)) ? `'${raw}` : raw;
}

/** Undo `inert`. One leading quote goes, whatever follows it. */
function active(field: string): string {
  return field.startsWith("'") ? field.slice(1) : field;
}

function escapeField(raw: string): string {
  const safe = inert(raw);
  return /["\r\n,]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe;
}

/** One row, in column order. Every entry of the list is a column of the schema. */
function rowFields(
  entry: LogEntry,
  generation: number,
  dieIndex: number,
  die: LoggedDie,
  cell: DieCell,
): readonly string[] {
  return [
    entry.rollId,
    entry.timestampIso,
    entry.ruleset,
    entry.profileHash,
    entry.mode,
    String(generation),
    String(dieIndex),
    die.type,
    String(die.faces),
    String(cell.value),
    String(cell.locked),
    String(cell.successes),
    String(entry.successes),
    String(entry.banes),
    String(entry.pushCount),
    entry.costType,
    String(entry.costAmount),
    String(entry.stressBefore),
    String(entry.stressAfter),
    entry.note,
  ];
}

/** One piece per row of one roll, appended to the list the caller holds. */
function pushRows(into: string[], entry: LogEntry): void {
  const generations = entry.dice.reduce((longest, die) => Math.max(longest, die.cells.length), 0);
  for (let generation = 0; generation < generations; generation += 1) {
    for (const [dieIndex, die] of entry.dice.entries()) {
      const cell = die.cells[generation];
      if (cell === null || cell === undefined) {
        continue;
      }
      into.push(rowFields(entry, generation, dieIndex, die, cell).map(escapeField).join(',') + EOL);
    }
  }
}

/**
 * The document as a list of pieces: the header, then one piece per row.
 *
 * The pieces are never joined. A full buffer is roughly 180,000 rows and tens of
 * megabytes, and building that by string concatenation would ask a phone for one
 * contiguous allocation of the whole document on top of every intermediate copy.
 * `Blob` takes the list and does the joining itself, outside the JavaScript
 * heap.
 */
export function csvParts(entries: readonly LogEntry[]): string[] {
  const parts: string[] = [CSV_COLUMNS.join(',') + EOL];
  for (const entry of entries) pushRows(parts, entry);
  return parts;
}

const CSV_TYPE = { type: 'text/csv;charset=utf-8' } as const;

/**
 * The whole log as one CSV file, in one task.
 *
 * A campaign-sized log takes hundreds of milliseconds here, which is many
 * dropped frames. Use `exportCsvInChunks` where the page is on the screen.
 */
export function exportCsv(entries: readonly LogEntry[]): Blob {
  return new Blob(csvParts(entries), CSV_TYPE);
}

/**
 * How many rolls one chunk holds.
 *
 * Chosen by measurement. `--log-csv` read the longest task of a full-buffer
 * export at four chunk sizes, and below fifty rolls the number stops falling:
 * what is left is the timer the yield rides on and not the work. The work in
 * one chunk is therefore a small part of the longest task, and a device several
 * times slower than the one measured still stays inside the ceiling.
 */
export const ROLLS_PER_CHUNK = 50;

/** Hand the thread back, so the browser may draw a frame between two chunks. */
function breathe(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

export interface CsvExport {
  readonly blob: Blob;
  /** How many pieces went into the file: one per row, plus the header. */
  readonly parts: number;
  /** How many chunks the document was built in. Each one is its own task. */
  readonly chunks: number;
}

/**
 * The whole log as one CSV file, built a chunk of rolls at a time.
 *
 * Two properties, and both are measured by `scripts/browser.mjs --log-csv`.
 *
 * - **No long task.** The thread goes back to the browser between chunks, so no
 *   single task builds the whole document. `exportCsv` blocks for as long as the
 *   build takes, which a full buffer makes hundreds of milliseconds.
 * - **Never one string.** Each chunk becomes its own `Blob`, and the file is a
 *   `Blob` over those. The strings of a chunk are released as soon as it is
 *   closed, so the heap holds one chunk and never the whole document. `parts`
 *   counts the pieces at the point they are handed over, so a rewrite that joins
 *   them fails the count rather than a phone.
 */
export async function exportCsvInChunks(
  entries: readonly LogEntry[],
  rollsPerChunk: number = ROLLS_PER_CHUNK,
  yieldTo: () => Promise<void> = breathe,
): Promise<CsvExport> {
  const blobs: Blob[] = [];
  let piece: string[] = [CSV_COLUMNS.join(',') + EOL];
  let parts = 0;
  let chunks = 0;
  const close = async (): Promise<void> => {
    parts += piece.length;
    chunks += 1;
    blobs.push(new Blob(piece, CSV_TYPE));
    piece = [];
    await yieldTo();
  };
  for (const [index, entry] of entries.entries()) {
    pushRows(piece, entry);
    if ((index + 1) % rollsPerChunk === 0) await close();
  }
  if (piece.length > 0) await close();
  return { blob: new Blob(blobs, CSV_TYPE), parts, chunks };
}

// ---------------------------------------------------------------------------
// Import
// ---------------------------------------------------------------------------

/** Split CSV text into rows of raw fields. Quoted fields may hold a line break. */
function parseRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  let open = false;
  let index = 0;
  const close = (): void => {
    if (open || field !== '' || row.length > 0) {
      row.push(field);
      rows.push(row);
    }
    row = [];
    field = '';
    open = false;
  };
  while (index < text.length) {
    const character = text.charAt(index);
    if (quoted) {
      if (character === '"' && text.charAt(index + 1) === '"') {
        field += '"';
        index += 2;
        continue;
      }
      if (character === '"') {
        quoted = false;
        index += 1;
        continue;
      }
      field += character;
      index += 1;
      continue;
    }
    if (character === '"') {
      quoted = true;
      open = true;
      index += 1;
      continue;
    }
    if (character === ',') {
      row.push(field);
      field = '';
      open = true;
      index += 1;
      continue;
    }
    if (character === '\r' || character === '\n') {
      index += character === '\r' && text.charAt(index + 1) === '\n' ? 2 : 1;
      close();
      continue;
    }
    field += character;
    open = true;
    index += 1;
  }
  if (quoted) {
    throw new Error('csv import: a quoted field never closes.');
  }
  close();
  return rows;
}

function readHeader(header: readonly string[]): void {
  const schema: readonly string[] = CSV_COLUMNS;
  for (const [position, name] of header.entries()) {
    if (!schema.includes(name)) {
      throw new Error(
        `csv import: column ${position + 1} is named "${name}". ` +
          'The export schema holds no such column.',
      );
    }
  }
  if (header.length !== schema.length) {
    throw new Error(
      `csv import: the header holds ${header.length} columns. ` +
        `The export schema holds ${schema.length}.`,
    );
  }
  const wrong = schema.findIndex((name, position) => header[position] !== name);
  if (wrong >= 0) {
    throw new Error(
      `csv import: the header is out of order. Column ${wrong + 1} must be ` +
        `"${schema[wrong]}" and it is "${header[wrong]}".`,
    );
  }
}

const COLUMN_AT: Readonly<Record<CsvColumn, number>> = Object.fromEntries(
  CSV_COLUMNS.map((name, position) => [name, position]),
) as Record<CsvColumn, number>;

/** The roll-level columns. Every row of one roll must repeat them unchanged. */
const ROLL_LEVEL: readonly CsvColumn[] = [
  'roll_id',
  'timestamp_iso',
  'ruleset',
  'profile_hash',
  'mode',
  'roll_successes',
  'roll_banes',
  'push_count',
  'cost_type',
  'cost_amount',
  'stress_before',
  'stress_after',
  'note',
];

function field(fields: readonly string[], column: CsvColumn): string {
  return active(fields[COLUMN_AT[column]] ?? '');
}

function whole(fields: readonly string[], column: CsvColumn, line: number): number {
  const raw = field(fields, column);
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`csv import: line ${line}, column "${column}" holds "${raw}", not a count.`);
  }
  return value;
}

function oneOf<T extends string>(
  fields: readonly string[],
  column: CsvColumn,
  allowed: readonly T[],
  line: number,
): T {
  const raw = field(fields, column);
  const found = allowed.find((each) => each === raw);
  if (found === undefined) {
    throw new Error(
      `csv import: line ${line}, column "${column}" holds "${raw}". ` +
        `The allowed values are ${allowed.join(', ')}.`,
    );
  }
  return found;
}

const MODES: readonly Mode[] = ['pool', 'step'];
const DIE_TYPES: readonly DieType[] = ['attribute', 'skill', 'gear', 'artifact', 'bonus', 'stress'];
const FACE_COUNTS: readonly string[] = ['6', '8', '10', '12'];
const COST_UNITS: readonly PushCostUnit[] = [
  'ratingPoint',
  'healthPoint',
  'refereePoint',
  'complicationCheck',
];
const LOCK_STATES: readonly string[] = ['true', 'false'];

interface Building {
  readonly rollId: string;
  readonly signature: string;
  readonly head: readonly string[];
  /** The line the roll-level values were read from, so an error names it. */
  readonly headLine: number;
  readonly dice: Map<number, { type: DieType; faces: Faces; cells: Map<number, DieCell> }>;
  generations: number;
}

function signatureOf(fields: readonly string[]): string {
  return ROLL_LEVEL.map((column) => field(fields, column)).join(' ');
}

function finish(building: Building): LogEntry {
  const indexes = [...building.dice.keys()].sort((left, right) => left - right);
  const dice: LoggedDie[] = indexes.map((index, position) => {
    if (index !== position) {
      throw new Error(`csv import: roll "${building.rollId}" holds no row for die ${position}.`);
    }
    const die = building.dice.get(index);
    if (die === undefined) {
      throw new Error(`csv import: roll "${building.rollId}" holds no row for die ${position}.`);
    }
    const cells: (DieCell | null)[] = Array.from(
      { length: building.generations },
      (_unused, generation) => die.cells.get(generation) ?? null,
    );
    return { type: die.type, faces: die.faces, cells };
  });
  const head = building.head;
  const line = building.headLine;
  return {
    rollId: building.rollId,
    timestampIso: field(head, 'timestamp_iso'),
    ruleset: field(head, 'ruleset'),
    profileHash: field(head, 'profile_hash'),
    mode: oneOf(head, 'mode', MODES, line),
    dice,
    successes: whole(head, 'roll_successes', line),
    banes: whole(head, 'roll_banes', line),
    pushCount: whole(head, 'push_count', line),
    costType: oneOf(head, 'cost_type', COST_UNITS, line),
    costAmount: whole(head, 'cost_amount', line),
    stressBefore: whole(head, 'stress_before', line),
    stressAfter: whole(head, 'stress_after', line),
    note: field(head, 'note'),
  };
}

/**
 * Read a whole log out of CSV text.
 *
 * The result REPLACES the log. It is not merged into it, and a `roll_id` that
 * appears twice is rejected rather than renamed or overwritten.
 */
export function importCsv(text: string): readonly LogEntry[] {
  if (text.length > MAX_IMPORT_CHARS) {
    throw new Error(
      `csv import: the file holds ${text.length} characters, ` +
        `over the limit of ${MAX_IMPORT_CHARS}.`,
    );
  }
  const rows = parseRows(text);
  const header = rows[0];
  if (header === undefined) {
    throw new Error('csv import: the file is empty. The first line must be the header.');
  }
  readHeader(header);

  const entries: LogEntry[] = [];
  const seen = new Set<string>();
  let building: Building | null = null;
  for (const [offset, fields] of rows.slice(1).entries()) {
    const line = offset + 2;
    if (fields.length !== CSV_COLUMNS.length) {
      throw new Error(
        `csv import: line ${line} holds ${fields.length} fields. The schema holds ${CSV_COLUMNS.length}.`,
      );
    }
    const rollId = field(fields, 'roll_id');
    if (building !== null && building.rollId !== rollId) {
      entries.push(finish(building));
      building = null;
    }
    if (building === null) {
      if (seen.has(rollId)) {
        throw new Error(
          `csv import: roll "${rollId}" appears twice. Every roll must hold one block of rows.`,
        );
      }
      seen.add(rollId);
      building = {
        rollId,
        signature: signatureOf(fields),
        head: fields,
        headLine: line,
        dice: new Map(),
        generations: 0,
      };
    } else if (signatureOf(fields) !== building.signature) {
      throw new Error(
        `csv import: line ${line} gives roll "${rollId}" a second set of roll-level values.`,
      );
    }
    const generation = whole(fields, 'generation', line);
    const dieIndex = whole(fields, 'die_index', line);
    const type = oneOf(fields, 'die_type', DIE_TYPES, line);
    const faces = Number(oneOf(fields, 'die_faces', FACE_COUNTS, line)) as Faces;
    const cell: DieCell = {
      value: whole(fields, 'value', line),
      successes: whole(fields, 'die_successes', line),
      locked: oneOf(fields, 'locked', LOCK_STATES, line) === 'true',
    };
    const die = building.dice.get(dieIndex) ?? { type, faces, cells: new Map<number, DieCell>() };
    if (die.type !== type || die.faces !== faces) {
      throw new Error(
        `csv import: roll "${rollId}" describes die ${dieIndex} twice, as a ` +
          `${die.faces}-faced ${die.type} die and as a ${faces}-faced ${type} die.`,
      );
    }
    if (die.cells.has(generation)) {
      throw new Error(
        `csv import: roll "${rollId}" holds two rows for die ${dieIndex} at generation ${generation}.`,
      );
    }
    die.cells.set(generation, cell);
    building.dice.set(dieIndex, die);
    building.generations = Math.max(building.generations, generation + 1);
  }
  if (building !== null) {
    entries.push(finish(building));
  }
  return entries;
}
