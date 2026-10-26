# Refinement screenshot review (ky-suite-v2)

Reviewer: Claude Opus 5.5 (`claude-opus-5-5`), independent screenshot reviewer, 2026-10-26.
Scope: screenshot scoring and matched before/after comparison only. Source and runtime review is a separate task.

**Result: nothing reaches 9.** No final file, cohort or product reaches 9.0 on quality or Ky fit. The after captures range from 6.1 to 8.0 on quality and from 6.8 to 8.0 on Ky fit. Every behaviour gate (keyboard, focus, contrast, states, responsive) is untested by this review, because screenshots cannot pass a gate.

## Inputs and method

- **Input:** `refinement-review-inputs.json` (sha256 in `refinement-scores.json` → `input_set`). It has 152 rows: 76 before and 76 after, covering 146 unique sha256.
- **Hashes:** every hash was re-computed and all matched.
- **Duplicates:** there are 6 exact-duplicate followers.
  - The two KyDNS desktop Appearance after captures are byte-identical to their before captures.
  - The four KyIdentity `00b-before-users-manage` captures are byte-identical to `00-before-users`.
- **Near duplicates:** none meet the rubric threshold. Each saved Sky/Forest capture under OS dark differs from its OS-light twin in 0.1–0.56% of pixels, with a max channel delta of about 200, because the timestamps differ. That also shows the saved theme overrides the OS setting in those pictures.
- **Inventory:** `refinement-captures.json` lists 216 images. The 64 not selected are intermediate stages (`01-after`, `kynotes-01-*`, `kyidentity-01-after`). They were not rating inputs (`refinement-visual-coverage.json`).
- **Viewing:** each of the 146 unique images was opened one at a time at native resolution. No contact sheet was used.
- **Blind scoring:** scores were fixed before `release-scores.json` was opened. `refinement-work/blind-scores.sha256` records the blind file hash. After that, the only changes were the three re-inspection revisions listed under Drift.
- **Arithmetic:** `refinement-work/build-scores.py` writes the outputs from `refinement-work/score-spec.py`. `refinement-work/verify-refinement.py` recomputes every total with exact Decimal ROUND_HALF_UP and checks the hashes, the schema and the inventory: 0 errors.
  - This caught a float-sum rounding bug: 5.15 had been rounded down to 5.1. The builder now uses Decimal.
- **N/A:** none was used. `suite_cohesion` is scored because seven Ky products are captured.

## Capture conditions that block cross-product comparison

| Product | Browser | Capture | Fixture |
|---|---|---|---|
| Recovery, DNS, Pulse | Chromium 153 | full page | synthetic, with live timestamps (DNS, Pulse) |
| Drive, Base | Chromium 156 | full page | synthetic |
| Identity | Chromium 153 | viewport | fresh data dir; fonts load in before and after |
| Notes | Chromium 156 | viewport | owner account. After = stage 02 dependency-merged bundle. Avatar initials and save times differ |

Before and after use the same fixture within each product, so a matched delta is a product source change. That rule has three exceptions:

- **Notes Appearance after:** the after capture carries a "Last Committed" toast and a header Save button left over from capture order, and the before capture has neither. Its small drop (−0.2 to −0.4) comes from that capture state. It is unproven whether it is a product regression.
- **Identity:** the old font 404 was a fixture problem. Both new sets load the fonts, so no part of the Identity delta comes from fonts. The wordmark changed from mono to Space Grotesk in product source.
- **Full-page vs viewport:** Pulse after, DNS dashboard and some others are full-page captures, where the sidebar background stops at 900px. That is a capture artifact. The score keeps it, with a caveat.

## Cohort summaries (separate phases, never averaged together)

Means use unique files within each phase. The four Identity user-manage before rows inherit the user-list scores, because they are the same images and no Manage menu exists in the before build.

