# KyCalendar release review (stage 06, PR #79)

Independent final visual reviewer: Claude Opus 5.5 (`claude-opus-5-5`), 2026-10-26.
Rubric `ky-suite-v2`. Machine-readable record: `implemented-calendar-release-scores.json`.
I did not implement, commit, push, open PRs or change earlier scores.

## Verdict

**KyCalendar is not at 9/10.**

- **Quality.** Every cohort mean is below 9.0, and no file scores 9.0. The equal-cohort mean is
  **7.54**, a gap of **1.46**.
- **Brand fit.** Ky fit averages **8.16**.
- **Gates.** `states` **fails**. `keyboard`, `focus` and `contrast` are **untested**.
  `responsive` passes.

Stage 06 fixed every visible stage-04 defect it targeted, except the hidden desktop Subscribe
actions. It removed the clipped phone Month labels and the near-invisible out-of-month days.
The double left panel the owner rejected is gone at every width. The release is held back
by state handling, not by the shell. The newly captured empty, loading and error states score
6.8–7.3, and the error state offers no way to recover.

| Cohort | n | Mean | Min | Max | Ky fit mean | Gap to 9 | Matched |
|---|---|---|---|---|---|---|---|
| calendar-grid (month, week, loading, error) | 10 | 7.38 | 6.8 | 8.0 | 8.24 | 1.62 | no |
| calendar-list (phone list, disclosure, empty, phone loading/error) | 12 | 7.28 | 7.0 | 7.7 | 8.07 | 1.72 | no |
| event-editor (New event) | 4 | 8.35 | 8.4 | 8.4 | 8.60 | 0.65 | no |
| settings (Subscribe form) | 4 | 7.15 | 6.5 | 7.9 | 7.80 | 1.85 | no |

Coverage summary with equal cohort weight (this is not a ranking): **7.54**. Ky fit **8.16**
(min 7.8). `meets_9_quality_every_cohort: false`. Min and max are rounded file totals. Means are
taken from unrounded weighted sums.

No matched competitor after-captures exist. I make no Ky-gap, provider-ranking or
competitor-win claim.

## Provenance

- **Source.** KyCalendar worktree `.claude/worktrees/ui-cohesion` is clean at
  `95be60c` on base `9a527d2`.
  - `git diff 9a527d2 95be60c -- web/src web/browser` is `cmp`-identical to
    `source-stages/kycalendar/stage-06-after.src.patch` (`2d1d4822…e0d0`).
  - The whole diff excluding `web/dist` hashes to `stage-06-final.product.patch`
    (`b0beb460…fc3b`).
  - I verified both. The dist (`84fe0ddf…`) and server (`5eb784cf…`) hashes come from the
    implementer; I did not re-hash them.
- **Capture.** `screenshots/kycalendar-06-after-manifest.json`:
  - Playwright headless Chromium, captured 2026-10-26T06:18Z.
  - Clock fixed at Tue 2026-10-27 10:15 America/Chicago, locale en-US.
  - 1280×900 and 390×844, viewport-only.
  - Busnes Light and Dark, set through the product's select.
  - Synthetic fixture: walter, 13 events.
  - States: empty is the week before the seeded series. Loading uses 3s of CDP latency.
    Error is a browser context set offline.
  - The manifest records no source revision; the revision comes from the implementation record.
- **Blind order.**
  1. I read the AGENTS chain, the skill, the rubric, the contract and the after manifest.
  2. I viewed all 30 unique captures at full resolution. For `suite_cohesion` only, I also
     viewed one KyPost capture and two KyMessages captures.
  3. I froze and hashed the scores.
  4. Only then did I read the stage-04 review and scores, `kycalendar-implementation.md`,
     `kycalendar-06-gates.json`, the schema file and the product source.
  - There were no revisions after the freeze.
  - Frozen `sha256 = a0cf24e9…9518`. The block is stored in the JSON so the hash can be
    recomputed.

## Inventory

There are 32 PNGs matching `kycalendar-06-after-*.png`.

