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
- `shell.spec.js` checks the shell parts: label/`for` pairs, the About dialog's accessible name and keyboard open/close with focus return, text contrast, no overflow at 390px/1440px, the account footer (one row at the sidebar width, named icon buttons at 40px and 44px on touch, unclipped focus rings, the open Settings button drawn like the current navigation row, long names in all twelve halves), the Settings layout and the pre-0.10 user block, a sidebar that scrolls to its footer at 844x390 with an eight-item menu opening upward inside it, forced-colours outlines on the current row and tab, and writes `shell-<part>-<light|dark>.png` evidence at 1440x900.
- `menu.spec.js` checks the Settings menu in the footer (desktop) and phone header (390px): items match the Settings tabs and their current state, keyboard open/move/close with focus return to the gear, Tab and outside-click closing, `aria-expanded`, 40px rows (44px on touch), upward/downward placement without overflow, an eight-item menu that scrolls inside a 667x375 touch screen, and item contrast in all twelve halves. It writes `menu-<footer|phone>-<scheme>.png` evidence.
- `drift.spec.js` checks the drift rules at 1440x900 and 390px: brand row and first navigation row positions, navigation icon box and row height, content inset, the sign-in brand offset for a two-field and a one-field card, the theme-picker geometry, and the phone header (one row with Settings and Sign out, scrolling tabs with an edge fade, licence line after the content). It writes `drift-<part>-<width>-<light|dark>.png` evidence.
- `rail.spec.js` checks the app rail: exactly one visible `Apps` landmark (sidebar foot on desktop, page end on phones), named and titled links whose `data:` marks load under the fixture CSP, 36px/40px targets, the accent ring on the current app (kept under forced colours) and the shared focus outline. It writes `rail-sidebar-1440-<scheme>.png` and `rail-foot-390-<scheme>.png` evidence.
- `status.spec.js` measures the rendered `.ky-status` pills in all twelve halves: text on its tint at 4.5:1, a dot or icon on every pill, and a colour different from the accent button. It writes `status-<half>.png` evidence of the status and action row at 1280px.
- `update.spec.js` loads `/update/?id=…` under `script-src 'self'; style-src 'self'`, whose bundle name changes after a POST to `/update/release`: the same build stays quiet, a new one shows the notice without touching unsaved input, Reload loads the new build, Dismiss removes it, offline stays quiet until reconnecting; `buildAssets` parses with `DOMParser` (a commented-out script, `<noscript>` content, icons and inline scripts are not assets, and no parsed script runs; the fixture page carries a commented-out script naming another build); text and Reload reach 4.5:1, buttons 40px, no overflow. It writes `update-<project>.png` evidence.
- `readme.spec.js` serves the README's actual HTML/module snippets with shared assets on an owned loopback port and verifies saved-choice initialization under `script-src 'self'`.

## Verification

From the repository root: `npm ci`, `npx playwright install chromium`, `npm run test:browser`. CI installs Chromium system dependencies and retains results for seven days.

## Child DOX Index

None.
