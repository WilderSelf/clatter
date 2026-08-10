// The decision the capability probe feeds, over every class of reading.
//
// `decideTray` is pure, so the table below is the whole surface. Each of the
// four readings gets its own list of classes, the test takes the cross product
// of those lists, and the number of cases exercised is asserted against the
// product, against the four list lengths, and against the literal 64. A class
// dropped from a list fails here instead of going quiet.
//
// The bar is written out again in this file, as the values 1 gigabyte and 2
// cores. Importing `MIN_DEVICE_MEMORY_GB` and `MIN_CORES` would let the module
// answer its own question, and a bound that reads the constant it bounds cannot
// fail. Each list therefore carries a class below the bar, a class exactly at
// the bar and a class above it.

import { describe, expect, it } from 'vitest';
import type { CapabilityProbe, FallReason } from './capability';
import { decideTray, FALL_REASONS } from './capability';

interface Class<T> {
  readonly name: string;
  readonly value: T;
  /** The reason this class alone puts on the list. `null` when it passes. */
  readonly fails: FallReason | null;
}

const WEBGL2_CLASSES: readonly Class<boolean>[] = [
  { name: 'webgl2 answers', value: true, fails: null },
  { name: 'webgl2 refuses', value: false, fails: 'no-webgl2' },
];

const MEMORY_CLASSES: readonly Class<number | null>[] = [
  { name: 'memory hidden', value: null, fails: null },
  { name: 'memory under a gigabyte', value: 0.5, fails: 'low-device-memory' },
  { name: 'memory of exactly a gigabyte', value: 1, fails: null },
  { name: 'memory of four gigabytes', value: 4, fails: null },
];

const CORE_CLASSES: readonly Class<number | null>[] = [
  { name: 'cores hidden', value: null, fails: null },
  { name: 'one core', value: 1, fails: 'low-core-count' },
  { name: 'exactly two cores', value: 2, fails: null },
  { name: 'eight cores', value: 8, fails: null },
];

const TO_BLOB_CLASSES: readonly Class<boolean>[] = [
  { name: 'the canvas reads back', value: true, fails: null },
  { name: 'the canvas refuses to read back', value: false, fails: 'no-canvas-readback' },
];

/** The product of the four lists. Written out, so a shrunk list fails. */
const EXPECTED_CASES = 64;

/** How many of the 64 clear the bar: 1 x 3 x 3 x 1, counted by hand. */
const EXPECTED_TRAY_CASES = 9;

interface Case {
  readonly name: string;
  readonly probe: CapabilityProbe;
  readonly expected: readonly FallReason[];
}

/**
 * The cross product. `expected` is built from the `fails` field of each class,
 * in the order `FALL_REASONS` lists, which is the order `decideTray` pushes.
 */
function buildCases(): readonly Case[] {
  const cases: Case[] = [];
  for (const webgl2 of WEBGL2_CLASSES) {
    for (const memory of MEMORY_CLASSES) {
      for (const cores of CORE_CLASSES) {
        for (const toBlob of TO_BLOB_CLASSES) {
          const parts = [webgl2, memory, cores, toBlob];
          cases.push({
            name: parts.map((part) => part.name).join(', '),
            probe: {
              webgl2: webgl2.value,
              deviceMemoryGb: memory.value,
              cores: cores.value,
              toBlob: toBlob.value,
            },
            expected: parts
              .map((part) => part.fails)
              .filter((reason): reason is FallReason => reason !== null),
          });
        }
      }
    }
  }
  return cases;
}

describe('decideTray', () => {
  it('answers every class of reading, and the count matches the enumeration', () => {
    const cases = buildCases();
    let exercised = 0;
    let trayCases = 0;
    const seenReasons = new Set<FallReason>();

    for (const each of cases) {
      const decision = decideTray(each.probe);
      expect(decision.reasons, `${each.name}: the reasons the decision names`).toStrictEqual(
        each.expected,
      );
      expect(decision.tray, `${each.name}: the tray runs only when nothing fails`).toBe(
        each.expected.length === 0,
      );
      for (const reason of decision.reasons) {
        seenReasons.add(reason);
      }
      if (decision.tray) trayCases += 1;
      exercised += 1;
    }

    expect(exercised, 'every case in the cross product ran').toBe(cases.length);
    expect(new Set(cases.map((each) => each.name)).size, 'no case is listed twice').toBe(
      cases.length,
    );
    expect(cases.length, 'the cross product is the product of the four class lists').toBe(
      WEBGL2_CLASSES.length * MEMORY_CLASSES.length * CORE_CLASSES.length * TO_BLOB_CLASSES.length,
    );
    expect(cases.length, 'the enumeration holds 64 cases').toBe(EXPECTED_CASES);
    expect(trayCases, 'nine of the sixty-four readings clear the bar').toBe(EXPECTED_TRAY_CASES);
    expect(cases.length - trayCases, 'the rest fall to flat dice').toBe(
      EXPECTED_CASES - EXPECTED_TRAY_CASES,
    );
    expect([...seenReasons].sort(), 'every reason the module ships is reachable').toStrictEqual(
      [...FALL_REASONS].sort(),
    );
  });

  it('names every failing reading at once, not the first one', () => {
    const decision = decideTray({
      webgl2: false,
      deviceMemoryGb: 0.5,
      cores: 1,
      toBlob: false,
    });
    expect(decision.tray).toBe(false);
    expect(decision.reasons).toStrictEqual([
      'no-webgl2',
      'low-device-memory',
      'low-core-count',
      'no-canvas-readback',
    ]);
  });

  it('answers from its argument alone, and leaves the argument alone', () => {
    const probe: CapabilityProbe = {
      webgl2: true,
      deviceMemoryGb: 0.5,
      cores: 8,
      toBlob: true,
    };
    const before = JSON.stringify(probe);
    const answers = [decideTray(probe), decideTray(probe), decideTray(probe)];
    let compared = 0;
    for (const later of answers.slice(1)) {
      expect(later, 'a later call answered differently from the first').toStrictEqual(answers[0]);
      compared += 1;
    }
    expect(compared, 'two later answers were compared with the first').toBe(2);
    expect(JSON.stringify(probe), 'the probe record came back unchanged').toBe(before);
  });
});
