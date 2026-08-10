import { describe, expect, it } from 'vitest';
import type { Faces } from './die';
import { cryptoRandom, fromWords } from './random';
import { seededRandom } from './seeded-random';

const ALL_FACES: Faces[] = [6, 8, 10, 12];

/**
 * The first word the mapper must reject, derived by floor division rather than
 * by the remainder the mapper uses. Words from here to 2**32 - 1 form the
 * rejection zone. Nothing below this line calls the code under test.
 */
function firstRejectedWord(faces: number): number {
  return faces * Math.floor(2 ** 32 / faces);
}

function rejectionZone(faces: number): number[] {
  const words: number[] = [];
  for (let word = firstRejectedWord(faces); word < 2 ** 32; word += 1) {
    words.push(word);
  }
  return words;
}

/** The face an unbiased mapper must return for an accepted word. */
function expectedFace(word: number, faces: number): number {
  return (word % faces) + 1;
}

/** A source that serves chosen words in order and counts how many it served. */
function scriptedSource(words: number[]) {
  const queue = [...words];
  let served = 0;
  const source = fromWords(() => {
    const word = queue.shift();
    if (word === undefined) {
      throw new Error('the scripted source ran out of words');
    }
    served += 1;
    return word;
  });
  return {
    source,
    get served() {
      return served;
    },
  };
}

describe('the rejection-sampling mapper', () => {
  it('rejects every word above the last whole bucket, for 6, 10 and 12 faces', () => {
    // A power of two has no rejection zone, so 8 faces gets its own test below.
    const biased: Faces[] = [6, 10, 12];
    const zoneSizes = biased.map((faces) => rejectionZone(faces).length);
    expect(zoneSizes, 'the rejection zone sizes must be 2**32 modulo faces').toEqual([4, 6, 4]);

    let totalServed = 0;
    let totalFaces = 0;

    for (const faces of biased) {
      const zone = rejectionZone(faces);
      const accepted = firstRejectedWord(faces) - 1;
      const stub = scriptedSource([...zone, accepted]);

      const face = stub.source.face(faces);
      totalFaces += 1;
      totalServed += stub.served;

      expect(face, `d${faces}: the mapper must skip the rejection zone and map ${accepted}`).toBe(
        expectedFace(accepted, faces),
      );
      expect(
        stub.served,
        `d${faces}: the rejection branch did not fire, the mapper read ${stub.served} words for a zone of ${zone.length}`,
      ).toBe(zone.length + 1);
    }

    const rejections = totalServed - totalFaces;
    expect(totalFaces, 'the test must have asked for a face at least once').toBe(3);
    expect(
      rejections,
      'the rejection branch never fired, so the mapper carries modulo bias',
    ).toBeGreaterThan(0);
    expect(
      totalServed,
      `the mapper served ${totalServed} words for ${totalFaces} faces, so no word was rejected`,
    ).toBeGreaterThan(totalFaces);
    expect(rejections, 'every word of every rejection zone must be rejected').toBe(14);
  });

  it('rejects nothing on 8 faces, because 8 divides 2**32', () => {
    expect(rejectionZone(8), 'a power of two leaves no remainder').toEqual([]);
    const top = 2 ** 32 - 1;
    const stub = scriptedSource([top]);
    expect(stub.source.face(8)).toBe(expectedFace(top, 8));
    expect(stub.served, 'no word may be rejected when the zone is empty').toBe(1);
  });

  it('returns the face the word maps to, for every face count', () => {
    for (const faces of ALL_FACES) {
      const words = [0, 1, 2, 12345, 0x7fff_ffff, firstRejectedWord(faces) - 1];
      const stub = scriptedSource(words);
      const drawn = words.map(() => stub.source.face(faces));
      expect(drawn, `d${faces}: each accepted word maps to one face`).toEqual(
        words.map((word) => expectedFace(word, faces)),
      );
      expect(stub.served, `d${faces}: an accepted word must cost exactly one draw`).toBe(
        words.length,
      );
    }
  });
});

describe('the crypto source', () => {
  it('returns faces in range and reaches every face', () => {
    const source = cryptoRandom();
    for (const faces of ALL_FACES) {
      const seen = new Set<number>();
      for (let draw = 0; draw < 400; draw += 1) {
        const face = source.face(faces);
        expect(face).toBeGreaterThanOrEqual(1);
        expect(face).toBeLessThanOrEqual(faces);
        seen.add(face);
      }
      expect(seen.size, `d${faces}: every face must appear over 400 draws`).toBe(faces);
    }
  });
});

describe('the seeded source', () => {
  function sequence(seed: number): number[] {
    const source = seededRandom(seed);
    return Array.from({ length: 40 }, (_, index) => source.face(ALL_FACES[index % 4] ?? 6));
  }

  it('repeats its sequence for the same seed', () => {
    expect(sequence(7)).toEqual(sequence(7));
    expect(
      new Set(sequence(7)).size,
      'a source stuck on one face is not a sequence',
    ).toBeGreaterThan(1);
  });

  it('gives different sequences for different seeds', () => {
    expect(sequence(7)).not.toEqual(sequence(8));
  });
});
