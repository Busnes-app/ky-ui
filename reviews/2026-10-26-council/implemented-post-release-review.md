# Implemented KyPost stage 05: independent final visual review

**KyPost is not accepted.** No cohort reaches 9.0. Per-image totals run from 7.0 to 8.0. The equal-cohort-weight mean is 7.52, which is a within-product summary, not a ranking. The lowest cohort is mail-read at 7.25. `ky_fit` is 8.08. No behavior gate passes: `states` fails and the other four are untested.

Stage 05 visibly fixes every finding the first implementation review raised. What remains is a set of smaller defects in rhythm, labelling and consistency, concentrated on phones and in the reader and compose dialogs.

- **Reviewer:** Claude Opus 5.5 (`claude-opus-5-5`), review sub-agent, Claude Code in T3 Code, 2026-10-26. I implemented, committed and pushed nothing.
- **Rubric:** `ky-suite-v2`, unchanged.
  - Quality weights: hierarchy 0.20, typography 0.15, density_layout 0.20, color 0.15, visible_affordances 0.15, coherence 0.15.
  - Integer scores. Each image's total is rounded half-up to one decimal. Means are taken from unrounded weighted sums and rounded to two decimals.
  - `ky_fit` is separate: five dimensions at 0.20 each, never added to `total`. A dimension marked N/A is left out of that image's mean.
- **Data:** `implemented-post-release-scores.json` (schema `ky-ui-council-scores/2`, same shape as `implemented-post-messages-scores.json`) holds every row, hash, observation and aggregate.
- **Blind scoring:**
  - I viewed all 28 images at full resolution.
  - I froze every per-dimension score at 2026-10-26T02:32:37-04:00 (snapshot SHA-256 `639d0063…bfeba`). Only after that did I open `implemented-post-messages-review.md`, its scores JSON or `kypost-implementation.md`.
  - Before the freeze I also viewed `kycalendar-06-confirm1-month-desktop-light.png` and `kymessages-06-after-users-desktop-light.png`, for `suite_cohesion` only.
  - I changed no score after unblinding.

## Source set and provenance

| Item | Value |
|---|---|
| Images | `screenshots/kypost-05-after-*.png`: 28 files, 7 surfaces × light/dark × desktop 1280×900 / phone 390×844 |
| Manifest | `screenshots/kypost-05-after.json`: overflowX 0 and one `h1` on every capture |
| Captured source | kypost-server `3037caf8` + `source-stages/kypost/source-05-after.patch` (`149f0563…a6a0d0`). `source-05-final.patch` (`9420f2a6…bfaf`) has byte-identical `frontend/src` and adds docs only. |
| Capture | 2026-10-26 05:58–05:59 UTC, one bounded recapture. Playwright 1.63.0 headless Chromium, America/New_York. Synthetic kypost-demo IMAP fixture (4 messages, 4 contacts, user `alex`). Theme follows the context `colorScheme`, so Busnes Light or Busnes Dark with no saved choice. |

**These pixels are stage 05. None of these images was captured after the 06 follow-up.**

- **06 follow-up:** `source-06-followup.patch` (`41732fea…b717`).
  - I compared it hunk by hunk with `source-05-final.patch`. It differs only in `frontend/src/ky-ui/navigation.css` and `VERSION`, which sync the `:where()` hover specificity so a selected nav row keeps its surface under hover.
  - Hover appears in no static capture, so the 05 images still show every scored state correctly.
  - The hover result itself is recorded in `kypost-06-followup-hover.json`: selected kept, idle hover changes, light and dark, both sizes. I did not execute it.
- **Byte-identical checks file:** `kypost-06-followup-checks.json` has the same SHA-256 as `kypost-05-after-checks.json`. The implementer reports a re-run with the same results. Identical bytes cannot tell a re-run from a copy.
- **07 test wait:** `source-07-test-wait.patch` (`1456c207…5bc9`) differs from 06 only in `App.mailboxes.test.tsx` and `App.mobileSettings.test.tsx`, as scoped `findBy` waits. It changes no runtime code.
- **Checksums:** `source-stages/kypost/SHA256SUMS` verifies OK for every patch.

