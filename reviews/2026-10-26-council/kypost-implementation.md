# KyPost implementation: staged redesign evidence

Implementation sub-agent, Claude Opus 5.5, 2026-10-26. Scratch captures from a disposable local server running the KyPost worktree source, with synthetic data. These notes contain no scores; rating belongs to the council review.

## Source and capture conditions

- Worktree `kypost-server/.claude/worktrees/ui-cohesion`, branch `ui/council-cohesion`, HEAD `3037caf8747b57c504cfee50c54446af8db97076` (= `origin/main`), with uncommitted changes. Every stage starts from HEAD plus the parent's vendored ky-ui 0.3.0 sync (`src/ky-ui/VERSION`, `src/ky-ui/tokens.css`).
- Each stage's source is `git diff` against HEAD, saved as `/tmp/ky-ui-council-post-impl/source-<stage>.patch` (scratch, not durable). The SHA-256 below identifies it. To reproduce a capture, apply the patch to HEAD, build, and serve.
- Frontend built with Node 26.12.1 (`npx vite build --outDir /tmp/ky-ui-council-post-impl/dist-<stage>`). The build output was copied into the server's `FRONTEND_DIR`. No `frontend/dist` was written.
- Server: the parent's scratch KyPost on `localhost:5596`, restarted once on the current binary `/tmp/ky-ui-council-kypost-current` (SHA-256 `41b4e139…9b4c`). It kept the same data dir, the same minimal environment (`SSL_CERT_DIR` set to the fixture CA, `SANDBOX_PRIVATE_HOSTS=localhost`, AI sorting off) and the same fixture process. New pid and metadata are in `/tmp/ky-ui-council-post-process.json`.
- Mail: the loopback IMAP/SMTP fixture (`kypost-demo-IMAP`, ports 5993/5587, TLS verified) as `alice@kypost-demo.local`. Before each surface, the capture driver uses the app's own `/api/inbox/actions`, with session cookie and CSRF header, to do two things:
  - Delete messages the fixture drips in every 15–30 minutes (dated after 2026-10-01).
  - Restore the seeded flags: three unread, the weekly digest read.

  Every capture therefore shows the same four seeded messages.
- Contacts: four synthetic contacts added through the normal New Contact form (Alice Demo, Dana Ops, Priya Natarajan, Sam Okafor). Everyday user `alex`; no administrator captures.
- Browser: Playwright 1.63.0 headless Chromium, with a new context per viewport × theme and a real sign-in (proof-of-work login). `timezoneId` America/New_York, `en-US`, service workers blocked. Theme: no saved choice, so KyPost follows the context `colorScheme` and shows Busnes Light or Busnes Dark.
- Viewports: desktop 1280×900 and mobile 390×844, viewport-only captures. The driver records horizontal overflow and the page's `h1` texts per capture.
- No mocks, and no auth, CSRF or CSP bypass. The T3 preview was not used; the parent authorised the Playwright fallback.

Surfaces per batch (`kypost-<stage>-<before|after>-<surface>-<desktop|mobile>-<light|dark>.png`, 7 × 4 = 28 files):

| Surface | State |
|---|---|
| `inbox` | Inbox, four seeded messages, nothing selected |
| `inbox-selection` | Same, with "Re: Sandbox rollout plan" and "Your weekly digest" selected |
| `reader` | "Re: Sandbox rollout plan" (Alice Demo) opened in the reader dialog |
| `contacts` | Contacts list with four contacts |
| `contact-editor` | New Contact dialog, empty |
| `appearance` | Settings → Appearance |
| `compose` | New Email, empty |

Stage `00` holds the parent's earlier captures from an older source. These stages start from fresh current-source captures (`01-before`).

## Stage 1: shell

`01-before`: source patch `8fdb7540…cbbd` (vendored ky-ui sync only), captured 04:42–04:46 UTC. Horizontal overflow was 0 on every capture, and no page had an `h1`.

Changes:

