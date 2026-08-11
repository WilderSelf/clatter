// The theme, as data.
//
// A theme is ONE choice. The dice, the surface they land on and the interface
// around the tray all follow it, so the six presets give six screens and not a
// grid of parts a player has to assemble. The three records below are still
// three records, because each one holds a different kind of colour, but they
// are read with ONE key and `ThemeId` is that key.
//
// The six names read as materials: `leather`, `ash`, `moss`, `bone`, `iron`
// and `oxblood`. Every one is a generic colour or material word.
//
// **A new variant is a new row.** Every colour below is a literal. No resolver
// derives one, so a seventh preset is a seventh row and nothing else changes.
// `builder.ts` holds the arithmetic that derives a colour, and it serves the
// colour a player picks, not the rows here.
//
// **The rows were derived, then written down.** Each row below came out of
// `builder.ts` from one seed pair — one colour for the dice ladder and one for
// the page — so the six shipped rows and a theme a player builds answer to one
// arithmetic and one set of lightness targets. The seeds are recorded beside
// each record. Deriving again is how a row is retuned; nothing derives at run
// time.
//
// What is measured, and where:
//   * `theme.test.ts` measures every contrast claim over these rows.
//   * `dice-colors.test.ts` keeps the Unit 3.3 claims over the `ash` dice row.
//   * `css-vars.test.ts` measures the same claims on the RENDERED screen, over
//     the roles `src/shell.css` really spends, and measures that one id moves
//     all three records together.

import type { DieType } from '../rules/die';
import { DIE_TYPE_COLOR } from '../tray/dice-colors';

export const THEME_IDS = ['leather', 'ash', 'moss', 'bone', 'iron', 'oxblood'] as const;

export type ThemeId = (typeof THEME_IDS)[number];

/** One body colour per dice type. The tray multiplies it into a white face. */
export type DiceTheme = Readonly<Record<DieType, string>>;

/**
 * The interface colours. Every one of them is a colour text or a control is
 * drawn in, or a colour one of those sits on.
 *
 * `onTray` is the odd one. It is the colour of a readout drawn over the tray —
 * the cost of a push, a die count — so it answers to the tray surface and not
 * to `background`. A built palette can land over any shipped surface, which is
 * why the readout is still measured against all six surfaces and the text
 * pairs are measured against six palettes.
 */
export interface InterfacePalette {
  /** The page behind everything. */
  readonly background: string;
  /** A panel or a card lifted off the page. */
  readonly surface: string;
  /** Body text. */
  readonly text: string;
  /** Text that carries less weight. Still body text, still 4.5 to 1. */
  readonly textMuted: string;
  /** A control, a focus ring, a selected state. Not text. */
  readonly accent: string;
  /** Text drawn on the accent. It is drawn on a mark as well. */
  readonly onAccent: string;
  /** A readout drawn over the tray surface. */
  readonly onTray: string;
  /**
   * A well pressed into the page: the cost row, the chart track, the warning
   * pad. Body text is drawn on it, so it answers the text floor as well.
   */
  readonly sunken: string;
  /**
   * The boundary of a control.
   *
   * A button, a pool tile and a text field are all told from the page by their
   * boundary rather than by their ground, so this is a graphical object under
   * WCAG 2.2 SC 1.4.11 and it holds 3 to 1 against both grounds. It is not a
   * decoration and it is not text.
   */
  readonly line: string;
  /**
   * The success mark and the bane mark.
   *
   * They do not follow the theme, and that is deliberate: a success is green
   * and a bane is warm in every palette, so the meaning does not move when the
   * page does. Shape carries the same meaning — a circle and a triangle — so
   * neither one rides on hue. The two answer the non-text floor against every
   * ground they are drawn on, and `onAccent` is the text drawn on them.
   */
  readonly markSuccess: string;
  readonly markBane: string;
}

