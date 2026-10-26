# KyMessages staged redesign: implementation notes

Implementation sub-agent: Claude Opus 5.5. These notes describe work in progress, updated as each stage lands. They contain no scores: a target score is not an achieved score, and scoring belongs to a separate Rate pass.

## Source and conditions (all stages)

- Worktree `KyMessage-Server/.claude/worktrees/ui-cohesion`, branch `ui/council-cohesion`, HEAD `0514749` (= `origin/master`). The parent's uncommitted ky-ui 0.3.0 vendor sync (`web/src/ky-ui/VERSION`, `tokens.css`) is part of every capture, the baseline included. Nothing is committed or pushed.
- Each stage manifest (`screenshots/kymessages-<nn>-<phase>-manifest.json`) records HEAD, the SHA-256 and size of `git diff HEAD -- web/src`, the changed files, the server binary hash, the browser, and each image's hash and measured horizontal overflow. `kymessages-<nn>-after-web-src.patch` is that exact patch.
- Every capture uses a fresh build: `npm run build` (Node 26.12.1, npm cache default), then `go build -o .browser/server ./cmd/server`. A disposable server runs on `127.0.0.1:5598` with a `mkdtemp` SQLite data dir, `KY_APP_URL` equal to the origin, and `KY_CAPTCHA_PROVIDER=none` (as in the browser harness). Matrix is not configured.
- `init-admin` reads a random password from stdin. Login and the forced "Change your password" screen are captured with that password. The driver then replaces it through the real `/api/auth/login` → `/api/auth/change-password` flow (CSRF header), and every other capture signs in with the new one. Passwords exist only in the driver's memory. Nothing bypasses auth, CSRF, CSP or the service worker, and no response is mocked. The server is stopped and its data dir deleted at the end of each run.
- Playwright 1.63.0 (from `web/node_modules`), headless Chromium 153.0.8010.12. Each viewport and theme gets a fresh context. The theme is chosen in the product's own "Color theme" select, and the context's `colorScheme` matches. Viewports are 1280×900 (desktop) and 390×844 (phone), both Busnes Light and Busnes Dark, in America/Chicago, en-US. Images are viewport-only unless the name ends in `-full`. In `-full` captures the sticky desktop sidebar renders partway down the page; that is a full-page screenshot artifact.
- Scratch drivers live outside the repository: `/tmp/ky-msg-cohesion/capture.mjs`, `checks.mjs` and `rebuild.sh`.
- `kymessages-<nn>-<phase>-checks.json` holds in-page measurements for every non-full capture:
  - **Focus walk:** up to 80 Tab presses, recording each stop's computed outline or box shadow.
  - **Text contrast:** WCAG ratio against the composited background for every visible element with its own text. Disabled controls are skipped.
  - **Control borders:** ratio of each unfilled control's border against its surroundings. Transparent borders count as no border.
  - **Control heights** and **h1 size and weight.**
  - **Horizontal overflow.**

  These are computed-style measurements on the captured states, not a full accessibility audit.

## Stage 00: baseline (before)

- 52 images (`kymessages-00-before-*`, manifest, checks) of login, change-password, overview, users, agents, rooms, health, audit, scim, backup and settings. Patch `bf4488696bae5def…` (the 0.3.0 sync only), binary `4235daa8…`.
- The previous `kymessages-00-before-{overview,settings}-*` files in this worktree were the e829b9e baseline at 1440×1000. This run replaced them under the same names. The e829b9e originals are still in the ky-ui main checkout at `ky-ui/reviews/2026-10-26-council/screenshots/` (`kymessages-00-before-overview-desktop-light.png` SHA-256 `f3de6925…`). `council.html` links those names, so in this worktree it now shows the fresh baseline.
- Measured baseline defects (from `kymessages-00-before-checks.json`):
  - Control borders are 1.56:1 (light) and 2.05:1 (dark) against a 3:1 target.
  - Inputs, selects and non-navigation buttons have no 2px focus indicator. Inputs used `outline: none`.
  - Controls are 32–38px tall.
  - Page titles are 28px/700 (Overview) and 32px/700 (change password); the others are 24px/700.
  - Text contrast passes everywhere: minimum 4.77:1 light, 5.24:1 dark.
