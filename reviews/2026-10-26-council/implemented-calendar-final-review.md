# KyCalendar final implementation review (stage 04)

Independent final visual reviewer: Claude Opus 5.5 (`claude-opus-5-5`), 2026-10-26.
Rubric `ky-suite-v2`. Machine-readable record: `implemented-calendar-final-scores.json`.
I reviewed the work only. I did not change product code, earlier scores or the skill.

## Verdict

**KyCalendar is not at 9/10.** Every cohort mean is below 9.0, no file scores 9.0, Ky fit
averages 8.11, `contrast` fails on one element I measured, and `states` is untested.

The rejected composition is gone. Desktop has one left column, and Calendars is a group
inside the app sidebar. Phones get a header disclosure. The best surfaces (desktop week,
dark and light) score 8.2. Five issues hold the product back, and each one is visible on
screen. Each has a small, bounded fix (see Findings).

| Cohort | n | Mean | Min | Max | Ky fit mean | Matched |
|---|---|---|---|---|---|---|
| calendar-grid (week, month) | 6 | 7.40 | 6.3 | 8.2 | 8.27 | no |
| calendar-list (phone list, disclosure open) | 4 | 7.60 | 7.5 | 7.7 | 8.10 | no |
| settings (calendar edit and subscribe forms) | 8 | 7.42 | 6.3 | 7.9 | 8.00 | no |

Coverage summary across the three cohorts above, weighted equally (this is not a ranking):
**7.47**. Ky fit mean is **8.11** (min 7.6). `meets_9_quality_every_cohort: false`.

There are no matched competitor captures for these files, so I make no Ky-gap,
provider-rank or competitor-win claim. The earlier grid score (7.3) and editor score (7.9)
came from different, original images: the grid was an empty state, and that review used a
different cohort mix. The difference between those numbers and these is **not** a measured
improvement.

## Provenance

- **Source.** KyCalendar `9a527d2` plus uncommitted changes, in `KyCalendar/.claude/worktrees/ui-cohesion`.
  At 05:51Z I ran `git diff 9a527d2 -- web/src web/browser`. Its output is byte-identical
  (`cmp`) to `source-stages/kycalendar/stage-04-after.src.patch`
  (`62da0101…8b3b9`). The last source edit (05:38:47Z) is earlier than the first capture (05:39:35Z).
  I did not re-hash the dist tree or the server binary; their hashes come from the implementer.
- **Capture.** `screenshots/kycalendar-04-after-manifest.json`:
  - Playwright headless Chromium, captured 2026-10-26T05:40Z.
  - Clock fixed at Tue 2026-10-27 10:15 America/Chicago, en-US.
  - Viewport-only captures at 1280×900 and 390×844.
  - Busnes Light and Busnes Dark, set through the product's theme select.
  - Synthetic fixture (walter, 13 events).
- **Blind order.**
  1. I read the AGENTS chain, the skill, the rubric, the design contract, the manifest and the gates JSON.
  2. I viewed every unique capture at full resolution. For `suite_cohesion` I also viewed one
     current KyPost capture (`kypost-05-after-inbox-desktop-light`) and one KyMessages capture
     (`kymessages-05-after-overview-desktop-light`), images only.
  3. I froze the scores (hash below), with no revisions afterwards.
  4. Only then did I read `kycalendar-implementation.md` and `reranked-review.md`.

  Before the freeze, I read only the key structure of `implemented-post-messages-scores.json`,
  not its values.
- **Frozen scores.** `sha256 = 6331f212e0fe59587a249dfecf92b7e378d64b1b6bb587bb9463fcbc6781a668`.
  The hash covers `[[file, scores, ky_fit_scores], …]` serialized with `sort_keys`.

## Inventory

There are 33 PNGs matching `kycalendar-04-after-*.png`; the manifest JSON shares the prefix.

- **18 scored.**
- **2 exact duplicates.** `calendars-open-desktop-{light,dark}` has the same SHA-256 as
  `calendar-desktop-{light,dark}`. On desktop the list is always in the sidebar, so there is
  no open state to capture.
- **12 draft-resize frames, evidence only.** In each sequence, frame 1 and frame 3 differ by
  0.002–0.005% of pixels, with a maximum channel delta of 1–2, so the round trip is
  near-identical.
- **1 focus composite, evidence only.**

Two near-duplicate candidates were measured and kept as separate files:
`calendar-desktop-dark` and `calendar-edit-desktop-dark` differ by 0.82%.

