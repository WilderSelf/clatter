// @vitest-environment jsdom
//
// The charts over the log — Unit 4.7, the view half.
//
// Six claims, and each one carries a denominator that can fail:
//
//   1. The chart draws every field of the record and nothing else. The record
//      is the oracle, the paths are enumerated here rather than read off the
//      screen, and the two counts are compared.
//   2. The chart re-derives nothing. The destination is handed a record that
//      disagrees with its own log on every field, and the screen follows the
//      record. The disagreement itself is counted, so no field can pass by
//      coincidence.
//   3. Shape carries every meaning colour carries. The glyph of each series is
//      read out of the stylesheet, and no chart holds two series of one shape.
//   4. A reader reaches every value the chart drew. Reachability is resolved
//      through the table headers and the description terms, never assumed, and
//      the count is compared against the record.
//   5. Every chart colour clears its WCAG 2.2 floor, over the shipped
//      stylesheet and over all six interface palettes of Unit 4.8.
//   6. An empty log cannot pass silently. Three degenerate cases answer for
//      themselves.
//
// **The formatting is restated here and never imported from the view.** A
// check that formatted a number through the code that drew it would agree with
// itself. The floors, the palette count and the value paths are all written out
// again for the same reason.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { LogEntry, LoggedDie } from '../log/entry';
import type { LogStatistics } from '../log/statistics';
import type { Faces } from '../rules/die';
import type { PushCostUnit } from '../rules/push-profile';
import { contrastRatio } from '../theme/contrast';
import type { InterfacePalette } from '../theme/themes';
import { PALETTE_ROLES } from '../theme/css-vars';
import { INTERFACE_PALETTES, THEME_IDS } from '../theme/themes';
import { History } from './history';
import type { SeriesId } from './statistics';
import { CHART_SERIES, NO_PUSH_TEXT, NO_ROLL_TEXT, OUTCOME_SERIES } from './statistics';
import { COST_NOUN } from './words';

/**
 * The record the destination hands the charts, when this file wants to choose
 * it. `vi.mock` is hoisted above the imports, so the holder is hoisted too.
 */
const stub = vi.hoisted(() => ({ record: null as LogStatistics | null }));

vi.mock('../log/statistics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../log/statistics')>();
  return {
    ...actual,
    summariseLog: (entries: readonly LogEntry[]): LogStatistics =>
      stub.record ?? actual.summariseLog(entries),
  };
});

/**
 * The real module, beside the mocked one.
 *
 * The honest summary of the fixture is what the doctored record has to
 * disagree with, so this file needs both.
 */
const real = await vi.importActual<typeof import('../log/statistics')>('../log/statistics');

const CSS = readFileSync(resolve(process.cwd(), 'src/shell.css'), 'utf8');
const DESIGN = readFileSync(resolve(process.cwd(), 'docs/design/0002-screen-design.md'), 'utf8');

/** The floors, restated. WCAG 2.2 SC 1.4.3 for text, SC 1.4.11 for a graphic. */
const TEXT_FLOOR = 4.5;
const NON_TEXT_FLOOR = 3;

/** The four cost units, restated. The union is counted against this list. */
const COST_UNITS: readonly PushCostUnit[] = [
  'ratingPoint',
  'healthPoint',
  'refereePoint',
  'complicationCheck',
];

/** The four series, restated, and the seven scalar push fields with them. */
const ALL_SERIES: readonly SeriesId[] = ['success', 'better', 'same', 'worse'];
const PUSH_FIELDS = [
  'pushedRolls',
  'pushes',
  'better',
  'same',
  'worse',
  'successesBefore',
  'successesAfter',
] as const;

// ---------------------------------------------------------------------------
// The fixture log. It is built here, and never through `summariseLog`.
// ---------------------------------------------------------------------------

/** A face worth no successes on any curve, so a re-deriving view answers zero. */
const INERT_FACE = 2;

interface Case {
  readonly name: string;
  readonly poolSize: number;
  /** The successes stored at each generation, oldest first. */
  readonly perGeneration: readonly number[];
  readonly costType: PushCostUnit;
  readonly costAmount: number;
}

function loggedDice(one: Case): LoggedDie[] {
  return Array.from({ length: one.poolSize }, (_unused, die) => ({
    type: 'attribute' as const,
    faces: 6 as Faces,
    cells: one.perGeneration.map((successes) => ({
      value: INERT_FACE,
      successes: die < successes ? 1 : 0,
      locked: false,
    })),
  }));
}

function fixtureEntry(one: Case, at: number): LogEntry {
  const generations = one.perGeneration.length;
  return {
    rollId: `r-${at}`,
    timestampIso: new Date(Date.UTC(2026, 7, 9, 12, at)).toISOString(),
    ruleset: 'pool-banes-damage-ratings',
    profileHash: `${at}`.repeat(64).slice(0, 64),
    mode: 'pool',
    dice: loggedDice(one),
    successes: one.perGeneration[generations - 1] ?? 0,
    banes: 0,
    pushCount: generations - 1,
    costType: one.costType,
    costAmount: one.costAmount,
    stressBefore: 0,
    stressAfter: 0,
    note: '',
  };
}

