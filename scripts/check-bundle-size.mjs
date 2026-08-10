#!/usr/bin/env node
// Bundle-size gate. Reads budgets.json and compares the built output against it.
// Exit 0 clean, 1 over budget or a missing artefact, 2 on a usage or data error.
//
// Constraint 5: every number comes out of budgets.json. No budget is retyped
// here, and a null budget fails loudly rather than skipping, because a check
// that skips is a check that cannot fail.
//
// Usage:
//   node scripts/check-bundle-size.mjs [--dist <dir>] [--budgets <path>]
//
// Gzip uses the zlib default level, which is the level a static host serves at.
// A budget named in gzip bytes is therefore measured the way a reader pays it.

import { gzipSync } from 'node:zlib';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// The two files vite-plugin-pwa writes for the worker itself, by the names it
// gives them. Unit 5.1 added them.
const SERVICE_WORKER_NAMES = [/^sw\.js$/, /^workbox-[0-9a-f]+\.js$/];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (entry.isFile()) out.push(p);
  }
  return out;
}

/** Read one budget. A null budget is not yet measured, and it fails here. */
export function readBudget(budgets, key) {
  if (!(key in budgets)) throw new Error(`budgets.json holds no key ${key}`);
  const value = budgets[key];
  if (value === null) {
    throw new Error(
      `budget ${key} is null in budgets.json. It is not measured yet. ` +
        `Record it in the unit that owns it. Do not invent a number and do not skip the check.`,
    );
  }
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`budget ${key} is not a number`);
  }
  return value;
}

/** The scripts the page loads before it paints: entry plus its preloaded static imports. */
export function initialScriptNames(html) {
  const names = new Set();
  for (const [, url] of html.matchAll(/<script[^>]+src="([^"]+)"/g)) names.add(basename(url));
  for (const [, url] of html.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"/g)) {
    names.add(basename(url));
  }
  return names;
}

function gzipBytes(files) {
  return files.reduce((sum, f) => sum + gzipSync(readFileSync(f)).length, 0);
}

function parseArgs(argv) {
  const here = dirname(fileURLToPath(import.meta.url));
  const opts = { dist: 'dist', budgets: join(here, '..', 'budgets.json') };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--dist') opts.dist = argv[(i += 1)];
    else if (argv[i] === '--budgets') opts.budgets = argv[(i += 1)];
    else throw new Error(`unknown argument: ${argv[i]}`);
  }
  if (opts.dist === undefined || opts.budgets === undefined)
    throw new Error('an option needs a value');
  return opts;
}

function main(argv) {
  let opts;
  try {
    opts = parseArgs(argv);
  } catch (err) {
    console.error(`bundle-size: ${err.message}`);
    return 2;
  }

  if (!existsSync(opts.dist)) {
    console.error(`bundle-size: ${opts.dist} does not exist. Run the build first.`);
    return 2;
  }
  const budgets = JSON.parse(readFileSync(opts.budgets, 'utf8'));
  const html = readFileSync(join(opts.dist, 'index.html'), 'utf8');

  const js = walk(opts.dist).filter((f) => f.endsWith('.js'));
  const wanted = initialScriptNames(html);
  const initial = js.filter((f) => wanted.has(basename(f)));
  const rest = js.filter((f) => !wanted.has(basename(f)));
  // The service worker is not a chunk of the application. No page imports it
  // and no page waits for it, so counting it against the 3D budget would fail
  // that budget for a reason nobody changed. It is reported on its own line
  // instead, with no budget, because Constraint 5 forbids inventing one.
  // `registerSW.js` is not here: index.html names it, so the page does load it
  // and it belongs in the initial figure.
  const worker = rest.filter((f) => SERVICE_WORKER_NAMES.some((p) => p.test(basename(f))));
  const lazy = rest.filter((f) => !SERVICE_WORKER_NAMES.some((p) => p.test(basename(f))));

  if (initial.length === 0) {
    console.error(`bundle-size: ${opts.dist}/index.html references no built script`);
    return 2;
  }

  const failures = [];

  let initialBudget;
  try {
    initialBudget = readBudget(budgets, 'initial_js_gzip_bytes');
  } catch (err) {
    console.error(`bundle-size: ${err.message}`);
    return 2;
  }
  const initialSize = gzipBytes(initial);
  const verdict = initialSize <= initialBudget ? 'OK' : 'FAIL';
  console.log(
    `bundle-size: ${verdict} initial_js_gzip_bytes measured=${initialSize} budget=${initialBudget} ` +
      `files=${initial.length}`,
  );
  if (initialSize > initialBudget) {
    failures.push(`initial_js_gzip_bytes measured=${initialSize} budget=${initialBudget}`);
  }

  // The lazy 3D chunk does not exist before Phase 3. An absent artefact is
  // reported as not applicable, never as a pass, and the report is earned
  // rather than assumed: a dynamic import in the initial bundle means a chunk
  // MUST exist, so a chunk that goes missing later fails here instead of
  // reading as "not applicable". Every split chunk counts against the budget,
  // which over-counts if a later unit splits something else. Over-counting
  // fails loudly. Under-counting would pass quietly.
  const splits = initial.some((f) => /\bimport\s*\(/.test(readFileSync(f, 'utf8')));
  if (lazy.length === 0 && !splits) {
    console.log(
      'bundle-size: lazy_3d_chunk_gzip_bytes not applicable. ' +
        'dist holds no split chunk and the initial bundle holds no dynamic import.',
    );
  } else if (lazy.length === 0) {
    console.log(
      'bundle-size: FAIL lazy_3d_chunk_gzip_bytes measured=absent. ' +
        'The initial bundle holds a dynamic import, so a split chunk must exist in dist.',
    );
    failures.push('lazy_3d_chunk_gzip_bytes measured=absent budget=unread');
  } else {
    let lazyBudget;
    try {
      lazyBudget = readBudget(budgets, 'lazy_3d_chunk_gzip_bytes');
    } catch (err) {
      console.error(`bundle-size: ${err.message}`);
      return 2;
    }
    const lazySize = gzipBytes(lazy);
    const lazyVerdict = lazySize <= lazyBudget ? 'OK' : 'FAIL';
    console.log(
      `bundle-size: ${lazyVerdict} lazy_3d_chunk_gzip_bytes measured=${lazySize} ` +
        `budget=${lazyBudget} files=${lazy.length}`,
    );
    if (lazySize > lazyBudget) {
      failures.push(`lazy_3d_chunk_gzip_bytes measured=${lazySize} budget=${lazyBudget}`);
    }
  }

  console.log(
    `bundle-size: service_worker_gzip_bytes measured=${gzipBytes(worker)} files=${worker.length}` +
      ` reported, no budget`,
  );

  console.log(`bundle-size: failures=${failures.length}`);
  return failures.length > 0 ? 1 : 0;
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main(process.argv.slice(2)));
}
