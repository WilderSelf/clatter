// The precache coverage guard, tested directly.
//
// Its only proof used to be a manual injection into a real build, which nobody
// re-runs. These two cases run it against a temporary directory instead, so the
// guard is checked in both directions by `npm test`.

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { coverPrecache } from '../vite.config';

let dir = '';

/** Build a directory holding the named files, and return its path. */
function distHolding(...names: string[]): string {
  dir = mkdtempSync(join(tmpdir(), 'precache-'));
  for (const name of names) {
    const path = join(dir, name);
    mkdirSync(join(path, '..'), { recursive: true });
    writeFileSync(path, 'x');
  }
  return dir;
}

/** The shape workbox hands a manifest transform, for the given urls. */
function manifestOf(...urls: string[]) {
  return urls.map((url) => ({ url, revision: null, size: 1 }));
}

afterEach(() => {
  if (dir) rmSync(dir, { recursive: true, force: true });
  dir = '';
});

describe('coverPrecache', () => {
  it('passes when every fetchable file is in the manifest', () => {
    // `sw.js` is in the directory and not in the manifest on purpose. It is the
    // worker itself, never fetched by url, so the guard must not judge it. A
    // pass with only precached files present would not show that.
    const built = distHolding('index.html', 'assets/index-abc.js', 'sw.js');
    const entries = manifestOf('index.html', 'assets/index-abc.js');

    expect(coverPrecache(entries, built)).toEqual({ manifest: entries, warnings: [] });
  });

  it('throws and names the file when one escapes the manifest', () => {
    const built = distHolding('index.html', 'textures/leather.webp');
    const entries = manifestOf('index.html');

    expect(() => coverPrecache(entries, built)).toThrow(/textures\/leather\.webp/);
  });
});
