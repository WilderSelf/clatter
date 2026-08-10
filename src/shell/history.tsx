// The history destination — Unit 4.4 built the summary, Unit 4.5 the record and
// the export, Unit 4.6 the import.
//
// **It is a second surface.** Section 3 of `docs/design/0002-screen-design.md`,
// under "The history is a separate destination": the history has its own header
// and its own footer, and it carries no share of the control budget of section
// 3. The summary holds `back-button`, `history-list` and `import-button`, and
// the record holds `back-button` and `export-button`. `history-list` is a
// composite holding one visit per logged roll, so its length follows the log.
//
// The destination REPLACES the roll flow while it is open, which is what makes
// it a destination rather than a panel. Both keyboard walks of section 6 are
// walks of the roll flow at rest, so neither one changes: eleven visits before
// the throw and thirty-five after it.
//
// **The matrix is transposed.** Decision 3 of
// `docs/design/0012-settled-decisions.md`: one row per die and one column per
// generation. One column per die needs more minimum content width than a phone
// gives, and the die count grows with the tray while the phone does not. Rows
// scroll on a phone. Columns do not.
//
// **The export writes the whole log, not the roll on the screen.** Unit 4.6
// settled that an import REPLACES the log, so a file holding one roll would
// take a campaign away when it was read back. The plan's own verification step
// says the same: export, open in a spreadsheet, re-import, and the log is
// unchanged. The control lives in the record because Decision 3 puts it there.
//
// **Nothing here derives a rule.** Every number drawn below is a stored field
// of the entry. `specs/0001-rules-model.md` gives the reason under "Derived
// values": a view that re-derived would re-price campaign history under
// whatever profile the sheet holds today.
//
// **Constraint 8.** The note is the player's own text, and so is every part of
// an import failure that quotes the file. Both reach the document as JSX
// children, which Preact sets through `textContent`, so no parser ever sees
// them. Nothing in this file names `innerHTML` or `dangerouslySetInnerHTML`.

import { useEffect, useRef, useState } from 'preact/hooks';
import { exportCsvInChunks } from '../log/csv';
import type { LogEntry, LoggedDie } from '../log/entry';
import { readImportFile } from '../log/import-file';
import type { Faces } from '../rules/die';
import type { PushCostUnit } from '../rules/push-profile';
import { PUSH_PROFILES } from '../rules/push-profile';
import { downloadBlob, exportFileName } from './download';
import { DIE_TYPE_TAG } from './state';

/**
 * The note the plan asks this unit to put in the interface, in the plan's own
 * words: "iOS deletes script-writable storage after seven days without a visit
 * unless the site is installed to the home screen. 'Survives a campaign' is
 * false on iPhone for a fortnightly group. Say so, and prompt an export."
 *
 * `navigator.storage.persist()` does not close it, which `persistOnce` in
 * `src/log/store.ts` states as well. So the interface says it.
 */
export const SEVEN_DAY_NOTE =
  'A phone can delete this log. iOS removes stored data after seven days without a visit. ' +
  'Add this application to the home screen to stop that. Export the log to keep a copy.';

