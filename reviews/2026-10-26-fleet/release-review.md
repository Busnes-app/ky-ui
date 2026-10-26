# Ky web fleet: visual release review, round 3

Date 2026-10-26. Reviewer: Claude Opus 5.5 (`claude-opus-5-5`), independent review sub-agent. I implemented none of this work.

- Rubric: `ky-suite-v2`. Weights: hierarchy .20, typography .15, density_layout .20, color .15, visible_affordances .15, coherence .15. Totals use Decimal rounding, half-up to one decimal.
- Inputs: `visual-review-inputs-v3.json`.
- Machine-readable record: `release-scores.json`. Summaries: `cohort-results.json`, written by `verify-scores.py`, which passed: "Verified 148 score rows, 24 product/cohort summaries; duplicates excluded from means".

This covers only the Ky captures in this set. It certifies neither the whole shipped product nor any comparison with competitors.

## Result: the 9/10 target is not reached

| | |
|---|---|
| Input rows | 148 |
| Unique, scored | 142 |
| Duplicate followers | 6, which inherit scores and are excluded from means |
| N/A (unscored) | 0 |
| Unique totals | **5.2 – 8.2** |
| Files ≥ 9.0 | **0** |
| Ky fit, per file | 4.4 – 8.8, reported separately and never added to totals |

The six duplicate followers break down as follows:
- Two Calendar member-Appearance phone captures follow the admin captures (max delta 1).
- Four Drive F7 OS-light dialogs follow their OS-dark twins: the two desktop pairs at delta 1, the two mobile pairs at delta 0.

I re-measured every pair, and all six meet the rubric rule.

The phase-1 source verdict is in `runtime-source-review-v3.md`: F7 is fixed and independently verified, and no new medium or blocker finding was introduced. Pre-existing gaps F3, G1 and G2 (legacy-palette filled-danger contrast) prevent a 9/10 acceptance independently of these image scores.

## Method and limits

- I checked all 148 SHA-256 hashes and dimensions against the input file. Every unique image was viewed at full resolution, with images taller than about 1050 px viewed as overlapping full-width crops (`v3-review-work/crops/`). No score comes from a montage.
- Product, surface and theme were identified from the pixels.
- Saved named themes were confirmed from the pixels: Sky, Forest, Nord Slate, Paper Clean and Ocean.
- The Drive F7 manifest's theme field says no choice was saved. That is wrong: the pixels show Sky and Forest applied over both OS schemes, which matches `capture.mjs`. I did not edit the manifest or any image.
- The light/dark suffix in a filename is the OS scheme only.
- I scored blind. No prior scores exist for this input set, and I did not load the competitor council scores (`../2026-10-26-council`), which came from a different pass. **No cross-cohort, provider or competitor ranking is claimed.** I also claim no numeric improvement over a baseline, because no blind baseline scores exist for this set.
- Contrast in this review is apparent contrast only. Behaviour, keyboard, focus, screen readers, real contrast and performance are **unknown from these pictures**. Any measured facts below come from phase 1, not from the images.
- I did not infer that a feature is missing because it is absent from a capture.
- The Base injected diagnostic-button captures are excluded from this set by design. They were not scored.

## Cohort means (unique files; not a ranking)

