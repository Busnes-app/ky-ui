# Council verification

## Shared foundation

- Base: ky-ui `41daa93`, branch `ui/council-cohesion`; pending source copy 0.3.0.
- `npm run check`: ESLint with zero warnings and all 8 unit tests pass. The release-copy test proves a selected sync repairs its destination while preserving an unselected edited file and tolerating an unavailable unselected checkout.
- `npm run test:browser`: all 20 Chromium checks pass at 390px/1280px, light/dark. Added browser measurements prove 40px controls, 8px radii and field-border contrast of at least 3:1 against both Busnes page and panel surfaces. These are shared primitive checks, not full product accessibility certification.
- Scoped sync and exact-byte check: KyPost, KyCalendar and KyMessages worktrees match 0.3.0. No other consumer checkout was written.
- `npm run check:suite`: fails against public default branches, first at KyDNS's older `tokens.css`. This is expected while 0.3.0 is unreleased; the other consumer updates are pending. A green fleet rollout is not claimed.
- The field-border and geometry changes preserve palette values and theme storage behavior. Product layouts consume the new values locally.
- A selected-hover regression failed before the final correction (selected `rgb(251, 240, 236)` became hover `rgb(242, 239, 231)`). Lowering hover specificity with `:where()` fixes the shared cause; all 20 browser checks and all 8 unit tests plus zero-warning lint pass after it. Synthetic contract-fixture before/after captures are `screenshots/shared-06-{before,after}-selected-hover-desktop-light.png`; these are explicitly shared primitives, not product screens. Product vendor copies are refreshed and embedded outputs rebuilt after this correction.

## Review and skill

- Initial inventory independently checked: all 40 filenames, SHA-256 values and dimensions match the original folder; all weighted totals recompute with decimal half-up rounding and weights sum to 1.
- One near-duplicate contacts capture is excluded from aggregates. Outlook captures are desktop clients of different generations; one mailbox.org-named notes capture actually shows KyNotes.
- Claude Opus 5.5 authored `skills/ky-suite-ui`. The skill-creator validator passes. Codex clarified blind-scoring order and retained existing accessible responsive navigation and theme-picker placement instead of prescribing unnecessary behavior changes.
- The discoverable local skill is installed at `/home/yoshi/.codex-cpa/skills/ky-suite-ui`, byte-checked against this worktree's canonical skill folder. It is an independent copy so removing a merged worktree cannot break the installed skill.
- The re-ranking exercises the improved skill on unchanged originals. It must not be described as a product improvement.
- Re-ranking independently checked: all 40 hashes/dimensions match, the 39 unique totals recompute, all dimensions have observations, and the remaining duplicate inherits its source's scores. The improved rubric reports brand fit separately and discloses a residual reviewer effect in score drift.

## Capture limits

- Original screenshots stay outside the repository and contain private content. New product captures use synthetic scratch data.
- Early `00-before` captures recorded in `baseline-capture-notes.md` use the original local checkout revisions. The implementation worktrees were subsequently advanced to current remote default branches; only freshly captured matching current-before/current-after sets establish redesign changes.
- T3 collaborative browser inspection failed twice with `Preview automation snapshot timed out after 15000ms.` Captures use local Playwright after that failure and the documented product harnesses.
- MySlop rejected its configured token with HTTP 401. No board handoff or completed-folder status was posted.

## Product checks

Product-specific implementation records report staged screenshots, source hashes, executed checks and remaining limitations. A target of 9/10 is not a measured outcome.

## Final implementation review and PR verification

- Claude Opus 5.5 reviewed 118 unique final viewport captures: KyPost 28, KyCalendar 30, KyMessages 60. Codex independently checked every image hash, weighted total, unrounded cohort mean and equal-cohort summary.
- Final visual quality is 7.52 / 7.54 / 7.72; separate Ky brand fit is 8.08 / 8.16 / 8.51. No product achieves 9/10 acceptance. These are scoped visual summaries, not provider rankings; missing states and behavior coverage remain explicit.
- The scored pixels retain their recorded stage 05/06 source revisions. Later hover and DOM-identity corrections are described in capture-followups.json, with stage 08 hover evidence. The frozen scores were not raised after those fixes.
- Final runtime source heads are shared 4c97460, KyPost bfbe8439, KyCalendar 5b9ae3f and KyMessages 2f6d6d0. pr-gates-snapshot.json records a timestamped CI/reviewer observation. Always read the live PR before merging; a snapshot does not certify later pushes.
- The complete source review found F1 (navigation hover contrast) and F2 (reader focus loss). The independent follow-up verifies both resolved, with no new actionable findings. Each regression passes on the fix and fails when the old code is restored; consumer bytes match and rebuilt Calendar/Messages bundles match the committed output.
- All 44 archived source patch records apply to their explicit bases (43 non-empty, one empty). source-patch-bases.json distinguishes full snapshots from incremental corrections, including the reverted test warm-up.
- The 14-sheet XLSX reopens successfully and preserves 40 original rows and 240 dimension observations. Current-score arithmetic is independently verified. The workbook indexes 503 after captures with paired files or explicit unmatched status; manifests own capture comparability.
- The offline gallery embeds 981 synthetic previews. Browser checks find no network requests, console errors or page overflow at 390/1280px; its text/control color pairs pass the standalone offline/contrast checker. This verifies the report, not product-wide accessibility.
- Historical local baseline records with six differing/missing canonical files are preserved under historical-local-baseline/ with their original notes. They do not enter current comparisons or quality means.

## Documentation and cleanup

- Product web/browser ownership docs and UI-VERIFICATION.md describe final behavior and checks. Shared root/skills/reviews docs describe the design and evidence workflows. Backend and product-root contracts remain unchanged because authority, APIs, storage and deployment boundaries did not change.
- The workspace root records the owner's Busnes identity, single-sidebar, screenshots, spreadsheet and PR preferences.
- The owned KyPost scratch app and demo-IMAP fixture were stopped; fixture ownership was verified from its checkout and port 5993. Calendar/Messages actors stopped their disposable services. The unrelated KyNotes service was left untouched.
- MySlop still rejects its configured token with HTTP 401; no board handoff or completed-folder update was posted.