- **Sidebar** is `--ky-sidebar-size` (240px), sticky and full height, with `--ky-space-3` padding and `--ky-type-nav` text.
- **Brand**: 28px stamp icon and a 1.15rem/700 wordmark, the same as KyCalendar's `.app-brand`.
- **Nav rows**: links, disclosure buttons and Logout share one geometry: `--ky-control-size` (40px) high, `--ky-control-radius` (8px), icon then label. Hover is a neutral ink tint. The selected state stays the ky-ui `ky-nav-item` surface plus accent rail, and the per-row accent border on hover is gone.
- **Icons** are inline SVG, added to `pages/read/icons.tsx`. Standard folders take their icon from `standardMailboxKind`; Archive, Scheduled, Contacts, Settings and Logout have their own. The shared icon helper is now `aria-hidden`.
- **Expanders**: Archive and Settings use a rotating chevron in place of the text "+"/"−". The Inbox create-folder toggle is a plus icon with the label "New folder under Inbox"; it previously had no accessible name.
- **"Mailboxes" and the Config/Admin subheadings** are plain 13px/600 labels, no longer uppercase letter-spaced eyebrows.
- **New Email** is the sidebar's single primary action, 40px, with weight 600 in place of 700.
- **Account region** is pinned to the sidebar foot: the username, "Admin" for administrators, then Logout (the same handler, moved out of `<nav>`; `guardNavigation` never applied to buttons). The license link sits below.
- **Main surface**: content is flat on `--panel`. `.panel` loses its card border, radius, margin and shadow, and its padding becomes `--ky-space-4`/`--ky-space-5`. The decorative accent radial glows on Contacts, Users and config pages are removed. The read and contacts pages fill `100vh`.
- **Page titles**: one `h1` per page, at `--ky-type-title` (24px)/600, for Inbox/folder, Contacts, Scheduled, each Settings panel, Security, the Security re-auth gate, Get KyPost, Server, Status and Diagnostics. The pages had no `h1` before. Dialog titles stay `h2`/`h3`. `App.lazy.test.tsx` now expects level 1 for Appearance.
- **Phones** keep the existing horizontal chip quick nav, with the same order and labels. Chips are 32px with one consistent edge, icons are hidden, and Logout is a chip from the account region.

`01-after`: source patch `daa0f10c…4608`. Captured twice:
- First batch: on phones, the new row rule outranked the phone rule that hides Archive and Scheduled.
- Confirmation batch: fixed with `.sidebar`-scoped hide selectors, then recaptured. These are the files kept.

Overflow was 0 everywhere, and every capture had exactly one `h1`, the underlying page's: Inbox, Contacts or Appearance. Compose, the reader and the contact editor are dialogs over those pages.

Left after the bounded round: on phones the Logout chip spanned the full width. The one-line fix (`justify-items: start`) landed after `01-after` and is visible from `02-before`. Inbox toolbar, list chrome, contacts cards and forms are stage 2 and 3 work.

## Stage 2: task views

`02-before`: source patch `b25a73da…8678` (stage 1 plus the phone Logout chip fix), captured 04:52–04:53 UTC.

Changes:

- **Bulk toolbar**: renders only while a message is selected. With nothing selected every action was already disabled, so no capability changes, and the tests already select before acting.
  - The six actions are 40px quiet icon-and-label buttons (`.btn-ghost`); Delete uses the danger colour.
  - Phones keep icon-only 36px buttons with their existing `aria-label`s.
- **Inbox header and search**: inline styles replaced by classes (`.inbox-header`, `.inbox-search`). Search is a secondary outline, not a second accent fill. The search-field select gains the label "Search in"; it had no accessible name.
- **Category tabs**: neutral pills with a plain unread count. The selected tab uses the shared selection surface (`--accent-soft`, weight 600) and now exposes `aria-pressed`. Page tabs in Inbox and Contacts use the same selected treatment.
- **List**: the bordered, tinted table box is gone, leaving rows divided by `--line` on the content surface.
  - Unread rows differ by weight only (subject 650, sender and time 600, `--ink-strong`); the accent-tinted unread fill is removed.
  - Selected rows take `--accent-soft`; before, a checked row had no row state at all.
  - Hover is a neutral tint. Column headings are 13px/600 `--ink`.
- **Reader dialog** (the reading pane):
  - Reply is the single primary. Archive, Snooze, Mark as Read, Mark as Spam, Print, Reply All and Forward are outlines; Delete is a danger outline; Show Remote Content and Close are ghost.
  - Overlay shadow from `--ky-shadow-overlay`. Labels and handlers unchanged.