| Cohort | Product | n | Mean | Ky fit | Lowest |
|---|---|---|---|---|---|
| admin-console | KyMessages | 6 | 7.8 | 8.2 | 7.7 |
| admin-console | ky-server-base | 4 | 7.4 | 7.3 | 7.4 |
| admin-console | KyYard | 4 | 7.2 | 8.4 | 7.2 |
| admin-console | KyRecovery | 8 | 7.0 | 6.7 | 6.1 |
| admin-console | KyDNS | 4 | 6.8 | 7.4 | 6.3 |
| admin-console | KyPulse | 12 | 6.7 | 6.8 | 6.2 |
| admin-console | KyIdentity | 4 | 6.2 | 6.8 | 6.0 |
| calendar-grid | KyCalendar | 4 | 7.8 | 8.4 | 7.4 |
| calendar-list | KyCalendar | 4 | 7.2 | 7.8 | 6.9 |
| drive | KyDrive | 8 | 7.9 | 7.9 | 7.3 |
| mail-list | KyPost | 8 | 7.4 | 7.8 | 7.2 |
| member-home | KyIdentity | 4 | 6.5 | 6.4 | 6.5 |
| notes | KyNotes | 4 | 5.5 | 4.8 | 5.2 |
| settings | KyYard | 4 | 7.9 | 8.6 | 7.7 |
| settings | KyRecovery | 4 | 7.8 | 7.8 | 7.5 |
| settings | KyCalendar | 12 | 7.7 | 8.4 | 7.5 |
| settings | KyDNS | 4 | 7.7 | 8.3 | 7.3 |
| settings | KyPulse | 4 | 7.6 | 8.3 | 7.3 |
| settings | KyMessages | 10 | 7.5 | 8.2 | 6.8 |
| settings | KyPost | 6 | 7.5 | 8.3 | 7.4 |
| settings | KyIdentity | 4 | 7.5 | 7.5 | 7.2 |
| settings | KyDrive | 8 | 7.4 | 8.1 | 6.9 |
| settings | ky-server-base | 8 | 7.3 | 7.7 | 6.7 |
| settings | KyNotes | 4 | 7.1 | 6.9 | 6.7 |

**Comparability caveats.** The cells are unmatched in state, theme and viewport. Some cells mix surfaces:
- The settings cohort mixes Appearance pages with admin settings pages (Calendar, Messages, Base, Drive).
- KyPulse admin-console combines the status overview with eight F7 destructive-view captures on saved Sky/Forest themes.

Means are dimension-weighted totals of the captured frames, not product quality.

**Dimension means across the 142 unique files.** Weakest first:

| Dimension | Mean |
|---|---|
| density_layout | 7.04 |
| visible_affordances | 7.11 |
| coherence | 7.16 |
| typography | 7.37 |
| hierarchy | 7.39 |
| color | 7.48 |

**Ky-fit means.** Weakest first:

| Ky-fit dimension | Mean |
|---|---|
| shell | 7.18 |
| type_geometry | 7.27 |
| suite_cohesion | 7.72 |
| accent_discipline | 7.95 |
| palette_tokens | 8.20 |

## What reads as one suite

- **The Appearance picker is uniform in all 11 products.** Every product shows the same 22 cards: Match system "Follows device", then Busnes Light/Dark, then the named palettes. Each card has a Light/Dark kind, a visible radio, and an accent ring plus filled radio on the selected card. The grid is 5 columns on desktop and 2 on phone.
  - Examples: `kydns-04-after-appearance-desktop-light.png`, `kycalendar-03-after-admin-appearance-desktop-light.png`, `kypulse-06-after-appearance-mobile-dark.png`.
  - I saw no compact theme selector in any navigation.
- **Cream/charcoal surfaces with orange used sparingly** carry across the sidebar products: Post, Calendar, Messages, Yard, Base, Drive, Pulse and DNS.
- **The F7 destructive views now read clearly.** The Drive confirmation shows a pale label on dark red in Sky and a dark label on salmon in Forest (`kydrive-05-after-delete-dialog-*-dark.png`, the highest totals at 8.2). The Pulse Delete reads the same way. Its page still scores low for other reasons, listed below.

## Strongest visible gaps (each cited image)

1. **KyNotes workspace (5.2–5.7).**
   - Three filled orange buttons compete.
   - Orange is used as decoration: a sparkle icon and glyph icons.
   - There are uppercase letter-spaced eyebrows and a pink callout.
   - On phone, a full-width orange "Notebooks and account" bar is the loudest element.
   - Images: `kynotes-01-after-workspace-mobile-light.png`, `kynotes-01-after-workspace-desktop-light.png`.
   - Separately, the light Settings capture has an orange toast and an orange header "Save" over the grid (`kynotes-04-after-appearance-desktop-light.png`).
2. **KyIdentity type and admin table (6.0–6.5).**
   - Content renders in an Arial-like face, not the suite's Space Grotesk.
   - An orange mono "ID AUTHORITY" eyebrow sits under the wordmark.
   - The Users table has nine unlabeled icon actions.
   - On phone the table is clipped: the email is cut and Role, Status and Actions are off-screen.
   - Images: `kyidentity-01-after-users-mobile-light.png`, `kyidentity-01-after-users-desktop-light.png`.
