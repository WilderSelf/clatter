// The overlay's instrument — Unit 3.8, the overlay half.
//
// Every claim here is about a MEASUREMENT rather than about a number. The four
// figures are read off a clock this file owns, so a figure computed from a
// constant, a percentile taken over four samples, and a zero standing in for a
// reading the browser cannot give are all reachable failures.
//
// What is NOT here: whether the browser really feeds this instrument. A
// document and a real animation clock are the only place that can answer that,
// so `src/shell/overlay.test.tsx` drives the wiring and
// `node scripts/browser.mjs --overlay` drives the whole of it in the built
// application.

import { describe, expect, it } from 'vitest';
import type { MotionEvidence } from './perf';
import { createPerfRecorder, figureLine, minimumSamples, quantileOf, WINDOW_CAP_MS } from './perf';

const EVIDENCE: MotionEvidence = { stillFrames: 2, movedBy: 4.5, dice: 12, spawned: false };

/** Run `count` frames of `duration` each, from `at`. Returns the last instant. */
function frames(
  recorder: ReturnType<typeof createPerfRecorder>,
  at: number,
  count: number,
  duration: number,
): number {
  let now = at;
  for (let step = 0; step < count; step += 1) {
    now += duration;
    recorder.frame(now);
  }
  return now;
}

function figureOf(recorder: ReturnType<typeof createPerfRecorder>, key: string) {
  const found = recorder.report().figures.find((figure) => figure.key === key);
  if (found === undefined) throw new Error(`no figure named ${key}`);
  return found;
}

describe('the sample floor under a quantile', () => {
  it('is derived from the quantile and not chosen', () => {
    // A quantile q over n samples names a value at most n(1-q) samples lie
    // above. Below this floor that count is under one.
    expect(minimumSamples(0.95)).toBe(20);
    expect(minimumSamples(0.99)).toBe(100);
    expect(minimumSamples(0.5)).toBe(2);
    for (const quantile of [0.9, 0.95, 0.98, 0.99, 0.999]) {
      const floor = minimumSamples(quantile);
      expect(floor * (1 - quantile), `p${quantile} over ${floor}`).toBeGreaterThanOrEqual(1);
      expect((floor - 1) * (1 - quantile)).toBeLessThan(1);
    }
  });

  it('refuses a quantile that is not one', () => {
    expect(() => minimumSamples(0)).toThrow(/lies between 0 and 1/);
    expect(() => minimumSamples(1)).toThrow(/lies between 0 and 1/);
  });
});

describe('the quantile itself', () => {
  it('names a sample that was measured, by nearest rank', () => {
    const samples = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    expect(quantileOf(samples, 0.95)).toBe(100);
    expect(quantileOf(samples, 0.5)).toBe(50);
    // Every answer is one of the readings, never a value between two of them.
    for (const quantile of [0.1, 0.25, 0.5, 0.75, 0.95, 0.99]) {
      expect(samples).toContain(quantileOf(samples, quantile));
    }
  });

  it('answers nothing over no samples', () => {
    expect(quantileOf([], 0.95)).toBeNull();
  });
});

describe('the frame figures', () => {
  it('sample the throw and not the table at rest', () => {
    const recorder = createPerfRecorder();
    // Sixty idle frames before the press. None of them is a sample.
    frames(recorder, 0, 60, 16);
    expect(recorder.report().frames).toBe(0);

    recorder.pressed(1000);
    const after = frames(recorder, 1000, 30, 16);
    recorder.settled(after);
    expect(recorder.report().frames).toBe(30);

    // And the idle frames after the throw are not samples either.
    frames(recorder, after, 60, 16);
    expect(recorder.report().frames).toBe(30);
  });

  it('refuses a percentile below its floor and names the count', () => {
    const recorder = createPerfRecorder();
    recorder.pressed(0);
    // Twenty-six frames give twenty-five gaps. A gap needs two frames, so the
    // first frame of a run is not a sample of anything.
    frames(recorder, 0, 26, 16);
    const p95 = figureOf(recorder, 'frameP95');
    const p99 = figureOf(recorder, 'frameP99');
    expect(p95.reading).toEqual({ kind: 'measured', value: 16 });
    expect(p99.reading).toEqual({ kind: 'tooFew', have: 25, needs: 100 });
    expect(figureLine(p99)).toBe('too few samples: 25 of 100 frames in a throw');
    // Four frames is not a percentile, and the overlay says so rather than
    // printing the largest of the four.
    const four = createPerfRecorder();
    four.pressed(0);
    frames(four, 0, 5, 16);
    expect(figureLine(figureOf(four, 'frameP95'))).toBe(
      'too few samples: 4 of 20 frames in a throw',
    );
  });

  it('reads the stall the throw really carried', () => {
    const recorder = createPerfRecorder();
    recorder.pressed(0);
    // A hundred and ninety-seven ordinary gaps and three of 300 ms, which is
    // the shape of a throw: the library simulates the whole tumble in one
    // block, and the frames around it run at the ordinary rate.
    const now = frames(recorder, 0, 198, 16);
    frames(recorder, now, 3, 300);
    recorder.settled(now + 900);
    expect(recorder.report().frames).toBe(200);
    expect(figureOf(recorder, 'frameP95').reading).toEqual({ kind: 'measured', value: 16 });
    expect(figureOf(recorder, 'frameP99').reading).toEqual({ kind: 'measured', value: 300 });
    expect(figureLine(figureOf(recorder, 'frameP99'))).toBe('300 ms over 200 frames in a throw');
  });

  it('shuts a window nothing reported rest for', () => {
    const recorder = createPerfRecorder();
    recorder.pressed(0);
    // The flat renderer acts no throw out and reports no rest.
    const long = frames(recorder, 0, 400, 16);
    expect(long).toBeGreaterThan(WINDOW_CAP_MS);
    expect(recorder.report().measuring).toBe(false);
    expect(recorder.report().frames).toBeLessThan(400);
    expect(recorder.report().frames).toBe(Math.ceil(WINDOW_CAP_MS / 16));
  });
});