/** One megabyte, to one decimal place. A byte count means nothing to a player. */
export function megabytes(bytes: number): string {
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

/**
 * What the storage estimate reads. The browser may hold no estimate at all, and
 * the sentence says which of the two it is rather than printing a zero.
 */
export function storageLine(
  estimate: { usage: number | null; quota: number | null } | null,
): string {
  if (estimate === null || estimate.usage === null) {
    return 'This browser reports no storage estimate.';
  }
  if (estimate.quota === null) {
    return `This site uses ${megabytes(estimate.usage)}.`;
  }
  return `This site uses ${megabytes(estimate.usage)} of ${megabytes(estimate.quota)}.`;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/**
 * When a roll was thrown, in the reader's own time zone.
 *
 * The stored value is an ISO instant, which is UTC. A player reads a clock, so
 * the parts come off a `Date` and the pattern is fixed here rather than left to
 * a locale, because a locale changes what a check compares against.
 */
export function rollWhen(timestampIso: string): string {
  const at = new Date(timestampIso);
  if (Number.isNaN(at.getTime())) return 'unknown time';
  return (
    `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())} ` +
    `${pad(at.getHours())}:${pad(at.getMinutes())}`
  );
}

function plural(count: number, one: string, many: string): string {
  return count === 1 ? `1 ${one}` : `${count} ${many}`;
}

/**
 * The cost unit in the words a player reads. It is keyed by the union, so a
 * fifth cost unit is a type error here until it has words.
 *
 * The stored `costAmount` is printed beside it and is never recomputed. Unit
 * 4.7 records why: the four units are different things, and a view that
 * re-priced a roll under today's profile would report a campaign that never
 * happened.
 */
const COST_NOUN: Readonly<Record<PushCostUnit, readonly [string, string]>> = {
  ratingPoint: ['rating point', 'rating points'],
  healthPoint: ['point of health', 'points of health'],
  refereePoint: ['referee point', 'referee points'],
  complicationCheck: ['complication check', 'complication checks'],
};

export function costReading(amount: number, unit: PushCostUnit): string {
  const words = COST_NOUN[unit];
  return plural(amount, words[0], words[1]);
}

/**
 * The name of a rule set, from the identifier the entry stores.
 *
 * It reads a LABEL and never a rule. The log stores the identifier, because the
 * export schema carries the identifier, and a profile the build no longer ships
 * therefore falls back to the stored identifier rather than to nothing.
 */
export function rulesetName(id: string): string {
  return PUSH_PROFILES.find((profile) => profile.id === id)?.label ?? id;
}

// ---------------------------------------------------------------------------
// The transposed matrix — Unit 4.5, carrying the two acceptances of row 2.2d
// ---------------------------------------------------------------------------

/**
 * One cell of the matrix: one die at one generation.
 *
 * Three kinds, and two of them are BLANK. Row 2.2d of `LEDGER.md` carries the
 * acceptance in the plan's own words — "the blank count equals the
 * independently computed count of locked-or-absent pairs" — so the two blank
 * kinds are exactly the two halves of that pair:
 *
 * - `kept`: the die was locked at the generation before, so this value is the
 *   carry of that one and never a new throw. The design draws a dot.
 * - `absent`: the die did not exist yet. The design draws nothing.
 *
 * A cell at generation 0 is never `kept`. There is no earlier generation for it
 * to repeat, whatever its own `locked` field says.
 */
export type MatrixCell =
  | {
      readonly kind: 'thrown';
      readonly value: number;
      readonly successes: number;
      readonly bane: boolean;
      readonly label: string;
    }
  | { readonly kind: 'kept'; readonly value: number; readonly label: string }
  | { readonly kind: 'absent'; readonly label: string };

/** One row of the matrix: one die, across every generation. */
export interface MatrixRow {
  /** The identifier the cells of this row point at through `headers`. */
  readonly key: string;
  readonly tag: string;
  readonly faces: Faces;
  readonly label: string;
  readonly cells: readonly MatrixCell[];
}

export interface MatrixColumn {
  readonly key: string;
  readonly head: string;
  readonly label: string;
}

export interface RecordMatrix {
  readonly generations: number;
  readonly columns: readonly MatrixColumn[];
  readonly rows: readonly MatrixRow[];
}

/** What one generation is called. Generation 0 is the throw and the rest are pushes. */
export function generationName(generation: number): string {
  return generation === 0 ? 'Throw' : `Push ${generation}`;
}

/**
 * The tag of one logged die: `At1`, `St10`.
 *
 * A `LoggedDie` carries no identifier, because the export schema names a die by
 * its position in the roll and a field the log cannot read back is a field the
 * log must not hold. The ordinal is therefore counted inside the type, over the
 * dice in the order the roll holds them, which is the order the pool was built
 * in.
 */
function tagsOf(dice: readonly LoggedDie[]): readonly string[] {
  const seen = new Map<string, number>();
  return dice.map((die) => {
    const at = (seen.get(die.type) ?? 0) + 1;
    seen.set(die.type, at);
    return `${DIE_TYPE_TAG[die.type]}${at}`;
  });
}

function worthWords(successes: number): string {
  if (successes === 0) return '';
  return successes === 1 ? ' One success.' : ` ${successes} successes.`;
}

/**
 * The matrix of one logged roll: one row per die and one column per generation.
 *
 * It is rectangular by construction. The number of columns is the longest cell
 * list of any die, and every row is filled to that width, so the cell count is
 * the product of the two whatever the dice did.
 */
export function recordMatrix(entry: LogEntry): RecordMatrix {
  const generations = entry.dice.reduce((longest, die) => Math.max(longest, die.cells.length), 0);
  const columns: MatrixColumn[] = Array.from({ length: generations }, (_unused, generation) => ({
    key: `g${generation}`,
    head: generationName(generation),
    label: generationName(generation),
  }));
  const tags = tagsOf(entry.dice);
  const rows: MatrixRow[] = entry.dice.map((die, index) => {
    const tag = tags[index] ?? `Die ${index + 1}`;
    const cells: MatrixCell[] = Array.from({ length: generations }, (_unused, generation) => {
      const cell = die.cells[generation] ?? null;
      const where = `${tag} at ${generationName(generation)}`;
      if (cell === null) {
        return { kind: 'absent', label: `${where}: it was not in the pool.` };
      }
      const before = generation === 0 ? null : (die.cells[generation - 1] ?? null);
      if (before !== null && before.locked) {
        return { kind: 'kept', value: cell.value, label: `${where}: kept, still ${cell.value}.` };
      }
      return {
        kind: 'thrown',
        value: cell.value,
        successes: cell.successes,
        bane: cell.value === 1,
        label:
          `${where}: shows ${cell.value}.` +
          worthWords(cell.successes) +
          (cell.value === 1 ? ' A bane.' : ''),
      };
    });
    return {
      key: `${tag.toLowerCase()}-${index}`,
      tag,
      faces: die.faces,
      label: `${tag}, a ${die.faces}-faced ${die.type} die.`,
      cells,
    };
  });
  return { generations, columns, rows };
}

/**
 * The matrix, as a real table.
 *
 * Table semantics are the point, not the look. A screen reader reaches a cell
 * by its row and its column, so every cell names both of its headers through
 * `headers`, and the two header kinds carry `scope`. The whole table is
 * read-only: section 3 lists it under "Read-only, and therefore not counted",
 * so nothing inside it holds a tab stop.
 */
function Matrix({ entry }: { entry: LogEntry }) {
  const matrix = recordMatrix(entry);
  const corner = 'hm-die';
  return (
    <div class="hist-mx-scroll">
      <table class="hist-mx" data-el="history-matrix" role="table">
        <caption>
          One row per die, one column per throw. A dot is a kept die, and it shows what it showed
          before. An empty cell is a die that was not in the pool yet.
        </caption>
        <thead>
          <tr role="row">
            <th id={corner} scope="col" role="columnheader">
              Die
            </th>
            {matrix.columns.map((column) => (
              <th key={column.key} id={`hm-${column.key}`} scope="col" role="columnheader">
                {column.head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.rows.map((row) => (
            <tr key={row.key} role="row">
              <th
                id={`hm-${row.key}`}
                scope="row"
                role="rowheader"
                aria-label={row.label}
                data-el={`history-matrix-row-${row.key}`}
              >
                {row.tag}
                <small>d{row.faces}</small>
              </th>
              {row.cells.map((cell, generation) => {
                const column = matrix.columns[generation];
                return (
                  <td
                    key={column?.key ?? generation}
                    role="cell"
                    headers={`hm-${row.key} hm-${column?.key ?? generation}`}
                    data-cell={cell.kind}
                    data-blank={cell.kind === 'thrown' ? undefined : ''}
                    aria-label={cell.label}
                  >
                    {cell.kind === 'thrown' ? (
                      <span class="mx-face">
                        <b>{cell.value}</b>
                        {cell.successes > 0 ? (
                          <span class="mx-mark" aria-hidden="true">
                            <i class="mark s" />
                            {cell.successes > 1 ? cell.successes : null}
                          </span>
                        ) : null}
                        {cell.bane ? (
                          <span class="mx-mark" aria-hidden="true">
                            <i class="mark b" />
                          </span>
                        ) : null}
                      </span>
                    ) : cell.kind === 'kept' ? (
                      <span class="mx-dot" aria-hidden="true" />
                    ) : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** One row of the summary list. Every field is read from the entry, never derived. */
export interface HistoryRow {
  readonly rollId: string;
  /** The `data-el` name of the row. It follows the position, not the roll. */
  readonly element: string;
  readonly when: string;
  readonly dice: number;
  readonly successes: number;
  readonly banes: number;
  readonly pushes: number;
  readonly ruleset: string;
  readonly profileHash: string;
  readonly costType: PushCostUnit;
  readonly costAmount: number;
  readonly stressBefore: number;
  readonly stressAfter: number;
  /** The player's own text. It is rendered as text and never as markup. */
  readonly note: string;
  /** What a screen reader reads for the row. */
  readonly label: string;
  /** The whole entry, so the record draws its matrix without a second lookup. */
  readonly entry: LogEntry;
}

/**
 * The summary list, newest roll first.
 *
 * The store answers oldest first, because its keys are the insertion order. A
 * player looks for the roll just thrown, so the list is reversed here, in the
 * one place that builds it.
 */
export function historyRows(entries: readonly LogEntry[]): readonly HistoryRow[] {
  return entries
    .slice()
    .reverse()
    .map((entry, at) => {
      const when = rollWhen(entry.timestampIso);
      return {
        rollId: entry.rollId,
        element: `history-row-${at}`,
        when,
        dice: entry.dice.length,
        successes: entry.successes,
        banes: entry.banes,
        pushes: entry.pushCount,
        ruleset: entry.ruleset,
        profileHash: entry.profileHash,
        costType: entry.costType,
        costAmount: entry.costAmount,
        stressBefore: entry.stressBefore,
        stressAfter: entry.stressAfter,
        note: entry.note,
        label:
          `The roll of ${when}. ${plural(entry.dice.length, 'die', 'dice')}. ` +
          `${plural(entry.successes, 'success', 'successes')}. ` +
          `${plural(entry.banes, 'bane', 'banes')}. ` +
          `${plural(entry.pushCount, 'push', 'pushes')}.`,
        entry,
      };
    });
}

/** How many rolls the log holds, in one sentence. */
export function logCountLine(count: number): string {
  if (count === 0) return 'The log holds no rolls.';
  return `The log holds ${plural(count, 'roll', 'rolls')}.`;
}

/**
 * The summary list. ONE control and one arrow habit, exactly as the pool bar
 * and the dice tray are. Section 2 of `docs/design/0002-screen-design.md`
 * counts a composite widget as one tab stop.
 *
 * An empty log draws a sentence and NO list, because a list holding no option
 * would still take a tab stop and a keyboard would stop on a control that does
 * nothing.
 */
function HistoryList({
  rows,
  openId,
  onOpen,
}: {
  rows: readonly HistoryRow[];
  openId: string | null;
  onOpen: (rollId: string) => void;
}) {
  const list = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState(rows[0]?.rollId ?? '');
  const active = rows.some((row) => row.rollId === activeId) ? activeId : (rows[0]?.rollId ?? '');

  const onKeyDown = (event: KeyboardEvent): void => {
    const held = list.current;
    if (held === null) return;
    const options = [...held.querySelectorAll<HTMLElement>('[role="option"]')];
    const from = options.findIndex((option) => option.contains(held.ownerDocument.activeElement));
    if (from < 0) return;
    const step: Record<string, number> = {
      ArrowDown: 1,
      ArrowRight: 1,
      ArrowUp: -1,
      ArrowLeft: -1,
    };
    const delta = step[event.key];
    if (delta !== undefined) {
      const to = (from + delta + options.length) % options.length;
      const next = options[to];
      const row = rows[to];
      if (next === undefined || row === undefined) return;
      event.preventDefault();
      setActiveId(row.rollId);
      next.focus();
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      const row = rows[from];
      if (row === undefined) return;
      event.preventDefault();
      onOpen(row.rollId);
    }
  };

  return (
    <div
      class="hist-list"
      data-el="history-list"
      data-composite=""
      role="listbox"
      aria-label="Past rolls"
      ref={list}
      onKeyDown={onKeyDown}
    >
      {rows.map((row) => (
        <div
          key={row.rollId}
          class="hist-row"
          data-el={row.element}
          role="option"
          tabIndex={row.rollId === active ? 0 : -1}
          aria-selected={row.rollId === openId}
          aria-label={row.label}
          onClick={() => onOpen(row.rollId)}
        >
          <span class="hist-when" aria-hidden="true">
            {row.when}
          </span>
          <span class="hist-nums" aria-hidden="true">
            <span class="hist-n">
              <i class="mark s" />
              {row.successes}
            </span>
            <span class="hist-n">
              <i class="mark b" />
              {row.banes}
            </span>
            <span class="hist-n dim">{row.dice} dice</span>
            <span class="hist-n dim">push {row.pushes}</span>
          </span>
          {row.note === '' ? null : (
            <span class="hist-note" aria-hidden="true">
              {row.note}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * One roll, as the log holds it: the stored readings and the transposed matrix.
 *
 * Every reading is a stored field. The matrix reads `entry.dice[].cells[]` and
 * derives nothing beyond which cells are the carry of a locked die, which is a
 * fact about the two stored cells and not a rule.
 */
function HistoryRecord({ row }: { row: HistoryRow }) {
  const readings: readonly (readonly [string, string])[] = [
    ['Thrown', row.when],
    ['Dice', String(row.dice)],
    ['Successes', String(row.successes)],
    ['Banes', String(row.banes)],
    ['Pushes', String(row.pushes)],
    ['Cost', costReading(row.costAmount, row.costType)],
    ['Stress', `${row.stressBefore} to ${row.stressAfter}`],
    ['Rule set', rulesetName(row.ruleset)],
  ];
  return (
    <section
      class="hist-record"
      data-el="history-record"
      data-roll-id={row.rollId}
      aria-label={row.label}
    >
      {/* The matrix comes first, and the render is why. The summary row the
          player pressed already showed the time, the successes, the banes, the
          dice count and the push count, so the dice are the only thing the
          record adds that the list cannot show. Drawn under the readings it sat
          below the fold of a 360 px screen, which is the width Decision 3
          transposed it for. Capture `docs/design/0017-history-record-360.png`. */}
      <Matrix entry={row.entry} />
      <dl class="hist-dl">
        {readings.map(([term, value]) => (
          <div key={term} class="hist-pair" data-reading={term}>
            <dt>{term}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {row.note === '' ? null : (
        <p class="hist-note" data-el="history-record-note">
          {row.note}
        </p>
      )}
    </section>
  );
}

/** What the destination is doing, so a control can say so and refuse a second press. */
type Busy = 'none' | 'export' | 'import';

const BUSY_WORD: Readonly<Record<Busy, string>> = {
  none: '',
  export: 'The export is running.',
  import: 'The import is running.',
};

/**
 * The history destination.
 *
 * `onBack` leaves it. From the record the back control returns to the summary
 * first, because the record is a view of the destination and not a third one.
 */
export function History({
  entries,
  failure,
  onBack,
  onImport,
}: {
  entries: readonly LogEntry[];
  /** Why the log could not be opened, or null while it is open. */
  failure: string | null;
  onBack: () => void;
  /**
   * Write an imported log over the stored one. It answers the reason it could
   * not, or null when the log was written. The store belongs to the
   * application, so the destination hands the rolls over rather than opening a
   * second connection.
   */
  onImport: (imported: readonly LogEntry[]) => Promise<string | null>;
}) {
  const rows = historyRows(entries);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = rows.find((row) => row.rollId === openId) ?? null;
  const back = useRef<HTMLButtonElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<Busy>('none');
  const [message, setMessage] = useState('');
  // The destination takes the focus when it opens, so a keyboard lands on it
  // rather than back at the top of a screen it can no longer see. It takes the
  // focus again when a record opens or closes, because the option the player
  // pressed leaves the document with the focus on it, and a focus on nothing
  // sends the next Tab back to the start of the page.
  useEffect(() => back.current?.focus(), [openId]);

  /**
   * Write the whole log to a file.
   *
   * `exportCsvInChunks` hands the thread back between chunks, so a
   * campaign-sized log does not freeze the tab. Unit 4.5 measured the ceiling
   * and `scripts/browser.mjs --log-csv` holds it on every run.
   */
  const runExport = async (): Promise<void> => {
    setBusy('export');
    setMessage('');
    try {
      const made = await exportCsvInChunks(entries);
      const name = exportFileName(new Date());
      const offered = downloadBlob(made.blob, name, document);
      setMessage(
        offered
          ? `The log went to ${name}. It holds ${plural(entries.length, 'roll', 'rolls')}.`
          : 'This browser cannot save a file from a page. Open the application in another browser.',
      );
    } catch (error) {
      setMessage(`The export stopped. ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusy('none');
    }
  };

  /**
   * Read a picked file into the log.
   *
   * `readImportFile` judges the SIZE OF THE FILE before it reads a byte of it,
   * and it answers a refusal rather than throwing. An import replaces the log,
   * which Unit 4.6 settled and which the button says.
   */
  const onPicked = async (event: Event): Promise<void> => {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    // The same file picked twice must fire a second change event.
    input.value = '';
    if (file === null) return;
    setBusy('import');
    setMessage('');
    const outcome = await readImportFile(file);
    if (outcome.kind === 'refused') {
      setMessage(outcome.reason);
      setBusy('none');
      return;
    }
    const refused = await onImport(outcome.entries);
    setMessage(
      refused === null
        ? `The log now holds ${plural(outcome.entries.length, 'roll', 'rolls')}, from ${file.name}.`
        : refused,
    );
    setBusy('none');
  };

  const working = busy !== 'none';

  return (
    <div class="screen history" data-el="history">
      <header class="shell-h" data-el="history-header">
        <div class="statusline">
          <span class="hist-title">History</span>
          <span class="sr-only">
            {open === null ? logCountLine(rows.length) : `The roll of ${open.when}.`}
          </span>
          <span class="st-item st-dim" aria-hidden="true">
            {open === null ? logCountLine(rows.length) : open.when}
          </span>
        </div>
      </header>

      <main class="shell-m" data-el="history-mid">
        {failure === null ? null : (
          <p class="fall-note" data-el="history-failure" role="status">
            {failure}
          </p>
        )}
        {/* What the export or the import answered. It is in the document from
            the first paint and carries no text, so it is a live region a reader
            is already watching when the answer arrives. It holds no tab stop.
            A refusal quotes the file, so it is drawn as text. Constraint 8. */}
        <p class="hist-msg" data-el="history-message" role="status">
          {message === '' ? BUSY_WORD[busy] : message}
        </p>
        {/* The plan's interface note. It carries a role, so a screen reader
            announces it as a note rather than as loose text. */}
        <p class="hist-warn" data-el="history-storage-note" role="note">
          {SEVEN_DAY_NOTE}
        </p>
        {open === null ? (
          rows.length === 0 ? (
            <p class="hist-empty" data-el="history-empty">
              No roll is in the log. Throw the dice to fill it, or import a log you exported before.
            </p>
          ) : (
            <HistoryList rows={rows} openId={openId} onOpen={setOpenId} />
          )
        ) : (
          <HistoryRecord row={open} />
        )}
      </main>

      <div class="shell-f" data-el="history-footer">
        <div class="bar two">
          <button
            class="btn go"
            type="button"
            data-el="back-button"
            aria-disabled={working}
            disabled={working}
            ref={back}
            onClick={() => (open === null ? onBack() : setOpenId(null))}
          >
            Back
            <small>{open === null ? 'to the dice' : 'to the list'}</small>
          </button>
          {open === null ? (
            <>
              <button
                class="btn"
                type="button"
                data-el="import-button"
                aria-disabled={working}
                aria-busy={busy === 'import'}
                disabled={working}
                onClick={() => picker.current?.click()}
              >
                Import
                <small>it replaces this log</small>
              </button>
              {/* The picker itself is not a control of section 3. It carries no
                  tab stop and the button above opens it, so the keyboard count
                  of the summary stays at the three the design names. */}
              <input
                class="sr-file"
                type="file"
                accept=".csv,text/csv"
                tabIndex={-1}
                aria-hidden="true"
                data-el="import-file"
                ref={picker}
                onChange={(event) => void onPicked(event)}
              />
            </>
          ) : (
            <button
              class="btn"
              type="button"
              data-el="export-button"
              aria-disabled={working}
              aria-busy={busy === 'export'}
              disabled={working}
              onClick={() => void runExport()}
            >
              Export
              <small>{plural(entries.length, 'roll', 'rolls')}, as a CSV file</small>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
