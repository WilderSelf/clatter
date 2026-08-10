// @vitest-environment jsdom
//
// The screen, driven. Three claims live here and each one needs a document:
// the keyboard order before the throw, what the live region says, and what a
// mode switch does to a built pool.
//
// The keyboard list is READ from `docs/design/0002-screen-design.md`, never
// restated. That file states the same walk three ways — a count in words, a
// numbered list, and a sentence splitting the list into Tab stops and arrow
// visits — so the list has a denominator that can fail and the three statements
// check each other as well as the screen.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from './app';

// A jsdom test is transformed for the web, so `import.meta.url` is not a file
// URL here. The working directory is the root Vitest was configured from.
const DESIGN = readFileSync(resolve(process.cwd(), 'docs/design/0002-screen-design.md'), 'utf8');

/** The number words the document may count in. An unknown word is a failure. */
const NUMBER_WORDS: Readonly<Record<string, number>> = {
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
};

interface WalkList {
  /** The visit names, in the order the document numbers them. */
  readonly names: readonly string[];
  /** The count the document states in words, read from its own prose. */
  readonly stated: number;
  /** The one-based positions the document says Tab reaches. */
  readonly tab: readonly number[];
  /** The one-based positions the document says the arrow keys reach. */
  readonly arrow: readonly number[];
}

/** Read the before-throw walk out of section 6. Nothing here is restated. */
function beforeThrowList(markdown: string): WalkList {
  const from = markdown.indexOf('**Before the throw');
  const to = markdown.indexOf('**After the throw');
  if (from < 0 || to <= from) {
    throw new Error('section 6 no longer holds a before-throw list and an after-throw list');
  }
  const section = markdown.slice(from, to);

  const word = /\*\*Before the throw — (\w+) visits\.\*\*/.exec(section)?.[1];
  const stated = word === undefined ? undefined : NUMBER_WORDS[word];
  if (stated === undefined) {
    throw new Error(`section 6 states the before-throw count as ${String(word)}, which is unread`);
  }

  const numbered = [...section.matchAll(/^(\d+)\. `([a-z-]+)`/gm)];
  const names = numbered.map(([, , name]) => name ?? '');
  numbered.forEach(([, index], place) => {
    if (Number(index) !== place + 1) {
      throw new Error(`the numbered list jumps at item ${String(index)}`);
    }
  });

  const tabText = /Tab reaches items ([\d, and]+)\./.exec(section)?.[1];
  const arrowRange = /The arrow keys reach items (\d+) to (\d+)/.exec(section);
  if (tabText === undefined || arrowRange === null) {
    throw new Error('section 6 no longer names which items Tab reaches and which the arrows do');
  }
  const tab = [...tabText.matchAll(/\d+/g)].map(([digits]) => Number(digits));
  const first = Number(arrowRange[1]);
  const last = Number(arrowRange[2]);
  const arrow = Array.from({ length: last - first + 1 }, (_, step) => first + step);

  return { names, stated, tab, arrow };
}

// ---------------------------------------------------------------------------
// The walk
// ---------------------------------------------------------------------------

/**
 * What a stop is called.
 *
 * A composite widget is one control, so the visit is the container and not the
 * cell inside it that happens to carry `tabindex="0"`. Section 2 and the last
 * paragraph of section 6.
 */
function visitName(element: Element, insideComposite: boolean): string {
  const held = insideComposite
    ? element.closest('[data-el]')
    : (element.closest('[data-composite]') ?? element.closest('[data-el]'));
  return held?.getAttribute('data-el') ?? `an unnamed ${element.tagName.toLowerCase()}`;
}

/**
 * Every element a Tab press can reach, in document order.
 *
 * jsdom runs no sequential focus navigation, so this enumerates the tab stops
 * the way the specification defines them and focuses each one. The order is the
 * document order only while no element carries a positive tabindex, and the
 * caller asserts that separately. The same walk runs against real Tab presses
 * in a real browser through `node scripts/browser.mjs --shell`.
 */
function tabStops(root: ParentNode): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>('*')].filter(
    (element) =>
      element.tabIndex >= 0 &&
      !element.hasAttribute('disabled') &&
      element.closest('[hidden]') === null,
  );
}

