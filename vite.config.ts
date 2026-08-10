import { readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { defineConfig } from 'vitest/config';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';
import type { ManifestTransform, ManifestTransformResult } from 'workbox-build';

// What a manifestTransforms function is handed.
//
// workbox builds each entry as `{url, revision, size}` and strips `size` off
// again after the last transform has run, so a transform sees the byte size and
// the written manifest does not — see workbox-build/build/lib/transform-manifest.js.
// The library exports no name for that shape, only the signature that holds it,
// so this reads the shape back off the signature rather than restating it.
type SizedEntry = Parameters<ManifestTransform>[0][number];

// The service worker precaches what the built site holds. This list names the
// extensions the site ships today. It is not the guard: `coverPrecache` below
// compares the manifest against `dist/` and fails the build when a file the
// browser can fetch is not in it, so an extension missing here is a red build
// rather than a page that goes blank on a train.
const PRECACHE_GLOBS = ['**/*.{html,js,css,webp,png,svg,json,woff2}'];

// What this transform may not judge.
//
// The first three are never fetched by URL: `sw.js` is the worker itself,
// `workbox-*.js` is the runtime it imports directly, and a source map is
// fetched by the developer tools alone.
//
// `manifest.webmanifest` is different. It IS precached, by an entry the plugin
// appends after every `manifestTransforms` function has run, so this transform
// cannot see it. The browser half of the check covers it instead: the offline
// harness run fetches the manifest with the network disabled.
const NOT_JUDGED_HERE = [/^sw\.js$/, /^workbox-[^/]+\.js$/, /\.map$/, /^manifest\.webmanifest$/];

function everyFileIn(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) everyFileIn(path, out);
    else if (entry.isFile()) out.push(path);
  }
  return out;
}

/**
 * Fail the build when a built file escapes the precache.
 *
 * The plan warns that the tray fetches its textures from a static path at
 * runtime, and that Vite never hashes such a file. Today the six colour sets
 * all name the `none` texture, so no texture file is copied and nothing is
 * fetched at runtime — measured, not assumed. This transform is what keeps that
 * true: the first `public/textures/*.webp` anybody adds either lands in the
 * precache manifest or turns the build red naming itself. A note in a file
 * nobody opens would not.
 *
 * It runs inside `generateSW`, so it reads the manifest workbox is about to
 * write, not a copy of the configuration that produced it.
 */
export function coverPrecache(entries: SizedEntry[], distDir = 'dist'): ManifestTransformResult {
  const held = new Set(entries.map((entry) => entry.url));
  const built = everyFileIn(distDir)
    .map((path) => relative(distDir, path).split(sep).join('/'))
    .filter((url) => !NOT_JUDGED_HERE.some((pattern) => pattern.test(url)));
  const escaped = built.filter((url) => !held.has(url));
  if (escaped.length > 0) {
    throw new Error(
      `precache coverage: ${escaped.length} of the ${built.length} fetchable files in ` +
        `${distDir} are not in the precache manifest, so the app would need the network ` +
        `for them: ${escaped.join(', ')}. Add the pattern to PRECACHE_GLOBS in ` +
        `vite.config.ts, or state why the file may not be precached.`,
    );
  }
  console.log(
    `precache coverage: ${built.length} of ${built.length} fetchable files in ${distDir} ` +
      `are precached, out of ${entries.length} manifest entries`,
  );
  return { manifest: entries, warnings: [] };
}

export default defineConfig({
  // The site is served from a project Pages path, so every asset URL carries
  // the repository name. Unit 5.4 may add a custom address, and this value
  // becomes '/' on the day it does.
  base: '/clatter/',
  plugins: [
    preact(),
    VitePWA({
      // No update prompt exists to answer, and a player at the table must not
      // be asked about the application. The worker takes over and claims the
      // page by itself.
      registerType: 'autoUpdate',
      // The registration is a separate small script named by index.html.
      // Nothing enters the application chunk, and the entry chunk keeps the
      // content hash it had before this unit.
      injectRegister: 'script',
      // The icons are copied into dist by Vite and the glob above precaches
      // them there. The plugin's own icon entries would name the same two URLs
      // with a hash taken by a different algorithm, and workbox refuses a
      // precache list that holds one URL twice with two revisions.
      includeManifestIcons: false,
      manifest: {
        // The name is a branding surface. It names this application and
        // nothing else. Constraint 1.
        name: 'Clatter',
        short_name: 'Clatter',
        description: 'A dice roller for dice pools, with a push.',
        lang: 'en',
        display: 'standalone',
        background_color: '#17181A',
        theme_color: '#17181A',
        icons: [
          // Relative to the manifest, so they resolve under the project path.
          // Drawn by scripts/gen-icons.mjs. This repository downloads no asset.
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: PRECACHE_GLOBS,
        // The plugin does not set these two, so this file must.
        //
        // It sets them only when `injectRegister` is 'auto' or absent — see
        // vite-plugin-pwa/dist/index.js, the `registerType === "autoUpdate"`
        // branch. This unit sets `injectRegister: 'script'` on purpose, to keep
        // the registration out of the entry chunk, and that turns the branch
        // off. Without them workbox writes the other half of its template: a
        // `SKIP_WAITING` message listener that nothing sends a message to, and
        // no `clientsClaim()` at all. The worker then installs, waits, and never
        // controls the page that registered it, so the first visit stays
        // uncontrolled and the offline check fails.
        skipWaiting: true,
        clientsClaim: true,
        // The lazy 3D chunk is precached, deliberately.
        //
        // It is about 150 KB gzipped and it is the largest thing the site
        // holds, so precaching it is the one real cost of this unit. It is
        // paid after the page has painted, by the worker, in the background:
        // it moves no byte into the initial chunk and it delays no first
        // paint. What it buys is the dice. Unit 3.7 falls back to flat dice
        // when the chunk will not load, and that fallback is a defence against
        // a broken graphics card, not a plan for normal use. A player who
        // installed this application and opened it on a train would meet the
        // fallback every time, and the fallback is not the product.
        //
        // Rejected: leaving the chunk out and catching it with a runtime
        // cache-first route. It saves a first-visit download, and it hands the
        // flat fallback to exactly the player this unit is for — the one who
        // visited once and then lost the network. It also adds a second
        // caching route to keep correct.
        //
        // Nothing else is excluded either. `coverPrecache` above holds that
        // true, and the two figures the ledger reports come from
        // scripts/check-bundle-size.mjs.
        manifestTransforms: [(entries) => coverPrecache(entries)],
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    // Constraint 3: the rules core holds no module-level mutable state. Files
    // and tests therefore run in a shuffled order, and a result that depends on
    // the order of the calls before it goes red. The seed is fixed, so the run
    // is reproducible and the ledger can name the order that ran.
    sequence: { shuffle: { files: true, tests: true }, seed: 42 },
  },
});
