import { describe, expect, it } from 'vitest';
import { chooseTrayPixelRatio, MAX_PIXEL_RATIO } from './scene';

describe('chooseTrayPixelRatio', () => {
  it('caps a high device ratio', () => {
    expect(chooseTrayPixelRatio(3)).toBe(MAX_PIXEL_RATIO);
  });

  it('keeps a ratio under the cap', () => {
    expect(chooseTrayPixelRatio(1.5)).toBe(1.5);
  });

  it('falls back to 1 when the browser reports nothing usable', () => {
    expect(chooseTrayPixelRatio(Number.NaN)).toBe(1);
    expect(chooseTrayPixelRatio(0)).toBe(1);
    expect(chooseTrayPixelRatio(-2)).toBe(1);
  });
});
