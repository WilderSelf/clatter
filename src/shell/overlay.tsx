// The performance overlay — Unit 3.8, the overlay half.
//
// It draws the four figures `CLAUDE.md` names, on the phone the owner rolls on,
// once per phase. It is the only honest measurement of a mid-range phone this
// project will ever have, so two rules hold over every line of it:
//
//   1. **It reports and never gates.** No budget is read here and no reading is
//      called good or bad. The owner reads the numbers and decides.
//   2. **A number that cannot be measured is not printed.** A browser that
//      offers no long-task source is named as such. Zero would be a lie.
//
// `src/shell/perf.ts` holds the instrument and every rule about samples. This
// file is the wiring and the drawing: the animation clock, the long-task
// observer, and the panel a photograph has to be readable from.

import { useEffect, useState } from 'preact/hooks';
import type { PerfRecorder, PerfReport } from './perf';
import { figureLine } from './perf';

/** The browser readings the overlay takes, as one seam a test replaces. */
export interface PerfSources {
  now(): number;
  requestFrame(run: (at: number) => void): number;
  cancelFrame(handle: number): void;
  /**
   * Watch long tasks. It answers the reason where the browser offers none, and
   * that reason reaches the screen by name.
   */
  observeLongTasks(take: (durationMs: number) => void): { stop(): void } | { unavailable: string };
}

/** What the overlay says where a browser has no long-task source. */
export const NO_LONG_TASK_SOURCE = 'this browser reports no long tasks';

/** What it says while the dice are flat, where nothing on a table moves. */
export const NO_MOTION_SOURCE = 'the dice are flat, so no table moves';

export const browserSources: PerfSources = {
  now: () => performance.now(),
  requestFrame: (run) => globalThis.requestAnimationFrame(run),
  cancelFrame: (handle) => globalThis.cancelAnimationFrame(handle),
  observeLongTasks: (take) => {
    const Observer = globalThis.PerformanceObserver as typeof PerformanceObserver | undefined;
    if (Observer === undefined) return { unavailable: NO_LONG_TASK_SOURCE };
    // The browser's own list of what it can observe. Firefox offers no
    // `longtask` entry type, and asking it to observe one throws.
    const offered = Observer.supportedEntryTypes;
    if (!Array.isArray(offered) || !offered.includes('longtask')) {
      return { unavailable: NO_LONG_TASK_SOURCE };
    }
    const observer = new Observer((list) => {
      for (const entry of list.getEntries()) take(entry.duration);
    });
    try {
      observer.observe({ type: 'longtask', buffered: true });
    } catch {
      return { unavailable: NO_LONG_TASK_SOURCE };
    }
    return { stop: () => observer.disconnect() };
  },
};

/**
 * How often the panel is drawn again.
 *
 * The overlay is inside the thing it measures, so a redraw on every frame would
 * be a cost the figures then report. Twice a second is faster than an eye reads
 * a changing number and slow enough to cost the measurement nothing, and no
 * redraw happens at all while a throw is in flight.
 */
export const REDRAW_MS = 500;

export interface OverlayProps {
  readonly recorder: PerfRecorder;
  /** True while the 3D table draws the dice. The flat dice have no motion. */
  readonly onTheTable: boolean;
  readonly sources?: PerfSources;
}

/**
 * Draw the four figures and keep them fed.
 *
 * The animation clock runs while this element is in the document and stops with
 * it, so a player who never opens the overlay pays for no frame callback at
 * all.
 */
export function PerfOverlay({
  recorder,
  onTheTable,
  sources = browserSources,
}: OverlayProps): preact.JSX.Element {
  const [report, setReport] = useState<PerfReport>(() => recorder.report());

  useEffect(() => {
    let handle = sources.requestFrame(function tick(at: number): void {
      recorder.frame(at);
      handle = sources.requestFrame(tick);
    });
    return () => sources.cancelFrame(handle);
  }, [recorder, sources]);

  useEffect(() => {
    const watch = sources.observeLongTasks((duration) => recorder.longTask(duration));
    if ('unavailable' in watch) {
      recorder.withoutLongTasks(watch.unavailable);
      return;
    }
    return () => watch.stop();
  }, [recorder, sources]);

  useEffect(() => {
    if (onTheTable) recorder.withMotion();
    else recorder.withoutMotion(NO_MOTION_SOURCE);
  }, [recorder, onTheTable]);

  // The opening reading, taken AFTER the two effects above have said what this
  // browser offers. Without it the panel would print a total of 0 ms for half a
  // second on a browser that reports no long tasks at all, which is the one
  // thing this overlay may never do.
  useEffect(() => {
    setReport(recorder.report());
  }, [recorder, onTheTable, sources]);

  useEffect(() => {
    let drawn = -1;
    const timer = setInterval(() => {
      // Never inside a throw. A render there would land in the samples.
      if (recorder.revision === drawn) return;
      const next = recorder.report();
      if (next.measuring) return;
      drawn = recorder.revision;
      setReport(next);
    }, REDRAW_MS);
    return () => clearInterval(timer);
  }, [recorder]);

  return (
    <section class="perf" data-el="perf-overlay" aria-label="Performance readings">
      <p class="perf-h">Performance, on this device</p>
      <dl class="perf-l">
        {report.figures.map((figure) => (
          <div
            key={figure.key}
            class="perf-row"
            data-el={`perf-${figure.key}`}
            data-reading={figure.reading.kind}
          >
            <dt>{figure.label}</dt>
            <dd>{figureLine(figure)}</dd>
          </div>
        ))}
      </dl>
      <p class="perf-f" data-el="perf-note">
        Throws measured: {report.throws}. These are readings, not a pass or a fail.
      </p>
    </section>
  );
}
