// @vitest-environment jsdom
//
// The history destination — Units 4.4, 4.5 and 4.6.
//
// Each claim here needs a document: the summary and the record hold exactly the
// controls the design names, the list is a composite the arrow keys walk, the
// transposed matrix is a real table with the cell count and the blank count row
// 2.2d of `LEDGER.md` fixes, the export writes the bytes the chunked writer
// builds, the import refuses a file on its own size, and the player's own note
// is text and never markup.
//
// **The control list is READ from `docs/design/0002-screen-design.md`**, from
// the subsection "The history is a separate destination", and never restated
// here. A design that renamed a control turns this file red rather than passing
// against a copy of the old name.
//
// What is NOT here: whether the entries reached IndexedDB, and whether the file
// the browser saved is the file the writer built. A rendered list can agree with
// the state that fed it, so the store is read back and the download is
// intercepted in a real browser by `node scripts/browser.mjs --history`.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render } from 'preact';
import { useState } from 'preact/hooks';
import { act } from 'preact/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { csvParts, exportCsvInChunks, MAX_IMPORT_BYTES } from '../log/csv';
import type { LogEntry } from '../log/entry';
import { PUSH_PROFILES } from '../rules/push-profile';
import type { Fault } from './faults';
import { faultOf, faultsOf } from './faults';
import {
  costReading,
  History,
  historyRows,
  logCountLine,
  recordMatrix,
  rollWhen,
  rulesetName,
  SEVEN_DAY_NOTE,
  storageLine,
} from './history';

const DESIGN = readFileSync(resolve(process.cwd(), 'docs/design/0002-screen-design.md'), 'utf8');

/**
 * The controls the design gives each history view, read out of its own table.
 *
 * The subsection runs from its heading to the next one. Each row of the table
 * names a view, its controls in backticks, and the count. The count is read as
 * well, so the table cannot disagree with itself.
 */
function designControls(view: string): { names: readonly string[]; count: number } {
  const from = DESIGN.indexOf('### The history is a separate destination');
  const to = DESIGN.indexOf('###', from + 1);
  expect(from, 'the design names the history as a separate destination').toBeGreaterThan(-1);
  const section = DESIGN.slice(from, to);
  const row = section
    .split('\n')
    .find((line) => line.trim().startsWith(`| ${view}`) || line.trim().startsWith(`|${view}`));
  expect(row, `the design table holds a row for the ${view} view`).toBeDefined();
  const cells = (row ?? '').split('|').map((cell) => cell.trim());
  const names = [...(cells[2] ?? '').matchAll(/`([a-z-]+)`/g)].map((match) => match[1] as string);
  const count = Number(cells[3]);
  expect(names.length, `the ${view} row names its controls`).toBeGreaterThan(0);
  expect(count, `the ${view} row states its own count`).toBe(names.length);
  return { names, count };
}

/** One entry, with every field the summary and the record read. */
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
    successes: 1 + at,
    banes: 1,
    pushCount: at % 3,
    costType: 'complicationCheck',
    costAmount: 0,
    stressBefore: at,
    stressAfter: at + 1,
    note: '',
    ...over,
  };
}

/**
 * A pushed roll, of the shape `createLogEntry` writes.
 *
 * Every case the matrix has to draw is in it and each one is named:
 *
 * - `At1` locks at the first throw, so the two later cells are its carry.
 * - `Sk1` locks at the second, so the third cell is its carry.
 * - `Ge1` never locks, so all three cells are throws.
 * - `St1` joins at the second generation, so its first cell is absent.
 *
 * A locked die repeats its own value, which `specs/0001-rules-model.md`
 * requires and which the check below asserts over the fixture rather than
 * trusting.
 */
