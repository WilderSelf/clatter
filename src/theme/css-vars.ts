// The bridge between a resolved theme and the stylesheet — Unit 4.8.
//
// `src/shell.css` holds no colour of its own. Every colour it paints comes from
// one of the custom properties below, and this module is the only place that
// says which palette token fills which role. `css-vars.test.ts` asserts the
// ROLE and never the presence of a colour, because a light variant that
// inverted which token filled which role would still hold every colour of the
// palette and still be wrong.
//
// Pure. No browser API is named here: `variableText` returns the declaration
// and the screen is what writes it, so this file runs under a plain test
// runner.
//
// **Nothing here derives a colour.** Every value is a literal read out of a row
// of `themes.ts`, out of `dice-colors.ts`, or out of the two seeds a player
// gave the builder. The builder is the one place that derives, and it derives
// for the player's own colour and never for a shipped row.

import type { DieType } from '../rules/die';
import { TRAY_BASE_COLOR_SET } from '../tray/dice-colors';
import type { BuiltTheme } from './builder';
import { buildTheme } from './builder';
import type { DiceTheme, InterfacePalette, ThemeId } from './themes';
import { DICE_THEMES, INTERFACE_PALETTES, TRAY_SURFACES } from './themes';

/**
 * The chosen theme plus the theme a player built, as the settings record holds
 * them. It is the shape `Settings` satisfies, so this module never imports the
 * settings record and the settings record never imports this one.
 *
 * ONE id, so the dice, the table and the page cannot be crossed. A second
 * `ThemeId` field here would make a foreign pairing reachable again, and
 * `css-vars.test.ts` reads this declaration to say there is not one.
 */
export interface ThemeSettings {
  readonly themeId: ThemeId;
  readonly builtTheme: BuiltTheme | null;
}

/** The colours in force: one shipped row, or a built pair over its table. */
export interface AppliedTheme {
  readonly diceColours: DiceTheme;
  readonly traySurfaceColour: string;
  readonly palette: InterfacePalette;
  /** True while the theme a player built is the one on the screen. */
  readonly built: boolean;
}

/**
 * The theme the screen is drawn in.
 *
 * A built theme replaces the dice row and the interface row and nothing else.
 * The tray surface stays a shipped row, because every surface is dark by
 * construction and the dice contrast claim of `themes.ts` is measured against
 * those six and against no other colour.
 */
export function appliedTheme(settings: ThemeSettings): AppliedTheme {
  const traySurfaceColour = TRAY_SURFACES[settings.themeId];
  if (settings.builtTheme === null) {
    return {
      diceColours: DICE_THEMES[settings.themeId],
      traySurfaceColour,
      palette: INTERFACE_PALETTES[settings.themeId],
      built: false,
    };
  }
  const { diceColours, palette } = buildTheme(settings.builtTheme);
  return { diceColours, traySurfaceColour, palette, built: true };
}

/**
 * Which palette token fills which role of the stylesheet.
 *
 * Two roles read one token on purpose and the reason is written beside each.
 * A role with no entry here is a colour the stylesheet would have to hold
 * itself, which `shell-css.test.ts` refuses.
 */
export const PALETTE_ROLES: Readonly<Record<string, keyof InterfacePalette>> = {
  // The page behind everything, and the screen that fills it. The screen is
  // the whole viewport, so the two are one ground and take one token.
  '--page': 'background',
  '--surface': 'background',
  // A card, the header, the footer, a row of the history: lifted off the page.
  '--raised': 'surface',
  // A well pressed into the page: the cost row, a chart track, the warning pad.
  '--sunken': 'sunken',
  '--ink': 'text',
  '--ink-dim': 'textMuted',
  '--line': 'line',
  '--accent': 'accent',
  '--accent-ink': 'onAccent',
  // The focus ring is the accent, because a second control colour would be a
  // second thing to prove and the ring already clears 3 to 1 on both grounds.
  '--focus': 'accent',
  '--mark-success': 'markSuccess',
  '--mark-bane': 'markBane',
  // The number on a success badge. It is text on a mark, and `onAccent` is the
  // token the palette proves against both marks.
  '--mark-ink': 'onAccent',
  '--on-tray': 'onTray',
};

/** The roles that come from the table and the dice rather than from the palette. */
export const TRAY_ROLES = ['--tray-surface', '--die-pip'] as const;

/** Every role the stylesheet may spend. */
export const ROLE_NAMES: readonly string[] = [...Object.keys(PALETTE_ROLES), ...TRAY_ROLES];

/**
 * The per-type role. It is written on the die and not on the root, because it
 * carries one value per dice type and the root carries one value per role.
 */
export const DIE_FACE_ROLE = '--die-face';

/**
 * The declaration the screen writes on the root element.
 *
 * A record and not a string, so the caller writes it property by property and
 * no text is parsed on the way in. Constraint 8 is about user text, and a
 * theme a player built is user text: the two seeds reach this record only
 * after `readSeed` has refused anything that is not a six-digit hex colour.
 */
export function themeVariables(applied: AppliedTheme): Readonly<Record<string, string>> {
  const written: Record<string, string> = {};
  for (const [role, token] of Object.entries(PALETTE_ROLES)) {
    written[role] = applied.palette[token];
  }
  written['--tray-surface'] = applied.traySurfaceColour;
  // The numeral and the pips. Black on every body of every dice theme, which
  // `theme.test.ts` measures over all 36 and `checkDiceTheme` reports on for a
  // theme a player built. It is the foreground of the colour set the vendored
  // tray is given, so the flat die and the 3D die carry one ink.
  written['--die-pip'] = TRAY_BASE_COLOR_SET.foreground;
  return written;
}

/** The body colour of one flat die, as the style attribute of that die. */
export function dieFaceStyle(colours: DiceTheme, type: DieType): string {
  return `${DIE_FACE_ROLE}:${colours[type]}`;
}
