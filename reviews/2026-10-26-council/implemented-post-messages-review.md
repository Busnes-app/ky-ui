# Implemented KyPost + KyMessages: fresh visual acceptance review

**No cohort reaches 9.0, so neither product is accepted.** The redesigned screens are calm and use one design vocabulary, a clear step up from the baseline captures. What still costs points is a short list of specific problems that can be fixed without new features. Nearly all of them are on phones or inside dialogs.

- **Reviewer:** Claude Opus 5.5 (`claude-opus-5-5`), design sub-agent, Claude Code in T3 Code, 2026-10-26.
- **Rubric:** `ky-suite-v2`, unchanged. Weights: hierarchy 0.20, typography 0.15, density_layout 0.20, color 0.15, visible_affordances 0.15, coherence 0.15. `ky_fit` uses five dimensions at 0.20 each and is never added to `total`.
- **Data:** every row, hash, observation and aggregate is in `implemented-post-messages-scores.json` (schema `ky-ui-council-scores/2`).
- **Blind scoring:** I froze all 72 representative scores (snapshot SHA-256 `30167135…b9e6`) before opening `kypost-implementation.md`, `kymessages-implementation.md` or `reranked-review.md`. No earlier score exists for these images. I made no score changes after unblinding.
- **Scope:** completed KyPost and KyMessages only. KyCalendar's stage 04 is not ready and is not rated, and these two products are not penalised for its rejected double panel.

## Source set and capture conditions

| Product | Final images | Revision | Conditions |
|---|---|---|---|
| KyPost | `kypost-03-after-*`: 28 files, 7 surfaces × light/dark × desktop/phone | `3037caf8` plus uncommitted stage-03 source (`source-stages/kypost/source-03-after.patch`, `39b9eadf…`) | Playwright 1.63.0 Chromium, America/New_York, synthetic IMAP fixture (4 messages, 4 contacts, user `alex`), theme follows the context `colorScheme` |
| KyMessages | `kymessages-00-after-*`: 54 files. `kymessages-03-after-*`: 24 form recaptures | `0514749` plus web/src patch `51231a71…`, binary `7c02dd8a…`, the same build for both prefixes | Chromium 153, America/Chicago, fresh SQLite admin, Matrix off, theme set through the product's own select |

- **Inventory:** 106 files.
  - 72 representatives are scored, one per product, surface, theme and viewport.
  - 14 are exact or near duplicates. Thirteen `03-after` files are byte-identical to their `00-after` twins. `login-mobile-light` differs in 1.8e-5 of pixels, by at most 1 level.
  - 20 are variants:
    - 16 full-page captures (10 from `00-after`, 6 from `03-after`). I inspected these for below-fold content and scored each with its viewport representative.
    - 4 viewport recaptures in `03-after` (backup), from the same build.
    - The 10 non-duplicate `03-after` files (backup ×8, settings-mobile-full ×2) differ from their `00-after` twins by more than the near-duplicate rule allows. Each diff is measured and recorded.
  - Every unscored file is listed below with its reason.
- **Full-page artifact:** in `-full` captures the sticky sidebar (desktop) or header (phone) renders partway down the page. I did not score it as a defect.
- **Baselines:** `kypost-01-before-*` (`3037caf8`) and `kymessages-00-before-*` (`0514749`) were inspected for context only, not scored. They show what changed:
  - KyPost: a shadowed card frame, six faded-orange toolbar buttons with nothing selected, and an orange category pill.
  - KyMessages: uppercase badge labels, faded-orange disabled primaries and a pink warning banner.

## Quality by cohort (mean of unique representatives, unrounded sums, n shown)

These are within-product numbers. This source set has no matched competitor captures, so there is no cross-product or cross-provider ranking.

| Product | Cohort | n | Mean | Lowest file | Desktop / phone | Light / dark | ky_fit mean (min) |
|---|---|---|---|---|---|---|---|
| KyPost | mail-list (inbox, selection) | 8 | **7.15** | 6.5 (selection, phone) | 7.73 / 6.58 | 7.15 / 7.15 | 6.80 (6.2) |
| KyPost | mail-read (reader) | 4 | **5.85** | 5.6 (phone) | 6.10 / 5.60 | 5.85 / 5.85 | 6.10 (5.6) |
| KyPost | compose | 4 | **7.34** | 7.1 (phone dark) | 7.48 / 7.20 | 7.53 / 7.15 | 6.60 (6.2) |
| KyPost | contacts-list | 4 | **6.58** | 5.8 (phone) | 7.35 / 5.80 | 6.58 / 6.58 | 6.80 (6.2) |
| KyPost | contact-editor | 4 | **6.18** | 6.1 (phone) | 6.25 / 6.10 | 6.18 / 6.18 | 6.80 (6.4) |
| KyPost | settings (Appearance) | 4 | **7.35** | 6.8 (phone) | 7.95 / 6.75 | 7.35 / 7.35 | 7.20 (6.6) |
| KyMessages | admin-console (overview, users, agents, rooms, health, audit, SCIM, backup) | 32 | **6.78** | 5.6 (audit, phone) | 6.81 / 6.76 | 6.75 / 6.82 | 7.59 (6.8) |
| KyMessages | settings | 4 | **6.79** | 6.7 (phone) | 6.93 / 6.65 | 6.75 / 6.83 | 7.25 (7.0) |
| KyMessages | auth (login, change password) | 8 | **7.93** | 7.7 (change password) | 7.93 / 7.93 | 7.93 / 7.93 | 7.60 (7.2) |

