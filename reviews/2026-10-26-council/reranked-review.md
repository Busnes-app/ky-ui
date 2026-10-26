# Re-rank under rubric `ky-suite-v2`: 2026-10-26 council

This round rescored the same 40 original PNGs with the new `ky-suite-ui` skill in Rate mode. **The images have not changed**, so every movement below comes from the rubric and the reviewer. None of it is a design improvement. No Ky screen reaches 9.0; the highest Ky total is 7.9.

- **Reviewer.** Claude Opus 5.5 (`claude-opus-5-5`), design sub-agent, Claude Code in T3 Code, 2026-10-26.
- **Rubric.** `ky-suite-v2` (`skills/ky-suite-ui/references/rubric.md`). Weights: hierarchy 0.20, typography 0.15, density_layout 0.20, color 0.15, visible_affordances 0.15, coherence 0.15. `ky_fit` is five dimensions at 0.20 each and is never added to `total`. Rounding is `Decimal(str(x)).quantize(Decimal("0.1"), ROUND_HALF_UP)`. Cohort means are taken from unrounded weighted sums and rounded to 0.01.
- **Data.** Scores, observations and hashes are in `reranked-scores.json` (schema `ky-ui-council-scores/2`).
- **Provenance.** `reviewer.inputs_read` pins the SHA-256 of every AGENTS file, the skill, both references and `src/tokens.css` that this round read. The worktree HEAD is `41daa93`, with `skills/`, `reviews/` and `src/tokens.css` uncommitted.
- **Not read:** `source-evidence.md`, `baseline-capture-notes.md`, `skill-author-notes.md` and the new implementation captures in `screenshots/`. Those captures are out of scope.
- **Originals.** Read only from `~/Pictures/KyPost-UI-Councel/`. They were not modified, copied into the repository or uploaded. Observations name no people, addresses or account details.

## Procedure

1. **Inventory.** I recorded SHA-256, bytes and dimensions for all 40 files. Every same-size pair was pixel-diffed.
   - There are no exact duplicates.
   - `KyPost-live-Contacts-01.png` is a near duplicate of `KyPost-live-03.png`: 1 pixel differs, by at most 1 level. It inherits that file's scores and is excluded from every count and mean.
   - The next-closest pair (`tuta-01`/`tuta-03`, 1.75% of pixels) is distinct.
2. **Blind scoring.** I viewed all 39 unique files at full resolution, with crops where detail mattered, and filled one evidence row per file: product, surface, cohort, state, theme, viewport, artifacts, six scores each with a visible observation, confidence and caveat. `ky_fit` was scored for the 11 Ky files.
   - Rows and the blind snapshot were hashed before `initial-scores.json` was opened: rows `037d17f8…b6b`, snapshot `a0ecef77…818`.
3. **Drift.** I then opened `initial-scores.json`. Every dimension that had moved by 2 or more points was re-inspected against a full-resolution crop.
   - That changed 11 dimension scores in 9 files, listed under Post-blind revisions.
   - Blind values are kept as `blind_scores` and `blind_total`.
   - Of the changes, 9 lowered scores (all 6 Ky changes among them) and 2 raised scores (both Outlook-01).
4. **Arithmetic.** A script computed every total and mean. The per-file list was checked against the inventory.

## What v2 changed, and why it matters

- **Views and editors are split.** Calendar becomes `calendar-grid` + `event-editor`, and contacts becomes `contacts-list` + `contact-editor`. KyCalendar's grid and editor are no longer averaged together, and the editor cohort now shows how close it is.
- **Brand-neutral quality is separate from Ky fit.** The prior round marked KyCalendar down on coherence because its shell differs from KyPost's. v2 scores that under `ky_fit.suite_cohesion` instead. The quality score no longer mixes "is it good" with "is it Ky".
- **Anchors.** A score of 3 now means broken. Nested-but-legible forms and loud-but-readable color sit at the 5 anchor. Empty states are judged on guidance and the next action, and density is never rewarded for having more data.
- **Matched flags.** `matched: false` is set when a cohort mixes states or theme classes (light, dark, wallpaper). Only `notes` is matched. Every Ky gap below is therefore an estimate, not a controlled comparison.
- **No cross-cohort or provider ranking.** The coverage table in the JSON is labelled "not a ranking".

## Cohort rankings (mean of unique files; n = 1 unless shown)

