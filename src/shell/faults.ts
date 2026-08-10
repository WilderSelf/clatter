// What the player sees when something fails — Unit 4.10.
//
// Pure. No browser API is named here and no module-level value changes, so the
// whole surface runs under a plain test runner.
//
// ---------------------------------------------------------------------------
// The problem this file solves
// ---------------------------------------------------------------------------
//
// Every failure was already DETECTED before this unit. `src/log/store.ts`
// answers four refusals by name, `src/log/import-file.ts` answers twelve, and
// `src/shell/renderer.ts` answers three causes for flat dice. None of them
// throws. What was missing is what the player is TOLD, and what the player can
// do next.
//
// Three rules hold every surface here:
//
//   1. **Say what happened, in words a player understands.** No column name, no
//      error name, no identifier of any kind. Unit 4.4 found `1 ratingPoint`
//      and `pool-banes-damage-ratings` printed on a player's screen, and only a
//      capture caught them. `faults.test.ts` asserts the shape of every string
//      this file can print.
//   2. **Say what to do next, where anything can be done.** A player who is
//      told "no" and not "why" tries the same thing again.
//   3. **Where nothing can be done, say what is lost.** The seven-day storage
//      note is already honest in exactly this way, and so is every line below.
//
// ---------------------------------------------------------------------------
// The denominator
// ---------------------------------------------------------------------------
//
// A surface nobody wrote is invisible, so the failures are COUNTED rather than
// listed by hand. `SOURCE_REFUSALS` names every outcome the four modules
// declare, and `faults.test.ts` parses those declarations out of the source and
// asserts the two sets equal. A refusal added to a union later therefore turns
// the suite red until it has either a surface or a written reason for having
// none.

import type { CsvRejection } from '../log/csv';
import type { ImportRejection } from '../log/import-file';
import type { FlatCause } from './renderer';

/** Every failure that reaches the player, in the order the surface draws them. */
export const FAULT_KINDS = [
  'table-absent',
  'table-lost',
  'log-refused',
  'log-blocked',
  'log-error',
  'log-full',
  'import-refused',
  'settings-refused',
] as const;

export type FaultKind = (typeof FAULT_KINDS)[number];

/**
 * Where a fault is drawn.
 *
 * The surface holds one row per slot and no more, and every row is in the
 * document from the first paint with no text. Two reasons, and both are
 * measured elsewhere in this repository:
 *
 * - A live region built at the moment it fills is announced by some readers and
 *   not by others. Unit 3.7 found that with the flat-dice notice.
 * - A surface that grows a row per failure has no bound, and a phone at 360 px
 *   has no room for one.
 *
 * The faults inside one slot cannot hold at once. A log that refused to open
 * writes nothing, so it cannot then be full, and the newest log fault replaces
 * the one before it.
 */
export const FAULT_SLOTS = ['table', 'log', 'import', 'settings'] as const;

export type FaultSlot = (typeof FAULT_SLOTS)[number];

/** Which slot draws which fault. Every fault has exactly one. */
export const FAULT_SLOT_OF: Readonly<Record<FaultKind, FaultSlot>> = {
  'table-absent': 'table',
  'table-lost': 'table',
  'log-refused': 'log',
  'log-blocked': 'log',
  'log-error': 'log',
  'log-full': 'log',
  'import-refused': 'import',
  'settings-refused': 'settings',
};

/**
 * The name each slot's row carries in the document.
 *
 * The table row keeps the name Unit 3.7 gave it, because the notice it draws is
 * the same notice and two names for one element would be a second surface.
 */
export const FAULT_SLOT_ELEMENT: Readonly<Record<FaultSlot, string>> = {
  table: 'flat-fallback-note',
  log: 'log-fault-note',
  import: 'import-fault-note',
  settings: 'settings-fault-note',
};

export interface FaultWords {
  /** What happened, and what it costs the player. One or two sentences. */
  readonly what: string;
  /** What to do next, or null where nothing can be done. */
  readonly next: string | null;
}

