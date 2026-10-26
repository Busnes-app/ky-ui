# Fleet Appearance: independent runtime source review

Date 2026-10-26. Reviewer: Claude Opus 5.5 (`claude-opus-5-5`), acting as an independent review sub-agent; it did not implement the change. This is a source and behaviour review, not visual acceptance, and it gives no screenshot scores. Machine-readable record: `runtime-source-review.json`, which lists every changed file with its coverage class.

## Result

Two confirmed medium regressions need fixing before release: **F1** (status colours in Base, Pulse and Drive) and **F2** (KyDNS and KyRecovery first paint). Four low items follow. None is a security finding. All vendored ky-ui bytes match canonical.

| ID | Sev | Verdict | Repos | Summary |
|---|---|---|---|---|
| F1 | medium | CONFIRMED | ky-server-base, KyPulse-server, KyDrive-server | Base, Pulse and Drive show unreadable status colours on the newly offered light suite themes |
| F2 | medium | CONFIRMED | KyDNS-server, KyRecovery-server | KyDNS and KyRecovery no longer guarantee the saved theme before first paint |
| F3 | low | CONFIRMED (not a regression) | KyIdentity-server, KyNotes-server (source), KyPost-Server (source), KyDNS-server (source), ky-ui | Pre-existing: light named themes on a dark OS get Busnes Dark status colours in products that remove data-theme |
| F4 | low | PLAUSIBLE (not a regression) | KyIdentity-server, KyNotes-server | KyIdentity and KyNotes Appearance radios do not follow another tab's choice |
| F5 | low | CONFIRMED (not a regression) | KyYard-server, KyNotes-server | Spec question: KyYard and KyNotes reach Appearance through Settings, not a primary-navigation link |
| F6 | low | PLAUSIBLE (not a regression) | ky-server-base, KyPulse-server, KyDrive-server, KyRecovery-server | Phone horizontal navigation does not reveal the current item (Base, Pulse, Drive, Recovery) |
| I1 | info | CONFIRMED (not a regression) | fleet | Implementer notes checked |

## Findings

### F1 (medium, CONFIRMED): Base, Pulse and Drive show unreadable status colours on the newly offered light suite themes

Locations:
- `ky_server_base web/src/styles/theme.css:32-43 (:root/patina --danger #ef4444, --success #10b981 are the only values for suite themes)`
- `ky_server_base web/src/theme.ts:29 (data-theme=<suite id>; catalog palette sets no status colours by design)`
- `kyPulse-server web/src/styles/theme.css:32-43 and web/src/theme.ts:29 (identical)`
- `KyDrive-server web/src/styles/theme.css:31-43 and web/src/theme.ts:26 (only --warning is adjusted for light themes)`

**What.** These three products offered only Busnes plus the five base themes before this change. They now offer all 15 suite palettes with data-theme=<id>. No product block matches those ids and ky-ui deliberately leaves status colours to products (test/themes.test.js: 'suite palettes leave product status colours alone'). So --danger/--success fall back to Patina's dark-theme #ef4444/#10b981. KyCalendar and KyMessages close the same gap with a :not() tint rule (web/src/styles/theme.css:106); KyYard sets them inline by scheme. Affected text includes .dr-danger/.dr-ok, .dr-alert-error/.dr-alert-success, .app-logout and Drive alert icons and .btn-danger-quiet.

**Evidence.** status-contrast harness, min(contrast vs --panel, vs --bg): Base/Pulse/Drive light-matter danger 3.29 success 2.22; tropics 3.34/2.25; white-cliffs 3.57/2.40; sky 3.25/2.19; sun 3.42/2.31; polished-ky 3.35/2.25. Controls KyCalendar/KyMessages on the same themes: 9.34-10.91 danger, 7.70-9.51 success.

**Fix.** Port the KyCalendar/KyMessages rule (theme.css:106-110) into each product's styles/theme.css, adding --warning for Base/Pulse and replacing Drive's inline --warning special case. Alternatively, set the colours inline by scheme as KyYard does.

