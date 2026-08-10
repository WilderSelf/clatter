// The error surfaces — Unit 4.10.
//
// Three claims live here, and none of them can be met by writing a sentence.
//
//   1. **Every failure the code declares has a surface, or a written reason for
//      having none.** The denominator is PARSED out of the source, from the
//      union declarations themselves, so a refusal added later is a red rather
//      than an unread cell. A hand-written list of failures would agree with
//      itself for ever.
//   2. **No code identifier reaches the player.** Unit 4.4 found `1
//      ratingPoint` and `pool-banes-damage-ratings` printed on a player's
//      screen, and only a capture caught them. Every string these surfaces can
//      print is enumerated here and held to the shape of prose.
//   3. **Every fault has words, a slot and a place to go.** The tables are
//      asserted against each other, in both directions.
//
// The claim is about the DECLARATION, so the declaration is what is read. A
// check over the compiled bundle would report what a bundler kept.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { CSV_COLUMNS } from '../log/csv';
import { IMPORT_REJECTION_WORDS } from '../log/import-file';
import { PUSH_PROFILES } from '../rules/push-profile';
import { FALL_REASONS } from '../tray/capability';
import {
  FAULT_KINDS,
  FAULT_SLOT_ELEMENT,
  FAULT_SLOT_OF,
  FAULT_SLOTS,
  FAULT_TEXT,
  faultCount,
  faultLine,
  faultOf,
  faultsOf,
  IMPORT_REJECTION_UNIONS,
  REFUSAL_UNIONS,
  SOURCE_REFUSALS,
} from './faults';
import { FALL_REASON_TEXT, noticeText, trayNote } from './renderer';

// ---------------------------------------------------------------------------
// Reading a union out of the source
// ---------------------------------------------------------------------------

const parsed = new Map<string, readonly string[]>();

/**
 * Every member of one union type, read off the declaration.
 *
 * Two shapes are read, because the application declares both:
 *
 *   - a union of object types, each carrying `readonly kind: 'x'`
 *   - a union of string literals, as `FlatCause` is
 *
 * A member that is a reference to another union is followed, so
 * `ImportRejection = CsvRejection | ...` reports the whole set.
 */