function press(element: Element, key: string): void {
  element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

interface Visit {
  readonly name: string;
  readonly by: 'tab' | 'arrow';
}

/**
 * Walk the screen the way a player does, and record what was reached.
 *
 * At every stop the walk presses one arrow key. Focus that moves means a
 * composite the arrows walk, and the walk then follows it to the end and back.
 * Focus that stays means a control whose arrows change a value, so the press is
 * undone and no inner visit is recorded. Nothing in the rule knows the answer.
 */
function walk(document: Document): Visit[] {
  const visits: Visit[] = [];
  for (const stop of tabStops(document.body)) {
    stop.focus();
    const landed = document.activeElement;
    if (landed === null) continue;
    visits.push({ name: visitName(landed, false), by: 'tab' });

    press(landed, 'ArrowRight');
    if (document.activeElement === landed) {
      press(landed, 'ArrowLeft');
      continue;
    }
    visits.push({ name: visitName(landed, true), by: 'arrow' });
    let came = false;
    for (let taken = 0; taken < 20 && !came; taken += 1) {
      const inner = document.activeElement;
      if (inner === null || inner === landed) {
        came = true;
        break;
      }
      visits.push({ name: visitName(inner, true), by: 'arrow' });
      press(inner, 'ArrowRight');
    }
    // A walk that never came back is reported in the list, so the comparison
    // names it rather than throwing something the reader has to interpret.
    if (!came) visits.push({ name: 'a walk that never came back', by: 'arrow' });
  }
  return visits;
}

// ---------------------------------------------------------------------------
// The harness
// ---------------------------------------------------------------------------

let root: HTMLElement | null = null;

function mount(): HTMLElement {
  root = document.createElement('div');
  document.body.appendChild(root);
  act(() => render(<App />, root as HTMLElement));
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
  if (found === null) throw new Error(`the screen holds no ${name}`);
  return found;
}

function click(target: Element): void {
  act(() => {
    (target as HTMLElement).click();
  });
}

/**
 * What a screen reader reads out of the live region: its text, less every
 * subtree it is told to ignore. The drawn row of numbers is one such subtree.
 */
function spoken(): string {
  const region = element('status-line').cloneNode(true) as HTMLElement;
  for (const hidden of region.querySelectorAll('[aria-hidden="true"]')) {
    hidden.remove();
  }
  return (region.textContent ?? '').replace(/\s+/g, ' ').trim();
}

function cellValue(name: string): string {
  return element(name).querySelector('.cell-n')?.textContent ?? '';
}

describe('the keyboard order before the throw', () => {
  it('visits the eleven named items of section 6, in that order', () => {
    const list = beforeThrowList(DESIGN);

    // The document states the count three ways. They must agree before the
    // screen is asked anything, or the denominator is not a denominator.
    expect(list.names.length, 'the numbered list is as long as the prose says').toBe(list.stated);
    expect([...list.tab, ...list.arrow].sort((a, b) => a - b)).toEqual(
      Array.from({ length: list.stated }, (_, index) => index + 1),
    );
    expect(list.stated).toBe(11);

    mount();
    expect(
      [...document.querySelectorAll<HTMLElement>('*')]
        .filter((each) => each.tabIndex > 0)
        .map((each) => each.getAttribute('data-el') ?? each.tagName),
      'no element carries a positive tabindex, so document order is tab order',
    ).toEqual([]);

    const visits = walk(document);
    expect(visits.map((visit) => visit.name)).toEqual(list.names);
    expect(visits.length, 'the walk reached every named visit and no other').toBe(list.stated);

    const positions = (by: 'tab' | 'arrow'): number[] =>
      visits.flatMap((visit, index) => (visit.by === by ? [index + 1] : []));
    expect(positions('tab'), 'Tab reaches the items the document says it does').toEqual(list.tab);
    expect(positions('arrow'), 'the arrows reach the items the document says they do').toEqual(
      list.arrow,
    );
  });

  it('changes the value of the tile in focus with the up and down arrows', () => {
    mount();
    const bar = element('pool-bar');
    const cell = element('pool-cell-attribute');
    (cell as HTMLElement).focus();
    act(() => press(cell, 'ArrowUp'));
    expect(cellValue('pool-cell-attribute')).toBe('1');
    expect(document.activeElement, 'the value changed and the focus did not move').toBe(
      element('pool-cell-attribute'),
    );
    act(() => press(element('pool-cell-attribute'), 'ArrowDown'));
    expect(cellValue('pool-cell-attribute')).toBe('0');
    expect(bar.getAttribute('role')).toBe('toolbar');
  });

  it('moves one tab stop into the pool bar, wherever the roving index sits', () => {
    mount();
    const first = element('pool-cell-attribute');
    first.focus();
    act(() => press(first, 'ArrowRight'));
    expect(document.activeElement).toBe(element('pool-cell-skill'));
    expect(
      tabStops(document.body).filter((each) => each.closest('[data-el="pool-bar"]')).length,
    ).toBe(1);
  });
});

describe('the live region', () => {
  it('says what the pool holds, and says it again when the pool changes', () => {
    mount();
    const line = element('status-line');
    expect(line.getAttribute('role')).toBe('status');
    expect(line.getAttribute('aria-live')).toBe('polite');

    const empty = spoken();
    expect(empty).toBe(
      '0 successes. 0 banes. Push 0. The throw takes no dice. A roll of no dice fails.',
    );

    click(element('pool-cell-attribute').querySelector('.cell-p') as Element);
    const one = spoken();
    expect(one).not.toBe(empty);
    expect(one).toBe('0 successes. 0 banes. Push 0. The throw takes 1 die. 1 attribute.');

    click(element('pool-cell-gear').querySelector('.cell-p') as Element);
    expect(spoken()).toBe(
      '0 successes. 0 banes. Push 0. The throw takes 2 dice. 1 attribute, 1 gear.',
    );

    // The difficulty is part of what the next throw takes, so it reaches the
    // region too.
    click(element('difficulty-track').querySelectorAll('.tk-n')[6] as Element);
    expect(spoken()).toBe(
      '0 successes. 0 banes. Push 0. The throw takes 5 dice. 1 attribute, 1 gear, 3 bonus.',
    );
  });
});

describe('the mode switch', () => {
  it('clears a built pool, and the pool was built first', () => {
    mount();
    click(element('pool-cell-attribute').querySelector('.cell-p') as Element);
    click(element('pool-cell-attribute').querySelector('.cell-p') as Element);
    click(element('pool-cell-gear').querySelector('.cell-p') as Element);
    expect(cellValue('pool-cell-attribute')).toBe('2');
    expect(spoken()).toBe(
      '0 successes. 0 banes. Push 0. The throw takes 3 dice. 2 attribute, 1 gear.',
    );

    // The switch lives behind the disclosure on purpose. It destroys the pool,
    // so it must not sit one tap from the throw.
    click(element('disclosure-toggle'));
    const step = element('sheet-mode').querySelector<HTMLInputElement>('input[value="step"]');
    if (step === null) throw new Error('the sheet holds no step-dice choice');
    click(step);

    expect(document.querySelector('[data-el="pool-cell-attribute"]')).toBeNull();
    for (const name of ['gear', 'artifact', 'bonus', 'stress']) {
      expect(cellValue(`pool-cell-${name}`), `${name} came back to zero`).toBe(
        name === 'artifact' ? 'none' : '0',
      );
    }
    expect(cellValue('pool-cell-ladder')).toBe('d6');
    expect(spoken()).toBe('0 successes. 0 banes. Push 0. The throw takes 1 die. 1 attribute.');

    click(element('sheet-mode').querySelector('input[value="pool"]') as Element);
    expect(spoken()).toBe(
      '0 successes. 0 banes. Push 0. The throw takes no dice. A roll of no dice fails.',
    );
  });
});

describe('both rest states are reachable', () => {
  it('collapses the builder on Roll and brings it back with Edit pool', () => {
    mount();
    expect(document.querySelector('[data-el="pool-builder"]')).not.toBeNull();
    expect(document.querySelector('[data-el="edit-pool-button"]')).toBeNull();

    click(element('roll-button'));
    expect(document.querySelector('[data-el="pool-builder"]')).toBeNull();
    expect(element('edit-pool-button')).not.toBeNull();

    click(element('edit-pool-button'));
    expect(document.querySelector('[data-el="pool-builder"]')).not.toBeNull();
    expect(element('collapse-button').textContent).toBe('Done');
  });
});
