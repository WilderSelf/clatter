// The push affordance, drawn on the dice themselves.
//
// Three states, and the rules core decides every one of them. `lockState` in
// `src/rules/push-profile.ts` is the only reader of a profile here. This module
// draws the answer and turns a click into a new pool. It derives no state.
//
// Accessibility, Constraint 6. **Colour is not the carrier.** Unit 3.3 already
// spends hue on the dice type, over a lightness ladder, and a second meaning on
// the same axis would compete with the first. The state therefore rides shape:
//
//   rule    a closed frame around the die. The rules hold it and a click does
//           nothing, so the mark is unbroken.
//   choice  four corner blocks. The player put them there and a click takes
//           them away, so the mark is open at every side.
//   loose   no mark at all. The die goes back in the cup.
//
// A player who separates no hue reads three shapes, and a greyscale copy of the
// tray still separates them. The two colours carry the same three-way answer a
// second time: `affordance.test.ts` measures the contrast of each mark against
// every tray surface and against the other mark, over all six themes.
//
// A marker is a flat shape lying on the desk around its die, not a child of the
// die. A child would join `box.diceList` under a recursive raycast, and the
// colour check of Unit 3.3 reads every node of a die as that die's own surface.

import type { Die } from '../rules/die';
import type { LockState, PushProfile } from '../rules/push-profile';
import { lockState } from '../rules/push-profile';
import type { InterfacePalette } from '../theme/themes';
import type { DiceBox, ThreeObject3D, TrayDie } from './vendor/dice-tray.js';

// ---------------------------------------------------------------------------
// The click. No browser API below this line until `dieAt`.
// ---------------------------------------------------------------------------

/**
 * What a click on one die does.
 *
 * A rule lock is not the player's to release, so the die refuses. Everything
 * else is the player's own flag and flips.
 */
export type ClickOutcome = 'refused' | 'kept' | 'released';

export function clickOutcome(die: Die, profile: PushProfile): ClickOutcome {
  switch (lockState(die, profile)) {
    case 'rule':
      return 'refused';
    case 'choice':
      return 'released';
    default:
      return 'kept';
  }
}

/**
 * The pool after a click on `id`. Neither the input array nor any die in it is
 * changed. A refused click and an unknown id both give the pool back unchanged.
 */
export function clickDie(dice: readonly Die[], id: string, profile: PushProfile): readonly Die[] {
  return dice.map((die) =>
    die.id === id && clickOutcome(die, profile) !== 'refused'
      ? { ...die, manualLock: !die.manualLock }
      : die,
  );
}

// ---------------------------------------------------------------------------
// The marks
// ---------------------------------------------------------------------------

/** The two marks a state may draw. `loose` draws nothing. */
export type MarkedState = 'rule' | 'choice';

/** The colour of each mark. Redundant with the shape, never instead of it. */
export type LockMarkerColours = Readonly<Record<MarkedState, string>>;

/**
 * Which palette token each mark is drawn in. **The marks follow the theme.**
 *
 * `themes.ts` keeps `markSuccess` and `markBane` fixed across every palette, so
 * a meaning does not move when the page does. The lock marks are NOT in that
 * class, and the measurement that separates the two cases is the contrast of
 * each pair against itself. `affordance.test.ts` takes both readings.
 *
 *   * The success and bane marks sit at one lightness in every row, so they
 *     read as one shade in greyscale and hue is the whole of their colour
 *     separation. Move the hue and nothing of it is left.
 *   * The lock marks are separated by lightness, and they carry no convention
 *     from outside the app: nothing says the rules are slate. Their hue was
 *     therefore free, and it now takes the theme. The shape still carries the
 *     state, as the comment at the top of this file records.
 *
 * The two tokens below are the two a DERIVED palette pins by lightness as
 * well — `PALETTE_TARGETS` puts `line` on its rung and `ON_TRAY_TARGET` puts
 * `onTray` on its own — so a theme a player builds holds the same floors as the
 * six shipped rows. `accent` would not: it is the seed itself, unchanged, and a
 * dark seed cannot clear the tray.
 *
 * The roles read the right way round as well. A frame the rules hold is a
 * boundary the player may not cross, and `line` is the boundary token. Four
 * blocks the player put there are a readout over the table, and `onTray` is the
 * token for one.
 */
export const LOCK_MARKER_TOKEN: Readonly<Record<MarkedState, keyof InterfacePalette>> = {
  rule: 'line',
  choice: 'onTray',
};

/** The two mark colours one palette names. A lookup, and nothing else. */
export function lockMarkerColours(palette: InterfacePalette): LockMarkerColours {
  return { rule: palette[LOCK_MARKER_TOKEN.rule], choice: palette[LOCK_MARKER_TOKEN.choice] };
}

/**
 * How far each mark reaches past the die, as a multiple of the die radius.
 *
 * The cage stands off the die, because it is drawn around something the player
 * may not change. The blocks grip it, because they are the player's own hold.
 */
