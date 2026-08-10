// @vitest-environment jsdom
//
// The automated audit — Unit 4.11.
//
// The plan asks for "a pinned, named automated audit in CI", and says in the
// same breath why it is the SECOND check: an audit of a canvas application
// passes while the application is unusable by keyboard. The keyboard walk in
// `src/app.test.tsx` is the first check. This one is the sweep that catches the
// classes a hand-written check never thinks of.
//
// **The tool is axe-core 4.13.0, MPL-2.0, pinned to an exact version.**
// Decision 20 of `docs/design/0012-settled-decisions.md` settles the licence
// question and prices the alternatives. In short: the obligations of MPL-2.0
// attach to distributing the covered files, this repository distributes none of
// them, and running a tool is not copying from it. `scripts/check-bundle-size.mjs`
// proves no byte of it reaches `dist/`.
//
// **What the audit can see here, and what it cannot.** jsdom lays nothing out
// and computes no colour, so the contrast rule can only ever answer "incomplete".
// That answer is DECLARED below with the place the same claim is really
// measured, and the declared set is compared for equality rather than for
// membership, so a new incomplete rule is a red and cannot hide inside the list.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import axe from 'axe-core';
import type { AxeResults, Result } from 'axe-core';
import { App } from '../app';
import type { TrayProbe } from '../app';
import type { TrayDecision } from '../tray/capability';
import { seededRandom } from '../rules/seeded-random';

/** The tags the audit runs. Narrowing this list is what the floor below stops. */
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

/**
 * The fewest rules a run may execute.
 *
 * Every rule axe knows ends in one of four buckets, so the four sum to the
 * number of rules that ran. A `runOnly` list quietly cut to one tag drops that
 * sum, which is the way an audit is most easily made to pass. Measured at 91 on
 * 2026-08-10 over the opening screen.
 */
const RULES_RUN_FLOOR = 85;

/**
 * Every finding the audit is allowed to answer "incomplete" on, with the reason
 * and the instrument that judges the same claim for real.
 *
 * A finding here is NOT forgiven. It is moved to a named instrument, and the
 * comparison below is set equality, so a rule that joins this answer without
 * joining this list turns the run red.
 */
const DECLARED_INCOMPLETE: Readonly<Record<string, string>> = {
  'color-contrast':
    'jsdom computes no colour and lays nothing out, so axe can never decide this here. ' +
    'The same claim is measured in full by src/theme/css-vars.test.ts over the six interface ' +
    'palettes, by src/shell/statistics.test.tsx over the chart inks, and on real pixels by ' +
    'node scripts/browser.mjs --theme.',
};

const pendingProbe: TrayProbe = () => new Promise<TrayDecision>(() => {});

let root: HTMLElement | null = null;

afterEach(() => {
  if (root !== null) {
    act(() => render(null, root as HTMLElement));
    root.remove();
    root = null;
  }
});

function element(name: string): HTMLElement {
  const found = document.querySelector<HTMLElement>(`[data-el="${name}"]`);
  if (found === null) throw new Error(`the screen holds no ${name}`);
  return found;
}

function click(target: Element): void {
  act(() => {
    (target as HTMLElement).click();
  });
}

function plus(cell: string): void {
  click(element(cell).querySelector('.cell-p') as Element);
}

/** One finding, flattened to the line a failure prints. */
function lineOf(found: Result): string {
  return `${found.id} (${String(found.impact)}) x${found.nodes.length} at ${found.nodes
    .map((node) => String(node.target))
    .slice(0, 4)
    .join(' | ')}`;
}

async function audit(): Promise<AxeResults> {
  return axe.run(document.body, { runOnly: { type: 'tag', values: TAGS } });
}

