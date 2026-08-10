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
import type { Die } from './rules/die';
import { appendValue, latestValue } from './rules/die';
import { buildPool, poolBuilder } from './rules/pool';
import { generations, previewPush, push } from './rules/push';
import type { PushProfile } from './rules/push-profile';
import { isLocked, PUSH_PROFILES } from './rules/push-profile';
import type { RandomSource } from './rules/random';
import { seededRandom } from './rules/seeded-random';
import type { RollResult } from './rules/roll';
import { roll } from './rules/roll';
import type { AppState } from './shell/state';
import { dieElement, emptyState, readout, throwDice, worstCaseState } from './shell/state';

// A jsdom test is transformed for the web, so `import.meta.url` is not a file
// URL here. The working directory is the root Vitest was configured from.
const DESIGN = readFileSync(resolve(process.cwd(), 'docs/design/0002-screen-design.md'), 'utf8');

/** The number words the document may count in. An unknown word is a failure. */
const NUMBER_WORDS: Readonly<Record<string, number>> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  twenty: 20,
  thirty: 30,
  forty: 40,
};

/**
 * A count in words, compounds included: `thirty-five` is thirty plus five. An
 * unknown part gives `undefined`, so the caller still fails on a word it cannot
 * read rather than on a wrong number.
 */
function inWords(word: string | undefined): number | undefined {
  const parts = (word ?? '').toLowerCase().split('-');
  let total = 0;
  for (const part of parts) {
    const held = NUMBER_WORDS[part];
    if (held === undefined) return undefined;
    total += held;
  }
  return total;
}

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

/**
 * Read one walk out of section 6. Nothing here is restated.
 *
 * The before-throw list runs to the after-throw heading, and the after-throw
 * list runs to the end of the section, so neither slice can read the other's
 * numbers.
 */
