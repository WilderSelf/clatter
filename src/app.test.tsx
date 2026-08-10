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
import type { TrayMount, TrayProbe } from './app';
import { App } from './app';
import type { Die } from './rules/die';
import { appendValue, latestValue } from './rules/die';
import { applyDifficulty, buildPool, firstRoll, poolBuilder } from './rules/pool';
import { generations, previewPush, push } from './rules/push';
import type { PushProfile } from './rules/push-profile';
import { isLocked, PUSH_PROFILES } from './rules/push-profile';
import type { RandomSource } from './rules/random';
import { seededRandom } from './rules/seeded-random';
import type { TrayDecision } from './tray/capability';
import type { RollResult } from './rules/roll';
import { roll } from './rules/roll';
import type { Settings, SettingsStore } from './settings/settings';
import { DEFAULT_SETTINGS, SETTINGS_KEY, readSettings } from './settings/settings';
import { noticeText, startRenderer } from './shell/renderer';
import type { AppState, Counts } from './shell/state';
import {
  builderOf,
  dieElement,
  emptyState,
  pushNow,
  readout,
  rollNow,
  signedDifficulty,
  throwDice,
  worstCaseState,
} from './shell/state';

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

/**
 * A probe that never answers, which is the state the screen opens in.
 *
 * Every check below the renderer section is about the flat dice, and the flat
 * dice are what a screen draws until the probe has answered. jsdom gives no
 * WebGL context and no `toBlob`, so the real probe would answer `false` after
 * its own timeout and would make every one of those checks wait on a clock.
 */
const pendingProbe: TrayProbe = () => new Promise<TrayDecision>(() => {});