- "Lowest file" is that file's rounded `total`. Means use unrounded weighted sums.
- Users, Agents and Rooms share one empty-state template, so that pattern carries three-eighths of the admin-console mean.

**Within-product visual summary.** Equal cohort weight. This is not a ranking and not a product certification.

| Product | Cohorts | Equal-cohort mean | Lowest cohort | Lowest file | Files ≥ 9.0 | ky_fit mean (min) |
|---|---|---|---|---|---|---|
| KyPost | 6 | 6.74 | 5.85 (mail-read) | 5.6 | 0 of 28 | 6.73 (5.6) |
| KyMessages | 3 | 7.17 | 6.78 (admin-console) | 5.6 | 0 of 44 | 7.56 (6.8) |

### By surface (mean, ky_fit mean)

- **KyPost:**
  - inbox 7.15 (6.8)
  - selection 7.15 (6.8)
  - reader 5.85 (6.1)
  - contacts 6.58 (6.8)
  - contact editor 6.18 (6.8)
  - compose 7.34 (6.6)
  - appearance 7.35 (7.2)
- **KyMessages:**
  - login 8.20 (8.0)
  - change password 7.65 (7.2)
  - overview 7.49 (7.85)
  - SCIM 7.11 (7.45)
  - users, agents, rooms 6.91 each (7.85)
  - settings 6.79 (7.25)
  - health 6.66 (7.45)
  - audit 6.16 (7.35)
  - backup 6.11 (7.05)

## What holds them back (visible evidence only)

**KyPost**

- **Desktop list views are solid.**
  - One primary (New Email or New Contact) and a selection-only toolbar.
  - Unread rows differ by weight alone, and selected rows take the accent-soft fill.
- **Reader.** The lowest cohort, 5.85.
  - The title reads "Email Details" instead of the message subject.
  - Eleven buttons wrap onto two rows on desktop and four on phone, and Reply, the primary, sits on the second row.
  - Outline and text-only buttons are mixed in one row.
- **Contact editor.** The "Add Contact" dialog has no visible Save, Cancel or close control in either viewport, and "+ Add email" is cut off at the bottom of the desktop dialog.
- **Phone shell.** On the inbox, selection, contacts and appearance captures:
  - There is no KyPost wordmark. KyMessages shows its own on phones.
  - The nav chips wrap into three rows.
  - The Scheduled chip is clipped, and on Appearance the Mail chip is cut off by the bottom of the header.
- **Phone contacts.** The Edit and Delete column and parts of each email address are clipped, with no visible cue that the table scrolls.
- **Compose, dark theme.** The Quill toolbar icons are nearly invisible.

**KyMessages**

- **Sign-in and the shell are close to the contract.**
  - 240px sidebar, stamp and wordmark, a pinned account region with Sign out.
  - A one-row phone header.
  - Orange appears only on primaries, the selection and focus.
- **Light theme selected nav.** The selected row has no surface change. A sampled pixel is `#f2efe7`, identical to an idle row, so only the accent rail marks the current page. Dark theme does show a surface change.
- **Backup.**
  - In the captured state there is no enabled primary: Back up now is disabled.
  - Every section sits in a bordered card.
  - "0 of 7" local copies is shown in success green.
- **Health.** The four `Warn:` lines and the `Pass:` line share the same ink, so the warnings carry no status colour or icon.
- **Audit on phones.** The table hides Target, Outcome, Details and IP, with no scroll cue. Timestamps wrap to three lines.
- **Smaller issues:**
  - The Overview status column starts at three different x positions (517, 544 and 546).
  - Page titles don't match their nav labels: "System Settings & Architecture" against "Settings & DB", and "SCIM 2.0 Directory & Inbound Provisioning" against "Directory & SCIM".
  - The theme select appears twice on Settings.
  - Change password shows no brand and no theme select, unlike the sign-in page it follows.
  - Users, Agents and Rooms name docs/CHAT-SETUP.md in plain text, not as a link.

