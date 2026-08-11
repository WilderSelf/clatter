// The theme picker and the colour builder's controls — Unit 4.8.
//
// Section 4 of `docs/design/0002-screen-design.md` gave `sheet-theme` three
// axes plus the colour builder. The theme is ONE choice now — the dice, the
// table and the page all follow it — so the picker is one group of six rows.
// That row of section 4, and the role bullet of section 7, both carry an
// amendment dated 2026-08-11 that records the collapse.
//
// **One group, one control.** A group of radio buttons is one tab stop and its
// arrow keys move inside it, which is section 2 of the screen design and the
// rule `sheet-ruleset` already follows. The name of the row is the label, and
// the swatch beside it is `aria-hidden` decoration: a control that is only a
// colour swatch has no name a reader can say and no state a reader can hear.
//
// **The builder collects a colour as text.** The hex field is the control that
// carries the name and the value, and the native colour control beside it is a
// second way to reach the same value for a player who would rather point. Both
// write one draft, so neither one can hold a colour the other does not.
//
// **A colour the builder cannot use is reported, never replaced.** `checkPalette`
// and `checkDiceTheme` answer with a list of findings, `findingSentence` puts
// each one in words, and the report names every one of them. The theme is not
// applied while a finding stands, and the report says so: a set that fails a
// contrast floor is a set a player cannot read, and quietly substituting another
// colour would hide the answer the player asked for.

import { useState } from 'preact/hooks';
import type { BuiltTheme, ContrastFinding } from '../theme/builder';
import {
  buildTheme,
  checkDiceTheme,
  checkPalette,
  findingSentence,
  readSeed,
} from '../theme/builder';
import type { AppliedTheme } from '../theme/css-vars';
import type { DiceTheme, InterfacePalette, ThemeId } from '../theme/themes';
import { INTERFACE_PALETTES, THEME_IDS } from '../theme/themes';

/** What each shipped row is called on the screen. One name per row, six rows. */
const ROW_WORDS: Readonly<Record<ThemeId, string>> = {
  leather: 'Leather',
  ash: 'Ash',
  moss: 'Moss',
  bone: 'Bone',
  iron: 'Iron',
  oxblood: 'Oxblood',
};

/** The group of rows, and the words above and below it. */
export const THEME_ROWS_ELEMENT = 'theme-rows';
export const THEME_ROWS_LEGEND = 'Colour';
export const THEME_ROWS_NOTE = 'One colour for the dice, the table and the page.';

/** The words the report opens with when nothing failed. */
export const THEME_APPLIED_TEXT = 'This theme is on the screen now.';
export const THEME_CLEARED_TEXT = 'The chosen row is back on the screen.';
export const THEME_BAD_SEED_TEXT =
  'A colour is six hexadecimal digits after a hash, like #4488FF. Both fields need one.';

/** The opening of the sentence that carries the findings. */
export function refusalText(findings: readonly ContrastFinding[]): string {
  return (
    `This theme is not on the screen. ${findings.length} ` +
    `${findings.length === 1 ? 'reading misses its floor' : 'readings miss their floor'}. ` +
    findings.map(findingSentence).join(' ')
  );
}

/**
 * The six rows, drawn as one group with a roving arrow walk.
 *
 * The swatch is the page of the row under its accent, split on the diagonal.
 * The accent is what separates all six by eye, because five pages are dark and
 * every table is dark. The page half is there for one row: `bone` is the light
 * theme and its accent is dark, so an accent alone would say the opposite of
 * what the row does.
 */
function Rows({ chosen, onChoose }: { chosen: ThemeId; onChoose: (id: ThemeId) => void }) {
  return (
    <fieldset class="ovr-set" data-el={THEME_ROWS_ELEMENT}>
      <legend>{THEME_ROWS_LEGEND}</legend>
      <div class="thm-rows">
        {THEME_IDS.map((id) => (
          <label key={id} class="choice thm-row">
            <input
              type="radio"
              name="theme-row"
              value={id}
              checked={chosen === id}
              onChange={() => onChoose(id)}
            />
            <i
              class="thm-sw"
              style={
                `background:linear-gradient(135deg,${INTERFACE_PALETTES[id].accent} 0 50%,` +
                `${INTERFACE_PALETTES[id].background} 50% 100%)`
              }
              aria-hidden="true"
            />
            {ROW_WORDS[id]}
          </label>
        ))}
      </div>
      <p class="sheet-note">{THEME_ROWS_NOTE}</p>
    </fieldset>
  );
}

/** One colour field: the hex a reader hears, and the swatch a pointer reaches. */
function SeedField({
  element,
  label,
  value,
  onChange,
}: {
  element: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div class="thm-seed">
      <label class="ovr-line ovr-label" for={`${element}-text`}>
        {label}
      </label>
      <input
        class="ovr-input"
        id={`${element}-text`}
        data-el={element}
        type="text"
        inputMode="text"
        spellcheck={false}
        autocomplete="off"
        maxLength={7}
        value={value}
        onInput={(event) => onChange(event.currentTarget.value)}
      />
      {/* The same value, for a player who would rather point than type. It
          carries a name of its own, because a bare swatch has none. */}
      <input
        class="thm-pick"
        data-el={`${element}-pick`}
        type="color"
        aria-label={`${label}, as a colour picker`}
        value={readSeed(value) ?? '#000000'}
        onInput={(event) => onChange(event.currentTarget.value.toUpperCase())}
      />
    </div>
  );
}

