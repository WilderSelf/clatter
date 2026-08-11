// The stylesheet spends a palette, and holds no colour of its own — Unit 4.8.
//
// Three claims, three denominators, and every denominator is derived from the
// file rather than written here.
//
//   1. Every colour literal in `src/shell.css` is black or white at a fraction
//      of one, and the file holds no more of them than a counted ceiling. The
//      list is taken OFF the file, so a hex added later turns this red without
//      anybody remembering to add a case.
//   2. Every role the theme module writes is spent by the stylesheet, and every
//      variable the stylesheet reads and does not declare is a role the theme
//      module writes. Two directions, so neither a dead role nor an unwritten
//      one can hide.
//   3. Which token fills which role. The claim is the ROLE and never the
//      presence of a colour: a palette that swapped two tokens would still hold
//      every colour it holds now.
//   4. ONE id moves the dice, the table and the page together, and no surface
//      can be left on a foreign row. The declaration of `ThemeSettings` is read
//      as well, because behaviour cannot say that a second id is impossible.
//
// The floors and the token names are written out again in this file. Reading
// them from the modules under test would let those modules answer their own
// question.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { appliedTheme, TRAY_ROLES, DIE_FACE_ROLE, PALETTE_ROLES, themeVariables } from './css-vars';
import { contrastRatio } from './contrast';
import type { InterfacePalette, ThemeId } from './themes';
import { DICE_THEMES, INTERFACE_PALETTES, resolveTheme, TRAY_SURFACES } from './themes';

const CSS = readFileSync(resolve(process.cwd(), 'src/shell.css'), 'utf8');

/** The file with every comment taken out, so a colour named in prose is not one. */
const RULES = CSS.replace(/\/\*[\s\S]*?\*\//g, ' ');

/** The six names, restated in the order the plan names them. */
const NAMES: readonly ThemeId[] = ['leather', 'ash', 'moss', 'bone', 'iron', 'oxblood'];

/**
 * How many colour literals the stylesheet may hold.
 *
 * The claim this file used to make was a LIST of three exact strings. That list
 * is not the property. The property is **the stylesheet holds no hue of its
 * own**, and black or white at a fraction of one is a shade rather than a hue:
 * a shadow is the absence of light, a scrim has to darken every palette
 * including the light one, and a highlight has to lift every palette including
 * the dark ones. A list of exact strings refused a fourth SHADE as loudly as it
 * refused a hue, which made the material grain of Unit 4.12 impossible to write
 * without weakening the check to a table anybody could add a hue to.
 *
 * So the shade is measured, and the count is bounded. The ceiling is a decision
 * and not a reading: raising it is a change to this file, which is what a
 * reviewer sees. The floor says the reader found the file at all.
 */
const LITERAL_CEILING = 3;

/** Below this the reader is broken, not the file. Three literals ship today. */
const LITERAL_FLOOR = 3;

/** Every way a colour can be written, apart from a named keyword. */
const LITERAL = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color-mix)\([^)]*\)/g;

/**
 * The colour keywords the file may name. `transparent` carries no hue at all
 * and `currentColor` is whichever role the element already took, so neither one
 * is a colour this file holds.
 */
const ALLOWED_KEYWORDS = ['transparent', 'currentColor'];

/** Keywords that would be a colour of this file's own. A short, named list. */
const FORBIDDEN_KEYWORDS = [
  'white',
  'black',
  'red',
  'green',
  'blue',
  'gray',
  'grey',
  'silver',
  'maroon',
  'navy',
  'olive',
  'teal',
  'aqua',
  'fuchsia',
  'lime',
  'purple',
  'yellow',
  'orange',
];