const MARKER_REACH: Readonly<Record<'rule' | 'choice', number>> = { rule: 1.45, choice: 1.22 };
/** The bar width of the closed frame, as a fraction of its half-extent. */
const FRAME_BAR = 0.2;
/** The side of one corner block, as a fraction of the half-extent. */
const CORNER_BLOCK = 0.5;

/** The name every mark carries, so a check can find one and name its die. */
export const LOCK_MARKER_NAME = 'clatter-lock-marker';

/** One flat quad as two triangles, wound counter-clockwise seen from +z. */
function quad(x0: number, y0: number, x1: number, y1: number): number[] {
  return [x0, y0, 0, x1, y0, 0, x1, y1, 0, x0, y0, 0, x1, y1, 0, x0, y1, 0];
}

/**
 * A closed square frame of half-extent 1: four bars that meet at the corners.
 * A ray cast outwards from the centre meets it at every angle.
 */
function frameQuads(): number[] {
  const inner = 1 - FRAME_BAR;
  return [
    ...quad(-1, inner, 1, 1),
    ...quad(-1, -1, 1, -inner),
    ...quad(-1, -inner, -inner, inner),
    ...quad(inner, -inner, 1, inner),
  ];
}

/**
 * Four blocks at the corners of a square of half-extent 1. A ray cast outwards
 * from the centre meets it near the diagonals only.
 */
function cornerQuads(): number[] {
  const near = 1 - CORNER_BLOCK;
  return [
    ...quad(near, near, 1, 1),
    ...quad(-1, near, -near, 1),
    ...quad(-1, -1, -near, -near),
    ...quad(near, -1, 1, -near),
  ];
}

/** The two shapes a marked state draws. `loose` draws nothing. */
const MARKER_SHAPE: Readonly<Record<'rule' | 'choice', () => number[]>> = {
  rule: frameQuads,
  choice: cornerQuads,
};

interface MarkerKit {
  readonly Mesh: new (geometry: ThreeObject3D, material: ThreeObject3D) => ThreeObject3D;
  readonly geometry: Readonly<Record<'rule' | 'choice', ThreeObject3D>>;
  readonly material: Readonly<Record<'rule' | 'choice', ThreeObject3D>>;
  readonly meshes: ThreeObject3D[];
}

/**
 * Two geometries and two materials, built once and shared by every mark, so a
 * redraw allocates nothing and `info.memory` does not climb with the clicks.
 */
async function buildKit(colours: LockMarkerColours): Promise<MarkerKit> {
  const { ThreeBufferAttribute, ThreeBufferGeometry, ThreeMesh, ThreeMeshBasicMaterial } =
    await import('./vendor/dice-tray.js');
  const build = <T>(
    make: (state: 'rule' | 'choice') => T,
  ): Readonly<Record<'rule' | 'choice', T>> =>
    Object.freeze({ rule: make('rule'), choice: make('choice') });
  return {
    Mesh: ThreeMesh,
    geometry: build((state) => {
      const geometry = new ThreeBufferGeometry();
      const points = MARKER_SHAPE[state]();
      geometry.setAttribute('position', new ThreeBufferAttribute(new Float32Array(points), 3));
      return geometry;
    }),
    // Unlit, so the mark keeps the exact colour it is given wherever a die
    // throws its shadow. A shaded mark would read as a fourth state.
    material: build((state) => new ThreeMeshBasicMaterial({ color: colours[state] })),
    meshes: [],
  };
}

/** The radius of one die in tray units, from its own geometry. */
function dieRadius(die: TrayDie): number {
  if (!die.geometry.boundingSphere) die.geometry.computeBoundingSphere();
  return (die.geometry.boundingSphere?.radius ?? 0) * die.scale.x;
}

/**
 * Draw one mark per die that is not loose. `states[i]` belongs to
 * `box.diceList[i]`, so the caller passes the pool in tray order.
 */
function drawMarkers(box: DiceBox, kit: MarkerKit, states: readonly LockState[]): void {
  for (const mesh of kit.meshes) box.scene.remove(mesh);
  kit.meshes.length = 0;
  for (const [index, state] of states.entries()) {
    const die = box.diceList[index];
    if (!die || state === 'loose') continue;
    const radius = dieRadius(die);
    const mesh = new kit.Mesh(kit.geometry[state], kit.material[state]);
    mesh.name = `${LOCK_MARKER_NAME}:${index}`;
    const reach = radius * MARKER_REACH[state];
    mesh.scale.set(reach, reach, 1);
    // At the height of the die itself, not on the desk. The camera looks down
    // from one point, so a shape lying on the desk projects away from the die
    // standing above it, and the further the die is from the middle of the tray
    // the wider that gap opens. Measured at 1440 px on 2026-08-09: a mark on
    // the desk sat clear of the die it belonged to. At the die's own height the
    // two are concentric by construction, at every place on the tray. The hole
    // in the mark is 1.16 die radii wide against a die radius of 1, so the mark
    // clears the die it frames.
    mesh.position.set(die.position.x, die.position.y, die.position.z);
    // The mark is an overlay, not a body. It throws no shadow and takes none.
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    box.scene.add(mesh);
    kit.meshes.push(mesh);
  }
  // **Draw the frame that shows them.** The library renders one last frame the
  // instant a throw finishes and then stops, and it renders nothing at all for
  // a click. A mark added or moved after that last frame therefore keeps the
  // world matrix the renderer gave it on the frame before, so the player sees
  // the marks of the throw before this one, standing where those dice stood.
  // Measured in the running application on 2026-08-09: a cage sat 450 world
  // units from the die it named. A raycast cannot see this defect, because a
  // raycast updates the matrix it reads.
  box.renderer.render(box.scene, box.camera);
}

