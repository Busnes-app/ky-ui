// KyRecovery ceremony page, fixed revision: committed bytes under the page's real CSP
// (internal/server/server.go ceremonyContentSecurityPolicy). Checks the classic head
// scripts apply the saved choice and build the compact select after DOMContentLoaded.
// The ceremony WASM is not served here; its compile error is expected and ignored.
import { createServer } from 'node:http';
import { execFileSync } from 'node:child_process';
import { chromium } from '/home/yoshi/git/busnes.app/ky-ui/.claude/worktrees/fleet-appearance/node_modules/playwright/index.mjs';

const REPO = '/home/yoshi/git/busnes.app/kyrecovery-server/.claude/worktrees/fleet-appearance';
const REV = process.argv[2] ?? '71affc90c0597df81153aba62788fac43f4c1585';
const show = path => { try { return execFileSync('git', ['-C', REPO, 'show', `${REV}:${path}`]); } catch { return null; } };
const csp = execFileSync('git', ['-C', REPO, 'show', `${REV}:internal/server/server.go`]).toString()
  .match(/const ceremonyContentSecurityPolicy = ("[^"]+") \+\s*("[^"]+") \+\s*("[^"]+")/).slice(1).map(JSON.parse).join('');
const types = { js: 'text/javascript', css: 'text/css', html: 'text/html', wasm: 'application/wasm', ttf: 'font/ttf' };
const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://x').pathname;
  const body = url === '/' ? show('internal/server/static/ceremony.html') : url.startsWith('/static/') ? show('internal/server/static' + url.slice(7)) : null;
  if (!body) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[url === '/' ? 'html' : url.split('.').pop()] ?? 'application/octet-stream', 'content-security-policy': csp }).end(body);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch();
const page = await browser.newPage({ colorScheme: 'light' });
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
await page.addInitScript(() => {
  localStorage.setItem('kyrecovery-theme', 'dark');
  window.__csp = [];
  document.addEventListener('securitypolicyviolation', e => window.__csp.push(e.violatedDirective + ' ' + e.blockedURI));
});
await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'load' });
const before = await page.evaluate(() => ({ stored: localStorage.getItem('kyrecovery-theme'), theme: document.documentElement.dataset.theme, value: document.querySelector('[data-theme-select]').value, options: document.querySelector('[data-theme-select]').options.length }));
await page.selectOption('[data-theme-select]', 'ocean');
const after = await page.evaluate(() => ({ stored: localStorage.getItem('kyrecovery-theme'), theme: document.documentElement.dataset.theme, bg: getComputedStyle(document.documentElement).getPropertyValue('--ky-bg').trim(), csp: window.__csp }));
await browser.close(); server.close();
const pass = before.stored === 'dark' && before.theme === 'busnes-dark' && before.value === 'busnes-dark' && before.options === 23 && after.stored === 'ocean' && after.theme === 'busnes-dark' && after.bg === '#0f1b24' && !after.csp.length && !errors.filter(e => !/WebAssembly/.test(e)).length;
console.log(JSON.stringify({ rev: REV.slice(0, 9), csp, before, after, errors, pass }));
process.exitCode = pass ? 0 : 1;
