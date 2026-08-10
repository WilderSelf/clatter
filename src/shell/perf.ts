// The instrument behind the performance overlay — Unit 3.8, the overlay half.
//
// **This module reports. It never gates.** `CLAUDE.md` splits the performance
// claims in two. The deterministic gates are integers in CI and read a budget
// out of `budgets.json`. The timing figures are reported on real hardware, once
// per phase, and the owner pastes them into `LEDGER.md`. So nothing here reads
// a budget, nothing here compares a reading against one, and nothing here can
// fail a run. A timing figure that gated would flake on the machine that ran
// it, which is the reason the split exists.
//
// Pure. No browser API is named here. The caller hands over every instant, so
// the whole instrument runs under a plain test runner and a check can drive a
// clock it owns. `src/shell/overlay.tsx` does the wiring.
//
// Four figures, and each one names the source it is measured from:
//
//   1. p95 frame duration — the gap between two animation frames.
//   2. p99 frame duration — the same samples.
//   3. long-task total    — `PerformanceObserver` with the `longtask` type.
//   4. throw-to-first-motion — the press that threw, to the first frame that
//      drew a die somewhere else.
//
// A figure whose source the browser does not offer says so BY NAME and prints
// no number. Zero is a measurement and it would be a lie here.

/**
 * Frames are collected inside a throw and nowhere else.
 *
 * A probe that samples a resting table measures the browser idling. The cost of
 * this application is the throw: the library simulates the whole tumble in one
 * synchronous block before it draws anything. So a window opens at the press
 * that threw and closes when the tray reports the table at rest, and only the
 * frames between are samples.
 */
export interface ThrowWindow {
  readonly pressedAt: number;
  readonly frames: number;
}

/**
 * How long a window may stay open with no report of rest.
 *
 * The flat renderer acts no throw out and never reports one, and a tray that
 * fell mid-throw reports nothing either. Without a cap the instrument would
 * collect idle frames for the rest of the session and hide the throw inside
 * them, which is the defect this whole file is written against.
 */
export const WINDOW_CAP_MS = 4000;

/**
 * The fewest samples a quantile may be read off.
 *
 * A quantile q over n samples names a value that at most `n * (1 - q)` samples
 * lie above. Below `1 / (1 - q)` samples that count is under one, so the
 * "p95" is simply the largest sample and the "p99" is the same number again.
 * The floor is therefore derived from the quantile and is not a taste: 20
 * frames for p95, 100 frames for p99.
 */
export function minimumSamples(quantile: number): number {
  if (!(quantile > 0) || !(quantile < 1)) {
    throw new Error(`minimumSamples: a quantile lies between 0 and 1, not ${quantile}`);
  }
  return Math.ceil(1 / (1 - quantile));
}

/**
 * The nearest-rank quantile of an unsorted list.
 *
 * Nearest rank, so every value printed is a value that was measured. An
 * interpolated quantile prints a frame duration that never happened.
 */
export function quantileOf(samples: readonly number[], quantile: number): number | null {
  if (samples.length === 0) return null;
  const sorted = [...samples].sort((a, b) => a - b);
  const rank = Math.ceil(quantile * sorted.length);
  return sorted[Math.min(sorted.length, Math.max(1, rank)) - 1] ?? null;
}

/** What one figure of the overlay reads. */
export type Reading =
  | { readonly kind: 'measured'; readonly value: number }
  | { readonly kind: 'tooFew'; readonly have: number; readonly needs: number }
  | { readonly kind: 'unavailable'; readonly why: string };

/** The four keys the overlay draws, in the order `CLAUDE.md` names them. */
export type FigureKey = 'frameP95' | 'frameP99' | 'longTask' | 'firstMotion';

export interface Figure {
  readonly key: FigureKey;
  /** What the figure is, in the words the owner reads off a photograph. */
  readonly label: string;
  /** Every figure of this overlay is a duration in milliseconds. */
  readonly unit: 'ms';
  readonly reading: Reading;
  /** How many observations stand behind the reading. */
  readonly samples: number;
  /** What one observation is. It is printed, so a number cannot be misread. */
  readonly samplesWord: string;
  /**
   * The same word for a count of one.
   *
   * The two forms are written out rather than derived. The owner reads these
   * lines off a photograph and "1 throws" makes a reader stop, and a rule that
   * strips an `s` gets "long tasks" wrong, because the plural is not on the
   * first word of every phrase.
   */
  readonly samplesWordOne: string;
  /** The event that opens the measurement, in words. */
  readonly from: string;
  /** The event that closes it. */
  readonly to: string;
}

/** What the tray saw at the frame it first drew a die somewhere else. */
export interface MotionEvidence {
  /** Frames watched after the press that drew every die where it already was. */
  readonly stillFrames: number;
  /** The largest distance any die moved at that frame, in tray units. */
  readonly movedBy: number;
  /** How many dice the tray held at that frame. */
  readonly dice: number;
  /** True when the tray held a different number of dice from the press. */
  readonly spawned: boolean;
}

export interface PerfReport {
  readonly figures: readonly Figure[];
  /** Throws whose window opened. */
  readonly throws: number;
  /** Frame samples, over every window. */
  readonly frames: number;
  /** Long tasks counted, where the browser reports them at all. */
  readonly longTasks: number;
  /** True while a throw window is open, so a reader knows the figures move. */
  readonly measuring: boolean;
  /** The evidence of the newest motion reading, or null before one. */
  readonly motion: MotionEvidence | null;
}

