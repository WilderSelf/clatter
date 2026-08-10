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
// draws the dice flat, and prices the push from `previewPush`. Unit 3.7 chooses
// between the two renderers at startup, records the permanent fall to flat
// dice, says so once, and offers the toggle back.
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
import { PUSH_PROFILES } from './rules/push-profile';
import type { ArtifactCurveId } from './rules/success';
import { ARTIFACT_CURVE_IDS } from './rules/success';
import { localSettingsStore } from './settings/local-store';
import type { Settings, SettingsStore } from './settings/settings';
import { readSettings, writeSettings } from './settings/settings';
import { OverridePanel } from './shell/overrides';
import type { RendererState } from './shell/renderer';
import {
  askForTray,
  fallToFlat,
  noticeText,
  startRenderer,
  trayNote,
  withDecision,
} from './shell/renderer';
import type { TrayMount, TraySpots } from './shell/table';
import { NO_SPOTS, Table } from './shell/table';
import type { AppState, DieView, PoolCell } from './shell/state';
import {
  canPush,
  composition,
  costLine,
  dieView,
  difficultyPreview,
  nudge,
  poolCells,
  POOL_CAPS,
  presetOf,
  profileOf,
  pushNote,
  pushNow,
  readout,
  rollNow,
  settingsFromState,
  signedDifficulty,
  stateFromSettings,
  throwDice,
  toggleDie,
  withArtifactCurve,
  withDifficulty,
  withMode,
  withOverride,
  withoutOverride,
  withPreset,
  zonesOf,
} from './shell/state';
import type { TrayDecision } from './tray/capability';
import { decideTray, probeCapability } from './tray/capability';
import { mountTray } from './tray/scene';

export type { TrayMount, TraySpots } from './shell/table';

export const APP_NAME = 'Clatter';

/**
 * What each artifact curve pays, in the words a player reads.
 *
 * The thresholds are the rules core's own and are stated in
 * `specs/0001-rules-model.md`. The sentence names them so the player can choose
 * between two curves rather than between two words.
 */
const ARTIFACT_CURVE_NOTE: Readonly<Record<ArtifactCurveId, string>> = {
  artifactEscalating: 'A face of 6 pays 1, 8 pays 2, 10 pays 3 and 12 pays 4.',
  artifactFlat: 'A face of 6 pays 1, and 10 pays 2.',
};

/**
 * The startup probe, as the screen takes it.
 *
 * `probeCapability` reads the platform and `decideTray` decides over that
 * reading alone. Both live in `src/tray/capability.ts`, and a test hands over
 * an answer of its own rather than a platform.
 */
export type TrayProbe = () => Promise<TrayDecision>;

const probeTray: TrayProbe = async () => decideTray(await probeCapability());

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
  if (!cell.empty) classes.push('on');
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
      <span class={cell.empty ? 'cell-n zero' : 'cell-n'}>{cell.value}</span>
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
 * Which renderer the die cells are drawn for.
 *
 * `flat` draws the die itself, which is the fallback renderer of Unit 2.2.
 * `over` draws nothing and lies over the 3D die it names, which is Decision 9
 * of `docs/design/0012-settled-decisions.md`. Both hold the same role, the
 * same accessible name, the same `aria-pressed` and the same place in the
 * walk, so section 6 reads the same list whichever renderer is running.
 */
export type TrayLayout = 'flat' | 'over';

/** Where one cell of the overlay goes, in the pixels the tray measured. */
function overStyle(spot: TraySpots[string] | undefined): string | undefined {
  if (spot === undefined) return undefined;
  return (
    `left:${spot.x}px;top:${spot.y}px;` + `width:${spot.radius * 2}px;height:${spot.radius * 2}px`
  );
}

/**
 * One die.
 *
 * **Flat.** Shape carries every meaning colour carries, which section 7
 * requires. The three lock states differ by ground and by frame: a rule lock is
 * a solid frame on a shaded pad, a choice lock is a dashed frame, and a loose
 * die is lifted and carries no pad. A success is a circle and a bane is a
 * triangle. The accessible name says all of it again in words, so nothing rides
 * on sight.
 *
 * **Over the table.** The cell draws no die at all, because the 3D die under it
 * is the result the player reads and a flat copy on top would draw it twice.
 * The cell carries the name, the state and the focus ring, and it takes no
 * pointer, so a press with a mouse reaches the raycast of Unit 3.5 instead.
 * The marks on the dice carry the three states to the eye there.
 *
 * A die the rules hold takes no press, so it is not a button. It still holds a
 * place in the arrow walk, because a player who cannot press a die must still
 * be able to read it.
 */
