// The drawn screen, held against the rules core.
//
// `docs/design/0013-screen-final.html` is the source of truth for every later
// interface unit, so two things about it must stay true and neither may be
// asserted by eye.
//
// 1. **The draw target is derived.** `worstCaseState` in `./state.ts` builds the
//    largest first roll the caps, the artifact ladder and the difficulty rule
//    allow. The drawn screen holds exactly that many dice. Raise a cap, lengthen
//    `ARTIFACT_LADDER`, widen `MODIFIER_LIMIT` or wire `addHelp`, and this test
//    goes red and names the layout as needing a re-measure. The number itself is
//    written down nowhere.
//
// 2. **The drawn state is reachable.** The screen it draws is rebuilt here from
//    the core, face by face, and compared. An earlier drawing showed two stress
//    banes beside a live `Push`, which the third profile cannot produce: a bane
//    on a stress die blocks every further push. A drawing the rules refuse
//    teaches every later unit the wrong screen, so the core is the judge.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { latestValue } from '../rules/die';
import { previewPush } from '../rules/push';
import { seededRandom } from '../rules/seeded-random';
import type { AppState } from './state';
import {
  costLine,
  dieView,
  profileOf,
  pushNote,
  readout,
  rollNow,
  throwDice,
  toggleDie,
  worstCaseState,
  zonesOf,
} from './state';

const root = process.cwd();
const HTML = readFileSync(resolve(root, 'docs/design/0013-screen-final.html'), 'utf8');
const DESIGN = readFileSync(resolve(root, 'docs/design/0002-screen-design.md'), 'utf8');

/** The seed and the presses section 8 names. Both are read back from it below. */
const SEED = 12;
const CHOSEN = ['At2', 'Ge1'];

/** The roll pane alone. The builder pane draws the same tray a second time. */
function pane(name: string): string {
  const from = HTML.indexOf(`<section class="pane" data-pane="${name}">`);
  const to = HTML.indexOf('<section class="pane"', from + 1);
  if (from < 0) throw new Error(`the drawn screen holds no ${name} pane`);
  return HTML.slice(from, to < 0 ? HTML.length : to);
}

interface DrawnSlot {
  readonly name: string;
  readonly state: string;
  readonly value: number;
}

