# ky-ui

`ky-ui` is the small shared browser foundation for the Ky* servers. It provides the Busnes Light/Dark design tokens, OS-aware theme selection, and the selected-navigation treatment used across the suite.

It deliberately does not provide a framework, router, component runtime, or product page layouts. Each server keeps its own composition and imports the shared CSS/JS primitives.

## Use

Serve these files from the application's own origin. Put this markup in the
document head; it works with `script-src 'self'`:

```html
<link rel="stylesheet" href="/assets/ky-ui/tokens.css">
<link rel="stylesheet" href="/assets/ky-ui/navigation.css">
<script type="module" src="/assets/theme-init.js"></script>
```

Create the product-owned `/assets/theme-init.js` (or put this code in the
product's existing external entry bundle):

```js
import { applyTheme } from "/assets/ky-ui/theme.js";
applyTheme();
```

Do not add `unsafe-inline` to the script policy for theme initialization.
Modules are deferred: putting this tag in the head does not guarantee that a
saved theme is applied before first paint. Check saved-choice first paint in the
product; server-render a validated theme attribute when that preference is
available to the server. The token stylesheet follows the OS before an override
is applied. Existing products should retain their adapter, saved key and named
themes rather than replace them with this minimal default-key example.

Product CSS should map its existing local variables to the `--ky-*` tokens during migration, then delete the duplicate token definitions once all consumers are moved.

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
its repository-scoped token and reads public ky-ui main strictly as comparison
data. It runs **Forge's reviewed `scripts/check-ui-freshness.mjs`**, not a script
or import from the upstream checkout. That comparator owns the release-copy
format, including generated palettes and the version manifest; format changes
require a Forge-side review. There is no dependency on the upstream selector or
on merging ky-ui #4 before Forge #34.
The central job explicitly reports this delegation; a green central run alone
does not assert Forge freshness. Both workflows must be green for suite freshness.
No cross-repository private token is needed. Update this split when consumer
visibility changes. The upstream sync tool's `--consumer=<inventory name>` is
still a repeatable, check-only selector for trusted local verification; it does
not make execution of mutable upstream code safe beside private source.
