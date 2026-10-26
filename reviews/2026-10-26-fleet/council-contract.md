# Council discovery — Claude Opus 5.5

Read-only source review, not screenshot scoring. Task: `node:delegated-task:command%3Amcp%3A13a5f7c0-4e97-4a4d-86e6-b02756845867%3Adelegate-task%3Aky-fleet-appearance-council-contract-20261026-r1`.

# Ky web fleet inventory and shared Appearance picker contract

The fleet has 11 active Ky web apps (nine React, two Go-rendered). None of them uses native radios for theme choice, and they split across two incompatible theme catalogs. I recommend one shared, dependency-free picker added to ky-ui, then rolling it out in five groups.

Everything here was read from committed default branches: `ky-ui` origin/main `0962260`, which has #18 and #19 merged. Nothing was edited. My agents didn't run `git fetch`, but something advanced the local origin refs at 06:48 today, so they now match GitHub. I haven't rated any current UI screenshot.

## Your two screenshots

- **KyIdentity** (`KyIdentity-server/web/src/components/Appearance.tsx`) is the target look. It has flat cards with a two-tone preview, an accent bar and an ink bar, the theme name, and a Light/Dark label. The problems are underneath:
  - The cards are `aria-pressed` buttons, not radios.
  - The selected card is marked only by an accent border plus a glow ring, which is color only.
  - There is no way back to following the OS once a theme is saved.
