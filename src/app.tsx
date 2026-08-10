// The application shell and the pool builder — Unit 2.1.
//
// The drawn screen is `docs/design/0013-screen-final.html` and the counting
// rules are `docs/design/0002-screen-design.md`. Three of them decide this file:
//
//   * The header carries status and never navigates. Decision 2.
//   * The footer is persistent, and the difficulty rides on the roll button.
//   * The pool bar is ONE control with a roving tab index, and the difficulty is
//     ONE control over seven notches. Section 5 and section 2.
//
// This unit throws no dice. Units 2.2 and 2.3 do that. `Roll` collapses the
// builder and shows the table, and `Edit pool` brings the builder back, so both
// rest states of section 1 are reachable and drawn.
//
// Every rule comes from `src/shell/state.ts`, which asks the rules core. No
// count, no cap and no difficulty effect is worked out here.

import { useEffect, useRef, useState } from 'preact/hooks';
import type { Die } from './rules/die';
import type { AppState, PoolCell } from './shell/state';
import {
  composition,
  difficultyPreview,
  emptyState,
  nudge,
  poolCells,
  POOL_CAPS,
  signedDifficulty,
  throwDice,
  withDifficulty,
  withMode,
} from './shell/state';
import { mountTray } from './tray/scene';

export const APP_NAME = 'Clatter';

/**
 * How the screen changes the state.
 *
 * Every change is a function of the state before it, never of the state the
 * render captured. Two presses inside one frame are one frame apart for the
 * player and zero renders apart for the shell, and a change that read the
 * captured state would lose the first of them.
 */
type Change = (previous: AppState) => AppState;

/** The seven positions of the difficulty track, from hardest to easiest. */
const NOTCHES = [-3, -2, -1, 0, 1, 2, 3] as const;

/** The cell the roving tab index sits on, by index into the bar. */
function moveWithin(length: number, from: number, delta: number): number {
  return (from + delta + length) % length;
}

/**
 * The header. It carries status and it never navigates. Decision 2.
 *
 * It is also the live region, so what it says is spoken on every change. The
 * drawn line is a row of numbers beside two shapes, and a row of numbers read
 * aloud is a stream of digits, so the row is hidden from the reader and one
 * sentence carries the same facts. Both come from the same values in the same
 * render, so the two cannot disagree.
 */
function StatusLine({ state, dice }: { state: AppState; dice: readonly Die[] }) {
  // No throw has landed. Unit 2.2 fills the result half of the line.
  const successes = 0;
  const banes = 0;
  const pushes = 0;
  const stress = state.counts.stress;
  const spoken = `${successes} successes. ${banes} banes. Push ${pushes}. ${composition(dice)}`;
  return (
    <header class="shell-h" data-el="shell-header">
      <div class="statusline" data-el="status-line" role="status" aria-live="polite">
        <span class="st-row" aria-hidden="true">
          <span class="st-item">
            <i class="mark s" />
            {successes}
          </span>
          <span class="st-item">
            <i class="mark b" />
            {banes}
          </span>
          <i class="st-rule" />
          <span class="st-item st-dim">{dice.length} dice</span>
          <span class="st-item st-dim">
            <span class={stress >= POOL_CAPS.stress ? 'st-warn' : undefined}>stress {stress}</span>
          </span>
          <span class="st-item st-dim">push {pushes}</span>
        </span>
        <span class="sr-only">{spoken}</span>
      </div>
    </header>
  );
}

function Cell({
  cell,
  active,
  onNudge,
}: {
  cell: PoolCell;
  active: boolean;
  onNudge: (delta: number) => void;
}) {
  const classes = ['cell'];
  if (cell.count > 0) classes.push('on');
  if (cell.atCap) classes.push('cap-hit');
  return (
    <div
      class={classes.join(' ')}
      data-el={cell.id}
      role="spinbutton"
      tabIndex={active ? 0 : -1}
      aria-label={`${cell.label} dice`}
      aria-valuenow={cell.count}
      aria-valuemin={0}
      aria-valuemax={cell.max}
      aria-valuetext={cell.valueText}
    >
      {/* The two ends are 44 px of pointer target and no tab stop. Section 5
          turns twelve buttons into one control and one arrow habit, so a
          screen reader reads the tile and changes it with the arrow keys. */}
      <button
        class="cell-m"
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={() => onNudge(-1)}
      >
        −
      </button>
      <span class="cell-t">{cell.label}</span>
      <span class={cell.count === 0 ? 'cell-n zero' : 'cell-n'}>{cell.value}</span>
      <button
        class="cell-p"
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={() => onNudge(1)}
      >
        +
      </button>
    </div>
  );
}

