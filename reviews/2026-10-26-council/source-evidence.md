# Council source evidence: KyPost, KyCalendar, KyMessages (reviewer B)

Independent source review, 2026-10-26. This report does not rate anything: the detector cannot score screenshots, and no new captures were taken. It did not read any `initial-*` file, change product source, start a server, or contact a live service.

## Revisions examined

Local checkouts are out of date. Use the remote default branches; the pages in the live screenshots match them.

| Product | Local checkout | Revision examined |
|---|---|---|
| KyPost | `main` de53d118, 88 commits behind | `origin/main` 3037caf8 |
| KyCalendar | `fix/calendar-layout-branding` 28daa7a (upstream deleted; web/src differs by 43 files) | `origin/main` 9a527d2 |
| KyMessages | `ui/remove-console-device-pairing` e829b9e | `origin/master` 0514749 (default is `master`) |
| ky-ui | `main` 947bf96 | `origin/main` 41daa93 (`src/` unchanged, 0.2.0) |

Read-only snapshot: `/tmp/council-b.Mwkf`, made with `git archive` of each web source tree. All three products vendor ky-ui 0.2.0 with the same hashes, and `node src/ky-ui/check-vendor.mjs` passed in each snapshot.

## Screenshot attribution

The user's screenshots are in `/home/yoshi/Pictures/KyPost-UI-Councel/`. That folder name is misspelled on disk.

- **`KyPost-live-Calendar-01/02.png` show standalone KyCalendar.** Confirmed from the screen and the source. The screens show the KyCalendar wordmark, "Phones & apps", "Everyday account" and "Subscribe to a calendar". These strings come from KyCalendar `web/src/components/AppHeader.tsx:28,65` and `CalendarSidebar.tsx:49,209`. KyPost has no calendar route in `frontend/src/App.tsx` or `app/navigation.ts`; it has only the `KyCalendar` mail-settings toggle. The layout also matches 9a527d2: the calendar list sits in an unboxed column with a right border, from `web/src/styles/calendar.css:93-95`.
- **`mailboxorg-notes-02.png` is mislabeled. It shows the KyNotes Settings page,** not mailbox.org. The wordmark, "Saved to server", "Lock" and "Colleague keys" are on screen, and the text "Choose from the complete KyNotes color selection" comes from kynotes-server `origin/master:web/src/main.tsx:3452`. `mailboxorg-notes-01.png` is the real mailbox.org Notes page.
- **`KyPost-live-Notes-01.png` is the KyNotes workspace** ("Your private desk.", `main.tsx:3185`). It is not part of KyPost.
- **There are no KyMessages screenshots.** No file is named for Messages, chat or Element.
- **The KyMessages console is not the chat.** The console in `web/` is the administrator operator console. A non-administrator sees only `MemberHome.tsx`: the account name, an "Open chat" link to `chat_url` that opens in a new tab, and sign-out. Chat is stock Element Web v1.12.30 (`docker-compose.matrix.yml:181`), configured only through `config.json` under the AGPL rule in `internal/matrixinit/AGENTS.md`.
- **Element already has Busnes colors, but users won't see them at first.** The colors are set in `internal/matrixinit/templates/element.json.tmpl:27-74`: hex values copied from `tokens.css` into `custom_themes`, with `default_theme` set to Busnes Light. Element's `use_system_theme` is a device setting that a config file cannot change, so browsers with a color-scheme preference start on Element's built-in light or dark theme (`matrixinit/AGENTS.md`). Element also keeps its own typeface rather than Space Grotesk.
- **The live captures contain real names, addresses and phone numbers** (KyPost inbox and contacts). Do not copy them into a repository; use synthetic data for before/after evidence.

## Detector results (`impeccable detect --json`)

| Product | Files scanned | Findings | Assessment |
|---|---|---|---|
| KyPost | `App.tsx`, `pages/ReadPage.tsx`, `pages/ContactsPage.tsx` | 1: `overused-font` at `ReadPage.tsx:1378` (`font-family: Arial`) | False positive. The Arial is in a print-only, sandboxed `srcdoc` frame, not in the app interface. |
| KyCalendar | `App.tsx`, `pages/CalendarPage.tsx` | 0 | No KyCalendar `ContactsPage` or `ReadPage` exists. |
| KyMessages | `App.tsx`, `pages/MemberHome.tsx` | 0 | No `CalendarPage`, `ContactsPage` or `ReadPage` exists. |

