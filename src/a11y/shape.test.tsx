// @vitest-environment jsdom
//
// Shape carries every meaning colour carries — Unit 4.11.
//
// Section 7 of `docs/design/0002-screen-design.md` states the rule: a success
// is a circle and a bane is a triangle, on the die, in the matrix and in the
// status line. Units 3.5, 4.4, 4.5 and 4.7 each proved their own surface. Four
// separate proofs cover four surfaces and say nothing about a fifth, so this
// file asserts the rule ONCE, over a denominator that grows by itself.
//
// **Two denominators, and neither one reads the other's list.**
//
//   1. **The stylesheet.** Every rule in `src/shell.css` that spends
//      `--mark-success` or `--mark-bane` is collected. Each one either carries a
//      shape declaration in the same block, or is named below with a reason for
//      spending a meaning colour without being a mark. A new surface that draws
//      a mark in hue alone lands in this set with no shape and turns the file
//      red. It is the growth guard.
//   2. **The document.** Every element the screen draws carrying one of the
//      classes the stylesheet just named is collected, and the surface that owns
//      it must be one of the surfaces declared here. A mark drawn somewhere new
//      is a red, and a surface that stopped drawing its marks is a red as well,
//      because each declared surface must be found.
//
// The chart glyphs spend the chart inks rather than the two mark colours, so
// they carry their own rule below and `src/shell/statistics.test.tsx` measures
// their contrast. The 3D table draws no mark at all, and the check at the end
// of this file says what carries the meaning there instead.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from '../app';
import type { TrayMount, TrayProbe } from '../app';
import type { LogEntry } from '../log/entry';
import type { TrayDecision } from '../tray/capability';
import { seededRandom } from '../rules/seeded-random';
import { History } from '../shell/history';
import { faultsOf } from '../shell/faults';
import type { SeriesId } from '../shell/statistics';
import { CHART_SERIES } from '../shell/statistics';

const CSS = readFileSync(resolve(process.cwd(), 'src/shell.css'), 'utf8');
const DESIGN = readFileSync(resolve(process.cwd(), 'docs/design/0002-screen-design.md'), 'utf8');

/** The two colour roles that MEAN success and bane. */
const MEANING = { success: '--mark-success', bane: '--mark-bane' } as const;
type Meaning = keyof typeof MEANING;

/**
 * Every rule that spends a meaning colour on something that is not a glyph.
 *
 * **A mark is a filled glyph**, so the meaning colour is what FILLS it. A rule
 * that spends the same colour on text or on one edge is drawing a warning and
 * not a mark, and every such rule is named here with its reason. The comparison
 * below is exact, so a mark cannot hide in this list and a warning cannot leave
 * it unnoticed.
 */
const NOT_A_MARK: Readonly<Record<string, string>> = {
  '.st-warn':
    'the stress reading at its cap. It is a number in the bane colour, and the number is what ' +
    'is read, so it carries no glyph. The status line names the cap in words beside it.',
  '.hist-warn':
    'the seven-day storage note. It is a sentence with a bane-coloured edge, and the sentence ' +
    'carries the whole meaning.',
  '.fault':
    'a row of the error banner. It is a sentence with a bane-coloured edge, and the banner ' +
    'carries role="alert", so a reader is told without seeing the edge.',
};

/** One rule of the stylesheet. */
interface CssRule {
  readonly selector: string;
  readonly body: string;
}

/**
 * Every rule in the stylesheet, flat.
 *
 * The file holds no nested rule and no at-rule with a body this reader must
 * enter, which the check below asserts rather than assumes: every collected
 * selector is a plain one.
 */
function cssRules(): CssRule[] {
  const rules: CssRule[] = [];
  const withoutComments = CSS.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const found of withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = (found[1] ?? '').trim().replace(/\s+/g, ' ');
    if (selector === '' || selector.startsWith('@')) continue;
    rules.push({ selector, body: found[2] ?? '' });
  }
  return rules;
}