**Verification.** node /tmp/claude-fleet-review/status-contrast.mjs (source in runtime-source-review.md appendix B). Today: Base/Pulse/Drive rows < 4.5. After the fix every light-theme danger/success value is >= 4.5, as the Calendar and Messages rows already are.


### F2 (medium, CONFIRMED): KyDNS and KyRecovery no longer guarantee the saved theme before first paint

Locations:
- `kydns-server internal/web/templates/base.html:14-15 (classic head scripts replaced by modulepreload + type=module)`
- `kyrecovery-server internal/server/static/index.html:14-15 and ceremony.html:11-12 (same)`

**What.** Before the change, a synchronous classic head script applied the saved choice before the body was parsed. The old KyDNS theme.js comment states this purpose. Module scripts are deferred and not render-blocking. If the module fetch is slower than first paint, the OS-following Busnes default paints first. That covers both named themes and explicit Busnes Light/Dark choices opposite the OS. KyDNS is a multi-page app, so the race recurs on every navigation. ky-ui AGENTS explicitly says deferred modules make no first-paint promise, so the shared contract tolerates this. These two products, however, previously made that promise. The implementer note marked this as unproven.

**Evidence.** first-paint harness, theme script delayed 800 ms. Base revisions applied the theme before first contentful paint (DNS Ocean: applied 887 ms, FCP 920 ms; Recovery light on OS dark: applied 853 ms, FCP 944 ms). Head revisions painted first (DNS Ocean FCP 68 ms, applied 843 ms; DNS 'Busnes Light' on OS dark FCP 76/839; Recovery 'light' on OS dark FCP 132/862; Recovery 'ocean' FCP 104/850). With no delay on loopback, 0 of 12 head runs flashed. This is a timing race, not a deterministic flash.

**Fix.** Restore a small synchronous classic bootstrap in <head> that reads the key and applies data-theme plus the palette before paint. For example, have sync-consumers generate a classic themes-browser.js global, as palettes-browser.js was, and keep the module for the picker. Minimum mitigation: add blocking="render" to the module script. Chromium honours it; other engines keep today's behaviour.

**Verification.** node /tmp/claude-fleet-review/first-paint.mjs (appendix A). Old revisions print paintedBeforeSavedTheme=false and heads print true. After the fix, the head rows print false.


### F3 (low, CONFIRMED): Pre-existing: light named themes on a dark OS get Busnes Dark status colours in products that remove data-theme

Locations:
- `ky-ui src/tokens.css:91-110 (alias block :root:not([data-theme]):not([data-ky-theme]) sets --danger/--success/--warning/--ink-muted from OS-following --ky-* at specificity 0,3,0)`
- `KyIdentity-server web/src/theme.ts:15 (named theme deletes data-theme), and the same pattern in KyNotes, KyPost and KyDNS theme.js`

**What.** Measured in KyIdentity: identical at the base and head revisions, so this change did not cause it. It is reported because the brief asks for status contrast. The new base-family themes (paper and others) set their own status colours inline, so they are not affected. KyRecovery avoids the problem by keeping data-theme=busnes-<scheme> under named palettes.

**Evidence.** status-contrast harness, KyIdentity with OS dark, light suite themes: danger 2.10-2.30, success 1.78-1.95, at both ba43fbe9 and cf986204.

**Fix.** Separate follow-up. Have these adapters keep a scheme-matched data-ky-theme for named palettes, as KyRecovery does, or set status colours inline by scheme.

**Verification.** status-contrast harness 'KyIdentity head, OS dark' row reaches >= 4.5.


### F4 (low, PLAUSIBLE): KyIdentity and KyNotes Appearance radios do not follow another tab's choice

Locations:
- `KyIdentity-server web/src/components/Appearance.tsx:7`
- `kynotes-server web/src/main.tsx:3415`

