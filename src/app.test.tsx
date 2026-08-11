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
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { TrayMount, TrayProbe } from './app';
import { App, NO_AUDIO_TEXT, REST_BOUND_MS, ROLLING_TEXT, SOUND_NOTE_TEXT } from './app';
import type { Die } from './rules/die';
import { appendValue, latestValue } from './rules/die';
import { applyDifficulty, buildPool, firstRoll, poolBuilder } from './rules/pool';
import { generations, previewPush, push } from './rules/push';
import type { PushProfile } from './rules/push-profile';
import { isLocked, mergeProfile, PUSH_PROFILES } from './rules/push-profile';
import type { RandomSource } from './rules/random';
import { seededRandom } from './rules/seeded-random';
import type { TrayDecision } from './tray/capability';
import type { RollResult } from './rules/roll';
import { roll, successCount } from './rules/roll';
import type { SoundEngine } from './tray/sound';
import { createSoundEngine } from './tray/sound';
import type { Settings, SettingsStore } from './settings/settings';
import {
  DEFAULT_SETTINGS,
  MAX_POOL_PRESETS,
  MAX_PRESET_NAME_CHARS,
  SETTINGS_KEY,
  readSettings,
} from './settings/settings';
import {
  PRESET_MOVED_TEXT,
  PRESET_REFUSAL_TEXT,
  PRESET_SAVED_TEXT,
  UNUSABLE_POOL_TEXT,
} from './shell/presets';
import { storageLine } from './shell/history';
import { focusStops } from './shell/focus-trap';
import { noticeText, startRenderer } from './shell/renderer';
import { FAULT_SLOT_ELEMENT, FAULT_SLOTS, faultLine, faultOf } from './shell/faults';
import { shareCard } from './shell/share-card';
import type { makeShareCard } from './shell/share-state';
import {
  CARD_READY_TEXT,
  NO_DOWNLOAD_TEXT,
  SHARE_REFUSAL_TEXT,
  CARD_SENT_TEXT,
} from './shell/share-panel';
import type { AppState, Counts } from './shell/state';
import {
  builderOf,
  DEFAULT_PROFILE_ID,
  dieElement,
  POOL_CAPS,
  emptyState,
  pushNow,
  readout,
  rollNow,
  signedDifficulty,
  stillTumbling,
  throwDice,
  tilesFor,
  worstCaseState,
} from './shell/state';

// A jsdom test is transformed for the web, so `import.meta.url` is not a file
// URL here. The working directory is the root Vitest was configured from.
const DESIGN = readFileSync(resolve(process.cwd(), 'docs/design/0002-screen-design.md'), 'utf8');

// The affordance fetches the vendored bundle on demand, and it is 763 KB of
// source for the transform to chew. Warming it here takes that cost out of the
// first tray check, so a wait below measures the tray and never the loader. A
// slow machine failed on that difference: measured in CI on 2026-08-10.
await import('./tray/vendor/dice-tray.js');

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
    makeCard?: typeof makeShareCard;
    sound?: SoundEngine;
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

/**
 * A stand-in for the vendored tray.
 *
 * It records what the application asked it to act out and nothing else. Every
 * field is one the tray modules read: `src/tray/throw.ts` calls `roll`, `add`
 * and `reroll` and colours a die through `material`, `src/tray/affordance.ts`
 * builds its marks in `scene` and draws a frame through `renderer`, and
 * `src/tray/spots.ts` reads `position`, `scale`, `geometry` and
 * `getScreenPosition`.
 *
 * A die sits at a place this file chooses, so the cells over it can be checked
 * against a number the screen never saw.
 */
const FAKE_DIE_RADIUS = 45;
const FAKE_DIE_X = 100;
const FAKE_DIE_STEP = 10;
const FAKE_DIE_Y = 200;

interface FakeTray {
  thrown: string[];
  added: string[];
  rerolled: [number[], number[]][];
  renders: number;
  diceList: unknown[];
  scene: { children: unknown[] };
}

function fakeTray(): FakeTray {
  const children: unknown[] = [];
  const box = {
    thrown: [] as string[],
    added: [] as string[],
    rerolled: [] as [number[], number[]][],
    renders: 0,
    container: document.createElement('div'),
    scene: {
      children,
      add: (node: unknown) => void children.push(node),
      remove: (node: unknown) => {
        const at = children.indexOf(node);
        if (at >= 0) children.splice(at, 1);
      },
    },
    camera: {},
    raycaster: { setFromCamera: () => {}, intersectObjects: () => [] },
    renderer: {
      render: () => {
        box.renders += 1;
      },
    },
    diceList: [] as unknown[],
    getScreenPosition: (point: { x: number; y: number }) => ({ x: point.x, y: point.y }),
    roll: (notation: string) => {
      box.thrown.push(notation);
      box.diceList = (notation.split('@')[1] ?? '').split(',').map((_, index) => fakeDie(index));
      return Promise.resolve({});
    },
    add: (notation: string) => {
      box.added.push(notation);
      box.diceList.push(fakeDie(box.diceList.length));
      return Promise.resolve([]);
    },
    reroll: (ids: number[], forced: number[]) => {
      box.rerolled.push([ids, forced]);
      return Promise.resolve([]);
    },
  };
  return box as unknown as FakeTray;
}

function fakeDie(index: number): unknown {
  return {
    material: [{ color: { set: () => {} } }],
    position: { x: FAKE_DIE_X + index * FAKE_DIE_STEP, y: FAKE_DIE_Y, z: 0 },
    scale: { x: 1 },
    geometry: {
      boundingSphere: { radius: FAKE_DIE_RADIUS },
      computeBoundingSphere: () => {},
    },
    traverse: (visit: (node: unknown) => void) => visit(null),
    getFaceValue: () => ({ value: 0, label: '', reason: '' }),
  };
}

/** Where this file put die `index`, in the pixels a cell over it must read. */
function fakeSpot(index: number): readonly string[] {
  return [
    `${FAKE_DIE_X + index * FAKE_DIE_STEP}px`,
    `${FAKE_DIE_Y}px`,
    `${FAKE_DIE_RADIUS * 2}px`,
    `${FAKE_DIE_RADIUS * 2}px`,
  ];
}

/** Where one cell was actually put, read off its own inline style. */
function cellSpot(name: string): readonly string[] {
  const style = element(name).style;
  return [style.left, style.top, style.width, style.height];
}

/** The order the tray holds a pool in, derived here rather than imported. */
function trayIndexOf(dice: readonly Die[]): Map<string, number> {
  const order = [6, 8, 10, 12].flatMap((faces) => dice.filter((die) => die.faces === faces));
  return new Map(order.map((die, index) => [die.id, index]));
}

