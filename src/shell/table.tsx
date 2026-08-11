// The 3D tray, inside the application — Units 3.4, 3.5 and 3.7.
//
// This is the call site the tray was built for. `src/tray/throw.ts` acts a
// roll out with `throwPool` and a push with `pushPool`, and
// `src/tray/affordance.ts` draws the three lock states on the dice and turns a
// click into a toggle. Nothing here decides a rule, reads a random source or
// picks a value: every throw is handed a `RollResult` the rules core already
// settled, and every click is answered by `toggleDie` in `src/shell/state.ts`.
//
// **The screen is the one authority on the pool.** The tray holds its own copy
// of the pool for its raycast, and this module overwrites that copy from the
// application state after every change, so the two cannot drift.
//
// **Throws are serialised and coalesced.** A throw takes a second or more of
// simulated tumble and a player may press again inside it, so the newest
// request wins and every request between is dropped. A push that is dropped
// that way is acted out as a whole throw of the table as it now stands, which
// is what the tray can still show honestly: it never acts out a subset it
// cannot map back to the dice on the table.

import { useEffect, useRef } from 'preact/hooks';
import type { Die } from '../rules/die';
import type { RollResult } from '../rules/roll';
import type { AffordanceHandle } from '../tray/affordance';
import { mountAffordance } from '../tray/affordance';
import { prefersReducedMotion } from '../tray/capability';
import type { MountTrayOptions } from '../tray/scene';
import type { DieSpot } from '../tray/spots';
import { dieSpots } from '../tray/spots';
import { watchFirstMotion } from '../tray/motion';
import { paintPool, pushPool, throwPool } from '../tray/throw';
import type { DiceTheme } from '../theme/themes';
import type { DiceBox, TrayImpact } from '../tray/vendor/dice-tray.js';
import type { MotionEvidence } from './perf';
import type { AppState } from './state';
import { profileOf } from './state';

/** The mount, as the screen takes it. A test counts the calls. */
export type TrayMount = (container: HTMLElement, options?: MountTrayOptions) => Promise<unknown>;

/** Where every die of the pool sits on the screen, by die id. */
export type TraySpots = Readonly<Record<string, DieSpot>>;

export const NO_SPOTS: TraySpots = Object.freeze({});

/**
 * One throw the tray still owes the player.
 *
 * It carries the whole answer of the rules core, so the tray never asks the
 * screen a second question while it acts one out.
 */
interface TrayJob {
  readonly ordinal: number;
  readonly kind: 'roll' | 'push';
  readonly result: RollResult;
  readonly rerolled: readonly string[];
  readonly stressAdded: string | null;
}

/**
 * The one seam an outside instrument reads the application's tray through.
 *
 * A WebGL scene has no other route. `node scripts/browser.mjs --table` reads
 * the up-face off every body quaternion here and compares it against the value
 * the screen printed for that die, so the 3D result is judged against the rules
 * core rather than against itself. Nothing in the application reads this field,
 * and no check may write one.
 */
export interface TableSeam {
  box: DiceBox | null;
  ordered: readonly Die[];
  /** How many throws the tray has acted out. A dropped throw never counts. */
  throws: number;
  /** True while a throw is in flight, so a reader waits for the table to rest. */
  busy: boolean;
}

declare global {
  interface Window {
    __clatterTable?: TableSeam;
  }
}

/** The pool as the tray holds it, refreshed from the state the screen holds. */
function restate(ordered: readonly Die[], dice: readonly Die[]): readonly Die[] {
  const held = new Map(dice.map((die) => [die.id, die]));
  return ordered.map((die) => held.get(die.id) ?? die);
}

/**
 * True while the tray can act a push out as a push.
 *
 * The tray must already hold every die of the new pool except the one the push
 * added. A tray that fell behind — a throw was dropped, or the pool changed
 * under it — cannot map the subset back, so the caller throws the whole table
 * instead of guessing.
 */
function canActOutPush(ordered: readonly Die[], job: TrayJob): boolean {
  const onTray = new Set(ordered.map((die) => die.id));
  const missing = job.result.dice.filter((die) => !onTray.has(die.id)).map((die) => die.id);
  const added = job.stressAdded === null ? [] : [job.stressAdded];
  return (
    ordered.length + added.length === job.result.dice.length &&
    missing.length === added.length &&
    missing.every((id, at) => id === added[at])
  );
}