| Cohort | Ranking | Matched | Ky gap |
|---|---|---|---|
| mail-list | Proton Mail 7.45 · Gmail 7.00 · mailbox.org 6.70 · Tuta 6.50 · **KyPost 5.65** · Outlook 2013 (video still) 5.35 | no: state, theme | KyPost −1.80 |
| compose | Gmail 7.85 · Proton Mail 7.05 · mailbox.org 7.00 · **KyPost 6.20** · Tuta 6.00 · Outlook 2013 5.85 | no: theme | KyPost −1.65 |
| contacts-list | Google Contacts 7.65 · mailbox.org 6.65 · Tuta 6.50 · **KyPost 5.55** | no: state, theme | KyPost −2.10 |
| contact-editor | Tuta 5.85 · **KyPost 5.55** | no: theme | KyPost −0.30 |
| calendar-grid | Google Calendar 7.70 · Proton Calendar 7.50 · **KyCalendar 7.30** · Tuta 6.85 · mailbox.org 6.65 · Outlook M365 classic 5.45 | no: state, theme | KyCalendar −0.40 |
| event-editor | Google Calendar 8.00 · **KyCalendar 7.85** · Proton Calendar 7.15 · mailbox.org 6.85 = Tuta 6.85 | no: theme | KyCalendar −0.15 |
| settings | mailbox.org 6.68 (n=2) · **KyNotes 6.30** · **KyPost 6.12** (n=3) | no: theme | KyNotes −0.38, KyPost −0.56 |
| notes | **KyNotes 5.70** · mailbox.org Notes 4.35 | yes | KyNotes +1.35 (against a legacy page) |
| drive | Proton Drive 7.35 · mailbox.org 6.50 | no: state, theme | N/A: no Ky file |

- **Grid views.** `calendar-grid` mixes month and week views. Outlook M365 and Outlook 2013 are separate client generations, each labelled.
- **Close gaps.** The two smallest gaps (event-editor −0.15, contact-editor −0.30) come from single files. They are within one dimension point.
- **Large gaps.** KyPost trails by 1.6–2.1 in its core mail and contacts views.

## Ky brand fit (`ky_fit`, Ky screens only, not comparable with competitors)

`suite_cohesion` is scored because three Ky products were captured: KyPost, KyCalendar and KyNotes.

| File (observed product) | palette | type/geometry | shell | accent | suite | ky_fit |
|---|---|---|---|---|---|---|
| KyPost-live-Calendar-02 (KyCalendar editor) | 8 | 8 | 8 | 8 | 6 | 7.6 |
| KyPost-live-Calendar-01 (KyCalendar grid) | 8 | 7 | 8 | 7 | 5 | 7.0 |
| KyPost-live-04 (KyPost appearance) | 8 | 6 | 5 | 8 | 6 | 6.6 |
| KyPost-live-02 (KyPost compose) | 8 | 5 | 5 | 8 | 4 | 6.0 |
| mailboxorg-notes-02 (KyNotes settings) | 8 | 4 | 4 | 8 | 4 | 5.6 |
| KyPost-live-Contacts-02 (KyPost contact editor) | 7 | 5 | 5 | 6 | 4 | 5.4 |
| KyPost-live-05 (KyPost mail settings) | 7 | 6 | 5 | 3 | 5 | 5.2 |
| KyPost-live-01 (KyPost inbox) | 7 | 5 | 5 | 3 | 5 | 5.0 |
| KyPost-live-03 (KyPost contacts) | 7 | 5 | 5 | 3 | 5 | 5.0 |
| KyPost-live-06 (KyPost security) | 4 | 4 | 5 | 5 | 5 | 4.6 |
| KyPost-live-Notes-01 (KyNotes workspace) | 6 | 5 | 4 | 4 | 4 | 4.6 |

KyCalendar is the in-house reference: sidebar wordmark and stamp, a bottom account region, labels above plain fields, and one primary.

KyPost loses most on accent discipline. Orange fills its toolbars, avatars, pagination and the Delete button. KyNotes loses on shell (a top bar, no sign-out in the account region) and on type (oversized titles, mono eyebrows). Suite cohesion is 4–6 everywhere: the three products do not yet read as one suite.

## Drift from the initial round

| Group | Mean delta | n | Blind mean delta |
|---|---|---|---|
| Ky | +0.57 | 11 | +0.66 |
| Competitors | +0.13 | 28 | +0.13 |

The rubric says to find the cause before publishing when Ky drifts up much more than competitors. The cause, as far as the evidence shows:

- **Three Ky files carry most of it:** KyPost-live-Calendar-01 (+1.3), KyPost-live-Calendar-02 (+1.2) and KyPost-live-Contacts-02 (+1.0).
  - The prior round penalised both KyCalendar files on coherence for having a shell unlike KyPost's. v2 moves that penalty to `ky_fit.suite_cohesion`, where those files score 5 and 6.
  - The prior round gave the contact form density 3, the "broken" anchor, for a box around each field. v2 places nested boxes at 5.
  - These are rule changes, and the penalties still appear in `ky_fit`.
- **The other 8 Ky files drift +0.35, against +0.13 for competitors.** The remaining +0.22 is partly the same relocation: KyPost's eyebrow and expander styles now cost points under `ky_fit.type_geometry` and `shell` rather than in quality alone. Part of it is reviewer-to-reviewer variance that the evidence cannot separate. I am reporting that residual, not explaining it away.
- **Re-inspection lowered Ky, not raised it.** All 6 post-blind changes to Ky dimensions went down, which cut Ky drift from +0.66 to +0.57.
- **Ky gaps stay negative.** In mail-list, KyPost moves up a rank only because Outlook 2013 fell. In compose, KyPost passes Tuta because KyPost rose under the 5-anchor rule (+0.6) while Tuta stayed at 6.0, which is a rubric effect. Every Ky gap except notes is still negative.

### Every |delta| ≥ 0.5

| File | Prior | Now | Δ | Cause | Why |
|---|---|---|---|---|---|
| KyPost-live-Calendar-01 | 6.0 | 7.3 | +1.3 | anchor | Cross-product shell penalty moved from coherence to `ky_fit.suite_cohesion`; empty-state density no longer loses for having no events. |
| KyPost-live-Calendar-02 | 6.7 | 7.9 | +1.2 | anchor | Labels above plain fields with one primary meet the 8 anchor; the cross-product difference flagged in the prior caveat is now in `ky_fit`. |
| KyPost-live-Contacts-02 | 4.6 | 5.6 | +1.0 | anchor | Box-per-field is "nested boxes" (anchor 5), not broken (3). |
| mailboxorg-notes-01 | 3.6 | 4.4 | +0.8 | anchor | The legacy page is legible and offers Create; 3 is reserved for broken screens. |
| Gmail-Contacts-01 | 7.0 | 7.7 | +0.7 | anchor | A sparse list is judged on how its rows scale, not on its empty space. |
| KyPost-live-04 | 6.7 | 7.4 | +0.7 | anchor | The picker panel meets the 8 anchor; the sidebar eyebrow and text expanders still cost a point each. |
| Outlook-01 | 6.1 | 5.4 | −0.7 | anchor | Labelled as a 2013 vintage; equal-weight ribbon commands sit at the 5 anchor. |
| KyPost-live-02 | 5.6 | 6.2 | +0.6 | anchor | Send is the only filled control in the dialog. |
| Gmail-02 | 7.4 | 7.9 | +0.5 | anchor | A single Send and hairline rows meet the upper anchors. |
| KyPost-live-01 | 5.2 | 5.7 | +0.5 | anchor | Orange on nine controls is competing emphasis (5), not broken. |
| Outlook-03 | 6.0 | 5.5 | −0.5 | anchor | No create action on the View ribbon; the low-resolution text is scored as captured. |
| mailboxorg-drive-01 | 6.0 | 6.5 | +0.5 | anchor | Clear New primary and folder rows; moving it to `drive` changes the comparison set, not the score. |
| tuta-05 | 6.4 | 6.9 | +0.5 | anchor | The empty month is no longer penalised for having no events. |

All 39 per-file drift rows, with dimension deltas, are in `drift.files`. No file is labelled `correction` or `artifact`: I found no misreading in the prior round, and artifacts are handled the same way as before.

### Post-blind revisions (each re-inspected on a full-resolution crop)

| File | Dimension | Blind → final | Visible reason |
|---|---|---|---|
| KyPost-live-Calendar-01 | visible_affordances | 8 → 7 | Greyed Today button is ambiguous between disabled and enabled. |
| KyPost-live-Calendar-02 | typography | 8 → 7 | Native date-time fields show spaced separators. |
| KyPost-live-04 | typography, coherence | 8 → 7, 8 → 7 | Eyebrow label; text +/− expanders beside a floating card. |
| KyPost-live-05 | visible_affordances | 6 → 5 | Delete is indistinguishable from Save. |
| KyPost-live-Contacts-02 | hierarchy | 5 → 4 | No primary action in the captured frame. |
| Gmail-01 | color | 6 → 5 | Regular-weight labels fade over bright wallpaper. |
| mailboxorg-notes-01 | color | 5 → 4 | White text on a mid-grey Info block. |
| Outlook-01 | typography, density_layout | 5 → 6, 5 → 6 | Consistent three-line rows grouped by day. |
| tuta-05 | typography | 8 → 7 | Uppercase sidebar labels, judged the same way as Ky eyebrows. |