**What.** watchChoice re-applies the theme, but the component state is read once. The checked radio stays on the old theme after a change in another tab. Clicking that stale-checked card produces no change event, so the user must pick a different card first. Every other product updates its radios through storage, ky:theme or useSyncExternalStore. The old swatch and select UIs had the same staleness.

**Evidence.** Source reasoning only (React-controlled radio); not executed.

**Fix.** Add the same storage listener KyCalendar uses (pages/Appearance.tsx:8-12).

**Verification.** Two tabs on Appearance: choose Sun in tab B, then Ocean must appear checked in tab A without a reload.


### F5 (low, CONFIRMED): Spec question: KyYard and KyNotes reach Appearance through Settings, not a primary-navigation link

Locations:
- `KyYard-Server web/src/components/AppHeader.tsx:13-15 and web/src/pages/Settings.tsx:11-14 (Appearance is the default Settings tab for every role)`
- `kynotes-server web/src/main.tsx:3439 (Settings anchor)`

**What.** The other nine web interfaces add an 'Appearance' primary-nav item for every signed-in role. KyYard and KyNotes keep the pre-existing Settings -> Appearance placement. It is reachable for every role in one or two steps, and the compact dropdown is gone. The owner rule reads 'keep an Appearance navigation link'. Whether Settings placement satisfies it is the owner's call, not a code defect.

**Evidence.** Source.

**Fix.** Ask the owner. If a primary link is required, add /settings?section=appearance (KyYard) or an Appearance nav entry that opens Settings at #appearance (KyNotes).

**Verification.** n/a


### F6 (low, PLAUSIBLE): Phone horizontal navigation does not reveal the current item (Base, Pulse, Drive, Recovery)

Locations:
- `ky_server_base web/src/styles/theme.css:457`
- `kyrecovery-server internal/server/static/css/styles.css:144 (overflow-x:auto, scrollbar hidden)`

**What.** Appearance is now the last item. On a 390 px reload of Pulse's #/appearance, the selected item can sit off-screen, with no visible scrollbar on Recovery. It stays operable by swipe and by keyboard focus, which scrolls into view. KyMessages scrolls the current item into view (AppHeader.tsx:41). This is shell consistency, not a reachability failure.

**Evidence.** Source only; not captured.

**Fix.** Reuse KyMessages' scrollIntoView({inline:'nearest'}) on route change.

**Verification.** 390x844, open Appearance, reload: the selected nav item intersects the viewport.


### I1 (info, CONFIRMED): Implementer notes checked

**What.** KyYard: LOCAL_PALETTE keeps Polished Ky --button-text #021716 (theme.ts:11, 29), which measures 5.04:1 on #0891b2. The catalog #042f2e measures 3.93:1 and is inherited by the other products; that is the stated acceptance gap. KyDrive: the five base themes skip inline catalog colours, and previews read the product's own [data-theme] blocks (theme.css:71-77), so rendered colours and saved IDs are preserved; paper differs from the catalog by design. KyRecovery: --ink is scoped to the picker; navigation.css and appearance.css read no surface from --ink; status colours follow the palette's scheme via data-theme=busnes-<scheme>; no collision found. Calendar/Messages global hover fix (button:not(:where(.ky-nav-item))) and the KyPost reader are untouched. Vendored ky-ui files in all 11 consumers are byte-identical to ab7a039, and generated palettes and VERSION are identical across consumers. Legacy base-theme CSS in Calendar, Messages, Yard, Base and Pulse equals THEME_PALETTES; Drive paper differs and is handled. Login-page selects (Calendar, Messages, Base, Pulse, Drive), Drive's admin Settings select, KyPost's admin ApplicationRuntime select (no Match system option, pre-existing) and the KyRecovery ceremony select are outside navigation and allowed by the owner correction. ky-server-base Dashboard dropped its 'Verified Ready' claim, a copy change in the safe direction.

## Pinned inputs and coverage

