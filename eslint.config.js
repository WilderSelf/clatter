// Flat config. Constraint 8 bans innerHTML/outerHTML/insertAdjacentHTML and the
// dangerouslySetInnerHTML JSX attribute, because theme names, pool names,
// complication text and log notes are all user-editable and all rendered.
// Core rules only — no-restricted-properties and no-restricted-syntax need no
// extra plugin.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

const bannedHtmlProperties = [
  {
    property: 'innerHTML',
    message: 'innerHTML is banned. Render user-supplied text, do not inject markup.',
  },
  {
    property: 'outerHTML',
    message: 'outerHTML is banned. Render user-supplied text, do not inject markup.',
  },
  {
    property: 'insertAdjacentHTML',
    message: 'insertAdjacentHTML is banned. Render user-supplied text, do not inject markup.',
  },
];

export default tseslint.config(
  // src/tray/vendor holds a copy of a third-party library. It is not ours to
  // style, so it is out of scope for lint. It stays inside the branding gate
  // and the bundle-size gate, which are the checks it can fail.
  { ignores: ['dist/**', 'node_modules/**', 'src/tray/vendor/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    // The browser harness holds page-side code beside node code. The helpers are
    // stringified into the page, so they name browser globals in a node file.
    files: ['scripts/browser.mjs'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-restricted-properties': ['error', ...bannedHtmlProperties],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXAttribute[name.name="dangerouslySetInnerHTML"]',
          message:
            'dangerouslySetInnerHTML is banned. Render user-supplied text, do not inject markup.',
        },
      ],
    },
  },
  {
    // Constraint 7: never Math.random in shipping code. Randomness comes from
    // crypto.getRandomValues through the rejection-sampling mapper, and a seeded
    // source is injected in tests only. This block comes last, because
    // no-restricted-properties replaces the list above rather than adding to it.
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-properties': [
        'error',
        ...bannedHtmlProperties,
        {
          object: 'Math',
          property: 'random',
          message: 'Math.random is banned. Use a RandomSource from src/rules/random.ts.',
        },
      ],
    },
  },
  {
    // Constraint 7: the seeded source is injected in tests only. Nothing on the
    // shipping path may import it, or a released build would roll a
    // reproducible sequence. Test files are the one exception.
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/**/*.test.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: 'seeded-random',
              message:
                'seeded-random is for tests only. Shipping code takes cryptoRandom from src/rules/random.ts.',
            },
          ],
        },
      ],
    },
  },
);
