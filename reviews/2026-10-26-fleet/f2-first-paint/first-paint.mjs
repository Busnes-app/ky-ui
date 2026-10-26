// F2 first-paint regression harness, adapted from runtime-source-review.md appendix A.
// Changes from appendix A: themes-browser.js is delayed too (the fixed head loads it),
// DELAY env sets the delay (default 800 ms), extra cases cover the fix, and each run saves
// a screenshot ~300 ms after navigation commit (the frame a user sees while scripts load).
// Serves committed bytes (git show <rev>) on an ephemeral loopback port; no product server.
// Run: [NOSHOT=1] [DELAY=ms] node first-paint.mjs > results-<variant>.jsonl   (Node 24, ky-ui worktree Playwright)
import { createServer } from 'node:http';
import { execFileSync } from 'node:child_process';
import { chromium } from '/home/yoshi/git/busnes.app/ky-ui/.claude/worktrees/fleet-appearance/node_modules/playwright/index.mjs';

const ROOT = '/home/yoshi/git/busnes.app';
const DELAY = Number(process.env.DELAY ?? 800);
const SHOTS = new URL('./screenshots/', import.meta.url).pathname;
const show = (repo, rev, path) => { try { return execFileSync('git', ['-C', `${ROOT}/${repo}`, 'show', `${rev}:${path}`]); } catch { return null; } };
const BODY = '<div class="app"><main class="app-main"><h1>Dashboard</h1><p>Synthetic first-paint fixture.</p></main></div>';
const products = {
  dns: { repo: 'kydns-server/.claude/worktrees/fleet-appearance', staticDir: 'internal/web/static', key: 'kydns-theme',
    page: rev => show('kydns-server/.claude/worktrees/fleet-appearance', rev, 'internal/web/templates/base.html').toString()
      .replace('{{template "body" .}}', BODY).replace(/\{\{define "mark"\}\}[\s\S]*?\{\{end\}\}/, '').replace(/\{\{[^}]*\}\}/g, ''),
    delayed: ['/static/theme.js', '/static/ky-ui/themes.js', '/static/ky-ui/themes-browser.js'] },
  recovery: { repo: 'kyrecovery-server/.claude/worktrees/fleet-appearance', staticDir: 'internal/server/static', key: 'kyrecovery-theme',
    page: rev => show('kyrecovery-server/.claude/worktrees/fleet-appearance', rev, 'internal/server/static/index.html').toString()
      .replace(/<script src="\/static\/js\/app\.js"><\/script>/, ''),
    delayed: ['/static/js/theme.js', '/static/ky-ui/themes.js', '/static/ky-ui/themes-browser.js'] },
};
const types = { js: 'text/javascript', css: 'text/css', html: 'text/html', png: 'image/png', svg: 'image/svg+xml', ttf: 'font/ttf' };

async function run(product, label, rev, saved, scheme) {
  const p = products[product];
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x').pathname;
    if (url === '/') { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(p.page(rev)); }
    const body = url.startsWith('/static/') ? show(p.repo, rev, p.staticDir + url.slice(7)) : null;
    if (!body) { res.writeHead(404); return res.end(); }
    if (p.delayed.includes(url)) await new Promise(r => setTimeout(r, DELAY));
    res.writeHead(200, { 'content-type': types[url.split('.').pop()] ?? 'application/octet-stream' }); res.end(body);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const browser = await chromium.launch();
  const page = await browser.newPage({ colorScheme: scheme, viewport: { width: 640, height: 360 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.addInitScript(([key, value]) => {
    if (value !== null) localStorage.setItem(key, value);
    window.__applied = null;
    new MutationObserver(() => { window.__applied ??= performance.now(); })
      .observe(document, { subtree: true, attributes: true, attributeFilter: ['style', 'data-theme', 'data-ky-theme'] });
  }, [p.key, saved]);
  const shot = `${product}-${label}-${String(saved).replace(/\W+/g, '_')}-os${scheme}-d${DELAY}.png`;
  await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'commit' });
  // NOSHOT=1 measures timing only; a screenshot can itself trigger observed mutations.
  if (!process.env.NOSHOT) {
    await page.waitForTimeout(300);
    await page.screenshot({ path: SHOTS + shot, timeout: 5000 }).catch(e => errors.push('screenshot: ' + e.message.split('\n')[0]));
  }
  await page.waitForLoadState('load');
  await page.waitForTimeout(1200);
  const r = await page.evaluate(() => ({
    fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null,
    applied: window.__applied,
    theme: document.documentElement.dataset.theme ?? null,
    bg: getComputedStyle(document.body).backgroundColor,
  }));
  const stored = await page.evaluate(key => localStorage.getItem(key), p.key);
  await browser.close(); server.close();
  // A saved choice that equals the CSS default needs no mutation; only a mutation after FCP flashes.
  const flash = r.fcp !== null && r.applied !== null && r.fcp < r.applied;
  console.log(JSON.stringify({ product, label, rev: rev.slice(0, 9), saved, storedAfter: stored, os: scheme, delayMs: DELAY, fcp: Math.round(r.fcp), applied: r.applied && Math.round(r.applied), finalTheme: r.theme, finalBg: r.bg, paintedBeforeSavedTheme: flash, errors, screenshot: process.env.NOSHOT ? null : shot }));
}

const DNS = { base: 'e301d07b9cb2623a0aa048df5b5b7b131833b0ef', head: '28bf59e35583bf4e04eb7b21486ea6c1531b2bd8', fix: '0949de59031709905f1a1e048a1d8139b20d4799' };
const REC = { base: 'b60e5710b920fdca012179615ad278fbca6cf206', head: '2738beb742cec16c569c45cc2e929d2e8e74621a', fix: '71affc90c0597df81153aba62788fac43f4c1585' };
const cases = [
  ...['base', 'head', 'fix'].flatMap(l => [['dns', l, DNS[l], 'Ocean', 'light'], ['dns', l, DNS[l], 'Busnes Light', 'dark']]),
  ['dns', 'fix', DNS.fix, 'Cliffs', 'dark'], ['dns', 'fix', DNS.fix, null, 'dark'],
  ...['base', 'head', 'fix'].map(l => ['recovery', l, REC[l], 'light', 'dark']),
  ['recovery', 'head', REC.head, 'ocean', 'light'], ['recovery', 'fix', REC.fix, 'ocean', 'light'],
  ['recovery', 'fix', REC.fix, 'dark', 'light'], ['recovery', 'fix', REC.fix, 'sky', 'dark'], ['recovery', 'fix', REC.fix, null, 'light'],
];
for (const c of cases) await run(...c);
