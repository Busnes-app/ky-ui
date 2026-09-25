// Fetch public default branches, then reuse the exact release-copy checker.
// Private KyForge checks upstream from its own repository's scheduled workflow.
// No consumer scripts are executed and no credentials or write access are needed.
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir, devNull } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const consumers = JSON.parse(await readFile(new URL('../consumers.json', import.meta.url)));
const publicRepos = Object.keys(consumers).filter(repo => repo !== 'KyForge-Server');
const root = await mkdtemp(join(tmpdir(), 'ky-ui-freshness-'));
try {
  for (const repo of publicRepos) {
    if (!/^[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(repo)) throw new Error('Invalid consumer repository');
    const checkout = join(root, repo);
    await exec('git', ['clone', '--quiet', '--depth=1', '--', `https://github.com/Busnes-app/${repo}.git`, checkout], {
      env: { ...process.env, GIT_CONFIG_GLOBAL: devNull, GIT_CONFIG_NOSYSTEM: '1', GIT_TERMINAL_PROMPT: '0', GIT_ASKPASS: 'false' }, timeout: 120000,
    });
    const { stdout } = await exec('git', ['-C', checkout, 'rev-parse', 'HEAD']);
    console.log(`${repo}: ${stdout.trim()}`);
  }
  const { stdout } = await exec(process.execPath, [new URL('./sync-consumers.mjs', import.meta.url).pathname, `--root=${root}`, '--check', ...publicRepos.map(repo => `--consumer=${repo}`)]);
  process.stdout.write(stdout);
  console.log('KyForge-Server is private: freshness is checked by its own consumer-freshness workflow, not this job.');
} finally {
  await rm(root, { recursive: true, force: true });
}
