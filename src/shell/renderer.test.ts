// The renderer choice, the permanent fall, and the way back. Unit 3.7.
//
// Pure, so every case is a record. The table below is a cross product and its
// length is asserted against that product, so a case dropped from the list
// parts the two numbers and fails.

import { describe, expect, it } from 'vitest';
import type { Settings } from '../settings/settings';
import { DEFAULT_SETTINGS } from '../settings/settings';
import type { FallReason, TrayDecision } from '../tray/capability';
import { FALL_REASONS } from '../tray/capability';
import type { FlatCause } from './renderer';
import {
  askForTray,
  chooseRenderer,
  fallToFlat,
  FALL_REASON_TEXT,
  noticeText,
  startRenderer,
  trayNote,
  withDecision,
} from './renderer';

function settings(flatFallback: boolean): Settings {
  return { ...DEFAULT_SETTINGS, flatFallback };
}

/** The four probe answers a screen can hold, `null` included. */
const DECISIONS: readonly (readonly [string, TrayDecision | null])[] = [
  ['no answer yet', null],
  ['above the bar', { tray: true, reasons: [] }],
  ['below the bar on one reading', { tray: false, reasons: ['no-webgl2'] }],
  ['below the bar on every reading', { tray: false, reasons: FALL_REASONS }],
];

const STORED: readonly (readonly [string, boolean])[] = [
  ['no fall recorded', false],
  ['a fall recorded', true],
];

/**
 * What each of the eight cases answers. The renderer and the cause are written
 * out again rather than derived, because a table that recomputed the rule it
 * checks cannot fail.
 */
const WANTED: Readonly<Record<string, readonly [string, FlatCause | null]>> = {
  'no answer yet, no fall recorded': ['flat', 'notProbed'],
  'no answer yet, a fall recorded': ['flat', 'notProbed'],
  'above the bar, no fall recorded': ['tray', null],
  'above the bar, a fall recorded': ['flat', 'recordedFall'],
  'below the bar on one reading, no fall recorded': ['flat', 'belowTheBar'],
  'below the bar on one reading, a fall recorded': ['flat', 'belowTheBar'],
  'below the bar on every reading, no fall recorded': ['flat', 'belowTheBar'],
  'below the bar on every reading, a fall recorded': ['flat', 'belowTheBar'],
};

describe('the renderer choice', () => {
  it('answers every probe answer against every stored record', () => {
    const cases = DECISIONS.flatMap(([decisionName, decision]) =>
      STORED.map(([storedName, flatFallback]) => ({
        name: `${decisionName}, ${storedName}`,
        decision,
        flatFallback,
      })),
    );
    expect(cases.length, 'the table is the product of its two lists').toBe(
      DECISIONS.length * STORED.length,
    );
    expect(Object.keys(WANTED).length, 'and the answers are as many as the cases').toBe(
      cases.length,
    );

    const measured = cases.map((each) => {
      const choice = chooseRenderer(each.decision, settings(each.flatFallback));
      return `${each.name}: ${choice.renderer}, ${String(choice.cause)}`;
    });
    const wanted = cases.map((each) => {
      const answer = WANTED[each.name];
      if (answer === undefined) throw new Error(`the table names no case ${each.name}`);
      return `${each.name}: ${answer[0]}, ${String(answer[1])}`;
    });
    expect(measured).toEqual(wanted);

    // Every cause is reached by some case, so no branch of the rule is unread.
    const reached = new Set(
      cases.map((each) => chooseRenderer(each.decision, settings(each.flatFallback)).cause),
    );
    expect(
      [...reached].map((cause) => String(cause)).sort(),
      'every cause and the tray itself are reached',
    ).toEqual(['belowTheBar', 'notProbed', 'null', 'recordedFall']);
  });

  it('carries the readings below the bar into the choice', () => {
    const choice = chooseRenderer({ tray: false, reasons: FALL_REASONS }, settings(false));
    expect(choice.reasons, 'the choice names every reading the probe named').toEqual(FALL_REASONS);
    expect(choice.reasons.length, 'and there are four of them').toBe(4);
  });
});

