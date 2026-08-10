// Act out a `RollResult` on the tray.
//
// The rules core decides every value first. This module throws exactly those
// dice and lands exactly those values, and it decides nothing. It never reads a
// random source, so the tray cannot disagree with the log.
//
// The library takes one notation string and applies the values after `@` to the
// dice it spawns, in spawn order. It spawns grouped by face count, in the order
// the face counts first appear in the notation, so a pool given in any other
// order would land its values on the wrong dice. `trayOrder` is that order, and
// every caller reads a tray die through the index it returns.

import type { Die, Faces } from '../rules/die';
import { latestValue } from '../rules/die';
import type { RollResult } from '../rules/roll';
import type { DiceTheme } from '../theme/themes';
import { DIE_TYPE_COLOR } from './dice-colors';
import type { DiceBox } from './vendor/dice-tray.js';

/** The face counts the rules core uses, in the order the tray spawns them. */
const FACE_ORDER: readonly Faces[] = [6, 8, 10, 12];

export interface ThrowOptions {
  /**
   * Skip the tumble and land the dice at once.
   *
   * The caller reads `prefers-reduced-motion` through
   * `prefersReducedMotion()` in `src/tray/capability.ts` and passes the answer
   * here. This module reads no browser setting of its own.
   */
  readonly skipTumble?: boolean;
  /**
   * The body colour of each dice type — Unit 4.8.
   *
   * The dice axis is a theme choice, so the caller passes the row in force.
   * The Unit 3.3 table is the default, which is the `ash` row of
   * `src/theme/themes.ts`, so a caller that names no theme paints what this
   * module has always painted.
   */
  readonly colours?: DiceTheme;
}

/**
 * How far back the clock goes, in seconds of simulated time.
 *
 * The library decides every face before it draws anything: it simulates the
 * whole throw to rest, then puts the bodies back at the spawn state, swaps the
 * face labels so the settled orientation reads the value the rules core chose,
 * and replays the same fixed-step sequence for the player to watch. The replay
 * steps the world by a fixed `framerate` and takes as many steps per frame as
 * real time has passed. Winding its clock back therefore takes the same steps
 * in the same order, all in one frame, and lands on the same orientation. No
 * face can change, because nothing about the sequence changes.
 *
 * ponytail: one wind-back of 20 seconds is 1200 steps at the library's 1/60
 * step. The measured steps-to-rest for a settled twelve-die scene is 203, so
 * the margin is nearly six times over. A scene that needed more would tumble
 * for the rest of the way rather than fail. Wind the clock on every frame if a
 * later scene ever gets that long.
 */
const SKIP_TUMBLE_SECONDS = 20;

/**
 * Wind the library's animation clock back, so its next frame runs the whole
 * throw at once.
 *
 * `roll` and `reroll` both draw their first frame before they hand back a
 * promise, so `last_time` already holds a real time by the call below. The
 * field is internal to the vendored copy and the typings leave it opaque, so
 * it is narrowed here at the point of use.
 */
function skipTheTumble(box: DiceBox): void {
  const clock = box as unknown as { last_time: number };
  if (typeof clock.last_time !== 'number' || clock.last_time === 0) {
    throw new Error('skipTheTumble: the tray is not in the middle of a throw');
  }
  clock.last_time -= SKIP_TUMBLE_SECONDS * 1000;
}

/**
 * The order the tray holds the pool in: face counts ascending, and pool order
 * inside a face count. `box.diceList[i]` is the die at index `i` of this list.
 */
export function trayOrder(dice: readonly Die[]): readonly Die[] {
  return FACE_ORDER.flatMap((faces) => dice.filter((die) => die.faces === faces));
}

/**
 * The notation for one pool, with the decided values after `@`.
 *
 * A die with no value cannot be acted out, so it throws rather than letting the
 * library pick a face.
 */
export function poolNotation(dice: readonly Die[]): string {
  const ordered = trayOrder(dice);
  if (ordered.length === 0) throw new Error('poolNotation: the pool holds no dice');

  const groups = FACE_ORDER.map((faces) => ordered.filter((die) => die.faces === faces)).filter(
    (group) => group.length > 0,
  );
  const values = ordered.map((die) => {
    const value = latestValue(die);
    if (value === null) {
      throw new Error(`poolNotation: die ${die.id} carries no value to act out`);
    }
    return value;
  });
  return `${groups.map((group) => `${group.length}d${group[0]?.faces}`).join('+')}@${values.join(',')}`;
}

/**
 * Colour each die by its type.
 *
 * The library builds one material per face per die and shares only the face
 * textures between them, so a colour per die costs no extra texture. The
 * renderer multiplies this colour into the face texture, and the base is white,
 * so the die comes out the colour of its type with the numeral still black.
 */
function colorByType(
  box: DiceBox,
  ordered: readonly Die[],
  from = 0,
  colours: DiceTheme = DIE_TYPE_COLOR,
): void {
  for (const [step, die] of ordered.entries()) {
    const index = from + step;
    const mesh = box.diceList[index];
    if (!mesh) throw new Error(`throwPool: the tray holds no die at index ${index}`);
    for (const material of mesh.material) material.color.set(colours[die.type]);
  }
}

/**
 * Paint a pool already on the table — Unit 4.8.
 *
 * A change of the dice axis must reach the dice a player is looking at, and
 * neither throw is running at that moment. It repaints and draws one frame,
 * because the library draws a frame at the end of a throw and none at all in
 * between: without the frame the player keeps the colours of the throw before.
 * Unit 3.5 found the same defect on the lock marks.
 */