Every review base equals `git merge-base base head`. Each worktree HEAD matched the pinned head at review time. All reads used `git show`/`git diff` at the pinned commits.

| Repository | Review base | Head | Files | Runtime read | Tests read | Vendor bytes checked | Docs read | Omitted |
|---|---|---|---|---|---|---|---|---|
| KyDNS-server | `e301d07b9cb2` | `28bf59e35583` | 50 | 7 | 1 | 7 | 0 | 35 |
| KyRecovery-server | `b60e5710b920` | `2738beb742ce` | 48 | 4 | 0 | 7 | 1 | 36 |
| KyIdentity-server | `ba43fbe9829a` | `cf986204a755` | 71 | 4 | 1 | 7 | 0 | 59 |
| KyNotes-server | `d172a514e47d` | `22f51a10882d` | 70 | 3 | 1 | 7 | 1 | 58 |
| KyPost-Server | `7aea66f888ec` | `7b0892f05bbd` | 89 | 5 | 1 | 5 | 1 | 77 |
| KyCalendar | `21c3d7925e84` | `00f7243269d5` | 98 | 7 | 4 | 5 | 1 | 81 |
| KyMessage-Server | `feb4f956e1d1` | `8fe1c977f4ac` | 81 | 7 | 4 | 5 | 0 | 65 |
| KyYard-server | `996c59a1c4f5` | `3925b30a4bb8` | 68 | 5 | 2 | 7 | 1 | 53 |
| ky-server-base | `95a3f114712d` | `461f25f155fa` | 60 | 9 | 2 | 7 | 0 | 42 |
| KyDrive-server | `e772e28629bd` | `91c312b3136c` | 93 | 6 | 2 | 7 | 0 | 78 |
| KyPulse-server | `01accf34db69` | `0f294e66dbf8` | 58 | 9 | 2 | 7 | 0 | 40 |
| ky-ui | `09622601e223` | `ab7a039851df` | 34 | 10 | 6 | 0 | 0 | 18 |

ky-ui is pinned at `ab7a039`. The commits `4f83f34..ab7a039` touch only `reviews/2026-10-26-fleet/shared-preview-edge/*` and `shared-release/README.md`, so the shared runtime equals `4f83f34`.

Omitted inputs and why:
- Generated `dist/` bundles and `tsconfig.tsbuildinfo`. Their source and the import wiring (`main.tsx`/`App.tsx` CSS imports; Go `embed static/*`) were reviewed instead.
- `docs/ui-fleet-2026-10-26/*` and the `reviews/` evidence: screenshots, manifests, capture scripts and CSVs.
- Binary assets and the Space Grotesk `OFL.txt`. The KyRecovery TTF is present at the head and embedded by `//go:embed static/*`.
- Docs not listed as read: AGENTS, UI-VERIFICATION, ASSURANCE, FEATURES, PLAN, README and CHANGELOG, other than KyRecovery CHANGELOG, KyYard web/AGENTS, KyPost frontend/AGENTS, KyNotes AGENTS and KyCalendar web/browser/AGENTS.
- Vendored `*/ky-ui/*` copies. They were not read line by line; instead they were byte-compared with ky-ui `ab7a039:src/*` (9 files × 11 consumers, all identical). `palettes.ts`, `palettes-browser.js` and `VERSION` are identical across all consumers.

## Focus areas checked

