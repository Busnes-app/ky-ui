# Browser contracts

## Purpose

Exercise shipped theme tokens, navigation states and persistence in Chromium at desktop/mobile widths and both OS color schemes.

## Ownership

Owns the explicitly labeled contract fixture, loopback-only fixture server and Playwright tests. Product layout and authenticated workflows belong to product repositories.

## Local Contracts

- Import actual shared assets; fixture CSS owns only layout and the legacy-theme example.
- Assert overflow, keyboard focus, native dialog dismissal/focus return, selected/disabled states, persistence, OS changes, cross-tab updates and restricted storage.
- Screenshots and failure traces are test artifacts, not pixel-diff baselines or proof of product accessibility.

## Verification

From the repository root: `npm ci`, `npx playwright install chromium`, `npm run test:browser`. CI installs Chromium system dependencies and retains results for seven days.

## Child DOX Index

None.
