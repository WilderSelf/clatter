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

import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import type { LogEntry } from './log/entry';
import type { Die } from './rules/die';
import type { RandomSource } from './rules/random';
import { cryptoRandom } from './rules/random';
import { PUSH_PROFILES } from './rules/push-profile';
import type { ArtifactCurveId } from './rules/success';
import { ARTIFACT_CURVE_IDS } from './rules/success';
import { localSettingsStore } from './settings/local-store';
import type {
  PoolPreset,
  PresetOutcome,
  PresetRefusal,
  Settings,
  SettingsStore,
} from './settings/settings';
import {
  deletePoolPreset,
  movePoolPreset,
  readSettings,
  savePoolPreset,
  writeSettings,
} from './settings/settings';
import { History, storageLine } from './shell/history';
import { OverridePanel } from './shell/overrides';
import { PresetPanel } from './shell/presets';
import {
  NAME_REFUSALS,
  PRESET_DELETED_TEXT,
  PRESET_MOVED_TEXT,
  PRESET_REFUSAL_TEXT,
  PRESET_SAVED_TEXT,
  UNUSABLE_POOL_TEXT,
} from './shell/presets';
import { canShareFile, downloadBlob, shareFile } from './shell/download';
import type { MadeCard, MakeCardOutcome } from './shell/share-state';
import { makeShareCard } from './shell/share-state';
import {
  CARD_READY_TEXT,
  CARD_SENT_TEXT,
  NO_DOWNLOAD_TEXT,
  SHARE_CANCELLED_TEXT,
  SHARE_REFUSAL_TEXT,
  SHARE_REFUSED_TEXT,
  SharePanel,
} from './shell/share-panel';
import type { OpenRollLogResult, RollLog, RollLogOptions } from './shell/roll-log';
import { openRollLog } from './shell/roll-log';
import type { PerfRecorder } from './shell/perf';
import { createPerfRecorder } from './shell/perf';
import { PerfOverlay } from './shell/overlay';
import type { RendererState } from './shell/renderer';
import { askForTray, fallToFlat, startRenderer, trayNote, withDecision } from './shell/renderer';
import type { Fault } from './shell/faults';
import { faultOf, faultsOf } from './shell/faults';
import { FaultBanner } from './shell/fault-banner';
import type { TrayMount, TraySpots } from './shell/table';
import { NO_SPOTS, Table } from './shell/table';
import type { AppState, DieView, PoolCell } from './shell/state';
import {
  canPush,
  composition,
  costLine,
  dieView,
  difficultyPreview,
  holdsPool,
  nudge,
  poolCountsOf,
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
  tilesFor,
  toggleDie,
  withArtifactCurve,
  withDifficulty,
  withMode,
  withPool,
  withOverride,
  withoutOverride,
  withPreset,
  zonesOf,
} from './shell/state';
import type { BuiltTheme } from './theme/builder';
import type { AppliedTheme } from './theme/css-vars';
import { appliedTheme, dieFaceStyle, themeVariables } from './theme/css-vars';
import type { DiceTheme, ThemeId } from './theme/themes';
import { ThemePanel } from './shell/theme-panel';
import type { TrayDecision } from './tray/capability';
import { decideTray, probeCapability } from './tray/capability';
import { mountTray } from './tray/scene';
import type { SoundEngine } from './tray/sound';
import { createSoundEngine } from './tray/sound';
import type { DiceBox } from './tray/vendor/dice-tray.js';

export type { TrayMount, TraySpots } from './shell/table';

declare global {
  interface Window {
    /**
     * The sound engine, once the screen has built one — Unit 3.6.
     *
     * The tray makes its noise from collisions the physics world reports, and
     * nothing outside a real browser can raise one. This is the seam
     * `node scripts/browser.mjs --sound-controls` reads the output gain and
     * the voice counts through. Nothing in the application reads it, and no
     * check may write one. It follows the same rule as `__clatterTable`.
     */
    __clatterSound?: SoundEngine;
  }
}

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
  colours,
  shaken,
  active,
  onPress,
}: {
  view: DieView;
  layout: TrayLayout;
  spot: TraySpots[string] | undefined;
  colours: DiceTheme;
  shaken: boolean;
  active: boolean;
  onPress: () => void;
}) {
  const over = layout === 'over';
  // The dice axis reaches the flat die here, one body colour per dice type,
  // exactly as `src/tray/throw.ts` reaches the 3D die. The cell over the table
  // draws no die, so the colour costs it nothing.
  const style = [over ? overStyle(spot) : null, dieFaceStyle(colours, view.die.type)]
    .filter((part) => part !== null && part !== undefined)
    .join(';');
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
        style={style}
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
      style={style}
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
  colours,
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
  colours: DiceTheme;
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
            colours={colours}
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
  colours,
}: {
  state: AppState;
  setState: (change: Change) => void;
  layout: TrayLayout;
  spots: TraySpots;
  colours: DiceTheme;
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
        colours={colours}
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
        colours={colours}
        thrown={state.thrown}
        ordinal={state.throwOrdinal}
        activeId={active}
        onPress={(id) => setState((previous) => toggleDie(previous, id))}
      />
    </div>
  );
}

