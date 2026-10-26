# Initial comparative rating: 2026-10-26 council

Reviewer: Claude Opus 5.5 (`claude-opus-5-5`), design sub-agent. This is the first round only: it rates the supplied screenshots before any redesign. Scores, hashes and arithmetic are in `initial-scores.json`.

- **Inputs.** 40 original PNGs in `~/Pictures/KyPost-UI-Councel/`. I viewed each one at full resolution. Product and surface were assigned from what the image shows, not from the filename. `source-evidence.md` and the detector findings were not read.
- **Rubric `initial-2026-10-26`.** Each dimension is scored 0–10 and weighted: hierarchy 0.20, typography 0.15, density/layout 0.20, color 0.15, visible affordances 0.15, coherence 0.15. Totals are rounded half-up to one decimal. Cohort and provider means use unique files only.
- **Limits.** These are visual judgements from static images. They make no claims about functionality, interaction or accessibility. 9/10 is the user's target; no score here is an achieved target.
- **KyMessages.** No screenshots were supplied. It is unscored, not zero.

## Key rankings (mean of unique files per product, by cohort)

| Cohort | Ranking (mean total, n) | Ky gap to best |
|---|---|---|
| Mail list | Proton Mail 7.7 · Gmail 6.6 · mailbox.org 6.4 · Tuta 6.4 · Outlook 2013 6.1 · **KyPost 5.2** | −2.5 |
| Compose | Gmail 7.4 · Proton 7.2 · mailbox.org 6.7 · Tuta 6.0 · Outlook 2013 5.9 · **KyPost 5.6** | −1.8 |
| Calendar (view + editor) | Google 7.7 (2) · Proton 7.6 (2) · Tuta 6.6 (2) · mailbox.org 6.5 (2) · **KyCalendar 6.4 (2)** · Outlook M365 6.0 (1) | −1.3 |
| Contacts (list + editor) | Google 7.0 · mailbox.org 6.3 · Tuta 6.2 (2) · **KyPost 5.0 (2)** | −2.0 |
| Settings | mailbox.org 7.0 (2) · **KyPost 5.8 (3)** | −1.2 |
| Secondary tools | Proton Drive 7.0 · mailbox.org Drive 6.0 · **KyNotes 5.9 (2)** · mailbox.org Notes 3.6 | −1.1 |

Per-file extremes: the highest are Gmail-Calendar-01/02, Proton-01 and Proton-calendar-01 at 7.7. The lowest Ky file is KyPost-live-Contacts-02 (add-contact form) at 4.6, and the lowest overall is mailboxorg-notes-01 (legacy page) at 3.6.

The aggregates are limited by the evidence. By provider: Proton 7.4 (5 files), Google 7.3 (5), Tuta 6.3 (6), mailbox.org 6.2 (9), Microsoft 6.0 (3), Ky 5.7 (11). Within Ky: KyCalendar 6.4, KyNotes 5.9, KyPost 5.4. These means are not a product ranking: providers cover different cohorts, empty versus populated states, themes and client generations.

## Strengths to borrow

- **Proton Mail and Calendar.** One saturated primary action per view. A quiet toolbar of icons with labels. List rows are flat and full-bleed, and the event editor is icon-led with labels.
- **Gmail compose and Google Calendar.** Compose is a docked sheet with a split Send button and minimal field chrome. The month view is dense, with calendar colors carried as small dots rather than filled blocks.
- **mailbox.org settings.** Settings navigation is searchable. Each setting is a row with a title, a one-line description and a chevron. Layout choices are shown as preview thumbnails.
- **Tuta.** A top-level Emails / Contacts / Calendar switcher that stays the same across apps. The event sheet groups fields into rows with chevrons.
- **Ky's own best work.** The KyCalendar event modal (6.7) and the KyPost Appearance picker (6.7) are the closest to target. They have plain labelled fields, one primary button and a clear selected state. Use them as the in-house baseline.

## Five priority Ky fixes

1. **Make the mail toolbar contextual.** The six salmon buttons on KyPost-live-01 are always visible and look disabled, yet they compete with New Email. Show quiet icon-and-label actions only after a selection. Keep orange for the single primary action and the selected state.
2. **Flatten the surfaces.** Remove card-inside-card and the bordered box around every field (inbox, contacts list, Add Contact, Mail settings). Rows should be full-bleed. Forms need labelled sections with plain inputs above, and no double-bordered recipient fields.
3. **Use one button system.** Filled orange for primary, outlined for secondary, text for tertiary, and red outline set apart for destructive. The current breaks: Mail settings styles Delete like Save; contact Delete looks disabled; the Export links, the Import button and the count pill all use different styles.
4. **Use one Ky shell.** KyPost (sidebar inside a floating card), KyCalendar (different logo, theme selector in the nav, account footer) and KyNotes (top bar) are three different shells. Share the header, logo treatment, product switcher, account area and nav row geometry. Replace the text "+"/"−" expanders with chevrons, and keep the theme control in Settings only.
5. **Set a type scale and a color discipline.** Drop the letter-spaced mono eyebrows and the triple headers (eyebrow, section, title) on Security. Distinguish unread from read by weight in lists. Remove off-palette cyan (SSO notice) and the pink callouts. Stop filling every avatar orange.

## Missing evidence

- KyMessages: no images at all.
- No populated KyPost inbox. Its only inbox shows two rows, and it has no opened-message or reading-pane view (only Outlook-01 shows one, from any provider).
- No populated KyCalendar view, and no event detail from any provider.
- No dark-theme or narrow/mobile captures of Ky.
- No settings captures from Gmail, Proton, Tuta or Outlook, so the settings cohort has a single competitor.
- No contacts from Proton or Outlook, and no Ky drive.
- No Outlook on the web. All three Outlook images are desktop clients.

## Duplicates, mismatches and cohort caveats

- **Duplicate.** `KyPost-live-03.png` and `KyPost-live-Contacts-01.png` have different hashes but differ by one pixel at one level. They are counted once.
- **Filename differs from content:**
  - `KyPost-live-03`: Contacts, not mail.
  - `KyPost-live-Calendar-01/02`: the separate KyCalendar app.
  - `KyPost-live-Notes-01`: KyNotes.
  - `mailboxorg-notes-02`: KyNotes settings, not mailbox.org.
  - `Outlook-03`: a different Outlook generation and a calendar view.
- **Mixed vintages.** Outlook-01/02 are stills from a third-party Outlook 2013 video (cursor visible, activation-failure bar). Outlook-03 is a 2025 Microsoft 365 classic calendar at lower resolution, with redactions.
- **Empty versus populated.**
  - Empty: KyCalendar, Proton calendar, Tuta calendar and the Ky/Proton/mailbox.org notes and drive screens.
  - Populated: Google Calendar, Outlook-03 and the mailbox.org inbox.
  - `mailboxorg-calendar-01` appears empty, but events show behind the editor in `-02`, so the capture state does not match.
  - Density scores reward populated screens; they do not reward empty states.
- **Theme and overlays.** User-chosen photo backgrounds (Gmail, mailbox.org) lower contrast. Password-manager overlays (KyPost-live-05, Proton-calendar-02, tuta-04) and browser prompts (mailboxorg-02) are capture artifacts. Each is scored as captured and noted per file.
- **Gaps from rescoring.** A later round must recapture matching before/after views with synthetic data, recording viewport, theme and revision. Rescoring these same images measures a change in the rubric, not an improvement in the product.
