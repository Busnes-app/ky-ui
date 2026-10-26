# KyMessages stage 06: independent final screenshot review

- **Reviewer:** Claude Opus 5.5 (`claude-opus-5-5`), an independent review sub-agent in Claude Code (T3 Code), 2026-10-26. I did not implement, commit, push or open PRs.
- **Scope:** KyMessages only. KyPost and KyCalendar have their own reviewers. This review scores no competitor and publishes no cross-provider ranking.
- **Rubric:** `ky-suite-v2`.
  - Quality weights: hierarchy 0.20, typography 0.15, density/layout 0.20, colour 0.15, visible affordances 0.15, coherence 0.15.
  - Per-file totals are rounded half-up to 0.1. Means are computed from unrounded weighted sums and rounded half-up to 0.01.
  - Ky fit is separate: five dimensions at 0.20 each.
- **Machine record:** `implemented-messages-release-scores.json`. It holds all 78 files, the inventory, the aggregates, the gates, the input hashes and the arithmetic checks.

## Verdict

**KyMessages does not reach 9/10.** The measured result:

| Measure | Result | Target |
|---|---|---|
| Quality, admin-console (n=48) | **7.50** (min 6.8, max 8.0) | ≥ 9.0 |
| Quality, settings (n=4) | **7.53** (min 7.4) | ≥ 9.0 |
| Quality, auth (n=8) | **8.13** (min 8.0) | ≥ 9.0 |
| Equal-cohort-weight mean (not a ranking) | **7.72** | — |
| Ky fit, all 60 files | **8.51** (min 7.4, change password) | ≥ 9.0 |
| Files at or above 9.0 | 0 of 60 | — |
| Behaviour gates | 0 pass, 1 fail (`states`), 4 untested | all pass |

KyMessages now reads as a calm Busnes operator console. It is consistent in shell, palette and accent discipline, and clearly better than the stage 00 final. No cohort reaches 9. What still holds it back is composition, not branding:

- Backup & recovery is a stack of boxes.
- The Audit desktop table spends its width badly.
- SCIM and change password are off-pattern.
- The empty and offline states inform you but give you no next step.

The stage 06 status-truth fixes are visibly correct.

## Source and capture