export interface TableProps {
  /** The table is in the document while the builder is collapsed. */
  readonly shown: boolean;
  /** True while `chooseRenderer` answers the tray. Unit 3.7 decides it. */
  readonly wanted: boolean;
  readonly state: AppState;
  readonly mount: TrayMount;
  /** A fall to flat dice: the mount failed, or the canvas lost its context. */
  readonly onFall: () => void;
  /** Where each die landed, for the cells the keyboard reaches. */
  readonly onSpots: (spots: TraySpots) => void;
  /**
   * The tray itself, once it has mounted, and `null` while there is none.
   *
   * The share card of Unit 4.9 draws one fresh frame through this box and
   * copies it in the same task, so it needs the renderer rather than a picture
   * of it. Nothing else reads it, and the screen never draws through it.
   */
  readonly onBox?: (box: DiceBox | null) => void;
  /** A click on a die. The screen answers it, exactly as a key press does. */
  readonly onToggle: (id: string) => void;
  /** The dice axis in force — Unit 4.8. A change of it repaints the pool. */
  readonly colours: DiceTheme;
  /**
   * Every collision the physics world reports — Unit 3.6.
   *
   * The sound engine is the caller. The tray plays nothing and holds no
   * choice: a mount that names no hook reports no collision at all, so a
   * player who never turned sound on pays for nothing.
   */
  readonly onImpact?: (impact: TrayImpact) => void;
  /**
   * The first frame of a throw that drew a die somewhere else — Unit 3.8.
   *
   * The overlay measures throw-to-first-motion, and this is the far end of it.
   * The near end is the press, which the screen holds. The watch starts when
   * the throw is queued and BEFORE the library is asked to act it out, so the
   * synchronous simulation lies inside the measurement rather than before it.
   */
  readonly onMotion?: (at: number, evidence: MotionEvidence) => void;
  /**
   * The table came to rest, on the throw `ordinal` names.
   *
   * It closes the overlay's measurement window and it releases the marks. The
   * ordinal is the throw this tray last acted out, and it is `-1` before the
   * first one, so a caller can refuse a report that names an older throw than
   * the one it holds.
   */
  readonly onSettled?: (at: number, ordinal: number) => void;
}

/**
 * The table.
 *
 * It stays in the document across both rest states and hides while the builder
 * is open, because the library reads the size of its container when it mounts
 * and a hidden container measures nothing. The tray is behind a dynamic
 * import, so nothing of it is fetched until the player first closes the
 * builder.
 *
 * **Unit 3.7 chooses.** The table mounts only while `wanted` holds. A platform
 * below the bar, a player who asked for flat dice, and a table that already
 * fell all read false here, and nothing of the 3D chunk is then fetched at all.
 */
