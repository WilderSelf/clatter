// @vitest-environment jsdom
//
// The theme picker and the colour builder's controls — the open half of Unit 4.8.
//
// Four claims need a document:
//
//   1. One group of six rows, with a role, a name and a state, and the six
//      names read out of the theme module rather than restated.
//   2. A colour the builder cannot use is REPORTED and never replaced. The
//      report names each finding, and the count of findings is the count both
//      checkers answered with, so a report that named one of five would fail.
//   3. Nothing is replaced: after a refusal the theme in force is the one that
//      was in force before it.
//   4. Every control carries a role, an accessible name and a state.
//
// What is NOT here: whether the screen really paints the palette. A rendered
// element is the only place that can answer that, so
// `node scripts/browser.mjs --theme` reads the computed style off the page.

import { render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import type { BuiltTheme } from '../theme/builder';
import { checkDiceTheme, checkPalette, findingSentence } from '../theme/builder';
import { appliedTheme } from '../theme/css-vars';
import { INTERFACE_PALETTES, THEME_IDS, TRAY_SURFACES } from '../theme/themes';
import { judgeBuilt, THEME_APPLIED_TEXT, THEME_ROWS_ELEMENT, ThemePanel } from './theme-panel';

let host: HTMLDivElement | null = null;

afterEach(() => {
  if (host) render(null, host);
  host?.remove();
  host = null;
});

interface Mounted {
  readonly rows: string[];
  readonly built: (BuiltTheme | null)[];
}

function mount(builtTheme: BuiltTheme | null = null): Mounted {
  host = document.createElement('div');
  document.body.append(host);
  const rows: string[] = [];
  const built: (BuiltTheme | null)[] = [];
  act(() => {
    render(
      <ThemePanel
        applied={appliedTheme({ themeId: 'ash', builtTheme })}
        themeId="ash"
        builtTheme={builtTheme}
        onChooseRow={(id) => rows.push(id)}
        onBuild={(next) => built.push(next)}
      />,
      host as HTMLDivElement,
    );
  });
  return { rows, built };
}

function element(name: string): HTMLElement {
  const found = host?.querySelector<HTMLElement>(`[data-el="${name}"]`);
  expect(found, `the panel holds ${name}`).not.toBeNull();
  return found as HTMLElement;
}

/** Type into a field the way a player does, and let the panel re-render. */
function typeInto(name: string, value: string): void {
  const field = element(name) as HTMLInputElement;
  act(() => {
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

function press(name: string): void {
  act(() => {
    element(name).dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

describe('the six rows', () => {
  it('draws six rows in one group, and each row carries a name and a state', () => {
    mount();
    const group = element(THEME_ROWS_ELEMENT);
    expect(group.tagName, 'the rows are a group').toBe('FIELDSET');
    const inputs = [...group.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
    // The six names come out of the theme module, so a seventh row appears
    // here without an edit and a row that is dropped fails this line.
    expect(
      inputs.map((each) => each.value),
      'the group draws one row per preset',
    ).toEqual([...THEME_IDS]);
    let counted = 0;
    for (const input of inputs) {
      const label = input.closest('label');
      expect(label?.textContent?.trim().length, `${input.value} carries a name`).toBeGreaterThan(0);
      counted += 1;
    }
    expect(counted, 'six rows were read').toBe(THEME_IDS.length);
    // One state, and only one.
    expect(inputs.filter((each) => each.checked).length, 'the group holds one state').toBe(1);
  });

  it('reports the row the player pressed, and reports one choice', () => {
    const seen = mount();
    const input =
      element(THEME_ROWS_ELEMENT).querySelector<HTMLInputElement>('input[value="oxblood"]');
    act(() => {
      input?.click();
    });
    // One id, so one call. There is no second axis to report separately.
    expect(seen.rows, 'one choice, and it names the row').toEqual(['oxblood']);
  });

  it('draws a swatch a reader never has to say', () => {
    mount();
    const swatches = [...(host?.querySelectorAll('.thm-sw') ?? [])];
    expect(swatches.length, 'one swatch per row').toBe(THEME_IDS.length);
    expect(
      swatches.filter((each) => each.getAttribute('aria-hidden') === 'true').length,
      'a swatch is decoration, because a colour has no name to say',
    ).toBe(swatches.length);
  });
});

describe('the colour builder', () => {
  it('takes a colour as text a reader can hear, beside a picker a pointer can reach', () => {
    mount();
    let fields = 0;
    for (const field of ['theme-dice-seed', 'theme-page-seed']) {
      const text = element(field) as HTMLInputElement;
      expect(text.type, `${field} is a text field`).toBe('text');
      const label = host?.querySelector(`label[for="${field}-text"]`);
      expect(label?.textContent?.trim().length, `${field} carries a label`).toBeGreaterThan(0);
      const picker = element(`${field}-pick`) as HTMLInputElement;
      expect(picker.type, `${field} has a picker beside it`).toBe('color');
      expect(
        picker.getAttribute('aria-label')?.length,
        'a bare swatch has no name, so the picker is given one',
      ).toBeGreaterThan(0);
      fields += 1;
    }
    expect(fields, 'the builder collects two colours').toBe(2);
  });

  it('refuses a colour that is not a colour, and says what one looks like', () => {
    const seen = mount();
    typeInto('theme-dice-seed', 'dark blue');
    press('theme-apply');
    expect(element('theme-report').textContent).toMatch(/#[0-9A-F]{6}/);
    expect(seen.built, 'nothing was applied').toEqual([]);
  });

  it('reports every reading a built theme misses, by name, and applies nothing', () => {
    const seen = mount();
    // Too dark to carry a control on a dark page. The builder keeps the colour
    // the player chose as the accent and says so, rather than lightening it.
    typeInto('theme-page-seed', '#1B2431');
    typeInto('theme-dice-seed', '#3CBFA5');
    press('theme-apply');

    // The oracle is the pair of checkers, run again here over the same theme.
    const judged = judgeBuilt(
      { diceSeed: '#3CBFA5', interfaceSeed: '#1B2431', mode: 'dark', exactDice: false },
      TRAY_SURFACES.ash,
    );
    expect(judged.findings.length, 'the theme really does miss its floors').toBeGreaterThan(0);
    const report = element('theme-report').textContent ?? '';
    let named = 0;
    for (const finding of judged.findings) {
      expect(report, `the report names ${finding.pair}`).toContain(findingSentence(finding));
      named += 1;
    }
    // The denominator is the checkers' own answer, so a report that named one
    // finding of five would fail here rather than read as a pass.
    expect(named, 'every finding reached the player').toBe(judged.findings.length);
    expect(report, 'the report states how many missed').toContain(String(judged.findings.length));
    expect(seen.built, 'a theme that misses a floor is not applied').toEqual([]);
  });

  it('reports both checkers, because a dice colour fails where a page colour does not', () => {
    const seen = mount();
    // A page colour that is fine, and a dice colour whose body swallows the
    // black numeral. `checkDiceTheme` is the one that answers for it.
    typeInto('theme-page-seed', '#FF8B68');
    typeInto('theme-dice-seed', '#050505');
    // The player asked for that colour ON the dice, which is the route that
    // makes `checkDiceTheme` able to answer at all: a laddered set is readable
    // by construction, so nothing derived can fail it.
    act(() => {
      element('theme-exact-dice').querySelector('input')?.click();
    });
    press('theme-apply');
    const report = element('theme-report').textContent ?? '';
    const palette = checkPalette(
      judgeBuilt(
        { diceSeed: '#050505', interfaceSeed: '#FF8B68', mode: 'dark', exactDice: true },
        TRAY_SURFACES.ash,
      ).palette,
      [TRAY_SURFACES.ash],
    );
    const dice = checkDiceTheme(
      judgeBuilt(
        { diceSeed: '#050505', interfaceSeed: '#FF8B68', mode: 'dark', exactDice: true },
        TRAY_SURFACES.ash,
      ).diceColours,
      [TRAY_SURFACES.ash],
    );
    expect(palette, 'the page colour is usable, so the palette reports nothing').toEqual([]);
    expect(dice.length, 'the dice colour is not usable').toBeGreaterThan(0);
    for (const finding of dice) {
      expect(report, `the report names ${finding.pair}`).toContain(findingSentence(finding));
    }
    expect(seen.built, 'nothing was applied').toEqual([]);
  });

  it('applies a theme both checkers pass, and keeps the colour the player chose', () => {
    const seen = mount();
    typeInto('theme-page-seed', '#3CBFA5');
    typeInto('theme-dice-seed', '#FF8B68');
    press('theme-apply');
    expect(element('theme-report').textContent).toBe(THEME_APPLIED_TEXT);
    expect(seen.built, 'the two seeds and the mode are what is stored').toEqual([
      { diceSeed: '#FF8B68', interfaceSeed: '#3CBFA5', mode: 'dark', exactDice: false },
    ]);
    const applied = appliedTheme({ themeId: 'ash', builtTheme: seen.built[0] ?? null });
    expect(applied.palette.accent, 'the accent is the colour the player typed').toBe('#3CBFA5');
    expect(applied.palette, 'a built palette is not a shipped row').not.toBe(
      INTERFACE_PALETTES.ash,
    );
  });

  it('gives the way back to the rows, and offers it only while a theme is built', () => {
    const off = mount(null);
    expect((element('theme-clear') as HTMLButtonElement).disabled, 'nothing to clear').toBe(true);
    expect(off.built).toEqual([]);

    const on = mount({
      diceSeed: '#FF8B68',
      interfaceSeed: '#3CBFA5',
      mode: 'dark',
      exactDice: false,
    });
    expect((element('theme-clear') as HTMLButtonElement).disabled).toBe(false);
    press('theme-clear');
    expect(on.built, 'the way back clears the built theme').toEqual([null]);
  });
});

describe('every control', () => {
  it('carries a role, an accessible name and a state, and none is unnamed', () => {
    mount();
    const controls = [...(host?.querySelectorAll<HTMLElement>('input, button') ?? [])].filter(
      (each) => each.getAttribute('aria-hidden') !== 'true',
    );
    const unnamed = controls.filter((each) => {
      const label = each.closest('label')?.textContent?.trim() ?? '';
      const forLabel = each.id
        ? (host?.querySelector(`label[for="${each.id}"]`)?.textContent ?? '')
        : '';
      return (
        (each.getAttribute('aria-label') ?? '').length === 0 &&
        label.length === 0 &&
        forLabel.trim().length === 0 &&
        (each.textContent ?? '').trim().length === 0
      );
    });
    expect(controls.length, 'the panel holds controls to walk').toBeGreaterThan(0);
    expect(
      unnamed.map((each) => each.getAttribute('data-el') ?? each.tagName),
      'every control carries a name',
    ).toEqual([]);
    // The state of a chosen row, plus the page mode of the builder.
    const groups = [THEME_ROWS_ELEMENT, 'theme-mode'];
    let stated = 0;
    for (const group of groups) {
      const inputs = [...element(group).querySelectorAll<HTMLInputElement>('input[type="radio"]')];
      expect(inputs.filter((each) => each.checked).length, `${group} states one choice`).toBe(1);
      stated += 1;
    }
    expect(stated, 'two groups state a choice').toBe(groups.length);
  });
});