describe('the stylesheet holds no colour of its own', () => {
  it('holds only black or white at a fraction of one, under a counted ceiling', () => {
    const found = [...RULES.matchAll(LITERAL)].map((match) => match[0]);
    // The denominator is the file's own, so a hex added to a rule tomorrow is
    // read here whether or not anybody remembered this check.
    expect(
      found.length,
      'the reader found the literals src/shell.css holds',
    ).toBeGreaterThanOrEqual(LITERAL_FLOOR);
    expect(found.length, 'the file stays under its counted ceiling').toBeLessThanOrEqual(
      LITERAL_CEILING,
    );

    // The claim itself. Each literal is measured to be a SHADE — black or white
    // at a stated fraction under one — so a hue cannot pass by being written
    // into any table this file holds.
    let measured = 0;
    const hues: string[] = [];
    for (const literal of found) {
      const parts = /^rgb\((\d+) (\d+) (\d+) \/ (\d+(?:\.\d+)?)%\)$/.exec(literal);
      if (parts === null) {
        hues.push(`${literal} is not written as rgb(r g b / a%)`);
        continue;
      }
      const [red, green, blue] = [parts[1], parts[2], parts[3]];
      const black = red === '0' && green === '0' && blue === '0';
      const white = red === '255' && green === '255' && blue === '255';
      if (!black && !white) hues.push(`${literal} is neither black nor white`);
      else if (!(Number(parts[4]) < 100)) hues.push(`${literal} is not at a fraction of one`);
      measured += 1;
    }
    expect(hues, 'every colour literal in src/shell.css is black or white at a fraction').toEqual(
      [],
    );
    expect(measured, 'every literal found was measured').toBe(found.length);
  });

  it('names no colour keyword of its own', () => {
    // The values alone, so a selector or a property name cannot read as a
    // colour. `white-space` is the case that made this necessary.
    const values = [...RULES.matchAll(/:\s*([^;{}]*)[;}]/g)].map((match) => match[1] ?? '');
    expect(values.length, 'the file holds declarations to read').toBeGreaterThan(100);
    const named: string[] = [];
    for (const value of values) {
      for (const keyword of FORBIDDEN_KEYWORDS) {
        if (new RegExp(`\\b${keyword}\\b`).test(value))
          named.push(`${keyword} in "${value.trim()}"`);
      }
    }
    expect(named, 'a colour keyword is a colour this file holds').toEqual([]);
    expect(ALLOWED_KEYWORDS.length, 'two keywords carry no hue and are allowed').toBe(2);
  });
});