/**
 * The dice.
 *
 * Each row is a lightness ladder: stress is the darkest and attribute the
 * lightest, and every rung is about nine CIE L* apart. Unit 3.3 set that ladder
 * for one theme and `theme.test.ts` asserts it again for all six, because an
 * invariant proven for one instance does not compose.
 *
 * Five rows are `deriveDiceTheme(seed)` written down, from these seeds:
 * `leather` #9A5410, `moss` #64883C, `bone` #A8863F, `iron` #55809D and
 * `oxblood` #9C3A2A. Each seed is a weathered colour rather than a bright one,
 * so a row reads as a material.
 *
 * `ash` is the neutral row and it *is* the Unit 3.3 table, imported rather than
 * copied. It spends the whole hue circle, because a neutral theme constrains no
 * hue, and it is the one row a seed cannot state: a derived row holds one hue.
 *
 * The comment on each colour records the CIE L* it measures. It is a note, not
 * an input: every check computes L* from the hex beside it.
 */
export const DICE_THEMES: Readonly<Record<ThemeId, DiceTheme>> = {
  leather: {
    stress: '#A56629', // L* 49
    artifact: '#B4814E', // L* 58
    gear: '#C49C74', // L* 67
    skill: '#D4B69A', // L* 76
    bonus: '#E4D2BF', // L* 85
    attribute: '#F4ECE5', // L* 94
  },
  ash: DIE_TYPE_COLOR,
  moss: {
    stress: '#5D7F38', // L* 49
    artifact: '#769652', // L* 58
    gear: '#92AB76', // L* 67
    skill: '#AFC19A', // L* 76
    bonus: '#CDD9C0', // L* 85
    attribute: '#EBEFE6', // L* 94
  },
  bone: {
    stress: '#8D7135', // L* 49
    artifact: '#A88740', // L* 58
    gear: '#BAA068', // L* 67
    skill: '#CDB991', // L* 76
    bonus: '#E0D4BA', // L* 85
    attribute: '#F2EDE3', // L* 94
  },
  iron: {
    stress: '#517995', // L* 49
    artifact: '#6B90AA', // L* 58
    gear: '#8AA7BB', // L* 67
    skill: '#A9BECD', // L* 76
    bonus: '#C9D7E0', // L* 85
    attribute: '#E9EFF2', // L* 94
  },
  oxblood: {
    stress: '#AE5E51', // L* 49
    artifact: '#BC7B70', // L* 58
    gear: '#CA978E', // L* 67
    skill: '#D9B3AC', // L* 76
    bonus: '#E7D0CC', // L* 85
    attribute: '#F5ECEA', // L* 94
  },
};

/**
 * The surface the dice land on.
 *
 * Every surface is dark, and that is a constraint rather than a taste. A die
 * body starts at CIE L* 49, and Unit 3.3 holds the body to 3 to 1 against the
 * surface. A surface above about L* 18 breaks that floor for the darkest die of
 * every dice theme at once. The light theme is no exception: `bone` is a pale
 * page over a dark table.
 *
 * Each one is the row's own page seed at L* 13, so the table carries the hue of
 * the theme and none of its lightness.
 */
export const TRAY_SURFACES: Readonly<Record<ThemeId, string>> = {
  leather: '#292017', // L* 13
  ash: '#232220', // L* 13
  moss: '#1E231A', // L* 13
  bone: '#2B1F0A', // L* 13
  iron: '#1E2226', // L* 13
  oxblood: '#2D1E1A', // L* 13
};

/**
 * The interface.
 *
 * Five dark palettes and one light one, so the six are not a single mood. Each
 * row is `derivePalette(seed, mode)` written down, from these page seeds:
 * `leather` #C69C6D, `ash` #ABA6A0, `moss` #93A87E, `bone` #75551C in the light
 * mode, `iron` #93A6B5 and `oxblood` #B4796B. The seed is the accent itself and
 * is not changed, so every accent is a weathered colour and none is a bright
 * one.
 *
 * `onTray` stays light in the light palette too, because the tray stays dark in
 * every theme.
 */