/**
 * One entry per fault.
 *
 * Every `next` names a control the player can reach with the keyboard alone.
 * The surface itself holds no control, because both keyboard walks of section 6
 * of `docs/design/0002-screen-design.md` are fixed at eleven visits and
 * thirty-five, and a control on a banner that appears would move them.
 *
 * A `next` of null is a fault with no route back. The words then say what the
 * player loses, which is the third rule at the head of this file.
 */
export const FAULT_TEXT: Readonly<Record<FaultKind, FaultWords>> = {
  // The two table faults keep the words Unit 3.7 wrote, because `noticeText`
  // still answers them and its test pins both strings.
  'table-absent': {
    what: 'This browser cannot draw the table. The dice are flat now.',
    next: null,
  },
  // **The two steps and their order are measured, not chosen.** A dynamic
  // import that failed once is remembered by the module map, so the same
  // document can never fetch the 3D chunk again: measured on 2026-08-10
  // through `node scripts/browser.mjs --faults`, the toggle alone made no
  // second request at all and the screen fell back again. The reload has to
  // come first, because the stored fall keeps the dice flat until the toggle
  // clears it, and the toggle is what asks the fresh document for the chunk.
  'table-lost': {
    what: 'The table did not load. The dice are flat now.',
    next: 'Reload this page. Then open More and switch the table on.',
  },
  'log-refused': {
    what: 'This browser keeps no roll log. The rolls of this session go when the tab closes.',
    next: 'Open this application outside a private window to keep a log.',
  },
  'log-blocked': {
    what: 'Another tab of this application holds the log. No roll reaches the log now.',
    next: 'Close the other tab. Then open the history again.',
  },
  'log-error': {
    what: 'The log stopped. The rolls since then are not in it.',
    next: 'Reload this page to write rolls again.',
  },
  // **The reload is part of the route and it is measured.** Measured on
  // 2026-08-10 through `node scripts/browser.mjs --faults --quota-kb`: after a
  // transaction aborts on the quota, the browser leaves the connection
  // unusable, so the next throw answers `error` even when room has been made.
  // Only a reload writes rolls again.
  'log-full': {
    what: 'The storage is full. This roll is not in the log.',
    next: 'Make room on this device. Then reload this page.',
  },
  'import-refused': {
    what: 'This file is not a log this application can read. The log did not change.',
    next: 'Pick another file.',
  },
  'settings-refused': {
    what: 'This browser keeps no settings. Every choice goes when the tab closes.',
    next: 'Open this application outside a private window to keep the choices.',
  },
};

export interface Fault {
  readonly kind: FaultKind;
  readonly what: string;
  readonly next: string | null;
}

/**
 * One fault, ready to draw.
 *
 * `what` is overridden only by an import, whose refusal already carries the
 * words for its own rejection. `src/log/import-file.ts` writes them and
 * `faults.test.ts` holds that table to the same shape as this one.
 */
export function faultOf(kind: FaultKind, what?: string): Fault {
  const words = FAULT_TEXT[kind];
  return { kind, what: what ?? words.what, next: words.next };
}

/** The whole sentence one fault reads as. The surface draws the two parts apart. */
export function faultLine(fault: Fault): string {
  return fault.next === null ? fault.what : `${fault.what} ${fault.next}`;
}

/**
 * Which fault a cause for flat dice raises, or null where it raises none.
 *
 * `notProbed` is not a fault. It is the state the screen opens in, before the
 * probe has answered, and a fall nothing measured is never recorded.
 */
export function tableFault(cause: FlatCause | null): Fault | null {
  if (cause === 'belowTheBar') return faultOf('table-absent');
  if (cause === 'recordedFall') return faultOf('table-lost');
  return null;
}

export interface FaultInputs {
  /** The cause the renderer choice answered, where the player was told of it. */
  readonly table: FlatCause | null;
  /** The newest log fault, or null while the log is well. */
  readonly log: Fault | null;
  /** The newest import refusal, or null while nothing was refused. */
  readonly imported: Fault | null;
  /** True where the browser refused a settings store. */
  readonly settingsRefused: boolean;
}