**Suite fit.**

- The KyPost envelope mark and the KyMessages "B" stamp differ.
- KyPost content sits on a white panel; KyMessages content sits on the cream page.
- `suite_cohesion` is 5–7 across both products.

## Top 5 fixes that move scores now (ranked by impact; no new features)

1. **KyPost phone shell.** Affects `kypost-03-after-{inbox,inbox-selection,contacts,appearance}-mobile-{light,dark}.png`, 8 images.
   - Visible problem: no wordmark, nav chips wrapping into three rows, Scheduled and Mail clipped, and Logout styled as a nav chip.
   - Fix: use the KyMessages phone header pattern.
     - Row one: stamp and KyPost wordmark on the left, account and sign-out icon on the right.
     - Row two: one non-wrapping, horizontally scrolling chip strip in the same order and with the same labels. Contacts and the Settings sub-pages go in that strip, not on their own rows.
     - Use a fixed header height so no chip is cut off vertically.
   - These images currently score 5.8–6.8 on quality and 6.2–6.6 on `ky_fit`.
2. **KyPost contact editor actions.** Affects `kypost-03-after-contact-editor-*`, 4 images.
   - Visible problem: no visible Save, Cancel or close control.
   - Fix: make the dialog footer sticky (Add Contact primary and Cancel, which already exist at the bottom of the form) and add a close button in the header. On phones, pin the same footer to the bottom of the sheet.
   - Related: "+ Add email" is cut off at the bottom of the desktop dialog.
   - Hierarchy is 5 and affordances 4–5 in all four images.
3. **KyPost reader action hierarchy.** Affects `kypost-03-after-reader-*`, 4 images.
   - Visible problem: generic title, a buried Reply and mixed button styles. This is the lowest cohort at 5.85.
   - Fix:
     - Use the subject as the dialog title.
     - Put Reply (primary), Reply All and Forward first, on a single row.
     - Render Archive, Snooze, Read, Spam, Print and Delete as the same quiet icon-and-label buttons the inbox selection toolbar already uses, with Delete in danger text.
     - Make Close an icon button in the header corner.
     - On phones, keep a single non-wrapping action row with the icon-only treatment that toolbar already uses there.
   - Also: the "View raw email" link is in accent orange. Make it ink.
4. **Clipped phone tables.** Affects `kypost-03-after-contacts-mobile-*` and `kymessages-00-after-audit-mobile-*`, 4 images, all at affordances 4.
   - Below the phone breakpoint, render each row as a stacked block:
     - Contacts: name and organisation, the email, then Edit and Delete as tertiary buttons.
     - Audit: When · Who on one line, then What and Target, then Details and IP.
   - Keep the desktop tables as they are.
   - This removes the hidden columns, the cut emails and the three-line timestamps.
5. **KyMessages light-theme selection and status colour.** Affects all 9 `kymessages-00-after-*-desktop-light.png` sidebar pages, plus the Health and Backup images.
   - Selected nav in light theme: give the selected row a surface distinct from the sidebar, such as `--ky-accent-soft` as KyPost uses, or `--ky-panel`. Today `--panel-hover` equals the light sidebar colour `#f2efe7`.
     - The shared hover fix already in source targets named themes. Busnes Light is unchanged in these captures, so this needs its own check.
   - Health: colour-code each line (`Warn:` in `--ky-warning`, `Pass:` in `--ky-success`, each with an icon).
   - Backup: give "0 of 7" a neutral or warning badge instead of success green.

Also worth fixing in the same pass, at lower impact:

- KyPost dark compose: give the Quill toolbar icons `--ky-ink` strokes.
- KyMessages Overview: put the status column on one grid column so it lines up.
- KyPost contacts: replace the typed `>` glyph after each name with the chevron icon, or remove it.

## Gates (recorded evidence only; I executed none of them)

Screenshots cannot pass a gate. An untested gate means not accepted.

| Gate | KyPost | KyMessages |
|---|---|---|
| keyboard | untested. Desktop nav order and compose Escape focus return are recorded. Reader, contact editor and phone paths are not. | untested. A Tab focus walk per state is recorded. Task completion and dialog focus return are not. |
| focus | untested. ≥2px rings recorded on desktop nav and toolbar only. | untested. No stop without an indicator across 44 Busnes states. Named themes are not measured. |
| contrast | untested. Selected pairs recorded for Busnes and 3 presets, not every element. The dark Quill icons are a visible concern. | untested. Text ≥4.99 (light) and ≥5.11 (dark); borders ≥3.38 and ≥4.78. Busnes only. |
| states | **fail.** No loading or error state captured. | **fail.** Empty states only. No loading or error state captured. |
| responsive | untested. Overflow is 0, but contacts and nav chips are clipped on phones. | untested. Overflow is 0, but Audit columns are hidden on phones. |