- **30 scored.**
- **Duplicates.** `calendars-open-desktop-light` is an exact duplicate of
  `calendar-desktop-light`. The dark pair is a near duplicate: 4 px differ, max delta 1.
  The desktop calendar list always sits in the sidebar, so there is no separate open state.
  Both duplicates inherit their originals' scores and are excluded from means.
- **Next closest pair.** I measured every same-size pair. The next closest differs by 1.26%.
- **Not scored.** The `before` and `confirm1` sets (32 each) were not scored.
- **Filenames.** Every filename matches its content. `calendar-mobile` is the List landing
  view, which is the documented phone landing view.

## Per-file scores

Dimensions are H (hierarchy) / T (typography) / D (density) / C (color) / A (affordances) /
Co (coherence), weighted .20/.15/.20/.15/.15/.15. Ky fit is P (palette) / G (geometry) /
S (shell) / Ac (accent) / Su (suite cohesion), each weighted .20.

I viewed light and dark separately and scored them identically, so each row covers two files.
The visible observation behind every dimension is in the JSON.

| Surface (both themes) | Cohort | State | H T D C A Co | Total | P G S Ac Su | Ky fit |
|---|---|---|---|---|---|---|
| new-event-desktop | event-editor | empty | 9 8 8 9 8 8 | **8.4** | 9 9 9 9 8 | 8.8 |
| new-event-mobile | event-editor | empty | 9 8 8 9 8 8 | **8.4** | 9 9 7 9 8 | 8.4 |
| calendar-desktop (Week) | calendar-grid | populated | 8 8 8 8 8 8 | **8.0** | 9 8 9 8 8 | 8.4 |
| subscribe-mobile | settings | sparse | 8 8 8 7 8 8 | **7.9** | 9 8 7 7 8 | 7.8 |
| month-desktop | calendar-grid | populated | 8 8 7 8 8 8 | **7.8** | 9 8 9 8 8 | 8.4 |
| calendar-mobile (List) | calendar-list | populated | 7 8 8 8 7 8 | **7.7** | 9 8 7 8 8 | 8.0 |
| calendars-open-mobile | calendar-list | populated | 7 8 7 8 8 8 | **7.6** | 9 8 7 8 8 | 8.0 |
| empty-desktop (List) | calendar-list | empty | 7 8 6 8 7 8 | **7.3** | 9 8 9 8 8 | 8.4 |
| empty-mobile (List) | calendar-list | empty | 7 8 6 8 7 8 | **7.3** | 9 8 7 8 8 | 8.0 |
| loading-desktop (Week) | calendar-grid | loading | 7 8 7 8 6 8 | **7.3** | 9 8 9 8 8 | 8.4 |
| month-mobile | calendar-grid | populated | 7 7 7 8 6 7 | **7.0** | 9 7 7 8 8 | 7.8 |
| loading-mobile (List) | calendar-list | loading | 7 7 6 8 7 7 | **7.0** | 9 8 7 8 8 | 8.0 |
| error-mobile (List) | calendar-list | error | 7 8 7 7 6 7 | **7.0** | 9 8 7 8 8 | 8.0 |
| error-desktop (Week) | calendar-grid | error | 6 8 7 7 6 7 | **6.8** | 9 8 8 8 8 | 8.2 |
| subscribe-desktop | settings | sparse | 6 7 6 7 6 7 | **6.5** | 9 7 8 7 8 | 7.8 |

**Cohort choice.** The Subscribe form has no dedicated v2 cohort, so it goes in `settings`, as
in stage 04. `loading` and `error` are recorded as state values beyond the rubric's three,
because the brief scores them as surfaces.

## Response to the stage-04 findings

Stage-04 numbers were read after the freeze.