**Inventory:** 28 files, 28 unique SHA-256 values, no exact or near duplicates. The closest pair (contacts vs inbox, desktop light) differs in 6.75% of pixels, with a maximum channel delta of 231. All 28 are scored and none is unscored. Every file's name matches its content.

## Quality by cohort

Within-product only. No matched competitor after-captures exist, so I report no Ky gap, no provider-wide rank and no competitive win. The original 40-image ratings scored different pictures and are not comparable.

| Cohort | n | Mean | Min | Max | Desktop | Phone | ky_fit mean |
|---|---|---|---|---|---|---|---|
| mail-list (inbox, selection) | 8 | 7.53 | 7.0 | 8.0 | 7.93 | 7.13 | 8.00 |
| mail-read (reader) | 4 | **7.25** | 7.0 | 7.5 | 7.50 | 7.00 | 8.00 |
| compose | 4 | 7.33 | 7.2 | 7.5 | 7.50 | 7.15 | 8.00 |
| contacts-list | 4 | 7.33 | 7.2 | 7.5 | 7.50 | 7.15 | 8.10 |
| contact-editor | 4 | 7.85 | 7.9 | 7.9 | 7.85 | 7.85 | 8.23 |
| settings (Appearance) | 4 | 7.83 | 7.8 | 7.9 | 7.80 | 7.85 | 8.20 |

- **Equal cohort weight:** 7.52. This is not a ranking.
- **Where a mean sits below its min:** in contact-editor (mean 7.85, min 7.9), the mean comes from unrounded sums (7.85) while the min is a rounded total. The same convention applies throughout.
- **Light and dark:** they score the same on every surface. The dark-only observations below are recorded but move no integer score.

## Prior findings, stage-05 responses, and what the images show (read after the freeze)

| First-review finding | Stage-05 response | Visible in 05 images |
|---|---|---|
| Phone header lacks a brand; nav chips wrap into three rows; Scheduled and Mail clipped | Brand/account row plus one scrolling strip, with `scrollIntoView` for the current and focused item | **Resolved.** Mark, wordmark, New Email, name and Logout icon sit on one row, with one strip below. Residual: partial items at the strip edges are the only scroll cue, and Settings children sit inline next to "Settings ⌄" with no nesting. |
| Contact editor footer off screen, no close | Sticky header with close, sticky footer, optional groups collapsed | **Resolved** on desktop and phone. Residual: the native file input sits beside "Save the contact first to add a photo", and no required/optional marking is visible. |
| Reader: generic title, Reply buried, mixed buttons, accent raw link | Subject heading, Reply primary first, quiet tools, ink raw link | **Resolved.** Residual: a monospace body in a fixed tall empty box, a full-width Keywords field between the facts and the body, a label/value size mismatch, and icon-only tools on phones. |
| Phone contacts clipped | Stacked rows | **Resolved**, with nothing clipped. Residual: header actions wrap and New Contact lands last; Delete is undifferentiated. |
| Dark Quill icons invisible; typed `›` glyph | Toolbar rules scoped; shared SVG chevron | **Resolved.** Icons are legible; 12.67 recorded. The chevron is now an SVG, but on desktop it still floats mid-column with no visible purpose. |
| Reader fixture drift (`reader-mobile-light`) | Driver guard | **Resolved.** All four reader captures show the Alice Demo message. |

## Remaining defects (visible evidence; ranked by points they cost)

These are listed for the record, not as a new polish round.

1. **Phone mail list** (`inbox[-selection]-mobile-*`, 7.0–7.3).
   - About 60px of checkbox gutter before the subject on a 390px screen.
   - Sender lines wrap mid-address (`<silent@kypost-` / `demo.local>`).
   - The selection toolbar is six icons with no labels.
   - Native ~13px checkboxes.
2. **Reader body** (`reader-*`, 7.0–7.5).
   - Plain text is set in monospace. The contract reserves mono for code and keys.
   - On phones the message's hard line breaks re-wrap into a stranded "so the" line.
   - A fixed ~470px (desktop) or ~410px (phone) bordered body box holds two lines.
   - The bordered Keywords input divides the facts from the body, making a box in a box.
   - The 13px bold labels sit beside ~16px values.
   - The implementer notes that the frame paints its own background for security reasons. That constrains the fix; it does not change what the image shows.
