// The charts over the log — Unit 4.7, the view half.
//
// **The screen computes no statistic.** Every number below is a field of the
// `LogStatistics` record `summariseLog` returned. This module imports no log
// entry, no push profile and no rule, so there is nothing here to re-derive a
// number from. `specs/0001-rules-model.md` gives the reason under "Derived
// values": a view that re-derived would re-price campaign history under
// whatever profile the sheet holds today.
//
// **The charts are the third view of the history destination.** Decision 14 of
// `docs/design/0012-settled-decisions.md` records it, and section 3 of
// `docs/design/0002-screen-design.md` carries the control table.
//
// **A chart is a table, not a picture.** Each chart draws its rows as a real
// `<table>` whose cells hold the numbers as text and name their row header and
// their column header. The bar beside each number is `aria-hidden`, so a screen
// reader reads the value and never the decoration. One document serves both
// readers, and the two readings can be compared against each other.
//
// **Shape carries every meaning that colour carries.** Section 7 of the screen
// design. Each series carries a glyph — a circle, a square or a triangle — so a
// greyscale copy of a chart still separates the three push outcomes. The circle
// keeps the sense it has everywhere else in this application: it is the good
// outcome, as `.mark.s` is on a die and in the matrix.
//
// **No chart draws a bane.** `summariseLog` returns no bane statistic, so a
// bane bar would be a number the record does not hold.

import type { ComponentChildren } from 'preact';
import type { LogStatistics, PoolSizeRow } from '../log/statistics';
import type { PushCostUnit } from '../rules/push-profile';
import { COST_NOUN } from './words';

/** The series a chart draws. One per marked quantity, and no more. */
export type SeriesId = 'success' | 'better' | 'same' | 'worse';

export interface ChartSeries {
  readonly id: SeriesId;
  /** What the series is called where it is drawn. */
  readonly label: string;
  /** The glyph. Shape, never hue, is what separates two series. */
  readonly shape: 'circle' | 'square' | 'triangle';
  /**
   * Which interface colour paints it, named as a token of `InterfacePalette`.
   *
   * The token is the claim the contrast check measures over all six interface
   * palettes, and `statistics.test.tsx` binds each token to the variable the
   * shipped stylesheet really spends, so the claim and the paint cannot drift.
   */
  readonly ink: 'accent' | 'text' | 'textMuted';
}

/**
 * The four series, and every one of them is drawn.
 *
 * `success` and `better` share the circle on purpose: both are the good
 * outcome, and they never appear in the same chart, so no chart carries two
 * series of one shape.
 */
export const CHART_SERIES: Readonly<Record<SeriesId, ChartSeries>> = {
  success: { id: 'success', label: 'Rolls with a success', shape: 'circle', ink: 'accent' },
  better: { id: 'better', label: 'More successes than before', shape: 'circle', ink: 'accent' },
  same: { id: 'same', label: 'The same', shape: 'square', ink: 'textMuted' },
  worse: { id: 'worse', label: 'Fewer successes', shape: 'triangle', ink: 'text' },
};

/** The push outcomes, in the order a player reads them. Best first. */
export const OUTCOME_SERIES: readonly SeriesId[] = ['better', 'same', 'worse'];