- **Contacts**:
  - The Address Book card and nested table box are removed; Address Book is an `h2` under the page `h1`.
  - The count, statistic, table headings and row chevron are neutral (no uppercase letter-spacing, no accent pills).
  - Avatars are neutral, not orange.
  - Export links and buttons share one 36px secondary shape. Row Edit is ghost and row Delete is danger ghost; the old Delete was a near-invisible pink on light themes.
  - The search input's inline style referenced undefined `--border-color`/`--bg-color`; it now uses the shared field style and gains the label "Search contacts".
- **Shared button variants** introduced: `.btn-primary`, `.btn-ghost`, `.btn-danger`, using KyCalendar's names.

`02-after`: source patch `c0be5c16…c74d`, captured 04:56–04:57 UTC. Overflow 0 and one `h1` everywhere. Inspected desktop and mobile in both themes; nothing needed a confirming recapture.

## Stage 3: forms and dialogs

`03-before`: the same source as `02-after` (`c0be5c16…c74d`), captured 04:57–04:58 UTC.

Changes:

- **One button system.** A plain `<button>` is now the secondary outline (`--ky-field-border`, 8px radius). A form's `type="submit"` and `.btn-primary` carry the accent fill. `.btn-ghost` drops the outline and `.btn-danger` recolours.
  - Disabled buttons read as unavailable rather than as faded primaries: muted ink and a dashed edge, and a disabled primary loses its accent fill.
  - The base hover sits in `:where(button)`, so component hovers still win.
  - Explicit `btn-primary` on the actions that were only primary by default: New Contact, compose Send, Confirm with KySignOn, and every Save button in Mail, Email Labels, Notifications, Filters and the admin Server sections. Submit buttons were already primary through `type="submit"`.
- **Fields**: inputs, selects and textareas use `--ky-field-border` (≥3:1, measured below) with 8px radius. Text inputs and selects are 40px; checkboxes, radios and file inputs are excluded. The file-picker button uses the secondary shape.
- **Compose**:
  - Send is `.btn-primary`. The hard-coded dark Send text is removed; it would have been wrong on a dark accent.
  - Schedule… and Save Draft are outlines; Attach and Contacts stay ghost; Trash is danger ghost; Close is ghost.
  - Recipient fields had a second border from `.compose-field-row input` on the token input. Now one 40px field-border box, with a `:focus-within` ring since the inner input suppresses its own outline. The rest of the compose layout, security group, attachment and contact actions and handlers are unchanged.
- **Contact editor**:
  - The bordered box around every field and around the multi-value groups (Photo, Emails, Phones…) is removed. Labels sit above plain inputs, 13px/600.
  - Fields in a row next to the taller Pronouns cell no longer stretch (`align-content: start`).
  - The title is 17px/600. Add Contact (submit) is primary and Cancel is secondary.
- **Dialogs**: compose, contact, contact-details and reader windows share 12px radius and `--ky-shadow-overlay`. The backdrop is a neutral 45% charcoal; before, every theme used Dark Matter's lavender tint.
- **Settings sections**: `.config-card` is a flat section divided by a top rule, not a gradient card, and its labels no longer draw a box per field.
- **Danger colour**:
  - The users, security and contacts danger rules used fixed pink (`#ffd8d3`) made for dark themes; now `--danger`.
  - Named palettes set no danger colour, so the shared alias painted Busnes Light red on dark presets (2.3:1 on Dark Matter). `styles.css` now ties `--danger` for named palettes to the palette's own ink with `color-mix(var(--ky-danger) 50%, var(--ink-strong))`, without new hex values. It measures 5.09:1 on Dark Matter.
  - The admin Users avatar is neutral, like Contacts.

`03-after`: first batch captured 05:01–05:02 UTC, then one bounded fix round, with the confirmation batch captured 05:03–05:04 UTC. The kept files are from source patch `39b9eadf…f7df`. The first batch showed:
- New Contact had lost its fill under the new default.
- Contact-editor fields stretched beside Pronouns.
- Photo and multi-value groups were still boxed.

All three were fixed in one batch. Overflow 0 and one `h1` on every capture.