function walkList(markdown: string, when: 'Before' | 'After'): WalkList {
  const from = markdown.indexOf(`**${when} the throw`);
  const to =
    when === 'Before' ? markdown.indexOf('**After the throw') : markdown.indexOf('\n## 7.');
  if (from < 0 || to <= from) {
    throw new Error('section 6 no longer holds a before-throw list and an after-throw list');
  }
  const section = markdown.slice(from, to);

  const word = new RegExp(`\\*\\*${when} the throw — ([\\w-]+) visits\\.\\*\\*`).exec(section)?.[1];
  const stated = inWords(word);
  if (stated === undefined) {
    throw new Error(
      `section 6 states the ${when.toLowerCase()}-throw count as ${String(word)}, which is unread`,
    );
  }

  const numbered = [...section.matchAll(/^(\d+)\. `([a-z0-9-]+)`/gm)];
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
    for (let taken = 0; taken < 60 && !came; taken += 1) {
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

function mount(props: { random?: RandomSource; initial?: AppState } = {}): HTMLElement {
  root = document.createElement('div');
  document.body.appendChild(root);
  act(() => render(<App {...props} />, root as HTMLElement));
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
    const list = walkList(DESIGN, 'Before');

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

// ---------------------------------------------------------------------------
// The table — Unit 2.2
// ---------------------------------------------------------------------------

function profile(id: string): PushProfile {
  const held = PUSH_PROFILES.find((each) => each.id === id);
  if (held === undefined) throw new Error(`no push profile is named ${id}`);
  return held;
}

/** A state with dice already on the table, opened at rest B. */
function tableState(result: RollResult, profileId: string, stress = 0): AppState {
  return {
    ...emptyState('pool'),
    counts: { ...emptyState('pool').counts, stress },
    builderOpen: false,
    profileId,
    result,
  };
}

/** One generation of chosen values, so a fixture states its faces itself. */
function showing(dice: readonly Die[], values: readonly number[]): RollResult {
  if (dice.length !== values.length) {
    throw new Error(`${dice.length} dice against ${values.length} values`);
  }
  return { dice: dice.map((die, index) => appendValue(die, values[index] ?? 0)), stressAfter: 0 };
}

/** Every die on the table, by `data-el`, with the face its own name states. */
function facesOnTable(): Map<string, number> {
  const faces = new Map<string, number>();
  for (const slot of document.querySelectorAll<HTMLElement>('[data-el^="die-"]')) {
    const label = slot.getAttribute('aria-label') ?? '';
    const shown = /shows (\d+)\./.exec(label);
    if (shown === null) throw new Error(`the name of ${slot.dataset.el} names no face: ${label}`);
    faces.set(slot.dataset.el ?? '', Number(shown[1]));
  }
  return faces;
}

function pushButton(): HTMLButtonElement {
  return element('push-button') as HTMLButtonElement;
}

describe('the push button', () => {
  it('is enabled below the push limit and disabled at it', () => {
    // The limit is read off the profile, not restated. A profile of one push
    // is what makes the transition reachable in two presses.
    const only = profile('pool-banes-damage-ratings');
    expect(only.maxPushes).toBe(1);

    const dice = buildPool(poolBuilder({ attribute: 1, skill: 2 }));
    const rolled = showing(dice, [6, 3, 4]);
    const before = previewPush(rolled, only);
    if (before.kind !== 'available') throw new Error('the fixture cannot be pushed at all');
    expect(before.pushesSoFar, 'no push has been taken yet').toBe(0);
    expect(before.rerollCount, 'the fixture holds loose dice to throw').toBe(2);

    mount({
      random: seededRandom(3),
      initial: tableState(rolled, only.id),
    });
    expect(pushButton().disabled, 'below the limit the button is live').toBe(false);

    click(pushButton());

    // One push is taken, so the core refuses the next one. The button follows
    // the core and the row says why.
    expect(pushButton().disabled, 'at the limit the button is dead').toBe(true);
    expect(element('cost-row').textContent).toContain('push limit');
    expect(element('status-line').textContent).toContain('push 1');
  });

  it('is enabled with no stress bane showing and disabled under the blocker', () => {
    // The blocker is a field of the profile, and the core answers it.
    const stress = profile('pool-stress-and-complications');
    expect(stress.blockers).toContain('stressOneShowing');

    const dice = buildPool(poolBuilder({ attribute: 2, stress: 1 }));
    const clear = showing(dice, [3, 4, 5]);
    const blocked = showing(dice, [3, 4, 1]);
    expect(previewPush(clear, stress).kind, 'the core allows the clear roll').toBe('available');
    const refusal = previewPush(blocked, stress);
    if (refusal.kind !== 'refused') throw new Error('the blocked fixture is not blocked');
    expect(refusal.blocker).toBe('stressOneShowing');

    mount({ initial: tableState(clear, stress.id, 1) });
    expect(pushButton().disabled, 'no stress die shows a bane, so the push is live').toBe(false);
    act(() => render(null, root as HTMLElement));

    mount({ initial: tableState(blocked, stress.id, 1) });
    expect(pushButton().disabled, 'a stress bane stops the push').toBe(true);
    expect(element('cost-row').textContent).toContain('A stress die shows a bane');
  });
});

describe('the keyboard order after the throw', () => {
  it('visits the thirty-five named items of section 6, in that order', () => {
    const list = walkList(DESIGN, 'After');

    // The document counts its own list three ways before the screen is asked
    // anything, or the denominator is not a denominator.
    expect(list.names.length, 'the numbered list is as long as the prose says').toBe(list.stated);
    expect([...list.tab, ...list.arrow].sort((a, b) => a - b)).toEqual(
      Array.from({ length: list.stated }, (_, index) => index + 1),
    );
    expect(list.stated).toBe(35);

    // Which items are the shelf and which the zone, read out of the same
    // section, with its own two counts in words.
    const split =
      /Items (\d+) to (\d+) are the kept shelf and items (\d+) to (\d+) are the throw zone\.\s+([\w-]+) and ([\w-]+)\./.exec(
        DESIGN,
      );
    if (split === null) throw new Error('section 6 no longer splits the tray into two zones');
    const [, shelfFrom, shelfTo, zoneFrom, zoneTo, shelfWord, zoneWord] = split;
    const keptNames = list.names.slice(Number(shelfFrom) - 1, Number(shelfTo));
    const looseNames = list.names.slice(Number(zoneFrom) - 1, Number(zoneTo));
    const counted = (word: string | undefined): number => {
      const held = inWords(word);
      if (held === undefined)
        throw new Error(`section 6 counts in ${String(word)}, which is unread`);
      return held;
    };
    expect(keptNames.length, 'the shelf is as long as the prose says').toBe(counted(shelfWord));
    expect(looseNames.length, 'the zone is as long as the prose says').toBe(counted(zoneWord));

    // The pool of section 8, built by the core: every tile at its cap and the
    // difficulty at its limit, which is the draw target of Decision 1. Its size
    // is the denominator the two zones must sum to, so a die lost between them
    // fails the sum. `src/shell/drawn-screen.test.ts` holds the same number
    // against the drawn file.
    const dice = throwDice(worstCaseState());
    expect(dice.length, 'the drawn pool is as long as the list of dice').toBe(
      list.names.filter((name) => name.startsWith('die-')).length,
    );
    expect(keptNames.length + looseNames.length).toBe(dice.length);

    // The fixture states which dice the document keeps. A 6 locks under a
    // profile that locks successes and a 3 does not, so the LOCK STATE is what
    // the fixture sets. The ORDER is the screen's answer and the document's
    // claim, and neither is read from the other.
    const held = profile('pool-stress-and-complications');
    const kept = new Set(keptNames);
    const rolled = showing(
      dice,
      dice.map((die) => (kept.has(dieElement(die)) ? 6 : 3)),
    );
    const locked = rolled.dice.filter((die) => isLocked(die, held));
    expect(locked.length, 'the core locks exactly the dice the document keeps').toBe(
      keptNames.length,
    );

    mount({ initial: tableState(rolled, held.id, 10) });
    expect(
      [...document.querySelectorAll<HTMLElement>('*')]
        .filter((each) => each.tabIndex > 0)
        .map((each) => each.getAttribute('data-el') ?? each.tagName),
      'no element carries a positive tabindex, so document order is tab order',
    ).toEqual([]);

    // The walk below is a CYCLE, and a cycle is the same whichever zone comes
    // first: a tray with the zones swapped rotates to the same sequence and
    // passes. Measured on 2026-08-09, so the DOM order is read straight, which
    // no rotation can satisfy.
    const namesIn = (name: string): (string | undefined)[] =>
      [...element(name).querySelectorAll<HTMLElement>('.slot')].map((slot) => slot.dataset.el);
    expect(namesIn('dice-tray'), 'the tray holds the dice in the document order').toEqual(
      list.names.filter((name) => name.startsWith('die-')),
    );
    expect(namesIn('kept-shelf'), 'the shelf holds the kept dice, in pool order').toEqual(
      keptNames,
    );
    expect(namesIn('throw-zone'), 'the zone holds the loose dice, in pool order').toEqual(
      looseNames,
    );

    const visits = walk(document);
    expect(visits.map((visit) => visit.name)).toEqual(list.names);
    expect(visits.length, 'the walk reached every named visit and no other').toBe(list.stated);

    const positions = (by: 'tab' | 'arrow'): number[] =>
      visits.flatMap((visit, index) => (visit.by === by ? [index + 1] : []));
    expect(positions('tab'), 'Tab reaches the items the document says it does').toEqual(list.tab);
    expect(positions('arrow'), 'the arrows reach the items the document says they do').toEqual(
      list.arrow,
    );

    // The bands print the length of the list under each of them.
    expect(element('kept-shelf').textContent).toContain(`${keptNames.length} dice`);
    expect(element('throw-zone').textContent).toContain(`${looseNames.length} dice`);

    // The readout at the draw target, against the core's own numbers. The
    // zones alone would not catch a status line that counts the tray wrong.
    const numbers = readout(tableState(rolled, held.id, 10));
    expect(numbers.dice).toBe(dice.length);
    expect(spoken()).toBe(
      `${numbers.successes} successes. ${numbers.banes} banes. Push ${numbers.pushes}. ` +
        `The table holds ${dice.length} dice. Stress ${numbers.stress}.`,
    );
  });
});

describe('a push', () => {
  it('re-throws the loose dice alone, and the core is the oracle', () => {
    const only = profile('pool-banes-damage-ratings');
    const pool = buildPool(poolBuilder({ attribute: 3, skill: 2, gear: 2, stress: 1 }));
    // Seed 8 of the first thirty gives the evenest split this fixture can
    // hold: four dice the profile locks and four it throws again. A split with
    // one kept die would give the kept-face check a denominator of one.
    const rolled = roll({ dice: pool, stressBefore: 0 }, seededRandom(8));

    // The oracle. The same profile and the same seed the screen is given, so
    // the whole answer is computed outside the screen before it is asked.
    const oracle = push(rolled, only, seededRandom(11));
    if (oracle.kind !== 'pushed') throw new Error('the core refused the fixture push');
    expect(oracle.rerolled.length, 'the fixture has loose dice and locked dice').toBeGreaterThan(0);
    expect(oracle.rerolled.length).toBeLessThan(pool.length);

    mount({ random: seededRandom(11), initial: tableState(rolled, only.id) });

    // The zone the screen throws from is the set the core names, counted.
    const named = new Map(oracle.dice.map((die) => [die.id, dieElement(die)]));
    const zoneBefore = [...element('throw-zone').querySelectorAll<HTMLElement>('[data-el]')].map(
      (slot) => slot.dataset.el,
    );
    expect(zoneBefore.length).toBe(oracle.rerolled.length);
    expect(new Set(zoneBefore)).toEqual(new Set(oracle.rerolled.map((id) => named.get(id))));

    const before = facesOnTable();
    expect(before.size, 'every die of the pool is on the table').toBe(pool.length);

    click(pushButton());

    const after = facesOnTable();
    expect(after.size, 'no die left the table and none arrived').toBe(pool.length);

    // The kept dice keep their faces and their identities. The denominator is
    // the number the core did NOT re-throw, and it is not zero. This runs
    // first, so a die that moved when it should not have names itself.
    const moved = new Set(oracle.rerolled.map((id) => named.get(id)));
    const keptIds = [...before.keys()].filter((name) => !moved.has(name));
    expect(keptIds.length).toBe(pool.length - oracle.rerolled.length);
    expect(keptIds.length, 'the split is a mix, not one die against seven').toBe(4);
    for (const name of keptIds) {
      expect(after.get(name), `${name} kept its face across the push`).toBe(before.get(name));
    }

    // Every face, against the core's own answer. 8 of 8, not a sample.
    const wanted = new Map(oracle.dice.map((die) => [dieElement(die), latestValue(die) as number]));
    expect(after).toEqual(wanted);
    expect(generations(oracle.dice)).toBe(2);
    expect(element('status-line').textContent).toContain('push 1');
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
