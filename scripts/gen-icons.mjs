#!/usr/bin/env node
// The application icons, drawn here rather than downloaded. This repository
// downloads no asset, and an icon is a branding surface, so the mark is an
// abstract one: a dark square with five pips. It names nothing and it copies
// no published face art.
//
// One drawing serves both the plain and the maskable purpose. The pips sit
// inside the safe circle a maskable icon reserves — the circle of 80 per cent
// of the width — so a launcher may crop the square to any shape it likes and
// still show the whole mark.
//
// Usage:
//   node scripts/gen-icons.mjs [--out <dir>]
//
// It writes icon-192.png and icon-512.png. Run it again after any change here
// and commit the result. The files are ours, generated from this code.

import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/** The two sizes a browser asks for before it offers to install a site. */
export const ICON_SIZES = [192, 512];

const BACKGROUND = [0x17, 0x18, 0x1a];
const PIP = [0xef, 0xef, 0xea];

// Pip centres as a fraction of the width, from the middle of the square, and
// the pip radius in the same units. The farthest pip centre is 0.283 out and
// the pip adds 0.07, which is inside the 0.4 the maskable safe circle allows.
const PIP_CENTRES = [
  [0, 0],
  [-0.2, -0.2],
  [0.2, -0.2],
  [-0.2, 0.2],
  [0.2, 0.2],
];
const PIP_RADIUS = 0.07;
// Samples per pixel per axis. A pip edge is a curve, and a hard edge reads as a
// staircase at 192 pixels.
const SUBSAMPLES = 3;

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(bytes) {
  let c = 0xffffffff;
  for (const byte of bytes) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])), 0);
  return Buffer.concat([head, data, crc]);
}

/** Encode 8-bit RGB rows as a PNG. Filter 0 on every scanline. */
export function encodePng(width, height, rgb) {
  const stride = width * 3;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0;
    rgb.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: truecolour
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/** Draw the mark at one size. */
export function drawIcon(size) {
  const rgb = Buffer.alloc(size * size * 3);
  const radius = PIP_RADIUS * size;
  const centres = PIP_CENTRES.map(([x, y]) => [(0.5 + x) * size, (0.5 + y) * size]);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let inside = 0;
      for (let sy = 0; sy < SUBSAMPLES; sy += 1) {
        for (let sx = 0; sx < SUBSAMPLES; sx += 1) {
          const px = x + (sx + 0.5) / SUBSAMPLES;
          const py = y + (sy + 0.5) / SUBSAMPLES;
          if (centres.some(([cx, cy]) => Math.hypot(px - cx, py - cy) <= radius)) inside += 1;
        }
      }
      const cover = inside / (SUBSAMPLES * SUBSAMPLES);
      const at = (y * size + x) * 3;
      for (let c = 0; c < 3; c += 1) {
        rgb[at + c] = Math.round(BACKGROUND[c] * (1 - cover) + PIP[c] * cover);
      }
    }
  }
  return encodePng(size, size, rgb);
}

function main(argv) {
  const here = dirname(fileURLToPath(import.meta.url));
  let out = join(here, '..', 'public', 'icons');
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--out' && argv[i + 1] !== undefined) out = argv[(i += 1)];
    else {
      console.error(`gen-icons: unknown argument ${argv[i]}`);
      return 2;
    }
  }
  mkdirSync(out, { recursive: true });
  for (const size of ICON_SIZES) {
    const path = join(out, `icon-${size}.png`);
    const bytes = drawIcon(size);
    writeFileSync(path, bytes);
    console.log(`gen-icons: wrote ${path} ${size}x${size} ${bytes.length} bytes`);
  }
  return 0;
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main(process.argv.slice(2)));
}
