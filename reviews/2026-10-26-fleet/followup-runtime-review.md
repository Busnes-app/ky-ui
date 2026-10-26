# Fleet follow-up: independent source and runtime confirmation (R1–R3)

Date 2026-10-26. Reviewer: Claude Opus 5.5 (`claude-opus-5-5`), independent review sub-agent. I implemented none of this.

**Scope:**
- Pinned commits only:
  - Identity `08f3147` (base `858eb70`)
  - Pulse `1670187` (base `c306af5`; merged by the owner)
  - Notes `2b6eb25` (base `85dd3e3`; docs only)
- No numerical scores and no reranking. Nothing here moves toward a 9/10 claim, and the supplemental images are not scored.

**Records:**
- Machine record, with input hashes, coverage and per-finding Verify: `followup-runtime-review.json`.
- Harnesses, `EXPORTS.txt` and outputs: `followup-runtime-review-work/`.

## Result: no new medium or blocker

| ID | Sev | Origin | Disposition | Basis |
|---|---|---|---|---|
| R1 | low | introduced #169 | **RESOLVED** (#171) | Before-fails and after-passes with a real delegate. All 9 handlers behave identically at runtime |
| R2 | low | introduced #50 | **RESOLVED** (#51) | All 4 badges on their label line at 1280. All other consumers have identical geometry, including KyYard, now rendered |
| R3 | low | disclosure #115 | **RESOLVED (disclosure)** | All 13 controls and the toast are cited correctly. Real vs modelled vs N/A is labelled honestly. Destructive-outline residual is explicit |
| N1 | nit | evidence | **RESOLVED** | Documentation corrected |
| N2, N3 | nit | introduced #169 | **UNRESOLVED**, recorded limits | Not claimed fixed |
| P1, P2 | low | pre-existing | **UNRESOLVED**, out of scope | – |
| E1 | nit | introduced (root label) | **UNRESOLVED** | `followup-captures.json` labels the Identity after/confirm frames as served from `858eb70` with no caveat |
| E2 | nit | introduced #171 | **UNRESOLVED**, optional | `.users-table td:empty` is broader than its stated intent; no current behaviour change |
| E3 | nit | test coverage | **UNRESOLVED**, optional | Product test does not catch a lost busy guard |

**Prior findings:**
- **F1, F2, F4, F6, F7:** no rule in this round's diffs. Identity changed one phone `td:empty` line, Pulse only the `.dr-facts` hunks, and Notes nothing at runtime. Pulse Delete is still the admin-only `.btn-danger` with its confirm.
- **Palettes:** no token or theme file changed.
- **F3/G1/G2:** untouched; they still block a 9/10.

## R1 Identity: RESOLVED

**Source.** `UserRowActions` (`AdminUsers.tsx:544`) returns `null` when `!full && u.role === 'admin'`. Otherwise it renders the same nine buttons:
- **Handlers:** `act` maps one-to-one to the old call sites (`onManageGroups`, `openEditModal`, `setDelegating`, `handleResetMFA`, `openSessions`, `handleRevokeSessions`, `issueLink(x,false)`, `setOffboarding({id,username})`, `handleDeleteUser`).
- **Busy guards:** the same four `disabled={busy}` guards (Edit, Reset MFA, Revoke, Delete).
- **Role conditions:** the same `full` conditions. The inner `(full || role !== 'admin')` wrapper was dropped; after the early return it is always true.

**Runtime.** `identity.mjs` runs on port 6011 against binaries built from `git archive`. The `helpdesk` account is created and delegated through the Create User form and the delegation editor, with step-up answered in the UI. No client rewrite.
- **Delegate, base:** the admin row has Manage with 0 actions at 1280 and 390, so 2 checks FAIL as expected.
- **Delegate, head:** no Manage on the admin row. Helpdesk and member rows have exactly 5 actions.
- **Full admin:** 9 actions on every row, at base and head.
- **Handler wiring:** as the full admin, I clicked each of the 9 actions on the member row at base and at head. Confirm texts, API requests, `h1` and opened dialogs are **identical** for all 9; Delete, Reset MFA and Revoke stop at their `confirm`.
- **Phone AX tree** (CDP, head, delegate): table 1, columnheader 6, no LayoutTable. The admin row has 5 cells (Account, Display Name, Email, Role, Status); the hidden cell is the last, so nothing shifts.

