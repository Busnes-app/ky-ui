# Fleet Appearance: independent runtime source review, follow-up v2

Date 2026-10-26. Reviewer: Claude Opus 5.5 (`claude-opus-5-5`), independent review sub-agent. It implemented none of the changes under review. This is a source and behaviour review at the fixed heads in `runtime-review-inputs-v2.json`. It is not visual acceptance and gives no screenshot scores. The machine-readable record is `runtime-source-review-v2.json`, which holds per-file coverage for every new change plus a hash re-check of every file the first review covered. Harness scripts are in `v2-review-work/harness/`, outputs in `v2-review-work/evidence/`.

## Result: not ready; phase 2 not started

The F1 fix introduced one new medium regression, **F7**. Per the brief, I stopped after this source output so root can fix it before the final ratings. F2 and F4 (Notes) are fixed, and I verified both by execution. F1's status text is fixed. F3 remains a tracked pre-existing gap. Vendored and generated ky-ui bytes are correct in all 11 consumers. I found no security issue in the UI changes. Upstream backend merges are listed below as not certified.

| ID | Sev | Verdict | Repos | Summary |
|---|---|---|---|---|
| F7 | medium | CONFIRMED, **new regression** | KyPulse, KyDrive (Base has the CSS but no button) | F1 tint makes filled danger-button labels 1.18–1.66:1 on the six light suite palettes |
| G1 | low | CONFIRMED, pre-existing | KyYard | Filled danger-button label 2.07–2.86:1 on light suite palettes (own inline status colours) |

## F7 (medium, CONFIRMED): F1 tint makes filled danger-button labels unreadable on light suite palettes

**Where.** The F1 rule (`kyPulse-server web/src/styles/theme.css:104-109`, `KyDrive-server web/src/styles/theme.css:69-74`, `ky_server_base …:104-109`) mixes `--danger` 50% toward `--ink-strong`. `.btn-danger` fills with `var(--danger)` and keeps `color: var(--button-text, #fff)` (Pulse `:203-206`, Drive `:211`). Light palettes have a dark `--button-text`, so the label is dark on dark red. Affected real controls:
- KyPulse: Unpair (`KyYardCard.tsx:76`), Remove webhook (`WebhookForm.tsx:119`) and Delete app (`AppDetail.tsx:118`).
- KyDrive: the danger confirmation in `Dialog.tsx:43` and Revoke computer (`Devices.tsx:63`).
- ky-server-base defines the class but renders no `.btn-danger`. New products inherit the template, though.

**Evidence.** Real `<button class="btn-danger">`; computed colour against computed background; canvas colour conversion; transitions disabled.

| Palette | KyPulse shipped dist CSS, pre-F1 `88fbeba` | KyPulse shipped dist CSS, head `a955d6de` |
|---|---|---|
| light-matter | 4.63 | 1.59 |
| tropics | 3.69 | 1.22 |
| white-cliffs | 3.56 | 1.24 |
| sky | 3.76 | 1.30 |
| sun | 4.53 | 1.66 |
| polished-ky | 3.85 | 1.18 |

- KyDrive source CSS gives identical values (head 1.18–1.66; pre-F1 `62f9743` 3.56–4.63). My first Drive run reported 6.57 for every palette. That number was an artifact: Drive buttons animate colour, so the measurement caught the transition's start. The rerun with transitions disabled matches Pulse.
- Dark palettes pass at the head (5.45–6.59).
- Screenshot: `v2-review-work/evidence/f7-pulse-dist-danger-button-preF1-vs-head.png`. It shows Sky, Polished Ky and Sun, with the pre-F1 row above the head row in each pair.
- The new F1 `ui.spec.mjs` assertions measure only status text, which is why CI did not catch this.
- The pre-F1 values were already below 4.5 for five palettes (a rollout gap); the fix made them about three times worse.

**Fix (measured, `f7-options.mjs`, all 15 suite palettes on Pulse CSS):**
- Label `color: var(--bg)`: min 5.83, none below 4.5.
- The Calendar/Messages outline style (panel background, danger text, danger border): min 5.01, none below 4.5. This one is consistent with the suite.
- A plain `#fff` label fails nine dark palettes (2.71–2.97).
- Add a rendered `.btn-danger` contrast assertion to `ui.spec.mjs`.

## G1 (low, pre-existing): KyYard filled danger button on light suite palettes

`KyYard-Server web/src/theme.ts:26-27` sets `--danger` to #b91c1c for light named palettes, and the label uses the palette `--button-text`. Measured 2.07–2.86 at `18ec0f6d`. These files are unchanged since the previous review head, and I did not measure review_base. This is a tracked acceptance gap in the same family as F7, and the F7 fix options apply.

## Prior findings