| Cohort / task view | Product | n | Before Q | After Q | Before Ky | After Ky |
|---|---|---|---|---|---|---|
| admin-console / recovery-overview | Recovery | 4 | 7.5 (7.0–7.9) | 7.8 (7.7–7.9) | 6.7 | 6.8 |
| admin-console / replication | Recovery | 4 | 6.3 (5.5–7.0) | 7.3 | 6.4 | 6.8 |
| admin-console / dns-dashboard | DNS | 4 | 6.5 (6.0–6.9) | 7.0 (6.9–7.0) | 6.6 | 6.9 |
| admin-console / monitor-detail | Pulse | 12 | 5.6 (5.3–5.9) | 6.9 | 6.2 | 7.0 |
| admin-console / base-overview | Base | 4 | 6.8 | 6.9 (6.8–7.0) | 7.1 | 7.3 |
| admin-console / user-list | Identity | 4 | 5.4 (5.3–5.5) | 7.6 (7.2–7.9) | 6.2 | 7.4 |
| admin-console / user-manage | Identity | 4 | 5.4 (inherited) | 6.7 (6.6–6.8) | 6.2 | 7.3 |
| member-home / my-applications | Identity | 4 | 6.5 (6.2–6.7) | 6.9 (6.6–7.1) | 6.2 | 7.4 |
| drive / file-list | Drive | 4 | 7.4 (7.0–7.7) | 7.5 (7.2–7.7) | 7.6 | 7.6 |
| settings / admin-settings | Drive + Base | 8 | 6.5 (6.0–7.0) | 7.3 (7.2–7.5) | 6.9 | 7.7 |
| settings / appearance | DNS + Identity + Notes | 12 | 7.4 (6.7–8.0) | 7.6 (6.7–8.0) | 7.1 | 7.5 |
| notes / notebook-list | Notes | 4 | 5.5 | 7.0 | 5.1 | 7.2 |
| notes / note-editor | Notes | 8 | 5.1 | 6.3 (6.1–6.5) | 5.0 | 6.9 |

The Appearance picker is its own task view. It does not stand in for an admin task.

The product-level coverage summary is in `refinement-cohorts.json` → `product_phase_coverage`, labelled "not a ranking". The task views, browsers and capture modes differ between products, so the table gives no global ordering.

## Matched pairs (76): what changed, from the pixels

The mean pair delta is +0.87 quality and +0.83 Ky fit. Quality fell in 4 pairs (all Notes Appearance, from capture state) and was unchanged in 8 (DNS Appearance desktop, byte-identical; DNS dashboard desktop; Drive files desktop; Recovery overview desktop).

- **Identity (+1.1 Q, +1.15 Ky)**
  - Users: before, eight unlabeled icon buttons ran past the table, clipping the last column. After, one labeled Manage button (desktop 5.5 → 7.9). On mobile the clipped table became stacked label/value rows (5.3 → 7.2).
  - Shell: the mono wordmark and orange letter-spaced "ID AUTHORITY" tagline became a sans wordmark with a muted tagline.
  - Residuals:
    - Manage opens inline, stretching the row to about 460px. The mobile menu runs off the viewport.
    - The two-row mobile nav is clipped at both edges, with no drawer.
    - The Applications empty state has no action.
    - In Space Grotesk the capital I reads like an l ("Kyldentity").
- **Pulse (+1.3 Q)**
  - The browser-default blue link is now ink.
  - Delete moved out of the header into a "Stop watching" section.
  - Boxed uppercase fact cards became a ruled definition list.
  - This holds in Busnes, Sky and Forest alike.
  - Residuals:
    - Delete is still a filled danger button.
    - The heavy red alert bar and status card remain.
    - The mobile tabs clip at "Logs" and the account name is hidden.
- **Notes (+0.92 Q, +1.5 Ky)**
  - The header Save, the + button, the recovery button, the orange mobile drawer bar and the toast lost their orange fills.
  - The sparkle and orange icons are gone, and the uppercase labels are now sentence case.
  - Residuals:
    - The note body uses a different typeface and floats about 145px below the toolbar (editor 6.1–6.5).
    - The ✎/⇩ glyph icons remain.
    - The header Save button and the toast leak into Settings.
    - The account region has no role and no sign-out.
- **Base (+0.72 Q)**
  - Settings: a card-in-card with an orange icon, chip and green text became a flat definition list (6.2 → 7.5).
  - The sqlite chip lost its orange.
  - Residuals: the Overview still has no single primary action, among four equal cards, and its copy is jargon ("Feature 0").
- **Recovery (+0.7 Q)**
  - The mobile header collapsed to an Account button.
  - Replication gained an h1, and on mobile it no longer clips the empty tables (5.5 → 7.3).
  - Residuals:
    - The shell is still a horizontal tab bar, not the contract sidebar, which caps Ky fit at 6.8.
    - The mobile tabs clip with no cue.
    - The primary buttons are about 28px tall.
- **DNS (+0.54 Q)**
  - On mobile, the three-row wrapped header became one row with a tab scroller, the stat grid realigned and the chart axes became legible (6.0 → 7.0).
  - The Appearance desktop pair is byte-identical: no change.
  - Residuals:
    - Monospace metric labels.
    - Desktop chart axis labels are now about 10px.
    - The shell shows no signed-in name.