export const INTERFACE_PALETTES: Readonly<Record<ThemeId, InterfacePalette>> = {
  leather: {
    background: '#261E15', // L* 12
    surface: '#352A1D', // L* 18
    text: '#F1E6DB', // L* 92
    textMuted: '#CEAB82', // L* 72
    accent: '#C69C6D', // L* 67
    onAccent: '#1D1610', // L* 8
    onTray: '#F1E6DB', // L* 92
    sunken: '#1D1610', // L* 8
    line: '#90724F', // L* 50
    markSuccess: '#37C277', // L* 70
    markBane: '#F4926A', // L* 70
  },
  ash: {
    background: '#20201E', // L* 12
    surface: '#2D2B2A', // L* 18
    text: '#E9E8E6', // L* 92
    textMuted: '#B4B0AB', // L* 72
    accent: '#ABA6A0', // L* 68
    onAccent: '#181717', // L* 8
    onTray: '#E9E8E6', // L* 92
    sunken: '#181717', // L* 8
    line: '#7A7772', // L* 50
    markSuccess: '#37C277', // L* 70
    markBane: '#F4926A', // L* 70
  },
  moss: {
    background: '#1C2118', // L* 12
    surface: '#282D22', // L* 18
    text: '#E4EADF', // L* 92
    textMuted: '#A5B794', // L* 72
    accent: '#93A87E', // L* 66
    onAccent: '#151812', // L* 8
    onTray: '#E4EADF', // L* 92
    sunken: '#151812', // L* 8
    line: '#6D7C5D', // L* 50
    markSuccess: '#37C277', // L* 70
    markBane: '#F4926A', // L* 70
  },
  bone: {
    background: '#EEEBE4', // L* 93
    surface: '#E5DED4', // L* 89
    text: '#3F2E0F', // L* 20
    textMuted: '#73541C', // L* 38
    accent: '#75551C', // L* 38
    onAccent: '#F8F7F4', // L* 97
    onTray: '#ECE8E0', // L* 92
    sunken: '#DCD3C5', // L* 85
    line: '#8D7344', // L* 50
    markSuccess: '#19663D', // L* 38
    markBane: '#914324', // L* 38
  },
  iron: {
    background: '#1C2023', // L* 12
    surface: '#272D31', // L* 18
    text: '#E4E8EC', // L* 92
    textMuted: '#A2B3BF', // L* 72
    accent: '#93A6B5', // L* 67
    onAccent: '#15171A', // L* 8
    onTray: '#E4E8EC', // L* 92
    sunken: '#15171A', // L* 8
    line: '#6B7983', // L* 50
    markSuccess: '#37C277', // L* 70
    markBane: '#F4926A', // L* 70
  },
  oxblood: {
    background: '#2A1C19', // L* 12
    surface: '#3B2823', // L* 18
    text: '#F1E6E3', // L* 92
    textMuted: '#CEA89F', // L* 72
    accent: '#B4796B', // L* 57
    onAccent: '#1F1513', // L* 8
    onTray: '#F1E6E3', // L* 92
    sunken: '#1F1513', // L* 8
    line: '#9E6B5E', // L* 50
    markSuccess: '#37C277', // L* 70
    markBane: '#F4926A', // L* 70
  },
};

/** The colours one id names. */
export interface ResolvedTheme {
  readonly id: ThemeId;
  readonly diceColours: DiceTheme;
  readonly traySurfaceColour: string;
  readonly palette: InterfacePalette;
}

/**
 * Read the three rows one id names.
 *
 * A lookup and nothing else. It derives no colour, and it reads the three
 * records with ONE key: the dice, the table and the page cannot disagree,
 * because there is no second id for them to disagree about.
 */
export function resolveTheme(id: ThemeId): ResolvedTheme {
  return {
    id,
    diceColours: DICE_THEMES[id],
    traySurfaceColour: TRAY_SURFACES[id],
    palette: INTERFACE_PALETTES[id],
  };
}
