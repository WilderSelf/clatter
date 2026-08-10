// @vitest-environment jsdom
//
// The performance overlay, drawn — Unit 3.8, the overlay half.
//
// Three claims need a document:
//
//   1. The animation clock and the long-task observer are attached while the
//      panel is in the document, and both stop with it. An instrument that ran
//      for a player who never opened the overlay would be a cost this
//      application charges everybody for a reading nobody asked for.
//   2. A browser with no long-task source is named BY NAME on the panel, and
//      the panel prints no number for that figure at all.
//   3. Every line names its unit and its sample count, and the panel is a named
//      region that holds no tab stop.
//
// What is NOT here: whether the numbers are the numbers this machine really
// runs at. A real animation clock is the only thing that can answer that, so
// `node scripts/browser.mjs --overlay` drives the built application.

import { render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PerfSources } from './overlay';
import { NO_LONG_TASK_SOURCE, NO_MOTION_SOURCE, PerfOverlay, REDRAW_MS } from './overlay';
import type { PerfRecorder } from './perf';
import { createPerfRecorder } from './perf';

let host: HTMLDivElement | null = null;

afterEach(() => {
  if (host) render(null, host);
  host?.remove();
  host = null;
  vi.useRealTimers();
});

/** A clock and an observer the test owns, so nothing here waits on a browser. */
function sourcesOf(longTasks: 'offered' | 'absent') {
  const runs: ((at: number) => void)[] = [];
  let takeTask: ((ms: number) => void) | null = null;
  let stopped = 0;
  let cancelled = 0;
  const sources: PerfSources = {
    now: () => 0,
    requestFrame: (run) => {
      runs.push(run);
      return runs.length;
    },
    cancelFrame: () => {
      cancelled += 1;
    },
    observeLongTasks: (take) => {
      if (longTasks === 'absent') return { unavailable: NO_LONG_TASK_SOURCE };
      takeTask = take;
      return {
        stop: () => {
          stopped += 1;
        },
      };
    },
  };
  return {
    sources,
    frame(at: number): void {
      const next = runs.shift();
      if (next === undefined) throw new Error('nothing asked for a frame');
      next(at);
    },
    longTask(ms: number): void {
      if (takeTask === null) throw new Error('nothing is watching long tasks');
      takeTask(ms);
    },
    get waiting(): number {
      return runs.length;
    },
    get stopped(): number {
      return stopped;
    },
    get cancelled(): number {
      return cancelled;
    },
  };
}

function mount(recorder: PerfRecorder, sources: PerfSources, onTheTable = true): HTMLElement {
  const held = document.createElement('div');
  host = held;
  document.body.append(held);
  act(() => {
    render(<PerfOverlay recorder={recorder} onTheTable={onTheTable} sources={sources} />, held);
  });
  const panel = held.querySelector<HTMLElement>('[data-el="perf-overlay"]');
  if (panel === null) throw new Error('the overlay drew nothing');
  return panel;
}

/** What one row of the panel reads. */
function rowOf(panel: HTMLElement, key: string): { term: string; value: string; kind: string } {
  const row = panel.querySelector<HTMLElement>(`[data-el="perf-${key}"]`);
  if (row === null) throw new Error(`the panel holds no ${key} row`);
  return {
    term: row.querySelector('dt')?.textContent ?? '',
    value: row.querySelector('dd')?.textContent ?? '',
    kind: row.dataset['reading'] ?? '',
  };
}