- **Drive (+0.25 Q)**
  - The duplicate theme `<select>` in Settings is replaced by "Open Appearance" (desktop 7.0 → 7.3).
  - The file list is otherwise unchanged; desktop moved 5px.
  - Residuals:
    - Admin accordions stack above My files.
    - The mobile nav hides items off-screen with no drawer.
    - This input set contains no Drive Appearance page.

## Behaviour that the pictures cannot show (all untested here)

- **Keyboard:** radio-group arrow keys, tab order, menu and dialog focus return.
- **Focus:** visible focus rings in each theme.
- **Contrast:** computed ratios. For example, the dark grey unselected radios on the dark theme look low-contrast, but that is unmeasured. The same goes for the status and danger colours on named themes (prior F3/G1/G2).
- **States:** cross-tab sync, OS-follow after a change, first-paint theme, and loading/error states.
- **Destructive flows:** the Pulse delete confirmation and Identity Delete user.

## Drift against `release-scores.json` (loaded only after scoring)

- **Matched rows:** 60 new before files match a baseline row by product, surface, viewport and theme, and 31 of them are byte-identical images.
- **Mean drift on those before files:** −0.29 quality and −0.34 Ky fit. The new scores are stricter. There is no upward Ky drift to explain.
- **After files:** 58 match a baseline row but are different images, at +0.49 mean. That reflects product change plus fixture differences. It is not a rubric measurement and not comparable improvement.
- **Per-file record:** `refinement-work/drift.json` holds `prior_total`, `total`, `delta` and `same_image` for every matched file.

Every |Δ| ≥ 0.5, with its cause:

- **DNS Appearance mobile, −0.6 / −0.7 (same image)** — `anchor`. I scored the three-row wrapped header lower on density and coherence. Its Ky fit fell 1.0 because of the shell score.
- **DNS, Drive and Identity desktop Appearance, DNS dashboard, and Drive mobile: Ky fit −0.6 to −1.0** — `anchor`. I gave suite cohesion 7–8 rather than 9, and shell 7 where no signed-in name is visible (DNS) or the wordmark is mono with an orange tagline (Identity before).
- **Identity users, −0.7 / −0.9 (different image: the old capture had a font 404)** — `correction`. The prior round read "nine icons crowding Actions". At full resolution the last header and icon are clipped at the table's right edge, so I scored it as clipping.
- **Pulse Sky/Forest mobile, −0.9 (different fixture images)** — `correction`. The default link colour, the 130px alert bar, Delete beside the title and the clipped tab strip together put it at the "works but fights" anchor.
- **Recovery replication mobile, −0.6 (same image)** — `anchor`. The clipped table text and columns are a 3 on density, because clipping is the broken anchor.
- **Base Overview, −0.6 / −0.7, and Settings, −0.5 / −0.7 (same images)** — `anchor`. Four equal cards with no primary scored hierarchy 6. The card-in-card with decorative orange and green lowered coherence and colour.
- **Notes Appearance desktop light, +1.2 (different image)** — `artifact`. The baseline image had a filled orange Save button and an orange toast, and the new before has neither.

Same-image dimension spreads ≥ 2 were resolved by re-viewing the images, not by averaging. The revisions are recorded in `refinement-cohorts.json` → `post_drift_revisions`:

- **DNS mobile before, shell 4 → 5:** the navigation is readable and reachable, and nothing is clipped.
- **DNS Appearance mobile before, suite cohesion 6 → 7:** the content is the shared picker.
- **Drive, accent discipline 7 → 8 on every row:** a checked checkbox is a selection state, which the contract allows.

## Answers for root

- **Ranges.**
  - Before: quality 5.0–8.0, Ky fit 4.8–8.0.
  - After: quality 6.1–8.0, Ky fit 6.8–8.0.
  - After cohort means: quality 6.3 (notes editor) to 7.8 (recovery overview); Ky fit 6.8 to 7.7.
- **Any cohort or brand fit ≥ 9:** none. No file reaches 9 either, and acceptance would also need passed gates that this review did not test.
- **No competitor claims:** these inputs contain only Ky products.

## Outputs

- `refinement-scores.json`: one row for each of the 152 inputs, in the baseline row schema plus `phase`, `paired_file`, `product` and `stage`. Followers carry `duplicate_of` and inherited scores.
- `refinement-cohorts.json`: per-phase cohort summaries, the 76 matched pairs with dimension deltas, the task-view map, the ranges, the ≥ 9 flags and the revisions.
- `refinement-visual-coverage.json`: the viewing method, inventory reconciliation and the 64 unselected files.
- `refinement-work/`: the spec, the builder, the verifier, the pair-diff and drift scripts and their outputs. No baseline files or `products/` were edited.
