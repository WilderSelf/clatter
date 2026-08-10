// The driver. This is the only file that names a browser automation library.
//
// The plan named Playwright against a system chromium. Measured on this host on
// 2026-08-09: chromium is absent and installing it needs sudo, which belongs to
// the owner. Playwright cannot drive a system firefox either, because it needs
// its own patched build and the sandbox blocks the download. `/usr/bin/firefox`
// is present and drives over WebDriver BiDi with no download and no sudo, so
// puppeteer-core drives it.
//
// To go back to Playwright and chromium, change this file only. Every caller
// uses `page.setContent`, `page.goto`, `page.evaluate` and `page.$`, which both
// libraries spell the same way.

import puppeteer from 'puppeteer-core';

export const DEFAULT_BROWSER_PATH = '/usr/bin/firefox';

// The harness must be able to read a software renderer name and fail on it. A
// browser that refuses a software context reports no name at all, which is a
// weaker signal. So software contexts are allowed here, and the renderer check
// in the entrypoint decides whether one is acceptable.
const PREFERENCES = {
  'webgl.forbid-software': false,
  'webgl.force-enabled': true,
  'webgl.disable-fail-if-major-performance-caveat': true,
  // Default true. It replaces the renderer name with a coarse bucket, which
  // hides which driver actually ran.
  'webgl.sanitize-unmasked-renderer': false,
  // `navigator.storage.persist()` asks for a permission, and a headless browser
  // has nobody to answer the prompt, so the promise never settles and a run
  // hangs until the driver gives up. Measured on this host on 2026-08-09. 1 is
  // allow, so the browser answers at once and the answer is a real one.
  'permissions.default.persistent-storage': 1,
  // No proxy, ever. The harness only reaches a local dev server. Firefox reads
  // the system proxy by default, and inside the sandbox that proxy asks for a
  // user name and a password, so a run there stops at a modal prompt instead of
  // loading the page. Measured on this host on 2026-08-09.
  'network.proxy.type': 0,
};

// Forces the Mesa software rasteriser. The renderer red-proof uses it.
const SOFTWARE_ENV = {
  LIBGL_ALWAYS_SOFTWARE: '1',
  EGL_PLATFORM: 'surfaceless',
  MOZ_LAYERS_ALLOW_SOFTWARE_GL: '1',
};

/**
 * Caps the storage every origin shares, in kilobytes. It is how this browser's
 * own test suite makes a real `QuotaExceededError`, and it needs the testing
 * switch beside it. Nothing simulates the error: the browser raises it.
 *
 * @param {number} kilobytes
 */
function quotaPreferences(kilobytes) {
  return {
    'dom.quotaManager.testing': true,
    'dom.quotaManager.temporaryStorage.fixedLimit': kilobytes,
  };
}

/**
 * Open one page. Returns the page and a close function.
 *
 * @param {{ browserPath?: string, forceSoftware?: boolean, quotaKb?: number|null }} options
 */
export async function openPage({
  browserPath = DEFAULT_BROWSER_PATH,
  forceSoftware = false,
  quotaKb = null,
} = {}) {
  const browser = await puppeteer.launch({
    browser: 'firefox',
    executablePath: browserPath,
    headless: true,
    extraPrefsFirefox: {
      ...PREFERENCES,
      ...(quotaKb === null ? {} : quotaPreferences(quotaKb)),
    },
    env: {
      ...process.env,
      MOZ_HEADLESS: '1',
      ...(forceSoftware ? SOFTWARE_ENV : {}),
    },
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 600 });
  return { page, close: () => browser.close() };
}
