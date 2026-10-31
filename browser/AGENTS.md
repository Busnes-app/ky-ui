# Browser contracts

## Purpose

Exercise shipped theme tokens, navigation states and persistence in Chromium at desktop/mobile widths and both OS color schemes.

## Ownership

Owns the explicitly labeled contract fixture, loopback-only fixture server and Playwright tests. Product layout and authenticated workflows belong to product repositories.

## Local Contracts

- Import actual shared assets; fixture CSS owns only layout and the legacy-theme example.
- Appearance uses native grouped radio cards; browser checks cover keyboard selection, persistence, cross-tab updates, focus, forced colors and contained overflow. Pair cards cover OS-following resolution, re-resolution on a media change and both-half previews; a removed saved ID falls back to Busnes.
- Assert overflow, keyboard focus, native dialog dismissal/focus return, selected/disabled states, persistence, OS changes, cross-tab updates and restricted storage.
- A selected navigation surface persists under the pointer; hover has lower specificity than selected-state selectors.
- Measure shared control geometry and field-border contrast against both Busnes page/panel surfaces in the browser; a primitive check does not certify every product field or named theme.
- Measure danger, success and warning text for every catalog palette on panel and hover surfaces, under both OS schemes; product-level overrides still need product checks.
- Screenshots and failure traces are test artifacts, not pixel-diff baselines or proof of product accessibility.
- `shell.spec.js` checks the shell parts: label/`for` pairs, the About dialog's accessible name and keyboard open/close with focus return, text contrast, no overflow at 390px/1440px, and writes `shell-<part>-<light|dark>.png` evidence at 1440x900.
- `drift.spec.js` checks the drift rules at 1440x900 and 390px: brand row and first navigation row positions, navigation icon box and row height, content inset, the sign-in brand offset for a two-field and a one-field card, the theme-picker geometry, and the phone header (one row, scrolling tabs with an edge fade, licence line after the content). It writes `drift-<part>-<width>-<light|dark>.png` evidence.
- `rail.spec.js` checks the app rail: exactly one visible `Apps` landmark (sidebar foot on desktop, page end on phones), named and titled links whose `data:` marks load under the fixture CSP, 36px/40px targets, the accent ring on the current app (kept under forced colours) and the shared focus outline. It writes `rail-sidebar-1440-<scheme>.png` and `rail-foot-390-<scheme>.png` evidence.
- `status.spec.js` measures the rendered `.ky-status` pills in all twelve halves: text on its tint at 4.5:1, a dot or icon on every pill, and a colour different from the accent button. It writes `status-<half>.png` evidence of the status and action row at 1280px.
- `readme.spec.js` serves the README's actual HTML/module snippets with shared assets on an owned loopback port and verifies saved-choice initialization under `script-src 'self'`.

## Verification

From the repository root: `npm ci`, `npx playwright install chromium`, `npm run test:browser`. CI installs Chromium system dependencies and retains results for seven days.

## Child DOX Index

None.