describe('the roles', () => {
  /** Every variable the file reads, and every variable the file declares. */
  const read = new Set([...RULES.matchAll(/var\((--[a-z0-9-]+)/g)].map((match) => match[1] ?? ''));
  const declared = new Set([...RULES.matchAll(/(--[a-z0-9-]+):/g)].map((match) => match[1] ?? ''));

  it('spends every role the theme module writes, and reads no other outside variable', () => {
    const roles = new Set([...Object.keys(PALETTE_ROLES), ...TRAY_ROLES, DIE_FACE_ROLE]);
    // Direction one: nothing the module writes goes unspent.
    const unspent = [...roles].filter((role) => !read.has(role));
    expect(unspent, 'these roles are written and nothing paints with them').toEqual([]);
    // Direction two: nothing the file reads from outside is missing a writer.
    // A variable the file declares itself is geometry, not a colour.
    const outside = [...read].filter((name) => !declared.has(name));
    expect(outside.sort(), 'every variable the file does not declare is a role').toEqual(
      [...roles].sort(),
    );
    expect(roles.size, 'the module writes fourteen palette roles and three more').toBe(
      Object.keys(PALETTE_ROLES).length + TRAY_ROLES.length + 1,
    );
  });
});

/**
 * Which token fills which role, written out again.
 *
 * It is NOT read from `css-vars.ts`. A first draft of this file read the map
 * out of the module and then asserted the module against itself: two roles
 * swapped inside `PALETTE_ROLES` and every check stayed green. The map below is
 * the claim, and the module is measured against it.
 */
const WANTED: Readonly<Record<string, keyof InterfacePalette>> = {
  '--page': 'background',
  '--surface': 'background',
  '--raised': 'surface',
  '--sunken': 'sunken',
  '--ink': 'text',
  '--ink-dim': 'textMuted',
  '--line': 'line',
  '--accent': 'accent',
  '--accent-ink': 'onAccent',
  '--focus': 'accent',
  '--mark-success': 'markSuccess',
  '--mark-bane': 'markBane',
  '--mark-ink': 'onAccent',
  '--on-tray': 'onTray',
};

describe('which token fills which role', () => {
  it('holds one role for every role the module writes, and no other', () => {
    expect(Object.keys(WANTED).sort(), 'the module writes these roles').toEqual(
      Object.keys(PALETTE_ROLES).sort(),
    );
  });

  it('fills each role with the token this file names, and not with its neighbour', () => {
    let checked = 0;
    for (const id of NAMES) {
      const palette = INTERFACE_PALETTES[id];
      const written = themeVariables(appliedTheme({ themeId: id, builtTheme: null }));
      for (const [role, token] of Object.entries(WANTED)) {
        expect(written[role], `${id}: ${role} takes ${token}`).toBe(palette[token]);
        // The role, not the presence. A palette that swapped two tokens holds
        // every colour it holds now, so each role is asserted to differ from
        // every OTHER token whose colour is not the same colour.
        for (const other of Object.keys(palette) as (keyof InterfacePalette)[]) {
          if (other === token || palette[other] === palette[token]) continue;
          expect(written[role], `${id}: ${role} is not ${other}`).not.toBe(palette[other]);
        }
        checked += 1;
      }
    }
    // Six palettes by every role, counted as a product.
    expect(checked, 'every role of every palette was read').toBe(
      NAMES.length * Object.keys(WANTED).length,
    );
  });

  /**
   * One id moves the dice, the table and the page together.
   *
   * This is the claim the collapse makes, and it replaces the two checks that
   * measured the three axes moving apart. It can fail two ways, and both are
   * the way a collapse really goes wrong: a surface that keeps reading a stale
   * id, and a surface that stops moving at all.
   *
   * The second half is the one that matters. Asserting that each surface reads
   * its own row would pass while a fourth surface still read `ash`, so every
   * row is also asserted to differ from every OTHER row: 30 ordered pairs by
   * three surfaces. A stale id shows up as `leather` painting the `ash` table.
   */
  it('moves all three surfaces on one id, and pairs no surface with a foreign row', () => {
    let together = 0;
    let apart = 0;
    for (const id of NAMES) {
      const applied = appliedTheme({ themeId: id, builtTheme: null });
      const written = themeVariables(applied);
      const resolved = resolveTheme(id);

      // The three surfaces, read where the screen reads them: the dice off the
      // applied theme, the table and the page off the variables on the root.
      expect(applied.diceColours, `${id}: the dice are the ${id} row`).toBe(DICE_THEMES[id]);
      expect(written['--tray-surface'], `${id}: the table is the ${id} row`).toBe(
        TRAY_SURFACES[id],
      );
      expect(written['--page'], `${id}: the page is the ${id} row`).toBe(
        INTERFACE_PALETTES[id].background,
      );
      // `resolveTheme` answers with the same three, from the same one id.
      expect(resolved.diceColours, `${id}: resolveTheme agrees about the dice`).toBe(
        DICE_THEMES[id],
      );
      expect(resolved.traySurfaceColour, `${id}: resolveTheme agrees about the table`).toBe(
        TRAY_SURFACES[id],
      );
      expect(resolved.palette, `${id}: resolveTheme agrees about the page`).toBe(
        INTERFACE_PALETTES[id],
      );
      together += 3;

      // No surface is left on another row. This is what a stale id trips.
      for (const other of NAMES) {
        if (other === id) continue;
        expect(applied.diceColours, `${id}: the dice are not the ${other} row`).not.toBe(
          DICE_THEMES[other],
        );
        expect(written['--tray-surface'], `${id}: the table is not the ${other} row`).not.toBe(
          TRAY_SURFACES[other],
        );
        expect(written['--page'], `${id}: the page is not the ${other} row`).not.toBe(
          INTERFACE_PALETTES[other].background,
        );
        apart += 3;
      }
    }
    // Both denominators are products, so a loop that ran short cannot pass.
    expect(together, 'three surfaces over six themes were read').toBe(NAMES.length * 3);
    expect(apart, 'three surfaces over every ordered pair of themes were read').toBe(
      NAMES.length * (NAMES.length - 1) * 3,
    );
  });

  /**
   * A foreign pairing is unreachable through the settings type.
   *
   * The check above measures behaviour, and behaviour cannot say that a second
   * id is impossible — only that the one in front of it is right. This reads
   * the DECLARATION of `ThemeSettings` and counts the fields typed `ThemeId`.
   * A second one would put a foreign pairing back within reach, and it would
   * arrive without any measurement above turning red.
   */
  it('declares exactly one theme id in the settings the screen reads', () => {
    const path = resolve(process.cwd(), 'src/theme/css-vars.ts');
    const source = ts.createSourceFile(
      path,
      readFileSync(path, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
    );
    const fields: string[] = [];
    source.forEachChild((node) => {
      if (!ts.isInterfaceDeclaration(node) || node.name.text !== 'ThemeSettings') return;
      for (const member of node.members) {
        if (!ts.isPropertySignature(member) || member.type === undefined) continue;
        fields.push(`${member.name.getText()}: ${member.type.getText()}`);
      }
    });
    expect(fields, 'the declaration was read at all').not.toEqual([]);
    expect(
      fields.filter((each) => each.endsWith(': ThemeId')),
      'one field names a theme',
    ).toEqual(['themeId: ThemeId']);
    expect(fields, 'the record holds the id and the theme a player built').toEqual([
      'themeId: ThemeId',
      'builtTheme: BuiltTheme | null',
    ]);
  });

  it('puts a built theme on the dice and the page, and leaves the tray a shipped row', () => {
    const applied = appliedTheme({
      themeId: 'iron',
      builtTheme: { diceSeed: '#3CBFA5', interfaceSeed: '#FF8B68', mode: 'dark', exactDice: false },
    });
    expect(applied.built, 'the built theme is the one on the screen').toBe(true);
    expect(applied.diceColours, 'the dice row is not the chosen one').not.toBe(DICE_THEMES.iron);
    expect(applied.palette, 'the palette row is not the chosen one').not.toBe(
      INTERFACE_PALETTES.iron,
    );
    expect(applied.traySurfaceColour, 'the tray stays the shipped row').toBe(TRAY_SURFACES.iron);
    expect(applied.palette.accent, 'the colour the player chose is the accent, unchanged').toBe(
      '#FF8B68',
    );
  });
});

// ---------------------------------------------------------------------------
// The contrast the roles carry, read through the rules that spend them.
// ---------------------------------------------------------------------------

/** The floors, restated. WCAG 2.2 SC 1.4.3 for text, SC 1.4.11 for a control. */
const TEXT_FLOOR = 4.5;
const NON_TEXT_FLOOR = 3;

/**
 * Every role that carries ink, the ground it is drawn on, and its floor.
 *
 * The grounds are named as roles rather than as colours, so this table says
 * which ROLE sits on which ROLE and the palettes fill both ends. The list is
 * the ink half of `PALETTE_ROLES`: a role that paints nothing is not here, and
 * the check below counts the two halves against the whole.
 */
const INK_ON_GROUND: readonly (readonly [string, string, number])[] = [
  ['--ink', '--surface', TEXT_FLOOR],
  ['--ink', '--raised', TEXT_FLOOR],
  ['--ink', '--sunken', TEXT_FLOOR],
  ['--ink-dim', '--surface', TEXT_FLOOR],
  ['--ink-dim', '--raised', TEXT_FLOOR],
  ['--ink-dim', '--sunken', TEXT_FLOOR],
  ['--accent-ink', '--accent', TEXT_FLOOR],
  ['--mark-ink', '--mark-success', TEXT_FLOOR],
  ['--mark-ink', '--mark-bane', TEXT_FLOOR],
  ['--accent', '--surface', NON_TEXT_FLOOR],
  ['--accent', '--raised', NON_TEXT_FLOOR],
  ['--accent', '--sunken', NON_TEXT_FLOOR],
  ['--focus', '--surface', NON_TEXT_FLOOR],
  ['--focus', '--raised', NON_TEXT_FLOOR],
  ['--line', '--surface', NON_TEXT_FLOOR],
  ['--line', '--raised', NON_TEXT_FLOOR],
  ['--line', '--sunken', NON_TEXT_FLOOR],
  ['--mark-success', '--surface', NON_TEXT_FLOOR],
  ['--mark-success', '--raised', NON_TEXT_FLOOR],
  ['--mark-success', '--sunken', NON_TEXT_FLOOR],
  ['--mark-bane', '--surface', NON_TEXT_FLOOR],
  ['--mark-bane', '--raised', NON_TEXT_FLOOR],
  ['--mark-bane', '--sunken', NON_TEXT_FLOOR],
];

describe('the contrast the roles carry', () => {
  it('clears both floors in all six interface palettes, and the denominator is six', () => {
    let measured = 0;
    let tightest = { ratio: Number.POSITIVE_INFINITY, said: '' };
    for (const id of NAMES) {
      const written = themeVariables(appliedTheme({ themeId: id, builtTheme: null }));
      for (const [ink, ground, floor] of INK_ON_GROUND) {
        const inkHex = written[ink];
        const groundHex = written[ground];
        expect(inkHex, `${ink} is a role the application writes`).toBeDefined();
        expect(groundHex, `${ground} is a role the application writes`).toBeDefined();
        const ratio = contrastRatio(inkHex ?? '#000000', groundHex ?? '#FFFFFF');
        expect(
          ratio,
          `${id}: ${ink} over ${ground} reads ${ratio.toFixed(2)} to 1`,
        ).toBeGreaterThanOrEqual(floor);
        if (ratio < tightest.ratio) tightest = { ratio, said: `${id} ${ink} over ${ground}` };
        measured += 1;
      }
    }
    // The denominator is a product, so a loop that ran short cannot pass.
    expect(measured, 'every pair over every palette').toBe(NAMES.length * INK_ON_GROUND.length);
    expect(tightest.ratio, `tightest: ${tightest.said}`).toBeGreaterThanOrEqual(NON_TEXT_FLOOR);
  });

  it('keeps a readout over the tray, and a die body on it, over all 36 combinations', () => {
    let measured = 0;
    for (const palette of NAMES) {
      for (const surface of NAMES) {
        // The picker cannot cross a palette with a foreign surface, so the
        // crossing is made here by hand. It is not a built theme: it is a
        // shipped palette over another row's table, kept because the six
        // surfaces sit inside one CIE L*, which `theme.test.ts` measures.
        const written: Record<string, string> = {
          ...themeVariables(appliedTheme({ themeId: palette, builtTheme: null })),
          '--tray-surface': TRAY_SURFACES[surface],
        };
        const ratio = contrastRatio(written['--on-tray'] ?? '', written['--tray-surface'] ?? '');
        expect(
          ratio,
          `${palette}: a readout on the ${surface} tray reads ${ratio.toFixed(2)} to 1`,
        ).toBeGreaterThanOrEqual(TEXT_FLOOR);
        measured += 1;
      }
    }
    expect(measured, 'all 36 palette and surface pairs ran').toBe(NAMES.length * NAMES.length);
  });
});