/** What the last preset operation answered, and which refusal it was. */
interface PresetNote {
  readonly text: string;
  readonly reason: PresetRefusal | null;
}

const NO_PRESET_NOTE: PresetNote = { text: '', reason: null };

/**
 * How far one arrow press moves the volume.
 *
 * Twenty steps over the range, so the keyboard reaches a level in a few presses
 * and every step is a level a player can tell from the one beside it.
 */
const SOUND_VOLUME_STEP = 0.05;

/**
 * The sound controls — Unit 3.6, the interface half.
 *
 * Two controls, both native. A checkbox carries a role, a name and a checked
 * state without a line of script, and a range input carries a role, a name and
 * a value the arrow keys change. Decision 17 records why they live on the sheet
 * and not on the main screen.
 *
 * The volume stays reachable while sound is off, so a player can set the level
 * before making any noise at all. It is marked `aria-disabled` rather than
 * disabled, because a disabled control leaves the keyboard order and a reader
 * then cannot find the thing the toggle above it is about to switch on.
 */
/** What the sheet says where the browser gives no audio at all. */
export const NO_AUDIO_TEXT = 'This browser makes no sound. The dice are silent here.';

/**
 * Build the audio graph, and answer whether the browser gave one.
 *
 * `enable` constructs an `AudioContext`, which a browser without the Web Audio
 * API does not have. The failure lands inside the press that asked for sound,
 * so it is caught here and answered in words rather than left to break the
 * sheet. Nothing else is caught: a browser that HAS audio and refuses a node is
 * a fault this application would rather see.
 */
function startSound(engine: SoundEngine): boolean {
  try {
    engine.enable();
    return engine.context !== null;
  } catch {
    return false;
  }
}

/** What it says the rest of the time. Sound is made, never fetched. */
export const SOUND_NOTE_TEXT =
  'Every sound is made in the browser. This application holds no sound file.';

function SoundPanel({
  enabled,
  volume,
  note,
  onEnabled,
  onVolume,
}: {
  enabled: boolean;
  volume: number;
  note: string;
  onEnabled: (on: boolean) => void;
  onVolume: (level: number) => void;
}) {
  const percent = Math.round(volume * 100);
  return (
    <fieldset class="field" data-el="sheet-sound">
      <legend>Sound</legend>
      <label class="choice" data-el="sheet-sound-toggle-row">
        <input
          type="checkbox"
          data-el="sheet-sound-toggle"
          checked={enabled}
          onChange={(event) => onEnabled(event.currentTarget.checked)}
        />
        The dice make a sound
      </label>
      <label class="choice range" data-el="sheet-sound-volume-row">
        <span>Volume</span>
        {/* The name is written on the control rather than taken from the label
            around it, because that label also holds the reading below and a
            reader would then announce the level twice. The word on the screen
            and the accessible name are the same word, which WCAG 2.2 SC 2.5.3
            asks for. */}
        <input
          type="range"
          data-el="sheet-sound-volume"
          aria-label="Volume"
          min={0}
          max={1}
          step={SOUND_VOLUME_STEP}
          value={volume}
          aria-valuetext={`${percent} per cent`}
          aria-disabled={!enabled}
          onInput={(event) => onVolume(Number(event.currentTarget.value))}
        />
        {/* The same state the control already carries in `aria-valuetext`, for
            an eye rather than for a reader. */}
        <output data-el="sheet-sound-level" aria-hidden="true">
          {percent} per cent
        </output>
      </label>
      <p class="sheet-note" data-el="sheet-sound-note">
        {note}
      </p>
    </fieldset>
  );
}

/** Everything `sheet-share` needs, gathered so the sheet takes one prop for it. */
interface ShareControls {
  readonly made: MadeCard | null;
  readonly canSend: boolean;
  readonly note: string;
  readonly busy: boolean;
  readonly onMake: () => void;
  readonly onDownload: () => void;
  readonly onSend: () => void;
}

