// The entry. It writes the theme before the first paint and then renders.
//
// The stylesheet holds no colour of its own — Unit 4.8 — so a first paint that
// ran before any role was written would draw the page with no colours at all.
// `App` keeps the roles up to date after this, in a layout effect.

import { render } from 'preact';
import { App } from './app';
import { localSettingsStore } from './settings/local-store';
import { readSettings } from './settings/settings';
import { appliedTheme, themeVariables } from './theme/css-vars';
import './shell.css';

for (const [role, colour] of Object.entries(
  themeVariables(appliedTheme(readSettings(localSettingsStore()))),
)) {
  document.documentElement.style.setProperty(role, colour);
}

const root = document.getElementById('app');
if (root) {
  render(<App />, root);
}
