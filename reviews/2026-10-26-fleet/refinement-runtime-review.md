# Fleet visual refinement: independent source and runtime review

Date 2026-10-26. Reviewer: Claude Opus 5.5 (`claude-opus-5-5`), independent review sub-agent. I implemented none of these changes. This review covers source and behaviour at the pinned heads in `refinement-source-inputs.json` only. It gives no screenshot ratings and no scores. The machine-readable record is `refinement-runtime-review.json`, which holds per-file categories, head blob IDs and input hashes. Harness scripts are in `refinement-runtime-review-work/harness/` and outputs in `refinement-runtime-review-work/evidence/`.

## Result: no new medium or blocker

| ID | Sev | Origin | Product | Summary |
|---|---|---|---|---|
| R1 | low | introduced | Identity #169 | A delegated helpdesk viewer sees a "Manage" disclosure on Administrator rows that opens an empty 224×10 px menu |
| R2 | low | introduced, adjacent route | Pulse #50 | The shared `.dr-facts` restyle breaks the **Backup** page's label + status-badge layout. This page was not captured or disclosed |
| R3 | low | introduced, disclosure | Notes #115 | `:not(.secondary)` also restyles 13 pre-existing `.secondary` buttons on surfaces that were not captured. These include the reset-key, discard-edits and forget-device buttons |
| N1 | nit | evidence | Identity | `table-roles.mjs` measures DOM roles through Playwright, not the browser accessibility tree. The claim itself holds in Chromium |
| N2 | nit | introduced | Identity | The native `<details>` menu stays open after Escape, an outside click or a chosen action |
| N3 | nit | introduced | Identity | Phone cell names repeat the generated label ("Account admin") |
| P1 | low | pre-existing pattern | Drive #84 | Keyboard focus on a partly visible item in the phone nav row does not scroll it into view |
| P2 | low | pre-existing (worse at base) | DNS #86 | On short pages the phone nav band stretches: 330 px at head, 402 px at base |

**Authorization:** no new exposure. Identity's 9 handlers, 4 `disabled={busy}` guards and role conditions are equivalent to the base. Pulse's Delete keeps the admin-only guard and its confirm. There is no Go change in any product except DNS's owner merge, which touches CI and docs only.

## Findings

**R1 — Identity `web/src/components/AdminUsers.tsx:296`**
- **Trigger:** a viewer with `{admin:false, helpdesk:true}` opens Users and looks at a row whose role is `admin`. The `<details>` always renders, but every item inside it is gated by `full` or `full || u.role !== 'admin'`.
- **Impact:** a focusable "Manage admin" control opens an empty bordered box. At base this cell was simply empty. No action is exposed.
- **Fix:** render the `<details>` only when `full || u.role !== 'admin'`.
- **Verify:** `node identity.mjs`. Its last check reports `FAIL … actions:0` until this is fixed. In my run the helpdesk access was rewritten client-side on `/api/auth/me`; the server session was a real admin.

**R2 — Pulse `web/src/styles/theme.css:327`, consumer `web/src/pages/Backup.tsx:358-392`**
- **Cause:** the Backup facts render `<div class="dr-fact-label"><span/><Badge/></div>`. The removed `display:flex; justify-content:space-between` placed each badge on the right of its card.
- **Impact at 1280 px:** the badges "None", "Not paired" and "0 of 7" wrap under their labels in the 8rem column, while "Schedule Daily" stays inline. Nothing is lost, and the phone layout is consistent.
- **Disclosure:** the response names KyYard card/facts as consumers, but not Backup.
- **Fix:** keep a wrapping flex row on `.dr-fact-label` (or give Backup its own layout), then capture Backup.
- **Verify:** `node pulse.mjs` (base vs head). The crops are `evidence/pulse-{base,head}-backup-facts-desktop.png`.

**R3 — Notes `web/src/styles.css:81`, `:432`**
- **Affected buttons:**
  - DeviceLink ×6
  - PinnedKeys ×1
  - RecoveryCode "secondary danger" ×3 (reset encryption key flow)
  - UnsentEdits "Discard unsent edits"
  - `main.tsx:569` lock-screen Sign out
  - `main.tsx:3500` "Forget this device & sign out"
  - The error toast changes the same way as the commit toast
- **Change:** all of these go from accent fill to neutral outline. Destructive actions now look like Cancel. They had no danger hue before either.
- **Contrast:** fine, at least 12.67:1 in dark and 16.06:1 in light.
- **Disclosure:** neither the response nor `UI-VERIFICATION.md` mentions these surfaces, and none were captured.
- **Fix:** disclose and capture them, or scope the exclusion to the classes this batch added. Decide whether `secondary danger` should get a danger outline.
- **Verify:** `node notes-css.mjs`. It applies the shipped base and head CSS bundles to markup copied from source; the app itself was not run.

