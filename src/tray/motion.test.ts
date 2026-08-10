// The far end of throw-to-first-motion — Unit 3.8, the overlay half.
//
// The claim is the one the plan cares about: the reading stops at a MOVED DIE
// and never at a drawn frame. A tray that draws twenty frames with every die
// exactly where the press left it reports nothing over those twenty frames, and
// a probe that answered the first frame would read a fifth of the true number.

import { describe, expect, it } from 'vitest';
import type { MotionEvidence } from '../shell/perf';
import type { DiceBox, TrayDie } from './vendor/dice-tray.js';
import { drawnPositions, hasMoved, movedBy, watchFirstMotion } from './motion';

/** A tray, as far as this module reads one. */
function trayOf(positions: readonly (readonly [number, number, number])[]): DiceBox {
  const diceList = positions.map(([x, y, z]) => ({ position: { x, y, z } }) as unknown as TrayDie);
  return { diceList } as unknown as DiceBox;
}

/** An animation clock the test steps by hand. */
function clockOf() {
  const queue: ((at: number) => void)[] = [];
  let handles = 0;
  return {
    clock: {
      request: (run: (at: number) => void): number => {
        queue.push(run);
        handles += 1;
        return handles;
      },
      cancel: (): void => {
        queue.length = 0;
      },
    },
    /** Run one frame at `at`. Answers whether anything was waiting. */
    step(at: number): boolean {
      const next = queue.shift();
      if (next === undefined) return false;
      next(at);
      return true;
    },
    get waiting(): number {
      return queue.length;
    },
  };
}

describe('what the tray draws', () => {
  it('is three numbers a die, in tray order', () => {
    expect(drawnPositions(trayOf([[1, 2, 3] as const, [4, 5, 6] as const]))).toEqual([
      1, 2, 3, 4, 5, 6,
    ]);
  });

  it('measures the largest distance any die travelled', () => {
    expect(movedBy([0, 0, 0, 0, 0, 0], [0, 0, 0, 3, 4, 0])).toBe(5);
    expect(movedBy([0, 0, 0], [0, 0, 0])).toBe(0);
  });

  it('reads a die that moved, with no tolerance at all', () => {
    // A sleeping body does not move by a little. It does not move.
    expect(hasMoved([0, 0, 0], [0, 0, 0])).toBe(false);
    expect(hasMoved([0, 0, 0], [0, 0, 1e-12])).toBe(true);
    // A tray holding a different number of dice is a tray that changed.
    expect(hasMoved([0, 0, 0], [0, 0, 0, 1, 1, 1])).toBe(true);
  });
});

describe('the watch', () => {
  it('reports the frame the dice moved on, not the first frame drawn', () => {
    const box = trayOf([
      [0, 0, 0],
      [10, 0, 0],
    ]);
    const { clock, step } = clockOf();
    const seen: { at: number; evidence: MotionEvidence }[] = [];
    watchFirstMotion(box, (at, evidence) => seen.push({ at, evidence }), clock);

    // Four frames while the screen redraws and the library simulates. The dice
    // are drawn exactly where they were.
    for (const at of [16, 32, 48, 64]) step(at);
    expect(seen).toHaveLength(0);

    // The library releases the thread and draws the throw.
    box.diceList[1]!.position.y = 40;
    step(280);
    expect(seen).toHaveLength(1);
    expect(seen[0]!.at).toBe(280);
    expect(seen[0]!.evidence).toEqual({
      stillFrames: 4,
      movedBy: 40,
      dice: 2,
      spawned: false,
    });
  });

  it('reports once, and then stops watching', () => {
    const box = trayOf([[0, 0, 0]]);
    const held = clockOf();
    const seen: number[] = [];
    watchFirstMotion(box, (at) => seen.push(at), held.clock);
    box.diceList[0]!.position.x = 5;
    held.step(16);
    box.diceList[0]!.position.x = 9;
    expect(held.step(32)).toBe(false);
    expect(seen).toEqual([16]);
  });

  it('reads a throw that spawned its dice, where nothing travelled', () => {
    // The first roll of a session. The table was empty and the library filled
    // it, so no die moved from anywhere and the table still changed.
    const box = trayOf([]);
    const held = clockOf();
    const seen: MotionEvidence[] = [];
    watchFirstMotion(box, (_at, evidence) => seen.push(evidence), held.clock);
    held.step(16);
    box.diceList.push(...trayOf([[0, 50, 0]]).diceList);
    held.step(32);
    expect(seen).toEqual([{ stillFrames: 1, movedBy: 0, dice: 1, spawned: true }]);
  });

  it('stops when the caller stops it, and costs no further frame', () => {
    const box = trayOf([[0, 0, 0]]);
    const held = clockOf();
    const seen: number[] = [];
    const stop = watchFirstMotion(box, (at) => seen.push(at), held.clock);
    stop();
    box.diceList[0]!.position.x = 5;
    held.step(16);
    expect(seen).toEqual([]);
  });
});
