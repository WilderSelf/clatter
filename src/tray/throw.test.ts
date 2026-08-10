// The half of Unit 3.3 that needs no browser: the order the tray holds a pool
// in, the notation built from it, and the colour each die takes.
//
// The other half — that the face pointing up equals the value the core decided —
// needs a physics simulation and a graphics card. It lives in
// `scripts/browser.mjs --pool` and runs outside `validate`.

import { describe, expect, it } from 'vitest';
import { appendValue, createDie, type Die } from '../rules/die';
import type { PushedRoll } from '../rules/push';
import { DIE_TYPE_COLOR } from './dice-colors';
import type { DiceBox } from './vendor/dice-tray.js';
import { poolNotation, pushPool, throwPool, trayOrder } from './throw';

function died(id: string, type: Die['type'], faces: Die['faces'], value: number): Die {
  return appendValue(createDie(id, type, faces), value);
}

/** A pool in no particular face order, so a stable sort has something to do. */
const POOL: readonly Die[] = [
  died('a', 'attribute', 8, 3),
  died('b', 'gear', 6, 6),
  died('c', 'skill', 12, 11),
  died('d', 'stress', 6, 1),
  died('e', 'artifact', 10, 10),
];

interface FakeMaterial {
  colour: string;
  color: { set(colour: string): void };
}

/** One face material that records the colour the tray gives it. */
function fakeMaterial(): FakeMaterial {
  const material: FakeMaterial = {
    colour: '',
    color: {
      set: (colour: string) => {
        material.colour = colour;
      },
    },
  };
  return material;
}

/** A stand-in for the library. It records the notation and holds fake dice. */
function fakeBox(count: number): DiceBox & {
  seen: string[];
  added: string[];
  rerolled: [number[], number[]][];
} {
  const seen: string[] = [];
  const added: string[] = [];
  const rerolled: [number[], number[]][] = [];
  const oneDie = () => ({
    material: [fakeMaterial(), fakeMaterial()],
    body: null,
    getFaceValue: () => ({ value: 0, label: '', reason: '' }),
  });
  const diceList = Array.from({ length: count }, oneDie);
  return {
    seen,
    added,
    rerolled,
    diceList,
    roll: async (notation: string) => void seen.push(notation),
    // The library appends. That is the whole reason `trayOrder` stops
    // describing the tray once a push adds a die.
    add: async (notation: string) => {
      added.push(notation);
      diceList.push(oneDie());
    },
    reroll: async (ids: number[], forced: number[]) => void rerolled.push([ids, forced]),
  } as unknown as DiceBox & {
    seen: string[];
    added: string[];
    rerolled: [number[], number[]][];
  };
}

describe('trayOrder', () => {
  it('groups by face count and keeps pool order inside a group', () => {
    expect(trayOrder(POOL).map((die) => die.id)).toEqual(['b', 'd', 'a', 'e', 'c']);
  });
});

describe('poolNotation', () => {
  it('lists the values in the order the tray spawns the dice', () => {
    expect(poolNotation(POOL)).toBe('2d6+1d8+1d10+1d12@6,1,3,10,11');
  });

  it('refuses a pool with no dice', () => {
    expect(() => poolNotation([])).toThrow(/no dice/);
  });

  it('refuses a die the core never gave a value', () => {
    expect(() => poolNotation([createDie('x', 'gear', 6)])).toThrow(/no value/);
  });
});

describe('throwPool', () => {
  it('throws the decided values and colours every die by its type', async () => {
    const box = fakeBox(POOL.length);
    const ordered = await throwPool(box, { dice: POOL, stressAfter: 0 });

    expect(box.seen).toEqual(['2d6+1d8+1d10+1d12@6,1,3,10,11']);
    // The denominator: one coloured die per die in the pool, and the colour is
    // read off the fake material rather than off the table.
    const coloured = ordered.map((die, index) => ({
      expected: DIE_TYPE_COLOR[die.type],
      applied: [
        ...new Set(
          (box.diceList[index]?.material ?? []).map(
            (material) => (material as unknown as { colour: string }).colour,
          ),
        ),
      ],
    }));
    expect(coloured.length).toBe(POOL.length);
    for (const { expected, applied } of coloured) expect(applied).toEqual([expected]);
  });

  it('refuses a tray holding fewer dice than the pool', async () => {
    await expect(
      throwPool(fakeBox(POOL.length - 1), { dice: POOL, stressAfter: 0 }),
    ).rejects.toThrow(/no die at index/);
  });
});