/**
 * One entry per slot, in slot order, null where the slot is clear.
 *
 * The surface draws the list as it comes, so the row count on the screen is the
 * slot count and never the fault count. That is what bounds it.
 */
export function faultsOf(inputs: FaultInputs): readonly (Fault | null)[] {
  return [
    tableFault(inputs.table),
    inputs.log,
    inputs.imported,
    inputs.settingsRefused ? faultOf('settings-refused') : null,
  ];
}

/** How many faults hold now. It counts the list above and never a state. */
export function faultCount(drawn: readonly (Fault | null)[]): number {
  return drawn.filter((fault) => fault !== null).length;
}

// ---------------------------------------------------------------------------
// The accounting
// ---------------------------------------------------------------------------

export interface SourceRefusal {
  /** The module that declares it, from the root of the repository. */
  readonly module: string;
  /** The union type that declares it. */
  readonly type: string;
  /** The `kind` the union member carries, or the string the union member is. */
  readonly kind: string;
  /** The fault it raises, or null where it raises none. */
  readonly fault: FaultKind | null;
  /** Why it raises none. Every null carries one. */
  readonly why: string;
}

/**
 * Every outcome the failure unions of this application declare.
 *
 * `faults.test.ts` parses the declarations out of the source files and asserts
 * this table against them, in both directions. So a union member added later is
 * a red, and a member of this table that no longer exists is a red as well.
 *
 * A row whose `fault` is null is an outcome the player is never told about, and
 * every one of them carries the reason. A success is the commonest of those.
 */