3. **Compose** (`compose-*`, 7.2–7.5).
   - Capitalised `TO:`/`CC:`/`BCC:` sit beside `Subject:`.
   - Five stacked bands (banner, fields, editor, crypto, actions) make the dialog read as strips.
   - Quill's "Normal" stepper picker does not match the product's controls.
   - On phones, the clear-format button wraps alone onto a second toolbar line and the actions wrap to two rows.
4. **Contacts** (`contacts-*`, 7.2–7.5).
   - The "Actions" heading (x≈1012) does not line up with Edit/Delete (x≈1123–1223).
   - The chevron floats at x≈649, away from the name.
   - Delete is plain ink, where the destructive actions elsewhere in the product use danger text.
   - The "New Contact" label is larger and bolder than its sibling buttons.
   - On phones, header actions take two rows and the primary comes last.
5. **Contact editor** (7.9). The photo file control looks usable while the text says it is not; no required/optional marking.
6. **Appearance desktop** (7.8). With Settings expanded, the account region sits at the viewport floor (Logout at y≈887) and the licence line falls below the fold.
7. **Colour.**
   - Danger text sits close in hue to the accent: `#b42318` against `#bf3f18` in light, `#ff8176` against `#f5865f` in dark.
   - In dark, the reader and compose dialogs (`#1f2b2e`) separate from the backdrop (`#121a1c`) mainly through the 1px border.

## Gap to 9

- **Quality:** every cohort needs between +1.15 (contact-editor) and +1.75 (mail-read).
- **What 9 means:** the rubric's 9 is "nothing to remove": every dimension at 9, with no visible slip. Today 156 of the 168 dimension scores are 7 or 8 (100 eights, 56 sevens), and there are no 9s. The twelve 6s are all on phones: density on mail-list, reader and compose, selection-toolbar affordances, and reader typography.
- **What fixing the listed defects would buy:** clearing every item above would most plausibly lift the affected dimensions to 8. Reaching 9 needs a further refinement that no current image demonstrates. I do not predict that it gets there.
- **ky_fit:** 8.08 needs about +0.9. It is held back by:
  - `suite_cohesion` at 7: an envelope mark against the "B" stamp used by KyCalendar and KyMessages, white content against their cream page, and "Logout" against "Sign out".
  - `type_geometry` at 7–8: monospace reading text, capitalised compose labels, native checkboxes and the oversized primary label.

## Ky brand fit

| Dimension | Range | Evidence |
|---|---|---|
| palette_tokens | 9 | Sampled `#f2efe7` sidebar, `#ffffff` content, `#bf3f18` accent, `#fbf0ec` soft (light); `#1f2b2e`, `#f5865f`, `#2b2622` (dark). All are token values. |
| type_geometry | 7–8 | 40px controls and 8px radius throughout. Off-contract: monospace body, capitalised compose labels, Quill picker, native checkboxes. |
| shell | 8, or N/A on the 6 phone sheet captures | 240px sidebar, rail selection, account pinned with Logout. Envelope mark instead of the stamp. Phone pattern allowed by the contract. Full-screen phone sheets hide the shell, so N/A there. |
| accent_discipline | 8–9 | Orange appears only on the view primary, selection and focus. The soft Uncategorized chip and the near-accent danger hue cost a point on list views. |
| suite_cohesion | 7 | See the gap section above. |

## Gates (behavior; recorded evidence only, none executed by me)

Screenshots pass no gate. An untested gate means the product is not accepted.

| Gate | Status | Evidence |
|---|---|---|
| keyboard | untested | Recorded: phone Tab walk of 16 stops; reader opened with Enter, Reply first, Escape returns focus to the row; editor focus starts on Close and Escape returns to New Contact. Not recorded: full task paths. Known order deviation: on phones Tab reaches the strip before Logout, which sits above it. No skip link. |
| focus | untested | 2px rings recorded on all 16 strip stops and the reader actions, in both themes. Not recorded for form fields, row actions, swatches, compose or named themes. |
| contrast | untested | Quill 16.06 / 12.67, border 3.63 / 4.77, plus earlier selected pairs. Not every element or named theme. |
| states | **fail** | No loading, error or validation state is captured for any task view. The gate's evidence requirement is unmet; this does not claim the product lacks those states. |
| responsive | untested | overflowX 0 at 1280, 1024, 768, 390 and 360; a 105px header with a one-row strip; the editor footer stays on screen. Target size is not measured, and the phone images show native ~13px checkboxes. |