| ID | Disposition | Basis |
|---|---|---|
| F1 | Status text **fixed**; the fix caused F7 | `status-contrast-v2.mjs`: Base/Pulse/Drive suite danger/success min **5.00** (Forest danger) across all 15 suite palettes, OS light and dark. Pre-F1 Base was 3.25/2.19. Root's reported min 7.6998 covers only the six light palettes. |
| F2 | **Fixed**, verified independently | `first-paint-v2.mjs`, a different method from the implementer's timing harness: the head is streamed, the body held back 1.5 s and the theme scripts delayed 0.6 s. Pinned heads applied the saved choice before `<body>` was parsed in **11/11** cases (DNS: Ocean, Busnes Light on OS dark, Cliffs alias, nothing saved, restricted storage; Recovery: light on OS dark, ocean, system, restricted storage; ceremony: sky, restricted storage). Prior heads: **0/5**. Final checked radios equal the saved choice. Restricted storage gives no page errors and follows the OS. Generator: regenerated byte-equal in a temp copy; the guard rejects `export async function`, `export let` and `import`. vm parity: 68 inputs, 0 mismatches. `render_test.go` and `check-contrast.mjs` assert classic, in-order head scripts with no `type="module"`. Chromium only. |
| F3 | **Unchanged** pre-existing acceptance gap; no 9/10 | Identity `theme.ts`/`index.css` and ky-ui `tokens.css` are blob-identical to the previous heads, so the earlier measurement (danger 2.10–2.30, success 1.78–1.95) stands. Not re-executed. |
| F4 | **Fixed** in Notes (executed); Identity verified from source only | The Notes product e2e `appearance-cross-tab` passed against the committed embed (`a2296af`). My own spec on the same throwaway server also passed: `removeItem` returns Match system, `Cliffs` checks White Cliffs, `clear()` (`event.key === null`) returns Match system, and the saved format stays the name (`"Ocean"`). Identity has the same listener, and `storedTheme()` catches restricted storage. Identity has no browser CI, and I did not re-run its capture-core 0/4 → 4/4 check. |
| F5 | Accepted as recorded placement | Yard and Notes keep Settings → Appearance for every role. The Notes e2e reaches it through Settings. No compact navigation selector was added. |
| F6 | Base/Pulse **fixed** (source plus implementer specs). Recovery verified from source, but my harness was inconclusive. Drive was not reproduced and is unchanged, which I accept. | Base/Pulse call `scrollIntoView({block:'nearest',inline:'nearest'})` on route change. `.app-header` is sticky at every width, so a visible item does not move. Recovery's `revealTab` adjusts only the row's `scrollLeft`. My Recovery harness could not reproduce the overflow: without auth data the dashboard stays hidden and the row measures 0×0. I did not re-run the implementer's real-server 10/11 → 11/11 check. |

## Other requested checks

- **Match system subtitle.** "Follows device" is in all 11 consumer sources, and "Light or dark" is gone. The committed bundles contain the new label; I checked Yard's embedded `web/dist` directly.
- **Notes merge `a2296af`.** `internal/web/dist` is identical to pre-merge `451016e`. The merge adds only `VERSION` and `themes-browser.js`.
- **CSP.** KyDNS is unchanged (`frame-ancestors 'self'`). KyRecovery `server.go` is untouched since review_base. Only same-origin classic scripts were added; the product changes add no inline script or style.
- **Preserved areas.** These files are blob-identical to the previous heads, so the earlier review's verdict carries over by hash, not by rereading:
  - storage keys, aliases and adapters;
  - the Calendar/Messages hover fix and the KyPost reader;
  - the Yard Polished Ky override;
  - Drive's five local palettes and previews. The only change in Drive's `theme.css` is the F1 rule, whose `:not()` list excludes those five;
  - Recovery's `--ink` token map. The only change in Recovery's `theme.js` is the IIFE and `DOMContentLoaded` wrapper.
- **No compact theme controls.** The changed shell files (Base/Pulse `AppHeader.tsx`) add no select. The KyRecovery ceremony select is outside navigation and stays.

## Upstream backend merges (identified, NOT reviewed or certified)

