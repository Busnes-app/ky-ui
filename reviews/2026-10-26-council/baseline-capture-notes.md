# Baseline captures: KyCalendar and KyMessages (before, stage 00)

These are scratch captures from disposable local servers running real current source, using synthetic data. They are not reviews and carry no scores. No product source was edited.

- Captured: 2026-10-26, 04:21–04:23 UTC. Design sub-agent, Claude Opus 5.5.
- Output: `screenshots/kycalendar-00-before-*.png` (14 files) and `screenshots/kymessages-00-before-*.png` (10 files).
- Browser: Playwright 1.63.0 (`@playwright/test` from each product's `web/node_modules`), headless Chromium 153.0.8010.12. Each capture gets its own new browser context: no shared cookies or storage, a real sign-in, and the theme chosen in the product's own `Color theme` select (stored in that context's localStorage). Context `colorScheme` matches the theme, `timezoneId` is `America/Chicago`, locale is `en-US`.
- Every capture is viewport-only unless its name ends in `-full`. Horizontal overflow was measured at 0 px on every capture.

## Source

| Product | Worktree | Branch | HEAD | Tree | `web/dist` tree | `web/src` tree | Server binary SHA-256 |
|---|---|---|---|---|---|---|---|
| KyCalendar | `KyCalendar/.claude/worktrees/ui-cohesion` | `ui/council-cohesion` | `28daa7a2267e2591b2a943e184a47df612451bb1` | `72955f5f0e0cd4b8f3cf3b34adbc7b1fab9e5f2e` | `774ce127df387ae433fd05ab1d8d4e7dcc26f2d9` | `31a896d31e149ec33bdddf3c35678058cfd487fa` | `b4ad52455964d4b1993869719fe7a79bbece72a993f9c6fe7580526c33482a64` |
| KyMessages | `KyMessage-Server/.claude/worktrees/ui-cohesion` | `ui/council-cohesion` | `e829b9ecaed283510f44ee7c95ed829dc9a7ba6d` | `7e70561415d20ae6840e237254b65fd150a0f832` | `d40846f2204c5b24a78a066cef2e1e33bc903724` | `f7be26e626b5c181db4ba69e5103077eb2461e45` | `b4cb5081c06c42adb309eacc622c8a7f0c863d31dacac4097f4a6cc15a81f322` |

- Both worktrees were clean before and after (`git status --porcelain` empty). `npm run build` rebuilt `web/dist` byte-identical to the tracked copy, so there is no dist drift and the embedded frontend is HEAD's.
- Vendored `src/ky-ui` is version 0.2.0 in both.
- Toolchain: Node v26.11.1 / npm 11.20.0 (pinned, first on `PATH`) and Go 1.27.1.
- `package-lock.json` SHA-256: KyCalendar `83a7c0bf…0d791`, KyMessages `4b6e02d0…e4deb`.

## Commands

```sh
export PATH=/home/yoshi/.local/share/ky-toolchains/node-v26.11.1-linux-x64/bin:$PATH
W=/home/yoshi/git/busnes.app/KyCalendar/.claude/worktrees/ui-cohesion   # then KyMessage-Server/...
(cd $W/web && npm ci --no-audit --no-fund && npm run build)
(cd $W && go build -o .browser/server ./cmd/server)
git -C $W status --porcelain                                              # must be empty
cd /tmp/ky-ui-council-baseline                                            # driver scripts, appendix
node calendar.mjs /home/yoshi/git/busnes.app/KyCalendar/.claude/worktrees/ui-cohesion
node messages.mjs /home/yoshi/git/busnes.app/KyMessage-Server/.claude/worktrees/ui-cohesion
```

Each step ran in a `systemd-run --user --scope -p MemoryMax=… -p MemorySwapMax=0` scope. The npm cache is npm's own default (persistent); browsers come from the existing `~/.cache/ms-playwright`.

## Servers and credential lifecycle

- The drivers do the same job as each product's `web/browser/server.mjs` and `setup.mjs`. They are separate because those files hard-code port 5391 and fixed test passwords. Each driver starts the compiled `.browser/server` with a minimal environment on loopback, keeps `KY_APP_URL` equal to the origin, gives it an owned `mkdtemp` data dir under `/tmp`, uses SQLite, and sets `KY_CAPTCHA_PROVIDER=none` (as the harness does). Ports: KyCalendar 5597 (with `KY_TRUSTED_PROXIES=127.0.0.1`, as its harness has), KyMessages 5598. No existing server was reused.
- Accounts: KyCalendar has `admin` (`init-admin`) and the everyday user `walter` (`create-user`). KyMessages has `admin` (`init-admin`, an operator path, instead of the harness's `KY_ADMIN_PASSWORD` env var). Every password is random, generated in the driver's memory at runtime, passed on stdin, and replaced through the real `/api/auth/login` → `/api/auth/change-password` flow with the CSRF header. Passwords were never written to argv, env, disk or a screenshot.
- Nothing bypasses auth, CSRF, CSP or the service worker, and there are no mocked responses.
- Teardown: the driver sends SIGTERM to the server, waits for it to exit, deletes the data dir (the credentials go with it), and marks the service `stopped` in `/tmp/ky-ui-council-baseline-services.json` (pids, port, data dir, stop command). Both servers are stopped, and no data dirs remain.

## Synthetic data

- KyCalendar, `walter`, created through the real API: the default `Calendar` (no colour set, so it falls back to the accent), plus `Personal` `#3f7f6e`. There are 11 events in the Sunday-start week of 2026-10-25 (America/Chicago):
  - Team standup, weekly MO–FR, 09:00–09:15
  - Tue: Design review: onboarding 10:00–11:30, Vendor call 14:00–14:45, Climbing gym 18:00–19:30
  - Wed: Lunch with Priya 12:00–13:00, all-day Sam's birthday
  - Thu: Quarterly planning 13:00–15:30
  - Thu–Fri: all-day Release freeze
  - Fri: Dentist 08:00–08:45, Sprint retro 15:00–16:00
  - Sat: Farmers market 09:00–10:30
- KyCalendar admin: nothing seeded.
- KyMessages: Matrix is not configured, so the console shows its honest unconfigured states. No chat data and no fake chat. Element chat was not captured; it needs separate evidence.

## Capture inventory

Desktop is 1440×1000, mobile 390×844. Both use the Busnes Light and Busnes Dark themes.

| File stem | Screen and state |
|---|---|
| `kycalendar-00-before-week-desktop-{light,dark}` | `walter`, the default desktop Week view (`timeGridWeek`) |
| `kycalendar-00-before-list-desktop-{light,dark}` | List (`listWeek`) after clicking List |
| `kycalendar-00-before-new-event-desktop-{light,dark}` | New event dialog, empty, opened over the List view |
| `kycalendar-00-before-list-mobile-{light,dark}` | Narrow default view (List) |
| `kycalendar-00-before-new-event-mobile-{light,dark}` | New event dialog, empty, opened over the narrow List |
| `kycalendar-00-before-admin-settings-{desktop,mobile}-{light,dark}` | `admin`, nav `Settings & DB` |
| `kymessages-00-before-overview-{desktop,mobile}-{light,dark}` | `admin`, Overview with Matrix off |
| `kymessages-00-before-settings-{desktop,mobile}-{light,dark}` | `admin`, nav `Settings & DB`, viewport only |
| `kymessages-00-before-settings-mobile-{light,dark}-full` | Same, full page (390×1497). `messages.mjs` also writes desktop `-full` files. The desktop page fits in 1000 px, so those were deleted after the run. |

## Capture conditions that affect reading

- The host is on America/New_York, and the browser ran on America/Chicago, where it was Sunday 2026-10-25 at about 23:21. So "today" is Sun 10/25, and the New event default is 10/26 12:00–01:00 AM (the next whole hour).
- At 1000 px, the desktop Week view opens at 12am and ends at about 4pm. The 15-minute standups render clipped. This is product behaviour, not a capture artefact.
- On narrow screens, the KyMessages horizontal nav scrolls to the selected item (`Settings & DB`), so the earlier items are off-screen.

## Not captured

- **KyMessages non-admin MemberHome.** Non-admin accounts exist only through KyIdentity SSO (`internal/api/sso_handlers.go`, auto-provision `Role: "user"`). There is no `create-user` CLI and no admin API for adding one. Writing a member row into SQLite by hand would be fabricated state, so it was not done. A real capture needs a disposable KyIdentity on a different loopback host name: cookies are scoped by host, not port, so `localhost` and `127.0.0.1` keep the two products' sessions apart. It also needs a registered OIDC client with redirect `http://127.0.0.1:5598/api/sso/kyidentity/callback`, plus an assigned everyday user. Not attempted; it needs a parent decision.
- **Element chat:** out of scope, as noted under Synthetic data.

## Appendix: driver scripts

These live at `/tmp/ky-ui-council-baseline/` and are copied here verbatim. SHA-256:

- `lib.mjs`: `d2a6192b5bde22b46020ae8b68ebb26b4e7ab51333ac0d262b0e2138ed36bed0`
- `calendar.mjs`: `a8868fb8541bc258f09483dad95f518e1c5ed5fca48657041532700b1407107b`
- `messages.mjs`: `df9fa943b60cb0754c3f5bcf79040fdd313ec6468aaa0f0027b6b6f9940ea4f9`

### lib.mjs

```js
// Shared helpers for the 2026-10-26 council baseline captures. Passwords live in memory only.
import { randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

export const OUT = '/home/yoshi/git/busnes.app/ky-ui/reviews/2026-10-26-council/screenshots';
export const SERVICES = '/tmp/ky-ui-council-baseline-services.json';

export const secret = () => `Cap-${randomBytes(18).toString('base64url')}9!`;

export async function waitReady(url, ms = 30000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    try { if ((await fetch(url)).ok) return; } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`server at ${url} not ready`);
}

// Each product owns its own key; runs are sequential, so read-modify-write is safe.
export async function recordService(key, value) {
  let all = {};
  try { all = JSON.parse(await readFile(SERVICES, 'utf8')); } catch { /* first writer */ }
  all[key] = { ...all[key], ...value, updated: new Date().toISOString() };
  await writeFile(SERVICES, JSON.stringify(all, null, 2) + '\n');
}

// Real login + forced password replacement through the API, in its own cookie jar.
export async function replacePassword(request, baseURL, username, current, next) {
  const api = await request.newContext({ baseURL });
  try {
    await api.get('/');
    const login = await api.post('/api/auth/login', { data: { username, password: current } });
    if (!login.ok()) throw new Error(`${username} login ${login.status()}`);
    const csrf = (await api.storageState()).cookies.find((c) => c.name === 'ky_csrf')?.value;
    const changed = await api.post('/api/auth/change-password', {
      headers: { 'X-CSRF-Token': csrf },
      data: { current_password: current, new_password: next },
    });
    if (!changed.ok()) throw new Error(`${username} change-password ${changed.status()}`);
  } finally { await api.dispose(); }
}

export async function settle(page) {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
}

export async function shot(page, name, fullPage = false) {
  const path = `${OUT}/${name}.png`;
  await page.screenshot({ path, fullPage });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  console.log(`saved ${path} (horizontal overflow ${overflow}px)`);
  return { name, overflow };
}
```

### calendar.mjs

```js
// KyCalendar baseline: disposable real server on 5597, synthetic week, real sign-in per context.
// Usage: node calendar.mjs <worktree>
process.env.TZ = 'America/Chicago';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { secret, waitReady, recordService, replacePassword, settle, shot } from './lib.mjs';

const wt = process.argv[2];
const { chromium, request } = await import(`${wt}/web/node_modules/@playwright/test/index.mjs`);
const PORT = '5597';
const baseURL = `http://127.0.0.1:${PORT}`;
const binary = `${wt}/.browser/server`;
const dir = await mkdtemp(join(tmpdir(), 'ky-council-cal-'));
const env = {
  PATH: process.env.PATH, KY_APP_URL: baseURL, KY_HOST: '127.0.0.1', KY_PORT: PORT, KY_DB_DRIVER: 'sqlite',
  KY_DATA_DIR: join(dir, 'data'), KYCALENDAR_BACKUP_DIR: join(dir, 'backups'),
  KY_CAPTCHA_PROVIDER: 'none', KY_TRUSTED_PROXIES: '127.0.0.1',
};
const pw = { adminInit: secret(), admin: secret(), walterInit: secret(), walter: secret() };
const run = (args, input) => {
  const r = spawnSync(binary, args, { cwd: dir, env, input: `${input}\n`, stdio: ['pipe', 'inherit', 'inherit'] });
  if (r.status !== 0) throw new Error(`${args[0]} exited ${r.status}`);
};

let server;
const stop = async () => {
  if (server && server.exitCode === null) {
    server.kill('SIGTERM');
    await new Promise((r) => server.once('exit', r));
  }
  await rm(dir, { recursive: true, force: true });
  await recordService('kycalendar', { state: 'stopped' });
};

const results = [];
try {
  run(['init-admin'], pw.adminInit);
  run(['create-user', '-username', 'walter'], pw.walterInit);
  server = spawn(binary, [], { cwd: dir, env, stdio: ['ignore', 'ignore', 'inherit'] });
  await recordService('kycalendar', {
    state: 'running', pid: server.pid, driver_pid: process.pid, port: Number(PORT), data_dir: dir,
    stop: `kill -TERM ${process.pid} ${server.pid}`,
  });
  await waitReady(baseURL);
  await replacePassword(request, baseURL, 'admin', pw.adminInit, pw.admin);
  await replacePassword(request, baseURL, 'walter', pw.walterInit, pw.walter);
  await seed(request);

  const browser = await chromium.launch();
  const cal = async (theme, width, height) => {
    const scheme = theme === 'busnes-dark' ? 'dark' : 'light';
    const ctx = await browser.newContext({ viewport: { width, height }, colorScheme: scheme, timezoneId: 'America/Chicago', locale: 'en-US' });
    const page = await ctx.newPage();
    await signIn(page, 'walter', pw.walter);
    await page.getByLabel('Color theme').selectOption(theme);
    await page.locator('.fc-event, .fc-list-event').first().waitFor();
    await settle(page);
    return { ctx, page };
  };

  for (const theme of ['busnes-light', 'busnes-dark']) {
    const t = theme.replace('busnes-', '');
    const d = await cal(theme, 1440, 1000);
    results.push(await shot(d.page, `kycalendar-00-before-week-desktop-${t}`));
    await d.page.locator('.fc-listWeek-button').click();
    await settle(d.page);
    results.push(await shot(d.page, `kycalendar-00-before-list-desktop-${t}`));
    await d.page.getByRole('button', { name: 'New event' }).click();
    await d.page.getByRole('dialog').waitFor();
    await settle(d.page);
    results.push(await shot(d.page, `kycalendar-00-before-new-event-desktop-${t}`));
    await d.ctx.close();

    const m = await cal(theme, 390, 844);
    results.push(await shot(m.page, `kycalendar-00-before-list-mobile-${t}`));
    await m.page.getByRole('button', { name: 'New event' }).click();
    await m.page.getByRole('dialog').waitFor();
    await settle(m.page);
    results.push(await shot(m.page, `kycalendar-00-before-new-event-mobile-${t}`));
    await m.ctx.close();

    for (const [w, h, label] of [[1440, 1000, 'desktop'], [390, 844, 'mobile']]) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: theme === 'busnes-dark' ? 'dark' : 'light', timezoneId: 'America/Chicago', locale: 'en-US' });
      const page = await ctx.newPage();
      await signIn(page, 'admin', pw.admin);
      await page.getByLabel('Color theme').selectOption(theme);
      await page.getByRole('navigation', { name: 'Primary' }).getByRole('button', { name: 'Settings & DB' }).click();
      await settle(page);
      results.push(await shot(page, `kycalendar-00-before-admin-settings-${label}-${t}`));
      await ctx.close();
    }
  }
  await browser.close();
  console.log(JSON.stringify(results));
} finally {
  await stop();
}