The final source adds two changes after `03-after`. Neither changes a Busnes capture: the named-palette `--danger` rule applies only when no Busnes theme is set, and the Vite comment is not in the bundle. Final patch, including the `frontend/AGENTS.md` and `UI-VERIFICATION.md` edits: `/tmp/ky-ui-council-post-impl/source-final.patch`, SHA-256 `1feaee3f95f4ae7a860b5984eba59dd4927ec7d273954cdbb5e10e4dbfa27f33`. Stage patches live in the same scratch directory and are not durable.

## Stage 5: usability refinement (after the acceptance review)

This stage answers the visible findings in `implemented-post-messages-review.md`. Those scores are a separate method, so this section carries no score and no claim about what one would be.

`05-before`: source patch `source-stages/kypost/source-05-before.patch` (`bff3b874…6fd2b56`). That is stage 3 plus the lint-only change (`kypost-lint-review.md`) and the parent's nav fallback sync, rebuilt before capture. Captured 05:37–05:38 UTC under the stage 1–3 conditions above. The driver is `/tmp/ky-ui-council-post-impl/capture05.mjs`, the same as `capture.mjs` with two differences:
- It accepts the `05` labels.
- It fails if the reader opens anything other than the Alice Demo message. This guards against the fixture drift the review flagged.

Changes:

- **Phone shell** (≤900px, portrait):
  - Row one holds the stamp and KyPost wordmark, a compact New Email, and the account: the name plus a Logout icon button. Logout keeps its accessible name through a visually hidden label.
  - Row two is one non-wrapping strip that scrolls sideways. It holds every destination in sidebar order: Inbox, Drafts, Junk, Sent, Trash, Scheduled, custom folders, Archive (with its folders), Contacts, Settings, then the Settings panels and Get the apps. Archive is newly reachable on phones; it was hidden before.
  - Strip items are 40px tabs with an icon and label, using the ky-ui bottom-rail selection.
  - The mailbox switcher and the blocked-navigation notice moved just above `<nav>`, so they get their own row. `guardNavigation` only ever acted on links, and the switcher already checks the hold itself.
  - The phone Settings toggle now sits where the desktop one does, so the Tab order matches the strip.
  - The current page's link scrolls into view on navigation, and a focused item scrolls fully into view. Chromium leaves a partly visible item clipped when it takes focus, which the checks measured below.
  - The folder menu uses `position: fixed` on phones so the strip cannot clip it. Its hard-coded dark background is now `--panel` with the overlay shadow, on every viewport.
- **New Email** steps down to the secondary outline outside `/read` and `/scheduled`, so New Contact and the other page primaries lead. Compose is unchanged.
- **Reader:**
  - The `h2` heading is the subject, and `aria-labelledby` names the dialog with it. The heading was "Email Details", and the duplicate "Subject:" row is gone.
  - Close is an icon button in the header corner.
  - Reply (primary), Reply All and Forward come first. Archive, Snooze, Mark as Read, Mark as Spam, Print, Show/Hide Remote Content and Delete (danger) follow as the inbox toolbar's quiet icon-and-label buttons, mapped from one list; they are icon-only on phones.
  - The facts (Sender, Sent To, Time, Status, Detail) are one block with muted 13px labels.
  - "View raw email" is ink, no longer accent.
  - Handlers, labels, the PGP, phishing and remote-image blocks, the sandboxed body frame and attachment downloads are untouched.
- **Contact editor:**
  - The fixed header holds the title (`h2`, which names the form) and a Close icon button. The fixed footer holds Cancel, then Add Contact / Save Changes on the right. Only the fields between them scroll.
  - Always shown: Photo, Full Name, Organization, Given Name, Family Name, Title, Department, Emails, Phones and Notes. The other fields are in native `<details>` groups: More name fields, Birthday and dates, Addresses and links, Custom fields, Groups, and PGP public key.
  - A group opens when the stored contact already has data in it. The check reads the stored record, not the live form, so a group never closes while its fields are being cleared.
  - The form's `invalid` capture opens a group whose hidden field blocks submit.
  - All fields, state, validation and API calls are unchanged.