function PoolBar({ state, setState }: { state: AppState; setState: (change: Change) => void }) {
  const cells = poolCells(state);
  const [activeId, setActiveId] = useState(cells[0]?.id ?? '');
  const bar = useRef<HTMLDivElement>(null);
  const active = cells.some((cell) => cell.id === activeId) ? activeId : (cells[0]?.id ?? '');

  const onKeyDown = (event: KeyboardEvent): void => {
    const held = bar.current;
    if (held === null) return;
    const tiles = [...held.querySelectorAll<HTMLElement>('[role="spinbutton"]')];
    const from = tiles.findIndex((tile) => tile.contains(held.ownerDocument.activeElement));
    const cell = cells[from];
    if (from < 0 || cell === undefined) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      const to = moveWithin(tiles.length, from, event.key === 'ArrowRight' ? 1 : -1);
      const next = tiles[to];
      const id = cells[to]?.id;
      if (next === undefined || id === undefined) return;
      event.preventDefault();
      setActiveId(id);
      next.focus();
      return;
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      setState((previous) => nudge(previous, cell.key, event.key === 'ArrowUp' ? 1 : -1));
    }
  };

  return (
    <div
      class="poolbar"
      data-el="pool-bar"
      data-composite=""
      role="toolbar"
      aria-label="The pool"
      aria-orientation="horizontal"
      ref={bar}
      onKeyDown={onKeyDown}
    >
      {cells.map((cell) => (
        <Cell
          key={cell.id}
          cell={cell}
          active={cell.id === active}
          onNudge={(delta) => {
            setActiveId(cell.id);
            setState((previous) => nudge(previous, cell.key, delta));
          }}
        />
      ))}
    </div>
  );
}

function Difficulty({ state, setState }: { state: AppState; setState: (change: Change) => void }) {
  const preview = difficultyPreview(state);
  const shown = signedDifficulty(state.difficulty);
  const step = (delta: number): void =>
    setState((previous) => withDifficulty(previous, previous.difficulty + delta));
  const onKeyDown = (event: KeyboardEvent): void => {
    const move: Record<string, number> = {
      ArrowRight: 1,
      ArrowUp: 1,
      ArrowLeft: -1,
      ArrowDown: -1,
    };
    const delta = move[event.key];
    if (delta === undefined) return;
    event.preventDefault();
    step(delta);
  };
  return (
    <div class="diff" data-el="difficulty" data-composite="" role="group" aria-label="Difficulty">
      <div class="diff-top">
        <span class="diff-l">Difficulty</span>
        <span class="diff-step">
          <button
            class="icon-btn diff-b"
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={() => step(-1)}
          >
            −
          </button>
          <span class="diff-v">{shown}</span>
          <button
            class="icon-btn diff-b"
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={() => step(1)}
          >
            +
          </button>
        </span>
      </div>
      {/* One value over seven positions, so the arrow keys change the value and
          never move the focus. Section 2 counts this as one control. */}
      <div
        class="track"
        data-el="difficulty-track"
        role="slider"
        tabIndex={0}
        aria-label="Difficulty"
        aria-valuemin={-3}
        aria-valuemax={3}
        aria-valuenow={state.difficulty}
        aria-valuetext={`${shown}. ${preview}`}
        onKeyDown={onKeyDown}
      >
        {NOTCHES.map((value) => {
          const classes = ['tk-n'];
          if (value === 0) classes.push('centre');
          if (value === state.difficulty) classes.push('on');
          return (
            <button
              key={value}
              class={classes.join(' ')}
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              onClick={() => setState((previous) => withDifficulty(previous, value))}
            />
          );
        })}
      </div>
      <p class="diff-p">{preview}</p>
    </div>
  );
}