/**
 * Six rolls, chosen so every drawn quantity is non-zero and no two are equal.
 * Two pool sizes, one push that gained, one that held and one that lost, and
 * three of the four cost units.
 */
const CASES: readonly Case[] = [
  {
    name: 'three dice, no push',
    poolSize: 3,
    perGeneration: [0],
    costType: 'ratingPoint',
    costAmount: 0,
  },
  {
    name: 'three dice, no push, one success',
    poolSize: 3,
    perGeneration: [1],
    costType: 'ratingPoint',
    costAmount: 0,
  },
  {
    name: 'three dice, pushed and gained',
    poolSize: 3,
    perGeneration: [0, 2],
    costType: 'ratingPoint',
    costAmount: 2,
  },
  {
    name: 'five dice, pushed and held',
    poolSize: 5,
    perGeneration: [2, 2],
    costType: 'ratingPoint',
    costAmount: 1,
  },
  {
    name: 'five dice, pushed twice and held',
    poolSize: 5,
    perGeneration: [1, 1, 1],
    costType: 'complicationCheck',
    costAmount: 3,
  },
  {
    name: 'five dice, pushed and lost',
    poolSize: 5,
    perGeneration: [3, 2],
    costType: 'healthPoint',
    costAmount: 1,
  },
];

const FIXTURE: readonly LogEntry[] = CASES.map(fixtureEntry);

/** One roll, no push. The third degenerate case. */
const ONE_ROLL: readonly LogEntry[] = [CASES[1] as Case].map(fixtureEntry);

/** Two rolls, neither pushed. The second degenerate case. */
const NO_PUSHES: readonly LogEntry[] = [CASES[0] as Case, CASES[1] as Case].map(fixtureEntry);

// ---------------------------------------------------------------------------
// The document
// ---------------------------------------------------------------------------

let root: HTMLElement | null = null;
let backPresses = 0;

