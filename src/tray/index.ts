// The vendored tray is loaded on demand. The dynamic import below is what
// splits it into its own chunk, so it never enters the first paint and the
// initial JavaScript budget holds.
//
// Unit 3.2 builds the scene on top of this. Until then the loader is all
// there is.

export type TrayModule = typeof import('./vendor/dice-tray.js');

/** Fetches the tray chunk. The browser caches it, so a second call is free. */
export function loadTray(): Promise<TrayModule> {
  return import('./vendor/dice-tray.js');
}
