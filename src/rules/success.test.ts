import { describe, expect, it } from 'vitest';
import { appendValue, createDie, type DieType, type Faces } from './die';
import { DICE_TYPES, SUCCESS_TABLE, defaultCurve, score, tableKey, type CurveId } from './success';

// The enumeration below is the test's own reading of specs/0001-rules-model.md,
// sections "Dice types" and "Success curves". It never imports DICE_TYPES, so a
// row added to or dropped from the module moves the two counts apart.
interface EnumeratedRow {
  readonly type: DieType;
  readonly curve: CurveId;
  readonly faces: readonly Faces[];
}

const SPEC_TYPES: readonly DieType[] = [
  'attribute',
  'skill',
  'gear',
  'artifact',
  'bonus',
  'stress',
];

const ENUMERATION: readonly EnumeratedRow[] = [
  // attribute and skill: six faces in pool mode, 6/8/10/12 in step mode.
  { type: 'attribute', curve: 'pool', faces: [6] },
  { type: 'attribute', curve: 'step', faces: [6, 8, 10, 12] },
  { type: 'skill', curve: 'pool', faces: [6] },
  { type: 'skill', curve: 'step', faces: [6, 8, 10, 12] },
  // gear, bonus and stress: six faces, 6 to 1.
  { type: 'gear', curve: 'pool', faces: [6] },
  { type: 'bonus', curve: 'pool', faces: [6] },
  { type: 'stress', curve: 'pool', faces: [6] },
  // artifact: always a step die, in both modes, and never six faces.
  { type: 'artifact', curve: 'artifactEscalating', faces: [8, 10, 12] },
  { type: 'artifact', curve: 'artifactFlat', faces: [8, 10, 12] },
];

/** The product of type x curve x face count. One table is due for each. */
const TABLE_PRODUCT = ENUMERATION.reduce((total, row) => total + row.faces.length, 0);

/** The product of type x curve x face count x face value. One entry each. */
const ENTRY_PRODUCT = ENUMERATION.reduce(
  (total, row) => total + row.faces.reduce((sum, faces) => sum + faces, 0),
  0,
);

/**
 * The curves restated as branching code, straight from the spec. The module
 * holds them as data, so neither side can copy the other.
 */
function expectedScore(curve: CurveId, face: number): number {
  switch (curve) {
    case 'pool':
      return face >= 6 ? 1 : 0;
    case 'step':
      return face >= 10 ? 2 : face >= 6 ? 1 : 0;
    case 'artifactEscalating':
      return face >= 12 ? 4 : face >= 10 ? 3 : face >= 8 ? 2 : face >= 6 ? 1 : 0;
    case 'artifactFlat':
      return face >= 10 ? 2 : face >= 6 ? 1 : 0;
  }
}