function Builder({ state, setState }: { state: AppState; setState: (change: Change) => void }) {
  return (
    <section class="card" data-el="pool-builder">
      <h2 class="card-h">
        The throw
        <button
          class="icon-btn"
          type="button"
          data-el="collapse-button"
          onClick={() => setState((previous) => ({ ...previous, builderOpen: false }))}
        >
          Done
        </button>
      </h2>
      <PoolBar state={state} setState={setState} />
      <Difficulty state={state} setState={setState} />
    </section>
  );
}

/**
 * The table.
 *
 * It stays in the document across both rest states and hides while the builder
 * is open, because the library reads the size of its container when it mounts
 * and a hidden container measures nothing. The tray is behind a dynamic import,
 * so nothing of it is fetched until the player first closes the builder.
 *
 * No die lands here yet. Unit 2.2 throws the pool onto this table.
 */
function Table({ shown }: { shown: boolean }) {
  const container = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = container.current;
    if (!shown || element === null || mounted.current) return;
    mounted.current = true;
    mountTray(element).catch(() => setFailed(true));
  }, [shown]);

  return (
    <div class="table" data-el="dice-table" hidden={!shown} ref={container}>
      {failed ? <p class="table-note">The table did not load.</p> : null}
    </div>
  );
}

function Sheet({
  state,
  setState,
  onClose,
}: {
  state: AppState;
  setState: (change: Change) => void;
  onClose: () => void;
}) {
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => close.current?.focus(), []);
  return (
    <div class="scrim" onClick={onClose}>
      <div
        class="sheet"
        data-el="disclosure-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="More"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === 'Escape') onClose();
        }}
      >
        <fieldset class="field" data-el="sheet-mode">
          <legend>Dice</legend>
          {(['pool', 'step'] as const).map((mode) => (
            <label key={mode} class="choice">
              <input
                type="radio"
                name="mode"
                value={mode}
                checked={state.mode === mode}
                onChange={() => setState((previous) => withMode(previous, mode))}
              />
              {mode === 'pool' ? 'Pool dice' : 'Step dice'}
            </label>
          ))}
          <p class="sheet-note">A change of mode clears the pool.</p>
        </fieldset>
        <button
          class="btn"
          type="button"
          data-el="sheet-stress-reset"
          onClick={() =>
            setState((previous) => ({
              ...previous,
              counts: { ...previous.counts, stress: 0 },
            }))
          }
        >
          Set stress to zero
        </button>
        <button class="btn go" type="button" data-el="sheet-close" ref={close} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export function App() {
  const [state, setState] = useState<AppState>(() => emptyState('pool'));
  const dice = throwDice(state);
  const toggle = useRef<HTMLButtonElement>(null);
  const closeSheet = (): void => {
    setState((previous) => ({ ...previous, sheetOpen: false }));
    toggle.current?.focus();
  };

  return (
    <div class="screen">
      <StatusLine state={state} dice={dice} />

      <main class="shell-m" data-el="shell-mid">
        {state.builderOpen ? <Builder state={state} setState={setState} /> : null}
        <Table shown={!state.builderOpen} />
      </main>

      <div class="shell-f" data-el="shell-footer">
        {state.builderOpen ? null : (
          <div class="costrow" data-el="cost-row">
            <p class="cost-t">No dice are on the table.</p>
            <button
              class="icon-btn"
              type="button"
              data-el="edit-pool-button"
              onClick={() => setState((previous) => ({ ...previous, builderOpen: true }))}
            >
              Edit pool
            </button>
          </div>
        )}
        <div class="bar two">
          <button
            class="btn ghost"
            type="button"
            data-el="disclosure-toggle"
            aria-expanded={state.sheetOpen}
            ref={toggle}
            onClick={() =>
              setState((previous) => ({ ...previous, sheetOpen: !previous.sheetOpen }))
            }
          >
            More
          </button>
          <button
            class="btn go"
            type="button"
            data-el="roll-button"
            onClick={() => setState((previous) => ({ ...previous, builderOpen: false }))}
          >
            {state.builderOpen ? 'Roll' : 'Roll again'}
            <small>
              {dice.length} dice, difficulty {signedDifficulty(state.difficulty)}
            </small>
          </button>
        </div>
      </div>

      {state.sheetOpen ? <Sheet state={state} setState={setState} onClose={closeSheet} /> : null}
    </div>
  );
}
