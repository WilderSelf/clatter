// The log the screen writes — Unit 4.4, the screen half.
//
// `src/log/store.ts` is the store. This file is the one place that turns a
// throw on the screen into an entry in it, and it builds no second store.
//
// ---------------------------------------------------------------------------
// The decision this file settles: ONE entry per roll, rewritten by every push
// ---------------------------------------------------------------------------
//
// The shape of the log requires it, and three separate parts of the shape say
// so:
//
//   1. `createLogEntry` takes a whole `RollResult`, whose dice each carry one
//      value per generation, and it writes `LoggedDie.cells` as one cell per
//      generation. A pushed roll is therefore already a complete entry.
//   2. The same call derives `pushCount` from the number of generations. A
//      second entry per push would hold `pushCount` 1 while the first held 0,
//      and the log would report two rolls where the player threw one.
//   3. The export schema of Unit 4.5 carries `roll_id` AND `generation` as
//      separate columns, and `src/log/csv.ts` rejects a file where one
//      `roll_id` appears in two blocks. A push that wrote a second entry would
//      export a file the application refuses to read back.
//
// So a roll opens an entry and every push of that roll rewrites it, in place,
// at the key the store acknowledged the insert with. `replaceRoll` does that in
// one transaction and leaves the ring buffer where it stands.
//
// A push that lands before the first flush is the same rule one step earlier:
// `LogWriter.queue` replaces a waiting roll of the same `rollId`.

import type { LogEntry } from '../log/entry';
import { createLogEntry } from '../log/entry';
import type { AppendResult, LogWriter, OpenOptions, StoreNames } from '../log/store';
import {
  createLogWriter,
  estimateStorage,
  flushOnHide,
  openLog,
  persistOnce,
  readRollsInPages,
  replaceRoll,
} from '../log/store';
import type { AppState } from './state';
import { profileOf } from './state';

/** What one roll is called, and when it was thrown. */
export interface RollSequence {
  readonly rollId: string;
  readonly timestampIso: string;
  /** The stress counter before the FIRST throw of this roll, not of this push. */
  readonly stressBefore: number;
}

/**
 * The entry a state would write, or `null` where there is nothing to write.
 *
 * Pure. It reads the profile in force through `profileOf`, so the entry carries
 * the hash of the rules the throw ran under and never of the rules the sheet
 * holds later. Decision 10 clears the table on a change of rules, so no roll can
 * outlive the profile it was thrown under, and this call is what records which
 * one that was.
 *
 * An automatic failure puts no dice on the table, and `createLogEntry` refuses
 * a roll of no dice. Such a throw writes nothing, which is stated rather than
 * silent.
 */
export function entryForThrow(state: AppState, sequence: RollSequence): LogEntry | null {
  const result = state.result;
  if (result === null || result.dice.length === 0) return null;
  return createLogEntry({
    rollId: sequence.rollId,
    timestampIso: sequence.timestampIso,
    mode: state.mode,
    result,
    profile: profileOf(state),
    stressBefore: sequence.stressBefore,
    artifactCurve: state.artifactCurve,
  });
}

/** What one `record` call did. Every answer is a record, and none throws. */
export type RecordOutcome =
  /** A new roll. The entry is in the store. */
  | { readonly kind: 'wrote'; readonly entry: LogEntry }
  /** A push. The entry of the same roll now holds this generation as well. */
  | { readonly kind: 'rewrote'; readonly entry: LogEntry }
  /** There was nothing to write: an automatic failure throws no dice. */
  | { readonly kind: 'skipped'; readonly reason: string }
  | { readonly kind: 'full'; readonly reason: string }
  | { readonly kind: 'error'; readonly reason: string };

export interface RollLog {
  /**
   * A throw landed. Call it after every roll and after every push, with the
   * state the throw produced.
   */
  record(state: AppState): Promise<RecordOutcome>;
  /** Every roll the buffer holds, oldest first, straight out of the store. */
  rolls(): Promise<readonly LogEntry[]>;
  /** What the origin uses and what it may use, or null where there is no estimate. */
  storage(): Promise<{ usage: number | null; quota: number | null } | null>;
  /** Stop the flush listener and close the connection. */
  close(): void;
}

export interface RollLogOptions extends StoreNames, OpenOptions {
  /** The clock. A test hands over its own, so a timestamp is not a race. */
  readonly now?: () => string;
  /** The name of a new roll. A test hands over its own, for the same reason. */
  readonly newRollId?: () => string;
  readonly doc?: Document;
}

export type OpenRollLogResult =
  | { readonly kind: 'open'; readonly log: RollLog }
  | { readonly kind: 'refused'; readonly reason: string }
  | { readonly kind: 'blocked'; readonly reason: string }
  | { readonly kind: 'error'; readonly reason: string };