- **Normalisation and persistence.** Every adapter resolves saved IDs, names and the legacy aliases (`Current`, `Old Light`, `Old Dark`, `Cliffs`) through `findTheme`, and keeps its own key and saved format: names in KyDNS, Identity, Notes, Post and Yard; IDs in Calendar, Messages, Base, Pulse and Drive; `system`/`light`/`dark` plus IDs in KyRecovery. Base `patina` (`Patina Ky (base)`) and suite `patina-ky` stay distinct. Unavailable storage falls back to Match system without throwing.
- **Named to Busnes cleanup.** `applyThemeVariables` removes all 15 variables, including `--danger`/`--success`, and clears the inline `color-scheme`. KyPost also clears its mail keys, and KyYard clears its inline status colours.
- **OS and cross-tab.** OS changes are followed only while the choice is Match system. A storage event re-applies the theme everywhere; F4 covers the stale-radio gap in Identity and Notes.
- **Preview matches applied colours.** The generator reads `THEME_PALETTES` and Busnes tokens. Legacy base CSS equals the catalog except Drive `paper`, whose previews read the product's own block.
- **CSP.** No inline styles are used: previews use generated attribute selectors and palettes use CSSOM `setProperty`, which `style-src 'self'` allows. Module scripts are same-origin; the KyRecovery ceremony CSP allows `'self'`. First paint is covered by F2.
- **Native radios.** Each product has one `name` per group, a `fieldset`/`legend` and a `:has(:focus-visible)` outline. No product suppresses arrow-key selection.
- **Role routing.** The Appearance item is unconditional in KyDNS, Identity (account group), Calendar, Messages (members now get Home and Appearance), Base, Pulse (`admin:false`, route whitelisted) and Drive. KyRecovery has a tab and Yard and Notes use Settings (see F5).
- **CSS collisions and prior fixes.** The KyRecovery `--ink` override is scoped and nothing shared reads a surface from `--ink`. The Calendar and Messages `button:not(:where(.ky-nav-item))` hover fix is intact, and KyPost's reader is untouched. The Base and Pulse global `:is(...):focus-visible` rule (0,1,1) stays below `.ky-nav-item:focus-visible` (0,2,0).
- **Responsive geometry.** At 390 px, page padding leaves 358 px, which fits two 172 px cards, in KyDNS, Recovery, Base, Pulse, Drive, Yard and Messages, and in Identity, Notes and Post after their specific adjustments. F6 covers phone-nav reveal.

## Limits

- Source audit only; no visual acceptance or screenshot scoring.
- Product test suites were not rerun; implementer-reported passes are not re-certified here.
- Harnesses use real committed CSS/JS but synthetic pages, not full product builds.
- F4 and F6 are reasoned from source and not executed.
- The harnesses ran headless Chromium 1248 from ky-ui `node_modules` on ephemeral loopback ports, not on 5391/5392. No product server, account, personal data or production resource was used.
- The scripts live outside the repositories (`/tmp/claude-fleet-review/`), so they are reproduced below. Run them with Node 24 and the ky-ui worktree's Playwright.
- No security finding. Nothing here needs to be withheld from published evidence.

## Appendix A: first-paint harness (F2)