**Two notes on the recorded evidence:**

- The `reader-keyboard` entries in `kypost-05-after-checks.json` have `"heading": null` in both themes. The images show the subject as the title, and the implementer cites a `ReadPage` unit test for the accessible name, but the browser check does not confirm it.
- The 06 checks file is byte-identical to the 05 file.

**Product checks recorded by the implementer (not executed by me):**

- **Passed:**
  - npm test 1189/1189.
  - Typecheck clean.
  - Lint: 0 errors and 0 warnings.
  - Build passes.
  - Vendor check: ky-ui 0.3.0.
  - npm audit: 0.
  - Toolchain and env-example scripts pass.
- **App first-test flake under parallel host load:**
  - Measured wait means are about equal: 1076 ms current against 1090 ms baseline.
  - Batch failures differ: 7 of 23 current runs against 0 of 9 baseline.
  - A `beforeAll` warm-up failed and was reverted.
  - The parent owns test timing (the 07 waits).
  - A regression is neither proven nor ruled out.
- **Not run:** Go vet, golangci-lint, govulncheck, `go test -race`, the container build, shellcheck, the compose checks and the worker typechecks. These are left to real PR CI.

## Coverage and missing evidence

- **Not captured:**
  - Loading and error states.
  - Named themes. Only Busnes Light and Dark are captured.
  - Hover.
  - Admin surfaces (Server, Users, Quarantine, Security).
  - Settings panels other than Appearance.
- **Not tested:** screen-reader behaviour. Grid-on-table phone contact rows are unverified outside Chromium.
- These are `N/A`, not zero. I inferred no feature to be missing from its absence on screen.

## Context against the previous round (not drift)

`implemented-post-messages` scored `kypost-03-after` images, which are different pixels, scored by a different reviewer instance. These differences are context for product change, not a rubric measurement.

| Cohort | 03 mean | 05 mean | 03 ky_fit | 05 ky_fit |
|---|---|---|---|---|
| mail-list | 7.15 | 7.53 | 6.80 | 8.00 |
| mail-read | 5.85 | 7.25 | 6.10 | 8.00 |
| compose | 7.34 | 7.33 | 6.60 | 8.00 |
| contacts-list | 6.58 | 7.33 | 6.80 | 8.10 |
| contact-editor | 6.18 | 7.85 | 6.80 | 8.23 |
| settings | 7.35 | 7.83 | 7.20 | 8.20 |
| **Equal cohort weight** | 6.74 | 7.52 | 6.73 | 8.08 |

The largest moves are in the reader, the contact editor and phone contacts, where the stage-05 changes landed. Compose is flat. The `ky_fit` jump is partly reviewer calibration: the earlier reviewer gave `suite_cohesion` 5–7 and scored the dark Quill toolbar low.

## Recompute

```sh
cd reviews/2026-10-26-council && python3 -I -c 'import json,glob,os;from decimal import Decimal as D,ROUND_HALF_UP as H
d=json.load(open("implemented-post-release-scores.json"));w={k:D(str(v)) for k,v in d["rubric"]["weights"].items()};f=d["files"]
s=lambda x:sum(w[k]*v for k,v in x["scores"].items());c={}
[c.setdefault(x["cohort"],[]).append(s(x)) for x in f]
print(len(f),sorted(x["file"] for x in f)==sorted(map(os.path.basename,glob.glob("screenshots/kypost-05-after-*.png"))),
all(x["total"]==float(s(x).quantize(D("0.1"),H)) for x in f),(sum(sum(v)/len(v) for v in c.values())/len(c)).quantize(D("0.01"),H))'
```

Expected output: `28 True True 7.52`.

## Per-image scores

H hierarchy, T typography, D density_layout, C color, A visible_affordances, Co coherence. Σ is the unrounded weighted sum. The JSON carries one observation per dimension for each file.

