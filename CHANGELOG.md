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

### 0.9.0 — app rail (pending)

Based on 0.8.0. Adds the app rail to `shell.css`: `.ky-app-rail` (a `nav` named "Apps"),
`.ky-app-rail-label` and one icon link per suite app, at the top of `.ky-sidebar-foot` on
desktop and repeated at the top of `.ky-content-foot` on phones. Links are 36px (40px on
phones) with 24px marks; the current app (`aria-current="page"`) gets a 2px accent ring and
the accent tint, hover the panel hover surface, focus the shared accent outline. Existing
tokens only. New `src/appmarks.js` (+ `appmarks.d.ts`, export `./appmarks`) exports
`appMarks`, data-URI marks keyed by KyIdentity client ID (kypost, kycalendar, kydrive,
kynotes, kymessage, kymessage-chat, kyidentity, kydns, kypulse, kyrecovery, kyyard; 40 KB),
and `appMark(id)`, which falls back to a letter badge. `scripts/appmarks.mjs`
(`npm run generate:appmarks`) rebuilds them from the Busnes.app-site masters.
`sync-consumers.mjs` copies both files and lists them in `VERSION`.
Upgrade impact: nothing changes until a product renders the rail from its server's
`/api/suite/apps` list (README `### App rail`). Its CSP needs `img-src data:`.
No known vulnerability IDs apply.

### 0.8.0 — status colours separate from the accent (pending)

Based on 0.7.1. Danger no longer looks like the Busnes rust accent: `--ky-danger-light`
`#b42318` → `#a8174e` and `--ky-danger-dark` `#ff8176` → `#ff8fb1` (cool crimson).
Warning moves off Matter's brown (`#875b12` → `#7a5f00`, `#e0b775` → `#ffd25e`) and dark
success off Ky's teal (`#7bc49c` → `#86efac`). Forest gets its own teal success
(`#00737a`, `#6ee0d0`) away from its green accent; Nord's own danger and success are a step
lighter (`#ecc4c8`, `#bcd4aa`) to read on their tint. No accent changes.
New tokens `--ky-danger-soft`, `--ky-warning-soft` and `--ky-success-soft` (12% of the status
over the active panel) and the `.ky-status` pill in `shell.css`: a word, a leading dot or
icon, `data-ky-status="danger|warning|success"` or neutral. `navigation.css` puts a pill in a
navigation row at its end. README documents the status vs action rule.
`scripts/check-status-colours.mjs` (in `npm run check`) gates all twelve halves; the browser
spec `status.spec.js` measures the rendered pills.
Upgrade impact: status colours change wherever products use `--danger`, `--warning` or
`--success`; contrast stays at least 4.5:1. Products adopt `.ky-status` for state badges and
drop local pill styles in a later step. No known vulnerability IDs apply.

### 0.7.1 — phone tab focus ring (pending)

On phones the nav row scrolls sideways and clipped the focus ring of the first tab. The ring now sits inside each tab (`outline-offset: -2px`). Upgrade impact: refresh the source copy. No known vulnerability IDs apply.
### Development tooling: minimatch 11 (pending, no version bump)

Pins the development-only `minimatch` (pulled in by ESLint) to ^11.0.1 through
`overrides`. ESLint 10.13 and 10.14 still ask for ^10, so updating ESLint does not
fix it. No shipped asset changes, so consumers need no re-sync. Fixes
GHSA-g3hv-75wg-m249 / CVE-2026-118764 (moderate: denial of service through
globparts amplification in minimatch before 11.0.1). `npm audit` now reports 0.

### 0.7.0 — shared app frame and drift fixes (pending)

Based on 0.6.0 (palette pairs). Adds KyCalendar's app frame to `shell.css`:
`.ky-app`, `.ky-sidebar`, `.ky-brand` (28px mark and name), `.ky-sidebar-foot`,
`.ky-content`, and the phone header `.ky-mobile-head` with an icon-only
`.ky-mobile-signout` and a page-end `.ky-content-foot` licence line. `navigation.css`
gives `.ky-nav-item` rows inside `.ky-nav` KyCalendar's geometry (40px rows, 16px
icons, `--ky-type-nav`), plain `.ky-nav-section` labels, and on phones a row of
sideways-scrolling tabs with a scroll-driven edge fade. New tokens
`--ky-content-inset` (32px; 16px at 720px and narrower) and `--ky-content-max` (72rem).
Sign-in: `.ky-auth-theme select` takes KyCalendar's picker look, the picker row keeps
40px when empty, and the brand sits at a fixed top offset instead of being centred,
so the card's height no longer moves it.
Upgrade impact: additive class names; a bare `.ky-nav-item` keeps state-only
styling. The sign-in brand moves by at most a few pixels at 900px high and stays put
on other card heights. Refresh the complete source copy, adopt the classes and delete
local equivalents (drift spec section B). No known vulnerability IDs apply.

### 0.6.0 — light/dark palette pairs (pending)