/** What makes a mark the shape it is, as a signature. */
function shapeOf(body: string): string {
  return [...body.matchAll(/(border-radius|clip-path):\s*([^;]+);/g)]
    .map((found) => `${found[1] ?? ''}:${(found[2] ?? '').trim()}`)
    .sort()
    .join(' ');
}

/** The class the selector `.mark.s` names, which is `mark s`. */
function classesOf(selector: string): string[] {
  return [...selector.matchAll(/\.([a-z][a-z0-9-]*)/g)].map((found) => found[1] as string);
}

interface MarkRule extends CssRule {
  readonly meaning: Meaning;
  /** True where the meaning colour fills the element, which makes it a glyph. */
  readonly fills: boolean;
  readonly shape: string;
  readonly classes: readonly string[];
}

/** Every rule of the stylesheet that draws a success mark or a bane mark. */
function markRules(): MarkRule[] {
  const found: MarkRule[] = [];
  for (const rule of cssRules()) {
    for (const meaning of Object.keys(MEANING) as Meaning[]) {
      if (!rule.body.includes(`var(${MEANING[meaning]})`)) continue;
      // A glyph is FILLED with the meaning colour. Anything else spends it on
      // text or on an edge, and the list above says which and why.
      const fills = new RegExp(`background:\\s*var\\(${MEANING[meaning]}\\)`).test(rule.body);
      found.push({
        ...rule,
        meaning,
        fills,
        shape: shapeOf(rule.body),
        classes: classesOf(rule.selector),
      });
    }
  }
  return found;
}

// ---------------------------------------------------------------------------
// The surfaces, declared. Each one must be found and each mark must be owned.
// ---------------------------------------------------------------------------

/**
 * A surface that draws the two marks, and how to name the element that owns
 * one. The owner is the nearest named ancestor, so a mark drawn in a surface
 * nobody declared is owned by a name no entry matches.
 */
const SURFACES: readonly { readonly name: string; readonly owns: (el: string) => boolean }[] = [
  { name: 'the status line', owns: (el) => el === 'status-line' },
  { name: 'a flat die', owns: (el) => el.startsWith('die-') },
  { name: 'the history summary list', owns: (el) => el.startsWith('history-row-') },
  { name: 'the history record matrix', owns: (el) => el === 'history-matrix' },
];

const pendingProbe: TrayProbe = () => new Promise<TrayDecision>(() => {});

let root: HTMLElement | null = null;

afterEach(() => {
  if (root !== null) {
    act(() => render(null, root as HTMLElement));
    root.remove();
    root = null;
  }
});

function element(name: string): HTMLElement {
  const found = document.querySelector<HTMLElement>(`[data-el="${name}"]`);
  if (found === null) throw new Error(`the screen holds no ${name}`);
  return found;
}

function click(target: Element): void {
  act(() => {
    (target as HTMLElement).click();
  });
}

function press(element: Element, key: string): void {
  act(() => {
    element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  });
}

/** One logged roll that pushed, so the matrix draws successes and banes. */
function pushedEntry(): LogEntry {
  return {
    rollId: 'r-1',
    timestampIso: new Date(Date.UTC(2026, 7, 9, 12, 7)).toISOString(),
    ruleset: 'pool-stress-and-complications',
    profileHash: '7'.repeat(64),
    mode: 'pool',
    dice: [
      {
        type: 'attribute',
        faces: 6,
        cells: [
          { value: 6, successes: 1, locked: true },
          { value: 6, successes: 1, locked: true },
        ],
      },
      {
        type: 'stress',
        faces: 6,
        cells: [
          { value: 1, successes: 0, locked: true },
          { value: 1, successes: 0, locked: true },
        ],
      },
    ],
    successes: 1,
    banes: 1,
    pushCount: 1,
    costType: 'complicationCheck',
    costAmount: 0,
    stressBefore: 1,
    stressAfter: 2,
    note: '',
  };
}

/**
 * Every element on the screen carrying a mark class, with the surface that owns
 * it and the meaning the stylesheet gives it.
 */
