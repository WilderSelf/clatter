// The colour builder, measured.
//
// The instrument is pinned first. Every other file in this unit reads contrast
// through `contrast.ts`, so a fault there would move every number at once and
// no palette test would notice. Black against white is 21 to 1 by definition
// and a colour against itself is 1 to 1, so two known answers hold it still.
//
// The floors are written out again here for the same reason as in
// `theme.test.ts`.

import { describe, expect, it } from 'vitest';
import {
  checkDiceTheme,
  checkPalette,
  derivePalette,
  deriveDiceTheme,
  LADDER_TARGETS,
  PALETTE_PAIR_COUNT,
  readSeed,
  withLightness,
} from './builder';
import { contrastRatio, isHexColour, lightness, toChannels } from './contrast';
import { TRAY_SURFACES } from './themes';

const TEXT_FLOOR = 4.5;
const NON_TEXT_FLOOR = 3;
const LADDER_FLOOR = 8;

const SURFACES = Object.values(TRAY_SURFACES);

describe('the instrument', () => {
  it('gives the two answers a contrast ratio is defined by', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 10);
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 10);
    expect(contrastRatio('#7A2410', '#7A2410')).toBeCloseTo(1, 10);
  });

  it('gives the two answers CIE L* is defined by', () => {
    expect(lightness('#000000')).toBeCloseTo(0, 10);
    expect(lightness('#FFFFFF')).toBeCloseTo(100, 10);
  });

  it('refuses anything that is not a six-digit hex colour', () => {
    let refused = 0;
    for (const junk of ['', '#FFF', 'red', '#12345', '#1234567', 'FFFFFF', '#GGGGGG']) {
      expect(isHexColour(junk), `${JSON.stringify(junk)} is not a hex colour`).toBe(false);
      expect(() => toChannels(junk)).toThrow();
      expect(readSeed(junk), `${JSON.stringify(junk)} is not a seed`).toBeNull();
      refused += 1;
    }
    expect(refused, 'seven malformed values were refused').toBe(7);
    expect(readSeed('#7a2410'), 'a hex colour is a seed, in one case').toBe('#7A2410');
  });
});

/** Seeds across the hue circle and across the lightness range. */
const SEEDS = ['#7A2410', '#3A3B3E', '#1D6B5A', '#EDE3CE', '#14121F', '#17387E', '#FF00AA'];

describe('withLightness', () => {
  it('reaches every target from every seed, inside one hex step', () => {
    let measured = 0;
    let worst = 0;
    for (const seed of SEEDS) {
      for (const target of [4, 12, 20, 38, 49, 67, 76, 92, 97]) {
        const error = Math.abs(lightness(withLightness(seed, target)) - target);
        expect(error, `${seed} to L* ${target} landed ${error.toFixed(3)} away`).toBeLessThan(0.5);
        worst = Math.max(worst, error);
        measured += 1;
      }
    }
    expect(measured, 'seven seeds by nine targets were measured').toBe(SEEDS.length * 9);
    expect(worst, 'the worst landing is still inside half a lightness point').toBeLessThan(0.5);
  });

  it('keeps a grey grey and keeps a hue in its own family', () => {
    const grey = toChannels(withLightness('#3A3B3E', 60));
    expect(Math.max(...grey) - Math.min(...grey), 'a near-grey seed stays near-grey').toBeLessThan(
      0.06,
    );
    const warm = toChannels(withLightness('#7A2410', 70));
    expect(warm[0], 'a red seed keeps red as its strongest channel').toBeGreaterThan(warm[2]);
  });
});

describe('deriveDiceTheme', () => {
  it('puts the six types on the ladder and passes its own check, from every seed', () => {
    let built = 0;
    for (const seed of SEEDS) {
      const theme = deriveDiceTheme(seed);
      expect(Object.keys(theme).sort(), 'one colour per dice type').toEqual(
        Object.keys(LADDER_TARGETS).sort(),
      );
      for (const [type, target] of Object.entries(LADDER_TARGETS)) {
        expect(
          Math.abs(lightness(theme[type as keyof typeof theme]) - target),
          `${seed}: ${type} missed its rung`,
        ).toBeLessThan(0.5);
      }
      expect(checkDiceTheme(theme, SURFACES), `${seed} reported findings`).toEqual([]);
      built += 1;
    }
    expect(built, 'a theme was derived from every seed').toBe(SEEDS.length);
  });
});