| Stage-04 finding | Stage-06 status | Evidence |
|---|---|---|
| 1 Out-of-month day numbers at ~1.35/1.57:1 | **Resolved** | Muted but legible. My pixel estimate from these captures is 5.73:1 light and 8.26:1 dark, matching the recorded computed values (`month.spec.mjs`, not re-run). Source: `calendar.css:92-93`. |
| 2 Phone Month labels clipped to 1–4 characters | **Resolved within the bounded fix** | Dots and bars with start times, no clipped text. 6.3 → 7.0. Bars carry no visible title; the accessible name exists per source but cannot be seen in a capture. |
| 3 Desktop Subscribe clipped, no cue | **Partial** | The heading and the focused Link field are in view, with a bottom edge fade. Subscribe and Cancel are still below the slot fold. 6.3 → 6.5, still the lowest file. |
| 4 Phone navigation clipped, no cue | **Resolved (cue)** | "Phones &" now fades at the strip edge. |
| 5 Subscribe button indented | **Resolved** | Outlined and aligned with "New calendar". |
| 6 Minor items | **Mixed** | Month ellipsis: done. Light open-state ring: done. Accent-like default swatch: unchanged and visible. Subscribe required/optional marks: unchanged. |
| Missing event editor and states | **Now captured** | New event appears in all four combinations (8.4). Empty, loading and offline states are scored. |

**Drift and reviewer spread** (different images, so these are not rubric drift):

| Surface | Stage 04 | Stage 06 | Cause |
|---|---|---|---|
| Week desktop | 8.2 | 8.0 | Reviewer spread: I scored T 9 → 8 because event meta is small. Not a regression. |
| Month desktop | 7.7 | 7.8 | Product change: legible numerals. |
| Month phone | 6.3 | 7.0 | Product change: dots and times replace clipped labels. |
| List phone | 7.7 | 7.7 | Unchanged. |
| Disclosure phone | 7.5 | 7.6 | Product change: open ring and aligned Subscribe. |
| Subscribe desktop | 6.3 | 6.5 | Product change: heading in view with edge fade; actions still hidden. |
| Subscribe phone | 7.9 | 7.9 | Unchanged. |

The stage-04 coverage mean (7.47) and Ky fit (8.11) used a different cohort mix: calendar-edit
was in, and the editor and states were out. The move to 7.54 / 8.16 is not a like-for-like
measure of improvement.

## Remaining issues (actual gap to 9)

1. **P2: the error state has no recovery path** (`states` gate, contract Task views).
   - **What I see.** Offline shows "The server could not be reached" in a banner above the
     h1, with no next step (`CalendarPage.tsx:286`, `calendarApi.ts:51`).
   - **Desktop Week.** The grid shows no failure in place, so it reads as an empty week.
   - **Phone.** It repeats the failure as "Events could not be loaded." with no Retry.
   - **Score.** 6.8 and 7.0.
