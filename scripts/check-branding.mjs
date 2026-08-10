#!/usr/bin/env node
// Branding gate. Scans four surfaces against salted hashes of forbidden terms.
// Exit 0 clean, 1 on a hit, 2 on a usage error, 3 when its own file counts do
// not balance.
//
// The gate never prints the matching text. A hit names the surface, the file or
// ref, the token offset and a hash prefix. Printing the text would put the term
// into a public CI log, which is the thing this gate exists to prevent.
//
// Usage:
//   node scripts/check-branding.mjs [--surface tracked,dist,commits,metadata]
//                                   [--base <ref>] [--metadata-file <path>]
//                                   [--hashes <path>]
//   node scripts/check-branding.mjs --file <path> [--file <path>]
// Surfaces run from the current working directory. All four run by default.
// `--file` scans named paths only and runs no surface. The editor hook uses it.

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ALL_SURFACES = ['tracked', 'dist', 'commits', 'metadata'];

// The window the binary sniff reads. Same size git uses for the same decision,
// in xdiff-interface.c: `#define FIRST_FEW_BYTES 8000`.
const SNIFF_BYTES = 8000;

/**
 * True when the first 8000 bytes hold a NUL byte.
 *
 * The rule reads content, not the extension, because an extension can lie and a
 * generated asset can arrive with none. NUL is the rule because no text this
 * repository accepts holds one, and every binary container it holds writes one
 * in its header. The alternative rule, a UTF-8 validity test, was rejected: it
 * decodes every byte of every file, and it rejects a legitimate Latin-1 file.
 *
 * ponytail: a binary format that writes no NUL in its first 8000 bytes still
 * reads as text and can produce a junk-token hit. Move to a UTF-8 validity test
 * if such a file ever lands here.
 */
export function isBinary(buf) {
  return buf.subarray(0, SNIFF_BYTES).includes(0);
}

/** Split text into lower-case word tokens. Word boundaries, never substrings. */
export function tokenise(text) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/** Normalise a term through the same tokeniser the scan uses, so both sides agree. */
export function normaliseTerm(term) {
  return tokenise(term).join(' ');
}

export function digest(salt, text) {
  return createHash('sha256').update(`${salt}:${text}`).digest('hex');
}

function git(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (entry.isFile()) out.push(p);
  }
  return out;
}

/** Hash every n-gram from 1 to maxNgram and report the ones on the list. */
function scanText(text, surface, ref, cfg, hits) {
  const words = tokenise(text);
  for (let i = 0; i < words.length; i += 1) {
    for (let n = 1; n <= cfg.maxNgram && i + n <= words.length; n += 1) {
      const gram = words.slice(i, i + n).join(' ');
      if (cfg.allow.has(gram)) continue;
      const h = digest(cfg.salt, gram);
      if (cfg.hashes.has(h)) hits.push({ surface, ref, token: i, words: n, hash: h.slice(0, 12) });
    }
  }
}

// Every path handed here lands in exactly one of three counters. `enumerated`
// counts the paths, and main() checks the three against it.
function scanFiles(files, surface, cfg, hits, state) {
  for (const file of files) {
    state.enumerated += 1;
    let buf;
    try {
      buf = readFileSync(file);
    } catch (err) {
      // Not counted as scanned, so the file-count denominator goes red.
      state.unreadable.push(`${file}: ${err.code ?? err.message}`);
      continue;
    }
    if (isBinary(buf)) {
      // Decoded binary makes thousands of junk tokens, and one of them hashed to
      // a term on the list. The skip is reported, never silent.
      state.binary.push(file);
      continue;
    }
    state.scanned += 1;
    scanText(buf.toString('utf8'), surface, file, cfg, hits);
  }
}

function parseArgs(argv) {
  const opts = { surfaces: null, base: null, metadataFile: null, hashes: null, files: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => {
      i += 1;
      if (i >= argv.length) throw new Error(`${arg} needs a value`);
      return argv[i];
    };
    if (arg === '--surface') {
      opts.surfaces = (opts.surfaces ?? []).concat(next().split(',').filter(Boolean));
    } else if (arg === '--file') opts.files.push(next());
    else if (arg === '--base') opts.base = next();
    else if (arg === '--metadata-file') opts.metadataFile = next();
    else if (arg === '--hashes') opts.hashes = next();
    else throw new Error(`unknown argument: ${arg}`);
  }
  for (const s of opts.surfaces ?? []) {
    if (!ALL_SURFACES.includes(s)) throw new Error(`unknown surface: ${s}`);
  }
  return opts;
}

