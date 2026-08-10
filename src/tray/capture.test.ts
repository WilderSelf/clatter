// The share-card capture, over a recording stand-in for the tray and the DOM.
//
// The property this file exists for is **order in one task**. A capture that
// reads the canvas after the browser has composited the frame returns an empty
// buffer, and the card is then a flat rectangle of the surface colour with no
// dice on it. Nothing throws and nothing logs. `scripts/browser.mjs --share`
// reads the real pixels on the graphics card, and this file holds the two
// cheap guards that run in `validate`:
//
// 1. `captureTrayJpeg` is a plain function, not an async one. An async function
//    may await, and an await between the render and the copy is exactly the
//    defect. The declaration is the guard.
// 2. The render happens before the copy, and the surface is laid down before
//    the frame goes over it.

import { afterEach, describe, expect, it } from 'vitest';
import { captureTrayJpeg, SHARE_JPEG_QUALITY } from './capture';
import { TRAY_SURFACE_COLOR } from './scene';
import type { DiceBox } from './vendor/dice-tray.js';

const DATA_URL = 'data:image/jpeg;base64,/9j/stand-in';

/** A tray, a canvas and a 2d context that record what was called on them. */
function stand(width = 800, height = 600): { box: DiceBox; calls: string[] } {
  const calls: string[] = [];
  const drawn = { width, height };
  const context = {
    fillStyle: '',
    fillRect: (x: number, y: number, w: number, h: number) =>
      calls.push(`fillRect ${x},${y},${w},${h} in ${context.fillStyle}`),
    drawImage: (source: unknown) => calls.push(`drawImage ${source === drawn ? 'tray' : 'other'}`),
  };
  const flat = {
    width: 0,
    height: 0,
    getContext: () => context,
    toDataURL: (type: string, quality: number) => {
      calls.push(`toDataURL ${type} at ${quality}`);
      return DATA_URL;
    },
  };
  (globalThis as { document?: unknown }).document = { createElement: () => flat };
  const box = {
    scene: 'scene',
    camera: 'camera',
    renderer: {
      domElement: drawn,
      render: (scene: unknown, camera: unknown) => calls.push(`render ${scene} ${camera}`),
    },
  } as unknown as DiceBox;
  return { box, calls };
}

afterEach(() => {
  delete (globalThis as { document?: unknown }).document;
});

describe('captureTrayJpeg', () => {
  it('is synchronous, so the copy cannot fall into a later task', () => {
    // An `async` keyword on the function turns this name into AsyncFunction.
    expect(captureTrayJpeg.constructor.name).toBe('Function');
    const { box } = stand();
    expect(captureTrayJpeg(box)).toBe(DATA_URL);
  });

  it('draws the frame first, then lays the surface under it, then encodes', () => {
    const { box, calls } = stand();
    captureTrayJpeg(box);
    expect(calls).toEqual([
      'render scene camera',
      `fillRect 0,0,800,600 in ${TRAY_SURFACE_COLOR}`,
      'drawImage tray',
      `toDataURL image/jpeg at ${SHARE_JPEG_QUALITY}`,
    ]);
  });

  it('refuses a canvas with no area, because there is nothing to copy', () => {
    const { box } = stand(0, 0);
    expect(() => captureTrayJpeg(box)).toThrow(/measures 0 by 0/);
  });

  // ---- The summary, over the frame and inside the same task — Unit 4.9 ----
  //
  // A composition drawn after the copy is a different defect with the same
  // shape: the picture under the panel is gone and the panel over it still
  // looks like a card. The order below is the guard, and the async refusal is
  // the second one.
  it('draws the summary over the frame and before the encode, in this same task', () => {
    const { box, calls } = stand();
    const surface = { width: 0, height: 0 };
    captureTrayJpeg(box, {
      overlay: (_context, size) => {
        Object.assign(surface, size);
        calls.push('overlay');
      },
    });
    expect(calls).toEqual([
      'render scene camera',
      `fillRect 0,0,800,600 in ${TRAY_SURFACE_COLOR}`,
      'drawImage tray',
      'overlay',
      `toDataURL image/jpeg at ${SHARE_JPEG_QUALITY}`,
    ]);
    expect(surface, 'the overlay is given the size it may draw over').toEqual({
      width: 800,
      height: 600,
    });
  });

  it('refuses an async overlay, because it would draw after the canvas was cleared', () => {
    const { box, calls } = stand();
    expect(() =>
      captureTrayJpeg(box, {
        overlay: async () => {
          calls.push('overlay');
        },
      }),
    ).toThrow(/async function and it may not await/);
    expect(calls, 'nothing was rendered, copied or encoded').toEqual([]);
  });

  it('lays down the tray surface the caller names, and its own where none is named', () => {
    const { box, calls } = stand();
    captureTrayJpeg(box, { surface: '#102822' });
    expect(calls).toContain('fillRect 0,0,800,600 in #102822');
  });
});
