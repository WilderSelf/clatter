// When the dice on the table first move — Unit 3.8, the overlay half.
//
// The overlay reports throw-to-first-motion, and the two ends of that
// measurement are a press and a MOVEMENT. The press is the screen's, and this
// module answers the other end: the first animation frame that draws a die
// somewhere other than where the press left it.
//
// **The first frame is not the first motion, and the difference is the whole
// number.** The screen redraws as soon as the player presses — the builder
// collapses and the footer changes — and the browser paints that frame long
// before a die moves. The library then simulates the entire throw synchronously
// before it draws anything at all, which is the stall the plan calls a
// first-class number. A probe that stopped at the first frame would report the
// redraw and miss the stall completely.
//
// So the reading is taken off the drawn positions of the dice, never off a
// frame count. The tray decides nothing here: it is read.

import type { MotionEvidence } from '../shell/perf';
import type { DiceBox } from './vendor/dice-tray.js';

/** Where every die of the tray is drawn, flattened. Three numbers per die. */
export function drawnPositions(box: DiceBox): readonly number[] {
  const out: number[] = [];
  for (const die of box.diceList) {
    out.push(die.position.x, die.position.y, die.position.z);
  }
  return out;
}

/**
 * The largest distance any die moved between two readings, in tray units.
 *
 * Dice the two readings do not share are not measured here — a change of the
 * count is reported on its own, because a die that was spawned did not travel
 * from anywhere.
 */
export function movedBy(before: readonly number[], now: readonly number[]): number {
  let largest = 0;
  const shared = Math.min(before.length, now.length);
  for (let at = 0; at + 2 < shared; at += 3) {
    const dx = (now[at] as number) - (before[at] as number);
    const dy = (now[at + 1] as number) - (before[at + 1] as number);
    const dz = (now[at + 2] as number) - (before[at + 2] as number);
    largest = Math.max(largest, Math.sqrt(dx * dx + dy * dy + dz * dz));
  }
  return largest;
}

/**
 * True when the table is drawn differently from the reading it is given.
 *
 * The comparison is exact. A tray at rest holds sleeping bodies whose drawn
 * position does not change at all, so a tolerance here would only make the
 * probe blind to a small first movement.
 */
export function hasMoved(before: readonly number[], now: readonly number[]): boolean {
  return before.length !== now.length || movedBy(before, now) > 0;
}

/** The animation clock, as a seam a test can hand its own. */
export interface FrameClock {
  request(run: (at: number) => void): number;
  cancel(handle: number): void;
}

export const browserFrames: FrameClock = {
  request: (run) => globalThis.requestAnimationFrame(run),
  cancel: (handle) => globalThis.cancelAnimationFrame(handle),
};

/**
 * Watch the tray until it draws a die somewhere else, then report once.
 *
 * The reading the watch compares against is taken at the moment this is called,
 * which the caller makes the press that threw. Returns the call that stops the
 * watch, so a throw that never moves anything costs one cancelled frame.
 */
export function watchFirstMotion(
  box: DiceBox,
  report: (at: number, evidence: MotionEvidence) => void,
  frames: FrameClock = browserFrames,
): () => void {
  const before = drawnPositions(box);
  let stillFrames = 0;
  let handle: number | null = null;
  let live = true;

  const look = (at: number): void => {
    if (!live) return;
    const now = drawnPositions(box);
    if (hasMoved(before, now)) {
      live = false;
      report(at, {
        stillFrames,
        movedBy: movedBy(before, now),
        dice: now.length / 3,
        spawned: before.length !== now.length,
      });
      return;
    }
    stillFrames += 1;
    handle = frames.request(look);
  };

  handle = frames.request(look);
  return () => {
    live = false;
    if (handle !== null) frames.cancel(handle);
  };
}