**N1–N3 (Identity)**
- **N1:** `table-roles.mjs` uses `getByRole`/`ariaSnapshot` on synthetic HTML. I confirmed the claim independently on the real app at 390 px with the CDP `Accessibility.getFullAXTree`: table 1, rowgroup 1, row 2, columnheader 6, cell 6, and no LayoutTable fallback. Firefox and WebKit remain **unknown**. Explicit ARIA table roles would remove the dependency on CSS `display`.
- **N2:** Escape leaves the menu open. Enter or Space on the summary closes it, so this is not a keyboard trap.
- **N3:** screen readers announce both the column header and the generated label.

**P1 — Drive `theme.css:503`, `AppHeader.tsx:23`**
- **Trigger:** a 390 px viewport with 16 shared workspaces (appended client-side to the real list), tabbing along the row.
- **Behaviour:** neither Chromium 153 nor Firefox 155 scrolls a focus target that is already partly visible. Odd-numbered long workspace names show about 60 px when focused, and "Recovery" shows 10 px.
- **Impact:** the focused item is never entirely hidden, so this is not a 2.4.11 failure by the letter. The selected destination is revealed and the page does not move, so the new effect works.
- **Status:** I did not measure the base, so I make no regression claim.
- **Fix:** reveal the focused item on `focusin` using the same logic as the selection effect.
- **Verify:** `node drive-focusdebug.mjs`.

**P2 — DNS `app.css:43,320`**
- **Cause:** the grid rows stretch to fill `min-height:100vh`.
- **Impact:** on `/discovered` with no leases, the phone nav band is 330 px at head and 402 px at base, against 113 px on the other pages. The claimed reduction from 203 to 113 px holds only when the page content fills the viewport.
- **Fix:** use `align-content:start` at ≤860 px.
- **Verify:** `node dns-discovered.mjs`.

## Focus confirmations (executed)

**Identity**
- Tab reaches "Manage admin" (17 tabs). Enter opens it, and all **9** actions are Tab-reachable at 1280 and 390 px.
- Edit user opens the form. Delete user shows the same `confirm`, and dismissing it sends no DELETE.
- The brand descriptor (`--ink`) has at least 4.76:1 contrast on the sidebar gradient ends across all 23 choices, in OS light and dark.

**Recovery** (Chromium 153 and Firefox 155, 20/20 checks)
- On phones the popover holds the name, role, SSO pairing, Password and Sign Out.
- Enter opens it and Tab enters it. Escape closes it and returns focus to Account, and an outside click dismisses it.
- Password opens its modal and closes the popover.
- On desktop the controls are inline, the Account button is hidden, and the buttons are Tab-reachable and present in Chromium's AX tree.
- On phones, empty tables hide their headings. A non-empty row and a row+detail pair keep them, and so does Audit with real rows.
- The Replication tab has one `h1`.
- The served CSP equals the unchanged source constant.
- WebKit could not launch on this host (missing system libraries), so **Safari is unknown**.

**DNS** (136/136 checks across 8 shared-shell pages × 1280/390 × Chromium/Firefox)
- Exactly one licence button is visible on each page, and it opens `#about`.
- The current item is in the nav row, the page is not scrolled and focus is unchanged.
- There is no page overflow, no CSP violation and no page error.
- Chart axes are 12 px, and each chart's viewBox width equals its rendered width.
- The owner merge `df2e1f4..595a123` touches only workflows, `AGENTS.md`, `CONTRIBUTING.md` and `ASSURANCE-CASE.md`. There is no Go or `<head>` change.

**Pulse**
- The page header holds only Edit. Delete is the filled `.btn-danger` in Stop watching, with the same confirm.
- A non-admin (mocked role) sees no Edit, no Stop watching and no danger button.
- The back link uses `--ink-strong`, which **resolves G4**.

**Drive** (admin and member, desktop and phone)
- Settings has no theme select. Open Appearance lands on Appearance with the browser-local `ky_theme` still saved, applied and checked. The removed control only ever wrote browser-local state, so no instance-wide value was lost. The login page keeps its select. This **resolves G3**.
- All 21 destinations are Tab-reachable.

**Notes** (static analysis plus the shipped bundle)
- Specificity of the accent rule rose from (0,4,1) to (0,7,1). A scan of the shipped CSS finds no button rule in that band, except the excluded `.new-workspace` and BlockNote selectors that do not match buttons (`bn-add-file-button` is a `<div>`).
- The banners keep `role=status`, their text and their handlers.
- The header Save keeps its handler.
- The phone toggle keeps `aria-expanded`.
- The embedded index sha256 is `1a66f5d20695…` at both `8156280` and `902fda0`.

