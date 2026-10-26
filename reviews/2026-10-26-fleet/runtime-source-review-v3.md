# Fleet Appearance: independent runtime source review, follow-up v3

Date 2026-10-26. Reviewer: Claude Opus 5.5 (`claude-opus-5-5`), independent review sub-agent. I implemented none of the changes under review. This is a source and behaviour review at the fixed heads in `runtime-review-inputs-v3.json`, not visual acceptance. The machine-readable record is `runtime-source-review-v3.json`, which includes per-file blob and sha256 coverage for all 12 repositories. Harness scripts are in `v3-review-work/harness/` and outputs in `v3-review-work/evidence/`.

## Result: F7 fixed; no new introduced medium or blocker; phase 2 started

| ID | Sev | Verdict | Summary |
|---|---|---|---|
| F7 | medium | **FIXED**, verified independently | Suite-palette `.btn-danger` labels now use `--bg`. Suite minimum: 5.83 at rest, 4.97 on hover (Base, Dark Matter), 5.83 on keyboard focus |
| G2 | low | CONFIRMED, **pre-existing** | Filled danger button on some preserved legacy palettes is below 4.5:1. The values are identical before and after F7 |
| N1 | nit | CONFIRMED | Specs and docs say "keyboard focus" but call `element.focus()`. My real Tab run confirms the claim |
| N2 | nit | CONFIRMED | Drive specs reuse a session file across separate server runs. This is test robustness only |
| G3 | low | CONFIRMED, **pre-existing** (found in phase 2) | Drive admin Settings keeps a compact theme `<select>` (`Settings.tsx:99`; also at review_base) |
| G4 | low | CONFIRMED, **pre-existing** (found in phase 2) | Pulse app-detail back link uses browser-default link colours (`AppDetail.tsx:112`; also at review_base) |

## F7 verification

**Change.** Pulse `414d08b`, Drive `7bd15a8` and Base `922869a` each add one rule to `web/src/styles/theme.css`, plus two comment lines: `:root[data-theme]:not(<exact F1 list>) .btn-danger { color: var(--bg); }`.
- The `:not()` list is byte-equal to the F1 block directly above it.
- Specificity is (0,4,0), so it beats `.btn-danger` and the generic `button:hover` (opacity/filter only).
- `.btn-danger-quiet` is a different class token and is unaffected.
- No other runtime file changed. Pulse/Drive merge commits brought no other diff. Base's merge brought only #70 (Go/docs), listed below as not certified.
- The Pulse and Base JS bundles are byte-identical across the rename. Only the CSS bundles changed.

**Generated parity.** `vite build` of the pinned Pulse and Base heads reproduced the committed `web/dist` byte for byte. Drive does not commit its dist; my build contains the rule.

**Implementer specs, re-executed on my own builds.** I built from `git archive` of the pinned commits and of the pre-F7 parents (`0c71a33`, `a949b9a`, `925bfe3`), then ran `go build -o .browser/server`.

| Product | Head result | Head min rest / hover / focus | Pre-F7 parent result | Parent failures |
|---|---|---|---|---|
| KyPulse | 2 passed, 2 skipped | 5.89 / 5.03 / 5.89 | 2 failed | 6 light palettes, min 1.18 (Polished Ky hover) |
| KyDrive | 2 passed, 2 skipped | 5.83 / 6.60 / 5.83 | 2 failed | 6 light palettes, min 1.23 |
| Base (diagnostic) | 2 passed, 2 skipped | 5.83 / 4.97 / 5.83 | 2 failed | 6 light palettes, min 1.18 |

These match the implementer's reported numbers. The skipped tests are the 390 px projects, skipped by design.

**My own cross-check (`v3-check.spec.mjs` + `analyze-v3.py`).** Coverage: all **22** catalog palettes, OS light and dark, all three products, head and parent.

Method:
- Settled computed label, fill and root `--danger`/`--success`/`--bg`.
- Rest contrast from computed colours.
- Hover and focus from screenshot pixels.
- Focus reached by **pressing Tab** until the button was active.

Results (`problems: []`):
- For all 15 suite palettes the label equals `--bg`, at a minimum of 5.83 at rest, 4.97 on hover and 5.83 on focus. Tab focus matched `:focus-visible` in every case.
- Fills and status tokens are identical between head and parent for all 22 palettes, so the F1 status fix is unchanged.
- The Busnes and legacy labels are unchanged.
- The product `ui.spec.mjs` (CSP violations, themes, status contrast, keyboard, shell) passed **4/4** on each head. Pulse and Base `nav.spec.mjs` (F6) gave 2 passed and 2 skipped (by design).