The `calendar-mobile-*` files actually show the **List** view. Their filenames do not match
their content, so I recorded them as `calendar-list`.

## Per-file scores

Dimensions are H (hierarchy) / T (typography) / D (density) / C (color) / A (affordances) / Co (coherence), with weights .20/.15/.20/.15/.15/.15.
Ky fit is P (palette) / G (geometry) / S (shell) / Ac (accent) / Su (suite cohesion), each at .20.
Light and dark captures of each surface scored identically, so each row covers both themes.

| Surface (both themes) | Cohort | H T D C A Co | Total | P G S Ac Su | Ky fit |
|---|---|---|---|---|---|
| calendar-desktop (week) | calendar-grid | 8 9 8 8 8 8 | **8.2** | 9 8 9 7 9 | 8.4 |
| month-desktop | calendar-grid | 8 8 7 7 8 8 | **7.7** | 9 8 9 7 9 | 8.4 |
| month-mobile | calendar-grid | 7 6 5 7 6 7 | **6.3** | 9 7 9 7 8 | 8.0 |
| calendar-mobile (List) | calendar-list | 8 8 7 8 7 8 | **7.7** | 9 8 8 8 8 | 8.2 |
| calendars-open-mobile | calendar-list | 8 8 7 8 7 7 | **7.5** | 9 8 8 7 8 | 8.0 |
| calendar-edit-desktop | settings | 7 8 8 7 8 8 | **7.7** | 9 8 9 6 9 | 8.2 |
| calendar-edit-mobile | settings | 8 8 7 8 8 8 | **7.8** | 9 8 8 8 8 | 8.2 |
| subscribe-desktop | settings | 6 7 5 7 6 7 | **6.3** | 8 7 8 7 8 | 7.6 |
| subscribe-mobile | settings | 8 8 8 8 7 8 | **7.9** | 8 8 8 8 8 | 8.0 |

The observation behind each dimension, plus the confidence and caveat for each file, is in the JSON.

**Cohort choice.** The calendar edit and subscribe forms have no dedicated cohort in v2, so I
placed them in `settings`, the nearest cohort. Desktop edit and desktop subscribe still show
the week grid behind the form, and I scored those screens as captured.

## Findings (ranked)

### 1. P2: out-of-month day numbers fail contrast (contrast gate)

- **What I see.** In Month view the leading and trailing days (27–30, 1–7) are near-invisible:
  about 1.35:1 in Busnes Light and about 1.57:1 in Busnes Dark. These figures are estimates
  from screenshot pixels.
- **Cause.** FullCalendar's bundled `.fc-day-other .fc-daygrid-day-top{opacity:.3}` multiplies
  with `web/src/styles/calendar.css:90` (`opacity: .7`), for an effective opacity of about 0.21.
- **Fix.** One rule: reset the FullCalendar top opacity and keep a muted colour that reaches 4.5:1.
  Then confirm it with computed style.

### 2. P2: phone Month view is illegible

- **What I see.** Event labels are cut to 1–4 characters (`9a Te`, `10a I`), so the six phone
  Month captures score 6.3.
- **Status.** The implementer recorded this as "remaining cramped". Phone users land on List,
  but Month is still one tap away.
- **Bounded fix.** Below 720px, render Month events as dots or time-only and leave the label to
  the day tap or List. Avoid new features.

### 3. P2: the desktop Subscribe form is clipped inside the sidebar

- **What I see.** With the form open, the security note is cut mid-sentence ("and anything you")
  against the theme select. The Subscribe and Cancel buttons are below the fold, and nothing
  shows that the slot scrolls. The implementer acknowledged the missing scroll cue.
- **Bounded fix.** Scroll the form heading into view when the form opens, and give
  `.app-sidebar-slot` a bottom fade or edge shadow when it overflows (`theme.css:157`).
- **Draft-resize evidence.** With two forms open, the focused field is half-clipped at the slot
  edge. The phone version of the form is good (7.9).

### 4. P2: phone navigation clips with no cue

- **What I see.** On every phone screen, "Phones & a" is cut mid-word, and "Two-step
  verification" is completely hidden. The gate data shows that the navigation scrolls and
  every item is reachable, so this is a **quality and discoverability** defect, not a
  responsive-gate failure.