**Tests.**
- The product test passes 4/4. Removing the guard fails "render no disclosure…" (1/4).
- My scratch busy test passes. Removing `disabled={busy}` from Revoke fails it, but the product test still passes (E3).
- The reported 198/198 was **not** re-run.

**Bundle parity.**
- A fresh `vite build` of `08f3147` is byte-identical to the committed `web/dist` (`7ff014818e3f`), which is the confirm-delegate bundle.
- The same source without the one `.users-table td:empty` line builds to **`a01f5e4c2421`** exactly. Its JS matches apart from the CSS file name, and its CSS lacks only that rule.
- So the admin-after and delegate-after frames come from a build that differs from the final one by that single phone rule. The desktop after-admin frames are unaffected by it. The phone after-admin frames have no empty cells (every row has Manage), so they would render the same under the final build. That last point is inferred from the CSS; it is not a recapture.

**E1 (root evidence label).** In `followup-captures.json`, the `kyidentity-01-after-*` and `01-confirm-delegate` entries say `served_revision: 858eb70` with an empty `caveat`.
- **What was served:** `858eb70` plus an uncommitted diff.
- **Diff hashes:** the manifests' `uncommitted_diff_sha256` cannot be reproduced from the commits, because `git diff HEAD` omitted the then-untracked test file. The bundle hash is the reliable link.
- **Fix:** add a caveat naming `a01f5e4c2421` as "08f3147 bundle minus the phone `td:empty` rule (reviewer-reproduced)". Images stay unchanged.

**E2 (`td:empty` scope).** It matches any empty cell, but today only Actions can be empty:
- Email is required on admin create (`admin_handlers.go:79`), SCIM inbound (`scim_inbound_handlers.go:366`) and bootstrap (`admin@local.kysecurity`).
- Display Name falls back to the username, and Role and Status always render.
- The rule is phone-only.

So there is no behaviour change for blank emails, which cannot occur today, and none on desktop. Scoping it to `td[data-label="Actions"]:empty` would state the intent and stop a future optional blank cell from silently leaving the phone layout and AX tree. This is optional.

**Screenshots** (viewed at full resolution):
- **confirm-delegate admin-row, desktop light:** admin has no Manage, other rows show Manage.
- **confirm-delegate admin-row, phone dark:** the admin block has no Actions label.
- **confirm-delegate member-row, desktop dark:** the 5-action menu.
- **after-admin member-row, phone light:** 9 actions, Delete separated and red.

N2 and N3 are stated as limits in the README and `UI-VERIFICATION.md`, and neither is claimed fixed. N1 wording now matches what `table-roles.mjs` measured.

## R2 Pulse: RESOLVED

**Source.**
- `.dr-facts` is now a two-column grid: `minmax(8rem, max-content)` and `minmax(0,1fr)`.
- Each `.dr-fact` spans both columns as a subgrid.
- `.dr-fact-label` is a wrapping flex row.
- Phones get one column.

No markup, behaviour, auth, palette or danger change.

**Runtime.** `pulse.mjs` is a scratch adaptation of the original harness (`cf61e5cf…`). Its port went from 5391 to 6013 and its paths changed. I added a fake KyYard on the private IPv4 at port 6011, following `web/browser/logs.spec.mjs`, with `KYPULSE_KYYARD_ALLOW_HTTP` as in the e2e server.
- **Backup, base desktop:** 3 badges wrap (FAIL, as expected).
- **Backup, head:** all 4 badges are on the label line at 1280 and 390. The label column is 163 px.
- **Other consumers:** AppDetail, KyYardFacts and KyYardCard have **identical** label width, value left/right, note position and stacking at base and head, at both widths. The label column stays 128 px on desktop, and there is no page or fact overflow. Cases covered:
  - KyYardFacts populated: a 79-character container name on a long endpoint, and a 130-character image digest.
  - KyYardFacts sparse: an exited container with no sample, which shows the "Resources" row.
  - KyYardCard: an 89-character organisation name.
- **Delete:** still an admin-only `.btn-danger` under Stop watching. It confirms, and dismissing sends no DELETE.
- **Overall:** 23/24 checks pass; the one FAIL is the expected base case.

