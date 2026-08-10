// The accessibility claim of Unit 3.3, measured.
//
// Every number here is computed from the hex values in `dice-colors.ts`. The
// module states no measurement of its own, so nothing in this file can read the
// constant it bounds.

import { describe, expect, it } from 'vitest';
import { DIE_TYPE_COLOR, TRAY_BASE_COLOR_SET } from './dice-colors';
import { TRAY_SURFACE_COLOR } from './scene';
import { baneCount } from '../rules/roll';

/** The smallest lightness step between any two dice types, in CIE L*. */
const MIN_LIGHTNESS_STEP = 8;
/** The floor for the numeral against the die body it sits on. */
const MIN_INK_CONTRAST = 4;
/** The floor for the die body against the surface it lands on. */
const MIN_SURFACE_CONTRAST = 3;

type Rgb = [number, number, number];

function toLinear(hex: string): Rgb {
  const channels = [1, 3, 5].map((start) => {
    const value = Number.parseInt(hex.slice(start, start + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return [channels[0] ?? 0, channels[1] ?? 0, channels[2] ?? 0];
}

/** What the renderer does: the material colour multiplies the face texture. */
function multiply(a: string, b: string): Rgb {
  const [ar, ag, ab] = toLinear(a);
  const [br, bg, bb] = toLinear(b);
  return [ar * br, ag * bg, ab * bb];
}

function luminance([r, g, b]: Rgb): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** CIE L*, the perceptual lightness. 0 is black and 100 is white. */
function lightness(colour: Rgb): number {
  const y = luminance(colour);
  return y <= 216 / 24389 ? (y * 24389) / 27 : Math.cbrt(y) * 116 - 16;
}

function contrast(a: Rgb, b: Rgb): number {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (high + 0.05) / (low + 0.05);
}

/** The colour a player sees: the type colour over the neutral base. */
function bodyColour(type: string): Rgb {
  return multiply(
    DIE_TYPE_COLOR[type as keyof typeof DIE_TYPE_COLOR],
    TRAY_BASE_COLOR_SET.background,
  );
}

/** The numeral: the base foreground, multiplied by the same type colour. */
function inkColour(type: string): Rgb {
  return multiply(
    DIE_TYPE_COLOR[type as keyof typeof DIE_TYPE_COLOR],
    TRAY_BASE_COLOR_SET.foreground,
  );
}

// An independent enumeration of the dice types. `baneCount` builds one entry per
// type from the rules core, so a seventh type added there fails this file rather
// than passing with six colours.
const TYPES = Object.keys(baneCount({ dice: [], stressAfter: 0 }));

describe('the dice type colours', () => {
  it('covers every dice type the rules core knows', () => {
    expect(TYPES.length).toBeGreaterThan(0);
    expect(Object.keys(DIE_TYPE_COLOR).sort()).toEqual(TYPES.sort());
  });

  it('keeps the base body white, so a type colour is the colour a player sees', () => {
    // A multiply can only darken. A tinted base caps the gamut and a cool
    // colour comes back warm.
    expect(TRAY_BASE_COLOR_SET.background).toBe('#FFFFFF');
  });

  it('separates every pair by lightness, so hue is never the only carrier', () => {
    const pairs: string[] = [];
    let closest = Number.POSITIVE_INFINITY;
    let closestPair = '';
    for (let i = 0; i < TYPES.length; i += 1) {
      for (let j = i + 1; j < TYPES.length; j += 1) {
        const [first, second] = [TYPES[i] as string, TYPES[j] as string];
        pairs.push(`${first}/${second}`);
        const step = Math.abs(lightness(bodyColour(first)) - lightness(bodyColour(second)));
        if (step < closest) {
          closest = step;
          closestPair = `${first} and ${second} are ${step.toFixed(1)} L* apart`;
        }
      }
    }
    // The denominator, computed here: every unordered pair of the six types.
    expect(pairs.length).toBe((TYPES.length * (TYPES.length - 1)) / 2);
    expect(closest, closestPair).toBeGreaterThanOrEqual(MIN_LIGHTNESS_STEP);
  });

  it('keeps the numeral readable on every colour', () => {
    for (const type of TYPES) {
      const measured = contrast(bodyColour(type), inkColour(type));
      expect(measured, `${type} reads ${measured.toFixed(2)} to 1`).toBeGreaterThanOrEqual(
        MIN_INK_CONTRAST,
      );
    }
  });

  it('keeps every die visible against the tray surface', () => {
    for (const type of TYPES) {
      const measured = contrast(bodyColour(type), toLinear(TRAY_SURFACE_COLOR));
      expect(measured, `${type} reads ${measured.toFixed(2)} to 1`).toBeGreaterThanOrEqual(
        MIN_SURFACE_CONTRAST,
      );
    }
  });
});
