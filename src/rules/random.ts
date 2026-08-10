// Rules core. No browser API, no module-level mutable state.
// Constraint 7: randomness comes from crypto.getRandomValues, through a
// rejection-sampling mapper with no modulo bias.

import type { Faces } from './die';

export interface RandomSource {
  /** A uniform face in the range 1 to `faces`, both ends included. */
  face(faces: Faces): number;
}

const WORDS = 0x1_0000_0000; // 2 ** 32

/**
 * Map 32-bit words to faces by rejection sampling.
 *
 * `WORDS` divides into `faces` whole buckets plus a remainder. A word that
 * lands in the remainder is rejected and a new word is drawn. Plain
 * `word % faces` would return the low faces more often, by one part in about
 * 700 million.
 */
export function fromWords(nextWord: () => number): RandomSource {
  return {
    face(faces: Faces): number {
      const limit = WORDS - (WORDS % faces);
      for (;;) {
        const word = nextWord() >>> 0;
        if (word < limit) {
          return (word % faces) + 1;
        }
      }
    },
  };
}

/** The shipping source. `globalThis.crypto` is present in the browser and in Node. */
export function cryptoRandom(): RandomSource {
  return fromWords(() => {
    const words = new Uint32Array(1);
    globalThis.crypto.getRandomValues(words);
    return words[0] as number;
  });
}