describe('the permanent fall', () => {
  it('records the fall once and says so once', () => {
    const start = startRenderer({ tray: true, reasons: [] }, settings(false));
    expect(start.choice.renderer, 'the table runs before the fall').toBe('tray');
    expect(start.noticed, 'and nothing is said at startup').toBe(false);

    const fell = fallToFlat(start);
    expect(fell.choice.renderer).toBe('flat');
    expect(fell.choice.cause).toBe('recordedFall');
    expect(fell.settings.flatFallback, 'the record holds the fall').toBe(true);
    expect(fell.settings, 'and it is a new record, so the caller writes it').not.toBe(
      start.settings,
    );
    expect(fell.noticed, 'the player is told').toBe(true);

    // A second loss, a restored context, or a second failed mount. The record
    // already holds the fall, so nothing is written and nothing is said again.
    const again = fallToFlat({ ...fell, noticed: false });
    expect(again.settings, 'the same record, so the caller writes nothing').toBe(fell.settings);
    expect(again.noticed, 'and the player is not told twice').toBe(false);
    expect(again.choice.renderer).toBe('flat');
  });

  it('says nothing to a session that opened on a recorded fall', () => {
    const start = startRenderer({ tray: true, reasons: [] }, settings(true));
    expect(start.choice.renderer).toBe('flat');
    expect(start.choice.cause).toBe('recordedFall');
    expect(start.noticed, 'the player was told in the session that fell').toBe(false);
  });

  it('treats a probe below the bar as a fall, and one above it as no fall', () => {
    const opening = startRenderer(null, settings(false));

    const above = withDecision(opening, { tray: true, reasons: [] });
    expect(above.choice.renderer).toBe('tray');
    expect(above.settings, 'nothing fell, so nothing is written').toBe(opening.settings);
    expect(above.noticed).toBe(false);

    const below = withDecision(opening, { tray: false, reasons: ['low-device-memory'] });
    expect(below.choice.renderer).toBe('flat');
    expect(below.choice.cause).toBe('belowTheBar');
    expect(below.settings.flatFallback, 'a platform below the bar falls for good').toBe(true);
    expect(below.noticed, 'and the player is told once').toBe(true);
  });
});

describe('the toggle back', () => {
  it('clears the recorded fall and records it again', () => {
    const fell = startRenderer({ tray: true, reasons: [] }, settings(true));
    const asked = askForTray(fell, true);
    expect(asked.choice.renderer, 'the player asked for the table').toBe('tray');
    expect(asked.settings.flatFallback, 'so the record no longer holds a fall').toBe(false);
    expect(asked.noticed, 'the player did it, so nothing is announced back').toBe(false);

    const back = askForTray(asked, false);
    expect(back.choice.renderer).toBe('flat');
    expect(back.settings.flatFallback).toBe(true);
    expect(back.noticed).toBe(false);
  });

  it('cannot give the table to a platform below the bar', () => {
    const below = startRenderer({ tray: false, reasons: ['no-webgl2'] }, settings(true));
    const asked = askForTray(below, true);
    expect(asked.settings.flatFallback, 'the record follows what the player asked').toBe(false);
    expect(asked.choice.renderer, 'and the platform still cannot draw the table').toBe('flat');
    expect(asked.choice.cause).toBe('belowTheBar');
  });
});

describe('what the player reads', () => {
  it('holds one sentence for every reading the probe can fail', () => {
    expect(Object.keys(FALL_REASON_TEXT).sort(), 'the words cover the reasons exactly').toEqual(
      [...FALL_REASONS].sort(),
    );
    expect(Object.keys(FALL_REASON_TEXT).length).toBe(FALL_REASONS.length);
    for (const reason of FALL_REASONS) {
      const text = FALL_REASON_TEXT[reason as FallReason];
      expect(text.endsWith('.'), `${reason} reads as a sentence`).toBe(true);
      expect(text.length, `${reason} says something`).toBeGreaterThan(10);
    }
  });

  it('names the platform in one notice and the load in the other', () => {
    const below = chooseRenderer({ tray: false, reasons: ['no-webgl2'] }, settings(true));
    const fell = chooseRenderer({ tray: true, reasons: [] }, settings(true));
    expect(noticeText(below)).toBe('This browser cannot draw the table. The dice are flat now.');
    expect(
      noticeText(fell),
      'a fall the toggle can clear names the toggle, and the other one does not',
    ).toBe(
      'The table did not load. The dice are flat now. ' +
        'Reload this page. Then open More and switch the table on.',
    );
    expect(noticeText(below).includes('More')).toBe(false);
  });

  it('prints a note for every state the sheet can open in', () => {
    const notes = [
      chooseRenderer({ tray: true, reasons: [] }, settings(false)),
      chooseRenderer(null, settings(false)),
      chooseRenderer({ tray: true, reasons: [] }, settings(true)),
      chooseRenderer({ tray: false, reasons: ['no-webgl2', 'low-core-count'] }, settings(false)),
    ].map((choice) => [choice.cause, trayNote(choice)] as const);

    expect(
      new Set(notes.map(([cause]) => String(cause))).size,
      'one note per cause, and the tray itself is the fourth',
    ).toBe(4);
    expect(new Set(notes.map(([, text]) => text)).size, 'no two causes read the same').toBe(4);
    expect(notes.map(([, text]) => text)).toEqual([
      'The dice roll on the table.',
      'The browser check is not finished.',
      'The dice are flat. Switch this on to ask for the table again.',
      'This browser cannot draw the table. The browser gives no 3D drawing surface. ' +
        'The device reports too few processor cores.',
    ]);
  });
});