function loadConfig(path) {
  const raw = JSON.parse(readFileSync(path, 'utf8'));
  const hashes = new Set(raw.hashes);
  if (hashes.size === 0) {
    throw new Error(`${path} holds no hashes; a gate with nothing to match checks nothing`);
  }
  return {
    salt: raw.salt,
    maxNgram: raw.maxNgram,
    hashes,
    allow: new Set((raw.allowlist ?? []).map((a) => normaliseTerm(a.term))),
  };
}

function main(argv) {
  let opts;
  try {
    opts = parseArgs(argv);
  } catch (err) {
    console.error(`branding-gate: ${err.message}`);
    return 2;
  }

  const here = dirname(fileURLToPath(import.meta.url));
  let cfg;
  try {
    cfg = loadConfig(opts.hashes ?? join(here, 'forbidden-hashes.json'));
  } catch (err) {
    console.error(`branding-gate: ${err.message}`);
    return 2;
  }
  const surfaces = opts.files.length > 0 ? (opts.surfaces ?? []) : (opts.surfaces ?? ALL_SURFACES);
  const cwd = process.cwd();
  const hits = [];
  const state = { scanned: 0, enumerated: 0, binary: [], unreadable: [] };

  // Test-only. Makes the gate under-report, to red-proof the file-count check.
  const skipExt = process.env.CLATTER_BRANDING_SKIP_EXT ?? '';
  const keep = (f) => skipExt === '' || !f.endsWith(skipExt);

  if (opts.files.length > 0) scanFiles(opts.files, 'file', cfg, hits, state);

  if (surfaces.includes('tracked')) {
    const listed = git(cwd, ['ls-files', '-z']).split('\0').filter(Boolean);
    scanFiles(listed.filter(keep), 'tracked', cfg, hits, state);
  }

  if (surfaces.includes('dist') && existsSync('dist')) {
    scanFiles(walk('dist').filter(keep), 'dist', cfg, hits, state);
  }

  if (surfaces.includes('commits')) {
    let base = opts.base;
    if (base === null) {
      try {
        base = git(cwd, ['merge-base', 'main', 'HEAD']).trim();
      } catch {
        base = null;
      }
    }
    if (base !== null) {
      const shas = git(cwd, ['rev-list', `${base}..HEAD`])
        .split('\n')
        .filter(Boolean);
      for (const sha of shas) {
        scanText(git(cwd, ['show', '-s', '--format=%B', sha]), 'commits', sha, cfg, hits);
      }
    }
  }

  if (surfaces.includes('metadata') && opts.metadataFile !== null) {
    const meta = JSON.parse(readFileSync(opts.metadataFile, 'utf8'));
    scanText(
      String(meta.description ?? ''),
      'metadata',
      `${opts.metadataFile}#description`,
      cfg,
      hits,
    );
    scanText((meta.topics ?? []).join(' '), 'metadata', `${opts.metadataFile}#topics`, cfg, hits);
  }

  for (const err of state.unreadable) console.log(`branding-gate: unreadable ${err}`);
  for (const hit of hits) {
    console.log(
      `branding-gate: HIT surface=${hit.surface} ref=${hit.ref} ` +
        `token=${hit.token} words=${hit.words} hash=${hit.hash}`,
    );
  }

  const skipped = state.binary.length;
  console.log(
    `branding-gate: files_scanned=${state.scanned} binary_skipped=${skipped} ` +
      `unreadable=${state.unreadable.length} enumerated=${state.enumerated} ` +
      `terms_loaded=${cfg.hashes.size}`,
  );
  if (skipped > 0) {
    // Name the hole the skip leaves. The gate reads no binary container, so text
    // held in a metadata chunk of one of these files is not scanned at all.
    const exts = [...new Set(state.binary.map((f) => extname(f).toLowerCase() || '(none)'))].sort();
    console.log(
      `branding-gate: binary metadata NOT scanned in ${skipped} files ` +
        `(PNG tEXt, PNG iTXt, JPEG EXIF and the like): ${exts.join(' ')}`,
    );
  }
  console.log(`branding-gate: hits=${hits.length} surfaces=${surfaces.join(',')}`);

  // The counted denominator. A printed number nobody checks is not a check.
  const accounted = state.scanned + skipped + state.unreadable.length;
  if (accounted !== state.enumerated) {
    console.log(
      `branding-gate: DENOMINATOR scanned+binary_skipped+unreadable=${accounted} ` +
        `does not equal enumerated=${state.enumerated}`,
    );
    return 3;
  }
  return hits.length > 0 ? 1 : 0;
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main(process.argv.slice(2)));
}