- **KyIdentity `2d7fc73` (#166).** `POST /api/admin/backup/deposit` drops step-up (permAdmin only), and `AdminBackup.tsx` stops requesting a grant. This is a security-relevant authorization change.
- **KyNotes `937573e` (#111).** Backup deposit moves from `RequireStepUp` to `RequireAdmin` plus CSRF.
- **KyYard `d69a64de`, `26305324`, `a4c4ea30` (#154).** The strong-crypto profile: signing-key floors, TLS, JWKS strength, plus CI, Makefile, `go.mod` and docs (35 files).

## Coverage at fixed heads

Pins: all 12 heads exist, and each worktree HEAD equals its pin. `merge-base(review_base, head)` equals review_base, the previous review head is an ancestor of the new head, and each listed change set equals `git diff previous..head`. The ky-ui worktree is dirty only in root-owned `reviews/AGENTS.md` and untracked evidence.

| Repository | Head | Prev head | New files | Runtime | Tests | Vendor | Docs read | Ev. script | Upstream (not certified) | Generated | Docs omitted | Evidence | Prior-covered unchanged |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| KyDNS-server | `c9ba6deb` | `28bf59e3` | 27 | 2 | 1 | 2 | 1 | 0 | 0 | 0 | 0 | 21 | 11/15 |
| KyRecovery-server | `e0614508` | `2738beb7` | 57 | 4 | 1 | 2 | 0 | 0 | 0 | 0 | 2 | 48 | 7/12 |
| KyIdentity-server | `35d8e42a` | `cf986204` | 41 | 1 | 0 | 2 | 0 | 0 | 4 | 2 | 3 | 29 | 10/12 |
| KyNotes-server | `a2296af3` | `22f51a10` | 47 | 1 | 1 | 2 | 0 | 0 | 8 | 5 | 1 | 29 | 9/12 |
| KyPost-Server | `7963701a` | `7b0892f0` | 2 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 11/12 |
| KyCalendar | `bad000f1` | `00f72432` | 2 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 16/17 |
| KyMessage-Server | `ab600d98` | `8fe1c977` | 2 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 15/16 |
| KyYard-server | `18ec0f6d` | `3925b30a` | 56 | 1 | 0 | 2 | 0 | 0 | 35 | 4 | 2 | 12 | 13/15 |
| ky-server-base | `651a7b41` | `461f25f1` | 53 | 2 | 2 | 2 | 0 | 0 | 0 | 4 | 3 | 40 | 14/18 |
| KyDrive-server | `57765378` | `91c312b3` | 30 | 2 | 1 | 2 | 0 | 0 | 0 | 0 | 2 | 23 | 11/15 |
| KyPulse-server | `a955d6de` | `0f294e66` | 43 | 2 | 2 | 2 | 0 | 0 | 0 | 4 | 2 | 31 | 14/18 |
| ky-ui | `f9fb9306` | `ab7a0398` | 38 | 3 | 1 | 0 | 7 | 1 | 0 | 0 | 0 | 26 | 12/16 |

- **Runtime read in full** (18): KyDNS `theme.js` and `base.html`; KyRecovery `index.html`, `ceremony.html`, `js/theme.js` and `js/app.js` (diff plus tab code); Identity `Appearance.tsx`; Notes `main.tsx` (diff; settings component); Yard `ThemeSwitcher.tsx`; Base/Pulse `AppHeader.tsx` and `theme.css`; Drive `Appearance.tsx` and `theme.css`; ky-ui `sync-consumers.mjs`, `package.json` and `eslint.config.mjs`. Adapters (`theme.ts`) I read for context are unchanged since the previous review.
- **Tests read in full** (9): `render_test.go` (diff), `check-contrast.mjs` (diff), Notes `appearance-cross-tab.e2e.ts`, Base/Pulse `nav.spec.mjs`, Base/Pulse/Drive `ui.spec.mjs` (diff), ky-ui `sync.test.js` (diff).
- **Vendor** (22): `VERSION` and `themes-browser.js` in each consumer. Blobs are identical across consumers and regenerate byte-equal; `sync --check` passes.
- **Prior-covered files:** of the 178 files the first review covered, 143 are blob-identical at the new heads. The 35 that changed are the files listed above, plus `VERSION` and docs.
- **Omitted:** screenshots, manifests, CSVs and capture scripts (evidence); generated `dist` bundles (string presence only); docs other than ky-ui's and KyDNS `AGENTS.md`. Truncated tool output was never counted as coverage.

## Checks

**Executed by me:** pin, ancestry and diff-list verification; blob hash comparison; vendor tree comparison; `sync-consumers --check`; temp-copy regeneration and guard mutations; vm parity; ky-ui `npm test` (14/14); `status-contrast-v2`; `danger-button` against source CSS and against Pulse's shipped dist; the fix-option measurement; `first-paint-v2` (16 runs); Notes product e2e `appearance-cross-tab` (1/1); my own Notes removal/`clear()` spec (1/1); the Recovery F6 harness (inconclusive).

**Reported by others, not re-executed:** product unit, race and full browser suites; Base/Pulse `nav.spec`/`ui.spec`; Identity capture-core 0/4 → 4/4; the Recovery phone check 10/11 → 11/11; the implementer's first-paint timing runs; Yard's 563 unit tests and its captures; Notes' 599 unit tests and build; CI.

## Limits

- Chromium only. The contrast checks use real committed CSS (for Pulse, also the shipped bundle) on synthetic pages, not full apps.
- Bundles are verified only by string presence.
- Backend merges are identified, not reviewed.
- F3 rests on hash identity.
- Ports: the harnesses used ephemeral loopback ports, and the Notes e2e used its own 127.0.0.1:18080, which was free before the run. I did not touch 5391/5392.
- I mutated no source, worktree, input file or exporter.

## After-pin movement

While I was reviewing, the ky-server-base worktree advanced from the pinned `651a7b41` to `63b3b4c1`. Someone else committed a master merge: #70 TOTP key minimum, touching `go.mod`/`go.sum`, `internal/auth/totp_strength_test.go`, `CHANGELOG.md` and docs. It touches no `web/` file. My review used the pinned commit through `git show` and does not cover `63b3b4c1`. The other 11 worktrees stayed at their pins with clean tracked state.