describe('the instrument the panel carries', () => {
  it('runs the animation clock while the panel is in the document', () => {
    const recorder = createPerfRecorder();
    const held = sourcesOf('offered');
    mount(recorder, held.sources);
    recorder.pressed(0);
    act(() => {
      held.frame(16);
      held.frame(32);
      held.frame(48);
    });
    expect(recorder.report().frames).toBe(2);
    expect(held.waiting).toBe(1);
  });

  it('stops the clock and the observer when the panel leaves', () => {
    const recorder = createPerfRecorder();
    const held = sourcesOf('offered');
    mount(recorder, held.sources);
    expect(held.stopped).toBe(0);
    act(() => {
      if (host) render(null, host);
    });
    expect(held.stopped).toBe(1);
    expect(held.cancelled).toBe(1);
  });

  it('adds up the long tasks the browser reported', () => {
    vi.useFakeTimers();
    const recorder = createPerfRecorder();
    const held = sourcesOf('offered');
    const panel = mount(recorder, held.sources);
    act(() => {
      held.longTask(64);
      held.longTask(88);
      vi.advanceTimersByTime(REDRAW_MS + 1);
    });
    expect(rowOf(panel, 'longTask').value).toBe('152 ms over 2 long tasks');
  });
});

describe('a figure this browser cannot measure', () => {
  it('is named on the panel and prints no number', () => {
    const recorder = createPerfRecorder();
    const held = sourcesOf('absent');
    const panel = mount(recorder, held.sources);
    const row = rowOf(panel, 'longTask');
    expect(row.kind).toBe('unavailable');
    expect(row.value).toBe(`not measured here: ${NO_LONG_TASK_SOURCE}`);
    expect(row.value).not.toMatch(/\d/);
  });

  it('says so about the motion of a table that is not drawn', () => {
    const recorder = createPerfRecorder();
    const held = sourcesOf('offered');
    const panel = mount(recorder, held.sources, false);
    const row = rowOf(panel, 'firstMotion');
    expect(row.kind).toBe('unavailable');
    expect(row.value).toBe(`not measured here: ${NO_MOTION_SOURCE}`);
    expect(row.value).not.toMatch(/\b0\b/);
  });
});

describe('what the owner photographs', () => {
  it('names four figures, each with its unit and its sample count', () => {
    vi.useFakeTimers();
    const recorder = createPerfRecorder();
    const held = sourcesOf('offered');
    const panel = mount(recorder, held.sources);
    act(() => {
      recorder.pressed(0);
      let at = 0;
      for (let step = 0; step < 130; step += 1) {
        at += 16;
        held.frame(at);
      }
      recorder.motion(200, { stillFrames: 3, movedBy: 12, dice: 12, spawned: true });
      held.longTask(70);
      recorder.settled(at);
      vi.advanceTimersByTime(REDRAW_MS + 1);
    });
    const rows = [...panel.querySelectorAll('.perf-row')];
    expect(rows).toHaveLength(4);
    expect(rows.map((row) => row.querySelector('dt')?.textContent)).toEqual([
      'Frame p95',
      'Frame p99',
      'Long tasks',
      'Throw to first motion',
    ]);
    for (const row of rows) {
      expect(row.querySelector('dd')?.textContent, row.textContent ?? '').toMatch(/ ms over \d+ /);
    }
    expect(rowOf(panel, 'firstMotion').value).toBe('200 ms over 1 throw');
  });

  it('is a named region and holds no tab stop', () => {
    const recorder = createPerfRecorder();
    const held = sourcesOf('offered');
    const panel = mount(recorder, held.sources);
    expect(panel.tagName).toBe('SECTION');
    expect(panel.getAttribute('aria-label')).toBe('Performance readings');
    expect(panel.querySelectorAll('a, button, input, select, textarea, [tabindex]')).toHaveLength(
      0,
    );
  });

  it('does not draw again while a throw is in flight', () => {
    vi.useFakeTimers();
    const recorder = createPerfRecorder();
    const held = sourcesOf('offered');
    const panel = mount(recorder, held.sources);
    act(() => {
      recorder.pressed(0);
      held.longTask(90);
      vi.advanceTimersByTime(REDRAW_MS * 3);
    });
    // The reading is held back while the window is open, because a render
    // inside the throw would land in the frames the throw is measured over.
    expect(rowOf(panel, 'longTask').value).toBe('0.0 ms over 0 long tasks');
    act(() => {
      recorder.settled(500);
      vi.advanceTimersByTime(REDRAW_MS + 1);
    });
    expect(rowOf(panel, 'longTask').value).toBe('90.0 ms over 1 long task');
  });
});