function mean(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

describe('the success table, over the full enumeration', () => {
  it('covers the enumerated product of type, curve and face count, and nothing else', () => {
    let tablesChecked = 0;
    let entriesChecked = 0;

    for (const row of ENUMERATION) {
      for (const faces of row.faces) {
        const key = tableKey(row.type, row.curve, faces);
        const table = SUCCESS_TABLE.get(key);
        expect(table, `the enumeration needs a table for the missing case ${key}`).toBeDefined();
        if (table === undefined) {
          continue;
        }
        tablesChecked += 1;

        expect(table.length, `${key}: the table holds one entry per face`).toBe(faces);

        for (let face = 1; face <= faces; face += 1) {
          const want = expectedScore(row.curve, face);
          expect(
            table[face - 1],
            `${row.type} ${row.curve} d${faces} face ${face} scores ${want}`,
          ).toBe(want);
          entriesChecked += 1;
        }
      }
    }

    expect(tablesChecked, 'every enumerated case ran').toBe(TABLE_PRODUCT);
    expect(entriesChecked, 'every enumerated face ran').toBe(ENTRY_PRODUCT);
    expect(SUCCESS_TABLE.size, 'the module holds no table the enumeration does not name').toBe(
      TABLE_PRODUCT,
    );
    expect(new Set(ENUMERATION.map((row) => row.type)).size, 'the spec names six types').toBe(
      SPEC_TYPES.length,
    );
  });

  it('sizes every table to its face count', () => {
    let sized = 0;
    for (const row of ENUMERATION) {
      for (const faces of row.faces) {
        const key = tableKey(row.type, row.curve, faces);
        const table = SUCCESS_TABLE.get(key);
        expect(table, `the enumeration needs a table for the missing case ${key}`).toBeDefined();
        expect(
          table?.length,
          `${key}: length equals faces, so a >= 12 row on a d10 is unwritable`,
        ).toBe(faces);
        sized += 1;
      }
    }
    expect(sized, 'the length check ran once per enumerated case').toBe(TABLE_PRODUCT);
  });
});

describe('the dice-type rows against the spec table', () => {
  it('keeps artifact dice as step dice in both modes, with 8, 10 and 12 faces only', () => {
    const artifact = DICE_TYPES.filter((row) => row.type === 'artifact');
    expect(artifact.map((row) => row.curve).sort(), 'both artifact curves ship').toEqual([
      'artifactEscalating',
      'artifactFlat',
    ]);
    for (const row of artifact) {
      expect([...row.faces], `${row.curve} allows 8, 10 and 12 faces only`).toEqual([8, 10, 12]);
    }
    expect(
      DICE_TYPES.some((row) => row.type === 'artifact' && ['pool', 'step'].includes(row.curve)),
      'an artifact die never takes a pool or plain step curve, in either mode',
    ).toBe(false);
  });

  it('gives gear, bonus and stress dice one d6 row with a 6 to 1 table', () => {
    for (const type of ['gear', 'bonus', 'stress'] as const) {
      const rows = DICE_TYPES.filter((row) => row.type === type);
      expect(rows.length, `${type} carries one row`).toBe(1);
      expect(rows[0]?.curve, `${type} takes the pool curve`).toBe('pool');
      expect([...(rows[0]?.faces ?? [])], `${type} is a d6`).toEqual([6]);
      expect(SUCCESS_TABLE.get(tableKey(type, 'pool', 6)), `${type}: only a 6 scores`).toEqual([
        0, 0, 0, 0, 0, 1,
      ]);
    }
  });

  it('pays more on the escalating artifact curve than on the flat one, at twelve faces', () => {
    const escalating = SUCCESS_TABLE.get(tableKey('artifact', 'artifactEscalating', 12));
    const flat = SUCCESS_TABLE.get(tableKey('artifact', 'artifactFlat', 12));
    expect(escalating).toBeDefined();
    expect(flat).toBeDefined();
    // Computed here from the enumeration, not read from the module.
    const escalatingWant = mean(
      Array.from({ length: 12 }, (_u, i) => expectedScore('artifactEscalating', i + 1)),
    );
    const flatWant = mean(
      Array.from({ length: 12 }, (_u, i) => expectedScore('artifactFlat', i + 1)),
    );
    expect(mean(escalating ?? [0])).toBeCloseTo(escalatingWant, 10);
    expect(mean(flat ?? [0])).toBeCloseTo(flatWant, 10);
    expect(
      escalatingWant,
      'the toggle changes the expected successes, so it is a real setting',
    ).toBeGreaterThan(flatWant);
  });

  it('takes the escalating curve as the artifact default', () => {
    expect(defaultCurve('artifact', 12)).toBe('artifactEscalating');
    expect(defaultCurve('gear', 6)).toBe('pool');
    expect(() => defaultCurve('artifact', 6), 'a six-faced artifact die is unwritable').toThrow();
  });
});

describe('score', () => {
  const rolled = (type: DieType, faces: Faces, face: number) =>
    appendValue(createDie(`${type}-1`, type, faces), face);

  it('reads the die face from the table', () => {
    expect(score(rolled('gear', 6, 6))).toBe(1);
    expect(score(rolled('gear', 6, 5))).toBe(0);
    expect(score(rolled('attribute', 10, 10))).toBe(2);
    expect(score(rolled('skill', 8, 8))).toBe(1);
    expect(score(rolled('skill', 12, 9))).toBe(1);
    expect(score(rolled('artifact', 12, 12))).toBe(4);
  });

  it('honours the flat artifact toggle', () => {
    expect(score(rolled('artifact', 12, 12), 'artifactFlat')).toBe(2);
    expect(score(rolled('artifact', 12, 8), 'artifactFlat')).toBe(1);
  });

  it('scores nothing for a die that has not rolled', () => {
    expect(score(createDie('stress-1', 'stress', 6, 2))).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// The artifact curve, as a settings choice — Unit 4.1
//
// The screen lets the player pick the curve the artifact dice score on. It
// changes what a die is WORTH and it must never change whether a die LOCKS,
// because `lockState` reads the die's own default curve and the screen reads
// the chosen one. The claim below is what makes those two agree, and it is a
// property of the curves rather than of the code that reads them.
// ---------------------------------------------------------------------------

describe('the two artifact curves', () => {
  it('pay from the same face upwards, over every artifact face', () => {
    // The enumeration above holds both artifact rows. The face counts come from
    // it, so a face count added to the spec raises this denominator.
    const sizes = ENUMERATION.filter((row) => row.type === 'artifact').flatMap((row) => [
      ...row.faces,
    ]);
    const sizesOfOneCurve = [...new Set(sizes)];
    let compared = 0;
    let differed = 0;
    for (const faces of sizesOfOneCurve) {
      for (let face = 1; face <= faces; face += 1) {
        const die = appendValue(createDie(`artifact-1`, 'artifact', faces), face);
        const escalating = score(die, 'artifactEscalating');
        const flat = score(die, 'artifactFlat');
        expect(
          escalating > 0,
          `a d${faces} showing ${face} is a success on one curve and not on the other`,
        ).toBe(flat > 0);
        if (escalating !== flat) differed += 1;
        compared += 1;
      }
    }
    expect(compared, 'every face of every artifact size was compared').toBe(
      sizesOfOneCurve.reduce((total, faces) => total + faces, 0),
    );
    // The check would pass on two identical curves, so the difference the
    // setting exists for is counted as well.
    expect(differed, 'the two curves pay differently somewhere').toBeGreaterThan(0);
  });
});