export function Table({
  shown,
  wanted,
  state,
  mount,
  onFall,
  onSpots,
  onBox,
  onToggle,
  colours,
  onImpact,
  onMotion,
  onSettled,
}: TableProps): preact.JSX.Element {
  const container = useRef<HTMLDivElement>(null);
  const box = useRef<DiceBox | null>(null);
  const ordered = useRef<readonly Die[]>([]);
  const affordance = useRef<AffordanceHandle | null>(null);
  const pending = useRef<TrayJob | null>(null);
  const running = useRef(false);
  // No throw has been acted out. It starts below zero rather than at zero,
  // because the opening state of a test may already hold the first throw.
  const taken = useRef(-1);
  const toggle = useRef(onToggle);
  const spotted = useRef(onSpots);
  const boxed = useRef(onBox);
  const seam = useRef<TableSeam>({ box: null, ordered: [], throws: 0, busy: false });
  const painted = useRef(colours);
  // The three callbacks below arrive from a render and are called from a mount
  // callback or a frame callback, so each is held in a ref rather than
  // captured. A stale sound hook would go on playing at an old volume, and a
  // stale motion hook would report into an instrument that has been replaced.
  const impacted = useRef(onImpact);
  const moved = useRef(onMotion);
  const settled = useRef(onSettled);
  const stopWatch = useRef<(() => void) | null>(null);
  // True while this table is in the document. `drain` reads it: the loop is
  // not cancelled by an unmount and it must not report to a screen that has
  // replaced it.
  const live = useRef(true);
  painted.current = colours;
  toggle.current = onToggle;
  spotted.current = onSpots;
  boxed.current = onBox;
  impacted.current = onImpact;
  moved.current = onMotion;
  settled.current = onSettled;

  const publish = (): void => {
    seam.current.box = box.current;
    seam.current.ordered = ordered.current;
    seam.current.busy = running.current || pending.current !== null;
    window.__clatterTable = seam.current;
  };

  const readSpots = (held: DiceBox, pool: readonly Die[]): void => {
    const spots: Record<string, DieSpot> = {};
    dieSpots(held, pool.length).forEach((spot, index) => {
      const die = pool[index];
      if (spot !== null && die !== undefined) spots[die.id] = spot;
    });
    spotted.current(spots);
  };

  const actOut = async (held: DiceBox, job: TrayJob): Promise<void> => {
    const skipTumble = prefersReducedMotion();
    const push = job.kind === 'push' && canActOutPush(ordered.current, job);
    ordered.current = push
      ? await pushPool(
          held,
          ordered.current,
          { dice: job.result.dice, rerolled: job.rerolled, stressAdded: job.stressAdded },
          { skipTumble, colours: painted.current },
        )
      : await throwPool(held, job.result, { skipTumble, colours: painted.current });
    affordance.current?.update(ordered.current);
    readSpots(held, ordered.current);
    seam.current.throws += 1;
    publish();
  };

  /**
   * Watch the tray for the first movement of the throw now waiting — Unit 3.8.
   *
   * The reading it compares against is taken HERE, before anything asks the
   * library to act the throw out: `drain` calls `box.roll` in the same task, so
   * a reading taken after it would already hold the thrown dice and the whole
   * synchronous simulation would fall outside the measurement.
   *
   * The first throw of a session arrives before the table has mounted, because
   * the builder is open until the player presses Roll and a hidden container
   * measures nothing. The mount calls this as well, so that throw is measured
   * from the same press and is not reported as no throw at all.
   */
  const watchForMotion = (): void => {
    const held = box.current;
    const report = moved.current;
    if (held === null || report === undefined || pending.current === null) return;
    stopWatch.current?.();
    stopWatch.current = watchFirstMotion(held, (at, evidence) => report(at, evidence));
  };

  const drain = async (): Promise<void> => {
    const held = box.current;
    if (held === null || running.current) return;
    running.current = true;
    publish();
    try {
      while (pending.current !== null) {
        const job = pending.current;
        pending.current = null;
        await actOut(held, job);
        taken.current = job.ordinal;
      }
    } catch {
      // A throw the tray cannot act out is not a rule failure: the result on
      // the screen is already the core's answer and the flat renderer is one
      // toggle away. The fall is recorded, exactly as a lost context is.
      onFall();
    } finally {
      running.current = false;
      publish();
      // Every die is asleep by here, because `throwPool` and `pushPool` both
      // resolve at rest. The overlay's measurement window closes on this, so
      // the idle frames after a throw are not samples of it.
      //
      // **A tray that has left the document reports nothing.** This loop is not
      // cancelled by an unmount, so a table the player switched off mid-throw
      // would still report rest, and the table that replaced it would act the
      // same throw out again under marks that report had already released.
      if (live.current) settled.current?.(performance.now(), taken.current);
    }
  };

  // The mount. It runs once, and only while the renderer choice wants the
  // table, so a browser below the bar fetches no part of the 3D chunk.
  useEffect(() => {
    const element = container.current;
    if (!shown || !wanted || element === null || box.current !== null) return;
    let live = true;
    void mount(element, {
      onFallToFlat: () => onFall(),
      // Unit 3.6. The hook is stable and reads the ref, so the sound engine
      // the application holds answers every collision under the choice in
      // force rather than the one that stood at the mount.
      config: { onImpact: (impact) => impacted.current?.(impact) },
    })
      .then(async (held) => {
        if (!live) return;
        box.current = held as DiceBox;
        affordance.current = await mountAffordance(
          held as DiceBox,
          [],
          profileOf(state),
          (_pool, clicked) => toggle.current(clicked.id),
        );
        publish();
        boxed.current?.(box.current);
        watchForMotion();
        void drain();
      })
      .catch(() => {
        if (live) onFall();
      });
    return () => {
      live = false;
    };
  }, [shown, wanted]);

  // The tray goes when this element does, so nothing outside holds a renderer
  // whose canvas has left the document.
  useEffect(
    () => () => {
      live.current = false;
      boxed.current?.(null);
    },
    [],
  );

  // The listener and the marks go with the table.
  useEffect(
    () => () => {
      affordance.current?.dispose();
      affordance.current = null;
    },
    [],
  );

  // A change of rules remounts the affordance — Units 4.1 and 4.2.
  //
  // `mountAffordance` reads the profile once and holds it, because it answers
  // every click and draws every mark from it. Unit 3.5 recorded that as a
  // limit: the profile was read at the mount and nothing could change it. The
  // rules are now a control on the sheet, so the affordance is disposed and
  // mounted again under the profile in force. The canvas, the scene and the
  // physics world all stay: only the listener and the marks are rebuilt.
  //
  // A change of rules also clears the table, which Decision 10 settles, so the
  // new affordance opens over an empty pool and the marks of the roll before it
  // are gone. The next throw fills it again.
  const inForce = JSON.stringify(profileOf(state));
  useEffect(() => {
    const held = box.current;
    if (held === null || affordance.current === null) return;
    affordance.current.dispose();
    affordance.current = null;
    let live = true;
    const pool = state.result === null ? [] : ordered.current;
    void mountAffordance(held, pool, profileOf(state), (_pool, clicked) =>
      toggle.current(clicked.id),
    ).then((handle) => {
      if (live) affordance.current = handle;
      else handle.dispose();
    });
    return () => {
      live = false;
    };
  }, [inForce]);

  // One throw per ordinal. A throw that arrives while another runs replaces
  // whatever was waiting, so the tray never falls further than one throw
  // behind the screen.
  useEffect(() => {
    if (!wanted || state.result === null || state.throwOrdinal === taken.current) return;
    pending.current = {
      ordinal: state.throwOrdinal,
      kind: state.lastThrow === 'push' ? 'push' : 'roll',
      result: state.result,
      rerolled: state.thrown,
      stressAdded: state.stressAdded,
    };
    publish();
    watchForMotion();
    void drain();
  }, [state.throwOrdinal, wanted]);

  // The watch goes with the table, so no frame callback outlives the canvas.
  useEffect(
    () => () => {
      stopWatch.current?.();
      stopWatch.current = null;
    },
    [],
  );

  // A press keeps a die or releases it, and the marks on the dice say so. The
  // pool comes from the screen, so the tray's own copy cannot drift from it.
  useEffect(() => {
    const dice = state.result?.dice;
    if (dice === undefined || affordance.current === null) return;
    ordered.current = restate(ordered.current, dice);
    affordance.current.update(ordered.current);
  }, [state.result]);

  // A change of the dice axis repaints the dice already on the table — Unit
  // 4.8. Nothing is thrown again: the bodies stay where they lie, the materials
  // take the new colours and one frame is drawn, because the library draws no
  // frame between throws.
  useEffect(() => {
    const held = box.current;
    if (held === null || ordered.current.length === 0) return;
    paintPool(held, ordered.current, colours);
  }, [colours]);

  // The dice hold their world positions through a resize and the camera does
  // not, so the cells are read again rather than scaled.
  useEffect(() => {
    const again = (): void => {
      const held = box.current;
      if (held !== null) requestAnimationFrame(() => readSpots(held, ordered.current));
    };
    window.addEventListener('resize', again);
    return () => window.removeEventListener('resize', again);
  }, []);

  // The one line drawn ON the tray surface, in the flat renderer alone. The 3D
  // library measures this container and fills it with a canvas, so it is given
  // an empty element exactly as before. The note holds no tab stop, so neither
  // keyboard walk of section 6 changes.
  return (
    <div class="table" data-el="dice-table" hidden={!shown} ref={container}>
      {wanted ? null : (
        <p class="table-note" data-el="table-note">
          The dice land here.
        </p>
      )}
    </div>
  );
}
