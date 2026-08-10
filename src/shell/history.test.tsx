// @vitest-environment jsdom
//
// The history destination — Unit 4.4.
//
// Four claims live here and each one needs a document: the summary holds
// exactly the two controls the design names, the list is a composite the arrow
// keys walk, the seven-day note reaches the player, and the player's own note is
// text and never markup.
//
// **The control list is READ from `docs/design/0002-screen-design.md`**, from
// the subsection "The history is a separate destination", and never restated
// here. A design that renamed a control turns this file red rather than passing
// against a copy of the old name.
//
// What is NOT here: whether the entries reached IndexedDB. A rendered list can
// agree with the state that fed it, so the store is read back in a real browser
// by `node scripts/browser.mjs --history`.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import type { LogEntry } from '../log/entry';
import { PUSH_PROFILES } from '../rules/push-profile';
import {
  costReading,
  History,
  historyRows,
  logCountLine,
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

let root: HTMLElement | null = null;

function mount(entries: readonly LogEntry[], failure: string | null = null): HTMLElement {
  root = document.createElement('div');
  document.body.appendChild(root);
  act(() =>
    render(
      <History entries={entries} failure={failure} onBack={() => undefined} />,
      root as HTMLElement,
    ),
  );
  return root;
}

afterEach(() => {
  if (root !== null) {
    act(() => render(null, root as HTMLElement));
    root.remove();
    root = null;
  }
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
    expect(tabStops(document.body).map((each) => each.dataset.el)).toEqual(['back-button']);
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
    expect(tabStops(document.body).map((each) => each.dataset.el)).toEqual(['back-button']);
  });

  it('says why the log did not open, in a live region', () => {
    mount([], 'The log did not open.');
    const failure = element('history-failure');
    expect(failure.getAttribute('role')).toBe('status');
    expect(failure.textContent).toBe('The log did not open.');
  });
});

describe('the record shell', () => {
  it('reads the stored values of the roll and derives none of them', () => {
    const one = entry(2, { successes: 9, banes: 6, pushCount: 2, stressBefore: 3, stressAfter: 5 });
    mount([one]);
    const row = element('history-row-0');
    row.focus();
    press(row, 'Enter');
    const record = element('history-record');
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
    // Unit 4.5 owns the transposed matrix and the export control. Neither is
    // here, and the ledger row says so.
    expect(document.querySelector('[data-el="export-button"]')).toBeNull();
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