function pushedEntry(over: Partial<LogEntry> = {}): LogEntry {
  return entry(7, {
    dice: [
      {
        type: 'attribute',
        faces: 6,
        cells: [
          { value: 6, successes: 1, locked: true },
          { value: 6, successes: 1, locked: true },
          { value: 6, successes: 1, locked: true },
        ],
      },
      {
        type: 'skill',
        faces: 6,
        cells: [
          { value: 3, successes: 0, locked: false },
          { value: 6, successes: 1, locked: true },
          { value: 6, successes: 1, locked: true },
        ],
      },
      {
        type: 'gear',
        faces: 6,
        cells: [
          { value: 2, successes: 0, locked: false },
          { value: 4, successes: 0, locked: false },
          { value: 1, successes: 0, locked: false },
        ],
      },
      {
        type: 'stress',
        faces: 6,
        cells: [
          null,
          { value: 2, successes: 0, locked: false },
          { value: 1, successes: 0, locked: false },
        ],
      },
    ],
    successes: 2,
    banes: 2,
    pushCount: 2,
    ...over,
  });
}

/**
 * The blank cells of one entry, counted straight off the stored cells.
 *
 * This is the SECOND count row 2.2d asks for. It never reads the matrix and
 * never reads the document: it walks the entry with its own loop, so a matrix
 * that agreed with itself still fails against it.
 */
function blanksIn(held: LogEntry): { cells: number; kept: number; absent: number } {
  const generations = held.dice.reduce((longest, die) => Math.max(longest, die.cells.length), 0);
  let kept = 0;
  let absent = 0;
  for (const die of held.dice) {
    for (let generation = 0; generation < generations; generation += 1) {
      const cell = die.cells[generation] ?? null;
      if (cell === null) {
        absent += 1;
        continue;
      }
      const before = generation === 0 ? null : (die.cells[generation - 1] ?? null);
      if (before !== null && before.locked) kept += 1;
    }
  }
  return { cells: held.dice.length * generations, kept, absent };
}

let root: HTMLElement | null = null;
let imported: (readonly LogEntry[])[] = [];
/** True while the store accepts an imported log. False makes it refuse one. */
let importAccepts = true;

/**
 * The application, in as much as the destination needs of it — Unit 4.10.
 *
 * `src/app.tsx` holds the fault list and hands it down, and the destination
 * raises the import fault back up. A test that passed a hand-made banner would
 * prove the words and never the wiring, so this stands in for the application
 * and keeps the same two directions.
 */
function Host({ entries, log }: { entries: readonly LogEntry[]; log: Fault | null }) {
  const [importFault, setImportFault] = useState<Fault | null>(null);
  const [logFault, setLogFault] = useState<Fault | null>(log);
  return (
    <History
      entries={entries}
      drawn={faultsOf({
        table: null,
        log: logFault,
        imported: importFault,
        settingsRefused: false,
      })}
      onBack={() => undefined}
      onFault={setImportFault}
      onImport={(held) => {
        imported.push(held);
        // The application raises the log fault itself when the store refuses an
        // imported log, exactly as `importLog` in `src/app.tsx` does.
        if (!importAccepts) setLogFault(faultOf('log-full'));
        return Promise.resolve(importAccepts);
      }}
    />
  );
}

function mount(entries: readonly LogEntry[], log: Fault | null = null): HTMLElement {
  root = document.createElement('div');
  document.body.appendChild(root);
  act(() => render(<Host entries={entries} log={log} />, root as HTMLElement));
  return root;
}

/** Open the record of the newest roll, the way a player does. */
function openRecord(): HTMLElement {
  const row = element('history-row-0');
  row.focus();
  press(row, 'Enter');
  return element('history-record');
}

afterEach(() => {
  if (root !== null) {
    act(() => render(null, root as HTMLElement));
    root.remove();
    root = null;
  }
  imported = [];
  importAccepts = true;
  vi.restoreAllMocks();
});

function element(name: string): HTMLElement {
  const found = document.querySelector<HTMLElement>(`[data-el="${name}"]`);
  if (found === null) throw new Error(`the destination holds no ${name}`);
  return found;
}

/** Every tab stop, in document order. jsdom runs no sequential navigation. */
function tabStops(root: ParentNode): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>('*')].filter(
    (each) => each.tabIndex >= 0 && !each.hasAttribute('disabled'),
  );
}

function press(target: Element, key: string): void {
  act(() => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  });
}

/** The composite a tab stop belongs to, found by walking up as section 6 does. */
function compositeOf(element: Element): string {
  const held = element.closest<HTMLElement>('[data-composite]');
  return (held ?? (element as HTMLElement)).dataset.el ?? '';
}