- **Contacts list:**
  - On phones (≤700px) each row is a stacked block: checkbox, identity, then Edit/Delete on the first line, and contact info under the name with wrapping. The table header hides its Contact Info and Actions headings there.
  - The typed `›` glyph is the shared SVG chevron.
- **Compose:**
  - Quill puts its toolbar beside the editor, not inside `.compose-editor-html`, so none of the themed toolbar rules matched. They are now scoped to `.compose-window`, and the toolbar and editor share one field-border box.
  - Close is the same icon button as in the reader and contact editor.
- **Tests:**
  - Added to `ReadPage.test.tsx`: the dialog is named by the subject heading, and Close, Reply, Reply All, Forward lead the actions.
  - Added to `ContactsPage.test.tsx`: header Close and footer order; a group opens from saved data; a hidden invalid field opens its group. That last test was mutation-checked: removing the handler fails it.
  - Added to `App.mobileSettings.test.tsx`: the Settings toggle follows Contacts. Its scroll assertion now checks the settings group itself, because the new current-link scroll would otherwise satisfy it.
  - `test/setup.ts` stubs `scrollIntoView`, which jsdom lacks, the same way it stubs `matchMedia`.

`05-after`: source patch `source-stages/kypost/source-05-after.patch` (`149f0563…a6a0d0`). One bounded round:
- A first after-batch from `368382a4…` was inspected.
- The browser checks then found the clipped focused strip item, and an inline scroll inset kept the focus ring off the screen edge.
- Both were fixed in one batch and the kept files were recaptured once, 05:58–05:59 UTC.

The kept files are 28, at 1280×900 and 390×844. Overflow was 0 and there was one `h1` on every capture (`screenshots/kypost-05-after.json`).

`source-05-final.patch` (`9420f2a6…bfaf`) adds only the `UI-VERIFICATION.md` and `frontend/AGENTS.md` notes. Its `frontend/src` hunks are byte-identical to `05-after`.

Browser checks (`/tmp/ky-ui-council-post-impl/checks05.mjs`, results in `kypost-05-after-checks.json`, Busnes Light and Dark):
- **Phone header:** 105px on `/read`, `/contacts` and `/settings/appearance`. Strip items sit on 1 row, the current link is in view on each page, and every destination label listed above is present in the strip.
- **Phone Tab walk:** 16 stops from New Email. Each stop is fully on screen with a 2px ring, and strip rings are not clipped vertically. Before the focus fix, Trash ended at 436px and Contacts at 487px on a 390px screen. After it, every focused item ends at least 16px inside the edge.
- **Reader** (opened with Enter): actions in order Close, Reply, Reply All, Forward, Archive…Delete. Tab reaches Reply first. Escape closes it and returns focus to the row.
- **Contact editor** (opened with Enter): focus starts on Close, the footer is on screen at both sizes, and Escape returns focus to New Contact.
- **Quill contrast** (icons and picker against the toolbar): 16.06 light and 12.67 dark. Its border measures 3.63 and 4.77.
- **Overflow:** 0 on `/read`, `/contacts` and `/settings/appearance` at 1024×768, 768×1024 and 360×740.

## Follow-up: shared selected-hover sync

The parent synced the final ky-ui `navigation.css` and `VERSION`. The hover rule now uses `:where()`, so it stays below the selected-state specificity and a selected row keeps its surface under hover. `source-stages/kypost/source-06-followup.patch` (`41732fea…b717`) differs from `source-05-final.patch` only in `frontend/src/ky-ui/VERSION` and `navigation.css`.

The stage-05 captures and manifests are kept as recorded. The only visual difference is the hover state of a selected row, which no static capture shows. The parent holds the shared 06 before/after fixture images.

Rebuilt and served. On the real build:
- The selected row keeps its background under hover, and an idle row's background still changes, in Busnes Light and Dark at 1280×900 and 390×844 (`kypost-06-followup-hover.json`).
- The stage-05 browser checks gave the same results (`kypost-06-followup-checks.json`): 105px phone header, every Tab stop in view with a 2px ring, reader and editor focus return, Quill contrast 16.06 / 12.67, and overflow 0.

## Follow-up: F2 reader focus fix (`runtime-source-review.md`)

The worktree is at PR #480's commit `d1395936`, plus uncommitted changes in two files.

