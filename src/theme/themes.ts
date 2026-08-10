// The three theme axes, as data.
//
// A theme is three choices, not one: the dice, the surface they land on, and
// the interface around the tray. The axes are independent and a player mixes
// them freely, so the six presets on each axis give 6 x 6 x 6 = 216
// combinations.
//
// The six names are shared by all three axes. Unit 3.1 deleted the published
// colour-set table of the vendored tray and installed six sets this repository
// owns in its place — `ember`, `ash`, `verdigris`, `bone`, `void` and `cobalt`,
// recorded in `src/tray/vendor/README.md`. Those names, and the identity each
// one carries, are what the three axes below reuse. Nothing here ports another
// product's palette under a new name: Constraint 1 treats a reproduced dice
// colour convention as closer to trade dress than to rules.
//
// **A new variant is a new row.** Every colour below is a literal. No resolver
// derives one, so a seventh preset is a seventh row and nothing else changes.
// `builder.ts` holds the arithmetic that derives a colour, and it serves the
// colour a player picks, not the rows here.
//
// What is measured, and where:
//   * `theme.test.ts` measures every contrast claim over these rows.
//   * `dice-colors.test.ts` keeps the Unit 3.3 claims over the `ash` dice row.
//   * `css-vars.test.ts` measures the same claims on the RENDERED screen, over
//     the roles `src/shell.css` really spends.
//
// The picker, the colour builder's controls and the stylesheet that spends a
// palette are the open half of this unit, and they land with the second half.

import type { DieType } from '../rules/die';
import { DIE_TYPE_COLOR } from '../tray/dice-colors';

export const THEME_IDS = ['ember', 'ash', 'verdigris', 'bone', 'void', 'cobalt'] as const;

export type ThemeId = (typeof THEME_IDS)[number];

/** One body colour per dice type. The tray multiplies it into a white face. */
export type DiceTheme = Readonly<Record<DieType, string>>;

/**
 * The interface colours. Every one of them is a colour text or a control is
 * drawn in, or a colour one of those sits on.
 *
 * `onTray` is the odd one. It is the colour of a readout drawn over the tray —
 * the cost of a push, a die count — so it answers to the tray surface axis and
 * not to `background`. That is the only token whose contrast leaves the
 * interface axis, and it is why the readout denominator is 36 and the text
 * denominator is 6.
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
 * Axis 1 — the dice.
 *
 * Each row is a lightness ladder: stress is the darkest and attribute the
 * lightest, and every rung is about nine CIE L* apart. Unit 3.3 set that ladder
 * for one theme and `theme.test.ts` asserts it again for all six, because an
 * invariant proven for one instance does not compose.
 *
 * `ash` is the neutral row and it *is* the Unit 3.3 table, imported rather than
 * copied. It spends the whole hue circle, because a neutral theme constrains no
 * hue. The other five hold a hue arc of their own, so a theme reads as itself
 * while the six types still separate.
 *
 * The comment on each colour records the CIE L* it measures. It is a note, not
 * an input: every check computes L* from the hex beside it.
 */
export const DICE_THEMES: Readonly<Record<ThemeId, DiceTheme>> = {
  ember: {
    stress: '#DE2C3B', // L* 49
    artifact: '#F65243', // L* 58
    gear: '#FB8056', // L* 67
    skill: '#FEA76A', // L* 76
    bonus: '#FFCC84', // L* 85
    attribute: '#FFEDB7', // L* 94
  },
  ash: DIE_TYPE_COLOR,
  verdigris: {
    stress: '#2A8454', // L* 49
    artifact: '#3B9C78', // L* 58
    gear: '#4FB49E', // L* 67
    skill: '#66CCC6', // L* 76
    bonus: '#86E3EE', // L* 85
    attribute: '#D3F3FF', // L* 94
  },
  bone: {
    stress: '#976A57', // L* 49
    artifact: '#A88468', // L* 58
    gear: '#B99F79', // L* 67
    skill: '#CBBB8D', // L* 76
    bonus: '#DDD6A1', // L* 85
    attribute: '#F0F2BA', // L* 94
  },
  void: {
    stress: '#A74FBD', // L* 49
    artifact: '#B56BE3', // L* 58
    gear: '#BD8CFF', // L* 67
    skill: '#C3B0FF', // L* 76
    bonus: '#D2D0FF', // L* 85
    attribute: '#EAEDFF', // L* 94
  },
  cobalt: {
    stress: '#7357FF', // L* 49
    artifact: '#7A7DFF', // L* 58
    gear: '#859EFF', // L* 67
    skill: '#93BDFF', // L* 76
    bonus: '#A8DBFF', // L* 85
    attribute: '#D0F4FF', // L* 94
  },
};

/**
 * Axis 2 — the surface the dice land on.
 *
 * Every surface is dark, and that is a constraint rather than a taste. A die
 * body starts at CIE L* 49, and Unit 3.3 holds the body to 3 to 1 against the
 * surface. A surface above about L* 18 breaks that floor for the darkest die of
 * every dice theme at once. Six dark surfaces, one hue each.
 *
 * `ash` is the surface Unit 3.2 shipped. `src/tray/scene.ts` reads it from
 * here, so the value is written once.
 */
