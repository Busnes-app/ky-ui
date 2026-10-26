# Runtime source review, round 2: follow-up on F1 and F2 (2026-10-26)

This pass follows up on the two findings in `runtime-source-review.md`. It checks each fix
against the engineering and re-runs the regression tests independently. It reviews every
source change made since round 1. It is not an aesthetic rescore. Reviewer: Claude Opus 5.5
(`claude-opus-5-5`), acting as the council's runtime-source review sub-agent. The implementers'
reports were treated as claims to check, not as evidence.

## Final heads

| Repo | Base | Round 1 head | Round 2 head | PR | PR state at review time |
|---|---|---|---|---|---|
| ky-ui | `41daa93` | `4c97460` | `4c9746017fdc02487f0e62cec17a12be8c74c246` (unchanged) | #18 | open, mergeable, 7/7 pass |
| KyPost-Server | `3037caf8` | `d1395936` | `bfbe8439c8680155d78adb1defb996336d7a6e28` | #480 | open, mergeable, 10/10 pass |
| KyCalendar | `9a527d2` | `95be60c` | `5b9ae3f0bb65aa426a9444a1cd1999cafcac9fab` | #79 | open, mergeable, 11 pass, 1 pending (Go build, vet & tests (SQLite)) |
| KyMessage-Server | `0514749` | `e3556c4` | `2f6d6d0a9a91b2125bd55d99d5f0a7594275e48c` | #93 | open, mergeable, 13 pass, 1 pending (Matrix acceptance) |

Each PR's `headRefOid` on GitHub matches its local worktree head. All three product worktrees
were clean before and after this pass. Every run used throwaway `git archive HEAD` copies
under `/tmp/kyreview-probe/r2`; nothing in a repo was edited or rebuilt.

## Verdict

| # | Round 1 severity | Status | Basis |
|---|---|---|---|
| F1 | High | **RESOLVED** | Real signed-in app, built from the head source: Calendar `nav.spec` passes 4/4 and fails 4/4 with the old selector. Messages `ui.spec` passes 6/6 and fails 6/6. |
| F2 | Medium | **RESOLVED** | New `ReadPage` test passes on head (13/13) and fails on the old `key={label}` (Object.is identity). |

**No new actionable regressions** in the incremental changes.

## F1: nav hover in KyCalendar and KyMessages

**Change.** One selector in each product, at KyCalendar `web/src/styles/theme.css:243` and
KyMessages `web/src/styles/theme.css:205`:

```css
button:not(:where(.ky-nav-item)):hover:not(:disabled), .btn:hover { … }
```

This is the fix proposed in round 1. Specificity stays at (0,2,1), because `:where()`
contributes 0 inside `:not()`. As a result:

- Ordinary primary buttons still hover to the accent.
- `.btn-secondary`, `.btn-ghost` and `.btn-danger` keep their higher-specificity hovers.
- Nav rows fall through to the product's `.app-nav button:hover` (`--panel-hover`) and the
  shared ky-ui hover.

The shared vendor files did not change.

**Selector coverage.**

- `.ky-nav-item` is rendered only by each product's `AppHeader.tsx` (Calendar `:80`,
  Messages `:54`), always on a `<button>`, never with `.btn`. So the unchanged `.btn:hover`
  half of the rule cannot reach a nav row.
- No other product CSS rule can paint the accent on a nav row. A grep for `button…:hover` and
  `.btn:hover` outside the vendor directory found only the neutral `.app-nav button:hover`, the
  `link-button`, `app-logout` and `kc-icon` rules, and the `.btn-*` variants.
- The committed dist carries the new rule:
  - Calendar `index-TTI9yHX1.css`. Its only other `button…:hover:not(:disabled)` match is
    `button.link-button`.
  - Messages `index-CXWxEoj6.css`.

**New tests, inspected.**

