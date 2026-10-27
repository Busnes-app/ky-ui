import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { SYSTEM_THEME, THEME_CATALOG, THEME_PALETTES, THEME_VARIABLES, findTheme, applyThemeVariables } from '../src/themes.js';
import { previewCss } from '../scripts/appearance-themes.mjs';

const tokens = await readFile(new URL('../src/tokens.css', import.meta.url), 'utf8');

test('catalog keeps 22 unique saved IDs, names and aliases', () => {
  assert.equal(THEME_CATALOG.length, 22);
  const keys = [SYSTEM_THEME, ...THEME_CATALOG].flatMap(t => [t.id, t.name, ...t.aliases]);
  assert.equal(new Set(keys).size, keys.length);
  for (const id of ['patina', 'cyber', 'nord', 'paper', 'oled']) assert.ok(findTheme(id), id);
});

test('every non-Busnes theme has a complete palette whose scheme matches its background', () => {
  const named = THEME_CATALOG.filter(t => !t.id.startsWith('busnes-'));
  assert.deepEqual(Object.keys(THEME_PALETTES).sort(), named.map(t => t.id).sort());
  for (const theme of named) {
    const palette = THEME_PALETTES[theme.id];
    const base = ['patina', 'cyber', 'nord', 'paper', 'oled'].includes(theme.id);
    assert.deepEqual(Object.keys(palette), Object.keys(THEME_VARIABLES).slice(0, base ? 15 : 13), theme.id);
    const n = parseInt(palette.bg.slice(1), 16);
    const luma = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
    assert.equal(theme.scheme, luma > 0.55 ? 'light' : 'dark', theme.id);
  }
});

test('legacy names resolve without rewriting the saved value', () => {
  assert.equal(findTheme('Current').id, 'dark-matter');
  assert.equal(findTheme('Cliffs').id, 'white-cliffs');
  assert.equal(findTheme('Patina Ky').id, 'patina-ky');
  assert.equal(findTheme('patina').name, 'Patina Ky (base)');
  assert.equal(findTheme('system'), SYSTEM_THEME);
  assert.equal(findTheme('constructor'), undefined);
  assert.equal(findTheme(undefined), undefined);
});

test('named palettes set product variables and Busnes or system clears them', () => {
  const props = new Map();
  const root = { style: { setProperty: (k, v) => props.set(k, v), removeProperty: k => props.delete(k), colorScheme: '' } };
  assert.equal(applyThemeVariables('Ocean', root), 'dark');
  assert.equal(props.get('--ink-strong'), '#e0f2fb');
  assert.equal(props.get('--sidebar-start'), '#112430');
  assert.equal(props.size, 16, 'named palettes include scheme-bound status colours');
  assert.equal(props.get('--danger'), 'var(--ky-danger-dark)');
  assert.equal(props.get('--success'), 'var(--ky-success-dark)');
  assert.equal(props.get('--warning'), 'var(--ky-warning-dark)');
  assert.equal(props.get('--panel-hover'), 'color-mix(in srgb, #152a36 93%, #e0f2fb)');
  applyThemeVariables('nord', root);
  assert.equal(props.get('--line-strong'), '#5e81ac');
  assert.equal(props.get('--danger'), '#dfb0b5');
  assert.equal(props.size, 16);
  assert.equal(applyThemeVariables('busnes-light', root), null);
  assert.equal(props.size, 0);
  assert.equal(root.style.colorScheme, '', 'Busnes scheme comes from tokens.css');
  applyThemeVariables('paper', root);
  assert.equal(root.style.colorScheme, 'light');
  applyThemeVariables('sky', root);
  assert.equal(props.get('--danger'), 'var(--ky-danger-light)');
  assert.equal(props.get('--warning'), 'var(--ky-warning-light)');
  assert.equal(applyThemeVariables('system', root), null);
  assert.equal(props.size, 0);
  assert.equal(root.style.colorScheme, '', 'system scheme follows tokens.css');
});

test('suite Patina Ky and base patina keep their own actual colours', () => {
  const suite = THEME_PALETTES['patina-ky'];
  const base = THEME_PALETTES.patina;
  // kypost-server frontend/src/theme.ts and ky_server_base web/src/styles/theme.css.
  assert.deepEqual([suite.inkStrong, suite.accentSoft, suite.sidebarStart, suite.sidebarEnd], ['#e2e8f0', '#0e4a48', '#0d0f14', '#1b212c']);
  assert.deepEqual([base.inkStrong, base.accentSoft, base.sidebarStart, base.sidebarEnd, base.panelHover, base.lineStrong],
    ['#f1f5f9', 'rgba(77, 238, 234, 0.15)', '#161a22', '#161a22', '#1c222c', '#334155']);
});

test('generated preview CSS is current and Busnes previews come from tokens.css', async () => {
  const css = previewCss(tokens);
  assert.equal(await readFile(new URL('../src/appearance-themes.css', import.meta.url), 'utf8'), css);
  assert.match(css, /\[data-ky-preview="busnes-light"\] \{ --ky-preview-bg: #f8f6f0;.*--ky-preview-accent: #bf3f18; \}/);
  assert.match(css, /\[data-ky-preview="busnes-dark"\] \{ --ky-preview-bg: #182326;/);
  assert.equal(css.match(/data-ky-preview=/g).length, 23);
  assert.doesNotMatch(css, /undefined/);
});
