// The renderer matcher, over a named table. The driven runs on this host cover
// three names only: the card, one Mesa software path, and no context at all.
// Every other software rasteriser the list claims to know is checked here.
//
// Run by `npm test`. The browser run itself stays out of `validate`, because a
// driven browser is slow and `/ship` caps validation at five attempts.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyRenderer,
  measureFrame,
  readJpeg,
  sameSetting,
  toChromaticity,
  toLinear,
} from './browser.mjs';

// Every entry states the name and the verdict it must produce. The two entries
// marked "measured" are the exact strings this host returned on 2026-08-09.
const CASES = [
  // Hardware. A Mesa hardware driver names the card, so `mesa` alone must not
  // be on the software list.
  [
    'AMD Radeon RX 6700 XT (radeonsi, navi22, ACO, DRM 3.64, 7.1.5-201.fc44.x86_64)',
    'hardware',
    'measured',
  ],
  ['NVIDIA GeForce RTX 3060/PCIe/SSE2', 'hardware'],
  ['Apple M2', 'hardware'],
  ['Mesa Intel(R) UHD Graphics 620 (KBL GT2)', 'hardware'],
  ['ANGLE (Intel, Intel(R) Iris(R) Xe Graphics Direct3D11 vs_5_0 ps_5_0)', 'hardware'],

  // Software rasterisers.
  ['llvmpipe (LLVM 22.1.8, 256 bits)', 'software', 'measured'],
  ['Google SwiftShader', 'software'],
  ['ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)))', 'software'],
  ['softpipe', 'software'],
  ['Mesa OffScreen', 'software'],
  ['Gallium 0.4 on llvmpipe (LLVM 15.0.7, 256 bits)', 'software'],
  ['Mesa/X.org -- swrast', 'software'],
  ['llvmpipe, or similar', 'software'], // the sanitised name Firefox reports by default
  ['lavapipe (LLVM 22.1.8, 256 bits)', 'software'],
  ['Microsoft Basic Render Driver', 'software'],
  ['Apple Software Renderer', 'software'],
  ['Generic Renderer', 'software'],

  // Unknown is not the same as good. A hardware run fails on all of these.
  [null, 'unreadable'],
  [undefined, 'unreadable'],
  ['', 'unreadable'],
  ['   ', 'unreadable'],
  [42, 'unreadable'],
];

test('every named renderer lands in the verdict it must', () => {
  let compared = 0;
  for (const [name, expected] of CASES) {
    assert.equal(classifyRenderer(name).kind, expected, `renderer ${JSON.stringify(name)}`);
    compared += 1;
  }
  // The denominator. A table that silently shrank would otherwise still pass.
  assert.equal(compared, CASES.length);
  assert.equal(compared, 22);
});

// The colour space the pool check compares in. The numbers below were measured
// on seed 22: `gear-d6` lay 72 per cent behind `artifact-d12` and its own
// pixels read `49,84,114`, which is the gear blue at about half of its
// brightness. A distance over linear RGB put that die nearer the mean of the
// darker violet type, so the old instrument measured the light as well as the
// hue. The palette values are the two type colours involved.
const GEAR = [104, 170, 226];
const ARTIFACT = [169, 119, 207];
const GEAR_IN_SHADOW = [49, 84, 114];

test('a die in shadow keeps its own hue, and brightness alone moved it before', () => {
  const linear = (bytes) => bytes.map(toLinear);
  const gap = (a, b) => Math.hypot(...a.map((value, channel) => value - b[channel]));
  const chroma = (bytes) => toChromaticity(linear(bytes));

  // The defect, pinned. In linear RGB the shaded gear die sits nearer the
  // artifact colour than its own. Delete the fix and this is what comes back.
  assert.ok(
    gap(linear(GEAR_IN_SHADOW), linear(ARTIFACT)) < gap(linear(GEAR_IN_SHADOW), linear(GEAR)),
    'the measurement this test was written for no longer reproduces',
  );

  // The fix. Brightness is divided out, so the shaded die lands on its own
  // colour by a wide margin.
  assert.ok(
    gap(chroma(GEAR_IN_SHADOW), chroma(GEAR)) < gap(chroma(GEAR_IN_SHADOW), chroma(ARTIFACT)),
    'a shaded gear die must read as gear in chromaticity',
  );

  // Scale invariance, which is the property the whole repair rests on. Any
  // amount of light on the same surface must give the same point, because the
  // renderer multiplies the type colour by the light which reaches it.
  const lit = chroma(GEAR);
  for (const scale of [0.5, 0.05, 3]) {
    const dimmed = toChromaticity(linear(GEAR).map((value) => value * scale));
    assert.ok(
      gap(dimmed, lit) < 1e-12,
      `light times ${scale} moved the point by ${gap(dimmed, lit)}`,
    );
  }

  // No light carries no hue. Such a pixel is a visibility finding, not a point.
  assert.equal(toChromaticity([0, 0, 0]), null);
});

// ---------------------------------------------------------------------------
// The share card — Unit 4.9
//
// Both acceptance measures and the file check have to be able to go red. The
// pixel measures are red-proved on the graphics card by `--capture-later`, and
// the numbers below pin what they answer on frames derived by hand. The file
// check is red-proved here, because a truncated or empty capture is not
// something a browser run produces on demand.
// ---------------------------------------------------------------------------

/** Four bytes per pixel, as `ImageData.data` holds them. */
function frame(pixels) {
  return Uint8ClampedArray.from(pixels.flatMap(([r, g, b]) => [r, g, b, 255]));
}

