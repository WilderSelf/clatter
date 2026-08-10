// Colour arithmetic. sRGB to linear light, relative luminance, CIE L*, and the
// WCAG contrast ratio.
//
// Pure, Constraint 3 style: no browser API, no module-level mutable state, no
// dependency. Colour space conversion is arithmetic and needs neither a canvas
// nor a library.
//
// Unit 3.3 already did this arithmetic inside `dice-colors.test.ts`, where it
// only had to measure. Unit 4.8 needs the same numbers in shipping code,
// because the colour builder derives a colour from a target lightness and tells
// a player when a chosen colour fails contrast. That file keeps its own copy on
// purpose: it measures the constants of another module and must not read them
// through the same code that produced them.
//
// The floors below are quoted from WCAG 2.2. Nothing here invents one.

/** Linear-light red, green and blue, each from 0 to 1. */
export type Rgb = readonly [number, number, number];

/**
 * The floor for text against the surface it sits on.
 * WCAG 2.2, Success Criterion 1.4.3 Contrast (Minimum), level AA.
 */
export const TEXT_CONTRAST_MIN = 4.5;

/**
 * The floor for a control or a boundary that carries meaning without text.
 * WCAG 2.2, Success Criterion 1.4.11 Non-text Contrast, level AA.
 */
export const NON_TEXT_CONTRAST_MIN = 3;

/**
 * The smallest lightness step between two dice types, in CIE L*.
 *
 * Unit 3.3, not WCAG. Colour is never the only carrier, so the six type
 * colours form a ladder a greyscale copy still separates.
 */
export const MIN_LIGHTNESS_STEP = 8;

/** The floor for the numeral against the die body it sits on. Unit 3.3. */
export const MIN_INK_CONTRAST = 4;

const HEX_COLOUR = /^#[0-9a-fA-F]{6}$/;

/** True when `value` is a six-digit hex colour with a leading hash. */
export function isHexColour(value: string): boolean {
  return HEX_COLOUR.test(value);
}

/**
 * A hex colour as three sRGB channels, each from 0 to 1. Still gamma encoded:
 * this is the number a stylesheet carries, scaled.
 *
 * Storage holds user-editable text and the colour builder takes a colour the
 * player typed, so the shape is checked here rather than trusted.
 */
export function toChannels(hex: string): Rgb {
  if (!isHexColour(hex)) {
    throw new Error(`not a hex colour: ${JSON.stringify(hex)}`);
  }
  const channels = [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16) / 255);
  return [channels[0] ?? 0, channels[1] ?? 0, channels[2] ?? 0];
}

/** Three sRGB channels back to a hex colour. Every channel is clamped. */
export function fromChannels(rgb: Rgb): string {
  const digits = rgb.map((value) => {
    const byte = Math.round(Math.min(1, Math.max(0, value)) * 255);
    return byte.toString(16).padStart(2, '0').toUpperCase();
  });
  return `#${digits.join('')}`;
}

/** A hex colour as linear light, which is what luminance is made of. */
export function toLinear(hex: string): Rgb {
  const [r, g, b] = toChannels(hex).map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  );
  return [r ?? 0, g ?? 0, b ?? 0];
}

export function relativeLuminance([r, g, b]: Rgb): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** CIE L*, the perceptual lightness. 0 is black and 100 is white. */
export function lightness(hex: string): number {
  const y = relativeLuminance(toLinear(hex));
  return y <= 216 / 24389 ? (y * 24389) / 27 : Math.cbrt(y) * 116 - 16;
}

/** The WCAG contrast ratio between two hex colours, from 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  const first = relativeLuminance(toLinear(a));
  const second = relativeLuminance(toLinear(b));
  const high = Math.max(first, second);
  const low = Math.min(first, second);
  return (high + 0.05) / (low + 0.05);
}
