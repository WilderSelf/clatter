// Red-proofs for the branding gate, run by `node --test`.
//
// The default run is self-contained. It builds a SYNTHETIC term list of invented
// marks, generates a throwaway hash file from it, and proves the gate against
// that. The gate is generic, so a red on a synthetic mark proves the mechanism.
// The real term list is never committed, so a suite that needed it could never
// go green in CI.
//
// Set CLATTER_FORBIDDEN_TERMS to the real list to add one extra check over the
// tracked tree. Without it that one test skips and the rest still run.
//
// Every proof runs in a throwaway repository under the system temporary directory.
// Never in the working tree, and never through `git stash` or `git checkout`.

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const GATE = join(here, 'check-branding.mjs');
const GEN = join(here, 'gen-forbidden-hashes.mjs');
const COUNT = join(here, 'check-branding-count.sh');
const SHIPPED_HASHES = join(here, 'forbidden-hashes.json');

// Invented marks. Not English, not anyone's trademark. `plimf` and `zorbal` are
// innocuous on their own, so the phrase test can prove adjacency both ways.
const SINGLE = 'zqxvorp';
const PHRASE = 'plimf zorbal';
const [W1, W2] = PHRASE.split(' ');

// One throwaway hash file for the whole run.
const scratch = mkdtempSync(join(tmpdir(), 'clatter-gate-cfg-'));
const HASHES = join(scratch, 'synthetic-hashes.json');
writeFileSync(
  join(scratch, 'terms.txt'),
  `# synthetic marks, invented for the test\n\n${SINGLE}\n${PHRASE}\n`,
);
execFileSync(process.execPath, [GEN, join(scratch, 'terms.txt'), HASHES]);

function git(cwd, ...args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' });
}

function newRepo() {
  const dir = mkdtempSync(join(tmpdir(), 'clatter-gate-'));
  git(dir, 'init', '-q', '-b', 'main');
  git(dir, 'config', 'user.email', 'gate@example.invalid');
  git(dir, 'config', 'user.name', 'gate test');
  writeFileSync(join(dir, 'readme.txt'), 'a clean tracked file about dice\n');
  git(dir, 'add', '-A');
  git(dir, 'commit', '-q', '-m', 'chore: seed the scratch repository');
  return dir;
}

function runGate(cwd, args) {
  const r = spawnSync(process.execPath, [GATE, '--hashes', HASHES, ...args], {
    cwd,
    encoding: 'utf8',
  });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
}