**Base** (static only; not run in a browser this round)
- The driver, swapping-capability and description copy are retained, and the only action is unchanged.
- `.page-intro` is used identically on Dashboard, SCIM and Settings.

**Dist parity:** the Identity, Notes, Pulse and Base `vite build` outputs are **byte-identical** to the committed dist. All four lockfiles equal the pins.

**Shared ky-ui:** none of the seven vendored directories changed from base to head.
- They are byte-equal to canonical ky-ui `f9fb930` `src/`, at version 0.4.1.
- The generated `themes-browser.js` equals the manifest hash `369588a4…` in all seven.
- The two "DIFF" rows in `evidence/kyui-bytes.txt` come from my script: one compares a generated file and the other a JSON manifest.

## Prior findings

| Finding | Status |
|---|---|
| F1 | Preserved; the rule lines are hash-identical |
| F2 | Preserved; the `<head>` hashes are identical |
| F3 | Pre-existing and unchanged; prevents 9/10 |
| F4 | Preserved; no adapter is in any diff |
| F5 | Unchanged |
| F6 | Unchanged where untouched; DNS and Drive verified at runtime |
| F7 | Rule unchanged; Delete is still `.btn-danger`. Not re-measured |
| G1, G2 | Pre-existing and unchanged |
| G3, G4 | Resolved |
| Prior N1/N2 | Not re-assessed |

## Coverage

All 7 checkouts are at their pinned heads with clean tracked trees. Each base is an ancestor of its head, and each `git diff base..head` equals the listed `changed_paths`.

| Repo | Head | Changed | Runtime source (diff read in full, executed) | Generated (parity) | Docs/test/CI/deps read | Evidence (not runtime) |
|---|---|---|---|---|---|---|
| KyRecovery | `ea4b76e2` | 36 | 2 | – | 2 | 32 |
| KyDNS | `595a1232` | 43 | 5 | – | 6 | 32 |
| KyPulse | `ee5228cd` | 39 | 2 | 4 | 2 | 31 |
| KyDrive | `5d6bb8a0` | 30 | 4 | – | 3 | 23 |
| ky-server-base | `55d70ae2` | 41 | 3 | 3 | 3 | 32 |
| KyIdentity | `3f7f5c04` | 94 | 2 | 4 | 2 | 86 |
| KyNotes | `902fda0c` | 117 | 2 | 10 | 5 | 100 |

Notes' `web/package.json` and lockfile come from the master merge (#106). That upstream dependency bump is **not certified** by this review; the bundle does reproduce from the pinned lock. I did not count truncated output as coverage.

## Executed vs reported

**Executed by me (all fresh):**
- Pins, coverage, ky-ui bytes and invariant scripts.
- 4 dist parity builds.
- Runtime harnesses for Identity, Recovery, DNS, Pulse and Drive.
- The Notes bundle CSS check.

**Build details:**
- Go binaries were built from `git archive` exports of the pinned commits with the persistent Go cache: cached compilation, fresh binaries, `-p=2`, inside 6G capped scopes.
- Vite used each worktree's existing node_modules.
- Drive's first build left an empty `.vite-temp` directory in that worktree's ignored node_modules; the tracked tree stays clean. Later builds used `--configLoader runner` and wrote nothing there. The other four `.vite-temp` directories predate this review.

**Ports:** 5391 (and 5393 for DNS) were free before each run. One server ran at a time, and each was stopped by the harness. No foreign process was touched.

**Reported, not re-executed:**
- The full product suites listed in both responses.
- Current-head CI, which the root owns.
- Relay workers, PostgreSQL suites and govulncheck.

**Unknown:**
- WebKit/Safari behaviour.
- Firefox and WebKit accessibility trees.
- Real helpdesk and member sessions; I used client-side rewrites only.
- Notes and Base running in a browser.
- KyYard facts inside Pulse.
- Data-filled DNS and Recovery tables.
- Drive's base focus behaviour.
- All visual quality questions.

**Reproduce:**
- The harness constants point at `/tmp/claude-refine-review/{src,bin,evidence}`.
- Recreate the exports listed in `EXPORTS.txt` (`harness/export.sh`, `export2.sh`), build them as described above, then run `node <harness>.mjs` from `harness/`.
- I edited no product source, worktree, input, exporter or frozen baseline (`release-scores.json`, `visual-review-inputs-v3.json`, `products/`).
