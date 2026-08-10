// Making one card — Unit 4.9.
//
// The pixels are measured on a graphics card by
// `node scripts/browser.mjs --share`. What is measured here is the act: which
// states make a card, which are refused by name, and that the summary drawn
// over the frame is the summary the roll on the table produced.
//
// The tray, the canvas and the 2d context are stand-ins that record what was
// called on them, exactly as `src/tray/capture.test.ts` does. The property they
// carry is order: the overlay draws after the copy of the frame and before the
// encode, all inside one task.

import { afterEach, describe, expect, it } from 'vitest';
import { seededRandom } from '../rules/seeded-random';
import { INTERFACE_PALETTES, TRAY_SURFACES } from '../theme/themes';
import type { DiceBox } from '../tray/vendor/dice-tray.js';
import { shareCard } from './share-card';
import { makeShareCard } from './share-state';
import type { AppState } from './state';
import { emptyState, nudge, rollNow } from './state';

/** Four bytes that open and close like a JPEG, so the file is judgeable. */
const BYTES = [0xff, 0xd8, 0xff, 0xd9];
const DATA_URL = `data:image/jpeg;base64,${Buffer.from(BYTES).toString('base64')}`;

function stand(width = 1440, height = 900): { box: DiceBox; calls: string[] } {
  const calls: string[] = [];
  const drawn = { width, height };
  const context = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    font: '',
    textBaseline: '',
    // A stand-in for the font metrics. Every run is narrow, so nothing is
    // fitted here and the order below is the whole claim.
    measureText: () => ({ width: 10 }),
    fillRect: () => calls.push('fillRect'),
    strokeRect: () => calls.push('strokeRect'),
    fillText: (text: string) => calls.push(`fillText ${text}`),
    drawImage: (source: unknown) => calls.push(`drawImage ${source === drawn ? 'tray' : 'other'}`),
  };
  const flat = {
    width: 0,
    height: 0,
    getContext: () => context,
    toDataURL: () => {
      calls.push('toDataURL');
      return DATA_URL;
    },
  };
  (globalThis as { document?: unknown }).document = { createElement: () => flat };
  const box = {
    scene: 'scene',
    camera: 'camera',
    renderer: {
      domElement: drawn,
      render: () => calls.push('render'),
    },
  } as unknown as DiceBox;
  return { box, calls };
}

afterEach(() => {
  delete (globalThis as { document?: unknown }).document;
});

function thrown(seed = 4): AppState {
  let state = emptyState('pool');
  state = nudge(state, 'attribute', 3);
  state = nudge(state, 'skill', 2);
  state = nudge(state, 'stress', 2);
  return rollNow(state, seededRandom(seed));
}

const AT = new Date(2026, 7, 10, 6, 5);

function make(state: AppState, box: DiceBox | null) {
  return makeShareCard({
    state,
    box,
    palette: INTERFACE_PALETTES.ash,
    traySurface: TRAY_SURFACES.ash,
    at: AT,
  });
}

describe('makeShareCard', () => {
  it('refuses an empty table by name, because a card is a picture of the dice', () => {
    const { box, calls } = stand();
    const outcome = make(emptyState('pool'), box);
    expect(outcome).toEqual({ kind: 'refused', reason: 'noRoll' });
    expect(calls, 'nothing was rendered').toEqual([]);
  });

  it('refuses the flat dice by name, because there is no table to photograph', () => {
    const outcome = make(thrown(), null);
    expect(outcome).toEqual({ kind: 'refused', reason: 'flatDice' });
  });

  it('draws the frame, then the summary over it, then encodes, all in one task', () => {
    const { box, calls } = stand();
    const state = thrown();
    const outcome = make(state, box);
    expect(outcome.kind).toBe('made');
    // The order is the whole claim. The summary lands between the copy of the
    // frame and the encode, so the picture under it cannot have been cleared.
    expect(calls[0]).toBe('render');
    expect(calls[1]).toBe('fillRect');
    expect(calls[2]).toBe('drawImage tray');
    expect(calls[3], 'the panel goes down over the frame').toBe('fillRect');
    expect(calls[4]).toBe('strokeRect');
    expect(calls[calls.length - 1], 'the encode is last').toBe('toDataURL');
  });

  it('draws every line the roll on the table produced, and no other', () => {
    const { box, calls } = stand();
    const state = thrown();
    const summary = shareCard(state);
    expect(summary).not.toBeNull();
    make(state, box);
    const drawn = calls.filter((call) => call.startsWith('fillText ')).map((call) => call.slice(9));
    expect(drawn, 'the name, the two headline lines and one line per reading').toEqual([
      summary?.title,
      summary?.successLine,
      summary?.baneLine,
      ...(summary?.readings ?? []).map((reading) => reading.text),
    ]);
  });

  it('answers the bytes of the encode, under a name that stamps the moment', () => {
    const { box } = stand();
    const outcome = make(thrown(), box);
    if (outcome.kind !== 'made') throw new Error('no card was made');
    expect(outcome.card.url).toBe(DATA_URL);
    expect(outcome.card.filename).toBe('clatter-card-2026-08-10-0605.jpg');
    expect(outcome.card.file.type).toBe('image/jpeg');
    expect(outcome.card.file.size, 'the file holds the bytes the encode answered').toBe(
      BYTES.length,
    );
    expect(outcome.card.alt).toBe(outcome.card.summary.alt);
  });
});
