// The browser binding for the settings store.
//
// `src/settings/settings.ts` names no browser API, so it runs under a plain
// test runner. This file is the one place that names `localStorage`, and it is
// the whole of the binding: `readSettings` and `writeSettings` already take the
// store as an argument and already answer for a store that refuses a call.

import type { SettingsStore } from './settings';

/**
 * What the browser answered when the page asked for its own store.
 *
 * It is a named answer rather than a bare null — Unit 4.10. A refusal costs the
 * player every setting at the end of the session, so the screen has to say so,
 * and a surface needs a refusal it can name.
 */
export type SettingsStoreResult =
  | { readonly kind: 'open'; readonly store: SettingsStore }
  /**
   * Safari in private mode and a browser with site data turned off both throw
   * from the property itself, before any read.
   */
  | { readonly kind: 'refused'; readonly reason: string };

/** The browser's own store, or the reason the browser refused it. */
export function openSettingsStore(): SettingsStoreResult {
  try {
    const store: SettingsStore | undefined = globalThis.localStorage;
    if (!store) return { kind: 'refused', reason: 'this browser exposes no localStorage' };
    // Reading the property can succeed where a read of a key throws. A browser
    // that refuses site data is found here and nowhere later.
    store.getItem('clatter.probe');
    return { kind: 'open', store };
  } catch (error) {
    return {
      kind: 'refused',
      reason: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
    };
  }
}

/**
 * The browser's own store, or null when the browser refuses it.
 *
 * A caller that gets null passes it straight to `readSettings`, which answers
 * the defaults, and to `writeSettings`, which answers false. The application
 * then holds the record in memory for the session and nothing throws.
 */
export function localSettingsStore(): SettingsStore | null {
  const opened = openSettingsStore();
  return opened.kind === 'open' ? opened.store : null;
}