- **Source set:** only the 78 files named `kymessages-06-after-*.png`, with `screenshots/kymessages-06-after-manifest.json` (`1fbf8f0f…`). That is 60 viewport images and 18 full-page images.
- **Hashes:** all 78 SHA-256 values match the manifest.
- **Duplicates:** no exact or near duplicates. The closest pair is overview vs overview-offline, desktop light, with 0.519% of pixels differing. That is above the 0.1% rule.
- **Build:**
  - `KyMessage-Server` worktree `ui/council-cohesion`, HEAD `05147493…`;
  - `web/src` patch `a5430c0d…` (96,999 bytes; I verified the patch file's hash);
  - server binary `73591be1…`;
  - Chromium 153.0.8010.12, America/Chicago, en-US.
- **Theme:** set through the product's own "Color theme" select after a real sign-in. The pointer was parked at (0, 0) before every capture.
- **Fixture:** fresh SQLite and the `init-admin` admin. Matrix, captcha and SCIM are off and `KY_BACKUP_DIR` is set. The fixture also includes one real key pin and one real deposit for the "written" pass.
- **Loading:** `health-loading` is 2500 ms of CDP latency with the request in flight.
- **Offline:** `health-offline` and `overview-offline` are a real browser-context offline condition.
- **Scored set:** 15 surfaces × Busnes Light/Dark × 1280×900 and 390×844 gives 60 scored viewport images.
- **Full-page images:** the 18 full-page captures were consulted for content below the fold. They were excluded from every count and mean. In them the fixed desktop sidebar stops at 900 px, which is a capture artifact.

## Method and blind freeze

1. I read the DOX chain: workspace `AGENTS.md`, `ky-ui/AGENTS.md`, `reviews/AGENTS.md`, `skills/AGENTS.md`, `SKILL.md`, `rubric.md` and `design-contract.md`.
2. I listed the inventory, checked the hashes and measured near-duplicate pixel differences with a script.
3. I viewed all 60 viewport images at full resolution: Light and Dark, desktop and phone, online, loading and offline.
4. I opened the full-page captures for Backup (both states), Settings and Audit (desktop and phone) for content below the fold.
5. For `suite_cohesion` only, I also viewed one current capture from each other product: `kypost-05-after-inbox-desktop-light.png` and `kycalendar-06-confirm1-month-desktop-light.png`.
6. I wrote every score and observation to a scratch file and froze it: SHA-256 `18f0f9f7…0921`, 02:26 −04:00.
7. Only after the freeze did I read `implemented-post-messages-review.md`/`-scores.json`, the stage 05/06 sections of `kymessages-implementation.md` and `kymessages-06-after-checks.json`. I made no score changes after that.
8. A script recomputed every total, mean and the equal-weight mean. Totals were also recomputed in integer arithmetic.

**Cohorts.** The cohort comes from what the screen shows:

- `auth`: sign-in and forced password change. These are console screens before the shell appears.
- `settings`: the "System Settings & Architecture" page.
- `admin-console`: everything else in the operator console.

None of these is Element chat. MemberHome, Element, Matrix-on tables and dialogs, 2FA enrolment and named themes are `N/A`, not zero.

## Cohort results (within KyMessages; no competitor match, so no Ky gap)

| Cohort | n | Mean | Min | Max | Desktop / phone | Light / dark | Ky fit mean (min) |
|---|---|---|---|---|---|---|---|
| admin-console | 48 | **7.50** | 6.8 (backup-empty) | 8.0 | 7.46 / 7.55 | 7.52 / 7.49 | 8.61 (8.2) |
| settings | 4 | **7.53** | 7.4 (phone dark) | 7.7 | 7.63 / 7.43 | 7.60 / 7.45 | 8.60 (8.6) |
| auth | 8 | **8.13** | 8.0 (change password) | 8.4 | 8.18 / 8.08 | 8.13 / 8.13 | 7.90 (7.4) |

The admin-console mean by condition is: online 7.49, loading 7.60, error 7.50.

### By surface

| Surface | Cohort | n | Mean | Min–max | Ky fit |
|---|---|---|---|---|---|
| login | auth | 4 | 8.25 | 8.2–8.4 | 8.4 |
| change-password | auth | 4 | 8.00 | 8.0 | 7.4 |
| health-offline | admin-console | 4 | 7.93 | 7.9–8.0 | 8.7 |
| users / agents / rooms (Matrix off) | admin-console | 4 each | 7.85 | 7.8–8.0 | 8.8 |
| overview | admin-console | 4 | 7.75 | 7.7–7.9 | 8.8 |
| audit | admin-console | 4 | 7.63 | 7.5–7.8 | 8.6 |
| health-loading | admin-console | 4 | 7.60 | 7.6 | 8.6 |
| health | admin-console | 4 | 7.58 | 7.5–7.7 | 8.5 |
| settings | settings | 4 | 7.53 | 7.4–7.7 | 8.6 |
| scim | admin-console | 4 | 7.15 | 7.2 (each weighted sum is exactly 7.15) | 8.2 |
| overview-offline | admin-console | 4 | 7.08 | 7.0–7.2 | 8.7 |
| backup-written | admin-console | 4 | 7.00 | 7.0 | 8.4 |
| backup-empty | admin-console | 4 | 6.80 | 6.8 | 8.4 |

## Findings, most severe first

These are what the pictures show. Each finding lists the files it affects and the dimensions it lowered.

1. **Backup & recovery is box-heavy and lowest in the product** (`backup-empty-*`, `backup-written-*`; density 6 and coherence 6 on all 8 files).
   - The first screen stacks an amber banner, four status cards, a status line and then bordered section cards. Below the fold there are two more cards with forms.
   - The written state adds two consecutive green banners that say related things.
   - Green is spent on neutral facts: "Pinned", "1 of 7", "Daily", and both banners. Colour scores 7 in the written state.
   - In the empty state the disabled "Back up now" is a tan filled button that can read as pressed. Disabled "Download capsule" differs from the enabled "Run restore drill" only by text tone.
   - The "Back up now" section heading repeats its button label.
   - On phones the primary action and the pin/pair forms are well below the fold. The real next step ("pin the key below") is about 1,500 px down.
2. **Audit on desktop spends its width badly** (`audit-desktop-*`; density 6).
   - When and Details are wide. Target is narrow, so a 64-character key ID wraps over seven lines and two rows are about four times the height of the others.
   - The table sits inside a bordered card, while other pages use flat full-bleed rows.
   - Phone Audit is now good: every field is a labelled line (density 7).
3. **SCIM is off-pattern** (`scim-*`; coherence 6, hierarchy 7, typography 7).
   - The title "SCIM 2.0 Directory & Inbound Provisioning" does not match the navigation label "Directory & SCIM". It wraps to two lines on phones.
   - The headings are Title Case, while the rest of the console is sentence case.
   - A bordered callout is nested inside a bordered card.
   - The read-only URL has no copy action.
4. **Empty and offline states inform you but offer no next action.**
   - Users, Agents and Rooms: "Set it up with `matrix-init` … docs/CHAT-SETUP.md". The doc path is plain text, not a link, and no control is offered (hierarchy 7, affordances 7).
   - Overview offline repeats "Unavailable: the server could not be reached" in all three rows. The text is red with no icon. There is no page-level message or retry, and the "Open …" buttons stay enabled (7 on hierarchy, density, colour, affordances and coherence; colour 6 in dark).
   - Health uses a banner with an icon for the same condition, so the console has two vocabularies for one error.
5. **The forced password change is unbranded** (`change-password-*`; coherence 7, Ky fit shell 5, suite_cohesion 6).
   - The sign-in screen has the stamp, the wordmark and a theme select. The page right after it has none of them.
   - Its length rule is in the paragraph, not by the fields.
6. **Hue collisions in dark theme** (`health-*-dark`, `health-offline-*-dark`, `overview-offline-*-dark`; colour 6–7, Ky fit accent_discipline 8).
   - The warning amber and the danger salmon sit close to the orange accent that marks the selected navigation row.
   - Icons and wording carry the meaning, so this is a polish defect, not a broken state. Contrast for these state rows was not measured.
7. **Settings details** (`settings-*`; affordances 6 dark / 7 light, coherence 7).
   - The page title differs from the navigation label.
   - Two theme selects appear on one page (sidebar and Appearance).
   - There is a native file input.
   - In dark theme the disabled "Use default", "Upload logo" and "Reset logo" look almost the same as the enabled "Set up two-factor sign-in".
   - The full-page phone capture shows the Branding row wrapping unevenly, with the file input truncated to "N…".
8. **Health composition** (`health-*`; density 7, coherence 7).
   - Two component cards have large empty interiors.
   - Four long amber "Warn" lines dominate the network section, which differs from the flat rows on Overview.
   - The loading state is a status line, not an in-place skeleton. The design contract asks for skeletons.

**What is good:**

- One shell: a 240 px sidebar, the stamp and wordmark, 14 px navigation rows, and an account region pinned to the bottom with the role and sign-out.
- The selected navigation row is unambiguous: a white surface in Light, a warm surface in Dark, and an orange rail. On phones, the current tab is visibly in view.
- Orange is limited to the single primary, the selection and focus.
- The Overview columns align.
- Statuses are always text plus icon.
- Health offline is clear and truthful.
- Login is the strongest screen (8.2–8.4).

## Responses to earlier findings (checked against the stage 06 pictures)

| Earlier finding | Stage 06 evidence | Status |
|---|---|---|
| Phone Audit lost fields | `audit-mobile-*`: When, Who, What, Target, Outcome, Details and IP are each a labelled line | Fixed (visual) |
| Selected surface disappeared on hover | Pointer parked at (0, 0): the selected row is a white surface plus rail in Light and a warm surface plus rail in Dark. No hovered-selected image exists in stage 06; recorded `nav_selected_hovered: false` | Unhovered selection fixed (visual). Hover case **unproven** by pictures; the shared `:where()` fix was not exercised here |
| Amber warnings looked orange | Light: brown-amber text with a triangle icon, clearly not the accent. Dark: still close to the accent hue | Fixed in Light; residual in Dark (finding 6) |
| Backup "0" falsely green | `backup-empty-*`: "0 of 7" and "Daily" are neutral pills, and the value reads "Idle until a key is pinned" | Fixed (visual) |
| Overview misaligned | `overview-*`: one status column and equal-width actions | Fixed (visual) |
| Health offline kept a stale green Up | `health-offline-*`: no Up badges and no Pass line; "Network check unavailable." | Fixed (visual). The recorded regression test is not executed by me |
| Offline Overview invented a KyIdentity sync row | `overview-offline-*`: three rows, no sync row | Fixed (visual) |
| Older stage 03 captures showed a stale shell | All 78 come from one manifest, patch `a5430c0d`, binary `73591be1`; `current_tab_in_view` is true on all 78 rows | Resolved |

**Remaining notes from the implementation record, judged independently:**

| Note | My severity |
|---|---|
| Overview offline repeats the same message | **Medium**. It is the second-lowest surface (7.08). |
| Health failure has no explicit "status unknown" line | **Low**. The banner plus the absent cards already say the facts are gone, so I would not prioritise it. |
| Change password is unbranded | **Medium for brand fit** (Ky fit 7.4, the lowest). Low for quality (8.0). |
| Audit long Target wrapping | **Medium**. It is the main desktop Audit drag. |
| Some titles differ from navigation | **Low to medium**. It contributes on SCIM and Settings. |

**What the notes do not list:**

- Backup composition (finding 1). This is the largest single drag.
- Overuse of green in Backup.
- Ambiguous disabled buttons (Backup, dark Settings).
- Dark-theme hue collisions.
- The phone Settings Branding wrap.
- Empty states with no clickable next step.

## Behaviour gates

A screenshot cannot pass a gate. "Recorded" means the evidence was taken from the implementation record or `kymessages-06-after-checks.json`. I did not run any test, build or browser check.

| Gate | Status | Evidence |
|---|---|---|
| keyboard | untested | **Recorded:** `kymessages-05-after-keyboard-{chromium,firefox}.json` covers navigation selection, Audit focus order and the phone chip at 1280 and 390. That run predates the stage 06 source.<br>**Missing:** a walk of every task path (Backup forms, Settings, change password) and evidence that dialogs return focus.<br>**Not run:** Matrix-on dialogs, 2FA, MemberHome and WebKit. |
| focus | untested | **Recorded:** 0 focus stops without an indicator across 48 online states in Busnes Light and Dark. The minimum focus-ring ratio is 4.93 (Light) and 6.47 (Dark).<br>**Not measured:** the 12 loading and offline rows, named themes and the Matrix-on surfaces. |
| contrast | untested | **Recorded:** 48 online states. Text is at least 4.99:1 (Light) and 5.11:1 (Dark). Control borders are at least 3.38:1 and 4.78:1. There are 0 failures.<br>**Not measured:** the loading and offline states, including the danger banner and red status text, and the named themes. The rubric requires every shipped theme. |
| states | **fail** | This is a coverage failure, not an observed defect. Loading and error are captured for Health and Overview only, and for none of the other seven task views. No field validation or server form error is captured. The loading capture is a status line, not a skeleton. |
| responsive | untested | **Recorded:** 0 px overflow and no control under 40 px at 390 and 1280, and `current_tab_in_view` is true on all 78 rows.<br>**Visual:** the phone Audit fix is confirmed.<br>**Not covered:** Matrix-on phone tables (noted as still scrolling sideways, unverified), 2FA and MemberHome. |
| status_truth_offline (supplementary, not in the rubric) | pass | **Visual:** health-offline and overview-offline show no stale facts.<br>**Recorded:** two regression tests fail on the stage 05 code and pass on `a5430c0d`. |

**Recorded checks, not executed by me:**

- `tsc -b` clean.
- Vitest 157/157.
- `check-vendor`: ky-ui 0.3.0.
- `test:browser` 7/7: Chromium and Firefox.
- `KY_SMOKE_PORT=18097 make ci` exits 0: tidy, gofmt, vet and compose checks, race tests at 76.4% coverage, `npm ci` with 0 vulnerabilities, and smoke with 85 `[ok]`.
- Two byte-identical builds.

**Not run:** `make matrix-acceptance`, `make test-postgres`, WebKit (host libraries missing), and MemberHome and Element captures.

## Missing evidence (`N/A`, never zero)

- MemberHome: needs a KyIdentity SSO member, and the harness has no console SSO client.
- Element chat: stock Element was not captured.
- With Matrix and SCIM on: the Users, Agents and Rooms tables, the Agents token dialog, the Rooms confirmations, 2FA enrolment and SCIM with provisioned users.
- Named themes. Only Busnes Light and Dark were captured.
- Hovered and pressed states, animation, screen-reader output, and computed contrast of the state captures.

## Comparison with the previous round (different images and build; not rubric drift)

The previous round scored `kymessages-00-after-*` from patch `51231a71` with another reviewer instance. These are new captures of a changed build, so a delta mixes product change with reviewer difference. It is not rubric drift.

| Cohort | Prior mean | Now | Δ | Prior Ky fit | Now |
|---|---|---|---|---|---|
| admin-console | 6.78 | 7.50 | +0.72 | 7.59 | 8.61 |
| settings | 6.79 | 7.53 | +0.74 | 7.25 | 8.60 |
| auth | 7.93 | 8.13 | +0.20 | 7.60 | 7.90 |
| Equal-cohort-weight mean | 7.17 | 7.72 | +0.55 | 7.56 | 8.51 |

By surface:

| Surface | Prior | Now | Δ |
|---|---|---|---|
| Audit | 6.16 | 7.63 | +1.47 |
| Users, Agents, Rooms | 6.91 | 7.85 | +0.94 |
| Health | 6.66 | 7.58 | +0.92 |
| Settings | 6.79 | 7.53 | +0.74 |
| Backup | 6.11 | 6.80 empty / 7.00 written | +0.69 / +0.89 |
| Change password | 7.65 | 8.00 | +0.35 |
| Overview | 7.49 | 7.75 | +0.26 |
| Login | 8.20 | 8.25 | +0.05 |
| SCIM | 7.11 | 7.15 | +0.04 |

The visible causes match the stage 05 and 06 changes:

- Audit stacks on phones.
- The selection is restored.
- Warnings carry icons.
- The Backup tones are corrected.
- The Overview grid aligns.

SCIM and Login, which barely changed, barely moved. That suggests the reviewers broadly agree on the screens that did not change.

**Caution on Ky fit.** Ky fit rose more (+0.95) than quality (+0.55). Part of that is the real shell and selection fix. Part may be my weighting of `shell` and `accent_discipline`: I gave `shell` 9 on 52 of 60 files, where the prior reviewer gave 5–8 (8 on 22 of 44). A single-reviewer Ky fit of 8.51 should not be treated as precise to ±0.3.

## Arithmetic and inventory checks

- 78 inventory rows and 78 file entries, the same list. 60 are scored and 18 are unscored full-page variants, each with `variant_of` set to its viewport image.
- Every total was recomputed from the weights with `Decimal`, and again in integer arithmetic (`(Σ weight×100×score + 5) // 10 / 10`). There are 0 mismatches. Every Ky fit value was recomputed the same way.
- Cohort means come from unrounded weighted sums: admin-console 7.50, settings 7.53, auth 8.13. The equal-cohort-weight mean is (7.5042 + 7.5250 + 8.1250) / 3 = 7.7181, rounded to **7.72**.
- All 60 files have six non-empty observations.

## Per-file scores

Columns: hierarchy, typography, density/layout, colour, visible affordances and coherence, then the total and Ky fit. Filenames drop the `kymessages-06-after-` prefix.

| File | SHA-256 | Cohort | State | H | T | D | C | A | Co | Total | Ky fit |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `agents-desktop-dark.png` | `de73baa88ce9` | admin-console | empty | 7 | 8 | 7 | 9 | 7 | 9 | **7.8** | 8.8 |
| `agents-desktop-light.png` | `971808c4258a` | admin-console | empty | 7 | 8 | 7 | 9 | 7 | 9 | **7.8** | 8.8 |
| `agents-mobile-dark.png` | `7c1aad7874c0` | admin-console | empty | 7 | 8 | 8 | 9 | 7 | 9 | **8.0** | 8.8 |
| `agents-mobile-light.png` | `c26e38a1dc93` | admin-console | empty | 7 | 8 | 8 | 9 | 7 | 9 | **8.0** | 8.8 |
| `audit-desktop-dark.png` | `263b28d209c7` | admin-console | populated | 8 | 7 | 6 | 9 | 8 | 7 | **7.5** | 8.6 |
| `audit-desktop-light.png` | `1398f07807a8` | admin-console | populated | 8 | 7 | 6 | 9 | 8 | 7 | **7.5** | 8.6 |
| `audit-mobile-dark.png` | `e20ab4825d36` | admin-console | populated | 8 | 8 | 7 | 9 | 8 | 7 | **7.8** | 8.6 |
| `audit-mobile-light.png` | `b6f1d5ec42c9` | admin-console | populated | 8 | 8 | 7 | 9 | 8 | 7 | **7.8** | 8.6 |
| `backup-empty-desktop-dark.png` | `b436469bb49d` | admin-console | empty | 7 | 7 | 6 | 8 | 7 | 6 | **6.8** | 8.4 |
| `backup-empty-desktop-light.png` | `dd1b1c280f62` | admin-console | empty | 7 | 7 | 6 | 8 | 7 | 6 | **6.8** | 8.4 |
| `backup-empty-mobile-dark.png` | `6f4f858f550b` | admin-console | empty | 7 | 7 | 6 | 8 | 7 | 6 | **6.8** | 8.4 |
| `backup-empty-mobile-light.png` | `3579561098a3` | admin-console | empty | 7 | 7 | 6 | 8 | 7 | 6 | **6.8** | 8.4 |
| `backup-written-desktop-dark.png` | `8fd0dffb9742` | admin-console | populated | 8 | 7 | 6 | 7 | 8 | 6 | **7.0** | 8.4 |
| `backup-written-desktop-light.png` | `2c4daff5a7a7` | admin-console | populated | 8 | 7 | 6 | 7 | 8 | 6 | **7.0** | 8.4 |
| `backup-written-mobile-dark.png` | `bcae9ad6a6f1` | admin-console | populated | 8 | 7 | 6 | 7 | 8 | 6 | **7.0** | 8.4 |
| `backup-written-mobile-light.png` | `f676728d90f0` | admin-console | populated | 8 | 7 | 6 | 7 | 8 | 6 | **7.0** | 8.4 |
| `change-password-desktop-dark.png` | `e1b60d460821` | auth | populated | 8 | 8 | 8 | 9 | 8 | 7 | **8.0** | 7.4 |
| `change-password-desktop-light.png` | `18a5a3f87d62` | auth | populated | 8 | 8 | 8 | 9 | 8 | 7 | **8.0** | 7.4 |
| `change-password-mobile-dark.png` | `4d2c51e91ea7` | auth | populated | 8 | 8 | 8 | 9 | 8 | 7 | **8.0** | 7.4 |
| `change-password-mobile-light.png` | `20df4e438a34` | auth | populated | 8 | 8 | 8 | 9 | 8 | 7 | **8.0** | 7.4 |
| `health-desktop-dark.png` | `02d903edc6f0` | admin-console | populated | 8 | 8 | 7 | 7 | 8 | 7 | **7.5** | 8.4 |
| `health-desktop-light.png` | `f3aee42ebc38` | admin-console | populated | 8 | 8 | 7 | 8 | 8 | 7 | **7.7** | 8.6 |
| `health-loading-desktop-dark.png` | `6c5b0c6a9800` | admin-console | loading | 7 | 8 | 7 | 9 | 7 | 8 | **7.6** | 8.6 |
| `health-loading-desktop-light.png` | `e769c373850d` | admin-console | loading | 7 | 8 | 7 | 9 | 7 | 8 | **7.6** | 8.6 |
| `health-loading-mobile-dark.png` | `abc1713fcf7f` | admin-console | loading | 7 | 8 | 7 | 9 | 7 | 8 | **7.6** | 8.6 |
| `health-loading-mobile-light.png` | `f866d1954fcb` | admin-console | loading | 7 | 8 | 7 | 9 | 7 | 8 | **7.6** | 8.6 |
| `health-mobile-dark.png` | `b7873a3b77e1` | admin-console | populated | 8 | 8 | 7 | 7 | 8 | 7 | **7.5** | 8.4 |
| `health-mobile-light.png` | `359d7cade9d8` | admin-console | populated | 8 | 8 | 7 | 8 | 8 | 7 | **7.7** | 8.6 |
| `health-offline-desktop-dark.png` | `135809f481b9` | admin-console | error | 8 | 8 | 8 | 7 | 8 | 8 | **7.9** | 8.6 |
| `health-offline-desktop-light.png` | `2e64016be628` | admin-console | error | 8 | 8 | 8 | 8 | 8 | 8 | **8.0** | 8.8 |
| `health-offline-mobile-dark.png` | `1a08254ce413` | admin-console | error | 8 | 8 | 8 | 7 | 8 | 8 | **7.9** | 8.6 |
| `health-offline-mobile-light.png` | `cbcdef0d2e9d` | admin-console | error | 8 | 8 | 8 | 8 | 8 | 8 | **8.0** | 8.8 |
| `login-desktop-dark.png` | `55d50b39102d` | auth | populated | 9 | 8 | 8 | 9 | 8 | 8 | **8.4** | 8.4 |
| `login-desktop-light.png` | `5b7399c75a9b` | auth | populated | 9 | 8 | 8 | 9 | 8 | 8 | **8.4** | 8.4 |
| `login-mobile-dark.png` | `c33bfc159bcb` | auth | populated | 9 | 8 | 7 | 9 | 8 | 8 | **8.2** | 8.4 |
| `login-mobile-light.png` | `dd4becc3f34c` | auth | populated | 9 | 8 | 7 | 9 | 8 | 8 | **8.2** | 8.4 |
| `overview-desktop-dark.png` | `cec39d322beb` | admin-console | populated | 8 | 8 | 7 | 7 | 8 | 8 | **7.7** | 8.8 |
| `overview-desktop-light.png` | `f17b2687f4ff` | admin-console | populated | 8 | 8 | 7 | 7 | 8 | 8 | **7.7** | 8.8 |
| `overview-mobile-dark.png` | `00ccc0226fb9` | admin-console | populated | 8 | 8 | 8 | 7 | 8 | 8 | **7.9** | 8.8 |
| `overview-mobile-light.png` | `b00d82c7ab2c` | admin-console | populated | 8 | 8 | 8 | 7 | 8 | 8 | **7.9** | 8.8 |
| `overview-offline-desktop-dark.png` | `14242c524b67` | admin-console | error | 7 | 8 | 7 | 6 | 7 | 7 | **7.0** | 8.6 |
| `overview-offline-desktop-light.png` | `41441e66be34` | admin-console | error | 7 | 8 | 7 | 7 | 7 | 7 | **7.2** | 8.8 |
| `overview-offline-mobile-dark.png` | `e541f8bfa691` | admin-console | error | 7 | 8 | 7 | 6 | 7 | 7 | **7.0** | 8.6 |
| `overview-offline-mobile-light.png` | `4856d592c8e1` | admin-console | error | 7 | 8 | 7 | 7 | 7 | 7 | **7.2** | 8.8 |
| `rooms-desktop-dark.png` | `7ac01c247622` | admin-console | empty | 7 | 8 | 7 | 9 | 7 | 9 | **7.8** | 8.8 |
| `rooms-desktop-light.png` | `eb2057be6e04` | admin-console | empty | 7 | 8 | 7 | 9 | 7 | 9 | **7.8** | 8.8 |
| `rooms-mobile-dark.png` | `e9fea95bb7bb` | admin-console | empty | 7 | 8 | 8 | 9 | 7 | 9 | **8.0** | 8.8 |
| `rooms-mobile-light.png` | `857f03595a8f` | admin-console | empty | 7 | 8 | 8 | 9 | 7 | 9 | **8.0** | 8.8 |
| `scim-desktop-dark.png` | `d73d3f61e171` | admin-console | empty | 7 | 7 | 7 | 8 | 8 | 6 | **7.2** | 8.2 |
| `scim-desktop-light.png` | `15d7bbc9f421` | admin-console | empty | 7 | 7 | 7 | 8 | 8 | 6 | **7.2** | 8.2 |
| `scim-mobile-dark.png` | `7e73058d8833` | admin-console | empty | 7 | 7 | 7 | 8 | 8 | 6 | **7.2** | 8.2 |
| `scim-mobile-light.png` | `158c24f1acfc` | admin-console | empty | 7 | 7 | 7 | 8 | 8 | 6 | **7.2** | 8.2 |
| `settings-desktop-dark.png` | `a2c4483f29c1` | settings | populated | 8 | 8 | 8 | 8 | 6 | 7 | **7.6** | 8.6 |
| `settings-desktop-light.png` | `318579fd4afc` | settings | populated | 8 | 8 | 8 | 8 | 7 | 7 | **7.7** | 8.6 |
| `settings-mobile-dark.png` | `639e8757309f` | settings | populated | 8 | 8 | 7 | 8 | 6 | 7 | **7.4** | 8.6 |
| `settings-mobile-light.png` | `57596be8c51d` | settings | populated | 8 | 8 | 7 | 8 | 7 | 7 | **7.5** | 8.6 |
| `users-desktop-dark.png` | `62a1c47f2895` | admin-console | empty | 7 | 8 | 7 | 9 | 7 | 9 | **7.8** | 8.8 |
| `users-desktop-light.png` | `352a6b8aaa8f` | admin-console | empty | 7 | 8 | 7 | 9 | 7 | 9 | **7.8** | 8.8 |
| `users-mobile-dark.png` | `cdf71d20fa1b` | admin-console | empty | 7 | 8 | 8 | 9 | 7 | 9 | **8.0** | 8.8 |
| `users-mobile-light.png` | `255631754218` | admin-console | empty | 7 | 8 | 8 | 9 | 7 | 9 | **8.0** | 8.8 |

## Unscored files (18)

Each is a full-page variant of the viewport image with the same name without `-full`. I consulted it for content below the fold and excluded it from every count and mean. In these captures the fixed sidebar stops at 900 px and the sticky phone header renders mid-page, which is a capture artifact.

- `kymessages-06-after-settings-desktop-light-full.png`
- `kymessages-06-after-backup-empty-desktop-light-full.png`
- `kymessages-06-after-health-mobile-light-full.png`
- `kymessages-06-after-settings-mobile-light-full.png`
- `kymessages-06-after-backup-empty-mobile-light-full.png`
- `kymessages-06-after-settings-desktop-dark-full.png`
- `kymessages-06-after-backup-empty-desktop-dark-full.png`
- `kymessages-06-after-health-mobile-dark-full.png`
- `kymessages-06-after-settings-mobile-dark-full.png`
- `kymessages-06-after-backup-empty-mobile-dark-full.png`
- `kymessages-06-after-audit-desktop-light-full.png`
- `kymessages-06-after-backup-written-desktop-light-full.png`
- `kymessages-06-after-audit-mobile-light-full.png`
- `kymessages-06-after-backup-written-mobile-light-full.png`
- `kymessages-06-after-audit-desktop-dark-full.png`
- `kymessages-06-after-backup-written-desktop-dark-full.png`
- `kymessages-06-after-audit-mobile-dark-full.png`
- `kymessages-06-after-backup-written-mobile-dark-full.png`
