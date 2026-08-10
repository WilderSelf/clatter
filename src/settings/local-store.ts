// The browser binding for the settings store.
//
// `src/settings/settings.ts` names no browser API, so it runs under a plain
// test runner. This file is the one place that names `localStorage`, and it is
// the whole of the binding: `readSettings` and `writeSettings` already take the
// store as an argument and already answer for a store that refuses a call.

import type { SettingsStore } from './settings';

/**
 * The browser's own store, or null when the browser refuses it.
 *
 * Safari in private mode and a browser with site data turned off both throw
 * from the property itself, before any read. A caller that gets null passes it
 * straight to `readSettings`, which answers the defaults, and to
 * `writeSettings`, which answers false. The application then holds the record in
 * memory for the session and nothing throws.
 */
export function localSettingsStore(): SettingsStore | null {
  try {
    return globalThis.localStorage ?? null;
  } catch (error) {
    void error;
    return null;
  }
}
