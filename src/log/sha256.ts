// SHA-256 over a string, in plain arithmetic.
//
// **Why this file exists.** `profileHash` used `node:crypto`, which no browser
// has. Unit 4.4's store half recorded that as open and named the screen half as
// the unit that would settle it. There were two ways to settle it:
//
//   1. `crypto.subtle.digest`. It is asynchronous, so `createLogEntry` would
//      become asynchronous, and every caller with it.
//   2. One synchronous implementation that names no platform API at all.
//
// This is the second. It runs unchanged under the test runner and in the
// browser, so ONE implementation produces every digest the log holds. Two
// implementations could disagree, and a disagreement here rewrites campaign
// history: the export/re-import equality check compares the stored hash.
//
// **The oracle is `node:crypto`.** `src/log/sha256.test.ts` compares this
// function against `createHash('sha256')` over a corpus that crosses every
// block boundary and every padding case, and against the published FIPS 180-4
// vectors. The pinned digest in `src/log/entry.test.ts` is a second oracle: it
// was produced by `node:crypto` before this file existed and it did not move.
//
// `TextEncoder` is a WHATWG global that Node and every browser both hold. It is
// not a browser API in the sense Constraint 3 means, and this module is not the
// rules core in any case.

/** The first 32 bits of the fractional parts of the cube roots of the first 64 primes. */
const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

/** The first 32 bits of the fractional parts of the square roots of the first 8 primes. */
const H0 = new Uint32Array([
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
]);

function rotr(value: number, by: number): number {
  return (value >>> by) | (value << (32 - by));
}

/**
 * The SHA-256 digest of a string, as 64 lowercase hexadecimal characters.
 *
 * The string is encoded as UTF-8 first, so the digest of a string is the digest
 * of its UTF-8 bytes. That is what `createHash('sha256').update(text)` does,
 * and the test holds the two together.
 */
export function sha256Hex(text: string): string {
  const bytes = new TextEncoder().encode(text);
  // The message, a 0x80 byte, zero padding, then the length in bits as a
  // 64-bit big-endian number. The whole is a whole number of 64-byte blocks.
  const blocks = Math.floor((bytes.length + 8) / 64) + 1;
  const padded = new Uint8Array(blocks * 64);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  // A string long enough to overflow 32 bits of bit-length cannot be held by
  // any JavaScript engine, so the high word is written from the float and the
  // low word from the exact product.
  const bits = bytes.length * 8;
  view.setUint32(padded.length - 8, Math.floor(bits / 0x100000000), false);
  view.setUint32(padded.length - 4, bits >>> 0, false);

  const h = H0.slice();
  const w = new Uint32Array(64);
  for (let block = 0; block < blocks; block += 1) {
    const at = block * 64;
    for (let i = 0; i < 16; i += 1) w[i] = view.getUint32(at + i * 4, false);
    for (let i = 16; i < 64; i += 1) {
      const a = w[i - 15] as number;
      const b = w[i - 2] as number;
      const s0 = rotr(a, 7) ^ rotr(a, 18) ^ (a >>> 3);
      const s1 = rotr(b, 17) ^ rotr(b, 19) ^ (b >>> 10);
      w[i] = ((w[i - 16] as number) + s0 + (w[i - 7] as number) + s1) >>> 0;
    }
    let a = h[0] as number;
    let b = h[1] as number;
    let c = h[2] as number;
    let d = h[3] as number;
    let e = h[4] as number;
    let f = h[5] as number;
    let g = h[6] as number;
    let hh = h[7] as number;
    for (let i = 0; i < 64; i += 1) {
      const s1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (hh + s1 + ch + (K[i] as number) + (w[i] as number)) >>> 0;
      const s0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (s0 + maj) >>> 0;
      hh = g;
      g = f;
      f = e;
      e = (d + t1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) >>> 0;
    }
    h[0] = ((h[0] as number) + a) >>> 0;
    h[1] = ((h[1] as number) + b) >>> 0;
    h[2] = ((h[2] as number) + c) >>> 0;
    h[3] = ((h[3] as number) + d) >>> 0;
    h[4] = ((h[4] as number) + e) >>> 0;
    h[5] = ((h[5] as number) + f) >>> 0;
    h[6] = ((h[6] as number) + g) >>> 0;
    h[7] = ((h[7] as number) + hh) >>> 0;
  }

  let out = '';
  for (const word of h) out += word.toString(16).padStart(8, '0');
  return out;
}