- **KyCalendar `web/browser/nav.spec.mjs` (new).**
  - Signs in as `walter` on its own `X-Forwarded-For` (203.0.113.25, which no other spec
    uses), selects the Busnes theme for the project's colour scheme and waits for `.fc`.
  - Hovers both unselected rows walter has, "Phones & apps" and "Two-step verification". Those
    are all of walter's unselected rows (`AppHeader.tsx:57-62`), so the "each" in
    `browser/AGENTS.md` is accurate.
  - Waits until `getAnimations()` is empty. It then requires `:hover`, a background exactly
    equal to `--panel-hover` (normalised through a canvas) and contrast ≥ 4.5.
  - On the selected "Calendar" row it requires `--accent-soft`, an inset accent rail and
    contrast ≥ 4.5.
  - The admin rows are not hovered. They share the same element, class and rule, so the
    selector coverage above extends to them.
- **KyMessages `web/browser/ui.spec.mjs` (extended).**
  - Inside the existing CSP/theme/keyboard test, it records "Users" (idle) and "Overview"
    (selected) at rest with the pointer moved away.
  - It then hovers "Users" and requires the background to change and contrast to be ≥ 4.5.
  - It hovers "Overview" and requires the composited background, ratio and rail to equal the
    at-rest values.
  - It runs in all 6 Chromium and Firefox UI projects.

**Independent runs.** Each check ran on a real signed-in app: a disposable SQLite server built
by `go build -o .browser/server ./cmd/server` from a `git archive HEAD` copy, with the
worktree's `node_modules`.

- **"New"** used the committed head dist.
- **"Old"** reverted only the theme.css selector to
  `button:hover:not(:disabled), .btn:hover`, then ran `vite build` and rebuilt the server. A
  grep confirmed the old selector in the rebuilt CSS.

| Check | Result |
|---|---|
| Calendar `npx playwright test nav.spec.mjs`, new | **4/4 passed** (light/dark × 390/1280). Annotations: light 13.98, 13.98; dark 10.57, 10.57 |
| Calendar `nav.spec.mjs`, old selector | **4/4 failed** at `expect(s.bg).toEqual(s.panelHover)` (`nav.spec.mjs:48`) |
| Calendar full browser suite, new | **32/32 passed** (1.1 min) |
| Messages full browser suite, new | **7/7 passed** (6 UI projects + captcha-pow) |
| Messages full browser suite, old selector | **6/6 UI projects failed** at `expect(idleHover.ratio).toBeGreaterThanOrEqual(4.5)` (`ui.spec.mjs:92`); captcha-pow passed |
| `vite build` of the head source into a scratch outDir, diffed with `diff -r` against the committed `web/dist` | **Byte-identical** for both Calendar and Messages |

The light and dark figures match the round 1 fixed-copy probe: 13.98 and 10.57 for Calendar,
and the Messages UI-VERIFICATION figures of 12.27 and 10.57. The selected-row hover is
unchanged: Calendar asserts it directly, and Messages asserts it equals the at-rest values.

**Non-blocking observation.** This is not a finding. The Messages idle-hover assertion
requires "changed and ≥ 4.5:1", not equality with `--panel-hover`. So a future
high-contrast accent tint on an idle row would pass it. The Calendar spec asserts the exact
surface. Messages could compare against the computed `--panel-hover` in the same way if it
wants that strength. The round 1 defect itself is caught: both the 2.53 and 1.94 ratios fail.

## F2: KyPost remote-content toggle drops focus

**Change** (`frontend/src/pages/ReadPage.tsx:1774-1791`):

- Each of the seven reader tools gets a constant, unique `id`: archive, snooze, read, spam,
  print, remote-content and delete. The button is keyed by `key={id}`.
- One short comment explains why the key must not be the label.
- `label`, `aria-label`, `title`, `onClick`, `disabled` (`!always && actionLoading`), `danger`
  and the icons are textually unchanged.
- `showImagesFor`, `processEmailHtml`, `EmailBodyFrame`, the PGP paths and the sandbox are
  untouched. The diff is limited to those 18 lines.
- Keys are now stable when the reader switches to another message, so React reuses the same
  seven buttons and updates their handlers. That is correct, because every prop is re-derived
  from `selected` on each render.

**New test** (`ReadPage.test.tsx:444-458`):

1. Opens "Weekly Digest" and waits for `[Image Blocked]`.
2. Focuses "Show Remote Content" and presses Enter through `userEvent`.
3. Waits for the tracker URL to appear in the reader body.
4. Asserts that the "Hide Remote Content" button is the same element (`toBe`), that it is
   `document.activeElement`, and that its `title` flipped.