- **Cause:** the reader tool buttons were mapped with `key={label}`. Activating Show/Hide Remote Content flips its label, so React unmounted the focused button and mounted a new one, and keyboard focus fell to `<body>`.
- **Fix** (`ReadPage.tsx`): every tool record has a stable id (`archive`, `snooze`, `read`, `spam`, `print`, `remote-content`, `delete`), and the buttons are keyed by it. `aria-label`, `title`, the visible label, the handlers, the disabled rules and the danger styling are unchanged. So are the PGP, phishing and remote-image logic, the body frame and the downloads.
- **Regression test** (`ReadPage.test.tsx`, "keeps keyboard focus on the remote-content tool when its label flips"): it focuses Show Remote Content and presses Enter, then waits for the tracker to load. It then checks three things:
  - the button found by "Hide Remote Content" is the same node as before;
  - `document.activeElement` is that node;
  - its `title` changed to "Hide Remote Content".

  The test failed on `d1395936` (the `toBe` identity assertion) and passes with the fix.
- **Patches:**
  - `source-stages/kypost/source-08-f2-focus.patch` (`9823c643…`) is against `3037caf8`. Compared with `source-07-test-wait.patch`, only those two files differ.
  - `source-08-f2-focus-vs-d1395936.patch` (`e3a9e830…`) holds the incremental change.
  - The parent's `source-08-committed.patch` is untouched.
- **Preserved:** the scoped 5 s first-query waits and every earlier change.
- **No new captures.** The change affects only DOM identity: the same buttons render with the same classes, labels and order, so every stage-05 image stays valid.
- **Not run:** a real-browser check. The scratch KyPost server (port 5596) and its mail fixture were no longer running, and they are the parent's processes, so I did not restart them. The jsdom test is the recorded evidence.

## Checks (final source, superseding earlier check notes)

The lint-only change (`kypost-lint-review.md`) resolved all 18 warnings that the stage 1–3 notes recorded as matching HEAD. The figures below are for `source-08-f2-focus.patch` on HEAD `3037caf8` unless a line says otherwise, Node 26.12.1 first on PATH, with heavy runs capped at 6G.

