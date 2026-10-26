# Ky web fleet: scored rollout baseline

The shared Appearance picker is implemented across all ten active Ky web products
and ky-server-base. All twelve latest implementation PRs have been merged by the
owner; current-head CI passed and automated reviews cleared. Some automated
reviews explicitly truncated their input; the independent UI source reviews are
separate evidence and do not certify unrelated backend merges.

**The 9/10 target is not met.** Claude Opus 5.5 scored 142 unique captured images
at **5.2–8.2** (148 rows, six duplicate followers, zero N/A). These are captured
surface scores, not overall product ratings. The lowest areas are the Notes
workspace, Identity admin table, Recovery phone replication view, and Pulse app
detail. The common picker is visually consistent; older task views still need a
bounded visual refinement pass.

## Open the results

- [Spreadsheet](Ky-Web-Fleet-2026-10-26.xlsx): ratings, per-cohort summaries, checks,
  PRs, source findings, the complete 687-image inventory and embedded before/after examples.
- [Offline screenshot gallery](fleet-gallery.html): all current matched before/after
  pairs, with images embedded so it works without a network.
- [Independent visual review](release-review.md): concrete visible gaps, cohort means,
  coverage limits and missing surfaces.
- [Machine-readable scores](release-scores.json) and [cohort results](cohort-results.json).
- [Round 3 source review](runtime-source-review-v3.md): the introduced regressions
  are fixed; legacy contrast gaps remain explicit and prevent 9/10 acceptance.

## Scope and preservation

Products: KyPost, KyCalendar, KyMessages console, KyIdentity, KyNotes, KyYard,
KyDrive, KyPulse, KyDNS, KyRecovery; include ky-server-base for future products.
Native clients, marketing sites, archived products and CLI-only installers are
outside this web pass. Element remains stock. The original competitor review is
in [the earlier council directory](../2026-10-26-council/README.md); the current
Ky-only capture set establishes no competitor superiority.

The picker offers **23 cards: Match system plus 22 named themes**. The visual
review's phrase “same 22 cards” is a prose counting error; the catalog and recorded
radio-count checks show 23. Its numerical scores and duplicate arithmetic are
independently validated and unchanged.

The shared catalog, storage keys, legacy aliases and named-palette values remain
preserved. The default follows the OS until a browser-local choice is saved. The
navigation/sidebar/phone-header compact theme selector is removed; every role can
reach Appearance. Yard and Notes retain their established Settings placement.
KyCalendar keeps one left navigation region. Match system says “Follows device”.

## Evidence and limits

`captures.json` inventories all 687 product images. The fixed visual input set is
`visual-review-inputs-v3.json` (148 rows); it includes the sixteen Pulse/Drive
real destructive-view captures added for F7. Base's labelled injected button is a
regression diagnostic, excluded from visual scores. Six duplicate followers inherit
canonical scores and are excluded from means: two exact and four near duplicates.

The original product manifests preserve capture conditions and image hashes.
Some captures identify edited source by a commit plus source-patch hash. Saved Sky
and Forest in Drive's F7 captures are corrected in the normalized metadata from the
capture driver: the raw manifest's “no saved choice” text is wrong; image bytes and
raw manifests are unchanged. OS mode is distinct from the applied saved palette.

F1 status text, F2 first paint, F4 cross-tab selection, F6 phone navigation and F7
filled-button labels have separate before/fail and after/pass behavior evidence.
A screenshot does not prove keyboard, screen-reader, performance or full contrast
coverage. Missing compose/editor/login/loading/error surfaces are N/A, not zero.
Pre-existing F3/G1/G2 contrast gaps remain; no overall 9/10 acceptance is claimed.

Source reviews, implementation responses and per-file coverage stay separate.
Go/security changes carried in upstream Base #70, Identity #166, Notes #111 and
Yard #154 were identified but are not certified by the UI council.

## Reproduce the exports

From this directory, using Python with openpyxl and Pillow:

```sh
python verify-scores.py
python export-workbook.py
python export-gallery.py
python /path/to/skills/html-page/check.py fleet-gallery.html '#182326/#ffffff' '#566461/#ffffff' '#bf3f18/#ffffff'
```

`collect-captures.py` is an optional refresh from the product worktrees, using the
uncommitted `fleet-paths.local.json` map in the worktree root. Do not refresh a frozen
review input set in place: preserve it under its round name first. Then run
`verify-image-duplicates.py` before a new visual review. Archived product drivers
are evidence requiring their original fixture; they are not shared production tools.
Scratch source archives, cookies, traces, local worktree maps and operational
handoff state are excluded from publication. Reviewer harnesses and compact result
records are included; source commits can reconstruct the scratch builds.

MySlop returned HTTP 401 for the configured token. No board handoff was posted;
local records and T3 do not stand in for a successful board post.

Reviewer JavaScript harnesses are archived as `.mjs.txt`, with original paths and SHA-256 in `harness-archives.json`. Restore the original suffix in an owned scratch directory to execute them; do not import them as shared-package runtime code.

Archived patches and raw test logs retain their original whitespace; generated CSV exports use LF line endings and trim display-only trailing spaces.
