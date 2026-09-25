import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

test('sync preflights all worktrees, rejects symlinks and detects drift', async t => {
  const root = await mkdtemp(join(tmpdir(), 'ky-ui-sync-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const consumers = JSON.parse(await readFile(new URL('../consumers.json', import.meta.url)));
  const run = (...args) => execFileSync(process.execPath, [new URL('../scripts/sync-consumers.mjs', import.meta.url).pathname, `--root=${root}`, ...args], { stdio: 'pipe' });
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
  const checker = join(first, 'check-vendor.mjs');
  execFileSync(process.execPath, [checker]);
  await writeFile(join(first, 'tokens.css'), 'stale');
  assert.throws(() => run('--check'), /Stale consumer file/);
  assert.throws(() => execFileSync(process.execPath, [checker], { stdio: 'pipe' }));
});
