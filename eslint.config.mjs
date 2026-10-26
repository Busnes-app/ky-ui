import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['.claude/**', 'coverage/**', 'test-results/**', 'playwright-report/**'] },
  js.configs.recommended,
  {
    files: ['*.{js,mjs}', 'scripts/**', 'test/**', 'src/check-vendor.mjs', 'browser/server.mjs', 'browser/*.spec.js'],
    languageOptions: { globals: globals.node },
  },
  {
    // Playwright specifications contain callbacks that execute in the browser.
    files: ['src/theme.js', 'browser/fixture.js', 'browser/*.spec.js'],
    languageOptions: { globals: globals.browser },
  },
];