/**
 * A name for one roll.
 *
 * Constraint 7: the randomness comes from `crypto.getRandomValues`. Eight bytes
 * of it, so two tabs of one campaign do not name two rolls the same, which the
 * export schema would then reject as a duplicate. It is an identifier and never
 * a die, so no rejection sampling is due: every byte is used as it comes.
 */
export function newRollId(): string {
  const source = globalThis.crypto;
  if (source?.getRandomValues === undefined) {
    // A browser with no such source still has to log. The identifier is then
    // the clock alone, which is unique within one tab.
    return `r-${Date.now().toString(36)}`;
  }
  const bytes = new Uint8Array(8);
  source.getRandomValues(bytes);
  let hex = '';
  for (const byte of bytes) hex += byte.toString(16).padStart(2, '0');
  return `r-${hex}`;
}

/**
 * Open the log the screen writes.
 *
 * It answers rather than throws, exactly as `openLog` does, because a caller
 * must tell a full disk from a browser that refuses a database at all.
 */
export async function openRollLog(options: RollLogOptions = {}): Promise<OpenRollLogResult> {
  const opened = await openLog(options);
  if (opened.kind !== 'open') return opened;
  const db = opened.db;
  const writer: LogWriter = createLogWriter(db, options);
  const stopFlush = flushOnHide(writer, options.doc ?? document);
  const now = options.now ?? ((): string => new Date().toISOString());
  const nameRoll = options.newRollId ?? newRollId;
  void persistOnce();

  /** The roll on the table: its name, and the key its entry was written at. */
  let open: { sequence: RollSequence; key: number | null } | null = null;

  /**
   * One `record` at a time.
   *
   * A roll and a push a moment later are two calls, and the second reads what
   * the first wrote: whether the roll is still in the queue, and which key the
   * store gave it. Let the two overlap and the push starts while the roll's key
   * is still unknown, so it writes a SECOND entry under the same `roll_id`.
   * That is the defect this whole file exists to prevent, and the interleaving
   * is the way to reach it, so the calls are serialised here.
   */
  let chain: Promise<unknown> = Promise.resolve();
  const inTurn = <T>(work: () => Promise<T>): Promise<T> => {
    const next = chain.then(work, work);
    chain = next.then(
      () => undefined,
      () => undefined,
    );
    return next;
  };

  /** Queue the entry and write it now. The queue replaces a waiting twin. */
  const write = async (entry: LogEntry): Promise<AppendResult | null> => {
    writer.queue(entry);
    return writer.flush();
  };

  const recordOne = async (state: AppState): Promise<RecordOutcome> => {
    if (state.lastThrow === null) {
      return { kind: 'skipped', reason: 'no throw has landed' };
    }
    // A roll starts a sequence. A push joins the one already open, and a push
    // with none open is a push the log never saw the roll of, so it starts one
    // rather than being dropped.
    if (state.lastThrow === 'roll' || open === null) {
      open = {
        sequence: {
          rollId: nameRoll(),
          timestampIso: now(),
          stressBefore: state.counts.stress,
        },
        key: null,
      };
    }
    const held = open;
    const entry = entryForThrow(state, held.sequence);
    if (entry === null) {
      // Nothing landed on the table, so nothing is logged and no sequence is
      // left open for a later push to join.
      open = null;
      return { kind: 'skipped', reason: 'the throw put no dice on the table' };
    }

    // The push path: the entry is already in the store, so it is rewritten
    // where it lies. A roll still waiting in the queue is replaced there
    // instead, which `write` does through `LogWriter.queue`.
    if (held.key !== null && !writer.holds(entry.rollId)) {
      const put = await replaceRoll(db, held.key, entry, options);
      if (put.kind === 'written') return { kind: 'rewrote', entry };
      if (put.kind !== 'gone') return put;
      // The roll fell out of the ring buffer between the two throws. It is not
      // in the log any more, so writing it again adds no duplicate.
      held.key = null;
    }

    const fresh = held.key === null && !writer.holds(entry.rollId);
    const result = await write(entry);
    if (result === null) {
      return { kind: 'error', reason: 'the writer had nothing to flush' };
    }
    if (result.kind !== 'written') return result;
    held.key = result.newestKey;
    return { kind: fresh ? 'wrote' : 'rewrote', entry };
  };

  const log: RollLog = {
    record(state) {
      return inTurn(() => recordOne(state));
    },
    rolls() {
      return inTurn(() => readRollsInPages(db, options));
    },
    storage() {
      return estimateStorage();
    },
    close() {
      stopFlush();
      db.close();
    },
  };
  return { kind: 'open', log };
}