export interface PerfRecorder {
  /** The player pressed a control that throws. `at` is the press itself. */
  pressed(at: number): void;
  /** One animation frame ran. */
  frame(at: number): void;
  /** The tray drew a die somewhere else, for the first time this throw. */
  motion(at: number, evidence: MotionEvidence): void;
  /** The tray reports the table at rest. */
  settled(at: number): void;
  /** One long task, as `PerformanceObserver` reported it. */
  longTask(durationMs: number): void;
  /** This browser offers no long-task source. */
  withoutLongTasks(why: string): void;
  /** Nothing on this screen can be watched for motion. */
  withoutMotion(why: string): void;
  /** A motion source is available again. */
  withMotion(): void;
  /** Rises on every observation, so a drawer knows when to draw again. */
  readonly revision: number;
  report(): PerfReport;
}

/** The two ends of the frame figures, said once. */
const FRAME_FROM = 'one animation frame';
const FRAME_TO = 'the next animation frame';

export function createPerfRecorder(): PerfRecorder {
  const frames: number[] = [];
  const motions: number[] = [];
  let lastFrameAt: number | null = null;
  let open: { pressedAt: number; motionAt: number | null } | null = null;
  let throws = 0;
  let longTaskTotal = 0;
  let longTasks = 0;
  let longTaskWhy: string | null = null;
  let motionWhy: string | null = null;
  let motion: MotionEvidence | null = null;
  let revision = 0;

  const close = (): void => {
    open = null;
    revision += 1;
  };

  const figures = (): readonly Figure[] => {
    const frameFigure = (key: 'frameP95' | 'frameP99', quantile: number): Figure => {
      const needs = minimumSamples(quantile);
      const value = quantileOf(frames, quantile);
      return {
        key,
        label: `Frame p${String(Math.round(quantile * 100))}`,
        unit: 'ms',
        reading:
          frames.length < needs || value === null
            ? { kind: 'tooFew', have: frames.length, needs }
            : { kind: 'measured', value },
        samples: frames.length,
        samplesWord: 'frames in a throw',
        samplesWordOne: 'frame in a throw',
        from: FRAME_FROM,
        to: FRAME_TO,
      };
    };
    return [
      frameFigure('frameP95', 0.95),
      frameFigure('frameP99', 0.99),
      {
        key: 'longTask',
        label: 'Long tasks',
        unit: 'ms',
        reading:
          longTaskWhy === null
            ? { kind: 'measured', value: longTaskTotal }
            : { kind: 'unavailable', why: longTaskWhy },
        samples: longTasks,
        samplesWord: 'long tasks',
        samplesWordOne: 'long task',
        from: 'a task that ran over 50 ms',
        to: 'the end of that task',
      },
      {
        key: 'firstMotion',
        label: 'Throw to first motion',
        unit: 'ms',
        reading:
          motionWhy !== null
            ? { kind: 'unavailable', why: motionWhy }
            : motions.length < 1
              ? { kind: 'tooFew', have: motions.length, needs: 1 }
              : { kind: 'measured', value: motions[motions.length - 1] as number },
        samples: motions.length,
        samplesWord: 'throws',
        samplesWordOne: 'throw',
        from: 'the press that threw',
        to: 'the first frame that drew a die somewhere else',
      },
    ];
  };

  return {
    get revision() {
      return revision;
    },
    pressed(at: number): void {
      open = { pressedAt: at, motionAt: null };
      throws += 1;
      revision += 1;
    },
    frame(at: number): void {
      const previous = lastFrameAt;
      lastFrameAt = at;
      if (open === null || previous === null) return;
      // The cap closes a window nothing reported rest for. The frame that
      // crossed it is still a frame of the throw, so it is kept.
      frames.push(at - previous);
      revision += 1;
      if (at - open.pressedAt > WINDOW_CAP_MS) close();
    },
    motion(at: number, evidence: MotionEvidence): void {
      if (open === null || open.motionAt !== null) return;
      open.motionAt = at;
      motions.push(at - open.pressedAt);
      motion = evidence;
      revision += 1;
    },
    settled(at: number): void {
      if (open === null) return;
      // The frame the tray settled on belongs to the throw. The window shuts
      // after it, so the idle frames that follow are not samples.
      lastFrameAt = at;
      close();
    },
    longTask(durationMs: number): void {
      if (longTaskWhy !== null) return;
      longTaskTotal += durationMs;
      longTasks += 1;
      revision += 1;
    },
    withoutLongTasks(why: string): void {
      longTaskWhy = why;
      revision += 1;
    },
    withoutMotion(why: string): void {
      motionWhy = why;
      revision += 1;
    },
    withMotion(): void {
      motionWhy = null;
      revision += 1;
    },
    report(): PerfReport {
      return {
        figures: figures(),
        throws,
        frames: frames.length,
        longTasks,
        measuring: open !== null,
        motion,
      };
    },
  };
}

/**
 * One line of the overlay, as text.
 *
 * Every line names its unit and its sample count, because the owner reads these
 * numbers off a photograph of a phone and a bare number there is ambiguous. A
 * figure the browser cannot measure names the reason instead, and prints no
 * number at all.
 */
export function figureLine(figure: Figure): string {
  if (figure.reading.kind === 'unavailable') {
    return `not measured here: ${figure.reading.why}`;
  }
  if (figure.reading.kind === 'tooFew') {
    return (
      `too few samples: ${figure.reading.have} of ${figure.reading.needs} ` +
      `${figure.reading.needs === 1 ? figure.samplesWordOne : figure.samplesWord}`
    );
  }
  const value =
    figure.reading.value >= 100
      ? String(Math.round(figure.reading.value))
      : figure.reading.value.toFixed(1);
  const word = figure.samples === 1 ? figure.samplesWordOne : figure.samplesWord;
  return `${value} ${figure.unit} over ${figure.samples} ${word}`;
}
