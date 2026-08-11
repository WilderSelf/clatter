// The grain on a die body — Unit 4.12.
//
// The owner asked for no flat colour anywhere: every surface carries a light
// material grain. On a die that grain is composited into the face canvas the
// vendored library already builds, so it costs **no extra texture at all**.
//
// Read `createTextMaterial` in `vendor/dice-tray.js` before changing anything
// here. Four facts of that method decide every line below.
//
//   1. **The image loader is bypassed.** The library resolves a texture name
//      through its own table and then fetches a file. Unit 3.1 deleted those
//      files, so any name but `none` is a 404. `applyColorSet` takes the
//      resolved entry directly, so nothing is fetched and no network call is
//      made. Constraint 4.
//   2. **The composite is `multiply`.** Face index 0, the edge, is handed
//      `{ name: 'none' }` unless the composite is something other than
//      `source-over`. A `source-over` grain would silently skip that face.
//   3. **No bump grain.** For every shape but the d4 the library overwrites
//      `bumpMap` with the face normals two lines later, so a bump canvas is
//      wasted work. The colour grain is the whole effect.
//   4. **The name is stable.** `materials_cache` is keyed on a string holding
//      the texture name. A name that changed per call would defeat the cache
//      and multiply the texture count.
//
// The grain darkens and never lightens, because the face is filled white and
// `multiply` can only darken. `GRAIN_FLOOR` is the darkest a pixel can reach,
// derived from the octaves rather than written down twice, and the die body
// colour is multiplied in afterwards by the renderer. So a die reads as its own
// colour with a shallow grain over it and its hue never moves: a grey multiplier
// scales all three channels alike.
//
// Nothing here draws a random number from `Math.random`. The grain is the same
// on every run, which keeps a captured render comparable with the one before it.

/** The side of the grain canvas, in pixels. The library scales it to the face. */
export const GRAIN_SIZE = 96;

/**
 * The two octaves, each as a cell count and the depth it may darken by.
 *
 * The coarse octave is what an eye reads at arm's length. The fine one breaks
 * the coarse blobs up so the surface reads as a material and not as a stain.
 * A face canvas is 512 pixels across and a die is about 90 pixels on the screen,
 * so a feature smaller than about eight cells averages away to flat grey.
 */
export const GRAIN_OCTAVES: readonly (readonly [cells: number, depth: number])[] = [
  [14, 0.11],
  [34, 0.07],
];

/** The darkest a grain pixel can be, as a fraction of the face it multiplies. */
export const GRAIN_FLOOR = GRAIN_OCTAVES.reduce((held, [, depth]) => held * (1 - depth), 1);

/** The name the material cache is keyed on. One name, so the cache holds. */
export const GRAIN_NAME = 'grain';

/**
 * The material the die body takes with the grain.
 *
 * `wood` is a row of the library's own material table: `roughness: 0.9`,
 * `metalness: 0`. It takes the `MeshStandardMaterial` branch, which drops the
 * plastic sheen the flat-shaded Phong default draws at `shininess: 5`. It costs
 * no texture: the row is four numbers.
 */
export const GRAIN_MATERIAL = 'wood';

/** One octave: a small canvas of greys between `1 - depth` and 1. */
function octave(cells: number, depth: number, seed: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = cells;
  canvas.height = cells;
  const context = canvas.getContext('2d');
  if (context === null) throw new Error('dice grain: a 2D context was refused');
  const image = context.createImageData(cells, cells);
  let state = seed >>> 0;
  for (let at = 0; at < cells * cells; at += 1) {
    // A plain linear congruential step. It is not a source of randomness for
    // anything the rules read, so Constraint 7 does not reach it, and a fixed
    // seed is what makes two captures of the same die comparable.
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const level = Math.round(255 * (1 - depth * (state / 0x100000000)));
    image.data[at * 4] = level;
    image.data[at * 4 + 1] = level;
    image.data[at * 4 + 2] = level;
    image.data[at * 4 + 3] = 255;
  }
  context.putImageData(image, 0, 0);
  return canvas;
}

/**
 * The grain, as a canvas the library can hand to `drawImage`.
 *
 * Each octave is drawn scaled up with smoothing on, so the small canvas becomes
 * soft blobs rather than hard squares, and the octaves multiply into one another.
 */
export function diceGrainCanvas(size: number = GRAIN_SIZE): HTMLCanvasElement {
  const grain = document.createElement('canvas');
  grain.width = size;
  grain.height = size;
  const context = grain.getContext('2d');
  if (context === null) throw new Error('dice grain: a 2D context was refused');
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  let seed = 0x9e3779b9;
  for (const [cells, depth] of GRAIN_OCTAVES) {
    context.drawImage(octave(cells, depth, seed), 0, 0, size, size);
    // Every octave after the first darkens what is already there.
    context.globalCompositeOperation = 'multiply';
    seed = (seed + 0x6d2b79f5) >>> 0;
  }
  return grain;
}

/** The texture entry `applyColorSet` reads: a name, a composite and a canvas. */
export interface DiceGrain {
  readonly name: string;
  readonly composite: string;
  readonly texture: HTMLCanvasElement;
  readonly material: string;
}

/** Build the entry the vendored factory takes in place of a fetched image. */
export function diceGrain(): DiceGrain {
  return {
    name: GRAIN_NAME,
    composite: 'multiply',
    texture: diceGrainCanvas(),
    material: GRAIN_MATERIAL,
  };
}
