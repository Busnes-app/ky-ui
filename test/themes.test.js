import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { SYSTEM_THEME, THEME_CATALOG, THEME_PAIRS, THEME_PALETTES, THEME_VARIABLES, findPair, findTheme, applyThemeVariables } from '../src/themes.js';
import { previewCss } from '../scripts/appearance-themes.mjs';

const tokens = await readFile(new URL('../src/tokens.css', import.meta.url), 'utf8');

test('catalog keeps 12 unique saved IDs, names and aliases in six light/dark pairs', () => {
  assert.equal(THEME_CATALOG.length, 12);
  const keys = [SYSTEM_THEME, ...THEME_CATALOG].flatMap(t => [t.id, t.name, ...t.aliases]);
  assert.equal(new Set(keys).size, keys.length);
  assert.deepEqual(THEME_PAIRS.map(p => [p.id, p.name, p.light, p.dark]), [
    ['busnes-pair', 'Busnes', 'busnes-light', 'busnes-dark'],
    ['matter-pair', 'Matter', 'light-matter', 'dark-matter'],
    ['ocean-pair', 'Ocean', 'white-cliffs', 'ocean'],
    ['forest-pair', 'Forest', 'forest-light', 'forest'],
    ['ky-pair', 'Ky', 'polished-ky', 'patina-ky'],
    ['nord-pair', 'Nord', 'paper', 'nord'],
  ]);
  for (const pair of THEME_PAIRS) {
    assert.ok(!keys.includes(pair.id), `${pair.id} collides with a half`);
    assert.deepEqual(THEME_CATALOG.filter(t => t.pair === pair.id).map(t => [t.id, t.scheme]), [[pair.light, 'light'], [pair.dark, 'dark']]);
  }
  assert.ok(THEME_CATALOG.every(t => !t.id.endsWith('-pair')));
});

test('removed IDs and their names resolve to nothing, so products fall back to Busnes', () => {
  for (const id of ['tropics', 'tropic-night', 'coffee', 'cyber-punk', 'neon-purple', 'space', 'sky', 'sun', 'cyber', 'oled',
    'Old Light', 'Old Dark', 'Cyber Dark', 'OLED Black']) assert.equal(findTheme(id), undefined, id);
  const props = new Map();
  const root = { style: { setProperty: (k, v) => props.set(k, v), removeProperty: k => props.delete(k), colorScheme: '' } };
  applyThemeVariables('ocean', root);
  assert.equal(applyThemeVariables('sky', root), null);
  assert.equal(props.size, 0);
});

test('a pair ID resolves to the half for the scheme, by default the OS one', t => {
  for (const pair of THEME_PAIRS) {
    assert.equal(findTheme(pair.id, false).id, pair.light);
    assert.equal(findTheme(pair.id, true).id, pair.dark);
  }
  assert.equal(findPair('ocean-pair').name, 'Ocean');
  assert.equal(findPair('ocean'), undefined);
  assert.equal(findPair('Ocean'), undefined, 'pairs are saved by ID only');
  let dark = false;
  const original = Object.getOwnPropertyDescriptor(globalThis, 'matchMedia');
  Object.defineProperty(globalThis, 'matchMedia', { configurable: true, value: () => ({ matches: dark }) });
  t.after(() => { if (original) Object.defineProperty(globalThis, 'matchMedia', original); else delete globalThis.matchMedia; });
  const props = new Map();
  const root = { style: { setProperty: (k, v) => props.set(k, v), removeProperty: k => props.delete(k), colorScheme: '' } };
  assert.equal(findTheme('nord-pair').id, 'paper');
  assert.equal(applyThemeVariables('nord-pair', root), 'light');
  assert.equal(props.get('--bg'), '#eceff4');
  dark = true;
  assert.equal(applyThemeVariables('nord-pair', root), 'dark');
  assert.equal(props.get('--bg'), '#2e3440');
  assert.equal(applyThemeVariables('busnes-pair', root), null, 'Busnes halves come from tokens.css');
  assert.equal(props.size, 0);
});

test('every non-Busnes theme has a complete palette whose scheme matches its background', () => {
  const named = THEME_CATALOG.filter(t => !t.id.startsWith('busnes-'));
  assert.deepEqual(Object.keys(THEME_PALETTES).sort(), named.map(t => t.id).sort());
  for (const theme of named) {
    const palette = THEME_PALETTES[theme.id];
    const base = theme.id === 'nord';
    assert.deepEqual(Object.keys(palette), Object.keys(THEME_VARIABLES).slice(0, base ? 15 : 13), theme.id);
    const n = parseInt(palette.bg.slice(1), 16);
    const luma = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
    assert.equal(theme.scheme, luma > 0.55 ? 'light' : 'dark', theme.id);
  }
});