function unionMembers(module: string, type: string): readonly string[] {
  const key = `${module}#${type}`;
  const held = parsed.get(key);
  if (held !== undefined) return held;
  const path = resolve(process.cwd(), module);
  const source = ts.createSourceFile(
    path,
    readFileSync(path, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  const found = source.statements.find(
    (statement): statement is ts.TypeAliasDeclaration =>
      ts.isTypeAliasDeclaration(statement) && statement.name.text === type,
  );
  expect(found, `${module} declares ${type}`).toBeDefined();
  if (found === undefined) return [];
  const node = found.type;
  expect(ts.isUnionTypeNode(node), `${type} is a union`).toBe(true);
  if (!ts.isUnionTypeNode(node)) return [];

  const kinds: string[] = [];
  for (const member of node.types) {
    if (ts.isLiteralTypeNode(member) && ts.isStringLiteral(member.literal)) {
      kinds.push(member.literal.text);
      continue;
    }
    if (ts.isTypeLiteralNode(member)) {
      const property = member.members.find(
        (each): each is ts.PropertySignature =>
          ts.isPropertySignature(each) &&
          ts.isIdentifier(each.name) &&
          each.name.text === 'kind' &&
          each.type !== undefined &&
          ts.isLiteralTypeNode(each.type) &&
          ts.isStringLiteral(each.type.literal),
      );
      expect(property, `every member of ${type} carries a kind`).toBeDefined();
      if (property?.type !== undefined && ts.isLiteralTypeNode(property.type)) {
        kinds.push((property.type.literal as ts.StringLiteral).text);
      }
      continue;
    }
    if (ts.isTypeReferenceNode(member) && ts.isIdentifier(member.typeName)) {
      // A union built on another union. Follow it, in the module that declares
      // it, which is one of the modules this file already reads.
      const name = member.typeName.text;
      const where = IMPORT_REJECTION_UNIONS.concat(REFUSAL_UNIONS).find(
        (each) => each.type === name,
      );
      expect(where, `${type} refers to ${name}, which is a union this check reads`).toBeDefined();
      if (where !== undefined) kinds.push(...unionMembers(where.module, where.type));
      continue;
    }
    throw new Error(`${type} holds a member this check cannot read`);
  }
  parsed.set(key, kinds);
  return kinds;
}

describe('the denominator', () => {
  it('reads every declared outcome out of the source, and accounts for all of them', () => {
    const declared = REFUSAL_UNIONS.flatMap(({ module, type }) =>
      unionMembers(module, type).map((kind) => `${module} ${type}.${kind}`),
    );
    const accounted = SOURCE_REFUSALS.map((row) => `${row.module} ${row.type}.${row.kind}`);

    // The parser must have found something in every union, or an empty read
    // would agree with an empty table and both would be silent.
    for (const { module, type } of REFUSAL_UNIONS) {
      expect(unionMembers(module, type).length, `${type} declares outcomes`).toBeGreaterThan(1);
    }
    expect(declared.length, 'the declarations hold outcomes').toBeGreaterThan(20);
    expect(new Set(declared).size, 'and no two rows of one union read the same').toBe(
      declared.length,
    );
    expect(accounted.slice().sort()).toEqual(declared.slice().sort());
  });

  it('gives every declared failure a surface, or a written reason for none', () => {
    const kinds: string[] = FAULT_KINDS.slice();
    let surfaced = 0;
    for (const row of SOURCE_REFUSALS) {
      const where = `${row.type}.${row.kind}`;
      if (row.fault === null) {
        expect(row.why.length, `${where} says why it needs no surface`).toBeGreaterThan(20);
        continue;
      }
      expect(kinds, `${where} raises a fault this application draws`).toContain(row.fault);
      expect(row.why, `${where} raises a fault, so it carries no excuse`).toBe('');
      surfaced += 1;
    }
    // Every fault must be reachable from a declared outcome. A surface nothing
    // can raise is a sentence nobody reads.
    const raised = new Set(SOURCE_REFUSALS.map((row) => row.fault).filter((each) => each !== null));
    expect([...raised].sort()).toEqual(kinds.slice().sort());
    expect(surfaced, 'and the surfaced count is counted, not claimed').toBe(
      SOURCE_REFUSALS.filter((row) => row.fault !== null).length,
    );
  });

  it('holds words for every import rejection the parser can raise', () => {
    const declared = unionMembers('src/log/import-file.ts', 'ImportRejection');
    const parser = unionMembers('src/log/csv.ts', 'CsvRejection');
    expect(parser.length, 'the parser declares rejections').toBeGreaterThan(5);
    expect(declared.length, 'and the file half adds its own').toBeGreaterThan(parser.length);
    for (const each of parser) {
      expect(declared, `${each} reaches the file half`).toContain(each);
    }
    expect(Object.keys(IMPORT_REJECTION_WORDS).slice().sort()).toEqual(declared.slice().sort());
    for (const [code, words] of Object.entries(IMPORT_REJECTION_WORDS)) {
      expect(words.endsWith('.'), `${code} reads as a sentence`).toBe(true);
      expect(words.length, `${code} says something`).toBeGreaterThan(20);
    }
  });
});

describe('the design and the code', () => {
  it('draws the rows the design names, and no others', () => {
    // Section 3 of the design lists the banner under the read-only parts, and
    // names every row of it. The names are READ from that document and never
    // restated here, so a design that renamed a row turns this red rather than
    // passing against a copy of the old name.
    const design = readFileSync(
      resolve(process.cwd(), 'docs/design/0002-screen-design.md'),
      'utf8',
    );
    const from = design.indexOf('### Read-only, and therefore not counted');
    expect(from, 'the design lists the read-only parts').toBeGreaterThan(-1);
    const section = design.slice(from, design.indexOf('## 4.', from));
    const bullet = section.slice(section.indexOf('- `fault-banner`'));
    expect(bullet.length, 'the design names the banner').toBeGreaterThan(100);
    const named = [...bullet.matchAll(/`([a-z-]+-note)`/g)].map((found) => found[1]);
    expect(new Set(named).size, 'one name per slot').toBe(FAULT_SLOTS.length);
    expect([...new Set(named)].sort()).toEqual(
      FAULT_SLOTS.map((slot) => FAULT_SLOT_ELEMENT[slot])
        .slice()
        .sort(),
    );
    expect(bullet, 'the design names the live region role').toContain('role="alert"');
    expect(bullet, 'and states that the banner holds no tab stop').toContain('holds no tab stop');
  });
});

describe('the tables', () => {
  it('gives every fault words, a slot and a row of its own', () => {
    expect(Object.keys(FAULT_TEXT).slice().sort()).toEqual(FAULT_KINDS.slice().sort());
    expect(Object.keys(FAULT_SLOT_OF).slice().sort()).toEqual(FAULT_KINDS.slice().sort());
    expect(Object.keys(FAULT_SLOT_ELEMENT).slice().sort()).toEqual(FAULT_SLOTS.slice().sort());
    expect(new Set(Object.values(FAULT_SLOT_ELEMENT)).size, 'one name per slot').toBe(
      FAULT_SLOTS.length,
    );
    // Every slot carries at least one fault. A row nothing can fill is a row
    // that would never be read.
    expect(new Set(Object.values(FAULT_SLOT_OF)).size).toBe(FAULT_SLOTS.length);
    for (const kind of FAULT_KINDS) {
      const words = FAULT_TEXT[kind];
      expect(words.what.endsWith('.'), `${kind} reads as a sentence`).toBe(true);
      expect(words.what.length, `${kind} says what happened`).toBeGreaterThan(30);
      if (words.next !== null) {
        expect(words.next.endsWith('.'), `${kind} ends its instruction`).toBe(true);
      }
    }
    expect(
      new Set(FAULT_KINDS.map((kind) => FAULT_TEXT[kind].what)).size,
      'no two read alike',
    ).toBe(FAULT_KINDS.length);
  });

  it('says what is lost where nothing can be done, and what to do where something can', () => {
    // The three faults with no route back are platform limits: a browser that
    // cannot draw a table, and a browser that keeps nothing. Each one says what
    // the player loses instead of offering a route that does not exist.
    const without = FAULT_KINDS.filter((kind) => FAULT_TEXT[kind].next === null);
    expect(without, 'a platform below the bar cannot be talked out of it').toEqual([
      'table-absent',
    ]);
    for (const kind of FAULT_KINDS) {
      const words = FAULT_TEXT[kind];
      if (words.next !== null) continue;
      // "Say what is lost" is the claim, so the words have to name the loss.
      expect(words.what.toLowerCase()).toMatch(/flat|goes|lost|not/);
    }
  });

  it('draws one row per slot, in slot order, and counts the faults on it', () => {
    const clear = faultsOf({ table: null, log: null, imported: null, settingsRefused: false });
    expect(clear.length, 'one entry per slot, always').toBe(FAULT_SLOTS.length);
    expect(faultCount(clear), 'and nothing on it').toBe(0);

    const full = faultsOf({
      table: 'recordedFall',
      log: faultOf('log-full'),
      imported: faultOf('import-refused', 'This file holds nothing.'),
      settingsRefused: true,
    });
    expect(full.length).toBe(FAULT_SLOTS.length);
    expect(faultCount(full)).toBe(FAULT_SLOTS.length);
    expect(full.map((fault) => (fault === null ? null : FAULT_SLOT_OF[fault.kind]))).toEqual(
      FAULT_SLOTS.slice(),
    );
    expect(full[0]?.kind).toBe('table-lost');
    // The probe that has not answered is not a fault, and it never was.
    expect(
      faultsOf({ table: 'notProbed', log: null, imported: null, settingsRefused: false })[0],
    ).toBeNull();
    expect(
      faultsOf({ table: 'belowTheBar', log: null, imported: null, settingsRefused: false })[0]
        ?.kind,
    ).toBe('table-absent');
  });

  it('lets an import carry its own words and keeps the route back', () => {
    const own = faultOf('import-refused', 'This file holds nothing. Pick a log this one wrote.');
    expect(own.what).toBe('This file holds nothing. Pick a log this one wrote.');
    expect(own.next, 'the route back is the fault’s, not the file’s').toBe(
      FAULT_TEXT['import-refused'].next,
    );
    expect(faultLine(own).endsWith(String(FAULT_TEXT['import-refused'].next))).toBe(true);
    expect(faultLine(faultOf('table-absent')), 'and a fault with no route reads alone').toBe(
      FAULT_TEXT['table-absent'].what,
    );
  });

  it('answers the flat-dice notice out of the same table the banner reads', () => {
    // One home for the words. `src/shell/renderer.ts` used to hold its own copy.
    expect(noticeText({ renderer: 'flat', cause: 'recordedFall', reasons: [] })).toBe(
      faultLine(faultOf('table-lost')),
    );
    expect(noticeText({ renderer: 'flat', cause: 'belowTheBar', reasons: [] })).toBe(
      faultLine(faultOf('table-absent')),
    );
  });
});

// ---------------------------------------------------------------------------
// No code identifier reaches the player
// ---------------------------------------------------------------------------

/**
 * Every string these surfaces can print at a player.
 *
 * The list is built from the tables rather than typed out, so a sentence added
 * to a table is judged without an edit here.
 */
function everyPrintedString(): readonly (readonly [string, string])[] {
  const said: [string, string][] = [];
  for (const kind of FAULT_KINDS) {
    said.push([`FAULT_TEXT ${kind}`, faultLine(faultOf(kind))]);
  }
  for (const [code, words] of Object.entries(IMPORT_REJECTION_WORDS)) {
    said.push([`IMPORT_REJECTION_WORDS ${code}`, words]);
  }
  for (const reason of FALL_REASONS) {
    said.push([`FALL_REASON_TEXT ${reason}`, FALL_REASON_TEXT[reason]]);
  }
  for (const cause of ['notProbed', 'belowTheBar', 'recordedFall'] as const) {
    said.push([
      `trayNote ${cause}`,
      trayNote({ renderer: 'flat', cause, reasons: FALL_REASONS.slice() }),
    ]);
  }
  said.push(['trayNote tray', trayNote({ renderer: 'tray', cause: null, reasons: [] })]);
  return said;
}

/**
 * The shapes a code identifier takes and prose does not.
 *
 * A single lower-case word is not on this list and cannot be: `value`, `mode`
 * and `note` are all columns of the export schema and all ordinary English, so
 * a rule against them would ban the words a player needs. What marks an
 * identifier on a screen is that it is COMPOUND, and every rule below reads a
 * join of two words rather than a word.
 */
const IDENTIFIER_SHAPES: readonly (readonly [string, RegExp])[] = [
  ['a camel-case join', /[a-z][A-Za-z0-9]*[A-Z]/],
  ['an under-score join', /[A-Za-z0-9]_[A-Za-z0-9]/],
  ['a hyphen join of three or more words', /[A-Za-z0-9]+-[A-Za-z0-9]+-[A-Za-z0-9]+/],
  ['a back tick', /`/],
  ['a brace, a bracket or an angle', /[{}[\]<>]/],
  ['a dotted path', /[a-z]\.[a-z]/],
  ['a run of capitals', /\b[A-Z]{2,}\b/],
  ['a call', /\(\)/],
];

describe('no code identifier reaches the player', () => {
  it('holds every printed string to the shape of prose', () => {
    const said = everyPrintedString();
    expect(said.length, 'the strings are enumerated, and there are some').toBeGreaterThan(20);
    for (const [where, words] of said) {
      for (const [what, shape] of IDENTIFIER_SHAPES) {
        expect(shape.test(words), `${where} holds ${what}: ${words}`).toBe(false);
      }
    }
  });

  it('holds every printed string against the compound identifiers this code uses', () => {
    // The membership half. A shape rule cannot see `pool-banes-damage-ratings`
    // as anything but a hyphen join, and this half names it. Only COMPOUND
    // identifiers are compared, for the reason above `IDENTIFIER_SHAPES`.
    const compound = [
      ...FAULT_KINDS,
      ...FAULT_SLOTS,
      ...Object.values(FAULT_SLOT_ELEMENT),
      ...CSV_COLUMNS,
      ...PUSH_PROFILES.map((profile) => profile.id),
      ...FALL_REASONS,
      ...Object.keys(IMPORT_REJECTION_WORDS),
    ].filter((name) => /[-_]/.test(name) || /[a-z][A-Z]/.test(name));
    expect(compound.length, 'there are compound identifiers to compare against').toBeGreaterThan(
      20,
    );
    const said = everyPrintedString();
    for (const [where, words] of said) {
      const lowered = words.toLowerCase();
      for (const name of compound) {
        expect(lowered.includes(name.toLowerCase()), `${where} names ${name}: ${words}`).toBe(
          false,
        );
      }
    }
  });
});
