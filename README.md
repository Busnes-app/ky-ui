# ky-ui

[![OpenSSF Best Practices](https://www.bestpractices.dev/projects/15918/badge)](https://www.bestpractices.dev/projects/15918)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/Busnes-app/ky-ui/badge)](https://scorecard.dev/viewer/?uri=github.com/Busnes-app/ky-ui)

[Release notes](CHANGELOG.md) describe source versions, upgrade impact and integration changes.

`ky-ui` is the small shared browser foundation for the Ky* servers. It provides the Busnes Light/Dark design tokens, OS-aware theme selection, and the selected-navigation treatment used across the suite.

It deliberately does not provide a framework, router, component runtime, or product page layouts. Each server keeps its own composition and imports the shared CSS/JS primitives.

Version 0.3.0 also supplies type, space, control, field-border and overlay tokens.
Version 0.4.0 adds the shared responsive Appearance theme-preview radio cards.
Version 0.4.1 adds the generated classic catalog `themes-browser.js` for first-paint theme application.
Version 0.5.0 adds the shared [shell](#shell): sign-in, user block, licence line, About dialog and page head.
Version 0.6.0 groups the catalog into six light/dark pairs.
Products self-host Space Grotesk and own layout and components. The reusable
[Ky suite UI skill](skills/ky-suite-ui/SKILL.md) defines the visual contract and
evidence-based 9/10 acceptance target. The dated records under `reviews/` are
delivered in a companion evidence PR so runtime changes remain easy to review.

For a focused release copy, pass `--consumer=<inventory name>` once per selected
product to either sync or check, with `--paths` mapping those products to their
worktrees. Every selected destination is validated before any write; unselected
checkouts are untouched. Fleet freshness remains a separate whole-inventory gate.

- [Contributing](CONTRIBUTING.md) — how to propose a change and what it must pass.
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
available to the server, or load the generated `ky-ui/themes-browser.js` and a
product-owned classic script synchronously in the head. `themes-browser.js` defines
`window.kyThemes` with the `themes.js` exports; build pickers after `DOMContentLoaded`.
The token stylesheet follows the OS before an override
is applied. Existing products should retain their adapter, saved key and named
themes rather than replace them with this minimal default-key example.

Product CSS should map its existing local variables to the `--ky-*` tokens during migration, then delete the duplicate token definitions once all consumers are moved.

Refresh the checked-in consumer copies with `npm run sync:consumers -- --root=/path/to/suite-worktrees`. `consumers.json` names the ten active web products and server base. For differently named checkouts, pass `--paths=/path/to/paths.json`, a JSON object mapping those repository names to absolute checkout paths. Every destination is validated before writing.

The copy includes CSS, theme preference helpers, generated palette previews and `VERSION` with SHA-256 hashes. `npm run check:consumers -- --paths=/path/to/paths.json` compares copies to the source. Each consumer runs `node path/to/ky-ui/check-vendor.mjs` in CI to detect accidental local edits. That check verifies the recorded copy; it does not claim a newer release is available. Bump the package version when releasing changes.

`tokens.css` is the palette source and `themes.js` the catalog source. Generated `themes-browser.js` is the catalog as a classic script. Generated `palettes.ts` and `palettes-browser.js` support swatches and consumers that require literal values without duplicating maintained palettes. Product adapters use `readChoice` and `saveChoice` with their existing storage keys. Navigation uses `.ky-nav-item` plus ARIA state or existing active/selected classes and product colors; spacing and orientation stay local.


## Appearance

Import `appearance.css` and `appearance-themes.css` after product field/control
styles. `themes.js` supplies the common catalog of twelve halves, `THEME_PAIRS`
(six light/dark pairs: Busnes, Matter, Ocean, Forest, Ky, Nord) plus Match system; keep
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
output. `findTheme` resolves canonical IDs, names and legacy aliases. A saved half ID
is a fixed mode. A saved pair ID such as `ocean-pair` follows the OS: `findTheme` and
`applyThemeVariables` resolve it to the half for `prefers-color-scheme`, and
`watchChoice` re-applies on every OS change, so the product's apply must be
idempotent. A pair card's `data-ky-preview` is the pair ID and shows both halves.
Removed IDs return undefined, so products fall back to Busnes following the OS.
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

## Shell

`shell.css` gives every product the same sign-in screen, sidebar user block,
licence line, About dialog and page head, with KyCalendar's geometry. Import it
after `tokens.css`. Unlike `navigation.css`, it owns layout as well as state, so
render the markup below as written, in React or a Go template, and keep product
CSS off these classes. Icons are optional, decorative and `aria-hidden="true"`.

### Sign-in

```html
<main class="ky-auth">
  <div class="ky-auth-theme"><!-- product theme picker --></div>
  <div class="ky-auth-body">
    <div class="ky-auth-brand">
      <img src="/app-icon.png" width="56" height="56" alt="">
      <h1>KyNotes</h1>
      <p>Your notes, on your own server.</p>
    </div>
    <form class="ky-auth-card" method="post" action="/login">
      <div class="ky-auth-field">
        <label for="login-username">Username</label>
        <input id="login-username" name="username" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" required>
      </div>
      <div class="ky-auth-field">
        <label for="login-password">Password</label>
        <input id="login-password" name="password" type="password" autocomplete="current-password" required>
      </div>
      <p class="ky-auth-check" data-ky-state="passed" aria-live="polite"><svg aria-hidden="true">…</svg><span>Browser check passed</span></p>
      <button class="ky-auth-submit" type="submit">Sign in</button>
      <a class="ky-auth-link" href="/forgot">Forgot your password?</a>
      <!-- Only when SSO is configured: -->
      <hr class="ky-auth-divider">
      <a class="ky-auth-sso" href="/sso/login">Continue with KySignOn</a>
    </form>
    <p class="ky-auth-help">Notes are encrypted in this browser before they reach the server.</p>
  </div>
</main>
```

- The app name is the page's only `h1`. The mark has `alt=""`, because the name follows it.
- Every field is a `.ky-auth-field` holding a `label` whose `for` matches the input's unique `id`. Do not rely on placeholders.
- `.ky-auth-check` has no box. `data-ky-state` is `passed` or `failed`; leave it off while the check runs.
- The card can be the `form`, or a `div` holding one `form` per step, for example a two-step code with an `h2`.
- The button says "Sign in", and the user block says "Sign out".
- Leave out the divider and SSO button when no provider is configured, and `.ky-auth-help` when there is no note.

### User block and licence line

```html
<div class="ky-user">
  <div class="ky-user-copy">
    <p class="ky-user-name">walter</p>
    <p class="ky-user-role">Everyday account</p>
  </div>
  <form method="post" action="/logout">
    <button class="ky-user-signout" type="submit"><svg aria-hidden="true">…</svg>Sign out</button>
  </form>
</div>
<footer>
  <button class="ky-license-link" type="button" commandfor="ky-about" command="show-modal">&copy; 2026 &middot; MIT License</button>
</footer>
```

Put both at the bottom of the sidebar. The visible text "Sign out" is the button's
accessible name, so do not replace it with an icon. A product without a form
`POST` can use the same button with a click handler. The name truncates with an
ellipsis, and the role line is "Administrator" or "Everyday account". Products
choose how the sidebar collapses on phones, but keep both reachable.

### About dialog

```html
<dialog class="ky-about" id="ky-about" aria-label="About KyNotes" closedby="any">
  <div class="ky-about-head">
    <div>
      <h2 class="ky-about-name">KyNotes <span class="ky-about-version">v1.2.0</span></h2>
      <p class="ky-about-meta">Developed by Busnes.app</p>
      <p class="ky-about-meta">&copy; 2026 &middot; Licensed under the MIT License</p>
    </div>
    <form method="dialog"><button class="ky-about-close">Close</button></form>
  </div>
  <textarea class="ky-about-license" readonly aria-label="MIT License">MIT License …</textarea>
</dialog>
```

- Use the native `<dialog>` opened as a modal, with `aria-label="About <App>"`.
  The licence button's `commandfor`/`command="show-modal"` opens it without
  script. React can call `dialogRef.current.showModal()` instead.
- Escape and the outlined Close button close it, and focus returns to the
  licence button. `closedby="any"` also closes it on a backdrop click where the
  browser supports that.
- Omit the version pill when the version is unknown, for example before sign-in.
  The textarea carries `aria-label="MIT License"`.

### Page head

```html
<header class="ky-page-head">
  <div>
    <h1 class="ky-page-title">Phones and apps</h1>
    <p class="ky-page-lede">Each device gets its own app password.</p>
  </div>
  <button class="ky-page-action" type="button">New app password</button>
</header>
```

The lede is one sentence. `.ky-page-action` is the page's only primary button,
and you can leave it out. On narrow screens it wraps below the title.

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

## License

ky-ui is released under the [MIT License](LICENSE.txt).

[![OctoCounts](https://api.octocounts.com/badge/Busnes-app/ky-ui/branch/main)](https://octocounts.com/github/Busnes-app/ky-ui/tree/main)

## Documentation

- [Assurance case](docs/ASSURANCE-CASE.md) — threat model, trust boundaries, and why the security requirements are met.
- [Contributing](CONTRIBUTING.md) — how to propose a change and what it must pass.
- [Security policy](SECURITY.md) — how to report a vulnerability privately.
- [Release notes](CHANGELOG.md) — what changed in each release, and its upgrade impact.
