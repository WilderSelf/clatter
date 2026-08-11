// The acceptance of Unit 4.8, measured.
//
// Every floor and every denominator is written out again here. Reading one from
// the module under test would let the module answer its own question, and the
// counts are computed as products in this file so a loop that silently ran
// fewer combinations cannot pass.
//
// Three claims, three denominators, and the denominators are the point.
//
//   6    text contrast inside the interface. A text pair never leaves the
//        palette, and one id names the palette, so six palettes are six
//        answers.
//   36   a readout drawn over the tray. Six of these pairings are reachable
//        and thirty are not, because one id names the palette and the surface
//        together. The wider denominator is kept because the six surfaces are
//        interchangeable: every one is its own page seed at one lightness
//        target, and the band they really sit in is MEASURED below rather than
//        stated here. A readout that clears the darkest of them clears all six,
//        so the thirty cost nothing and they catch a surface that leaves the
//        band. They do NOT exercise a built palette: `appliedTheme` can put one
//        over a shipped surface, and no check here builds one.
//   15   the pairs of six dice types, inside each of the six dice themes. Unit
//        3.3 proved the ladder for one theme. Six is a different claim.

import { describe, expect, it } from 'vitest';
import { checkDiceTheme, checkPalette } from './builder';
import { contrastRatio, lightness } from './contrast';
import type { InterfacePalette } from './themes';
import { DICE_THEMES, INTERFACE_PALETTES, THEME_IDS, TRAY_SURFACES } from './themes';

/** The floors, restated. WCAG 2.2 SC 1.4.3 for text, SC 1.4.11 for a control. */
const TEXT_FLOOR = 4.5;
const NON_TEXT_FLOOR = 3;
/** Unit 3.3, in CIE L*. Not a WCAG number. */
const LADDER_FLOOR = 8;
/** Unit 3.3, the black numeral against the die body it sits on. */
const INK_FLOOR = 4;

/** The six names, restated, in the order the plan names them. */
const NAMES = ['leather', 'ash', 'moss', 'bone', 'iron', 'oxblood'] as const;

/** The seven pairs a palette answers for on its own, restated with their floors. */
const TEXT_PAIRS: readonly (readonly [keyof InterfacePalette, keyof InterfacePalette, number])[] = [
  ['text', 'background', TEXT_FLOOR],
  ['text', 'surface', TEXT_FLOOR],
  ['textMuted', 'background', TEXT_FLOOR],
  ['textMuted', 'surface', TEXT_FLOOR],
  ['onAccent', 'accent', TEXT_FLOOR],
  ['accent', 'background', NON_TEXT_FLOOR],
  ['accent', 'surface', NON_TEXT_FLOOR],
];

/** The six dice types, restated. */
const TYPES = ['stress', 'artifact', 'gear', 'skill', 'bonus', 'attribute'] as const;

/** The three records one id reads. */
const RECORDS = 3;

