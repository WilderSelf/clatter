// Which renderer draws the dice, and the permanent fall to flat dice.
//
// Pure. No browser API is named here and no module-level value changes, so the
// whole choice runs under a plain test runner. `src/tray/capability.ts` reads
// the platform and `decideTray` answers over that reading alone. This file
// takes that answer, adds the stored record of an earlier fall, and says which
// renderer draws the dice. `src/app.tsx` does the reading and the writing.
//
// Three events reach `fallToFlat`, and every one of them is permanent:
//   1. The lazy 3D chunk does not arrive, so the table cannot mount.
//   2. The canvas loses its WebGL context.
//   3. The player switches the table off.
// A probe below the bar reaches it through `withDecision`, which is the fourth
// route and the one the plan names first.
//
// The fall is permanent because a fall that healed by itself would put a player
// back on a black canvas at the next throw. The one way back is the settings
// toggle, which is `askForTray`.

import type { Settings } from '../settings/settings';
import type { FallReason, TrayDecision } from '../tray/capability';

/** The two renderers. The flat dice of Unit 2.2 are the fallback. */
export type RendererId = 'tray' | 'flat';

/**
 * Why the dice are flat.
 *
 * `notProbed` is the state the screen opens in, before the startup probe has
 * answered. `belowTheBar` names a platform that cannot draw the table at all,
 * so the toggle back is refused there. `recordedFall` names every other fall,
 * and the toggle back clears it.
 */
export type FlatCause = 'notProbed' | 'belowTheBar' | 'recordedFall';

export interface RendererChoice {
  readonly renderer: RendererId;
  /** Null while the table runs. One cause otherwise. */
  readonly cause: FlatCause | null;
  /** The readings below the bar, in the order `decideTray` names them. */
  readonly reasons: readonly FallReason[];
}

/**
 * The choice, from the probe and the stored record alone.
 *
 * A decision of `null` is a probe that has not answered yet. The screen draws
 * flat dice there and writes nothing, because a fall recorded before the probe
 * answered would be a fall nothing measured.
 *
 * **The platform is read before the record.** Both can hold at once: a probe
 * below the bar records the fall as well. The platform limit is the useful
 * answer of the two, because it is the one the toggle back cannot clear.
 */
export function chooseRenderer(decision: TrayDecision | null, settings: Settings): RendererChoice {
  if (decision === null) {
    return { renderer: 'flat', cause: 'notProbed', reasons: [] };
  }
  if (!decision.tray) {
    return { renderer: 'flat', cause: 'belowTheBar', reasons: decision.reasons };
  }
  if (settings.flatFallback) {
    return { renderer: 'flat', cause: 'recordedFall', reasons: decision.reasons };
  }
  return { renderer: 'tray', cause: null, reasons: [] };
}

export interface RendererState {
  /** The probe's answer, or null before it answers. */
  readonly decision: TrayDecision | null;
  /** The settings record as it now stands. The caller writes it to the store. */
  readonly settings: Settings;
  readonly choice: RendererChoice;
  /**
   * True while the one-time notice is on the screen.
   *
   * It is set by the fall itself and never by the state that follows it, so a
   * player who already fell in an earlier session is not told again. That is
   * the whole of "says so once".
   */
  readonly noticed: boolean;
}

/** The state the screen opens in. It notices nothing and it writes nothing. */
export function startRenderer(decision: TrayDecision | null, settings: Settings): RendererState {
  return { decision, settings, choice: chooseRenderer(decision, settings), noticed: false };
}

/**
 * Fall to flat dice, and say so once.
 *
 * A record that already holds the fall is not written again and the player is
 * not told again, so a second lost context is silent. The caller compares
 * `settings` against the record it passed in and writes only a record that
 * changed.
 */
export function fallToFlat(state: RendererState): RendererState {
  if (state.settings.flatFallback) {
    return { ...state, choice: chooseRenderer(state.decision, state.settings) };
  }
  const settings: Settings = { ...state.settings, flatFallback: true };
  return {
    decision: state.decision,
    settings,
    choice: chooseRenderer(state.decision, settings),
    noticed: true,
  };
}

/**
 * Take the probe's answer.
 *
 * Below the bar this is a fall, so it records the flag and tells the player
 * once, exactly as a lost context does.
 */
export function withDecision(state: RendererState, decision: TrayDecision): RendererState {
  const probed: RendererState = {
    ...state,
    decision,
    choice: chooseRenderer(decision, state.settings),
  };
  return decision.tray ? probed : fallToFlat(probed);
}

/**
 * The settings toggle back, and the same toggle forward.
 *
 * A player who asks for the table clears the recorded fall. A player who asks
 * for flat dice records it. Neither one notices: the player did it, so the
 * screen does not announce it back.
 *
 * A platform below the bar keeps its flat dice whatever the record says, which
 * is why `chooseRenderer` reads the platform first.
 */
export function askForTray(state: RendererState, wanted: boolean): RendererState {
  const settings: Settings = { ...state.settings, flatFallback: !wanted };
  return {
    decision: state.decision,
    settings,
    choice: chooseRenderer(state.decision, settings),
    noticed: false,
  };
}

/**
 * One sentence per reading below the bar, for the player rather than for a log.
 *
 * The keys are asserted against `FALL_REASONS` in the test, so a reading added
 * to the probe cannot reach the screen with no words.
 */
export const FALL_REASON_TEXT: Readonly<Record<FallReason, string>> = {
  'no-webgl2': 'The browser gives no 3D drawing surface.',
  'low-device-memory': 'The device reports too little memory.',
  'low-core-count': 'The device reports too few processor cores.',
  'no-canvas-readback': 'The browser cannot read a drawing back.',
};

/**
 * The notice, shown once when the dice fall to flat.
 *
 * A platform below the bar is told nothing about the toggle, because the
 * toggle cannot give it the table.
 */
export function noticeText(choice: RendererChoice): string {
  if (choice.cause === 'belowTheBar') {
    return 'This browser cannot draw the table. The dice are flat now.';
  }
  return 'The table did not load. The dice are flat now. Open More to ask for the table again.';
}

/** What the sheet prints under the toggle. It names the cause every time. */
export function trayNote(choice: RendererChoice): string {
  if (choice.renderer === 'tray') {
    return 'The dice roll on the table.';
  }
  if (choice.cause === 'notProbed') {
    return 'The browser check is not finished.';
  }
  if (choice.cause === 'belowTheBar') {
    return ['This browser cannot draw the table.']
      .concat(choice.reasons.map((reason) => FALL_REASON_TEXT[reason]))
      .join(' ');
  }
  return 'The dice are flat. Switch this on to ask for the table again.';
}