3. **Phone clipping in KyRecovery Replication (6.1).** Both empty-state sentences and a column header are cut at the card edge (`kyrecovery-06-after-replication-via-overview-mobile-light.png`). The desktop page has no page `h1`.
4. **KyPulse app detail (6.2), the F7 view.** Problems other than the label:
   - The filled Delete is the strongest control on the page and there is no primary.
   - The "← Status" link renders in browser-default blue (Sky) or violet (Forest). Source shows no link colour rule, and this is unchanged since review_base.
   - Each setting sits in its own bordered box under uppercase mono labels.
   - Images: `kypulse-06-after-app-delete-sky-desktop-light.png`, `kypulse-06-after-app-delete-forest-mobile-dark.png`.
5. **KyDNS phone dashboard (6.3).**
   - The navigation wraps to three rows, with the version/licence footer inside the header.
   - Chart axis labels are about 7 px.
   - Stat items are misaligned within their columns.
   - Image: `kydns-04-after-dashboard-mobile-light.png`.
6. **KyDrive admin Settings still shows a compact theme `<select>`** ("Theme on this browser") beside the Appearance cards (`kydrive-02-after-settings-desktop-light.png`).
   - It is still in the pinned source (`Settings.tsx:99`) and was already present at review_base, so it is pre-existing.
   - It is not in navigation, but it duplicates the one-picker pattern.
   - The Login-page selects in Calendar, Messages, Base, Drive and Pulse are pre-auth and were not captured. I did not score them.
7. **ky-server-base Settings & DB (6.7).** A tinted box sits inside a card, and an orange icon and orange "sqlite" chip are decorative accent (`kybase-06-after-settings-via-overview-desktop-light.png`).
8. **Shell divergence (Ky-fit shell 5–6).**
   - KyRecovery uses a top tab bar with a top-right account cluster that wraps to three rows on phone.
   - KyNotes has no sign-out in its account region.
   - KyDrive's phone header is about 230 px tall: two nav rows plus a preference row.
   - Images: `kyrecovery-06-after-overview-mobile-light.png`, `kydrive-02-confirm-files-mobile-light.png`.
9. **Saved-palette variants** lower apparent contrast on Sky (pale today label, blue-on-blue), and the teal selection ring on Ocean is subtle. These are user choices, scored as captured: `kycalendar-02-after-sky-calendar-desktop-light.png`, `kypost-06-after-ocean-appearance-desktop-light.png`.

Smaller repeated issues:
- In dark mode, idle radios render as dark filled discs that read faintly.
- The spacing between `h1` and intro differs: tight in Post, Calendar and Messages stage 03, loose in stage 02 and in DNS, Recovery and Base.
- Several captures are full-page stitches, so the sidebar background ends at 900 px.

## Missing or unmatched surfaces and gates

- **Surfaces not in this set (N/A, not zero):**
  - Login and sign-up for every product.
  - Compose, the mail reader and contacts (Post).
  - Event editor (Calendar).
  - Chat/Element (Messages).
  - Note editor with content (Notes).
  - Drive sharing dialogs.
  - Error and loading states almost everywhere.
  - Yard endpoints with data.
  - Recovery ceremony.
  - DNS records, DHCP and blocklists.
  - MemberHome in Messages.
- **Unmatched:** most products have only empty or sparse fixtures, and named-theme captures exist for only a few products.
- **Behaviour gates (keyboard, focus, contrast, states, responsive) are untested by images.** The only executed evidence is phase 1:
  - F7 rest/hover/Tab-focus contrast.
  - `ui.spec` CSP/theme/status passes.
  - `nav.spec` passes.
  - First-paint and storage checks carried from v2 by hash.

## Remaining gaps before 9/10

No captured file reaches 9; the highest is 8.2. To get closer:
- Fix the visible issues above: Notes, Identity, the phone clipping in Recovery and Identity, the Pulse detail page, the DNS phone shell, and Drive's duplicate select.
- Resolve the pre-existing F3, G1 and G2 contrast gaps; G1 and G2 need owner decisions on legacy and named palettes.
- Capture the missing task surfaces and states.
- Pass the behaviour gates with executed evidence.

The XLSX workbook and gallery were not edited (root-owned).
