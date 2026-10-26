# ky-ui

[![OpenSSF Best Practices](https://www.bestpractices.dev/projects/15918/badge)](https://www.bestpractices.dev/projects/15918)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/Busnes-app/ky-ui/badge)](https://scorecard.dev/viewer/?uri=github.com/Busnes-app/ky-ui)

[Release notes](CHANGELOG.md) describe source versions, upgrade impact and integration changes.

`ky-ui` is the small shared browser foundation for the Ky* servers. It provides the Busnes Light/Dark design tokens, OS-aware theme selection, and the selected-navigation treatment used across the suite.

It deliberately does not provide a framework, router, component runtime, or product page layouts. Each server keeps its own composition and imports the shared CSS/JS primitives.

Version 0.3.0 also supplies type, space, control, field-border and overlay tokens.
Version 0.4.0 adds the shared responsive Appearance theme-preview radio cards.
Products self-host Space Grotesk and own layout and components. The reusable
[Ky suite UI skill](skills/ky-suite-ui/SKILL.md) defines the visual contract and
evidence-based 9/10 acceptance target. The dated records under `reviews/` are
delivered in a companion evidence PR so runtime changes remain easy to review.

For a focused release copy, pass `--consumer=<inventory name>` once per selected
product to either sync or check, with `--paths` mapping those products to their
worktrees. Every selected destination is validated before any write; unselected
checkouts are untouched. Fleet freshness remains a separate whole-inventory gate.

- [Contributing](CONTRIBUTING.md) — how changes land, the test policy and the coding standard.
- [Assurance case](docs/ASSURANCE-CASE.md) — threat model, trust boundaries, and why the shipped files and tooling are safe to adopt.

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

Refresh the checked-in consumer copies with `npm run sync:consumers -- --root=/path/to/suite-worktrees`. `consumers.json` names the ten active web products and server base. For differently named checkouts, pass `--paths=/path/to/paths.json`, a JSON object mapping those repository names to absolute checkout paths. Every destination is validated before writing.

The copy includes CSS, theme preference helpers, generated palette previews and `VERSION` with SHA-256 hashes. `npm run check:consumers -- --paths=/path/to/paths.json` compares copies to the source. Each consumer runs `node path/to/ky-ui/check-vendor.mjs` in CI to detect accidental local edits. That check verifies the recorded copy; it does not claim a newer release is available. Bump the package version when releasing changes.

`tokens.css` is the palette source. Generated `palettes.ts` and `palettes-browser.js` support swatches and consumers that require literal values without duplicating maintained palettes. Product adapters use `readChoice` and `saveChoice` with their existing storage keys. Navigation uses `.ky-nav-item` plus ARIA state or existing active/selected classes and product colors; spacing and orientation stay local.


## Appearance

Import `appearance.css` and `appearance-themes.css` after product field/control
styles. `themes.js` supplies the common 22-theme catalog plus Match system; keep
the product's existing storage key and legacy-choice adapter; the shared stylesheet supplies the
same card geometry and keyboard-visible selection across React and server-rendered
pages. Use native radios inside labels, rather than implementing a custom keyboard
widget. Each picker needs its own radio group name.

```html
<fieldset class="ky-appearance">
  <legend class="ky-appearance-legend">Theme</legend>
  <div class="ky-appearance-grid">
    <label class="ky-appearance-option">
      <input class="ky-appearance-radio" type="radio" name="appearance" value="busnes-light">
      <span class="ky-appearance-preview" data-ky-preview="busnes-light" aria-hidden="true"></span>
      <span class="ky-appearance-name">Busnes Light</span>
      <small class="ky-appearance-mode">Light</small>
    </label>
  </div>
</fieldset>
```

Set `data-ky-preview` to the canonical theme ID; generated preview CSS owns its
four color properties, with Busnes values read directly from `tokens.css`. Run
`npm run generate:appearance` after a catalog or token change; tests verify the
output. `findTheme` resolves canonical IDs, names and legacy aliases.
`applyThemeVariables` sets or clears named product variables through the CSSOM;
products retain theme attributes, persistence and OS-following behavior.
The product's existing external script or React handler applies changes immediately
and persists with its existing key. Keep an existing system-mode option reachable;
selecting a card records an explicit browser-local choice. Sync checked state when
another tab or OS-following changes the effective theme. Explain browser-local
persistence on the Appearance page; do not imply account-wide synchronization.

The native radio, border and focus outline carry selection without relying only on
color. The grid fits five cards in a 1000px content region and reflows on phones.
The cards sit directly on the page, without a shadowed container.

Keep the Appearance navigation link and remove the compact theme dropdown from
the navigation/sidebar, including its phone-header presentation. Descriptions use
`ky-appearance-description` and the same copy and 72ch width across products. Theme
names and mode labels wrap normally, without product-specific nowrap or clipping.

## Boundary

The package is browser UI infrastructure. `ky-primitives` remains the home for Go protocol, crypto, and recovery primitives; it should not absorb CSS or browser behavior.

## Verification

```sh
npm ci
npm run check
```

`check` runs ESLint's recommended JavaScript checks with zero warnings allowed,
then the unit tests. `npm run lint` runs the linter alone. It checks shipped
JavaScript, tooling and tests with the appropriate browser/Node globals; fix
findings or explain a narrowly scoped false-positive suppression in the source.

`npm ci && npx playwright install chromium && npm run test:browser` runs the shared
browser contracts at 390px/1280px in light/dark Chromium. The fixture imports the
shipped primitives; it is not an application mockup or an end-to-end product test.
Assertions cover overflow, focus, selected/disabled states, native dialogs,
OS/explicit/legacy choice transitions, cross-tab updates and denied storage.
CI retains screenshots and failure traces in `browser-results` for seven days.

## Suite freshness

`npm run check:suite` shallow-clones the public consumer default branches from `consumers.json` into
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

Archived KyForge, KyMark and KyVault are outside the active consumer inventory.
Existing installations and their saved choices remain untouched.