**Product checks recorded by the implementers (not executed by me):**

- **KyPost:**
  - npm test 1185/1185. One earlier full run failed `App.mailboxes.test.tsx`; it is unproven whether that flake predates the change.
  - Typecheck clean. Lint: 0 errors and 18 warnings, the same as HEAD. Build passes. Vendor check passes. Audit: 0 vulnerabilities.
  - **Not run:** Go vet, golangci-lint, govulncheck, `go test -race`, the container build, shellcheck, the compose checks and the worker typechecks.
- **KyMessages:**
  - npm test 153/153. `tsc -b` and build pass. Audit: 0 vulnerabilities. `test:browser` 7/7.
  - `make ci` passes. Its smoke step first failed because another server was on port 18080; the rerun on 18097 passed 85 checks.
  - **Not run:** `make matrix-acceptance` and `make test-postgres`.

## Coverage and missing evidence

- **KyMessages MemberHome and Element chat:** `N/A`, not zero. Neither was captured: MemberHome needs a KyIdentity SSO member, and the harness has no console SSO client. The full SSO-to-chat path is unverified.
- **KyMessages Matrix-on surfaces:** the user, agent and room tables, the Agents token dialog, the Rooms confirmations and 2FA enrolment were not captured, because Matrix is off.
- **Named themes:** only Busnes Light and Dark were captured, for both products. The shared nav hover fix applies to named themes, but the final captures predate it, and no named-theme capture exists.
- **KyPost:** admin pages (Server, Users, Quarantine, Security) and the Settings panels other than Appearance were not captured.
- **Loading and error states:** none captured, for either product.
- **Fixture drift:** `kypost-03-after-reader-mobile-light.png` shows a different message (Charlie Demo, 10/26/2026) from the other three reader captures.
- **Spreadsheet:** the skill asks for a council workbook. This review owns only the JSON and this file. The JSON is the machine-readable source for the parent's export.

## Recompute

```sh
python3 -I -c 'import json;from decimal import Decimal as D,ROUND_HALF_UP as H
d=json.load(open("implemented-post-messages-scores.json"));w=d["rubric"]["weights"]
f=[x for x in d["files"] if "scores" in x]
print(len(d["files"]),len(f),all(x["total"]==float(sum(D(str(w[k]))*v for k,v in x["scores"].items()).quantize(D("0.1"),H)) for x in f))'
```

Expected output: `106 72 True`.

## Per-image scores

H = hierarchy, T = typography, D = density_layout, C = color, A = visible_affordances, Co = coherence. Observations, `ky_fit` dimensions and full hashes are in the JSON.