A supplementary CSS scan found the following.

- KyPost `styles.css` has 4 findings:
  - `overused-font` at line 17 (Space Grotesk): a false positive for this brief. It is the suite brand face in all three products, and the brief is to refine it, not replace it.
  - `side-tab` at line 5273 (`.auth-status` accent left border): a minor true positive. It is decorative on a status note, while the suite uses the accent rail only to mark the selected page.
  - `bounce-easing` at line 599 (swipe snap-back): an intentional touch spring.
  - `layout-transition` at line 2699 (`width` on a 4px pairing timer bar): harmless.
- KyCalendar `styles/` and KyMessages `styles/theme.css` each have 1 finding, `overused-font` on Space Grotesk at `theme.css:3`. Both are the same brand false positive.

The detector found nothing about consistency across products, which is the actual problem. The evidence for that is the source comparison below.

## Inconsistencies in the source

1. **ky-ui shares colors only; type and spacing are left to each product.**
   - `ky-ui/src/tokens.css` defines colors, a single `--ky-radius: 10px`, and `--ky-font-sans: Inter, …` / `--ky-font-mono: SFMono…`. No product uses those two font tokens.
   - Each product loads its own Space Grotesk and IBM Plex Mono. KyPost does this at `frontend/src/styles.css:16-37` and `:63`; KyCalendar and KyMessages at `web/src/styles/theme.css:3-24` and `:44`.
   - ky-ui has no type scale, spacing scale, elevation or field-border token.
2. **KyCalendar copies a shared house style that the others lack.** Its `theme.css:107-124` (`--space-1…7`, `--radius-sm/md/lg`, `--field-border` at 3:1, `--shadow-modal`) and its `ui.css` (page header, card, form, table and dialog styles) were copied from KyIdentity's `web/src/index.css`. KyMessages' `theme.css` is still the older ky_server_base copy, without those tokens. Rough size of the drift per stylesheet:

   | Stylesheet | Font sizes | Radii | Shadows | Raw hex colors |
   |---|---|---|---|---|
   | KyPost `styles.css` (5448 lines) | 36 | 15 | 29 | 83 |
   | KyCalendar `theme.css` / `ui.css` / `calendar.css` | 12 / 15 / 9 | — | — | — |
   | KyMessages `theme.css` | 12 | — | — | — |

   KyPost never references a `--ky-*` token directly; it reaches them only through the compatibility aliases.
3. **The page surface differs between products.**
   - KyPost puts every page inside `.panel` (`styles.css:389-396`: radius 14px, padding 18px, `box-shadow: 0 10px 30px rgba(0,0,0,.4)`) with 28px of content padding. That is the floating, heavy-shadow card in `KyPost-live-01`.
   - KyCalendar's calendar page has no card (`calendar.css:93`, padding 24px). Its other pages use `.card` with `--radius-md` and no shadow.
   - KyMessages uses `.panel` with radius 8px and padding 20px (`theme.css:146-151`).
4. **Button hierarchy differs.**
   - KyPost styles every button as a filled accent button (`styles.css:907-917`), and disabled buttons are only faded (`:927`, opacity .6). That is the row of pale orange Delete/Archive/Spam/Snooze/Read/Print buttons.
   - KyMessages does the same (`theme.css:162-176`, 6px radius, 14px text) and adds only `.btn-secondary`.
   - KyCalendar has secondary, ghost, danger and small variants (`theme.css:215-227`).
