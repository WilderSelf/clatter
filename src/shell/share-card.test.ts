// The share card — Unit 4.9, the composition half.
//
// Four claims live here, and none of them needs a browser:
//
//   1. **The summary equals the roll it was made from.** The state is the
//      oracle: every reading is computed a second time from `readout` and
//      `zonesOf`, and the five readings are enumerated so a missing one is a
//      red rather than a cell nobody read.
//   2. **The card carries no forbidden term.** Every string a card can hold
//      goes through the branding gate's own tokeniser and its own hashes. A
//      positive control proves the scanner responds before its verdict is
//      believed.
//   3. **The text clears 4.5 to 1 in all six interface palettes.** The card is
//      drawn and not styled, so this is the card's own claim. The pairs are
//      asserted here and the DRAWN pixels of six real cards are read back by
//      `node scripts/browser.mjs --share`.
//   4. **The drawing holds the layout and nothing else.** `drawShareCard` is
//      run over a recording context, so a mark it makes that no run asks for
//      is a mark an instrument would never look for.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { digest, tokenise } from '../../scripts/check-branding.mjs';
import { contrastRatio, TEXT_CONTRAST_MIN } from '../theme/contrast';
import type { InterfacePalette, ThemeId } from '../theme/themes';
import { INTERFACE_PALETTES } from '../theme/themes';
import { seededRandom } from '../rules/seeded-random';
import { PUSH_PROFILES } from '../rules/push-profile';
import type { CardContext, CardLayout, ShareCard } from './share-card';
import {
  bytesOfDataUrl,
  CARD_READING_KEYS,
  drawShareCard,
  layoutShareCard,
  mediaTypeOfDataUrl,
  shareCard,
} from './share-card';
import type { AppState, CountKey } from './state';
import { emptyState, nudge, pushNow, readout, rollNow, toggleDie, zonesOf } from './state';
import { APP_NAME, plural } from './words';

/** The six palettes, named again here rather than read off the module. */
const NAMES: readonly ThemeId[] = ['ember', 'ash', 'verdigris', 'bone', 'void', 'cobalt'];

/** The five readings a card holds, written out again so the module has a denominator. */
const READINGS: readonly string[] = ['dice', 'kept', 'inTheCup', 'stress', 'pushes'];

const TILES: readonly CountKey[] = ['attribute', 'skill', 'gear', 'artifact', 'bonus', 'stress'];

/** A rolled table, built through the rules core from one seed. */
function rolled(seed: number): AppState {
  const random = seededRandom(seed);
  const profile = PUSH_PROFILES[seed % PUSH_PROFILES.length];
  let state = emptyState('pool');
  if (profile !== undefined) state = { ...state, profileId: profile.id };
  for (const [at, key] of TILES.entries()) {
    for (let press = 0; press <= (seed + at) % 4; press += 1) state = nudge(state, key, 1);
  }
  state = rollNow(state, random);
  // A push and a die kept by choice, so the kept shelf and the push count are
  // not both zero on every seed.
  if (seed % 2 === 0) state = pushNow(state, random);
  const loose = zonesOf(state).loose[0];
  if (loose !== undefined) state = toggleDie(state, loose.id);
  return state;
}

const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8, 11, 13, 17, 19];