describe('the history summary', () => {
  it('holds exactly the controls the design names, and each one carries a role, a name and a state', () => {
    const wanted = designControls('Summary');
    mount([entry(0), entry(1), entry(2)]);
    const stops = tabStops(document.body);
    // The design table is an inventory and not an order, so the two lists are
    // compared as sets. The order is section 6's rule — header, then middle,
    // then footer — and the list sits in the middle where the back control
    // sits in the footer.
    const names = stops.map(compositeOf).slice().sort();
    expect(names, 'the summary holds the design’s two controls, and no third').toEqual(
      wanted.names.slice().sort(),
    );
    expect(stops.length, 'one tab stop per control: the list is a composite').toBe(wanted.count);

    // The list is one control. Every option inside it still carries a role, an
    // accessible name and a state, because a player reads the option and not
    // the container.
    const list = element('history-list');
    expect(list.getAttribute('role')).toBe('listbox');
    expect(list.getAttribute('aria-label')).toBe('Past rolls');
    const options = [...list.querySelectorAll('[role="option"]')];
    expect(options.length, 'one option per logged roll').toBe(3);
    const unnamed = options.filter((each) => (each.getAttribute('aria-label') ?? '') === '');
    const stateless = options.filter((each) => each.getAttribute('aria-selected') === null);
    expect(unnamed.length, 'every option carries an accessible name').toBe(0);
    expect(stateless.length, 'every option carries a state').toBe(0);

    const back = element('back-button');
    expect(back.tagName).toBe('BUTTON');
    expect(back.textContent).toContain('Back');
  });

  it('draws one visit per logged roll, so its length follows the log', () => {
    for (const held of [1, 2, 7, 23]) {
      const entries = Array.from({ length: held }, (_, at) => entry(at));
      mount(entries);
      const drawn = document.querySelectorAll('[data-el="history-list"] [role="option"]').length;
      // The denominator is counted a second way: the entries handed in, and the
      // rows the pure builder derives from them.
      expect(drawn, `a log of ${held} rolls draws ${held} visits`).toBe(entries.length);
      expect(drawn).toBe(historyRows(entries).length);
      expect(element('history-header').textContent).toContain(logCountLine(held));
      act(() => render(null, root as HTMLElement));
      root?.remove();
      root = null;
    }
  });

  it('walks the list with the arrow keys alone, from one tab stop', () => {
    mount([entry(0), entry(1), entry(2)]);
    const list = element('history-list');
    const options = [...list.querySelectorAll<HTMLElement>('[role="option"]')];
    // The roving tab index sits on exactly one option, which is what makes the
    // list one control. Section 2 of the design counts it that way.
    expect(options.filter((each) => each.tabIndex === 0).length).toBe(1);

    options[0]?.focus();
    expect(document.activeElement).toBe(options[0]);
    const reached: string[] = [];
    for (let taken = 0; taken < options.length; taken += 1) {
      const at = document.activeElement as HTMLElement;
      reached.push(at.dataset.el ?? '');
      press(at, 'ArrowDown');
    }
    expect(reached, 'the arrows reach every row and wrap').toEqual([
      'history-row-0',
      'history-row-1',
      'history-row-2',
    ]);
    expect(document.activeElement).toBe(options[0]);

    // Enter opens the record. The record is the smallest shell this unit
    // builds: Unit 4.5 adds the matrix and the export control to it.
    press(document.activeElement as HTMLElement, 'Enter');
    expect(document.querySelector('[data-el="history-record"]')).not.toBeNull();
    expect(document.querySelector('[data-el="history-list"]')).toBeNull();
    // The focus never lands on nothing: the record takes it on its back button.
    expect((document.activeElement as HTMLElement).dataset.el).toBe('back-button');
    // The record holds its own two controls, read out of the design.
    expect(
      tabStops(document.body)
        .map((each) => each.dataset.el)
        .sort(),
    ).toEqual(designControls('Record').names.slice().sort());
  });

  it('says what a phone does to the log, and prompts an export', () => {
    mount([entry(0)]);
    const note = element('history-storage-note');
    // The claim is the plan's: iOS deletes script-writable storage after seven
    // days without a visit unless the site is installed to the home screen.
    expect(note.getAttribute('role'), 'the note carries a role').toBe('note');
    expect(note.textContent).toBe(SEVEN_DAY_NOTE);
    expect(note.textContent).toContain('seven days');
    expect(note.textContent).toContain('home screen');
    expect(note.textContent?.toLowerCase(), 'the plan asks for an export prompt').toContain(
      'export',
    );
    expect(note.getBoundingClientRect, 'the note is in the document').toBeDefined();
  });

  it('draws the player’s note as text, and no parser ever sees it', () => {
    // Constraint 8. A log note is user text.
    const risky = `<img src=x onerror=1><b>bold</b> & 'single' "double" \u{1F3B2}`;
    mount([entry(0, { note: risky })]);
    const row = element('history-row-0');
    const drawn = row.querySelector('.hist-note');
    expect(drawn?.textContent).toBe(risky);
    expect([...(drawn?.textContent ?? '')].length).toBe([...risky].length);
    expect(drawn?.querySelectorAll('*').length, 'the markup made no element').toBe(0);
    expect(drawn?.childNodes.length, 'the note is one text node').toBe(1);
    expect(document.querySelectorAll('[data-el="history"] img, [data-el="history"] b').length).toBe(
      0,
    );
  });

  it('draws a sentence and no list when the log is empty', () => {
    mount([]);
    expect(document.querySelector('[data-el="history-list"]'), 'no dead tab stop').toBeNull();
    expect(element('history-empty').textContent).toContain('No roll is in the log');
    // Every summary control except the list, which an empty log does not draw.
    // The import stays, because an empty log is the state a player imports from.
    expect(
      tabStops(document.body)
        .map((each) => each.dataset.el)
        .sort(),
    ).toEqual(
      designControls('Summary')
        .names.filter((name) => name !== 'history-list')
        .slice()
        .sort(),
    );
  });

  it('says why the log did not open, in the one live region', () => {
    // Unit 4.10. The destination replaces the roll flow, so a fault raised on
    // the dice screen has to be readable here or it is never read at all.
    mount([], faultOf('log-refused'));
    const banner = element('fault-banner');
    expect(banner.getAttribute('role'), 'the banner is the live region').toBe('alert');
    expect(banner.getAttribute('aria-label'), 'and it carries a name').toBe('Problems');
    const said = element('log-fault-note');
    expect(said.textContent).toBe(
      'This browser keeps no roll log. The rolls of this session go when the tab closes. ' +
        'Open this application outside a private window to keep a log.',
    );
    expect(
      tabStops(banner).length,
      'the banner holds no tab stop, so neither keyboard walk of section 6 moves',
    ).toBe(0);
  });
});