5. **Field borders have low contrast in KyPost and KyMessages.** Both draw inputs with `var(--line)`, a 22% alpha ink (KyPost `styles.css:887-895`, KyMessages `theme.css:206-215`). KyCalendar uses `--field-border`, which it documents as 3:1 for WCAG 1.4.11.
6. **Page titles differ in level, size and weight.**

   | Product | Page title |
   |---|---|
   | KyPost | `<h2>` with an inline style and the browser-default size (`ReadPage.tsx:1395`; `.contacts-header h2` at `styles.css:2919`). No page has an `h1`. |
   | KyCalendar | `h1`, 1.75rem/600 (`ui.css .page-title`, `calendar.css:96`) |
   | KyMessages | `h1`, 28px or 24px/700 (`theme.css:297,469`) |

   KyCalendar's workspace `h1` also comes out in muted ink: `.kc-calendar { color: var(--ky-ink) }` (`calendar.css:51-53`) applies and `.kc-workspace-heading h1` sets no color. That is the grey "Calendar" heading in the screenshot. `calendar.css` also mixes px values (20, 13 and 12px at 72-90) with rem values.
7. **The sidebar differs.**

   | | KyPost | KyCalendar and KyMessages |
   |---|---|---|
   | Width | 240px | 15.5rem |
   | Wordmark | 1.35rem, 48px icon (`styles.css:113-117`) | 1.15rem (`theme.css:146-151`, `:120-128`) |
   | Nav links | 16px, radius 10px, padding 9×10, no icons (`styles.css:160-181`) | .86rem, radius .45rem, icons |
   | Sign-out | a "Logout" nav link plus a license footer | an account block (name, role, sign-out icon) with a theme selector |

   KyNotes adds a third pattern, a top bar with Settings and Lock.
8. **Some documentation is wrong (not edited).**
   - kypost `frontend/AGENTS.md:106` says Patina Ky is the default theme, but `theme.ts:334` defaults to Busnes Light or Dark.
   - `frontend/AGENTS.md:178` points to Playwright tests in `scripts/tests/`, which does not exist.
   - ky-ui `consumers.json` leaves out KyCalendar and KyMessages, although both vendor `src/ky-ui/`. A token release synced through `sync:consumers` or checked with `check:suite` would not reach them, so each needs a manual sync.

## Most efficient shared fixes

In priority order. Each one keeps ky-ui's rule that tokens belong in ky-ui and page layout stays in each product.

1. **Add the missing tokens to ky-ui and add the two products to `consumers.json`.**
   - Change `--ky-font-sans` and `--ky-font-mono` to the Space Grotesk and IBM Plex Mono stacks.
   - Add `--ky-space-1…7`, `--ky-radius-sm/md/lg`, `--ky-field-border`, `--ky-shadow-modal`, an optional small `--ky-shadow-raised`, and a short type scale (page title 1.75rem/600, section 1.05rem/600, body .9–.95rem, meta .8rem). Take the values from KyCalendar `theme.css:107-124` and `ui.css`.
   - Add KyCalendar and KyMessages to `consumers.json`.
2. **KyMessages** (low risk; it already shares the ky_server_base shell):
   - Point `theme.css` at the new tokens.
   - Add button variants and the field border.
   - Copy KyCalendar's page-header, card, form, table and dialog styles from `ui.css`.
   - Optionally, add the font to Element's `custom_themes` via the theme `fonts` key. First check that Element v1.12.30 supports it and that the CSP allows the font source.
3. **KyPost** (largest visible gain):
   - Change `.panel`: no shadow or the raised token, radius from the token, padding from the space scale.
   - Make the default `button` a secondary outline. Keep the filled accent for New Email, Search, Send and Save.
   - Switch inputs to `--ky-field-border`.
   - Give each page title one `h1` style matching the page-title scale.
   - Bring the sidebar's link size, radius and spacing in line with the other two, and move sign-out into an account block.
4. **KyCalendar:** add `color: var(--ky-ink-strong)` to `.kc-workspace-heading h1`, and change the px values in `calendar.css` to rem or tokens.

## How to capture each product locally

None of these steps was run for this report. All of them use disposable data on loopback.

Make each worktree under `<repo>/.claude/worktrees/<name>` from the revision above, for example `git -C KyCalendar worktree add .claude/worktrees/ui-council-capture origin/main`.

Prerequisites on this machine:
- Go 1.27.1 is installed, but the go.mod files want toolchain 1.27.3, so the first build downloads it.
- Node 24.22.0 is installed; KyPost expects 26.12.1.
- Playwright Chromium and Firefox are already cached.

