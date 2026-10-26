# Release notes

ky-ui is distributed as versioned source copies, not an npm publication. There
are currently no release tags. Record both `package.json`'s version and the source
commit; a version alone does not distinguish later tooling/documentation revisions.
The generated consumer `VERSION` file records the copied assets' hashes.

These summaries were reconstructed from public source history on 2026-10-26.
They do not claim notes were present at the original revisions. Before distributing
a new source copy, add its major changes, upgrade impact and source revision here;
bump the package version when shipped assets change. Include known vulnerability
identifiers when applicable. Pending PRs are not described as released fixes.

## Unreleased

Adds this release history and links it from the README. No browser assets or
consumer copies change; no package version is published by this documentation PR.

## 0.2.0 source updates

The revisions below retain the browser assets introduced in 0.2.0. Their changes
affect integration guidance, tooling, repository policy or licensing.

### [2026-10-25 — e7e3401](https://github.com/Busnes-app/ky-ui/commit/e7e3401)

Adds live Best Practices and Scorecard links, pins CI actions, publishes contributor,
security-reporting and assurance documentation, and corrects the private reporting
URL. This includes the contributing/assurance material introduced on 2026-10-23.

Upgrade impact: read the documented contribution/security process when proposing
changes. Badges show the current external results; displaying a badge does not
claim a passing certification. No application-asset rollout is required.

### [2026-10-16 — 83bbf16](https://github.com/Busnes-app/ky-ui/commit/83bbf16)

Adds the MIT license and declares it in package metadata.

Upgrade impact: carry the license notice with redistributed copies. Browser behavior
and the copied asset format are unchanged.

### [2026-10-11 — 59dd6bb](https://github.com/Busnes-app/ky-ui/commit/59dd6bb)

Removes archived KyMark and KyVault repositories from the active consumer inventory
so the public freshness check no longer attempts to clone them anonymously.

Upgrade impact: use the checked-in `consumers.json` for current release-copy targets.
This does not remove existing installations or their data and does not alter assets
already copied into other products.

### [2026-10-10 — 9393a5c](https://github.com/Busnes-app/ky-ui/commit/9393a5c)

Moves CI to Node 26 and adds OpenSSF Scorecard analysis. These are development and
repository-assurance changes, not a new browser dependency.

Upgrade impact: use the CI-supported Node version for local tooling/tests. Shipped
JavaScript remains dependency-free; consumer copies need no refresh for this change.

### [2026-09-25 — e39d468](https://github.com/Busnes-app/ky-ui/commit/e39d468)

Corrects integration guidance to load theme initialization from a same-origin external
module under `script-src 'self'`. Clarifies that deferred modules do not guarantee
saved-choice application before first paint, and that private consumer checks must
not execute mutable public upstream code beside private source.

Upgrade impact: follow the README's external bootstrap example; do not weaken CSP
with `unsafe-inline`. Keep the product's saved theme key and named-theme adapter,
and verify first-paint behavior in that product. Browser assets are unchanged.

### [2026-09-25 — 1f90713 / c02a295](https://github.com/Busnes-app/ky-ui/commit/c02a295)

Adds Chromium contract tests at desktop/mobile widths in both color schemes,
including theme persistence, cross-tab changes, restricted storage, keyboard focus
and dialogs. Adds a public-consumer freshness workflow and separates the private
KyForge comparison into its own reviewed workflow.

Upgrade impact: development verification now needs the locked Playwright dependency
and Chromium. Shared-fixture tests do not certify every product layout or live
authentication flow. Public and private freshness gates together cover the active
inventory; a green public job alone does not prove private-consumer freshness.

## [0.2.0 — 2026-09-25 — 032bcf3](https://github.com/Busnes-app/ky-ui/commit/032bcf3)

Completes the shared browser foundation: adjusts semantic palette contrast, adds a
warning token, and scopes compatibility aliases to Busnes themes so named product
palettes remain usable. Adds storage-safe preference helpers, OS/cross-tab listeners
and TypeScript declarations. Navigation styling becomes state-only, with a selected
surface/accent rail and explicit focus/disabled states. Consumer synchronization
preflights destinations, refuses symlinks, emits palette helpers plus a hashed
manifest, and supplies a local vendor-integrity check.

Upgrade impact: products must provide their own navigation geometry, spacing and
typography; those are no longer supplied by `.ky-nav-item`. Keep existing named
themes and saved choices. Refresh through the sync tool so CSS, helpers, generated
palettes and the `VERSION` manifest stay together; rebuild embedded product assets
and run that product's checks. A local integrity check proves the recorded copy,
not that a newer upstream release is unavailable. No user-data migration is needed.

## 0.1.0 — 2026-09-25

### [Versioned consumer copies — 7657866](https://github.com/Busnes-app/ky-ui/commit/7657866)

Adds a repeatable consumer-sync/check command, generated version/hash records,
updated Busnes palette values and compatibility aliases for existing product
variables. It preserves named themes rather than forcing the OS dark palette over
an explicit product theme.

Upgrade impact: inspect the palette change and alias precedence in each product.
Use the sync command to refresh the complete copy rather than hand-editing vendor
files. This is an earlier copy format; 0.2.0 expands the generated asset set and
strengthens destination checks.

### [Initial source — 89d85e7](https://github.com/Busnes-app/ky-ui/commit/89d85e7)

Introduces shared Busnes Light/Dark tokens, OS-aware theme selection and accessible
navigation states, with small JavaScript helpers and no runtime framework dependency.

Upgrade impact: integrate the shared assets through a product adapter; ky-ui does
not supply a router, page layout or application authorization. Prefer the current
integration guide rather than this revision's superseded bootstrap example.