2. **P2: empty and loading states are bare text.**
   - **Empty.** "No events to display" (FullCalendar's default copy) sits in a 170px box,
     with no guidance and no in-place action.
   - **Loading.** It is a 13px status suffix, with no skeleton.
   - **Phone.** The loading capture wraps the zone line, which moves the toolbar 20px, and it
     states the message twice.
   - **Score.** 7.0–7.3.
3. **P2: desktop Subscribe** (6.5).
   - **Hidden actions.** The form actions sit below the sidebar slot fold; only an edge fade
     signals them.
   - **Swatch.** The default swatch is orange-red beside the accent focus ring. This is the
     lowest file and the main drag on `settings`.
4. **P3: phone header.**
   - **Theme select.** The 160px theme select is the dominant control.
   - **Account.** There is no signed-in name.
   - **Scope.** KyMessages uses the same pattern, so this is a suite-shell decision, not a
     calendar-only fix.
5. **P3: phone List does not mark today.** Tuesday's header looks like Monday's.
6. **P3: grid polish.**
   - **Now-line.** It crosses the "10:00 - 11:30" label in Week.
   - **Event meta.** Its type is small.
   - **Month.** It leaves about 200px blank at 1280×900.
7. **P3: test hygiene.** The `App.test.tsx` lazy-chunk wait went to 5s after 1 failure in 4
   runs at load average 31. That hides a flake rather than explaining it. It is test-only, the
   runtime is unchanged, and PR CI passed.

**What would move the score.** Fixing items 1–3 in one bounded batch would lift the four state
surfaces and desktop Subscribe, which are 12 of the 30 files. That should not be read as a
path to 9.0. Week, Month and List already sit at 7.6–8.0, with no single visible defect. The
remaining gap there is refinement: emphasis, density, and the small type in event blocks.
Reaching 9 in every cohort is not supported by these captures and would take more than a
polish round. Per the brief, I am not proposing a new round.

## Gates (Accept)

| Gate | Status | Basis |
|---|---|---|
| keyboard | **untested** | **Recorded, not re-executed** (`kycalendar-06-gates.json`, 4 runs): 39 page stops; dialog focus starts on Title and returns to New event; Escape works on the disclosure; Enter/Space works on Month events. **Not recorded:** completing Subscribe at 1280×900, calendar edit/rename/delete, recurring-edit scope, Settings/devices/2FA. Chromium only. |
| focus | **untested** | **Recorded:** 0 of 39 page stops and 0 dialog stops without a ring, date-field focus verified, ring at 4.93:1. **Seen in captures:** an accent ring on Link and on Title. **Not recorded:** Month/List event buttons, form controls in Subscribe and edit, named themes, other browsers. |
| contrast | **untested** | **Measured Busnes pairs all pass:** 19–28 per run, min 3.36:1 (non-text, needs 3), out-of-month numerals 5.73/8.26. **Not measured:** named themes (the rubric requires every shipped theme), the danger banner, state text, the swatch. |
| states | **fail** | The captured error has no recovery step, and the desktop Week grid shows no failure in place. Loading has no skeleton. **Not captured:** states for Month and Day, dialog validation, server 500. `role=alert`/`role=status` exist in source but no test records them. |
| responsive | **pass** | 0px overflow on all 32 captures and 4 runs. Phone navigation is reachable, with a cue. Targets are ≥40px, or a 40px label wraps a 16px checkbox. Subscribe actions are reachable by scroll. Chromium only. |

**Gate drift from stage 04.** Stage 04 passed keyboard and focus on the same kind of recorded
walk. I hold a gate at `pass` only when recorded evidence covers the rubric's full condition
for the in-scope paths. That is why keyboard and focus are `untested` here. This is a stricter
reading, not a product regression.

**Checks I executed:**
- Hashes and dimensions of all 32 files, matched against the manifest.
- All same-size pixel diffs.
- Source identity (`cmp` and sha256) against the recorded patches.
- Pixel contrast of out-of-month numerals.
- Decimal recomputation of every total and mean: 32 rows, 0 mismatches.
- PR #79 status:
  - **State.** At 2026-10-26T02:38:14-04:00 the head was `95be60c`, `MERGEABLE`, `CLEAN`.
  - **CI.** All 12 checks succeeded, including Go tests (PostgreSQL), Docker image build &
    run, Browser regressions (production server), the end-to-end smoke test, Vulnerability
    scan and CodeQL. `publish` and `promote` were skipped.
  - **Review.** No review decision is recorded.

**Recorded checks I did not execute:**
- `make ci`: 155 frontend tests, Go race/vet/tidy, fork tests, smoke. The unit suite passed
  155/155 three times.
- `npm run build` and `check-vendor`, with a reproducible dist.
- 28 Chromium browser tests.

## Not covered (N/A, not zero)

- **Named themes.** Not recaptured; only persistence is gated.
- **Missing views.** Day view, populated desktop List, and phone Week.
- **Out of batch.** Calendar edit, recurring-edit scope, Settings, devices, 2FA and admin were
  not in the stage-06 batch.
- **Error states.** Event-dialog validation and a server 500 were not captured.
- **Browsers and devices.** Firefox, Safari and real phones were not run.

## Arithmetic

- **Per file:** `total = half_up(Σ Decimal(weight)·score, 0.1)`.
- **Ky fit:** `half_up(mean of the 5 dimensions, 0.1)`.
- **Cohort and summary means:** taken from unrounded weighted sums, half-up to 2dp.
- **Recompute:**

```python
import json
from decimal import Decimal as D, ROUND_HALF_UP as U
d = json.load(open("implemented-calendar-release-scores.json"))
for f in d["files"]:
    t = sum(D(str(w)) * f["scores"][k] for k, w in d["rubric"]["weights"].items())
    assert float(t.quantize(D("0.1"), U)) == f["total"], f["file"]
```

## Hand-off note

I did not post to MySlop. The board token was previously rejected with HTTP 401. This review
returns to the parent agent.
