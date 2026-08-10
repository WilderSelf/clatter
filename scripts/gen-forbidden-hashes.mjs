#!/usr/bin/env node
// Builds scripts/forbidden-hashes.json from a plaintext term list.
//
// The term list is NEVER committed. This generator is committed, the list is not.
// The output holds a random salt, the algorithm, the largest word count, and the
// sorted digests. It holds no term and nothing a term can be read back from.
//
// Usage: node scripts/gen-forbidden-hashes.mjs <term-list-path> [output-path]
// The output path defaults to scripts/forbidden-hashes.json. The tests pass a
// temporary path, so a test run never touches the committed file.
// Format: one term per line. Blank lines and lines starting with # are skipped.
// A term may be a phrase. Its word count is recorded only as maxNgram, so the
// gate knows how many consecutive words to hash.

import { randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normaliseTerm, digest } from './check-branding.mjs';

const listPath = process.argv[2];
if (listPath === undefined) {
  console.error('usage: node scripts/gen-forbidden-hashes.mjs <term-list-path> [output-path]');
  process.exit(2);
}

const terms = [
  ...new Set(
    readFileSync(listPath, 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '' && !line.startsWith('#'))
      .map(normaliseTerm)
      .filter((term) => term !== ''),
  ),
];
if (terms.length === 0) {
  console.error('gen-forbidden-hashes: the term list is empty');
  process.exit(2);
}

const out =
  process.argv[3] ?? join(dirname(fileURLToPath(import.meta.url)), 'forbidden-hashes.json');
// The allow-list is hand-maintained plaintext. Carry it over, never wipe it.
const allowlist = existsSync(out) ? (JSON.parse(readFileSync(out, 'utf8')).allowlist ?? []) : [];

const salt = randomBytes(16).toString('hex');
const doc = {
  salt,
  algorithm: 'sha256',
  maxNgram: Math.max(...terms.map((t) => t.split(' ').length)),
  hashes: terms.map((t) => digest(salt, t)).sort(),
  allowlist,
};

writeFileSync(out, `${JSON.stringify(doc, null, 2)}\n`);
console.log(
  `gen-forbidden-hashes: wrote ${doc.hashes.length} hashes, maxNgram=${doc.maxNgram}, ` +
    `allowlist=${allowlist.length}`,
);