| File | sha256 (12) | Cohort | State | H | T | D | C | A | Co | Total | ky_fit |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `kymessages-00-after-agents-desktop-dark.png` | `54e15ac2db7a` | admin-console | empty | 6 | 7 | 7 | 8 | 6 | 8 | **7.0** | 7.8 |
| `kymessages-00-after-agents-desktop-light.png` | `edf5f9eba2df` | admin-console | empty | 6 | 7 | 7 | 8 | 5 | 8 | **6.8** | 7.6 |
| `kymessages-00-after-agents-mobile-dark.png` | `186d307434c1` | admin-console | empty | 6 | 7 | 7 | 8 | 6 | 8 | **7.0** | 8.0 |
| `kymessages-00-after-agents-mobile-light.png` | `b5cc771df401` | admin-console | empty | 6 | 7 | 7 | 8 | 6 | 8 | **7.0** | 8.0 |
| `kymessages-00-after-audit-desktop-dark.png` | `af843d67587b` | admin-console | populated | 7 | 7 | 6 | 8 | 6 | 7 | **6.8** | 7.4 |
| `kymessages-00-after-audit-desktop-light.png` | `09c0b61afcd1` | admin-console | populated | 7 | 7 | 6 | 8 | 5 | 7 | **6.7** | 7.2 |
| `kymessages-00-after-audit-mobile-dark.png` | `1faf3382b46d` | admin-console | populated | 6 | 6 | 4 | 8 | 4 | 6 | **5.6** | 7.4 |
| `kymessages-00-after-audit-mobile-light.png` | `53639e8c81f2` | admin-console | populated | 6 | 6 | 4 | 8 | 4 | 6 | **5.6** | 7.4 |
| `kymessages-00-after-backup-desktop-dark.png` | `17ec87a233ef` | admin-console | empty | 6 | 6 | 6 | 6 | 7 | 6 | **6.2** | 7.0 |
| `kymessages-00-after-backup-desktop-light.png` | `1d63c4dcaefc` | admin-console | empty | 6 | 6 | 6 | 6 | 6 | 6 | **6.0** | 6.8 |
| `kymessages-00-after-backup-mobile-dark.png` | `cb7767afd90a` | admin-console | empty | 6 | 6 | 6 | 6 | 7 | 6 | **6.2** | 7.2 |
| `kymessages-00-after-backup-mobile-light.png` | `908642b106a9` | admin-console | empty | 6 | 6 | 6 | 6 | 7 | 6 | **6.2** | 7.2 |
| `kymessages-00-after-change-password-desktop-dark.png` | `33018e680dd0` | auth | empty | 8 | 8 | 7 | 8 | 8 | 7 | **7.7** | 7.2 |
| `kymessages-00-after-change-password-desktop-light.png` | `aafa2ab58cac` | auth | empty | 8 | 8 | 7 | 8 | 8 | 7 | **7.7** | 7.2 |
| `kymessages-00-after-change-password-mobile-dark.png` | `4d2c51e91ea7` | auth | empty | 8 | 8 | 7 | 8 | 8 | 7 | **7.7** | 7.2 |
| `kymessages-00-after-change-password-mobile-light.png` | `20df4e438a34` | auth | empty | 8 | 8 | 7 | 8 | 8 | 7 | **7.7** | 7.2 |
| `kymessages-00-after-health-desktop-dark.png` | `5fa0fa9acbe1` | admin-console | populated | 7 | 7 | 7 | 6 | 7 | 6 | **6.7** | 7.4 |
| `kymessages-00-after-health-desktop-light.png` | `0b30d6ef538d` | admin-console | populated | 7 | 7 | 7 | 6 | 6 | 6 | **6.6** | 7.2 |
| `kymessages-00-after-health-mobile-dark.png` | `9598bf7215ec` | admin-console | populated | 7 | 7 | 7 | 6 | 7 | 6 | **6.7** | 7.6 |
| `kymessages-00-after-health-mobile-light.png` | `b4c70d1c66ac` | admin-console | populated | 7 | 7 | 7 | 6 | 7 | 6 | **6.7** | 7.6 |
| `kymessages-00-after-login-desktop-dark.png` | `55d50b39102d` | auth | populated | 9 | 8 | 8 | 8 | 8 | 8 | **8.2** | 8.0 |
| `kymessages-00-after-login-desktop-light.png` | `5b7399c75a9b` | auth | populated | 9 | 8 | 8 | 8 | 8 | 8 | **8.2** | 8.0 |
| `kymessages-00-after-login-mobile-dark.png` | `c33bfc159bcb` | auth | populated | 9 | 8 | 8 | 8 | 8 | 8 | **8.2** | 8.0 |
| `kymessages-00-after-login-mobile-light.png` | `dd4becc3f34c` | auth | populated | 9 | 8 | 8 | 8 | 8 | 8 | **8.2** | 8.0 |
| `kymessages-00-after-overview-desktop-dark.png` | `58a989c4f1a4` | admin-console | sparse | 7 | 8 | 6 | 8 | 8 | 8 | **7.4** | 7.8 |
| `kymessages-00-after-overview-desktop-light.png` | `63b279227c15` | admin-console | sparse | 7 | 8 | 6 | 8 | 7 | 8 | **7.3** | 7.6 |
| `kymessages-00-after-overview-mobile-dark.png` | `8400466885ab` | admin-console | sparse | 7 | 8 | 8 | 8 | 7 | 8 | **7.7** | 8.0 |
| `kymessages-00-after-overview-mobile-light.png` | `a84398c25615` | admin-console | sparse | 7 | 8 | 8 | 8 | 7 | 8 | **7.7** | 8.0 |
| `kymessages-00-after-rooms-desktop-dark.png` | `1f456559b94e` | admin-console | empty | 6 | 7 | 7 | 8 | 6 | 8 | **7.0** | 7.8 |
| `kymessages-00-after-rooms-desktop-light.png` | `84634afde924` | admin-console | empty | 6 | 7 | 7 | 8 | 5 | 8 | **6.8** | 7.6 |
| `kymessages-00-after-rooms-mobile-dark.png` | `1c285c26a277` | admin-console | empty | 6 | 7 | 7 | 8 | 6 | 8 | **7.0** | 8.0 |
| `kymessages-00-after-rooms-mobile-light.png` | `ea32b2aa80e0` | admin-console | empty | 6 | 7 | 7 | 8 | 6 | 8 | **7.0** | 8.0 |
| `kymessages-00-after-scim-desktop-dark.png` | `3618b6605ba8` | admin-console | empty | 7 | 7 | 7 | 8 | 7 | 7 | **7.2** | 7.4 |
| `kymessages-00-after-scim-desktop-light.png` | `886caf10d2a6` | admin-console | empty | 7 | 7 | 7 | 8 | 6 | 7 | **7.0** | 7.2 |
| `kymessages-00-after-scim-mobile-dark.png` | `f94d14df3eff` | admin-console | empty | 7 | 7 | 7 | 8 | 7 | 7 | **7.2** | 7.6 |
| `kymessages-00-after-scim-mobile-light.png` | `5411dae9d369` | admin-console | empty | 7 | 7 | 7 | 8 | 7 | 7 | **7.2** | 7.6 |
| `kymessages-00-after-settings-desktop-dark.png` | `bc3348683248` | settings | populated | 7 | 7 | 7 | 8 | 7 | 6 | **7.0** | 7.2 |
| `kymessages-00-after-settings-desktop-light.png` | `9b3cc92599c6` | settings | populated | 7 | 7 | 7 | 8 | 6 | 6 | **6.9** | 7.0 |
| `kymessages-00-after-settings-mobile-dark.png` | `dd0800d3a1e4` | settings | populated | 7 | 7 | 6 | 8 | 6 | 6 | **6.7** | 7.4 |
| `kymessages-00-after-settings-mobile-light.png` | `1614f2adbd4c` | settings | populated | 7 | 7 | 6 | 8 | 6 | 6 | **6.7** | 7.4 |
| `kymessages-00-after-users-desktop-dark.png` | `242ce586ec94` | admin-console | empty | 6 | 7 | 7 | 8 | 6 | 8 | **7.0** | 7.8 |
| `kymessages-00-after-users-desktop-light.png` | `8f7db496795f` | admin-console | empty | 6 | 7 | 7 | 8 | 5 | 8 | **6.8** | 7.6 |
| `kymessages-00-after-users-mobile-dark.png` | `b4a6d61c093d` | admin-console | empty | 6 | 7 | 7 | 8 | 6 | 8 | **7.0** | 8.0 |
| `kymessages-00-after-users-mobile-light.png` | `288b07a168c8` | admin-console | empty | 6 | 7 | 7 | 8 | 6 | 8 | **7.0** | 8.0 |
| `kypost-03-after-appearance-desktop-dark.png` | `22ebad389c79` | settings | populated | 8 | 8 | 7 | 9 | 8 | 8 | **8.0** | 7.8 |
| `kypost-03-after-appearance-desktop-light.png` | `63909c8704ef` | settings | populated | 8 | 8 | 7 | 9 | 8 | 8 | **8.0** | 7.8 |
| `kypost-03-after-appearance-mobile-dark.png` | `92eb95e06398` | settings | populated | 7 | 8 | 5 | 9 | 6 | 6 | **6.8** | 6.6 |
| `kypost-03-after-appearance-mobile-light.png` | `c12d6f9e05bd` | settings | populated | 7 | 8 | 5 | 9 | 6 | 6 | **6.8** | 6.6 |
| `kypost-03-after-compose-desktop-dark.png` | `a0b40e2f7af7` | compose | empty | 8 | 7 | 8 | 7 | 6 | 7 | **7.3** | 7.0 |
| `kypost-03-after-compose-desktop-light.png` | `e2c04fc2dae4` | compose | empty | 8 | 7 | 8 | 8 | 8 | 7 | **7.7** | 7.0 |
| `kypost-03-after-compose-mobile-dark.png` | `a8d0f266ae17` | compose | empty | 8 | 7 | 7 | 7 | 6 | 7 | **7.1** | 6.2 |
| `kypost-03-after-compose-mobile-light.png` | `2513ab4658e3` | compose | empty | 8 | 7 | 7 | 8 | 7 | 7 | **7.4** | 6.2 |
| `kypost-03-after-contact-editor-desktop-dark.png` | `21ffb7a46794` | contact-editor | empty | 5 | 7 | 6 | 8 | 5 | 7 | **6.3** | 7.2 |
| `kypost-03-after-contact-editor-desktop-light.png` | `ee7564f813e1` | contact-editor | empty | 5 | 7 | 6 | 8 | 5 | 7 | **6.3** | 7.2 |
| `kypost-03-after-contact-editor-mobile-dark.png` | `79c38e763e07` | contact-editor | empty | 5 | 7 | 6 | 8 | 4 | 7 | **6.1** | 6.4 |
| `kypost-03-after-contact-editor-mobile-light.png` | `e0951fe340ec` | contact-editor | empty | 5 | 7 | 6 | 8 | 4 | 7 | **6.1** | 6.4 |
| `kypost-03-after-contacts-desktop-dark.png` | `0dc3c7198378` | contacts-list | sparse | 8 | 7 | 7 | 8 | 7 | 7 | **7.4** | 7.4 |
| `kypost-03-after-contacts-desktop-light.png` | `8a4317ccdcf8` | contacts-list | sparse | 8 | 7 | 7 | 8 | 7 | 7 | **7.4** | 7.4 |
| `kypost-03-after-contacts-mobile-dark.png` | `a530b2e00bce` | contacts-list | sparse | 6 | 6 | 5 | 8 | 4 | 6 | **5.8** | 6.2 |
| `kypost-03-after-contacts-mobile-light.png` | `fbaeba621dbe` | contacts-list | sparse | 6 | 6 | 5 | 8 | 4 | 6 | **5.8** | 6.2 |
| `kypost-03-after-inbox-desktop-dark.png` | `63d6724eee74` | mail-list | sparse | 8 | 8 | 7 | 8 | 7 | 8 | **7.7** | 7.4 |
| `kypost-03-after-inbox-desktop-light.png` | `fc5306ae3256` | mail-list | sparse | 8 | 8 | 7 | 8 | 7 | 8 | **7.7** | 7.4 |
| `kypost-03-after-inbox-mobile-dark.png` | `558d64138683` | mail-list | sparse | 7 | 7 | 6 | 8 | 6 | 6 | **6.7** | 6.2 |
| `kypost-03-after-inbox-mobile-light.png` | `a3e18edd13a0` | mail-list | sparse | 7 | 7 | 6 | 8 | 6 | 6 | **6.7** | 6.2 |
| `kypost-03-after-inbox-selection-desktop-dark.png` | `880a6b30356e` | mail-list | sparse | 8 | 8 | 7 | 8 | 8 | 8 | **7.8** | 7.4 |
| `kypost-03-after-inbox-selection-desktop-light.png` | `6000566389c1` | mail-list | sparse | 8 | 8 | 7 | 8 | 8 | 8 | **7.8** | 7.4 |
| `kypost-03-after-inbox-selection-mobile-dark.png` | `827b74d471a7` | mail-list | sparse | 7 | 7 | 6 | 8 | 5 | 6 | **6.5** | 6.2 |
| `kypost-03-after-inbox-selection-mobile-light.png` | `8d1848dfc0d6` | mail-list | sparse | 7 | 7 | 6 | 8 | 5 | 6 | **6.5** | 6.2 |
| `kypost-03-after-reader-desktop-dark.png` | `0d8be2e52cab` | mail-read | populated | 5 | 6 | 6 | 7 | 7 | 6 | **6.1** | 6.6 |
| `kypost-03-after-reader-desktop-light.png` | `3fbf3b330623` | mail-read | populated | 5 | 6 | 6 | 7 | 7 | 6 | **6.1** | 6.6 |
| `kypost-03-after-reader-mobile-dark.png` | `06d196add160` | mail-read | populated | 5 | 5 | 5 | 7 | 6 | 6 | **5.6** | 5.6 |
| `kypost-03-after-reader-mobile-light.png` | `143f7bb17272` | mail-read | populated | 5 | 5 | 5 | 7 | 6 | 6 | **5.6** | 5.6 |