export interface ThemePanelProps {
  readonly applied: AppliedTheme;
  readonly themeId: ThemeId;
  readonly builtTheme: BuiltTheme | null;
  readonly onChooseRow: (id: ThemeId) => void;
  readonly onBuild: (built: BuiltTheme | null) => void;
}

/**
 * Judge a theme a player built.
 *
 * The tray surface in force is passed to both checkers, because the two claims
 * that leave the palette — a readout over the tray, and a die body on the tray —
 * are the two a built theme can break: it replaces the dice and the page and
 * leaves the table the shipped row.
 */
export function judgeBuilt(
  built: BuiltTheme,
  traySurfaceColour: string,
): {
  readonly palette: InterfacePalette;
  readonly diceColours: DiceTheme;
  readonly findings: readonly ContrastFinding[];
} {
  const { palette, diceColours } = buildTheme(built);
  return {
    palette,
    diceColours,
    findings: [
      ...checkPalette(palette, [traySurfaceColour]),
      ...checkDiceTheme(diceColours, [traySurfaceColour]),
    ],
  };
}

export function ThemePanel({
  applied,
  themeId,
  builtTheme,
  onChooseRow,
  onBuild,
}: ThemePanelProps) {
  const [diceSeed, setDiceSeed] = useState(builtTheme?.diceSeed ?? applied.diceColours.gear);
  const [interfaceSeed, setInterfaceSeed] = useState(
    builtTheme?.interfaceSeed ?? applied.palette.accent,
  );
  const [mode, setMode] = useState<'dark' | 'light'>(builtTheme?.mode ?? 'dark');
  const [exactDice, setExactDice] = useState(builtTheme?.exactDice ?? false);
  const [report, setReport] = useState('');

  const apply = (): void => {
    const dice = readSeed(diceSeed);
    const page = readSeed(interfaceSeed);
    if (dice === null || page === null) {
      setReport(THEME_BAD_SEED_TEXT);
      return;
    }
    const built: BuiltTheme = { diceSeed: dice, interfaceSeed: page, mode, exactDice };
    const judged = judgeBuilt(built, applied.traySurfaceColour);
    if (judged.findings.length > 0) {
      setReport(refusalText(judged.findings));
      return;
    }
    onBuild(built);
    setReport(THEME_APPLIED_TEXT);
  };

  return (
    <fieldset class="field" data-el="sheet-theme">
      <legend>Theme</legend>
      <Rows chosen={themeId} onChoose={onChooseRow} />
      <fieldset class="ovr-set" data-el="theme-builder">
        <legend>Build your own</legend>
        <SeedField
          element="theme-dice-seed"
          label="Dice colour"
          value={diceSeed}
          onChange={setDiceSeed}
        />
        <SeedField
          element="theme-page-seed"
          label="Page colour"
          value={interfaceSeed}
          onChange={setInterfaceSeed}
        />
        {/* The player's own trade. Off, the six dice are derived around the
            chosen colour and read by construction. On, that colour itself goes
            on the die nearest its lightness, and the report prices whatever
            that costs. Nothing is replaced either way. */}
        <label class="choice" data-el="theme-exact-dice">
          <input
            type="checkbox"
            checked={exactDice}
            onChange={(event) => setExactDice(event.currentTarget.checked)}
          />
          Put my dice colour on the dice, unchanged
        </label>
        <fieldset class="ovr-set" data-el="theme-mode">
          <legend>Page</legend>
          {(['dark', 'light'] as const).map((each) => (
            <label key={each} class="choice">
              <input
                type="radio"
                name="theme-mode"
                value={each}
                checked={mode === each}
                onChange={() => setMode(each)}
              />
              {each === 'dark' ? 'Dark' : 'Light'}
            </label>
          ))}
        </fieldset>
        <div class="pre-acts">
          <button class="pre-btn" type="button" data-el="theme-apply" onClick={apply}>
            Use this theme
          </button>
          <button
            class="pre-btn"
            type="button"
            data-el="theme-clear"
            disabled={builtTheme === null}
            onClick={() => {
              onBuild(null);
              setReport(THEME_CLEARED_TEXT);
            }}
          >
            Use the row above
          </button>
        </div>
        {/* The report. It is a live region, so a finding is spoken when it
            arrives, and it is empty until the player presses something. The
            text goes in through `textContent`, because a colour a player typed
            is user text. Constraint 8. */}
        <p class="sheet-note" data-el="theme-report" role="status">
          {report}
        </p>
      </fieldset>
    </fieldset>
  );
}
