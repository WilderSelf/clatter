// Where each die on the tray sits on the screen.
//
// The 3D tray draws the dice and a canvas has no children a keyboard can
// reach, so the screen lays one DOM cell over each die. This module answers
// where those cells go. It reads the tray and decides nothing: the position
// comes from the physics body, the radius comes from the die geometry, and the
// projection comes from the library's own camera.
//
// **Every number is derived, never tuned.** The radius is measured by
// projecting a point one die radius away from the die centre and taking the
// distance between the two projections, so a camera move, a wall move or a die
// of another size all carry through with no constant to re-calibrate.

import type { DiceBox, TrayDie } from './vendor/dice-tray.js';

/** One die, in CSS pixels relative to the top left of the tray container. */
export interface DieSpot {
  readonly x: number;
  readonly y: number;
  /** Half the width the die covers on the screen. */
  readonly radius: number;
}

/** The radius of one die in tray units, from its own geometry. */
function dieRadius(die: TrayDie): number {
  if (!die.geometry.boundingSphere) die.geometry.computeBoundingSphere();
  return (die.geometry.boundingSphere?.radius ?? 0) * die.scale.x;
}

/**
 * Where the first `count` dice of the tray sit, in tray order.
 *
 * A die the tray does not hold gives `null`, so a caller counts what it read
 * rather than assuming the tray and the pool are the same length.
 */
export function dieSpots(box: DiceBox, count: number): readonly (DieSpot | null)[] {
  return Array.from({ length: count }, (_, index) => {
    const die = box.diceList[index];
    if (!die) return null;
    const centre = box.getScreenPosition(die.position);
    if (centre === undefined) return null;
    const radius = dieRadius(die);
    const edge = box.getScreenPosition({
      x: die.position.x + radius,
      y: die.position.y,
      z: die.position.z,
    });
    return {
      x: centre.x,
      y: centre.y,
      radius: edge === undefined ? radius : Math.abs(edge.x - centre.x),
    };
  });
}
