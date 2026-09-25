import { mkdir, readFile, writeFile, stat, lstat, realpath } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join, resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const consumers = JSON.parse(await readFile(join(root, 'consumers.json'), 'utf8'));
const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
let suite = resolve(root, '..');
let check = false;
let overrides = {};
const selected = new Set();
for (const arg of process.argv.slice(2)) {
  if (arg === '--check') check = true;
  else if (arg.startsWith('--root=')) suite = resolve(arg.slice(7));
  else if (arg.startsWith('--paths=')) overrides = JSON.parse(await readFile(resolve(arg.slice(8)), 'utf8'));
  else if (arg.startsWith('--consumer=')) selected.add(arg.slice(11));
  else throw new Error(`Unknown argument: ${arg}`);
}
for (const repo of selected) {
  if (!Object.hasOwn(consumers, repo)) throw new Error(`Unknown consumer: ${repo}`);
}
if (selected.size && !check) throw new Error('--consumer is only supported with --check');
if (!overrides || Array.isArray(overrides) || typeof overrides !== 'object') throw new Error('Paths must be an object');
for (const [key, path] of Object.entries(overrides)) {
  if (!(key in consumers)) throw new Error(`Unknown consumer: ${key}`);
  if (typeof path !== 'string' || !path) throw new Error(`Invalid checkout path: ${key}`);
}
const files = ['tokens.css', 'navigation.css', 'theme.js', 'theme.d.ts', 'check-vendor.mjs'];
const bytes = Object.fromEntries(await Promise.all(files.map(async file => [file, await readFile(join(root, 'src', file))])));
// Palette previews and stylesheet-free consumers derive from the CSS source.
const css = bytes['tokens.css'].toString();
const palettes = {};
for (const [label, id] of [['Busnes Light', 'busnes-light'], ['Busnes Dark', 'busnes-dark']]) {
  const block = css.match(new RegExp(`:root\\[data-ky-theme="${id}"\\] \\{([^}]+)`))[1];
  const palette = {};
  for (const match of block.matchAll(/--ky-([a-z-]+):\s*([^;]+);/g)) {
    if (['bg', 'panel', 'ink', 'ink-strong', 'accent', 'accent-soft', 'line', 'sidebar-start', 'sidebar-end', 'button-text'].includes(match[1])) {
      palette[match[1].replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = match[2].trim();
    }
  }
  palette.glow = 'transparent';
  palettes[label] = palette;
}
bytes['palettes.ts'] = Buffer.from(`// Generated from ky-ui tokens.css; refresh with sync-consumers.mjs.\nexport const busnesPalettes = ${JSON.stringify(palettes, null, 2)};\n`);
bytes['palettes-browser.js'] = Buffer.from(`// Generated from ky-ui tokens.css.\nwindow.kyBusnesPalettes = ${JSON.stringify(palettes)};\n`);
files.push('palettes.ts', 'palettes-browser.js');
const manifest = { version: pkg.version, source: 'https://github.com/Busnes-app/ky-ui', files: Object.fromEntries(files.map(file => [file, createHash('sha256').update(bytes[file]).digest('hex')])) };
bytes.VERSION = Buffer.from(JSON.stringify(manifest, null, 2) + '\n');

// Validate every checkout before writing anything. Worktrees use a .git file.
const targets = [];
for (const [repo, assetPath] of Object.entries(consumers)) {
  if (selected.size && !selected.has(repo)) continue;
  const checkout = await realpath(overrides[repo] ?? join(suite, repo));
  await stat(join(checkout, '.git'));
  const parent = await realpath(dirname(join(checkout, assetPath)));
  const rel = relative(checkout, parent);
  if (rel.startsWith('..') || isAbsolute(rel)) throw new Error(`Asset path escapes ${repo}`);
  const target = join(parent, 'ky-ui');
  try {
    if (await realpath(target) !== target) throw new Error(`Symlink target refused: ${target}`);
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  for (const file of Object.keys(bytes)) {
    try {
      if (!(await lstat(join(target, file))).isFile()) throw new Error(`Non-regular consumer file refused: ${join(target, file)}`);
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  targets.push(target);
}
for (const target of targets) {
  if (!check) await mkdir(target, { recursive: true });
  for (const [file, expected] of Object.entries(bytes)) {
    const path = join(target, file);
    if (check) {
      if (!(await readFile(path)).equals(expected)) throw new Error(`Stale consumer file: ${path}`);
    } else await writeFile(path, expected);
  }
}
console.log(`${check ? 'Checked' : 'Updated'} ${targets.length} consumers at ${pkg.version}`);