- **KyPost** has no Light/Dark label, and on a wide screen it runs to about 11 columns. The shadowed container in your screenshot is gone on current main (`.panel` is flat after #480).

## Fleet inventory

All 11 are Go servers. In the theme catalog column, "17" means the suite set from KyPost: Busnes Light/Dark plus 15 named themes. "8 (base)" means System, Busnes Light/Dark, Patina Ky, Cyber Dark, Nord Slate, Paper Clean and OLED Black.

| App | UI | ky-ui version | Storage key / catalog | Current picker | CSP problem |
|---|---|---|---|---|---|
| KyPost | React (`frontend/`) | 0.3.0 | `kypost-theme` / 17 | `settings/sections/Appearance.tsx` swatches; also an admin `<select>` in `admin/sections/ApplicationRuntime.tsx:185` | — |
| KyCalendar | React (`web/`) | 0.3.0 | `ky_theme` / 8 (base) | `components/ThemeSwitcher.tsx` `<select>` in the sidebar, Login and Settings (Settings is admin-only) | — |
| KyMessages | React (`web/`) | 0.3.0 | `ky_theme` / 8 (base) | Same `<select>` in the header, Login and Settings | — |
| KyIdentity | React (`web/`) | 0.2.0 | `kyidentity-theme` / 17 | `components/Appearance.tsx` (the reference) | — |
| KyNotes | React (`web/src/main.tsx`, 3,521 lines) | 0.2.0 | `kynotes-theme` / 17 | `<select>` plus an "Apply theme" button, `main.tsx:3453` | `style-src 'self'`: no inline style attributes allowed |
| KyYard | React (`web/`) | 0.2.0 | `kyyard-theme` / 17 (15 hand-copied hex palettes) | `ThemeSwitcher.tsx` swatches, `aria-pressed`, no Light/Dark label | — |
| KyDrive | React (`web/`) | 0.2.0, **not in `consumers.json`** | `ky_theme` / 8 (base) | `<select>` in the sidebar, Login and admin Settings | Go editor page has its own CSP |
| KyPulse | React (`web/`) | 0.2.0, **not in `consumers.json`** | `ky_theme` / 8 (base) | `<select>` in the sidebar, Login and Settings | — |
| ky-server-base | React (`web/`) | 0.2.0 | `ky_theme` / 8 (base, origin of the set) | `<select>` in the sidebar, Login and Settings | — |
| KyDNS | Go `html/template` + vanilla JS (`internal/web/templates`, `static/`) | 0.2.0 | `kydns-theme` / 17 | `static/theme.js` swatches built with `innerHTML` and `style=` | **The entire policy is `frame-ancestors 'self'`** (`internal/web/middleware.go:207`); no script or style restriction |
| KyRecovery | Static HTML + vanilla JS (`internal/server/static/index.html`, `ceremony.html`) | 0.2.0 | `kyrecovery-theme` / System, Light, Dark only | Header `<select data-theme-select>` | **`script-src 'unsafe-inline'`** (`server.go:227`), needed by 34 inline `onclick=` handlers |

Other facts that shape the contract:
- No app has a working first-paint theme script except KyDNS and KyRecovery, which use blocking scripts in `<head>`.
- The ky-server-base family (Base, Drive, Pulse, Calendar, Messages, Yard) stores a server `site_theme`, and KyNotes stores a `default_theme`. No web client reads either, so the effective theme is browser-local everywhere.
- KyMessages' Element chat is themed through `internal/matrixinit/templates/element.json.tmpl`, which defines two Busnes `custom_themes`. Their colours are hand-copied from the tokens, and the test (`matrixinit_test.go`) does not compare values.

### Excluded

- **Archived on GitHub:** KyForge-Server (archived Oct 3; cancelled 2026-10-10 per `KyQuickStart/docs/guided-setup.md:2080`), KyMark-server (cancelled the same day), KyVault-server (replaced by Vaultwarden 2026-10-06, root `AGENTS.md`). There is no local KyForge checkout.
- **No web UI:** KyQuickStart is a CLI with a JSON-only runner API. KyQuickStart-AI is bash and a terminal dashboard. ky-kubernetes is manifests.
- **Marketing:** Busnes.app-site, kypost-site, ky-launch.
- **Native:** the KyAuth apps, kydrive-desktop, and KyPost for Android/Mac/Linux (their webviews only render mail bodies).
- **Libraries and fixtures:** ky-primitives, go-webdav, kypost-demo-IMAP. `factory/` is workspace state.

**ky-ui's inventory is wrong in two ways.** `consumers.json` still lists `KyForge-Server`, and that repo's own freshness check now lives in an archived repo, so nothing checks it. KyForge is also still in `AGENTS.md`, `PLAN.md`, `README.md`, `scripts/check-suite.mjs` and `test/sync.test.js`. Meanwhile KyDrive and KyPulse both vendor ky-ui but are missing from `consumers.json`, so the freshness job never checks them.

## Recommended shared Appearance contract (ky-ui 0.4.0)

One dependency-free set of files, shipped through the existing sync:

| File | Purpose |
|---|---|
| `src/themes.css` | The catalog. One `:root[data-ky-theme="<id>"]` block per theme with the full `--ky-*` set (including `panel-hover`), plus `[data-ky-preview="<id>"]` preview variables. |
| `src/appearance.css` | Card grid, card and state styles. |
| `src/appearance.js` | `bindAppearance(fieldset, {key, decode, encode})` and `renderAppearance(el)` (renders the markup with DOM APIs, no `innerHTML`). |
| `src/theme-boot.js` | A classic, blocking `<script src=… data-ky-key=…>` for the head, so the saved theme applies before first paint without inline script. |
| Generated `themes.js` / `.d.ts` | `{id, name, scheme}` for each theme, so React and Go code render from the same data. |

**Markup**, identical whether React renders it, a Go template renders it, or `renderAppearance` builds it:

```html
<fieldset class="ky-appearance"><legend>Theme</legend>
 <p>Applies straight away. Saved in this browser only.</p>
 <div class="ky-appearance-grid">
  <label class="ky-theme-card">
   <span class="ky-theme-preview" data-ky-preview="ocean" aria-hidden="true"><i></i><i></i></span>
   <input type="radio" name="ky-theme" value="ocean" data-scheme="dark">
   <span class="ky-theme-name">Ocean</span> <span class="ky-theme-kind">Dark</span>
  </label> …
```

**Behaviour:**
- **Keyboard:** native radio-group semantics. Tab enters the group at the checked card and arrow keys move between cards. Choosing applies and saves at once.
- **OS-follow:** a first "Match system" card is checked while nothing is saved. Choosing it removes the saved key, so the page follows the OS again.
- **Saved choices:** each product keeps its storage key. Its adapter's `decode`/`encode` maps existing stored values to catalog ids: names like `"Ocean"`, ids like `patina`, and KyRecovery's `light`/`dark`.
- **Other tabs:** the existing `watchChoice` handles changes in other tabs and OS changes.

**Selected state without relying on colour:**
- The native radio stays visible, styled with `accent-color: var(--ky-accent)`.
- The checked card also gets a 2px accent ring drawn with an inset `box-shadow`, so the layout doesn't shift.
- Focus is `:has(input:focus-visible)` with the shared 2px outline and 2px offset.
- Forced-colors mode uses the system radio and `Highlight`.

**Layout:**
- Flat: a 1px `--ky-line` border, an 8px radius, `--ky-panel`, and no shadow or card-inside-a-card.
- `grid-template-columns: repeat(auto-fill, minmax(10.5rem, 1fr))`, capped at about 64rem: roughly five columns on desktop and two at 390px.
- A light preview gets a hairline border so it still reads on a light panel.

**CSP:** no `style=` attributes, because preview colours come from `themes.css`. All scripts are same-origin, so the picker works under KyNotes' strict `style-src 'self'`.

**Placement:** an "Appearance" page or Settings section reachable by every signed-in role, with a page `h1`. On a dedicated page the fieldset legend can be visually hidden.

**Element:** stays stock. Generate its `custom_themes` from the catalog and add a test that compares the values, replacing today's hand-copied colours. Element's own Appearance setting stays as Element ships it.

## Decisions for you

1. **Catalog.** Ship all 21 themes, or retire the four themes only the base family has (Cyber Dark, Nord Slate, Paper Clean, OLED Black) by mapping them to suite themes? I recommend all 21 now: no saved choice breaks, and you can prune later. The base family's `patina` already uses Patina Ky's colours.
2. **One picker per app.** Remove the duplicate sidebar, Login and admin selects in Calendar, Messages, Drive, Pulse and Base, and KyPost's admin `<select>`. Removing a control changes behaviour, so I need your yes. Calendar and Drive currently offer the Settings picker only to admins, so they each need an Appearance page everyone can reach.
3. **Add the "Match system" card?** It is the one addition to your screenshot's look. I recommend it; without it, OS-follow can't be restored after a save.
4. **Element themes.** Keep the two Busnes themes (recommended), or expose the whole catalog in Element too?

## Rollout groups

| Group | Repos | Scope |
|---|---|---|
| **G0** | ky-ui → 0.4.0 | The files above, browser-fixture tests, `consumers.json` (remove KyForge, add KyDrive-server and KyPulse-server), and the KyForge doc and script cleanup. Named themes get `panel-hover`, which fixes the hover bug KyPost reported upstream. |
| **G1 (this pass)** | KyPost, KyCalendar, KyMessages | Replace the pickers. MemberHome needs a reachable Appearance too. |
| **G2** | KyIdentity, KyYard, KyNotes | 0.2.0 → 0.4.0. KyIdentity moves to radios; KyYard drops its hand-copied palettes; KyNotes' select becomes cards. |
| **G3** | ky-server-base, then KyDrive and KyPulse | The base family: three selects and the 8-theme catalog. Base goes first so new servers inherit the picker. |
| **G4** | KyDNS, KyRecovery | Go-rendered pages using `renderAppearance` or a server-rendered fieldset. First, CSP hardening as separate security PRs: KyDNS gets a full policy; KyRecovery moves its `onclick=` handlers into JS so `'unsafe-inline'` can go. |

## Checks per app (from each `AGENTS.md`)

- **Every consumer:** `node <ky-ui path>/check-vendor.mjs`.
- **KyPost:** in `frontend/`, `npm run build && npm run typecheck && npm ci --prefix lint && npm run lint && npm test`. `pages/read/readability.test.tsx` must pass for every theme.
- **Calendar, Messages, Yard, Pulse, Base:** `make ci`, then `npm run build` with `web/dist` committed. For browser tests, `go build -o .browser/server ./cmd/server` followed by `npm run test:browser` (Messages also installs Firefox). Pulse and Base also repeat the race suites with `GODEBUG=fips140=on`.
- **Drive:** `npm ci && npm test && npm run build` (dist is not committed), browser tests, `go test -race ./...` with restic on the PATH, and `scripts/smoke-test.sh`.
- **Identity:** in `web/`, `npm run build`, `git diff --exit-code -- dist`, `npm test`.
- **Notes:** `npm test --prefix web && npm run build --prefix web && diff -qr web/dist internal/web/dist`, then `npm run e2e`.
- **DNS:** `make test`, `go vet ./...`, `go test -race ./...`.
- **Recovery:** `go test -race -count=1 ./...`, `node scripts/test-overview.mjs`, `node scripts/check-contrast.mjs`, plus the wasm build and diff.

## Scratch servers (none bypass auth)

- **KyPost:** `npm run dev` proxies to :5866. The council setup used :5596 with the `kypost-demo-IMAP` fixture; its exact launch command isn't recorded.
- **Calendar:** `make run`. Council setup: `KY_PORT=5597 KY_DB_DRIVER=sqlite KY_CAPTCHA_PROVIDER=none`, with `init-admin` and `create-user` reading the password on stdin.
- **Messages:** `KY_HOST=127.0.0.1 ./kymessages`, with `KY_ADMIN_PASSWORD` read silently. MemberHome can only be reached through KyIdentity SSO, so it can't be seeded locally.
- **Yard:** `make run` on :9273.
- **Base, Drive, Pulse:** `make run` on :8080 (Pulse binds loopback only in development).
- **Notes:** `web/e2e/server.sh` on 127.0.0.1:18080 with a throwaway data directory.
- **Identity, DNS, Recovery: unverified.**
  - Identity: Go on :5867 with `KYIDENTITY_DB_PATH`, `BOOTSTRAP_ADMIN_*` and Vite.
  - DNS: `go run ./cmd/kydns serve --config <tmp.yaml>`, admin on 127.0.0.1:8053.
  - Recovery: `go run ./cmd/kyrecovery serve --port 8095 --data-dir <tmp>`.
- **Vite:** every React app's Vite dev server runs on :5173.

## Biggest gaps against the design contract, beyond the picker

Source-based, not visual ratings.

- **Post:** contrast between danger and accent, and the Compose, Contacts and Reader issues the council already recorded.
- **Calendar:** the theme select dominates the phone header; empty and error states are thin.
- **Messages:** two theme selects on the Settings page; the forced change-password page has no brand.
- **Identity:** letter-spaced mono labels, a 248px gradient sidebar, 6px buttons, no destructive button style.
- **Notes:** eyebrows everywhere, h1 at 42–68px, shadowed cards, every button filled accent, no sign-out in the account region.
- **Yard, Base, Pulse:** every button filled accent, a gradient sidebar, `.dr-fact-label`, many inline styles. Base turns off the input focus outline.
- **Drive:** sign-out in danger colour; uppercase labels.
- **DNS:** the wordmark is the page's `h1` (titles are `h2`); shadowed `.card`s; no signed-in name.
- **Recovery:** the furthest from the contract: no self-hosted Space Grotesk, a serif/brass palette, horizontal tabs instead of a sidebar, an `h1` only on Overview.

## Source paths

- **ky-ui:** `ky-ui/src/{tokens.css,navigation.css,theme.js}`, `scripts/sync-consumers.mjs`, `consumers.json`, `browser/fixture.html`.
- **Theme adapters:** `kypost-server/frontend/src/theme.ts`, `KyIdentity-server/web/src/theme.ts`, `kynotes-server/web/src/theme.ts`, `KyYard-Server/web/src/theme.ts`, `ky_server_base/web/src/theme.ts` (and the same path in Calendar, Messages, Drive and Pulse), `kydns-server/internal/web/static/theme.js`, `kyrecovery-server/internal/server/static/js/theme.js`.
- **Pickers:** listed in the inventory table.
- **CSP:** `kypost-server/backend/internal/api/security_headers.go:38`, `KyIdentity-server/internal/api/middleware.go:244`, `kynotes-server/internal/web/embed.go:25`, `kydns-server/internal/web/middleware.go:207`, `kyrecovery-server/internal/server/server.go:227`. The base family sets its CSP in `internal/api/server.go`.
