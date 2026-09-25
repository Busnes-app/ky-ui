// Fetch public default branches, then reuse the exact release-copy checker.
// No consumer scripts are executed and no credentials or write access are needed.
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const consumers = JSON.parse(await readFile(new URL('../consumers.json', import.meta.url)));
const root = await mkdtemp(join(tmpdir(), 'ky-ui-freshness-'));
try {
  for (const repo of Object.keys(consumers)) {
    if (!/^[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(repo)) throw new Error('Invalid consumer repository');
    const checkout = join(root, repo);
    await exec('git', ['clone', '--quiet', '--depth=1', '--', `https://github.com/Busnes-app/${repo}.git`, checkout], {
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }, timeout: 120000,
    });
    const { stdout } = await exec('git', ['-C', checkout, 'rev-parse', 'HEAD']);
    console.log(`${repo}: ${stdout.trim()}`);
  }
  const { stdout } = await exec(process.execPath, [new URL('./sync-consumers.mjs', import.meta.url).pathname, `--root=${root}`, '--check']);
  process.stdout.write(stdout);
} finally {
  await rm(root, { recursive: true, force: true });
}