describe('derivePalette', () => {
  it('keeps the colour the player chose, unchanged, as the accent', () => {
    expect(derivePalette('#3CBFA5').accent).toBe('#3CBFA5');
    expect(derivePalette('#3CBFA5', 'light').accent).toBe('#3CBFA5');
  });

  it('builds a usable palette from a colour that can carry a control', () => {
    let built = 0;
    for (const seed of ['#FF8B68', '#A1ACC0', '#3CBFA5', '#C695FF', '#76ADFF']) {
      expect(checkPalette(derivePalette(seed, 'dark'), SURFACES), `${seed} on a dark page`).toEqual(
        [],
      );
      built += 1;
    }
    expect(built, 'five seeds were built on a dark page').toBe(5);
    // A light page needs a darker accent, and the same seeds are too light for
    // it. This is the pairing the check exists to report, not a defect.
    expect(checkPalette(derivePalette('#6A5734', 'light'), SURFACES)).toEqual([]);
  });

  it('tells the player when the chosen colour cannot carry a control', () => {
    // Too dark for a dark page. The accent is the player's own colour and the
    // builder does not quietly replace it, so the check has to say so.
    const findings = checkPalette(derivePalette('#1B2431', 'dark'), SURFACES);
    // Five findings, and the last two are the report doing its job twice over.
    // A colour too dark to be a control on a dark page also drives `onAccent`
    // to the light end of its own family, and that end cannot carry text on the
    // two marks either. Both answers are reported. Neither colour is replaced.
    expect(findings.map((finding) => finding.pair)).toEqual([
      'text on a control over the success mark',
      'text on a control over the bane mark',
      'a control over the page',
      'a control over a panel',
      'a control over a well',
    ]);
    for (const finding of findings) {
      expect(finding.floor, `${finding.pair} takes a floor this file states`).toBe(
        finding.pair.startsWith('a control') ? NON_TEXT_FLOOR : TEXT_FLOOR,
      );
      expect(finding.measured, `${finding.pair} reads ${finding.measured.toFixed(2)}`).toBeLessThan(
        finding.floor,
      );
    }

    // Too light for a light page, and the same colour is fine on a dark one.
    const onLight = checkPalette(derivePalette('#FFEDB7', 'light'), SURFACES);
    expect(onLight.map((finding) => finding.pair)).toContain('a control over the page');
    expect(checkPalette(derivePalette('#FFEDB7', 'dark'), SURFACES)).toEqual([]);
  });
});

describe('the checks', () => {
  it('names every text pair a palette breaks, and no other', () => {
    const usable = derivePalette('#3CBFA5', 'dark');
    expect(checkPalette(usable, SURFACES), 'the palette starts usable').toEqual([]);
    // Twenty pairs of its own, counted here as a product rather than as a
    // literal: five inks against the grounds each one is drawn on. The list is
    // in `builder.ts` and the arithmetic below is a second walk of the same
    // claim, so a pair dropped from that list fails this line.
    const INKS = { text: 3, textMuted: 3, onAccent: 3, accent: 3, line: 3, marks: 2 * 3 };
    expect(PALETTE_PAIR_COUNT, 'a palette answers for every pair of its own').toBe(
      Object.values(INKS).reduce((sum, each) => sum + each, 0),
    );

    const broken = { ...usable, text: usable.surface };
    const findings = checkPalette(broken, SURFACES);
    expect(findings.map((finding) => finding.pair)).toEqual([
      'body text over the page',
      'body text over a panel',
      'body text over a well',
    ]);
    expect(findings[0]?.floor, 'text takes the text floor').toBe(TEXT_FLOOR);
    expect(findings[1]?.measured, 'a colour on itself reads 1 to 1').toBeCloseTo(1, 10);
  });

  it('names a readout a tray surface swallows', () => {
    const palette = { ...derivePalette('#3CBFA5', 'dark'), onTray: '#2B3B38' };
    const findings = checkPalette(palette, SURFACES);
    expect(findings.length, 'one finding per surface it fails on').toBe(SURFACES.length);
    for (const finding of findings) {
      expect(finding.pair).toMatch(/^a readout over the #[0-9A-F]{6} tray$/);
      expect(finding.measured).toBeLessThan(TEXT_FLOOR);
    }
  });

  it('names two dice colours that collapsed, and the numeral they lost', () => {
    const theme = deriveDiceTheme('#1D6B5A');
    expect(checkDiceTheme(theme, SURFACES), 'the theme starts usable').toEqual([]);

    const collapsed = { ...theme, skill: theme.gear };
    const found = checkDiceTheme(collapsed, SURFACES);
    expect(found.map((finding) => finding.pair)).toEqual(['a gear die and a skill die, in CIE L*']);
    expect(found[0]?.floor).toBe(LADDER_FLOOR);
    expect(found[0]?.measured).toBeCloseTo(0, 6);

    const darkened = { ...theme, stress: '#101010' };
    const ink = checkDiceTheme(darkened, SURFACES).map((finding) => finding.pair);
    expect(ink, 'a body too dark loses the numeral and the tray at once').toEqual(
      expect.arrayContaining(['the numeral on a stress die']),
    );
    expect(ink.filter((pair) => pair.startsWith('a stress die on the #')).length).toBe(
      SURFACES.length,
    );
  });
});