This exercises the real keyboard path and asserts identity, not just a name. Step 3 makes it
wait for the actual state change.

**Independent runs.** These ran on a `git archive HEAD` copy of `frontend` and `testdata`. The
"old" copy differs only by line 1791, `key={id}` → `key={label}`, as confirmed by `diff -r`.

| Check | Result |
|---|---|
| `npx vitest run src/pages/ReadPage.test.tsx`, head | **13/13 passed** |
| Same, old key | **1 failed / 12 passed**: "keeps keyboard focus on the remote-content tool when its label flips", `AssertionError: expected <button …> to be <button …> // Object.is equality` |
| `npx tsc --noEmit` (head copy) | exit 0 |
| `eslint --max-warnings=0` on `ReadPage.tsx` and `ReadPage.test.tsx` | exit 0 |

Pixel appearance cannot change: the DOM, classes and labels are identical. No new captures
were needed.

## Incremental file coverage (round 1 head → round 2 head)

Every file below was read in full diff form.

- **KyPost-Server** (`d1395936..bfbe8439`, 2 files): `frontend/src/pages/ReadPage.tsx`,
  `frontend/src/pages/ReadPage.test.tsx`.
- **KyCalendar** (`95be60c..5b9ae3f`, 10 files):
  - Runtime and test: `web/src/styles/theme.css`, `web/browser/nav.spec.mjs` (new).
  - Docs, checked for accuracy: `web/AGENTS.md`, `web/browser/AGENTS.md`, `UI-VERIFICATION.md`.
  - Generated `web/dist/**` (index.html, 2 JS assets renamed, 1 CSS swapped): not read.
    Covered by the byte-identical rebuild above.
- **KyMessage-Server** (`e3556c4..2f6d6d0`, 8 files):
  - Runtime and test: `web/src/styles/theme.css`, `web/browser/ui.spec.mjs`.
  - Docs: `web/AGENTS.md`, `UI-VERIFICATION.md`.
  - Generated `web/dist/**` (index.html, 1 JS renamed, identical content, 1 CSS swapped):
    covered by the rebuild.
- **ky-ui:** no commits since `4c97460`. Its only working-tree change is this untracked
  council directory.

Combined with round 1's inventory (8 ky-ui, 44 KyPost, 18 KyCalendar and 29 KyMessages
runtime and test files, read in full diff form), every runtime source change in the four
`base..head` ranges has now been reviewed. No vendor file changed in any product since round 1
(`git diff --name-only` filtered for `ky-ui`: empty).

**Vendor bytecheck, re-run.** In ky-ui I ran `node scripts/sync-consumers.mjs --check
--paths=/dev/stdin --consumer=KyPost-Server --consumer=KyCalendar --consumer=KyMessage-Server`,
with the paths pointed at the three ui-cohesion worktrees. Output: `Checked 3 consumers at
0.3.0`, exit 0.

Memory-hungry runs (go build, vite, vitest, tsc, Playwright) used
`systemd-run --user --scope -q -p MemoryMax=6G -p MemorySwapMax=0`.

## Not re-run here (implementer-recorded)

- KyPost full vitest (1190), build and audit.
- `make ci` for Calendar (155) and Messages (157).
- The stage-08 captures.

## Limits

- Real PR CI: Calendar "Go build, vet & tests (SQLite)" and Messages "Matrix acceptance" were
  still pending when this was written. This pass does not cover backend, Docker, Postgres or
  relay.
- WebKit and assistive technologies were not exercised. F2's focus retention is proven in
  jsdom with React's reconciler, not in a real screen reader.
- **Performance parity is not proven.** The round 1 caveat on the KyPost first-query 5 s
  waits is unchanged: 7/23 current-tree failures under load against 0/9 on the baseline, and
  the cause is unresolved. The new F2 test adds no timeout.
- Screenshots do not stand in for any gate. The stage-08 captures were not used as evidence in
  this pass. No score is assigned.
- **Hand-off.** MySlop returns 401 (known), so nothing was posted.