/** A push of the named dice, as the rules core would hand it over. */
function pushedRoll(
  next: Readonly<Record<string, number>>,
  extra: readonly Die[] = [],
  stressAdded: string | null = null,
): PushedRoll {
  const rerolled = Object.keys(next);
  return {
    kind: 'pushed',
    dice: [...POOL, ...extra].map((die) => appendValue(die, next[die.id] ?? die.values[0] ?? null)),
    stressAfter: 0,
    rerolled,
    stressAdded,
    cost: { unit: 'ratingPoint', total: 0, byType: {} as PushedRoll['cost']['byType'] },
    generation: 1,
  };
}

describe('pushPool', () => {
  it('names only the pushed dice, by their tray index, with the decided values', async () => {
    const box = fakeBox(POOL.length);
    const ordered = await throwPool(box, { dice: POOL, stressAfter: 0 });
    const after = await pushPool(box, ordered, pushedRoll({ a: 7, c: 2 }));

    // Tray order is b, d, a, e, c, so `a` is index 2 and `c` is index 4.
    expect(box.rerolled).toEqual([
      [
        [2, 4],
        [7, 2],
      ],
    ]);
    // Every kept die keeps its value, and the order does not move.
    expect(after.map((die) => [die.id, die.values])).toEqual([
      ['b', [6, 6]],
      ['d', [1, 1]],
      ['a', [3, 7]],
      ['e', [10, 10]],
      ['c', [11, 2]],
    ]);
  });

  it('refuses a push that names no dice', async () => {
    const box = fakeBox(POOL.length);
    const ordered = await throwPool(box, { dice: POOL, stressAfter: 0 });
    await expect(pushPool(box, ordered, pushedRoll({}))).rejects.toThrow(/names no dice/);
  });

  // The defect Unit 3.4 recorded and Unit 3.5 carried: the third preset raises
  // stress by one BEFORE every re-throw, and the core creates the stress die
  // for it. The tray used to refuse that die by name. It spawns it now.
  it('spawns the die the push added, on the value the core decided, at the end of the tray', async () => {
    const box = fakeBox(POOL.length);
    const ordered = await throwPool(box, { dice: POOL, stressAfter: 0 });
    const added = createDie('stress-2', 'stress', 6, 1);
    const after = await pushPool(
      box,
      ordered,
      pushedRoll({ a: 7, 'stress-2': 4 }, [added], 'stress-2'),
    );

    // One `add`, for the one die the core named, carrying the value it chose.
    expect(box.added).toEqual(['1d6@4']);
    // The added die is not thrown twice: `add` already landed its value, so the
    // re-throw names the other pushed die alone. `a` is tray index 2.
    expect(box.rerolled).toEqual([[[2], [7]]]);
    // The library appends, so the added die takes the index after every die
    // already on the tray, and the order the caller gets back says so.
    expect(after.map((die) => die.id)).toEqual(['b', 'd', 'a', 'e', 'c', 'stress-2']);
    expect(box.diceList.length).toBe(after.length);
    // The tray coloured it by its type, at that index and no other.
    const painted = (box.diceList[after.length - 1]?.material ?? []).map(
      (material) => (material as unknown as { colour: string }).colour,
    );
    expect([...new Set(painted)]).toEqual([DIE_TYPE_COLOR.stress]);
  });

  it('refuses a die the tray does not hold and the push never added', async () => {
    const box = fakeBox(POOL.length);
    const ordered = await throwPool(box, { dice: POOL, stressAfter: 0 });
    const added = createDie('stress-2', 'stress', 6, 1);
    await expect(pushPool(box, ordered, pushedRoll({ 'stress-2': 4 }, [added]))).rejects.toThrow(
      /the tray holds no die for stress-2, and the push added nothing/,
    );
  });
});