## Ranking changes vs the initial round

- **mail-list.** KyPost moves from last to 5th of 6, because Outlook 2013 fell (6.1 → 5.4). Proton Mail and Gmail keep 1st and 2nd.
- **compose.** KyPost moves from last to 4th of 6, passing Tuta (unchanged at 6.0) and Outlook 2013. Gmail stays first.
- **Calendar, now split.** KyCalendar was 5th of 6 in the combined cohort. It is 3rd of 6 in `calendar-grid` and 2nd of 5 in `event-editor`, 0.15 behind Google.
- **Contacts, now split.** KyPost stays last in `contacts-list` (−2.10). In `contact-editor`, its only competitor is Tuta (−0.30).
- **settings.** KyNotes settings moves here from "secondary". mailbox.org stays first, and KyPost is last.
- **notes and drive.** These are new single-purpose cohorts, replacing the mixed "secondary" cohort.

## Coverage and missing evidence (not a ranking)

- **KyMessages:** no original exists for the console, MemberHome or Element chat. It is `N/A` in every cohort.
- **Ky cohorts with no Ky file:** `mail-read`, `calendar-list`, `admin-console`, `member-home`, `chat`, `drive`, `auth`.
- **Missing states and viewports:**
  - No populated KyPost inbox and no populated KyCalendar grid.
  - No dark or mobile Ky capture.
  - No settings capture from Gmail, Proton, Tuta or Outlook.
  - No Outlook on the web.
- **Filenames that do not match content.** Each was scored as the observed product:
  - `KyPost-live-Calendar-01/02` → KyCalendar
  - `KyPost-live-Notes-01` → KyNotes
  - `mailboxorg-notes-02` → KyNotes settings
- **Capture artifacts,** kept in the score with a caveat:
  - User wallpapers: Gmail and mailbox.org.
  - Password-manager overlays: KyPost-live-05, Proton-calendar-02 and tuta-04.
  - A browser prompt: mailboxorg-02.
  - An onboarding tooltip: Proton-02.
  - Video compression and an activation bar: Outlook-01/02.
  - Redactions and low resolution: Outlook-03.
  - Scrolled frames: KyPost-live-06 and KyPost-live-Contacts-02.

## Verification

- **Inventory.** 40 files in the inventory and 40 file entries; the lists match exactly.
- **Counts.** 39 unique files scored (11 Ky, 28 competitor), plus 1 near duplicate that inherits scores and is excluded from means. No file is unscored for any other reason.
- **Totals.** Every `total` equals the recomputed weighted sum after rounding (`checks.totals_recomputed: true`). Every file has six non-empty observations (`checks.every_dimension_observed: true`).
- **Recompute** from `reranked-scores.json`:

  ```sh
  python3 -I -c 'import json;from decimal import Decimal as D,ROUND_HALF_UP as H
  d=json.load(open("reranked-scores.json"));w=d["rubric"]["weights"]
  print(all(f["total"]==float(sum(D(str(w[k]))*v for k,v in f["scores"].items()).quantize(D("0.1"),H)) for f in d["files"] if not f["duplicate_of"]))'
  ```

## Skill validation notes (no skill edits made)

Using `ky-suite-ui` in Rate mode worked end to end. These gaps showed up; they belong to the skill owner:

- **Ties.** The rubric does not define tie handling. I used shared ranks (event-editor: mailbox.org = Tuta, rank 4).
- **Matching.** "Matched" compares raw theme labels. I compared theme classes (light, dark, wallpaper) and the viewport class, so that `busnes-light` and `light` match. The rubric should say which to use.
- **Three-pane screens.** A list with a reading pane has no cohort rule. Outlook-01 was placed in `mail-list`.
- **Cohort granularity.** `calendar-grid` merges month, week and day, and `matched` ignores client vintage. Both affect gap fairness.
- **Drift causes.** The cause list has no "reviewer variance" entry. The residual Ky drift above needed one.
- **Viewing order.** Inventory-first, blind-then-drift kept prior numbers out of the scoring. Re-inspecting every dimension that moved 2 or more points was useful in practice: it changed 11 dimensions, 9 of them downward.
