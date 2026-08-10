// The share-card capture.
//
// The published library builds its renderer with a literal option object, so
// `preserveDrawingBuffer` can never be set on it. Unit 3.1 patched the library
// to expose the renderer, and that is what this module needs. Without the flag
// the browser clears the drawing buffer once the frame is composited, so a read
// taken in a later task comes back empty. See `docs/design/0003-vendor-patch-list.md`,
// fact 3.
//
// The answer is order, not a flag: draw one fresh frame and copy it in the same
// task. `captureTrayJpeg` is that order, and it is **synchronous on purpose**.
// A synchronous function cannot await, so the copy cannot slip into a later
// task by accident. Do not make it `async`, do not await inside it, and do not
// split the render away from the copy. `capture.test.ts` fails when it becomes
// an async function, because a black card passes every check that does not read
// the pixels.

import { TRAY_SURFACE_COLOR } from './scene';
import type { DiceBox } from './vendor/dice-tray.js';

/**
 * The JPEG quality the card is encoded at.
 *
 * JPEG, not PNG, because a card is a photograph of a lit scene and a lossless
 * copy of one is several times larger for no gain a player sees.
 */
export const SHARE_JPEG_QUALITY = 0.9;

/** What the overlay is given: the copy, and the size it may draw over. */
export interface CaptureSurface {
  readonly width: number;
  readonly height: number;
}

export interface CaptureOptions {
  /** The colour under the dice. The renderer clears to transparent. */
  readonly surface?: string;
  /** 0 to 1. `SHARE_JPEG_QUALITY` unless the caller names another. */
  readonly quality?: number;
  /**
   * The summary, drawn over the copied frame.
   *
   * **It runs inside this same task**, between the copy and the encode, and it
   * may not await. A composition drawn after the copy is a different defect
   * with the same shape as the black frame: the picture under it would be gone
   * and the panel over it would still look like a card. `drawShareCard` in
   * `src/shell/share-card.ts` is the one caller and it is synchronous.
   */
  readonly overlay?: (context: CanvasRenderingContext2D, size: CaptureSurface) => void;
}

/**
 * Draw one fresh frame and return it as a JPEG data URL.
 *
 * The renderer clears to transparent and the surface a player sees is the
 * element behind the canvas, so the frame is composited over that colour here.
 * JPEG carries no alpha, and a card that skipped this step would show the dice
 * on black rather than on the table.
 *
 * Every step below runs in one task, the summary overlay included. Read the
 * note at the top of this file before you change the order of any of them.
 */
export function captureTrayJpeg(box: DiceBox, options: CaptureOptions = {}): string {
  const drawn = box.renderer.domElement as HTMLCanvasElement;
  if (drawn.width < 1 || drawn.height < 1) {
    throw new Error(`captureTrayJpeg: the canvas measures ${drawn.width} by ${drawn.height}`);
  }
  // An async overlay draws after this function has returned, so the panel would
  // land on a canvas the browser has already cleared. The declaration is the
  // guard, exactly as it is for this function itself.
  if (options.overlay !== undefined && options.overlay.constructor.name === 'AsyncFunction') {
    throw new Error('captureTrayJpeg: the overlay is an async function and it may not await');
  }

  // 1. One fresh frame, so the drawing buffer holds the scene right now.
  box.renderer.render(box.scene, box.camera);

  // 2. The copy, in this same task. `drawImage` reads the drawing buffer, and
  //    the browser clears that buffer as soon as it composites the frame.
  const flat = document.createElement('canvas');
  flat.width = drawn.width;
  flat.height = drawn.height;
  const context = flat.getContext('2d');
  if (!context) throw new Error('captureTrayJpeg: this browser offered no 2d context');
  context.fillStyle = options.surface ?? TRAY_SURFACE_COLOR;
  context.fillRect(0, 0, flat.width, flat.height);
  context.drawImage(drawn, 0, 0);

  // 3. The summary, over the frame and inside this same task. The overlay is
  //    synchronous, so the picture under it cannot be cleared before it draws.
  options.overlay?.(context, { width: flat.width, height: flat.height });

  // 4. Encode. `toDataURL` is synchronous, so the bytes are the frame above.
  return flat.toDataURL('image/jpeg', options.quality ?? SHARE_JPEG_QUALITY);
}