### KyCalendar

1. Run `cd web && npm ci && npm run build`.
2. Run `cd .. && go build -o .browser/server ./cmd/server`.
3. Run `cd web && npm run test:browser`. This covers light and dark at 390 and 1280px, with `ui.spec.mjs` saving full-page captures to `web/test-results/`.
4. For manual captures, run `node browser/server.mjs` in the foreground. It serves on 127.0.0.1:5391; SIGTERM or Ctrl-C deletes its temporary data directory.
   - Sign in as the everyday user `walter` with the fixture password in `browser/server.mjs`. Sign-in forces a password change.
   - Create synthetic events.
   - In the T3 preview, use `preview_set_appearance` for light and dark, `preview_resize` for 1280×900 and 390×844, and `preview_snapshot save=true`.

### KyMessages operator console

1. Follow the same steps as KyCalendar. It uses ports 5391 and 5392, which collide with KyCalendar, so run the two one after the other.
2. Captures land in `test-results` from `ui.spec.mjs:81-183` (settings, branding, backup, rooms, health, audit, overview), with Matrix off.
3. Two pages cannot be captured this way:
   - `MemberHome`: the harness only creates the administrator. KyMessages has no `create-user` command, and SCIM accounts sign in only through single sign-on.
   - Element: there is no harness for it here.

### KyMessages chat (Element)

1. Run `make matrix-acceptance`. It needs Docker, a KyIdentity checkout in `KYIDENTITY_SRC`, `certutil`, and Playwright installed in `scripts/matrix-acceptance`.
2. It runs as a throwaway Compose project `kymatrix-accept-<pid>`; an exit trap runs `down -v` on that project only. It saves traces, and screenshots only on failure (`e2e.mjs:50,817`).
3. Visual evidence of Element needs one added capture step. It is a long, heavy run, but it uses only disposable data.

### KyPost

There is no browser harness. These steps are worked out from the source and match the disposable captures described in `UI-POLISH.md` and `UI-VERIFICATION.md`.

1. Run `cd frontend && npm ci && npm run build`, then `cd backend && go build -o <tmp>/kypost-server ./cmd`.
2. Run `T=$(mktemp -d)` and create `$T/{config,private,state,logs}` with mode 0700.
3. Run the binary with these settings:
   - Environment: `CONFIG_DIR=$T/config SECRET_DIR=$T/private STATE_DIR=$T/state LOG_DIR=$T/logs FRONTEND_DIR=<wt>/frontend/dist WEB_PORT=<high port>`.
   - First `kypost-server --mode bootstrap-admin`, which writes `first-run-password.txt` in `$T/config`. Then `--mode server`.
4. **The server listens on all network interfaces, not just this machine** (`backend/internal/api/server.go:926`, `":"+port`). Use it only on a trusted network, and stop it as soon as the captures are done.
5. Sign in and rotate the password.
6. For synthetic mail and contacts, `kypost-demo-IMAP` has seeded personas (alice, bob, charlie) and CardDAV. Its Compose setup assumes a Cloudflare tunnel and a fixed network, and expects KyPost to trust its self-signed certificate through `SSL_CERT_DIR`. Wiring it up locally needs a dry run.

## Checks

For each product, run these in its own worktree.

KyCalendar and KyMessages:
- `make ci`
- `cd web && npm ci && npm test && npm run build` (commit `web/dist`; CI diffs it)
- `npm run test:browser` after `go build -o .browser/server ./cmd/server`

KyPost (in `frontend/`):
- `npm test` (includes `pages/read/readability.test.tsx` for every theme)
- `npm run typecheck`
- `npm run lint`
- `npm run build`

ky-ui:
- `npm test` (passed for this report: 8 of 8)
- `npm run test:browser`
- `npm run sync:consumers -- --root=<suite worktree root>`, then `npm run check:consumers -- --root=<suite worktree root>`

Detector:
- `/home/yoshi/.codex-cpa/skills/impeccable/scripts/impeccable detect --json <files>`