describe('the summary on the card', () => {
  it('equals the roll it was made from, reading by reading', () => {
    // The card is compared against the two functions the SCREEN reads, which
    // ask the rules core. Nothing here recomputes a success or a lock.
    let compared = 0;
    for (const seed of SEEDS) {
      const state = rolled(seed);
      const card = shareCard(state);
      expect(card, `seed ${seed} put dice on the table`).not.toBeNull();
      if (card === null) continue;
      const { successes, banes, dice, stress, pushes } = readout(state);
      const zones = zonesOf(state);
      const wanted: Readonly<Record<string, string>> = {
        dice: plural(dice, 'die', 'dice'),
        kept: `${zones.kept.length} kept`,
        inTheCup: `${zones.loose.length} in the cup`,
        stress: `stress ${stress}`,
        pushes: plural(pushes, 'push', 'pushes'),
      };
      // The denominator. A reading the card stopped drawing is a missing key
      // here, and the count below is what makes that a failure.
      expect(
        card.readings.map((reading) => reading.key),
        `seed ${seed} draws every reading, in order`,
      ).toEqual(READINGS);
      for (const reading of card.readings) {
        expect(reading.text, `seed ${seed}, the ${reading.key} reading`).toBe(wanted[reading.key]);
        compared += 1;
      }
      expect(card.successLine, `seed ${seed}, the successes`).toBe(
        plural(successes, 'success', 'successes'),
      );
      expect(card.baneLine, `seed ${seed}, the banes`).toBe(plural(banes, 'bane', 'banes'));
      compared += 1;
      // The alternative text carries the same readings, so a reader who meets
      // no picture reads the card. A reading is a tally on the card and a
      // sentence in the words, and `capital` here is this file's own copy of
      // that rule rather than the module's.
      const capital = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);
      for (const reading of card.readings) {
        expect(card.alt, `seed ${seed}, the alternative text names ${reading.key}`).toContain(
          `${capital(reading.text)}.`,
        );
      }
      expect(card.alt).toContain(`${capital(card.successLine)}.`);
      expect(card.alt).toContain(`${capital(card.baneLine)}.`);
      compared += 1;
    }
    expect(compared, 'seven comparisons on each of the twelve rolls').toBe(SEEDS.length * 7);
  });

  it('names the five readings the module enumerates', () => {
    expect([...CARD_READING_KEYS]).toEqual(READINGS);
  });

  it('is nothing at all while the table is empty, which is not a failure', () => {
    expect(shareCard(emptyState('pool'))).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Constraint 1, over the card's own text
//
// A share card is the one artifact of this project that leaves the machine and
// is posted in public. Every string it can hold is scanned here through the
// gate's own tokeniser and the gate's own hashes, so this check and
// `scripts/check-branding.mjs` cannot disagree about what a term is.
// ---------------------------------------------------------------------------

interface Gate {
  readonly salt: string;
  readonly maxNgram: number;
  readonly hashes: ReadonlySet<string>;
}

const GATE: Gate = (() => {
  const raw = JSON.parse(
    readFileSync(resolve(process.cwd(), 'scripts/forbidden-hashes.json'), 'utf8'),
  ) as { salt: string; maxNgram: number; hashes: string[] };
  return { salt: raw.salt, maxNgram: raw.maxNgram, hashes: new Set(raw.hashes) };
})();

/** Every n-gram of `text` that the given hash set holds. */
function brandingHits(text: string, gate: Gate): string[] {
  const words = tokenise(text) as string[];
  const hits: string[] = [];
  for (let at = 0; at < words.length; at += 1) {
    for (let n = 1; n <= gate.maxNgram && at + n <= words.length; n += 1) {
      const gram = words.slice(at, at + n).join(' ');
      if (gate.hashes.has(digest(gate.salt, gram) as string)) {
        hits.push(`token ${at}, ${n} words`);
      }
    }
  }
  return hits;
}

/** Every string one card can put in front of a reader. */
function cardStrings(card: ShareCard): readonly string[] {
  return [
    card.title,
    card.successLine,
    card.baneLine,
    card.alt,
    ...card.readings.map((reading) => reading.text),
  ];
}

describe('the card and the branding gate', () => {
  it('holds no forbidden term, over every string of every roll', () => {
    let scanned = 0;
    for (const seed of SEEDS) {
      const card = shareCard(rolled(seed));
      if (card === null) throw new Error(`seed ${seed} made no card`);
      const lines = cardStrings(card);
      expect(lines.length, `seed ${seed} holds nine strings`).toBe(9);
      for (const line of lines) {
        expect(brandingHits(line, GATE), `seed ${seed}: ${line}`).toEqual([]);
        scanned += 1;
      }
    }
    expect(scanned, 'nine strings on each of the twelve rolls').toBe(SEEDS.length * 9);
  });

  it('is scanned by an instrument that answers, which a clean verdict alone would not prove', () => {
    // The positive control. A real term may never enter this repository, so the
    // hash of a word the card DOES hold stands in for one: an instrument that
    // finds this finds a real term written the same way.
    const card = shareCard(rolled(3));
    if (card === null) throw new Error('the fixture made no card');
    const control: Gate = {
      salt: GATE.salt,
      maxNgram: GATE.maxNgram,
      hashes: new Set([digest(GATE.salt, 'kept') as string]),
    };
    const found = cardStrings(card).flatMap((line) => brandingHits(line, control));
    expect(found.length, 'the scanner reports the planted term').toBeGreaterThan(0);
    expect(brandingHits(card.title, control), 'and it reports none where there is none').toEqual(
      [],
    );
  });

  it('names the application and nothing else about where it came from', () => {
    const card = shareCard(rolled(5));
    expect(card?.title).toBe(APP_NAME);
    // A "not affiliated with" line names the publisher, which is the thing
    // Constraint 1 avoids. No card holds one.
    for (const line of cardStrings(card as ShareCard)) {
      expect(line.toLowerCase()).not.toContain('affiliated');
      expect(line.toLowerCase()).not.toContain('compatible');
    }
  });
});

// ---------------------------------------------------------------------------
// The layout, and the contrast the card owes on its own
// ---------------------------------------------------------------------------

function layoutOf(seed: number, width = 1440, height = 900): CardLayout {
  const card = shareCard(rolled(seed));
  if (card === null) throw new Error(`seed ${seed} made no card`);
  return layoutShareCard(card, width, height);
}

describe('the card layout', () => {
  it('draws one run per reading, plus the name and the two headline lines', () => {
    const layout = layoutOf(3);
    expect(layout.runs.map((run) => run.id)).toEqual([
      'title',
      'successes',
      'banes',
      ...READINGS.map((key) => `reading-${key}`),
    ]);
  });

  it('keeps every run inside the panel, so the ink never lands on the photograph', () => {
    for (const [width, height] of [
      [1440, 900],
      [800, 600],
      [360, 640],
    ] as const) {
      const layout = layoutOf(7, width, height);
      const { panel } = layout;
      expect(panel.x, `${width}x${height}: the panel is on the card`).toBeGreaterThan(0);
      expect(panel.x + panel.w).toBeLessThanOrEqual(width);
      expect(panel.y + panel.h).toBeLessThanOrEqual(height);
      for (const run of layout.runs) {
        expect(run.box.x, `${width}x${height}: ${run.id} starts inside the panel`).toBeGreaterThan(
          panel.x,
        );
        expect(run.box.x + run.box.w).toBeLessThanOrEqual(panel.x + panel.w);
        expect(run.box.y).toBeGreaterThan(panel.y);
        expect(
          run.box.y + run.box.h,
          `${width}x${height}: ${run.id} ends inside`,
        ).toBeLessThanOrEqual(panel.y + panel.h);
      }
    }
  });

  it('gives every run a box of its own, so a run that never drew leaves an empty one', () => {
    const layout = layoutOf(11);
    for (const [at, run] of layout.runs.entries()) {
      const next = layout.runs[at + 1];
      if (next === undefined) continue;
      expect(run.box.y + run.box.h, `${run.id} and ${next.id} do not overlap`).toBeLessThanOrEqual(
        next.box.y + 0.0001,
      );
    }
  });

  it('refuses a frame with no area', () => {
    const card = shareCard(rolled(2)) as ShareCard;
    expect(() => layoutShareCard(card, 0, 900)).toThrow(/measures 0 by 900/);
  });
});

describe('the card in all six interface palettes', () => {
  it('holds 4.5 to 1 for every run of text, over every palette', () => {
    const layout = layoutOf(3);
    const misses: string[] = [];
    let measured = 0;
    for (const name of NAMES) {
      const palette: InterfacePalette = INTERFACE_PALETTES[name];
      for (const run of layout.runs) {
        const ratio = contrastRatio(palette[run.ink], palette.surface);
        if (ratio < TEXT_CONTRAST_MIN) {
          misses.push(`${name}: ${run.id} reads ${ratio.toFixed(2)} to 1`);
        }
        measured += 1;
      }
    }
    expect(measured, 'six palettes times seven runs').toBe(NAMES.length * layout.runs.length);
    expect(misses, 'every run of every palette clears the text floor').toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// The drawing
// ---------------------------------------------------------------------------

/**
 * A 2d context that records what was drawn on it, in order.
 *
 * `measureText` answers a width this file decides, so the fit step of
 * `drawShareCard` can be driven both ways without a font.
 */
function recorder(measured: (text: string) => number = () => 10): {
  context: CardContext;
  calls: string[];
} {
  const calls: string[] = [];
  const context: CardContext = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    font: '',
    textBaseline: '',
    measureText: (text: string) => ({ width: measured(text) }),
    fillRect: (x, y, w, h) =>
      calls.push(
        `fillRect ${Math.round(x)},${Math.round(y)},${Math.round(w)},${Math.round(h)} in ${context.fillStyle}`,
      ),
    strokeRect: (x, y, w, h) =>
      calls.push(
        `strokeRect ${Math.round(x)},${Math.round(y)},${Math.round(w)},${Math.round(h)} in ${context.strokeStyle} at ${context.lineWidth}`,
      ),
    fillText: (text, x) =>
      calls.push(
        `fillText "${text}" at ${Math.round(x)} in ${context.fillStyle} font ${context.font}`,
      ),
  };
  return { context, calls };
}

describe('drawShareCard', () => {
  it('fills the panel, draws its boundary, then draws every run and nothing else', () => {
    const layout = layoutOf(3);
    const palette = INTERFACE_PALETTES.ash;
    const { context, calls } = recorder();
    drawShareCard(context, layout, palette);
    expect(calls.length, 'the fill, the boundary and one call per run').toBe(
      2 + layout.runs.length,
    );
    expect(calls[0]).toContain(`in ${palette.surface}`);
    expect(calls[0]?.startsWith('fillRect')).toBe(true);
    expect(calls[1]?.startsWith('strokeRect')).toBe(true);
    expect(calls[1]).toContain(`in ${palette.line}`);
    const drawn = calls.slice(2);
    expect(drawn.length).toBe(layout.runs.length);
    layout.runs.forEach((run, at) => {
      expect(drawn[at], `${run.id} is drawn with its own text`).toContain(`"${run.text}"`);
      expect(drawn[at], `${run.id} is drawn in its own ink`).toContain(`in ${palette[run.ink]}`);
    });
  });

  it('is a plain function, because it runs inside the task that copied the frame', () => {
    expect(drawShareCard.constructor.name).toBe('Function');
  });

  // The defect a green suite did not see, and the guard that closes it.
  //
  // The first draft put the successes and the banes on one line. The line ran
  // past the side of the panel and its last word landed on the photograph,
  // where nothing could read it. Every check was green, because the run's BOX
  // fitted the panel and the TEXT inside the box did not. A layout has no font
  // and cannot know a width, so the drawing measures every run and reports what
  // came out.
  it('reports the width every run really took, against the box it had to fit', () => {
    const layout = layoutOf(3);
    const { context } = recorder(() => 10);
    const drawn = drawShareCard(context, layout, INTERFACE_PALETTES.ash);
    expect(drawn.map((run) => run.id)).toEqual(layout.runs.map((run) => run.id));
    for (const [at, run] of drawn.entries()) {
      expect(run.width, `${run.id} fits its box`).toBeLessThanOrEqual(run.boxWidth);
      expect(run.size, `${run.id} was drawn at the size the layout asked for`).toBe(
        layout.runs[at]?.size,
      );
    }
  });

  it('shrinks a run that will not fit, rather than letting it run onto the photograph', () => {
    const layout = layoutOf(3);
    const wide = layout.runs[1];
    if (wide === undefined) throw new Error('the layout holds no second run');
    // Twice the width of the box at the size the layout asked for, and the
    // width then follows the size, which is what a font does.
    const measured = (text: string): number => {
      const size = Number(/^\d+ (\d+(?:\.\d+)?)px/.exec(context.font)?.[1] ?? 0);
      return text === wide.text ? (size / wide.size) * wide.box.w * 2 : 10;
    };
    const { context, calls } = recorder((text) => measured(text));
    const drawn = drawShareCard(context, layout, INTERFACE_PALETTES.ash);
    const fitted = drawn.find((run) => run.id === wide.id);
    expect(fitted?.size, 'the run was drawn smaller than the layout asked for').toBeLessThan(
      wide.size,
    );
    expect(fitted?.width, 'and it fits the box it was given').toBeLessThanOrEqual(wide.box.w);
    expect(
      calls.some((call) => call.includes(`"${wide.text}"`)),
      'and it is still drawn',
    ).toBe(true);
  });
});

describe('the bytes of the card', () => {
  it('come back out of the data URL the encode answered', () => {
    const url = `data:image/jpeg;base64,${Buffer.from([0xff, 0xd8, 0xff, 0xd9]).toString('base64')}`;
    expect([...bytesOfDataUrl(url)]).toEqual([0xff, 0xd8, 0xff, 0xd9]);
    expect(mediaTypeOfDataUrl(url)).toBe('image/jpeg');
  });

  it('refuses anything that is not a data URL', () => {
    expect(() => bytesOfDataUrl('https://example.invalid/card.jpg')).toThrow(/not a data URL/);
  });
});