export const SOURCE_REFUSALS: readonly SourceRefusal[] = [
  // src/log/store.ts
  { module: 'src/log/store.ts', type: 'OpenResult', kind: 'open', fault: null, why: 'the log opened, so the player is told nothing' }, // prettier-ignore
  {
    module: 'src/log/store.ts',
    type: 'OpenResult',
    kind: 'refused',
    fault: 'log-refused',
    why: '',
  },
  {
    module: 'src/log/store.ts',
    type: 'OpenResult',
    kind: 'blocked',
    fault: 'log-blocked',
    why: '',
  },
  { module: 'src/log/store.ts', type: 'OpenResult', kind: 'error', fault: 'log-error', why: '' },
  { module: 'src/log/store.ts', type: 'AppendResult', kind: 'written', fault: null, why: 'the rolls went into the log, so the player is told nothing' }, // prettier-ignore
  { module: 'src/log/store.ts', type: 'AppendResult', kind: 'full', fault: 'log-full', why: '' },
  { module: 'src/log/store.ts', type: 'AppendResult', kind: 'error', fault: 'log-error', why: '' },
  { module: 'src/log/store.ts', type: 'ReplaceResult', kind: 'written', fault: null, why: 'the push was written over the roll it belongs to, so the player is told nothing' }, // prettier-ignore
  {
    module: 'src/log/store.ts',
    type: 'ReplaceResult',
    kind: 'gone',
    fault: null,
    why: 'the roll fell out of the ring buffer between two throws, and the caller writes it again as a new roll, so the player loses nothing and is told nothing',
  },
  { module: 'src/log/store.ts', type: 'ReplaceResult', kind: 'full', fault: 'log-full', why: '' },
  { module: 'src/log/store.ts', type: 'ReplaceResult', kind: 'error', fault: 'log-error', why: '' },
  // src/log/import-file.ts
  { module: 'src/log/import-file.ts', type: 'ImportOutcome', kind: 'read', fault: null, why: 'the file parsed into rolls, so the player is told nothing' }, // prettier-ignore
  { module: 'src/log/import-file.ts', type: 'ImportOutcome', kind: 'refused', fault: 'import-refused', why: '' }, // prettier-ignore
  // src/shell/roll-log.ts
  { module: 'src/shell/roll-log.ts', type: 'RecordOutcome', kind: 'wrote', fault: null, why: 'the roll went into the log, so the player is told nothing' }, // prettier-ignore
  { module: 'src/shell/roll-log.ts', type: 'RecordOutcome', kind: 'rewrote', fault: null, why: 'the push was written over the entry of its own roll, so the player is told nothing' }, // prettier-ignore
  {
    module: 'src/shell/roll-log.ts',
    type: 'RecordOutcome',
    kind: 'skipped',
    fault: null,
    why: 'an automatic failure puts no dice on the table, so there is nothing to log and nothing the player could do',
  },
  { module: 'src/shell/roll-log.ts', type: 'RecordOutcome', kind: 'full', fault: 'log-full', why: '' }, // prettier-ignore
  { module: 'src/shell/roll-log.ts', type: 'RecordOutcome', kind: 'error', fault: 'log-error', why: '' }, // prettier-ignore
  { module: 'src/shell/roll-log.ts', type: 'OpenRollLogResult', kind: 'open', fault: null, why: 'the log opened, so the player is told nothing' }, // prettier-ignore
  { module: 'src/shell/roll-log.ts', type: 'OpenRollLogResult', kind: 'refused', fault: 'log-refused', why: '' }, // prettier-ignore
  { module: 'src/shell/roll-log.ts', type: 'OpenRollLogResult', kind: 'blocked', fault: 'log-blocked', why: '' }, // prettier-ignore
  { module: 'src/shell/roll-log.ts', type: 'OpenRollLogResult', kind: 'error', fault: 'log-error', why: '' }, // prettier-ignore
  // src/shell/renderer.ts
  {
    module: 'src/shell/renderer.ts',
    type: 'FlatCause',
    kind: 'notProbed',
    fault: null,
    why: 'the probe has not answered yet, so nothing has failed and a fall nothing measured is never recorded',
  },
  { module: 'src/shell/renderer.ts', type: 'FlatCause', kind: 'belowTheBar', fault: 'table-absent', why: '' }, // prettier-ignore
  { module: 'src/shell/renderer.ts', type: 'FlatCause', kind: 'recordedFall', fault: 'table-lost', why: '' }, // prettier-ignore
  // src/settings/local-store.ts
  { module: 'src/settings/local-store.ts', type: 'SettingsStoreResult', kind: 'open', fault: null, why: 'the settings store opened, so the player is told nothing' }, // prettier-ignore
  { module: 'src/settings/local-store.ts', type: 'SettingsStoreResult', kind: 'refused', fault: 'settings-refused', why: '' }, // prettier-ignore
];

/** The unions the accounting above covers. The test parses exactly these. */
export const REFUSAL_UNIONS: readonly { readonly module: string; readonly type: string }[] = [
  { module: 'src/log/store.ts', type: 'OpenResult' },
  { module: 'src/log/store.ts', type: 'AppendResult' },
  { module: 'src/log/store.ts', type: 'ReplaceResult' },
  { module: 'src/log/import-file.ts', type: 'ImportOutcome' },
  { module: 'src/shell/roll-log.ts', type: 'RecordOutcome' },
  { module: 'src/shell/roll-log.ts', type: 'OpenRollLogResult' },
  { module: 'src/shell/renderer.ts', type: 'FlatCause' },
  { module: 'src/settings/local-store.ts', type: 'SettingsStoreResult' },
];

/**
 * The two type names the import rejection codes live under.
 *
 * They are a second denominator, under the one above: `ImportOutcome.refused`
 * is one outcome, and it carries one of twelve codes, each of which needs its
 * own words. `faults.test.ts` parses both unions and asserts
 * `IMPORT_REJECTION_WORDS` against them.
 */
export const IMPORT_REJECTION_UNIONS: readonly {
  readonly module: string;
  readonly type: string;
}[] = [
  { module: 'src/log/csv.ts', type: 'CsvRejection' },
  { module: 'src/log/import-file.ts', type: 'ImportRejection' },
];

/** Types kept alive for the reader of this file. They carry no run-time value. */
export type { CsvRejection, ImportRejection };