/** A mount that answers, and counts the containers it was handed. */
function fakeMount(
  answer: 'mounts' | 'refuses',
  tray: FakeTray = fakeTray(),
): TrayMount & { calls: HTMLElement[]; tray: FakeTray } {
  const calls: HTMLElement[] = [];
  const mount: TrayMount = (container) => {
    calls.push(container);
    return answer === 'mounts'
      ? Promise.resolve(tray)
      : Promise.reject(new Error('the lazy 3D chunk did not arrive'));
  };
  return Object.assign(mount, { calls, tray });
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

/**
 * Let the tray finish as well.
 *
 * The affordance imports the vendored bundle on demand and every throw is a
 * promise, so the tray runs over several tasks and not several microtasks.
 */
async function settleTray(until: () => boolean = () => true): Promise<void> {
  const deadline = Date.now() + TRAY_WAIT_MS;
  for (let step = 0; ; step += 1) {
    await act(async () => {
      await new Promise((done) => setTimeout(done, 1));
    });
    if (step >= 4 && until()) return;
    if (Date.now() > deadline) {
      throw new Error(`the tray never answered inside ${TRAY_WAIT_MS} ms`);
    }
  }
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

/**
 * How long a tray wait may take before it is called a failure.
 *
 * A wait that runs out throws and names itself, so a slow machine reports the
 * wait rather than a downstream assertion about a tray that had not answered
 * yet. The vendored bundle is warmed above, so this covers the tray alone.
 */
const TRAY_WAIT_MS = 15000;

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
// The 3D tray, inside the application
//
// The tray runs behind a fake library here, so what is asserted is the WIRING:
// that the screen hands the tray the answer the rules core gave it, that a
// push re-throws the named subset and spawns the die the profile added, and
// that the cells the keyboard reaches lie over the dice the tray put down.
//
// The picture itself is not asserted here. `node scripts/browser.mjs --table`
// reads the face pointing up off every body quaternion on the graphics card
// and compares it against the value the screen printed.
// ---------------------------------------------------------------------------

describe('the 3D tray inside the application', () => {
  it(
    'acts out the roll the core decided, and lays a cell over every die',
    async () => {
      const only = profile('pool-banes-damage-ratings');
      const opening = builtState({ attribute: 3, skill: 2, gear: 1 }, only.id);
      const mounting = fakeMount('mounts');
      mount({
        store: fakeStore(),
        probe: answers(ABOVE_THE_BAR),
        mount: mounting,
        initial: opening,
        random: seededRandom(8),
      });
      await settle();
      await settleTray();
      expect(screen().dataset['renderer'], 'the probe cleared the bar').toBe('tray');
      expect(mounting.tray.thrown.length, 'an empty table is not acted out').toBe(0);

      click(element('roll-button'));
      await settleTray(() => mounting.tray.thrown.length > 0);

      // The oracle. The same builder, the same difficulty and the same seed the
      // screen was given, asked outside it, so no face is written down here.
      const oracle = rollNow(opening, seededRandom(8));
      if (oracle.result === null) throw new Error('the fixture rolled nothing');
      const order = trayIndexOf(oracle.result.dice);
      const values = [...oracle.result.dice]
        .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
        .map((die) => latestValue(die) as number);

      expect(mounting.tray.thrown.length, 'the tray acted the throw out once').toBe(1);
      expect(
        (mounting.tray.thrown[0] ?? '').split('@')[1],
        'and it acted out the values the core decided, in tray order',
      ).toBe(values.join(','));
      expect(mounting.tray.diceList.length, 'one body per die of the pool').toBe(
        oracle.result.dice.length,
      );

      // The flat dice draw nothing over the table. Every cell is empty and every
      // one lies over the die it names, at the place this file put that die.
      const cells = [...document.querySelectorAll<HTMLElement>('[data-el^="die-"]')];
      expect(cells.length, 'one cell per die').toBe(oracle.result.dice.length);
      expect(
        cells.filter((cell) => (cell.textContent ?? '') !== '').length,
        'no cell draws a flat copy of the die under it',
      ).toBe(0);
      const placed = oracle.result.dice.map((die) => ({
        name: dieElement(die),
        drawn: cellSpot(dieElement(die)),
        wanted: fakeSpot(order.get(die.id) ?? -1),
      }));
      expect(placed.length).toBe(oracle.result.dice.length);
      for (const { name, drawn, wanted } of placed) {
        expect(drawn, `${name} lies over the die the tray put down`).toEqual(wanted);
      }

      // Every cell still carries its name and its state, exactly as the flat
      // renderer does. Section 6 walks the same list either way.
      expect(cells.filter((cell) => (cell.getAttribute('aria-label') ?? '') !== '').length).toBe(
        cells.length,
      );
      expect(
        cells.filter(
          (cell) =>
            cell.getAttribute('aria-pressed') !== null || cell.getAttribute('role') === 'img',
        ).length,
        'a die is a button that answers a press, or an image the rules hold',
      ).toBe(cells.length);
    },
    TRAY_WAIT_MS + 5000,
  );

  it(
    'acts the push out on the table, and spawns the die the profile added',
    async () => {
      // The third preset raises stress by one BEFORE the re-throw, so the core
      // creates a die the tray never spawned. That is the defect this unit
      // closes.
      const held = profile('pool-stress-and-complications');
      expect(held.stressBehaviour, 'the preset adds a die before the re-throw').toBe(
        'addBeforeReroll',
      );
      const opening = builtState({ attribute: 3, skill: 2 }, held.id);
      const first = rollNow(opening, seededRandom(4));
      if (first.result === null) throw new Error('the fixture rolled nothing');

      const mounting = fakeMount('mounts');
      mount({
        store: fakeStore(),
        probe: answers(ABOVE_THE_BAR),
        mount: mounting,
        initial: first,
        random: seededRandom(9),
      });
      await settle();
      await settleTray(() => mounting.tray.thrown.length > 0);
      expect(mounting.tray.thrown.length, 'the first roll is on the table').toBe(1);

      // The oracle, outside the screen, over the same result and the same seed.
      const oracle = push(first.result, held, seededRandom(9));
      if (oracle.kind !== 'pushed') throw new Error('the core refused the fixture push');
      expect(oracle.stressAdded, 'the core added a stress die').not.toBeNull();

      const before = mounting.tray.thrown.length;
      click(pushButton());
      await settleTray(() => mounting.tray.rerolled.length > 0);

      const order = trayIndexOf(first.result.dice);
      const added = oracle.dice.find((die) => die.id === oracle.stressAdded);
      if (added === undefined) throw new Error('the core named a die it did not add');
      expect(mounting.tray.thrown.length, 'a push is not a fresh throw of the whole pool').toBe(
        before,
      );
      expect(
        mounting.tray.added,
        'the tray spawned the die the push added, on its own value',
      ).toEqual([`1d${added.faces}@${latestValue(added) as number}`]);
      // The re-throw names the other loose dice, by tray index, and never the
      // die `add` has already landed.
      const wanted = oracle.rerolled
        .filter((id) => id !== oracle.stressAdded)
        .map((id) => order.get(id) ?? -1);
      expect(mounting.tray.rerolled.length).toBe(1);
      expect(mounting.tray.rerolled[0]?.[0]).toEqual(wanted);
      expect(mounting.tray.diceList.length, 'the table now holds one more body').toBe(
        first.result.dice.length + 1,
      );
      // And the screen shows the same pool the tray holds.
      expect(facesOnTable().size).toBe(oracle.dice.length);
    },
    TRAY_WAIT_MS + 5000,
  );

  it(
    'walks the thirty-five visits of section 6 with the table running',
    async () => {
      const list = walkList(DESIGN, 'After');
      expect(list.names.length, 'the numbered list is as long as the prose says').toBe(list.stated);

      const held = profile('pool-stress-and-complications');
      const dice = throwDice(worstCaseState());
      const kept = new Set(
        list.names.slice(1, 1 + list.names.filter((name) => name.startsWith('die-')).length),
      );
      // The same fixture the flat walk uses: the document says which dice it
      // keeps and the screen decides the order.
      const shelfNames = new Set(list.names.filter((name) => name.startsWith('die-')).slice(0, 9));
      const rolled = showing(
        dice,
        dice.map((die) => (shelfNames.has(dieElement(die)) ? 6 : 3)),
      );
      expect(kept.size).toBeGreaterThan(0);

      const mounting = fakeMount('mounts');
      mount({
        store: fakeStore(),
        probe: answers(ABOVE_THE_BAR),
        mount: mounting,
        initial: tableState(rolled, held.id, 10),
      });
      await settle();
      await settleTray(() => mounting.tray.thrown.length > 0);

      expect(screen().dataset['renderer'], 'the table is the renderer here').toBe('tray');
      expect(element('dice-table').hidden, 'and it is on the screen').toBe(false);
      expect(element('dice-tray').className, 'the cells lie over it').toContain('over');

      const visits = walk(document);
      expect(visits.map((visit) => visit.name)).toEqual(list.names);
      expect(visits.length, 'the walk reached every named visit and no other').toBe(list.stated);
      const positions = (by: 'tab' | 'arrow'): number[] =>
        visits.flatMap((visit, index) => (visit.by === by ? [index + 1] : []));
      expect(positions('tab')).toEqual(list.tab);
      expect(positions('arrow')).toEqual(list.arrow);

      // A press still keeps a die and a rule lock still refuses, over the same
      // cells the walk reached. The denominator is the whole pool.
      let pressedCount = 0;
      let refusedCount = 0;
      for (const name of list.names.filter((one) => one.startsWith('die-'))) {
        const cell = element(name);
        const was = cell.getAttribute('aria-pressed');
        click(cell);
        const now = element(name).getAttribute('aria-pressed');
        if (was === null) {
          expect(now, `${name} is held by the rules and takes no press`).toBeNull();
          refusedCount += 1;
          continue;
        }
        expect(now, `${name} answered the press`).not.toBe(was);
        pressedCount += 1;
        click(element(name));
      }
      expect(pressedCount + refusedCount).toBe(dice.length);
      expect(pressedCount).toBeGreaterThan(0);
      expect(refusedCount).toBeGreaterThan(0);
    },
    TRAY_WAIT_MS + 5000,
  );
});

// ---------------------------------------------------------------------------
// The marks wait for the dice — the defect the owner reported on a push
//
// The successes and the banes were drawn in the render that committed the
// throw, so the numbers stood on the screen while the 3D dice were still
// tumbling. The owner saw it on a push, where the dice are already on the
// table and the jump is unmissable. The first roll carried the same defect and
// was hidden only by the builder covering the table.
//
// The gate is `stillTumbling` in `src/shell/state.ts`, and it reads the
// renderer as well as the ordinals, so a player on the flat dice never waits.
// ---------------------------------------------------------------------------

/** Every mark on the status line, with the number beside it. */
function markCounts(): string[] {
  return [...document.querySelectorAll<HTMLElement>('[data-el="status-line"] .mark')].map((mark) =>
    (mark.parentElement?.textContent ?? '').trim(),
  );
}

/**
 * A tray that holds a throw open until the check lands it.
 *
 * The stand-in above resolves every throw at once, so the window this defect
 * lives in does not exist there. This one keeps the promise of the LAST call of
 * each path open — `roll` for a roll and `reroll` for a push — so the check can
 * read the screen while the tray is still acting the throw out. `land` is rest.
 */
function heldTray(): { tray: FakeTray; land: () => void } {
  const tray = fakeTray();
  const box = tray as unknown as {
    roll: (notation: string) => Promise<unknown>;
    reroll: (ids: number[], forced: number[]) => Promise<unknown>;
  };
  const rolls = box.roll;
  const rerolls = box.reroll;
  let release: (() => void) | null = null;
  const hold = async (answer: Promise<unknown>): Promise<unknown> => {
    const held = await answer;
    await new Promise<void>((done) => {
      release = done;
    });
    return held;
  };
  box.roll = (notation) => hold(rolls(notation));
  box.reroll = (ids, forced) => hold(rerolls(ids, forced));
  return {
    tray,
    land: () => {
      const done = release;
      release = null;
      done?.();
    },
  };
}

describe('the marks wait for the dice', () => {
  it(
    'draws no mark between the throw and the rest, on the roll and on the push',
    async () => {
      const held = profile('pool-stress-and-complications');
      const opening = builtState({ attribute: 3, skill: 2 }, held.id);
      const tray = heldTray();
      mount({
        store: fakeStore(),
        probe: answers(ABOVE_THE_BAR),
        mount: fakeMount('mounts', tray.tray),
        initial: opening,
        random: seededRandom(4),
      });
      await settle();
      await settleTray();
      expect(screen().dataset['renderer'], 'the probe cleared the bar').toBe('tray');

      // The oracle draws from ONE seeded source, in the order the screen draws
      // from its own: the roll first and the push after it. No number below is
      // written down here.
      const source = seededRandom(4);
      const rolled = rollNow(opening, source);
      const pushed = pushNow(rolled, source);
      const afterRoll = readout(rolled);
      const afterPush = readout(pushed);
      expect(afterPush.pushes, 'the fixture really pushed').toBe(1);

      // ---- The roll ----
      click(element('roll-button'));
      await settleTray(() => tray.tray.thrown.length > 0);
      expect(markCounts(), 'the dice are still tumbling, so no mark is drawn').toEqual([]);
      expect(spoken(), 'and the live region names the throw, never its result').toBe(ROLLING_TEXT);

      tray.land();
      await settleTray(() => markCounts().length > 0);
      expect(markCounts(), 'the tray reported rest, so the marks arrive').toEqual([
        String(afterRoll.successes),
        String(afterRoll.banes),
      ]);
      expect(spoken(), 'and the reader hears the same numbers in the same render').toBe(
        `${afterRoll.successes} ${afterRoll.successes === 1 ? 'success' : 'successes'}. ` +
          `${afterRoll.banes} ${afterRoll.banes === 1 ? 'bane' : 'banes'}. Push 0. ` +
          `The table holds ${readout(rolled).dice} dice. Stress ${afterRoll.stress}.`,
      );

      // ---- The push, which is the surface the owner reported ----
      expect(pushButton().disabled, 'the push is live at this seed').toBe(false);
      click(pushButton());
      await settleTray(() => tray.tray.rerolled.length > 0);
      expect(markCounts(), 'the pushed dice are tumbling as well, so the marks go').toEqual([]);
      expect(spoken(), 'and the sentence goes with them').toBe(ROLLING_TEXT);

      tray.land();
      await settleTray(() => markCounts().length > 0);
      expect(markCounts(), 'the pushed result arrives when the dice stop').toEqual([
        String(afterPush.successes),
        String(afterPush.banes),
      ]);
      expect(spoken()).toContain(
        `${afterPush.successes} ${afterPush.successes === 1 ? 'success' : 'successes'}.`,
      );
    },
    TRAY_WAIT_MS + 5000,
  );

  it('draws the marks in the render that threw, where the dice are flat', () => {
    const opening = builtState({ attribute: 3, skill: 2 }, 'pool-stress-and-complications');
    mount({ store: fakeStore(), initial: opening, random: seededRandom(4) });
    expect(screen().dataset['renderer'], 'the probe never answers, so the dice are flat').toBe(
      'flat',
    );
    const oracle = readout(rollNow(opening, seededRandom(4)));

    // Nothing is awaited between the press and the reading. No tray, no rest
    // and no timer stands between a flat player and the result.
    click(element('roll-button'));
    expect(markCounts(), 'the marks are in the render the throw produced').toEqual([
      String(oracle.successes),
      String(oracle.banes),
    ]);
    expect(spoken(), 'and so is the sentence').toContain(
      `${oracle.successes} ${oracle.successes === 1 ? 'success' : 'successes'}.`,
    );

    // The rule itself, with no free parameter in it: a committed throw with no
    // table under it is never in flight, whatever the two ordinals hold.
    expect(
      stillTumbling(rollNow(opening, seededRandom(4)), false),
      'a throw the flat dice drew waits for nothing',
    ).toBe(false);
  });

  it('lets the marks through when the tray never reports rest', async () => {
    vi.useFakeTimers();
    try {
      const opening = builtState({ attribute: 3, skill: 2 }, 'pool-stress-and-complications');
      const oracle = readout(rollNow(opening, seededRandom(4)));
      mount({
        store: fakeStore(),
        probe: answers(ABOVE_THE_BAR),
        // A mount that never answers. The tray takes no throw, so it reports no
        // rest, and nothing but the bound can release the marks.
        mount: () => new Promise<unknown>(() => {}),
        initial: opening,
        random: seededRandom(4),
      });
      await settle();
      expect(screen().dataset['renderer'], 'the probe cleared the bar').toBe('tray');

      click(element('roll-button'));
      expect(markCounts(), 'the throw is in flight and no tray is answering').toEqual([]);

      act(() => {
        vi.advanceTimersByTime(REST_BOUND_MS);
      });
      expect(markCounts(), 'the bound let the result through rather than holding it').toEqual([
        String(oracle.successes),
        String(oracle.banes),
      ]);
    } finally {
      vi.useRealTimers();
    }
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

// ---------------------------------------------------------------------------
// The rules the player chose — Units 4.1 and 4.2
//
// Three controls sit behind the one disclosure: `sheet-ruleset` picks one of
// the four presets, `sheet-artifact-curve` picks a curve, and `sheet-overrides`
// changes any field of the profile record on top of the chosen preset.
//
// **The core is the oracle for every effect below.** A stored setting that
// round trips is not the same as a setting that reaches the rules, so each
// check asks the core what the new rules do and compares the screen against
// that answer, never against a number written here.
//
// The faces come from a stub source that answers one face, so no check waits on
// a seed to produce the case it needs. Constraint 7 covers the shipping source
// and a test injects its own.
// ---------------------------------------------------------------------------

/** A source that answers one face, so a fixture states its own case. */
function alwaysFace(face: number): RandomSource {
  return { face: () => face };
}

function sheetInput(group: string, value: string): HTMLInputElement {
  const found = element(group).querySelector<HTMLInputElement>(`input[value="${value}"]`);
  if (found === null) throw new Error(`${group} holds no choice of ${value}`);
  return found;
}

/** Every die the kept shelf holds, by `data-el`. */
function keptOnTable(): string[] {
  return [
    ...document.querySelectorAll<HTMLElement>('[data-el="kept-shelf"] [data-el^="die-"]'),
  ].map((cell) => cell.dataset.el ?? '');
}

/** The rows of the override panel, by the path each one names. */
function overrideRows(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('[data-el="sheet-overrides"] [data-field]')];
}

/** A second walk of the record, so the panel cannot count itself. */
function recordLeaves(value: unknown, prefix: readonly string[] = []): string[][] {
  if (Array.isArray(value) || value === null || typeof value !== 'object') {
    return [[...prefix]];
  }
  const record = value as Record<string, unknown>;
  return Object.keys(record).flatMap((key) => recordLeaves(record[key], [...prefix, key]));
}

describe('the rule set control', () => {
  it('changes which dice the rules keep, and the core is the oracle', () => {
    // Two presets that answer a bane differently. The first keeps a bane on an
    // attribute die and the second says a bane means nothing.
    const keepsBanes = profile('pool-banes-damage-ratings');
    const ignoresBanes = profile('pool-referee-gains-a-point');
    expect(keepsBanes.lockOnesBy.attribute, 'the first preset keeps a bane').toBe(true);
    expect(ignoresBanes.lockOnesBy.attribute, 'the second preset does not').toBe(false);

    const store = fakeStore();
    const opening = builtState({ attribute: 3, skill: 2 }, ignoresBanes.id);
    mount({ store, initial: opening, random: alwaysFace(1) });
    click(element('roll-button'));

    const rolled = rollNow(opening, alwaysFace(1));
    if (rolled.result === null) throw new Error('the fixture rolled nothing');
    const under = (held: PushProfile): string[] =>
      rolled.result?.dice.filter((die) => isLocked(die, held)).map(dieElement) ?? [];
    expect(under(ignoresBanes), 'the second preset keeps nothing of this roll').toEqual([]);
    expect(under(keepsBanes).length, 'the first preset keeps some of it').toBeGreaterThan(0);
    expect(keptOnTable(), 'the screen follows the core it opened under').toEqual(
      under(ignoresBanes),
    );

    click(element('disclosure-toggle'));
    click(sheetInput('sheet-ruleset', keepsBanes.id));
    click(element('sheet-close'));

    // The table is cleared, so the same faces are thrown again under the new
    // rules. The stub answers the same face, so the roll is the same roll.
    click(element('roll-button'));
    expect(keptOnTable(), 'the screen now follows the core under the chosen preset').toEqual(
      under(keepsBanes),
    );
    expect(element('cost-row').textContent, 'and the price is the new price').toContain(
      'rating point',
    );
    expect(readSettings(store).presetId, 'the choice reached the store').toBe(keepsBanes.id);
  });

  it('clears the roll on the table rather than pricing it again', () => {
    // Decision 10. The player commits to a push at a price that was read before
    // the throw, so a roll already on the table is never read under new rules.
    const held = profile('pool-referee-gains-a-point');
    const opening = builtState({ attribute: 3, skill: 2 }, held.id);
    mount({ store: fakeStore(), initial: opening, random: alwaysFace(1) });
    click(element('roll-button'));
    expect(facesOnTable().size, 'the table holds the roll').toBe(5);
    expect(
      document.querySelector('[data-el="pool-builder"]'),
      'and the builder is closed',
    ).toBeNull();

    click(element('disclosure-toggle'));
    click(sheetInput('sheet-ruleset', 'pool-banes-damage-ratings'));

    expect(facesOnTable().size, 'the table is cleared').toBe(0);
    expect(document.querySelector('[data-el="push-button"]'), 'nothing is left to push').toBeNull();
    expect(spoken(), 'and the live region names the next throw again, not a table').toContain(
      'The throw takes 5 dice',
    );
    click(element('sheet-close'));
    expect(
      document.querySelector('[data-el="pool-builder"]'),
      'the screen is back at rest A, which is the state an empty table belongs to',
    ).not.toBeNull();
  });
});

describe('the artifact curve control', () => {
  it('changes what an artifact die is worth, and the core is the oracle', () => {
    const store = fakeStore();
    // Two d12 artifact dice and nothing else, so every success on the table is
    // an artifact success. A face of 8 is worth 2 on the escalating curve and 1
    // on the flat one.
    const opening = builtState({ artifact: 6 }, 'pool-referee-gains-a-point');
    mount({ store, initial: opening, random: alwaysFace(8) });
    click(element('roll-button'));

    const rolled = rollNow(opening, alwaysFace(8));
    if (rolled.result === null) throw new Error('the fixture rolled nothing');
    const escalating = successCount(rolled.result, 'artifactEscalating');
    const flat = successCount(rolled.result, 'artifactFlat');
    expect(escalating, 'the two curves price this roll differently').not.toBe(flat);
    expect(element('status-line').textContent).toContain(`${escalating} success`);

    click(element('disclosure-toggle'));
    click(sheetInput('sheet-artifact-curve', 'artifactFlat'));
    click(element('sheet-close'));
    click(element('roll-button'));

    expect(element('status-line').textContent, 'the flat curve reached the core').toContain(
      `${flat} success`,
    );
    expect(readSettings(store).artifactCurve, 'the choice reached the store').toBe('artifactFlat');
  });
});

describe('the override panel', () => {
  it('draws one row for every field of the profile record', () => {
    const held = profile('pool-stress-and-complications');
    mount({ store: fakeStore(), initial: { ...emptyState('pool'), profileId: held.id } });
    click(element('disclosure-toggle'));

    // The denominator is a walk of the record made here, not the list the panel
    // drew. A field the panel stops drawing fails this line.
    const leaves = recordLeaves(held).map((path) => path.join('.'));
    expect(leaves.length, 'the record holds fields at all').toBeGreaterThan(10);
    expect(
      overrideRows().map((row) => row.dataset.field),
      'the panel and the record name different fields',
    ).toEqual(leaves);

    let named = 0;
    for (const row of overrideRows()) {
      const control = row.querySelector<HTMLElement>('input, select');
      if (row.dataset.kind === 'text') {
        expect(control, `${row.dataset.field ?? ''}: the identity is read-only`).toBeNull();
      } else {
        expect(control, `${row.dataset.field ?? ''}: the row draws no control`).not.toBeNull();
        expect(
          (row.textContent ?? '').trim().length,
          `${row.dataset.field ?? ''}: the control carries no words`,
        ).toBeGreaterThan(0);
      }
      named += 1;
    }
    expect(named, 'every row was read').toBe(leaves.length);
  });

  it('changes a field of the record and the core answers under it', () => {
    // The preset allows one push. The override raises the limit, and the core
    // is what allows the second push.
    const held = profile('pool-banes-damage-ratings');
    expect(held.maxPushes, 'the preset allows one push').toBe(1);
    const store = fakeStore();
    const opening = builtState({ attribute: 3, skill: 2 }, held.id);
    mount({ store, initial: opening, random: alwaysFace(3) });

    click(element('roll-button'));
    click(pushButton());
    expect(pushButton().disabled, 'the preset is at its push limit').toBe(true);

    click(element('disclosure-toggle'));
    const limit = element('override-max-pushes').querySelector<HTMLInputElement>('input');
    if (limit === null) throw new Error('the panel draws no push limit');
    act(() => {
      limit.value = '3';
      limit.dispatchEvent(new Event('input', { bubbles: true }));
    });
    click(element('sheet-close'));

    expect(readSettings(store).profileOverride, 'the change reached the store').toStrictEqual({
      maxPushes: 3,
    });
    click(element('roll-button'));
    click(pushButton());
    expect(pushButton().disabled, 'the core allows a second push under the raised limit').toBe(
      false,
    );

    // The oracle: the same roll priced by the core under the merged profile.
    const raised = mergeProfile(held, { maxPushes: 3 });
    const rolled = rollNow(opening, alwaysFace(3));
    if (rolled.result === null) throw new Error('the fixture rolled nothing');
    const pushed = push(rolled.result, raised, alwaysFace(3));
    if (pushed.kind !== 'pushed') throw new Error('the core refused the fixture push');
    expect(previewPush(pushed, raised).kind, 'and the core still allows it').toBe('available');
  });

  it('marks the rows that differ and gives the preset back unchanged', () => {
    const held = profile('pool-banes-damage-ratings');
    const store = fakeStore();
    mount({ store, initial: { ...emptyState('pool'), profileId: held.id } });
    click(element('disclosure-toggle'));

    const reset = element('overrides-reset') as HTMLButtonElement;
    expect(reset.disabled, 'nothing to reset while the preset is unchanged').toBe(true);
    expect(
      overrideRows().filter((row) => row.classList.contains('changed')).length,
      'and no row is marked',
    ).toBe(0);

    click(element('override-lock-successes').querySelector('input') as Element);
    expect(
      element('override-lock-successes').classList.contains('changed'),
      'the row that moved is marked',
    ).toBe(true);
    expect(
      overrideRows().filter((row) => row.classList.contains('changed')).length,
      'and no other row is',
    ).toBe(1);
    expect(readSettings(store).profileOverride).toStrictEqual({ lockSuccesses: false });

    click(element('overrides-reset'));
    expect(
      overrideRows().filter((row) => row.classList.contains('changed')).length,
      'the reset takes every mark away',
    ).toBe(0);
    expect(readSettings(store).profileOverride, 'and the store holds no override').toStrictEqual(
      {},
    );
    expect((element('overrides-reset') as HTMLButtonElement).disabled).toBe(true);
  });

  it('carries every choice through a reload of the screen', () => {
    const store = fakeStore();
    mount({ store, initial: { ...emptyState('pool'), profileId: 'pool-banes-damage-ratings' } });
    click(element('disclosure-toggle'));
    click(sheetInput('sheet-ruleset', 'step-banes-cost-health'));
    click(sheetInput('sheet-artifact-curve', 'artifactFlat'));
    click(element('override-lock-successes').querySelector('input') as Element);

    // The screen is thrown away and built again over the same store, which is
    // what a reload does.
    act(() => render(null, root as HTMLElement));
    root?.remove();
    mount({ store });
    click(element('disclosure-toggle'));

    expect(sheetInput('sheet-ruleset', 'step-banes-cost-health').checked, 'the rule set').toBe(
      true,
    );
    expect(sheetInput('sheet-artifact-curve', 'artifactFlat').checked, 'the curve').toBe(true);
    expect(
      element('override-lock-successes').querySelector<HTMLInputElement>('input')?.checked,
      'the override',
    ).toBe(false);
    expect(
      element('override-lock-successes').classList.contains('changed'),
      'and it is still marked as a change',
    ).toBe(true);
  });
});

describe('the 3D tray under a change of rules', () => {
  it(
    'mounts the affordance again, so the marks follow the rules now in force',
    async () => {
      // Unit 3.5 recorded the limit this closes: the affordance reads the
      // profile once, at the mount, and nothing could change it afterwards.
      const ignoresBanes = profile('pool-referee-gains-a-point');
      const keepsBanes = profile('pool-banes-damage-ratings');
      const opening = builtState({ attribute: 3, skill: 2 }, ignoresBanes.id);
      const mounting = fakeMount('mounts');
      mount({
        store: fakeStore(),
        probe: answers(ABOVE_THE_BAR),
        mount: mounting,
        initial: opening,
        random: alwaysFace(1),
      });
      await settle();
      await settleTray();

      const marks = (): number =>
        mounting.tray.scene.children.filter((node) =>
          String((node as { name?: string }).name ?? '').startsWith('clatter-lock-marker'),
        ).length;

      click(element('roll-button'));
      await settleTray(() => mounting.tray.thrown.length > 0);

      // The oracle. Every die shows a bane, so the first preset keeps none of
      // them and the second keeps every attribute die.
      const rolled = rollNow(opening, alwaysFace(1));
      if (rolled.result === null) throw new Error('the fixture rolled nothing');
      const keptUnder = (held: PushProfile): number =>
        rolled.result?.dice.filter((die) => isLocked(die, held)).length ?? 0;
      expect(keptUnder(ignoresBanes), 'the opening preset keeps nothing').toBe(0);
      expect(keptUnder(keepsBanes), 'the chosen preset keeps some').toBeGreaterThan(0);
      expect(marks(), 'the tray drew no mark under the opening preset').toBe(0);

      click(element('disclosure-toggle'));
      click(sheetInput('sheet-ruleset', keepsBanes.id));
      click(element('sheet-close'));
      await settleTray();
      expect(marks(), 'a cleared table carries no mark').toBe(0);

      click(element('roll-button'));
      await settleTray(() => mounting.tray.thrown.length > 1);
      expect(marks(), 'the tray marks the dice the new rules keep').toBe(keptUnder(keepsBanes));
    },
    TRAY_WAIT_MS + 5000,
  );
});

// ---------------------------------------------------------------------------
// The saved pools — Unit 4.3, the list on the screen
//
// The storage half proved the four operations and the four refusals over a
// record. None of that is repeated here. These checks are about the screen: a
// pool that reaches the builder and then the rules core, a reorder a player can
// see, a name that is drawn as text and never as markup, a refusal that reaches
// the player in words, and a list a keyboard can work.
//
// Decision 11 of `docs/design/0012-settled-decisions.md` puts the list behind
// the disclosure, so the last check below reads both rest states and finds
// nothing of it there. That is the price of the decision, measured.
// ---------------------------------------------------------------------------

/**
 * A name holding markup, both kinds of quote, an ampersand and an emoji.
 *
 * It is 54 code points, which is inside the cap, because a name over the cap is
 * refused by the store and would never reach the list to be drawn at all.
 */
const RISKY_NAME = `<img src=x onerror=1><b>bold</b> & 'single' "double" 🎲`;

function presetRows(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('[data-el^="preset-row-"]')];
}

/** The names the list draws, read off the rows in the order they are drawn. */
function presetNames(): string[] {
  return presetRows().map((row) => row.dataset.name ?? '');
}

function presetNote(): string {
  return (element('preset-note').textContent ?? '').trim();
}

/** Type into the name field the way a player does. */
function typeName(text: string): void {
  const field = element('preset-name') as HTMLInputElement;
  act(() => {
    field.value = text;
    field.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

function savePreset(name: string): void {
  typeName(name);
  click(element('preset-save'));
}

/** The counts one saved pool holds. The artifact rating of 5 is `d12 + d10`. */
const SAVED_TILES: Partial<Counts> = {
  attribute: 4,
  skill: 2,
  gear: 1,
  artifact: 5,
  bonus: 1,
  stress: 3,
};

describe('the saved pool list', () => {
  it('recalls a saved pool into the builder, and the rules core is the oracle', () => {
    const store = fakeStore();
    const id = 'pool-referee-gains-a-point';
    const built = builtState(SAVED_TILES, id);
    mount({ store, initial: built, random: seededRandom(31) });

    click(element('disclosure-toggle'));
    savePreset('Night watch');
    expect(presetNote(), 'the panel says the pool went in').toBe(PRESET_SAVED_TEXT);
    expect(presetNames(), 'and the list holds one row under that name').toEqual(['Night watch']);
    click(element('sheet-close'));

    // The screen is thrown away and built again over the same store, which is
    // what a reload does, and it opens on a different pool.
    act(() => render(null, root as HTMLElement));
    root?.remove();
    mount({ store, initial: builtState({ attribute: 1 }, id), random: seededRandom(31) });

    click(element('disclosure-toggle'));
    click(element('preset-recall-0'));

    // The sheet closed and the builder opened, so the player sees the pool.
    expect(document.querySelector('[data-el="disclosure-sheet"]'), 'the sheet closed').toBeNull();
    expect(element('pool-builder'), 'and the builder is open').not.toBeNull();
    expect(cellValue('pool-cell-attribute'), 'the attribute tile').toBe('4');
    expect(cellValue('pool-cell-artifact'), 'the artifact tile steps its ladder').toBe('d12 + d10');

    // The oracle is the rules core, not the record. The recalled pool is thrown
    // and every face is compared against `firstRoll` over the pool the preset
    // stored, under the same seeded source.
    click(element('roll-button'));
    const stored = readSettings(store).poolPresets[0];
    if (stored === undefined) throw new Error('the store holds no preset');
    const outcome = firstRoll(
      applyDifficulty(poolBuilder(stored.counts), 0),
      seededRandom(31),
      stored.counts.stress ?? 0,
    );
    if (outcome.kind !== 'rolled') throw new Error('the core rolled nothing');
    const wanted = new Map(
      outcome.dice.map((die) => [dieElement(die), latestValue(die) ?? 0] as const),
    );
    expect(wanted.size, 'the core built a pool of the size the preset names').toBe(13);
    expect(facesOnTable(), 'the table holds the dice the core rolled, face for face').toEqual(
      wanted,
    );
  });

  it('reorders the list, over three presets, because a move of two is not observable', () => {
    const store = fakeStore();
    mount({ store, initial: builtState({ attribute: 2 }, 'pool-referee-gains-a-point') });
    click(element('disclosure-toggle'));
    for (const name of ['first', 'second', 'third']) savePreset(name);
    expect(presetNames(), 'three saved pools, in the order they were saved').toEqual([
      'first',
      'second',
      'third',
    ]);

    // The last row moves up one place. Over three rows that is a move nothing
    // else could produce: it changes the order of two rows and leaves one.
    click(element('preset-up-2'));
    expect(presetNote()).toBe(PRESET_MOVED_TEXT);
    expect(presetNames(), 'the third row moved up one place').toEqual(['first', 'third', 'second']);

    // And down again, from the middle, which no move of a two-row list can do.
    click(element('preset-down-1'));
    expect(presetNames(), 'and the middle row moved back down').toEqual([
      'first',
      'second',
      'third',
    ]);

    click(element('preset-up-1'));
    expect(presetNames(), 'the middle row moved up over the first').toEqual([
      'second',
      'first',
      'third',
    ]);
    expect(
      readSettings(store).poolPresets.map((preset) => preset.name),
      'the store holds the order the list draws',
    ).toEqual(['second', 'first', 'third']);

    // The ends refuse to leave the list.
    expect((element('preset-up-0') as HTMLButtonElement).disabled, 'the first row').toBe(true);
    expect((element('preset-down-2') as HTMLButtonElement).disabled, 'the last row').toBe(true);
    expect(element('preset-up-0').getAttribute('aria-disabled')).toBe('true');
    expect(element('preset-down-2').getAttribute('aria-disabled')).toBe('true');
  });

  it('draws a name holding markup as text, and no element comes from it', () => {
    const store = fakeStore();
    mount({ store, initial: builtState({ attribute: 2 }, 'pool-referee-gains-a-point') });
    click(element('disclosure-toggle'));
    savePreset(RISKY_NAME);

    const stored = readSettings(store).poolPresets[0];
    if (stored === undefined) throw new Error('the store holds no preset');
    expect(stored.name, 'storage kept every byte of the name').toBe(RISKY_NAME);

    // The drawn characters are the stored characters, counted in code points so
    // the emoji counts once.
    const drawn = element('preset-name-0');
    expect(drawn.textContent, 'the drawn name is the stored name').toBe(stored.name);
    expect([...(drawn.textContent ?? '')].length, 'character for character').toBe(
      [...stored.name].length,
    );

    // A check that only read the text content would pass while the markup was
    // parsed, because the text of a parsed `<b>bold</b>` still reads `bold`.
    // The name therefore holds no element the markup could have made.
    expect(drawn.children.length, 'the name is one text node and no element').toBe(0);
    expect(drawn.childNodes.length).toBe(1);
    expect(drawn.childNodes[0]?.nodeType, 'a text node').toBe(3);
    expect(
      document.querySelectorAll('img, script, b, iframe, svg').length,
      'and the document holds no element the name could have made',
    ).toBe(0);

    // The accessible names carry the same text, and they are attribute values,
    // which the framework writes rather than parses.
    expect(element('preset-recall-0').getAttribute('aria-label')).toBe(`Recall ${RISKY_NAME}`);
    expect(element('preset-delete-0').getAttribute('aria-label')).toBe(`Delete ${RISKY_NAME}`);
  });

  it('names the cause of every refusal the store can answer', () => {
    // The denominator is a second reading of the union, taken off the source of
    // the store rather than off the record that holds the sentences. A fifth
    // refusal added to `PresetRefusal` fails this line until it has words and a
    // route through the screen.
    const source = readFileSync(resolve(process.cwd(), 'src/settings/settings.ts'), 'utf8');
    const union = /export type PresetRefusal =\s*([^;]+);/.exec(source)?.[1];
    if (union === undefined) throw new Error('the store no longer declares PresetRefusal');
    const named = [...union.matchAll(/'([a-zA-Z]+)'/g)].map(([, name]) => name ?? '');
    expect(
      named.length,
      'the store answers four refusals. A fifth needs words and a route through this check',
    ).toBe(4);
    expect(
      Object.keys(PRESET_REFUSAL_TEXT).sort(),
      'every refusal the store answers has words on the screen',
    ).toEqual([...named].sort());

    const store = fakeStore();
    mount({ store, initial: builtState({ attribute: 2 }, 'pool-referee-gains-a-point') });
    click(element('disclosure-toggle'));
    const shown = new Map<string, string>();
    const field = (): HTMLInputElement => element('preset-name') as HTMLInputElement;

    // 1. An empty name. The save control is never disabled, so the refusal is
    //    reachable rather than prevented.
    click(element('preset-save'));
    shown.set('emptyName', presetNote());
    expect(field().getAttribute('aria-invalid'), 'the field is marked').toBe('true');

    // 2. A name over the cap, counted in code points. Sixty emoji save and
    //    sixty-one are refused, so the cap is proved at the screen in the units
    //    it is counted in.
    const emoji = '🎲';
    savePreset(emoji.repeat(MAX_PRESET_NAME_CHARS));
    expect(presetNote(), 'a name of the cap length saves').toBe(PRESET_SAVED_TEXT);
    savePreset(emoji.repeat(MAX_PRESET_NAME_CHARS + 1));
    shown.set('nameTooLong', presetNote());
    expect(presetNames().length, 'and the over-long name never reached the list').toBe(1);

    // 3. The preset limit, filled one save at a time through the field.
    for (let each = 1; each < MAX_POOL_PRESETS; each += 1) savePreset(`pool ${each}`);
    expect(presetNames().length, 'the list stands at its cap').toBe(MAX_POOL_PRESETS);
    savePreset('one too many');
    shown.set('atPresetLimit', presetNote());
    expect(presetNames().length, 'and the list is still at its cap').toBe(MAX_POOL_PRESETS);
    // A replacement is still let through at the cap, so the cap holds rows and
    // never the act of saving.
    savePreset('pool 1');
    expect(presetNote(), 'a save under a name the list holds replaces that row').toBe(
      PRESET_SAVED_TEXT,
    );

    // 4. No such preset. This is a real press and not a stub: the player pressed
    //    Delete twice before the list could be drawn again, and the second press
    //    reads a list the first one already changed.
    const held = presetNames().length;
    const doomed = element('preset-delete-0') as HTMLButtonElement;
    act(() => {
      doomed.click();
      doomed.click();
    });
    shown.set('noSuchPreset', presetNote());
    expect(presetNames().length, 'the double press deleted exactly one row').toBe(held - 1);

    // Every refusal reached the player, and each one carries its own sentence.
    expect([...shown.keys()].sort(), 'every refusal of the union was shown').toEqual(
      [...named].sort(),
    );
    for (const [reason, text] of shown) {
      expect(text, `${reason} reached the player under its own words`).toBe(
        PRESET_REFUSAL_TEXT[reason as keyof typeof PRESET_REFUSAL_TEXT],
      );
    }
    expect(new Set(shown.values()).size, 'the four sentences are four different sentences').toBe(4);
  });

  it('refuses a stored pool the six tiles cannot hold, and says why', () => {
    // A pool of this shape is unwritable through the interface: the artifact
    // ladder holds no rung of two d8 dice. It reaches the store only by hand,
    // and the migration keeps it, because the migration validates a pool
    // against the rules core and not against this screen.
    const store = fakeStore({
      ...DEFAULT_SETTINGS,
      poolPresets: [{ name: 'by hand', counts: { attribute: 2, artifact: [8, 8] } }],
    });
    mount({ store, initial: builtState({ attribute: 1 }, 'pool-referee-gains-a-point') });
    click(element('disclosure-toggle'));
    click(element('preset-recall-0'));

    expect(
      document.querySelector('[data-el="disclosure-sheet"]'),
      'the sheet stayed open, because the recall was refused',
    ).not.toBeNull();
    expect(presetNote(), 'and the panel named the cause').toBe(UNUSABLE_POOL_TEXT);
    // The builder is still collapsed, so the roll button is the readout of the
    // pool. A recall would have put four dice there and opened the builder.
    expect(
      element('roll-button').querySelector('small')?.textContent,
      'no tile took the stored pool',
    ).toContain('1 dice');
    expect(tilesFor({ attribute: 2, artifact: [8, 8] }), 'the tiles cannot hold it').toBeNull();
  });

  it('gives every control a role, an accessible name and a state', () => {
    const store = fakeStore();
    mount({ store, initial: builtState(SAVED_TILES, 'pool-referee-gains-a-point') });
    click(element('disclosure-toggle'));
    savePreset('Night watch');
    // The second pool is a different pool, so the two rows can differ in the
    // one state that follows the builder.
    click(element('sheet-close'));
    click(element('edit-pool-button'));
    click(element('pool-cell-gear').querySelector('.cell-p') as Element);
    click(element('disclosure-toggle'));
    savePreset('Daylight');

    const panel = element('sheet-presets');
    const controls = [...panel.querySelectorAll<HTMLElement>('button, input')];
    expect(controls.length, 'one field, one save and four controls a row').toBe(2 + 4 * 2);
    const names: string[] = [];
    for (const control of controls) {
      // The accessible name, computed the way a reader computes it: the label
      // attribute first, then the label around the control, then the words
      // inside it.
      const name = (
        control.getAttribute('aria-label') ??
        control.closest('label')?.textContent ??
        control.textContent ??
        ''
      ).trim();
      const state =
        control.getAttribute('aria-disabled') ??
        control.getAttribute('aria-invalid') ??
        control.getAttribute('aria-current');
      const row = control.closest<HTMLElement>('[data-el^="preset-row-"]');
      expect(control.tagName.toLowerCase(), 'the role is the element').toMatch(/^(button|input)$/);
      expect(name.length, `${control.dataset.el ?? ''} carries no accessible name`).toBeGreaterThan(
        0,
      );
      expect(state, `${control.dataset.el ?? ''} reports no state`).not.toBeNull();
      // A control inside a row names the row it acts on. Four controls a row
      // all reading "Delete" would leave a reader hearing one word per row and
      // no way to tell the rows apart.
      if (row !== null) {
        expect(name, `${control.dataset.el ?? ''} does not name the pool it acts on`).toContain(
          row.dataset.name ?? '',
        );
      }
      names.push(name);
    }
    expect(new Set(names).size, 'every control in the panel is named apart').toBe(names.length);

    // The state on the recall control is the row the builder holds. The second
    // pool was saved from the tiles as they now stand, so its row is current
    // and the first row is not.
    expect(element('preset-recall-1').getAttribute('aria-current'), 'the row in the builder').toBe(
      'true',
    );
    expect(element('preset-recall-0').getAttribute('aria-current'), 'the other row').toBe('false');
    expect(
      [...panel.querySelectorAll('.pre-here')].length,
      'and the mark is words as well as a frame',
    ).toBe(1);

    // A tile changes again, so no row holds the pool any more. The builder is
    // already open, because the recall of the second pool opened it.
    click(element('sheet-close'));
    click(element('pool-cell-bonus').querySelector('.cell-p') as Element);
    click(element('disclosure-toggle'));
    expect(
      [...element('sheet-presets').querySelectorAll('[aria-current="true"]')].length,
      'no row is current now',
    ).toBe(0);
  });

  it('draws no part of itself at either rest state, which is what Decision 11 costs', () => {
    // Decision 11 puts the list behind the disclosure and claims the control
    // budget of section 3 is untouched. The inventory check above counts the
    // eight named controls. This one counts what a tenth control would have
    // added to the screen at rest, and finds nothing.
    expect(
      DESIGN.includes('| `sheet-presets` |'),
      'section 4 lists the panel behind the one disclosure',
    ).toBe(true);
    const partsOnScreen = (): string[] =>
      [...document.querySelectorAll<HTMLElement>('[data-el]')]
        .map((each) => each.dataset.el ?? '')
        .filter((name) => name.startsWith('preset-') || name === 'sheet-presets');

    const thrown = rollNow(
      builtState({ attribute: 3, skill: 2 }, 'pool-referee-gains-a-point'),
      seededRandom(8),
    );
    mount({ store: fakeStore() });
    expect(partsOnScreen(), 'rest A holds no part of the panel').toEqual([]);
    act(() => render(null, root as HTMLElement));
    mount({ store: fakeStore(), initial: thrown });
    expect(partsOnScreen(), 'rest B holds no part of the panel').toEqual([]);

    // And it is one press away, which is the whole of what the disclosure costs.
    click(element('disclosure-toggle'));
    expect(element('sheet-presets'), 'the panel is behind the one disclosure').not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// The history destination — Unit 4.4
//
// The destination itself is measured in `src/shell/history.test.tsx`, against
// entries handed straight in. What is measured here is the ROUTE: the sheet
// opens the destination, the destination replaces the roll flow, and neither
// keyboard walk of section 6 can change because the roll flow leaves the
// document while the history is open.
//
// jsdom exposes no `indexedDB`, so the log answers `refused` here and the list
// is empty. That is the point of the split: whether a roll reached the store is
// read back out of a real IndexedDB by `node scripts/browser.mjs --history`.
// ---------------------------------------------------------------------------

describe('the history destination', () => {
  it('is opened by sheet-history and replaces the roll flow', async () => {
    mount({ store: fakeStore() });
    click(element('disclosure-toggle'));
    // Section 4 of the design lists the control against Units 4.4 to 4.7.
    expect(
      DESIGN.includes('| `sheet-history` |'),
      'section 4 lists sheet-history behind the one disclosure',
    ).toBe(true);
    const open = element('sheet-history');
    expect(open.textContent).toContain('Open the history');
    click(open);
    await act(async () => {
      await Promise.resolve();
    });

    // The history is a SEPARATE DESTINATION, so the roll flow is gone. Every
    // control of section 3 leaves the document with it, which is why neither
    // walk of section 6 can change.
    expect(element('history')).not.toBeNull();
    for (const gone of [
      'roll-button',
      'disclosure-toggle',
      'pool-bar',
      'difficulty',
      'shell-footer',
    ]) {
      expect(document.querySelector(`[data-el="${gone}"]`), `${gone} left the document`).toBeNull();
    }
    expect(document.querySelectorAll('[data-el="history-storage-note"]').length).toBe(1);

    // And back again, with the focus on the control that led here.
    click(element('back-button'));
    expect(element('roll-button')).not.toBeNull();
    expect(document.querySelector('[data-el="history"]')).toBeNull();
    expect((document.activeElement as HTMLElement).dataset.el).toBe('disclosure-toggle');
  });

  it('prints the storage estimate in the settings sheet, and no control counts for it', () => {
    mount({ store: fakeStore() });
    click(element('disclosure-toggle'));
    const shown = element('sheet-storage-estimate');
    // jsdom has no `navigator.storage.estimate`, so `estimateStorage` answers
    // null and the sentence says so rather than printing a zero.
    expect(shown.textContent).toBe(storageLine(null));
    expect(shown.getAttribute('role'), 'the number arrives after the sheet is drawn').toBe(
      'status',
    );
    expect(shown.tabIndex, 'a read-only reading holds no tab stop').toBeLessThan(0);
  });

  it('leaves both keyboard walks of section 6 exactly where they were', () => {
    // The two walks are asserted in full at the top of this file. This check
    // makes the REASON explicit and reads it out of the design rather than
    // restating it: the history is a separate destination, so neither of its
    // two controls appears in either walk.
    const summary = DESIGN.slice(
      DESIGN.indexOf('### The history is a separate destination'),
      DESIGN.indexOf('###', DESIGN.indexOf('### The history is a separate destination') + 1),
    );
    const named = [...summary.matchAll(/`([a-z-]+)`/g)].map((match) => match[1] as string);
    expect(named).toContain('history-list');
    expect(named).toContain('back-button');
    const before = walkList(DESIGN, 'Before');
    const after = walkList(DESIGN, 'After');
    expect(before.stated, 'eleven visits before the throw').toBe(before.names.length);
    expect(after.stated, 'thirty-five visits after it').toBe(after.names.length);
    for (const control of new Set(named)) {
      expect(before.names, `the before-throw walk never names ${control}`).not.toContain(control);
      expect(after.names, `the after-throw walk never names ${control}`).not.toContain(control);
    }
  });
});

// ---------------------------------------------------------------------------
// The share card — Unit 4.9
//
// The pixels are measured on a graphics card by
// `node scripts/browser.mjs --share`, and the controls are driven in a real
// browser by `node scripts/browser.mjs --share-card`. What is measured here is
// the wiring, over a card handed straight in: jsdom holds no WebGL renderer and
// no 2d context, so `makeShareCard` is injected exactly as the mount and the
// probe are.
//
// **The panel costs the screen nothing.** Decision 16 puts it behind the one
// disclosure, so the control inventory of section 3 and both keyboard walks of
// section 6 are untouched, and the two checks below measure that rather than
// claim it.
// ---------------------------------------------------------------------------

/** A card handed straight in, under the state the screen is holding. */
function cardFor(state: AppState): {
  readonly card: {
    url: string;
    alt: string;
    filename: string;
    file: File;
    summary: NonNullable<ReturnType<typeof shareCard>>;
  };
} {
  const summary = shareCard(state);
  if (summary === null) throw new Error('the fixture put no dice on the table');
  const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
  return {
    card: {
      url: `data:image/jpeg;base64,${btoa(String.fromCharCode(...bytes))}`,
      alt: summary.alt,
      filename: 'clatter-card-2026-08-10-0605.jpg',
      file: new File([bytes], 'clatter-card-2026-08-10-0605.jpg', { type: 'image/jpeg' }),
      summary,
    },
  };
}

/** Watch what the anchor download hands the browser, as the browser sees it. */
function watchDownload(): {
  readonly urls: number;
  readonly names: string[];
  readonly blobs: Blob[];
  restore: () => void;
} {
  const held = { urls: 0, names: [] as string[], blobs: [] as Blob[] };
  const url = globalThis.URL as unknown as {
    createObjectURL?: (blob: Blob) => string;
    revokeObjectURL?: (url: string) => void;
  };
  const beforeCreate = url.createObjectURL;
  const beforeRevoke = url.revokeObjectURL;
  const beforeClick = HTMLAnchorElement.prototype.click;
  url.createObjectURL = (blob: Blob): string => {
    held.urls += 1;
    held.blobs.push(blob);
    return 'blob:card';
  };
  url.revokeObjectURL = (): void => {};
  HTMLAnchorElement.prototype.click = function click(this: HTMLAnchorElement): void {
    held.names.push(this.download);
  };
  return {
    get urls(): number {
      return held.urls;
    },
    names: held.names,
    blobs: held.blobs,
    restore: (): void => {
      url.createObjectURL = beforeCreate;
      url.revokeObjectURL = beforeRevoke;
      HTMLAnchorElement.prototype.click = beforeClick;
    },
  };
}

describe('the share card behind the disclosure', () => {
  it('draws no part of itself at either rest state, which is what Decision 16 costs', () => {
    expect(
      DESIGN.includes('| `sheet-share` |'),
      'section 4 lists the panel behind the one disclosure',
    ).toBe(true);
    const partsOnScreen = (): string[] =>
      [...document.querySelectorAll<HTMLElement>('[data-el]')]
        .map((each) => each.dataset.el ?? '')
        .filter((name) => name.startsWith('share-') || name === 'sheet-share');

    const thrown = rollNow(
      builtState({ attribute: 3, skill: 2 }, 'pool-referee-gains-a-point'),
      seededRandom(8),
    );
    mount({ store: fakeStore() });
    expect(partsOnScreen(), 'rest A holds no part of the panel').toEqual([]);
    act(() => render(null, root as HTMLElement));
    mount({ store: fakeStore(), initial: thrown });
    expect(partsOnScreen(), 'rest B holds no part of the panel').toEqual([]);

    click(element('disclosure-toggle'));
    expect(element('sheet-share'), 'the panel is behind the one disclosure').not.toBeNull();
    // One control before a card exists. The two ways out arrive with the card.
    expect(document.querySelector('[data-el="share-download-button"]')).toBeNull();
    expect(document.querySelector('[data-el="share-send-button"]')).toBeNull();
    expect(document.querySelector('[data-el="share-preview"]')).toBeNull();
  });

  it('refuses an empty table by name, and refuses the flat dice by name', () => {
    mount({ store: fakeStore() });
    click(element('disclosure-toggle'));
    click(element('share-card-button'));
    expect(element('share-note').textContent).toBe(SHARE_REFUSAL_TEXT.noRoll);
    expect(document.querySelector('[data-el="share-preview"]')).toBeNull();

    act(() => render(null, root as HTMLElement));
    // The dice are drawn flat here, because the probe never answers, so the
    // screen holds no tray and the real `makeShareCard` refuses on that.
    const thrown = rollNow(
      builtState({ attribute: 3 }, 'pool-referee-gains-a-point'),
      seededRandom(5),
    );
    mount({ store: fakeStore(), initial: thrown });
    click(element('disclosure-toggle'));
    click(element('share-card-button'));
    expect(element('share-note').textContent).toBe(SHARE_REFUSAL_TEXT.flatDice);
    expect(document.querySelector('[data-el="share-preview"]')).toBeNull();
  });

  it('shows the card with alternative text the roll itself produced', () => {
    const thrown = rollNow(
      builtState({ attribute: 3, skill: 2, stress: 2 }, 'pool-stress-and-complications'),
      seededRandom(12),
    );
    const made = cardFor(thrown);
    mount({ store: fakeStore(), initial: thrown, makeCard: () => ({ kind: 'made', ...made }) });
    click(element('disclosure-toggle'));
    click(element('share-card-button'));

    const preview = element('share-preview') as HTMLImageElement;
    expect(preview.tagName).toBe('IMG');
    expect(preview.getAttribute('src')).toBe(made.card.url);
    // The oracle is the roll, not the card: `shareCard` is asked again here.
    const summary = shareCard(thrown);
    expect(preview.getAttribute('alt')).toBe(summary?.alt);
    for (const reading of summary?.readings ?? []) {
      expect(preview.getAttribute('alt'), `the alternative text names ${reading.key}`).toContain(
        reading.text.charAt(0).toUpperCase() + reading.text.slice(1),
      );
    }
    expect(preview.tabIndex, 'the preview holds no tab stop').toBeLessThan(0);
    expect(element('share-note').textContent).toBe(CARD_READY_TEXT);
    expect(element('share-download-button')).not.toBeNull();
  });

  it('hands the browser the bytes the composition produced, under the card name', () => {
    const thrown = rollNow(
      builtState({ attribute: 3, skill: 2 }, 'pool-referee-gains-a-point'),
      seededRandom(9),
    );
    const made = cardFor(thrown);
    const watch = watchDownload();
    try {
      mount({ store: fakeStore(), initial: thrown, makeCard: () => ({ kind: 'made', ...made }) });
      click(element('disclosure-toggle'));
      click(element('share-card-button'));
      click(element('share-download-button'));
      expect(watch.urls, 'one press hands the browser one object URL').toBe(1);
      expect(watch.names).toEqual([made.card.filename]);
      expect(watch.blobs[0], 'the very file the composition made').toBe(made.card.file);
      expect(element('share-note').textContent).toBe(`The card went to ${made.card.filename}.`);
    } finally {
      watch.restore();
    }
  });

  it('says so where the browser can save no file at all', () => {
    const thrown = rollNow(
      builtState({ attribute: 3 }, 'pool-referee-gains-a-point'),
      seededRandom(9),
    );
    const made = cardFor(thrown);
    // The browser that holds no object URL at all. It is taken away here
    // rather than looked for, because the engine this file runs in has one.
    const url = globalThis.URL as unknown as { createObjectURL?: (blob: Blob) => string };
    const before = url.createObjectURL;
    Object.defineProperty(url, 'createObjectURL', { value: undefined, configurable: true });
    try {
      mount({ store: fakeStore(), initial: thrown, makeCard: () => ({ kind: 'made', ...made }) });
      click(element('disclosure-toggle'));
      click(element('share-card-button'));
      click(element('share-download-button'));
      expect(element('share-note').textContent).toBe(NO_DOWNLOAD_TEXT);
    } finally {
      Object.defineProperty(url, 'createObjectURL', { value: before, configurable: true });
    }
  });

  it('draws the send control only where the browser offers to share this very file', async () => {
    const thrown = rollNow(
      builtState({ attribute: 3 }, 'pool-referee-gains-a-point'),
      seededRandom(9),
    );
    const made = cardFor(thrown);
    mount({ store: fakeStore(), initial: thrown, makeCard: () => ({ kind: 'made', ...made }) });
    click(element('disclosure-toggle'));
    click(element('share-card-button'));
    // jsdom offers no share target, so the control is absent and that absence
    // is not a failure.
    expect(document.querySelector('[data-el="share-send-button"]')).toBeNull();
    act(() => render(null, root as HTMLElement));

    const given: unknown[] = [];
    const target = navigator as unknown as Record<string, unknown>;
    target.canShare = (data: { files?: File[] }): boolean => data.files?.[0] === made.card.file;
    target.share = async (data: unknown): Promise<void> => {
      given.push(data);
    };
    try {
      mount({ store: fakeStore(), initial: thrown, makeCard: () => ({ kind: 'made', ...made }) });
      click(element('disclosure-toggle'));
      click(element('share-card-button'));
      const send = element('share-send-button');
      expect(send.getAttribute('aria-disabled')).toBe('false');
      click(send);
      await act(async () => {
        await Promise.resolve();
      });
      expect(given, 'the file and the same readings in words').toEqual([
        { files: [made.card.file], text: made.card.alt },
      ]);
      expect(element('share-note').textContent).toBe(CARD_SENT_TEXT);
    } finally {
      delete target.canShare;
      delete target.share;
    }
  });

  it('clears the card when the dice change, so no card outlives its roll', () => {
    const thrown = rollNow(
      builtState({ attribute: 3, skill: 2 }, 'pool-referee-gains-a-point'),
      seededRandom(9),
    );
    const made = cardFor(thrown);
    mount({
      store: fakeStore(),
      initial: thrown,
      random: seededRandom(21),
      makeCard: () => ({ kind: 'made', ...made }),
    });
    click(element('disclosure-toggle'));
    click(element('share-card-button'));
    expect(element('share-preview')).not.toBeNull();
    click(element('sheet-close'));
    click(element('roll-button'));
    click(element('disclosure-toggle'));
    expect(
      document.querySelector('[data-el="share-preview"]'),
      'a new roll takes the old card away',
    ).toBeNull();
    expect(element('share-note').textContent).toBe('');
  });

  it('leaves the control inventory of section 3 and both walks of section 6 alone', () => {
    // The inventory check at the top of this file counts the eight controls of
    // section 3 at both rest states. This one reads the two walks out of the
    // design and asserts that no control of this unit is named in either.
    const before = walkList(DESIGN, 'Before');
    const after = walkList(DESIGN, 'After');
    expect(before.stated).toBe(before.names.length);
    expect(after.stated).toBe(after.names.length);
    for (const name of [
      'sheet-share',
      'share-card-button',
      'share-download-button',
      'share-send-button',
      'share-preview',
    ]) {
      expect(before.names, `the before-throw walk never names ${name}`).not.toContain(name);
      expect(after.names, `the after-throw walk never names ${name}`).not.toContain(name);
    }
  });
});

// ---------------------------------------------------------------------------
// The sound controls — Unit 3.6, the interface half
//
// The engine, its state and the collision hook landed with the engine half.
// What is here is the two controls and the wiring: a level a player sets
// reaches the GAIN NODE the engine built, and it is read off that node rather
// than off the record it came from. jsdom has no Web Audio, so the engine under
// test is built on a context this file makes.
//
// The claim these checks cannot make is that a roll in a browser really starts
// voices, because jsdom mounts no tray and a tray reports no collision without
// one. `node scripts/browser.mjs --sound-controls` makes it.
// ---------------------------------------------------------------------------

/** The three nodes `createSoundEngine` builds, and nothing else. */
function fakeAudio(): { context: BaseAudioContext; gains: number[] } {
  const gains: number[] = [];
  const node = (extra: Record<string, unknown> = {}) => {
    const held = {
      connect: (target: unknown) => target,
      ...extra,
    };
    return held;
  };
  const param = () => ({ value: 0 });
  const context = {
    destination: node(),
    currentTime: 0,
    sampleRate: 48000,
    state: 'suspended',
    createGain: () => {
      const gain = { value: 1 };
      gains.push(gain.value);
      return node({ gain });
    },
    createDynamicsCompressor: () =>
      node({
        threshold: param(),
        knee: param(),
        ratio: param(),
        attack: param(),
        release: param(),
      }),
  } as unknown as BaseAudioContext;
  return { context, gains };
}

/** An engine on a context this file owns, so `enable` builds a real graph. */
function testEngine(volume = DEFAULT_SETTINGS.soundVolume): SoundEngine {
  return createSoundEngine({ volume, createContext: () => fakeAudio().context });
}

/** An engine on a browser that has no Web Audio at all. */
function silentBrowserEngine(): SoundEngine {
  return createSoundEngine({
    createContext: () => {
      throw new TypeError('AudioContext is not defined');
    },
  });
}

/** The level the gain node really carries, or null while none is built. */
function gainLevel(engine: SoundEngine): number | null {
  return engine.output === null ? null : engine.output.gain.value;
}

/** Throw the screen away, which is what a reload does. */
function unmount(): void {
  act(() => render(null, root as HTMLElement));
  root?.remove();
  root = null;
}

function setRange(name: string, value: number): void {
  const range = element(name) as HTMLInputElement;
  act(() => {
    range.value = String(value);
    range.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

describe('the sound controls behind the disclosure', () => {
  it('builds no audio context until the player asks for sound', () => {
    const engine = testEngine();
    mount({ store: fakeStore(), sound: engine });
    click(element('disclosure-toggle'));
    expect(engine.context, 'nothing is built while sound is off').toBeNull();
    expect(engine.enabled).toBe(false);
    click(element('sheet-sound-toggle'));
    expect(engine.enabled).toBe(true);
    expect(engine.context, 'the press that asked for sound built the graph').not.toBeNull();
  });

  it('carries the level to the gain node, at more than one level', () => {
    const store = fakeStore();
    const engine = testEngine();
    mount({ store, sound: engine });
    click(element('disclosure-toggle'));
    click(element('sheet-sound-toggle'));

    // Read off the audio graph every time, never off the setting that fed it.
    setRange('sheet-sound-volume', 0.25);
    expect(gainLevel(engine)).toBe(0.25);
    expect(readSettings(store).soundVolume).toBe(0.25);

    setRange('sheet-sound-volume', 0.75);
    expect(gainLevel(engine)).toBe(0.75);
    expect(readSettings(store).soundVolume).toBe(0.75);

    // Zero is a shut output and is not the off state: the graph still stands.
    setRange('sheet-sound-volume', 0);
    expect(gainLevel(engine)).toBe(0);
    expect(engine.enabled, 'a level of zero is not the same as off').toBe(true);
  });

  it('opens the level the record holds, and takes the level across a reload', () => {
    const store = fakeStore();
    const first = testEngine();
    mount({ store, sound: first });
    click(element('disclosure-toggle'));
    click(element('sheet-sound-toggle'));
    setRange('sheet-sound-volume', 0.35);
    unmount();

    const stored = readSettings(store);
    expect(stored).toMatchObject({ soundEnabled: true, soundVolume: 0.35 });
    // A second screen over the same record: the engine opens at that level and
    // the graph carries it, with no control touched.
    const second = createSoundEngine({
      enabled: stored.soundEnabled,
      volume: stored.soundVolume,
      createContext: () => fakeAudio().context,
    });
    mount({ store, sound: second });
    expect(second.enabled).toBe(true);
    expect(gainLevel(second), 'the stored level reached the graph on its own').toBe(0.35);
    click(element('disclosure-toggle'));
    expect((element('sheet-sound-volume') as HTMLInputElement).value).toBe('0.35');
    expect((element('sheet-sound-toggle') as HTMLInputElement).checked).toBe(true);
  });

  it('gives both controls a role, an accessible name and a state', () => {
    mount({ store: fakeStore(), sound: testEngine() });
    click(element('disclosure-toggle'));
    const toggle = element('sheet-sound-toggle') as HTMLInputElement;
    const volume = element('sheet-sound-volume') as HTMLInputElement;

    expect(toggle.type, 'a checkbox carries the checkbox role').toBe('checkbox');
    expect(
      (toggle.closest('label')?.textContent ?? '').trim(),
      'the label is the accessible name',
    ).toBe('The dice make a sound');
    expect(toggle.checked, 'the state is off, which is what the record holds').toBe(false);

    expect(volume.type, 'a range input carries the slider role').toBe('range');
    // The name is on the control. The label around it also holds the level, so
    // a name taken from that label would announce the level twice.
    expect(volume.getAttribute('aria-label'), 'the accessible name, and only it').toBe('Volume');
    expect((volume.closest('label')?.textContent ?? '').trim()).toContain('Volume');
    expect(volume.getAttribute('aria-valuetext'), 'the state, in words').toBe('50 per cent');
    expect(volume.min).toBe('0');
    expect(volume.max).toBe('1');

    // Reachable by keyboard alone: both are tab stops of the open sheet.
    const stops = tabStops(element('disclosure-sheet')).map((each) => each.dataset['el']);
    expect(stops).toContain('sheet-sound-toggle');
    expect(stops).toContain('sheet-sound-volume');
  });

  it('says so where the browser makes no sound at all, and records nothing', () => {
    const store = fakeStore();
    mount({ store, sound: silentBrowserEngine() });
    click(element('disclosure-toggle'));
    expect(element('sheet-sound-note').textContent).toBe(SOUND_NOTE_TEXT);
    click(element('sheet-sound-toggle'));
    expect(element('sheet-sound-note').textContent).toBe(NO_AUDIO_TEXT);
    expect(
      readSettings(store).soundEnabled,
      'a record that promised sound this browser cannot make would greet the next session with silence',
    ).toBe(false);
    expect((element('sheet-sound-toggle') as HTMLInputElement).checked).toBe(false);
  });

  it('draws no part of itself at either rest state', () => {
    mount({ store: fakeStore(), sound: testEngine() });
    expect(document.querySelector('[data-el="sheet-sound"]')).toBeNull();
    click(element('roll-button'));
    expect(document.querySelector('[data-el="sheet-sound"]')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// The performance overlay — Unit 3.8, the overlay half
//
// The instrument is held by `src/shell/perf.test.ts` and the panel by
// `src/shell/overlay.test.tsx`. What is here is the wiring into the screen: the
// switch that shows it, the press that opens a measurement window, and the
// claim that the panel adds nothing to either keyboard walk of section 6.
// ---------------------------------------------------------------------------

describe('the performance overlay', () => {
  it('is off until the player asks for it, and the switch shows it', () => {
    mount({ store: fakeStore() });
    expect(document.querySelector('[data-el="perf-overlay"]')).toBeNull();
    click(element('disclosure-toggle'));
    const toggle = element('sheet-overlay-toggle') as HTMLInputElement;
    expect(toggle.type).toBe('checkbox');
    expect(toggle.checked).toBe(false);
    expect((toggle.closest('label')?.textContent ?? '').trim()).toBe(
      'Show the performance readings',
    );
    click(toggle);
    expect(element('perf-overlay')).not.toBeNull();
    click(element('sheet-overlay-toggle'));
    expect(document.querySelector('[data-el="perf-overlay"]')).toBeNull();
  });

  it('is not stored, so a reload opens without it', () => {
    const store = fakeStore();
    mount({ store });
    click(element('disclosure-toggle'));
    click(element('sheet-overlay-toggle'));
    expect(element('perf-overlay')).not.toBeNull();
    const record = JSON.parse(String(store.getItem(SETTINGS_KEY) ?? '{}')) as Record<
      string,
      unknown
    >;
    expect(
      Object.keys(record).filter((key) => key.toLowerCase().includes('overlay')),
      'a diagnostic panel that outlived the session would be a cost the player forgot about',
    ).toEqual([]);
    unmount();
    mount({ store });
    expect(document.querySelector('[data-el="perf-overlay"]')).toBeNull();
  });

  it('opens a measurement window at the press itself', () => {
    mount({ store: fakeStore() });
    click(element('disclosure-toggle'));
    click(element('sheet-overlay-toggle'));
    click(element('sheet-close'));
    const before = element('perf-firstMotion').textContent ?? '';
    expect(before, 'no throw has been measured yet').toContain('not measured here');
    click(element('roll-button'));
    // The flat dice of jsdom have no table, so the figure names the reason
    // rather than printing a zero. The window still opened: the panel counts
    // the throw.
    expect(element('perf-firstMotion').dataset['reading']).toBe('unavailable');
    expect(element('perf-firstMotion').textContent).not.toMatch(/\b0 ms\b/);
  });

  it('adds no tab stop, so both walks of section 6 are the walks they were', () => {
    const before = walkList(DESIGN, 'Before');
    const after = walkList(DESIGN, 'After');
    expect(before.stated).toBe(11);
    expect(after.stated).toBe(35);
    for (const name of ['sheet-sound', 'sheet-overlay', 'perf-overlay']) {
      expect(before.names, `the before-throw walk never names ${name}`).not.toContain(name);
      expect(after.names, `the after-throw walk never names ${name}`).not.toContain(name);
    }

    // The live screen, with the overlay on. The panel is drawn over the screen
    // and the walk must be the same eleven visits it was without it.
    mount({ store: fakeStore() });
    click(element('disclosure-toggle'));
    click(element('sheet-overlay-toggle'));
    click(element('sheet-close'));
    expect(element('perf-overlay'), 'the panel is on the screen for this walk').not.toBeNull();
    const visits = walk(document);
    expect(visits.map((visit) => visit.name)).toEqual(before.names);
    expect(visits.length).toBe(before.stated);
    const panel = element('perf-overlay');
    expect(panel.getAttribute('aria-label')).toBe('Performance readings');
    expect(tabStops(panel)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// The error surfaces — Unit 4.10
//
// Two of the five failures are REAL here rather than staged, and that is why
// they are measured here at all:
//
//   - **jsdom exposes no `indexedDB`.** `openLog` answers `refused` against the
//     real browser API, so the log fault below is the application meeting a
//     platform that keeps no log, not a prop handed to a banner.
//   - **`store` of null is the answer `localSettingsStore` gives** where the
//     browser refuses `localStorage`. `mount` passes it by default.
//
// The other three — a refused chunk, a full disk and a malformed file — need a
// real browser and are driven by `node scripts/browser.mjs --faults`.
// ---------------------------------------------------------------------------

describe('the fault banner', () => {
  it('draws one row per slot from the first paint, and every row is empty', () => {
    mount({ store: fakeStore() });
    const banner = element('fault-banner');
    const rows = [...banner.querySelectorAll<HTMLElement>('p')];
    expect(rows.length, 'one row per slot, and the slots are the denominator').toBe(
      FAULT_SLOTS.length,
    );
    expect(rows.map((row) => row.dataset['el'])).toEqual(
      FAULT_SLOTS.map((slot) => FAULT_SLOT_ELEMENT[slot]),
    );
    // A live region built at the moment it fills is announced by some readers
    // and not by others, so every row is here before anything fails.
    for (const row of rows) {
      expect(row.textContent, `${row.dataset['el']} carries no text yet`).toBe('');
    }
  });

  it('says the browser keeps no log, when the browser keeps no log', async () => {
    // Driven, not staged: jsdom has no `indexedDB`, so `openLog` answers
    // `refused` from the real call.
    expect(
      (globalThis as { indexedDB?: unknown }).indexedDB,
      'this environment really has no IndexedDB',
    ).toBeUndefined();
    mount({ store: fakeStore() });
    await act(async () => {
      await Promise.resolve();
    });

    const said = element('log-fault-note');
    expect(said.dataset['fault'], 'the row names the fault it drew').toBe('log-refused');
    expect(said.textContent).toBe(faultLine(faultOf('log-refused')));
    expect(said.textContent, 'it says what the player loses').toContain('go when the tab closes');
    expect(said.textContent, 'and what to do next').toContain('outside a private window');

    // The surface reaches a live region and carries a name.
    const banner = element('fault-banner');
    expect(banner.getAttribute('role')).toBe('alert');
    expect(banner.getAttribute('aria-label')).toBe('Problems');
    expect(banner.contains(said)).toBe(true);
  });

  it('says the browser keeps no settings, and clears the row when it does', () => {
    // `store` of null is what `localSettingsStore` answers where the browser
    // refuses `localStorage`. Both halves are driven: the refusal and the store.
    mount({ store: null });
    expect(element('settings-fault-note').textContent).toBe(faultLine(faultOf('settings-refused')));
    expect(element('settings-fault-note').textContent).toContain('goes when the tab closes');

    act(() => render(null, root as HTMLElement));
    mount({ store: fakeStore() });
    expect(
      element('settings-fault-note').textContent,
      'a browser that keeps settings is told nothing',
    ).toBe('');
  });

  it('holds no tab stop, so both walks of section 6 are the walks they were', async () => {
    const before = walkList(DESIGN, 'Before');
    expect(before.stated).toBe(11);
    // Two faults on the screen at once: no settings store and no log.
    mount({ store: null });
    await act(async () => {
      await Promise.resolve();
    });
    const banner = element('fault-banner');
    const filled = [...banner.querySelectorAll<HTMLElement>('p')].filter(
      (row) => (row.textContent ?? '') !== '',
    );
    expect(filled.length, 'the walk runs with faults on the screen, not without').toBe(2);
    expect(tabStops(banner), 'and the banner holds no tab stop').toHaveLength(0);

    const visits = walk(document);
    expect(visits.map((visit) => visit.name)).toEqual(before.names);
    expect(visits.length).toBe(before.stated);
  });

  it('carries the same faults into the history destination', async () => {
    // The destination REPLACES the roll flow, so a fault raised on the dice
    // screen is unreadable there unless the destination draws the same list.
    mount({ store: null });
    await act(async () => {
      await Promise.resolve();
    });
    const onTheDice = [...element('fault-banner').querySelectorAll<HTMLElement>('p')].map(
      (row) => row.textContent,
    );

    click(element('disclosure-toggle'));
    click(element('sheet-history'));
    await act(async () => {
      await Promise.resolve();
    });
    expect(element('history'), 'the destination replaced the roll flow').not.toBeNull();
    const inTheHistory = [...element('fault-banner').querySelectorAll<HTMLElement>('p')].map(
      (row) => row.textContent,
    );
    expect(inTheHistory).toEqual(onTheDice);
    expect(inTheHistory.filter((each) => each !== '').length).toBe(2);
    expect(tabStops(element('fault-banner'))).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// The accessibility gate — Unit 4.11
//
// Everything above walks ONE state: the screen is mounted at rest A, or mounted
// at rest B over a fixture. The plan asks for something else — a run that goes
// "from empty pool to pushed result" without leaving the keyboard — because two
// separate walks of two mounted states say nothing about the journey between
// them. A pool built by the keys, a throw taken from the roll button, and a push
// taken from the push button is the run a player makes.
//
// **N is fixed where the design states it.** Both lists are read out of section
// 6 of `docs/design/0002-screen-design.md` by `walkList` above, and the two
// counts are pinned there to 11 and 35, so a visit added, removed or reordered
// fails against a number nothing in the screen wrote.
//
// **What jsdom cannot do, and who does it instead.** jsdom runs no sequential
// focus navigation and no default activation behaviour, so a Tab press and an
// Enter press both do nothing here. The walk therefore enumerates the tab stops
// the way the specification defines them, and an activation asserts the focused
// element is a `<button>` — which is what makes Enter activate it — before it
// clicks. `node scripts/browser.mjs --a11y` presses the real keys.
// ---------------------------------------------------------------------------

/**
 * The number of arrow presses each tile takes, at the draw target.
 *
 * Every tile goes to its cap, which is what section 8 of the design draws. The
 * artifact tile steps a rating rather than a count, so six presses put two d12
 * dice on the table. `worstCaseState` derives the resulting pool and the check
 * below counts the two against each other.
 */
const GATE_TILES: readonly [string, number][] = [
  ['pool-cell-attribute', 5],
  ['pool-cell-skill', 5],
  ['pool-cell-gear', 3],
  ['pool-cell-artifact', 6],
  ['pool-cell-bonus', 2],
  ['pool-cell-stress', 10],
];

/** What the stress tile holds after the walk above, which is the counter. */
const STRESS_TILE = 10;

/**
 * Activate the element the focus is on, the way Enter does.
 *
 * The assertion is the point: a native button is activated by Enter and by
 * Space with no script at all, and an element that is not one would need a key
 * handler nothing here has read. So the type is asserted before the click that
 * stands in for the key.
 */
function activate(): void {
  const held = document.activeElement as HTMLElement | null;
  if (held === null) throw new Error('nothing holds the focus');
  expect(held.tagName, `${String(held.dataset.el)} is a button, so Enter activates it`).toBe(
    'BUTTON',
  );
  click(held);
}

/** Put the focus on a named control, as the walk above would have left it. */
function focusOn(name: string): HTMLElement {
  const held = element(name);
  held.focus();
  expect(document.activeElement, `the focus reached ${name}`).toBe(held);
  return held;
}

/**
 * The whole table, summed off the dice themselves.
 *
 * The status line is one rendering of the state and each die is another, and
 * both are written in the same render. Summing the parts is therefore a second
 * reading of the same throw, and it is the reading that catches a summary line
 * that counts its own table wrong. The faces come from the rules core: the
 * screen decides no value.
 */
function sumOfTheDice(): { successes: number; banes: number; dice: number } {
  let successes = 0;
  let banes = 0;
  let dice = 0;
  for (const cell of document.querySelectorAll<HTMLElement>('[data-el^="die-"]')) {
    const label = cell.getAttribute('aria-label') ?? '';
    dice += 1;
    if (/ A bane\./.test(label)) banes += 1;
    if (/ One success\./.test(label)) successes += 1;
    const many = / (\d+) successes\./.exec(label);
    if (many !== null) successes += Number(many[1]);
  }
  return { successes, banes, dice };
}

/** The sentence the live region holds, built from figures it did not write. */
function liveSentence(
  sum: { successes: number; banes: number; dice: number },
  pushes: number,
  stress: number,
): string {
  return (
    `${sum.successes} ${sum.successes === 1 ? 'success' : 'successes'}. ` +
    `${sum.banes} ${sum.banes === 1 ? 'bane' : 'banes'}. Push ${pushes}. ` +
    `The table holds ${sum.dice} dice. Stress ${stress}.`
  );
}

describe('the keyboard-only run, from an empty pool to a pushed result', () => {
  it('walks both lists of section 6 in one run, and presses nothing else', () => {
    const before = walkList(DESIGN, 'Before');
    const after = walkList(DESIGN, 'After');
    // N is the design's number, and the two lists count themselves three ways
    // before the screen is asked anything.
    expect(before.names.length).toBe(before.stated);
    expect(after.names.length).toBe(after.stated);

    // Seed 21 is the seed this run was fixed at. The profile the screen opens
    // in blocks a push once a stress die shows a bane, so the run throws again
    // until the push is live and reports how many throws that took.
    mount({ random: seededRandom(21) });

    // ---- Rest A, by the keys alone ----
    const first = walk(document);
    expect(
      first.map((visit) => visit.name),
      'the walk of the empty pool',
    ).toEqual(before.names);
    expect(first.length, 'N before the throw is the number the design states').toBe(before.stated);

    // The pool is built with the arrow keys, from the pool bar, exactly as
    // section 5 says a composite widget is worked. Nothing is clicked.
    focusOn('pool-cell-attribute');
    for (const [cell, wanted] of GATE_TILES) {
      expect(
        (document.activeElement as HTMLElement).dataset.el,
        'the right arrow walked to the next tile',
      ).toBe(cell);
      for (let taken = 0; taken < wanted; taken += 1) {
        act(() => press(document.activeElement as Element, 'ArrowUp'));
      }
      act(() => press(document.activeElement as Element, 'ArrowRight'));
    }
    // The difficulty is one value over seven positions, so its arrows change
    // the value and never move the focus. Three presses take it to +3.
    const track = focusOn('difficulty-track');
    for (let taken = 0; taken < 3; taken += 1) {
      act(() => press(document.activeElement as Element, 'ArrowRight'));
      expect(document.activeElement, 'the difficulty keeps the focus').toBe(track);
    }

    // The pool the keys built is the pool the design draws, counted by the core.
    const wanted = throwDice(worstCaseState());
    const dieNames = after.names.filter((name) => name.startsWith('die-'));
    expect(wanted.length, 'the draw target is the length of the die list').toBe(dieNames.length);
    expect(spoken(), 'the live region says what the next throw takes').toContain(
      `The throw takes ${wanted.length} dice`,
    );

    // ---- The throw, from the roll button ----
    focusOn('roll-button');
    let throws = 0;
    do {
      focusOn('roll-button');
      activate();
      throws += 1;
    } while (throws < 40 && (element('push-button') as HTMLButtonElement).disabled);
    expect(
      (element('push-button') as HTMLButtonElement).disabled,
      `${String(throws)} throws of at most 40 reached a table the push takes`,
    ).toBe(false);

    // The result reaches the live region. The region is READ, not asserted to
    // exist, and every figure in it is compared against a figure written
    // somewhere else in the same render: the successes and the banes against
    // the sum over the dice, the dice count against the design's own list, and
    // the stress against the value the keys put on the stress tile.
    const afterRoll = sumOfTheDice();
    expect(afterRoll.dice, 'the throw put the drawn pool on the table').toBe(wanted.length);
    expect(spoken(), 'the roll reached the live region').toBe(
      liveSentence(afterRoll, 0, STRESS_TILE),
    );

    // ---- Rest B, by the keys alone ----
    const second = walk(document);
    const names = second.map((visit) => visit.name);
    expect(names.length, 'N after the throw is the number the design states').toBe(after.stated);
    // The two ends of the list are the document's, by position. Which die lands
    // in which zone follows this throw and not the drawn one, so the dice are
    // compared as a SET and their ORDER against the tray the screen drew.
    expect(names[0]).toBe(after.names[0]);
    expect(names.slice(-4)).toEqual(after.names.slice(-4));
    const walkedDice = names.slice(1, names.length - 4);
    expect([...walkedDice].sort(), 'every die of the design is walked once').toEqual(
      [...dieNames].sort(),
    );
    const inTheTray = [...element('dice-tray').querySelectorAll<HTMLElement>('.slot')].map(
      (slot) => slot.dataset.el,
    );
    expect(walkedDice, 'the keys walked the tray in the order the tray holds').toEqual(inTheTray);
    const positions = (by: 'tab' | 'arrow'): number[] =>
      second.flatMap((visit, index) => (visit.by === by ? [index + 1] : []));
    expect(positions('tab'), 'Tab reaches the items the design says it does').toEqual(after.tab);
    expect(positions('arrow'), 'the arrows reach the items the design says they do').toEqual(
      after.arrow,
    );

    // ---- The push, from the push button, which the walk just reached ----
    expect(names[names.length - 1], 'the push button is the last visit').toBe('push-button');
    const said = spoken();
    focusOn('push-button');
    activate();

    // The profile the screen opens in raises the stress before the re-throw, so
    // the push adds one die to the table and one to the counter. Both figures
    // come from the profile and from the tile, not from the screen.
    const profileNow = profile(DEFAULT_PROFILE_ID);
    expect(profileNow.stressBehaviour, 'the opening profile adds a stress die').toBe(
      'addBeforeReroll',
    );
    const afterPush = sumOfTheDice();
    expect(afterPush.dice, 'the push added the stress die before the throw').toBe(
      wanted.length + 1,
    );
    // The counter is held at its cap here, and the rise is read off the table
    // instead. The draw target needs every tile at its cap, so the stress tile
    // is at the cap before the push, and `pushNow` holds the counter there
    // while the core adds the die. Section 8 of the design draws that state and
    // says the reading is at its cap and is marked.
    expect(STRESS_TILE, 'the stress tile is at its cap in this run').toBe(POOL_CAPS.stress);
    expect(spoken(), 'the pushed result reached the live region too').toBe(
      liveSentence(afterPush, 1, POOL_CAPS.stress),
    );
    expect(
      element('status-line').querySelector('.st-warn'),
      'the reading at its cap is marked',
    ).not.toBeNull();
    expect(spoken(), 'and it is not the sentence the roll left').not.toBe(said);
  });
});

// ---------------------------------------------------------------------------
// The counts the design states about itself — Unit 4.11
//
// The document states its walk three ways on purpose, and `walkList` above
// reads all three. It also states the same counts in PROSE, in paragraphs about
// the browser's scroll stop, about the disclosure sheet and about the overlay,
// and no check read those sentences. Two of them said "eleven and thirty" from
// Unit 2.2 to Unit 4.10, while section 6 listed thirty-five. Both instruments
// passed over a false statement for eight units, and Units 2.3 and 3.7 both
// reported it.
//
// This check reads EVERY sentence of the document that talks about the walk and
// holds every figure in it against the two numbered lists. A third sentence
// cannot drift alone.
// ---------------------------------------------------------------------------

describe('the design states one set of counts about its own walk', () => {
  it('holds every walk sentence in the document against the two numbered lists', () => {
    const before = walkList(DESIGN, 'Before');
    const after = walkList(DESIGN, 'After');
    const split =
      /Items (\d+) to (\d+) are the kept shelf and items (\d+) to (\d+) are the throw zone\./.exec(
        DESIGN,
      );
    if (split === null) throw new Error('section 6 no longer splits the tray into two zones');
    const shelf = Number(split[2]) - Number(split[1]) + 1;
    const zone = Number(split[4]) - Number(split[3]) + 1;

    // Every figure the document may state about the walk, derived from the two
    // numbered lists and from the split sentence. Nothing here is typed.
    const lawful = new Set([
      before.stated,
      after.stated,
      before.stated + after.stated,
      shelf,
      zone,
    ]);

    // A sentence is about the walk when it names one. The three words are the
    // vocabulary section 6 and section 4 both use.
    const aboutTheWalk = /\b(authored|visits?|walks?)\b/i;
    // Below nine, a number word in such a sentence is counting something else:
    // "one extra stop", "the two lists", "both walks". The walk figures are all
    // nine or more, and the check says so rather than reading a hand list.
    const floor = 9;

    const checked: string[] = [];
    const wrong: string[] = [];
    for (const sentence of DESIGN.split(/(?<=\.)\s+|\n\n/)) {
      if (!aboutTheWalk.test(sentence)) continue;
      for (const found of sentence.matchAll(/\b([a-z]+(?:-[a-z]+)?)\b/gi)) {
        const value = inWords(found[1]);
        if (value === undefined || value < floor) continue;
        checked.push(`${String(value)} in "${sentence.trim().replace(/\s+/g, ' ').slice(0, 90)}"`);
        if (!lawful.has(value)) {
          wrong.push(
            `${String(value)} is not one of [${[...lawful].sort((a, b) => a - b).join(', ')}] ` +
              `in "${sentence.trim().replace(/\s+/g, ' ')}"`,
          );
        }
      }
    }

    // The denominator. A reader that matched nothing would pass this check on
    // an empty document, and the floor is what stops that.
    expect(
      checked.length,
      `the document states the walk in ${String(checked.length)} places: ${checked.join(' | ')}`,
    ).toBeGreaterThanOrEqual(9);
    expect(wrong, 'every count the document states about its walk is one of its own').toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// The disclosure sheet is a real modal — Unit 4.11
//
// It has carried `role="dialog"` and `aria-modal="true"` since Unit 2.1, and
// `aria-modal` is a promise to a screen reader alone. Nothing held the Tab key,
// so focus walked out of the sheet and onto the roll button behind it, where a
// reader was still being told the page was hidden. Units 4.1, 4.2, 4.3, 4.8,
// 4.9, 3.6 and 3.8 all added controls behind that promise.
//
// The real Tab presses are in `node scripts/browser.mjs --a11y`. jsdom runs no
// sequential focus navigation, so what is judged here is the handler: given the
// focus at an end of the sheet, a Tab press must be refused and answered with
// the other end.
// ---------------------------------------------------------------------------

describe('the disclosure sheet', () => {
  /** Send a Tab press the way a browser does, and say whether it was refused. */
  function tab(from: Element, shiftKey = false): boolean {
    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey,
      bubbles: true,
      cancelable: true,
    });
    act(() => {
      from.dispatchEvent(event);
    });
    return event.defaultPrevented;
  }

  it('keeps the focus inside itself in both directions, and hands it back on close', () => {
    mount();
    const opened = element('disclosure-toggle');
    opened.focus();
    click(opened);

    const sheet = element('disclosure-sheet');
    expect(sheet.getAttribute('role')).toBe('dialog');
    expect(sheet.getAttribute('aria-modal')).toBe('true');
    // The sheet takes the focus when it opens, or the first Tab would land
    // behind it.
    expect((document.activeElement as HTMLElement).dataset.el).toBe('sheet-close');

    const stops = focusStops(sheet);
    expect(stops.length, 'the sheet holds many controls, and this walk knows them').toBeGreaterThan(
      10,
    );
    const first = stops[0] as HTMLElement;
    const last = stops[stops.length - 1] as HTMLElement;
    expect(last.dataset.el, 'the close control is the last stop of the sheet').toBe('sheet-close');
    expect(sheet.contains(first) && sheet.contains(last)).toBe(true);

    // Forwards off the end: refused, and answered with the first stop.
    last.focus();
    expect(tab(last), 'a Tab at the last stop is refused').toBe(true);
    expect(document.activeElement, 'and the focus wrapped to the first stop').toBe(first);
    expect(sheet.contains(document.activeElement), 'the focus is still in the sheet').toBe(true);

    // Backwards off the front: refused, and answered with the last stop.
    expect(tab(first, true), 'a Shift and Tab at the first stop is refused').toBe(true);
    expect(document.activeElement, 'and the focus wrapped to the last stop').toBe(last);

    // In the middle the browser keeps its own behaviour, so nothing is refused.
    const middle = stops[Math.floor(stops.length / 2)] as HTMLElement;
    middle.focus();
    expect(tab(middle), 'a Tab in the middle of the sheet is the browser own behaviour').toBe(
      false,
    );
    expect(document.activeElement, 'and nothing moved it').toBe(middle);

    // Nothing behind the sheet can be reached by a press inside it, which is
    // what the two wraps above mean, said as one sentence over a denominator.
    const behind = tabStops(document.body).filter((stop) => !sheet.contains(stop));
    expect(behind.length, 'the screen behind the sheet still holds its controls').toBeGreaterThan(
      0,
    );

    // And the way out returns the focus to the control that opened it, which
    // section 4 of the design requires of `sheet-close`.
    click(element('sheet-close'));
    expect(document.querySelector('[data-el="disclosure-sheet"]'), 'the sheet closed').toBeNull();
    expect((document.activeElement as HTMLElement).dataset.el).toBe('disclosure-toggle');
  });

  it('closes on Escape and hands the focus back there too', () => {
    mount();
    element('disclosure-toggle').focus();
    click(element('disclosure-toggle'));
    const sheet = element('disclosure-sheet');
    act(() => {
      sheet.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
      );
    });
    expect(document.querySelector('[data-el="disclosure-sheet"]')).toBeNull();
    expect((document.activeElement as HTMLElement).dataset.el).toBe('disclosure-toggle');
  });

  it('reaches every control the sheet draws, and the design lists them', () => {
    // The trap moves the focus itself, so the list it walks must hold every
    // control the sheet draws. A control missing from it would be unreachable
    // by the keyboard, which is the failure a trap introduces.
    mount();
    click(element('disclosure-toggle'));
    const sheet = element('disclosure-sheet');
    const stops = focusStops(sheet);
    // Every named ancestor, not the nearest one: a panel carries the name the
    // design lists and the control inside it carries its own.
    const named = new Set<string>();
    for (const stop of stops) {
      for (let held: Element | null = stop; held !== null; held = held.parentElement) {
        const name = held.getAttribute('data-el');
        if (name !== null) named.add(name);
      }
    }
    // Section 4 lists the sheet's controls in a table. Every row that names a
    // `sheet-` control must be reachable, and the list is read from the design.
    const section = DESIGN.slice(
      DESIGN.indexOf('## 4. Behind the one disclosure'),
      DESIGN.indexOf('## 5.'),
    );
    const listed = [...section.matchAll(/^\| `(sheet-[a-z-]+)` \|/gm)].map(
      (found) => found[1] as string,
    );
    expect(listed.length, 'the design lists the controls of the sheet').toBeGreaterThanOrEqual(12);
    const missing = listed.filter((control) => !named.has(control));
    expect(missing, 'every control the design lists is reachable inside the trap').toEqual([]);
  });
});