## G2 (low, pre-existing): filled danger on preserved legacy palettes

F7 correctly leaves these palettes alone, and the brief requires them to stay exact. They still read below AA:

| Product | Rest | Hover |
|---|---|---|
| Pulse/Base | paper 3.97, nord 4.69 | paper 3.49, nord 4.10, cyber 4.14, patina/oled 4.30 |
| Drive | patina/oled 3.76, cyber 3.90, nord 4.09 | 3.33–3.88 |

These values are byte-identical to the pre-F7 heads. I did not measure review_base. This needs an owner decision, like G1, and it prevents 9/10 acceptance. It does not block this round.

## Prior findings

| ID | Disposition |
|---|---|
| F1 | Status fix remains. Status tokens are identical head vs parent in 22×3×2 cases, and `ui.spec` was re-executed at all three heads |
| F2 | Fixed. DNS, Recovery and ky-ui heads are unchanged, so the v2 execution carries over by hash |
| F3 | Unchanged pre-existing gap (hash). Prevents 9/10 |
| F4 | Fixed. Notes and Identity heads are unchanged, so the result carries over by hash |
| F5 | Accepted placement, unchanged |
| F6 | Base/Pulse `nav.spec` re-executed and passing. `AppHeader` files are blob-identical. Recovery and Drive are unchanged |
| F7 | **Fixed** (above) |
| G1 | Unchanged pre-existing Yard gap (Yard head unchanged). Prevents 9/10 |

## Coverage at fixed heads

All 12 worktree HEADs equal their pins, and the tracked trees are clean. ky-ui's only modification is the root-owned `reviews/AGENTS.md`. Each previous head is an ancestor of its new head, and each listed change set equals `git diff prev..head`.

| Repository | Head | Prior-covered unchanged | New files | Runtime read in full | Tests read in full and executed | Generated | Upstream (not certified) | Evidence (omitted) |
|---|---|---|---|---|---|---|---|---|
| KyDNS, KyRecovery, KyIdentity, KyNotes, KyPost, KyCalendar, KyMessage, KyYard, ky-ui | unchanged | 17/17, 16/16, 22/22, 27/27, 13/13, 18/18, 17/17, 57/57, 23/23 | 0 | – | – | – | – | – |
| ky-server-base | `922869ac` | 19/27 | 60 | `theme.css` | `danger-button.spec.mjs` | dist ×4 (parity) | `go.mod`, `go.sum`, `totp_strength_test.go`, auth `AGENTS.md`, 2 docs | 45 |
| KyDrive-server | `7bd15a88` | 15/18 | 25 | `theme.css` | `danger-button.spec.mjs` | – | – | 21 |
| KyPulse-server | `414d08bc` | 19/26 | 45 | `theme.css` | `danger-button.spec.mjs` | dist ×4 (parity) | – | 37 |

The prior-covered files that changed are exactly `theme.css`, `web/AGENTS.md`, `UI-VERIFICATION.md`, `CHANGELOG.md` (Base) and the renamed dist assets. I read the doc diffs. Truncated output was never counted as coverage.

## Upstream backend (identified, NOT certified)

- Base `73cdf19` (#70): TOTP key minimum, Go dependency bumps and auth test.
- Carried from v2: Identity #166, Notes #111, Yard #154.

## Checks

**Executed by me:**
- Pins, ancestry and diff lists.
- Blob/sha256 coverage.
- 6 archives and builds.
- dist parity.
- Implementer spec ×6.
- My cross-check ×6.
- `ui.spec` ×3.
- `nav.spec` ×2.

Ports 5391/5392 were free before and after each run. Runs were serial, and each used the product's own disposable server.

**Reported, not re-executed:**
- The full product suites (Pulse 96/20, Base 10/8, Drive 100/50).
- lint, tidy and race.
- The Notes CI timeout and its targeted rerun.
- Current-head PR CI (root-owned).

## Limits

- Chromium only, and 1280 px only for colour.
- Pulse uses a disabled synthetic app, the Drive dialog is always cancelled, and the Base button is an injected diagnostic.
- Unpair, Remove webhook and Revoke computer were checked statically only.
- Disabled buttons were not measured.
- My conservative median-pixel estimate runs about 1–2 points low for every palette, including untouched Busnes, because of anti-aliasing. It is recorded but is not a WCAG measure.
- I mutated no source, worktree, input or exporter. My builds lived in `v3-review-work/src/` (scratch exports).