function Slot({
  view,
  layout,
  spot,
  shaken,
  active,
  onPress,
}: {
  view: DieView;
  layout: TrayLayout;
  spot: TraySpots[string] | undefined;
  shaken: boolean;
  active: boolean;
  onPress: () => void;
}) {
  const over = layout === 'over';
  const classes = ['slot', view.state];
  if (over) classes.push('over');
  if (view.die.type === 'stress') classes.push('stress');
  if (shaken && !over) classes.push('thrown');
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
  const drawn = over ? null : (
    <>
      {face}
      {caption}
    </>
  );
  if (view.state === 'rule') {
    return (
      <div
        class={classes.join(' ')}
        data-el={view.element}
        role="img"
        tabIndex={active ? 0 : -1}
        aria-label={view.label}
        style={over ? overStyle(spot) : undefined}
      >
        {drawn}
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
      style={over ? overStyle(spot) : undefined}
    >
      {drawn}
    </button>
  );
}

function Zone({
  kind,
  title,
  note,
  views,
  layout,
  spots,
  thrown,
  ordinal,
  activeId,
  onPress,
}: {
  kind: string;
  title: string;
  note: string;
  views: readonly DieView[];
  layout: TrayLayout;
  spots: TraySpots;
  thrown: readonly string[];
  ordinal: number;
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
          // The key carries the throw that moved the die, so the element is
          // rebuilt and the shake plays again on every throw. A die that stayed
          // keeps its key and therefore its element, and it does not shake.
          //
          // The number is the throw ordinal and never the count of the values
          // the die carries. A re-throw asks the core for a fresh roll, whose
          // dice each carry one value, so a count would read the same before
          // and after and no die that stayed in its zone would shake. Unit 2.3
          // reported that defect and `src/shell/state.ts` holds the ordinal
          // that closes it.
          <Slot
            key={thrown.includes(view.die.id) ? `${view.die.id}:${ordinal}` : view.die.id}
            view={view}
            layout={layout}
            spot={spots[view.die.id]}
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
 *
 * **Both renderers hold this list.** With the 3D tray the same cells lie over
 * the canvas at the place each die landed, so the keyboard walk, the names and
 * `aria-pressed` do not change with the renderer. Decision 9.
 */
function DiceTray({
  state,
  setState,
  layout,
  spots,
}: {
  state: AppState;
  setState: (change: Change) => void;
  layout: TrayLayout;
  spots: TraySpots;
}) {
  const profile = profileOf(state);
  const zones = zonesOf(state);
  const kept = zones.kept.map((die) => dieView(die, profile, state.artifactCurve));
  const loose = zones.loose.map((die) => dieView(die, profile, state.artifactCurve));
  const order = [...kept, ...loose];
  const [activeId, setActiveId] = useState(order[0]?.element ?? '');
  const tray = useRef<HTMLDivElement>(null);
  const active = order.some((view) => view.element === activeId)
    ? activeId
    : (order[0]?.element ?? '');

  // A throw puts the roving tab index back on the first die of the shelf. The
  // same dice come back every throw, so a cell the player left it on is still a
  // cell, and the tray would otherwise open the next throw in the middle of
  // itself. A push adds a stress die, which arrives at the end of the zone and
  // moves no cell the player already reached.
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
      class={layout === 'over' ? 'zones over' : 'zones'}
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
        layout={layout}
        spots={spots}
        thrown={state.thrown}
        ordinal={state.throwOrdinal}
        activeId={active}
        onPress={(id) => setState((previous) => toggleDie(previous, id))}
      />
      <Zone
        kind="throw-zone"
        title="In the cup"
        note="the push throws these"
        views={loose}
        layout={layout}
        spots={spots}
        thrown={state.thrown}
        ordinal={state.throwOrdinal}
        activeId={active}
        onPress={(id) => setState((previous) => toggleDie(previous, id))}
      />
    </div>
  );
}

function Sheet({
  state,
  setState,
  renderer,
  onAskForTray,
  onClose,
}: {
  state: AppState;
  setState: (change: Change) => void;
  renderer: RendererState;
  onAskForTray: (wanted: boolean) => void;
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
        {/* The rule set, and every field of it.

            `sheet-ruleset` picks one of the four presets the rules core ships
            and `sheet-overrides` changes any field of the record on top of it.
            Both clear the table: Decision 10 of
            `docs/design/0012-settled-decisions.md` holds the reason, which is
            that a roll on the table was committed to at one price. */}
        <fieldset class="field" data-el="sheet-ruleset">
          <legend>Rule set</legend>
          {PUSH_PROFILES.map((profile) => (
            <label key={profile.id} class="choice">
              <input
                type="radio"
                name="ruleset"
                value={profile.id}
                checked={state.profileId === profile.id}
                onChange={() => setState((previous) => withPreset(previous, profile.id))}
              />
              {profile.label}
            </label>
          ))}
          <p class="sheet-note">{profileOf(state).description}</p>
        </fieldset>
        <OverridePanel
          base={presetOf(state)}
          override={state.override}
          onChange={(next) => setState((previous) => withOverride(previous, next))}
          onReset={() => setState(withoutOverride)}
        />
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
        {/* Both artifact curves ship. On a d12 the escalating curve is worth
            more than the flat one, so this is a real setting and not a
            preference. `specs/0001-rules-model.md` holds both thresholds and
            the rules core scores from them. */}
        <fieldset class="field" data-el="sheet-artifact-curve">
          <legend>Artifact dice</legend>
          {ARTIFACT_CURVE_IDS.map((curve) => (
            <label key={curve} class="choice">
              <input
                type="radio"
                name="artifact-curve"
                value={curve}
                checked={state.artifactCurve === curve}
                onChange={() => setState((previous) => withArtifactCurve(previous, curve))}
              />
              {curve === 'artifactEscalating' ? 'Escalating' : 'Flat'}
            </label>
          ))}
          <p class="sheet-note">{ARTIFACT_CURVE_NOTE[state.artifactCurve]}</p>
        </fieldset>
        {/* The way back from a permanent fall to flat dice, which the plan asks
            Unit 3.7 for. The sheet is a second surface and carries no share of
            the control budget of section 3, so this control costs the screen
            nothing. Decision 8 of `docs/design/0012-settled-decisions.md`
            records it.

            A platform below the bar cannot draw the table whatever the record
            says, so the control is dead there and the note names every reading
            that failed. Every other fall is clearable, and the same switch
            takes the player back to flat dice. */}
        <label class="choice" data-el="sheet-tray-renderer">
          <input
            type="checkbox"
            checked={renderer.choice.renderer === 'tray'}
            disabled={renderer.choice.cause === 'belowTheBar'}
            onChange={(event) => onAskForTray(event.currentTarget.checked)}
          />
          Roll the dice on the table
        </label>
        <p class="sheet-note" data-el="sheet-tray-note">
          {trayNote(renderer.choice)}
        </p>
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
 *
 * `store`, `probe` and `mount` are the three platform readings of Unit 3.7.
 * The screen is the one place that reads the store and writes it, so
 * `src/shell/renderer.ts` stays pure and a test hands over a store, an answer
 * and a mount of its own.
 */
export function App({
  random = cryptoRandom(),
  initial,
  store = localSettingsStore(),
  probe = probeTray,
  mount = mountTray,
}: {
  random?: RandomSource;
  initial?: AppState;
  store?: SettingsStore | null;
  probe?: TrayProbe;
  mount?: TrayMount;
} = {}) {
  // The stored record is read once, and it opens both the rules the screen
  // rolls under and the renderer choice. One read, so the two cannot open under
  // two different records.
  const [stored] = useState<Settings>(() => readSettings(store));
  const [state, setState] = useState<AppState>(() => initial ?? stateFromSettings(stored));
  const [renderer, setRenderer] = useState<RendererState>(() => startRenderer(null, stored));
  // Where the 3D dice landed, so the cells the keyboard reaches lie over them.
  // The flat renderer reads none of it and the record stays empty there.
  const [spots, setSpots] = useState<TraySpots>(NO_SPOTS);
  const dice = throwDice(state);
  const onTheTable = renderer.choice.renderer === 'tray';
  const layout: TrayLayout = onTheTable ? 'over' : 'flat';
  const toggle = useRef<HTMLButtonElement>(null);
  const closeSheet = (): void => {
    setState((previous) => ({ ...previous, sheetOpen: false }));
    toggle.current?.focus();
  };

  // The renderer state is held in a ref beside the hook, because a fall arrives
  // from a callback the mount holds and that callback captured an older render.
  // The write goes here rather than inside the state change, so the change
  // itself stays pure and the store is written exactly once per change.
  const held = useRef(renderer);
  const apply = (change: (previous: RendererState) => RendererState): void => {
    const previous = held.current;
    const next = change(previous);
    held.current = next;
    if (next.settings !== previous.settings) writeSettings(store, next.settings);
    setRenderer(next);
  };

  // The rules the player chose are written to the same record the renderer
  // choice lives in, through the same one writer, so a later fall to flat dice
  // cannot put an older ruleset back.
  //
  // The first run is skipped. The screen writes what the player changed, never
  // what it opened with, so opening the app records nothing.
  const openedWith = useRef(true);
  useEffect(() => {
    if (openedWith.current) {
      openedWith.current = false;
      return;
    }
    apply((previous) => {
      const settings = settingsFromState(previous.settings, state);
      return settings === previous.settings ? previous : { ...previous, settings };
    });
  }, [state.mode, state.profileId, state.artifactCurve, state.override]);

  // The probe runs once, at startup, and the screen draws flat dice until it
  // answers. A probe that answered below the bar records the permanent fall and
  // the notice below says so once. `probeCapability` never throws, so there is
  // no failure path here beyond the answer itself.
  useEffect(() => {
    let live = true;
    void probe().then((decision) => {
      if (live) apply((previous) => withDecision(previous, decision));
    });
    return () => {
      live = false;
    };
  }, []);

  return (
    <div
      class="screen"
      data-renderer={renderer.choice.renderer}
      data-tray-decision={renderer.decision === null ? 'pending' : String(renderer.decision.tray)}
    >
      <StatusLine state={state} dice={dice} />

      <main
        class={onTheTable && !state.builderOpen ? 'shell-m stretch' : 'shell-m'}
        data-el="shell-mid"
      >
        {/* The fall to flat dice, said once.

            The element is in the document from the first paint and carries no
            text, so it is a live region a reader is already watching when the
            fall happens. A region built at the moment it fills is announced by
            some readers and not by others. It is empty until the fall, and CSS
            hides an empty one, so it costs the drawn screen no height.

            It holds no tab stop, so neither keyboard walk of section 6 changes.
            Section 3 lists it under the read-only parts. */}
        <p class="fall-note" data-el="flat-fallback-note" role="status">
          {renderer.noticed ? noticeText(renderer.choice) : ''}
        </p>
        {state.builderOpen ? <Builder state={state} setState={setState} /> : null}
        {/* The dice, in whichever renderer the choice of Unit 3.7 answered.
            The table draws them and the cells lie over it, or the cells draw
            them flat and the table never mounts. The two are one wrapper apart
            so the cells can be positioned against the canvas, and the walk of
            section 6 is the same list either way. Decision 9. */}
        {onTheTable ? (
          <div class="table-wrap">
            <Table
              shown={!state.builderOpen}
              wanted
              state={state}
              mount={mount}
              onFall={() => apply(fallToFlat)}
              onSpots={setSpots}
              onToggle={(id) => setState((previous) => toggleDie(previous, id))}
            />
            {state.result === null ? null : (
              <DiceTray state={state} setState={setState} layout={layout} spots={spots} />
            )}
          </div>
        ) : (
          <>
            {state.result === null ? null : (
              <DiceTray state={state} setState={setState} layout={layout} spots={NO_SPOTS} />
            )}
            <Table
              shown={!state.builderOpen && state.result === null}
              wanted={false}
              state={state}
              mount={mount}
              onFall={() => apply(fallToFlat)}
              onSpots={setSpots}
              onToggle={(id) => setState((previous) => toggleDie(previous, id))}
            />
          </>
        )}
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
          {/* One tap throws the built pool, before a throw and after one.
              After a throw the same tap re-throws the same pool at the same
              difficulty, and `rollNow` asks the core for a first roll, so the
              re-throw starts a roll rather than another generation of the old
              one. The stress counter lives in `counts.stress` and travels with
              it, which is why a push that raised it raises the next throw too.

              **This is the whole difficulty readout of rest B.** The builder
              collapses on a roll, so section 3 of
              `docs/design/0002-screen-design.md` drops `difficulty` and its
              preview sentence from that state and keeps the dice count and the
              difficulty printed here. The value cannot change while the builder
              is collapsed, so what the next throw will take and what the last
              throw took are the same number. Section 8 states that as the
              reason the bonus dice of a +3 are already on the table. */}
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

      {state.sheetOpen ? (
        <Sheet
          state={state}
          setState={setState}
          renderer={renderer}
          onAskForTray={(wanted) => apply((previous) => askForTray(previous, wanted))}
          onClose={closeSheet}
        />
      ) : null}
    </div>
  );
}