test('a one-colour frame carries no variance and one value, whatever the colour', () => {
  for (const colour of [
    [0, 0, 0],
    [35, 38, 43],
    [255, 255, 255],
  ]) {
    const measured = measureFrame(frame(Array.from({ length: 400 }, () => colour)));
    assert.equal(measured.pixels, 400);
    assert.ok(measured.variance < 1e-9, `variance ${measured.variance} for ${colour}`);
    assert.equal(measured.distinct, 1);
  }
});

test('the variance is the luma variance, derived by hand', () => {
  // Half black, half white. Luma runs 0 to 255, so the mean is 127.5 and every
  // pixel is 127.5 away from it. The variance is that distance squared.
  const half = Array.from({ length: 200 }, (unused, index) =>
    index < 100 ? [0, 0, 0] : [255, 255, 255],
  );
  const measured = measureFrame(frame(half));
  assert.ok(Math.abs(measured.mean - 127.5) < 1e-9, `mean ${measured.mean}`);
  assert.ok(Math.abs(measured.variance - 127.5 ** 2) < 1e-9, `variance ${measured.variance}`);
  assert.equal(measured.distinct, 2);

  // A ramp on one channel. 256 distinct values, and a red ramp is dimmer than
  // a grey one by the Rec. 709 red weight, so the mean states the convention.
  const ramp = measureFrame(frame(Array.from({ length: 256 }, (unused, i) => [i, 0, 0])));
  assert.equal(ramp.distinct, 256);
  assert.ok(Math.abs(ramp.mean - 0.2126 * 127.5) < 1e-9, `mean ${ramp.mean}`);
});

test('an empty image is a failure, not a variance of zero', () => {
  assert.throws(() => measureFrame(new Uint8ClampedArray(0)), /no pixels/);
});

/**
 * A structurally valid JPEG of a named size. It carries no scan, because
 * `readJpeg` reads the header and never decodes.
 */
function jpegHeader(width, height) {
  const app0 = [
    0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01,
    0x00, 0x00,
  ];
  const sof0 = [
    0xff,
    0xc0,
    0x00,
    0x11,
    0x08,
    (height >> 8) & 0xff,
    height & 0xff,
    (width >> 8) & 0xff,
    width & 0xff,
    0x03,
    0x01,
    0x22,
    0x00,
    0x02,
    0x11,
    0x01,
    0x03,
    0x11,
    0x01,
  ];
  return Uint8Array.from([0xff, 0xd8, ...app0, ...sof0, 0xff, 0xd9]);
}

test('a whole JPEG reads its own declared size', () => {
  const read = readJpeg(jpegHeader(1440, 900));
  assert.equal(read.ok, true, read.reason);
  assert.equal(read.width, 1440);
  assert.equal(read.height, 900);
  assert.equal(read.marker, 'ffc0');
});

test('an empty, a truncated and a foreign file all fail, each for its own reason', () => {
  const whole = jpegHeader(800, 600);
  const CASES = [
    [new Uint8Array(0), /too short/, 'a capture that wrote nothing'],
    [whole.subarray(0, 3), /too short/, 'three bytes'],
    [whole.subarray(0, whole.length - 6), /truncated/, 'a half-written file'],
    [whole.subarray(0, whole.length - 2), /truncated/, 'the end-of-image marker cut off'],
    [
      Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0xff, 0xd9]),
      /opens 89504e/,
      'a PNG under a .jpg name',
    ],
    [
      Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, ...new Array(14).fill(0), 0xff, 0xd9]),
      /no frame header/,
      'a JPEG with no frame header',
    ],
  ];
  let compared = 0;
  for (const [bytes, pattern, why] of CASES) {
    const read = readJpeg(bytes);
    assert.equal(read.ok, false, `${why} must fail`);
    assert.match(read.reason, pattern, why);
    compared += 1;
  }
  // The denominator. A table that silently shrank would otherwise still pass.
  assert.equal(compared, CASES.length);
  assert.equal(compared, 6);
});

// The settings comparison the `--settings-store` mode reads every field
// through. Unit 4.3 gave the record a field that holds a list, so identity
// stopped being the right test: every read builds a new array. A comparison
// that stayed on identity would report drift on a correct read, and one that
// only stringified would call 1 and "1" the same setting.
test('two readings of a settings field compare by value for a list and by identity for a scalar', () => {
  const CASES = [
    [[], [], true, 'two empty preset lists'],
    [
      [{ name: 'a', counts: { attribute: 2 } }],
      [{ name: 'a', counts: { attribute: 2 } }],
      true,
      'two equal preset lists',
    ],
    [[{ name: 'a', counts: {} }], [{ name: 'b', counts: {} }], false, 'a renamed preset'],
    [
      [
        { name: 'a', counts: {} },
        { name: 'b', counts: {} },
      ],
      [
        { name: 'b', counts: {} },
        { name: 'a', counts: {} },
      ],
      false,
      'a reordered list',
    ],
    [[], [{ name: 'a', counts: {} }], false, 'an empty list against one preset'],
    ['step', 'step', true, 'two equal modes'],
    ['step', 'pool', false, 'two different modes'],
    [0.25, 0.25, true, 'two equal volumes'],
    [1, '1', false, 'a number against the text of that number'],
    [true, false, false, 'two different flags'],
    [null, null, true, 'two absent values'],
  ];
  let compared = 0;
  for (const [left, right, same, why] of CASES) {
    assert.equal(sameSetting(left, right), same, why);
    compared += 1;
  }
  // The denominator. A table that silently shrank would otherwise still pass.
  assert.equal(compared, CASES.length);
  assert.equal(compared, 11);
});
