// The digest, held against two oracles.
//
// `node:crypto` is the first. It is the implementation `profileHash` used until
// Unit 4.4's screen half, and every digest already in a log came from it, so
// the two must agree byte for byte or the log's history moves.
//
// The published FIPS 180-4 vectors are the second. They hold even if the test
// runner's own SHA-256 were wrong, which `node:crypto` alone cannot rule out.

import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { sha256Hex } from './sha256';

/**
 * The corpus. It is built rather than listed, so the denominator is counted and
 * not typed, and it crosses every case the padding rule has:
 *
 *   - the empty string, which is one block of padding alone;
 *   - 55 bytes, the longest message that still fits one block with its length;
 *   - 56 to 64 bytes, where the length word is pushed into a second block;
 *   - 119 to 120 bytes, the same boundary one block later;
 *   - text outside ASCII, so the UTF-8 encoding is exercised;
 *   - the shape `profileHash` actually hashes, which is sorted-key JSON.
 */
function corpus(): readonly string[] {
  const built: string[] = [
    '',
    'abc',
    '\u{1F3B2} a die, an ampersand & a quote "',
    JSON.stringify({ cost: { amount: 1, unit: 'ratingPoint' }, id: 'p', maxPushes: null }),
  ];
  // Every length from 0 to 200 bytes, so the two block boundaries at 55/56 and
  // 119/120 are both crossed and neither is a case somebody remembered to add.
  for (let length = 0; length <= 200; length += 1) {
    built.push('a'.repeat(length));
  }
  return built;
}

describe('sha256Hex', () => {
  it('agrees with node:crypto over every length to 200 bytes', () => {
    const texts = corpus();
    let compared = 0;
    for (const text of texts) {
      const oracle = createHash('sha256').update(text).digest('hex');
      expect(sha256Hex(text), `the digest of a ${text.length}-character string`).toBe(oracle);
      compared += 1;
    }
    // The denominator is the corpus this test built, counted a second way: 4
    // named strings plus one per length from 0 to 200.
    expect(compared, 'every member of the corpus was compared').toBe(4 + 201);
    expect(texts.length).toBe(compared);
  });

  it('holds the published FIPS 180-4 vectors', () => {
    // NIST FIPS 180-4, appendix B.1 and B.2, and the standard million-a vector.
    const vectors: readonly (readonly [string, string])[] = [
      ['abc', 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'],
      [
        'abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq',
        '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1',
      ],
      ['', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'],
      ['a'.repeat(1000000), 'cdc76e5c9914fb9281a1c7e284d73e67f1809a48a497200e046d39ccc7112cd0'],
    ];
    let held = 0;
    for (const [text, digest] of vectors) {
      expect(sha256Hex(text), `the vector of ${text.length} characters`).toBe(digest);
      held += 1;
    }
    expect(held).toBe(vectors.length);
  });

  it('answers 64 lowercase hexadecimal characters, whatever it is given', () => {
    for (const text of ['', 'x', 'a b', '\u{10FFFF}']) {
      expect(sha256Hex(text)).toMatch(/^[0-9a-f]{64}$/);
    }
  });

  it('names no platform API, so one implementation serves both runtimes', async () => {
    // The browser has no `node:crypto` and the test runner has no `crypto.subtle`
    // that answers synchronously. A digest computed two ways would be two
    // digests, and the log compares stored hashes.
    const source = await import('node:fs').then((fs) =>
      fs.readFileSync(new URL('./sha256.ts', import.meta.url), 'utf8'),
    );
    const body = source.replace(/^\/\/.*$/gm, '');
    for (const banned of ['node:crypto', 'crypto.subtle', 'require(']) {
      expect(body, `sha256.ts must not name ${banned}`).not.toContain(banned);
    }
  });
});
