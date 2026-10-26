// Read immutable product sources as data; never execute a consumer's code.
// Usage: node verify-catalog-parity.mjs /path/to/busnes.app
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import process from 'node:process';
import { URL } from 'node:url';
import { THEME_PALETTES, THEME_VARIABLES, findTheme } from '../../src/themes.js';

if (!process.argv[2]) throw new Error('Usage: node verify-catalog-parity.mjs /path/to/busnes.app');
const suite = resolve(process.argv[2]);
const inventory = JSON.parse(await readFile(new URL('./fleet.json', import.meta.url), 'utf8'));
const core = ['bg', 'panel', 'ink', 'inkStrong', 'accent', 'accentSoft', 'line', 'glow', 'sidebarStart', 'sidebarEnd', 'buttonText'];
const sources = [
  ['KyIdentity-server', 'KyIdentity-server', 'web/src/theme.ts'],
  ['KyPost-Server', 'kypost-server', 'frontend/src/theme.ts'],
  ['ky-server-base', 'ky_server_base', 'web/src/styles/theme.css'],
];
const results = [];
for (const [product, directory, file] of sources) {
  const revision = inventory.products.find(row => row.repository === product).base;
  const source = execFileSync('git', ['-C', resolve(suite, directory), 'show', `${revision}:${file}`], { encoding: 'utf8' });
  const checked = [];
  if (file.endsWith('.ts')) {
    for (const match of source.matchAll(/(?:['"]([^'"]+)['"]|([A-Za-z]\w*)):\s*\{([^{}]*)\}/g)) {
      const name = match[1] || match[2];
      if (name.startsWith('Busnes ')) continue;
      const theme = findTheme(name);
      if (!theme || theme.id === 'system') continue;
      const literal = Object.fromEntries([...match[3].matchAll(/\b(\w+):\s*(['"])(.*?)\2/g)].map(pair => [pair[1], pair[3]]));
      for (const key of core) {
        assert.ok(Object.hasOwn(literal, key), `${product} ${name}: missing literal ${key}`);
        assert.equal(THEME_PALETTES[theme.id][key], literal[key], `${product} ${name}: ${key}`);
      }
      checked.push({ name, canonical_id: theme.id, verified_keys: core });
    }
    assert.equal(checked.length, 15, `${product}: complete original named catalog`);
  } else {
    for (const id of ['patina', 'cyber', 'nord', 'paper', 'oled']) {
      const block = source.match(new RegExp(`\\[data-theme="${id}"\\] \\{([^}]+)`))?.[1];
      assert.ok(block, `${product}: missing ${id}`);
      const variables = Object.fromEntries([...block.matchAll(/(--[a-z-]+):\s*([^;]+);/g)].map(pair => [pair[1], pair[2].trim()]));
      const keys = [];
      for (const [key, variable] of Object.entries(THEME_VARIABLES)) {
        if (!Object.hasOwn(variables, variable)) continue;
        assert.equal(THEME_PALETTES[id][key], variables[variable], `${product} ${id}: ${key}`);
        keys.push(key);
      }
      assert.ok(keys.length >= 11, `${product}: incomplete base palette projection`);
      checked.push({ name: id, canonical_id: id, verified_keys: keys });
    }
  }
  results.push({ product, revision, file, source_sha256: createHash('sha256').update(source).digest('hex'), checked });
}
const report = { status: 'pass', method: 'Independent literal parsing of immutable original sources; shared core colors and explicitly declared base palette properties', limitations: 'Source parity does not certify computed contrast, runtime CSS precedence, first paint or product behavior.', sources: results };
await writeFile(new URL('./catalog-parity.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
process.stdout.write(`Catalog parity: ${results.map(row => `${row.product} ${row.checked.length}`).join(', ')} original palettes verified\n`);
