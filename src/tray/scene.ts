// The tray scene. Canvas, surface and pixel ratio.
//
// The camera, the lights, the tray walls and the physics world all come from
// the vendored library. It builds them in `setDimensions`, which it calls from
// `initialize` and again from its own `resize` listener, so the walls already
// follow the canvas. This module adds the three things the library leaves out:
// a container the library can measure, the surface a player sees, and a pixel
// ratio.
//
// The library never calls `setPixelRatio`, so it draws one device pixel per CSS
// pixel and looks soft on a phone. `MAX_PIXEL_RATIO` records the measured cap.
// See the Unit 3.2 row in LEDGER.md for the frame cost at each ratio.

import { TRAY_SURFACES } from '../theme/themes';
import { TRAY_BASE_COLOR_SET } from './dice-colors';
export { TRAY_BASE_COLOR_SET };
import { loadTray } from './index';
import type { DiceBox, DiceConfig } from './vendor/dice-tray.js';

/**
 * The surface the dice land on.
 *
 * The renderer clears to transparent and the desk is a shadow catcher, so the
 * colour a player sees is the element behind the canvas, not a material in the
 * scene.
 *
 * Unit 4.8 made the surface an axis of six. This is the row Unit 3.2 shipped
 * and it stays the default. The value is written once, in `themes.ts`, so this
 * module and the theme checks cannot disagree about it.
 */
export const TRAY_SURFACE_COLOR = TRAY_SURFACES.ash;

/**
 * The highest ratio the tray draws at.
 *
 * Measured at Unit 3.2 on an RX 6700 XT, on a settled twelve-die scene, with
 * `gl.finish()` after every frame. Above 2 the frame cost keeps climbing with
 * the pixel count and buys a difference no eye reads on a phone.
 */
export const MAX_PIXEL_RATIO = 2;

/** Cap the device ratio. A missing or absurd ratio falls back to 1. */
export function chooseTrayPixelRatio(deviceRatio: number, cap: number = MAX_PIXEL_RATIO): number {
  if (!Number.isFinite(deviceRatio) || deviceRatio <= 0) return 1;
  return Math.min(deviceRatio, cap);
}

/** The two events a canvas fires when its WebGL context goes and comes back. */
export type ContextEvent = 'webglcontextlost' | 'webglcontextrestored';

/**
 * Watch a canvas for a lost WebGL context.
 *
 * A lost context gives a black canvas and no error, which is the worst failure
 * this tray has: nothing throws, nothing logs, and the player sees an empty
 * table. It is common on iOS under memory pressure. The plan makes a loss a
 * permanent fall to flat dice, so `onFallToFlat` is the call that records it.
 *
 * `preventDefault` on the loss is what lets the browser try to restore the
 * context. Without it `webglcontextrestored` never fires. The restore does not
 * undo the fall — it calls back again, because a restored context would put a
 * half-built scene back on the screen and the application has already moved to
 * flat dice.
 *
 * Returns the call that removes both listeners.
 */
export function watchContextLoss(
  canvas: HTMLCanvasElement,
  onFallToFlat: (event: ContextEvent) => void,
): () => void {
  const lost = (event: Event): void => {
    event.preventDefault();
    onFallToFlat('webglcontextlost');
  };
  const restored = (): void => onFallToFlat('webglcontextrestored');
  canvas.addEventListener('webglcontextlost', lost);
  canvas.addEventListener('webglcontextrestored', restored);
  return () => {
    canvas.removeEventListener('webglcontextlost', lost);
    canvas.removeEventListener('webglcontextrestored', restored);
  };
}

export interface MountTrayOptions {
  /** Forces a ratio. The browser harness uses it to price one. */
  pixelRatio?: number;
  /** Passed to the library. The defaults above win unless this overrides them. */
  config?: Partial<DiceConfig>;
  /**
   * Called when the canvas loses its WebGL context, and again if the browser
   * restores it. The caller records the permanent fall. This module writes no
   * settings, so the storage binding stays with the application.
   */
  onFallToFlat?: (event: ContextEvent) => void;
}

/**
 * Build the scene inside `container` and draw one frame.
 *
 * The container must already have a size. The library reads `clientWidth` and
 * `clientHeight` in its constructor and sizes the tray walls from them, so a
 * container with no size gives a tray with no walls and dice that fall away.
 */
export async function mountTray(
  container: HTMLElement,
  options: MountTrayOptions = {},
): Promise<DiceBox> {
  if (container.clientWidth < 1 || container.clientHeight < 1) {
    throw new Error(
      `mountTray: the container measures ${container.clientWidth} by ${container.clientHeight}. ` +
        'Lay it out before you mount the tray.',
    );
  }

  const { DiceBox: Tray } = await loadTray();
  // The tray surface is a theme axis of six — Unit 4.8. The application writes
  // `--tray-surface` on the root element, so the inline value below follows a
  // change of the axis without a remount. The literal after the comma is what a
  // caller outside the application gets, and it is the row Unit 3.2 shipped.
  container.style.background = `var(--tray-surface, ${TRAY_SURFACE_COLOR})`;

  // A custom colour set, not one of the six named sets. Every die face is drawn
  // on this neutral base and `throwPool` multiplies the colour of the type into
  // it. See `dice-colors.ts`.
  // The tray reports a collision only when a caller asks for one, so a mount
  // that names no `onImpact` makes no sound at all. `src/tray/sound.ts` is what
  // a caller passes, and it holds the player's choice.
  const box = new Tray(container, {
    theme_customColorset: TRAY_BASE_COLOR_SET,
    ...options.config,
  });
  await box.initialize();

  // After `initialize`, because it is the call that builds the renderer.
  // three.js keeps the ratio across every later `setSize`, so the resize path
  // of the library holds it too.
  box.renderer.setPixelRatio(options.pixelRatio ?? chooseTrayPixelRatio(window.devicePixelRatio));

  // Before the first frame. A context lost during that frame still reports.
  if (options.onFallToFlat) {
    watchContextLoss(box.renderer.domElement, options.onFallToFlat);
  }

  box.renderer.render(box.scene, box.camera);
  return box;
}