- Visible baseline issues:
  - Settings and Backup show several filled-orange actions per view. Disabled actions are faded orange.
  - Orange icons decorate titles and section headings.
  - Boxes are nested: the Settings driver box, Backup fact cards and panels.
  - Labels are uppercase and letter-spaced.
  - On phones, the sticky header takes about 170px.
- No overflow on any capture.

## Stage 01: shell and foundations

Before: 26 images (`kymessages-01-before-*`; login, overview, users, backup, settings), from the same revision as stage 00. After: 28 images (`kymessages-01-after-*`). The difference is the `-full` captures, which are taken only when the page is taller than the viewport. Patch `2c4fb04a…`, 30,713 bytes. Binary `f2b37832…`.

Changes:

- **Sidebar.** Width is `--ky-sidebar-size` (240px). Nav rows are 40px with 14px/500 type and the 8px control radius. The wordmark is 17px/700 beside the 28px stamp. These are the same values as KyCalendar's shell, which uses the same ky_server_base class names.
- **Account region.** It is pinned below the navigation and shows the name, then the role ("Administrator" or "Everyday account"; the line is hidden when it repeats the name), then a labelled "Sign out" ghost row. Sign out was a red icon-only button. Theme selection stays where it was.
- **Phones.** The brand and account controls share one row, and the navigation scrolls sideways under them. The header is about 96px instead of about 170px. Navigation order, labels and the selected-page rail are unchanged.
- **Titles and page frame.** Every page title is `h1` 24px/600 in `--ink-strong`. Overview, SCIM and Settings now use the shared `dr-page` / `dr-header` frame: 32px padding, the title on the left, its action on the right and the subtitle below. The orange title icons on SCIM and Settings are removed. `MemberHome`'s account name is now its page `h1` (it was an `h2`, so the page had no `h1`).
- **Account security.** It is passed into Settings as children, so it shares the page frame. Before, `App.tsx` rendered it as a separately padded sibling.
- **Foundations.**
  - Body text is 15px/1.5, with a global 2px accent `:focus-visible` ring at 2px offset.
  - Buttons and fields are 40px tall with an 8px radius.
  - Fields use `--ky-field-border` and a panel background.
  - The button vocabulary matches KyCalendar: a bare button is primary, `.btn-secondary` is an ink outline, `.btn-ghost` is text, and `.btn-danger` is a danger outline (it was a red fill).
  - A disabled button is a neutral `--panel-hover` fill, no longer a faded primary.
  - Checkboxes and radios keep their native size.

Measured after (`kymessages-01-after-checks.json`, 20 states):

- No focus stop without an indicator. The ring measures 4.93:1 (light) and 6.47:1 (dark) on the page background.
- Minimum control border 3.38:1 (light) and 4.78:1 (dark).
- No control under 40px.
- Every console `h1` is 24px/600. The login `h1` is still 700; that is stage 03.
- Text minimum is unchanged (4.77:1). No overflow.

One bounded verify round:

- The first after-capture showed four defects:
  - Overview's subtitle sat beside the title.
  - The phone wordmark wrapped to "KyMessage/s".
  - Account security fell outside the new frame.
  - The bootstrap admin read "Administrator / Administrator".
- All four were fixed in one batch and confirmed by one recapture.
- The checks' Sign-out "border failure" was the ghost button's transparent border. The check now skips transparent borders.

Tests: `tsc -b` is clean and vitest passes 153 tests, including a new AppHeader test for the name and role line.

Left for later stages:

- **Stage 02:** the Overview action text is 12px, warning alerts use the accent, and the Backup fact cards use uppercase labels.
- **Stage 03:** the Settings and Backup forms still show several filled primaries per view, and the Settings driver box is still nested.

## Stage 02: task views

Before: 36 images (`kymessages-02-before-*`; overview, users, agents, rooms, health, audit, scim, backup), from the stage-01 source (patch `2c4fb04a…`). After: 38 images (`kymessages-02-after-*`).

The source is `kymessages-02-after-web-src.patch` (`6b1e7f46…`, 49,898 bytes; it includes the new untracked `ChatNotSetUp.tsx`). The 02-after manifest's `web_src_patch_sha256` (`2ac4ab2c…`) covers tracked files only. From stage 03 on, the manifest hashes the same full patch. Binary `f368212b…`.