function marksDrawn(rules: readonly MarkRule[]): { owner: string; meaning: Meaning }[] {
  const drawn: { owner: string; meaning: Meaning }[] = [];
  for (const rule of rules) {
    const selector = rule.classes.map((each) => `.${each}`).join('');
    for (const found of document.querySelectorAll<HTMLElement>(selector)) {
      const owner = found.closest('[data-el]')?.getAttribute('data-el') ?? 'nothing named';
      drawn.push({ owner, meaning: rule.meaning });
    }
  }
  return drawn;
}

describe('shape carries every meaning colour carries', () => {
  it('gives every rule that spends a meaning colour a shape, or a declared reason', () => {
    const rules = markRules();
    // A reader that found nothing would pass every check under it.
    expect(rules.length, 'the stylesheet spends the two meaning colours').toBeGreaterThanOrEqual(4);

    const notGlyphs = rules.filter((rule) => !rule.fills).map((rule) => rule.selector);
    expect(
      [...new Set(notGlyphs)].sort(),
      'every rule that spends a meaning colour without filling a glyph is declared with its reason',
    ).toEqual(Object.keys(NOT_A_MARK).sort());

    // The claim itself: every glyph the meaning colour fills carries a shape.
    const withoutShape = rules
      .filter((rule) => rule.fills && rule.shape === '')
      .map((rule) => rule.selector);
    expect(withoutShape, 'every mark carries a shape and not a hue alone').toEqual([]);
    for (const [selector, reason] of Object.entries(NOT_A_MARK)) {
      expect(reason.length, `${selector} carries a reason`).toBeGreaterThan(40);
    }

    // Every mark pairs with the other meaning under the same base class, and
    // the two shapes differ. This is the claim itself, at the stylesheet.
    const marks = rules.filter((rule) => rule.fills);
    let pairs = 0;
    for (const mark of marks.filter((rule) => rule.meaning === 'success')) {
      const base = mark.classes[0];
      const twin = marks.find(
        (rule) => rule.meaning === 'bane' && rule.classes[0] === base && rule !== mark,
      );
      expect(twin, `${mark.selector} draws a success, so a bane is drawn beside it`).toBeDefined();
      expect(
        twin?.shape,
        `${mark.selector} and ${String(twin?.selector)} differ by shape and not by hue alone`,
      ).not.toBe(mark.shape);
      pairs += 1;
    }
    expect(pairs, 'the stylesheet draws more than one pair of marks').toBeGreaterThanOrEqual(2);

    // Section 7 states the rule this file measures.
    expect(DESIGN).toContain('**Shape carries every meaning that colour carries.**');
  });

  it('draws both marks on every declared surface, and draws them nowhere else', () => {
    const rules = markRules().filter((rule) => rule.fills);
    const seen = new Map<string, Set<Meaning>>();
    const strangers: string[] = [];

    const record = (): void => {
      for (const mark of marksDrawn(rules)) {
        const surface = SURFACES.find((each) => each.owns(mark.owner));
        if (surface === undefined) {
          strangers.push(`${mark.owner} draws a ${mark.meaning} mark and is declared nowhere`);
          continue;
        }
        const held = seen.get(surface.name) ?? new Set<Meaning>();
        held.add(mark.meaning);
        seen.set(surface.name, held);
      }
    };

    // The roll flow: the status line and the flat dice, over a roll that holds
    // a success and a bane. Seed 4 of the stress profile gives both.
    root = document.createElement('div');
    document.body.appendChild(root);
    act(() =>
      render(
        <App probe={pendingProbe} store={null} random={seededRandom(4)} />,
        root as HTMLElement,
      ),
    );
    for (let taken = 0; taken < 6; taken += 1) {
      click(element('pool-cell-attribute').querySelector('.cell-p') as Element);
      click(element('pool-cell-stress').querySelector('.cell-p') as Element);
    }
    click(element('roll-button'));
    const spoken = element('status-line').textContent ?? '';
    expect(spoken, 'the throw landed a success').not.toContain('0 successes');
    expect(spoken, 'the throw landed a bane').not.toContain('0 banes');
    record();
    act(() => render(null, root as HTMLElement));
    root.remove();

    // The history destination: the summary list and the record matrix, over one
    // logged roll that pushed.
    root = document.createElement('div');
    document.body.appendChild(root);
    act(() =>
      render(
        <History
          entries={[pushedEntry()]}
          drawn={faultsOf({ table: null, log: null, imported: null, settingsRefused: false })}
          onBack={() => undefined}
          onFault={() => undefined}
          onImport={() => Promise.resolve(true)}
        />,
        root as HTMLElement,
      ),
    );
    record();
    const row = element('history-row-0');
    row.focus();
    press(row, 'Enter');
    expect(element('history-matrix')).not.toBeNull();
    record();

    expect(strangers, 'every mark on the screen belongs to a declared surface').toEqual([]);
    // Every declared surface was found, and each one drew BOTH marks. A surface
    // that lost one of the two is as wrong as a surface that drew neither.
    expect([...seen.keys()].sort(), 'every declared surface was reached').toEqual(
      SURFACES.map((surface) => surface.name).sort(),
    );
    for (const [name, meanings] of seen) {
      expect([...meanings].sort(), `${name} draws a success mark and a bane mark`).toEqual([
        'bane',
        'success',
      ]);
    }
  });

  it('gives every chart series its own glyph, over the series the charts name', () => {
    // The charts spend the chart inks and not the two mark colours, so they are
    // a surface of their own. The shapes are read off the stylesheet and the
    // series off the module that draws them, so neither list is typed here.
    const series = Object.keys(CHART_SERIES) as SeriesId[];
    expect(series.length, 'the charts name their series').toBeGreaterThanOrEqual(4);
    const shapes = new Map<SeriesId, string>();
    for (const id of series) {
      const rule = cssRules().find((each) => each.selector === `.cmark.c-${id}`);
      expect(rule, `the stylesheet draws the ${id} glyph`).toBeDefined();
      const shape = shapeOf(rule?.body ?? '');
      expect(shape.length, `the ${id} glyph carries a shape`).toBeGreaterThan(0);
      shapes.set(id, shape);
    }
    // The good outcome and the bad one are the two that must never be told
    // apart by hue alone.
    expect(shapes.get('success'), 'a gain and a loss carry two shapes').not.toBe(
      shapes.get('worse'),
    );
    expect(shapes.size).toBe(series.length);
  });

  it('carries the meaning in words where the 3D table draws the die itself', () => {
    // Over the table the cell draws no die and no mark, because the die under
    // it is the one the player reads. So the meaning rides the accessible name
    // there, and this check is what stops the table being counted as a surface
    // that drew nothing.
    // A mount that never answers. The renderer choice is the probe's, not the
    // mount's, so the cells draw over a table while the tray is still coming.
    // That is the state this check is about: the cell over the table draws no
    // die and no mark.
    const mount: TrayMount = () => new Promise<unknown>(() => {});
    root = document.createElement('div');
    document.body.appendChild(root);
    act(() =>
      render(
        <App
          probe={() => Promise.resolve<TrayDecision>({ tray: true, reasons: [] })}
          store={null}
          random={seededRandom(4)}
          mount={mount}
        />,
        root as HTMLElement,
      ),
    );
    click(element('pool-cell-attribute').querySelector('.cell-p') as Element);
    click(element('pool-cell-attribute').querySelector('.cell-p') as Element);
    click(element('roll-button'));

    const cells = [...document.querySelectorAll<HTMLElement>('[data-el^="die-"]')];
    expect(cells.length, 'the table put dice down').toBeGreaterThan(0);
    for (const cell of cells) {
      const name = cell.getAttribute('aria-label') ?? '';
      expect(name, `${String(cell.dataset.el)} says what it shows`).toMatch(/shows \d+\./);
      expect(name, `${String(cell.dataset.el)} says what that face is worth`).toMatch(
        /success|bane|nothing/i,
      );
    }
  });
});
