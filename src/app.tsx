// The application shell — Units 2.1 and 2.2.
//
// The drawn screen is `docs/design/0013-screen-final.html` and the counting
// rules are `docs/design/0002-screen-design.md`. Four of them decide this file:
//
//   * The header carries status and never navigates. Decision 2.
//   * The footer is persistent, and the difficulty rides on the roll button.
//   * The pool bar is ONE control with a roving tab index, and the difficulty is
//     ONE control over seven notches. Section 5 and section 2.
//   * The tray is ONE control as well, over the kept shelf and the throw zone,
//     with pool order inside each zone. Decision 4.
//
// Unit 2.1 built the builder and both rest states. Unit 2.2 throws the pool,
// draws the dice flat, and prices the push from `previewPush`.
//
// **This unit builds no history matrix.** The matrix moves into the history
// record, where Decision 3 transposes it to one row per die. `LEDGER.md` holds
// the deferral and names the unit that carries the acceptance with it.
//
// Every rule comes from `src/shell/state.ts`, which asks the rules core. No
// count, no cap, no lock and no cost is worked out here.

import { useEffect, useRef, useState } from 'preact/hooks';
import type { Die } from './rules/die';
import type { RandomSource } from './rules/random';
import { cryptoRandom } from './rules/random';
import type { AppState, DieView, PoolCell } from './shell/state';
import {
  canPush,
  composition,
  costLine,
  dieView,
  difficultyPreview,
  emptyState,
  nudge,
  poolCells,
  POOL_CAPS,
  profileOf,
  pushNote,
  pushNow,
  readout,
  rollNow,
  signedDifficulty,
  throwDice,
  toggleDie,
  withDifficulty,
  withMode,
  zonesOf,
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
  const { successes, banes, stress, pushes } = readout(state);
  // Before a throw the line names what the next throw takes. After one it names
  // what landed, so the result reaches the live region on the roll and on the
  // push. Both sentences come from the same render as the row beside them.
  const table =
    state.result === null
      ? composition(dice)
      : `The table holds ${state.result.dice.length} ` +
        `${state.result.dice.length === 1 ? 'die' : 'dice'}. Stress ${stress}.`;
  const spoken = `${successes} ${successes === 1 ? 'success' : 'successes'}. ${banes} ${banes === 1 ? 'bane' : 'banes'}. Push ${pushes}. ${table}`;
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
          <span class="st-item st-dim">
            {state.result === null ? dice.length : state.result.dice.length} dice
          </span>
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
 * One die, drawn flat.
 *
 * Shape carries every meaning colour carries, which section 7 requires. The
 * three lock states differ by ground and by frame: a rule lock is a solid frame
 * on a shaded pad, a choice lock is a dashed frame, and a loose die is lifted
 * and carries no pad. A success is a circle and a bane is a triangle. The
 * accessible name says all of it again in words, so nothing rides on sight.
 *
 * A die the rules hold takes no press, so it is not a button. It still holds a
 * place in the arrow walk, because a player who cannot press a die must still
 * be able to read it.
 */
function Slot({
  view,
  shaken,
  active,
  onPress,
}: {
  view: DieView;
  shaken: boolean;
  active: boolean;
  onPress: () => void;
}) {
  const classes = ['slot', view.state];
  if (view.die.type === 'stress') classes.push('stress');
  if (shaken) classes.push('thrown');
  const face =
    view.die.faces === 6 && view.value !== null ? (
      <span class={`die pips f${view.value}`}>
        {view.successes > 0 ? (
          <span class="badge s" aria-hidden="true">
            {view.successes}
          </span>
        ) : null}
        {view.bane ? (
          <span class="badge b" aria-hidden="true">
            bane
          </span>
        ) : null}
      </span>
    ) : (
      // Pips read to six. A step die, a gear die of eight faces and an artifact
      // die print the number instead, so every face count carries its value.
      <span class="die num">
        {view.value}
        {view.successes > 0 ? (
          <span class="badge s" aria-hidden="true">
            {view.successes}
          </span>
        ) : null}
        {view.bane ? (
          <span class="badge b" aria-hidden="true">
            bane
          </span>
        ) : null}
      </span>
    );
  const caption = (
    <span class="cap" aria-hidden="true">
      <b>{view.tag}</b>
      <em>{view.word}</em>
    </span>
  );
  if (view.state === 'rule') {
    return (
      <div
        class={classes.join(' ')}
        data-el={view.element}
        role="img"
        tabIndex={active ? 0 : -1}
        aria-label={view.label}
      >
        {face}
        {caption}
      </div>
    );
  }
  return (
    <button
      class={classes.join(' ')}
      data-el={view.element}
      type="button"
      tabIndex={active ? 0 : -1}
      aria-pressed={view.state === 'choice'}
      aria-label={view.label}
      onClick={onPress}
    >
      {face}
      {caption}
    </button>
  );
}

function Zone({
  kind,
  title,
  note,
  views,
  thrown,
  activeId,
  onPress,
}: {
  kind: string;
  title: string;
  note: string;
  views: readonly DieView[];
  thrown: readonly string[];
  activeId: string;
  onPress: (id: string) => void;
}) {
  return (
    <div class={kind === 'kept-shelf' ? 'shelf' : 'throwzone'} data-el={kind}>
      <p class="band-h">
        {title}{' '}
        <span>
          {views.length} {views.length === 1 ? 'die' : 'dice'} — {note}
        </span>
      </p>
      <div class="tray">
        {views.map((view) => (
          // The key carries the generation of the dice that moved, so the shake
          // plays again on every throw. A die that stayed keeps its key and
          // therefore its element, and it does not shake.
          <Slot
            key={
              thrown.includes(view.die.id)
                ? `${view.die.id}:${view.die.values.length}`
                : view.die.id
            }
            view={view}
            shaken={thrown.includes(view.die.id)}
            active={view.element === activeId}
            onPress={() => onPress(view.die.id)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * The dice as they lie, over the kept shelf and the throw zone.
 *
 * One control, one arrow habit, exactly like the pool bar. Section 2 counts a
 * composite widget as one tab stop, and section 6 walks the shelf first and the
 * zone second with pool order inside each. Decision 4 settles that split: the
 * lock state chooses the zone and nothing else.
 */
function DiceTray({ state, setState }: { state: AppState; setState: (change: Change) => void }) {
  const profile = profileOf(state);
  const zones = zonesOf(state);
  const kept = zones.kept.map((die) => dieView(die, profile));
  const loose = zones.loose.map((die) => dieView(die, profile));
  const order = [...kept, ...loose];
  const [activeId, setActiveId] = useState(order[0]?.element ?? '');
  const tray = useRef<HTMLDivElement>(null);
  const active = order.some((view) => view.element === activeId)
    ? activeId
    : (order[0]?.element ?? '');

  // A throw puts the roving tab index back on the first die of the shelf. The
  // same twenty-five dice come back every throw, so a cell the player left it
  // on is still a cell, and the tray would otherwise open the next throw in
  // the middle of itself.
  const first = order[0]?.element ?? '';
  useEffect(() => setActiveId(first), [state.thrown]);

  const onKeyDown = (event: KeyboardEvent): void => {
    const held = tray.current;
    const step: Record<string, number> = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
    };
    const delta = step[event.key];
    if (held === null || delta === undefined) return;
    const cells = [...held.querySelectorAll<HTMLElement>('.slot')];
    const from = cells.findIndex((cell) => cell.contains(held.ownerDocument.activeElement));
    if (from < 0) return;
    const next = cells[moveWithin(cells.length, from, delta)];
    if (next === undefined) return;
    event.preventDefault();
    setActiveId(next.getAttribute('data-el') ?? '');
    next.focus();
  };

  return (
    <div
      class="zones"
      data-el="dice-tray"
      data-composite=""
      role="toolbar"
      aria-label="The dice"
      ref={tray}
      onKeyDown={onKeyDown}
    >
      <Zone
        kind="kept-shelf"
        title="Kept"
        note="these stay on the table"
        views={kept}
        thrown={state.thrown}
        activeId={active}
        onPress={(id) => setState((previous) => toggleDie(previous, id))}
      />
      <Zone
        kind="throw-zone"
        title="In the cup"
        note="the push throws these"
        views={loose}
        thrown={state.thrown}
        activeId={active}
        onPress={(id) => setState((previous) => toggleDie(previous, id))}
      />
    </div>
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
 * The flat dice of this unit render in its place the moment a throw lands, so
 * this element is the empty table and nothing else. Unit 3.7 chooses between
 * the two renderers, and until it does the 3D route stays reachable here.
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

/**
 * The screen.
 *
 * `random` is the source the throws draw from. It is `cryptoRandom` in the
 * application, which Constraint 7 fixes, and a seeded source is injected here
 * by a test alone. `initial` is the state a test opens the screen in, so a
 * table with dice on it can be asserted without a search for a seed.
 */
export function App({
  random = cryptoRandom(),
  initial,
}: { random?: RandomSource; initial?: AppState } = {}) {
  const [state, setState] = useState<AppState>(() => initial ?? emptyState('pool'));
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
        {state.result === null ? null : <DiceTray state={state} setState={setState} />}
        <Table shown={!state.builderOpen && state.result === null} />
      </main>

      <div class="shell-f" data-el="shell-footer">
        {state.builderOpen ? null : (
          <div class="costrow" data-el="cost-row">
            <p class="cost-t">{costLine(state)}</p>
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
        <div class={state.result === null ? 'bar two' : 'bar'}>
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
            class={state.result === null ? 'btn go' : 'btn'}
            type="button"
            data-el="roll-button"
            onClick={() => setState((previous) => rollNow(previous, random))}
          >
            {state.builderOpen ? 'Roll' : 'Roll again'}
            <small>
              {dice.length} dice, difficulty {signedDifficulty(state.difficulty)}
            </small>
          </button>
          {state.result === null ? null : (
            <button
              class="btn go"
              type="button"
              data-el="push-button"
              disabled={!canPush(state)}
              onClick={() => setState((previous) => pushNow(previous, random))}
            >
              Push
              <small>{pushNote(state)}</small>
            </button>
          )}
        </div>
      </div>

      {state.sheetOpen ? <Sheet state={state} setState={setState} onClose={closeSheet} /> : null}
    </div>
  );
}
