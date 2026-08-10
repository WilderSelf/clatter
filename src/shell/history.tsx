// The history destination — Unit 4.4, the screen half.
//
// **It is a second surface.** Section 3 of `docs/design/0002-screen-design.md`,
// under "The history is a separate destination": the history has its own header
// and its own footer, and it carries no share of the control budget of section
// 3. The summary holds exactly two controls, `back-button` and `history-list`,
// and `history-list` is a composite holding one visit per logged roll, so its
// length follows the log.
//
// The destination REPLACES the roll flow while it is open, which is what makes
// it a destination rather than a panel. Both keyboard walks of section 6 are
// walks of the roll flow at rest, so neither one changes: eleven visits before
// the throw and thirty-five after it.
//
// **What this unit does not build.** Decision 3 puts the transposed matrix and
// the export control in the record view, and `LEDGER.md` row 2.2d carries the
// two matrix acceptances to Unit 4.5. The record here is the smallest shell
// that lets the summary be judged: it draws the stored readings of one roll and
// no matrix, and its footer holds `back-button` alone. Unit 4.5 adds the matrix
// and `export-button`. Unit 4.7 adds the statistics charts.
//
// **Nothing here derives a rule.** Every number drawn below is a stored field
// of the entry. `specs/0001-rules-model.md` gives the reason under "Derived
// values": a view that re-derived would re-price campaign history under
// whatever profile the sheet holds today.
//
// **Constraint 8.** The note is the player's own text. It reaches the document
// as a JSX child, which Preact sets through `textContent`, so no parser ever
// sees it. Nothing in this file names `innerHTML` or `dangerouslySetInnerHTML`.

import { useEffect, useRef, useState } from 'preact/hooks';
import type { LogEntry } from '../log/entry';
import type { PushCostUnit } from '../rules/push-profile';
import { PUSH_PROFILES } from '../rules/push-profile';

/**
 * The note the plan asks this unit to put in the interface, in the plan's own
 * words: "iOS deletes script-writable storage after seven days without a visit
 * unless the site is installed to the home screen. 'Survives a campaign' is
 * false on iPhone for a fortnightly group. Say so, and prompt an export."
 *
 * `navigator.storage.persist()` does not close it, which `persistOnce` in
 * `src/log/store.ts` states as well. So the interface says it.
 */
export const SEVEN_DAY_NOTE =
  'A phone can delete this log. iOS removes stored data after seven days without a visit. ' +
  'Add this application to the home screen to stop that. Export the log to keep a copy.';