function Sheet({
  state,
  setState,
  renderer,
  applied,
  presetNote,
  share,
  sound,
  overlayOn,
  storage,
  onShowOverlay,
  onSavePreset,
  onRecallPreset,
  onMovePreset,
  onDeletePreset,
  onAskForTray,
  onChooseRow,
  onBuildTheme,
  onOpenHistory,
  onClose,
}: {
  state: AppState;
  setState: (change: Change) => void;
  renderer: RendererState;
  applied: AppliedTheme;
  presetNote: PresetNote;
  share: ShareControls;
  /** The stored sound choice, and the two calls that change it — Unit 3.6. */
  sound: {
    enabled: boolean;
    volume: number;
    note: string;
    onEnabled: (on: boolean) => void;
    onVolume: (level: number) => void;
  };
  /** True while the performance overlay is on the screen — Unit 3.8. */
  overlayOn: boolean;
  /** What the browser reports the origin uses, or null where it reports none. */
  storage: { usage: number | null; quota: number | null } | null;
  onShowOverlay: (on: boolean) => void;
  onSavePreset: (name: string) => boolean;
  onRecallPreset: (preset: PoolPreset) => void;
  onMovePreset: (preset: PoolPreset, toIndex: number) => void;
  onDeletePreset: (preset: PoolPreset) => void;
  onAskForTray: (wanted: boolean) => void;
  onChooseRow: (axis: 'interface' | 'surface' | 'dice', id: ThemeId) => void;
  onBuildTheme: (built: BuiltTheme | null) => void;
  onOpenHistory: () => void;
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
        {/* The saved pools.

            A recall writes over every tile of the built pool, which is the
            hazard the mode switch sits here for, so the list sits here beside
            it. Decision 11 of `docs/design/0012-settled-decisions.md` records
            the choice and prices it: the sheet is a second surface, so section
            3 still spends five controls at each rest state. */}
        <PresetPanel
          mode={state.mode}
          presets={renderer.settings.poolPresets}
          note={presetNote.text}
          invalid={presetNote.reason !== null && NAME_REFUSALS.includes(presetNote.reason)}
          isCurrent={(preset) => holdsPool(state, preset.counts)}
          onSave={onSavePreset}
          onRecall={onRecallPreset}
          onMove={onMovePreset}
          onDelete={onDeletePreset}
        />
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
        {/* The theme, on three independent axes, plus the colour builder.

            Section 4 of `docs/design/0002-screen-design.md` names it against
            Unit 4.8. The sheet is a second surface and carries no share of the
            control budget of section 3, and none of the three groups holds a
            tab stop of the main screen, so both keyboard walks of section 6 are
            unchanged. */}
        <ThemePanel
          applied={applied}
          diceThemeId={renderer.settings.diceThemeId}
          traySurfaceId={renderer.settings.traySurfaceId}
          interfacePaletteId={renderer.settings.interfacePaletteId}
          builtTheme={renderer.settings.builtTheme}
          onChooseRow={onChooseRow}
          onBuild={onBuildTheme}
        />
        {/* The history, and what it costs the browser to keep.

            `sheet-history` opens the history destination. Section 4 of
            `docs/design/0002-screen-design.md` names it against Units 4.4 to
            4.7, and section 3 puts the log, its statistics and its export
            there and not here.

            The storage reading beside it is `estimateStorage` from
            `src/log/store.ts`, which the plan asks this unit to show in
            settings. It carries no tab stop, so it is one of the read-only
            parts of section 3, and it is a live region because the number
            arrives after the sheet is drawn. */}
        <button class="btn" type="button" data-el="sheet-history" onClick={onOpenHistory}>
          Open the history
        </button>
        <p class="sheet-note" data-el="sheet-storage-estimate" role="status">
          {storageLine(storage)}
        </p>
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
        {/* The sound — Unit 3.6.

            It sits under the renderer toggle because the sound is made by the
            collisions of the table, and the flat dice make none. Decision 17
            of `docs/design/0012-settled-decisions.md` records the choice, and
            section 4 of `docs/design/0002-screen-design.md` lists both
            controls. The sheet is a second surface, so the control budget of
            section 3 and both keyboard walks of section 6 are untouched. */}
        <SoundPanel
          enabled={sound.enabled}
          volume={sound.volume}
          note={sound.note}
          onEnabled={sound.onEnabled}
          onVolume={sound.onVolume}
        />
        {/* The share card — Unit 4.9.

            Decision 16 of `docs/design/0012-settled-decisions.md` puts it here
            and section 4 of `docs/design/0002-screen-design.md` lists it. The
            sheet is a second surface, so the control budget of section 3 and
            both keyboard walks of section 6 are untouched.

            It sits under the renderer toggle on purpose: a card is a picture
            of the table, and the refusal a player meets on the flat dice
            points at the control just above it. */}
        <SharePanel
          made={share.made}
          canSend={share.canSend}
          note={share.note}
          busy={share.busy}
          onMake={share.onMake}
          onDownload={share.onDownload}
          onSend={share.onSend}
        />
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
        {/* The performance overlay — Unit 3.8, the overlay half.

            It is the last row of the sheet because it is a reading and not a
            choice: it changes nothing about the dice, the rules or the look.
            Decision 18 of `docs/design/0012-settled-decisions.md` records why
            the switch lives here, why the reading is not stored, and why the
            overlay reports rather than gates. The panel it draws holds no tab
            stop, so both keyboard walks of section 6 are unchanged. */}
        <label class="choice" data-el="sheet-overlay">
          <input
            type="checkbox"
            data-el="sheet-overlay-toggle"
            checked={overlayOn}
            onChange={(event) => onShowOverlay(event.currentTarget.checked)}
          />
          Show the performance readings
        </label>
        <p class="sheet-note" data-el="sheet-overlay-note">
          The readings measure this device. They are reported and never judged.
        </p>
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
/**
 * Which fault each refusal of the log raises — Unit 4.10.
 *
 * `src/log/store.ts` answers the three apart on purpose, because a browser that
 * refuses a database at all, a second tab holding it, and a fault of the
 * database itself need different words and different routes back. The words
 * live in `src/shell/faults.ts` and are not restated here.
 */
const LOG_OPEN_FAULT = {
  refused: 'log-refused',
  blocked: 'log-blocked',
  error: 'log-error',
} as const;

export function App({
  random = cryptoRandom(),
  initial,
  store = localSettingsStore(),
  probe = probeTray,
  mount = mountTray,
  makeCard = makeShareCard,
  sound: soundEngine,
  log: logOptions,
}: {
  random?: RandomSource;
  initial?: AppState;
  store?: SettingsStore | null;
  probe?: TrayProbe;
  mount?: TrayMount;
  /**
   * How one share card is made — Unit 4.9.
   *
   * It is injected for the same reason the mount and the probe are: a card is
   * drawn through a real WebGL renderer onto a real canvas, and jsdom holds
   * neither. `node scripts/browser.mjs --share` measures the pixels, and a
   * test hands over a card of its own to drive the two ways out of the panel.
   */
  makeCard?: typeof makeShareCard;
  /**
   * The sound engine — Unit 3.6.
   *
   * It is injected for the same reason the mount and the probe are: the engine
   * builds a real `AudioContext`, and jsdom has none. A test hands over an
   * engine built on a context of its own and then reads the level off the gain
   * node that engine really made. `node scripts/browser.mjs --sound-controls`
   * drives the shipped one through the browser's own audio.
   */
  sound?: SoundEngine;
  /**
   * How the roll log is opened. A test hands over its own database name, its
   * own clock and its own roll names, so a run is repeatable and two runs do
   * not share a log.
   */
  log?: RollLogOptions;
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
  // What the last preset operation answered. It is empty until the player
  // presses something in the panel.
  const [presetNote, setPresetNote] = useState<PresetNote>(NO_PRESET_NOTE);
  // ---- The share card — Unit 4.9 ----
  //
  // The tray itself, because a card is one fresh frame drawn through the
  // renderer and copied in the same task. It is a ref and not a hook state: it
  // arrives from a mount callback, nothing on the screen is drawn from it, and
  // a render of the whole application on every mount would buy nothing.
  const trayBox = useRef<DiceBox | null>(null);
  const [madeCard, setMadeCard] = useState<MadeCard | null>(null);
  const [shareNote, setShareNote] = useState('');
  const [shareBusy, setShareBusy] = useState(false);
  // ---- The roll log — Unit 4.4 ----
  //
  // The history is a separate destination, so `historyOpen` is a route and not
  // a panel: it REPLACES the roll flow. Both keyboard walks of section 6 are
  // walks of the roll flow at rest, so neither of them changes.
  const [historyOpen, setHistoryOpen] = useState(false);
  const [rolls, setRolls] = useState<readonly LogEntry[]>([]);
  const [storage, setStorage] = useState<{ usage: number | null; quota: number | null } | null>(
    null,
  );
  // ---- The faults the player is shown — Unit 4.10 ----
  //
  // One state per slot of the banner. The table slot is derived from the
  // renderer state instead, because "says so once" already lives there and a
  // second copy of it would fall out of step with the first.
  const [logFault, setLogFault] = useState<Fault | null>(null);
  const [importFault, setImportFault] = useState<Fault | null>(null);
  // ---- The sound — Unit 3.6, the interface half ----
  //
  // One engine for the life of the screen. It is built from the stored record
  // and it builds NOTHING of its own until the player asks for sound:
  // `createSoundEngine` constructs no `AudioContext` at all here, and `enable`
  // is what builds one. The engine is a ref because the tray calls it from a
  // collision callback and nothing on the screen is drawn from it.
  const sound = useRef<SoundEngine | null>(null);
  if (sound.current === null) {
    sound.current =
      soundEngine ??
      createSoundEngine({
        enabled: stored.soundEnabled,
        volume: stored.soundVolume,
      });
  }
  const [soundNote, setSoundNote] = useState(SOUND_NOTE_TEXT);
  // ---- The performance overlay — Unit 3.8, the overlay half ----
  //
  // The instrument exists only while the overlay is on the screen, so a player
  // who never opens it pays for no frame callback and no observer. A fresh
  // recorder each time is also what makes the sample counts honest: the
  // figures belong to this sitting, not to a session that has been idling.
  const perf = useRef<PerfRecorder | null>(null);
  const [overlayOn, setOverlayOn] = useState(false);
  const showOverlay = (on: boolean): void => {
    perf.current = on ? createPerfRecorder() : null;
    setOverlayOn(on);
  };
  const dice = throwDice(state);
  // ---- The theme — Unit 4.8 ----
  //
  // The colours in force, read off the same record every other choice lives in.
  // A built theme replaces the dice row and the interface row; the tray surface
  // stays a shipped row, and `src/theme/css-vars.ts` says why.
  const applied = appliedTheme(renderer.settings);
  const onTheTable = renderer.choice.renderer === 'tray';
  const layout: TrayLayout = onTheTable ? 'over' : 'flat';
  const toggle = useRef<HTMLButtonElement>(null);
  const closeSheet = (): void => {
    setState((previous) => ({ ...previous, sheetOpen: false }));
    // The note belongs to the visit that produced it. A refusal left standing
    // would greet the next opening of the sheet with an old complaint.
    setPresetNote(NO_PRESET_NOTE);
    toggle.current?.focus();
  };

  // The renderer state is held in a ref beside the hook, because a fall arrives
  // from a callback the mount holds and that callback captured an older render.
  // The write goes here rather than inside the state change, so the change
  // itself stays pure and the store is written exactly once per change.
  // The stylesheet holds no colour of its own, so the roles are written here.
  // It is a layout effect and not an effect, because a paint between the render
  // and the write would draw the page in the theme it was leaving. The write is
  // property by property, so no text is parsed on the way in.
  useLayoutEffect(() => {
    const root = document.documentElement;
    for (const [role, colour] of Object.entries(themeVariables(applied))) {
      root.style.setProperty(role, colour);
    }
  }, [
    renderer.settings.diceThemeId,
    renderer.settings.traySurfaceId,
    renderer.settings.interfacePaletteId,
    renderer.settings.builtTheme,
  ]);

  const held = useRef(renderer);
  const apply = (change: (previous: RendererState) => RendererState): void => {
    const previous = held.current;
    const next = change(previous);
    held.current = next;
    if (next.settings !== previous.settings) writeSettings(store, next.settings);
    setRenderer(next);
  };

  /**
   * Choose a row on one axis.
   *
   * The write goes through the one writer, so the record the renderer choice
   * lives in is the record the theme lives in and a later fall to flat dice
   * cannot put an older theme back. Choosing a row does not clear a theme the
   * player built: the rows stay chosen underneath it, and `theme-clear` is what
   * returns to them.
   */
  const chooseThemeRow = (axis: 'interface' | 'surface' | 'dice', id: ThemeId): void => {
    const field =
      axis === 'interface'
        ? 'interfacePaletteId'
        : axis === 'surface'
          ? 'traySurfaceId'
          : 'diceThemeId';
    apply((previous) => ({ ...previous, settings: { ...previous.settings, [field]: id } }));
  };

  /** Put a built theme on the screen, or take it off. */
  const buildThemeNow = (built: BuiltTheme | null): void => {
    apply((previous) => ({ ...previous, settings: { ...previous.settings, builtTheme: built } }));
  };

  // ---- The sound — Unit 3.6 ----
  //
  // A record that already holds sound builds the context once, at the first
  // render, so the first collision of the session does not have to build one
  // inside the frame it is heard in. The context is born suspended either way.
  // Nothing here resumes it: a gesture does, and `threw` below is that gesture.
  useEffect(() => {
    const engine = sound.current;
    if (engine === null) return;
    if (held.current.settings.soundEnabled && !startSound(engine)) {
      setSoundNote(NO_AUDIO_TEXT);
    }
    // The one seam an outside instrument reads the sound through. A WebGL tray
    // makes its noise from collisions no test can raise by hand, so
    // `node scripts/browser.mjs --sound-controls` reads the gain off this
    // engine's real `GainNode` and counts the voices through the browser's own
    // `AudioContext`. Nothing in the application reads this field.
    window.__clatterSound = engine;
    return () => {
      window.__clatterSound = undefined;
    };
  }, []);

  /**
   * Turn sound on, or off.
   *
   * The record is written through the one writer, so the choice lives beside
   * the renderer choice and the theme. Turning it on RESUMES the context here:
   * this call runs inside the press that turned it on, which is the user
   * gesture a browser needs before it will start an audio clock.
   */
  const setSoundEnabled = (on: boolean): void => {
    const engine = sound.current;
    let started = on;
    if (engine !== null) {
      if (on) {
        started = startSound(engine);
        if (started) void engine.resume();
      } else {
        engine.disable();
      }
    }
    setSoundNote(on && !started ? NO_AUDIO_TEXT : SOUND_NOTE_TEXT);
    apply((previous) => ({
      ...previous,
      settings: { ...previous.settings, soundEnabled: started },
    }));
  };

  /** Set the level. It reaches the output gain at once, and the record too. */
  const setSoundVolume = (level: number): void => {
    sound.current?.setVolume(level);
    apply((previous) => ({
      ...previous,
      settings: { ...previous.settings, soundVolume: level },
    }));
  };

  /**
   * The press that threw, in both instruments that can make one.
   *
   * Two things ride on it. The overlay's measurement window opens at the press
   * itself and not at the render that follows it, so the whole cost of a throw
   * lies inside the reading — `event.timeStamp` is the instant the browser
   * received the press, before any handler of this application ran. And a
   * suspended audio clock starts here, because a press is a user gesture and
   * `resume` needs one.
   */
  const threw = (at: number): void => {
    perf.current?.pressed(at);
    const engine = sound.current;
    if (engine?.enabled === true) void engine.resume();
  };

  // ---- The saved pools — Unit 4.3 ----
  //
  // Every operation reads the record out of the ref rather than out of the
  // render that drew the row. Two presses inside one frame are one frame apart
  // for the player and zero renders apart for the shell, so a delete pressed
  // twice reads a list the first press already changed and the store answers
  // `noSuchPreset`. Reading the render would have deleted a second preset or
  // done nothing at all, and neither would have told the player.
  const runPreset = (operate: (settings: Settings) => PresetOutcome, done: string): boolean => {
    const outcome = operate(held.current.settings);
    if (outcome.kind === 'refused') {
      setPresetNote({ text: PRESET_REFUSAL_TEXT[outcome.reason], reason: outcome.reason });
      return false;
    }
    apply((previous) => ({ ...previous, settings: outcome.settings }));
    setPresetNote({ text: done, reason: null });
    return true;
  };

  /**
   * Recall a saved pool.
   *
   * The sheet closes and the builder opens, because the player has to see the
   * pool that arrived. The table is left where it lies: a pool decides what the
   * next throw takes and prices no roll already thrown. Decision 11.
   */
  const recallPreset = (preset: PoolPreset): void => {
    const tiles = tilesFor(preset.counts);
    if (tiles === null) {
      setPresetNote({ text: UNUSABLE_POOL_TEXT, reason: null });
      return;
    }
    setState((previous) => withPool(previous, tiles));
    setPresetNote(NO_PRESET_NOTE);
    closeSheet();
  };

  // ---- The share card — Unit 4.9 ----
  //
  // **A card belongs to the roll it was made from.** Any change of the dice —
  // a throw, a push, or a die the player keeps or releases — makes a new roll
  // of the table, so the card and its preview go and the player makes another.
  // A card left standing would be saved under readings the table no longer
  // holds.
  useEffect(() => {
    setMadeCard(null);
    setShareNote('');
  }, [state.result]);

  /**
   * Make one card.
   *
   * The whole act is `makeShareCard`: it reads the roll, draws one fresh frame
   * through the tray and lays the summary over it inside the same task. A
   * refusal is a sentence that names the thing the player has to change.
   */
  const runMakeCard = (): void => {
    setShareBusy(true);
    setShareNote('');
    try {
      const outcome: MakeCardOutcome = makeCard({
        state,
        box: onTheTable ? trayBox.current : null,
        palette: applied.palette,
        traySurface: applied.traySurfaceColour,
        at: new Date(),
      });
      if (outcome.kind === 'refused') {
        setMadeCard(null);
        setShareNote(SHARE_REFUSAL_TEXT[outcome.reason]);
        return;
      }
      setMadeCard(outcome.card);
      setShareNote(CARD_READY_TEXT);
    } catch (error) {
      setMadeCard(null);
      setShareNote(
        `The card was not made. ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setShareBusy(false);
    }
  };

  /** Save the card. The anchor download of Unit 4.5, over the same bytes. */
  const runDownloadCard = (): void => {
    if (madeCard === null) return;
    const offered = downloadBlob(madeCard.file, madeCard.filename, document);
    setShareNote(offered ? `The card went to ${madeCard.filename}.` : NO_DOWNLOAD_TEXT);
  };

  /**
   * Hand the card to the browser's own share target.
   *
   * The control is drawn only where the browser offers to share this very
   * file, so this runs where a target exists. A player who closes the share
   * sheet is answered apart from a browser that refused the file.
   */
  const runSendCard = (): void => {
    if (madeCard === null) return;
    setShareBusy(true);
    void shareFile(navigator, madeCard.file, madeCard.alt)
      .then((outcome) => {
        setShareNote(
          outcome === 'shared'
            ? CARD_SENT_TEXT
            : outcome === 'cancelled'
              ? SHARE_CANCELLED_TEXT
              : SHARE_REFUSED_TEXT,
        );
      })
      .finally(() => setShareBusy(false));
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

  // ---- The roll log — Unit 4.4 ----
  //
  // The log is opened once and held in a ref, because a throw arrives from a
  // callback and never from a render. The open is asynchronous, so what is held
  // is the PROMISE of it: a roll thrown in the first frames would otherwise
  // reach a log that is not open yet and be lost, and losing the first roll of
  // a session is exactly the failure this unit exists to prevent.
  const rollLog = useRef<Promise<RollLog | null> | null>(null);
  if (rollLog.current === null) {
    rollLog.current = openRollLog(logOptions).then((opened: OpenRollLogResult) => {
      if (opened.kind === 'open') return opened.log;
      setLogFault(faultOf(LOG_OPEN_FAULT[opened.kind]));
      return null;
    });
  }
  useEffect(() => {
    return () => {
      void rollLog.current?.then((held) => held?.close());
    };
  }, []);

  // Every throw reaches the log, and every throw reaches it through the same
  // call. `record` decides which of the two writes it is: a roll opens an entry
  // and a push rewrites that same entry, which `src/shell/roll-log.ts` states
  // and which the shape of `LogEntry` requires.
  //
  // The ordinal is the trigger, because it counts a roll and a push alike and
  // nothing else moves it. The state read here is the state the throw produced.
  const loggedOrdinal = useRef(state.throwOrdinal);
  useEffect(() => {
    if (state.throwOrdinal === loggedOrdinal.current) return;
    loggedOrdinal.current = state.throwOrdinal;
    const thrown = state;
    void rollLog.current?.then(async (held) => {
      if (held === null) return;
      const outcome = await held.record(thrown);
      // A write that lands clears the fault the write before it raised. The
      // state is read after the recovery and never before it, so a full disk
      // the player made room on stops being reported.
      if (outcome.kind === 'full') setLogFault(faultOf('log-full'));
      else if (outcome.kind === 'error') setLogFault(faultOf('log-error'));
      else if (outcome.kind === 'wrote' || outcome.kind === 'rewrote') setLogFault(null);
    });
  }, [state.throwOrdinal]);

  /**
   * Open the history.
   *
   * The rolls are read out of the store every time, never out of a copy the
   * screen kept, so the list the player reads is the log the store holds.
   */
  const openHistory = (): void => {
    setState((previous) => ({ ...previous, sheetOpen: false }));
    setHistoryOpen(true);
    void rollLog.current?.then(async (held) => {
      if (held === null) return;
      setRolls(await held.rolls());
    });
  };

  /**
   * Put an imported log in place of the stored one — Unit 4.6.
   *
   * The store belongs to the application, so the destination hands the rolls
   * over rather than opening a second connection. The list is read back OUT OF
   * THE STORE afterwards and never out of the rolls that went in, so what the
   * player sees is the log the database holds.
   */
  const importLog = async (imported: readonly LogEntry[]): Promise<boolean> => {
    const held = await rollLog.current;
    if (held === null) {
      setLogFault(faultOf('log-error'));
      return false;
    }
    const written = await held.replace(imported);
    if (written.kind !== 'written') {
      setLogFault(faultOf(written.kind === 'full' ? 'log-full' : 'log-error'));
      return false;
    }
    setLogFault(null);
    setRolls(await held.rolls());
    return true;
  };

  // The focus on the way back from the history.
  //
  // It is an effect and not a line inside the handler, because the roll flow is
  // NOT in the document when the handler runs: the destination replaces it, so
  // the ref to `disclosure-toggle` is empty until the roll flow is drawn again.
  const cameFromHistory = useRef(false);
  useEffect(() => {
    if (historyOpen) {
      cameFromHistory.current = true;
      return;
    }
    if (!cameFromHistory.current) return;
    cameFromHistory.current = false;
    toggle.current?.focus();
  }, [historyOpen]);

  // The storage reading the sheet prints. It is read when the sheet opens, so
  // the number follows the log rather than the first paint.
  useEffect(() => {
    if (!state.sheetOpen) return;
    void rollLog.current?.then(async (held) => {
      if (held === null) return;
      setStorage(await held.storage());
    });
  }, [state.sheetOpen]);

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

  // ---- The faults, one entry per slot — Unit 4.10 ----
  //
  // The table slot is read off the renderer state, because "says so once" is
  // tied to the fall itself and lives there. A settings store the browser
  // refused is the record this screen opened with, so it holds for the whole
  // session and is derived rather than raised.
  //
  // The same list is drawn on the roll flow and in the history destination. The
  // destination REPLACES the roll flow, so a fault raised in one of them must
  // still be readable in the other, and one list is what makes that true.
  const drawn = faultsOf({
    table: renderer.noticed ? renderer.choice.cause : null,
    log: logFault,
    imported: importFault,
    settingsRefused: store === null,
  });

  // The history is a SEPARATE DESTINATION, so it replaces the roll flow rather
  // than covering it. Section 3 of `docs/design/0002-screen-design.md` says so,
  // and Decision 3 of `docs/design/0012-settled-decisions.md` settles it: the
  // player visits the history rarely and never in the middle of a decision.
  //
  // Because the roll flow leaves the document, it holds no control while the
  // history is open, and neither keyboard walk of section 6 can change.
  if (historyOpen) {
    return (
      <History
        entries={rolls}
        drawn={drawn}
        onFault={setImportFault}
        // The disclosure is the way back in, so the focus returns to the
        // control that led here. The effect above moves it, because the roll
        // flow is not in the document yet at this point.
        onBack={() => setHistoryOpen(false)}
        onImport={importLog}
      />
    );
  }

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
        {/* Every fault the player is shown — Unit 4.10, Decision 19.

            One row per slot, all four in the document from the first paint and
            all four empty until something fails. A live region built at the
            moment it fills is announced by some readers and not by others, and
            CSS hides an empty row, so the drawn screen is unchanged while
            nothing has failed. The fall to flat dice is the first row and keeps
            the name Unit 3.7 gave it.

            The banner holds no tab stop, so neither keyboard walk of section 6
            changes. Section 3 lists it under the read-only parts. */}
        <FaultBanner drawn={drawn} />
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
              onBox={(box) => {
                trayBox.current = box;
              }}
              colours={applied.diceColours}
              onToggle={(id) => setState((previous) => toggleDie(previous, id))}
              onImpact={(impact) => sound.current?.impact(impact)}
              onMotion={(at, evidence) => perf.current?.motion(at, evidence)}
              onSettled={(at) => perf.current?.settled(at)}
            />
            {state.result === null ? null : (
              <DiceTray
                state={state}
                setState={setState}
                layout={layout}
                spots={spots}
                colours={applied.diceColours}
              />
            )}
          </div>
        ) : (
          <>
            {state.result === null ? null : (
              <DiceTray
                state={state}
                setState={setState}
                layout={layout}
                spots={NO_SPOTS}
                colours={applied.diceColours}
              />
            )}
            <Table
              shown={!state.builderOpen && state.result === null}
              wanted={false}
              state={state}
              mount={mount}
              onFall={() => apply(fallToFlat)}
              onSpots={setSpots}
              colours={applied.diceColours}
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
            onClick={(event) => {
              threw(event.timeStamp);
              setState((previous) => rollNow(previous, random));
            }}
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
              onClick={(event) => {
                threw(event.timeStamp);
                setState((previous) => pushNow(previous, random));
              }}
            >
              Push
              <small>{pushNote(state)}</small>
            </button>
          )}
        </div>
      </div>

      {/* The performance overlay — Unit 3.8.

          It is drawn over the screen rather than inside the middle region,
          because the middle scrolls and a reading the owner is photographing
          must not scroll away from the dice it belongs to. It takes no pointer
          events, so it can never swallow a tap on a control under it, and it
          holds no tab stop, so both keyboard walks of section 6 are unchanged.
          It is a named region, so a reader reaches it by landmark. */}
      {overlayOn && perf.current !== null ? (
        <PerfOverlay recorder={perf.current} onTheTable={onTheTable} />
      ) : null}

      {state.sheetOpen ? (
        <Sheet
          state={state}
          setState={setState}
          renderer={renderer}
          applied={applied}
          presetNote={presetNote}
          share={{
            made: madeCard,
            // The browser's own answer about this very file. Where it says no,
            // the send control is absent, and that absence is not a failure.
            canSend: madeCard !== null && canShareFile(navigator, madeCard.file),
            note: shareNote,
            busy: shareBusy,
            onMake: runMakeCard,
            onDownload: runDownloadCard,
            onSend: runSendCard,
          }}
          sound={{
            enabled: renderer.settings.soundEnabled,
            volume: renderer.settings.soundVolume,
            note: soundNote,
            onEnabled: setSoundEnabled,
            onVolume: setSoundVolume,
          }}
          overlayOn={overlayOn}
          onShowOverlay={showOverlay}
          storage={storage}
          onSavePreset={(name) =>
            runPreset(
              (settings) => savePoolPreset(settings, name, poolCountsOf(state)),
              PRESET_SAVED_TEXT,
            )
          }
          onRecallPreset={recallPreset}
          onMovePreset={(preset, toIndex) =>
            runPreset(
              (settings) => movePoolPreset(settings, preset.name, toIndex),
              PRESET_MOVED_TEXT,
            )
          }
          onDeletePreset={(preset) =>
            runPreset((settings) => deletePoolPreset(settings, preset.name), PRESET_DELETED_TEXT)
          }
          onAskForTray={(wanted) => apply((previous) => askForTray(previous, wanted))}
          onChooseRow={chooseThemeRow}
          onBuildTheme={buildThemeNow}
          onOpenHistory={openHistory}
          onClose={closeSheet}
        />
      ) : null}
    </div>
  );
}