/** Every die the pane draws, in document order, with its lock state and face. */
function drawnSlots(html: string): DrawnSlot[] {
  const found = [
    ...html.matchAll(
      /class="slot (rule|choice|loose)[^"]*" data-el="(die-[a-z0-9]+)">\s*<span class="die ([^"]+)">([^<]*)/g,
    ),
  ];
  return found.map(([, state, name, face, text]) => ({
    name: name ?? '',
    state: state ?? '',
    value: face === 'num' ? Number(text) : Number(/f(\d+)/.exec(face ?? '')?.[1]),
  }));
}

/** The state the drawn screen draws, rebuilt from the core. */
function drawnState(): AppState {
  let held = rollNow(worstCaseState(), seededRandom(SEED));
  for (const tag of CHOSEN) {
    const die = held.result?.dice.find((each) => dieView(each, profileOf(held)).tag === tag);
    if (die === undefined) throw new Error(`the pool holds no die called ${tag}`);
    held = toggleDie(held, die.id);
  }
  return held;
}

describe('the draw target', () => {
  it('is derived from the caps, and the drawn screen holds that many dice', () => {
    const target = throwDice(worstCaseState()).length;

    // The derivation, spelled out once so a wrong cap cannot pass quietly: five
    // attribute, five skill, three gear, two artifact d12 from the top of the
    // ladder, two bonus and ten stress, plus three bonus dice from the
    // difficulty. Both sides are computed and neither is typed.
    expect(target).toBeGreaterThan(0);
    for (const name of ['roll', 'builder']) {
      expect(drawnSlots(pane(name)).length, `the ${name} pane draws the draw target`).toBe(target);
    }

    // A push adds dice on top of the target, so the target is a draw size and
    // not a ceiling. The third profile adds one stress die per push and holds
    // no push limit, which is why Decision 1 records no ceiling at all.
    const held = drawnState();
    const preview = previewPush(held.result!, profileOf(held));
    if (preview.kind !== 'available') throw new Error('the drawn state refuses a push');
    expect(preview.rerollCount, 'the next push throws more dice than the zone holds').toBe(
      zonesOf(held).loose.length + 1,
    );
  });

  it('draws the tallest split of the target, not the shortest', () => {
    // The phone draws five dice to a row, measured at 360 px in the drawn file.
    // Two zones of five columns hold `ceil(kept/5) + ceil(loose/5)` rows, and
    // that sum is one row taller for most splits than for a split that fills
    // every row. A drawing of the short split would measure a case that cannot
    // fail.
    const columns = 5;
    const target = throwDice(worstCaseState()).length;
    const rows = (count: number) => Math.ceil(count / columns);
    const zones = zonesOf(drawnState());
    const tallest = Math.max(
      ...Array.from(
        { length: target - 1 },
        (_, index) => rows(index + 1) + rows(target - index - 1),
      ),
    );
    expect(rows(zones.kept.length) + rows(zones.loose.length)).toBe(tallest);
  });
});

describe('the state the drawn screen draws', () => {
  it('is a state the rules produce, and section 8 names how to reach it', () => {
    const held = drawnState();
    const profile = profileOf(held);
    const zones = zonesOf(held);
    const wanted = [...zones.kept, ...zones.loose].map((die) => {
      const view = dieView(die, profile);
      return { name: view.element, state: view.state, value: latestValue(die) };
    });

    // Every die, in the order the tray holds it, with the lock state and the
    // face the core gives it. Not a sample: the whole tray.
    expect(drawnSlots(pane('roll'))).toEqual(wanted);
    expect(drawnSlots(pane('builder'))).toEqual(wanted);

    // The push is live, and no stress die shows a bane. The two go together
    // under this profile, and the earlier drawing broke exactly that pair.
    expect(previewPush(held.result!, profile).kind).toBe('available');
    expect(
      zones.kept
        .concat(zones.loose)
        .filter((die) => die.type === 'stress' && latestValue(die) === 1),
    ).toEqual([]);

    // Section 8 names the seed and the presses. It is checked, not trusted.
    const named =
      /from seed (\d+), under the third profile, with `([A-Za-z0-9]+)` and `([A-Za-z0-9]+)` pressed to keep/.exec(
        DESIGN,
      );
    if (named === null) throw new Error('section 8 no longer names the seed and the presses');
    expect([Number(named[1]), named[2], named[3]]).toEqual([SEED, ...CHOSEN]);
  });

  it('prints the numbers the core derives, in the header, the bands and the footer', () => {
    const held = drawnState();
    const zones = zonesOf(held);
    const numbers = readout(held);
    const roll = pane('roll');
    const line = (pattern: RegExp) => pattern.exec(roll)?.[1] ?? '';

    expect(Number(line(/mark s"><\/i>(\d+)</))).toBe(numbers.successes);
    expect(Number(line(/mark b"><\/i>(\d+)</))).toBe(numbers.banes);
    expect(Number(line(/st-dim">(\d+) dice</))).toBe(numbers.dice);
    expect(Number(line(/st-warn">stress (\d+)</))).toBe(numbers.stress);
    expect(Number(line(/st-dim">push (\d+)</))).toBe(numbers.pushes);

    expect(Number(line(/Kept <span>(\d+) dice/))).toBe(zones.kept.length);
    expect(Number(line(/In the cup <span>(\d+) dice/))).toBe(zones.loose.length);

    // The cost row and the push button read what `previewPush` answers, which
    // section 7 requires: the number the player commits to is the number the
    // rules apply.
    expect(
      line(/<p class="cost-t">([\s\S]*?)<\/p>/)
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim(),
    ).toBe(costLine(held));
    expect(line(/Push<small>([^<]+)</)).toBe(pushNote(held));
    expect(Number(line(/Roll again<small>(\d+) dice/))).toBe(throwDice(held).length);
  });
});