function mount(
  props: {
    random?: RandomSource;
    initial?: AppState;
    store?: SettingsStore | null;
    probe?: TrayProbe;
    mount?: TrayMount;
  } = {},
): HTMLElement {
  root = document.createElement('div');
  document.body.appendChild(root);
  act(() => render(<App probe={pendingProbe} store={null} {...props} />, root as HTMLElement));
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

    // Step mode holds the same six tiles. The attribute tile and the skill
    // tile carry a die size there, and every other tile is unchanged.
    for (const name of ['gear', 'artifact', 'bonus', 'stress']) {
      expect(cellValue(`pool-cell-${name}`), `${name} came back to zero`).toBe(
        name === 'artifact' ? 'none' : '0',
      );
    }
    expect(cellValue('pool-cell-attribute'), 'the attribute tile carries a size').toBe('d6');
    expect(cellValue('pool-cell-skill'), 'a step roll may take no skill die').toBe('none');
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

/**
 * A state whose tiles hold a pool, at rest B with nothing thrown yet.
 *
 * A re-throw builds the pool again from the tiles, so a fixture that sets a
 * result without setting the tiles would re-throw nothing. `tableState` above
 * serves the checks that only read a table.
 */
function builtState(counts: Partial<Counts>, profileId: string, difficulty = 0): AppState {
  const base = emptyState('pool');
  return {
    ...base,
    counts: { ...base.counts, ...counts },
    profileId,
    difficulty,
    builderOpen: false,
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

// ---------------------------------------------------------------------------
// The re-throw — Unit 2.3
// ---------------------------------------------------------------------------

/** Every die on the table by `data-el`, against the face the core gave it. */
function facesOf(dice: readonly Die[]): Map<string, number> {
  return new Map(dice.map((die) => [dieElement(die), latestValue(die) as number]));
}

describe('a re-throw', () => {
  it('asks the core for a fresh roll of the same pool, and the core is the oracle', () => {
    const only = profile('pool-banes-damage-ratings');
    // The tiles carry the pool, so the re-throw builds the same one again. The
    // difficulty rides with it and adds its bonus dice on every throw.
    const opening = builtState({ attribute: 3, skill: 2, gear: 2 }, only.id, 2);
    const first = rollNow(opening, seededRandom(8));
    if (first.result === null) throw new Error('the fixture rolled nothing');

    // The oracle. The core is asked outside the screen, over the same builder,
    // the same difficulty and the same seeded source the screen is given, so no
    // face is written down here.
    const oracle = firstRoll(
      applyDifficulty(builderOf(first), first.difficulty),
      seededRandom(11),
      first.counts.stress,
    );
    if (oracle.kind !== 'rolled') throw new Error('the core built no roll for the oracle');
    const wanted = facesOf(oracle.dice);
    expect(wanted.size, 'the oracle rolled the whole pool').toBe(
      buildPool(applyDifficulty(builderOf(first), first.difficulty)).length,
    );

    mount({ random: seededRandom(11), initial: first });
    const before = facesOnTable();
    expect(before.size, 'the first roll is on the table').toBe(first.result.dice.length);

    click(element('roll-button'));

    const after = facesOnTable();
    expect(after.size, 'the re-throw put the whole pool back on the table').toBe(wanted.size);
    expect(after, 'every face is the face the core gave it').toEqual(wanted);

    // The press is load-bearing. A table the re-throw never touched would equal
    // the one before it, and this check would pass without a throw at all.
    const moved = [...before].filter(([name, face]) => wanted.get(name) !== face);
    expect(moved.length, 'the table the re-throw replaced was a different table').toBeGreaterThan(
      0,
    );
  });

  it('starts a new roll and discards the roll before it', () => {
    const only = profile('pool-banes-damage-ratings');
    const opening = builtState({ attribute: 3, skill: 2, gear: 2, stress: 1 }, only.id);
    const first = rollNow(opening, seededRandom(8));
    const pushed = pushNow(first, seededRandom(11));
    if (pushed.result === null) throw new Error('the fixture rolled nothing');
    expect(generations(pushed.result.dice), 'the fixture holds a pushed roll').toBe(2);
    const carried = pushed.result.dice.filter((die) => isLocked(die, only));
    expect(
      carried.length,
      'the pushed roll keeps dice, which a continuation would carry over',
    ).toBeGreaterThan(0);

    // The state the shell holds after the press, and the pool it must hold.
    const again = rollNow(pushed, seededRandom(5));
    if (again.result === null) throw new Error('the re-throw rolled nothing');
    const size = buildPool(builderOf(pushed)).length;
    expect(again.result.dice.length, 'the new roll is the whole pool').toBe(size);
    expect(generations(again.result.dice), 'the generation count is back at one').toBe(1);
    expect(
      again.result.dice.filter((die) => die.values.length === 1).length,
      'every die of the pool carries one generation and no more',
    ).toBe(size);

    // Then the screen, which reads the same generation count through the push
    // readout of the status line.
    mount({ random: seededRandom(5), initial: pushed });
    expect(element('status-line').textContent, 'the table opens on a pushed roll').toContain(
      'push 1',
    );

    click(element('roll-button'));

    expect(element('status-line').textContent, 'the re-throw is a first roll again').toContain(
      'push 0',
    );
    const after = facesOnTable();
    expect(after.size, 'no die of the old roll stayed behind').toBe(size);
    expect(after, 'every face is the new roll, not the old one').toEqual(
      facesOf(again.result.dice),
    );
  });

  it('carries in the stress counter the roll before it ended with', () => {
    // The third preset raises stress by one before every re-throw, so a push is
    // what makes the counter move and makes this assertion able to fail.
    const stress = profile('pool-stress-and-complications');
    const opening = builtState({ attribute: 2, stress: 1 }, stress.id);
    const first = rollNow(opening, seededRandom(3));
    if (first.result === null) throw new Error('the fixture rolled nothing');
    expect(first.result.stressAfter, 'a first roll hands the counter straight back').toBe(1);
    expect(previewPush(first.result, stress).kind, 'the fixture may be pushed').toBe('available');

    const pushed = pushNow(first, seededRandom(3));
    if (pushed.result === null) throw new Error('the push rolled nothing');
    expect(pushed.counts.stress, 'the push raised the counter').toBe(2);
    expect(pushed.counts.stress, 'the counter moved, so a stale reading fails').toBeGreaterThan(
      opening.counts.stress,
    );

    // The oracle again: the core, given the counter the push left.
    const oracle = firstRoll(
      applyDifficulty(builderOf(pushed), pushed.difficulty),
      seededRandom(5),
      pushed.counts.stress,
    );
    if (oracle.kind !== 'rolled') throw new Error('the core built no roll for the oracle');

    // The counter a roll took in is what it hands back, so `stressAfter` is
    // where the carried value is read.
    const again = rollNow(pushed, seededRandom(5));
    if (again.result === null) throw new Error('the re-throw rolled nothing');
    expect(again.result.stressAfter, 'the re-throw took the counter the push left').toBe(
      pushed.counts.stress,
    );
    expect(again.result.stressAfter, 'and the core agrees').toBe(oracle.stressAfter);
    expect(
      again.result.dice.filter((die) => die.type === 'stress').length,
      'the counter is the number of stress dice, so the raised counter is on the table',
    ).toBe(pushed.counts.stress);

    mount({ random: seededRandom(5), initial: pushed });
    click(element('roll-button'));
    expect(facesOnTable(), 'the table is the roll the core made from that counter').toEqual(
      facesOf(oracle.dice),
    );
    expect(element('status-line').textContent, 'the status line reads the same counter').toContain(
      `stress ${pushed.counts.stress}`,
    );
  });
});

// ---------------------------------------------------------------------------
// What the screen shows at each rest state, and the difficulty after a throw
// ---------------------------------------------------------------------------

/**
 * The control inventory of section 3, read out of the document.
 *
 * The table states which of the eight controls is visible at rest A and at rest
 * B, and it states the two totals under them. Both are read here and neither is
 * restated, so the screen is compared against the document and the document is
 * compared against itself.
 */
function controlInventory(markdown: string): {
  readonly rows: readonly { readonly name: string; readonly a: boolean; readonly b: boolean }[];
  readonly totals: readonly [number, number];
} {
  const from = markdown.indexOf('## 3. Control inventory');
  const to = markdown.indexOf('## 4. ');
  if (from < 0 || to <= from) throw new Error('the design holds no control inventory');
  const section = markdown.slice(from, to);
  const rows = [
    ...section.matchAll(/^\| (\d+) \| `([a-z-]+)` \|[^|]*\| (yes|no) \| (yes|no) \|/gm),
  ];
  rows.forEach(([, index], place) => {
    if (Number(index) !== place + 1) throw new Error(`the inventory jumps at row ${String(index)}`);
  });
  const stated = /\*\*Controls at rest\*\* \| \*\*(\d+)\*\* \| \*\*(\d+)\*\* \|/.exec(section);
  if (stated === null) throw new Error('the inventory no longer states its two totals');
  return {
    rows: rows.map(([, , name, a, b]) => ({ name: name ?? '', a: a === 'yes', b: b === 'yes' })),
    totals: [Number(stated[1]), Number(stated[2])],
  };
}

describe('the control inventory of section 3', () => {
  it('holds at both rest states, control by control', () => {
    const inventory = controlInventory(DESIGN);
    expect(inventory.rows.length, 'the inventory holds the eight controls').toBe(8);
    expect(
      [inventory.rows.filter((row) => row.a).length, inventory.rows.filter((row) => row.b).length],
      'the yes marks are as many as the two totals under them',
    ).toEqual([...inventory.totals]);

    // Rest A: the builder is open and the table is empty. Rest B: a roll is on
    // the table and the builder is collapsed.
    const only = profile('pool-banes-damage-ratings');
    const thrown = rollNow(
      builtState({ attribute: 3, skill: 2, gear: 2 }, only.id),
      seededRandom(8),
    );
    const shown = (): Set<string> =>
      new Set(
        [...document.querySelectorAll<HTMLElement>('[data-el]')].map(
          (each) => each.dataset.el ?? '',
        ),
      );

    mount();
    const restA = shown();
    act(() => render(null, root as HTMLElement));
    mount({ initial: thrown });
    const restB = shown();

    // Sixteen cells, each one read from the document and answered by the
    // screen. `difficulty` is the cell this unit settles: the builder collapses
    // on a roll, so the control and its preview line leave rest B, and the
    // difficulty readout of rest B is the one printed on `roll-button`.
    const wanted = inventory.rows.flatMap((row) => [
      `${row.name} at rest A: ${String(row.a)}`,
      `${row.name} at rest B: ${String(row.b)}`,
    ]);
    const measured = inventory.rows.flatMap((row) => [
      `${row.name} at rest A: ${String(restA.has(row.name))}`,
      `${row.name} at rest B: ${String(restB.has(row.name))}`,
    ]);
    expect(measured.length, 'every row is read at both rest states').toBe(16);
    expect(measured, 'each control is on the screen at the rest states the document marks').toEqual(
      wanted,
    );
  });
});

describe('the difficulty on the roll button', () => {
  it('prints the difficulty the throw takes, and prints the same one after it', () => {
    // The claim is the document's. Section 3 lists the dice count and the
    // difficulty on `roll-button` among the read-only readings, and it keeps
    // `roll-button` at both rest states while `difficulty` leaves rest B with
    // the builder. Section 8 states the consequence: the bonus dice a
    // difficulty adds are already on the table, because the throw that filled
    // it took the same difficulty.
    expect(
      DESIGN.includes('The dice count and the difficulty printed on `roll-button`.'),
      'section 3 still prints the difficulty on the roll button',
    ).toBe(true);

    const note = (): string =>
      (element('roll-button').querySelector('small')?.textContent ?? '')
        .replace(/\s+/g, ' ')
        .trim();

    mount();
    click(element('pool-cell-attribute').querySelector('.cell-p') as Element);
    click(element('pool-cell-attribute').querySelector('.cell-p') as Element);
    click(element('difficulty-track').querySelectorAll('.tk-n')[6] as Element);
    const asked = note();
    expect(asked, 'the button carries the count and the difficulty').toBe(
      `5 dice, difficulty ${signedDifficulty(3)}`,
    );

    click(element('roll-button'));

    // The builder is collapsed, so neither the difficulty control nor its
    // preview sentence is on the screen. The button is the whole readout.
    expect(document.querySelector('[data-el="difficulty"]')).toBeNull();
    expect(document.querySelector('.diff-p')).toBeNull();
    expect(element('roll-button').textContent).toContain('Roll again');
    expect(note(), 'the difficulty after the throw is the one the throw took').toBe(asked);
    const counted = Number(/^(\d+) dice/.exec(asked)?.[1]);
    expect(facesOnTable().size, 'the throw took the dice the button counted').toBe(counted);

    // And again, because a re-throw changes nothing the builder holds.
    click(element('roll-button'));
    expect(note(), 'a re-throw takes the same difficulty').toBe(asked);
    expect(facesOnTable().size, 'and the same dice').toBe(counted);
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

// ---------------------------------------------------------------------------
// The renderer choice — Unit 3.7
//
// The screen asks `decideTray` once, at startup, and draws flat dice until it
// answers. Below the bar, a table that does not mount, and a lost context are
// all permanent falls: the record is written, the player is told once, and the
// only way back is the toggle in the sheet.
//
// The probe, the store and the mount are all handed to `App` here, so no check
// below depends on the platform the test runner happens to sit on.
// ---------------------------------------------------------------------------

/** A store that holds what was written, so a check can read it back. */
function fakeStore(opening?: Settings): SettingsStore & { written: number } {
  const held = new Map<string, string>();
  if (opening !== undefined) held.set(SETTINGS_KEY, JSON.stringify(opening));
  return {
    written: 0,
    getItem(key: string): string | null {
      return held.get(key) ?? null;
    },
    setItem(key: string, value: string): void {
      held.set(key, value);
      this.written += 1;
    },
  };
}

/** A mount that answers, and counts the containers it was handed. */
function fakeMount(answer: 'mounts' | 'refuses'): TrayMount & { calls: HTMLElement[] } {
  const calls: HTMLElement[] = [];
  const mount: TrayMount = (container) => {
    calls.push(container);
    return answer === 'mounts'
      ? Promise.resolve({})
      : Promise.reject(new Error('the lazy 3D chunk did not arrive'));
  };
  return Object.assign(mount, { calls });
}

const answers =
  (decision: TrayDecision): TrayProbe =>
  () =>
    Promise.resolve(decision);

/** Let the probe promise and the effects it starts run to the end. */
async function settle(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

function screen(): HTMLElement {
  const found = document.querySelector<HTMLElement>('.screen');
  if (found === null) throw new Error('the screen is not on the page');
  return found;
}

function notice(): HTMLElement {
  return element('flat-fallback-note');
}

/** Every notice element on the page. "Once" is a count, so it is counted. */
function notices(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('[data-el="flat-fallback-note"]')];
}

const ABOVE_THE_BAR: TrayDecision = { tray: true, reasons: [] };
const BELOW_THE_BAR: TrayDecision = { tray: false, reasons: ['no-webgl2', 'low-core-count'] };

describe('the renderer choice', () => {
  it('draws flat dice until the probe answers, and mounts nothing', async () => {
    const store = fakeStore();
    const mounting = fakeMount('mounts');
    mount({ store, mount: mounting });

    // Rest A holds no table. `Done` is what shows it, so the mount can only be
    // refused by the choice and never by the table staying hidden.
    click(element('collapse-button'));
    await settle();

    expect(screen().dataset['trayDecision'], 'the probe has not answered').toBe('pending');
    expect(screen().dataset['renderer'], 'so the dice are flat').toBe('flat');
    expect(mounting.calls.length, 'and nothing of the 3D chunk is fetched').toBe(0);
    expect(store.written, 'a fall nothing measured is not recorded').toBe(0);
    expect(notice().textContent, 'and the player is told nothing').toBe('');
  });

  it('mounts the table once, when the probe clears the bar', async () => {
    const store = fakeStore();
    const mounting = fakeMount('mounts');
    mount({ store, probe: answers(ABOVE_THE_BAR), mount: mounting });
    await settle();

    expect(screen().dataset['renderer'], 'the probe cleared the bar').toBe('tray');
    expect(mounting.calls.length, 'the table is hidden at rest A, so nothing mounts yet').toBe(0);

    click(element('collapse-button'));
    await settle();
    expect(mounting.calls.length, 'the table shows and the tray mounts once').toBe(1);
    expect(mounting.calls[0], 'it mounts into the table element').toBe(element('dice-table'));
    expect(notice().textContent, 'nothing fell, so nothing is said').toBe('');
    expect(store.written, 'and nothing is recorded').toBe(0);
    expect(readSettings(store).flatFallback, 'the record still holds no fall').toBe(false);
  });

  it('falls to flat dice when the table does not mount, and says so once', async () => {
    const store = fakeStore();
    const mounting = fakeMount('refuses');
    // A pool the re-throws below can put back on the table.
    const opening = {
      ...builtState({ attribute: 3, skill: 2 }, 'pool-banes-damage-ratings'),
      builderOpen: true,
    };
    mount({
      store,
      probe: answers(ABOVE_THE_BAR),
      mount: mounting,
      initial: opening,
      random: seededRandom(8),
    });
    await settle();
    expect(screen().dataset['renderer'], 'the probe cleared the bar').toBe('tray');

    click(element('collapse-button'));
    await settle();

    expect(mounting.calls.length, 'the mount was asked for and it refused').toBe(1);
    expect(screen().dataset['renderer'], 'so the dice are flat now').toBe('flat');
    expect(screen().dataset['trayDecision'], 'and the probe still reads what it read').toBe('true');
    expect(readSettings(store).flatFallback, 'the fall is permanent, so it is recorded').toBe(true);
    expect(notices().length, 'one notice, not two').toBe(1);
    expect(notice().textContent, 'and it names the fall and the way back').toBe(
      noticeText(startRenderer(ABOVE_THE_BAR, { ...DEFAULT_SETTINGS, flatFallback: true }).choice),
    );

    // "Once" is the claim, so the throws are what test it. The element itself
    // is compared, not only its text: a live region that is rebuilt is read
    // out again, and a reader would then hear the notice on every throw.
    const said = notice();
    const text = said.textContent;
    const writes = store.written;
    click(element('roll-button'));
    click(element('roll-button'));
    click(element('roll-button'));
    await settle();

    expect(
      facesOnTable().size,
      'the throws landed, so the check is about a screen that rolled',
    ).toBe(5);
    expect(notices().length, 'still one notice after three throws').toBe(1);
    expect(notice(), 'the same element, so no reader reads it again').toBe(said);
    expect(notice().textContent, 'and the same words').toBe(text);
    expect(store.written, 'and the record is written once, not once per throw').toBe(writes);
    expect(mounting.calls.length, 'the table is never asked for again').toBe(1);
  });

  it('records the fall and says so once when the probe answers below the bar', async () => {
    const store = fakeStore();
    const mounting = fakeMount('mounts');
    mount({ store, probe: answers(BELOW_THE_BAR), mount: mounting });
    await settle();

    expect(screen().dataset['renderer']).toBe('flat');
    expect(screen().dataset['trayDecision']).toBe('false');
    expect(readSettings(store).flatFallback, 'a platform below the bar falls for good').toBe(true);
    expect(notice().textContent, 'the notice names the platform, not a load that failed').toBe(
      'This browser cannot draw the table. The dice are flat now.',
    );

    click(element('collapse-button'));
    await settle();
    expect(mounting.calls.length, 'and the 3D chunk is never fetched').toBe(0);
  });

  it('says nothing at startup to a player who already fell', async () => {
    const store = fakeStore({ ...DEFAULT_SETTINGS, flatFallback: true });
    mount({ store, probe: answers(ABOVE_THE_BAR), mount: fakeMount('mounts') });
    await settle();

    expect(screen().dataset['renderer'], 'the record decides, and it holds a fall').toBe('flat');
    expect(notice().textContent, 'the player was told in the session that fell').toBe('');
    expect(store.written, 'and nothing is written again').toBe(0);
  });

  it('gives the table back through the sheet, and takes it away again', async () => {
    const store = fakeStore({ ...DEFAULT_SETTINGS, flatFallback: true });
    const mounting = fakeMount('mounts');
    mount({ store, probe: answers(ABOVE_THE_BAR), mount: mounting });
    await settle();
    expect(screen().dataset['renderer']).toBe('flat');

    click(element('disclosure-toggle'));
    const box = (): HTMLInputElement => {
      const found = element('sheet-tray-renderer').querySelector<HTMLInputElement>('input');
      if (found === null) throw new Error('the sheet holds no renderer toggle');
      return found;
    };
    expect(box().checked, 'the toggle reads the renderer the screen draws').toBe(false);
    expect(box().disabled, 'a platform above the bar may be asked for the table').toBe(false);
    expect(element('sheet-tray-note').textContent, 'and the note names the way back').toBe(
      'The dice are flat. Switch this on to ask for the table again.',
    );

    click(box());
    await settle();
    expect(screen().dataset['renderer'], 'the player asked for the table').toBe('tray');
    expect(readSettings(store).flatFallback, 'so the recorded fall is cleared').toBe(false);
    expect(box().checked).toBe(true);

    click(box());
    await settle();
    expect(screen().dataset['renderer'], 'and the same switch goes back').toBe('flat');
    expect(readSettings(store).flatFallback, 'which records the fall again').toBe(true);
    expect(notice().textContent, 'a fall the player asked for is not announced back').toBe('');
  });

  it('refuses the toggle below the bar and names every reading that failed', async () => {
    const store = fakeStore();
    mount({ store, probe: answers(BELOW_THE_BAR), mount: fakeMount('mounts') });
    await settle();

    click(element('disclosure-toggle'));
    const box = element('sheet-tray-renderer').querySelector<HTMLInputElement>('input');
    if (box === null) throw new Error('the sheet holds no renderer toggle');
    expect(box.checked).toBe(false);
    expect(box.disabled, 'the toggle cannot give a platform what it does not have').toBe(true);
    // One sentence per reading below the bar, and the count is the denominator.
    const note = element('sheet-tray-note').textContent ?? '';
    expect(note).toBe(
      'This browser cannot draw the table. The browser gives no 3D drawing surface. ' +
        'The device reports too few processor cores.',
    );
    expect(
      note.split('.').filter((part) => part.trim().length > 0).length,
      'one opening sentence and one per reading',
    ).toBe(1 + BELOW_THE_BAR.reasons.length);
  });
});

// ---------------------------------------------------------------------------
// The shake, on a re-throw — the defect Unit 2.3 reported
// ---------------------------------------------------------------------------

describe('the shake of a re-throw', () => {
  it('rebuilds every die cell, so a die that stayed in its zone shakes too', () => {
    const only = profile('pool-banes-damage-ratings');
    const opening = builtState({ attribute: 3, skill: 3, gear: 2 }, only.id);
    mount({ initial: opening, random: seededRandom(8) });

    click(element('roll-button'));
    const zoneOf = (name: string): string =>
      element(name).closest('[data-el="kept-shelf"]') === null ? 'throw-zone' : 'kept-shelf';
    const before = new Map(
      [...document.querySelectorAll<HTMLElement>('[data-el^="die-"]')].map((slot) => [
        slot.dataset.el ?? '',
        { node: slot, zone: zoneOf(slot.dataset.el ?? '') },
      ]),
    );
    expect(before.size, 'the first roll is on the table').toBe(8);

    click(element('roll-button'));

    // The dice that stayed in their zone are the ones the defect kept. They are
    // the denominator, and it must not be empty: a re-throw that moved every
    // die would prove nothing about the key.
    const stayed: string[] = [];
    const reused: string[] = [];
    for (const [name, was] of before) {
      const now = document.querySelector<HTMLElement>(`[data-el="${name}"]`);
      expect(now, `${name} is still on the table after the re-throw`).not.toBeNull();
      if (now === null) continue;
      if (zoneOf(name) !== was.zone) continue;
      stayed.push(name);
      if (now === was.node) reused.push(name);
    }
    expect(stayed.length, 'some dice stayed in the zone they were in').toBeGreaterThan(0);
    expect(
      reused,
      'every die cell is rebuilt on a re-throw, so the shake plays again on all of them',
    ).toEqual([]);
    expect(
      [...document.querySelectorAll('.slot.thrown')].length,
      'and every die of the new roll is marked as thrown',
    ).toBe(before.size);
  });
});