With Matrix off, Users, Agents and Rooms show only their unconfigured state. The Matrix-on tables, detail panels and dialogs could not be captured without a Matrix stack. They use the same `console-table`, `panel` and button classes, so they are affected but unverified visually.

Changes:

- **Tables (`console-table`, now also SCIM).**
  - Headers are 13px/600 sentence case, no longer uppercase and letter-spaced, over a `--line-strong` rule.
  - Cells are 14px, mono cells 13px.
  - Words wrap whole (`overflow-wrap: break-word`, was `anywhere`). Audit had broken "admi/n", "sessio/n" and "auth.password_change/d".
  - SCIM's inline one-off table, heading and paragraph styles are replaced by the shared classes. Read-only fields such as the SCIM base URL use the `--panel-hover` fill.
- **Facts (Health, Backup).** Labels are 14px/600 sentence case. Cards use the control radius and 16px padding. "No recorded backup attempts." now has the hint style (its `text-muted` class did not exist).
- **Status.**
  - Badges are pills outlined in their own status color, with a 10% tint mixed from the theme's `--success`/`--danger`. The tints were hard-coded rgba values.
  - The database driver badge is neutral, no longer accent.
  - Alerts have an ink-strong body (error and success keep their status text), a 3px status edge, and the icon in the status color.
  - Warnings use `--warning`, not the orange accent.
- **Hints and sections.**
  - `.dr-hint` is normal text flow, so inline `<code>` and icons stay in the sentence.
  - Section headings are 17px/600, with icons in ink, not accent.
  - Panels have 24px padding and the 8px radius.
- **Overview.** Row actions are 14px; they were 12px.
- **Health.** The Network path list has bullets inside the panel and an even rhythm.
- **Empty states.** Users, Agents and Rooms with Matrix off keep the tested sentence "Chat (Matrix) is not set up on this server." and add the next step, "Set it up with `matrix-init` and the Matrix Compose overlay, as docs/CHAT-SETUP.md describes." (The pointer was checked against `docs/CHAT-SETUP.md`.) This is a shared `ChatNotSetUp` component, between rules.

Measured after (`kymessages-02-after-checks.json`, 32 states):

