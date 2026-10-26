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