| File (`kypost-05-after-…`) | Cohort | H | T | D | C | A | Co | Σ | Total | ky_fit |
|---|---|---|---|---|---|---|---|---|---|---|
| `appearance-desktop-dark` | settings | 8 | 8 | 7 | 8 | 8 | 8 | 7.8 | 7.8 | 8.2 |
| `appearance-desktop-light` | settings | 8 | 8 | 7 | 8 | 8 | 8 | 7.8 | 7.8 | 8.2 |
| `appearance-mobile-dark` | settings | 8 | 8 | 8 | 8 | 7 | 8 | 7.85 | 7.9 | 8.2 |
| `appearance-mobile-light` | settings | 8 | 8 | 8 | 8 | 7 | 8 | 7.85 | 7.9 | 8.2 |
| `compose-desktop-dark` | compose | 8 | 7 | 7 | 8 | 8 | 7 | 7.5 | 7.5 | 8.0 |
| `compose-desktop-light` | compose | 8 | 7 | 7 | 8 | 8 | 7 | 7.5 | 7.5 | 8.0 |
| `compose-mobile-dark` | compose | 8 | 7 | 6 | 8 | 7 | 7 | 7.15 | 7.2 | 8.0 |
| `compose-mobile-light` | compose | 8 | 7 | 6 | 8 | 7 | 7 | 7.15 | 7.2 | 8.0 |
| `contact-editor-desktop-dark` | contact-editor | 8 | 8 | 8 | 8 | 7 | 8 | 7.85 | 7.9 | 8.2 |
| `contact-editor-desktop-light` | contact-editor | 8 | 8 | 8 | 8 | 7 | 8 | 7.85 | 7.9 | 8.2 |
| `contact-editor-mobile-dark` | contact-editor | 8 | 8 | 8 | 8 | 7 | 8 | 7.85 | 7.9 | 8.3 |
| `contact-editor-mobile-light` | contact-editor | 8 | 8 | 8 | 8 | 7 | 8 | 7.85 | 7.9 | 8.3 |
| `contacts-desktop-dark` | contacts-list | 8 | 8 | 7 | 8 | 7 | 7 | 7.5 | 7.5 | 8.2 |
| `contacts-desktop-light` | contacts-list | 8 | 8 | 7 | 8 | 7 | 7 | 7.5 | 7.5 | 8.2 |
| `contacts-mobile-dark` | contacts-list | 7 | 7 | 7 | 8 | 7 | 7 | 7.15 | 7.2 | 8.0 |
| `contacts-mobile-light` | contacts-list | 7 | 7 | 7 | 8 | 7 | 7 | 7.15 | 7.2 | 8.0 |
| `inbox-desktop-dark` | mail-list | 8 | 8 | 8 | 8 | 7 | 8 | 7.85 | 7.9 | 8.0 |
| `inbox-desktop-light` | mail-list | 8 | 8 | 8 | 8 | 7 | 8 | 7.85 | 7.9 | 8.0 |
| `inbox-mobile-dark` | mail-list | 8 | 7 | 6 | 8 | 7 | 8 | 7.3 | 7.3 | 8.0 |
| `inbox-mobile-light` | mail-list | 8 | 7 | 6 | 8 | 7 | 8 | 7.3 | 7.3 | 8.0 |
| `inbox-selection-desktop-dark` | mail-list | 8 | 8 | 8 | 8 | 8 | 8 | 8.0 | 8.0 | 8.0 |
| `inbox-selection-desktop-light` | mail-list | 8 | 8 | 8 | 8 | 8 | 8 | 8.0 | 8.0 | 8.0 |
| `inbox-selection-mobile-dark` | mail-list | 7 | 7 | 6 | 8 | 6 | 8 | 6.95 | 7.0 | 8.0 |
| `inbox-selection-mobile-light` | mail-list | 7 | 7 | 6 | 8 | 6 | 8 | 6.95 | 7.0 | 8.0 |
| `reader-desktop-dark` | mail-read | 8 | 7 | 7 | 8 | 8 | 7 | 7.5 | 7.5 | 8.0 |
| `reader-desktop-light` | mail-read | 8 | 7 | 7 | 8 | 8 | 7 | 7.5 | 7.5 | 8.0 |
| `reader-mobile-dark` | mail-read | 8 | 6 | 6 | 8 | 7 | 7 | 7.0 | 7.0 | 8.0 |
| `reader-mobile-light` | mail-read | 8 | 6 | 6 | 8 | 7 | 7 | 7.0 | 7.0 | 8.0 |