| Unscored file | Reason |
|---|---|
| `kymessages-00-after-backup-desktop-dark-full.png` | full-page variant of the same surface/theme/viewport; consulted for below-fold content and scored once with its viewport representative. Sticky sidebar/header renders mid-page (full-page screenshot artifact). |
| `kymessages-00-after-backup-desktop-light-full.png` | full-page variant of the same surface/theme/viewport; consulted for below-fold content and scored once with its viewport representative. Sticky sidebar/header renders mid-page (full-page screenshot artifact). |
| `kymessages-00-after-backup-mobile-dark-full.png` | full-page variant of the same surface/theme/viewport; consulted for below-fold content and scored once with its viewport representative. Sticky sidebar/header renders mid-page (full-page screenshot artifact). |
| `kymessages-00-after-backup-mobile-light-full.png` | full-page variant of the same surface/theme/viewport; consulted for below-fold content and scored once with its viewport representative. Sticky sidebar/header renders mid-page (full-page screenshot artifact). |
| `kymessages-00-after-health-mobile-dark-full.png` | full-page variant of the same surface/theme/viewport; consulted for below-fold content and scored once with its viewport representative. Sticky sidebar/header renders mid-page (full-page screenshot artifact). |
| `kymessages-00-after-health-mobile-light-full.png` | full-page variant of the same surface/theme/viewport; consulted for below-fold content and scored once with its viewport representative. Sticky sidebar/header renders mid-page (full-page screenshot artifact). |
| `kymessages-00-after-settings-desktop-dark-full.png` | full-page variant of the same surface/theme/viewport; consulted for below-fold content and scored once with its viewport representative. Sticky sidebar/header renders mid-page (full-page screenshot artifact). |
| `kymessages-00-after-settings-desktop-light-full.png` | full-page variant of the same surface/theme/viewport; consulted for below-fold content and scored once with its viewport representative. Sticky sidebar/header renders mid-page (full-page screenshot artifact). |
| `kymessages-00-after-settings-mobile-dark-full.png` | full-page variant of the same surface/theme/viewport; consulted for below-fold content and scored once with its viewport representative. Sticky sidebar/header renders mid-page (full-page screenshot artifact). |
| `kymessages-00-after-settings-mobile-light-full.png` | full-page variant of the same surface/theme/viewport; consulted for below-fold content and scored once with its viewport representative. Sticky sidebar/header renders mid-page (full-page screenshot artifact). |
| `kymessages-03-after-backup-desktop-dark-full.png` | full-page variant of the same surface/theme/viewport; consulted for below-fold content and scored once with its viewport representative. Sticky sidebar/header renders mid-page (full-page screenshot artifact). |
| `kymessages-03-after-backup-desktop-dark.png` | same-build recapture (identical patch and binary) of the same surface/theme/viewport; differs only in the measured region; scored once with its representative |
| `kymessages-03-after-backup-desktop-light-full.png` | full-page variant of the same surface/theme/viewport; consulted for below-fold content and scored once with its viewport representative. Sticky sidebar/header renders mid-page (full-page screenshot artifact). |
| `kymessages-03-after-backup-desktop-light.png` | same-build recapture (identical patch and binary) of the same surface/theme/viewport; differs only in the measured region; scored once with its representative |
| `kymessages-03-after-backup-mobile-dark-full.png` | full-page variant of the same surface/theme/viewport; consulted for below-fold content and scored once with its viewport representative. Sticky sidebar/header renders mid-page (full-page screenshot artifact). |
| `kymessages-03-after-backup-mobile-dark.png` | same-build recapture (identical patch and binary) of the same surface/theme/viewport; differs only in the measured region; scored once with its representative |
| `kymessages-03-after-backup-mobile-light-full.png` | full-page variant of the same surface/theme/viewport; consulted for below-fold content and scored once with its viewport representative. Sticky sidebar/header renders mid-page (full-page screenshot artifact). |
| `kymessages-03-after-backup-mobile-light.png` | same-build recapture (identical patch and binary) of the same surface/theme/viewport; differs only in the measured region; scored once with its representative |
| `kymessages-03-after-change-password-desktop-dark.png` | exact duplicate; inherits scores of kymessages-00-after-change-password-desktop-dark.png |
| `kymessages-03-after-change-password-desktop-light.png` | exact duplicate; inherits scores of kymessages-00-after-change-password-desktop-light.png |
| `kymessages-03-after-change-password-mobile-dark.png` | exact duplicate; inherits scores of kymessages-00-after-change-password-mobile-dark.png |
| `kymessages-03-after-change-password-mobile-light.png` | exact duplicate; inherits scores of kymessages-00-after-change-password-mobile-light.png |
| `kymessages-03-after-login-desktop-dark.png` | exact duplicate; inherits scores of kymessages-00-after-login-desktop-dark.png |
| `kymessages-03-after-login-desktop-light.png` | exact duplicate; inherits scores of kymessages-00-after-login-desktop-light.png |
| `kymessages-03-after-login-mobile-dark.png` | exact duplicate; inherits scores of kymessages-00-after-login-mobile-dark.png |
| `kymessages-03-after-login-mobile-light.png` | near duplicate; inherits scores of kymessages-00-after-login-mobile-light.png |
| `kymessages-03-after-settings-desktop-dark-full.png` | exact duplicate; inherits scores of kymessages-00-after-settings-desktop-dark-full.png |
| `kymessages-03-after-settings-desktop-dark.png` | exact duplicate; inherits scores of kymessages-00-after-settings-desktop-dark.png |
| `kymessages-03-after-settings-desktop-light-full.png` | exact duplicate; inherits scores of kymessages-00-after-settings-desktop-light-full.png |
| `kymessages-03-after-settings-desktop-light.png` | exact duplicate; inherits scores of kymessages-00-after-settings-desktop-light.png |
| `kymessages-03-after-settings-mobile-dark-full.png` | full-page variant of the same surface/theme/viewport; consulted for below-fold content and scored once with its viewport representative. Sticky sidebar/header renders mid-page (full-page screenshot artifact). |
| `kymessages-03-after-settings-mobile-dark.png` | exact duplicate; inherits scores of kymessages-00-after-settings-mobile-dark.png |
| `kymessages-03-after-settings-mobile-light-full.png` | full-page variant of the same surface/theme/viewport; consulted for below-fold content and scored once with its viewport representative. Sticky sidebar/header renders mid-page (full-page screenshot artifact). |
| `kymessages-03-after-settings-mobile-light.png` | exact duplicate; inherits scores of kymessages-00-after-settings-mobile-light.png |