describe('the record', () => {
  it('reads the stored values of the roll and derives none of them', () => {
    const one = entry(2, { successes: 9, banes: 6, pushCount: 2, stressBefore: 3, stressAfter: 5 });
    mount([one]);
    const record = openRecord();
    const readings = new Map(
      [...record.querySelectorAll<HTMLElement>('[data-reading]')].map((pair) => [
        pair.dataset.reading ?? '',
        pair.querySelector('dd')?.textContent ?? '',
      ]),
    );
    // Every value below is a stored field of the entry. Nothing here recomputes
    // a success from the dice, which is what `specs/0001-rules-model.md`
    // forbids under "Derived values".
    expect(readings.get('Successes')).toBe(String(one.successes));
    expect(readings.get('Banes')).toBe(String(one.banes));
    expect(readings.get('Pushes')).toBe(String(one.pushCount));
    expect(readings.get('Dice')).toBe(String(one.dice.length));
    expect(readings.get('Stress')).toBe(`${one.stressBefore} to ${one.stressAfter}`);
    // The rule set reads as its label and the cost reads in words. Neither is
    // a derived value: the label is a name and the amount is stored.
    expect(readings.get('Rule set')).toBe(rulesetName(one.ruleset));
    expect(readings.get('Rule set')).not.toBe(one.ruleset);
    expect(readings.get('Cost')).toBe(costReading(one.costAmount, one.costType));
    expect(readings.get('Cost')).not.toContain('complicationCheck');
    expect(readings.get('Thrown')).toBe(rollWhen(one.timestampIso));
  });

  it('holds exactly the controls the design names for it, and no third', () => {
    const wanted = designControls('Record');
    mount([pushedEntry()]);
    openRecord();
    const stops = tabStops(document.body);
    expect(
      stops.map(compositeOf).slice().sort(),
      'the record holds the design’s two controls, and no third',
    ).toEqual(wanted.names.slice().sort());
    expect(stops.length).toBe(wanted.count);
    // Every control carries a role, an accessible name and a state. A button is
    // its own role, so the three readings are the tag, the text and `disabled`.
    for (const stop of stops) {
      expect(stop.tagName, `${stop.dataset.el ?? ''} carries a role`).toBe('BUTTON');
      expect((stop.textContent ?? '').trim().length, 'an accessible name').toBeGreaterThan(0);
      expect(stop.getAttribute('aria-disabled'), 'a state a reader can announce').toBe('false');
    }
    // The list is gone with the summary, so the record is not the summary with
    // a second view drawn beside it.
    expect(document.querySelector('[data-el="history-list"]')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// The transposed matrix — Unit 4.5, carrying the two acceptances of row 2.2d
//
// Both counts are taken twice and the second count never reads the matrix. One
// walks the entry for the product, the other walks the entry for the blanks,
// and both are compared against what the DOM drew.
// ---------------------------------------------------------------------------

describe('the transposed matrix', () => {
  it('holds exactly dice by generations cells, with the product taken off the entry', () => {
    const held = pushedEntry();
    mount([held]);
    openRecord();
    const table = element('history-matrix');
    const cells = table.querySelectorAll('tbody td');
    const rows = table.querySelectorAll('tbody tr');
    const columns = table.querySelectorAll('thead th[scope="col"]');

    // The product is computed off the STORED entry, never off the matrix.
    const generations = held.dice.reduce((longest, die) => Math.max(longest, die.cells.length), 0);
    expect(generations, 'the fixture is a pushed roll').toBeGreaterThan(1);
    expect(held.dice.length, 'the fixture holds dice').toBeGreaterThan(0);
    expect(cells.length, 'one cell per die per generation').toBe(held.dice.length * generations);
    expect(rows.length, 'one row per die — the matrix is transposed').toBe(held.dice.length);
    // The corner header is a column header too, so the count is one over.
    expect(columns.length, 'one column per generation, plus the die column').toBe(generations + 1);
  });

  it('draws exactly the locked-or-absent pairs blank, counted a second way', () => {
    const held = pushedEntry();
    mount([held]);
    openRecord();
    const table = element('history-matrix');
    const drawn = {
      blank: table.querySelectorAll('tbody td[data-blank]').length,
      kept: table.querySelectorAll('tbody td[data-cell="kept"]').length,
      absent: table.querySelectorAll('tbody td[data-cell="absent"]').length,
      thrown: table.querySelectorAll('tbody td[data-cell="thrown"]').length,
    };
    const wanted = blanksIn(held);
    expect(wanted.kept, 'the fixture holds a die that locked early').toBeGreaterThan(0);
    expect(wanted.absent, 'the fixture holds a die that joined mid-roll').toBeGreaterThan(0);
    expect(drawn.kept, 'a cell that repeats a locked die').toBe(wanted.kept);
    expect(drawn.absent, 'a cell of a die that did not exist yet').toBe(wanted.absent);
    expect(drawn.blank, 'the blank count is the locked-or-absent count').toBe(
      wanted.kept + wanted.absent,
    );
    // The two kinds partition the cells, so a cell counted twice or missed
    // fails here as well.
    expect(drawn.blank + drawn.thrown).toBe(wanted.cells);

    // A cell drawn as a carry must really be a carry: the model repeats the
    // value of a locked die, so the two values agree.
    const matrix = recordMatrix(held);
    let carries = 0;
    for (const [index, row] of matrix.rows.entries()) {
      for (const [generation, cell] of row.cells.entries()) {
        if (cell.kind !== 'kept') continue;
        carries += 1;
        expect(cell.value, `${row.tag} at generation ${generation} repeats its own value`).toBe(
          held.dice[index]?.cells[generation - 1]?.value,
        );
      }
    }
    expect(carries).toBe(wanted.kept);
  });

  it('is a real table, so a screen reader reaches a cell by its row and its column', () => {
    const held = pushedEntry();
    mount([held]);
    openRecord();
    const table = element('history-matrix');
    expect(table.tagName).toBe('TABLE');
    expect(table.getAttribute('role')).toBe('table');
    expect(
      (table.querySelector('caption')?.textContent ?? '').length,
      'the table is named',
    ).toBeGreaterThan(0);

    const columnIds = new Set(
      [...table.querySelectorAll('thead th[scope="col"]')].map((each) => each.id),
    );
    const rowIds = new Set([...table.querySelectorAll('tbody th[scope="row"]')].map((h) => h.id));
    expect(columnIds.size, 'every column header carries its own identifier').toBe(
      table.querySelectorAll('thead th[scope="col"]').length,
    );
    expect(rowIds.size).toBe(held.dice.length);
    for (const head of table.querySelectorAll('thead th[scope="col"]')) {
      expect(head.getAttribute('role')).toBe('columnheader');
    }
    for (const head of table.querySelectorAll('tbody th[scope="row"]')) {
      expect(head.getAttribute('role')).toBe('rowheader');
    }

    // Every cell names one row header and one column header, and both exist.
    const cells = [...table.querySelectorAll<HTMLElement>('tbody td')];
    let reachable = 0;
    for (const cell of cells) {
      expect(cell.getAttribute('role')).toBe('cell');
      const named = (cell.getAttribute('headers') ?? '').split(' ').filter(Boolean);
      expect(named.length, 'a cell names two headers').toBe(2);
      if (rowIds.has(named[0] ?? '') && columnIds.has(named[1] ?? '')) reachable += 1;
      expect(
        (cell.getAttribute('aria-label') ?? '').length,
        'a cell says what it is',
      ).toBeGreaterThan(0);
    }
    // The denominator is the cell count, and it is not zero.
    expect(cells.length).toBeGreaterThan(0);
    expect(reachable, 'every cell is reachable by its row and its column').toBe(cells.length);

    // Section 3 lists the matrix under the read-only parts, so nothing inside
    // it holds a tab stop.
    expect(tabStops(table).length, 'the matrix is read-only').toBe(0);
  });

  it('names each generation, and the first one is the throw', () => {
    const matrix = recordMatrix(pushedEntry());
    expect(matrix.columns.map((column) => column.head)).toEqual(['Throw', 'Push 1', 'Push 2']);
    // A logged die carries no identifier, so the tag is counted inside its type
    // over the order the roll holds.
    expect(matrix.rows.map((row) => row.tag)).toEqual(['At1', 'Sk1', 'Ge1', 'St1']);
  });
});

// ---------------------------------------------------------------------------
// The export — Unit 4.5
// ---------------------------------------------------------------------------

describe('the export control', () => {
  it('writes the whole log, byte for byte what the chunked writer builds', async () => {
    const log = [entry(0), pushedEntry(), entry(2, { note: '=1+1' })];
    // jsdom has no object-URL support, so the two calls are counted here and
    // the blob the page handed over is kept.
    const offered: Blob[] = [];
    const names: string[] = [];
    const url = globalThis.URL as unknown as {
      createObjectURL?: (blob: Blob) => string;
      revokeObjectURL?: (url: string) => void;
    };
    url.createObjectURL = (blob: Blob): string => {
      offered.push(blob);
      return 'blob:test';
    };
    url.revokeObjectURL = (): void => undefined;
    const clicked = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      names.push(this.download);
    });

    mount(log);
    openRecord();
    const button = element('export-button');
    expect(button.textContent).toContain('3 rolls');
    await act(async () => {
      button.click();
      await new Promise((done) => setTimeout(done, 20));
    });

    expect(clicked, 'the browser was asked to save a file').toHaveBeenCalledTimes(1);
    expect(offered.length).toBe(1);
    expect(names[0]).toMatch(/^clatter-log-\d{4}-\d{2}-\d{2}-\d{4}\.csv$/);
    const written = await (offered[0] as Blob).text();
    // The oracle is the writer itself, over the same log, and the comparison is
    // byte for byte and not length alone.
    const wanted = await (await exportCsvInChunks(log)).blob.text();
    expect(written.length, 'the file is not empty').toBeGreaterThan(0);
    expect(written.length).toBe(wanted.length);
    expect(written).toBe(wanted);
    // And it is the whole log, not the roll on the screen.
    expect(written).toBe(csvParts(log).join(''));
    for (const held of log) {
      expect(written, `${held.rollId} is in the file`).toContain(held.rollId);
    }
    expect(element('history-message').textContent).toContain('3 rolls');
  });
});

// ---------------------------------------------------------------------------
// The import — Unit 4.6
// ---------------------------------------------------------------------------

describe('the import control', () => {
  /** Hand the picker a file, the way a file picker does. */
  async function pick(file: { name: string; size: number; text: () => Promise<string> }) {
    const input = element('import-file') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    await act(async () => {
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise((done) => setTimeout(done, 20));
    });
  }

  it('opens the picker from the button, and the picker is no tab stop of its own', () => {
    mount([entry(0)]);
    const input = element('import-file') as HTMLInputElement;
    const opened = vi.spyOn(input, 'click').mockImplementation(() => undefined);
    expect(input.tabIndex, 'the picker is not in the tab order').toBeLessThan(0);
    expect(input.getAttribute('type')).toBe('file');
    expect(input.getAttribute('accept')).toContain('csv');
    element('import-button').click();
    expect(opened).toHaveBeenCalledTimes(1);
  });

  it('hands a read log to the application, and says how many rolls arrived', async () => {
    const log = [entry(0), pushedEntry()];
    const text = csvParts(log).join('');
    mount([entry(9)]);
    await pick({
      name: 'campaign.csv',
      size: new TextEncoder().encode(text).length,
      text: () => Promise.resolve(text),
    });
    expect(imported.length, 'the application was handed the rolls once').toBe(1);
    expect(imported[0]).toEqual(log);
    expect(element('history-message').textContent).toContain('2 rolls');
    expect(element('history-message').textContent).toContain('campaign.csv');
  });

  it('refuses an oversized file on its own size, and never reads it', async () => {
    let reads = 0;
    mount([entry(0)]);
    await pick({
      name: 'huge.csv',
      size: MAX_IMPORT_BYTES + 1,
      text: () => {
        reads += 1;
        return Promise.resolve('');
      },
    });
    expect(reads, 'a refused file is never read').toBe(0);
    expect(imported.length, 'nothing reached the store').toBe(0);
    const said = element('import-fault-note').textContent ?? '';
    expect(said, 'the refusal names its cause').toContain('too large');
    expect(said).toContain('It holds 32.0 MB (33554433 bytes)');
    expect(said).toContain('The limit is 32.0 MB (33554432 bytes)');
    expect(said, 'and it names what to do next').toContain('Pick another file.');
  });

  it('says why a file that is not a log did not import', async () => {
    mount([entry(0)]);
    await pick({
      name: 'shopping.csv',
      size: 20,
      text: () => Promise.resolve('name,age\r\nada,36\r\n'),
    });
    expect(imported.length).toBe(0);
    expect(element('import-fault-note').textContent).toContain(
      'The first line of this file is not the one this application writes.',
    );
  });

  it('says why the store refused a log that read cleanly', async () => {
    const text = csvParts([entry(0)]).join('');
    importAccepts = false;
    mount([entry(9)]);
    await pick({
      name: 'campaign.csv',
      size: new TextEncoder().encode(text).length,
      text: () => Promise.resolve(text),
    });
    expect(imported.length, 'the file parsed, so the rolls reached the store').toBe(1);
    // The file was well formed, so the import fault stays clear and the log
    // fault carries the answer. The two slots are apart on purpose: a player
    // must tell a bad file from a full disk.
    expect(element('import-fault-note').textContent, 'the file was not the fault').toBe('');
    expect(element('log-fault-note').textContent).toBe(
      'The storage is full. This roll is not in the log. ' +
        'Make room on this device. Then reload this page.',
    );
    expect(element('history-message').textContent, 'and nothing claims a log was written').toBe('');
  });

  it('quotes nothing out of a malformed file, and draws the file name as text', async () => {
    // Constraint 8 and Unit 4.10, together. A malformed import can carry
    // hostile text, and this is where that text would be printed back at the
    // player. Two claims, and they are different claims:
    //
    //   1. The refusal quotes NOTHING out of the file. The parser's message
    //      names a column, and a column name is both an identifier and, in a
    //      file the player did not write, whatever the file says it is.
    //   2. The file NAME is still drawn, because a player picked it and needs
    //      to know which file answered. It is user text and it goes through
    //      `textContent`, so no parser ever sees it.
    const risky = '<img src=x onerror=1>';
    mount([entry(0)]);
    await pick({
      name: 'x.csv',
      size: 40,
      text: () => Promise.resolve(`${risky},age\r\n`),
    });
    const said = element('import-fault-note');
    expect(said.textContent, 'the refusal quotes no part of the file').not.toContain(risky);
    expect(said.textContent, 'and it quotes no column name at all').not.toContain('age');
    expect(said.querySelectorAll('*').length, 'and it draws one span at most').toBeLessThan(2);
    expect(document.querySelectorAll('[data-el="history"] img').length).toBe(0);

    // The name of a file the player picked is drawn, and it is user text.
    act(() => render(null, root as HTMLElement));
    imported = [];
    const text = csvParts([entry(0)]).join('');
    mount([entry(0)]);
    await pick({
      name: `${risky}.csv`,
      size: new TextEncoder().encode(text).length,
      text: () => Promise.resolve(text),
    });
    const answered = element('history-message');
    expect(answered.textContent, 'the name is drawn').toContain(risky);
    expect(answered.querySelectorAll('*').length, 'the markup made no element').toBe(0);
    expect(document.querySelectorAll('[data-el="history"] img').length).toBe(0);
  });
});

describe('the summary rows', () => {
  it('lists the newest roll first, and reads every figure off the entry', () => {
    const entries = [entry(0), entry(1), entry(2)];
    const rows = historyRows(entries);
    expect(rows.length).toBe(entries.length);
    expect(rows.map((row) => row.rollId)).toEqual(['r-2', 'r-1', 'r-0']);
    for (const [at, row] of rows.entries()) {
      const source = entries[entries.length - 1 - at];
      expect(source).toBeDefined();
      if (source === undefined) continue;
      expect(row.successes).toBe(source.successes);
      expect(row.banes).toBe(source.banes);
      expect(row.pushes).toBe(source.pushCount);
      expect(row.dice).toBe(source.dice.length);
      expect(row.profileHash).toBe(source.profileHash);
      expect(row.label).toContain(rollWhen(source.timestampIso));
    }
  });

  it('says what the storage estimate says, and says when there is none', () => {
    expect(storageLine(null)).toBe('This browser reports no storage estimate.');
    expect(storageLine({ usage: null, quota: null })).toBe(
      'This browser reports no storage estimate.',
    );
    expect(storageLine({ usage: 1048576, quota: null })).toBe('This site uses 1.0 MB.');
    expect(storageLine({ usage: 28747688, quota: 8390139904 })).toBe(
      'This site uses 27.4 MB of 8001.5 MB.',
    );
  });

  it('names every cost unit and every shipped rule set in words', () => {
    // The denominator is the union itself, read off the shipped profiles rather
    // than listed here, so a fifth cost unit or a fifth preset fails this.
    const units = [...new Set(PUSH_PROFILES.map((profile) => profile.cost.unit))];
    expect(units.length).toBeGreaterThan(1);
    for (const unit of units) {
      expect(costReading(1, unit), `one ${unit}`).not.toContain(unit);
      expect(costReading(2, unit), `two ${unit}`).not.toContain(unit);
      expect(costReading(1, unit)).toMatch(/^1 [a-z ]+$/);
    }
    for (const profile of PUSH_PROFILES) {
      expect(rulesetName(profile.id)).toBe(profile.label);
      expect(rulesetName(profile.id)).not.toBe(profile.id);
    }
    expect(rulesetName('a-profile-this-build-does-not-ship')).toBe(
      'a-profile-this-build-does-not-ship',
    );
  });

  it('answers a timestamp it cannot read', () => {
    expect(rollWhen('not a time')).toBe('unknown time');
  });
});