- No focus stop without an indicator. No text below 4.5:1: minimum 4.99:1 light, 5.11:1 dark.
- Control borders at least 3.38:1 light and 4.78:1 dark (5.28:1 on the Overview's dark rows).
- No control under 40px. Every `h1` is 24px/600. No overflow.

One bounded verify round:

- The first after-capture showed `.dr-hint`'s flex layout splitting sentences around inline code (the Users/Agents/Rooms hint, SCIM's token sentence, Backup's "Local copies" icon), and no gap under the SCIM URL field.
- Both were fixed in one batch and confirmed by one recapture.

Tests: `tsc -b` is clean and vitest passes 153 tests.

Still open:

- Backup still shows three filled primaries in one view (Back up now, Pair, Pin key) — stage 03.
- At 1280px, Audit's date column wraps to two lines.

## Stage 03: forms, settings and sign-in

Before: 24 images (`kymessages-03-before-*`; login, change-password, settings, backup), from the stage-02 source (patch `6b1e7f46…`). After: 24 images (`kymessages-03-after-*`). Patch `kymessages-03-after-web-src.patch` `51231a71…`, 70,907 bytes; the manifest hashes the same full patch. Binary `7c02dd8a…`.

Changes:

- **Settings is one flat surface.**
  - Database, Appearance, Branding, (Sync, Federation, Notes with Matrix on) and Account security are sections divided by rules (`.dr-settings`). Before, they were a two-column grid of bordered cards.
  - The driver no longer sits in a box inside a card: it is a plain "Active storage driver" row with a neutral badge.
  - The Appearance text was "Color tokens: Patina Ky (`#0d0f14`/`#4deeea`), …", which rendered the backticks literally. It now says what the select does, per `web/AGENTS.md`: Busnes follows the device until a theme is chosen, and the choice stays in this browser.
  - The subtitle no longer claims "color theme defaults".
  - The title "System Settings & Architecture" is unchanged, because the browser suite asserts it. Matching it to the nav label "Settings & DB" is an owner copy choice.
- **One primary per view.**
  - Settings: Save name is primary. Upload logo and Set up two-factor sign-in are secondary.
  - Backup: Back up now is primary. Pair, Pin key and Save schedule are secondary. Pin key keeps its `window.confirm`.
- **Sign-in and forced password change.**
  - Inline styles are replaced by shared `auth-*` classes.
  - The orange-tinted logo box is removed. A hairline ring keeps the dark stamp legible on charcoal; the same ring applies in the sidebar.
  - The title is 24px/600.
  - The error box is the shared `dr-alert-error`.
  - The captcha status is a plain status line, no longer a bordered box inside the card.
  - The SSO key icon is ink, not accent.
  - The MFA recovery toggle is a ghost button.
  - On change-password, labels sit above spaced fields and the error summary moves above the fields.
  - On phones the card sits near the top.
- **File picker.** The native picker button is styled as a secondary control.
- **Phones.** Panels have 16px padding.

Measured after (`kymessages-03-after-checks.json`, 16 states):

- No focus stop without an indicator.
- Text minimum 4.99:1 light, 5.11:1 dark.
- Control borders at least 3.38:1 light and 4.78:1 dark.
- No control under 40px. Every `h1` is 24px/600, sign-in included. No overflow.

One bounded verify round:

- The first after-capture showed two defects: the dark stamp tile disappeared on charcoal, and 24px panel padding squeezed the phone Backup forms.
- Both were fixed in one batch and confirmed by one recapture.

## Final full set (`kymessages-00-after-*`)

54 images of the same 11 surfaces as the baseline, plus manifest and checks. The source and binary are identical to stage 03 (patch `51231a71…`, binary `7c02dd8a…`).

Across all 44 measured states:

- No focus stop without an indicator. No text below 4.5:1. Every control border is at least 3:1 and every control at least 40px.
- Every `h1` is 24px/600. No horizontal overflow.

These cover only the states captured. In particular they do not cover the Matrix-on tables, the Agents token dialog, the Rooms confirms, the 2FA enrollment form or MemberHome.

## Not captured: MemberHome and Element chat

Both cohorts are `N/A` for KyMessages. They are not zero, and no rating is inferred.

- **MemberHome.**
  - A member exists only after KyIdentity SSO sign-in. There is no create-user route, and writing a member row would be fabricated state.
  - The matrix-acceptance harness never configures console SSO. It registers only the MAS client in KyIdentity (`scripts/matrix-acceptance.sh:301`), and `KY_KYIDENTITY_CLIENT_ID`/`_SECRET` are unset (`docker-compose.yml:57-58`).
  - KyIdentity generates client secrets itself. A capture therefore needs one of two things:
    - a harness change: register a second confidential client with redirect `https://admin.kymatrix.test/api/sso/kyidentity/callback` before `dc up -d app`, pass its ID and secret to the app, and give bob access; or
    - a separate disposable KyIdentity with an admin-registered client.

    Either is a scope decision for the owner.
  - The MemberHome source changes (the `h1`, the shared tokens and buttons) are covered by `MemberHome.test.tsx` but are not visually verified.
- **Element.**
  - The harness has stock Element with alice and bob signed in and encrypted messages after step `prove` (`e2e.mjs:185-230`).
  - `MATRIX_ACCEPT_STOP_AFTER` exits at the next step, and the EXIT trap runs `down -v` and deletes the scratch directory and profiles (`matrix-acceptance.sh:103-131`). There is no keep or hook option.
  - So a capture means racing a full, roughly 10-minute run of 8+ containers while it reuses alice's profile, or adding a hold option to the harness. The first risks corrupting the harness's own assertions; the second is a scope decision. Neither was done.
  - Element's Busnes themes come from `custom_themes` in `element.json.tmpl`. Element's device-level `use_system_theme` starts on its built-in themes until a user unticks it in Settings › Appearance (`internal/matrixinit/AGENTS.md`).
  - Element was not changed.

## Checks on the final source (patch `51231a71…`)

| Check | Result |
|---|---|
| `node src/ky-ui/check-vendor.mjs` | pass (ky-ui 0.3.0) |
| `npm test` | pass, 21 files and 153 tests |
| `tsc -b` + `npm run build` | pass. `web/dist` is rebuilt (uncommitted) from this source. |
| `npm audit --audit-level=high` | 0 vulnerabilities |
| `make ci`: `tidy-check`, `lint` (gofmt, vet, compose checks), `test-race` (coverage 76.4%), `test-web` | pass |
| `make ci`: `smoke` | Failed on the default port 18080: another session's `kynotes-server` was listening there, so every HTTP check hit the wrong server. That server was left running. Rerun as `KY_SMOKE_PORT=18097 make smoke`: pass, 85 checks. |
| `npm run test:browser` after `go build -o .browser/server ./cmd/server` | pass, 7 of 7 (Chromium light/dark × 390/1280, Firefox light-1280 and dark-390, captcha-pow) on 5391/5392 |
| `make matrix-acceptance`, `make test-postgres` | Not run. Both are outside `make ci`, and no backend behavior changed. |

## Stage 05: usability refinement after the acceptance review

This stage responds to `implemented-post-messages-review.md`: Audit on phones, the selected navigation row in Busnes Light, Health and Backup status colour, and the Overview alignment. The stage also captured loading and error states. It is one bounded round: one before capture, one batch of fixes, one after capture, one confirming recapture. These notes contain no scores.

### Source and capture

- **Before.** 46 images (`kymessages-05-before-*`), with a manifest and `kymessages-05-before-checks.json`. Source patch `kymessages-05-before-web-src.patch`: `0bf4960c…`, 71,769 bytes. It is the stage 03 source plus the parent's ky-ui 0.3.0 navigation sync. Binary `96f6cb92…`.
- **After.** 46 images (`kymessages-05-after-*`), with a manifest and checks. Source patch `kymessages-05-after-web-src.patch`: `88d488e8…`, 93,154 bytes. The final source hashes to the same value. Binary `18a031e2…`.
- **Browser.** Chromium 153.0.8010.12.
- **Driver.** `/tmp/ky-msg-cohesion/capture05.mjs` (via `rebuild05.sh`), with the same server, sign-in, theme selection and viewports as earlier stages.
- **Fixture.** Real API calls only:
  - one refused sign-in (wrong password), then the forced password change;
  - pass A, all four contexts: Overview, Health and Backup, with no key and `KY_BACKUP_DIR` set;
  - then `/api/backup/pin-key` with the repository's test key (`internal/backup/testdata/pairing-v050.json`, 2 of 3) and one `/api/backup/deposit`;
  - pass B: Backup with one copy written, and Audit.
- **Observed.** The refused sign-in writes no audit record. This is server behaviour and was not changed.
- **States, from real transport conditions with no response mocked:**
  - `health-loading`: 2500 ms CDP latency, request in flight;
  - `health-offline` and `overview-offline`: Playwright `context.setOffline(true)`.
- **Pointer.** Navigation captures leave the pointer on the clicked row, so the hover state is included. Loading and offline captures move it to (0, 0) and wait 300 ms for the 150 ms background transition.
- **Surface names:** `overview`, `health`, `backup-empty`, `backup-written`, `audit`, `health-loading`, `health-offline`, `overview-offline`. Each is 1280×900 and 390×844, Busnes Light and Dark, with `-full` captures where the page is taller than the viewport.

### Measured before (`kymessages-05-before-checks.json`)

- **Selected navigation, Light.** Under the pointer the selected row is `rgb(242,239,231)`, the sidebar colour itself. The shared hover rule (0,4,0) outranks the shared selected rule (0,3,0), and Busnes Light's `--panel-hover` equals `--ky-sidebar-start`. Without hover the row is `#fbf0ec`, about 1.02:1 against the sidebar. In Dark the hovered selection is `#2b383a`, also the hover colour.
- **Audit.** 20 cells clipped behind 413 px of sideways scroll at 1280px. 55–65 cells clipped behind 1015 px on phones. The date wraps to 2–3 lines.
- **Overview.** Status text starts at x 544, 546 and 517. Action buttons are 147, 139 and 230 px wide.
- **Backup.** "0 of 7" and "Daily" are `badge-success`, while no key is pinned and the schedule cannot run. The hint read "that takes k custodian cards".
- **Health.** Warn and Pass lines share the body ink, with no icon.
- **Offline.** Errors read the raw "Failed to fetch". While loading, Health shows nothing where the components go.

### Changes (`web/src` only; no API, handler, role, CSP, security or theme change)

- **Navigation (`theme.css`).**
  - In Busnes Light only, `.app-header` aliases `--accent-soft` to `--panel` (white) and `--panel-hover` to 7% ink over the sidebar.
  - `.app-nav [class].ky-nav-item[aria-current="page"]:hover` keeps the selected surface. The rail and all shared ky-ui files are unchanged (`check-vendor` passes).
  - Named themes and Busnes Dark use their own tokens.
  - The hover-outranks-selected order is a shared ky-ui rule. An upstream fix there would cover every consumer.
- **Phone navigation (`AppHeader.tsx`).** The current page's chip is scrolled into view (`nearest`) when the page changes. Overview links reach pages whose chip starts off-screen.
- **Audit (`Audit.tsx`, `theme.css`).**
  - **Desktop:** the date stays on one line, and Target and Details may break anywhere.
  - **Below 720px:** each record is a block. The date comes first, then Who, What, Target, Outcome, Details and IP as labelled lines. The header row stays in the accessibility tree, visually hidden.
  - **Semantics:** explicit `table`, `rowgroup`, `row`, `columnheader` and `cell` roles keep table semantics where `display` changes drop them. The label is `content: attr(data-label) / ""`, with a plain `attr()` fallback, so it stays out of the cell's name.
- **Health.**
  - `NetworkCheck` lines are `dr-check` items with a CheckCircle2 or AlertTriangle icon, in `--success` or `--warning`. The "Pass:"/"Warn:" text is unchanged.
  - Until the first report arrives, Health shows "Checking components…" (`role="status"`).
- **Backup.**
  - **Local copies:** Off, then Error (`local_error`), then Unknown (no copy list), then `n of keep`. Only n > 0 is success.
  - **Schedule:** success only when backups can run. Otherwise the badge is neutral and the value reads "Idle until a key is pinned" or "Idle until capsules have a destination". Danger stays for Manual only.
  - "the custodian cards" replaces the literal "k".
- **Overview.** `.operator-summary` is the grid, and rows use `subgrid`. Status text shares one column, and the actions share the widest action's width. The ≤1000px and ≤600px layouts are kept.
- **Errors (`api.ts`).**
  - `errorText` turns a fetch `TypeError` ("Failed to fetch", "NetworkError…", "Load failed") into "<what failed>: the server could not be reached. Check the connection and try again." It replaces identical local helpers in Users, Rooms, Agents and Backup, and is used by Health and Audit.
  - Overview says "Unavailable: the server could not be reached".
- **Tests.** Health covers the transport failure. Backup checks the empty directory and idle schedule are not success. NetworkCheck checks the warn line tone.

### Measured after (`kymessages-05-after-checks.json`, 20 online states plus 12 state captures)

- **Selected navigation, Light.** `rgb(255,255,255)` while hovered, against the `#f2efe7` sidebar (about 1.15:1), plus the 3px accent rail. Dark: `#2b2622` (`--ky-accent-soft`) while hovered.
- **Audit.** 0 clipped and 0 hidden cells, and 0 px of table scroll, at both sizes. The date is on one line on desktop.
- **Overview.** Status at x 517 on every row, including the four offline rows. Desktop buttons are all 230 px.
- **Backup.** The empty directory shows "0 of 7" as `dr-badge-muted`. After one deposit it shows "1 of 7" as `badge-success`.
- **Health.** Warn lines are `rgb(135,91,18)` (Light) and `rgb(216,166,87)` (Dark), each with an icon.
- **Whole pages.** No focus stop without an indicator. Minimum text contrast 4.99:1, minimum control border 3.38:1, no control under 40 px, no horizontal overflow.
- **Focus stops.** Per surface they match before, except Audit (7 to 6): the sideways-scrolling table wrapper was a keyboard-focusable scroller and no longer scrolls.

### Behaviour checks (`/tmp/ky-msg-cohesion/keyboard05.mjs`)

Run on a separate disposable server on 5598. Output is in `kymessages-05-after-keyboard-chromium.json` and `kymessages-05-after-keyboard-firefox.json`.

- At 1280 and 390, in Chromium and Firefox:
  - Tab from Health then Enter selects Audit (`aria-current="page"`).
  - After the Audit heading, the only focus stop is the Kind select; the pager is disabled at 13 records, and there is no scroller stop.
  - The Audit region exposes `table`, `row` and `cell` roles. The What cell's accessible name is `auth.login`, not "What auth.login".
  - On phones, Overview › Open Backup & recovery leaves the Backup chip fully inside the navigation strip.
- WebKit could not launch: the host is missing `libicu74`, `libxml2` and `libflite1`, and installing them needs sudo. WebKit table semantics are **unproven**.

### Checks (final source)

- `npx tsc -b` is clean. Vitest passes 155/155 (153 before plus 2 new tests; the NetworkCheck test was tightened).
- `node src/ky-ui/check-vendor.mjs`: ky-ui 0.3.0 verified.
- `npm run test:browser`: 7/7 (Chromium 390/1280 light and dark, Firefox light-1280 and dark-390, proof-of-work captcha), on 5391/5392.
- `make ci` exits 0:
  - tidy-check;
  - gofmt and vet, plus the compose checks;
  - `go test -race` (76.4% coverage);
  - `npm ci`, with 0 vulnerabilities, and 155 tests;
  - smoke, all checks passed (85 `[ok]`).
- `npm run build` twice gives identical `web/dist` hashes. The dist differs from HEAD only by the content-hashed asset rename.
- **Not run:** `make matrix-acceptance`, `make test-postgres`, WebKit.

### Remaining observable gaps

- **Audit on desktop.** The 64-hex key ID and capsule paths in Target break over 5–7 lines, so some rows are tall. Nothing is hidden.
- **Overview offline.** The KyIdentity sync row appears even with Matrix off, because Matrix state is unknown while offline. It says "Unavailable".
- **Health loading** is a status line, not a skeleton.
- **Not captured with Matrix on:** Users, Agents and Rooms tables, the Agents token dialog, Rooms confirmations, 2FA enrolment and SCIM with users. They keep horizontal table scrolling on phones, unverified.
- MemberHome and Element remain `N/A`.
- Named themes were not captured. The Light navigation alias is scoped to `busnes-light`, so they are unchanged in source.

## Stage 06: status-truth correction and complete final capture

This stage is one bounded pass, after an independent reviewer found a correctness blocker in the stage 05 captures:

- **Health:** after an offline "Check again", the earlier report's green Up badges and Pass line stayed visible under the error.
- **Overview:** offline, it added a KyIdentity sync row even with Matrix off.

At the parent's request, the stage also captures the complete console and auth set from the final source, because stages 00–03 predate the stage 05 shell. These notes contain no scores.

### Source and capture

- **Starting point.** The source includes the parent's ky-ui sync: the shared hover rule now uses `:where()`, which puts it below the selected rule's specificity, plus tokens, navigation and `VERSION`. `check-vendor` passes.
- **Driver.** `/tmp/ky-msg-cohesion/capture06.mjs` via `rebuild06.sh <phase> <surfaces>`, with the same server and fixture as stage 05:
  - one refused sign-in;
  - login and forced change-password with the bootstrap password;
  - password replaced through the API;
  - pass A: users, agents, rooms, health, scim, settings, backup-empty;
  - then a real pin-key and one deposit;
  - pass B: overview, audit, backup-written;
  - pass C: health-loading (2500 ms CDP latency), then health-offline and overview-offline (context offline).

  Nothing is mocked.
- **Pointer.** Before every capture the pointer moves to (0, 0), with a 300 ms settle, so no stuck hover appears in phone or desktop images.
- **Phone navigation.** Every manifest row records `current_tab_in_view`. Full-page images are taken before the viewport image's focus walk, because that walk tabs through the navigation and scrolls the phone strip. In the first after capture, 4 phone full-page images (Health, Audit) had the current chip out of view. That was a driver artifact, fixed in the one confirming recapture. In the final set all 78 rows are `true`. The two before `health-*-mobile-*-full` images have the same artifact.
- **Before.** `kymessages-06-before-*`: 22 images of overview, health, health-loading, health-offline and overview-offline, plus manifest and checks. Patch `kymessages-06-before-web-src.patch` `018d6e6c…` (93,314 bytes), binary `d6018402…`.
- **After (final).** `kymessages-06-after-*`: 78 images (60 viewport, 18 full-page), plus manifest and checks. Patch `kymessages-06-after-web-src.patch` `a5430c0d…` (96,999 bytes), which equals the final source. Binary `73591be1…`, Chromium 153.0.8010.12.
  - Surfaces: login, change-password, overview, users, agents, rooms, health, audit, scim, backup-empty, backup-written, settings, health-loading, health-offline, overview-offline.
  - Each surface is in Busnes Light and Dark at 1280×900 and 390×844.
  - Full-page images are for below-the-fold content only. The sticky header renders mid-page in them, so score viewport images.

### Changes (`web/src` only)

- **Health (`Health.tsx`).**
  - A failed check clears the report, so component status is unknown, not a stale Up.
  - Check again also remounts `NetworkCheck` (`key`), so its Pass and Warn marks are re-fetched; offline it says "Network check unavailable."
  - Parsing, the DTO boundary and `adminFetch`/auth are unchanged.
- **Overview (`Dashboard.tsx`).** If the sync-status request never reached the server, no sync row is added. An HTTP error from a reached server still shows "Unavailable: HTTP n", because a non-404 means the Matrix route answered.
- **Navigation (`theme.css`).** The local selected-under-hover override is removed, now redundant with the shared `:where()` fix. The Busnes Light adapter is kept: `.app-header` sets `--accent-soft` to `--panel`, and hover to 7% ink over the sidebar.
- **Tests.**
  - Health: a successful load, then Check again fails with a transport error. Afterwards no Components region, no "Up", no "Pass:", and the network check is unavailable.
  - Dashboard: transport failure gives three "Unavailable: the server could not be reached" rows and no KyIdentity sync region.
  - Both tests fail against the stage 05 code, which never cleared the report, never re-fetched the network check and always added the sync row.

### Measured

- **Before.** Health offline shows 2 green Up badges and a green Pass line under the error. Overview offline has 4 rows, including KyIdentity sync.
- **After.** Health offline has no component facts, no network marks and an "unavailable" network panel. Overview offline has 3 rows. All 48 online states pass:
  - no focus stop without an indicator;
  - text at least 4.99:1, control borders at least 3.38:1, no control under 40 px;
  - every `h1` is 24px/600;
  - no horizontal overflow.
- **Selected navigation.** `rgb(255,255,255)` in Light and `rgb(43,38,34)` in Dark, measured with the pointer away.

### Checks (final source `a5430c0d…`)

- `npx tsc -b` is clean. Vitest passes 157/157.
- `check-vendor`: ky-ui 0.3.0 verified.
- `npm run test:browser`: 7/7 on 5391/5392, Chromium and Firefox, after checking that no other suite held the ports.
- `KY_SMOKE_PORT=18097 make ci` exits 0:
  - tidy;
  - gofmt and vet, plus the compose checks;
  - race tests at 76.4% coverage;
  - `npm ci`, 0 vulnerabilities, 157 tests;
  - smoke, all checks passed (85 `[ok]`).
- Two `npm run build` runs give identical `web/dist`.
- **Not run:** `make matrix-acceptance`, `make test-postgres`, WebKit (missing host libraries). The stage 05 keyboard and semantics run (`kymessages-05-after-keyboard-*.json`) predates the stage 06 change; Audit source is unchanged since then.

### Remaining observable gaps (not fixed here; no new features)

- **Overview offline.** All three rows repeat "Unavailable: the server could not be reached"; there is no single page-level message.
- **Health after a failed check.** It shows the alert and "Network check unavailable." but no explicit "status unknown" line where the components were.
- **Matrix off.** Users, Agents and Rooms show only the not-set-up empty state. Matrix-on tables, the dialogs, 2FA enrolment and SCIM with users are not captured. Their phone tables still scroll sideways and are unverified.
- **Change password.** The page shows no brand or theme select, unlike sign-in.
- **Page titles.** "System Settings & Architecture" and the SCIM title differ from their navigation labels; the browser suite asserts them.
- **Audit on desktop.** Target column rows can be tall.
- MemberHome and Element remain `N/A`. Named themes were not captured.