describe('the automated audit', () => {
  it('is named and pinned to one exact version', () => {
    const held = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8')) as Record<
      string,
      Record<string, string>
    >;
    const pinned = held.devDependencies?.['axe-core'];
    expect(pinned, 'the audit is a devDependency and never a dependency').toBeDefined();
    expect(held.dependencies?.['axe-core'], 'the audit never ships').toBeUndefined();
    // An exact version and nothing else. A caret or a tilde would let the audit
    // change under a build nobody ran, and a pinned audit is what the plan asks
    // for. `scripts/check-bundle-size.mjs` proves the same package reaches no
    // built file.
    expect(pinned, 'the version is exact, with no range operator').toMatch(/^\d+\.\d+\.\d+$/);
    expect(axe.version, 'the installed tool is the pinned one').toBe(pinned);
  });

  it('finds nothing over every state the screen reaches, and runs its whole ruleset', async () => {
    root = document.createElement('div');
    document.body.appendChild(root);
    act(() =>
      render(
        <App probe={pendingProbe} store={null} random={seededRandom(5)} />,
        root as HTMLElement,
      ),
    );

    // Each state names what proves it was REACHED. A state that failed to open
    // would otherwise be audited twice under two names, and the second name
    // would report the first state's findings.
    const states: { name: string; reach: () => void; proof: string }[] = [
      { name: 'rest A, the empty pool', reach: () => {}, proof: 'pool-bar' },
      {
        name: 'rest A, a built pool',
        reach: () => {
          plus('pool-cell-attribute');
          plus('pool-cell-attribute');
          plus('pool-cell-stress');
        },
        proof: 'difficulty',
      },
      {
        name: 'rest B, a roll on the table',
        reach: () => click(element('roll-button')),
        proof: 'dice-tray',
      },
      {
        name: 'rest B, a pushed roll',
        reach: () => click(element('push-button')),
        proof: 'push-button',
      },
      {
        name: 'the disclosure sheet',
        reach: () => click(element('disclosure-toggle')),
        proof: 'disclosure-sheet',
      },
      {
        name: 'the history destination',
        reach: () => click(element('sheet-history')),
        proof: 'history',
      },
    ];

    const audited: string[] = [];
    const violations: string[] = [];
    const incomplete = new Set<string>();
    let ranAtLeast = Number.POSITIVE_INFINITY;

    for (const state of states) {
      state.reach();
      // The push must be live at this seed, or the fourth state is the third
      // one under another name.
      if (state.name.includes('pushed')) {
        expect(
          (element('push-button') as HTMLButtonElement).disabled,
          'seed 5 leaves a push the profile allows',
        ).toBe(false);
      }
      expect(element(state.proof), `${state.name} was reached`).not.toBeNull();
      const results = await audit();
      audited.push(state.name);
      for (const found of results.violations) violations.push(`${state.name}: ${lineOf(found)}`);
      for (const found of results.incomplete) incomplete.add(found.id);
      const ran =
        results.passes.length +
        results.violations.length +
        results.incomplete.length +
        results.inapplicable.length;
      ranAtLeast = Math.min(ranAtLeast, ran);
    }

    // The denominator of the sweep: six states, every one reached and audited.
    expect(audited.length, 'every declared state was audited').toBe(states.length);
    expect(audited.length, 'the sweep covers more than one screen').toBeGreaterThanOrEqual(6);

    // The denominator of the ruleset: a `runOnly` list cut down to make the
    // audit quiet drops the number of rules that ran.
    expect(
      ranAtLeast,
      `the thinnest state ran ${String(ranAtLeast)} rules, over the ${String(TAGS.length)} tags`,
    ).toBeGreaterThanOrEqual(RULES_RUN_FLOOR);

    expect(violations, 'the audit reports no finding it can decide').toEqual([]);

    // Set equality, not membership. A rule that starts answering "incomplete"
    // has to be declared with its reason before this passes again.
    expect([...incomplete].sort(), 'every undecided rule is declared with its reason').toEqual(
      Object.keys(DECLARED_INCOMPLETE).sort(),
    );
    for (const [rule, reason] of Object.entries(DECLARED_INCOMPLETE)) {
      expect(reason.length, `${rule} carries a reason and an instrument`).toBeGreaterThan(60);
    }
  }, 60000);
});