/**
 * The affordance, once it is wired to a tray.
 *
 * `update` takes the pool as it now stands and redraws the marks, so a caller
 * that owns the pool — the application does, through `src/shell/state.ts` —
 * stays the one authority on it. `dispose` removes the listener and the marks.
 */
export interface AffordanceHandle {
  update(ordered: readonly Die[]): void;
  /**
   * Take the marks to another theme, in place.
   *
   * The two materials are shared by every mark, so this is two colour writes
   * and one frame. Nothing is thrown again and no mesh is rebuilt: the dice
   * stay where they lie, exactly as `paintPool` leaves them.
   */
  paint(palette: InterfacePalette): void;
  dispose(): void;
}

/**
 * Wire the affordance to a tray that already holds `ordered`.
 *
 * `ordered` is the list `throwPool` or `pushPool` returned, so index `i` of it
 * is `box.diceList[i]`. Every click is hit-tested against the dice themselves,
 * so a die the camera cannot see is a die the tray cannot reach — see `dieAt`.
 *
 * `onClick` is called after the pool changes, with the pool as it now stands.
 * A refused click reports the refusal and hands back the same pool.
 *
 * `palette` is the theme in force. It is read once here and again on every
 * `paint`, so the caller that owns the theme stays the one authority on it.
 */
export async function mountAffordance(
  box: DiceBox,
  ordered: readonly Die[],
  profile: PushProfile,
  palette: InterfacePalette,
  onClick: (dice: readonly Die[], clicked: Die, outcome: ClickOutcome) => void = () => {},
): Promise<AffordanceHandle> {
  const kit = await buildKit(lockMarkerColours(palette));
  let pool = ordered;
  const redraw = (): void =>
    drawMarkers(
      box,
      kit,
      pool.map((die) => lockState(die, profile)),
    );
  redraw();

  const listener = (event: MouseEvent): void => {
    const index = dieAt(box, event.clientX, event.clientY);
    const die = index === null ? undefined : pool[index];
    if (die === undefined) return;
    const outcome = clickOutcome(die, profile);
    pool = clickDie(pool, die.id, profile);
    redraw();
    onClick(pool, die, outcome);
  };
  box.container.addEventListener('click', listener);

  return {
    update(next: readonly Die[]): void {
      pool = next;
      redraw();
    },
    paint(next: InterfacePalette): void {
      const colours = lockMarkerColours(next);
      for (const state of ['rule', 'choice'] as const) {
        kit.material[state].color.set(colours[state]);
      }
      box.renderer.render(box.scene, box.camera);
    },
    dispose(): void {
      box.container.removeEventListener('click', listener);
      for (const mesh of kit.meshes) box.scene.remove(mesh);
      kit.meshes.length = 0;
      for (const state of ['rule', 'choice'] as const) {
        kit.geometry[state].dispose();
        kit.material[state].dispose();
      }
    },
  };
}

/**
 * Which die the camera meets first at a point on the screen, as an index into
 * `box.diceList`, or `null` where it meets none.
 *
 * **A die can be wholly buried.** Unit 3.5 measured one seed of forty where a
 * d6 showed no pixel of its own: 1,257 silhouette pixels all met another body
 * first. This function answers `null` for every point over such a die, because
 * the die in front of it is the frontmost body everywhere. The tray therefore
 * has no route to a buried die, by design and not by accident: a player who
 * cannot see a die cannot aim at it either, and a click that reached through
 * the heap would toggle a die the player never meant. The keyboard route
 * through the history matrix of Unit 2.2 is the route to it, and the pool never
 * depends on the tray for correctness.
 *
 * A recursive raycast may name a child of a die, so every node is mapped back
 * to the die that owns it. This is the route the colour check of Unit 3.3 uses.
 */
export function dieAt(box: DiceBox, clientX: number, clientY: number): number | null {
  const rect = box.container.getBoundingClientRect();
  box.raycaster.setFromCamera(
    {
      x: ((clientX - rect.left) / rect.width) * 2 - 1,
      y: -((clientY - rect.top) / rect.height) * 2 + 1,
    },
    box.camera,
  );
  const hit = box.raycaster.intersectObjects(box.diceList)[0];
  if (!hit) return null;
  const owner = new Map<ThreeObject3D, number>();
  for (const [index, die] of box.diceList.entries()) {
    die.traverse((node) => owner.set(node, index));
  }
  return owner.get(hit.object) ?? null;
}