async function signIn(page, username, password) {
  await page.goto(`${baseURL}/`);
  await page.getByPlaceholder('admin', { exact: true }).fill(username);
  await page.locator('input[type=password]').fill(password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await page.getByRole('navigation', { name: 'Primary' }).waitFor();
}

// Synthetic week around today (Sunday-start week), created through the real API as walter.
async function seed(request) {
  const api = await request.newContext({ baseURL });
  try {
    await api.get('/');
    const login = await api.post('/api/auth/login', { data: { username: 'walter', password: pw.walter } });
    if (!login.ok()) throw new Error(`seed login ${login.status()}`);
    const csrf = (await api.storageState()).cookies.find((c) => c.name === 'ky_csrf')?.value;
    const headers = { 'X-CSRF-Token': csrf };
    const ok = async (res, what) => { if (!res.ok()) throw new Error(`${what}: ${res.status()} ${await res.text()}`); return res.status() === 204 ? null : res.json(); };
    let cals = await ok(await api.get('/api/calendars'), 'list calendars');
    console.log('calendars before seed:', cals.map((c) => `${c.name} ${c.color}`).join(', ') || '(none)');
    const work = cals[0] ?? await ok(await api.post('/api/calendars', { headers, data: { name: 'Work', color: '#d9622b', description: '' } }), 'create Work');
    const home = await ok(await api.post('/api/calendars', { headers, data: { name: 'Personal', color: '#3f7f6e', description: '' } }), 'create Personal');
    const sunday = new Date(); sunday.setHours(0, 0, 0, 0); sunday.setDate(sunday.getDate() - sunday.getDay());
    const at = (day, h, m = 0) => { const d = new Date(sunday); d.setDate(d.getDate() + day); d.setHours(h, m, 0, 0); return d.toISOString(); };
    const date = (day) => { const d = new Date(sunday); d.setDate(d.getDate() + day); return d.toLocaleDateString('en-CA'); };
    const timed = (cal, title, day, h1, m1, h2, m2, extra = {}) => ({ cal, body: { title, location: '', description: '', all_day: false, zone: 'America/Chicago', repeat: { freq: '' }, start: at(day, h1, m1), end: at(day, h2, m2), ...extra } });
    const events = [
      timed(work.id, 'Team standup', 1, 9, 0, 9, 15, { repeat: { freq: 'weekly', weekdays: ['MO', 'TU', 'WE', 'TH', 'FR'] }, location: 'Video call' }),
      timed(work.id, 'Design review: onboarding', 2, 10, 0, 11, 30, { location: 'Room 2B', description: 'Review the onboarding flow mockups.' }),
      timed(work.id, 'Vendor call', 2, 14, 0, 14, 45),
      timed(home.id, 'Lunch with Priya', 3, 12, 0, 13, 0, { location: 'Corner Bistro' }),
      timed(work.id, 'Quarterly planning', 4, 13, 0, 15, 30, { location: 'Main conference room' }),
      timed(home.id, 'Dentist', 5, 8, 0, 8, 45),
      timed(work.id, 'Sprint retro', 5, 15, 0, 16, 0),
      timed(home.id, 'Climbing gym', 2, 18, 0, 19, 30),
      timed(home.id, 'Farmers market', 6, 9, 0, 10, 30),
      { cal: work.id, body: { title: 'Release freeze', location: '', description: '', all_day: true, repeat: { freq: '' }, start: date(4), end: date(6) } },
      { cal: home.id, body: { title: "Sam's birthday", location: '', description: '', all_day: true, repeat: { freq: '' }, start: date(3), end: date(4) } },
    ];
    for (const e of events) await ok(await api.post(`/api/calendars/${encodeURIComponent(e.cal)}/events`, { headers, data: e.body }), `event ${e.body.title}`);
    console.log(`seeded ${events.length} events, week of ${date(0)} (America/Chicago)`);
  } finally { await api.dispose(); }
}
```

### messages.mjs

```js
// KyMessages baseline: disposable real server on 5598, Matrix not configured, real admin sign-in per context.
// Usage: node messages.mjs <worktree>
process.env.TZ = 'America/Chicago';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { secret, waitReady, recordService, replacePassword, settle, shot } from './lib.mjs';

const wt = process.argv[2];
const { chromium, request } = await import(`${wt}/web/node_modules/@playwright/test/index.mjs`);
const PORT = '5598';
const baseURL = `http://127.0.0.1:${PORT}`;
const binary = `${wt}/.browser/server`;
const dir = await mkdtemp(join(tmpdir(), 'ky-council-msg-'));
const env = {
  PATH: process.env.PATH, KY_APP_URL: baseURL, KY_HOST: '127.0.0.1', KY_PORT: PORT, KY_DB_DRIVER: 'sqlite',
  KY_DATA_DIR: join(dir, 'data'), KY_BACKUP_DIR: join(dir, 'backups'), KY_CAPTCHA_PROVIDER: 'none',
};
const pw = { init: secret(), admin: secret() };

let server;
const results = [];
try {
  // Operator path: init-admin reads the password from stdin before first start.
  const r = spawnSync(binary, ['init-admin'], { cwd: dir, env, input: `${pw.init}\n`, stdio: ['pipe', 'inherit', 'inherit'] });
  if (r.status !== 0) throw new Error(`init-admin exited ${r.status}`);
  server = spawn(binary, [], { cwd: dir, env, stdio: ['ignore', 'ignore', 'inherit'] });
  await recordService('kymessages', {
    state: 'running', pid: server.pid, driver_pid: process.pid, port: Number(PORT), data_dir: dir,
    stop: `kill -TERM ${process.pid} ${server.pid}`,
  });
  await waitReady(baseURL);
  await replacePassword(request, baseURL, 'admin', pw.init, pw.admin);

  const browser = await chromium.launch();
  for (const theme of ['busnes-light', 'busnes-dark']) {
    const t = theme.replace('busnes-', '');
    for (const [w, h, label] of [[1440, 1000, 'desktop'], [390, 844, 'mobile']]) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: theme === 'busnes-dark' ? 'dark' : 'light', timezoneId: 'America/Chicago', locale: 'en-US' });
      const page = await ctx.newPage();
      await page.goto(`${baseURL}/`);
      await page.getByLabel('Username').fill('admin');
      await page.getByLabel('Password').fill(pw.admin);
      await page.getByRole('button', { name: 'Sign In', exact: true }).click();
      const nav = page.getByRole('navigation', { name: 'Primary' });
      await nav.waitFor();
      await page.getByLabel('Color theme').selectOption(theme);
      await settle(page);
      results.push(await shot(page, `kymessages-00-before-overview-${label}-${t}`));
      await nav.getByRole('button', { name: 'Settings & DB' }).click();
      await settle(page);
      results.push(await shot(page, `kymessages-00-before-settings-${label}-${t}`));
      results.push(await shot(page, `kymessages-00-before-settings-${label}-${t}-full`, true));
      await ctx.close();
    }
  }
  await browser.close();
  console.log(JSON.stringify(results));
} finally {
  if (server && server.exitCode === null) {
    server.kill('SIGTERM');
    await new Promise((r) => server.once('exit', r));
  }
  await rm(dir, { recursive: true, force: true });
  await recordService('kymessages', { state: 'stopped' });
}
```