describe('the six themes', () => {
  it('carries the same six names in all three records', () => {
    expect(THEME_IDS.length, 'the picker offers six themes').toBe(NAMES.length);
    expect([...THEME_IDS].sort()).toEqual([...NAMES].sort());
    let recordsCounted = 0;
    for (const record of [DICE_THEMES, TRAY_SURFACES, INTERFACE_PALETTES]) {
      expect(Object.keys(record).sort(), 'the record carries one row per name').toEqual(
        [...NAMES].sort(),
      );
      recordsCounted += 1;
    }
    expect(recordsCounted, 'three records were read').toBe(RECORDS);
  });

  it('gives every dice theme one colour per dice type', () => {
    for (const id of NAMES) {
      expect(Object.keys(DICE_THEMES[id]).sort(), `${id} covers every dice type`).toEqual(
        [...TYPES].sort(),
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Claim 1 — the denominator is 6.
// ---------------------------------------------------------------------------

describe('text contrast', () => {
  it('meets its floor in all six palettes, on all seven pairs', () => {
    let measurements = 0;
    for (const id of NAMES) {
      const palette = INTERFACE_PALETTES[id];
      for (const [ink, ground, floor] of TEXT_PAIRS) {
        const measured = contrastRatio(palette[ink], palette[ground]);
        expect(
          measured,
          `${id}: ${ink} over ${ground} reads ${measured.toFixed(2)} to 1`,
        ).toBeGreaterThanOrEqual(floor);
        measurements += 1;
      }
      // The shipping checker answers the same question about the same row.
      expect(checkPalette(palette), `${id} reported findings`).toEqual([]);
    }
    expect(measurements, 'six palettes by seven pairs were measured').toBe(
      NAMES.length * TEXT_PAIRS.length,
    );
  });
});

// ---------------------------------------------------------------------------
// Claim 2 — a readout over the tray, all 36.
// ---------------------------------------------------------------------------

describe('a readout drawn over the tray', () => {
  it('holds the six tray surfaces inside one band of lightness', () => {
    // The reason the 36 below is kept, measured rather than asserted in prose.
    // Each surface is a page seed at one target, so the six differ in hue and
    // hardly at all in lightness. A row that left this band would make the
    // thirty unreachable pairings mean something again, and it would land
    // here first.
    const measured = NAMES.map((id) => lightness(TRAY_SURFACES[id]));
    expect(measured.length, 'every surface was read').toBe(NAMES.length);
    const band = Math.max(...measured) - Math.min(...measured);
    expect(
      band,
      `the six surfaces span ${band.toFixed(2)} CIE L*, from ` +
        `${Math.min(...measured).toFixed(2)} to ${Math.max(...measured).toFixed(2)}`,
    ).toBeLessThan(1);
  });

  // Thirty of these 36 pairings are unreachable through the picker. They are
  // measured because the band above makes the six surfaces interchangeable,
  // so the thirty are nearly free and they fail the moment one surface moves.
  it('meets the text floor on all 36 palette and surface pairs', () => {
    let enumerated = 0;
    let lowest = Number.POSITIVE_INFINITY;
    let lowestPair = '';
    for (const palette of NAMES) {
      for (const surface of NAMES) {
        const measured = contrastRatio(INTERFACE_PALETTES[palette].onTray, TRAY_SURFACES[surface]);
        expect(
          measured,
          `the ${palette} readout on the ${surface} tray reads ${measured.toFixed(2)} to 1`,
        ).toBeGreaterThanOrEqual(TEXT_FLOOR);
        if (measured < lowest) {
          lowest = measured;
          lowestPair = `${palette} on ${surface}`;
        }
        enumerated += 1;
      }
    }
    // The denominator, computed here: every palette against every surface.
    expect(enumerated, 'all 36 pairs ran').toBe(NAMES.length * NAMES.length);
    expect(lowest, `the tightest pair is ${lowestPair}`).toBeGreaterThanOrEqual(TEXT_FLOOR);
  });

  it('is judged the same way by the shipping checker', () => {
    const surfaces = NAMES.map((id) => TRAY_SURFACES[id]);
    expect(surfaces.length, 'six surfaces were passed').toBe(NAMES.length);
    for (const id of NAMES) {
      expect(checkPalette(INTERFACE_PALETTES[id], surfaces), `${id} reported findings`).toEqual([]);
    }
  });
});

// ---------------------------------------------------------------------------
// Claim 3 — the type colours stay separable inside every dice theme.
// ---------------------------------------------------------------------------

describe('the dice type colours', () => {
  it('keeps every pair of types apart in every theme, and reports the theme that fails', () => {
    const pairsPerTheme = (TYPES.length * (TYPES.length - 1)) / 2;
    let measured = 0;
    const failures: string[] = [];
    for (const id of NAMES) {
      const theme = DICE_THEMES[id];
      let closest = Number.POSITIVE_INFINITY;
      let closestPair = '';
      for (let i = 0; i < TYPES.length; i += 1) {
        for (let j = i + 1; j < TYPES.length; j += 1) {
          const [first, second] = [
            TYPES[i] as (typeof TYPES)[number],
            TYPES[j] as (typeof TYPES)[number],
          ];
          const step = Math.abs(lightness(theme[first]) - lightness(theme[second]));
          if (step < closest) {
            closest = step;
            closestPair = `${first} and ${second} are ${step.toFixed(1)} L* apart`;
          }
          measured += 1;
        }
      }
      if (closest < LADDER_FLOOR) {
        failures.push(`${id}: ${closestPair}`);
      }
    }
    // The denominator, computed here: fifteen pairs in each of six themes.
    expect(measured, 'six themes by fifteen pairs were measured').toBe(
      NAMES.length * pairsPerTheme,
    );
    expect(pairsPerTheme, 'six types give fifteen unordered pairs').toBe(15);
    expect(failures, 'these themes hold two colours closer than the ladder step').toEqual([]);
  });

  it('keeps the black numeral readable on every body of every theme', () => {
    let measured = 0;
    for (const id of NAMES) {
      for (const type of TYPES) {
        const ratio = contrastRatio(DICE_THEMES[id][type], '#000000');
        expect(
          ratio,
          `${id}: the numeral on ${type} reads ${ratio.toFixed(2)} to 1`,
        ).toBeGreaterThanOrEqual(INK_FLOOR);
        measured += 1;
      }
    }
    expect(measured, 'six themes by six types were measured').toBe(NAMES.length * TYPES.length);
  });

  it('keeps every die visible on every tray surface, all 216 of them', () => {
    // Unit 3.3 measured one dice theme against one surface. The picker pairs a
    // dice row with its own surface, so 36 of these 216 are reachable. The rest
    // are kept for the reason the band above states: the six surfaces sit
    // inside one CIE L* and a die that clears the darkest clears all six. An
    // invariant proven for one instance does not compose either, so the claim
    // is measured over every row rather than over the one that ships by
    // default.
    let measured = 0;
    for (const dice of NAMES) {
      for (const surface of NAMES) {
        for (const type of TYPES) {
          const ratio = contrastRatio(DICE_THEMES[dice][type], TRAY_SURFACES[surface]);
          expect(
            ratio,
            `${dice} ${type} on the ${surface} tray reads ${ratio.toFixed(2)} to 1`,
          ).toBeGreaterThanOrEqual(NON_TEXT_FLOOR);
          measured += 1;
        }
      }
    }
    expect(measured, 'six themes by six surfaces by six types were measured').toBe(
      NAMES.length * NAMES.length * TYPES.length,
    );
  });

  it('is judged the same way by the shipping checker', () => {
    const surfaces = NAMES.map((id) => TRAY_SURFACES[id]);
    for (const id of NAMES) {
      expect(checkDiceTheme(DICE_THEMES[id], surfaces), `${id} reported findings`).toEqual([]);
    }
  });
});