**Evidence.**
- The archived `reviewer-verify/pulse.mjs` differs from my original only in its output, scratch and binary paths.
- The after captures were served from `b538323`. From there to `1670187` only `UI-VERIFICATION.md` and `web/AGENTS.md` change outside `docs/`.
- `kypulse-01-after-backup-desktop-dark` was viewed: badges sit beside their labels.

**Not measured:** Backup in a paired or pinned state with real copies or longer schedule labels. The label column is max-content, so it should grow rather than overflow, but that is unproven.

## R3 Notes: RESOLVED as disclosure

**Source.** `2b6eb25` changes only docs, `AGENTS.md` and `UI-VERIFICATION.md`. The embedded index is `1a66f5d20695` at `85dd3e3`, `902fda0` and `2b6eb25`.

**The 13 controls.** At `e1b726b` there were exactly 13 `.secondary` uses: DeviceLink 6, PinnedKeys 1, RecoveryCode 3, UnsentEdits 1 and `main.tsx` 2. Every cited line matches the source at the pinned head:
- `DeviceLink.tsx:122,132,137,274,280,292`
- `PinnedKeys.tsx:80`
- `RecoveryCode.tsx:277,291,298`
- `UnsentEdits.tsx:61`
- `main.tsx:569`, `:3500` (its `className` is on 3499) and `:3234` (error toast)
- The rules at `styles.css:81` and `:432`

**Capture labels are honest:**
- **Real:** the opened reset form (nothing typed), Forget this device (not clicked) and the idle Link another browser card.
- **MODELLED:** the locked-session Sign out, reached by clearing storage except cookies through CDP. The README, `UI-VERIFICATION.md`, facts JSONL (`modelled`) and root caveat all say so.
- **N/A:** DeviceLink ×6 (`secondBrowserOfferedLink` is false or absent in every facts row), Trust new key, Try the reset again, Discard unsent edits and the error toast. Each is listed with its reason.
- **Claims:** no claim that all 13 were captured, and none that the real unlock flow ran.

**Residual.** The neutral outline on destructive `secondary danger` controls is written down as an owner-decision residual. Before the refinement those controls were accent-filled with no danger hue: `kynotes-00-before-forget-device-mobile-light` shows an orange fill.

**Provenance.**
- **BEFORE:** `server_source` is `git archive` of `e1b726b`, and its embedded `ce3c13068f87` equals the blob `e1b726b:internal/web/dist/index.html`.
- **Checkout:** `head`/`checkout_revision` `85dd3e3` is kept as a separate field, in the manifest and in `followup-captures.json` alike.
- **AFTER:** `1a66f5d20695` equals the merged refinement.

Viewed: current recovery-reset desktop light, where Continue is a disabled neutral outline, and current locked-session phone dark, where Sign out is a neutral outline.

## Evidence integrity

- **Images:** all 108 match `followup-captures.json` and the blobs at the pinned commits (0 mismatches). I viewed 8 at full resolution; the other 100 were checked only by hash, manifest and facts.
- **Not changed by me:** `refinement-*` inputs, old reports, `products/` and `followup-products/`.

## Executed vs reused

**Executed (fresh):**
- Exports and capped Go builds (`-p 2`, persistent cache).
- Identity: npm ci, vitest with 2 mutations, vite parity and the `a01f5e` reproduction.
- The Identity and Pulse runtime harnesses at base and head.
- Notes blob hashes and git grep.
- Capture hash checks.

**Environment:** Chromium 153.0.8010.12 (ky-ui Playwright). Ports 6011 and 6013 only; they were free before and released after, and no foreign process was touched. All three product worktrees are clean at their pinned heads.

**Reused, not re-run:**
- The full suites: Identity vitest 198 and Go race; Pulse `make ci` and Playwright.
- Implementer `--verify` runs.
- Notes captures.
- Pulse dist parity: the runtime used the committed dist embedded in the pinned binary.
- Current-head CI, which the root owns.

**Limitations:**
- Firefox and WebKit/Safari were not run; the AX tree is Chromium only.
- Pulse Backup badges in the populated state were not measured.
- In Notes, five N/A states remain uncaptured anywhere, the locked session is modelled, and the real unlock flow is unverified.
- 100 of the 108 frames were not viewed.

**Observations, not findings:**
- The open Identity Manage menu sits in flow and grows its desktop row. This dates from #169.
- Pulse full-page frames end the sidebar at viewport height, which is a capture artefact.
