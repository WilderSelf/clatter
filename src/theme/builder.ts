// The colour builder, arithmetic half.
//
// A player picks one colour. These functions derive the rest of a set from it,
// and then say whether the set a player ended up with is readable. The controls
// that collect the colour are interface work and wait behind the Unit 2.0 owner
// gate. The arithmetic does not wait, because every contrast claim of Unit 4.8
// is arithmetic.
//
// Pure: no browser API, no module-level mutable state, no dependency.
//
// The two halves are deliberately different in kind.
//
//   * `derive*` builds a set the player did not have to reason about. It works
//     by lightness target, so the ladder and the text contrast come out right
//     by construction rather than by luck.
//   * `check*` judges a set whatever built it. It judges the six shipped rows
//     of `themes.ts` in the same call it judges a set a player assembled by
//     hand, so the shipped rows and a custom one answer to one rule.
//
// A derived set can still fail its check, and that is the point. `derivePalette`
// keeps the colour the player chose as the accent, unchanged. A very dark
// colour cannot carry a control on a dark page, whatever is derived around it,
// and the honest answer is to say so rather than to quietly return a different
// colour.

import type { DieType } from '../rules/die';
import {
  contrastRatio,
  fromChannels,
  isHexColour,
  lightness,
  MIN_INK_CONTRAST,
  MIN_LIGHTNESS_STEP,
  NON_TEXT_CONTRAST_MIN,
  TEXT_CONTRAST_MIN,
  toChannels,
  type Rgb,
} from './contrast';
import type { DiceTheme, InterfacePalette } from './themes';

/**
 * The dice ladder, in CIE L*, from the darkest type to the lightest.
 *
 * Unit 3.3 set it. The rungs are nine apart, above the eight the accessibility
 * claim needs, and the bottom rung is the lowest one that still holds a black
 * numeral at 4 to 1 and a die against a dark tray at 3 to 1.
 */
export const LADDER_TARGETS: Readonly<Record<DieType, number>> = {
  stress: 49,
  artifact: 58,
  gear: 67,
  skill: 76,
  bonus: 85,
  attribute: 94,
};

/** Which tokens a lightness target is chosen for. The accent is not one. */
type DerivedToken = 'background' | 'surface' | 'text' | 'textMuted';

/** The lightness of each interface token, for a dark page and for a light one. */
export const PALETTE_TARGETS: Readonly<
  Record<'dark' | 'light', Readonly<Record<DerivedToken, number>>>
> = {
  dark: { background: 12, surface: 18, text: 92, textMuted: 72 },
  light: { background: 93, surface: 89, text: 20, textMuted: 38 },
};

/**
 * The lightness of a readout over the tray. One number, not one per mode: every
 * tray surface is dark, so the readout stays light in a light theme too.
 * `themes.ts` says why the surfaces are dark.
 */
export const ON_TRAY_TARGET = 92;

function ramp(base: Rgb, t: number): Rgb {
  const move = (channel: number): number =>
    t <= 1 ? channel * t : channel + (1 - channel) * (t - 1);
  return [move(base[0]), move(base[1]), move(base[2])];
}

/**
 * The same colour at a chosen CIE L*.
 *
 * One parameter walks a colour from black, through itself, to white. Every
 * channel rises with it, so lightness rises with it too and a bisection finds
 * the target. Fifty steps put the answer far below the last hex digit.
 *
 * A target no colour can miss: black is L* 0 and white is L* 100, and both are
 * on the walk, so every target from 0 to 100 is reached.
 */
export function withLightness(hex: string, targetL: number): string {
  const base = toChannels(hex);
  let low = 0;
  let high = 2;
  for (let step = 0; step < 50; step += 1) {
    const middle = (low + high) / 2;
    if (lightness(fromChannels(ramp(base, middle))) < targetL) {
      low = middle;
    } else {
      high = middle;
    }
  }
  return fromChannels(ramp(base, (low + high) / 2));
}

/**
 * Six dice colours from one.
 *
 * The hue of the chosen colour is kept and every type is placed on the ladder,
 * so the six separate by lightness whatever hue arrived. A player who picks a
 * colour gets a set a greyscale copy still reads.
 */
export function deriveDiceTheme(seed: string): DiceTheme {
  const built = {} as Record<DieType, string>;
  for (const [type, target] of Object.entries(LADDER_TARGETS) as [DieType, number][]) {
    built[type] = withLightness(seed, target);
  }
  return built;
}

/**
 * An interface palette from one colour.
 *
 * The chosen colour becomes the accent and is not changed. Everything else is
 * the same colour at a fixed lightness, so the page reads as one family.
 * `onAccent` takes whichever end of that family reads better on the accent.
 */