function runCount(cwd, args = [], env = {}) {
  const r = spawnSync('sh', [COUNT, '--hashes', HASHES, ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
}

test('surface 1 of 4: a forbidden term in a tracked file goes red', () => {
  const dir = newRepo();
  writeFileSync(join(dir, 'notes.txt'), `the ${SINGLE} sits here\n`);
  git(dir, 'add', '-A');
  const { code, out } = runGate(dir, ['--surface', 'tracked']);
  assert.notEqual(code, 0, out);
  assert.match(out, /surface=tracked ref=notes\.txt/, out);
});

test('surface 2 of 4: a forbidden term in built output goes red', () => {
  const dir = newRepo();
  mkdirSync(join(dir, 'dist'));
  writeFileSync(join(dir, 'dist', 'bundle.js'), `const label = "${SINGLE}";\n`);
  const { code, out } = runGate(dir, ['--surface', 'dist']);
  assert.notEqual(code, 0, out);
  assert.match(out, /surface=dist ref=dist\/bundle\.js/, out);
});

test('surface 3 of 4: a forbidden term in a commit message goes red', () => {
  const dir = newRepo();
  const base = git(dir, 'rev-parse', 'HEAD').trim();
  writeFileSync(join(dir, 'other.txt'), 'clean content\n');
  git(dir, 'add', '-A');
  git(dir, 'commit', '-q', '-m', `feat: add support for ${SINGLE}`);
  const head = git(dir, 'rev-parse', 'HEAD').trim();
  const { code, out } = runGate(dir, ['--surface', 'commits', '--base', base]);
  assert.notEqual(code, 0, out);
  assert.match(out, new RegExp(`surface=commits ref=${head}`), out);
});

test('surface 4 of 4: a forbidden term in repository metadata goes red', () => {
  const dir = newRepo();
  const meta = join(dir, 'meta.json');
  writeFileSync(meta, JSON.stringify({ description: `a roller for ${SINGLE}`, topics: ['dice'] }));
  const { code, out } = runGate(dir, ['--surface', 'metadata', '--metadata-file', 'meta.json']);
  assert.notEqual(code, 0, out);
  assert.match(out, /surface=metadata ref=meta\.json#description/, out);

  writeFileSync(meta, JSON.stringify({ description: 'a dice roller', topics: ['dice', SINGLE] }));
  const t = runGate(dir, ['--surface', 'metadata', '--metadata-file', 'meta.json']);
  assert.notEqual(t.code, 0, t.out);
  assert.match(t.out, /surface=metadata ref=meta\.json#topics/, t.out);
});

test('a clean tree exits 0, so the red-proofs prove something', () => {
  const dir = newRepo();
  mkdirSync(join(dir, 'dist'));
  writeFileSync(join(dir, 'dist', 'bundle.js'), 'const label = "clean";\n');
  writeFileSync(join(dir, 'meta.json'), JSON.stringify({ description: 'dice', topics: ['dice'] }));
  const { code, out } = runGate(dir, ['--metadata-file', 'meta.json']);
  assert.equal(code, 0, out);
  assert.match(out, /branding-gate: hits=0/, out);
});

test('word boundaries: a term inside a longer word does not fire, the word alone does', () => {
  const inner = newRepo();
  writeFileSync(join(inner, 'notes.txt'), `we x${SINGLE}y the pool\n`);
  git(inner, 'add', '-A');
  const a = runGate(inner, ['--surface', 'tracked']);
  assert.equal(a.code, 0, a.out);

  const alone = newRepo();
  writeFileSync(join(alone, 'notes.txt'), `we ${SINGLE} the pool\n`);
  git(alone, 'add', '-A');
  const b = runGate(alone, ['--surface', 'tracked']);
  assert.notEqual(b.code, 0, b.out);
  assert.match(b.out, /surface=tracked ref=notes\.txt/, b.out);
});

test('a phrase fires only as consecutive words', () => {
  const apart = newRepo();
  writeFileSync(join(apart, 'notes.txt'), `${W2} one two three four ${W1}\n`);
  git(apart, 'add', '-A');
  const a = runGate(apart, ['--surface', 'tracked']);
  assert.equal(a.code, 0, a.out);

  const together = newRepo();
  writeFileSync(join(together, 'notes.txt'), `the ${W1} ${W2} here\n`);
  git(together, 'add', '-A');
  const b = runGate(together, ['--surface', 'tracked']);
  assert.notEqual(b.code, 0, b.out);
  assert.match(b.out, /surface=tracked ref=notes\.txt token=1 words=2/, b.out);
});

test('--file scans a named path only, which is what the editor hook uses', () => {
  const dir = newRepo();
  writeFileSync(join(dir, 'draft.txt'), `a note about ${SINGLE}\n`);
  writeFileSync(join(dir, 'clean.txt'), 'a note about dice\n');
  const bad = runGate(dir, ['--file', 'draft.txt']);
  assert.notEqual(bad.code, 0, bad.out);
  assert.match(bad.out, /surface=file ref=draft\.txt/, bad.out);
  const good = runGate(dir, ['--file', 'clean.txt']);
  assert.equal(good.code, 0, good.out);
});

test('the shipped hash file can hold nothing but digests', () => {
  const doc = JSON.parse(readFileSync(SHIPPED_HASHES, 'utf8'));
  // Exactly five keys, so no extra field can carry free text.
  assert.deepEqual(Object.keys(doc).sort(), [
    'algorithm',
    'allowlist',
    'hashes',
    'maxNgram',
    'salt',
  ]);
  assert.equal(doc.algorithm, 'sha256');
  assert.match(doc.salt, /^[0-9a-f]{32}$/);
  assert.equal(Number.isInteger(doc.maxNgram) && doc.maxNgram >= 1, true);
  assert.ok(Array.isArray(doc.hashes) && doc.hashes.length > 0);
  const bad = doc.hashes.filter((h) => typeof h !== 'string' || !/^[0-9a-f]{64}$/.test(h));
  assert.deepEqual(bad, [], `${bad.length} of ${doc.hashes.length} entries are not digests`);
  // The allow-list is plaintext by design. Its entries are ordinary words that
  // over-match, never trademarks. Fix its shape so nothing else hides there.
  for (const entry of doc.allowlist) {
    assert.deepEqual(Object.keys(entry).sort(), ['reason', 'term']);
    assert.equal(typeof entry.term, 'string');
    assert.equal(typeof entry.reason, 'string');
  }
});

const listPath = process.env.CLATTER_FORBIDDEN_TERMS;
test(
  'the tracked tree holds no term from the real list',
  { skip: listPath ? false : 'set CLATTER_FORBIDDEN_TERMS to run this optional check' },
  () => {
    const terms = readFileSync(listPath, 'utf8')
      .split('\n')
      .map((l) => l.trim().toLowerCase())
      .filter((l) => l !== '' && !l.startsWith('#'));
    assert.ok(terms.length > 0, 'the term list is empty');
    const repo = join(here, '..');
    const tree = execFileSync('git', ['ls-files', '-z'], { cwd: repo, encoding: 'utf8' })
      .split('\0')
      .filter(Boolean);
    const leaked = [];
    for (const file of tree) {
      const text = readFileSync(join(repo, file)).toString('utf8').toLowerCase();
      for (const term of terms) if (text.includes(term)) leaked.push(file);
    }
    assert.deepEqual(
      [...new Set(leaked)],
      [],
      `${terms.length} terms checked over ${tree.length} files`,
    );
  },
);

test('an empty hash list is a usage error, not a clean scan', () => {
  const dir = newRepo();
  const emptyHashes = join(scratch, 'empty-hashes.json');
  writeFileSync(
    emptyHashes,
    JSON.stringify({ salt: 'a'.repeat(32), maxNgram: 1, hashes: [], allowlist: [] }),
  );
  const r = spawnSync(process.execPath, [GATE, '--hashes', emptyHashes], {
    cwd: dir,
    encoding: 'utf8',
  });
  assert.notEqual(r.status, 0, r.stdout + r.stderr);
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stdout + r.stderr, /branding-gate:.*holds no hashes/, r.stdout + r.stderr);
});

test('the denominator goes red when the gate under-reports', () => {
  const dir = newRepo();
  writeFileSync(join(dir, 'data.json'), '{"clean": true}\n');
  git(dir, 'add', '-A');

  const ok = runCount(dir, ['--surface', 'tracked']);
  assert.equal(ok.code, 0, ok.out);
  assert.match(
    ok.out,
    /branding-count: OK accounted=2 expected=2 scanned=2 binary_skipped=0/,
    ok.out,
  );

  const red = runCount(dir, ['--surface', 'tracked'], { CLATTER_BRANDING_SKIP_EXT: '.json' });
  assert.notEqual(red.code, 0, red.out);
  assert.match(
    red.out,
    /branding-count: FAIL gate accounted for 1 files, expected at least 2/,
    red.out,
  );
  assert.match(red.out, /shortfall=1 scanned=1 binary_skipped=0 tracked=2 dist=0/, red.out);
});

test('a binary file is skipped, counted, and never tokenised', () => {
  // Baseline. One tracked text file, nothing skipped.
  const clean = newRepo();
  const base = runGate(clean, ['--surface', 'tracked']);
  assert.equal(base.code, 0, base.out);
  assert.match(base.out, /files_scanned=1 binary_skipped=0 unreadable=0 enumerated=1/, base.out);

  // The same term, held after a NUL byte. The sniff calls the file binary, so
  // the gate skips it, counts it, and names the metadata it did not read.
  const dir = newRepo();
  writeFileSync(join(dir, 'asset.bin'), Buffer.concat([Buffer.from([0]), Buffer.from(SINGLE)]));
  git(dir, 'add', '-A');
  const { code, out } = runGate(dir, ['--surface', 'tracked']);
  assert.equal(code, 0, out);
  assert.match(out, /files_scanned=1 binary_skipped=1 unreadable=0 enumerated=2/, out);
  assert.match(out, /binary metadata NOT scanned in 1 files/, out);

  // The enumeration still balances against the independent count.
  const counted = runCount(dir, ['--surface', 'tracked']);
  assert.equal(counted.code, 0, counted.out);
  assert.match(
    counted.out,
    /branding-count: OK accounted=2 expected=2 scanned=1 binary_skipped=1/,
    counted.out,
  );

  // The same bytes without the NUL still go red. Without this half the skip
  // could be hiding a gate that matched nothing anyway.
  const text = newRepo();
  writeFileSync(join(text, 'asset.bin'), SINGLE);
  git(text, 'add', '-A');
  const t = runGate(text, ['--surface', 'tracked']);
  assert.notEqual(t.code, 0, t.out);
  assert.match(t.out, /surface=tracked ref=asset\.bin/, t.out);
});
