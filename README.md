# ky-ui

`ky-ui` is the small shared browser foundation for the Ky* servers. It provides the Busnes Light/Dark design tokens, OS-aware theme selection, and the selected-navigation treatment used across the suite.

It deliberately does not provide a framework, router, component runtime, or product page layouts. Each server keeps its own composition and imports the shared CSS/JS primitives.

## Use

```html
<link rel="stylesheet" href="/assets/ky-ui/tokens.css">
<link rel="stylesheet" href="/assets/ky-ui/navigation.css">
<script type="module">
  import { applyTheme } from "/assets/ky-ui/theme.js";
  applyTheme();
</script>
```

For a server-rendered page, call `applyTheme()` in the document head when possible to reduce theme flash. Product CSS should map its existing local variables to the `--ky-*` tokens during migration, then delete the duplicate token definitions once all consumers are moved.

Refresh the checked-in consumer copies with `npm run sync:consumers -- --root=/path/to/suite-worktrees`. `consumers.json` names the nine products and server base. For differently named checkouts, pass `--paths=/path/to/paths.json`, a JSON object mapping those repository names to absolute checkout paths. Every destination is validated before writing.

The copy includes CSS, theme preference helpers, generated palette previews and `VERSION` with SHA-256 hashes. `npm run check:consumers -- --paths=/path/to/paths.json` compares copies to the source. Each consumer runs `node path/to/ky-ui/check-vendor.mjs` in CI to detect accidental local edits. That check verifies the recorded copy; it does not claim a newer release is available. Bump the package version when releasing changes.

`tokens.css` is the palette source. Generated `palettes.ts` and `palettes-browser.js` support swatches and consumers that require literal values without duplicating maintained palettes. Product adapters use `readChoice` and `saveChoice` with their existing storage keys. Navigation uses `.ky-nav-item` plus ARIA state or existing active/selected classes and product colors; spacing and orientation stay local.

## Boundary

The package is browser UI infrastructure. `ky-primitives` remains the home for Go protocol, crypto, and recovery primitives; it should not absorb CSS or browser behavior.

## Verification

```sh
npm test
```

`npm ci && npx playwright install chromium && npm run test:browser` runs the shared
browser contracts at 390px/1280px in light/dark Chromium. The fixture imports the
shipped primitives; it is not an application mockup or an end-to-end product test.
Assertions cover overflow, focus, selected/disabled states, native dialogs,
OS/explicit/legacy choice transitions, cross-tab updates and denied storage.
CI retains screenshots and failure traces in `browser-results` for seven days.

## Suite freshness

`npm run check:suite` shallow-clones the nine public consumer default branches into
an owned temporary directory and invokes the existing exact-byte `--check`.
It logs each checked commit, fails on fetch errors/missing/stale files, and cleans
up on completion. Git credential helpers are disabled for these public fetches.
It neither executes consumer code nor writes to those repos.
The `consumer-freshness` workflow runs daily, after pushes to main, and manually;
it needs no cross-repository token. A release can legitimately turn it red until
the corresponding consumer updates merge. Open the failed Actions run, sync the
reported consumers in isolated worktrees, and submit their updates as PRs.
This checks freshness against the selected ky-ui revision, not package-registry
availability. Consumer build checks still enforce their own pinned integrity.

KyForge is private. Its own `consumer-freshness` workflow checks out itself with
its repository-scoped token and compares against public ky-ui main using
`node upstream/scripts/sync-consumers.mjs --root=consumers --check --consumer=KyForge-Server`.
The central job explicitly reports this delegation; a green central run alone
does not assert Forge freshness. Both workflows must be green for suite freshness.
No cross-repository private token is needed. `--consumer=<inventory name>` is a
repeatable, check-only scope selector; unknown names fail. Update this split when
consumer visibility changes.