export function derivePalette(seed: string, mode: 'dark' | 'light' = 'dark'): InterfacePalette {
  const targets = PALETTE_TARGETS[mode];
  const at = (token: DerivedToken): string => withLightness(seed, targets[token]);
  const darkInk = withLightness(seed, 8);
  const lightInk = withLightness(seed, 97);
  return {
    background: at('background'),
    surface: at('surface'),
    text: at('text'),
    textMuted: at('textMuted'),
    accent: seed,
    onAccent: contrastRatio(darkInk, seed) >= contrastRatio(lightInk, seed) ? darkInk : lightInk,
    onTray: withLightness(seed, ON_TRAY_TARGET),
  };
}

/** One contrast claim that did not hold. An empty list means the set is usable. */
export interface ContrastFinding {
  /** What was measured against what, in words a player reads. */
  readonly pair: string;
  /** The measured ratio, or the measured CIE L* step for a ladder finding. */
  readonly measured: number;
  /** The floor it had to reach. */
  readonly floor: number;
}

/**
 * The seven pairs a palette answers for.
 *
 * Text pairs take the WCAG 2.2 minimum of 4.5 to 1. The accent is a control and
 * not text, so it takes the non-text minimum of 3 to 1.
 */
const PALETTE_PAIRS: readonly (readonly [
  keyof InterfacePalette,
  keyof InterfacePalette,
  number,
])[] = [
  ['text', 'background', TEXT_CONTRAST_MIN],
  ['text', 'surface', TEXT_CONTRAST_MIN],
  ['textMuted', 'background', TEXT_CONTRAST_MIN],
  ['textMuted', 'surface', TEXT_CONTRAST_MIN],
  ['onAccent', 'accent', TEXT_CONTRAST_MIN],
  ['accent', 'background', NON_TEXT_CONTRAST_MIN],
  ['accent', 'surface', NON_TEXT_CONTRAST_MIN],
];

/** The number of pairs a palette answers for on its own. Seven. */
export const PALETTE_PAIR_COUNT = PALETTE_PAIRS.length;

/**
 * Judge a palette.
 *
 * The seven pairs above never leave the palette, which is why the text claim
 * has a denominator of six and not 216. Pass `traySurfaces` to judge the one
 * token that does leave it: a readout drawn over the tray is measured against
 * every surface it can land on.
 */
export function checkPalette(
  palette: InterfacePalette,
  traySurfaces: readonly string[] = [],
): ContrastFinding[] {
  const findings: ContrastFinding[] = [];
  for (const [ink, ground, floor] of PALETTE_PAIRS) {
    const measured = contrastRatio(palette[ink], palette[ground]);
    if (measured < floor) {
      findings.push({ pair: `${ink} over ${ground}`, measured, floor });
    }
  }
  for (const surface of traySurfaces) {
    const measured = contrastRatio(palette.onTray, surface);
    if (measured < TEXT_CONTRAST_MIN) {
      findings.push({ pair: `onTray over ${surface}`, measured, floor: TEXT_CONTRAST_MIN });
    }
  }
  return findings;
}

/**
 * Judge a dice theme.
 *
 * Three claims. No two type colours sit closer than the ladder step, so a
 * player who separates no hue still reads six shades. The black numeral holds
 * its floor on every body. Every body holds its floor against every tray
 * surface passed in.
 */
export function checkDiceTheme(
  theme: DiceTheme,
  traySurfaces: readonly string[] = [],
): ContrastFinding[] {
  const findings: ContrastFinding[] = [];
  const types = Object.keys(theme) as DieType[];
  for (let i = 0; i < types.length; i += 1) {
    for (let j = i + 1; j < types.length; j += 1) {
      const [first, second] = [types[i] as DieType, types[j] as DieType];
      const step = Math.abs(lightness(theme[first]) - lightness(theme[second]));
      if (step < MIN_LIGHTNESS_STEP) {
        findings.push({
          pair: `${first} and ${second}, in CIE L*`,
          measured: step,
          floor: MIN_LIGHTNESS_STEP,
        });
      }
    }
  }
  for (const type of types) {
    const ink = contrastRatio(theme[type], '#000000');
    if (ink < MIN_INK_CONTRAST) {
      findings.push({ pair: `the numeral on ${type}`, measured: ink, floor: MIN_INK_CONTRAST });
    }
    for (const surface of traySurfaces) {
      const measured = contrastRatio(theme[type], surface);
      if (measured < NON_TEXT_CONTRAST_MIN) {
        findings.push({
          pair: `${type} on ${surface}`,
          measured,
          floor: NON_TEXT_CONTRAST_MIN,
        });
      }
    }
  }
  return findings;
}

/** A colour a player typed, or nothing. The interface half calls this first. */
export function readSeed(value: string): string | null {
  return isHexColour(value) ? value.toUpperCase() : null;
}