function mount(entries: readonly LogEntry[]): HTMLElement {
  root = document.createElement('div');
  document.body.appendChild(root);
  act(() =>
    render(
      <History
        entries={entries}
        drawn={[null, null, null, null]}
        onFault={() => undefined}
        onBack={() => {
          backPresses += 1;
        }}
        onImport={() => Promise.resolve(true)}
      />,
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
  stub.record = null;
  backPresses = 0;
  vi.restoreAllMocks();
});

function element(name: string): HTMLElement {
  const found = document.querySelector<HTMLElement>(`[data-el="${name}"]`);
  if (found === null) throw new Error(`the destination holds no ${name}`);
  return found;
}

/** Open the charts the way a player does. */
function openStats(): HTMLElement {
  act(() => element('statistics-button').click());
  return element('history-stats');
}

/** Every tab stop, in document order. jsdom runs no sequential navigation. */
function tabStops(within: ParentNode): HTMLElement[] {
  return [...within.querySelectorAll<HTMLElement>('*')].filter(
    (each) => each.tabIndex >= 0 && !each.hasAttribute('disabled'),
  );
}

/** The controls the design gives one history view, read out of its own table. */
function designControls(view: string): { names: readonly string[]; count: number } {
  const from = DESIGN.indexOf('### The history is a separate destination');
  const to = DESIGN.indexOf('###', from + 1);
  expect(from, 'the design names the history as a separate destination').toBeGreaterThan(-1);
  const row = DESIGN.slice(from, to)
    .split('\n')
    .find((line) => line.trim().startsWith(`| ${view}`));
  expect(row, `the design table holds a row for the ${view} view`).toBeDefined();
  const cells = (row ?? '').split('|').map((cell) => cell.trim());
  const names = [...(cells[2] ?? '').matchAll(/`([a-z-]+)`/g)].map((match) => match[1] as string);
  const count = Number(cells[3]);
  expect(names.length, `the ${view} row names its controls`).toBeGreaterThan(0);
  expect(count, `the ${view} row states its own count`).toBe(names.length);
  return { names, count };
}

// ---------------------------------------------------------------------------
// The oracle: every field of the record, enumerated and formatted here
// ---------------------------------------------------------------------------

/** A rate, in the words the screen must carry. Restated, never imported. */
function percent(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

/**
 * Every field of the record, as the path the screen must carry it under and
 * the exact text it must read.
 *
 * This walk is the second enumeration. It never reads the document.
 */
function wantedValues(stats: LogStatistics): Map<string, string> {
  const wanted = new Map<string, string>();
  wanted.set('entriesRead', String(stats.entriesRead));
  stats.byPoolSize.forEach((row, at) => {
    wanted.set(`byPoolSize.${at}.poolSize`, String(row.poolSize));
    wanted.set(`byPoolSize.${at}.rolls`, String(row.rolls));
    wanted.set(`byPoolSize.${at}.rollsWithASuccess`, String(row.rollsWithASuccess));
    wanted.set(`byPoolSize.${at}.successes`, String(row.successes));
    wanted.set(`byPoolSize.${at}.successRate`, percent(row.successRate));
  });
  for (const field of PUSH_FIELDS) wanted.set(`pushes.${field}`, String(stats.pushes[field]));
  for (const unit of COST_UNITS) {
    wanted.set(`pushes.costByUnit.${unit}`, String(stats.pushes.costByUnit[unit]));
  }
  wanted.set('paidOffRate', stats.paidOffRate === null ? NO_PUSH_TEXT : percent(stats.paidOffRate));
  wanted.set('paidOffDefinition', stats.paidOffDefinition);
  return wanted;
}

/** How many values a record of `rows` pool sizes carries. Counted as a sum. */
function wantedCount(rows: number): number {
  return 1 + rows * 5 + PUSH_FIELDS.length + COST_UNITS.length + 1 + 1;
}

/** Every bar the screen must draw, as a share of its track. */
function wantedBars(stats: LogStatistics): Map<string, number> {
  const bars = new Map<string, number>();
  stats.byPoolSize.forEach((row, at) => {
    bars.set(`byPoolSize.${at}.successRate`, row.successRate);
  });
  if (stats.pushes.pushedRolls > 0) {
    for (const id of OUTCOME_SERIES) {
      bars.set(
        `pushes.${id}`,
        stats.pushes[id as 'better' | 'same' | 'worse'] / stats.pushes.pushedRolls,
      );
    }
  }
  if (stats.paidOffRate !== null) bars.set('paidOffRate', stats.paidOffRate);
  return bars;
}

/** What the document drew, read back out of it. */
function drawnValues(within: ParentNode): Map<string, string> {
  const drawn = new Map<string, string>();
  for (const each of within.querySelectorAll<HTMLElement>('[data-stat]')) {
    const path = each.dataset.stat ?? '';
    expect(drawn.has(path), `${path} is drawn once and not twice`).toBe(false);
    drawn.set(path, (each.textContent ?? '').trim());
  }
  return drawn;
}

/**
 * The length of every bar, read off the drawn geometry as a percentage of its
 * track.
 *
 * The document is the only source. `style.width` is what the browser holds, and
 * jsdom drops a trailing zero from it, so the reading is a number and not the
 * string the view wrote.
 */
function drawnBars(within: ParentNode): Map<string, number> {
  const bars = new Map<string, number>();
  for (const each of within.querySelectorAll<HTMLElement>('[data-bar]')) {
    const width = each.style.width;
    expect(width, `${each.dataset.bar ?? ''} is a share of its track`).toMatch(/^[0-9.]+%$/);
    bars.set(each.dataset.bar ?? '', Number(width.slice(0, -1)));
  }
  return bars;
}

/**
 * The bound on a drawn bar, in percentage points.
 *
 * It comes from the geometry and is not chosen: the view writes the width to
 * three decimal places of a percentage, so a rounded width is at most half of
 * the last place away from the number it carries. The smallest real difference
 * between two bars of the fixture is 25 percentage points, which is fifty
 * thousand times this.
 */
const BAR_BOUND = 0.0005;

// ---------------------------------------------------------------------------
// 1. The record is the oracle
// ---------------------------------------------------------------------------

describe('the charts over the log', () => {
  it('draws every field the record holds, and nothing the record does not', () => {
    expect(COST_UNITS.length, 'the four cost units are the union itself').toBe(
      Object.keys(COST_NOUN).length,
    );
    expect([...COST_UNITS].sort()).toEqual(Object.keys(COST_NOUN).sort());

    mount(FIXTURE);
    const stats = summariseFixture();
    const charts = openStats();
    const wanted = wantedValues(stats);
    const drawn = drawnValues(charts);

    // The denominator, counted a second way: a sum over the shape of the
    // record, not a length taken off the map that was just built.
    expect(stats.byPoolSize.length, 'the fixture holds more than one pool size').toBeGreaterThan(1);
    expect(wanted.size, 'every field of the record is enumerated').toBe(
      wantedCount(stats.byPoolSize.length),
    );
    expect(drawn.size, 'the chart draws one value per field of the record').toBe(wanted.size);

    let matched = 0;
    for (const [path, value] of wanted) {
      expect(drawn.get(path), `${path} reads what the record holds`).toBe(value);
      matched += 1;
    }
    expect(matched, 'every field was compared').toBe(wanted.size);
    // And nothing was drawn that the record does not hold.
    for (const path of drawn.keys()) {
      expect(wanted.has(path), `${path} is a field of the record`).toBe(true);
    }
  });

  it('draws each bar at the length the record fixes, and no bar it cannot fill', () => {
    mount(FIXTURE);
    const stats = summariseFixture();
    const charts = openStats();
    const wanted = wantedBars(stats);
    const drawn = drawnBars(charts);

    // The denominator, counted a second way. A missing bar fails here rather
    // than going unread.
    const expected =
      stats.byPoolSize.length +
      (stats.pushes.pushedRolls > 0 ? OUTCOME_SERIES.length : 0) +
      (stats.paidOffRate === null ? 0 : 1);
    expect(wanted.size, 'every bar is enumerated').toBe(expected);
    expect(drawn.size, 'the chart draws one bar per enumerated value').toBe(wanted.size);
    expect(
      charts.querySelectorAll('.chart-track').length,
      'every bar lies in exactly one track',
    ).toBe(wanted.size);

    let compared = 0;
    for (const [path, fraction] of wanted) {
      const at = drawn.get(path);
      expect(at, `${path} is drawn`).toBeDefined();
      const off = Math.abs((at ?? 0) - fraction * 100);
      expect(
        off,
        `${path} is drawn at ${String(at)} per cent against the ${(fraction * 100).toFixed(4)} ` +
          `the record fixes`,
      ).toBeLessThanOrEqual(BAR_BOUND);
      compared += 1;
    }
    expect(compared, 'every bar was compared against the record').toBe(wanted.size);
    // A bar that filled its track whatever the number was would pass a check
    // that only looked at one row, so the fixture is asserted to hold three
    // different lengths.
    expect(new Set(drawn.values()).size, 'the bars are not all one length').toBeGreaterThan(2);
  });
});

/** The honest summary of the fixture, through the real module. */
function summariseFixture(): LogStatistics {
  // The mock falls through to the real implementation while `stub.record` is
  // null, so this is the same record the screen was handed.
  expect(stub.record, 'this reading is the honest summary').toBeNull();
  return realSummary(FIXTURE);
}

function realSummary(entries: readonly LogEntry[]): LogStatistics {
  return real.summariseLog(entries);
}

// ---------------------------------------------------------------------------
// 2. The chart re-derives nothing
// ---------------------------------------------------------------------------

describe('the charts and the log', () => {
  it('follows the record it was handed, over a log that says otherwise', () => {
    const honest = realSummary(FIXTURE);
    // Every field is moved, and the shape is kept, so every path exists in both
    // records and every one of them disagrees.
    const doctored: LogStatistics = {
      entriesRead: 41,
      byPoolSize: [
        { poolSize: 4, rolls: 9, rollsWithASuccess: 3, successes: 17, successRate: 0.25 },
        { poolSize: 7, rolls: 11, rollsWithASuccess: 6, successes: 23, successRate: 0.5 },
      ],
      pushes: {
        pushedRolls: 8,
        pushes: 13,
        better: 7,
        same: 5,
        worse: 6,
        successesBefore: 19,
        successesAfter: 29,
        costByUnit: {
          ratingPoint: 31,
          healthPoint: 37,
          refereePoint: 43,
          complicationCheck: 47,
        },
      },
      paidOffRate: 0.875,
      paidOffDefinition: 'A definition no module in this repository holds.',
    };
    stub.record = doctored;

    mount(FIXTURE);
    const charts = openStats();
    const wanted = wantedValues(doctored);
    const honestValues = wantedValues(honest);
    const drawn = drawnValues(charts);

    // The two records have the same shape, so no path is missing from either
    // and every disagreement below is a disagreement of value.
    expect([...wanted.keys()].sort(), 'the two records carry the same fields').toEqual(
      [...honestValues.keys()].sort(),
    );
    let disagree = 0;
    for (const [path, value] of wanted) {
      if (honestValues.get(path) !== value) disagree += 1;
    }
    expect(disagree, 'no field of the record agrees with the log it came from').toBe(wanted.size);

    // The screen follows the record. A view that computed one of these numbers
    // off the entries would draw the honest one and fail here by name.
    for (const [path, value] of wanted) {
      expect(drawn.get(path), `${path} follows the record and not the log`).toBe(value);
    }
    expect(drawn.size).toBe(wanted.size);
  });
});

// ---------------------------------------------------------------------------
// 3. Shape carries every meaning colour carries
// ---------------------------------------------------------------------------

/**
 * The declarations of one rule, found by its exact selector.
 *
 * The selector must appear exactly once in the file. Two rules of one selector
 * would let this reader answer with the wrong half of a colour claim.
 */
function cssBlock(selector: string): string {
  const head = `\n${selector} {`;
  const at = CSS.indexOf(head);
  expect(at, `the stylesheet holds a rule for ${selector}`).toBeGreaterThan(-1);
  expect(CSS.indexOf(head, at + 1), `${selector} is written once`).toBe(-1);
  const open = CSS.indexOf('{', at);
  const close = CSS.indexOf('}', open);
  return CSS.slice(open + 1, close);
}

/** The custom property one declaration spends, as `--name`. */
function cssVar(block: string, property: 'color' | 'background'): string {
  const found = new RegExp(`${property}:\\s*var\\((--[a-z-]+)\\)`).exec(block);
  expect(found, `the rule spends a role variable for ${property}`).not.toBeNull();
  return found?.[1] ?? '';
}

/** What makes a glyph the shape it is, as a signature. */
function shapeOf(block: string): string {
  return [...block.matchAll(/(border-radius|clip-path):\s*([^;]+);/g)]
    .map((found) => `${found[1] ?? ''}:${(found[2] ?? '').trim()}`)
    .sort()
    .join(' ');
}

describe('shape, not hue', () => {
  it('gives every series a glyph, and no chart holds two series of one shape', () => {
    const shapes = new Map<SeriesId, string>();
    const inks = new Map<SeriesId, string>();
    for (const id of ALL_SERIES) {
      const glyph = cssBlock(`.cmark.c-${id}`);
      const shape = shapeOf(glyph);
      expect(
        shape.length,
        `the ${id} glyph carries a shape and not a colour alone`,
      ).toBeGreaterThan(0);
      shapes.set(id, shape);
      inks.set(id, cssVar(glyph, 'background'));
      // The glyph and the bar of one series are the same colour, so the legend
      // and the bar cannot drift apart.
      expect(cssVar(cssBlock(`.chart-bar.s-${id}`), 'background'), `the ${id} bar`).toBe(
        inks.get(id),
      );
    }
    expect(shapes.size, 'every series was read').toBe(ALL_SERIES.length);

    // The three push outcomes sit in one chart, so all three differ by shape
    // AND by colour. A greyscale copy still separates them.
    expect(
      new Set(OUTCOME_SERIES.map((id) => shapes.get(id))).size,
      'the three outcomes carry three shapes',
    ).toBe(OUTCOME_SERIES.length);
    expect(
      new Set(OUTCOME_SERIES.map((id) => inks.get(id))).size,
      'the three outcomes carry three colours',
    ).toBe(OUTCOME_SERIES.length);
    // The circle keeps one meaning across the application: it is the good
    // outcome, on a die, in the matrix and here.
    expect(shapes.get('success'), 'a success and a gain are both the circle').toBe(
      shapes.get('better'),
    );

    // In the document: every chart is read for the series it draws, and the
    // shapes inside one chart are as many as the series inside it.
    mount(FIXTURE);
    const charts = openStats();
    let chartsRead = 0;
    for (const chart of charts.querySelectorAll<HTMLElement>('.chart, .chart-meter')) {
      const ids = [...chart.querySelectorAll<HTMLElement>('[data-series]')].map(
        (each) => (each.dataset.series ?? '') as SeriesId,
      );
      if (ids.length === 0) continue;
      chartsRead += 1;
      const inside = new Set(ids);
      expect(
        [...inside].every((id) => ALL_SERIES.includes(id)),
        'every drawn mark names a series this module holds',
      ).toBe(true);
      expect(
        new Set([...inside].map((id) => shapes.get(id))).size,
        'no chart holds two series of one shape',
      ).toBe(inside.size);
    }
    expect(chartsRead, 'every chart that draws a series was read').toBe(3);

    // Every glyph and every bar is decoration, so none of them reaches a
    // reader. The count is the two together and not a sample of one.
    const marks = [...charts.querySelectorAll<HTMLElement>('.cmark, .chart-track')];
    expect(marks.length, 'the charts draw glyphs and tracks').toBeGreaterThan(0);
    expect(
      marks.filter((each) => each.closest('[aria-hidden="true"]') !== null).length,
      'every drawn mark is hidden from a reader',
    ).toBe(marks.length);
  });
});

// ---------------------------------------------------------------------------
// 4. A reader reaches every value
// ---------------------------------------------------------------------------

/**
 * The name a screen reader reaches a value by, or null when it reaches none.
 *
 * A table cell is named by its row header and its column header, resolved
 * through `headers` against the table it sits in. A description value is named
 * by the term beside it. Nothing is assumed: an identifier that names no header
 * answers null and the count falls.
 */
function readerName(each: HTMLElement): string | null {
  if (each.closest('[aria-hidden="true"]') !== null) return null;
  const cell = each.closest<HTMLElement>('td, th, dd');
  if (cell === null) return null;
  if (cell.tagName === 'DD') {
    const terms = [...(cell.parentElement?.querySelectorAll('dt') ?? [])];
    if (terms.length !== 1) return null;
    const term = (terms[0]?.textContent ?? '').trim();
    return term === '' ? null : term;
  }
  const table = cell.closest('table');
  if (table === null) return null;
  const ids = (cell.getAttribute('headers') ?? '').split(' ').filter(Boolean);
  const heads = ids.map((id) => table.querySelector<HTMLElement>(`#${id}`));
  if (heads.some((head) => head === null)) return null;
  const scopes = heads.map((head) => head?.getAttribute('scope') ?? '');
  if (cell.tagName === 'TH') {
    // A row header is named by the column it stands under.
    if (ids.length !== 1 || scopes[0] !== 'col') return null;
  } else if (ids.length !== 2 || scopes[0] !== 'row' || scopes[1] !== 'col') {
    return null;
  }
  return heads.map((head) => (head?.textContent ?? '').trim()).join(', ');
}

describe('a reader without a screen', () => {
  it('reaches every value the chart drew, each one under a name', () => {
    mount(FIXTURE);
    const stats = summariseFixture();
    const charts = openStats();
    const wanted = wantedValues(stats);

    let reached = 0;
    const named = new Set<string>();
    for (const each of charts.querySelectorAll<HTMLElement>('[data-stat]')) {
      const path = each.dataset.stat ?? '';
      const name = readerName(each);
      expect(name, `${path} is reachable by name`).not.toBeNull();
      expect((name ?? '').length, `${path} carries a name with words in it`).toBeGreaterThan(0);
      // The value a reader hears is the value the chart drew.
      expect((each.textContent ?? '').trim(), `${path} reads the same to both`).toBe(
        wanted.get(path),
      );
      named.add(`${name ?? ''} => ${path}`);
      reached += 1;
    }
    // The denominator is the record, counted a second way by the sum.
    expect(reached, 'a reader reaches every field of the record').toBe(wanted.size);
    expect(reached).toBe(wantedCount(stats.byPoolSize.length));
    expect(named.size, 'no two values share one name and one path').toBe(reached);

    // The charts carry no control. Section 3 lists them under the read-only
    // parts of the destination.
    expect(tabStops(charts).length, 'the charts are read-only').toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 5. Contrast
// ---------------------------------------------------------------------------

/**
 * Every colour the charts spend, named by the rule that spends it, the ground
 * it is drawn against, and the WCAG floor it must clear.
 *
 * The colours are not written here. They are read out of `src/shell.css`, so a
 * rule changed to a weaker variable turns these checks red.
 */
const CHART_ROLES: readonly {
  readonly name: string;
  readonly selector: string;
  readonly property: 'color' | 'background';
  readonly ground: 'card' | 'track';
  readonly floor: number;
}[] = [
  {
    name: 'a value in a cell',
    selector: '.chart td',
    property: 'color',
    ground: 'card',
    floor: TEXT_FLOOR,
  },
  {
    name: 'a column label',
    selector: '.chart thead th',
    property: 'color',
    ground: 'card',
    floor: TEXT_FLOOR,
  },
  {
    name: 'a row header',
    selector: ".chart th[scope='row']",
    property: 'color',
    ground: 'card',
    floor: TEXT_FLOOR,
  },
  {
    name: 'the caption',
    selector: '.chart caption',
    property: 'color',
    ground: 'card',
    floor: TEXT_FLOOR,
  },
  {
    name: 'the definition',
    selector: '.chart-note dd',
    property: 'color',
    ground: 'card',
    floor: TEXT_FLOOR,
  },
  ...ALL_SERIES.map((id) => ({
    name: `the ${id} bar`,
    selector: `.chart-bar.s-${id}`,
    property: 'background' as const,
    ground: 'track' as const,
    floor: NON_TEXT_FLOOR,
  })),
  ...ALL_SERIES.map((id) => ({
    name: `the ${id} glyph`,
    selector: `.cmark.c-${id}`,
    property: 'background' as const,
    ground: 'card' as const,
    floor: NON_TEXT_FLOOR,
  })),
];

/** The two grounds, and the rules that paint them. */
const GROUNDS = {
  card: { selector: '.chart', property: 'background' as const },
  track: { selector: '.chart-track', property: 'background' as const },
};

/**
 * The interface token each shipped variable stands for.
 *
 * The open half of Unit 4.8 made this table the real thing rather than a
 * bridge: `src/theme/css-vars.ts` is what the application writes, and this file
 * restates the entries the charts spend, so a role repointed at a weaker token
 * fails here as well as there. A variable with no entry fails the check rather
 * than going unmeasured.
 */
const SHIPPED_ANALOGUE: Readonly<Record<string, keyof InterfacePalette>> = {
  '--raised': 'surface',
  '--sunken': 'sunken',
  '--ink': 'text',
  '--ink-dim': 'textMuted',
  '--accent': 'accent',
};

/**
 * The colours the shipped build paints today, by role.
 *
 * The stylesheet holds none of them, so they are read out of the default
 * interface palette through the same table the application writes. That is the
 * palette `DEFAULT_SETTINGS` names, restated here rather than imported, so the
 * defaults and this file cannot agree by reading one another.
 */
function shippedRoot(): Map<string, string> {
  const palette = INTERFACE_PALETTES.ash;
  const held = new Map<string, string>();
  for (const [role, token] of Object.entries(PALETTE_ROLES)) {
    held.set(role, palette[token]);
  }
  expect(held.size, 'the stylesheet spends its role colours').toBeGreaterThan(0);
  // Every role this file measures is a role the application really writes.
  for (const role of Object.keys(SHIPPED_ANALOGUE)) {
    expect(held.has(role), `${role} is a role the application writes`).toBe(true);
    expect(SHIPPED_ANALOGUE[role], `${role} stands for the token css-vars.ts names`).toBe(
      PALETTE_ROLES[role],
    );
  }
  return held;
}

describe('contrast', () => {
  it('clears the WCAG floors in the palette the application ships today', () => {
    const root = shippedRoot();
    const grounds = {
      card: cssVar(cssBlock(GROUNDS.card.selector), GROUNDS.card.property),
      track: cssVar(cssBlock(GROUNDS.track.selector), GROUNDS.track.property),
    };
    let measured = 0;
    const worst: string[] = [];
    for (const role of CHART_ROLES) {
      const ink = cssVar(cssBlock(role.selector), role.property);
      const groundVar = grounds[role.ground];
      const inkHex = root.get(ink);
      const groundHex = root.get(groundVar);
      expect(inkHex, `${ink} is declared in :root`).toBeDefined();
      expect(groundHex, `${groundVar} is declared in :root`).toBeDefined();
      const ratio = contrastRatio(inkHex ?? '#000000', groundHex ?? '#ffffff');
      expect(
        ratio,
        `${role.name} reads ${ratio.toFixed(2)} to 1 against the ${role.ground}`,
      ).toBeGreaterThanOrEqual(role.floor);
      worst.push(`${role.name} ${ratio.toFixed(2)}`);
      measured += 1;
    }
    expect(measured, 'every chart colour was measured').toBe(CHART_ROLES.length);
    expect(CHART_ROLES.length, 'the role list is not empty').toBe(5 + ALL_SERIES.length * 2);
    expect(worst.length).toBe(measured);
  });

  it('paints each series in the interface colour the module says it takes', () => {
    // `CHART_SERIES` names a token of the interface palette for every series.
    // That name is the claim the palette check below measures, so it has to be
    // the colour the stylesheet really spends. Otherwise the claim is measured
    // over a colour nothing paints with.
    let bound = 0;
    for (const id of ALL_SERIES) {
      const declared = CHART_SERIES[id].ink;
      for (const selector of [`.chart-bar.s-${id}`, `.cmark.c-${id}`]) {
        const spent = SHIPPED_ANALOGUE[cssVar(cssBlock(selector), 'background')];
        expect(spent, `${selector} spends a variable this table maps`).toBe(declared);
        bound += 1;
      }
      expect(CHART_SERIES[id].id, 'the table is keyed by the identifier it holds').toBe(id);
    }
    // Two rules per series, counted as a product.
    expect(bound).toBe(ALL_SERIES.length * 2);
    expect(Object.keys(CHART_SERIES).length, 'the module holds these series and no others').toBe(
      ALL_SERIES.length,
    );
  });

  it('clears the same floors over every interface palette, and the denominator is six', () => {
    const palettes = THEME_IDS;
    expect(palettes.length, 'the interface axis carries six presets').toBe(6);
    expect(Object.keys(INTERFACE_PALETTES).length, 'six rows, counted a second way').toBe(
      palettes.length,
    );
    const grounds = {
      card: cssVar(cssBlock(GROUNDS.card.selector), GROUNDS.card.property),
      track: cssVar(cssBlock(GROUNDS.track.selector), GROUNDS.track.property),
    };

    let measured = 0;
    let tightest = { ratio: Infinity, said: '' };
    for (const id of palettes) {
      const palette = INTERFACE_PALETTES[id];
      for (const role of CHART_ROLES) {
        const ink = SHIPPED_ANALOGUE[cssVar(cssBlock(role.selector), role.property)];
        const ground = SHIPPED_ANALOGUE[grounds[role.ground]];
        expect(ink, `${role.name} spends a variable this table maps`).toBeDefined();
        expect(ground, `the ${role.ground} spends a variable this table maps`).toBeDefined();
        if (ink === undefined || ground === undefined) continue;
        const ratio = contrastRatio(palette[ink], palette[ground]);
        expect(
          ratio,
          `${id}: ${role.name} reads ${ratio.toFixed(2)} to 1 against the ${role.ground}`,
        ).toBeGreaterThanOrEqual(role.floor);
        if (ratio < tightest.ratio) {
          tightest = { ratio, said: `${id} ${role.name} over the ${role.ground}` };
        }
        measured += 1;
      }
    }
    // The denominator is a product, so a loop that ran short cannot pass.
    expect(measured, 'every role over every palette').toBe(palettes.length * CHART_ROLES.length);
    expect(tightest.ratio, `tightest: ${tightest.said}`).toBeGreaterThanOrEqual(NON_TEXT_FLOOR);
  });
});

// ---------------------------------------------------------------------------
// 6. The degenerate cases
// ---------------------------------------------------------------------------

describe('a log with nothing in it', () => {
  it('says an empty log holds nothing, and draws no chart it cannot fill', () => {
    mount([]);
    const stats = realSummary([]);
    const charts = openStats();
    expect(stats.entriesRead, 'the case is the empty log').toBe(0);
    expect(element('stats-empty').textContent).toBe(NO_ROLL_TEXT);
    expect(
      charts.querySelector('[data-el="chart-pool-size"]'),
      'no pool-size chart, because no roll made a row',
    ).toBeNull();
    expect(drawnBars(charts).size, 'no bar, because no share exists').toBe(0);

    // The record still reaches the screen in full, so the denominator holds.
    const drawn = drawnValues(charts);
    expect(drawn.size).toBe(wantedCount(0));
    for (const [path, value] of wantedValues(stats)) {
      expect(drawn.get(path), path).toBe(value);
    }
  });

  it('says a log with no push has no answer, and never says nought per cent', () => {
    mount(NO_PUSHES);
    const stats = realSummary(NO_PUSHES);
    const charts = openStats();
    expect(stats.pushes.pushedRolls, 'the case is a log with no push').toBe(0);
    expect(stats.paidOffRate, 'the record answers null and not zero').toBeNull();

    const said = element('history-stats').querySelector<HTMLElement>('[data-stat="paidOffRate"]');
    expect((said?.textContent ?? '').trim()).toBe(NO_PUSH_TEXT);
    expect(said?.textContent ?? '', 'a sentence, not a rate').not.toContain('%');
    expect(/\d/.test(said?.textContent ?? ''), 'and no number stands in for it').toBe(false);

    // The pool-size chart still draws, and the outcome chart draws no bar.
    expect(charts.querySelector('[data-el="chart-pool-size"]')).not.toBeNull();
    expect(drawnBars(charts).size, 'one bar per pool-size row and no more').toBe(
      stats.byPoolSize.length,
    );
    for (const id of OUTCOME_SERIES) {
      const cell = charts.querySelector<HTMLElement>(`[data-stat="pushes.${id}"]`);
      expect((cell?.textContent ?? '').trim(), `${id} reads nought`).toBe('0');
      expect(cell?.querySelector('.chart-track'), `${id} draws no share of nothing`).toBeNull();
    }
  });

  it('draws one row for a log of one roll', () => {
    mount(ONE_ROLL);
    const stats = realSummary(ONE_ROLL);
    const charts = openStats();
    expect(stats.entriesRead).toBe(1);
    expect(stats.byPoolSize.length, 'one roll makes one row').toBe(1);
    expect(
      charts.querySelectorAll('[data-el="chart-pool-size"] tbody tr').length,
      'the chart draws that one row',
    ).toBe(1);
    expect(drawnValues(charts).size).toBe(wantedCount(1));
  });
});

// ---------------------------------------------------------------------------
// 7. The controls
// ---------------------------------------------------------------------------

describe('reaching the charts', () => {
  it('holds exactly the controls the design names for the charts, and no second', () => {
    const wanted = designControls('Statistics');
    mount(FIXTURE);
    openStats();
    const stops = tabStops(document.body);
    expect(
      stops.map((each) => each.dataset.el).sort(),
      'the charts hold the design’s controls, and no other',
    ).toEqual([...wanted.names].sort());
    expect(stops.length).toBe(wanted.count);
    for (const stop of stops) {
      expect(stop.tagName, `${stop.dataset.el ?? ''} carries a role`).toBe('BUTTON');
      expect((stop.textContent ?? '').trim().length, 'an accessible name').toBeGreaterThan(0);
      expect(stop.getAttribute('aria-disabled'), 'a state a reader can announce').toBe('false');
    }
    // The list and the record are gone, so the charts are a view and not a
    // panel drawn beside the summary.
    expect(document.querySelector('[data-el="history-list"]')).toBeNull();
    expect(document.querySelector('[data-el="history-record"]')).toBeNull();
  });

  it('takes the focus when it opens, and hands the summary back', () => {
    mount(FIXTURE);
    openStats();
    expect(
      (document.activeElement as HTMLElement).dataset.el,
      'the focus never lands on nothing',
    ).toBe('back-button');
    act(() => element('back-button').click());
    expect(
      document.querySelector('[data-el="history-stats"]') === null,
      'back closes the charts',
    ).toBe(true);
    expect(
      document.querySelector('[data-el="history-list"]') !== null,
      'back returns to the summary and not to the dice',
    ).toBe(true);
    expect(backPresses, 'back returns to the summary and not to the dice').toBe(0);
    act(() => element('back-button').click());
    expect(backPresses, 'a second press leaves the destination').toBe(1);
  });
});