- **Severity: medium.** It costs a point of density or affordance on 10 of the 18 scored files.
- **Fix.** Add an edge fade or mask on the scrolling navigation.

### 5. P3: the "Subscribe to a calendar" button is indented

- **What I see.** The ghost button's padding puts its text about 17px to the right of the
  column that "New calendar" and the checkboxes share. It also reads as plain text next to an
  outlined sibling. This appears on desktop and in the phone disclosure.
- **Fix.** Remove the inline padding, or match the outline style of New calendar.

### 6. P3: minor polish

- **Two filled primaries in desktop calendar edit.** Sidebar Save and page "New event" are
  both filled accent. This is acceptable as a form-scoped primary.
- **Month titles hard-clip.** Desktop Month titles are cut with no ellipsis.
- **Open-state treatment differs by theme.** The phone disclosure trigger shows a surface when
  open in dark, but in light only the chevron flips. The CSS sets a `panel-hover` background,
  so this is probably low contrast between that surface and the header in light, not a
  missing rule.
- **Accent-like default colour.** The default subscription swatch is close to the light accent.
- **No required/optional marking.** The subscribe Link and Name fields have none.

### Not findings

- **"Colour".** This spelling is the product's consistent existing copy (Settings says
  "Colour theme"). I left it alone under Preserve.
- **Native date-picker focus box.** Chromium draws a native focus box around the date-field
  picker icon. That is valid visible focus.

## Gates (Accept)

| Gate | Status | Basis |
|---|---|---|
| keyboard | pass | **Recorded, not re-executed:** `kycalendar-gates.json`, `resize.spec.mjs`, Tab walks, dialog focus return, Escape on the disclosure. The single "focus left dialog" stop is the Chromium browser-chrome wrap on `<body>`; focus then re-enters at Title. Drag-and-drop has no keyboard path (pre-existing). |
| focus | pass | **Recorded.** I also inspected `kycalendar-04-after-focus-date-fields.png`: a 2px accent ring at an offset in both themes, and the native picker-icon box. |
| contrast | **fail** | 19–22 computed-style pairs per run pass. Out-of-month numerals were not covered, and my pixel estimate puts them at 1.35–1.57:1 (finding 1). Named palettes are unmeasured. |
| states | untested | No empty, loading or error captures. |
| responsive | pass | **Recorded:** 0px overflow on all captures and runs, phone navigation reachable, targets ≥40px (checkbox labels count as the target). |

**Recorded checks I did not execute:**
- `make ci` passed, including 155 frontend tests.
- `npm run build` passed.
- `npm run test:browser` passed 24 Chromium tests.
- `make test-postgres` and the Docker build were not run.

**Checks I executed:**
- Hashes and dimensions of all 33 PNGs.
- Pixel diffs between same-size captures.
- Source-patch identity (`cmp`).
- Pixel contrast estimates. The Today button matches its recorded value: 5.73 light, 8.26 dark.
- A grep of the built CSS for the stacked opacity rules.
- Decimal recomputation of every total and mean.

## Not covered (N/A, not zero)

- **event-editor.** No New event or edit dialog was captured at the final source. The stage-03
  dialog captures predate later CSS edits and still show the rejected two-panel shell behind
  the dialog, so I did not score them.
- **Desktop List and phone Week.** These appear only in evidence-only draft frames.
- **Named themes.** There is no stage-04 Nord capture. The gate run records that Nord persists
  under `ky_theme`.
- **Admin, Settings page, devices and auth.** These were not in the stage-04 batch.

## Arithmetic

- **Per file:** `total = half_up(Σ Decimal(weight)·score, 0.1)`.
- **Ky fit:** `half_up(mean of the 5 dimensions, 0.1)`.
- **Means:** computed from unrounded file totals and reported to 2dp.

The JSON generator re-hashes the frozen scores and asserts all of this for every file:
18 recomputed, 0 mismatches. The inventory check is 18 + 2 + 12 + 1 = 33. To recompute:

```python
import json
from decimal import Decimal as D, ROUND_HALF_UP as U
d = json.load(open("implemented-calendar-final-scores.json"))
for f in d["files"]:
    t = sum(D(str(w)) * f["scores"][k] for k, w in d["rubric"]["weights"].items())
    assert float(t.quantize(D("0.1"), U)) == f["total"], f["file"]
```

## Hand-off note

I did not post a MySlop hand-off. This review returns to the parent agent, and the board token
was previously rejected with HTTP 401.