export function paintPool(box: DiceBox, ordered: readonly Die[], colours: DiceTheme): void {
  colorByType(box, ordered, 0, colours);
  box.renderer.render(box.scene, box.camera);
}

/**
 * Throw the newest generation of `result` and land every decided value.
 *
 * Returns the pool in tray order, so the caller can map a tray index back to a
 * die. Resolves once every die is at rest.
 */
export async function throwPool(
  box: DiceBox,
  result: RollResult,
  options: ThrowOptions = {},
): Promise<readonly Die[]> {
  const ordered = trayOrder(result.dice);
  // `roll` spawns every die before it returns its promise, so the dice exist by
  // the next line. Only the first frame of the throw draws them uncoloured.
  const settled = box.roll(poolNotation(ordered));
  colorByType(box, ordered, 0, options.colours);
  if (options.skipTumble) skipTheTumble(box);
  await settled;
  return ordered;
}

/**
 * What the tray needs of a push, and nothing else.
 *
 * `PushedRoll` from `src/rules/push.ts` satisfies this shape, so a caller hands
 * the core's own answer straight over. The cost, the generation and the stress
 * are the screen's business and the tray never reads one.
 */
export interface TrayPush {
  /** The whole pool after the push, including any die the push added. */
  readonly dice: readonly Die[];
  /** The dice that go back in the cup, by id. */
  readonly rerolled: readonly string[];
  /** The die the profile added before the re-throw, or `null`. */
  readonly stressAdded: string | null;
}

/** The value one die carries into the tray. A die with none cannot be acted out. */
function valueToActOut(die: Die): number {
  const value = latestValue(die);
  if (value === null) {
    throw new Error(`pushPool: die ${die.id} carries no value to act out`);
  }
  return value;
}

/**
 * Spawn the dice a push added, one at a time, and land each decided value.
 *
 * The library appends to `diceList`, so a die added here takes the next index
 * after every die already on the tray. `trayOrder` sorts by face count and
 * therefore does NOT describe the tray any more once a die is added, which is
 * why every caller reads the order this module hands back and never rebuilds it
 * from the pool.
 */
async function addDice(
  box: DiceBox,
  ordered: readonly Die[],
  added: readonly Die[],
  options: ThrowOptions,
): Promise<void> {
  for (const [step, die] of added.entries()) {
    const settled = box.add(`1d${die.faces}@${valueToActOut(die)}`);
    if (options.skipTumble) skipTheTumble(box);
    await settled;
    colorByType(box, [die], ordered.length + step, options.colours);
  }
}

/**
 * Throw the pushed subset again and land every decided value.
 *
 * `ordered` is the list `throwPool` returned, so index `i` of it is
 * `box.diceList[i]`. `pushed.rerolled` names the dice that go back in the cup,
 * and the tray names no others, so every kept die stays where it lies. The
 * return is the tray order carrying the new generation, with any die the push
 * added last, because that is where the library put it.
 *
 * **A profile may add a die before the re-throw.** The third preset raises
 * stress by one before every push and the core creates the stress die for it,
 * so the push hands over a die the tray never spawned. That die is spawned here
 * through `box.add` and it lands on the value the core decided, so it takes no
 * further throw. Unit 3.4 recorded this as the `box.add` follow-up.
 *
 * The rules core decides the subset, the added die and every value. This
 * function reads all three and adds nothing.
 */
export async function pushPool(
  box: DiceBox,
  ordered: readonly Die[],
  pushed: TrayPush,
  options: ThrowOptions = {},
): Promise<readonly Die[]> {
  const next = new Map(pushed.dice.map((die) => [die.id, die]));
  const trayIndex = new Map(ordered.map((die, index) => [die.id, index]));

  // Two independent answers to "which dice are new to the tray": the set the
  // tray does not hold, and the die the core says it added. They must agree. A
  // caller that handed over a stale order fails here by name rather than acting
  // out the wrong dice.
  const added = pushed.dice.filter((die) => !trayIndex.has(die.id));
  const byCore = pushed.stressAdded === null ? [] : [pushed.stressAdded];
  const byTray = added.map((die) => die.id);
  if (byTray.length !== byCore.length || byTray.some((id, at) => id !== byCore[at])) {
    throw new Error(
      `pushPool: the tray holds no die for ${byTray.join(', ') || 'nothing'}, ` +
        `and the push added ${byCore.join(', ') || 'nothing'}`,
    );
  }

  const spawned = new Set(byTray);
  const ids: number[] = [];
  const forced: number[] = [];
  for (const id of pushed.rerolled) {
    // A die the push added is thrown by `box.add` on the value the core chose,
    // so it is not thrown a second time here.
    if (spawned.has(id)) continue;
    const index = trayIndex.get(id);
    const die = next.get(id);
    if (index === undefined || die === undefined) {
      throw new Error(`pushPool: the push names ${id}, which the tray does not hold`);
    }
    ids.push(index);
    forced.push(valueToActOut(die));
  }
  if (ids.length === 0 && added.length === 0) {
    throw new Error('pushPool: the push names no dice to throw');
  }

  // The added die goes on the table before the re-throw, which is the order the
  // profile states: `addBeforeReroll`.
  await addDice(box, ordered, added, options);
  if (ids.length > 0) {
    const settled = box.reroll(ids, forced);
    if (options.skipTumble) skipTheTumble(box);
    await settled;
  }
  return [...ordered.map((die) => next.get(die.id) ?? die), ...added];
}