test('legacy names and aliases resolve without rewriting the saved value', () => {
  assert.equal(findTheme('Current').id, 'dark-matter');
  assert.equal(findTheme('Cliffs').id, 'white-cliffs');
  assert.equal(findTheme('Patina Ky').id, 'patina-ky');
  assert.equal(findTheme('patina').id, 'patina-ky');
  assert.equal(findTheme('Patina Ky (base)').id, 'patina-ky');
  assert.equal(findTheme('paper').name, 'Nord Light');
  assert.equal(findTheme('Paper Clean').id, 'paper');
  assert.equal(findTheme('nord').name, 'Nord Dark');
  assert.equal(findTheme('Nord').id, 'nord');
  assert.equal(findTheme('White Cliffs').id, 'white-cliffs');
  assert.equal(findTheme('Light Matter').id, 'light-matter');
  assert.equal(findTheme('Polished Ky').id, 'polished-ky');
  assert.equal(findTheme('Forest').id, 'forest');
  assert.equal(findTheme('Ocean').id, 'ocean');
  assert.equal(findTheme('Nord Slate').id, 'nord');
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
  applyThemeVariables('forest-light', root);
  assert.equal(props.get('--danger'), 'var(--ky-danger-light)');
  assert.equal(props.get('--warning'), 'var(--ky-warning-light)');
  assert.equal(applyThemeVariables('system', root), null);
  assert.equal(props.size, 0);
  assert.equal(root.style.colorScheme, '', 'system scheme follows tokens.css');
});

test('revised halves carry the pairs spec values with sidebarStart = sidebarEnd and no glow', () => {
  const spec = {
    'light-matter': '#f5efe5 #fff8ee #4c3d32 #2d1f15 #805a39 #e2d0b8 #d4c7b5 #ede2d2 #ffffff',
    'dark-matter': '#1d1b19 #292725 #cfc6bb #f0e9df #c29a72 #49392c #45403a #25221f #24170f',
    'white-cliffs': '#f7f9fb #ffffff #2e4c63 #163246 #1d5fa6 #dde9f7 #c7d6df #eaf1f8 #ffffff',
    'forest-light': '#f3f6ef #fcfdf9 #435342 #203322 #4b6b37 #e2ebda #c5d0bc #e8eee1 #ffffff',
    'polished-ky': '#eef2f6 #ffffff #475569 #0f172a #08758b #daf2f4 #c2cdd8 #e7edf3 #ffffff',
    'patina-ky': '#10161e #1b2530 #afbdca #e2e8f0 #6fc9cc #203d41 #34414d #161e27 #10161e',
    paper: '#eceff4 #ffffff #4c566a #2e3440 #4a6a94 #dbe4ef #c5cdd9 #e5e9f0 #ffffff',
  };
  for (const [id, values] of Object.entries(spec)) {
    const v = THEME_PALETTES[id];
    assert.equal([v.bg, v.panel, v.ink, v.inkStrong, v.accent, v.accentSoft, v.line, v.sidebarStart, v.buttonText].join(' '), values, id);
    assert.deepEqual([v.sidebarEnd, v.glow], [v.sidebarStart, 'transparent'], id);
  }
});

test('generated preview CSS is current and Busnes previews come from tokens.css', async () => {
  const css = previewCss(tokens);
  assert.equal(await readFile(new URL('../src/appearance-themes.css', import.meta.url), 'utf8'), css);
  assert.match(css, /\[data-ky-preview="busnes-light"\] \{ --ky-preview-bg: #f8f6f0;.*--ky-preview-accent: #bf3f18; \}/);
  assert.match(css, /\[data-ky-preview="busnes-dark"\] \{ --ky-preview-bg: #182326;/);
  assert.equal(css.match(/data-ky-preview=/g).length, 19);
  assert.match(css, /\[data-ky-preview="ocean-pair"\] \{ --ky-preview-bg: #f7f9fb;.* --ky-preview-dark-bg: #0f1b24;/);
  assert.match(css, /\[data-ky-preview="busnes-pair"\] \{ --ky-preview-bg: #f8f6f0;.* --ky-preview-dark-bg: #182326;/);
  assert.doesNotMatch(css, /undefined/);
});
