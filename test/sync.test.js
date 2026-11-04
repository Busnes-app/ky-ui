import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, mkdir, writeFile, readFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { runInNewContext } from 'node:vm';
import * as themes from '../src/themes.js';

test('sync preflights all worktrees, rejects symlinks and detects drift', async t => {
  const root = await mkdtemp(join(tmpdir(), 'ky-ui-sync-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const consumers = JSON.parse(await readFile(new URL('../consumers.json', import.meta.url)));
  const run = (...args) => execFileSync(process.execPath, [fileURLToPath(new URL('../scripts/sync-consumers.mjs', import.meta.url)), `--root=${root}`, ...args], { stdio: 'pipe' });
  const entries = Object.entries(consumers);
  for (const [repo, path] of entries) {
    await mkdir(join(root, repo, path), { recursive: true });
    await writeFile(join(root, repo, '.git'), 'gitdir: fixture\n');
  }
  const first = join(root, entries[0][0], entries[0][1]);
  const lastGit = join(root, entries.at(-1)[0], '.git');
  await rm(lastGit);
  assert.throws(() => run());
  await assert.rejects(readFile(join(first, 'VERSION')), { code: 'ENOENT' });
  await writeFile(lastGit, 'gitdir: fixture\n');
  const outside = join(root, 'outside.css');
  await writeFile(outside, 'untouched');
  await symlink(outside, join(first, 'tokens.css'));
  assert.throws(() => run(), /Non-regular consumer file/);
  assert.equal(await readFile(outside, 'utf8'), 'untouched');
  await rm(join(first, 'tokens.css'));
  run();
  run('--check');
  const shipped = JSON.parse(await readFile(join(first, 'VERSION'), 'utf8')).files;
  for (const file of ['appmarks.js', 'menu.js', 'menu.d.ts', 'update.js', 'update.d.ts']) assert.ok(shipped[file], file);
  // The classic copy exposes the module's exports, unchanged, for synchronous head scripts.
  const window = {};
  runInNewContext(await readFile(join(first, 'themes-browser.js'), 'utf8'), { window });
  assert.deepEqual(Object.keys(window.kyThemes).sort(), Object.keys(themes).sort());
  for (const name of ['SYSTEM_THEME', 'THEME_CATALOG', 'THEME_PALETTES', 'THEME_VARIABLES']) {
    assert.equal(JSON.stringify(window.kyThemes[name]), JSON.stringify(themes[name]), name);
  }
  assert.equal(window.kyThemes.findTheme('Cliffs').id, 'white-cliffs');
  const props = new Map();
  const html = { style: { setProperty: (k, v) => props.set(k, v), removeProperty: k => props.delete(k), colorScheme: '' } };
  assert.equal(window.kyThemes.applyThemeVariables('Ocean', html), 'dark');
  assert.equal(props.get('--bg'), '#0f1b24');
  assert.throws(() => run('--check', '--consumer=unknown'), /Unknown consumer/);
  const checker = join(first, 'check-vendor.mjs');
  execFileSync(process.execPath, [checker]);
  await writeFile(join(first, 'tokens.css'), 'stale');
  // An explicitly scoped check never needs access to the other repositories.
  run('--check', `--consumer=${entries[1][0]}`);
  assert.throws(() => run('--check', `--consumer=${entries[0][0]}`), /Stale consumer file/);
  assert.throws(() => run('--check'), /Stale consumer file/);
  assert.throws(() => execFileSync(process.execPath, [checker], { stdio: 'pipe' }));
  // A scoped release must repair only the named consumer, leaving every other file alone.
  const second = join(root, entries[1][0], entries[1][1]);
  await writeFile(join(second, 'tokens.css'), 'other work in progress');
  await rm(lastGit);
  run(`--consumer=${entries[0][0]}`);
  run('--check', `--consumer=${entries[0][0]}`);
  assert.equal(await readFile(join(second, 'tokens.css'), 'utf8'), 'other work in progress');
  assert.throws(() => run('--consumer=unknown'), /Unknown consumer/);
});

test('check:suite runs from a checkout path with spaces and accents', async t => {
  const root = await mkdtemp(join(tmpdir(), 'ky ui é '));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const dir of ['src', 'scripts']) await cp(new URL(`../${dir}`, import.meta.url), join(root, dir), { recursive: true });
  await cp(new URL('../package.json', import.meta.url), join(root, 'package.json'));
  await writeFile(join(root, 'consumers.json'), '{}');
  const out = execFileSync(process.execPath, [join(root, 'scripts/check-suite.mjs')], { encoding: 'utf8' });
  assert.match(out, /Checked 0 consumers/);
});