export const TRAY_SURFACES: Readonly<Record<ThemeId, string>> = {
  ember: '#3E1810', // L* 14
  ash: '#23262B', // L* 15
  verdigris: '#102822', // L* 14
  bone: '#2A251B', // L* 15
  void: '#201632', // L* 10
  cobalt: '#142243', // L* 14
};

/**
 * Axis 3 — the interface.
 *
 * Five dark palettes and one light one, so the axis is not a single mood. Each
 * row is built on one hue and a set of lightness targets, and `theme.test.ts`
 * measures every contrast pair of every row.
 *
 * `onTray` stays light in the light palette too, because the tray stays dark in
 * every combination.
 */
export const INTERFACE_PALETTES: Readonly<Record<ThemeId, InterfacePalette>> = {
  ember: {
    background: '#261E1B', // L* 12
    surface: '#332A27', // L* 18
    text: '#F7E4DE', // L* 92
    textMuted: '#C1ACA6', // L* 72
    accent: '#FF8B68', // L* 70
    onAccent: '#261E1B', // L* 12
    onTray: '#F4E5E0', // L* 92
    sunken: '#1D1714', // L* 8
    line: '#7B7674', // L* 50
    markSuccess: '#37C277', // L* 70
    markBane: '#F4926A', // L* 70
  },
  ash: {
    background: '#1F2021', // L* 12
    surface: '#2B2C2E', // L* 18
    text: '#E6E8EC', // L* 92
    textMuted: '#AFB1B4', // L* 72
    accent: '#A1ACC0', // L* 70
    onAccent: '#1F2021', // L* 12
    onTray: '#E7E8EB', // L* 92
    sunken: '#171718', // L* 8
    line: '#767778', // L* 50
    markSuccess: '#37C277', // L* 70
    markBane: '#F4926A', // L* 70
  },
  verdigris: {
    background: '#182120', // L* 12
    surface: '#242E2C', // L* 18
    text: '#D6EDE8', // L* 92
    textMuted: '#9DB6B1', // L* 72
    accent: '#3CBFA5', // L* 70
    onAccent: '#182120', // L* 12
    onTray: '#DAECE8', // L* 92
    sunken: '#121918', // L* 8
    line: '#737878', // L* 50
    markSuccess: '#37C277', // L* 70
    markBane: '#F4926A', // L* 70
  },
  bone: {
    background: '#F4EAD7', // L* 93
    surface: '#EDDEC4', // L* 89
    text: '#353027', // L* 20
    textMuted: '#61584A', // L* 38
    accent: '#6A5734', // L* 38
    onAccent: '#FBF3E5', // L* 96
    onTray: '#F0E7D8', // L* 92
    sunken: '#DDD4C2', // L* 85
    line: '#7C766D', // L* 50
    markSuccess: '#19663D', // L* 38
    markBane: '#914324', // L* 38
  },
  void: {
    background: '#231D2A', // L* 12
    surface: '#302A37', // L* 18
    text: '#EFE4FD', // L* 92
    textMuted: '#B8ABC7', // L* 72
    accent: '#C695FF', // L* 70
    onAccent: '#231D2A', // L* 12
    onTray: '#EEE5F8', // L* 92
    sunken: '#1A161F', // L* 8
    line: '#79757D', // L* 50
    markSuccess: '#37C277', // L* 70
    markBane: '#F4926A', // L* 70
  },
  cobalt: {
    background: '#1B2027', // L* 12
    surface: '#272C34', // L* 18
    text: '#DFE9F8', // L* 92
    textMuted: '#A7B1C2', // L* 72
    accent: '#76ADFF', // L* 70
    onAccent: '#1B2027', // L* 12
    onTray: '#E1E9F5', // L* 92
    sunken: '#14171D', // L* 8
    line: '#74787C', // L* 50
    markSuccess: '#37C277', // L* 70
    markBane: '#F4926A', // L* 70
  },
};

/** One choice per axis. What the settings record holds. */
export interface ThemeChoice {
  readonly dice: ThemeId;
  readonly traySurface: ThemeId;
  readonly interface: ThemeId;
}

/** The colours those three choices name. */
export interface ResolvedTheme extends ThemeChoice {
  readonly diceColours: DiceTheme;
  readonly traySurfaceColour: string;
  readonly palette: InterfacePalette;
}

/**
 * Read the three rows one choice names.
 *
 * A lookup and nothing else. It derives no colour, which is the property the
 * 216-combination test measures: the interface colours a text contrast is
 * computed from must not move when the dice or the tray choice moves.
 */
export function resolveTheme(choice: ThemeChoice): ResolvedTheme {
  return {
    ...choice,
    diceColours: DICE_THEMES[choice.dice],
    traySurfaceColour: TRAY_SURFACES[choice.traySurface],
    palette: INTERFACE_PALETTES[choice.interface],
  };
}