Based on 0.5.0 (shared shell). The catalog is twelve halves in six pairs,
exported as `THEME_PAIRS` (Busnes, Matter, Ocean, Forest, Ky, Nord); each catalog
entry names its `pair`. A saved half ID keeps a fixed mode. A saved pair ID
(`<name>-pair`) follows the OS: `findTheme` and `applyThemeVariables` resolve it by
`prefers-color-scheme`, and `watchChoice` now re-applies on every OS change (its
`hasChoice` argument is ignored). New `findPair`; new half `forest-light`.
Light Matter, Dark Matter, White Cliffs, Polished Ky, Patina Ky and Paper take the
pairs spec values. `paper` is renamed "Nord Light" (alias "Paper Clean") and uses the
shared status colors; `nord` is renamed "Nord" (alias "Nord Slate"); `patina` and
"Patina Ky (base)" are aliases of `patina-ky`. Removed: tropics, tropic-night, coffee,
cyber-punk, neon-purple, space, sky, sun, cyber and oled; saved values resolve to
nothing, so products fall back to Busnes following the OS. Pair previews show both
halves (`appearance.css`, generated `appearance-themes.css`).
Upgrade impact: refresh the complete source copy; products whose `apply` is not
idempotent or that list the catalog must adopt pairs. KyCalendar is the reference
consumer. No known vulnerability IDs apply.

### 0.5.0 — shared shell (pending)

Adds `shell.css`, exported as `@busnes/ky-ui/shell.css` and copied to consumers.
It holds KyCalendar's sign-in card, sidebar user block with "Sign out", licence line,
About dialog with an outlined Close, and page head, so all products can render the same
markup. README `## Shell` documents that markup and the required accessible names.
The sign-in card is 360px wide (KyCalendar: 400px). Upgrade impact: none until a product
adopts the markup. Refresh the source copy, then replace the local equivalents.
No known vulnerability IDs apply.

### Repository metadata — REUSE 3.3 (pending, no version bump)

Every file now states its license and copyright in machine-readable form
([REUSE](https://reuse.software/) 3.3): `REUSE.toml` labels the repository MIT,
(c) 2026 Busnes.app, `LICENSES/MIT.txt` holds the text, and CI runs `reuse lint`.
No shipped asset changes, so the package version stays 0.4.3. Upgrade impact: none.

### 0.4.3 — named-theme warning colors (pending)

Based on source `2900a49` (0.4.2). Named palettes now set and clear the warning
alias alongside danger and success, using the selected palette's scheme rather
than the OS. Previously the warning alias could be unset or inherit the opposite
scheme's color. The shared dark warning is slightly lighter to reach 4.5:1
on Nord's hover surface (previously 3.91:1). Busnes Dark uses the same token.
Upgrade impact: refresh the complete source copy and rebuild consumers. KyPulse
is the initial scoped consumer. Saved theme IDs, names and choices are unchanged.
The managed-variable TypeScript declaration includes the warning alias.
No known vulnerability IDs apply.

### 0.4.2 — named-theme status contrast (pending)

Based on source `f270e22`. Named palettes without status colors use the shared
danger/success defaults for the selected palette's scheme, including when the OS
uses the opposite scheme. Patina, Cyber, Nord and Paper status colors are adjusted
within their existing hue families to reach 4.5:1 on panel and hover surfaces.
Field borders derive from strong ink so all named palettes reach 3:1 against
their page and panel surfaces.
Upgrade impact: refresh the complete source copy and rebuild consumers. Theme IDs,
names, aliases, preview colors and saved choices are unchanged. The initial scoped
consumer is KyNotes; other products are pending their own UI passes. No known
vulnerability IDs apply.

### 0.4.1 — first-paint theme bootstrap (pending)

Based on 0.4.0 source `ab7a039`. Sync now generates `themes-browser.js`, a classic-script
copy of `themes.js` that defines `window.kyThemes` with the same exports. A synchronous
head script can then apply a saved named theme before first paint; KyDNS and KyRecovery
use it to restore their pre-0.4.0 first-paint guarantee. `themes.js` stays the only
catalog source. Upgrade impact: every consumer refreshes its complete copy; products that
keep deferred modules are unchanged. No known vulnerability IDs apply.

### 0.4.0 — fleet Appearance (pending)

Preview swatches have a hairline boundary so their sidebar remains visible when
it matches the surrounding panel. Border-box sizing retains their 48px height.
Shared description, name and mode styles wrap consistently. Products keep the
Appearance navigation link and remove the navigation theme dropdown.

Based on source `0962260`. Adds shared responsive Appearance theme-preview radio cards, with native keyboard selection, persistent selected indicators and product-owned theme catalogs/adapters. The consumer manifest now includes `appearance.css`; every consumer must refresh its complete source copy. Expands the active inventory to the existing Drive and Pulse interfaces. The common catalog retains all 22 named themes plus Match system; generated external CSS supplies previews without inline attributes. Existing named choices, keys and OS fallback remain product contracts. No known vulnerability IDs apply. Pending rollout and review evidence do not certify 9/10 or deployment.

### 0.3.0 — suite UI cohesion (pending)

Based on source `41daa93`. Adds shared typography, spacing, control geometry,
field-border and overlay tokens; aligns the font stack with the existing
self-hosted Space Grotesk. Existing palettes, theme keys and navigation remain.
Named palettes without a local hover token derive their navigation hover from
their own surface and ink, preserving readable hover when the OS theme differs.
Hover keeps the selected surface and accent rail instead of overriding selection.
KyCalendar and KyMessages join the active consumer inventory. Sync can target
selected consumers, preflighting all selected destinations before writing.

Upgrade impact: sync version 0.3.0 and adopt the new tokens in product-owned
layouts. The initial rollout targets KyPost, KyCalendar and KyMessages in isolated
worktrees; other consumers remain pending and suite freshness will fail until
their copies advance. The reusable `skills/ky-suite-ui` skill and dated council
evidence describe the design and its verification. No known vulnerability IDs
apply to these UI changes. This is unreleased work, with no deployment implied.

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
