// The acceptance of Unit 4.8, measured.
//
// Every floor and every denominator is written out again here. Reading one from
// the module under test would let the module answer its own question, and the
// counts are computed as products in this file so a loop that silently ran
// fewer combinations cannot pass.
//
// Three claims, three denominators, and the denominators are the point.
//
//   6    text contrast inside the interface. Three axes of six presets give 216
//        combinations, but a text pair that never leaves the interface palette
//        cannot answer to the dice or to the tray. The 216 are all enumerated
//        below and the answer is measured, not assumed: if any pair moved with
//        the other two axes the reduction would not be six, and this file says
//        so rather than asserting it away.
//   36   a readout drawn over the tray. That one leaves the interface axis, so
//        it is every interface palette against every tray surface.
//   15   the pairs of six dice types, inside each of the six dice themes. Unit
//        3.3 proved the ladder for one theme. Six is a different claim.

import { describe, expect, it } from 'vitest';
import { checkDiceTheme, checkPalette } from './builder';
import { contrastRatio, lightness } from './contrast';
import type { InterfacePalette, ThemeId } from './themes';
import { DICE_THEMES, INTERFACE_PALETTES, resolveTheme, THEME_IDS, TRAY_SURFACES } from './themes';

/** The floors, restated. WCAG 2.2 SC 1.4.3 for text, SC 1.4.11 for a control. */
const TEXT_FLOOR = 4.5;
const NON_TEXT_FLOOR = 3;
/** Unit 3.3, in CIE L*. Not a WCAG number. */
const LADDER_FLOOR = 8;
/** Unit 3.3, the black numeral against the die body it sits on. */
const INK_FLOOR = 4;

/** The six names, restated, in the order the plan names them. */
const NAMES = ['ember', 'ash', 'verdigris', 'bone', 'void', 'cobalt'] as const;

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

const AXES = 3;

describe('the three axes', () => {
  it('offers six presets on each of the three axes, and the same six names', () => {
    expect(THEME_IDS.length, 'the axis carries six presets').toBe(NAMES.length);
    expect([...THEME_IDS].sort()).toEqual([...NAMES].sort());
    let axesCounted = 0;
    for (const axis of [DICE_THEMES, TRAY_SURFACES, INTERFACE_PALETTES]) {
      expect(Object.keys(axis).sort(), 'the axis carries one row per name').toEqual(
        [...NAMES].sort(),
      );
      axesCounted += 1;
    }
    expect(axesCounted, 'three axes were read').toBe(AXES);
    expect(NAMES.length ** AXES, 'six presets on three axes give 216 combinations').toBe(216);
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
// Claim 1 — the denominator is 6, and that is measured.
// ---------------------------------------------------------------------------

/** The seven ratios of one combination, read through the resolved theme. */
function textRatios(dice: ThemeId, tray: ThemeId, palette: ThemeId): number[] {
  const resolved = resolveTheme({ dice, traySurface: tray, interface: palette });
  return TEXT_PAIRS.map(([ink, ground]) =>
    contrastRatio(resolved.palette[ink], resolved.palette[ground]),
  );
}

describe('text contrast', () => {
  it('does not move when the dice axis or the tray axis moves, so the denominator is 6', () => {
    const seen = new Map<string, Set<string>>();
    let combinations = 0;
    for (const dice of NAMES) {
      for (const tray of NAMES) {
        for (const palette of NAMES) {
          const key = textRatios(dice, tray, palette)
            .map((ratio) => ratio.toFixed(6))
            .join('/');
          const answers = seen.get(palette) ?? new Set<string>();
          answers.add(key);
          seen.set(palette, answers);
          combinations += 1;
        }
      }
    }
    // Every combination ran, counted as a product rather than as a literal.
    expect(combinations, 'all 216 combinations ran').toBe(NAMES.length ** AXES);

    // The measurement. One palette gave one answer across all 36 settings of
    // the other two axes. A text colour that read the tray would give more.
    for (const [palette, answers] of seen) {
      expect(
        answers.size,
        `the ${palette} palette answered ${answers.size} ways as the other two axes moved`,
      ).toBe(1);
    }
    const distinct = new Set([...seen.values()].flatMap((answers) => [...answers]));
    expect(distinct.size, 'the 216 combinations collapse to one answer per interface palette').toBe(
      NAMES.length,
    );
    expect(seen.size, 'the reduction is to six and not to fewer').toBe(6);
  });

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
    // Unit 3.3 measured one dice theme against one surface. Adding two axes
    // multiplies that claim by 36, and an invariant proven for one instance
    // does not compose, so it is measured again at the scale that ships.
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