- `npm run lint -- --max-warnings 0`: 0 errors, 0 warnings.
- `npm run typecheck`: clean. `node src/ky-ui/check-vendor.mjs`: ky-ui 0.3.0 verified.
- `npm test -- --run`: 109 files. On `source-08-f2-focus` it passed 1190/1190, which is the earlier 1189 plus the F2 test. Earlier full runs passed 1189/1189: two on `source-05-final`, one on `source-06-followup` and one on `source-07-test-wait`.
- `npm run build` (to `/tmp`): passes. The only notice is the documented `@hpke/common` "crypto externalized" false positive.
- `npm audit`: 0 vulnerabilities each for runtime `--omit=dev --audit-level=low`, dev `--audit-level=high` and `lint/`.
- `scripts/check-toolchains.sh` and `scripts/check-env-example.sh`: pass.
- **App first-test flake: investigated, not resolved.** A regression from this change is not proven and not ruled out. The measured waits are equal, but failure counts differ: 7 of 23 current runs against 0 of 9 baseline. Evidence is in `kypost-06-flake-evidence.txt`.
  - **The failure:** the first test of `App.mailboxes.test.tsx` ("is hidden with one mailbox…", line 107) or of `App.mobileSettings.test.tsx`. It fails with `Unable to find an element with the text: Primary inbox` once `findByText`'s default 1000 ms timeout expires.
  - **Smallest reproducer:** the parallel batch `npx vitest run src/App src/pages/ReadPage src/pages/Contacts src/components`. Each file passes when run alone.
  - **Cause:** the first test in a file renders the whole app cold, and the lazy `ReadPage` chunk loads inside the `findByText` window. With 27 jsdom files running in parallel, that wait sits right at 1 s.
  - **The deciding measurement:** the real wait in that test (`renderApp()` to "Primary inbox"), timed inside the same batch with the trees interleaved, is the same in both:

    | Tree | Runs | Mean | Range |
    |---|---|---|---|
    | Current | 6 | 1076 ms | 840–1283 |
    | Baseline | 6 | 1090 ms | 935–1444 |

  - **Failure counts:** batch runs failed 7 of 23 times on current and 0 of 9 on baseline. That gap leaves real uncertainty.
  - **The new tests are not the cause:** skipping the 4 new test cases by name still gave 2 failures in 5 runs.
  - **Isolated probe** (module load split from render, 6 runs each): render mean 202 ms on both trees. Under identical background load, 5 pairs: current 259 ms, baseline 358 ms.
  - **Status:** no test timeout was raised and no test was changed for this. The baseline tree was `source-05-before` with the current `test/setup.ts` and ky-ui files. The probe and instrumentation were temporary; they were reverted, and `App.mailboxes.test.tsx` matches HEAD.
  - **Warm-up attempt, did not fix it, reverted:**
    - The attempt added a `beforeAll` that imports the real `./pages/ReadPage` module in `App.mailboxes.test.tsx` and `App.mobileSettings.test.tsx`. No timeout was raised and nothing was mocked.
    - Under the parallel reproducer, runs 1 and 2 passed. Run 3 failed with the same `Primary inbox` timeout (`App.mailboxes.test.tsx:113`, which is line 107 shifted by the 6 added lines), and the runs stopped there.
    - So the cold page-module load is not what uses up the 1 s window. The remaining time is in rendering and the mocked fetch chain under contention, and it is not yet attributed.
    - The attempt is kept for reference as `source-stages/kypost/kypost-06-warmup-attempt-reverted.patch`. After the revert, the worktree diff is byte-identical to `source-06-followup.patch`, which passed the full 1189-test run.
  - **Applied: a scoped 5 s wait** (`source-stages/kypost/source-07-test-wait.patch`).
    - It changes only the first `findByText("Primary inbox")` in two places: the first test of `App.mailboxes.test.tsx` and the test in `App.mobileSettings.test.tsx`. Calendar's lazy first-page test uses the same scoped wait.
    - The reason: 12 timed in-batch runs put the unchanged first-render flow at about 1.1 s under parallel load, past findBy's 1 s default. Those tests assert mailbox content, not render latency.
    - Nothing else changed: no global or other timeout, no assertion, no mocked fetch behaviour, no runtime code. `App.lazy.test.tsx` and its lazy-load and fallback coverage are untouched.
    - With the change, the parallel reproducer passed once (237/237) and the full suite passed once (1189/1189). Lint (0 warnings) and typecheck are clean.
    - These timings show the wait is about 1.1 s in both trees. They do not prove that stage 5 causes no regression: the batch failure counts above, 7 of 23 against 0 of 9, remain unexplained.
- **Not run:** Go vet, golangci-lint, govulncheck, `go test -race`, the container build, shellcheck, the compose checks and the worker typechecks. The diff touches no Go, script, compose, Dockerfile or worker file.

## Remaining gaps

- Captures and contrast cover Busnes Light/Dark plus a three-preset spot check, not every named palette on every page. Admin surfaces (Server, Users, Quarantine, Security) inherit the new button and field defaults but were not captured. Admin `MailDomain` buttons carry an unstyled `button secondary` class and now render as secondary, which was probably their intent.
- On phones the Tab order visits the strip before Logout, though Logout sits on the header row above it. The DOM order serves the desktop sidebar, where the account is at the foot. The whole sidebar still precedes the page, and there is no skip link (pre-existing).
- The ky-ui navigation hover uses `--panel-hover`, which named palettes do not set, so a named dark theme with a light OS gets a light hover in the sidebar. This is upstream in `navigation.css`/`tokens.css`, which KyPost must not edit.
- The reader body keeps its bordered `--bg` reading surface, because the sandboxed frame paints that background itself (`EmailBodyFrame` palette pairing, security-sensitive). The reader's header facts and action rows are otherwise unchanged in structure.
- The contact editor title stays "Add Contact" / "Edit Contact"; the dialog-title-as-action rule is met by that wording. On a 390px compose window, Quill's clear-format button wraps to a second toolbar line.
- Phone contact rows use `display: grid` on table rows. Chromium keeps table semantics, but this is not verified in other engines or with a screen reader.
- Loading and error states were not captured in stage 5 either.
- No scores here. Whether this reaches 9/10 is for the council re-rank, from these captures.