```js
// Owned synthetic harness: does a saved theme apply before first contentful paint?
// Serves real committed bytes (git show <rev>) for KyDNS/KyRecovery static assets, delays the
// theme script(s) to model a slow fetch, and compares FCP time with the first theme mutation.
import { createServer } from 'node:http';
import { execFileSync } from 'node:child_process';
import { chromium } from '/home/yoshi/git/busnes.app/ky-ui/.claude/worktrees/fleet-appearance/node_modules/playwright/index.mjs';

const ROOT = '/home/yoshi/git/busnes.app';
const show = (repo, rev, path) => { try { return execFileSync('git', ['-C', `${ROOT}/${repo}`, 'show', `${rev}:${path}`]); } catch { return null; } };
const BODY = '<div class="app"><main class="app-main"><h1>Dashboard</h1><p>Synthetic first-paint fixture.</p></main></div>';
const products = {
  dns: { repo: 'kydns-server/.claude/worktrees/fleet-appearance', staticDir: 'internal/web/static', key: 'kydns-theme',
    page: rev => show('kydns-server/.claude/worktrees/fleet-appearance', rev, 'internal/web/templates/base.html').toString()
      .replace('{{template "body" .}}', BODY).replace(/\{\{define "mark"\}\}[\s\S]*?\{\{end\}\}/, '').replace(/\{\{[^}]*\}\}/g, ''),
    delayed: ['/static/theme.js', '/static/ky-ui/themes.js'] },
  recovery: { repo: 'kyrecovery-server/.claude/worktrees/fleet-appearance', staticDir: 'internal/server/static', key: 'kyrecovery-theme',
    page: rev => show('kyrecovery-server/.claude/worktrees/fleet-appearance', rev, 'internal/server/static/index.html').toString()
      .replace(/<script src="\/static\/js\/app\.js"><\/script>/, ''),
    delayed: ['/static/js/theme.js', '/static/ky-ui/themes.js'] },
};
const types = { js: 'text/javascript', css: 'text/css', html: 'text/html', png: 'image/png', svg: 'image/svg+xml', ttf: 'font/ttf' };

async function run(product, rev, saved, scheme) {
  const p = products[product];
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x').pathname;
    if (url === '/') { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(p.page(rev)); }
    const body = url.startsWith('/static/') ? show(p.repo, rev, p.staticDir + url.slice(7)) : null;
    if (!body) { res.writeHead(404); return res.end(); }
    if (p.delayed.includes(url)) await new Promise(r => setTimeout(r, 800));
    res.writeHead(200, { 'content-type': types[url.split('.').pop()] ?? 'application/octet-stream' }); res.end(body);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const browser = await chromium.launch();
  const page = await browser.newPage({ colorScheme: scheme });
  await page.addInitScript(([key, value]) => {
    if (value !== null) localStorage.setItem(key, value);
    window.__applied = null;
    new MutationObserver(() => { window.__applied ??= performance.now(); })
      .observe(document, { subtree: true, attributes: true, attributeFilter: ['style', 'data-theme', 'data-ky-theme'] });
  }, [p.key, saved]);
  await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  const r = await page.evaluate(() => ({
    fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null,
    applied: window.__applied,
    theme: document.documentElement.dataset.theme ?? null,
    bg: getComputedStyle(document.body).backgroundColor,
  }));
  await browser.close(); server.close();
  const flash = r.fcp !== null && (r.applied === null || r.fcp < r.applied);
  console.log(JSON.stringify({ product, rev: rev.slice(0, 9), saved, os: scheme, fcp: Math.round(r.fcp), applied: r.applied && Math.round(r.applied), finalTheme: r.theme, finalBg: r.bg, paintedBeforeSavedTheme: flash }));
  return flash;
}

const cases = [
  ['dns', 'e301d07b9cb2623a0aa048df5b5b7b131833b0ef', 'Ocean', 'light'],
  ['dns', '28bf59e35583bf4e04eb7b21486ea6c1531b2bd8', 'Ocean', 'light'],
  ['dns', 'e301d07b9cb2623a0aa048df5b5b7b131833b0ef', 'Busnes Light', 'dark'],
  ['dns', '28bf59e35583bf4e04eb7b21486ea6c1531b2bd8', 'Busnes Light', 'dark'],
  ['recovery', 'b60e5710b920fdca012179615ad278fbca6cf206', 'light', 'dark'],
  ['recovery', '2738beb742cec16c569c45cc2e929d2e8e74621a', 'light', 'dark'],
  ['recovery', '2738beb742cec16c569c45cc2e929d2e8e74621a', 'ocean', 'light'],
];
for (const c of cases) await run(...c);
```

## Appendix B: status-contrast harness (F1, F3)

