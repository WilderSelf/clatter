#!/usr/bin/env node
// The browser harness. One entrypoint, because it is the single command the
// owner allow-lists: `node scripts/browser.mjs*`. Every later unit that needs a
// driven browser calls this file. Do not add a second script.
//
// Exit 0 when every check passed, 1 when a check failed, 2 on a usage error.
//
// Usage:
//   node scripts/browser.mjs [--hardware] [--force-software] [--url <url>]
//                            [--sample-ms <n>] [--min-frames <n>]
//                            [--capture <path>] [--browser <path>]
//                            [--tray] [--pool] [--push] [--affordance] [--probe]
//                            [--share] [--share-controls] [--capture-later] [--offline]
//                            [--shell] [--capture-shell <dir>] [--table] [--sheet]
//                            [--a11y] [--no-webgl]
//                            [--sound-controls] [--overlay]
//
// `--table` starts and stops its own preview server, because it drives the
// built application. Build first, then run it alone:
//   npm run build && node scripts/browser.mjs --table \
//     --url http://localhost:4173/clatter/ --viewport 1440x900 \
//     --capture-before docs/design/0014-table-throw-1440.png \
//     --capture docs/design/0014-table-push-1440.png
//
// `--sheet` needs `--url` and starts its own preview server too. It is the
// browser half of Units 4.1, 4.2 and 4.3: it drives the rule set, the artifact
// curve, the override panel and the saved pools behind the one disclosure,
// proves that a change of rules clears the table, reloads the page to prove
// every choice survives, and measures the panels at 360 px. The saved pools are
// saved, recalled, reordered and deleted with real presses, every refusal is
// reached through the interface, and the list is walked with real Tab and Enter
// presses. `--capture-shell <dir>` writes six frames.
// Build first, then run it alone:
//   npm run build && node scripts/browser.mjs --sheet \
//     --url http://localhost:4173/clatter/ --capture-shell docs/design
//
// `--history` needs `--url` over a preview server, because it drives the BUILT
// bundle. It is the browser half of Units 4.4, 4.5, 4.6 and 4.7: it writes rolls
// and reads them back out of IndexedDB through its own connection, walks the
// summary, the record and the charts with real key presses, judges the
// transposed matrix against the stored entry, intercepts the file the export
// button hands the browser and compares it byte for byte against
// `exportCsvInChunks` run in node, drives that file back in through a real file
// picker, refuses an oversized file while counting the reads of it, and judges
// every chart value, every bar length, every glyph shape and every chart colour
// against the record `summariseLog` returns in node.
// `--capture-shell <dir>` writes six frames.
// Build first, then run it alone:
//   npm run build && node scripts/browser.mjs --history \
//     --url http://localhost:4173/clatter/ --capture-shell docs/design
//
// `--note-chars <n>` pads the note of every fill roll in `--log-csv`. Every row
// of the export repeats the note, so the note length is the field that moves the
// file size by the row count. It is how the two import-cap checks are shown to
// fail: the room a full export leaves is a few characters a row.
//
// `--a11y` needs `--url` over a preview server and starts its own, because it
// drives the BUILT application. It is the accessibility gate of Unit 4.11: one
// keyboard-only journey from an empty pool to a pushed result, at each of the
// two widths the design is drawn at, with real Tab, arrow, Enter and Escape
// presses and no pointer at all. It also drives the disclosure sheet off both
// ends to prove the focus cannot leave it, and it injects the pinned axe-core
// package into the page and audits two states of the laid-out screen.
//
// It REFUSES to run without a declaration of what the machine can draw:
// `--hardware` for a graphics card, `--no-webgl` for a machine without one. A
// run that reads no renderer would otherwise skip its 3D checks and exit 0
// while judging nothing. Build first, then run it alone:
//   npm run build && node scripts/browser.mjs --a11y --no-webgl \
//     --url http://localhost:4173/clatter/
//
// `--shell` starts and stops its own preview server, for the same reason
// `--offline` does. Build first, then run it alone:
//   npm run build && node scripts/browser.mjs --shell \
//     --url http://localhost:4173/clatter/ --capture-shell docs/design
//
// `--offline` starts and stops its own preview server, because it has to prove
// the server stopped. Build first, then run it alone:
//   npm run build && node scripts/browser.mjs --offline \
//     --url http://localhost:4173/clatter/
//                            [--context-loss] [--reduced-motion] [--sound]
//                            [--log-store] [--log-csv] [--settings-store] [--faults]
//                            [--long-task-ms <n>] [--quota-kb <n>] [--note-chars <n>]
//                            [--capture-before <path>]
//                            [--offset-kept <n>] [--viewport <w>x<h>[@<dpr>]]
//                            [--price-ratios <a,b,c>] [--resize-to <w>x<h>]
//                            [--throw-seed <n>] [--budgets <path>]
//
// `--throw-seed` pins the seed the vendored tray throws from. Every run prints
// the seed it used. A run that names no seed draws a fresh one, because a fixed
// default would stop sampling new throws.
//
// **The seed pins the tray and not the rules.** It replaces `Math.random`,
// which is what the vendored library draws its throw vectors from. Constraint 7
// makes the rules core draw from `crypto.getRandomValues` instead, and the seed
// does not reach that. A mode that builds its own fixture — `--tray`, `--pool`,
// `--push`, `--affordance` — therefore repeats exactly from its seed. `--table`
// drives the application, whose pool the rules core rolls, so two runs at one
// seed land the same throw vectors over different values. Measured on
// 2026-08-10: two `--table` runs at seed 2107814439 read 20 and 24 dice the
// player may release. Name a seed to repeat the tray, not to repeat the roll.
//
// Two run modes:
//   ordinary   the default. It reports the renderer and does not judge it.
//   hardware   `--hardware`. It fails when the renderer names a software
//              rasteriser, and it fails when the renderer cannot be read.
//              Unknown is not the same as good. Every timing number and every
//              renderer claim must come from a hardware run.
//
// `--tray` needs `--url`, and the url must be a Vite dev server, because the
// scene module is imported from source. It builds the fixed twelve-die scene,
// reads the render counters off `renderer.info` and judges them against
// `budgets.json`.
//
// `--pool` needs `--url` for the same reason. It asks the rules core for a roll
// of one die per type per face count, acts it out through `src/tray/throw.ts`,
// and reads the face pointing up off each body quaternion.
//
// `--affordance` needs `--url`. It is the tray half of Unit 3.5. It throws a
// fixture where all three lock states are guaranteed, reads the shape drawn
// around each die off the geometry, reads the luminance of that shape off the
// frame, and then clicks every die on the tray through the driver.
//
// `--probe` needs `--url`. It runs the startup capability probe of Unit 3.7 and
// reports the four readings and the decision. A run inside the sandbox is a
// real case, not a broken one: there is no WebGL context there, and the probe
// must answer with a fall to flat rather than throw.
//
// `--context-loss` needs `--url`. It mounts the tray with the settings store
// wired to the fall-to-flat callback, forces a loss through
// `WEBGL_lose_context`, and asserts that the handler fired and that the stored
// flag moved from false to true.
//
// `--sound` needs `--url`. It throws the fixed twelve-die scene twice, once
// with sound off and once with it on, and judges the sound engine against the
// collisions the physics world reported. It counts those collisions itself, so
// no number the engine writes is its own denominator.
//
// `--sound-controls` needs `--url` over a preview server, because it drives the
// BUILT application. It is the interface half of Unit 3.6: the player turns
// sound on through the real control with real key presses, sets the level with
// real arrow presses, and rolls. It counts the voices through the browser's own
// `AudioBufferSourceNode.start` and reads the level off the `GainNode` the
// engine built, so no number the engine writes is its own denominator. Build
// first, then run it alone:
//   npm run build && node scripts/browser.mjs --sound-controls \
//     --url http://localhost:4173/clatter/ --hardware --capture-shell docs/design
//
// `--overlay` needs `--url` over a preview server too. It is the overlay half
// of Unit 3.8: it turns the performance overlay on with real key presses,
// throws, and judges each of the four figures against something the overlay did
// not write. It injects a per-frame stall and reads the percentiles before and
// after it, and it watches the drawn positions of the dice itself to bound
// throw-to-first-motion. **It reads no budget and judges no machine.** Build
// first, then run it alone:
//   npm run build && node scripts/browser.mjs --overlay \
//     --url http://localhost:4173/clatter/ --hardware --capture-shell docs/design
//
// `--reduced-motion` needs `--url`. It throws the same pool twice from one
// seed, once tumbling and once with the tumble skipped, and asserts the faces
// are the same in both.
//
// `--push` needs `--url` too. It throws a fixture where locking is guaranteed,
// pushes it through `src/rules/push.ts`, and asserts that every kept die holds
// its screen-space centroid while the rest come back asleep and inside the tray
// walls. `--offset-kept <n>` moves kept die `n` by 3 px, so that assertion can
// be shown to fail.
//
// `--log-store` needs `--url`. It is the storage half of Unit 4.4. It fills the
// 5,000-roll ring buffer through `src/log/store.ts`, watches the main thread
// while it does, then writes on top of the full buffer from **two** connections
// at once and asserts the survivors are the newest 5,000 of what both wrote. It
// also drives the flush on `visibilitychange` and the four ways a browser
// refuses: a refused database, a blocked upgrade, a `versionchange` from
// another tab, and an abort that is not a quota error.
// `--long-task-ms <n>` blocks the main thread for n ms inside the fill, so the
// long-task check can be shown to fail.
// `--quota-kb <n>` launches the browser with that storage limit and runs the
// quota check alone, because a full buffer does not fit under it. The limit is
// the browser's own testing switch, so `QuotaExceededError` is raised by the
// browser and never simulated.
//
// `--faults` starts and stops its own preview server. It is the browser half of
// Unit 4.10 and it drives every error surface to its own failure: a browser
// that keeps no store and no database, a browser that draws no 3D context, the
// 3D chunk refused at the network layer, a log another connection deleted, and
// a malformed file through the real picker. Each recovery route is then TAKEN
// and the state is read after it. Build first, then run it alone:
//   npm run build && node scripts/browser.mjs --faults \
//     --url http://localhost:4173/clatter/
// Add `--quota-kb <n>` to judge the full store instead, which needs the browser
// launched with its own storage limit. The two runs cover the declared faults
// between them and each one names what it left to the other.
//
// `--log-csv` needs `--url`. It is the browser half of Units 4.5 and 4.6. It
// fills the 5,000-roll ring buffer, reads it back, and exports the whole log
// through `exportCsvInChunks`, watched by the same two instruments `--log-store`
// uses. It reports the rows, the bytes, the wall time and the longest task, and
// it prices the one-task `exportCsv` beside it on the same buffer. It then runs
// the round trip through the real store: store, export, import, store, and
// compares every field of every roll. The three decisions the plan settled are
// asserted through that store as well: an import replaces the log, a duplicate
// `roll_id` is rejected, and the size cap refuses a file before it is parsed.
// `--long-task-ms <n>` blocks the main thread inside the export, so the
// long-task check can be shown to fail.
//
// `--share` needs `--url`. It is the pixel half of Unit 4.9. It throws a legal
// pool, makes a card of it in every one of the six interface palettes through
// `src/tray/capture.ts` and `src/shell/share-card.ts`, and measures the
// luminance variance and the count of distinct pixel values over the decoded
// JPEG **outside the panel**, because a panel of text carries both by itself.
// It reads every run's ink and the panel ground off the drawn pixels, and it
// measures every run against the box it had to fit. `--capture <path>` writes
// one card, `--capture-shell <dir>` writes all six. `--capture-later` copies
// the canvas in a later task than the one that drew it, which is the
// black-frame defect, so both measures can be shown to fail.
//
// `--share-controls` needs `--url` over a **preview** server, because it drives
// the BUILT application. It is the interface half of Unit 4.9: it throws a pool
// on the table, opens the one disclosure, makes a card the way a player does,
// and judges the three things only a real browser answers. It compares the file
// the download button hands the browser BYTE FOR BYTE against the data URL the
// preview carries, walks every control with real Tab presses, and reads the
// browser's own `navigator.canShare` for this very file. Where the browser
// offers no share target the send control must be absent, and the check that
// would judge the call prints NOT JUDGED and counts in `skipped=`.
// `--capture-shell <dir>` writes one frame of the panel.
// Build first, then run it alone:
//   npm run build && node scripts/browser.mjs --share-controls \
//     --url http://localhost:4173/clatter/ --capture-shell docs/design
//
// `--settings-store` needs `--url`. It is the `localStorage` half of Unit 4.1.
// It drives `src/settings/local-store.ts` against the page's own storage: a
// real round trip, six unusable stored values, a store the browser refuses
// outright, and a store filled until the browser raises `QuotaExceededError`.
//
// `--offline` needs `--url`, and it is the one mode whose url must be a
// **preview** server over `dist/`, not the dev server. A dev server registers
// no service worker, so there is nothing to measure there. It visits once,
// waits for the worker to take control, turns off the network and puts the
// HTTP cache into bypass at the driver, loads the page again, and then judges
// what rendered: the named parts of the screen, the lazy 3D chunk behind the
// tray button, and the web manifest with its icons.
//
// `--shell` needs `--url`, and the url must be a preview server over the built
// output. It is the browser half of Unit 2.1. It builds the drawn pool by
// pressing the plus ends, walks the screen with real Tab and arrow presses, and
// compares the visits against the list section 6 of
// `docs/design/0002-screen-design.md` states. `--capture-shell <dir>` writes one
// PNG per width, for comparison against the renders beside
// `docs/design/0013-screen-final.html`.
//
// `--table` needs `--url`, and the url must be a preview server over the built
// output. It is the 3D tray inside the application, which is what Units 3.4,
// 3.5 and 3.7 were building towards. It presses the tiles, presses Roll until
// the push is live, presses every die with the keyboard and with the pointer,
// and presses Push. It reads the tray the application mounted through
// `window.__clatterTable`, which `src/shell/table.tsx` documents as the one
// seam an outside instrument has into a WebGL scene.
//
// **The oracle is the screen's own reading of the rules core.** Every die cell
// carries an accessible name that states the face the core decided, and each
// up-face is read off the physics body and compared against it, so the 3D layer
// is judged against the rules and never against itself. A machine that cannot
// draw the table prints every check as NOT JUDGED and counts them in skipped=.
//
// `--theme-id <id>` names the theme the run is drawn in. It belongs to `--table`
// and it exists for the captures: `--capture` then writes the table in a row a
// player can choose rather than in the default row alone. The run picks the row
// through the panel and prints the tray surface the engine resolved.
//
// The sandbox hides /dev/dri, so a sandboxed run gets no WebGL context at all
// and a hardware run inside the sandbox fails by design. Run a hardware run
// through the `node scripts/browser.mjs*` sandbox exclusion.

import { register } from 'node:module';
import { spawn } from 'node:child_process';
import { randomInt } from 'node:crypto';
import { writeFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openPage, DEFAULT_BROWSER_PATH } from './browser-driver.mjs';
import { readBudget } from './check-bundle-size.mjs';
import { mulberry32 } from './perf.mjs';

// ---------------------------------------------------------------------------
// Renderer classification
// ---------------------------------------------------------------------------

// Known software rasterisers. A name that matches one of these is not hardware,
// whatever else it says.
const SOFTWARE_RENDERER_PATTERNS = [
  /llvmpipe/i, // Mesa, Gallium software path
  /softpipe/i, // Mesa, reference software path
  /swrast/i, // Mesa, old software path
  /lavapipe/i, // Mesa, software Vulkan
  /mesa offscreen/i, // Mesa, OSMesa
  /swiftshader/i, // Google, used by headless chromium
  /microsoft basic render/i, // Windows fallback adapter
  /software (rasteri[sz]er|render)/i, // generic self-description, including Apple's
  /generic renderer/i, // Apple software fallback
];

/**
 * Judge a renderer name. `mesa` alone is not on the list, because a hardware
 * Mesa driver reports the card, for example
 * "AMD Radeon RX 6700 XT (radeonsi, navi22, ACO, DRM 3.64, ...)".
 *
 * @param {unknown} name
 * @returns {{ kind: 'hardware'|'software'|'unreadable', matched?: string }}
 */
export function classifyRenderer(name) {
  if (typeof name !== 'string' || name.trim() === '') return { kind: 'unreadable' };
  for (const pattern of SOFTWARE_RENDERER_PATTERNS) {
    if (pattern.test(name)) return { kind: 'software', matched: String(pattern) };
  }
  return { kind: 'hardware' };
}

// ---------------------------------------------------------------------------
// The three shared helpers. Units 3.3, 3.4 and 4.9 read the tray through these.
//
// The first two run inside the page, because that is where the physics bodies
// live. They are self-contained on purpose: `installHelpers` copies their
// source into the page, so they may not close over anything in this module.
// ---------------------------------------------------------------------------

/**
 * Project a body position through a camera matrix to a screen-space centroid,
 * in CSS pixels with y running down. Unit 3.4 asserts that a kept die moves
 * less than 1 px between generations.
 *
 * `viewProjection` is 16 numbers, column-major, as three.js stores a matrix:
 * `camera.projectionMatrix * camera.matrixWorldInverse`.
 * `viewport` is the canvas bounding rectangle.
 */
export function readDieCentroid({ position, viewProjection, viewport }) {
  const m = viewProjection;
  const [x, y, z] = position;
  const clip = [0, 1, 2, 3].map(
    (row) => m[row] * x + m[row + 4] * y + m[row + 8] * z + m[row + 12],
  );
  const w = clip[3];
  if (!w) throw new Error('readDieCentroid: the point is on the camera plane');
  return {
    x: viewport.x + (clip[0] / w + 1) * 0.5 * viewport.width,
    y: viewport.y + (1 - clip[1] / w) * 0.5 * viewport.height,
  };
}

/**
 * Read the up-face from a body quaternion. Unit 3.3 asserts that the face the
 * physics settled on equals the value the rules core decided.
 *
 * `quaternion` is [x, y, z, w], as cannon-es stores one. `faceNormals` pairs a
 * face value with the body-space outward normal of that face.
 */
export function readUpFace({ quaternion, faceNormals }) {
  const [qx, qy, qz, qw] = quaternion;
  let best = null;
  for (const face of faceNormals) {
    const [vx, vy, vz] = face.normal;
    // v' = q v q*, expanded so the helper needs no vector library.
    const tx = 2 * (qy * vz - qz * vy);
    const ty = 2 * (qz * vx - qx * vz);
    const tz = 2 * (qx * vy - qy * vx);
    const up = vy + qw * ty + (qz * tx - qx * tz);
    if (!best || up > best.up) best = { value: face.value, up };
  }
  if (!best) throw new Error('readUpFace: faceNormals is empty');
  return best;
}

/**
 * What a frame holds, over the bytes of a decoded image.
 *
 * Unit 4.9 asks two questions of a share card, and neither one asks what the
 * picture is of. A black frame, or any other frame the browser cleared, is one
 * colour: its luminance variance is zero and it holds one distinct value. Both
 * measures are read off the decoded JPEG, so they cover the encode as well.
 *
 * `pixels` is four bytes per pixel, as `ImageData.data` gives them. Luminance
 * is the Rec. 709 luma of the sRGB bytes, on the same 0 to 255 scale, so the
 * variance is in luma levels squared and a standard deviation reads as a number
 * of levels. The variance is taken in two passes, so no cancellation between
 * two large sums can hide a small spread.
 *
 * **`region` is what makes both measures still able to fail once a summary is
 * drawn on the card.** Unit 4.9 lays an opaque panel of text over the frame,
 * and that panel alone carries variance and thousands of distinct values. A
 * measure over the whole card would therefore pass on a cleared drawing buffer,
 * which is exactly the defect the two measures exist to catch. Passing
 * `{ width, exclude }` counts only the pixels OUTSIDE the panel, which is the
 * photograph. `pixels` is then the counted denominator of that region.
 */
export function measureFrame(pixels, region = null) {
  const luma = (i) => 0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2];
  const total = Math.floor(pixels.length / 4);
  if (total < 1) throw new Error('measureFrame: the image holds no pixels');
  let inside = () => true;
  if (region !== null) {
    const { width, exclude } = region;
    if (!Number.isInteger(width) || width < 1) {
      throw new Error(`measureFrame: a region needs a row width, and it was given ${width}`);
    }
    const left = Math.floor(exclude.x);
    const top = Math.floor(exclude.y);
    const right = Math.ceil(exclude.x + exclude.w);
    const bottom = Math.ceil(exclude.y + exclude.h);
    inside = (i) => {
      const at = i / 4;
      const x = at % width;
      const y = (at - x) / width;
      return !(x >= left && x < right && y >= top && y < bottom);
    };
  }
  const distinct = new Set();
  let count = 0;
  let sum = 0;
  for (let i = 0; i < total * 4; i += 4) {
    if (!inside(i)) continue;
    count += 1;
    sum += luma(i);
    // One value per pixel, as a packed sRGB triple. Alpha is left out: a JPEG
    // carries none, and a channel that is 255 everywhere would add nothing.
    distinct.add((pixels[i] << 16) | (pixels[i + 1] << 8) | pixels[i + 2]);
  }
  if (count < 1) throw new Error('measureFrame: the region holds no pixels');
  const mean = sum / count;
  let squares = 0;
  for (let i = 0; i < total * 4; i += 4) {
    if (!inside(i)) continue;
    const away = luma(i) - mean;
    squares += away * away;
  }
  return { pixels: count, mean, variance: squares / count, distinct: distinct.size };
}

/** Copy the page-side helpers into the page. Call once per page. */
export async function installHelpers(page) {
  await page.evaluate(
    `window.__clatter = { readDieCentroid: ${readDieCentroid}, readUpFace: ${readUpFace}, ` +
      `measureFrame: ${measureFrame} };`,
  );
}

// The start-of-frame markers. They are the segments that declare the image
// size. 0xc4, 0xc8 and 0xcc sit in the same range and are a Huffman table, a
// JPEG extension and an arithmetic-coding table, none of which carry a size.
const JPEG_SOF_MARKERS = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
]);

/**
 * Read a JPEG's own header: is it one, and what size does it declare?
 *
 * A capture that failed leaves a file the file system is happy with. An empty
 * buffer, a PNG under a `.jpg` name and a half-written file all have to fail
 * here, and each one fails on a different clause: the opening marker, the
 * end-of-image marker at the tail, or the walk to the frame header.
 *
 * @param {Uint8Array} bytes
 * @returns {{ok: true, width: number, height: number, marker: string}
 *          |{ok: false, reason: string}}
 */
export function readJpeg(bytes) {
  const hex = (from, to) => Buffer.from(bytes.subarray(from, to)).toString('hex');
  if (bytes.length < 4) {
    return { ok: false, reason: `${bytes.length} bytes is too short to hold a JPEG at all` };
  }
  if (!(bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)) {
    return { ok: false, reason: `it opens ${hex(0, 3)} and a JPEG opens ffd8ff` };
  }
  if (!(bytes[bytes.length - 2] === 0xff && bytes[bytes.length - 1] === 0xd9)) {
    return {
      ok: false,
      reason:
        `it ends ${hex(bytes.length - 2, bytes.length)} and a whole JPEG ends with the ` +
        `ffd9 end-of-image marker, so this file is truncated`,
    };
  }
  let at = 2;
  while (at + 3 < bytes.length) {
    if (bytes[at] !== 0xff) {
      return { ok: false, reason: `byte ${at} reads ${hex(at, at + 1)} where a marker must start` };
    }
    // A run of 0xff before a marker is padding and is allowed.
    let marker = bytes[at + 1];
    while (marker === 0xff && at + 2 < bytes.length) {
      at += 1;
      marker = bytes[at + 1];
    }
    // Markers that carry no length: restart, start of image, and a temporary.
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      at += 2;
      continue;
    }
    const length = (bytes[at + 2] << 8) | bytes[at + 3];
    if (length < 2) {
      return { ok: false, reason: `the segment at byte ${at} declares a length of ${length}` };
    }
    if (JPEG_SOF_MARKERS.has(marker)) {
      if (at + 9 > bytes.length) {
        return {
          ok: false,
          reason: `the frame header at byte ${at} runs past the end of the file`,
        };
      }
      return {
        ok: true,
        marker: `ff${marker.toString(16)}`,
        height: (bytes[at + 5] << 8) | bytes[at + 6],
        width: (bytes[at + 7] << 8) | bytes[at + 8],
      };
    }
    at += 2 + length;
  }
  return { ok: false, reason: 'it carries no frame header, so it declares no size' };
}

/**
 * Capture the canvas. Unit 4.9 draws one fresh frame and copies it in the same
 * task, so the share card cannot capture a cleared buffer.
 *
 * @returns {Promise<Buffer>} the PNG bytes
 */
export async function captureCanvas(page, selector = 'canvas') {
  const element = await page.$(selector);
  if (!element) throw new Error(`captureCanvas: no element matches ${selector}`);
  return Buffer.from(await element.screenshot());
}

// ---------------------------------------------------------------------------
// Page-side reads
// ---------------------------------------------------------------------------

/** Read UNMASKED_RENDERER_WEBGL, or null when no context or no extension. */
async function readRenderer(page) {
  return page.evaluate(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return { renderer: null, reason: 'no WebGL context' };
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (!ext) return { renderer: null, reason: 'no WEBGL_debug_renderer_info extension' };
    return { renderer: gl.getParameter(ext.UNMASKED_RENDERER_WEBGL), reason: null };
  });
}

/** Count animation frames over a window, so a short sample cannot pass as one. */
async function sampleFrameCount(page, sampleMs) {
  return page.evaluate((ms) => {
    return new Promise((resolve) => {
      const start = performance.now();
      let frames = 0;
      const step = (now) => {
        frames += 1;
        if (now - start < ms) requestAnimationFrame(step);
        else resolve(frames);
      };
      requestAnimationFrame(step);
    });
  }, sampleMs);
}

// ---------------------------------------------------------------------------
// The synthetic scene
//
// There is no 3D tray yet, so the two page-side helpers have nothing real to
// read. The scene below gives them something, and the self-test compares their
// answers against expectations derived by hand in this file. A helper proven
// against a synthetic scene is honest. One that has never run is a trap for
// Unit 3.3.
// ---------------------------------------------------------------------------

const SCENE_PAGE = `<!doctype html><meta charset="utf-8"><title>scene</title>
<style>html,body{margin:0}canvas{display:block}</style>
<canvas id="tray" width="800" height="600"></canvas>`;

// A 90-degree perspective with a square aspect, near 1, far 100, column-major.
// tan(45 degrees) is 1, so the focal term is 1 and the arithmetic below is exact.
const VIEW_PROJECTION = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -101 / 99, -1, 0, 0, -200 / 99, 0];
const VIEWPORT = { x: 0, y: 0, width: 800, height: 600 };

// Expected screen positions, derived by hand from the pinhole relation
// ndc = (x / -z, y / -z), then x_px = (ndc.x + 1) / 2 * 800 and
// y_px = (1 - ndc.y) / 2 * 600. The helper reaches them through a full 4x4
// multiply, so the two routes are independent.
const CENTROID_CASES = [
  { id: 'centre', position: [0, 0, -2], expect: { x: 400, y: 300 } },
  { id: 'right-edge', position: [1, 0, -1], expect: { x: 800, y: 300 } },
  { id: 'below', position: [0, -0.5, -1], expect: { x: 400, y: 450 } },
  { id: 'upper-left', position: [-2, 1, -4], expect: { x: 200, y: 225 } },
];

// A six-sided die. Opposite faces total seven.
const D6_FACE_NORMALS = [
  { value: 1, normal: [0, 0, -1] },
  { value: 2, normal: [0, -1, 0] },
  { value: 3, normal: [1, 0, 0] },
  { value: 4, normal: [-1, 0, 0] },
  { value: 5, normal: [0, 1, 0] },
  { value: 6, normal: [0, 0, 1] },
];

const HALF = Math.SQRT1_2;

// Expected up-faces, derived by hand from the rotation each quaternion names.
// A rotation of +90 degrees about x sends (x, y, z) to (x, -z, y), so the face
// that ends up pointing at +y is the one that started at -z, which is the 1.
const UP_FACE_CASES = [
  { id: 'identity', quaternion: [0, 0, 0, 1], expect: 5 },
  { id: 'x+90', quaternion: [HALF, 0, 0, HALF], expect: 1 },
  { id: 'x-90', quaternion: [-HALF, 0, 0, HALF], expect: 6 },
  { id: 'z+90', quaternion: [0, 0, HALF, HALF], expect: 3 },
  { id: 'z+180', quaternion: [0, 0, 1, 0], expect: 2 },
];

async function buildScene(page) {
  await page.setContent(SCENE_PAGE);
  await installHelpers(page);
  await page.evaluate(
    (scene) => {
      window.__scene = scene;
    },
    { viewProjection: VIEW_PROJECTION, viewport: VIEWPORT, faceNormals: D6_FACE_NORMALS },
  );
}

/** Paint the canvas so a capture of it cannot be mistaken for a blank one. */
async function paintCanvas(page, painted) {
  await page.evaluate((fill) => {
    const context = document.getElementById('tray').getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, 800, 600);
    if (fill) {
      context.fillStyle = '#101820';
      context.fillRect(0, 0, 400, 600);
      context.fillStyle = '#c8402a';
      context.beginPath();
      context.arc(600, 300, 120, 0, Math.PI * 2);
      context.fill();
    }
  }, painted);
}

// ---------------------------------------------------------------------------
// The self-tests. One per helper, each with a counted denominator.
// ---------------------------------------------------------------------------

async function selfTestCentroid(page, checks) {
  const got = await page.evaluate((cases) => {
    const scene = window.__scene;
    return cases.map((c) =>
      window.__clatter.readDieCentroid({
        position: c.position,
        viewProjection: scene.viewProjection,
        viewport: scene.viewport,
      }),
    );
  }, CENTROID_CASES);

  const failures = [];
  for (const [index, expected] of CENTROID_CASES.entries()) {
    const actual = got[index];
    const dx = Math.abs(actual.x - expected.expect.x);
    const dy = Math.abs(actual.y - expected.expect.y);
    if (dx > 1e-6 || dy > 1e-6) {
      failures.push(
        `${expected.id} expected (${expected.expect.x}, ${expected.expect.y}) got (${actual.x}, ${actual.y})`,
      );
    }
  }
  checks.push({
    name: 'helper.readDieCentroid',
    ok: failures.length === 0 && got.length === CENTROID_CASES.length,
    detail: `compared=${got.length} of ${CENTROID_CASES.length}${failures.length ? ` failures: ${failures.join('; ')}` : ''}`,
  });
}

async function selfTestUpFace(page, checks) {
  const got = await page.evaluate((cases) => {
    const scene = window.__scene;
    return cases.map(
      (c) =>
        window.__clatter.readUpFace({ quaternion: c.quaternion, faceNormals: scene.faceNormals })
          .value,
    );
  }, UP_FACE_CASES);

  const failures = [];
  for (const [index, expected] of UP_FACE_CASES.entries()) {
    if (got[index] !== expected.expect) {
      failures.push(`${expected.id} expected ${expected.expect} got ${got[index]}`);
    }
  }
  checks.push({
    name: 'helper.readUpFace',
    ok: failures.length === 0 && got.length === UP_FACE_CASES.length,
    detail: `compared=${got.length} of ${UP_FACE_CASES.length}${failures.length ? ` failures: ${failures.join('; ')}` : ''}`,
  });
}

async function selfTestCapture(page, checks, capturePath) {
  await paintCanvas(page, false);
  const blank = await captureCanvas(page, '#tray');
  await paintCanvas(page, true);
  const painted = await captureCanvas(page, '#tray');
  if (capturePath) writeFileSync(capturePath, painted);

  const isPng = painted.subarray(0, 4).toString('hex') === '89504e47';
  const differs = !blank.equals(painted);
  checks.push({
    name: 'helper.captureCanvas',
    ok: isPng && differs && painted.length > 100,
    detail: `png=${isPng} painted_bytes=${painted.length} blank_bytes=${blank.length} differs=${differs}`,
  });
}

// ---------------------------------------------------------------------------
// The tray scene
//
// One fixed scene, owned here rather than by a caller, so the recorded render
// counters keep meaning something. Twelve dice over all four face counts the
// rules core uses, with a predetermined value each. A later unit that adds an
// object to the scene moves these counters, which is the point of the budget.
// ---------------------------------------------------------------------------

const TWELVE_DIE_NOTATION = '3d6+3d8+3d10+3d12@6,1,3,8,2,5,10,4,7,12,6,9';
const TWELVE_DIE_COUNT = 12;

const COUNTER_KEYS = [
  ['draw_calls', 'calls'],
  ['triangles', 'triangles'],
  ['textures', 'textures'],
];

/**
 * Build the scene through the module the application uses, and throw the pool.
 *
 * A null notation mounts the tray and throws nothing, which is what the pool
 * mode needs: it throws a `RollResult` through `src/tray/throw.ts` instead.
 */
async function mountTrayScene(page, pageUrl, notation, config = null, settingsUrl = null) {
  const moduleUrl = new URL('src/tray/scene.ts', pageUrl).href;
  return page.evaluate(
    async ({ moduleUrl, notation, config, settingsUrl }) => {
      document.body.style.margin = '0';
      const previous = document.getElementById('clatter-harness-tray');
      if (previous) previous.remove();
      const container = document.createElement('div');
      container.id = 'clatter-harness-tray';
      container.style.cssText = 'position:fixed;left:0;top:0;right:0;bottom:0';
      document.body.appendChild(container);

      const scene = await import(moduleUrl);
      const options = config ? { config } : {};
      if (settingsUrl) {
        // The application's own wiring: a lost context records the permanent
        // fall through the settings store. The tray module writes nothing
        // itself, so this callback is where the two halves meet.
        const settings = await import(settingsUrl);
        window.__clatterSettings = settings;
        window.__clatterFall = [];
        options.onFallToFlat = (event) => {
          window.__clatterFall.push(event);
          settings.recordFlatFallback(window.localStorage);
        };
      }
      const box = await scene.mountTray(container, options);
      window.__clatterTray = box;
      if (notation) await box.roll(notation);
      const canvas = box.renderer.domElement;
      return {
        pixelRatio: box.renderer.getPixelRatio(),
        devicePixelRatio: window.devicePixelRatio,
        css: [canvas.clientWidth, canvas.clientHeight],
        buffer: [canvas.width, canvas.height],
        surface: scene.TRAY_SURFACE_COLOR,
        colorSet: scene.TRAY_BASE_COLOR_SET.name,
      };
    },
    { moduleUrl, notation, config, settingsUrl },
  );
}

/**
 * Read the render counters after one frame.
 *
 * three.js resets `info.render` once the shadow pass is drawn, so these are the
 * main-pass counters. They are integers for a fixed scene, which is what a
 * deterministic gate needs.
 */
async function readRenderCounters(page) {
  return page.evaluate(() => {
    const box = window.__clatterTray;
    box.renderer.info.reset();
    box.renderer.render(box.scene, box.camera);
    return {
      calls: box.renderer.info.render.calls,
      triangles: box.renderer.info.render.triangles,
      textures: box.renderer.info.memory.textures,
      geometries: box.renderer.info.memory.geometries,
      dice: box.diceList.length,
    };
  });
}

/**
 * The material every die face really took, and the grain on the face canvas.
 *
 * Both halves are read off the LIVE objects the renderer draws with, and never
 * off a constant in a file. The material is the instance three.js built, so a
 * branch that fell back to the flat-shaded Phong default is visible here. The
 * grain is read out of the canvas that became `map.image` — the very bitmap the
 * texture uploads — by sampling a band across the top of it. The library draws
 * the numeral in the middle, so a band that varies varies because of the grain
 * and because of nothing else, and a face with no grain is filled one flat
 * colour and its band holds exactly one level.
 *
 * **The band has to be wider than the grain is coarse.** A first draft read a
 * 24 pixel corner and saw 8 levels of a promised 44, because the coarse octave
 * is 36 pixels across on a 512 pixel face and one corner sits inside a single
 * cell of it. A window smaller than the feature it measures reads the slope and
 * never the range. The band is a fifth of the canvas, which is about three
 * cells down and fourteen across.
 */
async function readDiceGrain(page, share) {
  return page.evaluate((share) => {
    const box = window.__clatterTray;
    const readings = [];
    const faults = [];
    for (const [at, die] of box.diceList.entries()) {
      for (const [face, material] of die.material.entries()) {
        const name = `die ${at} face ${face}`;
        if (material.isMeshStandardMaterial !== true) {
          faults.push(`${name} is a ${material.type} and not a MeshStandardMaterial`);
          continue;
        }
        const image = material.map?.image;
        if (!(image instanceof HTMLCanvasElement)) {
          faults.push(`${name} carries no canvas on its map`);
          continue;
        }
        const context = image.getContext('2d', { willReadFrequently: true });
        const band = Math.max(8, Math.round(image.height / share));
        const data = context.getImageData(0, 0, image.width, band).data;
        let low = 255;
        let high = 0;
        const levels = new Set();
        for (let step = 0; step < data.length; step += 4) {
          const level = (data[step] + data[step + 1] + data[step + 2]) / 3;
          if (level < low) low = level;
          if (level > high) high = level;
          levels.add(Math.round(level));
        }
        readings.push({
          name,
          roughness: material.roughness,
          metalness: material.metalness,
          canvas: image.width,
          low,
          high,
          levels: levels.size,
        });
      }
    }
    return { material: box.DiceFactory.dice_material, readings, faults };
  }, share);
}

/**
 * Where every die came to rest, against the tray the camera shows.
 *
 * The camera frames exactly `containerWidth` by `containerHeight` world units,
 * so a die is whole on the screen only when its own radius clears that edge. A
 * bound on the body centre alone passes on a die the player sees cut in half.
 */
async function readTrayRest(page) {
  return page.evaluate(() => {
    const box = window.__clatterTray;
    const halfWidth = box.display.containerWidth;
    const halfHeight = box.display.containerHeight;
    const canvas = box.renderer.domElement;
    const outside = [];
    let awake = 0;
    let widest = 0;
    for (const [index, die] of box.diceList.entries()) {
      const p = die.body.position;
      if (!die.geometry.boundingSphere) die.geometry.computeBoundingSphere();
      const radius = die.geometry.boundingSphere.radius * die.scale.x;
      widest = Math.max(widest, radius);
      const over = Math.max(
        Math.abs(p.x) + radius - halfWidth,
        Math.abs(p.y) + radius - halfHeight,
      );
      if (over > 0) {
        outside.push(
          `${index} at (${Math.round(p.x)}, ${Math.round(p.y)}) radius ${Math.round(radius)} ` +
            `overhangs by ${Math.round(over)}`,
        );
      }
      if (die.body.sleepState !== 2) awake += 1;
    }
    return {
      dice: box.diceList.length,
      outside,
      awake,
      halfWidth,
      halfHeight,
      widest,
      wall: [box.display.wallX, box.display.wallY],
      css: [canvas.clientWidth, canvas.clientHeight],
    };
  });
}

/**
 * Price one pixel ratio on the settled scene.
 *
 * `gl.finish` after every frame, because `render` only queues the work. Without
 * it the clock measures how fast the driver accepts commands, and the number
 * does not move when the pixel count does.
 */
async function priceRatio(page, ratio, frames) {
  return page.evaluate(
    ({ ratio, frames }) => {
      const box = window.__clatterTray;
      box.renderer.setPixelRatio(ratio);
      const gl = box.renderer.getContext();
      const draw = () => {
        box.renderer.render(box.scene, box.camera);
        gl.finish();
      };
      for (let i = 0; i < 10; i += 1) draw();
      const samples = [];
      for (let i = 0; i < frames; i += 1) {
        const started = performance.now();
        draw();
        samples.push(performance.now() - started);
      }
      samples.sort((a, b) => a - b);
      const canvas = box.renderer.domElement;
      const mean = samples.reduce((s, v) => s + v, 0) / samples.length;
      return {
        ratio,
        frames,
        mean,
        median: samples[Math.floor(samples.length / 2)],
        p95: samples[Math.min(samples.length - 1, Math.ceil(samples.length * 0.95) - 1)],
        buffer: [canvas.width, canvas.height],
      };
    },
    { ratio, frames },
  );
}

/** Compare the measured counters against `budgets.json`. */
function judgeCounters(budgetsPath, measured, checks) {
  const budgets = JSON.parse(readFileSync(budgetsPath, 'utf8'));
  const key = 'render_counters_after_one_frame_twelve_die_scene';
  const recorded = budgets[key];
  if (recorded === null || typeof recorded !== 'object') {
    throw new Error(`budget ${key} is not an object in ${budgetsPath}`);
  }
  for (const [name, field] of COUNTER_KEYS) {
    const value = measured[field];
    let budget;
    try {
      budget = readBudget(recorded, name);
    } catch (error) {
      // An unrecorded budget fails, and the run carries on, so the unit that
      // owns the number still gets the measurement it came for.
      checks.push({
        name: `render-counter.${name}`,
        ok: false,
        detail: `${name} measured=${value} budget=unrecorded. ${error.message}`,
      });
      continue;
    }
    checks.push({
      name: `render-counter.${name}`,
      ok: value <= budget,
      detail: `${name} measured=${value} budget=${budget}`,
    });
  }
}

async function runTrayScene(page, options, checks) {
  const mounted = await mountTrayScene(page, options.url, TWELVE_DIE_NOTATION);
  console.log(
    `browser: tray notation=${TWELVE_DIE_NOTATION} css=${mounted.css.join('x')} ` +
      `buffer=${mounted.buffer.join('x')} pixel_ratio=${mounted.pixelRatio} ` +
      `device_pixel_ratio=${mounted.devicePixelRatio} colour_set=${mounted.colorSet} ` +
      `surface=${mounted.surface}`,
  );

  const counters = await readRenderCounters(page);
  console.log(
    `browser: tray counters draw_calls=${counters.calls} triangles=${counters.triangles} ` +
      `textures=${counters.textures} geometries=${counters.geometries} dice=${counters.dice}`,
  );
  checks.push({
    name: 'tray.dice-count',
    ok: counters.dice === TWELVE_DIE_COUNT,
    detail: `the scene holds ${counters.dice} dice against the ${TWELVE_DIE_COUNT} the notation names`,
  });
  judgeCounters(options.budgets, counters, checks);

  // ---- The grain on a die — Unit 4.12. ----
  //
  // The bounds come out of `src/tray/dice-grain.ts`, so they move when the
  // octaves move and nothing here has to be retyped. The floor is a quarter of
  // the depth the module promises, which a face that took no grain cannot
  // reach, and the ceiling is that depth itself, which a grain that darkened a
  // die further than it claims would break.
  register('./ts-resolve.mjs', import.meta.url);
  const grainModule = await import('../src/tray/dice-grain.ts');
  const darkest = grainModule.GRAIN_FLOOR * 255;
  const reach = (255 - darkest) / 4;
  const dice = await readDiceGrain(page, 5);
  const flat = dice.readings.filter((each) => each.high - each.low < reach);
  const overdone = dice.readings.filter((each) => each.low < darkest - 1);
  const wrongMaterial = dice.readings.filter(
    (each) => each.roughness !== 0.9 || each.metalness !== 0,
  );
  const span = dice.readings.map((each) => each.high - each.low);
  console.log(
    `browser: tray dice material=${dice.material} faces=${dice.readings.length} ` +
      `canvas=${dice.readings[0]?.canvas ?? 0} ` +
      `span=${Math.min(...span).toFixed(1)}..${Math.max(...span).toFixed(1)} of a promised ` +
      `${(255 - darkest).toFixed(1)} levels, floor=${reach.toFixed(1)} ` +
      `darkest=${Math.min(...dice.readings.map((each) => each.low)).toFixed(1)} ` +
      `against ${darkest.toFixed(1)} flat=${flat.length} overdone=${overdone.length}`,
  );
  checks.push({
    name: 'tray.the-grain-reached-every-die-face',
    ok:
      dice.material === grainModule.GRAIN_MATERIAL &&
      dice.faults.length === 0 &&
      dice.readings.length > TWELVE_DIE_COUNT &&
      flat.length === 0 &&
      overdone.length === 0 &&
      wrongMaterial.length === 0,
    detail:
      `the factory is on the ${dice.material} material against the ` +
      `${grainModule.GRAIN_MATERIAL} the module names, and ${dice.readings.length} face ` +
      `materials over ${counters.dice} dice were read off the live objects the renderer draws ` +
      `with. ${wrongMaterial.length} were not at roughness 0.9 and metalness 0. Each grain is ` +
      `read out of the canvas that became map.image, in a band across the top a fifth of the ` +
      `canvas deep, which the numeral never reaches. ${flat.length} spanned under ${reach.toFixed(1)} levels, which is a quarter of ` +
      `the ${(255 - darkest).toFixed(1)} the octaves promise, and a face with no grain spans ` +
      `zero. ${overdone.length} went below ${darkest.toFixed(1)}, which is the darkest the ` +
      `octaves allow. ${dice.faults.length} faults [${dice.faults.join('; ')}]`,
  });

  const rest = await readTrayRest(page);
  checks.push({
    name: 'tray.every-die-whole-on-screen',
    ok: rest.outside.length === 0 && rest.awake === 0 && rest.dice === TWELVE_DIE_COUNT,
    detail:
      `checked=${rest.dice} of ${TWELVE_DIE_COUNT} against a frame of ` +
      `${rest.halfWidth} by ${rest.halfHeight} half-units, walls at ` +
      `${rest.wall.map(Math.round).join(' by ')}, widest die radius ${Math.round(rest.widest)}, ` +
      `for a canvas of ${rest.css.join('x')} css pixels. ` +
      `awake=${rest.awake} overhanging=${rest.outside.length}` +
      (rest.outside.length ? ` [${rest.outside.join('; ')}]` : ''),
  });

  if (options.resizeTo) {
    await page.setViewport({
      width: options.resizeTo.width,
      height: options.resizeTo.height,
      deviceScaleFactor: options.viewport.dpr,
    });
    // The library debounces its resize handler through requestAnimationFrame.
    await page.evaluate(
      () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
    );
    const after = await readTrayRest(page);
    checks.push({
      name: 'tray.walls-follow-the-canvas',
      ok: after.halfWidth === after.css[0] && after.halfHeight === after.css[1],
      detail:
        `resized ${options.viewport.width}x${options.viewport.height} to ` +
        `${options.resizeTo.width}x${options.resizeTo.height}. The tray is ` +
        `${after.halfWidth} by ${after.halfHeight} half-units for a canvas of ` +
        `${after.css.join('x')} css pixels.`,
    });
    await page.setViewport({
      width: options.viewport.width,
      height: options.viewport.height,
      deviceScaleFactor: options.viewport.dpr,
    });
    await page.evaluate(
      () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
    );
  }

  for (const ratio of options.priceRatios) {
    const priced = await priceRatio(page, ratio, options.priceFrames);
    console.log(
      `browser: tray frame-cost ratio=${priced.ratio} buffer=${priced.buffer.join('x')} ` +
        `frames=${priced.frames} mean_ms=${priced.mean.toFixed(3)} ` +
        `median_ms=${priced.median.toFixed(3)} p95_ms=${priced.p95.toFixed(3)}`,
    );
  }
  if (options.priceRatios.length > 0) {
    // Put the scene back on the ratio the application chose, so a capture that
    // follows shows what a player sees.
    await page.evaluate(
      (ratio) => window.__clatterTray.renderer.setPixelRatio(ratio),
      mounted.pixelRatio,
    );
  }

  if (options.capture) await captureTray(page, options.capture);
}

/** Draw one fresh frame and write the tray to a file. */
async function captureTray(page, path) {
  await page.evaluate(() => {
    const box = window.__clatterTray;
    box.renderer.render(box.scene, box.camera);
  });
  // The container, not the canvas. The renderer clears to transparent, so a
  // capture of the canvas alone would drop the surface a player sees.
  writeFileSync(path, await captureCanvas(page, '#clatter-harness-tray'));
  console.log(`browser: tray capture written to ${path}`);
}

// ---------------------------------------------------------------------------
// The pool scene — Unit 3.3
//
// The rules core decides every value, the tray acts it out, and the check reads
// the face pointing up off each body quaternion. Nothing here reads back the
// value the tray was handed.
// ---------------------------------------------------------------------------

const POOL_TYPES = ['attribute', 'skill', 'gear', 'artifact', 'bonus', 'stress'];
const POOL_FACES = [6, 8, 10, 12];
/** Fixed, so a run reproduces. The core reads it, the tray never does. */
const POOL_SEED = 20260809;

/**
 * Build one die per type and face count, roll them in the rules core, and act
 * the result out on the tray.
 *
 * Every module comes from source over the dev server, so this drives the code
 * the application ships, not a copy of it.
 */
async function throwPoolScene(page, pageUrl, seed, skipTumble = false) {
  const modules = [
    'src/rules/die.ts',
    'src/rules/roll.ts',
    'src/rules/seeded-random.ts',
    'src/tray/throw.ts',
  ].map((path) => new URL(path, pageUrl).href);
  return page.evaluate(
    async ({ modules, types, faces, seed, skipTumble }) => {
      const [die, roll, seeded, thrower] = await Promise.all(modules.map((url) => import(url)));
      const dice = [];
      for (const type of types) {
        for (const count of faces) dice.push(die.createDie(`${type}-d${count}`, type, count));
      }
      const decided = roll.roll({ dice, stressBefore: 0 }, seeded.seededRandom(seed));
      const box = window.__clatterTray;
      // `info.render.frame` counts calls to `renderer.render`, and `info.reset`
      // never touches it. The library draws one frame per animation frame of
      // the throw, so the difference is how long the player watched.
      const drewBefore = box.renderer.info.render.frame;
      const ordered = await thrower.throwPool(box, decided, { skipTumble });
      window.__clatterThrowFrames = box.renderer.info.render.frame - drewBefore;
      return ordered.map((one, index) => {
        const tray = box.diceList[index];
        const read = tray.getFaceValue();
        return {
          id: one.id,
          type: one.type,
          faces: one.faces,
          core: one.values[one.values.length - 1],
          face: read.value,
          label: read.label,
        };
      });
    },
    { modules, types: POOL_TYPES, faces: POOL_FACES, seed, skipTumble },
  );
}

/**
 * The colour of each die as the renderer drew it.
 *
 * It samples the frame, not the material, so a colour that never reached the
 * screen fails.
 *
 * Every sample point is raycast first, and the pixel is read only where the
 * frontmost body the ray meets is the die under test. The dice heap into one
 * corner of the tray, so a patch taken at a die's projected centre often reads
 * the neighbour standing in front of it. The points are walked outwards from
 * the centre, so an unoccluded die is read at its centre as before, and an
 * occluded one is read at the nearest part of its own front surface. No die is
 * dropped: a die with no visible surface at all comes back with a reason, and
 * `pool.every-die-shows-its-own-surface` fails naming it.
 *
 * The upper quartile of the samples is body, not ink, because the numeral at
 * the die centre is black, and it is still below the specular highlight at the
 * very top of the range.
 */
async function readDieColours(page) {
  return page.evaluate(() => {
    const box = window.__clatterTray;
    box.renderer.render(box.scene, box.camera);
    const drawn = box.renderer.domElement;
    const flat = document.createElement('canvas');
    flat.width = drawn.width;
    flat.height = drawn.height;
    const context = flat.getContext('2d');
    context.drawImage(drawn, 0, 0);
    const pixels = context.getImageData(0, 0, flat.width, flat.height).data;
    const ratio = box.renderer.getPixelRatio();
    const rect = box.container.getBoundingClientRect();

    // How many verified points make a sample. Enough for a stable quartile,
    // and few enough that an unoccluded die is read close to its centre.
    const SAMPLES = 25;
    // The lattice step, as a fraction of the die's own projected radius, and
    // how far out the lattice reaches. The first sweep stays off the silhouette
    // edge, where the frame blends the die with the surface behind it.
    const SWEEP = { divisor: 8, reach: 0.85 };
    // The second sweep runs only when the first found nothing at all. It is
    // finer and it reaches the whole silhouette, so "this die has no visible
    // surface" is a measurement and not a limit of the lattice.
    const FINE_SWEEP = { divisor: 20, reach: 1 };
    const QUARTILE = 0.75;

    // A hit names the mesh it struck, which may be a child. Map every node
    // back to the die on the tray, so the owner of a hit is unambiguous.
    const owner = new Map();
    for (const die of box.diceList) die.traverse((node) => owner.set(node, die));

    const raycaster = box.raycaster;
    box.camera.updateMatrixWorld(true);

    return box.diceList.map((die) => {
      const centre = box.getScreenPosition(die.position);
      if (!centre) return { colour: null, reason: 'the camera does not project its centre' };
      if (!die.geometry.boundingSphere) die.geometry.computeBoundingSphere();
      const worldRadius = die.geometry.boundingSphere.radius * die.scale.x;
      const p = die.position;
      const spans = [
        box.getScreenPosition({ x: p.x + worldRadius, y: p.y, z: p.z }),
        box.getScreenPosition({ x: p.x, y: p.y + worldRadius, z: p.z }),
      ];
      const screenRadius = Math.max(
        ...spans.map((edge) => (edge ? Math.hypot(edge.x - centre.x, edge.y - centre.y) : 0)),
      );
      if (!(screenRadius > 0)) {
        return { colour: null, reason: 'the die projects to no area at all' };
      }

      /**
       * Which die the camera meets first at the centre of one device pixel.
       * The ray is aimed at the pixel centre, so the ray and the pixel read
       * below are the same sample. A ray aimed anywhere else in the pixel can
       * answer for the neighbour, and a one-pixel sliver is then read as the
       * colour of the die in front of it.
       */
      const frontmostAt = (px, py) => {
        if (px < 0 || py < 0 || px >= flat.width || py >= flat.height) return null;
        const x = (px + 0.5) / ratio;
        const y = (py + 0.5) / ratio;
        raycaster.setFromCamera(
          { x: (x / rect.width) * 2 - 1, y: -(y / rect.height) * 2 + 1 },
          box.camera,
        );
        const hit = raycaster.intersectObjects(box.diceList)[0];
        return hit ? owner.get(hit.object) : null;
      };

      /** Walk a lattice outwards from the centre and keep the verified points. */
      const gather = (sweep) => {
        const step = screenRadius / sweep.divisor;
        const span = Math.floor(sweep.reach * sweep.divisor);
        const points = [];
        for (let iy = -span; iy <= span; iy += 1) {
          for (let ix = -span; ix <= span; ix += 1) {
            const away = Math.hypot(ix, iy);
            if (away > sweep.reach * sweep.divisor) continue;
            points.push({ dx: ix * step, dy: iy * step, away });
          }
        }
        points.sort((a, b) => a.away - b.away);

        const found = {
          patch: [],
          fringe: [],
          centreVisible: false,
          blockedBy: null,
          blocked: 0,
          tried: 0,
        };
        const seen = new Set();
        for (const point of points) {
          if (found.patch.length >= SAMPLES) break;
          const px = Math.floor((centre.x + point.dx) * ratio);
          const py = Math.floor((centre.y + point.dy) * ratio);
          // A fine lattice can put two points in one pixel. A repeated pixel
          // would count twice in a quartile taken over the samples.
          const key = `${px},${py}`;
          if (seen.has(key)) continue;
          seen.add(key);
          found.tried += 1;
          const front = frontmostAt(px, py);
          if (!front) continue;
          if (front !== die) {
            // A point the old patch would have read as this die's colour, and
            // which is in fact the neighbour standing in front of it.
            found.blocked += 1;
            if (found.blockedBy === null) found.blockedBy = box.diceList.indexOf(front);
            continue;
          }
          if (point.away === 0) found.centreVisible = true;
          const offset = (py * flat.width + px) * 4;
          const colour = [pixels[offset], pixels[offset + 1], pixels[offset + 2]];
          // The renderer antialiases the silhouette, so a pixel the die shares
          // with anything behind it already holds a mixture. Only a pixel whose
          // four neighbours are this die as well is wholly this die.
          const interior =
            frontmostAt(px - 1, py) === die &&
            frontmostAt(px + 1, py) === die &&
            frontmostAt(px, py - 1) === die &&
            frontmostAt(px, py + 1) === die;
          if (interior) found.patch.push(colour);
          else found.fringe.push(colour);
        }
        return found;
      };

      let found = gather(SWEEP);
      let swept = SWEEP;
      let sweptTwice = false;
      let finerTried = 0;
      if (found.patch.length === 0) {
        // Nothing whole. Look again over the whole silhouette, at a step fine
        // enough to land inside a narrow strip, before this run gives up on a
        // pixel the die owns outright.
        const finer = gather(FINE_SWEEP);
        sweptTwice = true;
        finerTried = finer.tried;
        if (finer.patch.length > 0 || finer.fringe.length > found.fringe.length) {
          found = finer;
          swept = FINE_SWEEP;
        }
      }

      // A die reduced to a silhouette edge is still counted. It is read from
      // the mixed pixels it has, and the run says so.
      const edgeOnly = found.patch.length === 0;
      const sample = edgeOnly ? found.fringe : found.patch;
      if (sample.length === 0) {
        return {
          colour: null,
          reason:
            `no pixel of its own surface is frontmost, over ${found.tried} pixels out to ` +
            `${swept.reach} of its projected radius` +
            (sweptTwice
              ? `, and over ${finerTried} more across the whole silhouette, at a step of a ` +
                `${FINE_SWEEP.divisor}th of that radius`
              : ''),
        };
      }

      sample.sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]));
      return {
        colour: sample[Math.floor(sample.length * QUARTILE)],
        visible: sample.length,
        tried: found.tried,
        blocked: found.blocked,
        centreVisible: found.centreVisible,
        blockedBy: found.blockedBy,
        reach: swept.reach,
        edgeOnly,
      };
    });
  });
}

/** sRGB byte to a linear-light value, so a ratio between channels is a ratio of light. */
export function toLinear(byte) {
  const value = byte / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

/**
 * Linear light to chromaticity: the colour with the brightness divided out.
 *
 * A die in the shadow of its neighbour still reads as its own hue to a player,
 * and the check must read it the same way. The renderer multiplies the type
 * colour by the light that reaches the surface, so a shaded die of one type is
 * the same colour scaled down, and a distance taken over linear RGB measures
 * the light as well as the hue. Seed 22 measured it: `gear-d6` sat 72 per cent
 * behind `artifact-d12`, read `49,84,114`, which is the gear blue at about half
 * of its brightness, and landed nearer the mean of the darker violet type.
 *
 * Dividing each channel by the sum of the three removes any scale factor
 * exactly, so brightness cannot move a die between clusters. Two numbers carry
 * the answer, because the third is one minus the other two.
 *
 * A pixel of no light at all has no chromaticity. It comes back as null and its
 * die counts as showing no colour, rather than as an arbitrary point.
 *
 * @param {number[]} linear three linear-light channels
 * @returns {number[]|null} `[r, g]`, each a fraction of the total light
 */
export function toChromaticity(linear) {
  const sum = linear[0] + linear[1] + linear[2];
  if (!(sum > 0)) return null;
  return [linear[0] / sum, linear[1] / sum];
}

/**
 * How much of the pool the camera can see at all.
 *
 * This is a tray property, not a colour property, and the two were one check
 * until seed 22 showed why they may not be. A die buried under the heap shows
 * no surface of its own, and a colour check has nothing to say about it. Unit
 * 3.5 asks the player to click a single die, and a die with no visible surface
 * cannot be clicked, so a buried die is a finding the tray owns.
 *
 * The floor is the whole pool. It is the only floor with no free parameter to
 * tune, and it is what Unit 3.5 needs: every die must be reachable by a click,
 * so every die must show at least one pixel the camera meets first.
 *
 * @returns {number} how many dice showed a surface of their own
 */
function judgeDieVisibility(rows, samples, checks) {
  const hidden = [];
  const stepped = [];
  let visible = 0;
  let thinnest = Number.POSITIVE_INFINITY;
  let centresHidden = 0;
  for (const [index, row] of rows.entries()) {
    const sample = samples[index];
    if (!sample || !sample.colour) {
      hidden.push(`${row.id} ${sample ? sample.reason : 'was never sampled'}`);
      continue;
    }
    visible += 1;
    thinnest = Math.min(thinnest, sample.visible);
    if (!sample.centreVisible) centresHidden += 1;
    if (sample.blocked === 0) continue;
    const behind = rows[sample.blockedBy] ? rows[sample.blockedBy].id : 'another body';
    stepped.push(
      `${row.id} ${sample.blocked} of ${sample.tried} points behind ${behind}` +
        (sample.centreVisible ? '' : ', its centre included'),
    );
  }

  checks.push({
    name: 'pool.every-die-shows-its-own-surface',
    ok: visible === rows.length && rows.length > 0,
    detail:
      `visible=${visible} of a pool of ${rows.length}, against a floor of ${rows.length}. ` +
      `A die counts as visible when a raycast proves at least one pixel of its own surface is ` +
      `the frontmost body. hidden=${hidden.length}` +
      (hidden.length ? ` [${hidden.join('; ')}]` : '') +
      `. dice_the_raycast_had_to_step_around=${stepped.length}, of which ${centresHidden} were ` +
      `hidden at the centre itself` +
      (stepped.length ? ` [${stepped.join('; ')}]` : '') +
      `. Fewest verified points on one visible die=${visible === 0 ? 'none' : thinnest}`,
  });
  return visible;
}

/**
 * Do the six dice types separate on the screen?
 *
 * Each type gets the mean chromaticity of its own dice, then every visible die
 * goes to the nearest mean. A die that lands on another type's mean fails. The
 * means come from the frame, so this check never reads the colour table it is
 * meant to prove, and it carries no tolerance to widen.
 *
 * It judges the visible dice only, and it may not judge fewer than that.
 * `visible` is counted by `judgeDieVisibility` over the same samples and
 * `compared` is counted here, so a later edit which quietly drops an awkward
 * die from the comparison parts the two counts and this check goes red. A run
 * with nothing visible compares nothing and fails as well, so no run passes by
 * having no die to look at.
 *
 * This is the second of the two claims the palette makes, and the other one
 * lives elsewhere on purpose. `src/tray/dice-colors.test.ts` asserts the CIE L*
 * ladder over the hex values, unrendered, which is the accessibility property:
 * a greyscale copy of the tray still separates the six types. This check asks a
 * different question — does each die on the screen read as its own type under
 * the light the tray actually casts. Neither claim implies the other. Do not
 * collapse them into one instrument.
 */
function judgeColourClusters(rows, samples, visible, checks) {
  const points = samples.map((sample) =>
    sample && sample.colour ? toChromaticity(sample.colour.map(toLinear)) : null,
  );
  const means = new Map();
  for (const [index, row] of rows.entries()) {
    const point = points[index];
    if (!point) continue;
    const held = means.get(row.type) ?? { sum: [0, 0], count: 0 };
    held.sum = held.sum.map((value, channel) => value + point[channel]);
    held.count += 1;
    means.set(row.type, held);
  }
  const centres = [...means].map(([type, held]) => ({
    type,
    at: held.sum.map((value) => value / held.count),
  }));

  const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const failures = [];
  let compared = 0;
  for (const [index, row] of rows.entries()) {
    const point = points[index];
    // A die with no surface of its own is a visibility finding, and
    // `pool.every-die-shows-its-own-surface` has already named it.
    if (!point) continue;
    compared += 1;
    const nearest = centres.reduce((best, centre) =>
      distance(point, centre.at) < distance(point, best.at) ? centre : best,
    );
    if (nearest.type !== row.type) {
      failures.push(`${row.id} drew nearer the ${nearest.type} colour than its own`);
    }
  }

  let closest = { gap: Number.POSITIVE_INFINITY, pair: 'none' };
  for (let i = 0; i < centres.length; i += 1) {
    for (let j = i + 1; j < centres.length; j += 1) {
      const gap = distance(centres[i].at, centres[j].at);
      if (gap < closest.gap) closest = { gap, pair: `${centres[i].type}/${centres[j].type}` };
    }
  }

  checks.push({
    name: 'pool.colour-separates-the-types',
    ok: failures.length === 0 && compared === visible && compared > 0,
    detail:
      `classified=${compared} of the ${visible} visible dice, out of a pool of ${rows.length}, ` +
      `against ${centres.length} type means. Every colour is read off the frame at points a ` +
      `raycast proves are that die's own frontmost surface, and every comparison is made in ` +
      `chromaticity, where brightness is divided out, so a die in shadow keeps its hue. The ` +
      `closest two means are ${closest.pair} at ${closest.gap.toFixed(3)} chromaticity units. ` +
      `failures=${failures.length}` +
      (failures.length ? ` [${failures.join('; ')}]` : ''),
  });
}

async function runPoolScene(page, options, checks) {
  const mounted = await mountTrayScene(page, options.url, null, { preserveDrawingBuffer: true });
  const rows = await throwPoolScene(page, options.url, POOL_SEED);
  const expected = POOL_TYPES.length * POOL_FACES.length;
  console.log(
    `browser: pool seed=${POOL_SEED} dice=${rows.length} css=${mounted.css.join('x')} ` +
      `buffer=${mounted.buffer.join('x')} pixel_ratio=${mounted.pixelRatio} ` +
      `colour_set=${mounted.colorSet} surface=${mounted.surface}`,
  );

  // Reported, not judged. `budgets.json` records the twelve-die scene of Unit
  // 3.2, and this pool is a different scene. The texture count is the number to
  // watch: a colour per type costs none, because the colour multiplies the face
  // texture rather than baking a new one.
  const counters = await readRenderCounters(page);
  console.log(
    `browser: pool counters draw_calls=${counters.calls} triangles=${counters.triangles} ` +
      `textures=${counters.textures} geometries=${counters.geometries} dice=${counters.dice}`,
  );

  const wrong = rows.filter((row) => row.face !== row.core);
  checks.push({
    name: 'pool.up-face-equals-core-value',
    ok: wrong.length === 0 && rows.length === expected && rows.length > 0,
    detail:
      `compared=${rows.length} of a pool of ${expected}, read from each body quaternion. ` +
      `wrong=${wrong.length}` +
      (wrong.length
        ? ` [${wrong
            .map((row) => `${row.id} expected ${row.core}, the quaternion reads ${row.face}`)
            .join('; ')}]`
        : ''),
  });

  const combinations = new Set(rows.map((row) => `${row.type}:d${row.faces}`));
  checks.push({
    name: 'pool.type-face-combinations',
    ok: combinations.size === expected,
    detail:
      `covered=${combinations.size} against ${POOL_TYPES.length} types times ` +
      `${POOL_FACES.length} face counts, a product of ${expected}`,
  });

  const rest = await readTrayRest(page);
  checks.push({
    name: 'pool.every-die-at-rest-and-whole-on-screen',
    ok: rest.outside.length === 0 && rest.awake === 0 && rest.dice === expected,
    detail:
      `checked=${rest.dice} of ${expected} against a frame of ${rest.halfWidth} by ` +
      `${rest.halfHeight} half-units. awake=${rest.awake} overhanging=${rest.outside.length}` +
      (rest.outside.length ? ` [${rest.outside.join('; ')}]` : ''),
  });

  const samples = await readDieColours(page);
  const visible = judgeDieVisibility(rows, samples, checks);
  judgeColourClusters(rows, samples, visible, checks);

  if (options.capture) await captureTray(page, options.capture);
}

// ---------------------------------------------------------------------------
// The push scene — Unit 3.4
//
// The rules core decides which dice are pushable and what they become. The tray
// acts that out and names no other die, so the kept dice stay where they lie.
//
// Two of the criteria the plan wrote were measured blind at Unit 3.0 and are
// repaired here. The distance a pushed die travels is reported, never gated: a
// die 328,000 units off the table passed a "moved more than 20 px" bound and
// still projects inside the viewport. The gate is that every body is asleep and
// inside the tray walls. And the kept-die bound cannot fail on its own, because
// a settled body is kinematic with infinite mass, so `--offset-kept` exists to
// break it on purpose.
// ---------------------------------------------------------------------------

/**
 * One kept die and one pushed die at every face count.
 *
 * Generation 0 is a fixture, not a draw, so **locking is guaranteed**: the kept
 * dice are attribute dice showing a success and `lockSuccesses` holds them
 * whatever a seed does. The core still decides which of them lock and what the
 * pushed ones become. A push where nothing locked would prove nothing, and the
 * denominator check below would catch that.
 */
const PUSH_FIXTURE = [
  { id: 'kept-d6', type: 'attribute', faces: 6, value: 6, role: 'kept' },
  { id: 'pushed-d6', type: 'skill', faces: 6, value: 5, role: 'pushed' },
  { id: 'kept-d8', type: 'attribute', faces: 8, value: 8, role: 'kept' },
  { id: 'pushed-d8', type: 'skill', faces: 8, value: 4, role: 'pushed' },
  { id: 'kept-d10', type: 'attribute', faces: 10, value: 10, role: 'kept' },
  { id: 'pushed-d10', type: 'skill', faces: 10, value: 5, role: 'pushed' },
  { id: 'kept-d12', type: 'attribute', faces: 12, value: 12, role: 'kept' },
  { id: 'pushed-d12', type: 'skill', faces: 12, value: 3, role: 'pushed' },
];
const PUSH_FACES = [6, 8, 10, 12];
const PUSH_ROLES = ['kept', 'pushed'];
/** Successes lock, ones cost a rating point, one push. No stress die is added. */
const PUSH_PROFILE_ID = 'pool-banes-damage-ratings';
/** Fixed, so a run reproduces. The core reads it, the tray never does. */
const PUSH_SEED = 20260810;
/** A kept die may move less than this on the screen. */
const MAX_KEPT_DELTA_PX = 1;

const PUSH_MODULES = [
  'src/rules/die.ts',
  'src/rules/push.ts',
  'src/rules/push-profile.ts',
  'src/rules/seeded-random.ts',
  'src/tray/throw.ts',
];

/**
 * Where every die sits on the screen, through the camera matrix.
 *
 * `pixelsPerUnit` comes from projecting the same body one world unit along x,
 * so a caller can turn a screen distance into a world one without knowing how
 * the library frames its tray.
 */
async function readTrayCentroids(page) {
  return page.evaluate(() => {
    const box = window.__clatterTray;
    box.camera.updateMatrixWorld(true);
    const viewProjection = Array.from(
      box.camera.projectionMatrix.clone().multiply(box.camera.matrixWorldInverse).elements,
    );
    const rect = box.renderer.domElement.getBoundingClientRect();
    const viewport = { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    return box.diceList.map((die) => {
      const p = die.body.position;
      const at = window.__clatter.readDieCentroid({
        position: [p.x, p.y, p.z],
        viewProjection,
        viewport,
      });
      const along = window.__clatter.readDieCentroid({
        position: [p.x + 1, p.y, p.z],
        viewProjection,
        viewport,
      });
      return {
        x: at.x,
        y: at.y,
        world: [p.x, p.y, p.z],
        pixelsPerUnit: Math.hypot(along.x - at.x, along.y - at.y),
      };
    });
  });
}

/** Act out the fixture as generation 0 and hold the plan the core made. */
async function throwPushFixture(page, pageUrl) {
  const modules = PUSH_MODULES.map((path) => new URL(path, pageUrl).href);
  return page.evaluate(
    async ({ modules, fixture, profileId }) => {
      const [die, push, profiles, , thrower] = await Promise.all(modules.map((url) => import(url)));
      const profile = profiles.PUSH_PROFILES.find((one) => one.id === profileId);
      if (!profile) throw new Error(`no push profile named ${profileId}`);
      const dice = fixture.map((row) =>
        die.appendValue(die.createDie(row.id, row.type, row.faces), row.value),
      );
      const first = { dice, stressAfter: 0 };
      const preview = push.previewPush(first, profile);
      if (preview.kind !== 'available') {
        throw new Error(`the core refused the push: ${preview.reason}`);
      }
      const box = window.__clatterTray;
      const ordered = await thrower.throwPool(box, first);
      window.__clatterPush = { first, profile, ordered };
      const loose = new Set(preview.rerolled);
      return {
        order: ordered.map((one) => one.id),
        // The count the rules core reports as locked. The kept-die check is
        // compared against this number, not against a count of the fixture.
        locked: ordered.filter((one) => !loose.has(one.id)).map((one) => one.id),
        rerolled: preview.rerolled,
        faces: ordered.map((one, index) => ({
          id: one.id,
          core: die.latestValue(one),
          face: box.diceList[index].getFaceValue().value,
        })),
      };
    },
    { modules, fixture: PUSH_FIXTURE, profileId: PUSH_PROFILE_ID },
  );
}

/** Push through the rules core, then act the answer out on the tray. */
async function pushTray(page, pageUrl, seed) {
  const modules = PUSH_MODULES.map((path) => new URL(path, pageUrl).href);
  return page.evaluate(
    async ({ modules, seed }) => {
      const [die, push, , seeded, thrower] = await Promise.all(modules.map((url) => import(url)));
      const held = window.__clatterPush;
      const pushed = push.push(held.first, held.profile, seeded.seededRandom(seed));
      if (pushed.kind !== 'pushed') throw new Error(`the core refused the push: ${pushed.reason}`);
      const box = window.__clatterTray;
      const after = await thrower.pushPool(box, held.ordered, pushed);
      return {
        rerolled: pushed.rerolled,
        faces: after.map((one, index) => ({
          id: one.id,
          core: die.latestValue(one),
          face: box.diceList[index].getFaceValue().value,
        })),
      };
    },
    { modules, seed },
  );
}

/**
 * Test-only. Move one kept die sideways by `pixels` screen pixels.
 *
 * The kept-die assertion reads two projections of the same body, and a settled
 * body is kinematic with infinite mass, so nothing a push does can move it.
 * Without this hook that assertion reads a constant the model writes. It
 * returns both centroids, so a run proves the offset landed before it believes
 * the red.
 */
async function offsetKeptDie(page, index, pixels) {
  return page.evaluate(
    ({ index, pixels }) => {
      const box = window.__clatterTray;
      const die = box.diceList[index];
      if (!die) throw new Error(`offsetKeptDie: the tray holds no die at index ${index}`);
      const read = () => {
        box.camera.updateMatrixWorld(true);
        const viewProjection = Array.from(
          box.camera.projectionMatrix.clone().multiply(box.camera.matrixWorldInverse).elements,
        );
        const rect = box.renderer.domElement.getBoundingClientRect();
        const p = die.body.position;
        return window.__clatter.readDieCentroid({
          position: [p.x, p.y, p.z],
          viewProjection,
          viewport: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        });
      };
      const before = read();
      const p = die.body.position;
      const along = (() => {
        p.x += 1;
        const shifted = read();
        p.x -= 1;
        return Math.hypot(shifted.x - before.x, shifted.y - before.y);
      })();
      const world = pixels / along;
      p.x += world;
      die.position.copy(p);
      const after = read();
      return { before, after, world, moved: Math.hypot(after.x - before.x, after.y - before.y) };
    },
    { index, pixels },
  );
}

async function runPushScene(page, options, checks) {
  const mounted = await mountTrayScene(page, options.url, null, { preserveDrawingBuffer: true });
  await installHelpers(page);
  const thrown = await throwPushFixture(page, options.url);
  const before = await readTrayCentroids(page);
  console.log(
    `browser: push seed=${PUSH_SEED} profile=${PUSH_PROFILE_ID} dice=${thrown.order.length} ` +
      `locked=${thrown.locked.length} rerolled=${thrown.rerolled.length} ` +
      `css=${mounted.css.join('x')} pixel_ratio=${mounted.pixelRatio}`,
  );
  if (options.captureBefore) await captureTray(page, options.captureBefore);

  const counters = await readRenderCounters(page);
  console.log(
    `browser: push counters draw_calls=${counters.calls} triangles=${counters.triangles} ` +
      `textures=${counters.textures} geometries=${counters.geometries} dice=${counters.dice}`,
  );

  const pushed = await pushTray(page, options.url, PUSH_SEED);
  if (options.offsetKept !== null) {
    const target = thrown.locked[options.offsetKept];
    const at = thrown.order.indexOf(target);
    const moved = await offsetKeptDie(page, at, MAX_KEPT_DELTA_PX + 2);
    console.log(
      `browser: push OFFSET HOOK moved ${target} at tray index ${at} from ` +
        `(${moved.before.x.toFixed(3)}, ${moved.before.y.toFixed(3)}) to ` +
        `(${moved.after.x.toFixed(3)}, ${moved.after.y.toFixed(3)}), ` +
        `${moved.world.toFixed(3)} world units, ${moved.moved.toFixed(3)} px`,
    );
  }
  const after = await readTrayCentroids(page);

  // --- the kept dice, projected to a screen-space centroid -----------------
  const keptFailures = [];
  const keptMoves = [];
  let compared = 0;
  for (const id of thrown.locked) {
    const index = thrown.order.indexOf(id);
    const was = before[index];
    const now = after[index];
    if (index < 0 || !was || !now) {
      keptFailures.push(`${id} was not on the tray`);
      continue;
    }
    compared += 1;
    const delta = Math.hypot(now.x - was.x, now.y - was.y);
    keptMoves.push(`${id} ${delta.toFixed(3)}`);
    if (!(delta < MAX_KEPT_DELTA_PX)) {
      keptFailures.push(`${id} moved ${delta.toFixed(3)} px`);
    }
  }
  checks.push({
    name: 'push.kept-dice-do-not-move',
    ok: keptFailures.length === 0 && compared === thrown.locked.length && compared > 0,
    detail:
      `compared=${compared} of the ${thrown.locked.length} dice the rules core reports as ` +
      `locked, out of a pool of ${thrown.order.length}, each projected through the camera ` +
      `matrix to a screen-space centroid. Every delta must be under ${MAX_KEPT_DELTA_PX} px. ` +
      `deltas_px=[${keptMoves.join(', ')}] failures=${keptFailures.length}` +
      (keptFailures.length ? ` [${keptFailures.join('; ')}]` : ''),
  });

  // --- the pushed dice: distance reported, rest gated ----------------------
  const pushedMoves = pushed.rerolled.map((id) => {
    const index = thrown.order.indexOf(id);
    const was = before[index];
    const now = after[index];
    return `${id} ${Math.hypot(now.x - was.x, now.y - was.y).toFixed(1)} px`;
  });
  console.log(`browser: push pushed dice moved ${pushedMoves.join(', ')}`);

  const rest = await readTrayRest(page);
  checks.push({
    name: 'push.every-die-asleep-and-inside-the-tray',
    ok: rest.outside.length === 0 && rest.awake === 0 && rest.dice === thrown.order.length,
    detail:
      `checked=${rest.dice} of ${thrown.order.length} against a frame of ${rest.halfWidth} by ` +
      `${rest.halfHeight} half-units, widest die radius ${Math.round(rest.widest)}. ` +
      `awake=${rest.awake} outside=${rest.outside.length}` +
      (rest.outside.length ? ` [${rest.outside.join('; ')}]` : ''),
  });

  // --- the conjunction: a decided value, on a re-throw of a named subset ---
  const wrong = pushed.faces.filter((row) => row.face !== row.core);
  checks.push({
    name: 'push.up-face-equals-core-value',
    ok: wrong.length === 0 && pushed.faces.length === thrown.order.length,
    detail:
      `compared=${pushed.faces.length} of ${thrown.order.length}, read from each body ` +
      `quaternion after the push. wrong=${wrong.length}` +
      (wrong.length
        ? ` [${wrong
            .map((row) => `${row.id} expected ${row.core}, the quaternion reads ${row.face}`)
            .join('; ')}]`
        : ''),
  });

  const byId = new Map(PUSH_FIXTURE.map((row) => [row.id, row]));
  const combinations = new Set(
    thrown.order.map((id) => {
      const row = byId.get(id);
      return row ? `${row.role}:d${row.faces}` : `unknown:${id}`;
    }),
  );
  const product = PUSH_FACES.length * PUSH_ROLES.length;
  checks.push({
    name: 'push.face-count-and-role-combinations',
    ok: combinations.size === product && thrown.order.length === product,
    detail:
      `covered=${combinations.size} of the ${thrown.order.length} dice on the tray, against ` +
      `${PUSH_FACES.length} face counts times ${PUSH_ROLES.length} roles, a product of ${product}`,
  });

  // The fixture declares which dice it means to lock. The core decides. This
  // check is what makes "locking is guaranteed" a measurement.
  const meant = PUSH_FIXTURE.filter((row) => row.role === 'kept').map((row) => row.id);
  const disagree = [
    ...meant.filter((id) => !thrown.locked.includes(id)).map((id) => `${id} did not lock`),
    ...thrown.locked.filter((id) => !meant.includes(id)).map((id) => `${id} locked unexpectedly`),
  ];
  checks.push({
    name: 'push.the-core-locked-the-fixture-it-was-given',
    ok: disagree.length === 0 && thrown.locked.length === meant.length && meant.length > 0,
    detail:
      `the core locked ${thrown.locked.length} dice against the ${meant.length} the fixture ` +
      `means to lock, and the floor is 1. disagreements=${disagree.length}` +
      (disagree.length ? ` [${disagree.join('; ')}]` : ''),
  });

  if (options.capture) await captureTray(page, options.capture);
}

// ---------------------------------------------------------------------------
// The lock-state affordance — Unit 3.5, tray half
//
// Three states on the dice, and the rules core decides every one of them. This
// run measures the two claims a renderer can answer:
//
//   1. The three states are told apart by **shape**, not by colour. The probe
//      is a raycast straight down onto the desk, so it reads geometry and can
//      see no colour at all. A state drawn the same as another cannot pass it.
//   2. The mark a player sees carries enough luminance against the tray surface
//      to read in greyscale. That one samples the frame, so a mark that never
//      reached the screen fails.
//
// Then it clicks every die on the tray, through the driver, at a point a
// raycast proves is that die's own frontmost surface.
//
// The DOM half of Unit 3.5 — roles, accessible names, `aria-pressed` and focus
// order — is not here. It needs the application shell of Phase 2 and the
// history matrix of Unit 2.2, and both wait at `BLOCKED:owner-gate` on Unit
// 2.0. **Unit 3.5 is not complete.**
// ---------------------------------------------------------------------------

/**
 * Twelve dice, three per state, three per face count.
 *
 * Generation 0 is a fixture and not a draw, so **all three states are
 * guaranteed**: the rule locks are successes and a 1 on a gear die, which
 * `lockSuccesses` and `lockOnesBy` hold whatever a seed does, and the choices
 * carry the player's own flag. The core still decides. `affordance.the-core-
 * reads-the-three-states-the-fixture-holds` is what makes that a measurement.
 */
const AFFORDANCE_FIXTURE = [
  { id: 'rule-d6', type: 'attribute', faces: 6, value: 6, manualLock: false, state: 'rule' },
  { id: 'rule-d8', type: 'attribute', faces: 8, value: 8, manualLock: false, state: 'rule' },
  { id: 'rule-d10', type: 'attribute', faces: 10, value: 10, manualLock: false, state: 'rule' },
  { id: 'rule-d12', type: 'attribute', faces: 12, value: 12, manualLock: false, state: 'rule' },
  { id: 'choice-d6', type: 'skill', faces: 6, value: 3, manualLock: true, state: 'choice' },
  { id: 'choice-d8', type: 'skill', faces: 8, value: 4, manualLock: true, state: 'choice' },
  { id: 'choice-d10', type: 'skill', faces: 10, value: 5, manualLock: true, state: 'choice' },
  { id: 'choice-d12', type: 'skill', faces: 12, value: 2, manualLock: true, state: 'choice' },
  { id: 'loose-d6', type: 'bonus', faces: 6, value: 3, manualLock: false, state: 'loose' },
  { id: 'loose-d8', type: 'artifact', faces: 8, value: 4, manualLock: false, state: 'loose' },
  { id: 'loose-d10', type: 'artifact', faces: 10, value: 5, manualLock: false, state: 'loose' },
  { id: 'loose-d12', type: 'artifact', faces: 12, value: 3, manualLock: false, state: 'loose' },
];
const AFFORDANCE_STATES = ['rule', 'choice', 'loose'];
/** Successes lock, a 1 on an attribute or a gear die locks, one push. */
const AFFORDANCE_PROFILE_ID = 'pool-banes-damage-ratings';

const AFFORDANCE_MODULES = [
  'src/rules/die.ts',
  'src/rules/push-profile.ts',
  'src/tray/throw.ts',
  'src/tray/affordance.ts',
  'src/theme/themes.ts',
];

/**
 * The theme this scene is drawn in.
 *
 * `src/tray/scene.ts` fills the container with the `ash` surface, so the marks
 * take the `ash` palette and the pairing is one a player can really reach. A
 * mark from one row over the table of another would prove nothing about either.
 */
const AFFORDANCE_THEME_ID = 'ash';

/**
 * The shape probe. How many directions out of this many the mark occupies.
 *
 * A closed frame is met at every one. Four corner blocks are met near the four
 * diagonals only. Nothing at all is met at none. The three answers are read off
 * the geometry, so the probe is blind to colour by construction.
 */
const MARK_PROBE_ANGLES = 48;
/** Steps along one direction, and the range it walks, in die radii. */
const MARK_PROBE_STEPS = 44;
const MARK_PROBE_FROM = 0.4;
const MARK_PROBE_TO = 2.4;
/** WCAG 1.4.11, the floor for a graphical object that carries meaning. */
const MIN_MARK_CONTRAST = 3;

/** Throw the fixture, wire the affordance, and report what the core reads. */
async function mountAffordanceScene(page, pageUrl) {
  const modules = AFFORDANCE_MODULES.map((path) => new URL(path, pageUrl).href);
  return page.evaluate(
    async ({ modules, fixture, profileId, themeId }) => {
      const [die, profiles, thrower, affordance, themes] = await Promise.all(
        modules.map((url) => import(url)),
      );
      const profile = profiles.PUSH_PROFILES.find((one) => one.id === profileId);
      if (!profile) throw new Error(`no push profile named ${profileId}`);
      const dice = fixture.map((row) =>
        die.appendValue(die.createDie(row.id, row.type, row.faces, 0, row.manualLock), row.value),
      );
      const box = window.__clatterTray;
      const ordered = await thrower.throwPool(box, { dice, stressAfter: 0 });
      const held = { module: affordance, profiles, profile, ordered, pool: ordered, clicks: [] };
      window.__clatterAffordance = held;
      const palette = themes.INTERFACE_PALETTES[themeId];
      held.palette = palette;
      held.stop = await affordance.mountAffordance(
        box,
        ordered,
        profile,
        palette,
        (pool, clicked, outcome) => {
          held.pool = pool;
          held.clicks.push({ id: clicked.id, outcome });
        },
      );
      return {
        order: ordered.map((one) => one.id),
        states: ordered.map((one) => profiles.lockState(one, profile)),
        // What the marks were ASKED for, so the run can compare it against
        // what the renderer put in the material.
        wanted: affordance.lockMarkerColours(palette),
      };
    },
    {
      modules,
      fixture: AFFORDANCE_FIXTURE,
      profileId: AFFORDANCE_PROFILE_ID,
      themeId: AFFORDANCE_THEME_ID,
    },
  );
}

/**
 * What was drawn around each die, in two independent readings.
 *
 * `covered` is the shape: a ray dropped straight down onto the desk, at each of
 * `angles` directions out from the die and at every step along that direction.
 * It never touches the camera and never touches a pixel, so no colour, no light
 * and no heap of dice can move it. Every hit on the die's own mark counts, not
 * only the frontmost one, so one mark overlapping another cannot hide it.
 *
 * `contrasts` is what a player sees: the same points, projected back through
 * the camera, kept only where a second raycast proves the mark is the frontmost
 * body at that pixel, and read off the frame composited over the tray surface.
 * The renderer clears to transparent and the surface is the element behind the
 * canvas, so the composite is the only honest read.
 */
async function readMarks(page, surface) {
  return page.evaluate(
    ({ angles, steps, from, to, surface }) => {
      const box = window.__clatterTray;
      box.renderer.render(box.scene, box.camera);
      const drawn = box.renderer.domElement;
      const flat = document.createElement('canvas');
      flat.width = drawn.width;
      flat.height = drawn.height;
      const context = flat.getContext('2d');
      context.fillStyle = surface;
      context.fillRect(0, 0, flat.width, flat.height);
      context.drawImage(drawn, 0, 0);
      const pixels = context.getImageData(0, 0, flat.width, flat.height).data;
      const rect = box.container.getBoundingClientRect();

      const marks = new Map();
      box.scene.traverse((node) => {
        if (typeof node.name === 'string' && node.name.startsWith('clatter-lock-marker:')) {
          marks.set(Number(node.name.split(':')[1]), node);
        }
      });
      const every = [...marks.values()];

      const owner = new Map();
      for (const one of box.diceList) one.traverse((node) => owner.set(node, one));
      for (const [index, mark] of marks) owner.set(mark, `mark:${index}`);

      const toLinear = (byte) => {
        const value = byte / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      };
      const luminance = ([r, g, b]) =>
        0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
      const surfaceBytes = [1, 3, 5].map((start) =>
        Number.parseInt(surface.slice(start, start + 2), 16),
      );
      const surfaceLuminance = luminance(surfaceBytes);

      const raycaster = box.raycaster;
      box.camera.updateMatrixWorld(true);

      return box.diceList.map((die, index) => {
        if (!die.geometry.boundingSphere) die.geometry.computeBoundingSphere();
        const radius = die.geometry.boundingSphere.radius * die.scale.x;
        const mine = marks.get(index) ?? null;
        /**
         * Which mark the camera meets first at the centre of one framebuffer
         * pixel. The direction is derived from the framebuffer itself, not
         * from the css rectangle and the pixel ratio, so the ray and the pixel
         * read below are the same sample whatever those two say.
         */
        const frontmostAt = (px, py) => {
          if (px < 0 || py < 0 || px >= flat.width || py >= flat.height) return null;
          raycaster.setFromCamera(
            {
              x: ((px + 0.5) / flat.width) * 2 - 1,
              y: -(((py + 0.5) / flat.height) * 2) + 1,
            },
            box.camera,
          );
          const front = raycaster.intersectObject(box.scene, true)[0];
          return front ? (owner.get(front.object) ?? null) : null;
        };

        let covered = 0;
        const contrasts = [];
        let occluded = 0;
        let edgeOnly = 0;
        for (let a = 0; a < angles; a += 1) {
          const theta = (a / angles) * Math.PI * 2;
          // Every step along this direction, not the first one only. A pixel at
          // the first hit is the mark's own silhouette edge, where the renderer
          // has already blended it with the desk behind, so a contrast read
          // there measures the antialiasing and not the mark.
          const on = [];
          for (let s = 0; s <= steps; s += 1) {
            const rho = radius * (from + ((to - from) * s) / steps);
            const x = die.position.x + rho * Math.cos(theta);
            const y = die.position.y + rho * Math.sin(theta);
            raycaster.ray.origin.set(x, y, radius * 40);
            raycaster.ray.direction.set(0, 0, -1);
            raycaster.near = 0;
            raycaster.far = Number.POSITIVE_INFINITY;
            const hits = raycaster.intersectObjects(every, false);
            // Every hit, not the frontmost. One mark overlapping another may
            // not hide it, because the shape claim is about what was drawn.
            if (hits.some((hit) => hit.object === mine)) on.push({ x, y, z: mine.position.z });
          }
          if (on.length === 0) continue;
          covered += 1;

          // The middle of the run, back through the camera. A mark hidden under
          // the heap is not an affordance, so it is counted and not read.
          const at = on[Math.floor(on.length / 2)];
          const screen = box.getScreenPosition(at);
          if (!screen) continue;
          const px = Math.floor((screen.x / rect.width) * flat.width);
          const py = Math.floor((screen.y / rect.height) * flat.height);
          const owned = `mark:${index}`;
          if (frontmostAt(px, py) !== owned) {
            occluded += 1;
            continue;
          }
          // Only a pixel whose eight neighbours are this mark as well is wholly
          // this mark. The renderer antialiases over the whole area of a pixel,
          // so a silhouette that cuts a corner of one already blends it with
          // whatever lies behind, and a contrast read there measures the blend.
          let whole = true;
          for (let dy = -1; dy <= 1 && whole; dy += 1) {
            for (let dx = -1; dx <= 1 && whole; dx += 1) {
              if (dx !== 0 || dy !== 0) whole = frontmostAt(px + dx, py + dy) === owned;
            }
          }
          if (!whole) {
            edgeOnly += 1;
            continue;
          }
          const offset = (py * flat.width + px) * 4;
          const mark = luminance([pixels[offset], pixels[offset + 1], pixels[offset + 2]]);
          const [high, low] = [mark, surfaceLuminance].sort((one, two) => two - one);
          contrasts.push((high + 0.05) / (low + 0.05));
        }
        return { index, marked: mine !== null, covered, occluded, edgeOnly, contrasts };
      });
    },
    {
      angles: MARK_PROBE_ANGLES,
      steps: MARK_PROBE_STEPS,
      from: MARK_PROBE_FROM,
      to: MARK_PROBE_TO,
      surface,
    },
  );
}

/**
 * Repaint every mark in one palette and read the colour back off the material.
 *
 * The palette crosses from node, so the page is never asked which colour it
 * ought to have used. `getHexString()` answers in sRGB, which is the space the
 * hex in a theme row is written in, so the two are comparable without a
 * conversion of this file's own.
 */
async function paintMarks(page, palette) {
  return page.evaluate((row) => {
    window.__clatterAffordance.stop.paint(row);
    const drawn = [];
    window.__clatterTray.scene.traverse((node) => {
      if (typeof node.name === 'string' && node.name.startsWith('clatter-lock-marker:')) {
        drawn.push({
          index: Number(node.name.split(':')[1]),
          colour: `#${node.material.color.getHexString().toUpperCase()}`,
        });
      }
    });
    return drawn;
  }, palette);
}

/**
 * Where a pointer may be aimed at one die, as source, so both the `--table`
 * mode and the `--affordance` mode copy one implementation into the page.
 *
 * **A pointer addresses whole pixels and nothing finer.** The driver rounds
 * every pointer coordinate to a whole number — `Math.round` in
 * `node_modules/puppeteer-core/lib/puppeteer/bidi/Input.js` — and the WebDriver
 * BiDi wire format carries whole numbers. A probe that aims between two pixels
 * therefore proves a point no pointer can ever send an event to.
 *
 * That is not a small difference at the edge of a heap. Measured on 2026-08-10
 * over 32 throws of the drawn 30-die pool: an outward ring walk from a die's
 * centre returns the FIRST point that belongs to the die, and where a neighbour
 * covers the centre that first point lies on the boundary between the two by
 * construction. Rounding then carried the click across that boundary, and the
 * neighbour took the press. Two throws of the 32 lost a die that way, and the
 * dice that were lost held 1,415 and 1,820 whole pixels of their own surface, so
 * neither was hidden and neither was hard to reach. The aim was the fault.
 *
 * **The construction, rather than a rule per pixel.** This scans the whole
 * pixels the die's projected disc covers, keeps the ones where the die is the
 * frontmost body, and answers the one furthest from any pixel that is not. The
 * answer is a whole pixel, so the driver's rounding changes nothing, and it is
 * the point deepest inside what the player can see, which is where a finger
 * aims. A die with no such pixel is answered as unreachable and named.
 *
 * `frontmost` is this file's own raycast, built once over the whole scan. The
 * per-click helper rebuilds its owner map on every call, which is the right
 * shape for one click and the wrong shape for a quarter of a million of them.
 */
const AIM_HELPER = `
window.__clatterAim = function (box, count, nameOf) {
  const rect = box.container.getBoundingClientRect();
  const owner = new Map();
  box.diceList.forEach((die, index) => die.traverse((node) => owner.set(node, index)));
  const frontmost = (x, y) => {
    box.raycaster.setFromCamera(
      {
        x: ((x - rect.left) / rect.width) * 2 - 1,
        y: -((y - rect.top) / rect.height) * 2 + 1,
      },
      box.camera,
    );
    const hit = box.raycaster.intersectObjects(box.diceList)[0];
    if (!hit) return null;
    const found = owner.get(hit.object);
    return found === undefined ? null : found;
  };
  const miss = (index, reason) => ({
    index,
    name: nameOf(index),
    x: null,
    y: null,
    own: 0,
    scanned: 0,
    margin: 0,
    reason,
  });
  const aims = [];
  for (let index = 0; index < count; index += 1) {
    const die = box.diceList[index];
    if (die === undefined) {
      aims.push(miss(index, 'the tray holds no body for it'));
      continue;
    }
    const centre = box.getScreenPosition(die.position);
    if (centre === undefined || centre === null) {
      aims.push(miss(index, 'the camera projects no centre for it'));
      continue;
    }
    if (!die.geometry.boundingSphere) die.geometry.computeBoundingSphere();
    const worldRadius = (die.geometry.boundingSphere ? die.geometry.boundingSphere.radius : 0) * die.scale.x;
    const p = die.position;
    const edge = box.getScreenPosition({ x: p.x + worldRadius, y: p.y, z: p.z });
    const radius = edge === undefined || edge === null ? 0 : Math.hypot(edge.x - centre.x, edge.y - centre.y);
    if (!(radius > 0)) {
      aims.push(miss(index, 'it projects to no area at all'));
      continue;
    }
    /* The bounding sphere contains the die, so its projected disc contains the
       silhouette and the scan can miss no pixel of it. */
    const cx = rect.left + centre.x;
    const cy = rect.top + centre.y;
    const x0 = Math.ceil(cx - radius);
    const y0 = Math.ceil(cy - radius);
    const w = Math.floor(cx + radius) - x0 + 1;
    const h = Math.floor(cy + radius) - y0 + 1;
    if (w <= 0 || h <= 0) {
      aims.push(miss(index, 'it covers no whole pixel at all'));
      continue;
    }
    /* far stands for "not yet measured". The two passes below bring every
       owned pixel down to its Chebyshev distance from the nearest pixel this
       die does not own. A pixel outside the scan counts as not owned, so no
       margin reaches past the edge of what was measured. */
    const far = w + h;
    const depth = new Int32Array(w * h);
    let own = 0;
    let scanned = 0;
    for (let iy = 0; iy < h; iy += 1) {
      for (let ix = 0; ix < w; ix += 1) {
        const x = x0 + ix;
        const y = y0 + iy;
        if (Math.hypot(x - cx, y - cy) > radius) continue;
        scanned += 1;
        if (frontmost(x, y) === index) {
          depth[iy * w + ix] = far;
          own += 1;
        }
      }
    }
    const at = (ix, iy) => (ix < 0 || iy < 0 || ix >= w || iy >= h ? 0 : depth[iy * w + ix]);
    for (let iy = 0; iy < h; iy += 1) {
      for (let ix = 0; ix < w; ix += 1) {
        const here = depth[iy * w + ix];
        if (here === 0) continue;
        depth[iy * w + ix] = Math.min(
          here,
          at(ix - 1, iy) + 1,
          at(ix, iy - 1) + 1,
          at(ix - 1, iy - 1) + 1,
          at(ix + 1, iy - 1) + 1,
        );
      }
    }
    for (let iy = h - 1; iy >= 0; iy -= 1) {
      for (let ix = w - 1; ix >= 0; ix -= 1) {
        const here = depth[iy * w + ix];
        if (here === 0) continue;
        depth[iy * w + ix] = Math.min(
          here,
          at(ix + 1, iy) + 1,
          at(ix, iy + 1) + 1,
          at(ix + 1, iy + 1) + 1,
          at(ix - 1, iy + 1) + 1,
        );
      }
    }
    let margin = 0;
    let bestX = null;
    let bestY = null;
    for (let iy = 0; iy < h; iy += 1) {
      for (let ix = 0; ix < w; ix += 1) {
        if (depth[iy * w + ix] > margin) {
          margin = depth[iy * w + ix];
          bestX = x0 + ix;
          bestY = y0 + iy;
        }
      }
    }
    if (bestX === null) {
      const gone = miss(
        index,
        'no whole pixel of its own surface is frontmost, over ' + scanned + ' scanned',
      );
      gone.scanned = scanned;
      aims.push(gone);
      continue;
    }
    aims.push({ index, name: nameOf(index), x: bestX, y: bestY, own, scanned, margin, reason: null });
  }
  return aims;
};
`;

/**
 * The whole pixel a pointer may be aimed at, for each die of the tray scene.
 *
 * It is `window.__clatterAim`, which `--table` uses over the application's own
 * tray. One implementation answers both modes, because both drive the same
 * driver and the driver rounds every pointer coordinate to a whole pixel.
 *
 * A die with no whole pixel of its own is **wholly buried** — Unit 3.5 measured
 * one seed of forty where that happened — and it is reported as unreachable
 * rather than clicked at a pixel that belongs to its neighbour.
 */
async function findClickPoints(page) {
  await page.evaluate(AIM_HELPER);
  return page.evaluate(() => {
    const box = window.__clatterTray;
    return window
      .__clatterAim(box, box.diceList.length, (index) => String(index))
      .map((aim) => ({
        index: aim.index,
        point: aim.x === null ? null : { x: aim.x, y: aim.y },
        own: aim.own,
        scanned: aim.scanned,
        margin: aim.margin,
        reason: aim.reason,
      }));
  });
}

/** The state the core reads for every die, now. */
async function readAffordanceStates(page) {
  return page.evaluate(() => {
    const held = window.__clatterAffordance;
    return held.pool.map((die) => ({
      id: die.id,
      state: held.profiles.lockState(die, held.profile),
      manualLock: die.manualLock,
    }));
  });
}

async function runAffordanceScene(page, options, checks) {
  const mounted = await mountTrayScene(page, options.url, null, { preserveDrawingBuffer: true });
  const thrown = await mountAffordanceScene(page, options.url);
  // The library debounces its resize handler through requestAnimationFrame and
  // draws one more frame after the throw. Both are settled before anything is
  // read, so no reading below races a frame the library still owes.
  await page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );
  const size = AFFORDANCE_FIXTURE.length;
  console.log(
    `browser: affordance profile=${AFFORDANCE_PROFILE_ID} dice=${thrown.order.length} ` +
      `css=${mounted.css.join('x')} buffer=${mounted.buffer.join('x')} ` +
      `pixel_ratio=${mounted.pixelRatio} surface=${mounted.surface}`,
  );

  // --- the fixture holds all three states, and the core says so -------------
  const meant = new Map(AFFORDANCE_FIXTURE.map((row) => [row.id, row.state]));
  const counted = { rule: 0, choice: 0, loose: 0 };
  const disagree = [];
  for (const [index, id] of thrown.order.entries()) {
    const state = thrown.states[index];
    counted[state] += 1;
    if (meant.get(id) !== state) {
      disagree.push(`${id} was written as ${meant.get(id)} and the core reads ${state}`);
    }
  }
  const total = AFFORDANCE_STATES.reduce((sum, state) => sum + counted[state], 0);
  console.log(
    `browser: affordance states rule=${counted.rule} choice=${counted.choice} ` +
      `loose=${counted.loose} of ${size}`,
  );
  checks.push({
    name: 'affordance.the-core-reads-the-three-states-the-fixture-holds',
    ok:
      disagree.length === 0 &&
      total === size &&
      thrown.order.length === size &&
      AFFORDANCE_STATES.every((state) => counted[state] > 0),
    detail:
      `the core read rule=${counted.rule}, choice=${counted.choice} and loose=${counted.loose} ` +
      `over a pool of ${size}, and the three must sum to ${size} with a floor of 1 each. A ` +
      `fixture with no rule-locked die would prove nothing about a click. ` +
      `disagreements=${disagree.length}` +
      (disagree.length ? ` [${disagree.join('; ')}]` : ''),
  });

  const counters = await readRenderCounters(page);
  console.log(
    `browser: affordance counters draw_calls=${counters.calls} triangles=${counters.triangles} ` +
      `textures=${counters.textures} geometries=${counters.geometries} dice=${counters.dice}`,
  );
  judgeCounters(options.budgets, counters, checks);

  // --- the shape, read off the geometry -------------------------------------
  const marks = await readMarks(page, mounted.surface);
  const byState = new Map(AFFORDANCE_STATES.map((state) => [state, []]));
  let measured = 0;
  for (const [index, id] of thrown.order.entries()) {
    const mark = marks[index];
    if (!mark) continue;
    measured += 1;
    byState.get(thrown.states[index]).push({ id, covered: mark.covered });
  }
  const spans = AFFORDANCE_STATES.map((state) => {
    const held = byState.get(state);
    const values = held.map((one) => one.covered);
    return {
      state,
      count: held.length,
      min: values.length ? Math.min(...values) : null,
      max: values.length ? Math.max(...values) : null,
      dice: held.map((one) => `${one.id}=${one.covered}`).join(', '),
    };
  });
  for (const span of spans) {
    console.log(
      `browser: affordance shape ${span.state} dice=${span.count} ` +
        `directions_covered=[${span.dice}] of ${MARK_PROBE_ANGLES}`,
    );
  }
  const [rule, choice, loose] = AFFORDANCE_STATES.map((state) =>
    spans.find((span) => span.state === state),
  );
  const overlaps = [];
  if (!(loose.max < choice.min)) {
    overlaps.push(
      `loose and choice cannot be separated: loose reaches up to ${loose.max} directions and ` +
        `choice down to ${choice.min}`,
    );
  }
  if (!(choice.max < rule.min)) {
    overlaps.push(
      `choice and rule cannot be separated: choice reaches up to ${choice.max} directions and ` +
        `rule down to ${rule.min}`,
    );
  }
  checks.push({
    name: 'affordance.the-three-states-differ-by-shape-alone',
    ok:
      overlaps.length === 0 &&
      measured === size &&
      AFFORDANCE_STATES.every((state) => byState.get(state).length > 0),
    detail:
      `measured=${measured} of a pool of ${size}, each by dropping a ray straight down onto the ` +
      `desk in ${MARK_PROBE_ANGLES} directions out from the die, at ${MARK_PROBE_STEPS + 1} ` +
      `steps from ${MARK_PROBE_FROM} to ${MARK_PROBE_TO} die radii. The probe reads geometry, ` +
      `so it can see no colour, no light and no hue at all. The three states must occupy three ` +
      `separated ranges of directions: ` +
      spans
        .map((span) => `${span.state} ${span.min}-${span.max} over ${span.count} dice`)
        .join(', ') +
      `. overlaps=${overlaps.length}` +
      (overlaps.length ? ` [${overlaps.join('; ')}]` : ''),
  });

  // --- the mark reaches the frame, in luminance ------------------------------
  //
  // The claim is about the colour the renderer put on the screen, and the mark
  // is one flat unlit colour, so one pixel that is wholly the mark carries it.
  // The strongest such pixel on each die is the reading, and the count of dice
  // is the denominator. A run reports the whole spread as well, because a mark
  // mostly under the heap is a finding even when the pixel it does show is
  // right. It is not a gate: the heap is what a throw makes of it, and Unit
  // 3.5 already records that a die can be buried outright.
  const dim = [];
  const unseen = [];
  let read = 0;
  let sampled = 0;
  let occluded = 0;
  let edgeOnly = 0;
  let weakest = Number.POSITIVE_INFINITY;
  let dimmestBest = Number.POSITIVE_INFINITY;
  for (const [index, id] of thrown.order.entries()) {
    const mark = marks[index];
    if (!mark || !mark.marked) continue;
    read += 1;
    occluded += mark.occluded;
    edgeOnly += mark.edgeOnly;
    sampled += mark.contrasts.length;
    if (mark.contrasts.length === 0) {
      unseen.push(`${id} shows no pixel of its own mark, over ${mark.covered} directions`);
      continue;
    }
    weakest = Math.min(weakest, ...mark.contrasts);
    const best = Math.max(...mark.contrasts);
    dimmestBest = Math.min(dimmestBest, best);
    if (best < MIN_MARK_CONTRAST) {
      dim.push(`${id} reads ${best.toFixed(2)}:1 against the tray surface at its strongest pixel`);
    }
  }
  const markedCount = counted.rule + counted.choice;
  console.log(
    `browser: affordance marks read=${read} of ${markedCount} sampled_points=${sampled} ` +
      `occluded_points=${occluded} edge_points=${edgeOnly} ` +
      `dimmest_reading=${dimmestBest === Number.POSITIVE_INFINITY ? 'none' : dimmestBest.toFixed(2)} ` +
      `weakest_pixel=${weakest === Number.POSITIVE_INFINITY ? 'none' : weakest.toFixed(2)}`,
  );
  checks.push({
    name: 'affordance.every-mark-reaches-the-frame-in-greyscale',
    ok: dim.length === 0 && unseen.length === 0 && read === markedCount && markedCount > 0,
    detail:
      `read=${read} of the ${markedCount} marked dice, out of a pool of ${size}, over ` +
      `${sampled} pixels a raycast proves are the mark's own frontmost surface. ` +
      `${occluded} further points of a mark lie under the heap and ${edgeOnly} fall on its own ` +
      `silhouette edge. Both are counted and neither is read, because a blended pixel measures ` +
      `the antialiasing and not the mark. ` +
      `Every pixel is taken off the frame composited over the tray surface, because the ` +
      `renderer clears to transparent, and every contrast is a luminance ratio, so hue counts ` +
      `for nothing. The floor is ${MIN_MARK_CONTRAST}:1, which WCAG 1.4.11 sets for a ` +
      `graphical object that carries meaning, and the reading for a die is its ` +
      `strongest wholly-own pixel. dimmest_reading=` +
      `${dimmestBest === Number.POSITIVE_INFINITY ? 'none' : `${dimmestBest.toFixed(2)}:1`}, ` +
      `weakest_single_pixel=` +
      `${weakest === Number.POSITIVE_INFINITY ? 'none' : `${weakest.toFixed(2)}:1`}, reported ` +
      `and not gated. too_dim=${dim.length} never_seen=${unseen.length}` +
      (dim.length ? ` [${dim.join('; ')}]` : '') +
      (unseen.length ? ` [${unseen.join('; ')}]` : ''),
  });

  // --- the marks follow the theme, read off the materials the renderer holds --
  //
  // `affordance.test.ts` measures the two floors over the six rows. It reads
  // data, so it cannot say that the colour a row names ever reached a material.
  // This reads the material the renderer draws with, after a real repaint, and
  // it needs no pixel: the marks are unlit, so the material IS the colour on
  // the screen and the check above already proves the pixels arrive.
  // `scripts/ts-resolve.mjs` supplies the extension Vite would have supplied,
  // so this file reads the rows the screen reads and never a copy of them.
  register('./ts-resolve.mjs', import.meta.url);
  const themeRows = await import('../src/theme/themes.ts');
  const affordanceMod = await import('../src/tray/affordance.ts');
  const painted = [];
  for (const id of themeRows.THEME_IDS) {
    const drawn = await paintMarks(page, themeRows.INTERFACE_PALETTES[id]);
    painted.push({
      id,
      drawn,
      wanted: affordanceMod.lockMarkerColours(themeRows.INTERFACE_PALETTES[id]),
    });
  }
  // Back to the row this scene's table is drawn in, so nothing after this reads
  // a mark from another theme.
  await paintMarks(page, themeRows.INTERFACE_PALETTES[AFFORDANCE_THEME_ID]);
  const wrongColour = [];
  let repainted = 0;
  const seen = { rule: new Set(), choice: new Set() };
  for (const row of painted) {
    for (const mark of row.drawn) {
      const state = thrown.states[mark.index];
      if (state !== 'rule' && state !== 'choice') {
        wrongColour.push(`${row.id} drew a mark on a ${state} die`);
        continue;
      }
      repainted += 1;
      seen[state].add(mark.colour);
      if (mark.colour !== row.wanted[state].toUpperCase()) {
        wrongColour.push(
          `${row.id} ${state} drew ${mark.colour} against ${row.wanted[state].toUpperCase()}`,
        );
      }
    }
  }
  const wantedMarks = markedCount * themeRows.THEME_IDS.length;
  console.log(
    `browser: affordance theme rows=${themeRows.THEME_IDS.length} marks_read=${repainted} ` +
      `of ${wantedMarks} distinct_rule=${seen.rule.size} distinct_choice=${seen.choice.size} ` +
      `wrong=${wrongColour.length}`,
  );
  checks.push({
    name: 'affordance.the-marks-carry-the-colour-of-the-theme-in-force',
    ok:
      wrongColour.length === 0 &&
      repainted === wantedMarks &&
      wantedMarks > 0 &&
      seen.rule.size === themeRows.THEME_IDS.length &&
      seen.choice.size === themeRows.THEME_IDS.length,
    detail:
      `read=${repainted} of the ${wantedMarks} marks the ${themeRows.THEME_IDS.length} rows ` +
      `draw over ${markedCount} marked dice, each one off the material the renderer holds ` +
      `after a real repaint, as sRGB. Every one must equal the colour ` +
      `lockMarkerColours names for that row, and the rows must give ` +
      `${themeRows.THEME_IDS.length} different colours for each mark, because a fixed literal ` +
      `would give one. distinct_rule=${seen.rule.size} distinct_choice=${seen.choice.size} ` +
      `wrong=${wrongColour.length}` +
      (wrongColour.length ? ` [${wrongColour.join('; ')}]` : ''),
  });

  if (options.capture) await captureTray(page, options.capture);

  // --- one real click on every die -------------------------------------------
  const before = await readAffordanceStates(page);
  const aimed = await findClickPoints(page);
  const unreachable = [];
  for (const [index, id] of thrown.order.entries()) {
    const aim = aimed[index];
    if (!aim || !aim.point) {
      unreachable.push(`${id} ${aim ? aim.reason : 'was never aimed at'}`);
      continue;
    }
    await page.mouse.click(aim.point.x, aim.point.y);
  }
  const after = await readAffordanceStates(page);
  const clicks = await page.evaluate(() => window.__clatterAffordance.clicks);

  const wanted = { rule: 'refused', choice: 'released', loose: 'kept' };
  const became = { rule: 'rule', choice: 'loose', loose: 'choice' };
  const failures = [];
  let refused = 0;
  let toggled = 0;
  for (const [index, id] of thrown.order.entries()) {
    const was = thrown.states[index];
    const reported = clicks.find((one) => one.id === id);
    const now = after.find((one) => one.id === id);
    const had = before.find((one) => one.id === id);
    if (!reported || !now || !had) {
      failures.push(`${id} was ${was} and the tray reported no click on it`);
      continue;
    }
    if (reported.outcome !== wanted[was]) {
      failures.push(
        `${id} was ${was}, so the click had to be ${wanted[was]}, and it was ${reported.outcome}`,
      );
      continue;
    }
    if (now.state !== became[was]) {
      failures.push(`${id} was ${was} and had to end ${became[was]}, and it reads ${now.state}`);
      continue;
    }
    if (was === 'rule') {
      if (now.manualLock !== had.manualLock) {
        failures.push(`${id} is locked by rule and the click still moved its own flag`);
        continue;
      }
      refused += 1;
    } else {
      toggled += 1;
    }
  }
  console.log(
    `browser: affordance clicks refused=${refused} toggled=${toggled} ` +
      `unreachable=${unreachable.length} reported=${clicks.length} of ${size}`,
  );
  checks.push({
    name: 'affordance.a-rule-lock-refuses-a-click-and-the-other-two-toggle',
    ok:
      failures.length === 0 &&
      unreachable.length === 0 &&
      refused + toggled === size &&
      refused === counted.rule &&
      toggled === counted.choice + counted.loose &&
      clicks.length === size,
    detail:
      `every die on the tray was clicked once, through the driver, at a point a raycast proves ` +
      `is its own frontmost surface. refused=${refused} against the ${counted.rule} dice the ` +
      `core locks by rule, toggled=${toggled} against the ${counted.choice + counted.loose} it ` +
      `does not, and the two must sum to the pool size ${size}. The tray reported ` +
      `${clicks.length} clicks. A rule lock keeps its own flag as well as its state. ` +
      `unreachable=${unreachable.length}, which is a die wholly buried under the heap and ` +
      `therefore beyond every route the tray has. failures=${failures.length}` +
      (failures.length ? ` [${failures.join('; ')}]` : '') +
      (unreachable.length ? ` [${unreachable.join('; ')}]` : ''),
  });
}

// ---------------------------------------------------------------------------
// The capability probe — Unit 3.7
//
// The probe reads the platform and the decision reads the probe. Only the probe
// needs a browser, so only the probe is checked here. Every combination of
// readings is covered by `src/tray/capability.test.ts`, which needs no browser
// at all.
//
// The check below asks the page for a WebGL2 context through a second route
// that never touches the module under test, so the probe cannot answer its own
// question. Inside the sandbox that route answers false, and the decision must
// then be a fall to flat rather than a throw.
// ---------------------------------------------------------------------------

async function runProbe(page, options, checks) {
  const moduleUrl = new URL('src/tray/capability.ts', options.url).href;

  // Route two. Plain page code, no import, so it shares nothing with the probe.
  const independentWebgl2 = await page.evaluate(() => {
    try {
      return document.createElement('canvas').getContext('webgl2') !== null;
    } catch {
      return false;
    }
  });

  const read = await page.evaluate(async (url) => {
    const capability = await import(url);
    try {
      const probe = await capability.probeCapability();
      return {
        threw: null,
        probe,
        decision: capability.decideTray(probe),
        reducedMotion: capability.prefersReducedMotion(),
        bar: {
          memory: capability.MIN_DEVICE_MEMORY_GB,
          cores: capability.MIN_CORES,
        },
      };
    } catch (error) {
      return { threw: String((error && error.message) || error) };
    }
  }, moduleUrl);

  if (read.threw !== null) {
    checks.push({
      name: 'probe.answers-rather-than-throws',
      ok: false,
      detail: `the probe threw: ${read.threw}`,
    });
    return;
  }

  console.log(
    `browser: probe webgl2=${read.probe.webgl2} device_memory_gb=${read.probe.deviceMemoryGb} ` +
      `cores=${read.probe.cores} to_blob=${read.probe.toBlob} ` +
      `reduced_motion=${read.reducedMotion} bar=${read.bar.memory}GB/${read.bar.cores}cores`,
  );
  console.log(
    `browser: probe decision tray=${read.decision.tray} ` +
      `reasons=[${read.decision.reasons.join(', ')}]`,
  );

  checks.push({
    name: 'probe.answers-rather-than-throws',
    ok: true,
    detail:
      `the probe returned all four readings: webgl2=${read.probe.webgl2}, ` +
      `device_memory_gb=${read.probe.deviceMemoryGb}, cores=${read.probe.cores}, ` +
      `to_blob=${read.probe.toBlob}`,
  });

  checks.push({
    name: 'probe.webgl2-agrees-with-a-second-route',
    ok: read.probe.webgl2 === independentWebgl2,
    detail:
      `the probe reads webgl2=${read.probe.webgl2} and a plain page-side context request ` +
      `reads ${independentWebgl2}`,
  });

  // The one rule this run can judge without a table: no context, no tray.
  checks.push({
    name: 'probe.no-webgl2-falls-to-flat',
    ok:
      independentWebgl2 ||
      (read.decision.tray === false && read.decision.reasons.includes('no-webgl2')),
    detail: independentWebgl2
      ? `a WebGL2 context is available here, so this rule has nothing to judge. ` +
        `The decision is tray=${read.decision.tray}, reasons=[${read.decision.reasons.join(', ')}]`
      : `no WebGL2 context is available here, so the decision must be a fall to flat naming ` +
        `no-webgl2. It reads tray=${read.decision.tray}, ` +
        `reasons=[${read.decision.reasons.join(', ')}]`,
  });
}

// ---------------------------------------------------------------------------
// Context loss — Unit 3.7
//
// A lost context gives a black canvas and no error, so the handler is proven to
// fire rather than assumed. `WEBGL_lose_context` forces the loss, and the
// permanent flag is read back out of `localStorage` through the settings
// module, before the loss and after it, so the check asserts a transition and
// not a value that was already true.
// ---------------------------------------------------------------------------

const CONTEXT_EVENT_TIMEOUT_MS = 3000;

async function runContextLoss(page, options, checks) {
  const settingsUrl = new URL('src/settings/settings.ts', options.url).href;
  await page.evaluate(() => window.localStorage.clear());
  const mounted = await mountTrayScene(page, options.url, null, null, settingsUrl);
  console.log(
    `browser: context-loss tray mounted css=${mounted.css.join('x')} ` +
      `pixel_ratio=${mounted.pixelRatio}`,
  );

  const outcome = await page.evaluate(
    async ({ timeoutMs }) => {
      /** Poll a condition up to a deadline. Answers whether it came true. */
      const waitFor = (predicate, ms) =>
        new Promise((resolve) => {
          const deadline = Date.now() + ms;
          const tick = () => {
            if (predicate()) resolve(true);
            else if (Date.now() > deadline) resolve(false);
            else setTimeout(tick, 20);
          };
          tick();
        });
      const settings = window.__clatterSettings;
      const store = window.localStorage;
      const before = settings.readSettings(store).flatFallback;

      const gl = window.__clatterTray.renderer.getContext();
      const lose = gl.getExtension('WEBGL_lose_context');
      if (!lose) throw new Error('this browser has no WEBGL_lose_context extension');

      lose.loseContext();
      const sawLoss = await waitFor(
        () => window.__clatterFall.includes('webglcontextlost'),
        timeoutMs,
      );
      const afterLoss = settings.readSettings(store).flatFallback;

      lose.restoreContext();
      const sawRestore = await waitFor(
        () => window.__clatterFall.includes('webglcontextrestored'),
        timeoutMs,
      );

      return {
        before,
        afterLoss,
        afterRestore: settings.readSettings(store).flatFallback,
        sawLoss,
        sawRestore,
        events: window.__clatterFall,
        contextLost: gl.isContextLost(),
        stored: window.localStorage.getItem(settings.SETTINGS_KEY),
      };
    },
    { timeoutMs: CONTEXT_EVENT_TIMEOUT_MS },
  );

  console.log(
    `browser: context-loss events=[${outcome.events.join(', ')}] ` +
      `flag before=${outcome.before} after_loss=${outcome.afterLoss} ` +
      `after_restore=${outcome.afterRestore} stored=${outcome.stored}`,
  );

  checks.push({
    name: 'context-loss.the-lost-handler-fires',
    ok: outcome.sawLoss && outcome.events.includes('webglcontextlost'),
    detail:
      `WEBGL_lose_context was called and the canvas was watched for ` +
      `${CONTEXT_EVENT_TIMEOUT_MS} ms. events=[${outcome.events.join(', ')}]. The transition ` +
      `this check needs is a webglcontextlost event, and it ` +
      `${outcome.sawLoss ? 'arrived' : 'never arrived'}.`,
  });

  checks.push({
    name: 'context-loss.the-permanent-flag-goes-from-false-to-true',
    ok: outcome.before === false && outcome.afterLoss === true,
    detail:
      `the stored flatFallback flag read ${outcome.before} before the loss and ` +
      `${outcome.afterLoss} after it, read back out of localStorage through readSettings. ` +
      `The transition this check needs is false to true.`,
  });

  checks.push({
    name: 'context-loss.the-restored-handler-fires-and-the-fall-stands',
    ok: outcome.sawRestore && outcome.afterRestore === true,
    detail:
      `the browser was asked to restore the context. events=[${outcome.events.join(', ')}], ` +
      `flatFallback after the restore is ${outcome.afterRestore}. A restore never undoes the ` +
      `fall, because the application has already moved to flat dice.`,
  });
}

// ---------------------------------------------------------------------------
// Reduced motion — Unit 3.7
//
// The plan skips the tumble. The dice must still finish on the values the rules
// core decided, so the same pool is thrown twice, from the same seed, and the
// faces read off the body quaternions are compared with each other and with the
// core in both runs.
//
// The third check is the one that stops the other two from passing for the
// wrong reason: a `skipTumble` that did nothing would land the same faces. The
// instrument is the renderer's own frame counter, not a clock, so the check is
// a whole number and cannot flake.
// ---------------------------------------------------------------------------

/** The skipped throw may draw at most this many frames. */
const MAX_SKIPPED_FRAMES = 5;

/**
 * The tumbling throw must draw at least this many. Without a floor the check
 * would pass on a run where neither throw tumbled, and prove nothing.
 */
const MIN_TUMBLED_FRAMES = 50;

async function runReducedMotion(page, options, checks) {
  const expected = POOL_TYPES.length * POOL_FACES.length;
  const runs = [];
  for (const skipTumble of [false, true]) {
    await mountTrayScene(page, options.url, null, { preserveDrawingBuffer: true });
    const started = Date.now();
    const rows = await throwPoolScene(page, options.url, POOL_SEED, skipTumble);
    const frames = await page.evaluate(() => window.__clatterThrowFrames);
    runs.push({ skipTumble, rows, frames, ms: Date.now() - started });
  }

  for (const run of runs) {
    console.log(
      `browser: reduced-motion skip_tumble=${run.skipTumble} dice=${run.rows.length} ` +
        `frames_drawn=${run.frames} throw_ms=${run.ms}`,
    );
  }

  // --- every face equals the value the core decided, in both runs -----------
  const wrong = [];
  let checkedFaces = 0;
  for (const run of runs) {
    for (const row of run.rows) {
      checkedFaces += 1;
      if (row.face !== row.core) {
        wrong.push(
          `skip_tumble=${run.skipTumble} ${row.id} expected ${row.core}, read ${row.face}`,
        );
      }
    }
  }
  checks.push({
    name: 'reduced-motion.up-face-equals-core-value-in-both-modes',
    ok: wrong.length === 0 && checkedFaces === expected * runs.length && runs.length === 2,
    detail:
      `compared=${checkedFaces} of ${expected * runs.length}, which is a pool of ${expected} ` +
      `over ${runs.length} modes, read from each body quaternion. wrong=${wrong.length}` +
      (wrong.length ? ` [${wrong.join('; ')}]` : ''),
  });

  // --- the two runs agree die for die --------------------------------------
  const [tumbled, skipped] = runs;
  const differ = [];
  let compared = 0;
  for (const [index, row] of tumbled.rows.entries()) {
    const other = skipped.rows[index];
    if (!other || other.id !== row.id) {
      differ.push(`index ${index} holds ${row.id} tumbling and ${other ? other.id : 'nothing'}`);
      continue;
    }
    compared += 1;
    if (other.face !== row.face || other.core !== row.core) {
      differ.push(
        `${row.id} reads ${row.face} tumbling and ${other.face} skipped, ` +
          `against core values ${row.core} and ${other.core}`,
      );
    }
  }
  checks.push({
    name: 'reduced-motion.skipping-the-tumble-changes-no-face',
    ok: differ.length === 0 && compared === expected && expected > 0,
    detail:
      `compared=${compared} of the pool size ${expected}, die for die, from the same seed ` +
      `${POOL_SEED}. differences=${differ.length}` +
      (differ.length ? ` [${differ.join('; ')}]` : ''),
  });

  // --- the skip landed -----------------------------------------------------
  checks.push({
    name: 'reduced-motion.the-skip-lands',
    ok: skipped.frames <= MAX_SKIPPED_FRAMES && tumbled.frames >= MIN_TUMBLED_FRAMES,
    detail:
      `the tumbling throw drew ${tumbled.frames} frames against a floor of ` +
      `${MIN_TUMBLED_FRAMES}, and the skipped throw drew ${skipped.frames} against a ceiling ` +
      `of ${MAX_SKIPPED_FRAMES}, counted by the renderer itself. The throws took ` +
      `${tumbled.ms} ms and ${skipped.ms} ms, reported and not judged. Without this check the ` +
      `two above would pass with the skip doing nothing at all.`,
  });

  if (options.capture) await captureTray(page, options.capture);
}

// ---------------------------------------------------------------------------
// Sound — Unit 3.6
//
// Four claims, and the first three are the ones that can pass for the wrong
// reason if they are written carelessly.
//
// The plan words its acceptance as "no audio file loads until the user enables
// sound". Unit 3.6 loads no file at all, in any state, because every sound is
// synthesised, so that sentence is true of a broken build as well as a working
// one. The property that carries the same intent and can fail is: **no
// `AudioContext` is constructed** until the player turns sound on.
//
// The second is that the tray is silent while sound is off *while collisions
// are still arriving*. A run that measured no collisions would pass it saying
// nothing, so the collision count is asserted above zero in the same check.
//
// The third is the denominator. The engine reports what became of every
// collision it was handed; this file counts the collisions itself, off the
// `onImpact` hook and off the world's own `beginContact` event, and neither
// number is one the engine can write.
// ---------------------------------------------------------------------------

/** The volume the run stores and then looks for on the output gain. */
const SOUND_TEST_VOLUME = 0.4;
/** Seconds of audio the offline renders produce. Longer than the longest voice. */
const RENDER_SECONDS = 0.5;
const RENDER_RATE = 48000;

/**
 * The two bands the rendered sound is weighed in, in hertz.
 *
 * A peak says a sound was made. It says nothing about what the sound is, so a
 * peak check cannot tell a wooden knock from a tinny one and cannot see a
 * regression back. These two numbers give the render a shape to be judged on.
 */
const LOW_BAND_HZ = 1000;
const HIGH_BAND_HZ = 3000;

/**
 * How far the low band must stand above the high band, as a ratio of energy.
 *
 * Measured on 2026-08-10 over the twelve-die throw at `--throw-seed 5`: the
 * wooden tray reads 42.4 and the single band at 2400 hertz it replaced reads
 * 0.6. The floor is five times under the first and thirteen times over the
 * second, so this check fails on the sound it was written against. The peak
 * check below passed on that sound at 1.041782, which is why a peak alone
 * cannot hold this ground.
 */
const LOW_OVER_HIGH_FLOOR = 8;

/** Percentiles of a list of numbers, for the report. */
function spread(values) {
  if (values.length === 0) return 'none';
  const sorted = [...values].sort((a, b) => a - b);
  const at = (fraction) =>
    sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))];
  return `min=${at(0).toFixed(0)} p25=${at(0.25).toFixed(0)} median=${at(0.5).toFixed(0)} p75=${at(0.75).toFixed(0)} max=${sorted[sorted.length - 1].toFixed(0)}`;
}

/** Throw the fixed twelve-die scene and wait for every die to rest. */
async function throwForSound(page, notation) {
  await page.evaluate(async (text) => {
    await window.__clatterTray.roll(text);
  }, notation);
}

/** Everything both throws are judged on, read in one round trip. */
async function readSoundState(page) {
  return page.evaluate(() => {
    const held = window.__sound;
    const engine = held.engine;
    return {
      built: window.__audio.built,
      counts: engine.counts,
      hasContext: engine.context !== null,
      state: engine.context ? engine.context.state : null,
      gain: engine.output ? engine.output.gain.value : null,
      dispatches: held.seen.dispatches,
      pairs: held.seen.pairs,
      kinds: { ...held.seen.kinds },
      speeds: held.seen.speeds.slice(),
      steps: held.seen.steps.length,
      distinctSteps: new Set(held.seen.steps).size,
    };
  });
}

async function runSoundScene(page, options, checks) {
  const soundUrl = new URL('src/tray/sound.ts', options.url).href;
  const settingsUrl = new URL('src/settings/settings.ts', options.url).href;

  // Before anything imports the module under test. The engine reads the global
  // at the moment it needs a context, so this proxy sees every construction the
  // page makes, the engine's included.
  await page.evaluate(() => {
    window.__audio = { built: 0 };
    const Real = window.AudioContext;
    window.AudioContext = new Proxy(Real, {
      construct(target, args) {
        window.__audio.built += 1;
        return Reflect.construct(target, args);
      },
    });
  });

  const mounted = await mountTrayScene(page, options.url, null);
  const armed = await page.evaluate(
    async ({ soundUrl, settingsUrl }) => {
      const [sound, settings] = await Promise.all([import(soundUrl), import(settingsUrl)]);
      window.localStorage.clear();
      const stored = settings.readSettings(window.localStorage);
      const box = window.__clatterTray;

      // Counted here, never by the engine. `beginContact` is the world's own
      // bookkeeping and reaches this file by a different route from the
      // `collide` event `onImpact` rides on, so it is a second enumeration of
      // the same physics. The library simulates the whole throw before it draws
      // it and then replays the same steps, and only the replay is the pass the
      // player watches.
      const seen = {
        dispatches: 0,
        pairs: 0,
        kinds: { die: 0, surface: 0 },
        speeds: [],
        steps: [],
      };
      box.world.addEventListener('beginContact', () => {
        if (box.animstate !== 'simulate') seen.pairs += 1;
      });

      const engine = sound.createSoundEngine({
        enabled: stored.soundEnabled,
        volume: stored.soundVolume,
      });
      window.__sound = { engine, seen, sound, settings, impacts: [] };
      box.onImpact = (impact) => {
        seen.dispatches += 1;
        seen.kinds[impact.kind] += 1;
        seen.speeds.push(impact.speed);
        seen.steps.push(box.world.stepnumber);
        window.__sound.impacts.push(impact);
        engine.impact(impact);
      };
      return {
        version: stored.version,
        soundEnabled: stored.soundEnabled,
        soundVolume: stored.soundVolume,
      };
    },
    { soundUrl, settingsUrl },
  );
  console.log(
    `browser: sound stored record version=${armed.version} sound_enabled=${armed.soundEnabled} ` +
      `sound_volume=${armed.soundVolume} css=${mounted.css.join('x')}`,
  );

  // --- throw one: sound off ------------------------------------------------
  await throwForSound(page, TWELVE_DIE_NOTATION);
  const off = await readSoundState(page);
  console.log(
    `browser: sound OFF collisions=${off.dispatches} pairs=${off.pairs} ` +
      `die=${off.kinds.die} surface=${off.kinds.surface} contexts_built=${off.built} ` +
      `triggers=${off.counts.triggers} impact_speed ${spread(off.speeds)}`,
  );

  checks.push({
    name: 'sound.no-audio-context-until-the-player-turns-sound-on',
    ok: off.built === 0 && off.hasContext === false && off.dispatches > 0,
    detail:
      `the page constructed ${off.built} audio contexts over a throw that reported ` +
      `${off.dispatches} collisions, against a floor of 1 collision and a ceiling of 0 ` +
      `contexts. Every sound this build makes is synthesised, so "no audio file loads" is ` +
      `true of any build and says nothing. This is the property that carries the same intent ` +
      `and can fail: nothing is built until the player asks for sound.`,
  });

  checks.push({
    name: 'sound.silent-while-sound-is-off',
    ok:
      off.counts.triggers === 0 &&
      off.counts.impacts === off.dispatches &&
      off.dispatches > 0 &&
      off.pairs > 0,
    detail:
      `the engine started ${off.counts.triggers} voices, against a ceiling of 0, while the ` +
      `tray handed it ${off.counts.impacts} collisions and this file counted ${off.dispatches} ` +
      `of them for itself, over ${off.pairs} new contacts the physics world reported by its ` +
      `own route. A synthesiser that was wired up and never gated fails here.`,
  });

  // --- the player turns sound on -------------------------------------------
  const enabled = await page.evaluate((volume) => {
    const { engine, settings } = window.__sound;
    // The record the Phase 4 toggle will write. The engine reads it back out of
    // storage, so this run drives the stored state and not a local variable.
    const held = settings.readSettings(window.localStorage);
    settings.writeSettings(window.localStorage, {
      ...held,
      soundEnabled: true,
      soundVolume: volume,
    });
    const now = settings.readSettings(window.localStorage);
    engine.setVolume(now.soundVolume);
    engine.enable();
    return {
      built: window.__audio.built,
      state: engine.context.state,
      gain: engine.output.gain.value,
      storedVolume: now.soundVolume,
      storedEnabled: now.soundEnabled,
      activation: navigator.userActivation ? navigator.userActivation.isActive : null,
      stored: window.localStorage.getItem(settings.SETTINGS_KEY),
    };
  }, SOUND_TEST_VOLUME);
  console.log(
    `browser: sound ON contexts_built=${enabled.built} state=${enabled.state} ` +
      `output_gain=${enabled.gain} stored=${enabled.stored} ` +
      `user_activation_at_enable=${enabled.activation}`,
  );

  checks.push({
    name: 'sound.the-context-is-born-suspended-and-nothing-resumes-it',
    ok:
      enabled.built === 1 &&
      enabled.state === 'suspended' &&
      enabled.activation === false &&
      enabled.storedEnabled === true,
    detail:
      `turning sound on built ${enabled.built} context and it reads state=${enabled.state}, ` +
      `with navigator.userActivation.isActive=${enabled.activation} at that moment. The ` +
      `engine holds no call to resume, so a context it built stays suspended until the ` +
      `player acts. Measured on this browser on 2026-08-09: it does not refuse an ungestured ` +
      `resume of its own accord, so what is asserted here is the wiring and not the browser.`,
  });

  // Measured on this browser on 2026-08-09: it does not refuse an ungestured
  // resume, and a context it allows starts itself a moment after it is built.
  // The run therefore shuts the clock again here, from outside the engine, so
  // the gesture below is the only thing that can restart it. Without this the
  // check would race the browser, and it would pass on an engine whose resume
  // did nothing at all.
  const shut = await page.evaluate(async () => {
    const ctx = window.__sound.engine.context;
    await ctx.suspend();
    return ctx.state;
  });

  // The gesture. A real click through the driver, so the page sees a trusted
  // event and `navigator.userActivation` turns true.
  await page.evaluate(() => {
    const button = document.createElement('button');
    button.id = 'clatter-harness-sound';
    button.type = 'button';
    button.textContent = 'Turn the sound on';
    button.style.cssText = 'position:fixed;left:0;top:0;z-index:9999';
    document.body.appendChild(button);
    button.addEventListener('click', () => {
      const held = window.__sound;
      held.activationAtResume = navigator.userActivation ? navigator.userActivation.isActive : null;
      held.stateBeforeResume = held.engine.context.state;
      held.resumed = held.engine.resume().then(
        () => held.engine.context.state,
        (error) => `threw: ${error}`,
      );
    });
  });
  await page.click('#clatter-harness-sound');
  const gesture = await page.evaluate(async () => {
    const held = window.__sound;
    return {
      before: held.stateBeforeResume,
      after: await held.resumed,
      activation: held.activationAtResume,
    };
  });
  console.log(
    `browser: sound gesture shut=${shut} state before=${gesture.before} ` +
      `after=${gesture.after} user_activation=${gesture.activation}`,
  );

  checks.push({
    name: 'sound.a-user-gesture-starts-the-audio-clock',
    ok:
      shut === 'suspended' &&
      gesture.before === 'suspended' &&
      gesture.after === 'running' &&
      gesture.activation === true,
    detail:
      `the run shut the clock from outside the engine and it read ${shut}. A real click ` +
      `through the driver then ran the application's resume. The context read ` +
      `${gesture.before} inside the handler before that call and ${gesture.after} after it, ` +
      `with navigator.userActivation.isActive=${gesture.activation}. The transition this ` +
      `check needs is suspended to running, and only the engine's resume can make it.`,
  });

  // --- throw two: sound on -------------------------------------------------
  await throwForSound(page, TWELVE_DIE_NOTATION);
  const on = await readSoundState(page);
  const heard = {
    impacts: on.counts.impacts - off.counts.impacts,
    dispatches: on.dispatches - off.dispatches,
    pairs: on.pairs - off.pairs,
  };
  console.log(
    `browser: sound ON collisions=${heard.dispatches} pairs=${heard.pairs} ` +
      `die=${on.kinds.die - off.kinds.die} surface=${on.kinds.surface - off.kinds.surface} ` +
      `triggers=${on.counts.triggers} paired=${on.counts.paired} quiet=${on.counts.quiet} ` +
      `distinct_world_steps=${on.distinctSteps - off.distinctSteps} ` +
      `impact_speed ${spread(on.speeds.slice(off.speeds.length))}`,
  );

  const accounted = on.counts.triggers + on.counts.paired + on.counts.quiet;
  checks.push({
    name: 'sound.every-collision-reaches-the-engine-and-is-accounted-for',
    ok:
      heard.impacts === heard.dispatches &&
      accounted === heard.impacts &&
      on.counts.triggers > 0 &&
      heard.pairs > 0 &&
      heard.dispatches >= heard.pairs,
    detail:
      `the tray handed the engine ${heard.impacts} collisions over this throw and this file ` +
      `counted ${heard.dispatches} for itself off the same hook. The engine says ` +
      `${on.counts.triggers} started a voice, ${on.counts.paired} were the second report of ` +
      `one die-on-die contact and ${on.counts.quiet} were too soft, which is ${accounted} ` +
      `and must equal ${heard.impacts}. The physics world reported ${heard.pairs} new ` +
      `contacts by its own beginContact route, and a collision event may carry more than one ` +
      `contact point, so the dispatch count may not fall below it. Every floor is 1.`,
  });

  // An `AudioParam` holds a 32-bit float, so a level written as 0.4 reads back
  // as the nearest float32. The comparison rounds the same way rather than
  // carrying a tolerance, so it stays exact.
  const wanted = Math.fround(SOUND_TEST_VOLUME);
  checks.push({
    name: 'sound.the-stored-volume-reaches-the-output-gain',
    ok: on.gain === wanted && enabled.storedVolume === SOUND_TEST_VOLUME,
    detail:
      `the record in storage holds ${enabled.storedVolume} and the gain every voice passes ` +
      `through reads ${on.gain}, against the ${wanted} an AudioParam holds for ` +
      `${SOUND_TEST_VOLUME}. The run wrote ${SOUND_TEST_VOLUME}, which is neither the default ` +
      `the settings module ships nor the 1 the engine starts at, so a level that never left ` +
      `storage fails here.`,
  });

  // --- what the graph actually renders --------------------------------------
  const rendered = await page.evaluate(
    async ({ seconds, rate, volume, lowHz, highHz, skip }) => {
      const { sound, impacts } = window.__sound;
      // The collisions of the sounded throw only. The silent throw came first.
      const heard = impacts.slice(skip);
      // The energy of one band of an already rendered buffer. The samples go
      // back through one more offline pass, so what is measured is the audio
      // the graph produced and not a model of it. A flat corner needs a Q of
      // 20*log10(1/sqrt(2)), because the specification reads the Q of a
      // low-pass and of a high-pass in decibels.
      const bandEnergy = async (buffer, type, hz) => {
        const ctx = new OfflineAudioContext(1, buffer.length, buffer.sampleRate);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = type;
        filter.frequency.value = hz;
        filter.Q.value = -3.01;
        source.connect(filter).connect(ctx.destination);
        source.start(0);
        const out = await ctx.startRendering();
        let sum = 0;
        for (const value of out.getChannelData(0)) sum += value * value;
        return sum;
      };

      const render = async (level) => {
        const ctx = new OfflineAudioContext(1, Math.ceil(seconds * rate), rate);
        // The spread is pinned, so the two renders differ only in the level.
        const engine = sound.createSoundEngine({
          volume: level,
          createContext: () => ctx,
          spread: () => 0.5,
        });
        engine.enable();
        for (const one of heard) engine.impact(one);
        const buffer = await ctx.startRendering();
        let peak = 0;
        for (const value of buffer.getChannelData(0)) peak = Math.max(peak, Math.abs(value));
        return {
          peak,
          triggers: engine.counts.triggers,
          hasContext: engine.context !== null,
          buffer,
        };
      };
      const loud = await render(volume);
      const shut = await render(0);
      const low = await bandEnergy(loud.buffer, 'lowpass', lowHz);
      const high = await bandEnergy(loud.buffer, 'highpass', highHz);
      delete loud.buffer;
      delete shut.buffer;

      // The same recorded collisions, through the same pure function the engine
      // uses. A stream that made one sound over and over shows one level here.
      const voices = heard
        .filter((one) => !(one.kind === 'die' && one.self > one.other))
        .map((one) => sound.voiceOf(one, 0.5))
        .filter((voice) => voice !== null);
      return {
        loud,
        shut,
        low,
        high,
        recomputedTriggers: voices.length,
        distinctLevels: new Set(voices.map((voice) => voice.level.toFixed(4))).size,
        kinds: new Set(heard.map((one) => one.kind)).size,
      };
    },
    {
      seconds: RENDER_SECONDS,
      rate: RENDER_RATE,
      volume: SOUND_TEST_VOLUME,
      lowHz: LOW_BAND_HZ,
      highHz: HIGH_BAND_HZ,
      skip: off.dispatches,
    },
  );
  const bandRatio = rendered.low / rendered.high;
  console.log(
    `browser: sound render peak_at_${SOUND_TEST_VOLUME}=${rendered.loud.peak.toFixed(6)} ` +
      `peak_at_0=${rendered.shut.peak.toFixed(6)} rendered_triggers=${rendered.loud.triggers} ` +
      `distinct_levels=${rendered.distinctLevels} kinds=${rendered.kinds}`,
  );
  console.log(
    `browser: sound bands low_under_${LOW_BAND_HZ}=${rendered.low.toExponential(3)} ` +
      `high_over_${HIGH_BAND_HZ}=${rendered.high.toExponential(3)} ratio=${bandRatio.toFixed(1)} ` +
      `floor=${LOW_OVER_HIGH_FLOOR}`,
  );

  checks.push({
    name: 'sound.the-low-band-carries-the-sound',
    // A high band of 0 would make the ratio infinite, so it is named. A low
    // band of 0 cannot decide anything the ratio does not decide already.
    ok: bandRatio >= LOW_OVER_HIGH_FLOOR && rendered.high > 0,
    detail:
      `the rendered throw carries ${rendered.low.toExponential(3)} of energy under ` +
      `${LOW_BAND_HZ} Hz against ${rendered.high.toExponential(3)} over ${HIGH_BAND_HZ} Hz, a ` +
      `ratio of ${bandRatio.toFixed(1)} against a floor of ${LOW_OVER_HIGH_FLOOR}. Both bands ` +
      `are measured by sending the rendered samples through one more offline pass, so this ` +
      `judges the audio the graph made and not the numbers the module holds. The peak check ` +
      `above says a sound was made and says nothing about what it is: a bright single band ` +
      `over noise passes it and is heard as tinny. This is the check that fails on that sound.`,
  });

  checks.push({
    name: 'sound.a-level-of-zero-renders-silence-and-is-not-the-same-as-off',
    ok:
      rendered.loud.peak > 0 &&
      rendered.shut.peak === 0 &&
      rendered.shut.triggers === rendered.loud.triggers &&
      rendered.shut.triggers > 0 &&
      rendered.shut.hasContext,
    detail:
      `the collisions of this throw were rendered twice through the same graph. At ` +
      `${SOUND_TEST_VOLUME} the peak sample is ${rendered.loud.peak.toFixed(6)} and at 0 it is ` +
      `${rendered.shut.peak.toFixed(6)}. Both renders started ${rendered.shut.triggers} ` +
      `voices and both hold a context, so a level of 0 is a shut output and not the off ` +
      `state, which builds nothing and starts nothing. The peak is measured off the rendered ` +
      `samples, not read off the gain the engine was given. An offline context has no clock ` +
      `of its own, so this render puts the whole throw at one instant and its peak is far ` +
      `above what a player hears. It is an instrument, not the playback path.`,
  });

  checks.push({
    name: 'sound.one-throw-is-not-one-sound-repeated',
    ok:
      rendered.recomputedTriggers === on.counts.triggers &&
      rendered.distinctLevels > 1 &&
      rendered.kinds === 2 &&
      on.distinctSteps - off.distinctSteps > 1,
    detail:
      `the recorded collisions were put back through the same voice function, at one fixed ` +
      `spread, and gave ${rendered.recomputedTriggers} voices against the ` +
      `${on.counts.triggers} the engine started. They carry ${rendered.distinctLevels} ` +
      `distinct levels, against a floor of 2, and cover ${rendered.kinds} of the 2 kinds a ` +
      `tray has. They arrived over ${on.distinctSteps - off.distinctSteps} distinct steps of ` +
      `the physics clock, against a floor of 2, so they are not one instant. The pitch of a ` +
      `voice moves with a drawn spread as well, which src/tray/sound.test.ts holds.`,
  });

  if (options.capture) await captureTray(page, options.capture);
}

// ---------------------------------------------------------------------------
// The settings store — Unit 4.1, the localStorage binding
//
// The migration is already held by `src/settings/settings.test.ts`, which runs
// under a plain test runner over hand-made objects. Nothing there touches a
// browser. This run drives the same claims through the real binding, which is
// the half no check had ever exercised: a real `localStorage`, a real value
// read back out of it, a real refusal, and a real quota error raised by the
// browser after the run fills the store.
// ---------------------------------------------------------------------------

const SETTINGS_MODULES = ['src/settings/settings.ts', 'src/settings/local-store.ts'];

/**
 * Two readings of one settings field are the same.
 *
 * Identity is the wrong test for a field that holds a list. Unit 4.3 added
 * `poolPresets`, every read of the record builds a new array, and two arrays of
 * the same presets in the same order are the same setting.
 */
export function sameSetting(left, right) {
  if (typeof left === 'object' && left !== null) {
    return JSON.stringify(left) === JSON.stringify(right);
  }
  return left === right;
}

/**
 * A settings record the page wrote as JSON text.
 *
 * **Every record crosses the connection as text, and none crosses as an
 * object.** The driver serialises a repeated object reference once and delivers
 * every later reference to that same object as `undefined`. `readSettings`
 * answers the one frozen defaults record for every unusable stored value, and
 * that record holds one frozen `poolPresets` array, so a return value carrying
 * two such reads carried the array once: the first read arrived with `[]` and
 * every later one arrived with the field missing.
 *
 * Measured on this host on 2026-08-09, against `--settings-store`. It read as a
 * migration defect and it is a defect of this file: three checks compared `[]`
 * against `undefined` and failed, and the five cases that arrived with the
 * field missing on both sides compared `undefined` against `undefined` and
 * could not have failed at all.
 *
 * Text is a primitive, so no two fields of one return value can share it.
 */
function recordFromPage(text) {
  return text === null || text === undefined ? null : JSON.parse(text);
}

/** A record no default holds, so a read that answers the defaults cannot pass. */
const SETTINGS_FIXTURE = {
  mode: 'step',
  presetId: 'step-banes-cost-health',
  artifactCurve: 'artifactFlat',
  flatFallback: true,
  soundEnabled: true,
  soundVolume: 0.25,
};

/**
 * Stored values that must all read as the defaults.
 *
 * The first is the plan's own acceptance for Unit 4.1. The rest are what a real
 * `localStorage` holds after a bad write, a half-finished write or a hand edit,
 * and every one of them is a string, because a string is all `localStorage`
 * ever holds.
 */
const CORRUPT_STORED_VALUES = [
  { name: 'an unknown stored version', raw: '{"version":99,"mode":"step","soundVolume":0.1}' },
  { name: 'text that is not JSON at all', raw: 'not json{' },
  { name: 'a JSON array', raw: '[1,2,3]' },
  { name: 'a JSON string', raw: '"pool"' },
  { name: 'an empty value', raw: '' },
  { name: 'JSON null', raw: 'null' },
];

async function runSettingsStore(page, options, checks) {
  const urls = SETTINGS_MODULES.map((path) => new URL(path, options.url).href);

  // --- a real value, written and read back through the binding --------------
  const trip = await page.evaluate(
    async ({ urls, fixture }) => {
      const [settings, binding] = await Promise.all(urls.map((url) => import(url)));
      window.__settings = { settings, binding };
      window.localStorage.clear();
      const store = binding.localSettingsStore();
      const wanted = { ...settings.DEFAULT_SETTINGS, ...fixture };
      const wrote = settings.writeSettings(store, wanted);
      // A second call to the binding, so the read cannot ride the write's copy.
      const read = settings.readSettings(binding.localSettingsStore());
      return {
        isRealStorage: store === window.localStorage,
        wrote,
        raw: window.localStorage.getItem(settings.SETTINGS_KEY),
        // Text, not objects. `recordFromPage` says why.
        read: JSON.stringify(read),
        wanted: JSON.stringify(wanted),
        defaults: JSON.stringify(settings.DEFAULT_SETTINGS),
        fields: Object.keys(settings.DEFAULT_SETTINGS),
      };
    },
    { urls, fixture: SETTINGS_FIXTURE },
  );
  trip.read = recordFromPage(trip.read);
  trip.wanted = recordFromPage(trip.wanted);
  trip.defaults = recordFromPage(trip.defaults);

  const wrong = [];
  let comparedFields = 0;
  let movedFields = 0;
  for (const field of trip.fields) {
    comparedFields += 1;
    if (!sameSetting(trip.read[field], trip.wanted[field])) {
      wrong.push(`${field} was written as ${trip.wanted[field]} and reads ${trip.read[field]}`);
    }
    if (!sameSetting(trip.wanted[field], trip.defaults[field])) movedFields += 1;
  }
  console.log(
    `browser: settings-store round trip wrote=${trip.wrote} fields=${comparedFields} ` +
      `moved_off_default=${movedFields} raw_bytes=${trip.raw === null ? 'none' : trip.raw.length}`,
  );
  checks.push({
    name: 'settings-store.a-real-localstorage-round-trip',
    ok:
      trip.isRealStorage &&
      trip.wrote === true &&
      wrong.length === 0 &&
      comparedFields === trip.fields.length &&
      trip.fields.length > 0 &&
      movedFields >= 6,
    detail:
      `the binding answered the page's own localStorage=${trip.isRealStorage}, the write ` +
      `answered ${trip.wrote}, and ${comparedFields} of the ${trip.fields.length} fields of the ` +
      `record were compared after a read through a second call to the binding. ` +
      `${movedFields} of them are off the default, against a floor of 6, so a binding that ` +
      `always answers the defaults fails here. The stored text is ` +
      `${trip.raw === null ? 'absent' : `${trip.raw.length} characters`}. failures=${wrong.length}` +
      (wrong.length ? ` [${wrong.join('; ')}]` : ''),
  });

  // --- every unusable stored value reads as the defaults --------------------
  const corrupt = await page.evaluate(async (cases) => {
    const { settings, binding } = window.__settings;
    return cases.map((one) => {
      window.localStorage.clear();
      window.localStorage.setItem(settings.SETTINGS_KEY, one.raw);
      try {
        const read = settings.readSettings(binding.localSettingsStore());
        return {
          name: one.name,
          threw: null,
          // Text. `readSettings` answers the one frozen defaults record for
          // every unusable value, so six cases here hand back six references to
          // one object, and `recordFromPage` says what the connection does with
          // those.
          read: JSON.stringify(read),
          storedRaw: window.localStorage.getItem(settings.SETTINGS_KEY),
        };
      } catch (error) {
        return { name: one.name, threw: String(error), read: null, storedRaw: one.raw };
      }
    });
  }, CORRUPT_STORED_VALUES);

  const defaults = trip.defaults;
  const corruptFailures = [];
  let corruptCompared = 0;
  // Every field of every case, counted. The count is the denominator of the
  // claim in the detail below: a field that arrives missing on both sides
  // compares equal and reads as a pass, so the comparisons have to be counted
  // rather than trusted.
  let corruptFieldsCompared = 0;
  for (const [index, one] of corrupt.entries()) {
    const wanted = CORRUPT_STORED_VALUES[index];
    corruptCompared += 1;
    if (one.threw !== null) {
      corruptFailures.push(`${one.name} threw ${one.threw}`);
      continue;
    }
    if (one.storedRaw !== wanted.raw) {
      corruptFailures.push(`${one.name} never reached localStorage`);
      continue;
    }
    const read = recordFromPage(one.read);
    const differs = [];
    for (const field of trip.fields) {
      if (read[field] === undefined || defaults[field] === undefined) {
        differs.push(`${field}, which arrived from the page as nothing at all`);
        continue;
      }
      corruptFieldsCompared += 1;
      if (!sameSetting(read[field], defaults[field])) differs.push(field);
    }
    if (differs.length > 0) {
      corruptFailures.push(`${one.name} read ${differs.join(', ')} away from the defaults`);
    }
  }
  const corruptFieldsWanted = CORRUPT_STORED_VALUES.length * trip.fields.length;
  console.log(
    `browser: settings-store corrupt values=${corruptCompared} ` +
      `fields=${corruptFieldsCompared} of ${corruptFieldsWanted} ` +
      `failures=${corruptFailures.length}`,
  );
  checks.push({
    name: 'settings-store.an-unusable-stored-value-reads-as-the-defaults',
    ok:
      corruptFailures.length === 0 &&
      corruptCompared === CORRUPT_STORED_VALUES.length &&
      corruptFieldsCompared === corruptFieldsWanted &&
      CORRUPT_STORED_VALUES.length > 0,
    detail:
      `checked=${corruptCompared} of ${CORRUPT_STORED_VALUES.length} stored values, each one ` +
      `put into the page's own localStorage as text and read back through the binding: ` +
      `${CORRUPT_STORED_VALUES.map((one) => one.name).join(', ')}. Every read must equal the ` +
      `defaults over all ${trip.fields.length} fields and none may throw. This run compared ` +
      `${corruptFieldsCompared} of the ${corruptFieldsWanted} field readings the cases and the ` +
      `default record name between them, and the field list comes from the default record ` +
      `itself, so a field added later is compared here without an edit. A field that arrives ` +
      `from the page as nothing is counted as a failure and never as a match. The first case is ` +
      `the plan's own acceptance for this unit, asserted here through the real store rather than ` +
      `over a hand-made object. failures=${corruptFailures.length}` +
      (corruptFailures.length ? ` [${corruptFailures.join('; ')}]` : ''),
  });

  // --- a browser that refuses storage altogether ----------------------------
  const refused = await page.evaluate(async () => {
    const { settings, binding } = window.__settings;
    const held = Object.getOwnPropertyDescriptor(window, 'localStorage');
    // A browser with site data turned off throws from the property itself,
    // before any read. Safari in a private window is the same shape.
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new DOMException('The operation is insecure.', 'SecurityError');
      },
    });
    let landed = false;
    try {
      void window.localStorage;
    } catch {
      landed = true;
    }
    const answer = { landed, threw: null, store: 'unread', read: null, wrote: null, fell: null };
    try {
      const store = binding.localSettingsStore();
      answer.store = store === null ? 'null' : 'a store';
      answer.read = JSON.stringify(settings.readSettings(store));
      answer.wrote = settings.writeSettings(store, { ...settings.DEFAULT_SETTINGS, mode: 'step' });
      answer.fell = settings.recordFlatFallback(store).flatFallback;
    } catch (error) {
      answer.threw = String(error);
    }
    if (held) Object.defineProperty(window, 'localStorage', held);
    answer.restored = window.localStorage instanceof Storage;
    return answer;
  });

  const refusedRead = recordFromPage(refused.read);
  const refusedDrift =
    refusedRead === null
      ? ['nothing was read']
      : trip.fields.filter((field) => !sameSetting(refusedRead[field], defaults[field]));
  console.log(
    `browser: settings-store refused injection_landed=${refused.landed} ` +
      `binding=${refused.store} wrote=${refused.wrote} fell=${refused.fell} ` +
      `threw=${refused.threw ?? 'nothing'} restored=${refused.restored}`,
  );
  checks.push({
    name: 'settings-store.a-refused-store-falls-back-to-the-defaults-without-throwing',
    ok:
      refused.landed &&
      refused.threw === null &&
      refused.store === 'null' &&
      refused.wrote === false &&
      refused.fell === true &&
      refusedDrift.length === 0 &&
      refused.restored,
    detail:
      `the run made the localStorage property throw a SecurityError and proved the injection ` +
      `landed by reading it: landed=${refused.landed}. The binding then answered ` +
      `${refused.store}, the read matched the defaults over ` +
      `${trip.fields.length - refusedDrift.length} of ${trip.fields.length} fields, the write ` +
      `answered ${refused.wrote} and the permanent fall to flat still answered ${refused.fell} ` +
      `from memory. Nothing threw: ${refused.threw ?? 'no error'}. The property was put back ` +
      `and reads as a Storage again: ${refused.restored}. drift=${refusedDrift.length}` +
      (refusedDrift.length ? ` [${refusedDrift.join(', ')}]` : ''),
  });

  // --- a full store -------------------------------------------------------
  const full = await page.evaluate(async () => {
    const { settings, binding } = window.__settings;
    window.localStorage.clear();
    // Fill until the browser refuses, at three block sizes, so the store is
    // full to within a few bytes and a small record cannot slip into the
    // headroom the last big block left.
    let bytes = 0;
    let name = null;
    let blocks = 0;
    for (const size of [65536, 1024, 64]) {
      const block = 'x'.repeat(size);
      for (let i = 0; i < 20000; i += 1) {
        try {
          window.localStorage.setItem(`clatter.filler.${size}.${i}`, block);
          bytes += size;
          blocks += 1;
        } catch (error) {
          name = error instanceof DOMException ? error.name : String(error);
          break;
        }
      }
    }
    const answer = { bytes, blocks, name, threw: null, wrote: null, read: null };
    try {
      answer.wrote = settings.writeSettings(binding.localSettingsStore(), {
        ...settings.DEFAULT_SETTINGS,
        mode: 'step',
      });
      answer.read = JSON.stringify(settings.readSettings(binding.localSettingsStore()));
    } catch (error) {
      answer.threw = String(error);
    }
    window.localStorage.clear();
    return answer;
  });

  const fullRead = recordFromPage(full.read);
  const fullDrift =
    fullRead === null
      ? ['nothing was read']
      : trip.fields.filter((field) => !sameSetting(fullRead[field], defaults[field]));
  console.log(
    `browser: settings-store quota filled_bytes=${full.bytes} blocks=${full.blocks} ` +
      `error=${full.name} wrote=${full.wrote} threw=${full.threw ?? 'nothing'}`,
  );
  checks.push({
    name: 'settings-store.a-full-store-refuses-the-write-without-throwing',
    ok:
      full.name === 'QuotaExceededError' &&
      full.wrote === false &&
      full.threw === null &&
      fullDrift.length === 0 &&
      full.bytes > 0,
    detail:
      `the run filled localStorage with ${full.blocks} blocks over ${full.bytes} characters, at ` +
      `65536, 1024 and 64 characters each, until the browser raised ${full.name}. Nothing ` +
      `simulates that error: the browser raised it. The settings write then answered ` +
      `${full.wrote} rather than throwing (${full.threw ?? 'no error'}), and the read that ` +
      `follows a refused write matched the defaults over ` +
      `${trip.fields.length - fullDrift.length} of ${trip.fields.length} fields. ` +
      `drift=${fullDrift.length}` +
      (fullDrift.length ? ` [${fullDrift.join(', ')}]` : ''),
  });
}

// ---------------------------------------------------------------------------
// The roll log store — Unit 4.4, the IndexedDB half
//
// The two acceptances the plan writes are the two that can pass for the wrong
// reason, and both are answered here.
//
// **Two connections.** One connection proves the ring invariant only in
// isolation, because nothing can interleave with it. So the buffer is filled to
// capacity, and then two connections write on top of it at the same time,
// neither awaiting the other. The order they wrote in is taken from the key
// each insert was acknowledged with, never from the buffer afterwards, where
// the trim has already been. The survivors must be exactly the newest 5,000 of
// what the two connections wrote between them, and the denominator is counted
// over every roll this file handed to the store.
//
// **No long task over 50 ms.** Two instruments run over the whole fill. A
// `PerformanceObserver` for `longtask` where the browser has one, and a timer
// that re-arms itself, whose longest gap between two consecutive tasks is how
// long the main thread was blocked. The tick count is the second instrument's
// own denominator, so a watchdog that never ran fails rather than reports zero.
// `--long-task-ms <n>` blocks the thread for n ms inside the fill, which is how
// the check is shown to fail.
// ---------------------------------------------------------------------------

const LOG_STORE_MODULE = 'src/log/store.ts';
/** Rolls per insert transaction while the buffer fills. */
const LOG_FILL_BATCH = 25;
/** Rolls each connection writes, one per transaction, in the concurrent phase. */
const LOG_ROLLS_PER_CONNECTION = 200;
/** The plan's ceiling. A task over this long drops a frame on any device. */
const MAX_LONG_TASK_MS = 50;
/** Two connections must hand over at least this often, or nothing interleaved. */
const MIN_CONNECTION_HANDOVERS = 10;

/**
 * Import the store, count the calls it makes to the storage manager, and clear
 * any database an earlier run left behind.
 */
/**
 * Count every real call to the browser's storage manager, from the first line
 * of script the page runs.
 *
 * **It is installed before the document, and that is not a convenience.** The
 * application itself asks for persistent storage at startup, through
 * `openRollLog`, so a proxy installed after the page had loaded would see zero
 * calls and would report a memo that was already spent as a method nobody
 * called. Unit 4.4's screen half added that call and this instrument went blind
 * to it: measured on 2026-08-10, the check read `calls=0` and went red, and it
 * read `calls=1` again with the application's own call taken out.
 *
 * With the count starting before the page, the claim is stronger than it was:
 * the application AND this file together ask the browser exactly once.
 */
async function countPersistCalls(page) {
  await page.evaluateOnNewDocument(() => {
    window.__persist = { calls: 0 };
    const manager = navigator.storage;
    if (manager && manager.persist) {
      const real = manager.persist.bind(manager);
      manager.persist = () => {
        window.__persist.calls += 1;
        return real();
      };
    }
  });
  await page.reload({ waitUntil: 'load' });
}

async function bootLogStore(page, pageUrl, noteChars = 0) {
  const moduleUrl = new URL(LOG_STORE_MODULE, pageUrl).href;
  return page.evaluate(
    async ({ moduleUrl, fillBatch, noteChars }) => {
      const store = await import(moduleUrl);

      // Every row of the export repeats the roll's note, so the note length is
      // the one field that moves the file size by the row count. `--note-chars`
      // pads it, which is how the two import-cap checks are shown to fail: the
      // room a full export leaves is a few characters a row and no more.
      const FIXTURE_NOTE = 'a representative note';
      const note =
        noteChars > FIXTURE_NOTE.length ? FIXTURE_NOTE.padEnd(noteChars, 'x') : FIXTURE_NOTE;

      /** A roll of the shape the log really holds: twelve dice, three generations. */
      const makeEntry = (writer, ordinal) => {
        const dice = [];
        for (let die = 0; die < 12; die += 1) {
          const cells = [];
          for (let generation = 0; generation < 3; generation += 1) {
            cells.push(
              generation === 2 && die % 3 === 0
                ? null
                : {
                    value: ((die + generation) % 6) + 1,
                    successes: (die + generation) % 2,
                    locked: die % 2 === 0,
                  },
            );
          }
          dice.push({ type: 'attribute', faces: 6, cells });
        }
        return {
          rollId: `${writer}-${String(ordinal).padStart(6, '0')}`,
          timestampIso: '2026-08-09T00:00:00.000Z',
          ruleset: 'pool-banes-damage-ratings',
          profileHash: 'a'.repeat(64),
          mode: 'pool',
          dice,
          successes: 3,
          banes: 1,
          pushCount: 2,
          costType: 'ratingPoint',
          costAmount: 1,
          stressBefore: 0,
          stressAfter: 1,
          note,
        };
      };

      /**
       * Two instruments over the main thread. The observer where the browser
       * has one, and a timer that re-arms itself: the gap between two of its
       * ticks is how long the thread was busy, whatever caused it.
       */
      const startWatch = () => {
        const held = { gaps: [], longtasks: [], supported: false, ticks: 0, observer: null };
        try {
          const types = PerformanceObserver.supportedEntryTypes ?? [];
          held.supported = types.includes('longtask');
          if (held.supported) {
            held.observer = new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) held.longtasks.push(entry.duration);
            });
            held.observer.observe({ type: 'longtask', buffered: true });
          }
        } catch {
          held.supported = false;
        }
        let last = performance.now();
        let running = true;
        const tick = () => {
          const now = performance.now();
          held.gaps.push(now - last);
          held.ticks += 1;
          last = now;
          if (running) setTimeout(tick, 0);
        };
        setTimeout(tick, 0);
        held.stop = () => {
          running = false;
          if (held.observer) held.observer.disconnect();
        };
        return held;
      };

      window.__logStore = {
        store,
        makeEntry,
        startWatch,
        fillBatch,
        noteChars: note.length,
        connections: {},
        written: [],
      };

      await new Promise((resolve) => {
        const request = indexedDB.deleteDatabase(store.DB_NAME);
        request.onsuccess = resolve;
        request.onerror = resolve;
        request.onblocked = resolve;
      });
      return {
        capacity: store.RING_CAPACITY,
        dbName: store.DB_NAME,
        storeName: store.STORE_NAME,
        version: store.DB_VERSION,
        noteChars: note.length,
      };
    },
    { moduleUrl, fillBatch: LOG_FILL_BATCH, noteChars },
  );
}

/** Fill the buffer to capacity, with both instruments running. */
async function fillLogBuffer(page, longTaskMs) {
  return page.evaluate(
    async ({ longTaskMs }) => {
      const held = window.__logStore;
      const { store, makeEntry } = held;
      const opened = await store.openLog();
      if (opened.kind !== 'open') {
        return { failed: `openLog answered ${opened.kind}: ${opened.reason}` };
      }
      held.connections.a = opened.db;

      const watch = held.startWatch();
      const started = performance.now();
      let ordinal = 0;
      let batches = 0;
      let dropped = 0;
      while (ordinal < store.RING_CAPACITY) {
        const size = Math.min(held.fillBatch, store.RING_CAPACITY - ordinal);
        const entries = [];
        for (let i = 0; i < size; i += 1) {
          entries.push(makeEntry('fill', ordinal));
          ordinal += 1;
        }
        const result = await store.appendRolls(opened.db, entries);
        if (result.kind !== 'written') {
          watch.stop();
          return { failed: `appendRolls answered ${result.kind}: ${result.reason}` };
        }
        dropped += result.dropped;
        // One transaction, so the batch holds the keys that end at this one.
        for (const [i, entry] of entries.entries()) {
          held.written.push({
            id: entry.rollId,
            writer: 'fill',
            key: result.newestKey - size + 1 + i,
          });
        }
        batches += 1;
        // The block goes inside the fill, so the check measures a long task
        // during the insert it is written about.
        if (longTaskMs > 0 && batches === 2) {
          const until = performance.now() + longTaskMs;
          while (performance.now() < until) {
            /* block the main thread */
          }
        }
      }
      const elapsed = performance.now() - started;
      watch.stop();
      // The observer delivers its records in a later task.
      await new Promise((resolve) => setTimeout(resolve, 100));
      return {
        failed: null,
        written: ordinal,
        batches,
        dropped,
        elapsed,
        ticks: watch.ticks,
        supported: watch.supported,
        longestGap: watch.gaps.length ? Math.max(...watch.gaps) : null,
        longestTask: watch.longtasks.length ? Math.max(...watch.longtasks) : null,
        tasksOverCeiling: watch.longtasks.length,
        heldNow: (await store.readRolls(opened.db)).length,
      };
    },
    { longTaskMs },
  );
}

/** Two connections writing on a full buffer, neither waiting for the other. */
async function writeFromTwoConnections(page, perConnection) {
  return page.evaluate(
    async ({ perConnection }) => {
      const held = window.__logStore;
      const { store, makeEntry } = held;
      const second = await store.openLog();
      if (second.kind !== 'open') {
        return { failed: `the second openLog answered ${second.kind}: ${second.reason}` };
      }
      held.connections.b = second.db;

      /**
       * The committed buffer, read in this connection's own readonly
       * transaction: how many rolls it holds and the keys at each end. It never
       * asks the module a question — the count and the two cursors are the
       * browser's own answers about the database.
       *
       * A ring buffer at capacity owes its invariant at every committed state,
       * not only when the writing stops. An insert and a trim in two
       * transactions leave the buffer one roll short between them, and that
       * roll is one the player could still see. The end state hides it, because
       * the next insert refills the buffer and the roll destroyed early is one
       * the buffer would have dropped a moment later anyway.
       */
      const observe = (db) =>
        new Promise((resolve, reject) => {
          const transaction = db.transaction(store.STORE_NAME, 'readonly');
          const rolls = transaction.objectStore(store.STORE_NAME);
          const counted = rolls.count();
          const oldest = rolls.openKeyCursor(null, 'next');
          const newest = rolls.openKeyCursor(null, 'prev');
          transaction.oncomplete = () =>
            resolve({
              count: counted.result,
              oldestKey: oldest.result ? Number(oldest.result.key) : null,
              newestKey: newest.result ? Number(newest.result.key) : null,
            });
          transaction.onabort = () => reject(transaction.error ?? new Error('the read aborted'));
        });

      const order = [];
      const observations = [];
      const write = async (db, writer) => {
        const rows = [];
        for (let i = 0; i < perConnection; i += 1) {
          const entry = makeEntry(writer, i);
          const result = await store.appendRolls(db, [entry]);
          if (result.kind !== 'written') {
            throw new Error(`${writer} roll ${i}: ${result.kind} ${result.reason}`);
          }
          rows.push({ id: entry.rollId, writer, key: result.newestKey, dropped: result.dropped });
          order.push(writer);
          observations.push({ writer, at: i, ...(await observe(db)) });
        }
        return rows;
      };

      let rows;
      try {
        // Neither promise awaits the other, so the transactions of the two
        // connections interleave and the browser decides the order.
        const [fromA, fromB] = await Promise.all([
          write(held.connections.a, 'a'),
          write(second.db, 'b'),
        ]);
        rows = [...fromA, ...fromB];
      } catch (error) {
        return { failed: String(error) };
      }
      for (const row of rows) held.written.push(row);

      const kept = await store.readRolls(held.connections.a);
      return {
        failed: null,
        wrote: rows.length,
        written: held.written.map((row) => ({ id: row.id, key: row.key, writer: row.writer })),
        completionOrder: order,
        observations,
        held: kept.map((entry) => entry.rollId),
        dice: kept.length > 0 ? kept[kept.length - 1].dice.length : 0,
      };
    },
    { perConnection },
  );
}

function judgeLongTasks(fill, checks) {
  const instruments = [];
  if (fill.longestGap !== null) instruments.push(`a re-arming timer over ${fill.ticks} ticks`);
  if (fill.supported) instruments.push('a PerformanceObserver for longtask');
  const longest = Math.max(fill.longestGap ?? 0, fill.longestTask ?? 0);
  const named =
    fill.longestTask !== null && fill.longestTask >= (fill.longestGap ?? 0)
      ? `the observer measured ${fill.longestTask.toFixed(1)} ms`
      : `the timer measured a gap of ${(fill.longestGap ?? 0).toFixed(1)} ms`;
  checks.push({
    name: 'log-store.no-long-task-over-the-ceiling-during-a-full-buffer-insert',
    ok:
      longest <= MAX_LONG_TASK_MS &&
      fill.ticks >= fill.batches &&
      fill.batches > 0 &&
      instruments.length > 0,
    detail:
      `${fill.written} rolls went in over ${fill.batches} transactions in ` +
      `${fill.elapsed.toFixed(0)} ms, watched by ${instruments.join(' and ')}. The longest task ` +
      `is ${longest.toFixed(1)} ms against a ceiling of ${MAX_LONG_TASK_MS} ms: ${named}. This ` +
      `browser ${fill.supported ? 'has' : 'has no'} longtask entry type, and it reported ` +
      `${fill.tasksOverCeiling} such entries. The timer ticked ${fill.ticks} times against a ` +
      `floor of ${fill.batches}, which is its own denominator: a watchdog that never ran fails ` +
      `here rather than reporting nothing.`,
  });
}

function judgeRingBuffer(booted, phase, checks) {
  const capacity = booted.capacity;
  const byKey = [...phase.written].sort((left, right) => left.key - right.key);
  const keys = new Set(byKey.map((row) => row.key));
  const expected = byKey.slice(-capacity).map((row) => row.id);
  const wroteByWriter = new Map();
  for (const row of phase.written) {
    wroteByWriter.set(row.writer, (wroteByWriter.get(row.writer) ?? 0) + 1);
  }
  const tally = [...wroteByWriter].map(([writer, count]) => `${writer}=${count}`).join(' ');

  checks.push({
    name: 'log-store.the-buffer-holds-exactly-its-capacity',
    ok:
      phase.held.length === capacity &&
      phase.written.length > capacity &&
      keys.size === phase.written.length,
    detail:
      `the buffer holds ${phase.held.length} rolls against a capacity of exactly ${capacity}, ` +
      `after ${phase.written.length} rolls went in (${tally}). Every insert was acknowledged ` +
      `with its own key and the ${keys.size} keys are distinct, so no roll is counted twice in ` +
      `the denominator. The buffer must hold neither more nor fewer than the capacity.`,
  });

  const missing = [];
  const unexpected = [];
  const outOfOrder = [];
  const heldSet = new Set(phase.held);
  const expectedSet = new Set(expected);
  for (const id of expected) if (!heldSet.has(id)) missing.push(id);
  for (const id of phase.held) if (!expectedSet.has(id)) unexpected.push(id);
  for (const [index, id] of expected.entries()) {
    if (phase.held[index] !== id && outOfOrder.length < 5) {
      outOfOrder.push(`position ${index} holds ${phase.held[index]} and must hold ${id}`);
    }
  }
  const dropped = phase.written.length - capacity;
  const droppedIds = byKey.slice(0, Math.max(0, dropped)).map((row) => row.id);
  const droppedNewest = droppedIds.filter((id) => expectedSet.has(id));

  // Did the two connections really interleave? Two runs one after the other
  // would prove nothing about two tabs.
  let handovers = 0;
  const concurrent = byKey.filter((row) => row.writer === 'a' || row.writer === 'b');
  for (let i = 1; i < concurrent.length; i += 1) {
    if (concurrent[i].writer !== concurrent[i - 1].writer) handovers += 1;
  }

  checks.push({
    name: 'log-store.drops-oldest-never-newest-across-two-connections',
    ok:
      missing.length === 0 &&
      unexpected.length === 0 &&
      outOfOrder.length === 0 &&
      droppedNewest.length === 0 &&
      expected.length === capacity &&
      phase.held.length === capacity &&
      wroteByWriter.size === 3,
    detail:
      `two connections wrote at the same time on a buffer already at capacity. ` +
      `denominator=${phase.written.length} rolls this file handed to the store (${tally}), ` +
      `each one with the key its own insert was acknowledged with, so the order comes from the ` +
      `write path and never from the buffer the trim has already been through. The newest ` +
      `${capacity} of those keys must be exactly what the buffer holds, in that order. ` +
      `compared=${expected.length}, missing=${missing.length}, unexpected=${unexpected.length}, ` +
      `out_of_order=${outOfOrder.length}, dropped=${dropped} of which ` +
      `${droppedNewest.length} belonged to the newest ${capacity}. The two connections handed ` +
      `over ${handovers} times inside the ${concurrent.length} rolls they wrote between them.` +
      (missing.length ? ` missing [${missing.slice(0, 5).join(', ')}]` : '') +
      (unexpected.length ? ` unexpected [${unexpected.slice(0, 5).join(', ')}]` : '') +
      (droppedNewest.length ? ` wrongly dropped [${droppedNewest.slice(0, 5).join(', ')}]` : '') +
      (outOfOrder.length ? ` [${outOfOrder.join('; ')}]` : ''),
  });

  // --- the invariant at every committed state, not only at rest -------------
  //
  // The end state cannot see a roll destroyed early, because the next insert
  // refills the buffer and the roll that went is one the buffer would have
  // dropped a moment later. So each connection reads the committed buffer after
  // every one of its own writes, in its own readonly transaction, and the
  // window it holds must always be the newest `capacity` keys.
  const idOfKey = new Map(phase.written.map((row) => [row.key, row.id]));
  const lostMidFlight = [];
  const wrongWindow = [];
  let observed = 0;
  for (const one of phase.observations) {
    observed += 1;
    if (one.count === capacity && one.newestKey - one.oldestKey + 1 === capacity) continue;
    const wantedOldest = one.newestKey - capacity + 1;
    const named = [];
    for (let key = wantedOldest; key < one.oldestKey; key += 1) {
      const id = idOfKey.get(key);
      if (id) named.push(id);
    }
    for (const id of named) if (!lostMidFlight.includes(id)) lostMidFlight.push(id);
    if (wrongWindow.length < 5) {
      wrongWindow.push(
        `after ${one.writer} roll ${one.at} the buffer held ${one.count} rolls over keys ` +
          `${one.oldestKey} to ${one.newestKey}, and it must hold ${capacity} over ` +
          `${wantedOldest} to ${one.newestKey}` +
          (named.length ? `, so ${named.join(', ')} had already gone` : ''),
      );
    }
  }
  checks.push({
    name: 'log-store.the-full-buffer-never-loses-a-roll-between-two-writes',
    ok: wrongWindow.length === 0 && observed === phase.wrote && observed > 0,
    detail:
      `the committed buffer was read ${observed} times, once after each of the ${phase.wrote} ` +
      `rolls the two connections wrote, each read in its own readonly transaction through the ` +
      `browser's own count and two key cursors. Every reading must hold exactly ${capacity} ` +
      `rolls over a dense window of keys ending at the newest, because a ring buffer owes its ` +
      `invariant at every committed state and not only when the writing stops. A roll destroyed ` +
      `early is invisible at rest: the next insert refills the buffer and the roll that went is ` +
      `one the buffer would have dropped a moment later. ` +
      `readings_out_of_window=${wrongWindow.length}, rolls_lost=${lostMidFlight.length}` +
      (lostMidFlight.length ? ` [${lostMidFlight.slice(0, 5).join(', ')}]` : '') +
      (wrongWindow.length ? ` [${wrongWindow.join('; ')}]` : ''),
  });

  checks.push({
    name: 'log-store.the-two-connections-really-interleaved',
    ok: handovers >= MIN_CONNECTION_HANDOVERS && concurrent.length > 0,
    detail:
      `the writes of the two connections changed hands ${handovers} times over the ` +
      `${concurrent.length} rolls they wrote, against a floor of ${MIN_CONNECTION_HANDOVERS}. ` +
      `Without this the check above could pass on a run where one connection finished before ` +
      `the other started, which is one connection twice over and not two tabs.`,
  });
}

/** The queue is written when the page goes to the background, and not before. */
async function runVisibilityFlush(page, checks) {
  const flushed = await page.evaluate(async () => {
    const held = window.__logStore;
    const { store, makeEntry } = held;
    const db = held.connections.a;
    const writer = store.createLogWriter(db);
    const stop = store.flushOnHide(writer);
    const before = (await store.readRolls(db)).length;
    for (let i = 0; i < 3; i += 1) writer.queue(makeEntry('hide', i));
    const queued = writer.pending();
    const midway = (await store.readRolls(db)).length;

    // The page goes to the background. `visibilityState` is a getter on the
    // prototype, so an own property shadows it and `delete` puts it back.
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    });
    const landed = document.visibilityState === 'hidden';
    document.dispatchEvent(new Event('visibilitychange'));

    const deadline = Date.now() + 3000;
    while (writer.pending() > 0 && Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    const after = (await store.readRolls(db)).length;
    const ids = (await store.readRolls(db)).slice(-3).map((entry) => entry.rollId);
    delete document.visibilityState;
    stop();
    return {
      landed,
      queued,
      before,
      midway,
      after,
      pending: writer.pending(),
      ids,
      restored: document.visibilityState,
    };
  });

  console.log(
    `browser: log-store flush queued=${flushed.queued} before=${flushed.before} ` +
      `midway=${flushed.midway} after=${flushed.after} pending=${flushed.pending} ` +
      `hidden_landed=${flushed.landed} visibility_restored=${flushed.restored}`,
  );
  checks.push({
    name: 'log-store.the-queue-is-written-when-the-page-goes-to-the-background',
    ok:
      flushed.landed &&
      flushed.queued === 3 &&
      flushed.midway === flushed.before &&
      flushed.pending === 0 &&
      flushed.ids.length === 3 &&
      flushed.ids.every((id) => id.startsWith('hide-')),
    detail:
      `${flushed.queued} rolls were queued and the buffer still held ${flushed.midway} against ` +
      `the ${flushed.before} it held before, so nothing was written early. The run then made ` +
      `visibilityState read hidden (landed=${flushed.landed}) and dispatched visibilitychange. ` +
      `The queue emptied to ${flushed.pending} and the three newest rolls in the buffer are ` +
      `[${flushed.ids.join(', ')}]. The buffer is at capacity, so it holds ${flushed.after} ` +
      `either way and a count alone would prove nothing.`,
  });
}

/** The four ways a browser refuses, each with its own answer. */
async function runLogStoreRefusals(page, booted, checks) {
  // What this browser really does where storage is refused. A sandboxed frame
  // has an opaque origin and IndexedDB is refused inside it, which is the shape
  // a private window has. The error below is therefore the browser's own.
  const measured = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const frame = document.createElement('iframe');
        frame.sandbox = 'allow-scripts';
        frame.srcdoc =
          '<script>let answer;try{indexedDB.open("probe",1);answer={threw:false};}' +
          'catch(error){answer={threw:true,name:error.name,message:error.message};}' +
          'parent.postMessage(answer,"*");</scr' +
          'ipt>';
        const done = (event) => {
          window.removeEventListener('message', done);
          frame.remove();
          resolve(event.data);
        };
        window.addEventListener('message', done);
        document.body.appendChild(frame);
        setTimeout(
          () => resolve({ threw: false, name: null, message: 'the frame never answered' }),
          3000,
        );
      }),
  );
  console.log(
    `browser: log-store an opaque origin refuses IndexedDB threw=${measured.threw} ` +
      `error=${measured.name}: ${measured.message}`,
  );

  const refused = await page.evaluate(async (measured) => {
    const { store } = window.__logStore;
    const real = IDBFactory.prototype.open;
    IDBFactory.prototype.open = function throwing() {
      throw new DOMException(measured.message, measured.name ?? 'SecurityError');
    };
    let landed = false;
    try {
      indexedDB.open('injection-probe', 1);
    } catch {
      landed = true;
    }
    const answer = { landed, threw: null, kind: null, reason: null };
    try {
      const opened = await store.openLog();
      answer.kind = opened.kind;
      answer.reason = opened.reason ?? null;
    } catch (error) {
      answer.threw = String(error);
    }
    IDBFactory.prototype.open = real;
    return answer;
  }, measured);

  console.log(
    `browser: log-store refused injection_landed=${refused.landed} kind=${refused.kind} ` +
      `threw=${refused.threw ?? 'nothing'}`,
  );
  checks.push({
    name: 'log-store.a-refused-database-answers-refused',
    ok:
      measured.threw === true &&
      refused.landed &&
      refused.threw === null &&
      refused.kind === 'refused',
    detail:
      `this browser was measured first: inside a sandboxed frame, whose origin is opaque, ` +
      `indexedDB.open threw=${measured.threw} with ${measured.name}: ${measured.message}. That ` +
      `is the shape a private window has. The run then made open throw that same error, proved ` +
      `the injection landed by calling it (landed=${refused.landed}), and openLog answered ` +
      `kind=${refused.kind} reason=${refused.reason} rather than throwing ` +
      `(${refused.threw ?? 'no error'}). It must answer refused, and not the answer a full ` +
      `disk or a blocked upgrade gets.`,
  });

  // --- blocked: another connection holds an older version open --------------
  const blocked = await page.evaluate(async (name) => {
    const { store } = window.__logStore;
    const raw = await new Promise((resolve, reject) => {
      const request = indexedDB.open(name, 1);
      request.onupgradeneeded = () => request.result.createObjectStore('rolls');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    // No versionchange handler on this one, so it holds the upgrade off. That
    // is a tab on an old build, which is exactly what `blocked` is for.
    const answer = { threw: null, kind: null, reason: null };
    try {
      const opened = await store.openLog({ name, version: 2 });
      answer.kind = opened.kind;
      answer.reason = opened.reason ?? null;
    } catch (error) {
      answer.threw = String(error);
    }
    raw.close();
    await new Promise((resolve) => setTimeout(resolve, 200));
    await new Promise((resolve) => {
      const request = indexedDB.deleteDatabase(name);
      request.onsuccess = resolve;
      request.onerror = resolve;
      request.onblocked = resolve;
    });
    return answer;
  }, `${booted.dbName}-blocked-check`);

  console.log(
    `browser: log-store blocked kind=${blocked.kind} threw=${blocked.threw ?? 'nothing'}`,
  );
  checks.push({
    name: 'log-store.a-blocked-upgrade-answers-blocked',
    ok: blocked.kind === 'blocked' && blocked.threw === null,
    detail:
      `a second connection held the database open at version 1 with no versionchange handler, ` +
      `which is a tab on an old build. openLog at version 2 answered kind=${blocked.kind} ` +
      `reason=${blocked.reason} without throwing (${blocked.threw ?? 'no error'}). It must ` +
      `answer blocked, so the interface can ask the player to close the other tab rather than ` +
      `report a fault.`,
  });

  // --- versionchange: this connection gets out of the other tab's way -------
  const versionChange = await page.evaluate(async (name) => {
    const { store } = window.__logStore;
    const fired = [];
    const opened = await store.openLog({
      name,
      version: 1,
      onVersionChange: () => fired.push('versionchange'),
    });
    if (opened.kind !== 'open') return { failed: `openLog answered ${opened.kind}` };
    // The other tab, on a newer build. It is blocked only if this connection
    // stays open.
    let wasBlocked = false;
    const upgraded = await new Promise((resolve) => {
      const request = indexedDB.open(name, 2);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains('rolls')) {
          request.result.createObjectStore('rolls');
        }
      };
      request.onblocked = () => {
        wasBlocked = true;
      };
      request.onsuccess = () => resolve({ ok: true, db: request.result });
      request.onerror = () => resolve({ ok: false, reason: String(request.error) });
      setTimeout(() => resolve({ ok: false, reason: 'the upgrade never finished' }), 3000);
    });
    // The connection must be shut. A closed connection refuses a transaction,
    // and the store answers rather than throwing.
    const after = await store.appendRolls(opened.db, [window.__logStore.makeEntry('shut', 0)], {
      storeName: 'rolls',
    });
    if (upgraded.ok) upgraded.db.close();
    await new Promise((resolve) => {
      const request = indexedDB.deleteDatabase(name);
      request.onsuccess = resolve;
      request.onerror = resolve;
      request.onblocked = resolve;
    });
    return {
      failed: null,
      fired: fired.length,
      wasBlocked,
      upgraded: upgraded.ok,
      after: after.kind,
      reason: after.reason ?? null,
    };
  }, `${booted.dbName}-versionchange-check`);

  console.log(
    `browser: log-store versionchange fired=${versionChange.fired} ` +
      `other_tab_blocked=${versionChange.wasBlocked} upgraded=${versionChange.upgraded} ` +
      `write_after=${versionChange.after}`,
  );
  checks.push({
    name: 'log-store.a-versionchange-closes-this-connection',
    ok:
      versionChange.failed === null &&
      versionChange.fired === 1 &&
      versionChange.upgraded === true &&
      versionChange.wasBlocked === false &&
      versionChange.after === 'error',
    detail:
      `another tab asked for version 2 while this connection held version 1. The handler fired ` +
      `${versionChange.fired} time, the other tab's upgrade finished (${versionChange.upgraded}) ` +
      `and was never blocked (blocked=${versionChange.wasBlocked}). A write on the closed ` +
      `connection then answered kind=${versionChange.after} reason=${versionChange.reason}, ` +
      `which proves the connection really shut. Without the handler the other tab hangs for ever.`,
  });

  // --- an abort that is not a quota error answers error, not full ----------
  const notCloneable = await page.evaluate(async () => {
    const { store, makeEntry } = window.__logStore;
    const entry = makeEntry('uncloneable', 0);
    entry.note = () => 'a function cannot be cloned';
    const answer = { threw: null, kind: null, reason: null };
    try {
      const result = await store.appendRolls(window.__logStore.connections.a, [entry]);
      answer.kind = result.kind;
      answer.reason = result.reason ?? null;
    } catch (error) {
      answer.threw = String(error);
    }
    return answer;
  });

  console.log(
    `browser: log-store uncloneable kind=${notCloneable.kind} reason=${notCloneable.reason}`,
  );
  checks.push({
    name: 'log-store.an-abort-that-is-not-a-quota-error-answers-error',
    ok: notCloneable.kind === 'error' && notCloneable.threw === null,
    detail:
      `a roll carrying a value the browser cannot clone was handed to the store. It answered ` +
      `kind=${notCloneable.kind} reason=${notCloneable.reason} without throwing ` +
      `(${notCloneable.threw ?? 'no error'}). It must answer error and not full, or the ` +
      `interface tells the player the disk is full when it is not.`,
  });
}

/** Storage permission and pressure, read from the browser's own manager. */
async function runStorageManager(page, checks) {
  const asked = await page.evaluate(async () => {
    const { store } = window.__logStore;
    // A permission nobody answers leaves the promise pending for ever. The
    // browser is launched with the permission allowed, so this deadline is only
    // here to keep a run from hanging if that ever stops being true.
    const within = (promise) =>
      Promise.race([
        promise,
        new Promise((resolve) => setTimeout(() => resolve('no answer in 10 s'), 10000)),
      ]);
    const first = await within(store.persistOnce());
    const second = await within(store.persistOnce());
    const estimate = await within(store.estimateStorage());
    return { first, second, calls: window.__persist?.calls ?? -1, estimate };
  });
  console.log(
    `browser: log-store persist calls=${asked.calls} answer=${asked.first} ` +
      `usage=${asked.estimate ? asked.estimate.usage : 'none'} ` +
      `quota=${asked.estimate ? asked.estimate.quota : 'none'}`,
  );
  checks.push({
    name: 'log-store.persistence-is-asked-for-once-and-the-estimate-is-readable',
    ok:
      asked.calls === 1 &&
      asked.first === asked.second &&
      asked.estimate !== null &&
      typeof asked.estimate.usage === 'number' &&
      typeof asked.estimate.quota === 'number' &&
      asked.estimate.usage > 0,
    detail:
      `persistOnce was called twice here, and the application asked once of its own at ` +
      `startup. The browser's own storage manager saw ${asked.calls} call in all, counted by a ` +
      `proxy installed on the real method before the first line of script the page runs. ` +
      `Both calls answered ${asked.first} and ${asked.second}. The estimate reads ` +
      `usage=${asked.estimate ? asked.estimate.usage : 'none'} bytes of ` +
      `quota=${asked.estimate ? asked.estimate.quota : 'none'}, and the usage must be above ` +
      `zero because this run has just written a full buffer.`,
  });
}

/**
 * The quota path. It runs alone, under `--quota-kb`, because the browser is
 * launched with a storage limit far below a full buffer and nothing else in
 * this mode could then run.
 */
async function runLogStoreQuota(page, options, checks) {
  const moduleUrl = new URL(LOG_STORE_MODULE, options.url).href;
  const outcome = await page.evaluate(
    async ({ moduleUrl }) => {
      const store = await import(moduleUrl);
      const opened = await store.openLog();
      if (opened.kind !== 'open') {
        return { failed: `openLog answered ${opened.kind}: ${opened.reason}` };
      }
      const estimate = await store.estimateStorage();
      // A block of random bytes. A run of zeros compresses away and the store
      // would never reach its limit.
      const block = new Uint8Array(256 * 1024);
      // `getRandomValues` fills at most 65,536 bytes per call.
      for (let at = 0; at < block.length; at += 65536) {
        crypto.getRandomValues(block.subarray(at, at + 65536));
      }
      const answer = { failed: null, estimate, batches: 0, kind: null, reason: null, threw: null };
      try {
        for (let i = 0; i < 400; i += 1) {
          const entry = { rollId: `quota-${i}`, note: 'a filler roll', block: block.slice() };
          const result = await store.appendRolls(opened.db, [entry]);
          if (result.kind === 'written') {
            answer.batches += 1;
            continue;
          }
          answer.kind = result.kind;
          answer.reason = result.reason;
          break;
        }
      } catch (error) {
        answer.threw = String(error);
      }
      opened.db.close();
      return answer;
    },
    { moduleUrl },
  );

  if (outcome.failed) {
    checks.push({ name: 'log-store.quota', ok: false, detail: outcome.failed });
    return;
  }
  console.log(
    `browser: log-store quota limit=${outcome.estimate ? outcome.estimate.quota : 'none'} ` +
      `batches_written=${outcome.batches} kind=${outcome.kind} reason=${outcome.reason}`,
  );
  checks.push({
    name: 'log-store.a-full-quota-answers-full',
    ok:
      outcome.kind === 'full' &&
      outcome.threw === null &&
      outcome.batches > 0 &&
      /QuotaExceededError/.test(String(outcome.reason)),
    detail:
      `the browser was launched with a storage limit of ` +
      `${outcome.estimate ? outcome.estimate.quota : 'none'} bytes, which is its own testing ` +
      `switch and not a simulation. ${outcome.batches} writes of 256 KB of random bytes went ` +
      `in, and then the store answered kind=${outcome.kind} reason=${outcome.reason} without ` +
      `throwing (${outcome.threw ?? 'no error'}). It must answer full, so the interface can ` +
      `tell the player to export and clear rather than report a fault. The bytes are random ` +
      `because a run of zeros compresses away and would never reach the limit.`,
  });
}

async function runLogStore(page, options, checks) {
  if (options.quotaKb !== null) {
    await runLogStoreQuota(page, options, checks);
    return;
  }

  // The count starts before the document, because the application asks the
  // storage manager once at startup and that call belongs in the denominator.
  await countPersistCalls(page);
  const booted = await bootLogStore(page, options.url);
  console.log(
    `browser: log-store db=${booted.dbName} store=${booted.storeName} ` +
      `version=${booted.version} capacity=${booted.capacity} fill_batch=${LOG_FILL_BATCH} ` +
      `rolls_per_connection=${LOG_ROLLS_PER_CONNECTION}` +
      (options.longTaskMs > 0 ? ` LONG TASK HOOK ${options.longTaskMs} ms` : ''),
  );

  const fill = await fillLogBuffer(page, options.longTaskMs);
  if (fill.failed) {
    checks.push({ name: 'log-store.fill', ok: false, detail: fill.failed });
    return;
  }
  console.log(
    `browser: log-store fill wrote=${fill.written} batches=${fill.batches} ` +
      `dropped=${fill.dropped} held=${fill.heldNow} elapsed_ms=${fill.elapsed.toFixed(0)} ` +
      `longtask_supported=${fill.supported} longest_task_ms=${(fill.longestTask ?? 0).toFixed(1)} ` +
      `longest_gap_ms=${(fill.longestGap ?? 0).toFixed(1)} ticks=${fill.ticks}`,
  );
  judgeLongTasks(fill, checks);

  const phase = await writeFromTwoConnections(page, LOG_ROLLS_PER_CONNECTION);
  if (phase.failed) {
    checks.push({ name: 'log-store.two-connections', ok: false, detail: phase.failed });
    return;
  }
  console.log(
    `browser: log-store two connections wrote=${phase.wrote} total_written=${phase.written.length} ` +
      `held=${phase.held.length} dice_per_roll=${phase.dice}`,
  );
  judgeRingBuffer(booted, phase, checks);

  await runVisibilityFlush(page, checks);
  await runLogStoreRefusals(page, booted, checks);
  await runStorageManager(page, checks);
}

// ---------------------------------------------------------------------------
// The CSV export and the round trip — Units 4.5 and 4.6
//
// Both units shipped their codec against hand-made logs. What no pure test can
// reach is the store: a full 5,000-roll buffer read back out of IndexedDB and
// written to a file, and a log that goes out through the export and comes back
// in through the import.
//
// **The export.** The plan's acceptance is a full-buffer export with no long
// task over 50 ms. The window measured is the whole of what an export button
// does: read the buffer, then build the file. The one-task `exportCsv` is
// priced on the same buffer straight afterwards and never gated, so the run
// says what the chunking buys and shows the instrument responds.
//
// **The gate is the export's own work, not the wall clock.** The run marks the
// thread on both sides of every yield, so it holds one window per chunk plus
// the tail, and each window is one stretch of the export's own code. The
// re-arming timer of `--log-store` runs beside it and is reported, because a
// gap between two of its ticks also counts a garbage collection, a compile and
// anything else the browser runs in the same window. Measured on this host on
// 2026-08-09, on an idle machine and over ten runs: the export's longest window
// held at 9 to 11 ms while the wall gap read 13 to 15 ms on six runs and 57 to
// 58 ms on four, always at a chunk boundary about a third of the way in, and
// never on a second or third export in the same page. Eight busy cores moved
// the gap by about 7 ms and changed neither figure otherwise. A gate on the
// wall gap therefore failed two runs in five while the code it judges did the
// same work every time.
//
// **The parts.** `exportCsvInChunks` counts the pieces where it hands them to
// `Blob`, and the run counts the rows a second way, over the rolls themselves.
// The two must agree at one header plus one row per non-null cell, so a rewrite
// that joins the document into one string fails here rather than on a phone.
//
// **The round trip.** Store, export, import, store, then every field of every
// roll compared. The three decisions the plan settled are asserted through the
// real store: an import replaces the log, a duplicate `roll_id` is rejected, and
// the size cap refuses a file before it is parsed.
//
// **Replace is mid-flight work.** A clear and an insert in two transactions
// leave the same end state as one, exactly as the split trim did at Unit 4.4.
// So a second connection reads the log in a loop while the import writes, and
// every committed reading must hold the whole old log or the whole new one.
// ---------------------------------------------------------------------------

const LOG_CSV_MODULE = 'src/log/csv.ts';
/** Rolls the round trip carries. Every one is compared field by field. */
const ROUND_TRIP_ROLLS = 60;
/** The committed log must be read at least this often while the import runs. */
const MIN_MID_IMPORT_READINGS = 2;

/**
 * Read the whole buffer and export it, watched from the first tick to the last.
 *
 * The window covers the read as well as the build, because an export button
 * does both and a player waits through both.
 */
async function measureFullBufferExport(page, pageUrl, longTaskMs) {
  const moduleUrl = new URL(LOG_CSV_MODULE, pageUrl).href;
  return page.evaluate(
    async ({ moduleUrl, longTaskMs }) => {
      const held = window.__logStore;
      const csv = await import(moduleUrl);
      held.csv = csv;
      const db = held.connections.a;

      const watch = held.startWatch();
      const started = performance.now();
      const entries = await held.store.readRollsInPages(db);
      const readMs = performance.now() - started;
      const afterRead = watch.gaps.length;

      // How long the export held the main thread each time it took it.
      //
      // One window runs from the moment a yield hands the thread back to the
      // moment the export asks to yield again, so a window is exactly one
      // stretch of the export's own code: a chunk of rows, plus whatever the
      // run itself put in the way. The last window runs from the final yield to
      // the end of the call, which is where the file is put together.
      const work = [];
      let resumed = 0;

      // The block goes inside the export, at the top of a chunk, so the check
      // measures a long task during the build it is written about. It lands
      // after the resume mark and before the next yield, which puts it inside a
      // window, exactly where a chunk that did too much before yielding would
      // put it.
      let blocked = 0;
      const yieldTo = () => {
        work.push(performance.now() - resumed);
        return new Promise((resolve) => {
          setTimeout(() => {
            resumed = performance.now();
            if (longTaskMs > 0 && blocked === 0) {
              blocked += 1;
              const until = performance.now() + longTaskMs;
              while (performance.now() < until) {
                /* block the main thread */
              }
            }
            resolve();
          }, 0);
        });
      };

      const exportStarted = performance.now();
      resumed = exportStarted;
      const exported = await csv.exportCsvInChunks(entries, csv.ROLLS_PER_CHUNK, yieldTo);
      work.push(performance.now() - resumed);
      const exportMs = performance.now() - exportStarted;
      const elapsed = performance.now() - started;
      watch.stop();
      // The observer delivers its records in a later task.
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Counted after the window closes, over the rolls themselves, so the part
      // count the writer reports is judged against a denominator the writer
      // never touched and this count never lands inside the measurement.
      let rows = 0;
      for (const entry of entries) {
        for (const die of entry.dice) {
          for (const cell of die.cells) if (cell) rows += 1;
        }
      }

      // The same buffer through the one-task export. It is reported and never
      // gated: it is what the chunked path exists to avoid, and a run where the
      // two read the same number is measuring nothing.
      const second = held.startWatch();
      const oneTaskStarted = performance.now();
      const oneTask = csv.exportCsv(entries);
      const oneTaskMs = performance.now() - oneTaskStarted;
      await new Promise((resolve) => setTimeout(resolve, 100));
      second.stop();

      const text = await exported.blob.text();
      const largest = (list) => (list.length ? Math.max(...list) : null);
      return {
        entries: entries.length,
        rows,
        parts: exported.parts,
        chunks: exported.chunks,
        rollsPerChunk: csv.ROLLS_PER_CHUNK,
        rollsPerPage: held.store.ROLLS_PER_PAGE,
        bytes: exported.blob.size,
        oneTaskBytes: oneTask.size,
        chars: text.length,
        maxImportChars: csv.MAX_IMPORT_CHARS,
        maxImportBytes: csv.MAX_IMPORT_BYTES,
        noteChars: held.noteChars,
        readMs,
        exportMs,
        elapsed,
        blocked,
        workWindows: work.length,
        longestWork: largest(work),
        totalWork: work.reduce((sum, each) => sum + each, 0),
        ticks: watch.ticks,
        supported: watch.supported,
        longestGap: largest(watch.gaps),
        longestReadGap: largest(watch.gaps.slice(0, afterRead)),
        longestExportGap: largest(watch.gaps.slice(afterRead)),
        longestTask: largest(watch.longtasks),
        tasksOverCeiling: watch.longtasks.length,
        oneTaskMs,
        oneTaskLongestGap: largest(second.gaps),
        exportStarted,
        oneTaskStarted,
      };
    },
    { moduleUrl, longTaskMs },
  );
}

function judgeFullBufferExport(measured, checks) {
  const instruments = [];
  if (measured.longestGap !== null) {
    instruments.push(`a re-arming timer over ${measured.ticks} ticks`);
  }
  if (measured.supported) instruments.push('a PerformanceObserver for longtask');
  const longest = Math.max(measured.longestGap ?? 0, measured.longestTask ?? 0);
  const named =
    measured.longestTask !== null && measured.longestTask >= (measured.longestGap ?? 0)
      ? `the observer measured ${measured.longestTask.toFixed(1)} ms`
      : `the timer measured a gap of ${(measured.longestGap ?? 0).toFixed(1)} ms`;

  checks.push({
    name: 'log-csv.a-full-buffer-export-holds-no-long-task-over-the-ceiling',
    ok:
      measured.longestWork !== null &&
      measured.longestWork <= MAX_LONG_TASK_MS &&
      measured.workWindows === measured.chunks + 1 &&
      measured.ticks >= measured.chunks &&
      measured.chunks > 0 &&
      measured.rows > 0 &&
      instruments.length > 0,
    detail:
      `${measured.entries} rolls came back out of the buffer in ` +
      `${measured.readMs.toFixed(0)} ms, over pages of ${measured.rollsPerPage} rolls, and ` +
      `went to a file of ${measured.rows} rows and ` +
      `${measured.bytes} bytes in ${measured.exportMs.toFixed(0)} ms, over ${measured.chunks} ` +
      `chunks of ${measured.rollsPerChunk} rolls, for ${measured.elapsed.toFixed(0)} ms of wall ` +
      `time. **The gate is the longest stretch the export itself held the main thread**: ` +
      `${(measured.longestWork ?? 0).toFixed(1)} ms against a ceiling of ${MAX_LONG_TASK_MS} ms, ` +
      `over ${measured.workWindows} windows against the ${measured.chunks + 1} the ${measured.chunks} ` +
      `chunks name, which is its own denominator. A window runs from the moment a yield hands ` +
      `the thread back to the moment the export asks to yield again, and the last one runs to the ` +
      `end of the call, so the windows are the whole of the build and an export that stopped ` +
      `yielding would be one window of ${measured.exportMs.toFixed(0)} ms. The windows hold ` +
      `${measured.totalWork.toFixed(0)} ms of the ${measured.exportMs.toFixed(0)} ms the build ` +
      `took, and the rest is the browser between two chunks. ` +
      `Watched beside it by ${instruments.join(' and ')}, reported and not gated: the wall gap ` +
      `between two ticks of a timer also counts a garbage collection and anything else the ` +
      `browser runs in the same window, and on an idle machine this run measured 10 ms of export ` +
      `work inside a 59 ms wall gap. The longest such gap is ${longest.toFixed(1)} ms: ${named}. ` +
      `Inside the read alone it is ${(measured.longestReadGap ?? 0).toFixed(1)} ms and inside the ` +
      `build alone ${(measured.longestExportGap ?? 0).toFixed(1)} ms. The read is measured by ` +
      `that timer only, because the browser rebuilds a page of rolls in a task of its own and ` +
      `this file cannot stand inside it, so the read is reported here and is not gated. This ` +
      `browser ${measured.supported ? 'has' : 'has no'} longtask entry type and it reported ` +
      `${measured.tasksOverCeiling} such entries. The timer ticked ${measured.ticks} times ` +
      `against a floor of ${measured.chunks}, which is its own denominator: a watchdog that ` +
      `never ran fails here rather than reporting nothing. The same buffer through the one-task ` +
      `exportCsv took ${measured.oneTaskMs.toFixed(0)} ms and the same timer read ` +
      `${(measured.oneTaskLongestGap ?? 0).toFixed(1)} ms there, which is reported and never ` +
      `gated: it is what the chunked path exists to avoid, and it is how this run shows the ` +
      `instrument responds.`,
  });

  checks.push({
    name: 'log-csv.the-document-is-built-from-many-parts',
    ok:
      measured.parts === measured.rows + 1 &&
      measured.chunks > 1 &&
      measured.bytes === measured.oneTaskBytes &&
      measured.bytes > 0,
    detail:
      `the writer counted ${measured.parts} pieces where it handed them to Blob, against ` +
      `${measured.rows} rows counted a second way over the rolls themselves, plus the header: ` +
      `${measured.rows + 1}. No piece may hold two rows and no run may join the document, ` +
      `because either one parts the two counts. The pieces went to Blob in ${measured.chunks} ` +
      `chunks, so the heap holds one chunk of strings and never the whole ${measured.bytes} ` +
      `bytes. The file measures ${measured.bytes} bytes against the ${measured.oneTaskBytes} ` +
      `the one-task export produced from the same rolls, and the two must be equal.`,
  });

  const spare = measured.maxImportChars - measured.chars;
  // Every row of the export repeats the roll's note, so one more character in
  // the note costs one character a row. The room is therefore a note length,
  // and it is derived from this run's own measurement rather than restated.
  const perRow = measured.rows > 0 ? spare / measured.rows : 0;
  const breaksAt = measured.noteChars + Math.floor(perRow) + 1;
  checks.push({
    name: 'log-csv.a-full-buffer-export-fits-under-the-import-cap',
    ok: measured.chars <= measured.maxImportChars && measured.chars > 0,
    detail:
      `the file holds ${measured.chars} characters against the ${measured.maxImportChars} an ` +
      `import reads, so ${spare} characters of room. A log the application cannot read back is ` +
      `an export that only looks like one, and the cap and the row shape are set in two ` +
      `different places. **The room is a note length, and it is small.** It is ${spare} ` +
      `characters over ${measured.rows} rows, which is ${perRow.toFixed(3)} characters a row, ` +
      `and every row repeats the note. This run's note is ${measured.noteChars} characters, so a ` +
      `note of ${breaksAt} characters fills the cap and the application would write a file it ` +
      `then refuses to read. Raising the cap, capping the note and splitting the export are all ` +
      `owner calls. \`--note-chars ${breaksAt}\` turns this check red, which is how it is shown ` +
      `to fail rather than left to rot.`,
  });

  // The IMPORT CONTROL judges a file by its bytes, not by its characters, and
  // it does so before it reads one of them. That is a second surface over the
  // same file: `src/log/import-file.ts` refuses on `File.size`, where
  // `importCsv` refuses on `text.length`.
  const spareBytes = measured.maxImportBytes - measured.bytes;
  checks.push({
    name: 'log-csv.a-full-buffer-export-passes-the-import-control-size-guard',
    ok: measured.bytes <= measured.maxImportBytes && measured.bytes > 0,
    detail:
      `the file measures ${measured.bytes} bytes against the ${measured.maxImportBytes} the ` +
      `import control accepts from File.size, so ${spareBytes} bytes of room. The guard reads ` +
      `the size of the FILE before it reads the file, so this is the gate a real import meets ` +
      `first and it is the stricter of the two: UTF-8 never spends fewer bytes than the string ` +
      `spends code units. This file is ${measured.bytes - measured.chars} bytes over its ` +
      `${measured.chars} characters, so today the notes are ASCII and the two gates read one ` +
      `number. A note outside ASCII parts them and this one goes red first.`,
  });
}

/**
 * Store, export, import, store — and every field compared.
 *
 * The rolls are built here rather than by `src/log/entry.ts`, because that
 * module reaches for `node:crypto` and cannot be imported into a page. Their
 * shape is the shape `createLogEntry` writes: one cell per generation per die,
 * `null` where the die did not exist, and every derived value stored.
 */
async function runRoundTrip(page, pageUrl, rolls) {
  const moduleUrl = new URL(LOG_CSV_MODULE, pageUrl).href;
  return page.evaluate(
    async ({ moduleUrl, rolls }) => {
      const held = window.__logStore;
      const csv = held.csv ?? (await import(moduleUrl));
      const store = held.store;
      const db = held.connections.a;
      // The reader that watches the import land. It is a second connection, so
      // its transactions queue against the writer's the way another tab's would.
      const second = await store.openLog();
      if (second.kind !== 'open') {
        return { failed: `the second openLog answered ${second.kind}: ${second.reason}` };
      }
      held.connections.b = second.db;
      const other = second.db;

      // Awkward on purpose: a formula, a comma, a quote, a line break, an
      // apostrophe, a sign, an at sign, an accent and an empty note.
      const NOTES = [
        '=1+1',
        'a note, with a comma',
        'he said "push" twice',
        'line one\r\nline two',
        "'already quoted",
        '-5 to the pool',
        '+7',
        '@here',
        'naïve dé',
        '',
      ];
      const TYPES = ['attribute', 'skill', 'gear', 'artifact', 'bonus', 'stress'];
      const FACES = [6, 8, 10, 12];
      const COSTS = ['ratingPoint', 'healthPoint', 'refereePoint', 'complicationCheck'];

      /** One roll, with every field moved off a constant. */
      const makeRoll = (ordinal) => {
        const generations = (ordinal % 3) + 1;
        const dice = [];
        const count = (ordinal % 12) + 1;
        for (let index = 0; index < count; index += 1) {
          const faces = FACES[(ordinal + index) % FACES.length];
          const cells = [];
          for (let generation = 0; generation < generations; generation += 1) {
            // A die that joined the pool later. Its cells hold null up to the
            // generation it first rolled at, which is the shape createLogEntry
            // writes. Die 0 always exists, and every die rolls at the newest
            // generation, because a roll where nobody rolled has no rows to
            // export at all.
            const absent = index > 0 && generation < generations - 1 && (index + ordinal) % 5 === 0;
            cells.push(
              absent
                ? null
                : {
                    value: ((ordinal + index + generation) % faces) + 1,
                    successes: (ordinal + index) % 3,
                    locked: (index + generation) % 2 === 0,
                  },
            );
          }
          dice.push({ type: TYPES[(ordinal + index) % TYPES.length], faces, cells });
        }
        return {
          rollId: `trip-${String(ordinal).padStart(6, '0')}`,
          timestampIso: new Date(Date.UTC(2026, 7, 9, 0, ordinal % 60, ordinal % 60)).toISOString(),
          ruleset: `preset-${ordinal % 4}`,
          // Distinct per roll, so a round trip that fabricates one constant
          // hash cannot pass.
          profileHash: ordinal.toString(16).padStart(64, '0'),
          mode: ordinal % 2 === 0 ? 'pool' : 'step',
          dice,
          successes: ordinal % 5,
          banes: ordinal % 3,
          pushCount: generations - 1,
          costType: COSTS[ordinal % COSTS.length],
          costAmount: ordinal % 4,
          stressBefore: ordinal % 6,
          stressAfter: (ordinal % 6) + 1,
          note: NOTES[ordinal % NOTES.length],
        };
      };

      /** The committed log, as this connection sees it right now. */
      const idsOf = async (connection) =>
        (await store.readRolls(connection)).map((entry) => entry.rollId);
      const countOf = (connection) =>
        new Promise((resolve, reject) => {
          const transaction = connection.transaction(store.STORE_NAME, 'readonly');
          const counted = transaction.objectStore(store.STORE_NAME).count();
          transaction.oncomplete = () => resolve(counted.result);
          transaction.onabort = () => reject(transaction.error ?? new Error('the count aborted'));
        });

      const answer = { failed: null };
      const fixture = Array.from({ length: rolls }, (_unused, index) => makeRoll(index + 1));

      // --- the log this run starts from ------------------------------------
      const seeded = await store.appendRolls(db, fixture, { replace: true });
      if (seeded.kind !== 'written') {
        return { failed: `seeding the log answered ${seeded.kind}: ${seeded.reason}` };
      }
      answer.seededOver = seeded.held;
      const before = await store.readRolls(db);
      answer.before = before.length;

      // --- out through the export ------------------------------------------
      const exported = await csv.exportCsvInChunks(before);
      const text = await exported.blob.text();
      answer.chars = text.length;

      // A roll that is in the log and not in the file. An import that merges
      // leaves it standing, and an import that replaces takes it away.
      const doomed = makeRoll(rolls + 1);
      doomed.rollId = 'doomed-000001';
      const marked = await store.appendRolls(db, [doomed], {});
      if (marked.kind !== 'written') {
        return { failed: `the marker roll answered ${marked.kind}: ${marked.reason}` };
      }
      answer.beforeImport = await countOf(db);
      const oldIds = (await idsOf(db)).join(' ');

      // --- back in through the import --------------------------------------
      const importStarted = performance.now();
      const imported = csv.importCsv(text);
      answer.importMs = performance.now() - importStarted;
      answer.imported = imported.length;
      const newIds = imported.map((entry) => entry.rollId).join(' ');

      // The second connection reads the committed log in a loop while the
      // import writes. It starts first, so its transactions are already queued
      // when the write begins and a log left empty between two transactions is
      // a reading this loop can take.
      let running = true;
      const readings = [];
      const poll = (async () => {
        while (running) {
          const ids = (await idsOf(other)).join(' ');
          readings.push(ids === oldIds ? 'old' : ids === newIds ? 'new' : `neither`);
        }
      })();
      const replaced = await store.appendRolls(db, imported, { replace: true });
      running = false;
      await poll;
      if (replaced.kind !== 'written') {
        return { failed: `the import write answered ${replaced.kind}: ${replaced.reason}` };
      }
      answer.readings = readings.length;
      answer.readOld = readings.filter((one) => one === 'old').length;
      answer.readNew = readings.filter((one) => one === 'new').length;
      answer.readNeither = readings.filter((one) => one === 'neither').length;

      const after = await store.readRolls(db);
      answer.after = after.length;
      answer.storeCount = await countOf(db);
      answer.doomedSurvives = after.some((entry) => entry.rollId === 'doomed-000001');
      answer.distinctIds = new Set(after.map((entry) => entry.rollId)).size;

      // --- every field of every roll ---------------------------------------
      const differences = [];
      let leaves = 0;
      const compare = (left, right, path) => {
        if (
          left === null ||
          right === null ||
          typeof left !== 'object' ||
          typeof right !== 'object'
        ) {
          leaves += 1;
          if (left !== right) {
            if (differences.length < 5) {
              differences.push(`${path}: ${JSON.stringify(left)} against ${JSON.stringify(right)}`);
            }
          }
          return;
        }
        for (const key of new Set([...Object.keys(left), ...Object.keys(right)])) {
          compare(left[key], right[key], `${path}.${key}`);
        }
      };
      let compared = 0;
      for (const [index, entry] of before.entries()) {
        compared += 1;
        compare(entry, after[index], entry.rollId);
      }
      answer.compared = compared;
      answer.leaves = leaves;
      answer.differences = differences;

      // A second enumeration of the same fields, walked over the log that went
      // out rather than over the comparison. The two counts must agree, or the
      // comparison quietly skipped something.
      let expected = 0;
      for (const entry of before) {
        // Every field of a LogEntry except `dice`.
        expected += Object.keys(entry).length - 1;
        for (const die of entry.dice) {
          expected += 2;
          for (const cell of die.cells) expected += cell === null ? 1 : 3;
        }
      }
      answer.expectedLeaves = expected;

      // The hash is the field the spec says a round trip must carry, so it is
      // counted on its own as well as inside the walk above.
      const hashes = after.map((entry) => entry.profileHash);
      answer.hashesCompared = hashes.filter(
        (hash, index) => before[index] && hash === before[index].profileHash,
      ).length;
      answer.distinctHashes = new Set(hashes).size;

      // --- a duplicate roll_id is rejected ---------------------------------
      const doubled = csv.csvParts([...before, before[0]]).join('');
      const duplicate = { threw: null, message: null };
      try {
        csv.importCsv(doubled);
      } catch (error) {
        duplicate.threw = error.name;
        duplicate.message = error.message;
      }
      duplicate.logHolds = (await idsOf(db)).join(' ') === newIds;
      answer.duplicate = duplicate;

      // --- the cap refuses a file before it is parsed ----------------------
      //
      // The oversized text opens a quoted field and never closes it, so a
      // parser reaching it throws about the quote. The error must name the
      // limit instead, which is how this run knows nothing was parsed.
      const header = csv.CSV_COLUMNS.join(',') + '\r\n';
      const oversized = header + '"' + 'x'.repeat(csv.MAX_IMPORT_CHARS + 1 - header.length - 1);
      const capped = { chars: oversized.length, threw: null, message: null };
      const started = performance.now();
      try {
        csv.importCsv(oversized);
      } catch (error) {
        capped.threw = error.name;
        capped.message = error.message;
      }
      capped.ms = performance.now() - started;
      capped.logHolds = (await idsOf(db)).join(' ') === newIds;
      answer.capped = capped;

      return answer;
    },
    { moduleUrl, rolls },
  );
}

function judgeRoundTrip(trip, checks) {
  checks.push({
    name: 'log-csv.the-log-comes-back-identical-through-the-real-store',
    ok:
      trip.compared === ROUND_TRIP_ROLLS &&
      trip.compared === trip.storeCount &&
      trip.compared === trip.after &&
      trip.after === trip.before &&
      trip.differences.length === 0 &&
      trip.leaves === trip.expectedLeaves &&
      trip.hashesCompared === ROUND_TRIP_ROLLS &&
      trip.distinctHashes === ROUND_TRIP_ROLLS,
    detail:
      `${trip.before} rolls went into the store, came back out of it, went to a file of ` +
      `${trip.chars} characters, were read back by importCsv in ${trip.importMs.toFixed(0)} ms ` +
      `and were written to the store again. compared=${trip.compared} rolls against the store's ` +
      `own count of ${trip.storeCount} and a floor of ${ROUND_TRIP_ROLLS}, so an empty round ` +
      `trip cannot pass here. Every field was compared, not the rolls as wholes: ` +
      `fields=${trip.leaves} against ${trip.expectedLeaves} counted a second way over the log ` +
      `that went out. differences=${trip.differences.length}. The profile hash is counted on ` +
      `its own as well, because the rules spec says an entry outlives an edit of its profile ` +
      `only through that field: hashes_equal=${trip.hashesCompared} of ${ROUND_TRIP_ROLLS}, and ` +
      `${trip.distinctHashes} of them are distinct, so one fabricated constant cannot pass.` +
      (trip.differences.length ? ` [${trip.differences.join('; ')}]` : ''),
  });

  checks.push({
    name: 'log-csv.an-import-replaces-the-log-and-never-merges-it',
    ok:
      trip.after === trip.imported &&
      trip.beforeImport === ROUND_TRIP_ROLLS + 1 &&
      trip.doomedSurvives === false &&
      trip.distinctIds === trip.after &&
      trip.seededOver > 0,
    detail:
      `the store held ${trip.seededOver} rolls, was seeded with ${trip.before} and then took one ` +
      `more roll that the file does not carry, for ${trip.beforeImport}. The import wrote ` +
      `${trip.imported} rolls and the log now holds ${trip.after}, all of them with distinct ` +
      `identifiers (${trip.distinctIds}). The marker roll survives=${trip.doomedSurvives}, and ` +
      `it must not: a merge would leave it standing and would leave the log at ` +
      `${trip.beforeImport + trip.imported} rolls.`,
  });

  checks.push({
    name: 'log-csv.the-replace-is-one-transaction-and-never-shows-an-emptied-log',
    ok:
      trip.readNeither === 0 &&
      trip.readOld > 0 &&
      trip.readNew > 0 &&
      trip.readings >= MIN_MID_IMPORT_READINGS,
    detail:
      `a second connection read the committed log in a loop while the import wrote, in its own ` +
      `readonly transactions, and took ${trip.readings} readings against a floor of ` +
      `${MIN_MID_IMPORT_READINGS}: ${trip.readOld} of the whole old log, ${trip.readNew} of the ` +
      `whole new one and ${trip.readNeither} of anything else. The loop must straddle the write, ` +
      `so a run with no old reading or no new reading fails here as well. A clear and an insert ` +
      `in two transactions leave the same end state as one, and the only place the difference ` +
      `shows is a reading taken between them.`,
  });

  const duplicate = trip.duplicate;
  checks.push({
    name: 'log-csv.a-duplicate-roll-id-is-rejected-and-the-log-is-untouched',
    ok:
      duplicate.threw !== null &&
      /appears twice/.test(String(duplicate.message)) &&
      duplicate.logHolds === true,
    detail:
      `the exported file was rebuilt with the first roll's block written a second time. ` +
      `importCsv threw ${duplicate.threw}: ${duplicate.message}. The log still holds exactly ` +
      `what the round trip left there (${duplicate.logHolds}), because a rejected import must ` +
      `write nothing at all.`,
  });

  const capped = trip.capped;
  checks.push({
    name: 'log-csv.the-size-cap-refuses-a-file-before-it-is-parsed',
    ok:
      capped.threw !== null &&
      /over the limit of/.test(String(capped.message)) &&
      !/quoted field/.test(String(capped.message)) &&
      capped.logHolds === true,
    detail:
      `a file of ${capped.chars} characters, one over the cap, was handed to importCsv. It ` +
      `opens a quoted field and never closes it, so a parser that reached it would throw about ` +
      `the quote. It threw ${capped.threw}: ${capped.message} in ${capped.ms.toFixed(1)} ms, ` +
      `which names the limit and not the quote, so nothing was parsed. The log still holds what ` +
      `the round trip left there (${capped.logHolds}).`,
  });
}

async function runLogCsv(page, options, checks) {
  const booted = await bootLogStore(page, options.url, options.noteChars);
  console.log(
    `browser: log-csv db=${booted.dbName} store=${booted.storeName} ` +
      `capacity=${booted.capacity} fill_batch=${LOG_FILL_BATCH} ` +
      `round_trip_rolls=${ROUND_TRIP_ROLLS} note_chars=${booted.noteChars}` +
      (options.longTaskMs > 0 ? ` LONG TASK HOOK ${options.longTaskMs} ms` : '') +
      (options.noteChars > 0 ? ` NOTE HOOK ${options.noteChars} chars` : ''),
  );

  const fill = await fillLogBuffer(page, 0);
  if (fill.failed) {
    checks.push({ name: 'log-csv.fill', ok: false, detail: fill.failed });
    return;
  }
  console.log(
    `browser: log-csv fill wrote=${fill.written} held=${fill.heldNow} ` +
      `elapsed_ms=${fill.elapsed.toFixed(0)}`,
  );

  const measured = await measureFullBufferExport(page, options.url, options.longTaskMs);
  console.log(
    `browser: log-csv export rolls=${measured.entries} rows=${measured.rows} ` +
      `parts=${measured.parts} chunks=${measured.chunks} bytes=${measured.bytes} ` +
      `chars=${measured.chars} read_ms=${measured.readMs.toFixed(0)} ` +
      `export_ms=${measured.exportMs.toFixed(0)} wall_ms=${measured.elapsed.toFixed(0)} ` +
      `longtask_supported=${measured.supported} ` +
      `longest_task_ms=${(measured.longestTask ?? 0).toFixed(1)} ` +
      `longest_gap_ms=${(measured.longestGap ?? 0).toFixed(1)} ticks=${measured.ticks} ` +
      `blocked_injections=${measured.blocked}`,
  );
  console.log(
    `browser: log-csv one-task export ms=${measured.oneTaskMs.toFixed(0)} ` +
      `longest_gap_ms=${(measured.oneTaskLongestGap ?? 0).toFixed(1)} bytes=${measured.oneTaskBytes}`,
  );
  judgeFullBufferExport(measured, checks);

  const trip = await runRoundTrip(page, options.url, ROUND_TRIP_ROLLS);
  if (trip.failed) {
    checks.push({ name: 'log-csv.round-trip', ok: false, detail: trip.failed });
    return;
  }
  console.log(
    `browser: log-csv round trip before=${trip.before} chars=${trip.chars} ` +
      `imported=${trip.imported} after=${trip.after} store_count=${trip.storeCount} ` +
      `fields=${trip.leaves} of ${trip.expectedLeaves} differences=${trip.differences.length} ` +
      `import_ms=${trip.importMs.toFixed(0)}`,
  );
  console.log(
    `browser: log-csv mid-import readings=${trip.readings} old=${trip.readOld} ` +
      `new=${trip.readNew} neither=${trip.readNeither} doomed_survives=${trip.doomedSurvives}`,
  );
  judgeRoundTrip(trip, checks);
}

// ---------------------------------------------------------------------------
// The share card — Unit 4.9
//
// `src/tray/capture.ts` draws one fresh frame through the exposed renderer and
// copies it in the same task, and `src/shell/share-card.ts` lays the summary
// over that copy **inside the same task**. This mode throws a mixed pool, makes
// a card out of it in every one of the six interface palettes, and measures the
// pixels that came back.
//
// **The two acceptance measures run over the PHOTOGRAPH, not over the whole
// card.** A panel of text carries variance and thousands of distinct values all
// by itself, so a measure over the whole card would pass on a cleared drawing
// buffer — which is the very defect the two measures exist to catch. The panel
// is excluded by the box the layout names, and the two pixel counts are added
// up against the size of the card, so nothing can be excluded twice.
//
// **The oracle is the rules core, run in node.** The summary the page drew is
// compared against a card this file builds from the same seed through
// `src/shell/state.ts` and `src/shell/share-card.ts`, in another engine.
//
// `--capture-later` splits the render away from the copy and puts the copy in a
// later task, which is the defect the unit exists to avoid. It is the red-proof
// of both measures, and it is here rather than in the module because the module
// is synchronous and cannot express the defect at all.
// ---------------------------------------------------------------------------

/**
 * The floor on luminance variance, in luma levels squared.
 *
 * 25 is a standard deviation of 5 luma levels. That is above the 8-bit
 * quantisation step and above the ringing a JPEG encoder leaves on a flat
 * field, so a frame that is one colour apart from compression noise fails it,
 * whatever colour that is. A cleared buffer is exactly such a frame. The
 * measured value on a real card and on a cleared one are both in the LEDGER
 * row, and they sit either side of this number by orders of magnitude.
 */
const SHARE_MIN_LUMA_VARIANCE = 25;
/** More than 1,000 distinct pixel values, as the plan's acceptance states. */
const SHARE_MIN_DISTINCT_VALUES = 1000;
/** WCAG 2.2 SC 1.4.3, level AA. The card is drawn, so it owes this itself. */
const SHARE_TEXT_CONTRAST_MIN = 4.5;

/**
 * The pool the card is made of.
 *
 * It is a **legal** pool, built through `src/shell/state.ts` exactly as the
 * builder builds one, and not the every-type-every-face fixture `--pool` uses.
 * A card carries the readings of a roll, and the rules core answers no success
 * curve for a gear die of eight faces, so a fixture pool has no readings at
 * all. The artifact rating of 4 puts a d12 and a d8 on the table, so the card
 * still shows more than one face count.
 */
const SHARE_POOL_COUNTS = { attribute: 5, skill: 5, gear: 3, artifact: 4, bonus: 2, stress: 5 };

/**
 * The state the card is made from.
 *
 * It takes every module it needs as an argument, because its source is copied
 * into the page as well as run here. One derivation, run in two engines, so a
 * card built in node and a card built in the browser cannot be built two ways.
 */
function shareState(stateMod, seededMod, seed, counts) {
  const built = { ...stateMod.emptyState('pool'), counts };
  return stateMod.rollNow(built, seededMod.seededRandom(seed));
}

/**
 * Throw that pool on the tray.
 *
 * The dice the tray acts out are the dice the rules core decided, so the
 * photograph and the summary are the same roll.
 */
async function throwShareScene(page, pageUrl, seed) {
  const modules = ['src/rules/seeded-random.ts', 'src/shell/state.ts', 'src/tray/throw.ts'].map(
    (path) => new URL(path, pageUrl).href,
  );
  return page.evaluate(
    async ({ modules, counts, seed, source }) => {
      const [seededMod, stateMod, thrower] = await Promise.all(modules.map((url) => import(url)));
      // The state is built by the SAME function node builds it with, copied
      // into the page, so neither engine reads the other's answer.
      const state = (0, eval)(`(${source})`)(stateMod, seededMod, seed, counts);
      const box = window.__clatterTray;
      const ordered = await thrower.throwPool(box, state.result, {});
      return ordered.map((one) => ({ id: one.id, type: one.type, faces: one.faces }));
    },
    { modules, counts: SHARE_POOL_COUNTS, seed, source: shareState.toString() },
  );
}

/**
 * The widest card the readings can make.
 *
 * Every number is at two digits, which is the widest a reading gets: the pool
 * caps at twenty-five dice and the stress at ten, and a push count over ninety
 * nine is not a session anybody plays. It is measured and never drawn, so the
 * fit check below covers the whole range of the readings rather than the one
 * roll that was thrown. This is the shape the first draft got wrong: the run's
 * BOX fitted the panel and the TEXT inside it did not.
 */
const WIDEST_SHARE_CARD = {
  title: 'Clatter',
  successLine: '88 successes',
  baneLine: '88 banes',
  readings: [
    { key: 'dice', text: '88 dice' },
    { key: 'kept', text: '88 kept' },
    { key: 'inTheCup', text: '88 in the cup' },
    { key: 'stress', text: 'stress 88' },
    { key: 'pushes', text: '88 pushes' },
  ],
  alt: '',
};

/** `[r, g, b]` as the `rgb()` text `ratioOfRgb` reads. */
function rgbText(channels) {
  return `rgb(${channels[0]}, ${channels[1]}, ${channels[2]})`;
}

/** `#RRGGBB` as `[r, g, b]`, so a palette row and a drawn pixel compare. */
function channelsOfHex(hex) {
  return [1, 3, 5].map((at) => Number.parseInt(hex.slice(at, at + 2), 16));
}

/**
 * Make one card per interface palette and measure every one of them.
 *
 * Three things come back for each palette and each one is read off the DRAWN
 * pixels rather than off the palette:
 *
 *   * the ground of the panel, as the commonest colour inside its boundary;
 *   * the ink of every run, as the pixel inside that run's box whose luma is
 *     furthest from the ground. The panel is opaque, so every pixel in it is a
 *     blend of the ground and one ink and the furthest one is the ink itself.
 *     A run the draw loop skipped leaves a box of pure ground, and its ink then
 *     comes back as the ground, which fails by name;
 *   * the two acceptance measures, over the decoded JPEG with the panel taken
 *     out of the count.
 *
 * The pixels are read INSIDE the overlay, which is inside the task that drew
 * the frame and copied it, and before the encode. So the colours judged are
 * the colours drawn, and the JPEG is judged separately for what it is for.
 */
async function composeShareCards(page, pageUrl, seed, surface, laterTask) {
  const modules = [
    'src/rules/seeded-random.ts',
    'src/shell/state.ts',
    'src/shell/share-card.ts',
    'src/theme/themes.ts',
    'src/tray/capture.ts',
  ].map((path) => new URL(path, pageUrl).href);
  return page.evaluate(
    async ({ modules, counts, seed, surface, laterTask, source, worst }) => {
      const [seededMod, stateMod, cardMod, themesMod, captureMod] = await Promise.all(
        modules.map((url) => import(url)),
      );

      // The same roll the tray is showing, rebuilt from the same seed through
      // the rules core, by the same derivation node runs.
      const state = (0, eval)(`(${source})`)(stateMod, seededMod, seed, counts);
      const summary = cardMod.shareCard(state);

      const box = window.__clatterTray;
      const drawn = box.renderer.domElement;
      const layout = cardMod.layoutShareCard(summary, drawn.width, drawn.height);

      const luma = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const read = (pixels, width, x, y) => {
        const at = (y * width + x) * 4;
        return [pixels[at], pixels[at + 1], pixels[at + 2]];
      };

      /** The commonest colour inside the panel, and every run's ink. */
      const readPanel = (pixels, width, height) => {
        const panel = layout.panel;
        // Inside the boundary, which is drawn in a third colour.
        const border = Math.ceil((layout.height / 900) * 4);
        const left = Math.max(0, Math.round(panel.x) + border);
        const top = Math.max(0, Math.round(panel.y) + border);
        const right = Math.min(width, Math.round(panel.x + panel.w) - border);
        const bottom = Math.min(height, Math.round(panel.y + panel.h) - border);
        const seen = new Map();
        for (let y = top; y < bottom; y += 1) {
          for (let x = left; x < right; x += 1) {
            const key = read(pixels, width, x, y).join(',');
            seen.set(key, (seen.get(key) ?? 0) + 1);
          }
        }
        let ground = null;
        let most = -1;
        for (const [key, count] of seen) {
          if (count > most) {
            most = count;
            ground = key.split(',').map(Number);
          }
        }
        const groundLuma = luma(ground[0], ground[1], ground[2]);
        const runs = layout.runs.map((run) => {
          const x0 = Math.max(0, Math.floor(run.box.x));
          const y0 = Math.max(0, Math.floor(run.box.y));
          const x1 = Math.min(width, Math.ceil(run.box.x + run.box.w));
          const y1 = Math.min(height, Math.ceil(run.box.y + run.box.h));
          let ink = ground;
          let away = -1;
          let marked = 0;
          for (let y = y0; y < y1; y += 1) {
            for (let x = x0; x < x1; x += 1) {
              const pixel = read(pixels, width, x, y);
              const distance = Math.abs(luma(pixel[0], pixel[1], pixel[2]) - groundLuma);
              if (distance > 0.5) marked += 1;
              if (distance > away) {
                away = distance;
                ink = pixel;
              }
            }
          }
          return { id: run.id, text: run.text, want: run.ink, ink, marked };
        });
        return { ground, groundPixels: most, runs };
      };

      const cards = [];
      for (const name of themesMod.THEME_IDS) {
        const palette = themesMod.INTERFACE_PALETTES[name];
        let panel = null;
        let fitted = null;
        let url;
        if (laterTask) {
          // THE INJECTED DEFECT. The same render and the same copy, in two
          // tasks instead of one. The browser clears the drawing buffer once it
          // has composited the frame, so the copy reads an empty canvas. The
          // summary is still drawn over it, which is the whole point: a card
          // with a panel on it still looks like a card.
          box.renderer.render(box.scene, box.camera);
          await new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 0))),
          );
          const flat = document.createElement('canvas');
          flat.width = drawn.width;
          flat.height = drawn.height;
          const context = flat.getContext('2d');
          context.fillStyle = surface;
          context.fillRect(0, 0, flat.width, flat.height);
          context.drawImage(drawn, 0, 0);
          fitted = cardMod.drawShareCard(context, layout, palette);
          panel = readPanel(
            context.getImageData(0, 0, flat.width, flat.height).data,
            flat.width,
            flat.height,
          );
          url = flat.toDataURL('image/jpeg', captureMod.SHARE_JPEG_QUALITY);
        } else {
          url = captureMod.captureTrayJpeg(box, {
            surface,
            overlay: (context, size) => {
              fitted = cardMod.drawShareCard(context, layout, palette);
              // Read back inside the same task, after the draw and before the
              // encode, so the colours judged are the colours drawn.
              panel = readPanel(
                context.getImageData(0, 0, size.width, size.height).data,
                size.width,
                size.height,
              );
            },
          });
        }
        cards.push({ name, url, panel, fitted, palette });
      }

      // The decoded JPEG of the first card, measured twice: over the whole
      // frame, and over the photograph with the panel taken out.
      const first = cards[0];
      const image = new Image();
      image.src = first.url;
      await image.decode();
      const back = document.createElement('canvas');
      back.width = image.naturalWidth;
      back.height = image.naturalHeight;
      const backContext = back.getContext('2d');
      backContext.drawImage(image, 0, 0);
      const data = backContext.getImageData(0, 0, back.width, back.height).data;

      return {
        summary,
        layout,
        cards: cards.map((card) => ({
          name: card.name,
          url: card.url,
          panel: card.panel,
          fitted: card.fitted,
        })),
        // The widest card the readings can make, measured and never drawn. It
        // is built in node and handed in, so this is a bound over the whole
        // range of the readings rather than over the one roll that was thrown.
        widest: (() => {
          const wide = cardMod.layoutShareCard(worst, drawn.width, drawn.height);
          const probe = document.createElement('canvas').getContext('2d');
          return wide.runs.map((run) => {
            probe.font = `${run.weight} ${run.size}px ${cardMod.CARD_FONT_STACK}`;
            return {
              id: run.id,
              text: run.text,
              width: probe.measureText(run.text).width,
              boxWidth: run.box.w,
            };
          });
        })(),
        mediaType: first.url.slice(0, first.url.indexOf(';')),
        buffer: [drawn.width, drawn.height],
        decoded: [image.naturalWidth, image.naturalHeight],
        whole: window.__clatter.measureFrame(data),
        photograph: window.__clatter.measureFrame(data, {
          width: back.width,
          exclude: layout.panel,
        }),
        preserved: box.renderer.getContext().getContextAttributes().preserveDrawingBuffer,
      };
    },
    {
      modules,
      counts: SHARE_POOL_COUNTS,
      seed,
      surface,
      laterTask,
      source: shareState.toString(),
      worst: WIDEST_SHARE_CARD,
    },
  );
}

async function runShareCard(page, options, checks) {
  // The oracle is the application's own modules, imported here as source.
  // `scripts/ts-resolve.mjs` supplies the extension Vite would have supplied,
  // so this file builds the same card the page built and never a copy of it.
  register('./ts-resolve.mjs', import.meta.url);
  const seededMod = await import('../src/rules/seeded-random.ts');
  const stateMod = await import('../src/shell/state.ts');
  const cardMod = await import('../src/shell/share-card.ts');
  const themesMod = await import('../src/theme/themes.ts');

  // No `preserveDrawingBuffer` in the configuration. The plan rejects the flag,
  // and a run that set it would prove nothing about the order the capture runs
  // in.
  const mounted = await mountTrayScene(page, options.url, null);
  await installHelpers(page);
  const rows = await throwShareScene(page, options.url, POOL_SEED);
  // The denominator is the rules core's own answer for this pool, computed in
  // node. A tray that dropped a die fails against it.
  const oracleState = shareState(stateMod, seededMod, POOL_SEED, SHARE_POOL_COUNTS);
  const expected = oracleState.result.dice.length;
  console.log(
    `browser: share pool_seed=${POOL_SEED} dice=${rows.length} css=${mounted.css.join('x')} ` +
      `buffer=${mounted.buffer.join('x')} pixel_ratio=${mounted.pixelRatio} ` +
      `surface=${mounted.surface}` +
      (options.captureLater ? ' LATER-TASK HOOK' : ''),
  );

  // A frame may clear the floor and still be wrong. The card is a picture of
  // the tray, so the tray it is a picture of is measured first.
  const rest = await readTrayRest(page);
  checks.push({
    name: 'share.every-die-at-rest-and-whole-on-screen',
    ok: rest.outside.length === 0 && rest.awake === 0 && rest.dice === expected,
    detail:
      `checked=${rest.dice} of ${expected} against a frame of ${rest.halfWidth} by ` +
      `${rest.halfHeight} half-units. awake=${rest.awake} overhanging=${rest.outside.length}` +
      (rest.outside.length ? ` [${rest.outside.join('; ')}]` : ''),
  });

  const shot = await composeShareCards(
    page,
    options.url,
    POOL_SEED,
    mounted.surface,
    options.captureLater === true,
  );
  const first = shot.cards[0];
  const bytes = Buffer.from(first.url.slice(first.url.indexOf(',') + 1), 'base64');
  const header = readJpeg(bytes);
  console.log(
    `browser: share capture media_type=${shot.mediaType} bytes=${bytes.length} ` +
      `canvas=${shot.buffer.join('x')} declared=${header.ok ? `${header.width}x${header.height}` : 'none'} ` +
      `decoded=${shot.decoded.join('x')} cards=${shot.cards.length}`,
  );
  console.log(
    `browser: share frame whole_pixels=${shot.whole.pixels} ` +
      `whole_variance=${shot.whole.variance.toFixed(2)} ` +
      `whole_distinct=${shot.whole.distinct} photograph_pixels=${shot.photograph.pixels} ` +
      `mean_luma=${shot.photograph.mean.toFixed(2)} ` +
      `luma_variance=${shot.photograph.variance.toFixed(2)} ` +
      `distinct_values=${shot.photograph.distinct}`,
  );

  const sized =
    header.ok &&
    header.width === shot.buffer[0] &&
    header.height === shot.buffer[1] &&
    shot.decoded[0] === shot.buffer[0] &&
    shot.decoded[1] === shot.buffer[1];
  checks.push({
    name: 'share.the-file-is-a-jpeg-of-the-whole-canvas',
    ok: sized && bytes.length > 0,
    detail: header.ok
      ? `${bytes.length} bytes opening ffd8ff and closing ffd9, frame header ${header.marker}, ` +
        `declaring ${header.width}x${header.height} and decoding to ${shot.decoded.join('x')}, ` +
        `against a canvas of ${shot.buffer.join('x')} device pixels`
      : `${bytes.length} bytes, and ${header.reason}`,
  });

  // The panel is counted out of the photograph, and the two counts are added
  // back up against the size of the card, so no region can be dropped or
  // counted twice.
  const panelPixels =
    (Math.ceil(shot.layout.panel.x + shot.layout.panel.w) - Math.floor(shot.layout.panel.x)) *
    (Math.ceil(shot.layout.panel.y + shot.layout.panel.h) - Math.floor(shot.layout.panel.y));
  checks.push({
    name: 'share.the-photograph-and-the-panel-account-for-every-pixel',
    ok:
      shot.photograph.pixels + panelPixels === shot.whole.pixels &&
      shot.whole.pixels === shot.buffer[0] * shot.buffer[1] &&
      shot.photograph.pixels > 0,
    detail:
      `the card holds ${shot.whole.pixels} pixels, the panel covers ${panelPixels} of them, and ` +
      `the photograph is the other ${shot.photograph.pixels}. The two measures below run over ` +
      `the photograph alone, because a panel of text carries variance and thousands of ` +
      `distinct values by itself and would pass them on a cleared buffer.`,
  });

  checks.push({
    name: 'share.luminance-variance-above-the-floor',
    ok: shot.photograph.variance > SHARE_MIN_LUMA_VARIANCE,
    detail:
      `variance=${shot.photograph.variance.toFixed(2)} luma levels squared against a floor of ` +
      `${SHARE_MIN_LUMA_VARIANCE}, over ${shot.photograph.pixels} pixels of the decoded JPEG ` +
      `outside the panel, mean luma ${shot.photograph.mean.toFixed(2)}. A cleared buffer is one ` +
      `colour and reads 0. The whole card, panel included, reads ` +
      `${shot.whole.variance.toFixed(2)}.`,
  });
  checks.push({
    name: 'share.distinct-pixel-values',
    ok: shot.photograph.distinct > SHARE_MIN_DISTINCT_VALUES,
    detail:
      `distinct=${shot.photograph.distinct} packed sRGB values against a floor of more than ` +
      `${SHARE_MIN_DISTINCT_VALUES}, over ${shot.photograph.pixels} pixels of the decoded JPEG ` +
      `outside the panel. The whole card, panel included, reads ${shot.whole.distinct}.`,
  });

  // ---- The summary equals the roll it was made from ----
  //
  // The oracle runs HERE, in node, over the roll rebuilt from the same seed
  // through the rules core. The page never sees it.
  const oracle = cardMod.shareCard(oracleState);
  const oracleRuns = cardMod
    .layoutShareCard(oracle, shot.buffer[0], shot.buffer[1])
    .runs.map((run) => `${run.id}=${run.text}`);
  const drawnRuns = shot.layout.runs.map((run) => `${run.id}=${run.text}`);
  const wrongRuns = oracleRuns.flatMap((wanted, at) =>
    drawnRuns[at] === wanted ? [] : [`${wanted} was drawn as ${drawnRuns[at] ?? 'nothing'}`],
  );
  console.log(
    `browser: share summary runs=${drawnRuns.length} of ${oracleRuns.length} ` +
      `[${drawnRuns.join(' | ')}]`,
  );
  checks.push({
    name: 'share.the-summary-equals-the-roll',
    ok:
      wrongRuns.length === 0 &&
      drawnRuns.length === oracleRuns.length &&
      oracleRuns.length === 3 + cardMod.CARD_READING_KEYS.length &&
      shot.summary.alt === oracle.alt,
    detail:
      `compared=${drawnRuns.length} of ${oracleRuns.length} runs, against a card built IN NODE ` +
      `from the same seed through src/rules and src/shell/state.ts. The denominator is the ` +
      `name, the two headline lines and one run per reading, and the module enumerates ` +
      `${cardMod.CARD_READING_KEYS.length} readings. wrong=${wrongRuns.length}` +
      `${wrongRuns.length === 0 ? '' : ` [${wrongRuns.join('; ')}]`}. The alternative text ` +
      `${shot.summary.alt === oracle.alt ? 'matches' : 'DIFFERS FROM'} the one node built.`,
  });

  // ---- The card is legible in all six interface palettes ----
  //
  // The card is drawn and not styled, so this claim is measured on the drawn
  // pixels of six real cards and never inherited from the stylesheet.
  const groundFaults = [];
  const inkFaults = [];
  const contrastFaults = [];
  let measured = 0;
  let dimmest = Infinity;
  for (const card of shot.cards) {
    const palette = themesMod.INTERFACE_PALETTES[card.name];
    const wantGround = channelsOfHex(palette.surface);
    if (String(card.panel.ground) !== String(wantGround)) {
      groundFaults.push(
        `${card.name}: the panel drew ${rgbText(card.panel.ground)} against ` +
          `${rgbText(wantGround)}`,
      );
    }
    for (const run of card.panel.runs) {
      const wantInk = channelsOfHex(palette[run.want]);
      if (run.marked === 0) {
        inkFaults.push(`${card.name}: ${run.id} marked no pixel of its own box`);
      } else if (String(run.ink) !== String(wantInk)) {
        inkFaults.push(
          `${card.name}: ${run.id} drew ${rgbText(run.ink)} against ${rgbText(wantInk)}`,
        );
      }
      const ratio = ratioOfRgb(rgbText(card.panel.ground), rgbText(run.ink));
      if (ratio !== null && ratio < dimmest) dimmest = ratio;
      if (ratio === null || ratio < SHARE_TEXT_CONTRAST_MIN) {
        contrastFaults.push(
          `${card.name}: ${run.id} reads ${ratio === null ? 'nothing' : ratio.toFixed(2)} to 1`,
        );
      }
      measured += 1;
    }
  }
  const runsPerCard = shot.layout.runs.length;
  console.log(
    `browser: share palettes cards=${shot.cards.length} runs_per_card=${runsPerCard} ` +
      `measured=${measured} dimmest_reading=${dimmest === Infinity ? 'none' : dimmest.toFixed(2)}`,
  );
  checks.push({
    name: 'share.the-panel-is-drawn-in-the-palette-in-force',
    ok: groundFaults.length === 0 && shot.cards.length === themesMod.THEME_IDS.length,
    detail:
      `${shot.cards.length} cards against the ${themesMod.THEME_IDS.length} interface palettes, ` +
      `each ground read as the commonest colour inside the panel boundary of the DRAWN card. ` +
      `wrong=${groundFaults.length}` +
      `${groundFaults.length === 0 ? '' : ` [${groundFaults.join('; ')}]`}`,
  });
  checks.push({
    name: 'share.every-run-is-drawn-in-its-own-ink',
    ok: inkFaults.length === 0 && measured === shot.cards.length * runsPerCard && measured > 0,
    detail:
      `read=${measured} of ${shot.cards.length * runsPerCard} runs, six palettes times ` +
      `${runsPerCard} runs. Each ink is the pixel of that run's own box whose luma is furthest ` +
      `from the ground: the panel is opaque, so every pixel in it is a blend of the ground and ` +
      `one ink, and a run that drew nothing comes back as the ground. ` +
      `wrong=${inkFaults.length}${inkFaults.length === 0 ? '' : ` [${inkFaults.join('; ')}]`}`,
  });
  checks.push({
    name: 'share.the-card-is-legible-in-every-interface-palette',
    ok: contrastFaults.length === 0 && measured === shot.cards.length * runsPerCard,
    detail:
      `measured=${measured} readings, six palettes times ${runsPerCard} runs, each one the ` +
      `DRAWN ink against the DRAWN ground. The dimmest reads ` +
      `${dimmest === Infinity ? 'nothing' : dimmest.toFixed(2)} to 1 against the ` +
      `${SHARE_TEXT_CONTRAST_MIN} to 1 of WCAG 2.2 SC 1.4.3. ` +
      `below=${contrastFaults.length}` +
      `${contrastFaults.length === 0 ? '' : ` [${contrastFaults.join('; ')}]`}`,
  });

  // ---- Every run fits the panel, and the widest card does too ----
  //
  // **This is the check the first draft of this unit did not have.** The
  // successes and the banes were one line, it ran past the side of the panel,
  // and the last word landed on the photograph where nothing could read it.
  // Every check was green, because the run's BOX fitted the panel and the TEXT
  // inside the box did not, and a run's ink is only ever read inside its own
  // box. A layout has no font and cannot know a width, so `drawShareCard`
  // measures every run and reports what came out.
  const overrun = [];
  const shrunk = [];
  let fitted = 0;
  for (const card of shot.cards) {
    for (const [at, run] of card.fitted.entries()) {
      if (run.width > run.boxWidth) {
        overrun.push(
          `${card.name}: ${run.id} took ${run.width.toFixed(1)} px of a ${run.boxWidth.toFixed(1)} px box`,
        );
      }
      const asked = shot.layout.runs[at];
      if (asked !== undefined && run.size < asked.size) {
        shrunk.push(`${card.name}: ${run.id} was fitted from ${asked.size} px to ${run.size} px`);
      }
      fitted += 1;
    }
  }
  const wideOverrun = shot.widest.flatMap((run) =>
    run.width > run.boxWidth
      ? [
          `${run.id} "${run.text}" takes ${run.width.toFixed(1)} px of ${run.boxWidth.toFixed(1)} px`,
        ]
      : [],
  );
  const widest = shot.widest.reduce((most, run) => Math.max(most, run.width / run.boxWidth), 0);
  console.log(
    `browser: share fit runs=${fitted} overrun=${overrun.length} shrunk=${shrunk.length} ` +
      `widest_card_fill=${widest.toFixed(3)} of its box`,
  );
  checks.push({
    name: 'share.every-run-is-drawn-inside-the-panel',
    ok:
      overrun.length === 0 &&
      shrunk.length === 0 &&
      wideOverrun.length === 0 &&
      fitted === shot.cards.length * runsPerCard &&
      shot.widest.length === runsPerCard,
    detail:
      `measured=${fitted} of ${shot.cards.length * runsPerCard} drawn runs, each width read off ` +
      `the real font metrics and compared against the box it had to fit. ` +
      `overrun=${overrun.length}${overrun.length === 0 ? '' : ` [${overrun.join('; ')}]`}, ` +
      `fitted_smaller=${shrunk.length}` +
      `${shrunk.length === 0 ? '' : ` [${shrunk.join('; ')}]`}. The WIDEST card the readings can ` +
      `make, at two digits in every number, was measured as well over its ` +
      `${shot.widest.length} runs and fills ${(widest * 100).toFixed(1)} per cent of its box at ` +
      `most: over=${wideOverrun.length}` +
      `${wideOverrun.length === 0 ? '' : ` [${wideOverrun.join('; ')}]`}. A run that overran ` +
      `would put unreadable text on the photograph, and no ink check would see it, because ink ` +
      `is only ever read inside a run's own box.`,
  });

  // Reported last, because it is the reason the two measures above can fail at
  // all. With the flag on, a capture in any task reads the frame and the trap
  // this unit was written against is unreachable.
  checks.push({
    name: 'share.the-drawing-buffer-is-not-preserved',
    ok: shot.preserved === false,
    detail:
      `the WebGL context reports preserveDrawingBuffer=${shot.preserved}. The capture holds ` +
      `because it copies the frame in the task that drew it, not because the buffer was kept.`,
  });

  if (options.capture) {
    writeFileSync(options.capture, bytes);
    console.log(`browser: share card written to ${options.capture}`);
  }
  if (options.captureShell !== null) {
    for (const card of shot.cards) {
      const path = join(options.captureShell, `0020-share-card-${card.name}-1440.jpg`);
      writeFileSync(path, Buffer.from(card.url.slice(card.url.indexOf(',') + 1), 'base64'));
      console.log(`browser: share card written to ${path}`);
    }
  }
}

// ---------------------------------------------------------------------------
// The share controls, inside the application — Unit 4.9
//
// `--share` measures the pixels of a card against the source modules. This mode
// drives the BUILT application: it throws a pool on the table, opens the one
// disclosure, makes a card the way a player does, and judges the three things
// only a real browser can answer.
//
//   * **The download writes the bytes the composition produced.** The file the
//     button hands the browser is intercepted at `URL.createObjectURL`, which
//     is the browser's own call and not ours, and compared BYTE FOR BYTE
//     against the data URL the preview carries.
//   * **The Web Share call is offered only where the browser offers it.** The
//     platform's own `navigator.canShare` decides. Where it offers nothing the
//     control must be absent, and the check that would judge the call prints
//     `NOT JUDGED` and counts itself in `skipped=`.
//   * **The controls are reachable by keyboard alone**, each with a role, an
//     accessible name and a state, reached by real Tab presses.
//
// The oracle for the summary is the SCREEN's own readings — the live region and
// the two zone bands — which `--table` has already held against the rules core.
// So the card is judged against the roll and never against itself.
//
// A machine that cannot draw the table prints every check as NOT JUDGED and
// counts them in `skipped=`, exactly as `--table` does.
// ---------------------------------------------------------------------------

/** The pool this mode builds, by pressing the plus end of each tile. */
const SHARE_CONTROL_POOL = [
  ['attribute', 4],
  ['skill', 3],
  ['gear', 2],
  ['stress', 3],
];

/** Everything `sheet-share` holds, as a reader and a ruler meet it. */
async function readSharePanel(page) {
  return page.evaluate(() => {
    const panel = document.querySelector('[data-el="sheet-share"]');
    if (panel === null) return null;
    const controls = [...panel.querySelectorAll('button')].map((element) => {
      const box = element.getBoundingClientRect();
      return {
        el: element.dataset.el ?? '',
        role: element.getAttribute('role') ?? element.tagName.toLowerCase(),
        name: (element.getAttribute('aria-label') ?? element.textContent ?? '')
          .replace(/\s+/g, ' ')
          .trim(),
        state: element.getAttribute('aria-disabled'),
        width: Math.round(box.width),
        height: Math.round(box.height),
      };
    });
    const preview = panel.querySelector('[data-el="share-preview"]');
    return {
      controls,
      preview:
        preview === null
          ? null
          : {
              tag: preview.tagName,
              alt: preview.getAttribute('alt') ?? '',
              url: preview.getAttribute('src') ?? '',
              tabIndex: preview.tabIndex,
              width: Math.round(preview.getBoundingClientRect().width),
            },
      note: (panel.querySelector('[data-el="share-note"]')?.textContent ?? '').trim(),
      noteRole: panel.querySelector('[data-el="share-note"]')?.getAttribute('role') ?? null,
    };
  });
}

/** What the screen itself says the roll is. The card is judged against this. */
async function readScreenReadings(page) {
  return page.evaluate(() => {
    const spoken = document.querySelector('[data-el="status-line"] .sr-only')?.textContent ?? '';
    const zone = (name) =>
      document.querySelectorAll(`[data-el="${name}"] [data-el^="die-"]`).length;
    const number = (pattern) => {
      const found = pattern.exec(spoken);
      return found === null ? null : Number(found[1]);
    };
    return {
      spoken,
      successes: number(/(\d+) success(?:es)?\./),
      banes: number(/(\d+) banes?\./),
      pushes: number(/Push (\d+)\./),
      dice: document.querySelectorAll('[data-el^="die-"]').length,
      kept: zone('kept-shelf'),
      loose: zone('throw-zone'),
    };
  });
}

/** What the browser itself offers as a share target, for this very file. */
async function readShareTarget(page) {
  return page.evaluate(() => ({
    hasShare: typeof navigator.share === 'function',
    hasCanShare: typeof navigator.canShare === 'function',
    takesFile:
      typeof navigator.canShare === 'function'
        ? (() => {
            try {
              return navigator.canShare({
                files: [new File([new Uint8Array([1])], 'card.jpg', { type: 'image/jpeg' })],
              });
            } catch {
              return false;
            }
          })()
        : false,
  }));
}

async function runShareControls(page, options, checks) {
  const cardMod = await (async () => {
    register('./ts-resolve.mjs', import.meta.url);
    return import('../src/shell/share-card.ts');
  })();

  const opening = await page.evaluate(() => ({
    renderer: document.querySelector('.screen')?.dataset.renderer ?? 'unknown',
  }));
  const onTheTable = opening.renderer === 'tray';
  const why =
    'the startup probe answered below the bar, so the screen draws flat dice and mounts no ' +
    'table. A card is a picture of the table, so there is none to make. There is no WebGL ' +
    'context inside the sandbox. Run this mode with the sandbox off.';
  const judge = (name, ok, detail) =>
    checks.push(
      onTheTable
        ? { name, ok, detail }
        : { name, ok: true, skipped: true, detail: `NOT JUDGED: ${why}` },
    );

  if (!onTheTable) {
    console.log(`browser: share-controls renderer=${opening.renderer} NOT JUDGED, ${why}`);
    for (const name of [
      'share-controls.the-panel-is-behind-the-one-disclosure',
      'share-controls.the-card-carries-the-roll-the-screen-holds',
      'share-controls.the-download-writes-the-bytes-the-composition-produced',
      'share-controls.every-control-is-reachable-by-keyboard-alone',
      'share-controls.the-web-share-call-is-offered-where-the-browser-offers-it',
    ]) {
      judge(name, true, '');
    }
    return;
  }

  // ---- The roll the card is made of ----
  for (const [tile, presses] of SHARE_CONTROL_POOL) await pressTile(page, tile, 'p', presses);
  await settleScreen(page);
  await page.click('[data-el="roll-button"]');
  await page.waitForFunction(
    () => window.__clatterTable !== undefined && window.__clatterTable.busy === false,
    { timeout: 60000 },
  );
  await settleScreen(page);
  const screen = await readScreenReadings(page);
  console.log(
    `browser: share-controls renderer=${opening.renderer} dice=${screen.dice} ` +
      `kept=${screen.kept} loose=${screen.loose} successes=${screen.successes} ` +
      `banes=${screen.banes} pushes=${screen.pushes}`,
  );

  // ---- 1. The panel is behind the one disclosure, and it holds one control ----
  const closed = await page.evaluate(
    () =>
      [...document.querySelectorAll('[data-el]')].filter(
        (each) => each.dataset.el.startsWith('share-') || each.dataset.el === 'sheet-share',
      ).length,
  );
  await openSheet(page);
  const before = await readSharePanel(page);
  judge(
    'share-controls.the-panel-is-behind-the-one-disclosure',
    closed === 0 &&
      before !== null &&
      before.controls.length === 1 &&
      before.controls[0].el === 'share-card-button' &&
      before.preview === null &&
      before.noteRole === 'status',
    `the roll flow at rest holds ${closed} parts of this panel, and the sheet holds ` +
      `${before === null ? 'none' : before.controls.length} control: ` +
      `[${(before?.controls ?? []).map((one) => one.el).join(', ')}]. The two ways out arrive ` +
      `with the card, so there is nothing to save before one is made. The note is a live ` +
      `region (role=${before?.noteRole}).`,
  );

  // ---- 2. One press makes a card of the roll the screen is holding ----
  await page.click('[data-el="share-card-button"]');
  await page.waitForSelector('[data-el="share-preview"]', { timeout: 30000 });
  const made = await readSharePanel(page);
  const target = await readShareTarget(page);

  // The oracle: the screen's own readings, turned into the words the card must
  // carry BY THIS FILE, not by the module under test.
  const wanted = [
    `${screen.successes === 1 ? '1 success' : `${screen.successes} successes`}`,
    `${screen.banes === 1 ? '1 bane' : `${screen.banes} banes`}`,
    `${screen.dice === 1 ? '1 die' : `${screen.dice} dice`}`,
    `${screen.kept} kept`,
    `${screen.loose} in the cup`,
    `${screen.pushes === 1 ? '1 push' : `${screen.pushes} pushes`}`,
  ];
  const alt = made?.preview?.alt ?? '';
  const unsaid = wanted.filter(
    (line) => !alt.includes(`${line.charAt(0).toUpperCase()}${line.slice(1)}.`),
  );
  console.log(
    `browser: share-controls card bytes=${
      made?.preview === null ? 0 : cardMod.bytesOfDataUrl(made.preview.url).length
    } media_type=${made?.preview === null ? 'none' : cardMod.mediaTypeOfDataUrl(made.preview.url)} ` +
      `alt="${alt.slice(0, 80)}" wanted=${wanted.length} unsaid=${unsaid.length} ` +
      `controls=[${(made?.controls ?? []).map((one) => one.el).join(', ')}] ` +
      `share_target=${target.hasShare && target.takesFile}`,
  );
  judge(
    'share-controls.the-card-carries-the-roll-the-screen-holds',
    unsaid.length === 0 &&
      wanted.length === 6 &&
      made?.preview?.tag === 'IMG' &&
      made.preview.tabIndex < 0 &&
      cardMod.mediaTypeOfDataUrl(made.preview.url) === 'image/jpeg' &&
      cardMod.bytesOfDataUrl(made.preview.url).length > 0,
    `compared=${wanted.length - unsaid.length} of ${wanted.length} readings, each one built ` +
      `HERE from what the screen printed — the live region for the successes, the banes and ` +
      `the push count, and the two zones for the kept and the loose dice — and looked for in ` +
      `the alternative text of the image the application generated. ` +
      `unsaid=${unsaid.length}${unsaid.length === 0 ? '' : ` [${unsaid.join('; ')}]`}. The ` +
      `preview is an ${made?.preview?.tag} carrying that text and no tab stop ` +
      `(tabindex ${made?.preview?.tabIndex}).`,
  );

  // ---- 3. The download writes the bytes the composition produced ----
  await page.evaluate(() => {
    window.__download = { blobs: [], names: [], hrefs: [], types: [] };
    const real = URL.createObjectURL.bind(URL);
    URL.createObjectURL = (blob) => {
      window.__download.blobs.push(blob);
      window.__download.types.push(blob.type);
      return real(blob);
    };
    HTMLAnchorElement.prototype.click = function click() {
      window.__download.names.push(this.download);
      window.__download.hrefs.push(this.href);
    };
  });
  await page.click('[data-el="share-download-button"]');
  await page.waitForFunction(() => window.__download.blobs.length > 0, { timeout: 30000 });
  const offered = await page.evaluate(async () => {
    const blob = window.__download.blobs[0];
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let hex = '';
    for (const byte of bytes) hex += byte.toString(16).padStart(2, '0');
    return {
      hex,
      size: blob.size,
      type: blob.type,
      name: window.__download.names[0] ?? null,
      href: (window.__download.hrefs[0] ?? '').slice(0, 5),
      offers: window.__download.blobs.length,
      note: document.querySelector('[data-el="share-note"]')?.textContent ?? '',
    };
  });
  // The oracle runs HERE, in node: the bytes of the data URL the preview
  // carries, decoded by the application's own decoder run in another engine.
  const want = Buffer.from(cardMod.bytesOfDataUrl(made.preview.url));
  const got = Buffer.from(offered.hex, 'hex');
  let compared = 0;
  let firstDifference = -1;
  if (got.length === want.length) {
    for (let at = 0; at < got.length; at += 1) {
      compared += 1;
      if (got[at] !== want[at] && firstDifference < 0) firstDifference = at;
    }
  }
  const header = readJpeg(got);
  console.log(
    `browser: share-controls download bytes=${got.length} wanted=${want.length} ` +
      `compared=${compared} first_difference=${firstDifference} name=${offered.name} ` +
      `href=${offered.href} type=${offered.type} offers=${offered.offers} ` +
      `note="${offered.note.slice(0, 60)}"`,
  );
  judge(
    'share-controls.the-download-writes-the-bytes-the-composition-produced',
    offered.offers === 1 &&
      got.length > 0 &&
      got.length === offered.size &&
      got.length === want.length &&
      compared === got.length &&
      firstDifference === -1 &&
      header.ok &&
      /^clatter-card-\d{4}-\d{2}-\d{2}-\d{4}\.jpg$/.test(String(offered.name)) &&
      offered.href === 'blob:' &&
      String(offered.type).startsWith('image/jpeg') &&
      offered.note.includes(String(offered.name)),
    `one press handed the browser ${offered.offers} object URL, on an anchor named ` +
      `"${offered.name}" whose href is a ${offered.href} URL and whose blob is ${offered.type}. ` +
      `The file measures ${got.length} bytes against the ${want.length} this file decodes IN ` +
      `NODE from the data URL the preview carries, and against the ${offered.size} the browser ` +
      `itself reports for the blob. The comparison is BYTE FOR BYTE and not by length: ` +
      `${compared} bytes compared, first difference at ${firstDifference}, where -1 is none. ` +
      `The denominator is the file itself, and a file of no bytes fails. It is a whole JPEG: ` +
      `${header.ok ? `frame header ${header.marker}, ${header.width}x${header.height}` : header.reason}.`,
  );

  // ---- 4. Every control is reachable by keyboard alone ----
  //
  // Real Tab presses from the control above the panel, so the walk crosses into
  // it the way a keyboard does. Every control it reaches carries a role, an
  // accessible name and a state a reader can announce.
  const walked = await page.evaluate(() => {
    const panel = document.querySelector('[data-el="sheet-share"]');
    return [...panel.querySelectorAll('button')].map((element) => element.dataset.el);
  });
  await startWalkAt(page, 'sheet-tray-renderer');
  const reached = [];
  for (let step = 0; step < 24 && reached.length < walked.length; step += 1) {
    await page.keyboard.press('Tab');
    const at = await page.evaluate(() => document.activeElement?.dataset.el ?? null);
    if (at !== null && walked.includes(at) && !reached.includes(at)) reached.push(at);
  }
  const nameless = made.controls.filter((one) => one.name === '');
  const stateless = made.controls.filter((one) => one.state === null);
  const wrongRole = made.controls.filter((one) => one.role !== 'button');
  const short = made.controls.filter((one) => one.height < 24 || one.width < 24);
  console.log(
    `browser: share-controls keyboard reached=${reached.length} of ${walked.length} ` +
      `[${reached.join(', ')}] nameless=${nameless.length} stateless=${stateless.length} ` +
      `wrong_role=${wrongRole.length} short=${short.length}`,
  );
  judge(
    'share-controls.every-control-is-reachable-by-keyboard-alone',
    reached.length === walked.length &&
      walked.length >= 2 &&
      nameless.length === 0 &&
      stateless.length === 0 &&
      wrongRole.length === 0 &&
      short.length === 0,
    `reached=${reached.length} of ${walked.length} controls by real Tab presses alone, ` +
      `[${reached.join(', ')}]. Each one carries a role (${wrongRole.length} wrong), an ` +
      `accessible name (${nameless.length} without one) and a state a reader can announce ` +
      `(${stateless.length} without an aria-disabled), and none is under the 24 px floor of ` +
      `WCAG 2.2 SC 2.5.8 (${short.length}). The denominator is the panel's own control list, ` +
      `read off the document, so a control that grew and was never walked fails.`,
  );

  // ---- 5. The Web Share call, where the browser offers one ----
  //
  // **Its absence is not a failure.** Where the browser offers no target the
  // control must be absent, and that much IS judged. Whether the call carries
  // the card cannot be judged at all on such a browser, so it prints NOT JUDGED
  // and counts in `skipped=`.
  const sendDrawn = made.controls.some((one) => one.el === 'share-send-button');
  judge(
    'share-controls.the-web-share-call-is-offered-where-the-browser-offers-it',
    sendDrawn === (target.hasShare && target.hasCanShare && target.takesFile),
    `this browser reports navigator.share=${target.hasShare}, ` +
      `navigator.canShare=${target.hasCanShare} and canShare({files})=${target.takesFile}, and ` +
      `the panel drew the send control: ${sendDrawn}. The two agree. A browser that shares no ` +
      `file draws no control, and that absence is not a failure: the download above is the ` +
      `route there.`,
  );
  if (target.hasShare && target.hasCanShare && target.takesFile) {
    // The call itself is intercepted, because a real one opens a platform
    // sheet this run has no way to close.
    await page.evaluate(() => {
      window.__shared = [];
      navigator.share = async (data) => {
        window.__shared.push({
          files: (data.files ?? []).map((file) => ({
            name: file.name,
            type: file.type,
            size: file.size,
          })),
          text: data.text ?? '',
        });
      };
    });
    await page.click('[data-el="share-send-button"]');
    await page.waitForFunction(() => window.__shared.length > 0, { timeout: 30000 });
    const shared = await page.evaluate(() => ({
      calls: window.__shared,
      note: document.querySelector('[data-el="share-note"]')?.textContent ?? '',
    }));
    const call = shared.calls[0];
    console.log(
      `browser: share-controls share calls=${shared.calls.length} ` +
        `files=${call?.files.length ?? 0} bytes=${call?.files[0]?.size ?? 0} ` +
        `text="${(call?.text ?? '').slice(0, 60)}"`,
    );
    checks.push({
      name: 'share-controls.the-share-target-is-handed-the-card-and-its-readings',
      ok:
        shared.calls.length === 1 &&
        call.files.length === 1 &&
        call.files[0].size === want.length &&
        call.files[0].type === 'image/jpeg' &&
        call.text === made.preview.alt,
      detail:
        `one press made ${shared.calls.length} call, carrying ${call?.files.length ?? 0} file of ` +
        `${call?.files[0]?.size ?? 0} bytes against the ${want.length} the composition produced, ` +
        `and the same readings in words. The target is the BROWSER's, never a service of ours.`,
    });
  } else {
    checks.push({
      name: 'share-controls.the-share-target-is-handed-the-card-and-its-readings',
      ok: true,
      skipped: true,
      detail:
        `NOT JUDGED: this browser offers no share target for a file. It reports ` +
        `navigator.share=${target.hasShare}, navigator.canShare=${target.hasCanShare} and ` +
        `canShare({files})=${target.takesFile}. There is no call to judge, and the check above ` +
        `holds that the control is absent because of it.`,
    });
  }

  if (options.captureShell !== null) {
    const path = join(options.captureShell, '0021-share-panel-1440.png');
    await page.screenshot({ path });
    console.log(`browser: share-controls captured the panel to ${path}`);
  }
}

// ---------------------------------------------------------------------------
// Offline — Unit 5.1
//
// One visit, then the network is taken away and the page is loaded again. The
// run judges what the page rendered, not that a load event fired: a blank page
// fires one too.
// ---------------------------------------------------------------------------

/**
 * The named parts of the application, as the offline page must show them.
 *
 * This list is the denominator. A check that only asked "did anything render"
 * would pass on an empty document, so every part is looked up by its own
 * selector and the count of parts found is compared against the length here.
 */
const OFFLINE_PAGE_PARTS = [
  { name: 'the builder heading', selector: '[data-el="collapse-button"]', text: 'Done' },
  {
    name: 'the first pool tile',
    selector: '[data-el="pool-cell-attribute"] .cell-t',
    text: 'attribute',
  },
  { name: 'the disclosure', selector: '[data-el="disclosure-toggle"]', text: 'More' },
];

/** What the table holds once the lazy 3D chunk has loaded and mounted. */
const OFFLINE_TRAY_READY = 'a canvas on the table';

/**
 * The manifest fields a browser needs before it offers to install a site, each
 * with the rule it must pass. The count is asserted, so a field quietly dropped
 * from this list parts the two numbers and the check goes red.
 */
const MANIFEST_FIELDS = [
  ['name', (v) => typeof v === 'string' && v.length > 0],
  ['short_name', (v) => typeof v === 'string' && v.length > 0],
  ['start_url', (v) => typeof v === 'string' && v.startsWith('/')],
  ['scope', (v) => typeof v === 'string' && v.startsWith('/')],
  ['display', (v) => ['standalone', 'fullscreen', 'minimal-ui'].includes(v)],
  ['background_color', (v) => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v)],
  ['theme_color', (v) => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v)],
  ['icons', (v) => Array.isArray(v) && v.length > 0],
];

/** The two icon sizes a browser asks for. Both must decode at their declared size. */
const MANIFEST_ICON_SIZES = ['192x192', '512x512'];

/** Wait for a page-side promise, or come back with a reason rather than hanging. */
function withTimeout(promise, ms, reason) {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve({ timedOut: reason }), ms)),
  ]);
}

/**
 * Start the preview server the offline run will later stop, and wait until it
 * answers.
 *
 * This run starts its own server because it must later prove the server has
 * stopped, and a server the caller started cannot be stopped with certainty. A
 * shell hands over the pid of `npm`, which is the parent of vite and not the
 * holder of the port, or the pid of `setsid`, which forks and is not the leader
 * of the group it made. Both were measured on this host on 2026-08-09, and
 * after both kills the origin still answered 200. Spawning it here gives this
 * file the group leader itself.
 */
async function startPreviewServer(url, cwd) {
  const port = new URL(url).port || '4173';
  const server = spawn('npm', ['run', 'preview', '--', '--port', port], {
    cwd,
    // Its own process group, so one signal reaches npm and vite together.
    detached: true,
    stdio: 'ignore',
  });
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    try {
      await fetch(url, { cache: 'no-store' });
      console.log(`browser: offline preview server pid=${server.pid} answering at ${url}`);
      return server;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  stopPreviewServer(server);
  throw new Error(`the preview server did not answer at ${url} within 30 seconds`);
}

/** Signal the whole group. Safe to call twice. */
function stopPreviewServer(server) {
  try {
    process.kill(-server.pid, 'SIGKILL');
  } catch {
    // Already gone. `originStillAnswers` is what decides, not this.
  }
}

/**
 * Wait until nothing answers at `url`. Returns null once the origin is
 * unreachable, or a sentence naming what still answers when the wait runs out.
 */
async function originStillAnswers(url, ms = 10000) {
  const deadline = Date.now() + ms;
  let status = 'nothing';
  while (Date.now() < deadline) {
    try {
      status = (await fetch(url, { cache: 'no-store' })).status;
    } catch {
      return null;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return `${url} still answers with status ${status} after ${ms} ms`;
}

async function runOffline(page, options, checks, server) {
  // ---- The one visit. The page is already loaded by `run`. ----
  const installed = await withTimeout(
    page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) {
        return { ready: false, reason: 'this browser has no navigator.serviceWorker' };
      }
      const registration = await navigator.serviceWorker.ready;
      if (!navigator.serviceWorker.controller) {
        await new Promise((resolve) => {
          navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true });
        });
      }
      const names = await caches.keys();
      const held = {};
      for (const name of names) {
        const keys = await (await caches.open(name)).keys();
        held[name] = keys.map((request) => new URL(request.url).pathname);
      }
      return {
        ready: true,
        scope: registration.scope,
        scriptURL: registration.active ? registration.active.scriptURL : null,
        controller: navigator.serviceWorker.controller
          ? navigator.serviceWorker.controller.scriptURL
          : null,
        held,
      };
    }),
    30000,
    'no service worker took control of the page within 30 seconds. Two causes reach this ' +
      'line and they need different repairs. Either no worker registered at all, and a dev ' +
      'server serves none, so --offline needs a preview server over the built output. Or a ' +
      'worker registered, activated and never claimed the page, which is what a build does ' +
      'when it sets neither clientsClaim nor skipWaiting. Read the build output to tell the ' +
      'two apart: a worker that registered writes dist/sw.js.',
  );

  if (installed.timedOut || !installed.ready) {
    checks.push({
      name: 'offline.the-worker-installs-on-the-first-visit',
      ok: false,
      detail: installed.timedOut ?? installed.reason,
    });
    return;
  }

  const cacheNames = Object.keys(installed.held);
  const precached = cacheNames.flatMap((name) => installed.held[name]);
  console.log(
    `browser: offline caches=[${cacheNames.join(', ')}] entries=${precached.length} ` +
      `[${precached.join(', ')}]`,
  );
  checks.push({
    name: 'offline.the-worker-installs-on-the-first-visit',
    ok: installed.controller !== null && precached.length > 0,
    detail:
      `the worker at ${installed.scriptURL} controls the page over the scope ` +
      `${installed.scope}, and it holds ${precached.length} entries over ` +
      `${cacheNames.length} caches`,
  });

  // ---- Take the network away, and the HTTP cache with it. ----
  //
  // Three things go, and each one closes a store that could otherwise answer
  // the reload. The HTTP cache goes into bypass at the driver. Every request
  // that reaches the network is refused. The server itself is stopped. What
  // remains is the Cache Storage the service worker owns, which is the thing
  // this check is about.
  //
  // Why all three, and why the server must be one of them. Two weaker
  // mechanisms were measured on this host on 2026-08-09 and both were wrong.
  //
  // `page.setOfflineMode(true)` sends the BiDi command
  // `emulation.setNetworkConditions` with type 'offline'. Firefox then fails
  // the navigation at commit with NS_ERROR_OFFLINE, before the service worker
  // can intercept it. The worker never sees the request, so the run measures
  // the emulation and not the application, and it fails against a build that
  // does control the page.
  //
  // Refusing each request is not enough on its own. Firefox refuses the abort
  // for the navigation and its subresources, because the service worker
  // already owns them by the time the abort arrives. Those requests then reach
  // the network unrefused. With the server still up they were answered by the
  // server, and the check passed while Cache Storage was empty. That is a
  // check that cannot fail, and stopping the server is what closes it.
  await page.setCacheEnabled(false);
  await page.setRequestInterception(true);

  // An abort can be refused, as described above. Each refusal is recorded and
  // reported by url rather than swallowed, because a request this run failed
  // to abort is a request some other store could still have answered.
  const abortRefusals = [];
  page.on('request', (request) => {
    const url = request.url();
    request.abort().catch(() => abortRefusals.push(url));
  });

  // Stop the origin, then prove it stopped. `npm run preview` starts a child
  // process, and a signal to the wrapper does not always reach it, so an
  // unchecked kill is an assumption rather than a measurement.
  stopPreviewServer(server);
  const serverStopped = await originStillAnswers(options.url);
  console.log(
    `browser: offline server_pid=${server.pid} ` +
      `origin_unreachable=${serverStopped === null}` +
      (serverStopped === null ? '' : ` (${serverStopped})`),
  );

  const failedRequests = [];
  page.on('requestfailed', (request) => {
    let path = request.url();
    try {
      path = new URL(request.url()).pathname;
    } catch {
      // A request with no parseable url is reported whole.
    }
    const failure = request.failure();
    failedRequests.push(`${path} ${failure ? failure.errorText : 'failed'}`);
  });

  let reloadError = null;
  try {
    await page.reload({ waitUntil: 'load' });
  } catch (error) {
    reloadError = String((error && error.message) || error);
  }

  // ---- What came back. ----
  const rendered = await page.evaluate((parts) => {
    const navigation = performance.getEntriesByType('navigation')[0];
    const root = document.getElementById('app');
    return {
      controller: navigator.serviceWorker.controller
        ? navigator.serviceWorker.controller.scriptURL
        : null,
      workerStart: navigation ? navigation.workerStart : null,
      transferSize: navigation ? navigation.transferSize : null,
      deliveryType: navigation ? navigation.deliveryType : null,
      appChildren: root ? root.childElementCount : 0,
      parts: parts.map((part) => {
        const element = document.querySelector(part.selector);
        return {
          name: part.name,
          text: element ? (element.textContent || '').trim() : null,
        };
      }),
    };
  }, OFFLINE_PAGE_PARTS);

  console.log(
    `browser: offline navigation controller=${rendered.controller} ` +
      `worker_start=${rendered.workerStart} transfer_size=${rendered.transferSize} ` +
      `delivery_type=${rendered.deliveryType} failed_requests=${failedRequests.length} ` +
      `refused_aborts=${abortRefusals.length} [${abortRefusals.join(', ')}]`,
  );

  const named = failedRequests.length ? ` Failed requests: [${failedRequests.join('; ')}]` : '';

  checks.push({
    name: 'offline.the-worker-serves-the-page-not-the-http-cache',
    ok:
      reloadError === null &&
      serverStopped === null &&
      rendered.controller !== null &&
      rendered.controller.endsWith('/sw.js'),
    detail:
      `the reload ran with the server stopped, every network request refused and the HTTP ` +
      `cache in bypass at the driver, so no server and no HTTP cache entry could answer it. ` +
      (serverStopped === null
        ? `The origin was confirmed unreachable before the reload. `
        : `The origin was NOT confirmed unreachable: ${serverStopped}. `) +
      `The page reports a controlling worker at ${rendered.controller}, and ` +
      `${failedRequests.length} requests were refused. ` +
      `The navigation entry reads workerStart=${rendered.workerStart} and ` +
      `deliveryType=${JSON.stringify(rendered.deliveryType)}. Read neither number as ` +
      `evidence on this browser. Firefox reports workerStart 0 even when the worker did ` +
      `serve the navigation, measured on this host on 2026-08-09, so the controlling worker ` +
      `and the refused requests are what this check judges.` +
      (reloadError ? ` The reload itself failed: ${reloadError}.` : '') +
      named,
  });

  const matched = rendered.parts.filter(
    (part, index) => part.text === OFFLINE_PAGE_PARTS[index].text,
  );
  const wrong = rendered.parts
    .filter((part, index) => part.text !== OFFLINE_PAGE_PARTS[index].text)
    .map((part) => `${part.name} reads ${JSON.stringify(part.text)}`);
  checks.push({
    name: 'offline.the-application-rendered',
    // The reload must have happened. A reload that threw leaves the document
    // from the first visit in place, and every named part then still reads the
    // text it must, over a page nothing served. This check read that stale
    // document and stayed green while the reload threw, so the condition below
    // is what makes it about the offline load rather than about the visit
    // before it.
    ok:
      reloadError === null &&
      matched.length === OFFLINE_PAGE_PARTS.length &&
      rendered.appChildren > 0,
    detail:
      `${matched.length} of the ${OFFLINE_PAGE_PARTS.length} named parts read the text they ` +
      `must, and the application root holds ${rendered.appChildren} elements. A blank page ` +
      `fires a load event and reads 0 here.` +
      (reloadError
        ? ` The reload itself failed, so these parts are the first visit's document and not ` +
          `an offline load: ${reloadError}.`
        : '') +
      (wrong.length ? ` [${wrong.join('; ')}]` : '') +
      named,
  });

  // ---- The lazy 3D chunk, still offline. ----
  //
  // The table is the route to the tray. `Roll` collapses the builder and shows
  // the table, and the shell then imports the tray chunk. Unit 2.1 built that
  // route, and Unit 2.2 throws dice onto it.
  const readTable = () =>
    page
      .evaluate(() => {
        if (document.querySelector('canvas') !== null) return 'a canvas on the table';
        const note = document.querySelector('[data-el="dice-table"] .table-note');
        return note === null ? 'nothing on the table' : (note.textContent || '').trim();
      })
      .catch(() => null);
  let trayStatus;
  try {
    await page.click('[data-el="roll-button"]');
    // Three ends, because Unit 3.7 gave the table a third. The tray mounts, or
    // the mount fails and the table says so, or the renderer choice settles on
    // flat dice and the table is never asked for at all. Without the third the
    // wait ran to its own timeout on every machine with no WebGL context.
    await page.waitForFunction(
      () =>
        document.querySelector('canvas') !== null ||
        document.querySelector('[data-el="dice-table"] .table-note') !== null ||
        document.querySelector('.screen[data-renderer="flat"]') !== null,
      { timeout: 60000 },
    );
  } catch {
    // The read below reports what the table holds either way.
  }
  trayStatus = await readTable();
  // Two claims sit behind that button, and only one of them can be judged on
  // every machine, so they are two checks.
  //
  // Whether the chunk came out of the precache is about the network. Any
  // machine can answer it. Whether the tray mounted is about the graphics card:
  // a browser with no WebGL context cannot mount the tray whatever the precache
  // holds, and it fails the same way with the network up. One check over both
  // claims reports a missing graphics card as a precache failure, and it cannot
  // pass at all where there is no WebGL.
  const chunkUrl = precached.find((url) => /\/dice-tray-[^/]+\.js$/.test(url)) ?? null;
  const tray = await page.evaluate((chunk) => {
    const canvas = document.createElement('canvas');
    let webgl;
    try {
      webgl = Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
    } catch {
      webgl = false;
    }
    return {
      canvases: document.querySelectorAll('canvas').length,
      webgl,
      fetched:
        chunk === null
          ? 0
          : performance
              .getEntriesByType('resource')
              .filter((entry) => new URL(entry.name).pathname === chunk).length,
    };
  }, chunkUrl);
  const chunkFailures = failedRequests.filter(
    (line) => chunkUrl !== null && line.startsWith(`${chunkUrl} `),
  );

  // The bytes themselves, asked for by the page with the origin stopped.
  //
  // Unit 3.7 moved this reading. The check used to count the requests the
  // application itself made through the table, and the application now asks for
  // the chunk only where `decideTray` clears the bar. A browser with no WebGL
  // context never asks, so the old reading measured the graphics card and
  // called it a precache failure — which is the exact fault the mount check
  // beside it was split out to avoid. This asks for the chunk directly, so the
  // claim is about the service worker alone and holds on every machine. The
  // application's own request count is reported beside it.
  const answered = await page.evaluate(async (chunk) => {
    if (chunk === null) return { ok: false, reason: 'the precache names no 3D chunk' };
    try {
      const response = await fetch(chunk);
      const body = await response.arrayBuffer();
      return { ok: response.ok, status: response.status, bytes: body.byteLength };
    } catch (error) {
      return { ok: false, reason: String(error) };
    }
  }, chunkUrl);
  const renderer = await page
    .evaluate(() => document.querySelector('.screen')?.dataset.renderer ?? null)
    .catch(() => null);
  console.log(
    `browser: offline chunk=${chunkUrl} status=${answered.status ?? answered.reason} ` +
      `bytes=${answered.bytes ?? 0} app_requests=${tray.fetched} renderer=${renderer}`,
  );

  checks.push({
    name: 'offline.the-lazy-3d-chunk-is-precached',
    ok:
      chunkUrl !== null &&
      answered.ok === true &&
      (answered.bytes ?? 0) > 0 &&
      chunkFailures.length === 0,
    detail:
      `the page asked for the lazy 3D chunk with the origin stopped, and the precache ` +
      `answered with bytes. The chunk is ${JSON.stringify(chunkUrl)}, the answer read ` +
      `status ${answered.status ?? JSON.stringify(answered.reason)} over ` +
      `${answered.bytes ?? 0} bytes, and ${chunkFailures.length} of its requests failed. All ` +
      `three are needed: a request nobody made fails nothing either, and an answer of zero ` +
      `bytes is not the chunk. This is the precache decision of this unit, so a player who ` +
      `visited once keeps the dice. The application itself asked for it ${tray.fetched} ` +
      `times, which is reported and not judged: it asks only where the renderer choice of ` +
      `Unit 3.7 clears the bar, and this run reads renderer=${renderer}.` +
      (chunkFailures.length ? ` [${chunkFailures.join('; ')}]` : ''),
  });

  checks.push({
    name: 'offline.the-lazy-3d-chunk-mounts',
    skipped: !tray.webgl,
    ok: trayStatus === OFFLINE_TRAY_READY && tray.canvases > 0,
    detail: tray.webgl
      ? `the tray mounted from the precached chunk with the origin stopped. The status line ` +
        `reads ${JSON.stringify(trayStatus)}, the page holds ${tray.canvases} canvas ` +
        `elements, and the renderer choice of Unit 3.7 reads ${renderer}.`
      : `NOT JUDGED, and nothing here says the tray mounts. This browser gives no WebGL ` +
        `context, so the tray cannot mount whatever the precache holds, and it fails the ` +
        `same way with the network up: measured on this host on 2026-08-09. The status line ` +
        `reads ${JSON.stringify(trayStatus)} and the page holds ${tray.canvases} canvas ` +
        `elements. To judge it, give the browser a graphics card. The sandbox hides ` +
        `/dev/dri, so run this outside the sandbox, or run --hardware on a real machine.`,
  });

  // ---- The manifest, read offline as well. ----
  //
  // The manifest is precached by an entry the plugin appends after every
  // manifestTransforms function has run, so the build-time coverage check in
  // vite.config.ts cannot see it. This is the instrument that covers it.
  const manifest = await page.evaluate(async () => {
    const link = document.querySelector('link[rel="manifest"]');
    if (link === null) return { ok: false, reason: 'the page names no manifest' };
    let response;
    try {
      response = await fetch(link.href);
    } catch (error) {
      return { ok: false, reason: `fetching the manifest threw: ${error}` };
    }
    if (!response.ok) return { ok: false, reason: `the manifest answered ${response.status}` };
    const body = await response.json();
    const icons = await Promise.all(
      (body.icons || []).map(
        (icon) =>
          new Promise((resolve) => {
            const image = new Image();
            image.onload = () =>
              resolve({
                src: icon.src,
                sizes: icon.sizes,
                type: icon.type,
                purpose: icon.purpose,
                decoded: `${image.naturalWidth}x${image.naturalHeight}`,
              });
            image.onerror = () =>
              resolve({ src: icon.src, sizes: icon.sizes, type: icon.type, decoded: null });
            image.src = new URL(icon.src, link.href).href;
          }),
      ),
    );
    return { ok: true, href: link.href, body, icons };
  });

  if (!manifest.ok) {
    checks.push({
      name: 'offline.the-manifest-is-installable',
      ok: false,
      detail: `${manifest.reason}, with the network offline.` + named,
    });
    return;
  }

  const badFields = MANIFEST_FIELDS.filter(([field, rule]) => !rule(manifest.body[field])).map(
    ([field]) => `${field}=${JSON.stringify(manifest.body[field])}`,
  );
  const badIcons = manifest.icons
    .filter((icon) => icon.decoded !== icon.sizes || icon.type !== 'image/png')
    .map((icon) => `${icon.src} declares ${icon.sizes} ${icon.type} and decoded ${icon.decoded}`);
  const sizesHeld = MANIFEST_ICON_SIZES.filter((size) =>
    manifest.icons.some((icon) => icon.sizes === size && icon.decoded === size),
  );
  console.log(
    `browser: offline manifest ${manifest.href} ` +
      manifest.icons
        .map((icon) => `${icon.src}:${icon.sizes}:${icon.purpose}:${icon.decoded}`)
        .join(' '),
  );
  checks.push({
    name: 'offline.the-manifest-is-installable',
    ok:
      badFields.length === 0 &&
      badIcons.length === 0 &&
      sizesHeld.length === MANIFEST_ICON_SIZES.length,
    detail:
      `checked ${MANIFEST_FIELDS.length - badFields.length} of the ${MANIFEST_FIELDS.length} ` +
      `fields a browser needs, and ${manifest.icons.length} icons, all read over the network ` +
      `offline. The two sizes a browser asks for are held ${sizesHeld.length} of ` +
      `${MANIFEST_ICON_SIZES.length} times, each decoded at its declared size, which also ` +
      `proves the icon bytes came out of the precache.` +
      (badFields.length ? ` Bad fields: [${badFields.join('; ')}]` : '') +
      (badIcons.length ? ` Bad icons: [${badIcons.join('; ')}]` : ''),
  });
}

// ---------------------------------------------------------------------------
// The shell — Unit 2.1
//
// Two claims, both about the screen before a throw. The keyboard order is
// walked with real Tab presses in a real browser, and the three widths are
// captured for comparison against the renders beside
// `docs/design/0013-screen-final.html`.
//
// `src/app.test.tsx` asserts the same walk under jsdom, which runs no
// sequential focus navigation and therefore enumerates the tab stops itself.
// This mode is the half that presses the key.
// ---------------------------------------------------------------------------

/** The number words section 6 may count in. An unknown word is a failure. */
const VISIT_WORDS = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  twenty: 20,
  thirty: 30,
  forty: 40,
};

/**
 * A count in words, compounds included: `thirty-five` is thirty plus five. An
 * unknown part gives `undefined`, so the caller fails on a word it cannot read
 * rather than on a wrong number.
 *
 * @param {string|undefined} word
 */
function inWords(word) {
  let total = 0;
  for (const part of String(word ?? '')
    .toLowerCase()
    .split('-')) {
    if (VISIT_WORDS[part] === undefined) return undefined;
    total += VISIT_WORDS[part];
  }
  return total;
}

/**
 * Read the before-throw walk out of section 6 of the screen design.
 *
 * The document states the same walk three ways — a count in words, a numbered
 * list, and a sentence splitting the list into Tab stops and arrow visits — so
 * the list carries a denominator that can fail.
 */
export function beforeThrowVisits(markdown, when = 'Before') {
  const from = markdown.indexOf(`**${when} the throw`);
  const to =
    when === 'Before' ? markdown.indexOf('**After the throw') : markdown.indexOf('\n## 7.');
  if (from < 0 || to <= from) {
    throw new Error('section 6 no longer holds a before-throw list and an after-throw list');
  }
  const section = markdown.slice(from, to);
  const word = new RegExp(`\\*\\*${when} the throw — ([\\w-]+) visits\\.\\*\\*`).exec(section)?.[1];
  const stated = inWords(word);
  if (stated === undefined) {
    throw new Error(`section 6 states the ${when} count as ${word}, which is unread`);
  }
  const numbered = [...section.matchAll(/^(\d+)\. `([a-z0-9-]+)`/gm)];
  numbered.forEach(([, index], place) => {
    if (Number(index) !== place + 1) throw new Error(`the numbered list jumps at item ${index}`);
  });
  const tabText = /Tab reaches items ([\d, and]+)\./.exec(section)?.[1];
  const arrowRange = /The arrow keys reach items (\d+) to (\d+)/.exec(section);
  if (tabText === undefined || arrowRange === null) {
    throw new Error('section 6 no longer names which items Tab reaches and which the arrows do');
  }
  const first = Number(arrowRange[1]);
  const last = Number(arrowRange[2]);
  return {
    names: numbered.map(([, , name]) => name),
    stated,
    tab: [...tabText.matchAll(/\d+/g)].map(([digits]) => Number(digits)),
    arrow: Array.from({ length: last - first + 1 }, (_, step) => first + step),
  };
}

/** The three widths the renders beside the drawn screen were taken at. */
const SHELL_WIDTHS = [
  { name: '360x760', width: 360, height: 760 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '1440x900', width: 1440, height: 900 },
];

/**
 * The pool the drawn screen holds, from section 8: five attribute, five skill,
 * three gear, no artifact and two bonus dice, with ten stress dice beside them.
 */
/**
 * The presses that build the drawn pool: every tile at its cap. The artifact
 * tile steps a rating rather than a count, so six presses there put two d12
 * dice on the table, and the difficulty adds three bonus dice on top. The
 * number of dice is therefore NOT the number of presses, and the check below
 * counts the dice against the section 6 die list instead.
 */
const SHELL_DRAWN_POOL = [
  ['attribute', 5],
  ['skill', 5],
  ['gear', 3],
  ['artifact', 6],
  ['bonus', 2],
  ['stress', 10],
];

/** The notch the drawn screen sits on: the last one, which is +3. */
const SHELL_DRAWN_DIFFICULTY = 6;

/**
 * What the focused element is called, and whether the browser put it in the tab
 * order by itself.
 *
 * Firefox and Chrome both give a scrollable box its own tab stop, so a keyboard
 * can scroll a region that holds no control. Nothing in the markup asks for it
 * and the drawn screen earns the same stop, because `.shell-m` scrolls there
 * too. The walk reports such a stop under its own name rather than counting it
 * against the authored list.
 */
async function readVisit(page, inside) {
  return page.evaluate((within) => {
    const element = document.activeElement;
    if (element === null || element === document.body) return null;
    const held = within
      ? element.closest('[data-el]')
      : element.closest('[data-composite]') || element.closest('[data-el]');
    return {
      name: held === null ? `an unnamed ${element.tagName.toLowerCase()}` : held.dataset.el,
      implicit: !element.hasAttribute('tabindex') && element.scrollHeight > element.clientHeight,
    };
  }, inside);
}

const MARK = 'data-walk-mark';

async function markFocus(page) {
  await page.evaluate((attribute) => {
    if (document.activeElement !== null) document.activeElement.setAttribute(attribute, '');
  }, MARK);
}

async function focusMoved(page) {
  return page.evaluate((attribute) => {
    const still = document.activeElement !== null && document.activeElement.hasAttribute(attribute);
    for (const held of document.querySelectorAll(`[${attribute}]`)) held.removeAttribute(attribute);
    return !still;
  }, MARK);
}

/**
 * Walk the screen with the keys a player presses.
 *
 * At every Tab stop the walk presses one arrow key. Focus that moves means a
 * composite the arrows walk, and the walk follows it until it comes back.
 * Focus that stays means a control whose arrows change a value, so the press is
 * undone and no inner visit is recorded. Nothing in the rule knows the answer.
 */
async function walkShell(page, cap, stopAfterAuthored = Number.POSITIVE_INFINITY) {
  const visits = [];
  let firstStop = null;
  for (let stops = 0; stops < cap; stops += 1) {
    // Stop ON the last authored stop rather than one press past it.
    //
    // A Tab press at the last control of the document hands the focus to the
    // browser's own chrome. The page keeps its `document.activeElement` and
    // still takes key events, so the walk carries on working, but
    // `document.hasFocus()` is then false and the browser performs no DEFAULT
    // ACTION for a document that does not have the focus: Enter on a button
    // fires no click and nothing reports an error. A caller that presses a key
    // after its walk therefore names the number of authored visits it expects,
    // and `--a11y` probes for a stop past the end once, as its last act.
    if (visits.filter((visit) => !visit.implicit).length >= stopAfterAuthored) break;
    // A Tab that moves nothing is a Tab that left the document. Firefox hands
    // the focus to its own chrome after the last control and leaves
    // `document.activeElement` where it was, so the walk would otherwise
    // record that last control a second time. Measured on this host on
    // 2026-08-09.
    await markFocus(page);
    await page.keyboard.press('Tab');
    if (!(await focusMoved(page))) break;
    const stop = await readVisit(page, false);
    if (stop === null) break;
    if (stops > 0 && stop.name === firstStop) break;
    if (firstStop === null) firstStop = stop.name;
    visits.push({ name: stop.name, by: 'tab', implicit: stop.implicit });

    await markFocus(page);
    await page.keyboard.press('ArrowRight');
    if (!(await focusMoved(page))) {
      await page.keyboard.press('ArrowLeft');
      continue;
    }
    // The cell the focus started on is the first inner visit.
    await page.keyboard.press('ArrowLeft');
    const start = await readVisit(page, true);
    visits.push({ name: start.name, by: 'arrow', implicit: false });
    for (let taken = 0; taken < 60; taken += 1) {
      await page.keyboard.press('ArrowRight');
      const inner = await readVisit(page, true);
      if (inner === null || inner.name === start.name) break;
      visits.push({ name: inner.name, by: 'arrow', implicit: false });
    }
  }
  return visits;
}

async function runShell(page, options, checks) {
  const design = readFileSync(join(here, '..', 'docs', 'design', '0002-screen-design.md'), 'utf8');
  const list = beforeThrowVisits(design);
  console.log(`browser: shell before_throw_visits=${list.names.length} stated=${list.stated}`);
  checks.push({
    name: 'shell.the-document-counts-its-own-list',
    ok: list.names.length === list.stated && list.stated > 0,
    detail:
      `section 6 numbers ${list.names.length} items and states ${list.stated} visits in words. ` +
      `The walk below is compared against that list, so an empty list would prove nothing.`,
  });

  // The walk runs on the screen as it opens, which is rest A with an empty
  // pool. The roving tab index sits on the first tile there, and a press moves
  // it, so the walk has to come before anything presses a tile.
  const visits = await walkShell(page, list.stated + 8);
  const named = visits.filter((visit) => !visit.implicit);
  const implicit = visits.filter((visit) => visit.implicit).map((visit) => visit.name);
  const walked = named.map((visit) => visit.name);
  const positions = (by) => named.flatMap((visit, index) => (visit.by === by ? [index + 1] : []));
  console.log(
    `browser: shell walked=[${walked.join(', ')}] ` +
      `implicit_scroll_stops=${implicit.length} [${implicit.join(', ')}]`,
  );
  checks.push({
    name: 'shell.the-keyboard-order-before-the-throw',
    ok:
      walked.length === list.stated &&
      walked.every((name, index) => name === list.names[index]) &&
      String(positions('tab')) === String(list.tab) &&
      String(positions('arrow')) === String(list.arrow),
    detail:
      `real Tab and arrow presses reached ${walked.length} authored visits against the ` +
      `${list.stated} section 6 names. Walked [${walked.join(', ')}]. ` +
      `Wanted [${list.names.join(', ')}]. Tab reached items [${positions('tab')}] against ` +
      `[${list.tab}], and the arrows reached [${positions('arrow')}] against [${list.arrow}]. ` +
      `The browser added ${implicit.length} scroll stops of its own, at ` +
      `[${implicit.join(', ')}]. They are reported and not counted: a scrollable box earns a ` +
      `tab stop from the browser so a keyboard can scroll it, the markup asks for none, and ` +
      `the drawn screen earns the same ones.`,
  });

  // The drawn pool next, so the capture shows the case that fails first: every
  // tile at its cap.
  const built = await page.evaluate(
    async (plan) => {
      let clicks = 0;
      for (const [type, count] of plan.tiles) {
        const end = document.querySelector(`[data-el="pool-cell-${type}"] .cell-p`);
        if (end === null) continue;
        for (let taken = 0; taken < count; taken += 1) {
          end.click();
          clicks += 1;
        }
      }
      const notch = document.querySelectorAll('[data-el="difficulty-track"] .tk-n')[plan.notch];
      if (notch !== undefined) {
        notch.click();
        clicks += 1;
      }
      // The shell renders on a later task, so the reading waits for a frame.
      await new Promise((settle) => requestAnimationFrame(() => requestAnimationFrame(settle)));
      const line = document.querySelector('[data-el="status-line"] .sr-only');
      return { clicks, spoken: line === null ? null : (line.textContent || '').trim() };
    },
    { tiles: SHELL_DRAWN_POOL, notch: SHELL_DRAWN_DIFFICULTY },
  );
  const presses = SHELL_DRAWN_POOL.reduce((sum, [, count]) => sum + count, 1);
  // The denominator is the document's own die list, not a sum of the presses.
  // Six presses on the artifact tile give two dice, and the difficulty gives
  // three more, so the two numbers are different on purpose.
  const drawnDice = beforeThrowVisits(design, 'After').names.filter((name) =>
    name.startsWith('die-'),
  ).length;
  checks.push({
    name: 'shell.the-pool-builds-under-a-pointer',
    ok: built.clicks === presses && (built.spoken || '').includes(`takes ${drawnDice} dice`),
    detail:
      `${built.clicks} of the ${presses} presses the drawn pool needs landed, and the live ` +
      `region reads ${JSON.stringify(built.spoken)}. Section 6 names ${drawnDice} dice, which ` +
      `is the draw target the caps and the difficulty derive.`,
  });

  if (options.captureShell !== null) {
    for (const size of SHELL_WIDTHS) {
      await page.setViewport({ width: size.width, height: size.height, deviceScaleFactor: 1 });
      const path = join(options.captureShell, `shell-builder-${size.name}.png`);
      await page.screenshot({ path });
      console.log(`browser: shell captured ${size.name} to ${path}`);
    }
    await page.setViewport({ width: 360, height: 760, deviceScaleFactor: 1 });
  }

  // ---- The throw, and the walk of rest B — Unit 2.2 ----
  //
  // The dice the throw produces decide which zone each die lands in, so the
  // after-throw list cannot be compared name for name against a document
  // written over one drawn result. What IS compared: the count, the two
  // non-die ends of the list by position, the die names as a set, and the
  // order the real keys walked against the order the DOM holds. A die missing
  // from either zone fails the set, and a zone drawn in the wrong order fails
  // the walk.
  const after = beforeThrowVisits(design, 'After');
  //
  // The drawn screen holds a table the player may push. Under the profile the
  // application rolls, a stress die showing a bane stops every further push,
  // and ten stress dice show one about five throws in six. The walk therefore
  // throws again until the push is live and reports how many throws it took. A
  // run that never reaches a live push fails and names the limit.
  const thrown = await page.evaluate(async (limit) => {
    const frame = () =>
      new Promise((settle) => requestAnimationFrame(() => requestAnimationFrame(settle)));
    const pushButton = () => document.querySelector('[data-el="push-button"]');
    let taken = 0;
    do {
      document.querySelector('[data-el="roll-button"]').click();
      await frame();
      taken += 1;
    } while (taken < limit && pushButton() !== null && pushButton().disabled);
    const slots = (name) =>
      [...document.querySelectorAll(`[data-el="${name}"] .slot`)].map((slot) => slot.dataset.el);
    return {
      tray: slots('dice-tray'),
      kept: slots('kept-shelf'),
      loose: slots('throw-zone'),
      push: document.querySelector('[data-el="push-button"]') !== null,
      pushDisabled: document.querySelector('[data-el="push-button"]')?.disabled ?? null,
      cost: (document.querySelector('[data-el="cost-row"] .cost-t')?.textContent ?? '').trim(),
      spoken: (
        document.querySelector('[data-el="status-line"] .sr-only')?.textContent ?? ''
      ).trim(),
      taken,
      limit,
    };
  }, 40);
  const dieNames = after.names.filter((name) => name.startsWith('die-'));
  console.log(
    `browser: shell threw throws=${thrown.taken} dice=${thrown.tray.length} ` +
      `kept=${thrown.kept.length} loose=${thrown.loose.length} ` +
      `push_disabled=${thrown.pushDisabled} cost=${JSON.stringify(thrown.cost)}`,
  );
  checks.push({
    name: 'shell.a-table-the-player-may-push',
    ok: thrown.push === true && thrown.pushDisabled === false,
    detail:
      `${thrown.taken} of at most ${thrown.limit} throws reached a table the push button ` +
      `takes, and the cost row reads ${JSON.stringify(thrown.cost)}. The blocker is a field ` +
      `of the profile, not a state of the screen: a stress die showing a bane stops the push, ` +
      `and ten stress dice show one about five throws in six. The walk below needs the live ` +
      `push, because the section 6 list holds a stop for every die and a dead button holds none.`,
  });
  checks.push({
    name: 'shell.the-tray-holds-every-die-once',
    ok:
      thrown.tray.length === dieNames.length &&
      thrown.kept.length + thrown.loose.length === dieNames.length &&
      String(thrown.tray) === String([...thrown.kept, ...thrown.loose]) &&
      String([...thrown.tray].sort()) === String([...dieNames].sort()),
    detail:
      `the throw put ${thrown.tray.length} dice on the table against the ${dieNames.length} ` +
      `section 6 names, ${thrown.kept.length} on the shelf and ${thrown.loose.length} in the ` +
      `zone, and the two sum to ${thrown.kept.length + thrown.loose.length}. The shelf comes ` +
      `first in the tray. The names are the same set as the document's, and which die lands ` +
      `in which zone follows this throw, not the drawn one.`,
  });

  // Wait for the 3D table to come to rest, where one is running.
  //
  // The tray settles on its own clock and its last update re-renders the
  // screen, which moves the sequential focus navigation starting point the
  // next block puts back. Measured on this host on 2026-08-09: without this
  // wait the walk of rest B started at the footer and reached one stop. A run
  // on flat dice holds no seam and the wait returns at once.
  await waitForRest(page);

  // Put the sequential focus navigation starting point back at the top of the
  // screen. The walk of rest A left it on the roll button, and neither `blur()`
  // nor a click moves it, so the first Tab below would reach the footer and the
  // walk would stop one stop later. Measured on this host on 2026-08-09, where
  // the same call inside the evaluate above did not hold: the render that
  // followed the throw took the focus away again, so this runs alone and last.
  await page.evaluate(() => {
    const head = document.querySelector('[data-el="shell-header"]');
    head.setAttribute('tabindex', '-1');
    head.focus();
    head.removeAttribute('tabindex');
  });
  const walkedB = await walkShell(page, after.stated + 8);
  const namedB = walkedB.filter((visit) => !visit.implicit);
  const implicitB = walkedB.filter((visit) => visit.implicit).map((visit) => visit.name);
  const walkB = namedB.map((visit) => visit.name);
  const positionsB = (by) => namedB.flatMap((visit, index) => (visit.by === by ? [index + 1] : []));
  // The list the screen must walk: the tray, then the dice in the order the
  // DOM holds them, then the four footer stops the document names.
  const wantedB = [after.names[0], ...thrown.tray, ...after.names.slice(after.names.length - 4)];
  console.log(
    `browser: shell after_throw walked=[${walkB.join(', ')}] ` +
      `implicit_scroll_stops=${implicitB.length} [${implicitB.join(', ')}]`,
  );
  checks.push({
    name: 'shell.the-keyboard-order-after-the-throw',
    ok:
      walkB.length === after.stated &&
      walkB.every((name, index) => name === wantedB[index]) &&
      String(positionsB('tab')) === String(after.tab) &&
      String(positionsB('arrow')) === String(after.arrow),
    detail:
      `real Tab and arrow presses reached ${walkB.length} authored visits against the ` +
      `${after.stated} section 6 names. Walked [${walkB.join(', ')}]. ` +
      `Wanted [${wantedB.join(', ')}]. Tab reached items [${positionsB('tab')}] against ` +
      `[${after.tab}], and the arrows reached [${positionsB('arrow')}] against ` +
      `[${after.arrow}]. The tray is one Tab stop over ${thrown.tray.length} dice, and the ` +
      `browser added ${implicitB.length} scroll stops of its own at [${implicitB.join(', ')}], ` +
      `reported and not counted.`,
  });

  if (options.captureShell !== null) {
    for (const size of SHELL_WIDTHS) {
      await page.setViewport({ width: size.width, height: size.height, deviceScaleFactor: 1 });
      const path = join(options.captureShell, `shell-roll-${size.name}.png`);
      await page.screenshot({ path });
      console.log(`browser: shell captured ${size.name} to ${path}`);
    }
  }
}

// ---------------------------------------------------------------------------
// The accessibility gate — Unit 4.11
//
// One run, from an empty pool to a pushed result, with nothing but the keys.
// The plan asks for exactly this and says why it is the real check: an audit of
// a canvas application passes while the application is unusable by keyboard.
//
// **This mode presses real keys.** `src/app.test.tsx` walks the same two lists
// under jsdom, which runs no sequential focus navigation and no default
// activation behaviour, so a Tab and an Enter both do nothing there. Everything
// jsdom has to stand in for is pressed for real here: Tab, Shift and Tab, the
// arrow keys, Enter and Escape.
//
// **Four things this mode judges that no other run does.**
//
//   1. The whole journey in one run. Two walks of two mounted states say
//      nothing about the journey between them.
//   2. The disclosure sheet as a real modal, by pressing Tab off both ends of
//      it and reading where the focus went.
//   3. The audit, in a browser that lays the page out, so the contrast rule is
//      DECIDED rather than left undecided as it is under jsdom.
//   4. That no pointer event reached the page at all, counted by the page
//      itself, so "keyboard only" is measured and not claimed.
//
// **The viewport is the gate's own, and it is one the design is drawn at.**
// The harness default is 800 by 600, which is neither 360 nor 1440, so a walk
// measured there is measured at a width nothing was designed for. This mode
// therefore runs the whole journey twice, at 360 by 760 and at 1440 by 900, and
// refuses a `--viewport` that is not a drawn width. Decision 22.
//
// **A run that cannot draw must say so, not skip quietly.** Inside the sandbox
// there is no `/dev/dri` and no WebGL context, so the startup probe falls to
// flat dice and every 3D check is skipped. Unit 4.10 recorded a run that
// reported `renderer unreadable` with checks skipped and still exited 0. This
// mode refuses to start unless the run DECLARES what it can draw: `--hardware`
// for a real card, or `--no-webgl` for a machine that has none, which CI is.
// Neither flag on a machine with no readable renderer is a failure by name.
// ---------------------------------------------------------------------------

/** The two widths the design is drawn at. The gate runs the journey at both. */
const A11Y_WIDTHS = [
  { name: '360x760', width: 360, height: 760 },
  { name: '1440x900', width: 1440, height: 900 },
];

/** The presses each tile takes to reach the draw target, in section 6 order. */
const A11Y_TILES = [
  ['pool-cell-attribute', 5],
  ['pool-cell-skill', 5],
  ['pool-cell-gear', 3],
  ['pool-cell-artifact', 6],
  ['pool-cell-bonus', 2],
  ['pool-cell-stress', 10],
];

/** The notch presses that take the difficulty to +3, which the draw target has. */
const A11Y_DIFFICULTY_PRESSES = 3;

/** Where the audit lives. It is read from the installed package, never bundled. */
function axeSource() {
  return join(here, '..', 'node_modules', 'axe-core', 'axe.min.js');
}

/**
 * Put the focus back at the top of the document, and give the DOCUMENT the
 * focus again.
 *
 * `bringToFront` is the load-bearing half. A walk ends by pressing Tab past the
 * last control, which is how the end is detected, and Firefox answers that
 * press by handing the focus to its own chrome. The page keeps its
 * `document.activeElement` afterwards and still takes key events, so a Tab
 * press still moves the focus ring — but `document.hasFocus()` is false, and a
 * browser performs no DEFAULT ACTION for a document that does not have the
 * focus. Enter on a button then fires no click at all, and nothing anywhere
 * reports an error. Measured on this host on 2026-08-10: 40 Enter presses on a
 * focused, enabled roll button produced 0 click events with `hasFocus=false`,
 * and 6 presses produced 6 clicks once the document had the focus back.
 */
async function resetFocus(page) {
  await page.evaluate(() => {
    const head =
      document.querySelector('[data-el="shell-header"]') ??
      document.querySelector('[data-el="history-header"]');
    if (head === null) return;
    head.setAttribute('tabindex', '-1');
    head.focus();
    head.removeAttribute('tabindex');
  });
  // Reported by every caller that then presses a key. Nothing this harness can
  // do puts the focus back: `bringToFront`, `window.focus()` and a real mouse
  // press in the content area were all measured on this host on 2026-08-10 and
  // all three left `document.hasFocus()` false. The answer is not to lose it,
  // which is what the bound on the walk above is for.
  return page.evaluate(() => document.hasFocus());
}

/**
 * What holds the focus: the control, the cell inside it, and its tag.
 *
 * `name` is the CONTROL, which is the composite where the focus is inside one,
 * because section 2 counts a composite widget as one control. `inner` is the
 * cell itself. The two differ exactly where the pool bar and the tray are
 * walked, which is where this mode presses the arrow keys.
 */
async function focusedName(page) {
  return page.evaluate(() => {
    const held = document.activeElement;
    if (held === null || held === document.body) return { name: null, inner: null, tag: null };
    const control = held.closest('[data-composite]') || held.closest('[data-el]');
    const inner = held.closest('[data-el]');
    return {
      name: control === null ? null : control.dataset.el,
      inner: inner === null ? null : inner.dataset.el,
      tag: held.tagName,
      inSheet: held.closest('[data-el="disclosure-sheet"]') !== null,
    };
  });
}

/** Tab until a named control holds the focus. Returns the presses it took. */
async function tabTo(page, wanted, cap = 60) {
  for (let taken = 1; taken <= cap; taken += 1) {
    await page.keyboard.press('Tab');
    const held = await focusedName(page);
    if (held.name === wanted) return taken;
  }
  return null;
}

/** What the live region says, less every subtree a reader is told to ignore. */
async function liveRegion(page) {
  return page.evaluate(() => {
    const region = document.querySelector('[data-el="status-line"]');
    if (region === null) return null;
    const copy = region.cloneNode(true);
    for (const hidden of copy.querySelectorAll('[aria-hidden="true"]')) hidden.remove();
    return {
      role: region.getAttribute('role'),
      live: region.getAttribute('aria-live'),
      text: (copy.textContent || '').replace(/\s+/g, ' ').trim(),
    };
  });
}

/**
 * Wait for the 3D table to come to rest, where one is running.
 *
 * **A reading of the result is taken after this and never before it.** The
 * successes, the banes and the spoken sentence are held back until the dice
 * stop, because a result printed over dice that are still moving is a result
 * the player has not been shown yet. `src/shell/state.ts` holds the gate. A run
 * on flat dice reads no seam and returns at once.
 */
async function waitForRest(page) {
  await withTimeout(
    page.evaluate(async () => {
      const frame = () =>
        new Promise((settle) => requestAnimationFrame(() => requestAnimationFrame(settle)));
      let quiet = 0;
      for (let step = 0; step < 2000 && quiet < 3; step += 1) {
        const seam = window.__clatterTable;
        if (seam === undefined) return;
        quiet = seam.busy ? 0 : quiet + 1;
        await frame();
      }
    }),
    120000,
    'the table never came to rest',
  );
}

/**
 * The table, summed off the dice themselves.
 *
 * Each die cell states the face it shows and what that face is worth, and the
 * status line states the totals. Both are written by the same render from the
 * same result, so summing the parts is a second reading of the same throw, and
 * it is the reading that catches a summary that counts its own table wrong.
 */
async function sumOfTheDice(page) {
  return page.evaluate(() => {
    let successes = 0;
    let banes = 0;
    let dice = 0;
    for (const cell of document.querySelectorAll('[data-el^="die-"]')) {
      const label = cell.getAttribute('aria-label') || '';
      dice += 1;
      if (/ A bane\./.test(label)) banes += 1;
      if (/ One success\./.test(label)) successes += 1;
      const many = / (\d+) successes\./.exec(label);
      if (many !== null) successes += Number(many[1]);
    }
    return { successes, banes, dice };
  });
}

/**
 * Count every pointer event the page sees, so "keyboard only" is measured.
 *
 * The clicks are recorded beside them, because Enter on a button produces a
 * click of its own: a keyboard activation carries `detail` 0 and a pointer
 * carries 1 or more. So the two are told apart by the page rather than by the
 * runner's word, and the click list is what a failed activation is read from.
 */
async function watchForPointers(page) {
  await page.evaluate(() => {
    window.__clatterPointerEvents = [];
    window.__clatterClicks = [];
    for (const kind of ['pointerdown', 'mousedown', 'touchstart']) {
      document.addEventListener(
        kind,
        (event) => window.__clatterPointerEvents.push(`${kind} isTrusted=${event.isTrusted}`),
        true,
      );
    }
    document.addEventListener(
      'click',
      (event) => {
        const named = event.target === null ? null : event.target.closest('[data-el]');
        window.__clatterClicks.push(
          `${named === null ? 'unnamed' : named.dataset.el} detail=${event.detail} ` +
            `trusted=${event.isTrusted}`,
        );
      },
      true,
    );
  });
}

/** Run the audit over the page as it stands, in a browser that lays it out. */
async function auditPage(page, label) {
  return page.evaluate(
    async (tags, where) => {
      const results = await window.axe.run(document.body, {
        runOnly: { type: 'tag', values: tags },
      });
      return {
        where,
        violations: results.violations.map(
          (found) =>
            `${found.id} (${found.impact}) x${found.nodes.length} at ` +
            `${found.nodes
              .map((node) => String(node.target))
              .slice(0, 4)
              .join(' | ')}`,
        ),
        incomplete: results.incomplete.map((found) => found.id),
        ran:
          results.passes.length +
          results.violations.length +
          results.incomplete.length +
          results.inapplicable.length,
      };
    },
    ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'],
    label,
  );
}

/**
 * The journey, at one width. Every press below is a real key press.
 *
 * Returns what the run measured, so the caller can compare the two widths
 * against one another as well as against the design.
 */
async function a11yJourney(page, size, design, checks, options) {
  const before = beforeThrowVisits(design, 'Before');
  const after = beforeThrowVisits(design, 'After');
  const dieNames = after.names.filter((name) => name.startsWith('die-'));
  const at = (name) => `a11y.${size.name}.${name}`;

  const opened = await freshPage(page, options, size);
  const held = opened.page;
  await watchForPointers(held);
  const focusAtStart = opened.hasFocus && (await resetFocus(held));
  checks.push({
    name: at('the-document-holds-the-focus'),
    ok: focusAtStart === true,
    detail:
      `document.hasFocus() reads ${focusAtStart} at the start of the journey, in a tab of its ` +
      `own. A browser performs no default action for a document that does not hold the focus: ` +
      `Enter on a focused, enabled button then fires no click and reports no error, so every ` +
      `check below this one would fail for a reason that is not the screen's.`,
  });

  // ---- Rest A, walked with real Tab and arrow presses ----
  const walkA = await walkShell(held, before.stated + 6, before.stated);
  const namedA = walkA.filter((visit) => !visit.implicit);
  const implicitA = walkA.filter((visit) => visit.implicit).map((visit) => visit.name);
  const walkedA = namedA.map((visit) => visit.name);
  const positionsA = (by) => namedA.flatMap((visit, index) => (visit.by === by ? [index + 1] : []));
  console.log(
    `browser: a11y ${size.name} before_throw walked=[${walkedA.join(', ')}] ` +
      `implicit_scroll_stops=${implicitA.length} [${implicitA.join(', ')}]`,
  );
  checks.push({
    name: at('the-keyboard-order-before-the-throw'),
    ok:
      walkedA.length === before.stated &&
      walkedA.every((name, index) => name === before.names[index]) &&
      String(positionsA('tab')) === String(before.tab) &&
      String(positionsA('arrow')) === String(before.arrow),
    detail:
      `real Tab and arrow presses reached ${walkedA.length} authored visits against the ` +
      `${before.stated} section 6 names, at ${size.name}. Walked [${walkedA.join(', ')}]. ` +
      `Wanted [${before.names.join(', ')}]. Tab reached [${positionsA('tab')}] against ` +
      `[${before.tab}] and the arrows reached [${positionsA('arrow')}] against [${before.arrow}]. ` +
      `The browser added ${implicitA.length} scroll stops of its own, reported and not counted.`,
  });

  // ---- The pool, built with the arrow keys alone ----
  await resetFocus(held);
  const reachedBar = await tabTo(held, 'pool-bar');
  for (const [tile, presses] of A11Y_TILES) {
    const onTile = await focusedName(held);
    if (onTile.inner !== tile) {
      checks.push({
        name: at('the-arrow-keys-walk-the-pool-bar'),
        ok: false,
        detail: `the right arrow reached ${onTile.inner} where ${tile} was next`,
      });
      break;
    }
    for (let taken = 0; taken < presses; taken += 1) await held.keyboard.press('ArrowUp');
    await held.keyboard.press('ArrowRight');
  }
  const reachedTrack = await tabTo(held, 'difficulty');
  for (let taken = 0; taken < A11Y_DIFFICULTY_PRESSES; taken += 1) {
    await held.keyboard.press('ArrowRight');
  }
  const onTheTrack = await focusedName(held);
  const built = await liveRegion(held);
  checks.push({
    name: at('the-pool-builds-under-the-keys-alone'),
    ok:
      reachedBar !== null &&
      reachedTrack !== null &&
      onTheTrack.name === 'difficulty' &&
      (built?.text || '').includes(`The throw takes ${dieNames.length} dice`),
    detail:
      `Tab reached the pool bar in ${reachedBar} presses and the difficulty in ` +
      `${reachedTrack} more. The arrow keys then built the pool and moved the difficulty, ` +
      `and the focus stayed on ${onTheTrack.name}, because one value over seven positions ` +
      `changes under the arrows and never moves. The live region reads ` +
      `${JSON.stringify(built?.text)}, against the ${dieNames.length} dice section 6 names.`,
  });

  // ---- The throw, taken with Enter on the roll button ----
  //
  // The profile the screen opens in stops a push once a stress die shows a
  // bane, and ten stress dice show one about five throws in six, so the run
  // throws again until the push is live and reports how many throws it took.
  let throws = 0;
  let live = false;
  let hadFocus = true;
  for (; throws < 40 && !live;) {
    hadFocus = (await resetFocus(held)) && hadFocus;
    const reached = await tabTo(held, 'roll-button');
    if (reached === null) break;
    const onButton = await focusedName(held);
    if (onButton.tag !== 'BUTTON') break;
    await held.keyboard.press('Enter');
    throws += 1;
    await held.evaluate(
      () => new Promise((settle) => requestAnimationFrame(() => requestAnimationFrame(settle))),
    );
    live = await held.evaluate(() => {
      const button = document.querySelector('[data-el="push-button"]');
      return button !== null && !button.disabled;
    });
  }
  // The dice stop first. The screen holds the result back until they do, so a
  // reading taken here is the reading the player reads.
  await waitForRest(held);
  const rolled = await liveRegion(held);
  const afterRoll = await sumOfTheDice(held);
  const clicks = await held.evaluate(() => window.__clatterClicks || []);
  console.log(
    `browser: a11y ${size.name} threw throws=${throws} dice=${afterRoll.dice} ` +
      `push_live=${live} clicks=${clicks.length} [${clicks.slice(0, 3).join(', ')}] ` +
      `spoken=${JSON.stringify(rolled?.text)}`,
  );
  checks.push({
    name: at('enter-on-the-roll-button-throws-the-pool'),
    ok: live && afterRoll.dice === dieNames.length && hadFocus,
    detail:
      `${throws} Enter presses of at most 40 reached a table the push takes, with ` +
      `${afterRoll.dice} dice on it against the ${dieNames.length} section 6 names, and the ` +
      `document held the focus at every press (${hadFocus}). A press made while the document ` +
      `does not hold the focus fires no click and reports no error, so the reading is taken ` +
      `rather than assumed.`,
  });
  checks.push({
    name: at('the-roll-reaches-the-live-region'),
    ok:
      rolled !== null &&
      rolled.role === 'status' &&
      rolled.live === 'polite' &&
      rolled.text ===
        `${afterRoll.successes} ${afterRoll.successes === 1 ? 'success' : 'successes'}. ` +
          `${afterRoll.banes} ${afterRoll.banes === 1 ? 'bane' : 'banes'}. Push 0. ` +
          `The table holds ${afterRoll.dice} dice. Stress 10.`,
    detail:
      `the live region is role=${rolled?.role} aria-live=${rolled?.live} and it READS ` +
      `${JSON.stringify(rolled?.text)}. Every figure in it is compared against a figure ` +
      `written elsewhere in the same render: the successes and the banes against the sum over ` +
      `the ${afterRoll.dice} dice, which is ${afterRoll.successes} and ${afterRoll.banes}, and ` +
      `the dice count against the section 6 list.`,
  });

  // ---- Rest B, walked with real presses ----
  await waitForRest(held);
  await resetFocus(held);
  const walkB = await walkShell(held, after.stated + 6, after.stated);
  const namedB = walkB.filter((visit) => !visit.implicit);
  const implicitB = walkB.filter((visit) => visit.implicit).map((visit) => visit.name);
  const walkedB = namedB.map((visit) => visit.name);
  const positionsB = (by) => namedB.flatMap((visit, index) => (visit.by === by ? [index + 1] : []));
  const inTheTray = await held.evaluate(() =>
    [...document.querySelectorAll('[data-el="dice-tray"] .slot')].map((slot) => slot.dataset.el),
  );
  const wantedB = [after.names[0], ...inTheTray, ...after.names.slice(after.names.length - 4)];
  console.log(
    `browser: a11y ${size.name} after_throw walked=${walkedB.length} ` +
      `implicit_scroll_stops=${implicitB.length} [${implicitB.join(', ')}]`,
  );
  checks.push({
    name: at('the-keyboard-order-after-the-throw'),
    ok:
      walkedB.length === after.stated &&
      walkedB.every((name, index) => name === wantedB[index]) &&
      String([...walkedB.slice(1, walkedB.length - 4)].sort()) === String([...dieNames].sort()) &&
      String(positionsB('tab')) === String(after.tab) &&
      String(positionsB('arrow')) === String(after.arrow),
    detail:
      `real Tab and arrow presses reached ${walkedB.length} authored visits against the ` +
      `${after.stated} section 6 names, at ${size.name}. Walked [${walkedB.join(', ')}]. ` +
      `Wanted [${wantedB.join(', ')}]. The dice are compared as a set against the ` +
      `${dieNames.length} the document names, because which die lands in which zone follows ` +
      `this throw and not the drawn one, and their ORDER is compared against the tray the ` +
      `screen drew. Tab reached [${positionsB('tab')}] against [${after.tab}] and the arrows ` +
      `reached [${positionsB('arrow')}] against [${after.arrow}]. The browser added ` +
      `${implicitB.length} scroll stops of its own, reported and not counted.`,
  });

  // ---- The push, taken with Enter on the push button ----
  const focusForPush = await resetFocus(held);
  const reachedPush = await tabTo(held, 'push-button');
  const onPush = await focusedName(held);
  await held.keyboard.press('Enter');
  await held.evaluate(
    () => new Promise((settle) => requestAnimationFrame(() => requestAnimationFrame(settle))),
  );
  await waitForRest(held);
  const afterPush = await sumOfTheDice(held);
  const pushed = await liveRegion(held);
  console.log(
    `browser: a11y ${size.name} pushed dice=${afterPush.dice} spoken=${JSON.stringify(pushed?.text)}`,
  );
  checks.push({
    name: at('enter-on-the-push-button-pushes'),
    ok:
      reachedPush !== null &&
      focusForPush === true &&
      onPush.tag === 'BUTTON' &&
      afterPush.dice === dieNames.length + 1 &&
      (pushed?.text || '').includes('Push 1.'),
    detail:
      `Tab reached the push button in ${reachedPush} presses and it is a ${onPush.tag}, so ` +
      `Enter activates it with no script at all. The push left ${afterPush.dice} dice on the ` +
      `table against the ${dieNames.length} before it: the opening profile raises the stress ` +
      `before the re-throw, so one stress die joins that same push.`,
  });
  checks.push({
    name: at('the-pushed-result-reaches-the-live-region'),
    ok:
      pushed !== null &&
      pushed.text !== (rolled?.text ?? '') &&
      pushed.text ===
        `${afterPush.successes} ${afterPush.successes === 1 ? 'success' : 'successes'}. ` +
          `${afterPush.banes} ${afterPush.banes === 1 ? 'bane' : 'banes'}. Push 1. ` +
          `The table holds ${afterPush.dice} dice. Stress 10.`,
    detail:
      `the region READS ${JSON.stringify(pushed?.text)} after the push, against ` +
      `${JSON.stringify(rolled?.text)} before it. The successes and the banes are the sum over ` +
      `the ${afterPush.dice} dice on the table. The stress reading is at its cap of 10, which ` +
      `section 8 of the design draws and marks, so the rise is read off the table instead.`,
  });

  // ---- Nothing was pressed with a pointer ----
  const onTheTable = await held.evaluate(() => window.__clatterTable !== undefined);
  const pointers = await held.evaluate(() => window.__clatterPointerEvents || []);
  checks.push({
    name: at('the-whole-journey-took-no-pointer'),
    ok: pointers.length === 0,
    detail:
      `the held counted ${pointers.length} pointer events over the whole journey, from the ` +
      `empty pool to the pushed result: [${pointers.slice(0, 6).join(', ')}]. The count is the ` +
      `held's own, so "keyboard only" is measured rather than claimed.`,
  });

  return {
    page: held,
    throws,
    dice: afterPush.dice,
    onTheTable,
    implicit: implicitA.length + implicitB.length,
  };
}

/**
 * A fresh TAB that holds the focus, with the old one closed behind it.
 *
 * **Why a whole tab, and not a reload.** A walk that presses Tab past the last
 * control hands the focus to the browser's own chrome. The page keeps its
 * `document.activeElement` and still takes key events, so a walk carries on
 * working — but `document.hasFocus()` is false, and a browser performs no
 * DEFAULT ACTION for a document that does not hold the focus. Enter on a
 * focused, enabled button then fires no click and reports no error anywhere.
 * Measured on this host on 2026-08-10: 40 such presses produced 0 click events,
 * and the same 40 presses produced 40 clicks once the focus was back.
 *
 * Six ways of asking for it back were measured. `bringToFront`,
 * `window.focus()` and a real mouse press in the content area all left it
 * false. A reload, a navigation, and a window resize followed by a navigation
 * each brought it back sometimes and not others — four navigations in a row
 * failed once. A new tab is the one that always does, because a new tab is the
 * active tab.
 *
 * The caller must use the page this returns. The old one is closed.
 */
async function freshPage(page, options, size) {
  const next = await page.browser().newPage();
  await next.setViewport({ width: size.width, height: size.height, deviceScaleFactor: 1 });
  await next.goto(options.url, { waitUntil: 'load' });
  await page.close();
  return { page: next, hasFocus: await next.evaluate(() => document.hasFocus()) };
}

/**
 * Is there a stop after the last one the design names?
 *
 * The two walks of the journey stop ON the last authored stop and never press
 * past it, because that press hands the focus to the browser's chrome and every
 * Enter after it fires nothing. So neither walk asks what comes after the end of
 * the list, and an appended control would pass unseen. This phase asks, on a
 * fresh document each time, and it is the last thing the mode does with the
 * keys.
 *
 * Rest B is asked over a pool of THREE dice rather than the drawn thirty. The
 * claim is about the end of the list, not about its length, and the length is
 * judged by the journey against the authored names.
 */
async function a11yEndProbe(page, options, design, checks) {
  const before = beforeThrowVisits(design, 'Before');
  const after = beforeThrowVisits(design, 'After');
  let held = page;

  // A fresh document AND a real resize before each of the two probes.
  //
  // Both are needed and both were measured on this host on 2026-08-10. A walk
  // that presses Tab past the last control hands the focus to the browser's
  // chrome, `document.hasFocus()` goes false, and every default action stops:
  // Enter on a focused, enabled button fires no click and reports no error.
  // `bringToFront`, `window.focus()` and a real mouse press in the content area
  // all failed to bring it back. A navigation ALONE failed as well. A window
  // resize followed by a navigation brought it back on every attempt, so each
  // probe below asks for a size the window is not already at.
  const openedA = await freshPage(held, options, { width: 1440, height: 900 });
  held = openedA.page;
  const focusA = openedA.hasFocus && (await resetFocus(held));
  const restA = (await walkShell(held, before.stated + 6)).filter((visit) => !visit.implicit);
  checks.push({
    name: 'a11y.rest-a-ends-where-the-design-ends',
    ok: restA.length === before.stated && focusA === true,
    detail:
      `an unbounded walk of the empty pool reached ${restA.length} authored stops against the ` +
      `${before.stated} section 6 names, and it pressed Tab past the last one to find out. ` +
      `The document held the focus at the start (${focusA}). ` +
      `Walked [${restA.map((visit) => visit.name).join(', ')}].`,
  });

  const openedB = await freshPage(held, options, { width: 360, height: 760 });
  held = openedB.page;
  const focusB = openedB.hasFocus && (await resetFocus(held));
  await tabTo(held, 'pool-bar');
  for (let taken = 0; taken < 3; taken += 1) await held.keyboard.press('ArrowUp');
  let live = false;
  let throws = 0;
  for (; throws < 40 && !live;) {
    await resetFocus(held);
    if ((await tabTo(held, 'roll-button')) === null) break;
    await held.keyboard.press('Enter');
    throws += 1;
    await held.evaluate(
      () => new Promise((settle) => requestAnimationFrame(() => requestAnimationFrame(settle))),
    );
    live = await held.evaluate(() => {
      const button = document.querySelector('[data-el="push-button"]');
      return button !== null && !button.disabled;
    });
  }
  await resetFocus(held);
  const restB = (await walkShell(held, 40)).filter((visit) => !visit.implicit);
  const tail = restB.slice(-4).map((visit) => visit.name);
  console.log(
    `browser: a11y end_probe rest_a=${restA.length} rest_b=${restB.length} ` +
      `tail=[${tail.join(', ')}] throws=${throws}`,
  );
  checks.push({
    name: 'a11y.rest-b-ends-where-the-design-ends',
    ok: live && focusB === true && String(tail) === String(after.names.slice(-4)),
    detail:
      `the document held the focus at the start (${focusB}) and ${throws} Enter presses put a ` +
      `table up. An unbounded walk of a table of three dice ended on [${tail.join(', ')}] against the ` +
      `four names section 6 ends with, [${after.names.slice(-4).join(', ')}], and it pressed ` +
      `Tab past the last one to find out. Three dice rather than thirty, because the claim is ` +
      `about the END of the list and the journey judges its length.`,
  });
  return held;
}

/** The disclosure sheet, driven off both ends with real Tab presses. */
async function a11ySheet(page, options, checks) {
  const fresh = await freshPage(page, options, { width: 360, height: 760 });
  const sheetPage = fresh.page;
  const hasFocus = fresh.hasFocus && (await resetFocus(sheetPage));
  checks.push({
    name: 'a11y.the-document-holds-the-focus-for-the-sheet',
    ok: hasFocus === true,
    detail:
      `document.hasFocus() reads ${hasFocus} before the presses below, in a tab of its own. A ` +
      `browser performs no default action for a document that does not hold the focus, so ` +
      `Enter would fire no click and every check under this one would fail for a reason that ` +
      `is not the screen's.`,
  });
  const reached = await tabTo(sheetPage, 'disclosure-toggle');
  await sheetPage.keyboard.press('Enter');
  await sheetPage.evaluate(
    () => new Promise((settle) => requestAnimationFrame(() => requestAnimationFrame(settle))),
  );
  const onOpen = await focusedName(sheetPage);
  const modal = await sheetPage.evaluate(() => {
    const sheet = document.querySelector('[data-el="disclosure-sheet"]');
    return sheet === null
      ? null
      : { role: sheet.getAttribute('role'), aria: sheet.getAttribute('aria-modal') };
  });
  checks.push({
    name: 'a11y.the-sheet-opens-under-enter-and-takes-the-focus',
    ok:
      reached !== null &&
      modal !== null &&
      modal.role === 'dialog' &&
      modal.aria === 'true' &&
      onOpen.inSheet === true,
    detail:
      `Tab reached the disclosure in ${reached} presses and Enter opened a ` +
      `role=${modal?.role} aria-modal=${modal?.aria} sheet, with the focus on ${onOpen.name}. ` +
      `A modal that opens without taking the focus lets the first Tab land behind it.`,
  });

  // Forwards, further than the sheet holds stops. Every landing must be inside.
  const forward = [];
  let escapedForward = 0;
  for (let taken = 0; taken < 80; taken += 1) {
    await sheetPage.keyboard.press('Tab');
    const stop = await focusedName(sheetPage);
    if (!stop.inSheet) escapedForward += 1;
    forward.push(stop.inner);
  }
  const backward = [];
  let escapedBackward = 0;
  for (let taken = 0; taken < 80; taken += 1) {
    // Shift and Tab is two keys. `press` takes no modifier, so the modifier is
    // held down around it, which is what a hand does.
    await sheetPage.keyboard.down('Shift');
    await sheetPage.keyboard.press('Tab');
    await sheetPage.keyboard.up('Shift');
    const stop = await focusedName(sheetPage);
    if (!stop.inSheet) escapedBackward += 1;
    backward.push(stop.inner);
  }
  const forwardStops = new Set(forward);
  const backwardStops = new Set(backward);
  console.log(
    `browser: a11y sheet forward_presses=80 distinct=${forwardStops.size} escaped=${escapedForward} ` +
      `backward_presses=80 distinct=${backwardStops.size} escaped=${escapedBackward}`,
  );
  checks.push({
    name: 'a11y.the-focus-cannot-leave-the-sheet-in-either-direction',
    ok:
      escapedForward === 0 &&
      escapedBackward === 0 &&
      forwardStops.size > 8 &&
      forwardStops.size === backwardStops.size,
    detail:
      `80 Tab presses and 80 Shift and Tab presses landed inside the sheet every time: ` +
      `${escapedForward} escaped forwards and ${escapedBackward} backwards. The two ` +
      `directions reached the same stops, ${forwardStops.size} forwards and ` +
      `${backwardStops.size} backwards, so the wrap is a cycle and not a trap that swallows ` +
      `half the controls. 80 presses is more than the sheet holds stops, so the walk wrapped ` +
      `several times rather than running out.`,
  });

  // The way back, and where the focus lands.
  await sheetPage.keyboard.press('Escape');
  await sheetPage.evaluate(
    () => new Promise((settle) => requestAnimationFrame(() => requestAnimationFrame(settle))),
  );
  const afterEscape = await focusedName(sheetPage);
  const closed = await sheetPage.evaluate(
    () => document.querySelector('[data-el="disclosure-sheet"]') === null,
  );
  checks.push({
    name: 'a11y.escape-closes-the-sheet-and-hands-the-focus-back',
    ok: closed && afterEscape.name === 'disclosure-toggle',
    detail:
      `Escape closed the sheet (${closed}) and left the focus on ${afterEscape.name}. Section 4 ` +
      `of the design requires the focus to return to disclosure-toggle, because a focus left on ` +
      `a removed element falls to the top of the document.`,
  });

  // And the close control itself, pressed with Enter after a real Tab to it.
  await resetFocus(sheetPage);
  await tabTo(sheetPage, 'disclosure-toggle');
  await sheetPage.keyboard.press('Enter');
  await sheetPage.evaluate(
    () => new Promise((settle) => requestAnimationFrame(() => requestAnimationFrame(settle))),
  );
  const onClose = await focusedName(sheetPage);
  await sheetPage.keyboard.press('Enter');
  await sheetPage.evaluate(
    () => new Promise((settle) => requestAnimationFrame(() => requestAnimationFrame(settle))),
  );
  const afterClose = await focusedName(sheetPage);
  checks.push({
    name: 'a11y.sheet-close-hands-the-focus-back-as-the-design-says',
    ok: onClose.name === 'sheet-close' && afterClose.name === 'disclosure-toggle',
    detail:
      `the sheet opened with the focus on ${onClose.name}, and Enter there left it on ` +
      `${afterClose.name}.`,
  });
  return sheetPage;
}

async function runA11y(page, options, checks) {
  const design = readFileSync(join(here, '..', 'docs', 'design', '0002-screen-design.md'), 'utf8');

  // The run has to declare what it can draw. A sandboxed run reads no renderer
  // at all and would otherwise skip its way to exit 0.
  const { renderer } = await readRenderer(page);
  const verdict = classifyRenderer(renderer);
  const declared = options.hardware || options.noWebgl;
  checks.push({
    name: 'a11y.the-run-declares-what-it-can-draw',
    ok: declared === true,
    detail: declared
      ? `the run declared ${options.hardware ? '--hardware' : '--no-webgl'} and the renderer ` +
        `reads ${verdict.kind}. The 3D half is judged where a card is declared and printed as ` +
        `NOT JUDGED where none is.`
      : `this run named neither --hardware nor --no-webgl, and the renderer reads ` +
        `${verdict.kind}. A run inside the sandbox and a run on a CI machine both get no ` +
        `WebGL context, so every 3D check skips and the run exits 0 while judging nothing. ` +
        `Name --hardware for a machine with a card, or --no-webgl for one without.`,
  });
  if (!declared) return;

  // The viewport is the gate's own, and both widths are drawn ones.
  checks.push({
    name: 'a11y.the-gate-runs-at-the-widths-the-design-draws',
    ok: A11Y_WIDTHS.every((size) => /^(360x760|768x1024|1440x900)$/.test(size.name)),
    detail:
      `the journey runs at ${A11Y_WIDTHS.map((size) => size.name).join(' and ')}. The harness ` +
      `default is 800 by 600, which is neither width the design is drawn at, and a walk ` +
      `measured there is measured at a width nothing was designed for. Decision 22.`,
  });

  // Each phase opens a tab of its own and closes the one before it, so the
  // page travels from phase to phase rather than being held here.
  let held = page;
  const measured = [];
  for (const size of A11Y_WIDTHS) {
    const one = await a11yJourney(held, size, design, checks, options);
    held = one.page;
    measured.push({
      size: size.name,
      throws: one.throws,
      dice: one.dice,
      onTheTable: one.onTheTable,
    });
  }
  console.log(
    `browser: a11y widths=${measured.length} ` +
      measured.map((one) => `${one.size}:throws=${one.throws},dice=${one.dice}`).join(' '),
  );
  checks.push({
    name: 'a11y.the-journey-holds-at-both-widths',
    ok:
      measured.length === A11Y_WIDTHS.length && new Set(measured.map((one) => one.dice)).size === 1,
    detail:
      `the same journey ran at ${measured.length} widths and put the same number of dice on ` +
      `the table at each: ${measured.map((one) => `${one.size}=${one.dice}`).join(', ')}. The ` +
      `layout changes with the width and the walk does not.`,
  });

  // ---- The half a machine with no graphics card cannot judge ----
  //
  // The walk is one list in both renderers, which section 6 states and Decision
  // 9 settles: the die cells are real DOM either way, and with the table
  // running they lie over the dice the tray put down. A machine with no card
  // draws the flat dice, so it walks the same list over the other renderer and
  // says so rather than counting the run as cover it does not have.
  const drewTheTable = measured.every((one) => one.onTheTable === true);
  checks.push(
    options.noWebgl
      ? {
          name: 'a11y.the-same-journey-over-the-3d-table',
          ok: true,
          skipped: true,
          detail:
            `NOT JUDGED: this run declared --no-webgl, so the startup probe fell to the flat ` +
            `dice and the journey above walked those. The 3D table needs a graphics card, and ` +
            `CI has none. Run this mode with --hardware on a machine that has one, which is ` +
            `what the owner's run does, and this check is judged there.`,
        }
      : {
          name: 'a11y.the-same-journey-over-the-3d-table',
          ok: drewTheTable,
          detail:
            `the journey ran with the 3D table mounted at ${measured
              .map((one) => `${one.size}=${one.onTheTable}`)
              .join(', ')}, read off window.__clatterTable, which src/shell/table.tsx documents ` +
            `as the one seam an outside instrument has into a WebGL scene. Both walks above are ` +
            `therefore walks over the table, not over the flat dice.`,
        },
  );

  held = await a11yEndProbe(held, options, design, checks);
  held = await a11ySheet(held, options, checks);

  // ---- The audit, in a browser that lays the page out ----
  await held.evaluate(readFileSync(axeSource(), 'utf8'));
  const version = await held.evaluate(() => window.axe.version);
  const pinned = JSON.parse(readFileSync(join(here, '..', 'package.json'), 'utf8')).devDependencies[
    'axe-core'
  ];
  checks.push({
    name: 'a11y.the-audit-is-named-and-pinned',
    ok: version === pinned && /^\d+\.\d+\.\d+$/.test(pinned || ''),
    detail:
      `the page ran axe-core ${version} against the ${pinned} package.json pins, with no range ` +
      `operator. It is read straight out of node_modules and never bundled, and ` +
      `scripts/check-bundle-size.mjs proves no marker of it reaches dist/.`,
  });

  const findings = [];
  let ranAtLeast = Number.POSITIVE_INFINITY;
  let incomplete = new Set();
  for (const where of ['the pushed table', 'the disclosure sheet']) {
    if (where === 'the disclosure sheet') {
      await resetFocus(held);
      await tabTo(held, 'disclosure-toggle');
      await held.keyboard.press('Enter');
      await held.evaluate(
        () => new Promise((settle) => requestAnimationFrame(() => requestAnimationFrame(settle))),
      );
    }
    const result = await auditPage(held, where);
    for (const found of result.violations) findings.push(`${where}: ${found}`);
    for (const rule of result.incomplete) incomplete.add(rule);
    ranAtLeast = Math.min(ranAtLeast, result.ran);
  }
  console.log(
    `browser: a11y audit rules_run_at_least=${ranAtLeast} violations=${findings.length} ` +
      `incomplete=[${[...incomplete].join(', ')}]`,
  );
  checks.push({
    name: 'a11y.the-audit-finds-nothing-on-a-laid-out-page',
    ok: findings.length === 0 && ranAtLeast >= 85,
    detail:
      `axe-core ran at least ${ranAtLeast} rules over each of two states and reported ` +
      `${findings.length} findings: [${findings.join(' | ')}]. This browser lays the page out ` +
      `and computes its colours, so the contrast rule is DECIDED here where jsdom leaves it ` +
      `undecided. Rules left undecided here: [${[...incomplete].join(', ')}].`,
  });
}

// ---------------------------------------------------------------------------
// The blocked chunk — Unit 3.7
//
// The plan's acceptance for this unit: with the 3D chunk blocked at the network
// layer, every rule and every affordance still works.
//
// The run has to prove the chunk did not arrive, and the proof cannot be the
// absence of an error. Two stores can answer a blocked request and both are
// closed here by measurement rather than by assumption:
//
//   * **The precache.** Unit 5.1 puts the lazy 3D chunk in Cache Storage, and a
//     service worker answers a request the network refused. Firefox also
//     refuses `request.abort()` once the worker owns the request, so an abort
//     with a `.catch` on it hides the refusal. The worker is unregistered, the
//     caches are deleted, both readings are taken before and after, and every
//     refused abort is counted rather than swallowed.
//   * **The HTTP cache.** It goes into bypass at the driver.
//
// The second half of the run is the acceptance itself: the flat dice draw the
// throw, the keyboard walks the thirty-five visits of section 6, the push keeps
// the kept dice, every die answers a press, and every throw shakes.
// ---------------------------------------------------------------------------

/** The lazy 3D chunk, by the name the build gives it. */
const TRAY_CHUNK = /\/dice-tray-[^/]+\.js$/;

/**
 * The service worker and its registration script.
 *
 * They are blocked with the chunk, because a worker that installs during the
 * run precaches the chunk again and answers for it. Blocking them is what makes
 * "no store can answer" a measurement instead of a hope.
 */
const WORKER_FILES = /\/(sw\.js|registerSW\.js|workbox-[0-9a-f]+\.js)$/;

/** How the shake is drawn. `src/shell.css` names both animations. */
const SHAKE_ANIMATIONS = /^die-shake/;

async function readTrayNames(page) {
  return page.evaluate(() => {
    const slots = (name) =>
      [...document.querySelectorAll(`[data-el="${name}"] .slot`)].map((slot) => slot.dataset.el);
    const screen = document.querySelector('.screen');
    return {
      tray: slots('dice-tray'),
      kept: slots('kept-shelf'),
      loose: slots('throw-zone'),
      renderer: screen ? screen.dataset.renderer : null,
      faces: Object.fromEntries(
        [...document.querySelectorAll('[data-el^="die-"]')].map((slot) => [
          slot.dataset.el,
          /shows (\d+)\./.exec(slot.getAttribute('aria-label') || '')?.[1] ?? null,
        ]),
      ),
      pressed: Object.fromEntries(
        [...document.querySelectorAll('[data-el^="die-"]')].map((slot) => [
          slot.dataset.el,
          slot.getAttribute('aria-pressed'),
        ]),
      ),
      spoken: (
        document.querySelector('[data-el="status-line"] .sr-only')?.textContent ?? ''
      ).trim(),
      cost: (document.querySelector('[data-el="cost-row"] .cost-t')?.textContent ?? '').trim(),
      pushDisabled: document.querySelector('[data-el="push-button"]')?.disabled ?? null,
    };
  });
}

async function runBlockedChunk(page, options, checks, server) {
  // ---- 1. Let the worker install, then take every store away. ----
  const cleared = await withTimeout(
    page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) {
        return { ready: false, reason: 'this browser has no navigator.serviceWorker' };
      }
      await navigator.serviceWorker.ready;
      const held = await navigator.serviceWorker.getRegistrations();
      const names = await caches.keys();
      const before = {
        registrations: held.length,
        caches: names.length,
        entries: (
          await Promise.all(
            names.map(async (name) => (await (await caches.open(name)).keys()).length),
          )
        ).reduce((total, each) => total + each, 0),
      };
      for (const registration of held) await registration.unregister();
      for (const name of names) await caches.delete(name);
      try {
        localStorage.clear();
      } catch {
        // A browser that refuses storage refuses the read as well, and the
        // application answers the defaults there.
      }
      return {
        ready: true,
        before,
        registrations: (await navigator.serviceWorker.getRegistrations()).length,
        caches: (await caches.keys()).length,
      };
    }),
    30000,
    'no service worker took control of the page within 30 seconds, so this run could not ' +
      'prove it had removed one. --blocked-chunk needs a preview server over the built output.',
  );
  if (cleared.timedOut || !cleared.ready) {
    checks.push({
      name: 'blocked-chunk.no-store-can-answer-the-chunk',
      ok: false,
      detail: cleared.timedOut ?? cleared.reason,
    });
    return;
  }
  console.log(
    `browser: blocked-chunk before registrations=${cleared.before.registrations} ` +
      `caches=${cleared.before.caches} entries=${cleared.before.entries} ` +
      `after registrations=${cleared.registrations} caches=${cleared.caches}`,
  );

  // ---- 2. Refuse the chunk at the network layer, and count every refusal. ----
  await page.setCacheEnabled(false);
  await page.setRequestInterception(true);
  const asked = [];
  const abortRefusals = [];
  const failedRequests = [];
  page.on('request', (request) => {
    const url = request.url();
    if (TRAY_CHUNK.test(url) || WORKER_FILES.test(url)) {
      asked.push(url);
      request.abort().catch(() => abortRefusals.push(url));
      return;
    }
    request.continue().catch(() => {
      // A request the driver could not resume is reported by `requestfailed`.
    });
  });
  page.on('requestfailed', (request) => {
    const failure = request.failure();
    failedRequests.push(`${request.url()} ${failure ? failure.errorText : 'failed'}`);
  });

  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(
    () => (document.querySelector('.screen')?.dataset.trayDecision ?? 'pending') !== 'pending',
    { timeout: 30000 },
  );
  const decision = await page.evaluate(
    () => document.querySelector('.screen')?.dataset.trayDecision ?? null,
  );

  // ---- 3. Ask for the table, which is what asks for the chunk. ----
  //
  // `Done` collapses the builder and shows the table. The screen imports the
  // chunk there, and only where `decideTray` cleared the bar.
  try {
    await page.click('[data-el="collapse-button"]');
    await page.waitForFunction(
      () => document.querySelector('.screen[data-renderer="flat"]') !== null,
      { timeout: 30000 },
    );
  } catch {
    // The readings below report what happened either way.
  }
  const fell = await page.evaluate(() => {
    const note = document.querySelector('[data-el="flat-fallback-note"]');
    const entries = performance
      .getEntriesByType('resource')
      .filter((entry) => /\/dice-tray-[^/]+\.js$/.test(entry.name));
    return {
      renderer: document.querySelector('.screen')?.dataset.renderer ?? null,
      canvases: document.querySelectorAll('canvas').length,
      notices: document.querySelectorAll('[data-el="flat-fallback-note"]').length,
      // Unit 4.10 made the notice one row of the fault banner, so the live
      // region is the banner and the row carries no role of its own. A row
      // with a second live region inside an alert would be announced twice.
      banners: document.querySelectorAll('[data-el="fault-banner"]').length,
      bannerRole: note?.closest('[data-el="fault-banner"]')?.getAttribute('role') ?? null,
      bannerName: note?.closest('[data-el="fault-banner"]')?.getAttribute('aria-label') ?? null,
      notice: (note?.textContent ?? '').trim(),
      role: note?.getAttribute('role') ?? null,
      stored: localStorage.getItem('clatter.settings'),
      controller: navigator.serviceWorker.controller
        ? navigator.serviceWorker.controller.scriptURL
        : null,
      chunkEntries: entries.length,
      chunkBytes: entries.reduce((total, entry) => total + (entry.encodedBodySize || 0), 0),
    };
  });
  const cachesLeft = await page.evaluate(async () => (await caches.keys()).length);
  const chunkAsked = asked.filter((url) => TRAY_CHUNK.test(url));
  const chunkAbortRefusals = abortRefusals.filter((url) => TRAY_CHUNK.test(url));
  const storedFall = (() => {
    try {
      return fell.stored === null ? null : JSON.parse(fell.stored).flatFallback;
    } catch {
      return 'unreadable';
    }
  })();
  console.log(
    `browser: blocked-chunk decision=${decision} renderer=${fell.renderer} ` +
      `canvases=${fell.canvases} chunk_requests=${chunkAsked.length} ` +
      `refused_aborts=${abortRefusals.length} chunk_entries=${fell.chunkEntries} ` +
      `chunk_bytes=${fell.chunkBytes} caches=${cachesLeft} controller=${fell.controller} ` +
      `stored_flat_fallback=${storedFall} notice=${JSON.stringify(fell.notice)}`,
  );

  checks.push({
    name: 'blocked-chunk.no-store-can-answer-the-chunk',
    ok:
      cleared.before.caches > 0 &&
      cleared.before.entries > 0 &&
      cleared.registrations === 0 &&
      cleared.caches === 0 &&
      cachesLeft === 0 &&
      fell.controller === null &&
      abortRefusals.length === 0,
    detail:
      `the first visit installed ${cleared.before.registrations} worker over ` +
      `${cleared.before.caches} caches holding ${cleared.before.entries} entries, and this run ` +
      `removed both: ${cleared.registrations} registrations and ${cleared.caches} caches were ` +
      `left, ${cachesLeft} caches remain after the reload, and the page reports a controller ` +
      `of ${fell.controller}. ${abortRefusals.length} aborts were refused by the browser. ` +
      `Every number is needed. A precache that was never built proves nothing, and Firefox ` +
      `refuses an abort once a worker owns the request, so a refused abort is a request some ` +
      `other store could still have answered.` +
      (abortRefusals.length ? ` [${abortRefusals.join('; ')}]` : ''),
  });

  checks.push({
    name: 'blocked-chunk.the-chunk-was-refused',
    skipped: decision !== 'true',
    ok: chunkAsked.length > 0 && chunkAbortRefusals.length === 0 && fell.chunkBytes === 0,
    detail:
      decision === 'true'
        ? `the screen decided the table could run, asked for the lazy 3D chunk ` +
          `${chunkAsked.length} times, and every request was refused at the network layer. ` +
          `${chunkAbortRefusals.length} of those aborts were refused by the browser, and the ` +
          `page holds ${fell.chunkEntries} resource timing entries naming the chunk, carrying ` +
          `${fell.chunkBytes} encoded bytes between them. A request count above zero is the ` +
          `positive reading: it proves this run exercised the fall rather than a screen that ` +
          `never asked.`
        : `NOT JUDGED. The startup probe answered ${decision}, so the screen drew flat dice ` +
          `from the first paint and never asked for the chunk at all. There is no refusal to ` +
          `read on this machine, and nothing here says the block works. The sandbox hides ` +
          `/dev/dri and Firefox then reports no WebGL context, so run this outside the ` +
          `sandbox to judge it.`,
  });

  checks.push({
    name: 'blocked-chunk.the-tray-did-not-mount',
    ok: fell.canvases === 0 && fell.renderer === 'flat',
    detail:
      `the table holds ${fell.canvases} canvas elements and the screen reads ` +
      `renderer=${fell.renderer}, with the startup probe reading ${decision}. A canvas is ` +
      `what the tray mounts into, so zero canvases and a flat renderer are the two ` +
      `directions of the same claim.`,
  });

  checks.push({
    name: 'blocked-chunk.the-fall-is-recorded-and-said-once',
    ok:
      fell.notices === 1 &&
      fell.notice.length > 0 &&
      fell.banners === 1 &&
      fell.role === null &&
      fell.bannerRole === 'alert' &&
      (fell.bannerName ?? '').length > 0 &&
      storedFall === true,
    detail:
      `the screen holds ${fell.notices} notice elements, the one it holds reads ` +
      `${JSON.stringify(fell.notice)}, and the stored settings record reads ` +
      `flatFallback=${storedFall}. The fall is permanent, so it is in the record. Unit 4.10 made ` +
      `the notice one row of the one error surface, so the live region is the banner around it ` +
      `and never the row: the screen holds ${fell.banners} banners, the row carries ` +
      `role=${JSON.stringify(fell.role)} of its own, and the banner carries ` +
      `role=${JSON.stringify(fell.bannerRole)} with the name ${JSON.stringify(fell.bannerName)}. ` +
      `A live region inside a live region is announced twice.`,
  });

  // ---- 4. The acceptance: every rule and every affordance, on flat dice. ----
  const design = readFileSync(join(here, '..', 'docs', 'design', '0002-screen-design.md'), 'utf8');
  const after = beforeThrowVisits(design, 'After');
  const dieNames = after.names.filter((name) => name.startsWith('die-'));

  await page.click('[data-el="edit-pool-button"]');
  const built = await page.evaluate(
    async (plan) => {
      let clicks = 0;
      for (const [type, count] of plan.tiles) {
        const end = document.querySelector(`[data-el="pool-cell-${type}"] .cell-p`);
        if (end === null) continue;
        for (let taken = 0; taken < count; taken += 1) {
          end.click();
          clicks += 1;
        }
      }
      const notch = document.querySelectorAll('[data-el="difficulty-track"] .tk-n')[plan.notch];
      if (notch !== undefined) {
        notch.click();
        clicks += 1;
      }
      await new Promise((settle) => requestAnimationFrame(() => requestAnimationFrame(settle)));
      return clicks;
    },
    { tiles: SHELL_DRAWN_POOL, notch: SHELL_DRAWN_DIFFICULTY },
  );

  // The push blocker is a field of the profile: a stress die showing a bane
  // stops every further push, and ten stress dice show one about five throws in
  // six. The walk needs a live push, because a dead button holds no tab stop
  // and the section 6 list holds one.
  const thrown = await page.evaluate(async (limit) => {
    const frame = () =>
      new Promise((settle) => requestAnimationFrame(() => requestAnimationFrame(settle)));
    const pushButton = () => document.querySelector('[data-el="push-button"]');
    let taken = 0;
    do {
      document.querySelector('[data-el="roll-button"]').click();
      await frame();
      taken += 1;
    } while (taken < limit && pushButton() !== null && pushButton().disabled);
    return taken;
  }, 40);
  const table = await readTrayNames(page);
  console.log(
    `browser: blocked-chunk built_clicks=${built} throws=${thrown} dice=${table.tray.length} ` +
      `kept=${table.kept.length} loose=${table.loose.length} ` +
      `push_disabled=${table.pushDisabled} cost=${JSON.stringify(table.cost)}`,
  );

  checks.push({
    name: 'blocked-chunk.the-flat-dice-drew-the-throw',
    ok:
      table.renderer === 'flat' &&
      table.tray.length === dieNames.length &&
      table.kept.length + table.loose.length === dieNames.length &&
      String(table.tray) === String([...table.kept, ...table.loose]) &&
      String([...table.tray].sort()) === String([...dieNames].sort()) &&
      table.spoken.includes(`The table holds ${dieNames.length} dice`) &&
      table.pushDisabled === false,
    detail:
      `with the chunk blocked, the throw put ${table.tray.length} dice on the table against ` +
      `the ${dieNames.length} section 6 names, ${table.kept.length} on the shelf and ` +
      `${table.loose.length} in the zone. The shelf comes first, the names are the same set ` +
      `as the document's, the live region reads ${JSON.stringify(table.spoken)}, and the push ` +
      `button is live after ${thrown} throws.`,
  });

  // The keyboard order, walked with real keys. The starting point goes back to
  // the top first: it stays where the last focused element was, and the throw
  // above left it on the roll button.
  await page.evaluate(() => {
    const head = document.querySelector('[data-el="shell-header"]');
    head.setAttribute('tabindex', '-1');
    head.focus();
    head.removeAttribute('tabindex');
  });
  const walked = await walkShell(page, after.stated + 8);
  const namedVisits = walked.filter((visit) => !visit.implicit);
  const walkNames = namedVisits.map((visit) => visit.name);
  const implicit = walked.filter((visit) => visit.implicit).map((visit) => visit.name);
  const positions = (by) =>
    namedVisits.flatMap((visit, index) => (visit.by === by ? [index + 1] : []));
  const wanted = [after.names[0], ...table.tray, ...after.names.slice(after.names.length - 4)];
  console.log(`browser: blocked-chunk walked=[${walkNames.join(', ')}]`);
  checks.push({
    name: 'blocked-chunk.the-keyboard-order-after-the-throw',
    ok:
      walkNames.length === after.stated &&
      walkNames.every((name, index) => name === wanted[index]) &&
      String(positions('tab')) === String(after.tab) &&
      String(positions('arrow')) === String(after.arrow),
    detail:
      `real Tab and arrow presses reached ${walkNames.length} authored visits against the ` +
      `${after.stated} section 6 names, with the 3D chunk blocked. Walked ` +
      `[${walkNames.join(', ')}]. Wanted [${wanted.join(', ')}]. Tab reached ` +
      `[${positions('tab')}] against [${after.tab}] and the arrows reached ` +
      `[${positions('arrow')}] against [${after.arrow}]. The browser added ${implicit.length} ` +
      `scroll stops of its own, reported and not counted.`,
  });

  // The push. The kept dice keep their faces and the loose dice come back
  // changed, which is the rule this application exists for.
  const beforePush = table;
  await page.click('[data-el="push-button"]');
  await page.evaluate(
    () => new Promise((settle) => requestAnimationFrame(() => requestAnimationFrame(settle))),
  );
  const afterPush = await readTrayNames(page);
  const keptSame = beforePush.kept.filter(
    (name) =>
      afterPush.faces[name] !== undefined && afterPush.faces[name] === beforePush.faces[name],
  );
  const looseMoved = beforePush.loose.filter(
    (name) =>
      afterPush.faces[name] !== undefined && afterPush.faces[name] !== beforePush.faces[name],
  );
  console.log(
    `browser: blocked-chunk push kept=${beforePush.kept.length} kept_same=${keptSame.length} ` +
      `loose=${beforePush.loose.length} loose_moved=${looseMoved.length} ` +
      `dice_after=${afterPush.tray.length}`,
  );
  checks.push({
    name: 'blocked-chunk.the-push-keeps-the-kept-dice',
    ok:
      beforePush.kept.length > 0 &&
      keptSame.length === beforePush.kept.length &&
      looseMoved.length > 0 &&
      afterPush.tray.length >= beforePush.tray.length,
    detail:
      `the push re-threw the loose dice alone. ${keptSame.length} of the ` +
      `${beforePush.kept.length} kept dice hold the face they held, and ${looseMoved.length} ` +
      `of the ${beforePush.loose.length} loose dice came back with another one. The kept ` +
      `count is the denominator and it has a floor above zero, so a table with nothing kept ` +
      `cannot pass. The table now holds ${afterPush.tray.length} dice, because this profile ` +
      `adds one stress die before every re-throw.`,
  });

  // The shake, on a re-throw. Unit 2.3 reported that a die which stayed in its
  // zone kept its element and never played the animation again. The instrument
  // is the browser's own animation event, and the first re-throw proves the
  // instrument responds at all before the second one is judged.
  const shakes = [];
  for (const round of [1, 2]) {
    const measured = await page.evaluate(async () => {
      const seen = [];
      const listener = (event) => {
        const slot = event.target.closest('[data-el^="die-"]');
        if (slot) seen.push(`${event.animationName} ${slot.dataset.el}`);
      };
      document.addEventListener('animationstart', listener, true);
      document.querySelector('[data-el="roll-button"]').click();
      await new Promise((settle) => setTimeout(settle, 400));
      document.removeEventListener('animationstart', listener, true);
      return {
        seen,
        dice: [...document.querySelectorAll('[data-el^="die-"]')].map((slot) => slot.dataset.el),
      };
    });
    const shaken = new Set(
      measured.seen
        .filter((line) => SHAKE_ANIMATIONS.test(line.split(' ')[0]))
        .map((line) => line.split(' ')[1]),
    );
    shakes.push({ round, shaken, dice: measured.dice });
    console.log(
      `browser: blocked-chunk re-throw ${round} shook ${shaken.size} of ${measured.dice.length} dice`,
    );
  }
  const [first, second] = shakes;
  const missed = second.dice.filter((name) => !second.shaken.has(name));
  checks.push({
    name: 'blocked-chunk.every-re-throw-shakes-every-die',
    skipped: first.shaken.size === 0,
    ok: second.shaken.size === second.dice.length && missed.length === 0,
    detail:
      first.shaken.size === 0
        ? `NOT JUDGED. The first re-throw shook 0 of ${first.dice.length} dice, so this ` +
          `browser plays no CSS animation at all and the instrument cannot answer. A reduced ` +
          `motion setting turns the shake into a cut, which is what the application must do, ` +
          `and it reads the same way here.`
        : `the first re-throw shook ${first.shaken.size} of ${first.dice.length} dice, which ` +
          `proves the instrument answers, and the second shook ${second.shaken.size} of ` +
          `${second.dice.length}. The denominator is every die on the table, because a ` +
          `re-throw is a fresh roll of the whole pool. A die that stays in the zone it was ` +
          `already in is the case Unit 2.3 reported, and it is only visible in a count over ` +
          `the whole table.` +
          (missed.length ? ` These dice never shook: [${missed.join(', ')}]` : ''),
  });

  // Every die answers a press, or refuses it because the rules hold it. The
  // denominator is the pool, and the two counts sum to it.
  const pressed = await page.evaluate(async () => {
    const names = [...document.querySelectorAll('[data-el^="die-"]')].map(
      (slot) => slot.dataset.el,
    );
    const frame = () =>
      new Promise((settle) => requestAnimationFrame(() => requestAnimationFrame(settle)));
    let toggled = 0;
    let refused = 0;
    const wrong = [];
    for (const name of names) {
      const slot = document.querySelector(`[data-el="${name}"]`);
      if (slot === null) {
        wrong.push(`${name} left the table`);
        continue;
      }
      const before = slot.getAttribute('aria-pressed');
      const role = slot.getAttribute('role');
      slot.click();
      await frame();
      const now = document.querySelector(`[data-el="${name}"]`);
      const answer = now === null ? null : now.getAttribute('aria-pressed');
      if (role === 'img') {
        if (before !== null || answer !== null)
          wrong.push(`${name} is held by the rules but carries aria-pressed`);
        refused += 1;
        continue;
      }
      if (answer === before) {
        wrong.push(`${name} did not answer the press: aria-pressed stayed ${answer}`);
        continue;
      }
      toggled += 1;
      // Put it back, so the sweep leaves the table as it found it.
      document.querySelector(`[data-el="${name}"]`)?.click();
      await frame();
    }
    return { names, toggled, refused, wrong };
  });
  console.log(
    `browser: blocked-chunk press pool=${pressed.names.length} toggled=${pressed.toggled} ` +
      `refused=${pressed.refused}`,
  );
  checks.push({
    name: 'blocked-chunk.every-die-answers-a-press',
    ok:
      pressed.names.length > 0 &&
      pressed.wrong.length === 0 &&
      pressed.toggled + pressed.refused === pressed.names.length &&
      pressed.refused > 0 &&
      pressed.toggled > 0,
    detail:
      `every one of the ${pressed.names.length} dice on the table was pressed. ` +
      `${pressed.toggled} answered by changing aria-pressed and ${pressed.refused} refused ` +
      `because the rules hold them, and the two sum to the pool. Both counts carry a floor ` +
      `above zero, so a table where nothing is pressable cannot pass.` +
      (pressed.wrong.length ? ` [${pressed.wrong.join('; ')}]` : ''),
  });

  // Nothing reached the network in the whole run except what the block let
  // through, so the failed requests are reported by name for a reader.
  console.log(
    `browser: blocked-chunk failed_requests=${failedRequests.length} ` +
      `[${failedRequests.join('; ')}]`,
  );
  stopPreviewServer(server);
}

// ---------------------------------------------------------------------------
// The 3D tray, inside the application — Units 3.4, 3.5 and 3.7
//
// Every other tray mode builds its own scene. This one drives the application
// itself: it presses the tiles, presses Roll, presses Push and presses the
// dice, and it reads the tray the application mounted.
//
// **The oracle is the screen's own reading of the rules core.** Each die cell
// carries an accessible name that states the face the core decided, and the
// check reads the face pointing up off the physics body and compares the two.
// The 3D layer is therefore judged against the rules and never against itself.
//
// `window.__clatterTable` is the one seam into the application's tray, because
// a WebGL scene has no other route. `src/shell/table.tsx` documents it.
// ---------------------------------------------------------------------------

/** How far a cell may sit from the die it names, in CSS pixels. */
const CELL_OVER_DIE_PX = 1;

/** The pool the run builds: every tile at its cap, and the difficulty at +3. */
const TABLE_POOL = SHELL_DRAWN_POOL;
const TABLE_DIFFICULTY = SHELL_DRAWN_DIFFICULTY;

/**
 * The page-side helpers this mode needs, as source, so they can be copied into
 * an evaluate without closing over anything in this module.
 */
const TABLE_HELPERS = `
window.__table = {
  /* The name the screen gives one die, derived here rather than read from the
     screen. src/shell/state.ts derives the same name from the same die id, so a
     screen that renamed a cell fails this run by name instead of quietly
     agreeing with itself. */
  tags: { attribute: 'at', skill: 'sk', gear: 'ge', artifact: 'ar', bonus: 'bo', stress: 'st' },
  elementOf(id) {
    const cut = id.lastIndexOf('-');
    return 'die-' + window.__table.tags[id.slice(0, cut)] + id.slice(cut + 1);
  },
  frame: () => new Promise((s) => requestAnimationFrame(() => requestAnimationFrame(s))),
  async settle(done, cap = 1200) {
    for (let step = 0; step < cap; step += 1) {
      const seam = window.__clatterTable;
      if (seam && !seam.busy && seam.throws >= done) return true;
      await window.__table.frame();
    }
    return false;
  },
  /* The frontmost die at a point on the screen, as an index into diceList. */
  dieAt(box, clientX, clientY) {
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
    const owner = new Map();
    box.diceList.forEach((die, index) => die.traverse((node) => owner.set(node, index)));
    const found = owner.get(hit.object);
    return found === undefined ? null : found;
  },
  /* What the screen says about every die, by its element name. */
  read() {
    const slots = (name) =>
      [...document.querySelectorAll('[data-el="' + name + '"] .slot')].map((s) => s.dataset.el);
    const cells = [...document.querySelectorAll('[data-el^="die-"]')];
    return {
      tray: slots('dice-tray'),
      kept: slots('kept-shelf'),
      loose: slots('throw-zone'),
      renderer: document.querySelector('.screen')?.dataset.renderer ?? null,
      canvases: document.querySelectorAll('canvas').length,
      faces: Object.fromEntries(
        cells.map((s) => [
          s.dataset.el,
          Number(/shows (\\d+)\\./.exec(s.getAttribute('aria-label') || '')?.[1] ?? NaN),
        ]),
      ),
      pressed: Object.fromEntries(cells.map((s) => [s.dataset.el, s.getAttribute('aria-pressed')])),
      roles: Object.fromEntries(cells.map((s) => [s.dataset.el, s.getAttribute('role') ?? s.tagName.toLowerCase()])),
      labelled: cells.filter((s) => (s.getAttribute('aria-label') || '').trim() !== '').length,
      pushDisabled: document.querySelector('[data-el="push-button"]')?.disabled ?? null,
      cost: (document.querySelector('[data-el="cost-row"] .cost-t')?.textContent ?? '').trim(),
    };
  },
};
`;

/** The tray as it now stands, die by die, beside what the screen says. */
async function readTableDice(page) {
  return page.evaluate(() => {
    const seam = window.__clatterTable;
    const box = seam.box;
    const rect = box.container.getBoundingClientRect();
    const camera = box.camera;
    camera.updateMatrixWorld();
    const projection = Array.from(camera.projectionMatrix.elements);
    const view = Array.from(camera.matrixWorldInverse.elements);
    const cell = (name) => {
      const held = document.querySelector('[data-el="' + name + '"]');
      if (held === null) return null;
      const r = held.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height };
    };
    return {
      viewport: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      projection,
      view,
      throws: seam.throws,
      dice: seam.ordered.map((die, index) => {
        const tray = box.diceList[index];
        const name = window.__table.elementOf(die.id);
        return {
          id: die.id,
          index,
          element: name,
          face: tray ? tray.getFaceValue().value : null,
          position: tray
            ? [tray.body.position.x, tray.body.position.y, tray.body.position.z]
            : null,
          cell: cell(name),
        };
      }),
      trayCount: box.diceList.length,
    };
  });
}

/**
 * Where the renderer LAST DREW each lock mark, against the die it names.
 *
 * `matrixWorld` is the matrix the renderer used on its most recent frame, so
 * this reads what the player is looking at and not what the scene graph means
 * to show. It is the one reading that catches a mark added after the last
 * frame: the library renders once when a throw ends and then stops, and it
 * renders nothing at all for a click, so a mark drawn after that frame keeps
 * the matrix of the frame before it and the player sees the marks of the
 * previous throw standing where the previous dice stood.
 *
 * A raycast cannot see this. Three.js updates the world matrix of anything it
 * casts against, so a probe that raycasts repairs the fault it came to measure.
 * A pixel read cannot see it either, because reading a WebGL canvas back needs
 * a render in the same task and that render repairs it too.
 */
async function readMarkPlacement(page) {
  return page.evaluate(() => {
    const box = window.__clatterTable.box;
    const marks = box.scene.children.filter((child) =>
      String(child.name || '').startsWith('clatter-lock-marker:'),
    );
    return {
      marks: marks.map((mark) => {
        const index = Number(String(mark.name).split(':')[1]);
        const die = box.diceList[index];
        const drawn = mark.matrixWorld.elements;
        const away =
          die === undefined
            ? null
            : Math.hypot(
                drawn[12] - die.position.x,
                drawn[13] - die.position.y,
                drawn[14] - die.position.z,
              );
        if (die !== undefined && !die.geometry.boundingSphere) die.geometry.computeBoundingSphere();
        return {
          index,
          away,
          radius:
            die === undefined ? null : (die.geometry.boundingSphere?.radius ?? 0) * die.scale.x,
          element: window.__table.elementOf(window.__clatterTable.ordered[index]?.id ?? '-'),
        };
      }),
    };
  });
}

/** Build the drawn pool and roll until the push button is live. */
async function rollUntilPushable(page, limit) {
  return page.evaluate(
    async ({ plan, notch, limit }) => {
      for (const [type, count] of plan) {
        const end = document.querySelector('[data-el="pool-cell-' + type + '"] .cell-p');
        for (let taken = 0; taken < count; taken += 1) end.click();
      }
      document.querySelectorAll('[data-el="difficulty-track"] .tk-n')[notch].click();
      await window.__table.frame();
      const button = () => document.querySelector('[data-el="push-button"]');
      let taken = 0;
      do {
        document.querySelector('[data-el="roll-button"]').click();
        await window.__table.frame();
        taken += 1;
      } while (taken < limit && button() !== null && button().disabled);
      const settled = await window.__table.settle(1);
      return { taken, limit, settled, ...window.__table.read() };
    },
    { plan: TABLE_POOL, notch: TABLE_DIFFICULTY, limit },
  );
}

async function runTable(page, options, checks) {
  await page.evaluate(TABLE_HELPERS);
  // The theme the run is drawn in — captures only. It is chosen the way a
  // player chooses one, through the panel, and the resolved tray surface is
  // printed so a capture in the wrong theme cannot pass for one in the right
  // theme.
  if (options.themeId !== null) {
    await openSheet(page);
    await chooseThemeRow(page, options.themeId);
    await closeSheet(page);
    register('./ts-resolve.mjs', import.meta.url);
    const themeRows = await import('../src/theme/themes.ts');
    const drawn = await paintOf(page, '[data-el="dice-table"]', 'backgroundColor');
    console.log(
      `browser: table theme=${options.themeId} tray_surface=${drawn} ` +
        `wanted=${themeRows.TRAY_SURFACES[options.themeId] ?? 'no such row'}`,
    );
  }
  const opening = await page.evaluate(() => window.__table.read());
  const onTheTable = opening.renderer === 'tray';
  const why =
    'the startup probe answered below the bar, so the screen draws flat dice and mounts no ' +
    'table. There is no WebGL context inside the sandbox. Run this mode with the sandbox off.';
  /** A check nobody could judge prints its reason and counts in `skipped=`. */
  const judge = (name, ok, detail) =>
    checks.push(
      onTheTable
        ? { name, ok, detail }
        : { name, ok: true, skipped: true, detail: `NOT JUDGED: ${why}` },
    );

  if (!onTheTable) {
    console.log(`browser: table renderer=${opening.renderer} NOT JUDGED, ${why}`);
    for (const name of [
      'table.the-3d-tray-draws-the-result',
      'table.up-face-equals-core-value',
      'table.every-die-carries-a-cell-over-it',
      'table.every-die-answers-a-key-press',
      'table.every-aim-is-a-whole-pixel-the-pointer-can-address',
      'table.every-die-is-accounted-for-by-the-pointer-route',
      'table.the-push-put-the-die-it-added-on-the-table',
      'table.the-lock-marks-are-drawn-on-the-dice-they-name',
    ]) {
      judge(name, true, '');
    }
    return;
  }

  // ---- The throw ----
  const rolled = await rollUntilPushable(page, 40);
  const before = await readTableDice(page);
  console.log(
    `browser: table renderer=${rolled.renderer} canvases=${rolled.canvases} ` +
      `throws=${rolled.taken} of at most ${rolled.limit} settled=${rolled.settled} ` +
      `dice=${rolled.tray.length} kept=${rolled.kept.length} loose=${rolled.loose.length} ` +
      `tray_bodies=${before.trayCount} acted_out=${before.throws}`,
  );
  judge(
    'table.the-3d-tray-draws-the-result',
    rolled.renderer === 'tray' &&
      rolled.canvases === 1 &&
      rolled.settled === true &&
      before.throws >= 1 &&
      before.trayCount === rolled.tray.length &&
      rolled.tray.length > 0,
    `the screen reads renderer=${rolled.renderer} over ${rolled.canvases} canvas elements, and ` +
      `the tray acted out ${before.throws} throws. It holds ${before.trayCount} bodies against ` +
      `the ${rolled.tray.length} dice the screen names, and the flat dice draw none of them.`,
  );

  // ---- Every face, against the value the screen printed for that die ----
  const wrongFaces = before.dice.flatMap((die) => {
    const said = rolled.faces[die.element];
    return die.face === said ? [] : [`${die.element} reads ${die.face}, the screen says ${said}`];
  });
  judge(
    'table.up-face-equals-core-value',
    wrongFaces.length === 0 && before.dice.length === rolled.tray.length && before.dice.length > 0,
    `compared=${before.dice.length} of a pool of ${rolled.tray.length}, each read off its own ` +
      `body quaternion and compared against the face the screen printed for that die. ` +
      `wrong=${wrongFaces.length}${wrongFaces.length === 0 ? '' : ` [${wrongFaces.join('; ')}]`}`,
  );

  // ---- Every die carries a cell, over the die it names ----
  const far = before.dice.flatMap((die) => {
    if (die.cell === null || die.position === null) return [`${die.element} has no cell`];
    const centroid = readDieCentroid({
      position: die.position,
      viewProjection: multiply4(before.projection, before.view),
      viewport: before.viewport,
    });
    const away = Math.hypot(centroid.x - die.cell.x, centroid.y - die.cell.y);
    return away <= CELL_OVER_DIE_PX ? [] : [`${die.element} sits ${away.toFixed(3)} px away`];
  });
  const named = before.dice.filter((die) => rolled.roles[die.element] !== undefined);
  judge(
    'table.every-die-carries-a-cell-over-it',
    far.length === 0 &&
      named.length === before.dice.length &&
      rolled.labelled === before.dice.length &&
      before.dice.length > 0,
    `placed=${before.dice.length} of a pool of ${before.dice.length}, every cell centre against ` +
      `a centroid this file projects from the camera matrices, inside ${CELL_OVER_DIE_PX} px. ` +
      `${rolled.labelled} of ${before.dice.length} carry an accessible name. ` +
      `off=${far.length}${far.length === 0 ? '' : ` [${far.join('; ')}]`}`,
  );

  // ---- The marks the player looks at, where the renderer last drew them ----
  const markedThrow = await readMarkPlacement(page);

  // ---- Every die answers a key press, and a rule lock refuses ----
  const pressed = await pressEveryDie(page, rolled.tray);
  console.log(
    `browser: table keys pool=${pressed.pool} toggled=${pressed.toggled} ` +
      `refused=${pressed.refused}`,
  );
  judge(
    'table.every-die-answers-a-key-press',
    pressed.toggled + pressed.refused === pressed.pool &&
      pressed.toggled > 0 &&
      pressed.refused > 0 &&
      pressed.faults.length === 0,
    `${pressed.toggled} answered a real Enter by changing aria-pressed and ${pressed.refused} ` +
      `refused it, over a pool of ${pressed.pool}. A die the rules hold is not a button and ` +
      `takes no press. faults=${pressed.faults.length}` +
      `${pressed.faults.length === 0 ? '' : ` [${pressed.faults.join('; ')}]`}`,
  );

  // ---- Where a pointer may be aimed at each die ----
  const aims = await aimEveryDie(page);
  const aimed = aims.filter((aim) => aim.x !== null);
  const notWhole = aimed.filter((aim) => !Number.isInteger(aim.x) || !Number.isInteger(aim.y));
  const tightest = [...aimed].sort((one, two) => one.margin - two.margin);
  const smallest = [...aimed].sort((one, two) => one.own - two.own);
  console.log(
    `browser: table aims aimed=${aimed.length} of ${aims.length} whole=${aimed.length - notWhole.length} ` +
      `thinnest_margin=${tightest.length === 0 ? 'none' : `${tightest[0].margin} px (${tightest[0].name})`} ` +
      `smallest_own_surface=${smallest.length === 0 ? 'none' : `${smallest[0].own} px (${smallest[0].name})`}`,
  );

  // **The aim must be a point the pointer can address.** The driver rounds
  // every pointer coordinate to a whole pixel, so an aim between two pixels
  // proves a point no press can ever land on, and the press lands on whatever
  // owns the pixel next door. That is the defect this check was written for.
  judge(
    'table.every-aim-is-a-whole-pixel-the-pointer-can-address',
    notWhole.length === 0 && aimed.length === before.dice.length && before.dice.length > 0,
    `whole=${aimed.length - notWhole.length} of the ${aimed.length} dice this run aimed at, ` +
      `against the pool of ${before.dice.length}. A pointer addresses whole pixels and nothing ` +
      `finer, so an aim between two of them proves a point no press can reach. Each aim is the ` +
      `whole pixel furthest inside the die's own frontmost surface, and the thinnest margin of ` +
      `this run is ${tightest.length === 0 ? 'none' : `${tightest[0].margin} px on ${tightest[0].name}`}. ` +
      `fractional=${notWhole.length}` +
      `${notWhole.length === 0 ? '' : ` [${notWhole.map((aim) => `${aim.name} at (${aim.x}, ${aim.y})`).join('; ')}]`}`,
  );

  // ---- One real click on every die ----
  const clicks = await clickEveryDie(page, rolled.tray, aims);
  // The dice the rules hold, counted a second way and before any click: the
  // screen draws a rule lock as an image and everything else as a button, so a
  // cell with no `aria-pressed` is a die no press may move. This is the
  // denominator the refusals are judged against, and the key route above
  // counted the same two numbers through a different instrument.
  const ruleHeld = Object.values(rolled.pressed).filter((state) => state === null).length;
  const pressable = before.dice.length - ruleHeld;
  console.log(
    `browser: table clicks pool=${clicks.pool} reached=${clicks.reached} ` +
      `unreachable=${clicks.unreachable} toggled=${clicks.toggled} refused=${clicks.refused} ` +
      `rule_held=${ruleHeld} pressable=${pressable}`,
  );
  judge(
    'table.every-die-is-accounted-for-by-the-pointer-route',
    clicks.reached + clicks.unreachable === clicks.pool &&
      clicks.unreachable === 0 &&
      clicks.toggled + clicks.refused === clicks.reached &&
      clicks.refused === ruleHeld &&
      clicks.toggled === pressable &&
      clicks.refused === pressed.refused &&
      clicks.toggled === pressed.toggled &&
      ruleHeld > 0 &&
      pressable > 0 &&
      clicks.faults.length === 0,
    `a real pointer click at the whole pixel deepest inside each die's own front surface. ` +
      `reached=${clicks.reached} and unreachable=${clicks.unreachable} sum to the pool of ` +
      `${clicks.pool}, and **unreachable must be zero**: a die a neighbour hides is not a die ` +
      `the rule holds, and the interface may not answer the two the same way. Of the reached, ` +
      `toggled=${clicks.toggled} against the ${pressable} dice the screen draws as buttons and ` +
      `refused=${clicks.refused} against the ${ruleHeld} it draws as images because the rules ` +
      `hold them. The key route read the same split as ${pressed.toggled} and ` +
      `${pressed.refused}, through a different instrument. The smallest own surface of this run ` +
      `is ${smallest.length === 0 ? 'none' : `${smallest[0].own} whole pixels on ${smallest[0].name}`}, ` +
      `reported and not gated. faults=${clicks.faults.length}` +
      `${clicks.faults.length === 0 ? '' : ` [${clicks.faults.join('; ')}]`}`,
  );

  if (options.captureBefore !== null) {
    await page.screenshot({ path: options.captureBefore });
    console.log(`browser: table captured the throw to ${options.captureBefore}`);
  }

  // ---- The push, with the die the profile adds before the re-throw ----
  const keptBefore = new Map(
    before.dice
      .filter((die) => rolled.kept.includes(die.element))
      .map((die) => [die.element, die.cell]),
  );
  const pushed = await pushOnTheTable(page, before.throws);
  const after = await readTableDice(page);
  const addedNames = after.dice
    .map((die) => die.element)
    .filter((name) => !rolled.tray.includes(name));
  console.log(
    `browser: table push settled=${pushed.settled} dice=${pushed.tray.length} ` +
      `tray_bodies=${after.trayCount} added=[${addedNames.join(', ')}] ` +
      `acted_out=${after.throws}`,
  );
  const moved = [...keptBefore].flatMap(([name, cell]) => {
    const now = after.dice.find((die) => die.element === name);
    if (now === undefined || now.cell === null || cell === null) return [`${name} left the table`];
    const away = Math.hypot(now.cell.x - cell.x, now.cell.y - cell.y);
    return away <= CELL_OVER_DIE_PX ? [] : [`${name} moved ${away.toFixed(3)} px`];
  });
  const wrongAfter = after.dice.flatMap((die) => {
    const said = pushed.faces[die.element];
    return die.face === said ? [] : [`${die.element} reads ${die.face}, the screen says ${said}`];
  });
  judge(
    'table.the-push-put-the-die-it-added-on-the-table',
    pushed.settled === true &&
      after.trayCount === pushed.tray.length &&
      after.dice.length === pushed.tray.length &&
      addedNames.length === pushed.tray.length - rolled.tray.length &&
      addedNames.length > 0 &&
      moved.length === 0 &&
      keptBefore.size > 0 &&
      wrongAfter.length === 0,
    `the push took the table from ${rolled.tray.length} dice to ${pushed.tray.length}, and the ` +
      `tray holds ${after.trayCount} bodies for them. The profile adds one stress die before ` +
      `every re-throw and the screen named [${addedNames.join(', ')}], which the tray spawned ` +
      `rather than refused. compared=${after.dice.length} of a pool of ${pushed.tray.length} ` +
      `up-faces against the screen, wrong=${wrongAfter.length}. ` +
      `kept=${keptBefore.size} of the dice the screen keeps, each inside ${CELL_OVER_DIE_PX} px ` +
      `of where it lay, moved=${moved.length}` +
      `${moved.length === 0 ? '' : ` [${moved.join('; ')}]`}` +
      `${wrongAfter.length === 0 ? '' : ` [${wrongAfter.join('; ')}]`}`,
  );

  // ---- The lock marks, over both throws ----
  const markedPush = await readMarkPlacement(page);
  const strayMarks = [...markedThrow.marks, ...markedPush.marks].flatMap((mark) =>
    mark.away !== null && mark.radius !== null && mark.away <= mark.radius
      ? []
      : [`${mark.element} was drawn ${mark.away === null ? 'nowhere' : mark.away.toFixed(1)} away`],
  );
  const markedDice = markedThrow.marks.length + markedPush.marks.length;
  console.log(
    `browser: table marks after_throw=${markedThrow.marks.length} of ${rolled.kept.length} kept, ` +
      `after_push=${markedPush.marks.length} of ${pushed.kept.length} kept, stray=${strayMarks.length}`,
  );
  judge(
    'table.the-lock-marks-are-drawn-on-the-dice-they-name',
    strayMarks.length === 0 &&
      markedThrow.marks.length === rolled.kept.length &&
      markedPush.marks.length === pushed.kept.length &&
      markedDice > 0,
    `drawn=${markedDice} marks over two throws, against the ${rolled.kept.length} and ` +
      `${pushed.kept.length} dice the screen keeps. Each one is read from the world matrix the ` +
      `renderer last used, so this is where the player sees it and not where the scene means ` +
      `it to be, and each must lie inside its own die's radius. ` +
      `stray=${strayMarks.length}${strayMarks.length === 0 ? '' : ` [${strayMarks.join('; ')}]`}`,
  );

  if (options.capture !== null) {
    // **A frame that shows one mark says nothing about the other.** Every die
    // the player kept was released again by the checks above, so the table now
    // carries rule frames alone. Four loose dice are kept back here, spread
    // across the list rather than taken off the front, so the capture carries
    // both shapes and the owner can judge the pair. It runs after every check
    // and gates nothing.
    const shown = await page.evaluate((wanted) => {
      const loose = [...document.querySelectorAll('[data-el^="die-"]')].filter(
        (cell) => cell.getAttribute('aria-pressed') === 'false',
      );
      const step = Math.max(1, Math.floor(loose.length / wanted));
      const taken = loose.filter((_, at) => at % step === 0).slice(0, wanted);
      for (const cell of taken) cell.click();
      return taken.length;
    }, 4);
    await page.evaluate(() => window.__table.frame());
    await page.screenshot({ path: options.capture });
    console.log(
      `browser: table captured the push to ${options.capture}, with ${shown} dice kept back ` +
        `so the frame carries both marks`,
    );
  }
}

/** Column-major 4x4 multiply, so the projection route is this file's own. */
function multiply4(a, b) {
  const out = new Array(16).fill(0);
  for (let column = 0; column < 4; column += 1) {
    for (let row = 0; row < 4; row += 1) {
      let sum = 0;
      for (let k = 0; k < 4; k += 1) sum += a[k * 4 + row] * b[column * 4 + k];
      out[column * 4 + row] = sum;
    }
  }
  return out;
}

/** Focus every die cell and press Enter on it, then press it back. */
async function pressEveryDie(page, names) {
  const faults = [];
  let toggled = 0;
  let refused = 0;
  for (const name of names) {
    const state = await page.evaluate((held) => {
      const cell = document.querySelector('[data-el="' + held + '"]');
      cell.focus();
      return {
        focused: document.activeElement === cell,
        pressed: cell.getAttribute('aria-pressed'),
        role: cell.getAttribute('role'),
      };
    }, name);
    if (!state.focused) {
      faults.push(`${name} could not take the focus`);
      continue;
    }
    await page.keyboard.press('Enter');
    const now = await page.evaluate(
      (held) => document.querySelector('[data-el="' + held + '"]').getAttribute('aria-pressed'),
      name,
    );
    if (state.pressed === null) {
      // A die the rules hold is not a button. It still takes the focus.
      if (now !== null) faults.push(`${name} answered a press the rules refuse`);
      refused += 1;
      continue;
    }
    if (now === state.pressed) {
      faults.push(`${name} did not answer the press: aria-pressed stayed ${now}`);
      continue;
    }
    toggled += 1;
    // Put it back, so the push below sees the table the throw made.
    await page.evaluate((held) => document.querySelector('[data-el="' + held + '"]').focus(), name);
    await page.keyboard.press('Enter');
  }
  return { pool: names.length, toggled, refused, faults };
}

/** Where a pointer may be aimed at each die of the application's tray. */
async function aimEveryDie(page) {
  await page.evaluate(AIM_HELPER);
  return page.evaluate(() => {
    const seam = window.__clatterTable;
    return window.__clatterAim(seam.box, seam.ordered.length, (index) =>
      window.__table.elementOf(seam.ordered[index] ? seam.ordered[index].id : '-'),
    );
  });
}

/**
 * One real pointer click on every die, at the whole pixel each aim names.
 *
 * `aims` comes from `aimEveryDie`. A die with no aim is unreachable and is
 * counted rather than clicked at a pixel that belongs to its neighbour.
 */
async function clickEveryDie(page, names, aims) {
  const faults = [];
  let reached = 0;
  let unreachable = 0;
  let toggled = 0;
  let refused = 0;
  const aimOf = new Map(aims.map((aim) => [aim.name, aim]));
  for (const name of names) {
    const aim = aimOf.get(name);
    if (aim === undefined || aim.x === null) {
      unreachable += 1;
      faults.push(
        `${name} has no whole pixel of its own: ${aim ? aim.reason : 'it was never aimed at'}`,
      );
      continue;
    }
    reached += 1;
    const was = await page.evaluate(
      (held) => document.querySelector('[data-el="' + held + '"]').getAttribute('aria-pressed'),
      name,
    );
    await page.mouse.click(aim.x, aim.y);
    const now = await page.evaluate(
      (held) => document.querySelector('[data-el="' + held + '"]').getAttribute('aria-pressed'),
      name,
    );
    if (was === null) {
      if (now !== null) faults.push(`${name} answered a click the rules refuse`);
      refused += 1;
      continue;
    }
    if (now === was) {
      faults.push(
        `${name} did not answer the click at (${aim.x}, ${aim.y}): aria-pressed stayed ${now}. ` +
          `That pixel is ${aim.margin} px inside its own frontmost surface, which covers ` +
          `${aim.own} of the ${aim.scanned} whole pixels under the die`,
      );
      continue;
    }
    toggled += 1;
    await page.mouse.click(aim.x, aim.y);
  }
  return { pool: names.length, reached, unreachable, toggled, refused, faults };
}

/** Press Push and wait for the tray to act it out. */
async function pushOnTheTable(page, throwsBefore) {
  return page.evaluate(async (done) => {
    document.querySelector('[data-el="push-button"]').click();
    await window.__table.frame();
    const settled = await window.__table.settle(done + 1);
    return { settled, ...window.__table.read() };
  }, throwsBefore);
}

// ---------------------------------------------------------------------------
// The rule set, the artifact curve and the override panel — Units 4.1 and 4.2
//
// The three controls sit behind the one disclosure. This mode judges what only
// a browser can judge:
//
//   * the roles, the names and the states the controls carry;
//   * that a change of rules clears the table, which is Decision 10;
//   * that every choice survives a real reload through the page's own
//     `localStorage`, which is the plan's acceptance for Unit 4.1;
//   * that the panel is usable at 360 px, which is the target this project has.
//
// **What this mode does not judge, and where that is judged instead.** Whether
// a setting reaches the rules core is asserted in `src/app.test.tsx`, where the
// core itself is the oracle. The built bundle exposes no rules module, so a
// check here could only compare against an expectation written by hand, and a
// hand-written expectation is what the jsdom instrument exists to avoid.
// ---------------------------------------------------------------------------

/** The floor a hit target clears, from WCAG 2.2 SC 2.5.8. */
const HIT_TARGET_FLOOR = 24;

/** Everything the sheet holds, as a reader meets it. */
async function readSheet(page) {
  return page.evaluate(() => {
    const control = (element) => {
      const label = element.closest('label');
      const role =
        element.tagName === 'SELECT'
          ? 'combobox'
          : element.type === 'radio'
            ? 'radio'
            : element.type === 'checkbox'
              ? 'checkbox'
              : element.type === 'number'
                ? 'spinbutton'
                : element.tagName.toLowerCase();
      // The hit target of a labelled control is the label, because a press
      // anywhere inside it reaches the control. The box of the input itself is
      // reported beside it, so a run says which one it measured.
      const target = (label ?? element).getBoundingClientRect();
      const box = element.getBoundingClientRect();
      return {
        role,
        name: ((label ?? element).textContent ?? '').replace(/\s+/g, ' ').trim(),
        state:
          element.type === 'number' || element.tagName === 'SELECT'
            ? element.value
            : String(element.checked),
        width: Math.round(target.width),
        height: Math.round(target.height),
        inputHeight: Math.round(box.height),
      };
    };
    const group = (name) =>
      [...document.querySelectorAll(`[data-el="${name}"] input`)].map(control);
    const sheet = document.querySelector('[data-el="disclosure-sheet"]');
    const rows = [...document.querySelectorAll('[data-el="sheet-overrides"] [data-field]')];
    return {
      ruleset: group('sheet-ruleset'),
      curve: group('sheet-artifact-curve'),
      rows: rows.map((row) => ({
        field: row.dataset.field,
        kind: row.dataset.kind,
        changed: row.classList.contains('changed'),
        controls: [...row.querySelectorAll('input, select')].map(control),
      })),
      reset: {
        present: document.querySelector('[data-el="overrides-reset"]') !== null,
        disabled: document.querySelector('[data-el="overrides-reset"]')?.disabled ?? null,
      },
      sheetScrolls: sheet === null ? null : sheet.scrollHeight > sheet.clientHeight,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      stored: localStorage.getItem('clatter.settings'),
    };
  });
}

/**
 * Where the sheet sits and where each of its categories sits, in CSS pixels.
 *
 * Every number is read off `getBoundingClientRect`, so it is the laid-out
 * screen and never the stylesheet. A check that read the CSS would prove the
 * rule exists and nothing about what a player meets.
 */
async function readSheetLayout(page) {
  return page.evaluate(() => {
    const sheet = document.querySelector('[data-el="disclosure-sheet"]');
    if (sheet === null) return null;
    const box = sheet.getBoundingClientRect();
    return {
      width: Math.round(box.width),
      top: Math.round(box.top),
      bottom: Math.round(box.bottom),
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      // Where the sheet stands in its own scroll, and whether it has one at
      // all. A sheet that fits its box cannot prove anything about opening at
      // the top, so both numbers are reported and the check reads both.
      scrollTop: Math.round(sheet.scrollTop),
      scrollHeight: Math.round(sheet.scrollHeight),
      clientHeight: Math.round(sheet.clientHeight),
      // The way out of the dialog is not a category.
      groups: [...sheet.children]
        .filter((child) => child.getAttribute('data-el') !== 'sheet-close')
        .map((child) => {
          const rect = child.getBoundingClientRect();
          return {
            name: child.getAttribute('data-el'),
            left: Math.round(rect.left),
            top: Math.round(rect.top),
            bottom: Math.round(rect.bottom),
          };
        }),
    };
  });
}

/**
 * How many pairs of categories sit BESIDE each other rather than under.
 *
 * Two boxes are side by side when their left edges differ and their vertical
 * ranges overlap. An indented box is not a column, and a box under another one
 * is not a column either, so both are refused by construction.
 */
function sideBySide(layout) {
  let pairs = 0;
  for (const [index, one] of layout.groups.entries()) {
    for (const other of layout.groups.slice(index + 1)) {
      if (one.left !== other.left && one.top < other.bottom && other.top < one.bottom) pairs += 1;
    }
  }
  return pairs;
}

async function openSheet(page) {
  await page.click('[data-el="disclosure-toggle"]');
  await page.waitForSelector('[data-el="sheet-overrides"]', { timeout: 15000 });
}

async function closeSheet(page) {
  await page.click('[data-el="sheet-close"]');
  await page.waitForFunction(
    () => document.querySelector('[data-el="disclosure-sheet"]') === null,
    { timeout: 15000 },
  );
}

/** How many dice the table holds, counted off the cells the screen draws. */
async function diceOnTable(page) {
  return page.evaluate(() => document.querySelectorAll('[data-el^="die-"]').length);
}

// ---------------------------------------------------------------------------
// The saved pools — Unit 4.3
//
// Decision 11 puts the list behind the one disclosure, so it is read here,
// inside the sheet this mode already opens. This half judges what only a
// browser can judge: a name drawn by a real parser, real Tab and Enter presses
// over the list, hit targets at 360 px, and a list that crosses a real reload.
//
// **What this does not judge, and where it is judged instead.** Whether each
// refusal carries the words its cause asks for is asserted in `src/app.test.tsx`
// against the record that holds those words, which the built bundle does not
// export. Here the four routes are driven for real and the four answers are
// counted and compared against each other.
// ---------------------------------------------------------------------------

/** Everything the preset panel holds, as a reader and a ruler meet it. */
async function readPresets(page) {
  return page.evaluate(() => {
    const panel = document.querySelector('[data-el="sheet-presets"]');
    if (panel === null) return null;
    const controls = [...panel.querySelectorAll('button, input')].map((element) => {
      const label = element.closest('label');
      const box = (label ?? element).getBoundingClientRect();
      return {
        el: element.dataset.el ?? '',
        role: element.tagName === 'INPUT' ? 'textbox' : 'button',
        name: (
          element.getAttribute('aria-label') ??
          label?.textContent ??
          element.textContent ??
          ''
        )
          .replace(/\s+/g, ' ')
          .trim(),
        state:
          element.getAttribute('aria-disabled') ??
          element.getAttribute('aria-invalid') ??
          element.getAttribute('aria-current'),
        disabled: element.disabled === true,
        row: element.closest('[data-el^="preset-row-"]')?.dataset.name ?? null,
        width: Math.round(box.width),
        height: Math.round(box.height),
      };
    });
    const rows = [...panel.querySelectorAll('[data-el^="preset-row-"]')].map((row) => {
      const drawn = row.querySelector('[data-el^="preset-name-"]');
      return {
        stored: row.dataset.name ?? '',
        drawn: drawn === null ? null : drawn.textContent,
        elements: drawn === null ? -1 : drawn.children.length,
        nodes: drawn === null ? -1 : drawn.childNodes.length,
      };
    });
    return {
      rows,
      controls,
      note: (panel.querySelector('[data-el="preset-note"]')?.textContent ?? '').trim(),
      // Every element the markup in a name could have made. The name holds an
      // `img` and a `b`, so a parsed name shows up here as well as in the row.
      made: panel.querySelectorAll('img, script, b, iframe, svg').length,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      stored: localStorage.getItem('clatter.settings'),
    };
  });
}

/** Let the framework re-render before the next press. */
async function settleScreen(page) {
  await page.evaluate(
    () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))),
  );
}

/**
 * Fill the name field and press Save.
 *
 * The field is filled the way a paste fills it, because a name may hold an
 * emoji and a key press carries one code unit.
 *
 * **The two acts are two tasks, and that is not a convenience.** The framework
 * batches a change of state, so a press in the same task as the typing reads
 * the name the field held before it. A player cannot type and press inside one
 * task; a script can, and a script that did would drive a screen no player ever
 * meets.
 */
async function savePreset(page, name) {
  await page.evaluate((text) => {
    const field = document.querySelector('[data-el="preset-name"]');
    field.value = text;
    field.dispatchEvent(new Event('input', { bubbles: true }));
  }, name);
  await settleScreen(page);
  await page.click('[data-el="preset-save"]');
  await settleScreen(page);
}

/** The value each pool tile prints, by the name section 6 gives it. */
async function readTiles(page) {
  return page.evaluate(() =>
    Object.fromEntries(
      [...document.querySelectorAll('[data-el^="pool-cell-"]')].map((cell) => [
        cell.dataset.el,
        (cell.querySelector('.cell-n')?.textContent ?? '').trim(),
      ]),
    ),
  );
}

/** Press one tile end, the way a finger does. */
async function pressTile(page, tile, end, times) {
  for (let press = 0; press < times; press += 1) {
    await page.click(`[data-el="pool-cell-${tile}"] .cell-${end}`);
  }
}

/** Walk forward with real Tab presses and report where the focus landed. */
async function tabFrom(page, start, steps) {
  await page.focus(`[data-el="${start}"]`);
  const seen = [];
  for (let step = 0; step < steps; step += 1) {
    await page.keyboard.press('Tab');
    seen.push(
      await page.evaluate(
        () => document.activeElement?.getAttribute('data-el') ?? document.activeElement?.tagName,
      ),
    );
  }
  return seen;
}

// ---------------------------------------------------------------------------
// The theme — the open half of Unit 4.8.
//
// It answers the questions no green suite can answer, because every one of them
// is about what the ENGINE resolved rather than about what a module returned:
//
//   1. A change on each axis reaches its place. Three axes, six rows each, and
//      every value is read off the rendered element and never off the setting.
//   2. Every contrast claim the data half proves still holds once the stylesheet
//      spends the palette. The denominator is six palettes by the roles the
//      screen really paints, and each ink is judged against the first ancestor
//      that really paints a ground.
//   3. Keyboard alone reaches the panel, operates it, and changes the screen.
//   4. A colour the builder cannot use is reported by name. The oracle is the
//      two checkers, run IN NODE over the same seeds.
//   5. A theme a player built survives a real reload, through the real store.
//
// The oracles are the repository's own modules, imported here as source.
// ---------------------------------------------------------------------------

/** The floors, restated. WCAG 2.2 SC 1.4.3 for text, SC 1.4.11 for a control. */
const THEME_TEXT_FLOOR = 4.5;
const THEME_NON_TEXT_FLOOR = 3;

/**
 * Every role the screen paints at rest B, the property that carries it, and the
 * floor it answers to.
 *
 * The ground is not named here. It is the first ancestor that really paints
 * one, resolved in the browser, so a rule that moved an element onto another
 * ground is measured on the ground it ended up on.
 */
const ROLE_PROBES = [
  {
    name: 'a status reading',
    selector: '.statusline .st-item',
    prop: 'color',
    floor: THEME_TEXT_FLOOR,
  },
  { name: 'a quiet reading', selector: '.st-dim', prop: 'color', floor: THEME_TEXT_FLOOR },
  { name: 'the cost line', selector: '.cost-t', prop: 'color', floor: THEME_TEXT_FLOOR },
  { name: 'a zone band', selector: '.band-h', prop: 'color', floor: THEME_TEXT_FLOOR },
  { name: 'a die caption', selector: '.cap', prop: 'color', floor: THEME_TEXT_FLOOR },
  { name: 'a die tag', selector: '.cap b', prop: 'color', floor: THEME_TEXT_FLOOR },
  {
    name: 'the label of a quiet button',
    selector: '[data-el="disclosure-toggle"]',
    prop: 'color',
    floor: THEME_TEXT_FLOOR,
  },
  {
    name: 'the label of a filled button',
    selector: '.btn.go',
    prop: 'color',
    floor: THEME_TEXT_FLOOR,
    self: true,
  },
  {
    name: 'the success mark',
    selector: '.mark.s',
    prop: 'backgroundColor',
    floor: THEME_NON_TEXT_FLOOR,
  },
  {
    name: 'the bane mark',
    selector: '.mark.b',
    prop: 'backgroundColor',
    floor: THEME_NON_TEXT_FLOOR,
  },
  {
    name: 'the filled button itself',
    selector: '.btn.go',
    prop: 'backgroundColor',
    floor: THEME_NON_TEXT_FLOOR,
  },
  {
    name: 'the edge of a die',
    selector: '.die',
    prop: 'borderTopColor',
    floor: THEME_NON_TEXT_FLOOR,
  },
  {
    name: 'the edge of a button',
    selector: '[data-el="edit-pool-button"]',
    prop: 'borderTopColor',
    floor: THEME_NON_TEXT_FLOOR,
  },
  {
    name: 'the edge of a card',
    selector: '.shelf',
    prop: 'borderTopColor',
    floor: THEME_NON_TEXT_FLOOR,
  },
  {
    name: 'a readout on the tray',
    selector: '[data-el="table-note"]',
    prop: 'color',
    floor: THEME_TEXT_FLOOR,
  },
];

/** `#rrggbb` as the `rgb(r, g, b)` text a browser answers with. */
function asRgb(hex) {
  const [r, g, b] = [1, 3, 5].map((at) => Number.parseInt(hex.slice(at, at + 2), 16));
  return `rgb(${r}, ${g}, ${b})`;
}

/** Choose a theme, through the real control. One id, one press. */
async function chooseThemeRow(page, id) {
  await page.evaluate((value) => {
    document.querySelector(`[data-el="theme-rows"] input[value="${value}"]`)?.click();
  }, id);
}

/** The colour the engine resolved for one element and one property. */
async function paintOf(page, selector, prop) {
  return page.evaluate(
    (css, name) => {
      const found = document.querySelector(css);
      return found === null ? null : getComputedStyle(found)[name];
    },
    selector,
    prop,
  );
}

/** Type a colour into one of the builder's fields, the way a player does. */
async function typeSeed(page, element, seed) {
  await page.evaluate(
    (name, value) => {
      const field = document.querySelector(`[data-el="${name}"]`);
      if (field === null) return;
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      setter?.call(field, value);
      field.dispatchEvent(new Event('input', { bubbles: true }));
    },
    element,
    seed,
  );
}

/** Read every role probe, each against the first ancestor that paints a ground. */
/**
 * The luminance of the pixels each role really paints, off two frames.
 *
 * **The grain moved what a ground IS.** Before Unit 4.12 the computed
 * `background-color` of an ancestor was the colour under the ink at every
 * pixel, so one reading answered the whole claim. A grained ground is a
 * distribution instead, and the tightest pixel of it is not the average. A
 * check that kept reading the computed value would be blind to exactly the
 * dimension the grain added.
 *
 * One frame is the screen as a player sees it. The second paints every element
 * a claim depends on in a colour of its own, with the grain off, so a pixel
 * says which element owns it. A child covers its parent in that frame exactly
 * as it does on the screen, so a ground's own pixels are the ones a player can
 * still see. An edge pixel blends two markers, matches neither, and is dropped,
 * which is right: a blended pixel measures the antialiasing.
 *
 * Every marked element answers with the darkest, the lightest and the mean
 * luminance of its own pixels, so the caller can pair the two extremes that
 * make the worst case rather than the two averages.
 */
async function readPaintedSpans(page, selectors) {
  // Seven colours, and no more: a marker is a full-strength primary or a mix of
  // them, so no two are nearer than 255 levels on some channel and a blended
  // edge cannot land on a third. A longer list is marked in several passes.
  const chunks = [];
  for (let at = 0; at < selectors.length; at += 7) chunks.push(selectors.slice(at, at + 7));
  const plain = await page.screenshot({ type: 'png', encoding: 'base64' });
  const answer = [];
  for (const chunk of chunks) {
    answer.push(...((await readOneMarkerPass(page, chunk, plain)) ?? []));
  }
  return answer.length === selectors.length ? answer : null;
}

async function readOneMarkerPass(page, selectors, plain) {
  const marks = selectors.map((selector, at) => ({
    selector,
    colour: [((at + 1) & 1) * 255, (((at + 1) >> 1) & 1) * 255, (((at + 1) >> 2) & 1) * 255],
  }));
  await page.evaluate((list) => {
    document.getElementById('clatter-mark-grounds')?.remove();
    const style = document.createElement('style');
    style.id = 'clatter-mark-grounds';
    // The caller has already put `data-grain-role` on every element a claim
    // depends on, so nothing is resolved twice and the marker lands on exactly
    // the element the reading belongs to.
    style.textContent = list
      .map(
        (one) =>
          `[data-grain-role='${one.selector}'] { background-image: none !important; ` +
          `background-color: rgb(${one.colour.join(' ')}) !important; }`,
      )
      .join('\n');
    document.head.append(style);
  }, marks);
  const marked = await page.screenshot({ type: 'png', encoding: 'base64' });
  await page.evaluate(() => document.getElementById('clatter-mark-grounds')?.remove());

  return page.evaluate(
    async ({ plain, marked, marks }) => {
      const pixels = async (encoded) => {
        const blob = await (await fetch(`data:image/png;base64,${encoded}`)).blob();
        const bitmap = await createImageBitmap(blob);
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const context = canvas.getContext('2d');
        context.drawImage(bitmap, 0, 0);
        return context.getImageData(0, 0, canvas.width, canvas.height).data;
      };
      const seen = await pixels(plain);
      const owner = await pixels(marked);
      if (seen.length !== owner.length || seen.length === 0) return null;
      const toLinear = (byte) => {
        const value = byte / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      };
      const answer = marks.map((one) => ({
        selector: one.selector,
        own: 0,
        min: Infinity,
        max: -Infinity,
        total: 0,
      }));
      for (let at = 0; at < seen.length; at += 4) {
        const found = marks.findIndex(
          (one) =>
            Math.abs(owner[at] - one.colour[0]) <= 2 &&
            Math.abs(owner[at + 1] - one.colour[1]) <= 2 &&
            Math.abs(owner[at + 2] - one.colour[2]) <= 2,
        );
        if (found === -1) continue;
        const y =
          0.2126 * toLinear(seen[at]) +
          0.7152 * toLinear(seen[at + 1]) +
          0.0722 * toLinear(seen[at + 2]);
        const row = answer[found];
        row.own += 1;
        row.total += y;
        if (y < row.min) row.min = y;
        if (y > row.max) row.max = y;
      }
      return answer.map((row) =>
        row.own === 0
          ? { ...row, min: null, max: null, mean: null }
          : { ...row, mean: row.total / row.own },
      );
    },
    { plain, marked, marks },
  );
}

/**
 * The worst contrast between two painted things, in relative luminance.
 *
 * A span is `{ min, max }` and a flat colour is a span with one value. The
 * worst pair is the two ends that face each other, so an ink lighter than its
 * ground is measured at its own darkest against the ground at its lightest. Two
 * spans that overlap answer 1, because some pixel of one equals some pixel of
 * the other and there is nothing between them at all.
 */
function worstSpanRatio(ink, ground) {
  if (ink.min === null || ground.min === null) return null;
  const ratio = (one, two) => (Math.max(one, two) + 0.05) / (Math.min(one, two) + 0.05);
  if (ink.min > ground.max) return ratio(ink.min, ground.max);
  if (ink.max < ground.min) return ratio(ink.max, ground.min);
  return 1;
}

/**
 * Tag every element a contrast claim depends on, and say which were tagged.
 *
 * The ground of a probe is the first ancestor that really paints one, resolved
 * exactly as `readPaints` resolves it, so the two readings name one element.
 * The INK is tagged as well wherever the ink is itself a painted ground — a
 * mark, a filled button — because the grain landed on those too and their own
 * pixels are a span rather than a colour. A text ink and a border keep their
 * computed colour: a glyph edge and a one-pixel border are antialiased, so a
 * pixel read there would measure the blend rather than the ink.
 */
async function tagRoleSurfaces(page, probes) {
  return page.evaluate((list) => {
    const groundOf = (each, self) => {
      const start = self ? each : each.parentElement;
      for (let at = start; at !== null; at = at.parentElement) {
        const paint = getComputedStyle(at).backgroundColor;
        if (paint !== 'transparent' && !/,\s*0\)$/.test(paint)) return at;
      }
      return document.body;
    };
    const names = [];
    // **One element takes one name.** A filled button is the ground of its own
    // label and the ink of its own claim, so two probes meet on it. A second
    // attribute would overwrite the first and lose a reading, so the element
    // keeps the name it already has and both probes point at that name.
    const nameOf = (element) => {
      const held = element.getAttribute('data-grain-role');
      if (held !== null) return held;
      const fresh = `s${names.length}`;
      element.setAttribute('data-grain-role', fresh);
      names.push(fresh);
      return fresh;
    };
    const mapped = list.map((probe) => {
      const found = document.querySelector(probe.selector);
      if (found === null) return { ground: null, ink: null };
      const ground = groundOf(found, probe.self === true && probe.prop !== 'backgroundColor');
      return {
        ground: ground === null ? null : nameOf(ground),
        ink: probe.prop === 'backgroundColor' ? nameOf(found) : null,
      };
    });
    return { names, probes: mapped };
  }, probes);
}

async function readPaints(page, probes) {
  return page.evaluate((list) => {
    const groundOf = (each, self) => {
      const start = self ? each : each.parentElement;
      for (let at = start; at !== null; at = at.parentElement) {
        const paint = getComputedStyle(at).backgroundColor;
        if (paint !== 'transparent' && !/,\s*0\)$/.test(paint)) return paint;
      }
      return getComputedStyle(document.body).backgroundColor;
    };
    return list.map((probe) => {
      const found = document.querySelector(probe.selector);
      if (found === null) return { name: probe.name, missing: true };
      return {
        name: probe.name,
        missing: false,
        ink: getComputedStyle(found)[probe.prop],
        ground: groundOf(found, probe.self === true && probe.prop !== 'backgroundColor'),
        floor: probe.floor,
      };
    });
  }, probes);
}

// ---------------------------------------------------------------------------
// The grain on a surface — Unit 4.12
//
// The owner asked for a texture that is "slight, but noticeable". Both halves
// of that are measured here, and both are measured on PIXELS the browser really
// drew. A check that read `background-image` off a rule, or off a computed
// style, would say the declaration is present and nothing at all about whether
// a player sees it: an element under an opaque child, or a blend mode the
// browser refused, would pass such a check while the surface stayed flat.
//
// The instrument is a difference of two screenshots of the SAME rectangle. One
// rule is switched off between them — the one that puts the grain on the
// surface under test and on no other — so every pixel that moves belongs to
// that surface. A child that carries its own grain keeps it in both frames and
// contributes nothing, which is what makes one surface measurable inside
// another.
//
// Three bounds, and each one fails a different way of being wrong.
//
//   * `share` — the part of the surface that moved at all. A grain nobody can
//     find has failed, and a rule that never reached the element moves nothing.
//     This is the floor, and it is what goes red when the stylesheet loses the
//     rule.
//   * `worst` — the strongest pixel. This is the ceiling that holds "slight".
//     A grain that shouts reads as noise rather than as a material.
//   * the contrast the grained ground really carries. This is the half that
//     says the texture does not fight the reading. **It is measured and not
//     assumed.** A first draft of this check asserted that the average of a
//     surface does not move, and the measurement refused it: `soft-light` is
//     not symmetric on a dark ground, and every dark row came out 7 to 8 levels
//     lighter. That is a fact about the blend and no choice of noise removes
//     it, so the claim was rewritten to the one that matters. The ink of each
//     surface is read off the rendered element, the ground is the AVERAGE of
//     the pixels that surface really painted, grain and all, and the WCAG floor
//     is measured between the two. The drift is reported beside it.
// ---------------------------------------------------------------------------

/** The floor for text, restated. WCAG 2.2 SC 1.4.3. */
const GRAIN_TEXT_FLOOR = 4.5;

// ---------------------------------------------------------------------------
// The population the grain has to cover
//
// The check above measures three surfaces. Three is a FIXTURE, not a scope: it
// went green while thirteen selectors were cut out of the grain rule, because
// the three it names were not among them. A denominator taken from the grain
// rule's own selector list carries the same fault the other way round, because
// deleting a selector deletes it from the population too.
//
// So the population is every rule of `src/shell.css` that paints a GROUND, and
// a member passes on one of three arms:
//
//   1. It is grained. Read off the rendered element, so a rule that never
//      reached it fails here whatever the stylesheet says.
//   2. Its painted box is under the coarse feature of the grain that would
//      apply to it. A texture smaller than one of its own features is noise.
//      Read off the rendered box.
//   3. It is a meaning mark. Declared, and counted against the tokens the
//      palette pins fixed across every row, so the list cannot grow a member
//      that is only a colour somebody liked.
//
// Deleting a selector from the grain rule moves that ground into arm 1 with no
// excuse, so the gate fires. A new ground-painting rule in none of the three
// arms fires it as well.
// ---------------------------------------------------------------------------

/**
 * The marks that carry a meaning, and the token each one paints.
 *
 * Every entry is checked against `builder.ts`, which names the tokens a derived
 * palette copies rather than derives. A mark added here that paints anything
 * else fails the count, so the list cannot be widened into an excuse.
 */
/**
 * The one ground that cannot take any arm, and the count that holds it to one.
 *
 * `.die` is a single rule over two kinds of element. A six-faced die draws its
 * pips as background layers and every other die draws a numeral as text, so a
 * grain layer added to that rule is overwritten by the pip rules, or sized as a
 * pip by `.pips`, or lands on a face that has no image at all. The comment above
 * `.die` in `src/shell.css` prices that in full and names the upgrade path.
 * **Read it there.** It is not restated here, because a second copy of a reason
 * is a second thing to keep true.
 *
 * The gate holds this list two ways. It asserts each entry is still NEEDED, so
 * an excuse cannot outlive its reason, and it asserts the COUNT, so a second
 * exception has to be a deliberate edit to this file.
 */
const GRAIN_EXCEPTIONS = [{ selector: '.die', why: 'see the comment above `.die` in shell.css' }];

/** How many exceptions the gate carries. One. */
const GRAIN_EXCEPTION_COUNT = 1;

const excepted = (selector) => GRAIN_EXCEPTIONS.some((one) => one.selector === selector);

const MEANING_MARKS = [
  { selector: '.mark.s', token: '--mark-success' },
  { selector: '.mark.b', token: '--mark-bane' },
  { selector: '.badge.s', token: '--mark-success' },
  { selector: '.badge.b', token: '--mark-bane' },
];

/** `src/shell.css` with every comment taken out. */
function styleSheetText() {
  return readFileSync(join(here, '..', 'src', 'shell.css'), 'utf8').replace(
    /\/\*[\s\S]*?\*\//g,
    ' ',
  );
}

/**
 * Every rule of the stylesheet, as a selector list and a body.
 *
 * A media query is skipped rather than parsed: its head is followed by another
 * `{` and never by a `}`, so no match starts on it, and the rules inside it are
 * matched on their own.
 */
function cssRules(text) {
  return [...text.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, head, body]) => ({
    selectors: head
      .split(',')
      .map((one) => one.trim().replace(/\s+/g, ' '))
      .filter(Boolean),
    body,
  }));
}

/** Every selector the stylesheet paints a ground for, with what it paints. */
function groundSelectors(text) {
  const found = [];
  for (const rule of cssRules(text)) {
    for (const [, value] of rule.body.matchAll(/(?:^|;)\s*background(?:-color)?\s*:\s*([^;]+)/g)) {
      const paint = value.trim();
      if (/^(none|transparent)/.test(paint) || paint.includes('--texture-noise')) continue;
      for (const selector of rule.selectors) found.push({ selector, paint });
    }
  }
  return found;
}

/** Every selector the stylesheet grains, and the size it stretches the noise to. */
function grainRules(text) {
  const rules = [];
  for (const rule of cssRules(text)) {
    if (!/background-image:\s*var\(--texture-noise\)/.test(rule.body)) continue;
    const stated = /background-size:\s*([^;]+)/.exec(rule.body);
    const parts = (stated?.[1] ?? '')
      .trim()
      .split(/\s+/)
      .map((one) => Number.parseFloat(one));
    rules.push({ selectors: rule.selectors, size: [parts[0], parts[1] ?? parts[0]] });
  }
  return rules;
}

/**
 * The coarse feature of the surface noise, in CSS pixels, on a surface that
 * stretches it to `size`.
 *
 * `feTurbulence` states `baseFrequency` in cycles per SVG user unit, so the
 * coarsest octave has a wavelength of `1 / baseFrequency` user units. The SVG
 * is `width` units across and `background-size` stretches it, so one wavelength
 * lands on `size / width` CSS pixels per unit. Both numbers are read out of the
 * `--texture-noise` declaration, so neither is retyped here.
 *
 * **This is NOT `GRAIN_OCTAVES`.** That constant belongs to `dice-grain.ts`,
 * which builds the grain on a DIE out of a canvas of cells and has its own
 * generator. The surface grain is an SVG filter and its octave lives in the
 * stylesheet. Reading the die's cell count here would measure the wrong thing.
 */
function noiseFeature(text) {
  const declaration = /--texture-noise:\s*([^;]+)/.exec(text)?.[1] ?? '';
  const decoded = declaration.replace(/%([0-9a-fA-F]{2})/g, (_, code) =>
    String.fromCharCode(Number.parseInt(code, 16)),
  );
  const frequency = Number.parseFloat(/baseFrequency='([\d.]+)'/.exec(decoded)?.[1] ?? 'NaN');
  const span = Number.parseFloat(/<svg[^>]*width='(\d+)'/.exec(decoded)?.[1] ?? 'NaN');
  return { wavelength: 1 / frequency, span, frequency };
}

/**
 * The rule that grains one selector, or the rule a new ground would join.
 *
 * A ground already in a grain rule answers to that rule's own size. A ground
 * that is not in one is measured against the FINEST grain the stylesheet has,
 * because that is the grain it would be given: a small control belongs with the
 * panels and never with the page or the table. The finest is read off the rules
 * rather than named, so it follows the stylesheet.
 */
function grainForSelector(rules, selector) {
  const own = rules.find((rule) => rule.selectors.includes(selector));
  if (own !== undefined) return own;
  return rules.reduce((held, rule) =>
    Math.min(...rule.size) < Math.min(...held.size) ? rule : held,
  );
}

/**
 * The three surfaces, the rule that grains each one, and the ink it carries.
 *
 * `ink` is a custom property where the text on that surface takes one, and the
 * word `color` where the text is whatever the element inherited.
 */
const GRAIN_SURFACES = [
  { name: 'the page', selector: '.screen', ink: 'color' },
  { name: 'a panel', selector: '.shell-f', ink: 'color' },
  { name: 'the table', selector: '[data-el="dice-table"]', ink: '--on-tray' },
];

/** The part of a surface that must move. Under this the grain is not there. */
const GRAIN_SHARE_FLOOR = 0.25;
/** The most any one pixel may move, out of 255. Over this it is not slight. */
const GRAIN_WORST_CEILING = 24;
/** The side of the patch read on each surface, in CSS pixels. */
const GRAIN_PATCH = 300;

/**
 * Read one surface three times: grained, flat, and flat under a marker colour.
 *
 * The third frame is what gives the reading an honest DENOMINATOR. A patch of
 * the page is mostly covered by the header and the table, so the share of the
 * PATCH that moved would say almost nothing. The marker frame paints the
 * surface under test one colour nothing else uses, and the pixels that differ
 * between it and the flat frame are exactly the pixels that surface paints and
 * a player sees. The share, the strongest move and the average move are all
 * measured over that set and over no other pixel.
 *
 * A surface that is not on the screen, or that paints no pixel a player can
 * see, answers null, so neither can pass as a measured one.
 */
async function readGrain(page, selector) {
  const clip = await page.evaluate(
    ({ selector, side }) => {
      const found = document.querySelector(selector);
      if (found === null) return null;
      const box = found.getBoundingClientRect();
      const width = Math.min(Math.round(box.width), side);
      const height = Math.min(Math.round(box.height), side);
      if (width < 16 || height < 16) return null;
      return { x: Math.round(box.x), y: Math.round(box.y), width, height };
    },
    { selector, side: GRAIN_PATCH },
  );
  if (clip === null) return null;

  const grained = await page.screenshot({ clip, type: 'png', encoding: 'base64' });
  // One rule, added last, so it beats the rule under test on weight and order
  // and touches nothing else. `!important` in a stylesheet beats the inline
  // colour `src/tray/scene.ts` writes on the table, which is what lets the
  // marker frame below reach that surface too.
  const overrule = async (body) =>
    page.evaluate(
      ({ selector, body }) => {
        document.getElementById('clatter-grain-off')?.remove();
        if (body === null) return;
        const off = document.createElement('style');
        off.id = 'clatter-grain-off';
        off.textContent = `${selector} { ${body} }`;
        document.head.appendChild(off);
      },
      { selector, body },
    );
  await overrule('background-image: none !important;');
  const flat = await page.screenshot({ clip, type: 'png', encoding: 'base64' });
  await overrule('background-image: none !important; background-color: rgb(0 255 0) !important;');
  const marked = await page.screenshot({ clip, type: 'png', encoding: 'base64' });
  await overrule(null);

  return page.evaluate(
    async ({ grained, flat, marked }) => {
      const pixels = async (encoded) => {
        const blob = await (await fetch(`data:image/png;base64,${encoded}`)).blob();
        const bitmap = await createImageBitmap(blob);
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const context = canvas.getContext('2d');
        context.drawImage(bitmap, 0, 0);
        return context.getImageData(0, 0, canvas.width, canvas.height).data;
      };
      const one = await pixels(grained);
      const two = await pixels(flat);
      const three = await pixels(marked);
      if (one.length !== two.length || one.length !== three.length || one.length === 0) return null;
      let own = 0;
      let moved = 0;
      let worst = 0;
      let total = 0;
      const ground = [0, 0, 0];
      for (let at = 0; at < one.length; at += 4) {
        // The denominator: this surface paints here, because the marker moved
        // the pixel. Every reading below is taken over these pixels alone.
        const marker =
          Math.abs(three[at] - two[at]) +
          Math.abs(three[at + 1] - two[at + 1]) +
          Math.abs(three[at + 2] - two[at + 2]);
        if (marker < 3) continue;
        own += 1;
        ground[0] += one[at];
        ground[1] += one[at + 1];
        ground[2] += one[at + 2];
        const delta =
          (one[at] - two[at] + (one[at + 1] - two[at + 1]) + (one[at + 2] - two[at + 2])) / 3;
        if (Math.abs(delta) >= 1) moved += 1;
        if (Math.abs(delta) > Math.abs(worst)) worst = delta;
        total += delta;
      }
      if (own === 0) return null;
      return {
        pixels: one.length / 4,
        own,
        share: moved / own,
        worst: Math.abs(worst),
        drift: total / own,
        // The ground a player's eye averages, taken off the grained frame. It
        // is written in the shape `getComputedStyle` answers with, so the one
        // contrast helper reads both ends of the pair.
        ground: `rgb(${ground.map((sum) => Math.round(sum / own)).join(', ')})`,
      };
    },
    { grained, flat, marked },
  );
}

/**
 * The painted box and the grain of every ground, in one state of the screen.
 *
 * The box comes off `getBoundingClientRect` and the grain off the computed
 * `background-image`, so both are what the browser resolved and neither is a
 * reading of the rule. An element the state does not draw answers `seen: false`.
 */
async function readGrounds(page, selectors) {
  return page.evaluate((list) => {
    const answer = {};
    for (const selector of list) {
      let all;
      try {
        all = [...document.querySelectorAll(selector)];
      } catch {
        // A selector the browser refuses is a fault of this list, not a state.
        all = [];
      }
      // **Every element the selector draws, and not the first one.** `.die`
      // draws pips on a six-faced die and a numeral on every other, so the
      // first match alone would answer for a rule that covers both, and which
      // one came first would decide the reading.
      const found = all[0] ?? null;
      if (found === null) continue;
      const box = found.getBoundingClientRect();
      const style = getComputedStyle(found);
      // **A rule that paints a ground does not paint one in every state.**
      // `.zones.over .shelf` takes the whole background away over the 3D
      // table, so the shelf is not a ground there and a reading taken there
      // would report a ground with no grain on it. Only a state where the
      // element really paints one is a reading of that ground.
      if (style.backgroundColor === 'transparent' || /,\s*0\)$/.test(style.backgroundColor)) {
        continue;
      }
      const grained = style.backgroundImage.includes('image/svg+xml');
      answer[selector] = {
        width: box.width,
        height: box.height,
        // The renderer resolves the custom property, so this is the image the
        // element really carries and not the text of the rule.
        grained,
      };
    }
    return answer;
  }, selectors);
}

/**
 * Whether the cascade puts the grain on a selector no state of the screen drew.
 *
 * The element is built from the selector and put in the document, so the
 * browser resolves the cascade for it exactly as it would for a real one. This
 * answers the GRAIN and never the box: `background-image` does not depend on
 * layout, and a box does. A probe appended to the body would report a height of
 * zero for a bar that takes its height from a track, and a zero box would then
 * excuse the ground as too small. So a ground the screen never draws can be
 * covered by the grain or declared a meaning mark, and it can never be excused
 * by its size.
 */
async function probeGrain(page, selectors) {
  return page.evaluate((list) => {
    const answer = {};
    for (const selector of list) {
      // `.hist-mx td[data-cell='absent']` is a chain, so each step is built and
      // nested. Every step is a simple compound: a tag, classes and attributes.
      const steps = selector.trim().split(/\s+/);
      let root = null;
      let leaf = null;
      let usable = true;
      for (const step of steps) {
        const tag = /^[a-zA-Z][\w-]*/.exec(step)?.[0] ?? 'div';
        const classes = [...step.matchAll(/\.([\w-]+)/g)].map((one) => one[1]);
        const attributes = [...step.matchAll(/\[([\w-]+)='([^']*)'\]/g)];
        if (/[#:>+~]/.test(step)) usable = false;
        const made = document.createElement(tag);
        for (const one of classes) made.classList.add(one);
        for (const [, name, value] of attributes) made.setAttribute(name, value);
        if (leaf === null) root = made;
        else leaf.append(made);
        leaf = made;
      }
      if (!usable || root === null || leaf === null) continue;
      document.body.append(root);
      answer[selector] = getComputedStyle(leaf).backgroundImage.includes('image/svg+xml');
      root.remove();
    }
    return answer;
  }, selectors);
}

/**
 * Every ground the stylesheet paints, measured on the screen that paints it.
 *
 * The states below are the states a player reaches, and every ground is looked
 * for in all of them. The reading kept for a selector is its LARGEST box,
 * because the surface a player judges is the surface when it is shown and not
 * when it is empty. A ground no state produced is named and fails.
 */
async function runGroundCoverage(page, checks, options = { captureShell: null }) {
  const css = styleSheetText();
  const population = groundSelectors(css);
  const rules = grainRules(css);
  const noise = noiseFeature(css);

  // The states. Each one is a short drive and then a sweep.
  const states = [];
  const sweep = async (name) => {
    states.push({
      name,
      read: await readGrounds(
        page,
        population.map((one) => one.selector),
      ),
    });
  };
  await page.evaluate(() => {
    try {
      localStorage.clear();
    } catch {
      // A browser that refuses storage answers the defaults anyway.
    }
  });
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('[data-el="roll-button"]', { timeout: 30000 });
  await sweep('the pool builder');

  // The overlay of Unit 3.8 draws `.perf`, and the sheet holds its switch.
  await openSheet(page);
  await page.evaluate(() => {
    const box = document.querySelector('[data-el="sheet-overlay-toggle"]');
    if (box !== null && !box.checked) box.click();
  });
  // A changed override, so `.ovr-row.changed` is a row a player can really see.
  await page.evaluate(() => {
    const field = document.querySelector('[data-el="sheet-overrides"] input.ovr-input');
    if (field === null) return;
    field.focus();
    field.value = String(Number(field.value || 0) + 1);
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await sweep('the open sheet');
  await closeSheet(page);

  await pressTile(page, 'attribute', 'p', 4);
  await pressTile(page, 'skill', 'p', 3);
  await pressTile(page, 'stress', 'p', 2);
  // A die of more than six faces draws a numeral instead of pips, so `.die`
  // shows both kinds and the fourth arm answers for the whole rule.
  await pressTile(page, 'artifact', 'p', 2);
  await page.click('[data-el="roll-button"]');
  await settleScreen(page);
  await sweep('a roll on the table');

  // The flat dice. `.die`, `.badge` and the two kept slots are drawn by that
  // renderer alone, and `.zones.over .shelf` takes the shelf's ground away
  // while the 3D table is on, so the shelf is only a ground here.
  await openSheet(page);
  await page.evaluate(() => {
    const box = document.querySelector('[data-el="sheet-tray-renderer"] input');
    if (box !== null && box.checked) box.click();
  });
  await closeSheet(page);
  await settleScreen(page);
  await page.evaluate(() => {
    // One kept die, so `.slot.choice` is a slot a player really made.
    document.querySelector('[data-el^="die-"][aria-pressed="false"]')?.click();
  });
  await settleScreen(page);
  await sweep('the flat dice');

  await openHistory(page);
  await sweep('the history');
  await page.click('[data-el="statistics-button"]');
  await settleScreen(page);
  await sweep('the statistics');

  // The captures. The newly grained surfaces are small controls — notches,
  // slots, bars, glyphs and a dot — and a green gate says nothing about whether
  // a grain on one of those reads as material or as damage. The two rows are
  // the dark default and the one light row, because a soft-light grain is not
  // symmetric and a light ground is the case a dark one does not cover.
  if (options.captureShell !== null) {
    // Back out of the statistics and then out of the history, so the loop below
    // starts on the dice screen, which is where the one disclosure lives.
    const backToDice = async () => {
      for (let step = 0; step < 3; step += 1) {
        if ((await page.$('[data-el="history"]')) === null) return;
        await page.click('[data-el="back-button"]');
        await settleScreen(page);
      }
    };
    await backToDice();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    for (const id of ['leather', 'bone']) {
      await openSheet(page);
      await chooseThemeRow(page, id);
      await closeSheet(page);
      await new Promise((done) => setTimeout(done, 200));
      writeFileSync(
        join(options.captureShell, `0024-grain-dice-${id}-1440.png`),
        await page.screenshot({ type: 'png' }),
      );
      await openHistory(page);
      await page.click('[data-el="statistics-button"]');
      await settleScreen(page);
      await new Promise((done) => setTimeout(done, 200));
      writeFileSync(
        join(options.captureShell, `0024-grain-statistics-${id}-1440.png`),
        await page.screenshot({ type: 'png' }),
      );
      await backToDice();
    }
    console.log(`browser: theme grounds captures written to ${options.captureShell}`);
  }

  // The grain on the grounds no state drew, from the cascade rather than from a
  // drawn element. The box of those stays unknown on purpose.
  const neverDrawn = population
    .map((one) => one.selector)
    .filter((selector) => !states.some((state) => state.read[selector] !== undefined));
  const probed = await probeGrain(page, neverDrawn);

  // The largest box of any state, and grained if any state drew it grained.
  const measured = population.map((member) => {
    const seen = states.filter((state) => state.read[member.selector] !== undefined);
    const boxes = seen.map((state) => state.read[member.selector]);
    const widest = boxes.reduce(
      (held, box) => (box.width * box.height > held.width * held.height ? box : held),
      boxes[0] ?? { width: 0, height: 0, grained: false },
    );
    const rule = grainForSelector(rules, member.selector);
    // The coarse wavelength of the noise, per axis, on the surface this rule
    // stretches it to. `background-size` is a pair, so the two axes can differ:
    // the table pulls the noise flat and its two features are not the same.
    const feature = rule.size.map((size) => (noise.wavelength * size) / noise.span);
    const drawn = seen.length > 0;
    return {
      ...member,
      states: seen.map((state) => state.name),
      drawn,
      width: widest.width,
      height: widest.height,
      grained: drawn ? boxes.some((box) => box.grained) : (probed[member.selector] ?? false),
      feature,
      // Under one coarse feature on either axis the noise cannot make a
      // pattern at all, so what lands there is a smudge and not a material.
      // Only a ground the screen really drew may take this arm: an undrawn one
      // has no box, and a box of nothing would excuse every one of them.
      small: drawn && (widest.width < feature[0] || widest.height < feature[1]),
      mark: MEANING_MARKS.some((one) => one.selector === member.selector),
    };
  });

  // The meaning-mark arm, counted against the palette rather than against
  // itself. `builder.ts` names the tokens a derived palette COPIES instead of
  // deriving, which is the same list `themes.ts` holds fixed across every row.
  const builder = await import('../src/theme/builder.ts');
  const fixedTokens = new Set(
    Object.keys(builder.derivePalette('#808080')).filter(
      (token) =>
        builder.derivePalette('#808080')[token] === builder.derivePalette('#204060')[token],
    ),
  );
  const cssToken = (token) => `--${token.replace(/[A-Z]/g, (up) => `-${up.toLowerCase()}`)}`;
  const fixedRoles = new Set([...fixedTokens].map(cssToken));
  const markFaults = MEANING_MARKS.flatMap((one) => {
    const member = measured.find((each) => each.selector === one.selector);
    if (member === undefined) return [`${one.selector} is not a ground the stylesheet paints`];
    if (!member.paint.includes(one.token)) {
      return [`${one.selector} paints ${member.paint} and not ${one.token}`];
    }
    return fixedRoles.has(one.token)
      ? []
      : [`${one.token} is not a token the palette pins fixed across every row`];
  });

  const uncovered = measured.filter(
    (member) => !member.grained && !member.small && !member.mark && !excepted(member.selector),
  );

  // **An exception has to prove it is still needed.** A ground that takes one
  // of the three real arms no longer needs an excuse, and an excuse that
  // outlives its reason is how a gate rots into a list of things nobody reads.
  // This is the direction that matters, so it is the direction that fires.
  const staleExceptions = GRAIN_EXCEPTIONS.flatMap((one) => {
    const member = measured.find((each) => each.selector === one.selector);
    if (member === undefined) {
      return [`${one.selector} is no longer a ground src/shell.css paints`];
    }
    if (member.grained) return [`${one.selector} is grained, so the exception is stale`];
    if (member.small) {
      return [`${one.selector} is under its feature at last, so the exception is stale`];
    }
    if (member.mark) return [`${one.selector} is a meaning mark, so the exception is stale`];
    return [];
  });
  const covered = measured.length - uncovered.length;
  console.log(
    `browser: theme grounds population=${measured.length} grained=${measured.filter((one) => one.grained).length} ` +
      `too_small=${measured.filter((one) => !one.grained && one.small).length} ` +
      `meaning_marks=${measured.filter((one) => !one.grained && !one.small && one.mark).length} ` +
      `uncovered=${uncovered.length} ` +
      `never_drawn=${measured.filter((one) => !one.drawn).length} ` +
      `probed_for_grain=${Object.keys(probed).length} ` +
      `exceptions=${GRAIN_EXCEPTIONS.length} of ${GRAIN_EXCEPTION_COUNT} stale=${staleExceptions.length} ` +
      `fixed_tokens=${fixedRoles.size} mark_faults=${markFaults.length}`,
  );
  console.log(
    `browser: theme grounds noise wavelength=${noise.wavelength.toFixed(3)} user units at ` +
      `baseFrequency=${noise.frequency} over a ${noise.span} unit tile, so a feature measures ` +
      rules
        .map(
          (rule) =>
            `${rule.size.join('x')} => ${rule.size
              .map((size) => ((noise.wavelength * size) / noise.span).toFixed(2))
              .join('x')} px`,
        )
        .join(', '),
  );
  for (const member of uncovered) {
    console.log(
      `browser: theme grounds NOT COVERED ${member.selector} paints ${member.paint} at ` +
        `${member.drawn ? `${member.width.toFixed(1)}x${member.height.toFixed(1)} px` : 'no box, never drawn'} ` +
        `against a feature of ${member.feature.map((one) => one.toFixed(2)).join('x')} px, seen in ` +
        `[${member.states.join(', ') || 'no state'}]`,
    );
  }
  checks.push({
    name: 'theme.every-ground-the-stylesheet-paints-carries-the-grain-or-says-why',
    ok:
      uncovered.length === 0 &&
      markFaults.length === 0 &&
      staleExceptions.length === 0 &&
      GRAIN_EXCEPTIONS.length === GRAIN_EXCEPTION_COUNT &&
      covered === measured.length,
    detail:
      `${covered} of the ${measured.length} grounds src/shell.css paints are covered, over ` +
      `${states.length} states of the screen. The population is every rule that paints a ` +
      `ground, read off the stylesheet, so a rule added tomorrow joins it without anybody ` +
      `remembering this check, and a selector cut OUT of the grain rule stays in it. ` +
      `A ground passes on one of three arms: it is grained, read off the computed ` +
      `background-image of the rendered element; or its painted box is under one coarse ` +
      `feature of the grain that would apply to it, read off getBoundingClientRect; or it is ` +
      `one of the ${MEANING_MARKS.length} declared meaning marks, each of which must paint a ` +
      `token the palette pins fixed across every row — ${fixedRoles.size} such tokens were ` +
      `counted out of derivePalette. ` +
      `A ground no state drew is read for its GRAIN off a probe the cascade resolves, and it is ` +
      `never read for its box, because a box of nothing would excuse every one of them: ` +
      `${measured.filter((one) => !one.drawn).length} of the population were probed that way. ` +
      `The gate carries ${GRAIN_EXCEPTIONS.length} declared exception against a count of ` +
      `${GRAIN_EXCEPTION_COUNT} [${GRAIN_EXCEPTIONS.map((one) => `${one.selector}: ${one.why}`).join('; ')}], ` +
      `and each is asserted STILL NEEDED: a ground that takes one of the three arms no ` +
      `longer needs an excuse. stale=${staleExceptions.length} [${staleExceptions.join('; ')}] ` +
      `uncovered=${uncovered.length} [${uncovered.map((one) => `${one.selector} at ${one.drawn ? `${one.width.toFixed(1)}x${one.height.toFixed(1)} px` : 'no box'}`).join('; ')}] ` +
      `mark_faults=${markFaults.length} [${markFaults.join('; ')}]`,
  });
}

async function runTheme(page, options, checks) {
  // The oracle is the application's own theme modules, imported here as source.
  // `scripts/ts-resolve.mjs` supplies the extension Vite would have supplied,
  // so this file reads the same rows the screen reads and never a copy of them.
  register('./ts-resolve.mjs', import.meta.url);
  const themes = await import('../src/theme/themes.ts');
  const builder = await import('../src/theme/builder.ts');
  // The row a player meets first, read off the defaults rather than typed here.
  const settings = await import('../src/settings/settings.ts');

  // The run starts from the defaults, so nothing an earlier run stored decides
  // what this one reads.
  await page.evaluate(() => {
    try {
      localStorage.clear();
    } catch {
      // A browser that refuses storage answers the defaults anyway.
    }
  });
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('[data-el="disclosure-toggle"]', { timeout: 30000 });

  const NAMES = [...themes.THEME_IDS];

  // ---- 1. One id reaches the page AND the table. ----
  //
  // The builder is collapsed first, so the table is on the screen and both
  // readings come off a rendered element rather than off the setting. One press
  // per theme, and both surfaces are read after it, so a press that moved only
  // one of the two fails here.
  await page.click('[data-el="collapse-button"]');
  await openSheet(page);
  const pageReadings = [];
  const trayReadings = [];
  for (const id of NAMES) {
    await chooseThemeRow(page, id);
    pageReadings.push({
      id,
      read: await paintOf(page, '.screen', 'backgroundColor'),
      wanted: asRgb(themes.INTERFACE_PALETTES[id].background),
    });
    trayReadings.push({
      id,
      read: await paintOf(page, '[data-el="dice-table"]', 'backgroundColor'),
      wanted: asRgb(themes.TRAY_SURFACES[id]),
    });
  }
  const pageWrong = pageReadings.filter((each) => each.read !== each.wanted);
  const trayWrong = trayReadings.filter((each) => each.read !== each.wanted);
  console.log(
    `browser: theme page_rows=${pageReadings.length} wrong=${pageWrong.length} ` +
      `tray_rows=${trayReadings.length} wrong=${trayWrong.length}`,
  );
  checks.push({
    name: 'theme.one-id-reaches-the-stylesheet',
    ok: pageReadings.length === NAMES.length && pageWrong.length === 0,
    detail:
      `${pageReadings.length} of ${NAMES.length} rows were chosen through the real control, and ` +
      `the page colour was read off the rendered screen each time. ${pageWrong.length} ` +
      `disagreed with the row: ` +
      `[${pageWrong.map((each) => `${each.id} drew ${each.read} against ${each.wanted}`).join('; ')}]. ` +
      `A palette that resolves is not a palette that is spent, so nothing here reads resolveTheme.`,
  });
  checks.push({
    name: 'theme.one-id-reaches-the-tray',
    ok: trayReadings.length === NAMES.length && trayWrong.length === 0,
    detail:
      `${trayReadings.length} of ${NAMES.length} rows were chosen with ONE press each, and the ` +
      `surface was read off ` +
      `the element the tray mounts into. ${trayWrong.length} disagreed: ` +
      `[${trayWrong.map((each) => `${each.id} drew ${each.read} against ${each.wanted}`).join('; ')}].`,
  });

  // ---- 1a. Every surface really carries a grain — Unit 4.12. ----
  //
  // Read here, while the table is still on the screen and before a die is on
  // it, so the patch on the table is bare surface. The sheet is closed first,
  // because the sheet lies over the page and the footer. Every one of the six
  // rows is read, so a grain that survived on one palette and vanished on
  // another cannot pass, and the denominator is a product.
  await closeSheet(page);
  const grainReadings = [];
  const grainFaults = [];
  for (const id of NAMES) {
    await openSheet(page);
    await chooseThemeRow(page, id);
    await closeSheet(page);
    for (const surface of GRAIN_SURFACES) {
      const read = await readGrain(page, surface.selector);
      if (read === null) {
        grainFaults.push(`${id}: ${surface.name} paints no pixel of the patch a player can see`);
        continue;
      }
      grainReadings.push({ id, ...surface, ...read });
      if (read.share < GRAIN_SHARE_FLOOR) {
        grainFaults.push(
          `${id}: ${surface.name} moved ${(read.share * 100).toFixed(1)} per cent of the ` +
            `${read.own} pixels it paints, under the ${GRAIN_SHARE_FLOOR * 100} per cent a grain ` +
            `a player can find has to move`,
        );
      }
      if (read.worst > GRAIN_WORST_CEILING) {
        grainFaults.push(
          `${id}: ${surface.name} moved a pixel by ${read.worst.toFixed(1)} levels, over the ` +
            `${GRAIN_WORST_CEILING} that keeps it slight`,
        );
      }
      // The grain may not fight the reading. The ground is the one the browser
      // drew and not the one the palette named, so a grain that dragged a
      // surface toward its ink turns this red.
      const ink = await page.evaluate(
        ({ selector, ink }) => {
          const found = document.querySelector(selector);
          if (found === null) return null;
          if (ink === 'color') return getComputedStyle(found).color;
          const hex = getComputedStyle(document.documentElement).getPropertyValue(ink).trim();
          const parts = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
          return parts === null
            ? null
            : `rgb(${parseInt(parts[1], 16)}, ${parseInt(parts[2], 16)}, ${parseInt(parts[3], 16)})`;
        },
        { selector: surface.selector, ink: surface.ink },
      );
      const ratio = ink === null ? null : ratioOfRgb(ink, read.ground);
      grainReadings[grainReadings.length - 1].ratio = ratio;
      if (ratio === null || ratio < GRAIN_TEXT_FLOOR) {
        grainFaults.push(
          `${id}: ink ${String(ink)} on ${surface.name} reads ` +
            `${ratio === null ? 'nothing' : ratio.toFixed(2)} to 1 against the grained ground ` +
            `${read.ground}, under the ${GRAIN_TEXT_FLOOR} of WCAG 2.2 SC 1.4.3`,
        );
      }
    }
  }
  const grainWanted = NAMES.length * GRAIN_SURFACES.length;
  const strongest = grainReadings.reduce(
    (held, each) => (each.worst > held.worst ? each : held),
    grainReadings[0] ?? { worst: 0, share: 0, id: 'none', name: 'nothing' },
  );
  const tightestGrain = grainReadings.reduce(
    (held, each) => ((each.ratio ?? 0) < (held.ratio ?? 0) ? each : held),
    grainReadings[0] ?? { ratio: 0, id: 'none', name: 'nothing' },
  );
  const drifts = grainReadings.map((each) => each.drift);
  console.log(
    `browser: theme grain readings=${grainReadings.length} of ${grainWanted} ` +
      `faults=${grainFaults.length} strongest=${strongest.worst.toFixed(1)} levels ` +
      `(${strongest.id} ${strongest.name}) ` +
      `drift=${Math.min(...drifts).toFixed(2)}..${Math.max(...drifts).toFixed(2)} levels ` +
      `tightest=${(tightestGrain.ratio ?? 0).toFixed(2)} (${tightestGrain.id} ${tightestGrain.name}) ` +
      `share=${grainReadings.map((each) => (each.share * 100).toFixed(0)).join(',')}`,
  );
  checks.push({
    name: 'theme.every-surface-carries-a-grain',
    ok: grainReadings.length === grainWanted && grainFaults.length === 0,
    detail:
      `${grainReadings.length} readings against a product of ${NAMES.length} rows by ` +
      `${GRAIN_SURFACES.length} surfaces. Each one is the difference between two screenshots of ` +
      `the same rectangle, taken with the grain rule on and with it off, over the pixels a third ` +
      `frame proves that surface really paints. So every pixel counted is one the browser drew ` +
      `and one this surface owns. A grain must move ${GRAIN_SHARE_FLOOR * 100} per cent of them, ` +
      `no pixel by more than ${GRAIN_WORST_CEILING} levels, and the ink on the grained ground ` +
      `must still clear ${GRAIN_TEXT_FLOOR} to 1. The strongest reading of this run is ` +
      `${strongest.worst.toFixed(1)} levels on ${strongest.id} ${strongest.name}, and the ` +
      `tightest contrast is ${(tightestGrain.ratio ?? 0).toFixed(2)} to 1 on ${tightestGrain.id} ` +
      `${tightestGrain.name}. ${grainFaults.length} faults [${grainFaults.join('; ')}]`,
  });
  await openSheet(page);

  // ---- 2. The same id reaches the flat dice. ----
  //
  // A die has to be on the table, so the pool is thrown first. Each body is
  // compared against the row for THAT die's type, so a renderer that painted
  // every die one colour could not pass.
  //
  // The flat renderer is asked for by hand through `sheet-tray-renderer`, which
  // is the control Decision 8 put on the sheet. A cell over the 3D table draws
  // no die of its own, so the flat dice are where a body colour can be read off
  // an element at all. The 3D dice are read off the tray itself, below.
  await page.evaluate(() => {
    const box = document.querySelector('[data-el="sheet-tray-renderer"] input');
    if (box !== null && box.checked) box.click();
  });
  await closeSheet(page);
  await page.click('[data-el="edit-pool-button"]');
  await page.click('[data-el="pool-cell-attribute"] .cell-p');
  await page.click('[data-el="pool-cell-gear"] .cell-p');
  await page.click('[data-el="pool-cell-stress"] .cell-p');
  await page.click('[data-el="roll-button"]');
  await page.waitForSelector('.die', { timeout: 15000 });
  await openSheet(page);
  const diceReadings = [];
  for (const id of NAMES) {
    await chooseThemeRow(page, id);
    for (const [type, prefix] of [
      ['attribute', 'die-at'],
      ['gear', 'die-ge'],
      ['stress', 'die-st'],
    ]) {
      diceReadings.push({
        id,
        type,
        read: await paintOf(page, `[data-el^="${prefix}"] .die`, 'backgroundColor'),
        wanted: asRgb(themes.DICE_THEMES[id][type]),
      });
    }
  }
  const diceWrong = diceReadings.filter((each) => each.read !== each.wanted);
  const distinct = new Set(diceReadings.map((each) => each.read)).size;
  console.log(
    `browser: theme dice_readings=${diceReadings.length} wrong=${diceWrong.length} ` +
      `distinct=${distinct}`,
  );
  checks.push({
    name: 'theme.one-id-reaches-the-dice',
    ok:
      diceReadings.length === NAMES.length * 3 &&
      diceWrong.length === 0 &&
      distinct === NAMES.length * 3,
    detail:
      `${diceReadings.length} bodies were read off the dice on the table, against a product of ` +
      `${NAMES.length} rows by 3 dice types. ${diceWrong.length} disagreed: ` +
      `[${diceWrong.map((each) => `${each.id} ${each.type} drew ${each.read} against ${each.wanted}`).join('; ')}]. ` +
      `The ${distinct} readings are all different, so one colour on every die could not pass.`,
  });

  // ---- 3. The same id reaches the 3D dice, without throwing them again. ----
  //
  // The materials are read off the tray through the seam `src/shell/table.tsx`
  // publishes, and the throw counter is read with them: a repaint that threw the
  // pool again would move it, and the dice would land somewhere else under the
  // player's hand.
  await chooseThemeRow(page, 'ash');
  await page.evaluate(() => {
    const box = document.querySelector('[data-el="sheet-tray-renderer"] input');
    if (box !== null && !box.checked) box.click();
  });
  await closeSheet(page);
  const tableRan = await page
    .waitForFunction(() => window.__clatterTable?.box != null, { timeout: 20000 })
    .then(() => true)
    .catch(() => false);
  if (!tableRan) {
    const why =
      'the 3D table did not mount, so no material could be read. A sandboxed run gets no ' +
      'WebGL context at all.';
    console.log(`browser: theme table NOT JUDGED, ${why}`);
    checks.push({
      name: 'theme.one-id-repaints-the-3d-dice',
      ok: true,
      skipped: true,
      detail: `NOT JUDGED: ${why}`,
    });
  } else {
    await page.click('[data-el="roll-button"]');
    await page.waitForFunction(() => window.__clatterTable?.busy === false, { timeout: 30000 });
    const threwAt = await page.evaluate(() => window.__clatterTable?.throws ?? -1);
    const painted = [];
    for (const id of NAMES) {
      await openSheet(page);
      await chooseThemeRow(page, id);
      await closeSheet(page);
      const read = await page.evaluate(() => {
        const seam = window.__clatterTable;
        if (seam?.box == null) return null;
        return seam.ordered.map((die, at) => ({
          type: die.type,
          hex: `#${seam.box.diceList[at]?.material?.[0]?.color?.getHexString()?.toUpperCase()}`,
        }));
      });
      painted.push({
        id,
        read: read ?? [],
        throws: await page.evaluate(() => window.__clatterTable?.throws ?? -1),
      });
    }
    const wrongPaint = [];
    let bodies = 0;
    for (const each of painted) {
      for (const die of each.read) {
        if (die.hex !== themes.DICE_THEMES[each.id][die.type].toUpperCase()) {
          wrongPaint.push(`${each.id} ${die.type} is ${die.hex}`);
        }
        bodies += 1;
      }
    }
    const rethrew = painted.filter((each) => each.throws !== threwAt);
    console.log(
      `browser: theme table bodies=${bodies} wrong=${wrongPaint.length} ` +
        `throws=${threwAt} rethrew=${rethrew.length}`,
    );
    checks.push({
      name: 'theme.one-id-repaints-the-3d-dice',
      ok: bodies >= NAMES.length && wrongPaint.length === 0 && rethrew.length === 0,
      detail:
        `${bodies} die materials were read off the tray through the seam, over ${NAMES.length} ` +
        `rows, and ${wrongPaint.length} disagreed with the row [${wrongPaint.join('; ')}]. The ` +
        `tray stayed at ${threwAt} throws through all six, so the dice were repainted where they ` +
        `lay and never thrown again.`,
    });
    // Back to the flat dice for the readings below. The control is on the
    // sheet, so the sheet has to be open before the press.
    await openSheet(page);
    await page.evaluate(() => {
      const box = document.querySelector('[data-el="sheet-tray-renderer"] input');
      if (box !== null && box.checked) box.click();
    });
    await closeSheet(page);
  }

  // ---- 4. Every contrast claim still holds, once the palette is spent. ----
  //
  // The flat renderer draws every role as a real element on a real ground. Over
  // the 3D table the two zone bands lie on the canvas, which is a sibling and
  // not an ancestor, so an ancestor walk would measure them against the page and
  // report a ratio that means nothing. The readout over the tray is measured
  // here through `table-note`, which is a child of the element the tray surface
  // paints.
  await openSheet(page);
  let measured = 0;
  let tightest = { ratio: Infinity, said: '' };
  let tightestMean = { ratio: Infinity, said: '' };
  const absent = [];
  const under = [];
  const underPixel = [];
  let pixelUnmeasured = 0;
  const worstPerRole = new Map();
  for (const id of NAMES) {
    await chooseThemeRow(page, id);
    await closeSheet(page);
    const paints = await readPaints(page, ROLE_PROBES);
    // Every element a claim of this theme depends on, tagged once and read off
    // the pixels the browser drew. The ink is a span as well wherever the ink
    // IS a ground — a mark, a filled button — because the grain moved those too.
    const tagged = await tagRoleSurfaces(page, ROLE_PROBES);
    const spans = tagged.names.length === 0 ? [] : await readPaintedSpans(page, tagged.names);
    const spanOf = new Map((spans ?? []).map((one) => [one.selector, one]));
    for (const [at, paint] of paints.entries()) {
      if (paint.missing) {
        absent.push(`${id}: ${paint.name}`);
        continue;
      }
      const groundSpan = spanOf.get(tagged.probes[at]?.ground ?? '');
      const inkSpan = spanOf.get(tagged.probes[at]?.ink ?? '') ?? null;
      const inkY = luminanceOfRgb(paint.ink);
      const ink = inkSpan ?? { min: inkY, max: inkY };
      const ground = groundSpan ?? { min: null, max: null };
      const ratio = worstSpanRatio(ink, ground);
      const mean = ratioOfRgb(paint.ink, paint.ground);
      // **The GATE stays the claim WCAG states.** SC 1.4.3 and SC 1.4.11 pair
      // one foreground colour with one background colour, and the resolved
      // ground is that colour. The worst pixel of a grained ground is a
      // different quantity and WCAG names no floor for it, so it is measured
      // and reported here and it gates nothing. Inventing a floor for it would
      // be this file choosing a number the owner never set.
      if (mean === null || mean < paint.floor) {
        under.push(
          `${id}: ${paint.name} reads ${mean === null ? 'nothing' : mean.toFixed(3)} to 1 ` +
            `against ${paint.ground} and must reach ${paint.floor}`,
        );
      }
      if (ratio === null) pixelUnmeasured += 1;
      else if (ratio < paint.floor) {
        underPixel.push(
          `${id}: ${paint.name} reads ${ratio.toFixed(3)} to 1 on its worst pixel pair ` +
            `against a floor of ${paint.floor}, where the resolved pair reads ` +
            `${mean === null ? 'nothing' : mean.toFixed(3)}`,
        );
      }
      const held = worstPerRole.get(paint.name);
      if (ratio !== null && (held === undefined || ratio < held.ratio)) {
        worstPerRole.set(paint.name, { ratio, id, floor: paint.floor, mean });
      }
      if (ratio !== null && ratio < tightest.ratio) {
        tightest = { ratio, said: `${id} ${paint.name}` };
      }
      if (mean !== null && mean < tightestMean.ratio) {
        tightestMean = { ratio: mean, said: `${id} ${paint.name}` };
      }
      measured += 1;
    }
    await page.evaluate(() => {
      for (const one of document.querySelectorAll('[data-grain-role]')) {
        one.removeAttribute('data-grain-role');
      }
    });
    await openSheet(page);
  }
  console.log(
    `browser: theme contrast measured=${measured} absent=${absent.length} ` +
      `under=${under.length} tightest_resolved=${tightestMean.ratio.toFixed(3)} ` +
      `(${tightestMean.said}) tightest_pixel=${tightest.ratio.toFixed(3)} (${tightest.said}) ` +
      `under_on_worst_pixel=${underPixel.length} pixel_unmeasured=${pixelUnmeasured} ` +
      `REPORTED AND NOT GATED`,
  );
  for (const [role, held] of [...worstPerRole].sort((one, two) => one[1].ratio - two[1].ratio)) {
    console.log(
      `browser: theme contrast worst-pixel ${role}: ${held.ratio.toFixed(3)} to 1 on ${held.id}, ` +
        `floor ${held.floor}, resolved pair ${held.mean === null ? 'none' : held.mean.toFixed(3)}` +
        `${held.ratio < held.floor ? ' UNDER THE FLOOR' : ''}`,
    );
  }
  checks.push({
    name: 'theme.every-contrast-claim-holds-on-the-rendered-screen',
    ok: measured === NAMES.length * ROLE_PROBES.length && absent.length === 0 && under.length === 0,
    detail:
      `${measured} readings against a product of ${NAMES.length} interface palettes by ` +
      `${ROLE_PROBES.length} roles the screen paints. Every ink came off the rendered element ` +
      `and every ground off the first ancestor that really paints one. ${absent.length} roles ` +
      `were not on the screen [${absent.join('; ')}] and ${under.length} missed a floor ` +
      `[${under.join('; ')}]. The tightest reading is ${tightestMean.ratio.toFixed(3)} to 1 on ` +
      `${tightestMean.said}, against 4.5 for text and 3 for a graphical object, which are WCAG ` +
      `2.2 SC 1.4.3 and SC 1.4.11. ` +
      `**The grain made every ground a distribution, and that is measured beside this.** Each ` +
      `claim is read a second time off the pixels the browser drew, pairing the two ends that ` +
      `face each other, and ${underPixel.length} of the ${measured} fall under their floor that ` +
      `way while ${pixelUnmeasured} paint no pixel to read. That reading is REPORTED AND NOT ` +
      `GATED: WCAG pairs one foreground colour with one background colour and names no floor ` +
      `for the worst pixel of a texture, so a gate on it would be a number this file chose. ` +
      `The worst per role is printed above. [${underPixel.join('; ')}]`,
  });

  // ---- 5. Keyboard alone reaches every control, and changes the screen. ----
  //
  // **The group floor is re-derived, not nudged.** Unit 4.8 set it at 5 for
  // three axes plus the builder plus the mode set. The theme collapse re-derived
  // it to 3 for three inner groups. Unit 4.11 then took the rows legend away, so
  // the panel held one fewer and the constant read one too many and went red on
  // `main` — a probe constant left uncalibrated by a change to what it counts.
  //
  // So it is a LIST of the grouped controls the panel holds, and not a count.
  // `sheet-theme` is itself a fieldset and `querySelectorAll` does not answer
  // with the element it was called on, so only the inner groups are named here:
  // the colour builder and the page mode. The six rows are a radio set inside
  // the panel's own legend and carry no fieldset of their own. A group that
  // disappears is named in the failure rather than counted away.
  const THEME_PANEL_GROUPS = ['theme-builder', 'theme-mode'];
  await chooseThemeRow(page, 'ash');
  const walk = await page.evaluate(() => {
    const panel = document.querySelector('[data-el="sheet-theme"]');
    if (panel === null) return { stops: [], unnamed: [], groups: 0, stateless: [] };
    const nameOf = (each) => {
      const aria = each.getAttribute('aria-label');
      if (aria !== null && aria.length > 0) return aria;
      const inside = (each.closest('label')?.textContent ?? '').trim();
      if (inside.length > 0) return inside;
      const named = each.id === '' ? null : document.querySelector(`label[for="${each.id}"]`);
      const outside = (named?.textContent ?? '').trim();
      return outside.length > 0 ? outside : (each.textContent ?? '').trim();
    };
    const stops = [...panel.querySelectorAll('input, button')]
      .filter((each) => each.tabIndex >= 0 && !each.disabled)
      .map((each) => ({
        role: each.tagName === 'BUTTON' ? 'button' : each.type,
        name: nameOf(each),
        state:
          each.type === 'radio' || each.type === 'checkbox' ? String(each.checked) : each.value,
      }));
    return {
      stops,
      unnamed: stops.filter((each) => each.name.length === 0).map((each) => each.role),
      stateless: stops.filter((each) => each.state === undefined || each.state === null).length,
      groups: panel.querySelectorAll('fieldset').length,
      // The grouped controls the panel holds, by name, so the floor below is a
      // list of things and not a bare number.
      named: [...panel.querySelectorAll('fieldset')].map(
        (each) => each.getAttribute('data-el') ?? 'unnamed',
      ),
    };
  });

  const missingGroups = THEME_PANEL_GROUPS.filter((one) => !(walk.named ?? []).includes(one));

  // A real key press on a real control, and the page has to answer it.
  const before = await paintOf(page, '.screen', 'backgroundColor');
  const from = await page.evaluate(() => {
    const input = document.querySelector('[data-el="theme-rows"] input:checked');
    input?.focus();
    return document.activeElement?.getAttribute('value') ?? null;
  });
  await page.keyboard.press('ArrowDown');
  const after = await paintOf(page, '.screen', 'backgroundColor');
  const to = await page.evaluate(
    () =>
      document.querySelector('[data-el="theme-rows"] input:checked')?.getAttribute('value') ?? null,
  );
  const short = await page.evaluate((floor) => {
    const panel = document.querySelector('[data-el="sheet-theme"]');
    if (panel === null) return ['the panel is not on the screen'];
    return [...panel.querySelectorAll('label, button')]
      .map((each) => ({ el: each, box: each.getBoundingClientRect() }))
      .filter((each) => each.box.height > 0 && each.box.height < floor)
      .map((each) => `${(each.el.textContent ?? '').trim().slice(0, 24)}: ${each.box.height}px`);
  }, HIT_TARGET_FLOOR);
  console.log(
    `browser: theme keyboard stops=${walk.stops.length} unnamed=${walk.unnamed.length} ` +
      `groups=${walk.groups} [${(walk.named ?? []).join(', ')}] missing=${missingGroups.length} ` +
      `arrow=${from}->${to} page=${before}->${after} short=${short.length}`,
  );
  checks.push({
    name: 'theme.keyboard-alone-reaches-and-operates-every-control',
    ok:
      walk.stops.length > 0 &&
      walk.unnamed.length === 0 &&
      walk.stateless === 0 &&
      missingGroups.length === 0 &&
      walk.groups >= THEME_PANEL_GROUPS.length &&
      from !== null &&
      to !== null &&
      to !== from &&
      before !== after &&
      short.length === 0,
    detail:
      `${walk.stops.length} controls, ${walk.unnamed.length} of them without an accessible name ` +
      `[${walk.unnamed.join(', ')}], in ${walk.groups} groups [${(walk.named ?? []).join(', ')}] against the ${THEME_PANEL_GROUPS.length} the panel must hold [${THEME_PANEL_GROUPS.join(', ')}], ${missingGroups.length} of them missing [${missingGroups.join(', ')}], and ${walk.stateless} without a ` +
      `state. One arrow key on the theme group moved the choice from ${from} to ${to} and ` +
      `the page colour from ${before} to ${after}, so the keyboard alone changes the theme. ` +
      `${short.length} hit targets sit under the ${HIT_TARGET_FLOOR} px floor of WCAG 2.2 ` +
      `SC 2.5.8 [${short.join('; ')}].`,
  });

  // ---- 6. The report names every reading a built theme misses. ----
  //
  // The oracle is the two checkers, run IN NODE over the same seeds, so the
  // report is compared against an answer the screen did not produce.
  const badPage = '#1B2431';
  const badDice = '#050505';
  // The oracle judges against ONE tray surface, so the theme that owns that
  // surface is chosen back first. One id moves the table as well as the page,
  // and the keyboard walk above left the choice on another row.
  await chooseThemeRow(page, 'ash');
  const surface = themes.TRAY_SURFACES.ash;
  await typeSeed(page, 'theme-page-seed', badPage);
  await typeSeed(page, 'theme-dice-seed', badDice);
  await page.evaluate(() => {
    document.querySelector('[data-el="theme-exact-dice"] input')?.click();
  });
  const beforeApply = await paintOf(page, '.screen', 'backgroundColor');
  await page.click('[data-el="theme-apply"]');
  const report = await page.evaluate(
    () => document.querySelector('[data-el="theme-report"]')?.textContent ?? '',
  );
  const fromPalette = builder.checkPalette(builder.derivePalette(badPage, 'dark'), [surface]);
  const fromDice = builder.checkDiceTheme(builder.deriveDiceTheme(badDice, true), [surface]);
  const oracle = [...fromPalette, ...fromDice];
  const unsaid = oracle.filter((finding) => !report.includes(builder.findingSentence(finding)));
  const afterApply = await paintOf(page, '.screen', 'backgroundColor');
  console.log(
    `browser: theme report findings=${oracle.length} palette=${fromPalette.length} ` +
      `dice=${fromDice.length} unsaid=${unsaid.length} page=${beforeApply}->${afterApply}`,
  );
  checks.push({
    name: 'theme.a-colour-the-builder-cannot-use-is-reported-by-name',
    ok:
      oracle.length > 0 &&
      fromPalette.length > 0 &&
      fromDice.length > 0 &&
      unsaid.length === 0 &&
      report.includes(String(oracle.length)) &&
      afterApply === beforeApply,
    detail:
      `the two checkers answered ${oracle.length} findings IN NODE over the same seeds — ` +
      `${fromPalette.length} from checkPalette and ${fromDice.length} from checkDiceTheme — and ` +
      `the report on the screen names ${oracle.length - unsaid.length} of them by name. Unsaid: ` +
      `[${unsaid.map((each) => each.pair).join('; ')}]. The page stayed ${afterApply}, so the ` +
      `colour is reported and never replaced, and nothing is applied while a finding stands.`,
  });

  // ---- 7. A theme a player built survives a real reload. ----
  const goodPage = '#3CBFA5';
  const goodDice = '#FF8B68';
  await page.evaluate(() => {
    document.querySelector('[data-el="theme-exact-dice"] input')?.click();
  });
  await typeSeed(page, 'theme-page-seed', goodPage);
  await typeSeed(page, 'theme-dice-seed', goodDice);
  await page.click('[data-el="theme-apply"]');
  const built = builder.derivePalette(goodPage, 'dark');
  const builtPage = await paintOf(page, '.screen', 'backgroundColor');
  const stored = await page.evaluate(() => localStorage.getItem('clatter.settings'));
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('[data-el="disclosure-toggle"]', { timeout: 30000 });
  const afterReload = await paintOf(page, '.screen', 'backgroundColor');
  const trayAfter = await paintOf(page, '[data-el="dice-table"]', 'backgroundColor');
  const heldSeeds = /"builtTheme":\{[^}]*\}/.exec(stored ?? '')?.[0] ?? 'nothing';
  console.log(
    `browser: theme built page=${builtPage} after_reload=${afterReload} ` +
      `wanted=${asRgb(built.background)} tray=${trayAfter} stored=${heldSeeds}`,
  );
  checks.push({
    name: 'theme.a-built-theme-survives-a-reload',
    ok:
      builtPage === asRgb(built.background) &&
      afterReload === builtPage &&
      trayAfter === asRgb(themes.TRAY_SURFACES.ash) &&
      (stored ?? '').includes(goodPage) &&
      (stored ?? '').includes(goodDice),
    detail:
      `the page drew ${builtPage} against ${asRgb(built.background)}, which derivePalette built ` +
      `IN NODE from the same seed, and it drew ${afterReload} after a real reload. The tray is ` +
      `${trayAfter} against the shipped row ${asRgb(themes.TRAY_SURFACES.ash)}, because a built ` +
      `theme replaces the dice and the page and never the table. The record crossed the reload ` +
      `as ${heldSeeds} in the page's own localStorage, and it holds the two SEEDS rather than ` +
      `the colours, so the colours are derived again on every read.`,
  });

  // ---- 9. Every ground the stylesheet paints is covered, or says why. ----
  await runGroundCoverage(page, checks, options);

  // ---- The captures. A green suite is blind to a screen that looks wrong. ----
  if (options.captureShell !== null) {
    // The run ends on a reloaded page carrying the built theme, so the built
    // theme is cleared first. Without this every capture is the same image and
    // a capture that cannot differ proves nothing.
    await openSheet(page);
    await page.click('[data-el="theme-clear"]');
    await closeSheet(page);
    // A pool on the table, so the captures show the screen a player reads
    // rather than an empty builder.
    await page.click('[data-el="pool-cell-attribute"] .cell-p');
    await page.click('[data-el="pool-cell-skill"] .cell-p');
    await page.click('[data-el="pool-cell-gear"] .cell-p');
    await page.click('[data-el="pool-cell-stress"] .cell-p');
    await page.click('[data-el="roll-button"]');
    await page.waitForSelector('.die', { timeout: 15000 });
    // The whole application in every interface palette, at the wide width.
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    for (const id of NAMES) {
      await openSheet(page);
      await chooseThemeRow(page, id);
      await closeSheet(page);
      await new Promise((done) => setTimeout(done, 200));
      writeFileSync(
        join(options.captureShell, `0019-theme-${id}-1440.png`),
        await page.screenshot({ type: 'png' }),
      );
    }
    // The panel itself, at both widths.
    await openSheet(page);
    await chooseThemeRow(page, 'ash');
    for (const width of [360, 1440]) {
      await page.setViewport({ width, height: width === 360 ? 760 : 900, deviceScaleFactor: 1 });
      await page.evaluate(() => {
        document.querySelector('[data-el="sheet-theme"]')?.scrollIntoView({ block: 'start' });
      });
      await new Promise((done) => setTimeout(done, 200));
      writeFileSync(
        join(options.captureShell, `0019-theme-panel-${width}.png`),
        await page.screenshot({ type: 'png' }),
      );
      await page.evaluate(() => {
        document.querySelector('[data-el="theme-builder"]')?.scrollIntoView({ block: 'end' });
      });
      await new Promise((done) => setTimeout(done, 200));
      writeFileSync(
        join(options.captureShell, `0019-theme-builder-${width}.png`),
        await page.screenshot({ type: 'png' }),
      );
    }
    // The open sheet on the two rows a grain reads differently on — Unit 4.12.
    // The panel above is captured on one row, which said nothing about how a
    // texture lands on a light ground. `bone` is the one light row, and the
    // default is the row a player meets first.
    for (const id of [settings.DEFAULT_SETTINGS.themeId, 'bone']) {
      await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
      await openSheet(page);
      await chooseThemeRow(page, id);
      await page.evaluate(() => {
        document.querySelector('[data-el="sheet-theme"]')?.scrollIntoView({ block: 'start' });
      });
      await new Promise((done) => setTimeout(done, 200));
      writeFileSync(
        join(options.captureShell, `0022-grain-panel-${id}-1440.png`),
        await page.screenshot({ type: 'png' }),
      );
      await closeSheet(page);
      await new Promise((done) => setTimeout(done, 200));
      writeFileSync(
        join(options.captureShell, `0022-grain-page-${id}-1440.png`),
        await page.screenshot({ type: 'png' }),
      );
    }
    console.log(`browser: theme captures written to ${options.captureShell}`);
  }
}

async function runSheet(page, options, checks) {
  // The run starts from the defaults, so nothing an earlier run stored decides
  // what this one reads.
  await page.evaluate(() => {
    try {
      localStorage.clear();
    } catch {
      // A browser that refuses storage answers the defaults anyway.
    }
  });
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('[data-el="disclosure-toggle"]', { timeout: 30000 });

  // ---- 1. A change of rules clears the table. Decision 10. ----
  for (let press = 0; press < 3; press += 1) {
    await page.click('[data-el="pool-cell-attribute"] .cell-p');
  }
  await page.click('[data-el="roll-button"]');
  const thrown = await diceOnTable(page);
  await openSheet(page);
  const opening = await readSheet(page);
  const chosen = opening.ruleset.find((each) => each.state === 'false');
  await page.click(`[data-el="sheet-ruleset"] input:not(:checked)`);
  const afterChange = await diceOnTable(page);
  const builder = await page.evaluate(
    () => document.querySelector('[data-el="pool-builder"]') !== null,
  );
  console.log(
    `browser: sheet cleared thrown=${thrown} after_change=${afterChange} ` +
      `builder_open=${builder} chose="${chosen === undefined ? 'nothing' : chosen.name}"`,
  );
  checks.push({
    name: 'sheet.a-change-of-rules-clears-the-table',
    ok: thrown > 0 && afterChange === 0 && builder,
    detail:
      `the table held ${thrown} dice, and it holds ${afterChange} after the rule set changed. ` +
      `The builder is ${builder ? 'open' : 'closed'}, and it must be open, because an empty ` +
      `table belongs to rest A. A roll on the table is never priced again under new rules: ` +
      `Decision 10 of docs/design/0012-settled-decisions.md.`,
  });

  // ---- 2. Every control carries a role, a name and a state. ----
  const named = await readSheet(page);
  const controls = [...named.ruleset, ...named.curve, ...named.rows.flatMap((row) => row.controls)];
  const unnamed = controls.filter((each) => each.name.length === 0);
  const checkedRuleset = named.ruleset.filter((each) => each.state === 'true');
  const checkedCurve = named.curve.filter((each) => each.state === 'true');
  console.log(
    `browser: sheet controls=${controls.length} unnamed=${unnamed.length} ` +
      `ruleset=${named.ruleset.length} checked=${checkedRuleset.length} ` +
      `curve=${named.curve.length} checked=${checkedCurve.length} rows=${named.rows.length}`,
  );
  checks.push({
    name: 'sheet.every-control-carries-a-role-a-name-and-a-state',
    ok:
      controls.length > 0 &&
      unnamed.length === 0 &&
      named.ruleset.length > 1 &&
      checkedRuleset.length === 1 &&
      named.curve.length === 2 &&
      checkedCurve.length === 1 &&
      named.rows.length > 0,
    detail:
      `${controls.length} controls, ${unnamed.length} of them without an accessible name. ` +
      `The rule set holds ${named.ruleset.length} choices with ${checkedRuleset.length} ` +
      `chosen, the artifact curve holds ${named.curve.length} with ${checkedCurve.length} ` +
      `chosen, and the panel holds ${named.rows.length} rows. ` +
      `Unnamed: [${unnamed.map((each) => each.role).join(', ')}].`,
  });

  // ---- 3. The panel is the record's shape, whichever preset is chosen. ----
  //
  // One shape, four presets. The row list must not change with the preset, and
  // the values must, or the panel is not reading the preset at all.
  const shapes = [];
  for (let index = 0; index < named.ruleset.length; index += 1) {
    await page.evaluate((at) => {
      const inputs = [...document.querySelectorAll('[data-el="sheet-ruleset"] input')];
      inputs[at]?.click();
    }, index);
    const held = await readSheet(page);
    shapes.push({
      fields: held.rows.map((row) => row.field).join(','),
      values: held.rows.map((row) => row.controls.map((each) => each.state).join('/')).join(','),
    });
  }
  const oneShape = new Set(shapes.map((each) => each.fields));
  const values = new Set(shapes.map((each) => each.values));
  console.log(
    `browser: sheet presets=${shapes.length} shapes=${oneShape.size} value_sets=${values.size}`,
  );
  checks.push({
    name: 'sheet.the-panel-follows-the-preset-and-keeps-its-shape',
    ok: shapes.length > 1 && oneShape.size === 1 && values.size === shapes.length,
    detail:
      `${shapes.length} presets drew ${oneShape.size} row list and ${values.size} different ` +
      `sets of values. The row list is the shape of the profile record and does not follow ` +
      `the preset. The values do, so a panel that ignored the preset would read one value set.`,
  });

  // ---- 4. Every choice survives a real reload. ----
  const wanted = { ruleset: 1, curve: 1 };
  await page.evaluate((at) => {
    [...document.querySelectorAll('[data-el="sheet-ruleset"] input')][at]?.click();
  }, wanted.ruleset);
  await page.evaluate((at) => {
    [...document.querySelectorAll('[data-el="sheet-artifact-curve"] input')][at]?.click();
  }, wanted.curve);
  // One override, taken off the panel rather than named here: the first row
  // that draws a checkbox.
  const toggled = await page.evaluate(() => {
    const row = [...document.querySelectorAll('[data-el="sheet-overrides"] [data-field]')].find(
      (each) => each.dataset.kind === 'toggle',
    );
    const input = row?.querySelector('input');
    input?.click();
    return row?.dataset.field ?? null;
  });
  const before = await readSheet(page);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('[data-el="disclosure-toggle"]', { timeout: 30000 });
  await openSheet(page);
  const after = await readSheet(page);
  const sameRuleset =
    before.ruleset.map((each) => each.state).join(',') ===
    after.ruleset.map((each) => each.state).join(',');
  const sameCurve =
    before.curve.map((each) => each.state).join(',') ===
    after.curve.map((each) => each.state).join(',');
  const changedRows = (held) =>
    held.rows
      .filter((row) => row.changed)
      .map((row) => row.field)
      .join(',');
  console.log(
    `browser: sheet reload override=${toggled} before_changed=[${changedRows(before)}] ` +
      `after_changed=[${changedRows(after)}] stored_bytes=${(after.stored ?? '').length}`,
  );
  checks.push({
    name: 'sheet.every-choice-survives-a-reload',
    ok:
      toggled !== null &&
      sameRuleset &&
      sameCurve &&
      changedRows(before) === toggled &&
      changedRows(after) === toggled &&
      after.reset.disabled === false,
    detail:
      `the rule set read back ${sameRuleset ? 'the same' : 'DIFFERENTLY'}, the curve read back ` +
      `${sameCurve ? 'the same' : 'DIFFERENTLY'}, and the override on ${toggled} is marked as ` +
      `a change before the reload ([${changedRows(before)}]) and after it ` +
      `([${changedRows(after)}]). The record crossed the reload as ` +
      `${(after.stored ?? '').length} bytes of the page's own localStorage.`,
  });

  // ---- 5. The panel is usable on a phone. ----
  await closeSheet(page);
  await page.setViewport({ width: 360, height: 760, deviceScaleFactor: 1 });
  await openSheet(page);
  const phone = await readSheet(page);
  const phoneControls = [
    ...phone.ruleset,
    ...phone.curve,
    ...phone.rows.flatMap((row) => row.controls),
  ];
  const short = phoneControls.filter(
    (each) => each.height < HIT_TARGET_FLOOR || each.width < HIT_TARGET_FLOOR,
  );
  const reachable = await page.evaluate(() => {
    const close = document.querySelector('[data-el="sheet-close"]');
    if (close === null) return false;
    close.scrollIntoView({ block: 'end' });
    const box = close.getBoundingClientRect();
    return box.top >= 0 && box.bottom <= window.innerHeight + 1 && box.height >= 24;
  });
  console.log(
    `browser: sheet phone controls=${phoneControls.length} under_floor=${short.length} ` +
      `document_width=${phone.documentWidth} viewport=${phone.viewportWidth} ` +
      `sheet_scrolls=${phone.sheetScrolls} close_reachable=${reachable}`,
  );
  checks.push({
    name: 'sheet.the-panel-is-usable-at-360-px',
    ok:
      phoneControls.length > 0 &&
      short.length === 0 &&
      phone.documentWidth <= phone.viewportWidth &&
      reachable,
    detail:
      `${phoneControls.length} hit targets, ${short.length} under the ${HIT_TARGET_FLOOR} px ` +
      `floor of WCAG 2.2 SC 2.5.8 ` +
      `[${short.map((each) => `${each.name}: ${each.width}x${each.height}px`).join('; ')}]. ` +
      `A target is the label a press lands on, and the shortest one measures ` +
      `${Math.min(...phoneControls.map((each) => each.height))} px. ` +
      `The document is ${phone.documentWidth} px wide against a viewport of ` +
      `${phone.viewportWidth}, so nothing is off the side. The sheet ` +
      `${phone.sheetScrolls ? 'scrolls' : 'does not scroll'} and the close button is ` +
      `${reachable ? 'reachable' : 'NOT reachable'}: the layout degrades by scrolling and ` +
      `never by clipping.`,
  });

  // ---- 5b. The desktop dialog is not the phone sheet made wider. ----
  //
  // The owner's complaint was that the options are too narrow on a desktop and
  // badly grouped. Both halves are geometry, so both are measured on the
  // rendered screen at two widths rather than read off the stylesheet.
  //
  // The phone half of the claim is measured in the same breath: the bottom
  // sheet has to stay a bottom sheet, in one column, sitting on the bottom
  // edge of the viewport.
  await closeSheet(page);
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await openSheet(page);
  const wide = await readSheetLayout(page);
  await closeSheet(page);
  await page.setViewport({ width: 360, height: 760, deviceScaleFactor: 1 });
  await openSheet(page);
  const narrow = await readSheetLayout(page);
  const wideColumns = new Set(wide.groups.map((each) => each.left)).size;
  const narrowColumns = new Set(narrow.groups.map((each) => each.left)).size;
  const widePairs = sideBySide(wide);
  const narrowPairs = sideBySide(narrow);
  // The share of the screen the dialog takes. A claim about the WIDTH cannot
  // be a number copied out of the stylesheet, so it is a proportion of the
  // window the dialog was given.
  const wideShare = wide.width / wide.viewportWidth;
  // Centred, said as a measurement rather than as a word: the room above the
  // dialog equals the room below it. A bottom sheet has room above and none
  // below, so it cannot pass this by standing tall enough to reach the top.
  const wideOffCentre = Math.abs(wide.top - (wide.viewportHeight - wide.bottom));
  console.log(
    `browser: sheet layout 1440=[width=${wide.width} share=${wideShare.toFixed(2)} ` +
      `top=${wide.top} off_centre=${wideOffCentre} groups=${wide.groups.length} ` +
      `columns=${wideColumns} ` +
      `side_by_side=${widePairs}] 360=[width=${narrow.width} top=${narrow.top} ` +
      `bottom=${narrow.bottom} of ${narrow.viewportHeight} groups=${narrow.groups.length} ` +
      `columns=${narrowColumns} side_by_side=${narrowPairs}]`,
  );
  for (const group of wide.groups) {
    console.log(`browser: sheet layout 1440 ${group.name} left=${group.left} top=${group.top}`);
  }
  // One category stands in the left column and every other one stacks in the
  // right, so the tall one is beside each of the rest and nothing else is
  // beside anything. That is one pair per category less the tall one, and it
  // is the arrangement the tab order depends on: reading down the left column
  // and then the right is the document order only while the split is that one.
  // A positive count is not enough. A row span of two leaves three pairs, puts
  // a category from the foot of the document at the head of the left column,
  // and parts the reading order from the tab order while still reading
  // "some pairs are side by side".
  const wantedPairs = wide.groups.length - 1;
  // Said in words that follow the numbers, because a failure is read under
  // pressure and a fixed sentence would report the layout it was written for.
  const phoneHolds =
    narrowColumns === 1 && narrowPairs === 0 && narrow.bottom >= narrow.viewportHeight - 1;
  checks.push({
    name: 'sheet.the-desktop-dialog-lays-its-categories-in-columns-and-the-phone-does-not',
    ok:
      wide.groups.length >= 4 &&
      wide.groups.length === narrow.groups.length &&
      wideColumns === 2 &&
      widePairs === wantedPairs &&
      wideShare >= 0.5 &&
      wideOffCentre <= 2 &&
      phoneHolds,
    detail:
      `at 1440 the dialog measures ${wide.width} px, which is ${(wideShare * 100).toFixed(0)} ` +
      `per cent of the window against a floor of 50, and its ${wide.groups.length} categories ` +
      `stand at ${wideColumns} different left edges with ${widePairs} pairs of them side by ` +
      `side against the ${wantedPairs} one column beside a stack of the rest makes. It ` +
      `leaves ${wide.top} px above it and ${wide.viewportHeight - wide.bottom} px below it, ` +
      `so it is ${wideOffCentre} px off centre against a bound of 2. At ` +
      `360 the same ${narrow.groups.length} categories measure ${narrow.width} px at ` +
      `${narrowColumns} left edge with ${narrowPairs} pairs side by side, and the sheet bottom ` +
      `is at ${narrow.bottom} of ${narrow.viewportHeight} px, so ` +
      `${phoneHolds ? 'the phone still meets a bottom sheet in one column' : 'THE PHONE NO LONGER MEETS A BOTTOM SHEET IN ONE COLUMN'}` +
      `. Every number is a laid-out rectangle and none is read off the CSS.`,
  });

  // ---- 5c. The sheet opens at its own top, at both widths. ----
  //
  // The way out is the last child of the sheet, and the sheet takes the focus
  // when it opens. A browser asked to focus an element scrolls it into view,
  // so the player met the foot of the dialog before its first setting. Both
  // readings above were taken straight after `openSheet` and before anything
  // scrolled, so each one is the offset a player opens on.
  //
  // The denominator is the scroll itself: a sheet whose content fits its box
  // reads zero whatever the focus does, so a run that could not scroll proves
  // nothing and fails here instead.
  const scrolls = (layout) => layout.scrollHeight > layout.clientHeight;
  console.log(
    `browser: sheet opening_scroll 1440=[scroll_top=${wide.scrollTop} ` +
      `content=${wide.scrollHeight} box=${wide.clientHeight}] 360=[scroll_top=${narrow.scrollTop} ` +
      `content=${narrow.scrollHeight} box=${narrow.clientHeight}]`,
  );
  checks.push({
    name: 'sheet.opens-at-its-own-top-and-not-at-the-way-out',
    ok:
      scrolls(wide) &&
      scrolls(narrow) &&
      wide.scrollTop === 0 &&
      narrow.scrollTop === 0 &&
      // The first category has to start inside the box, or the sheet opened
      // somewhere else by a route the offset above cannot see.
      wide.groups[0].top >= wide.top &&
      narrow.groups[0].top >= narrow.top,
    detail:
      `the sheet opened at ${wide.scrollTop} px of its own scroll at 1440 and at ` +
      `${narrow.scrollTop} px at 360. It holds ${wide.scrollHeight} px of content in a ` +
      `${wide.clientHeight} px box at 1440 and ${narrow.scrollHeight} in ${narrow.clientHeight} ` +
      `at 360, so it scrolls at both widths and a reading of zero is a fact about the opening ` +
      `and not about a sheet that fits. The first category starts at ${wide.groups[0].top} px ` +
      `against a sheet top of ${wide.top} at 1440, and at ${narrow.groups[0].top} against ` +
      `${narrow.top} at 360.`,
  });

  // ---- 6. A saved pool goes in, comes back, and crosses a reload. ----
  //
  // The viewport is 360 px from here on, because the phone is the case that
  // fails first and every press below is a press a phone has to answer.
  await closeSheet(page);
  await pressTile(page, 'attribute', 'p', 3);
  await pressTile(page, 'gear', 'p', 2);
  await pressTile(page, 'artifact', 'p', 4);
  const poolA = await readTiles(page);
  await openSheet(page);
  await savePreset(page, 'watch A');
  await closeSheet(page);
  await pressTile(page, 'attribute', 'm', 2);
  const poolB = await readTiles(page);
  await openSheet(page);
  await savePreset(page, 'watch B');
  await savePreset(page, 'watch C');
  const threeSaved = await readPresets(page);
  await page.click('[data-el="preset-recall-0"]');
  const recalled = await readTiles(page);
  const afterRecall = await page.evaluate(() => ({
    builderOpen: document.querySelector('[data-el="pool-builder"]') !== null,
    sheetOpen: document.querySelector('[data-el="disclosure-sheet"]') !== null,
  }));
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('[data-el="disclosure-toggle"]', { timeout: 30000 });
  await openSheet(page);
  const afterReload = await readPresets(page);
  const savedOrder = threeSaved === null ? [] : threeSaved.rows.map((row) => row.stored);
  const reloadOrder = afterReload === null ? [] : afterReload.rows.map((row) => row.stored);
  console.log(
    `browser: presets saved=[${savedOrder.join(' | ')}] reloaded=[${reloadOrder.join(' | ')}] ` +
      `pool_a=${JSON.stringify(poolA)} pool_b=${JSON.stringify(poolB)} ` +
      `recalled=${JSON.stringify(recalled)} builder_open=${afterRecall.builderOpen} ` +
      `sheet_open=${afterRecall.sheetOpen}`,
  );
  checks.push({
    name: 'sheet.a-saved-pool-recalls-into-the-builder-and-crosses-a-reload',
    ok:
      savedOrder.length === 3 &&
      JSON.stringify(poolA) !== JSON.stringify(poolB) &&
      JSON.stringify(recalled) === JSON.stringify(poolA) &&
      afterRecall.builderOpen &&
      !afterRecall.sheetOpen &&
      reloadOrder.join('|') === savedOrder.join('|'),
    detail:
      `three pools were saved through the field and the list holds ` +
      `[${savedOrder.join(' | ')}]. The tiles stood at ${JSON.stringify(poolA)} when the first ` +
      `was saved and at ${JSON.stringify(poolB)} when the recall was pressed, and they read ` +
      `${JSON.stringify(recalled)} after it. The builder is ` +
      `${afterRecall.builderOpen ? 'open' : 'CLOSED'} and the sheet is ` +
      `${afterRecall.sheetOpen ? 'STILL OPEN' : 'closed'}, which is Decision 11. The list read ` +
      `back as [${reloadOrder.join(' | ')}] after a real reload through the page's own ` +
      `localStorage.`,
  });

  // ---- 7. The name is the player's text, and a real parser never sees it. ----
  const risky = `<img src=x onerror=1><b>bold</b> & 'single' "double" \u{1F3B2}`;
  await savePreset(page, risky);
  const drawnNames = await readPresets(page);
  const riskyRow =
    drawnNames === null ? undefined : drawnNames.rows.find((r) => r.stored === risky);
  const riskyControls =
    drawnNames === null ? [] : drawnNames.controls.filter((each) => each.row === risky);
  console.log(
    `browser: presets risky_row=${riskyRow === undefined ? 'MISSING' : 'drawn'} ` +
      `stored_points=${[...risky].length} ` +
      `drawn_points=${riskyRow === undefined ? -1 : [...(riskyRow.drawn ?? '')].length} ` +
      `elements_in_the_name=${riskyRow?.elements ?? -1} nodes=${riskyRow?.nodes ?? -1} ` +
      `elements_in_the_panel=${drawnNames?.made ?? -1} named_controls=${riskyControls.length}`,
  );
  checks.push({
    name: 'sheet.the-preset-name-is-text-and-a-parser-never-sees-it',
    ok:
      riskyRow !== undefined &&
      riskyRow.drawn === risky &&
      [...(riskyRow.drawn ?? '')].length === [...risky].length &&
      riskyRow.elements === 0 &&
      riskyRow.nodes === 1 &&
      drawnNames?.made === 0 &&
      riskyControls.length === 4 &&
      riskyControls.every((each) => each.name.includes(risky)),
    detail:
      `the name holds markup, both kinds of quote, an ampersand and an emoji. The row draws ` +
      `${[...(riskyRow?.drawn ?? '')].length} code points against the ${[...risky].length} the ` +
      `store holds, and the drawn characters ` +
      `${riskyRow?.drawn === risky ? 'are the stored characters' : 'ARE NOT the stored characters'}. ` +
      `The name holds ${riskyRow?.elements ?? -1} elements and ${riskyRow?.nodes ?? -1} nodes, ` +
      `and the panel holds ${drawnNames?.made ?? -1} elements the markup could have made. A ` +
      `check that read the text alone would pass while the markup was parsed, which is why the ` +
      `element count is here. Constraint 8.`,
  });

  // ---- 8. Every refusal is reachable through the interface. ----
  //
  // Nothing is disabled to prevent a refusal, so both caps are reachable by
  // hand: the field takes a name over the cap and the save control still
  // presses at the preset limit.
  const notes = new Map();
  const rowCount = async () => (await readPresets(page))?.rows.length ?? -1;
  // What a save that went through says. Every refusal below is compared against
  // it, because a control that was disabled to prevent a refusal leaves the
  // note of the press before it standing, and four different sentences would
  // read as four refusals when one of them was a success.
  const savedNote = (await readPresets(page))?.note ?? '';
  await savePreset(page, '');
  await settleScreen(page);
  const emptied = await readPresets(page);
  notes.set('an empty name', emptied?.note ?? '');
  const fieldInvalid =
    emptied?.controls.find((each) => each.el === 'preset-name')?.state ?? 'unread';

  const emoji = '\u{1F3B2}';
  const beforeCap = await rowCount();
  await savePreset(page, emoji.repeat(60));
  const atCapName = (await rowCount()) === beforeCap + 1;
  await savePreset(page, emoji.repeat(61));
  const overCapName = (await rowCount()) === beforeCap + 1;
  notes.set('a name over the cap', (await readPresets(page))?.note ?? '');

  let filled = await rowCount();
  for (let each = 0; each < 40 && filled < 20; each += 1) {
    await savePreset(page, `pool ${each}`);
    filled = await rowCount();
  }
  await savePreset(page, 'one too many');
  const atLimit = await rowCount();
  notes.set('the preset limit', (await readPresets(page))?.note ?? '');

  // A real double press. The player pressed Delete twice before the list could
  // be drawn again, so the second press reads a list the first one changed.
  const beforeDouble = await rowCount();
  await page.evaluate(() => {
    const button = document.querySelector('[data-el="preset-delete-0"]');
    button.click();
    button.click();
  });
  const afterDouble = await rowCount();
  notes.set('no such preset', (await readPresets(page))?.note ?? '');

  console.log(
    `browser: presets refusals=${notes.size} distinct=${new Set(notes.values()).size} ` +
      `empty_field_invalid=${fieldInvalid} at_cap_name_saved=${atCapName} ` +
      `over_cap_name_refused=${overCapName} filled=${filled} at_limit=${atLimit} ` +
      `double_press=${beforeDouble}->${afterDouble}`,
  );
  checks.push({
    name: 'sheet.every-refusal-is-reachable-and-answers-in-words',
    ok:
      notes.size === 4 &&
      new Set(notes.values()).size === 4 &&
      savedNote.length > 0 &&
      [...notes.values()].every((text) => text.length > 0 && text !== savedNote) &&
      fieldInvalid === 'true' &&
      atCapName &&
      overCapName &&
      filled === 20 &&
      atLimit === 20 &&
      afterDouble === beforeDouble - 1,
    detail:
      `four routes, four answers, ${new Set(notes.values()).size} of them different, and ` +
      `${[...notes.values()].filter((text) => text === savedNote).length} of them the sentence a ` +
      `save that went through prints ("${savedNote}"): ` +
      `[${[...notes].map(([route, text]) => `${route}: "${text}"`).join(' | ')}]. The name field ` +
      `reports aria-invalid=${fieldInvalid} after an empty save. A name of 60 emoji ` +
      `${atCapName ? 'saved' : 'DID NOT save'} and one of 61 ` +
      `${overCapName ? 'was refused' : 'WAS SAVED'}, so the cap is proved at the screen in the ` +
      `code points it is counted in. The list filled to ${filled} one save at a time and stayed ` +
      `at ${atLimit} when one more was pressed. A double press on Delete took the list from ` +
      `${beforeDouble} rows to ${afterDouble}, which is the one route to the fourth refusal. ` +
      `Which words each refusal carries is asserted in src/app.test.tsx against the record that ` +
      `holds them.`,
  });

  // Back to a short list, one press at a time, so the walk below is a walk and
  // not a scroll. The last row goes first, so the four named pools stay.
  for (let each = 0; each < 40 && (await rowCount()) > 4; each += 1) {
    await page.evaluate(() => {
      const rows = document.querySelectorAll('[data-el^="preset-row-"]');
      rows[rows.length - 1]?.querySelector('[data-el^="preset-delete-"]')?.click();
    });
  }

  // ---- 9. The list is operable by keyboard alone, at 360 px. ----
  const listed = await readPresets(page);
  const rowControls = listed === null ? [] : listed.controls.filter((each) => each.row !== null);
  // The expectation is derived from the panel itself: every control a keyboard
  // can reach, in document order, less the two the ends disable.
  const wantedWalk = (listed?.controls ?? [])
    .filter((each) => each.el !== 'preset-name' && !each.disabled)
    .map((each) => each.el);
  const walked = await tabFrom(page, 'preset-name', wantedWalk.length);
  const order = () => readPresets(page).then((held) => (held?.rows ?? []).map((row) => row.stored));
  const beforeMove = await order();
  await page.focus('[data-el="preset-up-3"]');
  await page.keyboard.press('Enter');
  const afterMove = await order();
  await page.focus('[data-el="preset-recall-0"]');
  await page.keyboard.press('Enter');
  const afterKeyRecall = await page.evaluate(() => ({
    builderOpen: document.querySelector('[data-el="pool-builder"]') !== null,
    sheetOpen: document.querySelector('[data-el="disclosure-sheet"]') !== null,
  }));
  const unnamedControls = rowControls.filter((each) => each.name.length === 0);
  const statelessControls = (listed?.controls ?? []).filter((each) => each.state === null);
  const mislabelled = rowControls.filter((each) => !each.name.includes(each.row ?? ''));
  const shortTargets = (listed?.controls ?? []).filter(
    (each) => each.height < HIT_TARGET_FLOOR || each.width < HIT_TARGET_FLOOR,
  );
  console.log(
    `browser: presets walk=[${walked.join(' ')}] wanted=[${wantedWalk.join(' ')}] ` +
      `controls=${listed?.controls.length ?? -1} unnamed=${unnamedControls.length} ` +
      `stateless=${statelessControls.length} mislabelled=${mislabelled.length} ` +
      `short_targets=${shortTargets.length} moved=[${afterMove.join(' | ')}] ` +
      `key_recall_builder=${afterKeyRecall.builderOpen} key_recall_sheet=${afterKeyRecall.sheetOpen}`,
  );
  checks.push({
    name: 'sheet.the-preset-list-is-operable-by-keyboard-alone',
    ok:
      wantedWalk.length > 0 &&
      walked.join(' ') === wantedWalk.join(' ') &&
      unnamedControls.length === 0 &&
      statelessControls.length === 0 &&
      mislabelled.length === 0 &&
      shortTargets.length === 0 &&
      beforeMove.length === 4 &&
      afterMove.join('|') !== beforeMove.join('|') &&
      afterMove[2] === beforeMove[3] &&
      afterMove[3] === beforeMove[2] &&
      afterKeyRecall.builderOpen &&
      !afterKeyRecall.sheetOpen,
    detail:
      `real Tab presses from the name field reached [${walked.join(' ')}] against the ` +
      `[${wantedWalk.join(' ')}] the panel itself lists, which is every control a keyboard can ` +
      `reach less the two the ends of the list disable. ` +
      `${listed?.controls.length ?? -1} controls carry a role, a name and a state: ` +
      `${unnamedControls.length} without a name, ${statelessControls.length} without a state, ` +
      `and ${mislabelled.length} whose name does not hold the name of the pool it acts on. ` +
      `Enter on the last row's move control took the list from [${beforeMove.join(' | ')}] to ` +
      `[${afterMove.join(' | ')}], and Enter on a recall control put the pool in the builder ` +
      `(${afterKeyRecall.builderOpen ? 'open' : 'CLOSED'}) and closed the sheet ` +
      `(${afterKeyRecall.sheetOpen ? 'STILL OPEN' : 'closed'}). ${shortTargets.length} targets ` +
      `sit under the ${HIT_TARGET_FLOOR} px floor of WCAG 2.2 SC 2.5.8 at ` +
      `${listed?.viewportWidth ?? -1} px ` +
      `[${shortTargets.map((each) => `${each.el}: ${each.width}x${each.height}px`).join('; ')}].`,
  });

  if (options.captureShell !== null) {
    await openSheet(page);
    // Three frames per width: the sheet as it opens, the override panel, and
    // the saved pools. The sheet scrolls, so a frame of one is not a frame of
    // the other.
    for (const width of [360, 1440]) {
      await page.setViewport({ width, height: width === 360 ? 760 : 900, deviceScaleFactor: 1 });
      for (const [name, target] of [
        ['top', '[data-el="sheet-ruleset"]'],
        ['overrides', '[data-el="overrides-reset"]'],
        ['presets', '[data-el="sheet-presets"]'],
        ['data', '[data-el="sheet-close"]'],
      ]) {
        await page.evaluate((selector) => {
          document.querySelector(selector)?.scrollIntoView({ block: 'end' });
        }, target);
        await new Promise((done) => setTimeout(done, 200));
        writeFileSync(
          join(options.captureShell, `0015-sheet-${name}-${width}.png`),
          await page.screenshot({ type: 'png' }),
        );
      }
    }
    console.log(`browser: sheet captures written to ${options.captureShell}`);
  }
}

// ---------------------------------------------------------------------------
// The roll log and the history destination — Unit 4.4, the screen half
//
// **The trap this mode exists for: a write that is queued is not a write that
// landed.** `LogWriter` queues, so a check that asked the application whether
// it had accepted a roll would prove nothing about the database. Every count
// below is read out of IndexedDB through a connection this file opens itself,
// after the application wrote through its own.
//
// **The second trap: a list rendered from a store the check also wrote can
// agree with itself.** So the summary list is counted off the screen and the
// log is counted off the store, in two separate reads, and the two are compared
// against a third number: the presses this file made.
// ---------------------------------------------------------------------------

/** The database the application writes. Both names come from src/log/store.ts. */
const LOG_DB = 'clatter-log';
const LOG_STORE = 'rolls';

/**
 * Every roll in the log, read through this file's own connection.
 *
 * No version is asked for, so the open never triggers an upgrade and never
 * blocks the connection the application holds.
 */
async function readLogRolls(page) {
  return page.evaluate(
    (names) =>
      new Promise((resolve) => {
        let request;
        try {
          request = indexedDB.open(names.db);
        } catch (error) {
          resolve({ error: String(error), rolls: [], keys: [] });
          return;
        }
        request.onerror = () => resolve({ error: String(request.error), rolls: [], keys: [] });
        request.onsuccess = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(names.store)) {
            db.close();
            resolve({ error: null, rolls: [], keys: [] });
            return;
          }
          const transaction = db.transaction(names.store, 'readonly');
          const store = transaction.objectStore(names.store);
          const values = store.getAll();
          const keys = store.getAllKeys();
          transaction.oncomplete = () => {
            db.close();
            resolve({ error: null, rolls: values.result, keys: keys.result });
          };
          transaction.onabort = () => {
            db.close();
            resolve({ error: String(transaction.error), rolls: [], keys: [] });
          };
        };
      }),
    { db: LOG_DB, store: LOG_STORE },
  );
}

/** Empty the log without a version change, so no open connection is disturbed. */
async function clearLog(page) {
  return page.evaluate(
    (names) =>
      new Promise((resolve) => {
        let request;
        try {
          request = indexedDB.open(names.db);
        } catch (error) {
          resolve(String(error));
          return;
        }
        request.onerror = () => resolve(String(request.error));
        request.onsuccess = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(names.store)) {
            db.close();
            resolve(null);
            return;
          }
          const transaction = db.transaction(names.store, 'readwrite');
          transaction.objectStore(names.store).clear();
          transaction.oncomplete = () => {
            db.close();
            resolve(null);
          };
          transaction.onabort = () => {
            db.close();
            resolve(String(transaction.error));
          };
        };
      }),
    { db: LOG_DB, store: LOG_STORE },
  );
}

/**
 * Wait until the store holds this many rolls.
 *
 * The application writes from a promise chain, so a roll is in the database a
 * task or two after the press. Waiting on the count is what makes the check
 * about the database and not about the click.
 */
async function logHolds(page, wanted, waitMs = 8000) {
  const until = Date.now() + waitMs;
  let held = await readLogRolls(page);
  while (held.rolls.length < wanted && Date.now() < until) {
    await new Promise((done) => setTimeout(done, 50));
    held = await readLogRolls(page);
  }
  return held;
}

// ---------------------------------------------------------------------------
// The record, the transposed matrix, the export and the import
// — Units 4.5 and 4.6, and the two acceptances row 2.2d of `LEDGER.md` carries
//
// **Neither matrix count reads the matrix.** The cell count and the blank count
// are both taken off the STORED entry, read back through this file's own
// connection to IndexedDB, and compared against what the document drew. A
// matrix that agreed with itself would still fail.
//
// **The export is compared byte for byte.** The file the button handed to the
// browser is intercepted at `URL.createObjectURL`, which is the browser's own
// call and not ours, and it is compared against what `exportCsvInChunks` builds
// from the rolls the store holds.
//
// **The import is driven through the real picker.** A real `File` goes into a
// real `FileList` through `DataTransfer`, and the size guard is proved by
// counting the reads of a file it must refuse: a file that was never read
// cannot have been parsed.
// ---------------------------------------------------------------------------

/** The rule set the record fixture runs under: a stress die joins before the re-roll. */
const RECORD_PROFILE = 'pool-stress-and-complications';

/** Pick one rule set by its identifier, through the sheet, the way a player does. */
async function chooseRuleset(page, wanted) {
  await openSheet(page);
  const chosen = await page.evaluate((id) => {
    const inputs = [...document.querySelectorAll('[data-el="sheet-ruleset"] input')];
    const found = inputs.find((input) => input.value === id);
    if (found === undefined) return null;
    if (!found.checked) found.click();
    return id;
  }, wanted);
  await closeSheet(page);
  await settleScreen(page);
  return chosen;
}

/**
 * Put the sequential focus navigation starting point back at the top.
 *
 * A walk that begins where the last press left the focus starts in the middle
 * of the order, and Firefox hands the focus to its own chrome after the last
 * control rather than wrapping, so such a walk stops early and reports a short
 * list. `blur()` alone does not move the starting point. Measured on this host
 * on 2026-08-10: with `import-button` added after `back-button`, a blurred walk
 * of the history summary reported one stop of the three.
 */
async function startWalkAt(page, element) {
  await page.evaluate((name) => {
    const head = document.querySelector(`[data-el="${name}"]`);
    if (head === null) return;
    head.setAttribute('tabindex', '-1');
    head.focus();
    head.removeAttribute('tabindex');
  }, element);
}

/** Open the history destination from the sheet. */
async function openHistory(page) {
  await openSheet(page);
  await page.click('[data-el="sheet-history"]');
  await page.waitForSelector('[data-el="history"]', { timeout: 15000 });
  await settleScreen(page);
}

/** Open the record of the newest roll, which the list draws first. */
async function openNewestRecord(page) {
  await page.evaluate(() => {
    document.querySelector('[data-el="history-list"] [role="option"]')?.click();
  });
  await page.waitForSelector('[data-el="history-record"]', { timeout: 15000 });
  await settleScreen(page);
}

/**
 * The matrix one stored entry must draw, counted here and never in the page.
 *
 * This is the second count of both acceptances. A cell is BLANK when the die
 * did not exist yet, or when the die was locked at the generation before and
 * this value is therefore the carry of that one.
 */
function matrixOf(entry) {
  const generations = entry.dice.reduce((longest, die) => Math.max(longest, die.cells.length), 0);
  let kept = 0;
  let absent = 0;
  let carriesValue = 0;
  for (const die of entry.dice) {
    for (let generation = 0; generation < generations; generation += 1) {
      const cell = die.cells[generation] ?? null;
      if (cell === null) {
        absent += 1;
        continue;
      }
      const before = generation === 0 ? null : (die.cells[generation - 1] ?? null);
      if (before !== null && before.locked) {
        kept += 1;
        if (before.value === cell.value) carriesValue += 1;
      }
    }
  }
  return {
    dice: entry.dice.length,
    generations,
    cells: entry.dice.length * generations,
    kept,
    absent,
    blank: kept + absent,
    carriesValue,
  };
}

/** Every leaf field of two logs, compared, with the leaves counted both ways. */
function compareLogs(before, after) {
  const differences = [];
  let leaves = 0;
  const walk = (left, right, path) => {
    if (left === null || right === null || typeof left !== 'object' || typeof right !== 'object') {
      leaves += 1;
      if (left !== right && differences.length < 5) {
        differences.push(`${path}: ${JSON.stringify(left)} against ${JSON.stringify(right)}`);
      }
      return;
    }
    for (const key of new Set([...Object.keys(left), ...Object.keys(right)])) {
      walk(left[key], right[key], `${path}.${key}`);
    }
  };
  for (const [index, entry] of before.entries()) walk(entry, after[index], entry.rollId);
  // A second enumeration, walked over the log that went out rather than over
  // the comparison, so a comparison that skipped a field fails the count.
  let expected = 0;
  for (const entry of before) {
    expected += Object.keys(entry).length - 1;
    for (const die of entry.dice) {
      expected += 2;
      for (const cell of die.cells) expected += cell === null ? 1 : 3;
    }
  }
  return { leaves, expected, differences };
}

async function runRecordAndExport(page, options, checks, design) {
  // ---- The roll the record draws ----
  //
  // The third rule set adds a stress die BEFORE the re-roll, so that die is
  // absent at the first generation and its first cell is blank whatever the
  // faces did. One loose die is kept by hand before the push, so at least one
  // cell is the carry of a locked die whatever the faces did either. Neither
  // blank kind is left to chance.
  await clearLog(page);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('[data-el="roll-button"]', { timeout: 30000 });
  const ruleset = await chooseRuleset(page, RECORD_PROFILE);
  await pressTile(page, 'attribute', 'p', 4);
  await pressTile(page, 'skill', 'p', 4);
  // TWO rolls, and only the second is pushed. The export writes the whole log,
  // so a log of one roll cannot tell a whole-log export from a one-roll one and
  // the check on that claim could not fail.
  await page.click('[data-el="roll-button"]');
  await settleScreen(page);
  await logHolds(page, 1);
  await page.click('[data-el="roll-button"]');
  await settleScreen(page);
  const keptByHand = await page.evaluate(() => {
    const loose = document.querySelector('[data-el^="die-"][aria-pressed="false"]');
    if (loose === null) return null;
    loose.click();
    return loose.dataset.el;
  });
  await settleScreen(page);
  await page.click('[data-el="push-button"]');
  await settleScreen(page);
  const written = await logHolds(page, 2);

  await openHistory(page);
  await openNewestRecord(page);

  // ---- 7. The matrix holds dice by generations cells. ----
  const drawn = await page.evaluate(() => {
    const record = document.querySelector('[data-el="history-record"]');
    const table = document.querySelector('[data-el="history-matrix"]');
    if (table === null) return { missing: true };
    const cells = [...table.querySelectorAll('tbody td')];
    const rowHeads = [...table.querySelectorAll('tbody th[scope="row"]')];
    const colHeads = [...table.querySelectorAll('thead th[scope="col"]')];
    const rowIds = new Set(rowHeads.map((head) => head.id));
    const colIds = new Set(colHeads.map((head) => head.id));
    let reachable = 0;
    let named = 0;
    for (const cell of cells) {
      const points = (cell.getAttribute('headers') ?? '').split(' ').filter(Boolean);
      if (points.length === 2 && rowIds.has(points[0]) && colIds.has(points[1])) reachable += 1;
      if ((cell.getAttribute('aria-label') ?? '') !== '') named += 1;
    }
    return {
      missing: false,
      rollId: record?.dataset.rollId ?? null,
      role: table.getAttribute('role'),
      tag: table.tagName,
      caption: (table.querySelector('caption')?.textContent ?? '').trim().length,
      cells: cells.length,
      rows: table.querySelectorAll('tbody tr').length,
      colHeads: colHeads.length,
      rowHeads: rowHeads.length,
      colHeadRoles: colHeads.filter((h) => h.getAttribute('role') === 'columnheader').length,
      rowHeadRoles: rowHeads.filter((h) => h.getAttribute('role') === 'rowheader').length,
      firstColumn: colHeads[1]?.textContent ?? '',
      kept: table.querySelectorAll('tbody td[data-cell="kept"]').length,
      absent: table.querySelectorAll('tbody td[data-cell="absent"]').length,
      thrown: table.querySelectorAll('tbody td[data-cell="thrown"]').length,
      blank: table.querySelectorAll('tbody td[data-blank]').length,
      reachable,
      named,
      tabStops: [...table.querySelectorAll('*')].filter((each) => each.tabIndex >= 0).length,
    };
  });
  if (drawn.missing) {
    checks.push({
      name: 'history.the-record-draws-the-transposed-matrix',
      ok: false,
      detail: 'the record holds no history-matrix at all.',
    });
    return;
  }
  const stored = (await readLogRolls(page)).rolls;
  const entry = stored.find((each) => each.rollId === drawn.rollId) ?? null;
  const wanted = entry === null ? null : matrixOf(entry);
  console.log(
    `browser: history matrix ruleset=${ruleset} kept_by_hand=${keptByHand} ` +
      `entries=${written.rolls.length} roll_id=${drawn.rollId} ` +
      `drawn cells=${drawn.cells} rows=${drawn.rows} columns=${drawn.colHeads - 1} ` +
      `blank=${drawn.blank} kept=${drawn.kept} absent=${drawn.absent} thrown=${drawn.thrown} | ` +
      `stored dice=${wanted?.dice} generations=${wanted?.generations} cells=${wanted?.cells} ` +
      `blank=${wanted?.blank} kept=${wanted?.kept} absent=${wanted?.absent}`,
  );
  checks.push({
    name: 'history.the-matrix-holds-one-cell-per-die-per-generation',
    ok:
      wanted !== null &&
      wanted.generations > 1 &&
      wanted.dice > 0 &&
      drawn.cells === wanted.cells &&
      drawn.rows === wanted.dice &&
      drawn.colHeads === wanted.generations + 1 &&
      drawn.rowHeads === wanted.dice &&
      drawn.blank + drawn.thrown === wanted.cells,
    detail:
      `the record of roll ${drawn.rollId} drew ${drawn.cells} cells in ${drawn.rows} rows and ` +
      `${drawn.colHeads - 1} generation columns. The product is taken off the STORED entry, ` +
      `read back through this file's own connection to IndexedDB and never off the matrix: ` +
      `${wanted?.dice} dice by ${wanted?.generations} generations is ${wanted?.cells} cells. ` +
      `The generations are over one, so this is a pushed roll and a matrix of one column ` +
      `cannot pass. The matrix is TRANSPOSED, so the row count is the die count and the column ` +
      `count is the generation count. Decision 3. The two cell kinds add up to the whole: ` +
      `${drawn.blank} blank plus ${drawn.thrown} thrown is ${drawn.blank + drawn.thrown}.`,
  });

  // ---- 8. The blank cells are the locked-or-absent pairs. ----
  checks.push({
    name: 'history.the-blank-cells-are-the-locked-or-absent-pairs',
    ok:
      wanted !== null &&
      wanted.kept > 0 &&
      wanted.absent > 0 &&
      drawn.kept === wanted.kept &&
      drawn.absent === wanted.absent &&
      drawn.blank === wanted.blank &&
      wanted.carriesValue === wanted.kept,
    detail:
      `${drawn.blank} cells were drawn blank against ${wanted?.blank} counted a second way over ` +
      `the stored cells, by a loop in this file that never reads the document: a die locked at ` +
      `the generation before carries its value forward (${wanted?.kept}) and a die that did not ` +
      `exist yet is absent (${wanted?.absent}). Both kinds are guaranteed by the fixture rather ` +
      `than left to the faces: the run kept ${keptByHand} by hand before the push, and the ` +
      `third rule set adds a stress die BEFORE the re-roll, so that die has no first ` +
      `generation. Every carry really is a carry: ${wanted?.carriesValue} of ${wanted?.kept} ` +
      `repeat the value of the cell before them, which is what the rules model requires of a ` +
      `locked die.`,
  });

  // ---- 9. The matrix is a table a screen reader can walk. ----
  checks.push({
    name: 'history.the-matrix-is-a-table-reachable-by-row-and-by-column',
    ok:
      drawn.tag === 'TABLE' &&
      drawn.role === 'table' &&
      drawn.caption > 0 &&
      drawn.cells > 0 &&
      drawn.reachable === drawn.cells &&
      drawn.named === drawn.cells &&
      drawn.colHeadRoles === drawn.colHeads &&
      drawn.rowHeadRoles === drawn.rowHeads &&
      drawn.tabStops === 0,
    detail:
      `the matrix is a <${drawn.tag}> with role=${drawn.role} and a caption of ${drawn.caption} ` +
      `characters, so it is named. ${drawn.reachable} of its ${drawn.cells} cells name one row ` +
      `header and one column header through \`headers\`, and both identifiers exist, so a ` +
      `screen reader reaches a cell by its row and its column rather than by its text. ` +
      `${drawn.named} of ${drawn.cells} carry an accessible name of their own. Every header ` +
      `carries its role: ${drawn.colHeadRoles} of ${drawn.colHeads} column headers and ` +
      `${drawn.rowHeadRoles} of ${drawn.rowHeads} row headers. The first generation column ` +
      `reads "${drawn.firstColumn}". Section 3 lists the matrix under the read-only parts, so ` +
      `it holds ${drawn.tabStops} tab stops.`,
  });

  // ---- 10. The record holds the two controls of the design, by keyboard. ----
  await startWalkAt(page, 'history-header');
  const recordWalk = await walkShell(page, 8);
  const recordStops = recordWalk
    .filter((visit) => !visit.implicit && visit.by === 'tab')
    .map((visit) => visit.name);
  const recordControls = design
    .slice(
      design.indexOf('### The history is a separate destination'),
      design.indexOf('###', design.indexOf('### The history is a separate destination') + 1),
    )
    .split('\n')
    .find((line) => line.trim().startsWith('| Record'));
  const recordWanted = [...(recordControls ?? '').matchAll(/`([a-z-]+)`/g)]
    .map((match) => match[1])
    .sort();
  const recordNamed = await page.evaluate(() => {
    const controls = [...document.querySelectorAll('[data-el="history-footer"] button')];
    return {
      controls: controls.length,
      unnamed: controls.filter((each) => (each.textContent ?? '').trim() === '').length,
      stateless: controls.filter((each) => each.getAttribute('aria-disabled') === null).length,
      wrongRole: controls.filter((each) => each.tagName !== 'BUTTON').length,
      short: controls.filter((each) => each.getBoundingClientRect().height < 24).length,
      names: controls.map((each) => each.dataset.el),
      listGone: document.querySelector('[data-el="history-list"]') === null,
    };
  });
  console.log(
    `browser: history record tab_stops=[${recordStops.join(' ')}] ` +
      `design=[${recordWanted.join(' ')}] buttons=${recordNamed.controls} ` +
      `unnamed=${recordNamed.unnamed} stateless=${recordNamed.stateless} ` +
      `wrong_role=${recordNamed.wrongRole} short=${recordNamed.short} ` +
      `list_gone=${recordNamed.listGone}`,
  );
  checks.push({
    name: 'history.the-record-holds-the-two-controls-the-design-names',
    ok:
      recordWanted.length === 2 &&
      recordStops.slice().sort().join(' ') === recordWanted.join(' ') &&
      recordNamed.controls === recordWanted.length &&
      recordNamed.unnamed === 0 &&
      recordNamed.stateless === 0 &&
      recordNamed.wrongRole === 0 &&
      recordNamed.short === 0 &&
      recordNamed.listGone,
    detail:
      `real Tab presses reached [${recordStops.join(' ')}] against the ` +
      `[${recordWanted.join(' ')}] section 3 of the design names for the record view, read out ` +
      `of the document and never restated. The footer holds ${recordNamed.controls} controls ` +
      `and no third. Each one carries a role (${recordNamed.wrongRole} wrong), an accessible ` +
      `name (${recordNamed.unnamed} without one) and a state a reader can announce ` +
      `(${recordNamed.stateless} without an aria-disabled), and none is under the 24 px floor ` +
      `of WCAG 2.2 SC 2.5.8 (${recordNamed.short}). The summary list left the document ` +
      `(${recordNamed.listGone}), so the record is a view and not an overlay.`,
  });

  // ---- 11. The export button writes what the chunked writer builds. ----
  //
  // The interception is on the BROWSER's own calls, not on ours: the object URL
  // the anchor is given, and the click itself. The click is not passed through,
  // because a real one starts a file transfer this run has no way to collect.
  await page.evaluate(() => {
    window.__download = { blobs: [], names: [], hrefs: [], types: [] };
    const real = URL.createObjectURL.bind(URL);
    URL.createObjectURL = (blob) => {
      window.__download.blobs.push(blob);
      window.__download.types.push(blob.type);
      return real(blob);
    };
    HTMLAnchorElement.prototype.click = function click() {
      window.__download.names.push(this.download);
      window.__download.hrefs.push(this.href);
    };
  });
  await page.click('[data-el="export-button"]');
  await page.waitForFunction(() => window.__download.blobs.length > 0, { timeout: 30000 });
  const offered = await page.evaluate(async () => {
    const blob = window.__download.blobs[0];
    return {
      bytes: blob.size,
      type: blob.type,
      text: await blob.text(),
      name: window.__download.names[0] ?? null,
      href: (window.__download.hrefs[0] ?? '').slice(0, 5),
      offers: window.__download.blobs.length,
    };
  });
  // The oracle runs HERE, in node, over the rolls this file reads out of
  // IndexedDB through its own connection. So the file the button produced is
  // compared against a file the chunked writer produces from the store, in
  // another engine, and never against a copy of itself. The page cannot build
  // the oracle: this mode drives the BUILT bundle, which exports nothing.
  const csv = await import('../src/log/csv.ts');
  const rollsNow = (await readLogRolls(page)).rolls;
  const oracle = await (await csv.exportCsvInChunks(rollsNow)).blob.text();
  const got = Buffer.from(offered.text, 'utf8');
  const want = Buffer.from(oracle, 'utf8');
  let compared = 0;
  let firstDifference = -1;
  if (got.length === want.length) {
    for (let at = 0; at < got.length; at += 1) {
      compared += 1;
      if (got[at] !== want[at] && firstDifference < 0) firstDifference = at;
    }
  }
  const exported = {
    rolls: rollsNow.length,
    rollIdsInFile: rollsNow.filter((roll) => offered.text.includes(roll.rollId)).length,
    gotBytes: got.length,
    blobBytes: offered.bytes,
    wantBytes: want.length,
    compared,
    firstDifference,
    name: offered.name,
    href: offered.href,
    type: offered.type,
    offers: offered.offers,
    text: offered.text,
  };
  const said = await page.evaluate(
    () => document.querySelector('[data-el="history-message"]')?.textContent ?? '',
  );
  console.log(
    `browser: history export rolls=${exported.rolls} bytes=${exported.gotBytes} ` +
      `wanted=${exported.wantBytes} compared=${exported.compared} ` +
      `first_difference=${exported.firstDifference} name=${exported.name} ` +
      `href=${exported.href} type=${exported.type} offers=${exported.offers} ` +
      `ids_in_file=${exported.rollIdsInFile} message="${said.slice(0, 60)}"`,
  );
  checks.push({
    name: 'history.the-export-button-writes-the-file-the-chunked-writer-builds',
    ok:
      exported.offers === 1 &&
      exported.gotBytes > 0 &&
      exported.gotBytes === exported.blobBytes &&
      exported.gotBytes === exported.wantBytes &&
      exported.compared === exported.gotBytes &&
      exported.firstDifference === -1 &&
      exported.rolls > 0 &&
      exported.rollIdsInFile === exported.rolls &&
      /^clatter-log-\d{4}-\d{2}-\d{2}-\d{4}\.csv$/.test(String(exported.name)) &&
      exported.href === 'blob:' &&
      String(exported.type).startsWith('text/csv'),
    detail:
      `one press on export-button handed the browser ${exported.offers} object URL, on an ` +
      `anchor named "${exported.name}" whose href is a ${exported.href} URL and whose blob is ` +
      `${exported.type}. The file measures ${exported.gotBytes} bytes against the ` +
      `${exported.wantBytes} exportCsvInChunks builds IN NODE from the ${exported.rolls} rolls ` +
      `this file read out of IndexedDB through its own connection, and against the ` +
      `${exported.blobBytes} bytes the browser itself reports for the blob. The comparison is ` +
      `BYTE FOR BYTE and ` +
      `not by length: ${exported.compared} bytes compared, first difference at ` +
      `${exported.firstDifference}, where -1 is none. The denominator is the file itself, and a ` +
      `file of no bytes fails. It holds the WHOLE log and not the roll on the screen: ` +
      `${exported.rollIdsInFile} of ${exported.rolls} roll identifiers are in it.`,
  });

  // ---- 12. The export round trips through the import control. ----
  //
  // One more roll is thrown between the export and the import, so an import
  // that wrote nothing at all cannot pass: the log it must produce is not the
  // log it starts from.
  const beforeImport = stored;
  await page.click('[data-el="back-button"]');
  await page.waitForSelector('[data-el="history-list"]', { timeout: 15000 });
  await page.click('[data-el="back-button"]');
  await page.waitForSelector('[data-el="roll-button"]', { timeout: 15000 });
  await page.click('[data-el="roll-button"]');
  await settleScreen(page);
  const withExtra = await logHolds(page, beforeImport.length + 1);
  const extraIds = withExtra.rolls
    .map((roll) => roll.rollId)
    .filter((id) => !beforeImport.some((roll) => roll.rollId === id));
  await openHistory(page);
  const picked = await page.evaluate((text) => {
    const input = document.querySelector('[data-el="import-file"]');
    if (input === null) return { failed: 'the summary holds no import-file' };
    const file = new File([text], 'round-trip.csv', { type: 'text/csv' });
    const carrier = new DataTransfer();
    carrier.items.add(file);
    input.files = carrier.files;
    // Read before the dispatch: the control clears `value` as it reads the
    // file, so the FileList is empty again by the time the handler returns.
    const real = input.files.length === 1 && input.files[0].size > 0;
    const size = input.files[0]?.size ?? 0;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return { failed: null, real, size };
  }, exported.text);
  await page.waitForFunction(
    () => {
      const shown = document.querySelector('[data-el="history-message"]')?.textContent ?? '';
      return shown.length > 0 && !shown.startsWith('The import is running');
    },
    { timeout: 30000 },
  );
  const afterImport = (await readLogRolls(page)).rolls;
  const importSaid = await page.evaluate(
    () => document.querySelector('[data-el="history-message"]')?.textContent ?? '',
  );
  const drawnRows = await page.evaluate(
    () => document.querySelectorAll('[data-el="history-list"] [role="option"]').length,
  );
  const trip = compareLogs(beforeImport, afterImport);
  console.log(
    `browser: history round trip before=${beforeImport.length} ` +
      `with_extra=${withExtra.rolls.length} extra=[${extraIds.join(' ')}] ` +
      `after=${afterImport.length} drawn=${drawnRows} fields=${trip.leaves} of ${trip.expected} ` +
      `differences=${trip.differences.length} real_file=${picked.real} bytes=${picked.size} ` +
      `message="${importSaid.slice(0, 70)}"`,
  );
  checks.push({
    name: 'history.the-export-round-trips-through-the-import-control',
    ok:
      picked.failed === null &&
      picked.real === true &&
      beforeImport.length > 0 &&
      extraIds.length === 1 &&
      withExtra.rolls.length === beforeImport.length + 1 &&
      afterImport.length === beforeImport.length &&
      drawnRows === beforeImport.length &&
      afterImport.every((roll) => roll.rollId !== extraIds[0]) &&
      trip.leaves === trip.expected &&
      trip.leaves > 0 &&
      trip.differences.length === 0,
    detail:
      `the file the export button wrote went back in through the picker as a real File in a ` +
      `real FileList (${picked.real}, ${picked.size} bytes). One extra roll was thrown between ` +
      `the two, so the log stood at ${withExtra.rolls.length} when the import ran and an import ` +
      `that wrote nothing could not pass. The marker roll ${extraIds.join(' ')} survives=` +
      `${afterImport.some((roll) => roll.rollId === extraIds[0])}, and it must not. The ` +
      `log holds ${afterImport.length} against the ${beforeImport.length} that went out. The ` +
      `list on the screen drew ${drawnRows} rows, read off the document rather than off the ` +
      `store. Every field is compared, not the rolls as wholes: ${trip.leaves} leaf fields ` +
      `against ${trip.expected} counted a second way over the log that went out, with ` +
      `${trip.differences.length} differences. The message reads "${importSaid}".` +
      (trip.differences.length ? ` [${trip.differences.join('; ')}]` : ''),
  });

  // ---- 13. The import refuses an oversized file BEFORE it reads it. ----
  //
  // The proof is a call counter on the file's own `text`. A file that was never
  // read cannot have been parsed, and no clock is needed to say so.
  //
  // The cap is read from the shipped module IN NODE and handed to the page, for
  // the same reason the export oracle runs there: this mode drives the built
  // bundle, which exports nothing. It is the guard's own constant, from the one
  // place that holds it.
  const refused = await page.evaluate(async (cap) => {
    const input = document.querySelector('[data-el="import-file"]');
    const reads = { count: 0 };
    const over = cap + 1;
    const file = new File([new Uint8Array(over)], 'huge.csv', { type: 'text/csv' });
    const real = file.text.bind(file);
    // The counter goes on the instance the control is handed, so a run where
    // the patch did not land reports `patched=false` and the check fails rather
    // than passing on an instrument that measured nothing.
    Object.defineProperty(file, 'text', {
      value: () => {
        reads.count += 1;
        return real();
      },
      configurable: true,
    });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    const patched = input.files[0].text !== File.prototype.text;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise((done) => setTimeout(done, 500));
    return {
      patched,
      cap,
      size: file.size,
      reads: reads.count,
      // Unit 4.10 moved a refusal off the message line and on to the one
      // error surface. The message line still carries what an import DID.
      message: document.querySelector('[data-el="import-fault-note"]')?.textContent ?? '',
    };
  }, csv.MAX_IMPORT_BYTES);
  const afterRefusal = (await readLogRolls(page)).rolls;
  console.log(
    `browser: history oversized patched=${refused.patched} size=${refused.size} ` +
      `cap=${refused.cap} reads=${refused.reads} log_before=${afterImport.length} ` +
      `log_after=${afterRefusal.length} message="${refused.message.slice(0, 80)}"`,
  );
  checks.push({
    name: 'history.the-import-refuses-an-oversized-file-before-it-reads-it',
    ok:
      refused.patched === true &&
      refused.size === refused.cap + 1 &&
      refused.reads === 0 &&
      /too large/.test(refused.message) &&
      /No part of the file was read/.test(refused.message) &&
      /Pick another file/.test(refused.message) &&
      afterRefusal.length === afterImport.length &&
      afterRefusal.length > 0,
    detail:
      `a real File of ${refused.size} bytes, one over the ${refused.cap} the import control ` +
      `accepts, went into the picker. Its own \`text\` was counted first and the patch is ` +
      `proved to have landed (patched=${refused.patched}), so a run where the counter never ` +
      `attached fails here rather than reporting a zero it could not have moved. The control ` +
      `read the file ${refused.reads} times, which is how this check knows nothing was parsed: ` +
      `the judgement is on File.size and not on text.length. The refusal names its cause: ` +
      `"${refused.message}". The log is untouched at ${afterRefusal.length} rolls against the ` +
      `${afterImport.length} it held before.`,
  });
}

/**
 * The controls one history view carries, read out of the design's own table.
 *
 * The row states its count as well, so the table cannot disagree with itself
 * and no check here carries a number of its own.
 */
function designViewControls(design, view) {
  const from = design.indexOf('### The history is a separate destination');
  const row = design
    .slice(from, design.indexOf('###', from + 1))
    .split('\n')
    .find((line) => line.trim().startsWith(`| ${view}`));
  const names = [...(row ?? '').matchAll(/`([a-z-]+)`/g)].map((match) => match[1]).sort();
  const stated = Number((row ?? '').split('|').map((cell) => cell.trim())[3]);
  return { names, stated };
}

/** `rgb(r, g, b)` as the WCAG relative luminance of that colour. */
function luminanceOfRgb(text) {
  const found = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(text);
  if (found === null) return null;
  const channels = [1, 2, 3].map((at) => {
    const value = Number(found[at]) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

/** The WCAG contrast ratio between two `rgb()` strings, or null. */
function ratioOfRgb(a, b) {
  const first = luminanceOfRgb(a);
  const second = luminanceOfRgb(b);
  if (first === null || second === null) return null;
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

/**
 * Every value the record carries, enumerated HERE and formatted here.
 *
 * The oracle is `summariseLog`, run in node over the rolls this file reads out
 * of IndexedDB through its own connection. This walk turns that record into the
 * paths and the text the screen must carry, and it never reads the document.
 */
function statisticsValues(stats, noPushText) {
  const wanted = new Map();
  const percent = (rate) => `${(rate * 100).toFixed(1)}%`;
  wanted.set('entriesRead', String(stats.entriesRead));
  stats.byPoolSize.forEach((row, at) => {
    wanted.set(`byPoolSize.${at}.poolSize`, String(row.poolSize));
    wanted.set(`byPoolSize.${at}.rolls`, String(row.rolls));
    wanted.set(`byPoolSize.${at}.rollsWithASuccess`, String(row.rollsWithASuccess));
    wanted.set(`byPoolSize.${at}.successes`, String(row.successes));
    wanted.set(`byPoolSize.${at}.successRate`, percent(row.successRate));
  });
  for (const field of STATS_PUSH_FIELDS) wanted.set(`pushes.${field}`, String(stats.pushes[field]));
  for (const unit of STATS_COST_UNITS) {
    wanted.set(`pushes.costByUnit.${unit}`, String(stats.pushes.costByUnit[unit]));
  }
  wanted.set('paidOffRate', stats.paidOffRate === null ? noPushText : percent(stats.paidOffRate));
  wanted.set('paidOffDefinition', stats.paidOffDefinition);
  return wanted;
}

/** The seven scalar push fields and the four cost units, restated here. */
const STATS_PUSH_FIELDS = [
  'pushedRolls',
  'pushes',
  'better',
  'same',
  'worse',
  'successesBefore',
  'successesAfter',
];
const STATS_COST_UNITS = ['ratingPoint', 'healthPoint', 'refereePoint', 'complicationCheck'];

/** The three push outcomes, and the four series that carry a shape. */
const STATS_OUTCOMES = ['better', 'same', 'worse'];
const STATS_SERIES = ['success', 'better', 'same', 'worse'];

/** The floors, restated. WCAG 2.2 SC 1.4.3 for text, SC 1.4.11 for a graphic. */
const STATS_TEXT_FLOOR = 4.5;
const STATS_NON_TEXT_FLOOR = 3;

/**
 * What every value, every bar and every mark of the charts reads in the
 * browser. One pass over the document, so no reading can come from a different
 * paint than another.
 */
async function readCharts(page) {
  return page.evaluate(() => {
    const charts = document.querySelector('[data-el="history-stats"]');
    if (charts === null) return { missing: true };

    // The name a screen reader reaches a value by. A table cell is named by its
    // row header and its column header, resolved through `headers` against the
    // table it sits in. A description value is named by the term beside it.
    // Nothing is assumed: an identifier that names no header answers null.
    const readerName = (each) => {
      if (each.closest('[aria-hidden="true"]') !== null) return null;
      const cell = each.closest('td, th, dd');
      if (cell === null) return null;
      if (cell.tagName === 'DD') {
        const terms = [...(cell.parentElement?.querySelectorAll('dt') ?? [])];
        if (terms.length !== 1) return null;
        const term = (terms[0].textContent ?? '').trim();
        return term === '' ? null : term;
      }
      const table = cell.closest('table');
      if (table === null) return null;
      const ids = (cell.getAttribute('headers') ?? '').split(' ').filter(Boolean);
      const heads = ids.map((id) => table.querySelector(`#${id}`));
      if (heads.some((head) => head === null)) return null;
      const scopes = heads.map((head) => head.getAttribute('scope') ?? '');
      if (cell.tagName === 'TH') {
        if (ids.length !== 1 || scopes[0] !== 'col') return null;
      } else if (ids.length !== 2 || scopes[0] !== 'row' || scopes[1] !== 'col') {
        return null;
      }
      return heads.map((head) => (head.textContent ?? '').trim()).join(', ');
    };

    // The first ancestor that really paints a colour. It is the colour the ink
    // in front of it is judged against, and it is resolved rather than read out
    // of a stylesheet.
    const groundOf = (each) => {
      for (let at = each.parentElement; at !== null; at = at.parentElement) {
        const paint = getComputedStyle(at).backgroundColor;
        if (paint !== 'transparent' && !/,\s*0\)$/.test(paint)) return paint;
      }
      return getComputedStyle(document.body).backgroundColor;
    };

    const values = [...charts.querySelectorAll('[data-stat]')].map((each) => ({
      path: each.dataset.stat,
      text: (each.textContent ?? '').trim(),
      name: readerName(each),
    }));

    const bars = [...charts.querySelectorAll('[data-bar]')].map((bar) => {
      const track = bar.parentElement;
      return {
        path: bar.dataset.bar,
        series: bar.dataset.series,
        barPx: bar.getBoundingClientRect().width,
        trackPx: track === null ? 0 : track.getBoundingClientRect().width,
        inTrack: track !== null && track.classList.contains('chart-track'),
      };
    });

    const marks = [...charts.querySelectorAll('.cmark')].map((each) => {
      const style = getComputedStyle(each);
      const box = each.getBoundingClientRect();
      return {
        series: each.dataset.series,
        shape: `border-radius:${style.borderRadius} clip-path:${style.clipPath}`,
        colour: style.backgroundColor,
        width: box.width,
        height: box.height,
      };
    });

    // Every drawn mark must be decoration a reader never meets.
    const decoration = [...charts.querySelectorAll('.cmark, .chart-track')];
    const hidden = decoration.filter(
      (each) => each.closest('[aria-hidden="true"]') !== null,
    ).length;

    // The colours, resolved. Text against its ground and a mark against its
    // ground, each with the floor it answers to.
    const paints = [];
    for (const each of charts.querySelectorAll(
      '.chart td, .chart thead th, .chart th[scope="row"], .chart caption, .chart-note dd',
    )) {
      paints.push({
        what: `text in ${each.tagName.toLowerCase()}`,
        ink: getComputedStyle(each).color,
        ground: groundOf(each),
        kind: 'text',
      });
    }
    for (const each of charts.querySelectorAll('.chart-bar, .cmark')) {
      paints.push({
        what: `the ${each.dataset.series} ${each.classList.contains('cmark') ? 'glyph' : 'bar'}`,
        ink: getComputedStyle(each).backgroundColor,
        ground: groundOf(each),
        kind: 'graphic',
      });
    }

    return {
      missing: false,
      values,
      bars,
      marks,
      decoration: decoration.length,
      hidden,
      paints,
      tabStopsInside: [...charts.querySelectorAll('*')].filter((each) => each.tabIndex >= 0).length,
      // Every tab stop of the whole document, named by the composite it belongs
      // to. A Tab walk proves the stops it reaches; this proves there is no
      // second one it never got to.
      documentStops: [...document.querySelectorAll('*')]
        .filter(
          (each) =>
            each.tabIndex >= 0 &&
            !each.hasAttribute('disabled') &&
            each.getAttribute('aria-hidden') !== 'true',
        )
        .map((each) => (each.closest('[data-composite]') ?? each).dataset.el ?? 'unnamed')
        .sort(),
      charts: charts.querySelectorAll('[data-el^="chart-"]').length,
    };
  });
}

/**
 * The charts over the log — Unit 4.7, in a driven browser.
 *
 * Five things this file can judge and jsdom cannot: the bar lengths in real
 * pixels against a bound taken from the track, the glyph shapes as the engine
 * resolved them, the colours as the engine resolved them, real Tab presses, and
 * a 360 px layout.
 */
async function runStatistics(page, options, checks, design) {
  // A log worth charting: two pool sizes and a push under a rule set that does
  // not block one. The stress counter is reset first, because the third profile
  // blocks a push as soon as a stress die shows a bane.
  await clearLog(page);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('[data-el="roll-button"]', { timeout: 30000 });
  await chooseRuleset(page, 'pool-banes-damage-ratings');
  await pressTile(page, 'attribute', 'p', 3);
  let pushesPressed = 0;
  for (const round of [0, 1, 2, 3]) {
    if (round === 2) {
      if ((await page.$('[data-el="edit-pool-button"]')) !== null) {
        await page.click('[data-el="edit-pool-button"]');
        await settleScreen(page);
      }
      await pressTile(page, 'skill', 'p', 2);
    }
    await page.click('[data-el="roll-button"]');
    await settleScreen(page);
    const live = await page.evaluate(() => {
      const button = document.querySelector('[data-el="push-button"]');
      return button !== null && !button.disabled;
    });
    if (live) {
      await page.click('[data-el="push-button"]');
      pushesPressed += 1;
      await settleScreen(page);
    }
    await logHolds(page, round + 1);
  }

  await openHistory(page);
  await page.waitForSelector('[data-el="history-list"]', { timeout: 15000 });
  await page.click('[data-el="statistics-button"]');
  await page.waitForSelector('[data-el="history-stats"]', { timeout: 15000 });
  await settleScreen(page);

  // The oracle. `summariseLog` runs HERE, in node, over the rolls this file
  // read out of IndexedDB through its own connection. The page cannot build it:
  // this mode drives the BUILT bundle, which exports nothing.
  const statistics = await import('../src/log/statistics.ts');
  const rolls = (await readLogRolls(page)).rolls;
  const stats = statistics.summariseLog(rolls);
  const wanted = statisticsValues(stats, 'No roll has pushed yet.');
  const drawn = await readCharts(page);
  if (drawn.missing) {
    checks.push({
      name: 'statistics.the-destination-draws-the-charts',
      ok: false,
      detail: 'the destination holds no history-stats at all.',
    });
    return;
  }

  // ---- A. The charts draw the record, field by field. ----
  const drawnValues = new Map(drawn.values.map((each) => [each.path, each.text]));
  const wrong = [];
  for (const [path, value] of wanted) {
    if (drawnValues.get(path) !== value) {
      wrong.push(`${path}: drew ${JSON.stringify(drawnValues.get(path) ?? null)} for ${value}`);
    }
  }
  const stray = [...drawnValues.keys()].filter((path) => !wanted.has(path));
  // A value a screen reader cannot reach is a value the chart drew for one
  // reader only. The name is resolved through the table headers or the term
  // beside the value, never assumed.
  const unnamed = drawn.values.filter((each) => each.name === null || each.name === '');
  // The denominator, counted a second way: a sum over the shape of the record
  // rather than the size of the map that was just built.
  const wantedCount =
    1 + stats.byPoolSize.length * 5 + STATS_PUSH_FIELDS.length + STATS_COST_UNITS.length + 1 + 1;
  console.log(
    `browser: statistics values rolls=${rolls.length} pushes_pressed=${pushesPressed} ` +
      `pool_sizes=${stats.byPoolSize.length} fields=${wanted.size} counted=${wantedCount} ` +
      `drawn=${drawnValues.size} wrong=${wrong.length} stray=${stray.length} ` +
      `unnamed=${unnamed.length} charts=${drawn.charts}` +
      (wrong.length ? ` [${wrong.slice(0, 4).join('; ')}]` : '') +
      (unnamed.length ? ` [unnamed: ${unnamed.map((each) => each.path).join(', ')}]` : ''),
  );
  checks.push({
    name: 'statistics.every-chart-value-is-a-field-of-the-record',
    ok:
      rolls.length > 1 &&
      stats.byPoolSize.length > 1 &&
      stats.pushes.pushedRolls > 0 &&
      wanted.size === wantedCount &&
      drawnValues.size === wanted.size &&
      wrong.length === 0 &&
      stray.length === 0 &&
      unnamed.length === 0,
    detail:
      `${drawnValues.size} values were read off the charts and compared against the ` +
      `${wanted.size} fields of the record summariseLog returned IN NODE, over the ` +
      `${rolls.length} rolls a connection this file opened read out of IndexedDB. The ` +
      `denominator is counted a second way as a sum over the shape of the record: ` +
      `1 + ${stats.byPoolSize.length} pool sizes by 5 + ${STATS_PUSH_FIELDS.length} push fields ` +
      `+ ${STATS_COST_UNITS.length} cost units + 2 is ${wantedCount}, so a missing value is a ` +
      `red and not an unread cell. ${wrong.length} disagreed and ${stray.length} were drawn that ` +
      `the record does not hold. ${unnamed.length} are drawn where a screen reader reaches no ` +
      `name for them, resolved through the table headers or the term beside the value. The log ` +
      `carries more than one pool size and more than one pushed roll, so a chart of one row ` +
      `could not pass.` +
      (wrong.length ? ` [${wrong.slice(0, 4).join('; ')}]` : '') +
      (unnamed.length ? ` [unnamed: ${unnamed.map((each) => each.path).join(', ')}]` : ''),
  });

  // ---- B. Every bar is drawn at the length the record fixes, in pixels. ----
  //
  // The bound is the geometry's own: one device pixel over the width of the
  // track the bar lies in. Nothing here picks a forgiving number.
  const wantedBars = new Map();
  stats.byPoolSize.forEach((row, at) => {
    wantedBars.set(`byPoolSize.${at}.successRate`, row.successRate);
  });
  if (stats.pushes.pushedRolls > 0) {
    for (const id of STATS_OUTCOMES) {
      wantedBars.set(`pushes.${id}`, stats.pushes[id] / stats.pushes.pushedRolls);
    }
  }
  if (stats.paidOffRate !== null) wantedBars.set('paidOffRate', stats.paidOffRate);
  const barReadings = [];
  let barsCompared = 0;
  for (const bar of drawn.bars) {
    const want = wantedBars.get(bar.path);
    if (want === undefined || bar.trackPx <= 0) {
      barReadings.push(`${bar.path}: no record value or no track`);
      continue;
    }
    const share = bar.barPx / bar.trackPx;
    const bound = 1 / bar.trackPx;
    barsCompared += 1;
    if (Math.abs(share - want) > bound) {
      barReadings.push(
        `${bar.path}: drew ${share.toFixed(4)} of its track against ${want.toFixed(4)}, ` +
          `bound ${bound.toFixed(4)}`,
      );
    }
  }
  const trackWidths = drawn.bars.map((bar) => Math.round(bar.trackPx));
  console.log(
    `browser: statistics bars drawn=${drawn.bars.length} wanted=${wantedBars.size} ` +
      `compared=${barsCompared} off=${barReadings.length} tracks=[${trackWidths.join(',')}] ` +
      `lengths=[${drawn.bars.map((bar) => Math.round(bar.barPx)).join(',')}]` +
      (barReadings.length ? ` [${barReadings.slice(0, 4).join('; ')}]` : ''),
  );
  checks.push({
    name: 'statistics.every-bar-is-the-length-the-record-fixes',
    ok:
      wantedBars.size > 2 &&
      drawn.bars.length === wantedBars.size &&
      barsCompared === wantedBars.size &&
      barReadings.length === 0 &&
      drawn.bars.every((bar) => bar.inTrack && bar.trackPx > 0) &&
      new Set(drawn.bars.map((bar) => Math.round(bar.barPx))).size > 1,
    detail:
      `${barsCompared} bars were measured in real pixels against the ${wantedBars.size} the ` +
      `record fixes, and the bound is the geometry's own: one device pixel over the width of ` +
      `the track each bar lies in, which is [${trackWidths.join(', ')}] px this run. ` +
      `${barReadings.length} were outside it. The bars are not all one length, so a bar that ` +
      `filled its track whatever the number said could not pass.` +
      (barReadings.length ? ` [${barReadings.slice(0, 4).join('; ')}]` : ''),
  });

  // ---- C. Shape carries every meaning colour carries. ----
  const shapes = new Map(drawn.marks.map((mark) => [mark.series, mark.shape]));
  const outcomeShapes = new Set(STATS_OUTCOMES.map((id) => shapes.get(id)));
  const outcomeColours = new Set(
    STATS_OUTCOMES.map((id) => drawn.marks.find((m) => m.series === id)?.colour),
  );
  const invisible = drawn.marks.filter((mark) => mark.width <= 0 || mark.height <= 0);
  console.log(
    `browser: statistics shapes marks=${drawn.marks.length} series=${shapes.size} ` +
      `outcome_shapes=${outcomeShapes.size} outcome_colours=${outcomeColours.size} ` +
      `invisible=${invisible.length} decoration=${drawn.decoration} hidden=${drawn.hidden} ` +
      `[${[...shapes.entries()].map(([id, shape]) => `${id}=${shape}`).join(' | ')}]`,
  );
  checks.push({
    name: 'statistics.every-series-is-marked-by-shape-and-not-by-hue-alone',
    ok:
      shapes.size === STATS_SERIES.length &&
      STATS_SERIES.every((id) => shapes.has(id)) &&
      outcomeShapes.size === STATS_OUTCOMES.length &&
      outcomeColours.size === STATS_OUTCOMES.length &&
      shapes.get('success') === shapes.get('better') &&
      invisible.length === 0 &&
      drawn.decoration > 0 &&
      drawn.hidden === drawn.decoration,
    detail:
      `${shapes.size} series carry a glyph, against the ${STATS_SERIES.length} the view holds. ` +
      `The three push outcomes sit in one chart and the engine resolved ` +
      `${outcomeShapes.size} shapes and ${outcomeColours.size} colours for them, so a greyscale ` +
      `copy still separates them. A success and a gain share the circle on purpose. ` +
      `${invisible.length} glyphs drew no box. Every drawn mark is decoration a reader never ` +
      `meets: ${drawn.hidden} of ${drawn.decoration} glyphs and tracks sit under aria-hidden.`,
  });

  // ---- D. Contrast, on the colours the engine resolved. ----
  const failed = [];
  let tightest = { ratio: Infinity, what: '' };
  for (const paint of drawn.paints) {
    const floor = paint.kind === 'text' ? STATS_TEXT_FLOOR : STATS_NON_TEXT_FLOOR;
    const ratio = ratioOfRgb(paint.ink, paint.ground);
    if (ratio === null) {
      failed.push(`${paint.what}: unreadable colour ${paint.ink} on ${paint.ground}`);
      continue;
    }
    if (ratio < floor) failed.push(`${paint.what}: ${ratio.toFixed(2)} to 1 under ${floor}`);
    if (ratio < tightest.ratio) tightest = { ratio, what: paint.what };
  }
  console.log(
    `browser: statistics contrast measured=${drawn.paints.length} failed=${failed.length} ` +
      `tightest=${tightest.ratio.toFixed(2)} (${tightest.what})` +
      (failed.length ? ` [${failed.slice(0, 4).join('; ')}]` : ''),
  );
  checks.push({
    name: 'statistics.every-chart-colour-clears-its-wcag-floor',
    ok: drawn.paints.length > 12 && failed.length === 0 && tightest.ratio >= STATS_NON_TEXT_FLOOR,
    detail:
      `${drawn.paints.length} colours were read as the engine resolved them, each against the ` +
      `first ancestor that really paints one, and judged at the WCAG 2.2 floors: ` +
      `${STATS_TEXT_FLOOR} to 1 for text under SC 1.4.3 and ${STATS_NON_TEXT_FLOOR} to 1 for a ` +
      `graphical object under SC 1.4.11. ${failed.length} missed. The tightest reads ` +
      `${tightest.ratio.toFixed(2)} to 1 at ${tightest.what}. The same claim over all six ` +
      `interface palettes of Unit 4.8 runs in src/shell/statistics.test.tsx.` +
      (failed.length ? ` [${failed.slice(0, 4).join('; ')}]` : ''),
  });

  // ---- E. The charts are reached and left by keyboard alone. ----
  //
  // **The two Enter presses come before the walk, and the reason is measured.**
  // A Tab walk ends by pressing Tab off the end of the document, where Firefox
  // hands the focus to its own chrome, and no key press reaches the page after
  // that. Measured on this host on 2026-08-10: the same Enter that works here
  // timed out when it followed the walk.
  const statsControls = designViewControls(design, 'Statistics');
  const named = await page.evaluate(() => {
    const back = document.querySelector('[data-el="back-button"]');
    return {
      tag: back?.tagName ?? null,
      name: (back?.textContent ?? '').trim(),
      state: back?.getAttribute('aria-disabled') ?? null,
      height: back === null ? 0 : Math.round(back.getBoundingClientRect().height),
    };
  });
  // Back returns to the summary, and the summary carries the control that led
  // here. Both counts come out of the design and neither is restated.
  await page.focus('[data-el="back-button"]');
  await page.keyboard.press('Enter');
  // A press that landed somewhere else is a red and not a crash, so the wait
  // is allowed to time out and the reading below says where the press went.
  await page.waitForSelector('[data-el="history-list"]', { timeout: 8000 }).catch(() => null);
  await settleScreen(page);
  const backLanded = await page.evaluate(() => ({
    list: document.querySelector('[data-el="history-list"]') !== null,
    charts: document.querySelector('[data-el="history-stats"]') !== null,
    dice: document.querySelector('[data-el="roll-button"]') !== null,
  }));
  // And a real press on the control opens the charts again, with the focus on
  // something rather than on nothing. The destination is re-opened first when
  // the press above left it, so the rest of the run still reports.
  if (!backLanded.list) {
    if (backLanded.dice) await openHistory(page);
    await page.waitForSelector('[data-el="history-list"]', { timeout: 8000 }).catch(() => null);
  }
  await page.focus('[data-el="statistics-button"]');
  await page.keyboard.press('Enter');
  await page.waitForSelector('[data-el="history-stats"]', { timeout: 15000 });
  await settleScreen(page);
  const afterEnter = await page.evaluate(() => ({
    charts: document.querySelector('[data-el="history-stats"]') !== null,
    focus: document.activeElement?.getAttribute('data-el') ?? 'nothing',
  }));
  // The walk runs last, and its cap allows for the one stop the browser adds to
  // a scrollable region. Section 6 of the design names that stop and says it is
  // reported rather than counted.
  await startWalkAt(page, 'history-header');
  const walked = (await walkShell(page, statsControls.names.length + 2)).filter(
    (visit) => !visit.implicit,
  );
  const stops = walked.filter((visit) => visit.by === 'tab').map((visit) => visit.name);
  console.log(
    `browser: statistics keyboard stats_stops=[${stops.join(' ')}] ` +
      `design_stats=[${statsControls.names.join(' ')}] stated=${statsControls.stated} ` +
      `back_landed=list:${backLanded.list}/charts:${backLanded.charts}/dice:${backLanded.dice} ` +
      `back=${named.tag}/${named.state}/${named.height}px charts_after_enter=${afterEnter.charts} ` +
      `focus_after_enter=${afterEnter.focus} inside_tab_stops=${drawn.tabStopsInside} ` +
      `document_stops=[${drawn.documentStops.join(' ')}]`,
  );
  checks.push({
    name: 'statistics.the-charts-are-reached-and-left-by-keyboard-alone',
    ok:
      statsControls.stated > 0 &&
      statsControls.names.length === statsControls.stated &&
      stops.slice().sort().join(' ') === statsControls.names.join(' ') &&
      drawn.documentStops.join(' ') === statsControls.names.join(' ') &&
      backLanded.list &&
      !backLanded.charts &&
      !backLanded.dice &&
      named.tag === 'BUTTON' &&
      named.name.length > 0 &&
      named.state === 'false' &&
      named.height >= 24 &&
      drawn.tabStopsInside === 0 &&
      afterEnter.charts &&
      afterEnter.focus === 'back-button',
    detail:
      `real Tab presses reached [${stops.join(' ')}] in the statistics view, against the ` +
      `[${statsControls.names.join(' ')}] section 3 of the design names for it, read out of the ` +
      `document and never restated, and against the ${statsControls.stated} that row states in ` +
      `its own count column. A real Enter on back returned to the SUMMARY and not to the dice ` +
      `(list=${backLanded.list} charts=${backLanded.charts} dice=${backLanded.dice}), because the ` +
      `charts are a view of the destination and not a second destination. A real Enter on ` +
      `statistics-button opened the charts again ` +
      `(${afterEnter.charts}) and the focus landed on ${afterEnter.focus}. The back control is a ` +
      `${named.tag} named "${named.name}" carrying aria-disabled=${named.state}, ` +
      `${named.height} px tall against the 24 px floor of WCAG 2.2 SC 2.5.8. The charts hold ` +
      `${drawn.tabStopsInside} tab stops, because section 3 lists them under the read-only parts. ` +
      `A walk proves the stops it reached, so the claim that it missed none is carried by a ` +
      `count of every tab stop in the document: [${drawn.documentStops.join(' ')}].`,
  });

  // ---- F. The charts fit a phone, and nothing runs off the side of it. ----
  await page.setViewport({ width: 360, height: 760, deviceScaleFactor: 1 });
  await settleScreen(page);
  const phone = await page.evaluate(() => {
    const charts = document.querySelector('[data-el="history-stats"]');
    const middle = document.querySelector('[data-el="history-mid"]');
    if (charts === null || middle === null) return null;
    // An element wider than the phone is a defect only where a box of its own
    // scrolls sideways to reach it. A chart table sits in `.hist-mx-scroll`,
    // which degrades by scrolling and never by clipping. Decision 6.
    //
    // **The container is named, and the reason is measured.** A walk for any
    // ancestor whose computed `overflow-x` is auto or scroll exempts
    // everything: `.shell-m` sets `overflow-y: auto`, and CSS then computes its
    // `overflow-x` to `auto` as well, so every element of the destination has
    // such an ancestor and the count can never rise. Measured on this host on
    // 2026-08-10, with a 900 px meter injected: that walk reported 0.
    const over = [...charts.querySelectorAll('*')].filter(
      (each) =>
        each.getBoundingClientRect().right > window.innerWidth + 1 &&
        each.closest('.hist-mx-scroll') === null,
    );
    const boxes = [...charts.querySelectorAll('[data-el^="chart-"], .chart-meter')].map((each) => {
      const box = each.getBoundingClientRect();
      return {
        name: each.dataset.el ?? 'chart-meter',
        w: Math.round(box.width),
        h: Math.round(box.height),
      };
    });
    return {
      over: over.length,
      overNames: over.slice(0, 4).map((each) => each.className || each.tagName),
      boxes,
      scrolls: middle.scrollHeight > middle.clientHeight,
      reach: middle.scrollHeight,
      clientHeight: middle.clientHeight,
      // The page's own middle region must not scroll sideways at all. A
      // sideways scroll here is the whole screen moving, not one table.
      sideways: middle.scrollWidth > middle.clientWidth + 1,
      scrollWidth: middle.scrollWidth,
      clientWidth: middle.clientWidth,
      viewport: window.innerWidth,
    };
  });
  console.log(
    `browser: statistics phone viewport=${phone?.viewport} over_side=${phone?.over} ` +
      `boxes=[${(phone?.boxes ?? []).map((box) => `${box.name} ${box.w}x${box.h}`).join(' | ')}] ` +
      `middle_scrolls=${phone?.scrolls} reach=${phone?.reach}/${phone?.clientHeight} ` +
      `sideways=${phone?.sideways} width=${phone?.scrollWidth}/${phone?.clientWidth}`,
  );
  checks.push({
    name: 'statistics.the-charts-fit-a-phone-and-nothing-runs-off-the-side',
    ok:
      phone !== null &&
      phone.over === 0 &&
      !phone.sideways &&
      phone.boxes.length === 3 &&
      phone.boxes.every((box) => box.w > 0 && box.h > 0),
    detail:
      `at ${phone?.viewport} px, ${phone?.over} elements of the charts sit off the side of the ` +
      `viewport outside a box of their own that scrolls sideways, and the three charts draw ` +
      `[${(phone?.boxes ?? []).map((box) => `${box.name} ${box.w}x${box.h}`).join(', ')}]. A ` +
      `chart table sits in .hist-mx-scroll and degrades by scrolling rather than by clipping, ` +
      `which is Decision 6, so such a table is not counted. The page's own middle region must ` +
      `not scroll sideways at all, and it holds ${phone?.scrollWidth} px of content in ` +
      `${phone?.clientWidth} px (sideways=${phone?.sideways}). It scrolls down as the design ` +
      `requires: ${phone?.scrolls}, ${phone?.reach} px of content in ${phone?.clientHeight} px.` +
      (phone?.over ? ` [${(phone.overNames ?? []).join('; ')}]` : ''),
  });

  // ---- G. The captures the owner looks at. ----
  if (options.captureShell !== null) {
    for (const width of [360, 1440]) {
      await page.setViewport({ width, height: width === 360 ? 760 : 900, deviceScaleFactor: 1 });
      await settleScreen(page);
      await new Promise((done) => setTimeout(done, 200));
      writeFileSync(
        join(options.captureShell, `0018-history-stats-${width}.png`),
        await page.screenshot({ type: 'png' }),
      );
    }
    console.log(`browser: statistics captures written to ${options.captureShell}`);
  }
  await page.setViewport({ width: options.viewport.width, height: options.viewport.height });
  await settleScreen(page);
  // The destination is left on the summary, which is the view the caller's own
  // capture step expects to close from. A press that lands elsewhere is already
  // a red above, so this step recovers rather than throwing.
  await page.click('[data-el="back-button"]');
  await page.waitForSelector('[data-el="history-list"]', { timeout: 8000 }).catch(() => null);
  if ((await page.$('[data-el="history-list"]')) === null) await openHistory(page);
  await settleScreen(page);
}

async function runHistory(page, options, checks) {
  const design = readFileSync(join(here, '..', 'docs', 'design', '0002-screen-design.md'), 'utf8');
  await page.evaluate(() => {
    try {
      localStorage.clear();
    } catch {
      // A browser that refuses storage answers the defaults anyway.
    }
  });
  await clearLog(page);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('[data-el="roll-button"]', { timeout: 30000 });

  // ---- 1. A roll writes exactly one entry, and a push rewrites that entry. ----
  //
  // The pool is small and holds no stress die, so a push is never blocked by a
  // stress bane and the run does not depend on the faces that landed.
  await pressTile(page, 'attribute', 'p', 4);
  await pressTile(page, 'skill', 'p', 3);

  let rollsPressed = 0;
  let pushesPressed = 0;
  const perRoll = [];
  for (let round = 0; round < 4; round += 1) {
    await page.click('[data-el="roll-button"]');
    rollsPressed += 1;
    await settleScreen(page);
    let pushedHere = 0;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const live = await page.evaluate(() => {
        const button = document.querySelector('[data-el="push-button"]');
        return button !== null && !button.disabled;
      });
      if (!live) break;
      await page.click('[data-el="push-button"]');
      pushesPressed += 1;
      pushedHere += 1;
      await settleScreen(page);
    }
    perRoll.push(pushedHere);
    await logHolds(page, rollsPressed);
  }

  const written = await logHolds(page, rollsPressed);
  const rolls = written.rolls;
  const rollIds = new Set(rolls.map((entry) => entry.rollId));
  const pushesStored = rolls.reduce((total, entry) => total + entry.pushCount, 0);
  const generationsStored = rolls.reduce(
    (total, entry) => total + Math.max(0, ...entry.dice.map((die) => die.cells.length)) - 1,
    0,
  );
  console.log(
    `browser: history rolls_pressed=${rollsPressed} pushes_pressed=${pushesPressed} ` +
      `entries=${rolls.length} distinct_roll_ids=${rollIds.size} ` +
      `push_count_sum=${pushesStored} generations_sum=${generationsStored} ` +
      `per_roll=[${perRoll.join(',')}] keys=${written.keys.length} error=${written.error}`,
  );
  checks.push({
    name: 'history.a-roll-writes-one-entry-and-a-push-rewrites-it',
    ok:
      written.error === null &&
      rollsPressed > 1 &&
      pushesPressed > 0 &&
      rolls.length === rollsPressed &&
      rollIds.size === rolls.length &&
      pushesStored === pushesPressed &&
      generationsStored === pushesPressed,
    detail:
      `${rollsPressed} presses on Roll and ${pushesPressed} on Push put ${rolls.length} ` +
      `entries in IndexedDB, under ${rollIds.size} distinct roll ids. The stored push counts ` +
      `add up to ${pushesStored} and the stored generations add up to ${generationsStored}, ` +
      `each against the ${pushesPressed} pushes this run pressed. The denominator is counted ` +
      `three ways: the presses, the entries, and the generations inside them. One entry per ` +
      `roll is what the shape of the log requires — one LogEntry holds every generation, and ` +
      `src/log/csv.ts rejects a file where one roll_id appears twice. The rolls are read back ` +
      `through a connection this harness opened, never through the application. ` +
      `Read error: ${written.error}.`,
  });

  // ---- 2. The stored hash is the hash of the profile the roll ran under. ----
  //
  // Units 4.1 and 4.2 make the profile changeable at run time and Decision 10
  // clears the table on a change, so the two rolls below are two throws under
  // two rule sets and never one roll re-priced.
  await clearLog(page);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('[data-el="roll-button"]', { timeout: 30000 });
  // The pool is not stored, so a reload empties the tiles. A roll of no dice is
  // an automatic failure that puts nothing on the table and writes no entry,
  // which would leave this check measuring an empty log.
  await pressTile(page, 'attribute', 'p', 3);
  await page.click('[data-el="roll-button"]');
  await logHolds(page, 1);
  const beforeChange = await diceOnTable(page);
  await openSheet(page);
  const chosen = await page.evaluate(() => {
    const inputs = [...document.querySelectorAll('[data-el="sheet-ruleset"] input')];
    const before = inputs.find((input) => input.checked)?.value ?? null;
    const other = inputs.find((input) => !input.checked);
    other?.click();
    return { before, after: other?.value ?? null };
  });
  await closeSheet(page);
  const cleared = await diceOnTable(page);
  await page.click('[data-el="roll-button"]');
  const bothWritten = await logHolds(page, 2);
  const hashes = bothWritten.rolls.map((entry) => entry.profileHash);
  const rulesets = bothWritten.rolls.map((entry) => entry.ruleset);
  const shaped = hashes.filter((hash) => /^[0-9a-f]{64}$/.test(hash));
  console.log(
    `browser: history profile_change ${chosen.before} -> ${chosen.after} ` +
      `dice_before=${beforeChange} cleared_table=${cleared} ` +
      `entries=${bothWritten.rolls.length} ` +
      `rulesets=[${rulesets.join(', ')}] distinct_hashes=${new Set(hashes).size} ` +
      `sha256_shaped=${shaped.length} first=${(hashes[0] ?? '').slice(0, 12)} ` +
      `second=${(hashes[1] ?? '').slice(0, 12)}`,
  );
  checks.push({
    name: 'history.the-stored-hash-is-the-profile-the-roll-ran-under',
    ok:
      bothWritten.rolls.length === 2 &&
      chosen.before !== null &&
      chosen.after !== null &&
      chosen.before !== chosen.after &&
      beforeChange > 0 &&
      cleared === 0 &&
      rulesets[0] === chosen.before &&
      rulesets[1] === chosen.after &&
      new Set(hashes).size === 2 &&
      shaped.length === 2,
    detail:
      `the rule set moved from ${chosen.before} to ${chosen.after} between the two rolls, and ` +
      `the change took the table from ${beforeChange} dice to ${cleared}, which is Decision 10. ` +
      `The two entries ` +
      `name [${rulesets.join(', ')}] and carry ${new Set(hashes).size} distinct digests, ` +
      `${shaped.length} of the 2 shaped as SHA-256: ${(hashes[0] ?? '').slice(0, 12)}... and ` +
      `${(hashes[1] ?? '').slice(0, 12)}.... A hash re-derived from the profile in force today ` +
      `would read the same twice, which is the defect specs/0001-rules-model.md names.`,
  });

  // ---- 3. The summary list length follows the log. ----
  //
  // The count off the screen and the count off the store are two separate
  // readings, so a list that agreed with itself would still fail.
  await clearLog(page);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('[data-el="roll-button"]', { timeout: 30000 });
  await pressTile(page, 'attribute', 'p', 3);
  const lengths = [];
  for (let round = 0; round < 3; round += 1) {
    await page.click('[data-el="roll-button"]');
    await logHolds(page, round + 1);
    await openSheet(page);
    await page.click('[data-el="sheet-history"]');
    await page.waitForSelector('[data-el="history"]', { timeout: 15000 });
    await settleScreen(page);
    const drawn = await page.evaluate(
      () => document.querySelectorAll('[data-el="history-list"] [role="option"]').length,
    );
    const inStore = (await readLogRolls(page)).rolls.length;
    lengths.push({ round: round + 1, drawn, inStore });
    await page.click('[data-el="back-button"]');
    await page.waitForSelector('[data-el="roll-button"]', { timeout: 15000 });
  }
  const agreed = lengths.filter((each) => each.drawn === each.inStore && each.drawn === each.round);
  console.log(
    `browser: history list ${lengths
      .map((each) => `pressed=${each.round} drawn=${each.drawn} in_store=${each.inStore}`)
      .join(' | ')}`,
  );
  checks.push({
    name: 'history.the-summary-list-length-follows-the-log',
    ok: lengths.length === 3 && agreed.length === lengths.length,
    detail:
      `${agreed.length} of ${lengths.length} readings agree across three counts: the presses ` +
      `this run made, the options the list drew, and the rolls a second connection read out of ` +
      `IndexedDB. ` +
      `[${lengths
        .map((each) => `${each.round} pressed / ${each.drawn} drawn / ${each.inStore} stored`)
        .join(' | ')}].`,
  });

  // ---- 4. The destination is operable by keyboard alone. ----
  await openSheet(page);
  await page.click('[data-el="sheet-history"]');
  await page.waitForSelector('[data-el="history-list"]', { timeout: 15000 });
  await settleScreen(page);
  await startWalkAt(page, 'history-header');
  const walked = await walkShell(page, 12);
  const authored = walked.filter((visit) => !visit.implicit);
  const tabStops = authored.filter((visit) => visit.by === 'tab').map((visit) => visit.name);
  const arrowVisits = authored.filter((visit) => visit.by === 'arrow').map((visit) => visit.name);
  const inStore = (await readLogRolls(page)).rolls.length;
  const named = await page.evaluate(() => {
    const list = document.querySelector('[data-el="history-list"]');
    const options = [...(list?.querySelectorAll('[role="option"]') ?? [])];
    const note = document.querySelector('[data-el="history-storage-note"]');
    return {
      listRole: list?.getAttribute('role') ?? null,
      listName: list?.getAttribute('aria-label') ?? null,
      roving: options.filter((option) => option.tabIndex === 0).length,
      unnamed: options.filter((option) => (option.getAttribute('aria-label') ?? '') === '').length,
      stateless: options.filter((option) => option.getAttribute('aria-selected') === null).length,
      short: options.filter((option) => option.getBoundingClientRect().height < 24).length,
      options: options.length,
      noteRole: note?.getAttribute('role') ?? null,
      noteText: note?.textContent ?? '',
      backName: document.querySelector('[data-el="back-button"]')?.textContent ?? '',
    };
  });
  // Enter on an option opens the record, and the focus must land somewhere.
  await page.evaluate(() => {
    document.querySelector('[data-el="history-list"] [role="option"]')?.focus();
  });
  await page.keyboard.press('Enter');
  await page.waitForSelector('[data-el="history-record"]', { timeout: 15000 });
  // Preact runs `useEffect` after the paint, so the focus the record takes
  // lands one frame after the record is in the document. The wait is two
  // frames, which is what `settleScreen` gives.
  await settleScreen(page);
  const afterEnter = await page.evaluate(() => ({
    record: document.querySelector('[data-el="history-record"]') !== null,
    focus:
      document.activeElement?.getAttribute('data-el') ??
      document.activeElement?.tagName ??
      'nothing',
  }));
  const summaryControls = design
    .slice(
      design.indexOf('### The history is a separate destination'),
      design.indexOf('###', design.indexOf('### The history is a separate destination') + 1),
    )
    .split('\n')
    .find((line) => line.trim().startsWith('| Summary'));
  const wantedControls = [...(summaryControls ?? '').matchAll(/`([a-z-]+)`/g)]
    .map((match) => match[1])
    .sort();
  // The row states its own count as well, so the table cannot disagree with
  // itself and this check never carries a number of its own.
  const statedControls = Number((summaryControls ?? '').split('|').map((cell) => cell.trim())[3]);
  console.log(
    `browser: history keyboard tab_stops=[${tabStops.join(' ')}] ` +
      `arrow_visits=${arrowVisits.length} options=${named.options} in_store=${inStore} ` +
      `roving=${named.roving} unnamed=${named.unnamed} stateless=${named.stateless} ` +
      `short=${named.short} list_role=${named.listRole} note_role=${named.noteRole} ` +
      `record_after_enter=${afterEnter.record} focus_after_enter=${afterEnter.focus}`,
  );
  checks.push({
    name: 'history.the-destination-is-operable-by-keyboard-alone',
    ok:
      wantedControls.length === statedControls &&
      statedControls > 0 &&
      tabStops.slice().sort().join(' ') === wantedControls.join(' ') &&
      named.listRole === 'listbox' &&
      (named.listName ?? '').length > 0 &&
      named.options === inStore &&
      arrowVisits.length === inStore &&
      named.roving === 1 &&
      named.unnamed === 0 &&
      named.stateless === 0 &&
      named.short === 0 &&
      afterEnter.record &&
      afterEnter.focus === 'back-button',
    detail:
      `real Tab presses reached [${tabStops.join(' ')}] against the ` +
      `[${wantedControls.join(' ')}] section 3 of the design names for the summary view, read ` +
      `out of the document and never restated, against the ${statedControls} that row states in ` +
      `its own count column. The list is one tab stop with ${named.roving} ` +
      `roving index and the arrows reached ${arrowVisits.length} rows against the ${inStore} ` +
      `rolls a second connection read out of IndexedDB. Every option carries a role, a name ` +
      `and a state: ${named.unnamed} without a name, ${named.stateless} without a state, and ` +
      `${named.short} under the 24 px floor of WCAG 2.2 SC 2.5.8. A real Enter opened the ` +
      `record (${afterEnter.record}) and the focus landed on ${afterEnter.focus}.`,
  });

  // ---- 5. The seven-day note reaches the player. ----
  await page.click('[data-el="back-button"]');
  await page.waitForSelector('[data-el="history-list"]', { timeout: 15000 });
  const notePlan =
    named.noteText.includes('seven days') &&
    named.noteText.toLowerCase().includes('home screen') &&
    named.noteText.toLowerCase().includes('export');
  const seen = await page.evaluate(() => {
    const note = document.querySelector('[data-el="history-storage-note"]');
    if (note === null) return null;
    const box = note.getBoundingClientRect();
    return { width: Math.round(box.width), height: Math.round(box.height), text: note.textContent };
  });
  console.log(
    `browser: history note role=${named.noteRole} on_plan=${notePlan} ` +
      `box=${seen?.width}x${seen?.height} text="${(seen?.text ?? '').slice(0, 60)}..."`,
  );
  checks.push({
    name: 'history.the-seven-day-note-reaches-the-player',
    ok:
      named.noteRole === 'note' &&
      notePlan &&
      seen !== null &&
      seen.width > 0 &&
      seen.height > 0 &&
      seen.text === named.noteText,
    detail:
      `the note carries role=${named.noteRole} and draws ${seen?.width}x${seen?.height} px, so ` +
      `it is on the screen and not only in the markup. It names the seven days, the home ` +
      `screen and the export the plan asks for: ${notePlan}. "${named.noteText}"`,
  });

  // ---- 6. The storage estimate reaches the settings sheet. ----
  await page.click('[data-el="back-button"]');
  await page.waitForSelector('[data-el="roll-button"]', { timeout: 15000 });
  await openSheet(page);
  await page.waitForFunction(
    () =>
      (document.querySelector('[data-el="sheet-storage-estimate"]')?.textContent ?? '').includes(
        'MB',
      ),
    { timeout: 15000 },
  );
  const estimate = await page.evaluate(() => {
    const shown = document.querySelector('[data-el="sheet-storage-estimate"]');
    return {
      text: shown?.textContent ?? '',
      role: shown?.getAttribute('role') ?? null,
      tabIndex: shown?.tabIndex ?? 0,
    };
  });
  const real = await page.evaluate(async () => {
    const held = await navigator.storage.estimate();
    return { usage: held.usage ?? null, quota: held.quota ?? null };
  });
  const shownUsage = Number(/uses ([0-9.]+) MB/.exec(estimate.text)?.[1] ?? NaN);
  const wantedUsage = Number((real.usage / 1048576).toFixed(1));
  console.log(
    `browser: history storage text="${estimate.text}" role=${estimate.role} ` +
      `usage=${real.usage} quota=${real.quota} shown_mb=${shownUsage} wanted_mb=${wantedUsage}`,
  );
  checks.push({
    name: 'history.the-storage-estimate-reaches-the-settings-sheet',
    ok:
      estimate.role === 'status' &&
      estimate.tabIndex < 0 &&
      Number.isFinite(shownUsage) &&
      shownUsage === wantedUsage &&
      real.quota !== null,
    detail:
      `the sheet prints "${estimate.text}" in a live region (role=${estimate.role}) that holds ` +
      `no tab stop (tabIndex=${estimate.tabIndex}). It reads ${shownUsage} MB against the ` +
      `${wantedUsage} MB navigator.storage.estimate() answers this run, over a quota of ` +
      `${real.quota} bytes. The plan asks this unit to show estimate() in settings.`,
  });

  // ---- 7 to 13: the record, the matrix, the export and the import. ----
  await closeSheet(page);
  await runRecordAndExport(page, options, checks, design);

  // ---- 14 to 19: the charts — Unit 4.7. ----
  await runStatistics(page, options, checks, design);

  // ---- 12. The captures the owner looks at. ----
  //
  // The record capture is thrown large on purpose. Decision 3 transposed the
  // matrix because one column per die does not fit a phone, so the case worth
  // looking at is a wide pool over several generations, on a phone.
  if (options.captureShell !== null) {
    await page.evaluate(() => {
      if (document.querySelector('[data-el="history"]') === null) return;
      document.querySelector('[data-el="back-button"]')?.click();
    });
    await page.waitForSelector('[data-el="roll-button"]', { timeout: 15000 });
    // The first rule set, and a stress counter back at zero. The third rule set
    // blocks a push as soon as a stress die shows a bane, and the stress this
    // run built up made that the usual outcome, so the record drew one column
    // and showed nothing of what Decision 3 is about.
    await chooseRuleset(page, 'pool-banes-damage-ratings');
    await openSheet(page);
    await page.click('[data-el="sheet-stress-reset"]');
    await closeSheet(page);
    // A throw collapses the builder, so the tiles come back through `Edit pool`.
    if ((await page.$('[data-el="edit-pool-button"]')) !== null) {
      await page.click('[data-el="edit-pool-button"]');
      await settleScreen(page);
    }
    await pressTile(page, 'attribute', 'p', 5);
    await pressTile(page, 'skill', 'p', 5);
    await pressTile(page, 'gear', 'p', 3);
    await pressTile(page, 'bonus', 'p', 2);
    await page.click('[data-el="roll-button"]');
    await settleScreen(page);
    // One die kept by hand, so the capture shows a dot as well as a throw.
    await page.evaluate(() => {
      document.querySelector('[data-el^="die-"][aria-pressed="false"]')?.click();
    });
    await settleScreen(page);
    for (let push = 0; push < 2; push += 1) {
      const live = await page.evaluate(() => {
        const button = document.querySelector('[data-el="push-button"]');
        return button !== null && !button.disabled;
      });
      if (!live) break;
      await page.click('[data-el="push-button"]');
      await settleScreen(page);
    }
    await logHolds(page, 2);
    await openHistory(page);
    await page.waitForSelector('[data-el="history-list"]', { timeout: 15000 });
    for (const width of [360, 1440]) {
      await page.setViewport({ width, height: width === 360 ? 760 : 900, deviceScaleFactor: 1 });
      await settleScreen(page);
      await new Promise((done) => setTimeout(done, 200));
      writeFileSync(
        join(options.captureShell, `0016-history-${width}.png`),
        await page.screenshot({ type: 'png' }),
      );
      // The record, with the transposed matrix Unit 4.5 put in it. It carries
      // its own number, so the shell captures of Unit 4.4 stay as that unit's
      // own evidence.
      await page.evaluate(() => {
        document.querySelector('[data-el="history-list"] [role="option"]')?.click();
      });
      await page.waitForSelector('[data-el="history-record"]', { timeout: 15000 });
      await settleScreen(page);
      await new Promise((done) => setTimeout(done, 200));
      writeFileSync(
        join(options.captureShell, `0017-history-record-${width}.png`),
        await page.screenshot({ type: 'png' }),
      );
      await page.click('[data-el="back-button"]');
      await page.waitForSelector('[data-el="history-list"]', { timeout: 15000 });
    }
    console.log(`browser: history captures written to ${options.captureShell}`);
  }
}

// ---------------------------------------------------------------------------
// The sound controls in the application — Unit 3.6, the interface half
//
// The engine half already proved the engine: no context until the player asks,
// silence while sound is off, a context born suspended, and every collision
// accounted for. All of that ran against an engine this file wired up by hand.
//
// This mode drives the SHIPPED application. The player turns sound on through
// the real control with real key presses, sets a level with real arrow presses,
// and rolls. Two numbers are counted here and neither one is the engine's: the
// contexts the page constructed, and the voices the browser's own audio really
// started. The level is read off the `GainNode` the engine built, never off the
// record it came from.
// ---------------------------------------------------------------------------

/** Where the arrow keys take the volume. Neither is a default of anything. */
const LOUD_VOLUME = 0.75;
const QUIET_VOLUME = 0.25;

/**
 * Count what the browser's own audio really did.
 *
 * `createBufferSource` is the call every voice starts with, and it belongs to
 * the browser rather than to this application. A count taken here is therefore
 * a second enumeration of the voices, and a synthesiser that was wired up and
 * never gated cannot hide inside its own counters.
 */
const AUDIO_PROBE = `
window.__audio = { built: 0, voices: 0, started: 0 };
{
  const Real = window.AudioContext;
  window.AudioContext = new Proxy(Real, {
    construct(target, args) {
      window.__audio.built += 1;
      return Reflect.construct(target, args);
    },
  });
  const make = Real.prototype.createBufferSource;
  Real.prototype.createBufferSource = function () {
    window.__audio.voices += 1;
    const node = make.call(this);
    const start = node.start.bind(node);
    node.start = (...args) => {
      window.__audio.started += 1;
      return start(...args);
    };
    return node;
  };
}
`;

/** What the page knows about its own sound, at this instant. */
async function readSoundControls(page) {
  return page.evaluate(() => {
    const engine = window.__clatterSound ?? null;
    const output = engine?.output ?? null;
    const stored = JSON.parse(window.localStorage.getItem('clatter.settings') ?? '{}');
    return {
      audio: { ...window.__audio },
      hasEngine: engine !== null,
      enabled: engine?.enabled ?? null,
      counts: engine === null ? null : { ...engine.counts },
      // The level as the audio graph carries it. `GainNode.gain` is an
      // AudioParam of a real node the engine built, so this is the graph and
      // not the setting that fed it.
      gain: output === null ? null : output.gain.value,
      isGainNode: output === null ? null : output instanceof GainNode,
      contextState: engine?.context?.state ?? null,
      storedEnabled: stored.soundEnabled ?? null,
      storedVolume: stored.soundVolume ?? null,
    };
  });
}

/** Tab forward from a named control until the wanted one takes the focus. */
async function tabUntil(page, start, wanted, limit = 30) {
  await page.focus(`[data-el="${start}"]`);
  const seen = [];
  for (let step = 0; step < limit; step += 1) {
    await page.keyboard.press('Tab');
    const at = await page.evaluate(
      () => document.activeElement?.getAttribute('data-el') ?? document.activeElement?.tagName,
    );
    seen.push(at);
    if (at === wanted) return { reached: true, presses: step + 1, seen };
  }
  return { reached: false, presses: limit, seen };
}

/** What a reader meets at one control: its role, its name and its state. */
async function readControlSemantics(page, name) {
  return page.evaluate((el) => {
    const control = document.querySelector(`[data-el="${el}"]`);
    if (control === null) return null;
    const label = control.closest('label');
    const box = control.getBoundingClientRect();
    return {
      role:
        control.getAttribute('role') ??
        (control.tagName === 'INPUT' ? control.type : control.tagName.toLowerCase()),
      name: (control.getAttribute('aria-label') ?? label?.textContent ?? control.textContent ?? '')
        .replace(/\s+/g, ' ')
        .trim(),
      state:
        control.type === 'checkbox'
          ? String(control.checked)
          : (control.getAttribute('aria-valuetext') ?? String(control.value)),
      value: control.value ?? null,
      width: Math.round(box.width),
      height: Math.round(box.height),
    };
  }, name);
}

async function runSoundControls(page, options, checks) {
  await page.evaluate(AUDIO_PROBE);
  await page.evaluate(TABLE_HELPERS);
  await page.evaluate(() => {
    try {
      localStorage.clear();
    } catch {
      /* a browser that refuses storage answers the defaults anyway */
    }
  });
  await page.reload({ waitUntil: 'load' });
  await page.evaluate(AUDIO_PROBE);
  await page.evaluate(TABLE_HELPERS);
  await page.waitForSelector('[data-el="disclosure-toggle"]', { timeout: 30000 });

  const opening = await page.evaluate(() => window.__table.read());
  const onTheTable = opening.renderer === 'tray';
  const why =
    'the startup probe answered below the bar, so the screen draws flat dice, mounts no table ' +
    'and reports no collision. There is no WebGL context inside the sandbox. Run this mode ' +
    'with the sandbox off.';
  const judge = (name, ok, detail) =>
    checks.push(
      onTheTable
        ? { name, ok, detail }
        : { name, ok: true, skipped: true, detail: `NOT JUDGED: ${why}` },
    );
  if (!onTheTable) console.log(`browser: sound-controls renderer=${opening.renderer} NOT JUDGED`);

  // A pool worth hearing. Six attribute dice make a throw of six collisions or
  // more, and the count is measured rather than assumed below.
  await pressTile(page, 'attribute', 'p', 6);

  // ---- 1. A roll with sound off ------------------------------------------
  await page.click('[data-el="roll-button"]');
  await page.evaluate(() => window.__table.settle(1));
  const silent = await readSoundControls(page);
  console.log(
    `browser: sound-controls OFF contexts=${silent.audio.built} voices=${silent.audio.voices} ` +
      `started=${silent.audio.started} impacts=${silent.counts?.impacts ?? 'none'} ` +
      `triggers=${silent.counts?.triggers ?? 'none'} engine=${silent.hasEngine}`,
  );

  // ---- 2. The player turns sound on, with the keyboard alone --------------
  await openSheet(page);
  const walked = await tabUntil(page, 'sheet-tray-renderer', 'sheet-sound-toggle');
  const toggleBefore = await readControlSemantics(page, 'sheet-sound-toggle');
  await page.keyboard.press(' ');
  await settleScreen(page);
  const toggleAfter = await readControlSemantics(page, 'sheet-sound-toggle');
  const afterEnable = await readSoundControls(page);

  // ---- 3. The level, set by real arrow presses ----------------------------
  const toVolume = await tabUntil(page, 'sheet-sound-toggle', 'sheet-sound-volume', 3);
  const stepsUp = Math.round((LOUD_VOLUME - 0.5) / 0.05);
  for (let press = 0; press < stepsUp; press += 1) await page.keyboard.press('ArrowRight');
  await settleScreen(page);
  const loud = await readSoundControls(page);
  const loudControl = await readControlSemantics(page, 'sheet-sound-volume');
  const stepsDown = Math.round((LOUD_VOLUME - QUIET_VOLUME) / 0.05);
  for (let press = 0; press < stepsDown; press += 1) await page.keyboard.press('ArrowLeft');
  await settleScreen(page);
  const quiet = await readSoundControls(page);
  // Read while the sheet is open. The panel leaves the document when it closes,
  // and a reading taken after that would be a reading of nothing.
  const volumeControl = await readControlSemantics(page, 'sheet-sound-volume');
  console.log(
    `browser: sound-controls keyboard toggle_presses=${walked.presses} ` +
      `reached=${walked.reached} volume_presses=${toVolume.presses} ` +
      `gain_at_loud=${loud.gain} gain_at_quiet=${quiet.gain} ` +
      `stored_loud=${loud.storedVolume} stored_quiet=${quiet.storedVolume} ` +
      `context=${afterEnable.contextState} gain_node=${quiet.isGainNode}`,
  );
  await closeSheet(page);

  // ---- 4. A roll with sound on -------------------------------------------
  await page.click('[data-el="roll-button"]');
  await page.evaluate(() => window.__table.settle(2));
  const heard = await readSoundControls(page);
  const madeVoices = heard.audio.started - silent.audio.started;
  const madeImpacts = (heard.counts?.impacts ?? 0) - (silent.counts?.impacts ?? 0);
  console.log(
    `browser: sound-controls ON contexts=${heard.audio.built} voices=${madeVoices} ` +
      `engine_triggers=${heard.counts?.triggers ?? 'none'} collisions=${madeImpacts} ` +
      `state=${heard.contextState} gain=${heard.gain}`,
  );

  judge(
    'sound-controls.a-roll-in-the-application-starts-voices',
    madeVoices > 0 &&
      madeImpacts > 0 &&
      heard.counts?.triggers === madeVoices &&
      heard.audio.built === 1 &&
      heard.contextState === 'running',
    `the player turned sound on through the sheet and rolled. The browser's own audio started ` +
      `${madeVoices} voices over a throw that reported ${madeImpacts} collisions, against a ` +
      `floor of 1 of each. The engine says it started ${heard.counts?.triggers ?? 'nothing'}, ` +
      `and the two counts must agree. The page constructed ${heard.audio.built} audio ` +
      `contexts in all and the clock reads ${heard.contextState}: a suspended clock makes no ` +
      `sound whatever the graph holds. The voice count is taken off ` +
      `AudioBufferSourceNode.start, which belongs to the browser and not to this application.`,
  );

  // ---- 5. Sound off again, over a whole throw -----------------------------
  await openSheet(page);
  await page.click('[data-el="sheet-sound-toggle"]');
  await settleScreen(page);
  await closeSheet(page);
  const before = await readSoundControls(page);
  await page.click('[data-el="roll-button"]');
  await page.evaluate(() => window.__table.settle(3));
  const after = await readSoundControls(page);
  const silentVoices = after.audio.started - before.audio.started;
  const silentImpacts = (after.counts?.impacts ?? 0) - (before.counts?.impacts ?? 0);
  const silentTriggers = (after.counts?.triggers ?? 0) - (before.counts?.triggers ?? 0);
  console.log(
    `browser: sound-controls OFF AGAIN voices=${silentVoices} triggers=${silentTriggers} ` +
      `collisions=${silentImpacts} stored_enabled=${after.storedEnabled} ` +
      `context_still_there=${after.contextState}`,
  );

  judge(
    'sound-controls.the-toggle-off-leaves-the-engine-silent-over-a-whole-throw',
    silentVoices === 0 &&
      silentTriggers === 0 &&
      silentImpacts > 0 &&
      after.storedEnabled === false &&
      after.contextState !== null,
    `the toggle went off and the table was thrown again. The browser started ${silentVoices} ` +
      `voices and the engine started ${silentTriggers}, both against a ceiling of 0, while the ` +
      `tray handed the engine ${silentImpacts} collisions over that throw, against a floor of ` +
      `1. The record reads soundEnabled=${after.storedEnabled}. The context is still there and ` +
      `reads ${after.contextState}, so this is the gate and not a torn-down graph.`,
  );

  const wantedLoud = Math.fround(LOUD_VOLUME);
  const wantedQuiet = Math.fround(QUIET_VOLUME);
  judge(
    'sound-controls.the-stored-volume-reaches-the-output-gain',
    loud.gain === wantedLoud &&
      quiet.gain === wantedQuiet &&
      loud.storedVolume === LOUD_VOLUME &&
      quiet.storedVolume === QUIET_VOLUME &&
      quiet.isGainNode === true,
    `two levels, both set by real arrow presses and both read off the GainNode the engine ` +
      `built. At ${LOUD_VOLUME} the gain reads ${loud.gain} against the ${wantedLoud} an ` +
      `AudioParam holds, and the record holds ${loud.storedVolume}. At ${QUIET_VOLUME} the gain ` +
      `reads ${quiet.gain} against ${wantedQuiet}, and the record holds ${quiet.storedVolume}. ` +
      `output instanceof GainNode is ${quiet.isGainNode}. Neither level is the 0.5 the ` +
      `settings module ships nor the 1 the engine starts at, so a level that never left the ` +
      `record fails here.`,
  );

  console.log(
    `browser: sound-controls semantics toggle=[${toggleBefore?.role} "${toggleBefore?.name}" ` +
      `${toggleBefore?.state}->${toggleAfter?.state}] volume=[${volumeControl?.role} ` +
      `"${volumeControl?.name}" ${loudControl?.state}] hit=${volumeControl?.height}px`,
  );
  checks.push({
    name: 'sound-controls.both-controls-carry-a-role-a-name-and-a-state-by-keyboard-alone',
    ok:
      walked.reached &&
      toVolume.reached &&
      toggleBefore?.role === 'checkbox' &&
      (toggleBefore?.name ?? '').length > 0 &&
      toggleBefore?.state === 'false' &&
      toggleAfter?.state === 'true' &&
      volumeControl?.role === 'range' &&
      // Exactly the word, and not the word plus the reading beside it. The
      // label wraps the level as well, so a control taking its name from that
      // label would have a reader announce the level twice.
      volumeControl?.name === 'Volume' &&
      loudControl?.state === `${Math.round(LOUD_VOLUME * 100)} per cent` &&
      (volumeControl?.height ?? 0) >= 24,
    detail:
      `real Tab presses reached the toggle in ${walked.presses} and the volume in ` +
      `${toVolume.presses} more, from ${walked.seen.length} stops walked. A real Space press ` +
      `moved the toggle state from ${toggleBefore?.state} to ${toggleAfter?.state}. The toggle ` +
      `is a ${toggleBefore?.role} named "${toggleBefore?.name}" and the volume is a ` +
      `${volumeControl?.role} named "${volumeControl?.name}", which must be "Volume" and ` +
      `nothing more, whose state reads ` +
      `"${loudControl?.state}" after the arrow presses. The volume row measures ` +
      `${volumeControl?.height} px against the 24 px floor of WCAG 2.2 SC 2.5.8.`,
  });

  if (options.captureShell !== null) {
    await openSheet(page);
    await page.setViewport({ width: 360, height: 760, deviceScaleFactor: 1 });
    await settleScreen(page);
    await new Promise((done) => setTimeout(done, 200));
    writeFileSync(
      join(options.captureShell, '0022-sheet-sound-360.png'),
      await page.screenshot({ type: 'png' }),
    );
    console.log(`browser: sound-controls capture written to ${options.captureShell}`);
  }
}

// ---------------------------------------------------------------------------
// The performance overlay — Unit 3.8, the overlay half
//
// The overlay is the only honest measurement of a mid-range phone this project
// will ever have, so this mode drives it in the built application and judges
// every figure against something the overlay did not write.
//
// **It judges the instrument and never the machine.** No reading here is
// compared against a budget. `CLAUDE.md` splits the performance claims in two:
// the deterministic gates are integers in CI, and the timing figures are
// reported on real hardware and pasted into the ledger by the owner. A check
// that failed a run because this desktop was slow would be the second kind
// pretending to be the first.
//
// What is measured against what:
//
//   * The frame percentiles answer a stall this run injects, and the run reads
//     them before and after. A figure computed from a constant cannot move.
//   * Throw-to-first-motion is compared against a watcher this file owns, which
//     reads the drawn positions of the dice off the tray seam. The same watcher
//     records how many frames were drawn with no die moved, which is the
//     difference between the first frame and the first motion.
//   * A percentile below its floor is refused, and the refusal names the count.
//   * A figure with no source in this browser is named and prints no number.
// ---------------------------------------------------------------------------

/** How long the injected stall holds the thread, per frame. */
const OVERLAY_STALL_MS = 40;

/**
 * How far the overlay and this file's own watcher may disagree.
 *
 * Both sample on the same animation clock and each takes the timestamp of the
 * frame it saw the movement on, so they can differ by one frame. Two frames at
 * 60 Hz is the allowance. The difference this check must tell apart is far
 * larger and is printed beside it: the whole synchronous simulation, which is
 * what a probe stopping at the first frame would have missed.
 */
const OVERLAY_AGREEMENT_MS = 34;

const OVERLAY_WATCHER = `
window.__watch = { armed: 0 };
window.__stall = 0;
{
  const positions = () => {
    const box = window.__clatterTable ? window.__clatterTable.box : null;
    if (!box) return [];
    const out = [];
    for (const die of box.diceList) out.push(die.position.x, die.position.y, die.position.z);
    return out;
  };
  const changed = (before, now) =>
    before.length !== now.length || now.some((value, at) => value !== before[at]);
  /* The capture phase, so this reading is taken before the application has run
     a single line of its own handler. */
  document.addEventListener(
    'click',
    (event) => {
      if (!event.target.closest('[data-el="roll-button"]')) return;
      const held = {
        pressedAt: event.timeStamp,
        handlerAt: performance.now(),
        before: positions(),
        frames: [],
        motionAt: null,
        still: 0,
        movedTo: null,
      };
      window.__watch = held;
      window.__watch.armed = (window.__watch.armed || 0) + 1;
      const look = (at) => {
        const now = positions();
        const moved = changed(held.before, now);
        held.frames.push(at);
        if (moved) {
          held.motionAt = at;
          held.movedTo = now.length / 3;
          return;
        }
        held.still += 1;
        requestAnimationFrame(look);
      };
      requestAnimationFrame(look);
    },
    true,
  );
  /* The injected stall. It holds the thread for window.__stall milliseconds on
     every frame, which is a cost the overlay must be able to see. */
  const spin = () => {
    if (window.__stall > 0) {
      const end = performance.now() + window.__stall;
      while (performance.now() < end) {
        /* hold the thread */
      }
    }
    requestAnimationFrame(spin);
  };
  requestAnimationFrame(spin);
}
`;

/** Every row of the panel, as the owner reads it off a photograph. */
async function readOverlay(page) {
  return page.evaluate(() => {
    const panel = document.querySelector('[data-el="perf-overlay"]');
    const offered = window.PerformanceObserver
      ? (window.PerformanceObserver.supportedEntryTypes ?? [])
      : [];
    if (panel === null) {
      return { present: false, longTaskOffered: offered.includes('longtask') };
    }
    const box = panel.getBoundingClientRect();
    const number = (text) => {
      const found = /^([\d.]+) ms over (\d+) /.exec(text.trim());
      return found === null
        ? { value: null, samples: null }
        : { value: Number(found[1]), samples: Number(found[2]) };
    };
    return {
      present: true,
      tag: panel.tagName,
      label: panel.getAttribute('aria-label'),
      note: (panel.querySelector('[data-el="perf-note"]')?.textContent ?? '').trim(),
      // The panel ITSELF as well as its children. A tabindex on the container
      // is exactly the way this panel would join the walk of section 6, and a
      // descendant-only count would never see it.
      tabStops:
        panel.querySelectorAll('a, button, input, select, textarea, [tabindex]').length +
        (panel.matches('[tabindex]') ? 1 : 0),
      left: Math.round(box.left),
      right: Math.round(box.right),
      viewport: window.innerWidth,
      longTaskOffered: offered.includes('longtask'),
      rows: [...panel.querySelectorAll('.perf-row')].map((row) => {
        const text = (row.querySelector('dd')?.textContent ?? '').trim();
        return {
          key: (row.dataset.el ?? '').replace(/^perf-/, ''),
          kind: row.dataset.reading ?? '',
          term: (row.querySelector('dt')?.textContent ?? '').trim(),
          text,
          ...number(text),
        };
      }),
    };
  });
}

/** One row of the panel, by key. */
function overlayRow(read, key) {
  return read.rows?.find((row) => row.key === key) ?? null;
}

/** Wait past one redraw of the panel, which is held back inside a throw. */
async function afterRedraw(page) {
  await settleScreen(page);
  await new Promise((done) => setTimeout(done, 900));
}

async function runOverlay(page, options, checks) {
  await page.evaluate(TABLE_HELPERS);
  await page.evaluate(() => {
    try {
      localStorage.clear();
    } catch {
      /* the defaults answer anyway */
    }
  });
  await page.reload({ waitUntil: 'load' });
  await page.evaluate(TABLE_HELPERS);
  await page.evaluate(OVERLAY_WATCHER);
  await page.waitForSelector('[data-el="disclosure-toggle"]', { timeout: 30000 });

  const opening = await page.evaluate(() => window.__table.read());
  const onTheTable = opening.renderer === 'tray';
  const why =
    'the startup probe answered below the bar, so the screen draws flat dice and no table ' +
    'moves. There is no WebGL context inside the sandbox. Run this mode with the sandbox off.';
  const judge = (name, ok, detail) =>
    checks.push(
      onTheTable
        ? { name, ok, detail }
        : { name, ok: true, skipped: true, detail: `NOT JUDGED: ${why}` },
    );

  // ---- 1. The switch, by keyboard alone ----------------------------------
  //
  // A pool worth measuring. The library simulates the whole throw before it
  // draws a frame, and the cost of that block follows the number of dice, so a
  // throw of two dice would measure the instrument against nothing.
  for (const [tile, presses] of [
    ['attribute', 5],
    ['skill', 5],
    ['gear', 3],
    ['bonus', 2],
    ['stress', 5],
  ]) {
    await pressTile(page, tile, 'p', presses);
  }
  await openSheet(page);
  const walked = await tabUntil(page, 'sheet-stress-reset', 'sheet-overlay-toggle');
  await page.keyboard.press(' ');
  await settleScreen(page);
  await closeSheet(page);
  const opened = await readOverlay(page);
  console.log(
    `browser: overlay opened presses=${walked.presses} reached=${walked.reached} ` +
      `present=${opened.present} tag=${opened.tag} label="${opened.label}" ` +
      `tab_stops=${opened.tabStops} long_task_offered=${opened.longTaskOffered}`,
  );
  for (const row of opened.rows ?? []) {
    console.log(`browser: overlay at rest ${row.key} [${row.kind}] ${row.term}: ${row.text}`);
  }

  checks.push({
    name: 'overlay.a-percentile-refuses-to-print-below-its-minimum-sample-count',
    ok:
      opened.present &&
      overlayRow(opened, 'frameP95')?.kind === 'tooFew' &&
      overlayRow(opened, 'frameP99')?.kind === 'tooFew' &&
      /0 of 20 /.test(overlayRow(opened, 'frameP95')?.text ?? '') &&
      /0 of 100 /.test(overlayRow(opened, 'frameP99')?.text ?? ''),
    detail:
      `no throw has been measured, so the two percentiles read ` +
      `"${overlayRow(opened, 'frameP95')?.text}" and "${overlayRow(opened, 'frameP99')?.text}". ` +
      `The floor is derived from the quantile: below 1/(1-q) samples no sample lies above the ` +
      `quantile at all, which gives 20 frames for p95 and 100 for p99. A panel that printed ` +
      `the largest of four frames as a p95 fails here.`,
  });

  // ---- 2. Two ordinary throws --------------------------------------------
  //
  // The first one mounts the table: the builder is open until the player
  // presses Roll and the library measures a container that is in the document,
  // so the first throw carries the fetch and the mount of the 3D chunk with it.
  // It is a real reading and it is not the one to judge an instrument by, so
  // the comparison below runs on the second.
  await page.click('[data-el="roll-button"]');
  await page.evaluate(() => window.__table.settle(1));
  await afterRedraw(page);
  const first = await readOverlay(page);
  console.log(`browser: overlay throw one motion="${overlayRow(first, 'firstMotion')?.text}"`);
  await page.click('[data-el="roll-button"]');
  await page.evaluate(() => window.__table.settle(2));
  await afterRedraw(page);
  const thrown = await readOverlay(page);
  const watch = await page.evaluate(() => {
    const held = window.__watch;
    return {
      pressedAt: held.pressedAt ?? null,
      handlerAt: held.handlerAt ?? null,
      motionAt: held.motionAt ?? null,
      firstFrameAt: held.frames?.[0] ?? null,
      frames: held.frames?.length ?? 0,
      still: held.still ?? 0,
      dice: held.movedTo ?? null,
    };
  });
  const ownMotion =
    watch.motionAt === null || watch.pressedAt === null ? null : watch.motionAt - watch.pressedAt;
  const ownFirstFrame =
    watch.firstFrameAt === null || watch.pressedAt === null
      ? null
      : watch.firstFrameAt - watch.pressedAt;
  const drawn = overlayRow(thrown, 'firstMotion');
  const apart = drawn?.value === null || ownMotion === null ? null : drawn.value - ownMotion;
  console.log(
    `browser: overlay throw two p95="${overlayRow(thrown, 'frameP95')?.text}" ` +
      `p99="${overlayRow(thrown, 'frameP99')?.text}" motion="${drawn?.text}"`,
  );
  console.log(
    `browser: overlay watcher pressed_at=${watch.pressedAt?.toFixed(1)} ` +
      `handler_at=${watch.handlerAt?.toFixed(1)} first_frame=+${ownFirstFrame?.toFixed(1)}ms ` +
      `motion=+${ownMotion?.toFixed(1)}ms still_frames=${watch.still} dice=${watch.dice} ` +
      `apart=${apart === null ? 'none' : apart.toFixed(1)}ms`,
  );

  judge(
    'overlay.throw-to-first-motion-is-bounded-by-a-moved-die-and-not-by-a-frame',
    drawn?.kind === 'measured' &&
      overlayRow(first, 'firstMotion')?.kind === 'measured' &&
      ownMotion !== null &&
      ownFirstFrame !== null &&
      watch.still >= 1 &&
      ownMotion > ownFirstFrame &&
      apart !== null &&
      Math.abs(apart) <= OVERLAY_AGREEMENT_MS &&
      watch.handlerAt !== null &&
      watch.pressedAt !== null &&
      watch.handlerAt >= watch.pressedAt,
    `the first throw of the session read "${overlayRow(first, 'firstMotion')?.text}", so no ` +
      `throw goes unmeasured. On the second: the near end is the press, and the click event ` +
      `carries timeStamp ` +
      `${watch.pressedAt?.toFixed(1)} and a capture-phase handler read the clock at ` +
      `${watch.handlerAt?.toFixed(1)}, so the instant recorded is the press and not the ` +
      `handler. The far end is a MOVED DIE: this file watched the drawn positions of the dice ` +
      `off the tray seam and drew ${watch.still} frames in which every die was exactly where ` +
      `the press left it, the first of them ${ownFirstFrame?.toFixed(1)} ms after the press. ` +
      `It saw the first movement ${ownMotion?.toFixed(1)} ms after the press, over ` +
      `${watch.dice} dice. The panel reads ${drawn?.value} ms, which is ` +
      `${apart === null ? 'nothing' : Math.abs(apart).toFixed(1)} ms from that, against an ` +
      `allowance of ${OVERLAY_AGREEMENT_MS} ms for the one frame two watchers on the same ` +
      `clock can differ by. A probe that stopped at the first frame would have read ` +
      `${ownFirstFrame?.toFixed(1)} ms, which is the difference this check exists to see.`,
  );

  // ---- 3. The same throw, with a stall this run injects -------------------
  const before95 = overlayRow(thrown, 'frameP95');
  await page.evaluate((ms) => {
    window.__stall = ms;
  }, OVERLAY_STALL_MS);
  await page.click('[data-el="roll-button"]');
  await page.evaluate(() => window.__table.settle(3));
  await page.evaluate(() => {
    window.__stall = 0;
  });
  await afterRedraw(page);
  const stalled = await readOverlay(page);
  const after95 = overlayRow(stalled, 'frameP95');
  const after99 = overlayRow(stalled, 'frameP99');
  console.log(
    `browser: overlay stall injected=${OVERLAY_STALL_MS}ms p95 ${before95?.value} -> ` +
      `${after95?.value} p99=${after99?.value} samples ${before95?.samples} -> ` +
      `${after95?.samples}`,
  );

  judge(
    'overlay.the-frame-percentiles-answer-a-stall-this-run-injected',
    before95?.kind === 'measured' &&
      after95?.kind === 'measured' &&
      after99?.kind === 'measured' &&
      after95.value > before95.value &&
      after95.value >= OVERLAY_STALL_MS &&
      after99.value >= after95.value &&
      after95.samples > before95.samples,
    `an ordinary throw read p95=${before95?.value} ms over ${before95?.samples} frames. The ` +
      `run then held the thread for ${OVERLAY_STALL_MS} ms on every frame and threw again, ` +
      `and p95 reads ${after95?.value} ms over ${after95?.samples} frames with ` +
      `p99=${after99?.value} ms. The instrument must answer the injected cost and must not ` +
      `fall below it, and p99 may not read under p95 over one set of samples. A figure ` +
      `computed from a constant cannot move at all. No budget is read here: this judges the ` +
      `instrument, never the machine.`,
  );

  // ---- 4. A figure this browser cannot measure ---------------------------
  const longTask = overlayRow(stalled, 'longTask');
  console.log(
    `browser: overlay long tasks offered=${stalled.longTaskOffered} kind=${longTask?.kind} ` +
      `text="${longTask?.text}"`,
  );
  checks.push({
    name: 'overlay.an-unavailable-figure-says-so-by-name-and-never-prints-a-zero',
    ok: stalled.longTaskOffered
      ? longTask?.kind === 'measured' && /over \d+ long tasks$/.test(longTask?.text ?? '')
      : longTask?.kind === 'unavailable' &&
        /this browser reports no long tasks/.test(longTask?.text ?? '') &&
        !/\d/.test(longTask?.text ?? ''),
    detail: stalled.longTaskOffered
      ? `this browser lists longtask among PerformanceObserver.supportedEntryTypes, so the ` +
        `figure is measured and reads "${longTask?.text}".`
      : `this browser does not list longtask among PerformanceObserver.supportedEntryTypes, so ` +
        `there is no source for the figure. The panel reads "${longTask?.text}", which names ` +
        `the reason and holds no digit at all. A zero would be a measurement, and it would be ` +
        `a lie: a run of ${OVERLAY_STALL_MS} ms stalls had just gone through this page.`,
  });

  // ---- 5. A clean sitting, for the reading the owner photographs ---------
  //
  // The switch off and on again builds a new instrument, so the samples of the
  // injected stall are gone and the panel below carries this machine's own
  // figures. The captures are taken from here for the same reason: a
  // photograph of an instrumented run would report a cost this run created.
  await openSheet(page);
  await page.click('[data-el="sheet-overlay-toggle"]');
  await settleScreen(page);
  await page.click('[data-el="sheet-overlay-toggle"]');
  await settleScreen(page);
  await closeSheet(page);
  const reset = await readOverlay(page);
  await page.click('[data-el="roll-button"]');
  await page.evaluate(() => window.__table.settle(4));
  await afterRedraw(page);
  const clean = await readOverlay(page);
  console.log(
    `browser: overlay after a new sitting reset_p95="${overlayRow(reset, 'frameP95')?.text}" ` +
      `clean_p95="${overlayRow(clean, 'frameP95')?.text}" ` +
      `clean_p99="${overlayRow(clean, 'frameP99')?.text}" ` +
      `clean_motion="${overlayRow(clean, 'firstMotion')?.text}"`,
  );
  judge(
    'overlay.the-switch-off-and-on-again-starts-a-new-instrument',
    overlayRow(reset, 'frameP95')?.kind === 'tooFew' &&
      overlayRow(reset, 'firstMotion')?.kind === 'tooFew' &&
      overlayRow(clean, 'frameP95')?.kind === 'measured' &&
      (overlayRow(clean, 'frameP95')?.samples ?? 0) < (after95?.samples ?? 0) &&
      (overlayRow(clean, 'frameP95')?.value ?? 0) < OVERLAY_STALL_MS,
    `the switch went off and on again and the panel read ` +
      `"${overlayRow(reset, 'frameP95')?.text}", so the samples of the injected stall are gone. ` +
      `One throw later it reads "${overlayRow(clean, 'frameP95')?.text}" against the ` +
      `${after95?.samples} frames the sitting before it had gathered, and the reading is back ` +
      `under the ${OVERLAY_STALL_MS} ms this run injected. A panel that carried its samples ` +
      `across a switch would report an instrumented run to the owner as this machine.`,
  );

  // ---- 6. Readable at 360 px, and no tab stop ----------------------------
  await page.setViewport({ width: 360, height: 760, deviceScaleFactor: 1 });
  await settleScreen(page);
  await new Promise((done) => setTimeout(done, 300));
  const narrow = await readOverlay(page);
  const nextStop = await tabFrom(page, 'disclosure-toggle', 1);
  const verdicts = ['pass', 'fail', 'budget', 'over budget', 'too slow', 'good', 'bad'];
  // The rows alone. The note under them says "not a pass or a fail" on purpose,
  // and a scan that read the disclaimer as a verdict would be reading the words
  // and not the claim.
  const said = (narrow.rows ?? [])
    .map((row) => `${row.term} ${row.text}`)
    .join(' ')
    .toLowerCase();
  const judged = verdicts.filter((word) => said.includes(word));
  console.log(
    `browser: overlay at 360 left=${narrow.left} right=${narrow.right} ` +
      `viewport=${narrow.viewport} tab_stops=${narrow.tabStops} next_after_disclosure=` +
      `${nextStop.join(',')} verdict_words=${judged.length}`,
  );
  for (const row of narrow.rows ?? []) {
    console.log(`browser: overlay reads ${row.key} [${row.kind}] ${row.term}: ${row.text}`);
  }
  checks.push({
    name: 'overlay.reads-at-360-px-holds-no-tab-stop-and-passes-no-verdict',
    ok:
      narrow.present &&
      narrow.tag === 'SECTION' &&
      (narrow.label ?? '').length > 0 &&
      narrow.tabStops === 0 &&
      narrow.left >= 0 &&
      narrow.right <= narrow.viewport &&
      nextStop[0] === 'roll-button' &&
      judged.length === 0 &&
      /not a pass or a fail/.test(narrow.note ?? '') &&
      (narrow.rows ?? []).length === 4 &&
      // Every row either names its sample count or names the reason it has
      // none. A row that printed a bare number would fail here.
      (narrow.rows ?? []).every((row) =>
        row.kind === 'unavailable'
          ? /^not measured here: \S/.test(row.text)
          : /\d+ (frames? in a throw|long tasks?|throws?)/.test(row.text),
      ),
    detail:
      `the panel is a ${narrow.tag} named "${narrow.label}" holding ${narrow.tabStops} tab ` +
      `stops, and Tab from disclosure-toggle still lands on ${nextStop.join(',')}, so nothing ` +
      `was inserted into the walk of section 6. At 360 px it runs from ${narrow.left} px to ` +
      `${narrow.right} px inside a ${narrow.viewport} px viewport. Its ${(narrow.rows ?? []).length} ` +
      `rows each name a sample count, and none of the words [${verdicts.join(', ')}] appears in ` +
      `any of them, at 17 ms a frame or at 50. The note under them reads "${narrow.note}". The ` +
      `overlay reports and never gates.`,
  });

  if (options.captureShell !== null) {
    writeFileSync(
      join(options.captureShell, '0023-overlay-360.png'),
      await page.screenshot({ type: 'png' }),
    );
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await settleScreen(page);
    await new Promise((done) => setTimeout(done, 300));
    writeFileSync(
      join(options.captureShell, '0023-overlay-1440.png'),
      await page.screenshot({ type: 'png' }),
    );
    console.log(`browser: overlay captures written to ${options.captureShell}`);
  }
}

// ---------------------------------------------------------------------------
// Argument parsing and the run
// ---------------------------------------------------------------------------

/** `WxH` or `WxH@dpr`. */
export function parseViewport(text) {
  const match = /^(\d+)x(\d+)(?:@([0-9.]+))?$/.exec(text);
  if (!match) throw new Error(`a viewport reads WxH or WxH@dpr, not ${text}`);
  const dpr = match[3] === undefined ? 1 : Number(match[3]);
  if (!Number.isFinite(dpr) || dpr <= 0) throw new Error(`a device pixel ratio must be positive`);
  return { width: Number(match[1]), height: Number(match[2]), dpr };
}

const here = dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const options = {
    hardware: false,
    forceSoftware: false,
    url: null,
    sampleMs: 1000,
    minFrames: 30,
    capture: null,
    browserPath: DEFAULT_BROWSER_PATH,
    tray: false,
    pool: false,
    push: false,
    affordance: false,
    probe: false,
    contextLoss: false,
    reducedMotion: false,
    sound: false,
    logStore: false,
    logCsv: false,
    settingsStore: false,
    share: false,
    shareControls: false,
    soundControls: false,
    overlay: false,
    offline: false,
    shell: false,
    a11y: false,
    noWebgl: false,
    sheet: false,
    theme: false,
    history: false,
    blockedChunk: false,
    faults: false,
    table: false,
    captureShell: null,
    captureLater: false,
    longTaskMs: 0,
    noteChars: 0,
    quotaKb: null,
    captureBefore: null,
    offsetKept: null,
    themeId: null,
    viewport: { width: 800, height: 600, dpr: 1 },
    resizeTo: null,
    priceRatios: [],
    priceFrames: 60,
    throwSeed: null,
    budgets: join(here, '..', 'budgets.json'),
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => {
      i += 1;
      if (i >= argv.length) throw new Error(`${arg} needs a value`);
      return argv[i];
    };
    if (arg === '--hardware') options.hardware = true;
    else if (arg === '--force-software') options.forceSoftware = true;
    else if (arg === '--url') options.url = next();
    else if (arg === '--sample-ms') options.sampleMs = Number(next());
    else if (arg === '--min-frames') options.minFrames = Number(next());
    else if (arg === '--capture') options.capture = next();
    else if (arg === '--browser') options.browserPath = next();
    else if (arg === '--tray') options.tray = true;
    else if (arg === '--pool') options.pool = true;
    else if (arg === '--push') options.push = true;
    else if (arg === '--affordance') options.affordance = true;
    else if (arg === '--probe') options.probe = true;
    else if (arg === '--context-loss') options.contextLoss = true;
    else if (arg === '--reduced-motion') options.reducedMotion = true;
    else if (arg === '--sound') options.sound = true;
    else if (arg === '--log-store') options.logStore = true;
    else if (arg === '--log-csv') options.logCsv = true;
    else if (arg === '--settings-store') options.settingsStore = true;
    else if (arg === '--share') options.share = true;
    else if (arg === '--share-controls') options.shareControls = true;
    else if (arg === '--sound-controls') options.soundControls = true;
    else if (arg === '--overlay') options.overlay = true;
    else if (arg === '--offline') options.offline = true;
    else if (arg === '--shell') options.shell = true;
    else if (arg === '--a11y') options.a11y = true;
    else if (arg === '--no-webgl') options.noWebgl = true;
    else if (arg === '--sheet') options.sheet = true;
    else if (arg === '--theme') options.theme = true;
    else if (arg === '--history') options.history = true;
    else if (arg === '--blocked-chunk') options.blockedChunk = true;
    else if (arg === '--faults') options.faults = true;
    else if (arg === '--table') options.table = true;
    else if (arg === '--capture-shell') options.captureShell = next();
    else if (arg === '--capture-later') options.captureLater = true;
    else if (arg === '--long-task-ms') options.longTaskMs = Number(next());
    else if (arg === '--note-chars') options.noteChars = Number(next());
    else if (arg === '--quota-kb') options.quotaKb = Number(next());
    else if (arg === '--capture-before') options.captureBefore = next();
    else if (arg === '--offset-kept') options.offsetKept = Number(next());
    else if (arg === '--theme-id') options.themeId = next();
    else if (arg === '--viewport') options.viewport = parseViewport(next());
    else if (arg === '--resize-to') options.resizeTo = parseViewport(next());
    else if (arg === '--price-frames') options.priceFrames = Number(next());
    else if (arg === '--throw-seed') options.throwSeed = Number(next());
    else if (arg === '--budgets') options.budgets = next();
    else if (arg === '--price-ratios') {
      options.priceRatios = next()
        .split(',')
        .filter(Boolean)
        .map((r) => {
          const value = Number(r);
          if (!Number.isFinite(value) || value <= 0) {
            throw new Error(`--price-ratios takes positive numbers, not ${r}`);
          }
          return value;
        });
    } else throw new Error(`unknown argument ${arg}`);
  }
  if (!Number.isFinite(options.sampleMs) || options.sampleMs <= 0) {
    throw new Error('--sample-ms needs a positive number');
  }
  if (!Number.isInteger(options.minFrames) || options.minFrames < 1) {
    throw new Error('--min-frames needs a whole number of 1 or more');
  }
  if (!Number.isInteger(options.noteChars) || options.noteChars < 0) {
    throw new Error('--note-chars needs a whole number of 0 or more');
  }
  if (!Number.isInteger(options.priceFrames) || options.priceFrames < 1) {
    throw new Error('--price-frames needs a whole number of 1 or more');
  }
  if (options.throwSeed === null) options.throwSeed = randomInt(1, 2 ** 31);
  else if (!Number.isInteger(options.throwSeed) || options.throwSeed < 1) {
    throw new Error('--throw-seed needs a whole number of 1 or more');
  }
  // Every scene mode imports a module from source, so every one needs the dev
  // server. `--probe` included: it drives `src/tray/capability.ts` rather than
  // a copy of it.
  const MODES = [
    ['--tray', options.tray],
    ['--pool', options.pool],
    ['--push', options.push],
    ['--affordance', options.affordance],
    ['--probe', options.probe],
    ['--context-loss', options.contextLoss],
    ['--reduced-motion', options.reducedMotion],
    ['--sound', options.sound],
    ['--log-store', options.logStore],
    ['--log-csv', options.logCsv],
    ['--settings-store', options.settingsStore],
    ['--share', options.share],
    ['--share-controls', options.shareControls],
    ['--sound-controls', options.soundControls],
    ['--overlay', options.overlay],
    ['--offline', options.offline],
    ['--shell', options.shell],
    ['--a11y', options.a11y],
    ['--sheet', options.sheet],
    ['--theme', options.theme],
    ['--history', options.history],
    ['--blocked-chunk', options.blockedChunk],
    ['--faults', options.faults],
    ['--table', options.table],
  ];
  const named = MODES.filter(([, on]) => on).map(([flag]) => flag);
  if (named.length > 0 && options.url === null) {
    throw new Error(
      `${named[0]} needs --url, and the url must be ` +
        `${
          options.offline ||
          options.shell ||
          options.a11y ||
          options.sheet ||
          options.theme ||
          options.history ||
          options.blockedChunk ||
          options.soundControls ||
          options.overlay ||
          options.table
            ? 'a preview server over the built output'
            : 'a Vite dev server'
        }`,
    );
  }
  if (named.length > 1) {
    throw new Error(`${named.join(', ')} build different scenes. Run one at a time.`);
  }
  if (options.captureBefore !== null && !options.push && !options.table) {
    throw new Error('--capture-before belongs to --push or --table');
  }
  if (options.offsetKept !== null) {
    if (!options.push) throw new Error('--offset-kept belongs to --push');
    if (!Number.isInteger(options.offsetKept) || options.offsetKept < 0) {
      throw new Error('--offset-kept needs a whole number of 0 or more');
    }
  }
  if (options.themeId !== null && !options.table) {
    throw new Error('--theme-id belongs to --table');
  }
  if (options.noWebgl && !options.a11y) {
    throw new Error('--no-webgl belongs to --a11y');
  }
  if (options.a11y && options.hardware && options.noWebgl) {
    throw new Error('--hardware and --no-webgl declare opposite machines. Name one.');
  }
  if (options.captureLater && !options.share) {
    throw new Error('--capture-later belongs to --share');
  }
  if (
    options.captureShell !== null &&
    !options.shell &&
    !options.sheet &&
    !options.theme &&
    !options.history &&
    !options.share &&
    !options.shareControls &&
    !options.soundControls &&
    !options.overlay
  ) {
    throw new Error(
      '--capture-shell belongs to --shell, --sheet, --theme, --history, --share, ' +
        '--share-controls, --sound-controls or --overlay',
    );
  }
  if (options.longTaskMs !== 0) {
    if (!options.logStore && !options.logCsv) {
      throw new Error('--long-task-ms belongs to --log-store or --log-csv');
    }
    if (!Number.isInteger(options.longTaskMs) || options.longTaskMs < 1) {
      throw new Error('--long-task-ms needs a whole number of 1 or more');
    }
  }
  if (options.quotaKb !== null) {
    if (!options.logStore && !options.faults) {
      throw new Error('--quota-kb belongs to --log-store or --faults');
    }
    if (!Number.isInteger(options.quotaKb) || options.quotaKb < 1) {
      throw new Error('--quota-kb needs a whole number of 1 or more');
    }
  }
  return options;
}

// ---------------------------------------------------------------------------
// The error surfaces — Unit 4.10
//
// Every failure below is FORCED, and the surface is then read off the screen.
// A run that rendered the banner from a prop would prove the words and never
// the wiring, so nothing here hands a fault to a component:
//
//   - **A refused chunk** is refused at the network layer, with the service
//     worker and Cache Storage taken away first, which is the route Unit 3.7's
//     `--blocked-chunk` built and this mode reuses.
//   - **A refused database** is the error this browser really raises on an
//     opaque origin, read out of a sandboxed frame first, which is the route
//     Unit 4.4's `--log-store` built.
//   - **A stopped log** is the application's own connection closed by a
//     `deleteDatabase` from another connection. Nothing is patched.
//   - **A full store** is `--quota-kb`, which launches the browser with its own
//     storage limit. The browser raises the error.
//   - **A malformed file** is a real `File` through the real picker, carrying
//     hostile text, which Constraint 8 exists for.
//
// The denominator is `FAULT_KINDS`, imported from the shipping module rather
// than restated here, so a fault added later has to be judged or skipped by
// name.
// ---------------------------------------------------------------------------

/** Where the captures of this mode go. Every surface is read at 360 px. */
const FAULT_CAPTURES = join(here, '..', 'docs', 'design');
const FAULT_VIEWPORT = { width: 360, height: 760, deviceScaleFactor: 1 };

/** Read the banner off the screen: its role, its name, its rows and its stops. */
async function readFaultBanner(page) {
  return page.evaluate(() => {
    const banner = document.querySelector('[data-el="fault-banner"]');
    if (banner === null) return { present: false, rows: [], filled: [], stops: 0 };
    const rows = [...banner.querySelectorAll('p')].map((row) => {
      const box = row.getBoundingClientRect();
      return {
        el: row.dataset.el ?? null,
        fault: row.dataset.fault ?? '',
        text: (row.textContent ?? '').trim(),
        elements: row.querySelectorAll('*').length,
        shown: getComputedStyle(row).display !== 'none',
        right: Math.round(box.right),
        bottom: Math.round(box.bottom),
        height: Math.round(box.height),
      };
    });
    const stops = [...banner.querySelectorAll('*')].filter(
      (each) =>
        each.tabIndex >= 0 &&
        (each.matches('a[href], button, input, select, textarea') || each.hasAttribute('tabindex')),
    ).length;
    return {
      present: true,
      role: banner.getAttribute('role'),
      label: banner.getAttribute('aria-label'),
      rows,
      filled: rows.filter((row) => row.text !== '').map((row) => row.fault),
      stops,
      viewport: window.innerWidth,
    };
  });
}

/**
 * Press one control with the keyboard alone, and report its accessible name.
 *
 * A label wrapping a checkbox is pressed on the checkbox, with the space bar,
 * because Enter does nothing to a checkbox. The name is read off the control
 * the browser would announce.
 */
async function pressWithKeyboard(page, name) {
  // The focus is moved by the DRIVER and never by a script in the page.
  // Measured on this host on 2026-08-10: an `element.focus()` inside
  // `page.evaluate` leaves the key events arriving at that element — a listener
  // on the page counted them — while the browser performs no default action for
  // them, so a space on a checkbox never toggles it. `page.focus` is the idiom
  // `--sound-controls` already uses, and it works.
  const selector = `[data-el="${name}"]`;
  const where = await page.evaluate((el) => {
    const holder = document.querySelector(`[data-el="${el}"]`);
    if (holder === null) return { own: false, found: false };
    return { own: holder.matches('button, input, a[href]'), found: true };
  }, name);
  if (!where.found) return { found: false, name: '', control: null, disabled: null };
  const aim = where.own ? selector : `${selector} :is(button, input, a[href])`;
  await page.focus(aim);
  const aimed = await page.evaluate((el) => {
    const holder = document.querySelector(`[data-el="${el}"]`);
    const control = holder.matches('button, input, a[href]')
      ? holder
      : holder.querySelector('button, input, a[href]');
    const label = control.getAttribute('aria-label') ?? (holder.textContent ?? '').trim();
    return {
      found: document.activeElement === control,
      name: (label ?? '').replace(/\s+/g, ' ').trim(),
      control: control.tagName.toLowerCase() + (control.type ? `:${control.type}` : ''),
      disabled: control.disabled ?? null,
    };
  }, name);
  if (!aimed.found) return aimed;
  await page.evaluate(() => {
    window.__keys = [];
    window.__watch ??= (() => {
      window.addEventListener(
        'keydown',
        (event) => {
          window.__keys.push(`${event.key} on ${event.target?.tagName ?? 'nothing'}`);
        },
        true,
      );
      return true;
    })();
  });
  await page.keyboard.press(aimed.control === 'input:checkbox' ? ' ' : 'Enter');
  await settleScreen(page);
  const after = await page.evaluate((el) => {
    const holder = document.querySelector(`[data-el="${el}"]`);
    const control = holder?.matches('button, input, a[href]')
      ? holder
      : (holder?.querySelector('button, input, a[href]') ?? null);
    return {
      checked: control?.checked ?? null,
      still: document.activeElement === control,
      keys: window.__keys ?? [],
      active: document.activeElement?.tagName ?? null,
    };
  }, name);
  return {
    ...aimed,
    checked: after.checked,
    held: after.still,
    keys: after.keys,
    active: after.active,
  };
}

/** Take the whole screen at 360 px, and say where it went. */
async function captureFaultScreen(page, file) {
  const path = join(FAULT_CAPTURES, file);
  await page.screenshot({ path });
  console.log(`browser: faults captured ${file}`);
  return path;
}

/** Take the service worker and every cache away, so no store can answer a request. */
async function clearWorkerAndCaches(page) {
  return withTimeout(
    page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return { ready: false, caches: 0, registrations: 0 };
      await navigator.serviceWorker.ready;
      const held = await navigator.serviceWorker.getRegistrations();
      const names = await caches.keys();
      for (const registration of held) await registration.unregister();
      for (const name of names) await caches.delete(name);
      return {
        ready: true,
        caches: (await caches.keys()).length,
        registrations: (await navigator.serviceWorker.getRegistrations()).length,
      };
    }),
    30000,
    'no service worker took control of the page within 30 seconds',
  );
}

/** Wait for the screen and give the log open a chance to answer. */
async function waitForRollScreen(page) {
  await page.waitForSelector('[data-el="roll-button"]', { timeout: 30000 });
  await page.waitForFunction(() => document.querySelector('[data-el="fault-banner"]') !== null, {
    timeout: 15000,
  });
  await settleScreen(page);
}

/** Wait until one row of the banner carries text, or give up and report. */
async function waitForFault(page, element, waitMs = 15000) {
  const until = Date.now() + waitMs;
  for (;;) {
    const said = await page.evaluate(
      (el) => (document.querySelector(`[data-el="${el}"]`)?.textContent ?? '').trim(),
      element,
    );
    if (said !== '' || Date.now() > until) return said;
    await new Promise((done) => setTimeout(done, 100));
  }
}

/** Throw the built pool once, and let the write reach the log. */
async function throwOnce(page) {
  await page.click('[data-el="roll-button"]');
  await settleScreen(page);
  await new Promise((done) => setTimeout(done, 400));
}

async function runFaults(page, options, checks) {
  const { FAULT_KINDS, FAULT_SLOT_ELEMENT, FAULT_SLOT_OF } = await import('../src/shell/faults.ts');
  const judged = new Set();
  const skipped = new Set();
  await page.setViewport(FAULT_VIEWPORT);

  /** Every claim about the banner itself, gathered over every phase. */
  const banners = [];
  const note = (phase, banner) => {
    banners.push({ phase, banner });
    return banner;
  };

  // ---- 0. The control: nothing has failed, so the banner says nothing. ----
  //
  // Without this every check below would pass against a banner that always
  // showed something.
  await page.evaluate(() => {
    try {
      localStorage.clear();
    } catch {
      // A browser that refuses storage answers the defaults anyway.
    }
  });
  await clearLog(page);
  await page.reload({ waitUntil: 'load' });
  await waitForRollScreen(page);
  const clean = note('clean', await readFaultBanner(page));
  console.log(
    `browser: faults clean rows=${clean.rows.length} filled=${clean.filled.length} ` +
      `role=${clean.role} label=${JSON.stringify(clean.label)} stops=${clean.stops} ` +
      `height=${clean.rows.reduce((total, row) => total + row.height, 0)}`,
  );
  checks.push({
    name: 'faults.the-banner-says-nothing-until-something-fails',
    ok:
      clean.present &&
      clean.rows.length === Object.keys(FAULT_SLOT_ELEMENT).length &&
      clean.filled.length === 0 &&
      clean.rows.every((row) => !row.shown) &&
      clean.rows.map((row) => row.el).join(',') === Object.values(FAULT_SLOT_ELEMENT).join(','),
    detail:
      `with a store, a database and the chunk all in place the banner holds ` +
      `${clean.rows.length} rows against the ${Object.keys(FAULT_SLOT_ELEMENT).length} slots, ` +
      `${clean.filled.length} of them carry text, and every one is display:none, so the drawn ` +
      `screen is unchanged. The rows are [${clean.rows.map((row) => row.el).join(' ')}] against ` +
      `the slots [${Object.values(FAULT_SLOT_ELEMENT).join(' ')}]. This is the control: every ` +
      `check below would pass against a banner that always said something.`,
  });

  // ---- 1. A browser that keeps nothing: no localStorage, no IndexedDB. ----
  //
  // The IndexedDB error is the one this browser really raises on an opaque
  // origin, read out of a sandboxed frame first. The localStorage refusal is
  // the same shape: the property itself throws before any read.
  const real = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const frame = document.createElement('iframe');
        frame.sandbox = 'allow-scripts';
        frame.srcdoc =
          '<script>let answer={};try{indexedDB.open("probe",1);answer.db={threw:false};}' +
          'catch(error){answer.db={threw:true,name:error.name,message:error.message};}' +
          'try{localStorage.getItem("probe");answer.store={threw:false};}' +
          'catch(error){answer.store={threw:true,name:error.name,message:error.message};}' +
          'parent.postMessage(answer,"*");</scr' +
          'ipt>';
        const done = (event) => {
          window.removeEventListener('message', done);
          frame.remove();
          resolve(event.data);
        };
        window.addEventListener('message', done);
        document.body.appendChild(frame);
        setTimeout(() => resolve({ db: { threw: false }, store: { threw: false } }), 3000);
      }),
  );
  console.log(
    `browser: faults an opaque origin refuses storage db=${real.db.threw} ` +
      `(${real.db.name}: ${real.db.message}) store=${real.store.threw} ` +
      `(${real.store.name}: ${real.store.message})`,
  );

  const refusal = await page.evaluateOnNewDocument((measured) => {
    IDBFactory.prototype.open = function refused() {
      throw new DOMException(measured.db.message ?? 'refused', measured.db.name ?? 'SecurityError');
    };
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new DOMException(
          measured.store.message ?? 'refused',
          measured.store.name ?? 'SecurityError',
        );
      },
    });
    window.__refusalInjected = true;
  }, real);
  await page.reload({ waitUntil: 'load' });
  await waitForRollScreen(page);
  const landed = await page.evaluate(() => {
    const answer = { installed: window.__refusalInjected === true, db: false, store: false };
    try {
      indexedDB.open('injection-probe', 1);
    } catch {
      answer.db = true;
    }
    try {
      void window.localStorage;
    } catch {
      answer.store = true;
    }
    return answer;
  });
  await waitForFault(page, FAULT_SLOT_ELEMENT.log);
  const kept = note('nothing-kept', await readFaultBanner(page));
  const nothingKept = await captureFaultScreen(page, '0024-fault-nothing-kept-360.png');
  console.log(
    `browser: faults nothing kept injection=${landed.installed} db_throws=${landed.db} ` +
      `store_throws=${landed.store} filled=[${kept.filled.join(' ')}] stops=${kept.stops}`,
  );
  checks.push({
    name: 'faults.a-browser-that-keeps-nothing-says-so-and-says-what-is-lost',
    ok:
      real.db.threw === true &&
      real.store.threw === true &&
      landed.installed &&
      landed.db &&
      landed.store &&
      kept.filled.join(' ') === 'log-refused settings-refused' &&
      kept.rows.every((row) => row.text === '' || /tab closes/.test(row.text)) &&
      kept.stops === 0,
    detail:
      `this browser was measured first: inside a sandboxed frame, whose origin is opaque, ` +
      `indexedDB.open threw ${real.db.name} and localStorage threw ${real.store.name}. That is ` +
      `the shape a private window has. The run made both raise that same error before the first ` +
      `line of the page ran, proved the injection landed (db=${landed.db} store=${landed.store}), ` +
      `and the screen answered [${kept.filled.join(' ')}]. Both rows must name what is lost, ` +
      `which is every roll and every choice when the tab closes, and the banner must hold ` +
      `${kept.stops} tab stops. The words: ` +
      kept.rows
        .filter((row) => row.text !== '')
        .map((row) => JSON.stringify(row.text))
        .join(' and ') +
      `. Capture: ${nothingKept}.`,
  });
  judged.add('log-refused');
  judged.add('settings-refused');

  // ---- 2. A platform that cannot draw the table, and has no way back. ----
  //
  // The storage refusal goes first, so this phase measures one failure and not
  // three. Every injection of this mode is removed by its own identifier.
  await page.removeScriptToEvaluateOnNewDocument(refusal.identifier);
  const noWebgl = await page.evaluateOnNewDocument(() => {
    const real = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function refused(kind, ...rest) {
      if (String(kind).startsWith('webgl')) return null;
      return real.call(this, kind, ...rest);
    };
    window.__webglRefused = true;
  });
  await page.reload({ waitUntil: 'load' });
  await waitForRollScreen(page);
  await page.waitForFunction(
    () => (document.querySelector('.screen')?.dataset.trayDecision ?? 'pending') !== 'pending',
    { timeout: 30000 },
  );
  const below = await page.evaluate(() => ({
    injected: window.__webglRefused === true,
    context: document.createElement('canvas').getContext('webgl2'),
    decision: document.querySelector('.screen')?.dataset.trayDecision ?? null,
    renderer: document.querySelector('.screen')?.dataset.renderer ?? null,
    canvases: document.querySelectorAll('canvas').length,
  }));
  await waitForFault(page, FAULT_SLOT_ELEMENT.table);
  const absent = note('table-absent', await readFaultBanner(page));
  const absentShot = await captureFaultScreen(page, '0024-fault-table-absent-360.png');
  const toggle = await page.evaluate(async () => {
    document.querySelector('[data-el="disclosure-toggle"]')?.click();
    await new Promise((done) => setTimeout(done, 200));
    const control = document.querySelector('[data-el="sheet-tray-renderer"] input');
    const answer = {
      found: control !== null,
      disabled: control?.disabled ?? null,
      note: (document.querySelector('[data-el="sheet-tray-note"]')?.textContent ?? '').trim(),
    };
    document.querySelector('[data-el="sheet-close"]')?.click();
    return answer;
  });
  const tableRow = absent.rows.find((row) => row.el === FAULT_SLOT_ELEMENT.table);
  console.log(
    `browser: faults table absent injection=${below.injected} webgl2=${below.context} ` +
      `decision=${below.decision} renderer=${below.renderer} canvases=${below.canvases} ` +
      `toggle_disabled=${toggle.disabled} row=${JSON.stringify(tableRow?.text ?? '')}`,
  );
  checks.push({
    name: 'faults.a-browser-that-cannot-draw-the-table-says-what-is-lost-and-offers-nothing',
    ok:
      below.injected &&
      below.context === null &&
      below.decision === 'false' &&
      below.renderer === 'flat' &&
      below.canvases === 0 &&
      absent.filled.includes('table-absent') &&
      /flat now/.test(tableRow?.text ?? '') &&
      !/More/.test(tableRow?.text ?? '') &&
      toggle.disabled === true &&
      absent.stops === 0,
    detail:
      `the run refused every WebGL context before the first line of the page ran and proved it ` +
      `(getContext('webgl2') answers ${below.context}). The startup probe then answered ` +
      `tray=${below.decision}, the screen draws ${below.renderer} dice over ${below.canvases} ` +
      `canvases, and the banner reads ${JSON.stringify(tableRow?.text ?? '')}. This fault has no ` +
      `route back and must offer none: the words name no control, and the toggle on the sheet ` +
      `is disabled=${toggle.disabled}, so a route the player could not take is never printed. ` +
      `The sheet says why: ${JSON.stringify(toggle.note)}. Capture: ${absentShot}.`,
  });
  judged.add('table-absent');

  // ---- 3. The chunk refused at the network layer, and the route back taken. ----
  //
  // The same route Unit 3.7 built: the worker and every cache go first, because
  // either of them can answer a request the network refused.
  await page.removeScriptToEvaluateOnNewDocument(noWebgl.identifier);
  await page.goto(options.url, { waitUntil: 'load' });
  await clearWorkerAndCaches(page);
  // The phase before this one recorded a permanent fall, and a session that
  // OPENS on a recorded fall says nothing, which is Unit 3.7's rule and not a
  // fault of this one. So the record goes, and the fall this phase measures is
  // the fall this phase caused.
  await page.evaluate(() => {
    try {
      localStorage.clear();
    } catch {
      // A browser that refuses storage answers the defaults anyway.
    }
  });

  let blocking = true;
  const chunkAsked = [];
  const abortRefusals = [];
  await page.setCacheEnabled(false);
  await page.setRequestInterception(true);
  const intercept = (request) => {
    const url = request.url();
    if (blocking && (TRAY_CHUNK.test(url) || WORKER_FILES.test(url))) {
      chunkAsked.push(url);
      request.abort().catch(() => abortRefusals.push(url));
      return;
    }
    request.continue().catch(() => {
      // A request the driver could not resume is reported by the run below.
    });
  };
  page.on('request', intercept);
  await page.reload({ waitUntil: 'load' });
  await waitForRollScreen(page);
  await page.click('[data-el="collapse-button"]');
  await page.waitForFunction(
    () => document.querySelector('.screen[data-renderer="flat"]') !== null,
    { timeout: 30000 },
  );
  await waitForFault(page, FAULT_SLOT_ELEMENT.table);
  const lost = note('table-lost', await readFaultBanner(page));
  const lostShot = await captureFaultScreen(page, '0024-fault-table-lost-360.png');
  const lostRow = lost.rows.find((row) => row.el === FAULT_SLOT_ELEMENT.table);
  const chunkBytes = await page.evaluate(() =>
    performance
      .getEntriesByType('resource')
      .filter((entry) => /\/dice-tray-[^/]+\.js$/.test(entry.name))
      .reduce((total, entry) => total + (entry.encodedBodySize || 0), 0),
  );
  console.log(
    `browser: faults table lost chunk_requests=${chunkAsked.length} refused_aborts=` +
      `${abortRefusals.length} chunk_bytes=${chunkBytes} row=${JSON.stringify(lostRow?.text ?? '')}`,
  );
  checks.push({
    name: 'faults.a-refused-chunk-says-so-and-names-the-route-back',
    ok:
      chunkAsked.length > 0 &&
      abortRefusals.length === 0 &&
      chunkBytes === 0 &&
      lost.filled.includes('table-lost') &&
      /flat now/.test(lostRow?.text ?? '') &&
      /Reload this page/.test(lostRow?.text ?? '') &&
      /switch the table on/.test(lostRow?.text ?? '') &&
      lost.stops === 0,
    detail:
      `the screen asked for the 3D chunk ${chunkAsked.length} times and every request was ` +
      `refused at the network layer, with the worker and every cache removed first, so no store ` +
      `could answer it. The chunk's own resource timing reads ${chunkBytes} encoded bytes. The ` +
      `banner reads ${JSON.stringify(lostRow?.text ?? '')}, which must name the route back, and ` +
      `the banner holds ${lost.stops} tab stops, so the route is a control that already exists ` +
      `and never a new one. Capture: ${lostShot}.`,
  });
  judged.add('table-lost');

  // Take the route. The chunk is served again from here on, so every failure
  // below belongs to the page and never to the network.
  //
  // **The order in the words is measured, not chosen.** A dynamic import that
  // failed once is remembered by the module map, so the same document can never
  // fetch that chunk again: the toggle alone asks for the table, the import
  // fails without a request, and the screen falls back exactly as it should.
  // The reload is therefore part of the route and not a convenience, and this
  // run measures both halves rather than quoting a measurement from one day.
  blocking = false;
  const withoutReload = await (async () => {
    const opened = await pressWithKeyboard(page, 'disclosure-toggle');
    await page.waitForSelector('[data-el="sheet-tray-renderer"]', { timeout: 15000 });
    const toggled = await pressWithKeyboard(page, 'sheet-tray-renderer');
    await page.evaluate(() => document.querySelector('[data-el="sheet-close"]')?.click());
    await settleScreen(page);
    await new Promise((done) => setTimeout(done, 1500));
    const seen = await page.evaluate(() => {
      const entries = performance
        .getEntriesByType('resource')
        .filter((entry) => /\/dice-tray-[^/]+\.js$/.test(entry.name));
      return {
        renderer: document.querySelector('.screen')?.dataset.renderer ?? null,
        entries: entries.length,
        bytes: entries.reduce((total, entry) => total + (entry.encodedBodySize || 0), 0),
      };
    });
    return { opened, toggled, seen };
  })();
  console.log(
    `browser: faults the toggle alone renderer=${withoutReload.seen.renderer} ` +
      `chunk_entries=${withoutReload.seen.entries} chunk_bytes=${withoutReload.seen.bytes} ` +
      `asked_while_blocked=${chunkAsked.length}`,
  );

  await page.reload({ waitUntil: 'load' });
  await waitForRollScreen(page);
  const canDraw = await page.evaluate(
    () => document.querySelector('.screen')?.dataset.trayDecision ?? null,
  );
  const asked = await pressWithKeyboard(page, 'disclosure-toggle');
  await page.waitForSelector('[data-el="sheet-tray-renderer"]', { timeout: 15000 });
  const pressed = await pressWithKeyboard(page, 'sheet-tray-renderer');
  await page.evaluate(() => document.querySelector('[data-el="sheet-close"]')?.click());
  await page
    .waitForFunction(() => document.querySelector('.screen')?.dataset.renderer === 'tray', {
      timeout: 30000,
    })
    .catch(() => undefined);
  // A reload opens the builder again, and the table is hidden at rest A. `Done`
  // is what shows it, so the mount can only be refused by the choice and never
  // by a table the screen never drew.
  await page.click('[data-el="collapse-button"]').catch(() => undefined);
  await page
    .waitForFunction(() => document.querySelectorAll('canvas').length > 0, { timeout: 30000 })
    .catch(() => undefined);
  await settleScreen(page);
  await new Promise((done) => setTimeout(done, 1500));
  const after = await page.evaluate(() => ({
    renderer: document.querySelector('.screen')?.dataset.renderer ?? null,
    canvases: document.querySelectorAll('canvas').length,
    row: (document.querySelector('[data-el="flat-fallback-note"]')?.textContent ?? '').trim(),
  }));
  console.log(
    `browser: faults route back name=${JSON.stringify(pressed.name)} ` +
      `control=${pressed.control} checked_after=${pressed.checked} decision=${canDraw} ` +
      `renderer=${after.renderer} canvases=${after.canvases} row=${JSON.stringify(after.row)}`,
  );
  checks.push({
    name: 'faults.the-route-back-from-a-refused-chunk-works-when-it-is-taken',
    // A machine the startup probe put below the bar cannot take this route at
    // all, and the toggle back is dead there by design. Such a run says so
    // rather than reporting a pass it never earned.
    skipped: canDraw !== 'true',
    ok:
      asked.found &&
      pressed.found &&
      pressed.name.length > 0 &&
      pressed.checked === true &&
      after.renderer === 'tray' &&
      after.canvases === 1 &&
      after.row === '' &&
      withoutReload.seen.renderer === 'flat' &&
      withoutReload.seen.entries === 1 &&
      withoutReload.seen.bytes === 0,
    detail:
      (canDraw === 'true'
        ? ''
        : `NOT JUDGED. The startup probe answered tray=${canDraw} on this machine, so the ` +
          `toggle back is refused by design and the route cannot be taken here. `) +
      `The words name two steps in one order, and the order is measured here. The chunk is ` +
      `served again for both halves, so nothing below is the network. FIRST, the toggle alone: ` +
      `the screen still draws ${withoutReload.seen.renderer} dice and the chunk's resource list ` +
      `still holds ${withoutReload.seen.entries} entry of ${withoutReload.seen.bytes} bytes, so ` +
      `NO second request was made at all. A dynamic import that failed once is remembered by the ` +
      `module map, so a toggle inside the same document can never bring the table back, and the ` +
      `screen falls again exactly as it should. THEN the whole route: reload, open More with the ` +
      `keyboard (${JSON.stringify(asked.name)}), and press ` +
      `${JSON.stringify(pressed.name)}, a ${pressed.control} carrying that accessible name, with ` +
      `the space bar. The state is read AFTER the recovery: the control reads ` +
      `checked=${pressed.checked}, the screen draws ${after.renderer} dice over ` +
      `${after.canvases} canvases, and the row now reads ${JSON.stringify(after.row)}.`,
  });

  page.off('request', intercept);
  await page.setRequestInterception(false);
  await page.setCacheEnabled(true);

  // ---- 4. A log that stopped, and the reload the words ask for. ----
  //
  // Nothing is patched. Another connection asks the browser to delete the
  // database, the application's own connection closes on `versionchange`, and
  // the next write meets a connection that is gone.
  await page.goto(options.url, { waitUntil: 'load' });
  await waitForRollScreen(page);
  await pressTile(page, 'attribute', 'p', 3);
  await throwOnce(page);
  const beforeStop = await logHolds(page, 1);
  const deleted = await page.evaluate(
    (db) =>
      new Promise((resolve) => {
        const request = indexedDB.deleteDatabase(db);
        request.onsuccess = () => resolve('deleted');
        request.onerror = () => resolve(`error: ${request.error}`);
        request.onblocked = () => resolve('blocked');
        setTimeout(() => resolve('no answer'), 8000);
      }),
    LOG_DB,
  );
  await throwOnce(page);
  const stoppedSaid = await waitForFault(page, FAULT_SLOT_ELEMENT.log);
  const stopped = note('log-error', await readFaultBanner(page));
  const stoppedShot = await captureFaultScreen(page, '0024-fault-log-stopped-360.png');
  console.log(
    `browser: faults log stopped before=${beforeStop.rolls.length} delete=${deleted} ` +
      `filled=[${stopped.filled.join(' ')}] row=${JSON.stringify(stoppedSaid)}`,
  );
  checks.push({
    name: 'faults.a-log-that-stopped-says-so-and-says-what-is-lost',
    ok:
      beforeStop.rolls.length > 0 &&
      deleted === 'deleted' &&
      stopped.filled.includes('log-error') &&
      /not in it/.test(stoppedSaid) &&
      /Reload/.test(stoppedSaid) &&
      stopped.stops === 0,
    detail:
      `${beforeStop.rolls.length} roll reached the log, then another connection asked the ` +
      `browser to delete the database and the browser answered ${deleted}. The application's own ` +
      `connection closes on versionchange, which is its own code and not an injection, so the ` +
      `next throw met a connection that was gone. The banner reads ${JSON.stringify(stoppedSaid)}. ` +
      `Capture: ${stoppedShot}.`,
  });
  judged.add('log-error');

  await page.reload({ waitUntil: 'load' });
  await waitForRollScreen(page);
  await pressTile(page, 'attribute', 'p', 3);
  await throwOnce(page);
  const recovered = await logHolds(page, 1);
  const afterReload = await readFaultBanner(page);
  console.log(
    `browser: faults log recovered rolls=${recovered.rolls.length} ` +
      `filled=[${afterReload.filled.join(' ')}]`,
  );
  checks.push({
    name: 'faults.the-reload-a-stopped-log-asks-for-works-when-it-is-taken',
    ok:
      recovered.error === null &&
      recovered.rolls.length > 0 &&
      !afterReload.filled.includes('log-error'),
    detail:
      `the words say to reload the page to write rolls again, so the run reloaded and threw. The ` +
      `state is read AFTER the recovery, out of IndexedDB through this file's own connection: ` +
      `the log holds ${recovered.rolls.length} rolls and the banner reads ` +
      `[${afterReload.filled.join(' ') || 'nothing'}].`,
  });

  // ---- 5. A malformed file, carrying hostile text. ----
  //
  // Constraint 8, and the case it was written for. The refusal must quote NO
  // part of the file: a column name is an identifier, and in a file the player
  // did not write it is whatever the file says it is.
  const HOSTILE = '<img src=x onerror=alert(1)>';
  await openHistory(page);
  const fed = await page.evaluate((hostile) => {
    const input = document.querySelector('[data-el="import-file"]');
    if (input === null) return { failed: 'the summary holds no import-file' };
    const file = new File([`${hostile},age\r\nada,36\r\n`], 'not-a-log.csv', { type: 'text/csv' });
    const carrier = new DataTransfer();
    carrier.items.add(file);
    input.files = carrier.files;
    const real = input.files.length === 1 && input.files[0].size > 0;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return { failed: null, real, size: file.size };
  }, HOSTILE);
  const refusedSaid = await waitForFault(page, FAULT_SLOT_ELEMENT.import);
  const refused = note('import-refused', await readFaultBanner(page));
  const refusedShot = await captureFaultScreen(page, '0024-fault-import-refused-360.png');
  const importRow = refused.rows.find((row) => row.el === FAULT_SLOT_ELEMENT.import);
  const scanned = await page.evaluate((hostile) => {
    const inside = document.querySelector('[data-el="history"]');
    return {
      text: (inside?.textContent ?? '').includes(hostile),
      images: document.querySelectorAll('[data-el="history"] img').length,
      html: (inside?.innerHTML ?? '').includes('onerror'),
      message: (document.querySelector('[data-el="history-message"]')?.textContent ?? '').trim(),
      control: (document.querySelector('[data-el="import-button"]')?.textContent ?? '').trim(),
    };
  }, HOSTILE);
  console.log(
    `browser: faults import refused real_file=${fed.real} bytes=${fed.size} ` +
      `row=${JSON.stringify(refusedSaid)} hostile_in_text=${scanned.text} ` +
      `images=${scanned.images} elements=${importRow?.elements ?? -1}`,
  );
  checks.push({
    name: 'faults.a-malformed-file-is-refused-in-the-player-s-own-words',
    ok:
      fed.failed === null &&
      fed.real === true &&
      refused.filled.includes('import-refused') &&
      /first line of this file/.test(refusedSaid) &&
      /Pick another file/.test(refusedSaid) &&
      !refusedSaid.includes(HOSTILE) &&
      !/age/.test(refusedSaid) &&
      scanned.text === false &&
      scanned.images === 0 &&
      scanned.html === false &&
      refused.stops === 0,
    detail:
      `a real File of ${fed.size} bytes went through the real picker, carrying ${HOSTILE} as its ` +
      `first column name. The banner reads ${JSON.stringify(refusedSaid)}. It must quote no part ` +
      `of the file: the parser's own message names that column, and the screen never prints it. ` +
      `The whole destination holds the hostile string ${scanned.text} times as text and ` +
      `${scanned.images} images, and its markup names onerror: ${scanned.html}. The row draws ` +
      `${importRow?.elements ?? -1} elements, which is the instruction span and nothing else. ` +
      `Capture: ${refusedShot}.`,
  });
  judged.add('import-refused');

  // Take the route: pick another file, and this one is a log.
  // The file is built in node, by the application's own writer, over the roll
  // the application itself logged a moment ago. The preview server serves the
  // built output and no source module, so the page cannot build it; and a roll
  // the application wrote is a file this application must be able to read back,
  // which a hand-made fixture would not prove.
  const csv = await import('../src/log/csv.ts');
  const held = await readLogRolls(page);
  const goodText = csv.csvParts(held.rolls).join('');
  const good = await page.evaluate((text) => {
    const input = document.querySelector('[data-el="import-file"]');
    const file = new File([text], 'a-real-log.csv', { type: 'text/csv' });
    const carrier = new DataTransfer();
    carrier.items.add(file);
    input.files = carrier.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return { bytes: file.size };
  }, goodText);
  // The wait ends on an answer of either kind, so a refused import fails the
  // check below rather than stopping the run at a timeout.
  await page
    .waitForFunction(
      () => {
        const said = document.querySelector('[data-el="history-message"]')?.textContent ?? '';
        const refusedAgain = (
          document.querySelector('[data-el="import-fault-note"]')?.textContent ?? ''
        ).trim();
        const logSaid = (
          document.querySelector('[data-el="log-fault-note"]')?.textContent ?? ''
        ).trim();
        return (
          (said.length > 0 && !said.startsWith('The import is running')) ||
          refusedAgain !== '' ||
          logSaid !== ''
        );
      },
      { timeout: 30000 },
    )
    .catch(() => undefined);
  const afterImport = await readFaultBanner(page);
  const importedLog = await readLogRolls(page);
  const saidAfter = await page.evaluate(() =>
    (document.querySelector('[data-el="history-message"]')?.textContent ?? '').trim(),
  );
  console.log(
    `browser: faults import recovered bytes=${good.bytes} rolls=${importedLog.rolls.length} ` +
      `filled=[${afterImport.filled.join(' ') || 'nothing'}] message=${JSON.stringify(saidAfter)}`,
  );
  checks.push({
    name: 'faults.picking-another-file-recovers-the-import',
    ok:
      importedLog.error === null &&
      held.rolls.length > 0 &&
      importedLog.rolls.length === held.rolls.length &&
      importedLog.rolls[0]?.rollId === held.rolls[0]?.rollId &&
      !afterImport.filled.includes('import-refused') &&
      saidAfter.includes('a-real-log.csv'),
    detail:
      `the words say to pick another file, so the run picked one this application wrote: the ` +
      `${held.rolls.length} rolls the store held, written back out through the application's own ` +
      `writer. The state is read AFTER the recovery, out of IndexedDB through this file's own ` +
      `connection: the log holds ${importedLog.rolls.length} rolls, the first is ` +
      `${importedLog.rolls[0]?.rollId} against ${held.rolls[0]?.rollId}, the fault row is clear ` +
      `([${afterImport.filled.join(' ') || 'nothing'}]) and the destination says ` +
      `${JSON.stringify(saidAfter)}.`,
  });

  // ---- 6. Every surface at 360 px, read rather than assumed. ----
  const widest = banners
    .flatMap(({ phase, banner }) =>
      banner.rows
        .filter((row) => row.text !== '')
        .map((row) => ({ phase, el: row.el, right: row.right, height: row.height })),
    )
    .sort((left, right) => right.right - left.right)[0];
  const shortest = banners
    .flatMap(({ banner }) => banner.rows.filter((row) => row.text !== ''))
    .sort((left, right) => left.height - right.height)[0];
  const roles = new Set(banners.map(({ banner }) => `${banner.role}/${banner.label}`));
  console.log(
    `browser: faults at ${FAULT_VIEWPORT.width} px widest=${widest ? widest.right : 'none'} ` +
      `shortest=${shortest ? shortest.height : 'none'} roles=[${[...roles].join(' ')}] ` +
      `phases=${banners.length}`,
  );
  checks.push({
    name: 'faults.every-surface-reaches-a-live-region-and-fits-a-phone',
    ok:
      banners.length >= 5 &&
      widest !== undefined &&
      widest.right <= FAULT_VIEWPORT.width &&
      shortest !== undefined &&
      shortest.height > 20 &&
      roles.size === 1 &&
      [...roles][0] === 'alert/Problems' &&
      banners.every(({ banner }) => banner.stops === 0),
    detail:
      `${banners.length} phases drew the banner at ${FAULT_VIEWPORT.width} by ` +
      `${FAULT_VIEWPORT.height}. The widest filled row ends at ${widest ? widest.right : 'none'} ` +
      `px against a viewport of ${FAULT_VIEWPORT.width}, so nothing runs off the side, and the ` +
      `shortest one is ${shortest ? shortest.height : 'none'} px high, so nothing is clipped to ` +
      `a line. Every phase read the same live region and the same name: ` +
      `[${[...roles].join(' ')}]. Every phase read ` +
      `${banners.map(({ banner }) => banner.stops).join(', ')} tab stops on the banner, so both ` +
      `keyboard walks of section 6 are the walks they were.`,
  });

  // ---- 7. The denominator. ----
  skipped.add('log-blocked');
  checks.push({
    name: 'faults.a-blocked-log-cannot-be-driven-in-the-shipped-application',
    skipped: true,
    ok: true,
    detail:
      `NOT JUDGED. A blocked open needs an UPGRADE for another connection to hold off, and the ` +
      `shipped database is at version 1, so no upgrade exists to block. The store's own blocked ` +
      `answer is driven against the real mechanism by --log-store, which opens a second ` +
      `connection at version 1 with no versionchange handler and asks for version 2, and the ` +
      `surface for it is asserted under jsdom in src/shell/history.test.tsx. This becomes ` +
      `judgeable the day DB_VERSION rises.`,
  });
  if (options.quotaKb === null) {
    skipped.add('log-full');
    checks.push({
      name: 'faults.a-full-store-says-so',
      skipped: true,
      ok: true,
      detail:
        `NOT JUDGED. A full store needs the browser launched with its own storage limit, which ` +
        `is a launch preference and not a page one. Run this mode again with --quota-kb to ` +
        `judge it.`,
    });
  }

  const covered = [...judged].sort();
  const missed = FAULT_KINDS.filter((kind) => !judged.has(kind) && !skipped.has(kind));
  console.log(
    `browser: faults covered=${covered.length} skipped=${skipped.size} ` +
      `of ${FAULT_KINDS.length} declared [${covered.join(' ')}] ` +
      `skipped=[${[...skipped].join(' ')}]`,
  );
  checks.push({
    name: 'faults.every-declared-fault-is-judged-or-skipped-by-name',
    ok: missed.length === 0 && covered.length + skipped.size === FAULT_KINDS.length,
    detail:
      `the denominator is FAULT_KINDS, imported from src/shell/faults.ts rather than restated ` +
      `here, and src/shell/faults.test.ts holds that list against the union declarations of ` +
      `every module that refuses. This run judged ${covered.length} of ${FAULT_KINDS.length} ` +
      `[${covered.join(' ')}] and skipped ${skipped.size} by name [${[...skipped].join(' ')}]. ` +
      `Unjudged and unnamed: [${missed.join(' ') || 'none'}]. A fault added to the union later ` +
      `lands here as a red rather than as a cell nobody read. The slots the surface draws are ` +
      `[${Object.keys(FAULT_SLOT_OF).length} faults over ${new Set(Object.values(FAULT_SLOT_OF)).size} slots].`,
  });
}

/**
 * The quota path. It runs alone, under `--quota-kb`, because the browser is
 * launched with a storage limit far below what a page needs and nothing else in
 * this mode could then run.
 */
async function runFaultsQuota(page, options, checks) {
  const { FAULT_KINDS, FAULT_SLOT_ELEMENT } = await import('../src/shell/faults.ts');
  await page.setViewport(FAULT_VIEWPORT);
  await clearLog(page);
  await page.reload({ waitUntil: 'load' });
  await waitForRollScreen(page);
  await pressTile(page, 'attribute', 'p', 3);
  await throwOnce(page);
  const before = await logHolds(page, 1);

  // Fill the origin's storage with random bytes in a database of this run's
  // own, until the browser refuses more. A run of zeros compresses away and
  // would never reach the limit.
  const filled = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const request = indexedDB.open('faults-filler', 1);
        request.onupgradeneeded = () => request.result.createObjectStore('blocks');
        request.onerror = () => resolve({ failed: String(request.error) });
        request.onsuccess = async () => {
          const db = request.result;
          const block = new Uint8Array(256 * 1024);
          for (let at = 0; at < block.length; at += 65536) {
            crypto.getRandomValues(block.subarray(at, at + 65536));
          }
          let written = 0;
          let stopped = null;
          for (let i = 0; i < 400 && stopped === null; i += 1) {
            stopped = await new Promise((done) => {
              const transaction = db.transaction('blocks', 'readwrite');
              transaction.objectStore('blocks').add(block.slice(), i);
              transaction.oncomplete = () => {
                written += 1;
                done(null);
              };
              transaction.onabort = () => done(String(transaction.error));
            });
          }
          db.close();
          const estimate = await navigator.storage.estimate();
          resolve({ failed: null, written, stopped, estimate });
        };
      }),
  );
  await throwOnce(page);
  const fullSaid = await waitForFault(page, FAULT_SLOT_ELEMENT.log);
  const banner = await readFaultBanner(page);
  const fullShot = await captureFaultScreen(page, '0024-fault-storage-full-360.png');
  const afterFull = await readLogRolls(page);
  console.log(
    `browser: faults quota limit=${filled.estimate ? filled.estimate.quota : 'none'} ` +
      `blocks=${filled.written} stopped=${filled.stopped} rolls_before=${before.rolls.length} ` +
      `rolls_after=${afterFull.rolls.length} filled=[${banner.filled.join(' ')}] ` +
      `row=${JSON.stringify(fullSaid)}`,
  );
  checks.push({
    name: 'faults.a-full-store-says-so-and-says-which-roll-was-lost',
    ok:
      filled.failed === null &&
      filled.written > 0 &&
      /QuotaExceededError/.test(String(filled.stopped)) &&
      banner.filled.includes('log-full') &&
      /storage is full/.test(fullSaid) &&
      /Make room/.test(fullSaid) &&
      /reload this page/i.test(fullSaid) &&
      banner.stops === 0,
    detail:
      `the browser was launched with a storage limit of ` +
      `${filled.estimate ? filled.estimate.quota : 'none'} bytes, which is its own testing ` +
      `switch and not a simulation. ${filled.written} blocks of 256 KB of random bytes went in ` +
      `and then the browser answered ${filled.stopped}. The next throw met a full origin, and ` +
      `the banner reads ${JSON.stringify(fullSaid)}. It must name the roll that was lost and ` +
      `the way to make room, and it must not read as a fault of the application. The log held ` +
      `${before.rolls.length} rolls before and ${afterFull.rolls.length} after. ` +
      `Capture: ${fullShot}.`,
  });

  // Take the route: make room, then throw again.
  const cleared = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const request = indexedDB.deleteDatabase('faults-filler');
        request.onsuccess = () => resolve('deleted');
        request.onerror = () => resolve(`error: ${request.error}`);
        request.onblocked = () => resolve('blocked');
        setTimeout(() => resolve('no answer'), 8000);
      }),
  );
  // Room alone, without the reload. This is the half that measures the ORDER in
  // the words rather than assuming it.
  await throwOnce(page);
  const roomOnly = await readFaultBanner(page);
  const roomOnlyLog = await readLogRolls(page);
  console.log(
    `browser: faults room made ${cleared} without a reload rolls=${roomOnlyLog.rolls.length} ` +
      `filled=[${roomOnly.filled.join(' ') || 'nothing'}]`,
  );

  await page.reload({ waitUntil: 'load' });
  await waitForRollScreen(page);
  await pressTile(page, 'attribute', 'p', 3);
  await throwOnce(page);
  const roomy = await logHolds(page, afterFull.rolls.length + 1, 12000);
  const afterRoom = await readFaultBanner(page);
  console.log(
    `browser: faults room and a reload rolls=${roomy.rolls.length} ` +
      `filled=[${afterRoom.filled.join(' ') || 'nothing'}]`,
  );
  checks.push({
    name: 'faults.making-room-and-reloading-recovers-the-log',
    ok:
      cleared === 'deleted' &&
      roomy.error === null &&
      roomy.rolls.length > afterFull.rolls.length &&
      afterRoom.filled.length === 0,
    detail:
      `the words name two steps in one order, and the order is measured here. The run deleted ` +
      `the filler database (${cleared}), which is the room. FIRST, room alone: the log still ` +
      `held ${roomOnlyLog.rolls.length} rolls and the banner read ` +
      `[${roomOnly.filled.join(' ') || 'nothing'}], because a transaction that aborts on the ` +
      `quota leaves the connection unusable and the next write answers a fault of the log ` +
      `rather than a full one. THEN the whole route: reload, and throw. The state is read AFTER ` +
      `the recovery, out of IndexedDB through this file's own connection: the log moved from ` +
      `${afterFull.rolls.length} rolls to ${roomy.rolls.length} and the banner reads ` +
      `[${afterRoom.filled.join(' ') || 'nothing'}].`,
  });

  const judged = ['log-full'];
  const skippedHere = FAULT_KINDS.filter((kind) => !judged.includes(kind));
  console.log(
    `browser: faults quota covered=${judged.length} of ${FAULT_KINDS.length} declared ` +
      `[${judged.join(' ')}] left to the plain run=[${skippedHere.join(' ')}]`,
  );
  for (const kind of skippedHere) {
    checks.push({
      name: `faults.${kind}-is-not-judged-under-a-storage-limit`,
      skipped: true,
      ok: true,
      detail:
        `NOT JUDGED. This run launched the browser with a storage limit, so it judges the full ` +
        `store alone. Run this mode without --quota-kb to judge ${kind}.`,
    });
  }
}

async function run(options) {
  const checks = [];
  const { page, close } = await openPage(options);
  // The offline run owns the server it later stops. Every other mode is handed
  // a url that somebody else is serving.
  let server = null;
  try {
    if (
      options.offline ||
      options.shell ||
      options.a11y ||
      options.sheet ||
      options.theme ||
      options.history ||
      options.blockedChunk ||
      options.faults ||
      options.shareControls ||
      options.soundControls ||
      options.overlay ||
      options.table
    ) {
      server = await startPreviewServer(options.url, join(here, '..'));
    }
    if (
      options.tray ||
      options.pool ||
      options.push ||
      options.affordance ||
      options.contextLoss ||
      options.reducedMotion ||
      options.sound ||
      options.share ||
      options.shareControls ||
      options.soundControls ||
      options.overlay ||
      options.table
    ) {
      await page.setViewport({
        width: options.viewport.width,
        height: options.viewport.height,
        deviceScaleFactor: options.viewport.dpr,
      });
    }
    if (options.url) await page.goto(options.url, { waitUntil: 'load' });
    else await buildScene(page);

    // The vendored tray draws its throw vector from `Math.random`, so an
    // unseeded run throws from a different place every time. The generator
    // `perf.mjs` uses to emit its pinned scene replaces it here, for the whole
    // page. The seed is printed on every run, so a run that goes red can be
    // repeated exactly with `--throw-seed`. It is drawn fresh when the caller
    // names none, because a fixed default would throw the same pool for ever
    // and stop sampling.
    await page.evaluate(`Math.random = (${mulberry32})(${options.throwSeed});`);
    console.log(`browser: throw_seed=${options.throwSeed}`);

    const { renderer, reason } = await readRenderer(page);
    const verdict = classifyRenderer(renderer);
    const shown = renderer === null ? `unreadable (${reason})` : renderer;
    console.log(`browser: renderer ${verdict.kind}: ${shown}`);
    checks.push({
      name: 'renderer',
      ok: !options.hardware || verdict.kind === 'hardware',
      detail: options.hardware
        ? `a hardware run needs a hardware renderer. Got ${verdict.kind}: ${shown}`
        : `mode=ordinary, the renderer is reported and not judged: ${verdict.kind}`,
    });

    const frames = await sampleFrameCount(page, options.sampleMs);
    checks.push({
      name: 'frame-count-floor',
      ok: frames >= options.minFrames,
      detail: `sampled ${frames} frames over ${options.sampleMs} ms against a floor of ${options.minFrames}. A statistic over fewer frames than the floor is not reportable.`,
    });

    if (options.tray) {
      await runTrayScene(page, options, checks);
    } else if (options.pool) {
      await runPoolScene(page, options, checks);
    } else if (options.push) {
      await runPushScene(page, options, checks);
    } else if (options.affordance) {
      await runAffordanceScene(page, options, checks);
    } else if (options.probe) {
      await runProbe(page, options, checks);
    } else if (options.contextLoss) {
      await runContextLoss(page, options, checks);
    } else if (options.reducedMotion) {
      await runReducedMotion(page, options, checks);
    } else if (options.sound) {
      await runSoundScene(page, options, checks);
    } else if (options.logStore) {
      await runLogStore(page, options, checks);
    } else if (options.logCsv) {
      await runLogCsv(page, options, checks);
    } else if (options.settingsStore) {
      await runSettingsStore(page, options, checks);
    } else if (options.share) {
      await runShareCard(page, options, checks);
    } else if (options.shareControls) {
      await runShareControls(page, options, checks);
    } else if (options.soundControls) {
      await runSoundControls(page, options, checks);
    } else if (options.overlay) {
      await runOverlay(page, options, checks);
    } else if (options.offline) {
      await runOffline(page, options, checks, server);
    } else if (options.shell) {
      await runShell(page, options, checks);
    } else if (options.a11y) {
      await runA11y(page, options, checks);
    } else if (options.sheet) {
      await runSheet(page, options, checks);
    } else if (options.theme) {
      await runTheme(page, options, checks);
    } else if (options.history) {
      await runHistory(page, options, checks);
    } else if (options.blockedChunk) {
      await runBlockedChunk(page, options, checks, server);
    } else if (options.faults) {
      if (options.quotaKb === null) await runFaults(page, options, checks);
      else await runFaultsQuota(page, options, checks);
    } else if (options.table) {
      await runTable(page, options, checks);
    } else if (!options.url) {
      await selfTestCentroid(page, checks);
      await selfTestUpFace(page, checks);
      await selfTestCapture(page, checks, options.capture);
    } else if (options.capture) {
      writeFileSync(options.capture, await captureCanvas(page));
    }
  } finally {
    await close();
    // Already stopped on the happy path. This covers a run that threw first,
    // so no detached server outlives the process that started it.
    if (server) stopPreviewServer(server);
  }
  return checks;
}

async function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`browser: ${error.message}`);
    return 2;
  }

  const checks = await run(options);
  let failures = 0;
  // A skipped check is a check nobody judged. It is printed under its own word
  // and counted in the summary, because a skip that reads as a pass is a claim
  // of coverage the run never made.
  let skipped = 0;
  for (const check of checks) {
    if (check.skipped) skipped += 1;
    else if (!check.ok) failures += 1;
    const mark = check.skipped ? 'SKIP' : check.ok ? 'OK' : 'FAIL';
    console.log(`browser: ${mark} ${check.name} ${check.detail}`);
  }
  console.log(
    `browser: mode=${options.hardware ? 'hardware' : 'ordinary'} ` +
      `checks=${checks.length} failures=${failures} skipped=${skipped}`,
  );
  return failures === 0 ? 0 : 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = await main();
}