describe('throw to first motion', () => {
  it('is the press at one end and the moved die at the other', () => {
    const recorder = createPerfRecorder();
    recorder.pressed(1000);
    // Frames pass with nothing moving. The screen redrew, the dice did not.
    frames(recorder, 1000, 12, 16);
    recorder.motion(1212, EVIDENCE);
    recorder.settled(1400);
    expect(figureOf(recorder, 'firstMotion').reading).toEqual({ kind: 'measured', value: 212 });
    expect(recorder.report().motion).toEqual(EVIDENCE);
    expect(figureOf(recorder, 'firstMotion').from).toBe('the press that threw');
    expect(figureOf(recorder, 'firstMotion').to).toBe(
      'the first frame that drew a die somewhere else',
    );
  });

  it('takes the first motion of a throw and never a later one', () => {
    const recorder = createPerfRecorder();
    recorder.pressed(0);
    recorder.motion(200, EVIDENCE);
    recorder.motion(600, { ...EVIDENCE, movedBy: 90 });
    expect(figureOf(recorder, 'firstMotion').reading).toEqual({ kind: 'measured', value: 200 });
  });

  it('reads nothing from a motion that belongs to no throw', () => {
    const recorder = createPerfRecorder();
    recorder.motion(500, EVIDENCE);
    expect(figureOf(recorder, 'firstMotion').reading).toEqual({
      kind: 'tooFew',
      have: 0,
      needs: 1,
    });
  });

  it('says the source is missing rather than printing a zero', () => {
    const recorder = createPerfRecorder();
    recorder.withoutMotion('the dice are flat');
    recorder.pressed(0);
    const figure = figureOf(recorder, 'firstMotion');
    expect(figure.reading).toEqual({ kind: 'unavailable', why: 'the dice are flat' });
    expect(figureLine(figure)).toBe('not measured here: the dice are flat');
    expect(figureLine(figure)).not.toMatch(/\b0\b/);
  });
});

describe('the long-task total', () => {
  it('adds up the tasks it was given', () => {
    const recorder = createPerfRecorder();
    recorder.longTask(64);
    recorder.longTask(51.5);
    const figure = figureOf(recorder, 'longTask');
    expect(figure.reading).toEqual({ kind: 'measured', value: 115.5 });
    expect(figure.samples).toBe(2);
    expect(figureLine(figure)).toBe('116 ms over 2 long tasks');
  });

  it('names the missing source and prints no number at all', () => {
    const recorder = createPerfRecorder();
    recorder.withoutLongTasks('this browser reports no long tasks');
    recorder.longTask(400);
    const figure = figureOf(recorder, 'longTask');
    expect(figure.reading).toEqual({
      kind: 'unavailable',
      why: 'this browser reports no long tasks',
    });
    expect(figureLine(figure)).toBe('not measured here: this browser reports no long tasks');
    expect(figureLine(figure)).not.toMatch(/\d/);
  });
});

describe('every line the owner reads off a photograph', () => {
  it('names its unit and its sample count', () => {
    const recorder = createPerfRecorder();
    recorder.pressed(0);
    frames(recorder, 0, 120, 16);
    recorder.motion(180, EVIDENCE);
    recorder.longTask(70);
    recorder.settled(2000);
    const lines = recorder.report().figures.map(figureLine);
    expect(lines).toHaveLength(4);
    for (const line of lines) {
      expect(line, line).toMatch(/ ms over \d+ /);
    }
    expect(recorder.report().figures.map((figure) => figure.key)).toEqual([
      'frameP95',
      'frameP99',
      'longTask',
      'firstMotion',
    ]);
  });

  it('counts every throw, and says while one is in flight', () => {
    const recorder = createPerfRecorder();
    expect(recorder.report()).toMatchObject({ throws: 0, measuring: false });
    recorder.pressed(0);
    expect(recorder.report()).toMatchObject({ throws: 1, measuring: true });
    recorder.settled(100);
    recorder.pressed(200);
    recorder.settled(300);
    expect(recorder.report()).toMatchObject({ throws: 2, measuring: false });
  });

  it('names one of a thing in the singular, because a photograph is read once', () => {
    const recorder = createPerfRecorder();
    recorder.pressed(0);
    recorder.motion(96, EVIDENCE);
    expect(figureLine(figureOf(recorder, 'firstMotion'))).toBe('96.0 ms over 1 throw');
    recorder.longTask(70);
    expect(figureLine(figureOf(recorder, 'longTask'))).toBe('70.0 ms over 1 long task');
  });

  it('moves its revision on every observation, so a drawer knows to draw', () => {
    const recorder = createPerfRecorder();
    const opening = recorder.revision;
    recorder.pressed(0);
    recorder.frame(16);
    recorder.frame(32);
    recorder.longTask(60);
    expect(recorder.revision).toBeGreaterThan(opening);
  });
});