```js
// Owned synthetic harness: computed --danger/--success contrast against --panel/--bg for each
// suite theme, using real committed product CSS + vendored ky-ui tokens and the product's
// own apply pattern (data-theme=<id> + catalog palette inline, or data-theme removed).
import { execFileSync } from 'node:child_process';
import { chromium } from '/home/yoshi/git/busnes.app/ky-ui/.claude/worktrees/fleet-appearance/node_modules/playwright/index.mjs';
const ROOT = '/home/yoshi/git/busnes.app';
const show = (repo, rev, path) => execFileSync('git', ['-C', `${ROOT}/${repo}/.claude/worktrees/fleet-appearance`, 'show', `${rev}:${path}`], { encoding: 'utf8' });
const KYUI = (repo, rev, dir) => show(repo, rev, `${dir}/tokens.css`);
const catalog = show('ky-ui', 'ab7a039851df5887fee22ca261d941e4f35ae825', 'src/themes.js');
const targets = [
  // name, repo, rev, product css, ky-ui dir, mode
  ['ky-server-base', 'ky_server_base', '461f25f1', 'web/src/styles/theme.css', 'web/src/ky-ui', 'keep-id'],
  ['KyPulse', 'kyPulse-server', '0f294e66', 'web/src/styles/theme.css', 'web/src/ky-ui', 'keep-id'],
  ['KyDrive', 'KyDrive-server', '91c312b3', 'web/src/styles/theme.css', 'web/src/ky-ui', 'keep-id+drive-warning'],
  ['KyCalendar (control)', 'KyCalendar', '00f72432', 'web/src/styles/theme.css', 'web/src/ky-ui', 'keep-id'],
  ['KyMessages (control)', 'KyMessage-Server', '8fe1c977', 'web/src/styles/theme.css', 'web/src/ky-ui', 'keep-id'],
  ['KyIdentity head, OS dark', 'KyIdentity-server', 'cf986204', 'web/src/index.css', 'web/src/ky-ui', 'drop-id'],
  ['KyIdentity base, OS dark', 'KyIdentity-server', 'ba43fbe9', 'web/src/index.css', 'web/src/ky-ui', 'drop-id'],
];
const LIGHT = ['light-matter', 'tropics', 'white-cliffs', 'sky', 'sun', 'polished-ky'];
const browser = await chromium.launch();
for (const [name, repo, rev, css, dir, mode] of targets) {
  const page = await browser.newPage({ colorScheme: name.includes('OS dark') ? 'dark' : 'light' });
  await page.setContent(`<style>${show(repo, rev, css)}</style><style>${KYUI(repo, rev, dir)}</style><p id="probe">x</p>`);
  const rows = await page.evaluate(async ([src, mode, ids]) => {
    const { applyThemeVariables } = await import(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
    const root = document.documentElement, probe = document.getElementById('probe');
    const rgb = v => { probe.style.color = ''; probe.style.color = v; const c = getComputedStyle(probe).color;
      const n = c.match(/[\d.]+/g).map(Number); return c.startsWith('color(') ? n.slice(0, 3).map(x => x * 255) : n.slice(0, 3); };
    const lum = ([r, g, b]) => [r, g, b].map(x => x / 255).map(x => x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4).reduce((s, x, i) => s + x * [0.2126, 0.7152, 0.0722][i], 0);
    const ratio = (a, b) => { const [x, y] = [lum(rgb(a)), lum(rgb(b))]; return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    return ids.map(id => {
      const scheme = applyThemeVariables(id, root);
      if (mode.startsWith('keep-id')) root.dataset.theme = id; else { delete root.dataset.theme; root.dataset.scheme = scheme; }
      if (mode.endsWith('drive-warning') && scheme === 'light') root.style.setProperty('--warning', '#a16207');
      const v = n => getComputedStyle(root).getPropertyValue(n).trim();
      const out = { id };
      for (const s of ['--danger', '--success']) out[s] = Math.min(ratio(`var(${s})`.replace(/var\((--[\w-]+)\)/, (_, n) => v(n)), v('--panel')), ratio(v(s), v('--bg'))).toFixed(2);
      return out;
    });
  }, [catalog, mode, LIGHT]);
  console.log(name, rev, rows.map(r => `${r.id} danger ${r['--danger']} success ${r['--success']}`).join(' | '));
  await page.close();
}
await browser.close();
```