/** One megabyte, to one decimal place. A byte count means nothing to a player. */
export function megabytes(bytes: number): string {
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

/**
 * What the storage estimate reads. The browser may hold no estimate at all, and
 * the sentence says which of the two it is rather than printing a zero.
 */
export function storageLine(
  estimate: { usage: number | null; quota: number | null } | null,
): string {
  if (estimate === null || estimate.usage === null) {
    return 'This browser reports no storage estimate.';
  }
  if (estimate.quota === null) {
    return `This site uses ${megabytes(estimate.usage)}.`;
  }
  return `This site uses ${megabytes(estimate.usage)} of ${megabytes(estimate.quota)}.`;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/**
 * When a roll was thrown, in the reader's own time zone.
 *
 * The stored value is an ISO instant, which is UTC. A player reads a clock, so
 * the parts come off a `Date` and the pattern is fixed here rather than left to
 * a locale, because a locale changes what a check compares against.
 */
export function rollWhen(timestampIso: string): string {
  const at = new Date(timestampIso);
  if (Number.isNaN(at.getTime())) return 'unknown time';
  return (
    `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())} ` +
    `${pad(at.getHours())}:${pad(at.getMinutes())}`
  );
}

function plural(count: number, one: string, many: string): string {
  return count === 1 ? `1 ${one}` : `${count} ${many}`;
}

/**
 * The cost unit in the words a player reads. It is keyed by the union, so a
 * fifth cost unit is a type error here until it has words.
 *
 * The stored `costAmount` is printed beside it and is never recomputed. Unit
 * 4.7 records why: the four units are different things, and a view that
 * re-priced a roll under today's profile would report a campaign that never
 * happened.
 */
const COST_NOUN: Readonly<Record<PushCostUnit, readonly [string, string]>> = {
  ratingPoint: ['rating point', 'rating points'],
  healthPoint: ['point of health', 'points of health'],
  refereePoint: ['referee point', 'referee points'],
  complicationCheck: ['complication check', 'complication checks'],
};

export function costReading(amount: number, unit: PushCostUnit): string {
  const words = COST_NOUN[unit];
  return plural(amount, words[0], words[1]);
}

/**
 * The name of a rule set, from the identifier the entry stores.
 *
 * It reads a LABEL and never a rule. The log stores the identifier, because the
 * export schema carries the identifier, and a profile the build no longer ships
 * therefore falls back to the stored identifier rather than to nothing.
 */
export function rulesetName(id: string): string {
  return PUSH_PROFILES.find((profile) => profile.id === id)?.label ?? id;
}

/** One row of the summary list. Every field is read from the entry, never derived. */
export interface HistoryRow {
  readonly rollId: string;
  /** The `data-el` name of the row. It follows the position, not the roll. */
  readonly element: string;
  readonly when: string;
  readonly dice: number;
  readonly successes: number;
  readonly banes: number;
  readonly pushes: number;
  readonly ruleset: string;
  readonly profileHash: string;
  readonly costType: PushCostUnit;
  readonly costAmount: number;
  readonly stressBefore: number;
  readonly stressAfter: number;
  /** The player's own text. It is rendered as text and never as markup. */
  readonly note: string;
  /** What a screen reader reads for the row. */
  readonly label: string;
}

/**
 * The summary list, newest roll first.
 *
 * The store answers oldest first, because its keys are the insertion order. A
 * player looks for the roll just thrown, so the list is reversed here, in the
 * one place that builds it.
 */
export function historyRows(entries: readonly LogEntry[]): readonly HistoryRow[] {
  return entries
    .slice()
    .reverse()
    .map((entry, at) => {
      const when = rollWhen(entry.timestampIso);
      return {
        rollId: entry.rollId,
        element: `history-row-${at}`,
        when,
        dice: entry.dice.length,
        successes: entry.successes,
        banes: entry.banes,
        pushes: entry.pushCount,
        ruleset: entry.ruleset,
        profileHash: entry.profileHash,
        costType: entry.costType,
        costAmount: entry.costAmount,
        stressBefore: entry.stressBefore,
        stressAfter: entry.stressAfter,
        note: entry.note,
        label:
          `The roll of ${when}. ${plural(entry.dice.length, 'die', 'dice')}. ` +
          `${plural(entry.successes, 'success', 'successes')}. ` +
          `${plural(entry.banes, 'bane', 'banes')}. ` +
          `${plural(entry.pushCount, 'push', 'pushes')}.`,
      };
    });
}

/** How many rolls the log holds, in one sentence. */
export function logCountLine(count: number): string {
  if (count === 0) return 'The log holds no rolls.';
  return `The log holds ${plural(count, 'roll', 'rolls')}.`;
}

/**
 * The summary list. ONE control and one arrow habit, exactly as the pool bar
 * and the dice tray are. Section 2 of `docs/design/0002-screen-design.md`
 * counts a composite widget as one tab stop.
 *
 * An empty log draws a sentence and NO list, because a list holding no option
 * would still take a tab stop and a keyboard would stop on a control that does
 * nothing.
 */
function HistoryList({
  rows,
  openId,
  onOpen,
}: {
  rows: readonly HistoryRow[];
  openId: string | null;
  onOpen: (rollId: string) => void;
}) {
  const list = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState(rows[0]?.rollId ?? '');
  const active = rows.some((row) => row.rollId === activeId) ? activeId : (rows[0]?.rollId ?? '');

  const onKeyDown = (event: KeyboardEvent): void => {
    const held = list.current;
    if (held === null) return;
    const options = [...held.querySelectorAll<HTMLElement>('[role="option"]')];
    const from = options.findIndex((option) => option.contains(held.ownerDocument.activeElement));
    if (from < 0) return;
    const step: Record<string, number> = {
      ArrowDown: 1,
      ArrowRight: 1,
      ArrowUp: -1,
      ArrowLeft: -1,
    };
    const delta = step[event.key];
    if (delta !== undefined) {
      const to = (from + delta + options.length) % options.length;
      const next = options[to];
      const row = rows[to];
      if (next === undefined || row === undefined) return;
      event.preventDefault();
      setActiveId(row.rollId);
      next.focus();
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      const row = rows[from];
      if (row === undefined) return;
      event.preventDefault();
      onOpen(row.rollId);
    }
  };

  return (
    <div
      class="hist-list"
      data-el="history-list"
      data-composite=""
      role="listbox"
      aria-label="Past rolls"
      ref={list}
      onKeyDown={onKeyDown}
    >
      {rows.map((row) => (
        <div
          key={row.rollId}
          class="hist-row"
          data-el={row.element}
          role="option"
          tabIndex={row.rollId === active ? 0 : -1}
          aria-selected={row.rollId === openId}
          aria-label={row.label}
          onClick={() => onOpen(row.rollId)}
        >
          <span class="hist-when" aria-hidden="true">
            {row.when}
          </span>
          <span class="hist-nums" aria-hidden="true">
            <span class="hist-n">
              <i class="mark s" />
              {row.successes}
            </span>
            <span class="hist-n">
              <i class="mark b" />
              {row.banes}
            </span>
            <span class="hist-n dim">{row.dice} dice</span>
            <span class="hist-n dim">push {row.pushes}</span>
          </span>
          {row.note === '' ? null : (
            <span class="hist-note" aria-hidden="true">
              {row.note}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * One roll, as the log holds it.
 *
 * This is the record SHELL. It draws the stored readings and nothing else. The
 * transposed matrix of Decision 3 and the export control both belong to Unit
 * 4.5, and `LEDGER.md` row 2.2d carries the matrix acceptances there.
 */
function HistoryRecord({ row }: { row: HistoryRow }) {
  const readings: readonly (readonly [string, string])[] = [
    ['Thrown', row.when],
    ['Dice', String(row.dice)],
    ['Successes', String(row.successes)],
    ['Banes', String(row.banes)],
    ['Pushes', String(row.pushes)],
    ['Cost', costReading(row.costAmount, row.costType)],
    ['Stress', `${row.stressBefore} to ${row.stressAfter}`],
    ['Rule set', rulesetName(row.ruleset)],
  ];
  return (
    <section class="hist-record" data-el="history-record" aria-label={row.label}>
      <dl class="hist-dl">
        {readings.map(([term, value]) => (
          <div key={term} class="hist-pair" data-reading={term}>
            <dt>{term}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {row.note === '' ? null : (
        <p class="hist-note" data-el="history-record-note">
          {row.note}
        </p>
      )}
      <p class="sheet-note" data-el="history-record-pending">
        The dice of this roll and the export arrive with the next unit.
      </p>
    </section>
  );
}

/**
 * The history destination.
 *
 * `onBack` leaves it. From the record the back control returns to the summary
 * first, because the record is a view of the destination and not a third one.
 */
export function History({
  entries,
  failure,
  onBack,
}: {
  entries: readonly LogEntry[];
  /** Why the log could not be opened, or null while it is open. */
  failure: string | null;
  onBack: () => void;
}) {
  const rows = historyRows(entries);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = rows.find((row) => row.rollId === openId) ?? null;
  const back = useRef<HTMLButtonElement>(null);
  // The destination takes the focus when it opens, so a keyboard lands on it
  // rather than back at the top of a screen it can no longer see. It takes the
  // focus again when a record opens or closes, because the option the player
  // pressed leaves the document with the focus on it, and a focus on nothing
  // sends the next Tab back to the start of the page.
  useEffect(() => back.current?.focus(), [openId]);

  return (
    <div class="screen history" data-el="history">
      <header class="shell-h" data-el="history-header">
        <div class="statusline">
          <span class="hist-title">History</span>
          <span class="sr-only">
            {open === null ? logCountLine(rows.length) : `The roll of ${open.when}.`}
          </span>
          <span class="st-item st-dim" aria-hidden="true">
            {open === null ? logCountLine(rows.length) : open.when}
          </span>
        </div>
      </header>

      <main class="shell-m" data-el="history-mid">
        {failure === null ? null : (
          <p class="fall-note" data-el="history-failure" role="status">
            {failure}
          </p>
        )}
        {/* The plan's interface note. It carries a role, so a screen reader
            announces it as a note rather than as loose text. */}
        <p class="hist-warn" data-el="history-storage-note" role="note">
          {SEVEN_DAY_NOTE}
        </p>
        {open === null ? (
          rows.length === 0 ? (
            <p class="hist-empty" data-el="history-empty">
              No roll is in the log. Throw the dice to fill it.
            </p>
          ) : (
            <HistoryList rows={rows} openId={openId} onOpen={setOpenId} />
          )
        ) : (
          <HistoryRecord row={open} />
        )}
      </main>

      <div class="shell-f" data-el="history-footer">
        <div class="bar one">
          <button
            class="btn go"
            type="button"
            data-el="back-button"
            ref={back}
            onClick={() => (open === null ? onBack() : setOpenId(null))}
          >
            Back
            <small>{open === null ? 'to the dice' : 'to the list'}</small>
          </button>
        </div>
      </div>
    </div>
  );
}