/** What a rate reads as. One decimal place, so 2 of 3 is not rounded to 67. */
export function percentText(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

/**
 * What a rate that has no answer reads as.
 *
 * A log with no push has no answer to "did pushing pay off". Zero would read as
 * "pushing never paid off", which is a different claim, so the sentence says
 * there is nothing to answer with.
 */
export const NO_PUSH_TEXT = 'No roll has pushed yet.';

/** The sentence an empty log gets. It draws no chart, because it has no row. */
export const NO_ROLL_TEXT =
  'The log holds no roll, so there is nothing to chart. Throw the dice, or import a log you ' +
  'exported before.';

/**
 * The width of a bar, as a share of its track.
 *
 * Three decimal places. The drawn length is therefore within 0.0005 of a
 * percentage point of the number it carries, which is the bound the check
 * derives from this line rather than picking.
 */
export function barWidth(fraction: number): string {
  const held = Number.isFinite(fraction) ? Math.min(1, Math.max(0, fraction)) : 0;
  return `${(held * 100).toFixed(3)}%`;
}

/**
 * A count against a total, as a share.
 *
 * A total of zero has no share, and the caller draws no bar in that case. The
 * guard is here so no division by zero can reach a style attribute.
 */
export function shareOf(count: number, total: number): number {
  return total <= 0 ? 0 : count / total;
}

/** The glyph of one series. It carries no text, so a reader never meets it. */
function Glyph({ series }: { series: SeriesId }) {
  return <i class={`cmark c-${series}`} data-series={series} aria-hidden="true" />;
}

/** The bar of one value, inside the cell that already holds that value as text. */
function Bar({ path, series, fraction }: { path: string; series: SeriesId; fraction: number }) {
  return (
    <span class="chart-track" aria-hidden="true">
      <span
        class={`chart-bar s-${series}`}
        data-series={series}
        data-bar={path}
        style={{ width: barWidth(fraction) }}
      />
    </span>
  );
}

/** One term and one value, the shape the record view already uses. */
function Reading({
  term,
  path,
  wide,
  children,
}: {
  term: string;
  path: string;
  wide?: boolean;
  children: ComponentChildren;
}) {
  return (
    <div class={wide === true ? 'hist-pair chart-total' : 'hist-pair'}>
      <dt>{term}</dt>
      <dd data-stat={path}>{children}</dd>
    </div>
  );
}

/**
 * Chart 1 — the success rate by pool size.
 *
 * One row per size of pool the log holds, ascending. Rows scroll on a phone and
 * columns do not, which is the same reason Decision 3 transposed the matrix.
 */
function PoolSizeChart({ rows }: { rows: readonly PoolSizeRow[] }) {
  return (
    <div class="hist-mx-scroll">
      <table class="chart" data-el="chart-pool-size">
        <caption>
          The success rate by pool size. One row per size of pool the log holds. The bar is the
          share of rolls of that size that ended with one success or more.
        </caption>
        <thead>
          <tr>
            <th id="ps-size" scope="col">
              Dice
            </th>
            <th id="ps-rolls" scope="col">
              Rolls
            </th>
            <th id="ps-with" scope="col">
              With a success
            </th>
            <th id="ps-successes" scope="col">
              Successes
            </th>
            <th id="ps-rate" scope="col">
              <Glyph series="success" />
              Success rate
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, at) => (
            <tr key={`ps-${row.poolSize}`}>
              {/* The row header names the column it stands under, so a reader
                  reaches the pool size by a name and not by its bare digits. */}
              <th id={`ps-r${at}`} scope="row" headers="ps-size">
                <span data-stat={`byPoolSize.${at}.poolSize`}>{row.poolSize}</span>{' '}
                <small>dice</small>
              </th>
              <td headers={`ps-r${at} ps-rolls`} data-stat={`byPoolSize.${at}.rolls`}>
                {row.rolls}
              </td>
              <td headers={`ps-r${at} ps-with`} data-stat={`byPoolSize.${at}.rollsWithASuccess`}>
                {row.rollsWithASuccess}
              </td>
              <td headers={`ps-r${at} ps-successes`} data-stat={`byPoolSize.${at}.successes`}>
                {row.successes}
              </td>
              <td
                class="chart-cell"
                headers={`ps-r${at} ps-rate`}
                data-stat={`byPoolSize.${at}.successRate`}
              >
                <Bar
                  path={`byPoolSize.${at}.successRate`}
                  series="success"
                  fraction={row.successRate}
                />
                {percentText(row.successRate)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Chart 2 — what the pushes did.
 *
 * Three rows, one per outcome, each carrying its own glyph. The bar is the roll
 * count against `pushedRolls`, and both numbers are drawn, so the bar states no
 * quantity the record does not hold. A log with no push draws no bar at all,
 * because a count against a total of zero is not a share of anything.
 */
function PushOutcomeChart({ pushes }: { pushes: LogStatistics['pushes'] }) {
  const counts: Readonly<Record<'better' | 'same' | 'worse', number>> = {
    better: pushes.better,
    same: pushes.same,
    worse: pushes.worse,
  };
  return (
    <div class="hist-mx-scroll">
      <table class="chart" data-el="chart-push-outcomes">
        <caption>
          What the pushes did. One row per outcome, over the rolls that pushed. The bar is the roll
          count against that total. A shape marks every row, so the three read apart in grey.
        </caption>
        <thead>
          <tr>
            <th id="po-outcome" scope="col">
              Outcome
            </th>
            <th id="po-rolls" scope="col">
              Rolls
            </th>
          </tr>
        </thead>
        <tbody>
          {OUTCOME_SERIES.map((id) => {
            const series = CHART_SERIES[id];
            const count = counts[id as 'better' | 'same' | 'worse'];
            return (
              <tr key={id}>
                <th id={`po-${id}`} scope="row">
                  <Glyph series={id} />
                  {series.label}
                </th>
                <td class="chart-cell" headers={`po-${id} po-rolls`} data-stat={`pushes.${id}`}>
                  {pushes.pushedRolls > 0 ? (
                    <Bar
                      path={`pushes.${id}`}
                      series={id}
                      fraction={shareOf(count, pushes.pushedRolls)}
                    />
                  ) : null}
                  {count}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * The statistics view.
 *
 * It takes the record and nothing else. There is no log here to re-derive a
 * number from, which is the property `statistics.test.tsx` measures at the call
 * site by handing the destination a record that disagrees with its own log.
 */
export function Statistics({ stats }: { stats: LogStatistics }) {
  const units = Object.keys(COST_NOUN) as PushCostUnit[];
  return (
    <section class="stats" data-el="history-stats" aria-label="The charts over the whole log">
      <dl class="hist-dl">
        <Reading term="Rolls in the log" path="entriesRead" wide>
          {stats.entriesRead}
        </Reading>
      </dl>

      {stats.entriesRead === 0 ? (
        <p class="hist-empty" data-el="stats-empty">
          {NO_ROLL_TEXT}
        </p>
      ) : null}

      {stats.byPoolSize.length === 0 ? null : <PoolSizeChart rows={stats.byPoolSize} />}

      <PushOutcomeChart pushes={stats.pushes} />

      <dl class="hist-dl">
        <Reading term="Rolls that pushed" path="pushes.pushedRolls">
          {stats.pushes.pushedRolls}
        </Reading>
        <Reading term="Pushes" path="pushes.pushes">
          {stats.pushes.pushes}
        </Reading>
        <Reading term="Successes before the first push" path="pushes.successesBefore">
          {stats.pushes.successesBefore}
        </Reading>
        <Reading term="Successes after" path="pushes.successesAfter">
          {stats.pushes.successesAfter}
        </Reading>
        {/* The four cost units are different things and are never added
            together. Unit 4.7 states it in the module, and the screen keeps
            them apart by drawing one reading each. The list is the union
            itself, so a fifth unit is a type error and not a dropped column. */}
        {units.map((unit) => (
          <Reading key={unit} term={COST_NOUN[unit][1]} path={`pushes.costByUnit.${unit}`}>
            {stats.pushes.costByUnit[unit]}
          </Reading>
        ))}
      </dl>

      <dl class="hist-dl">
        <div class="hist-pair chart-meter">
          <dt>Pushing paid off</dt>
          <dd class="chart-cell" data-stat="paidOffRate">
            {stats.paidOffRate === null ? null : (
              <Bar path="paidOffRate" series="better" fraction={stats.paidOffRate} />
            )}
            {stats.paidOffRate === null ? NO_PUSH_TEXT : percentText(stats.paidOffRate)}
          </dd>
        </div>
        <div class="hist-pair chart-note">
          <dt>What that means</dt>
          <dd data-stat="paidOffDefinition">{stats.paidOffDefinition}</dd>
        </div>
      </dl>
    </section>
  );
}
