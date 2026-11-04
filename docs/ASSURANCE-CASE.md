# Assurance case

[Overview](../README.md) · [Contributing](../CONTRIBUTING.md) · [Rollout plan](../PLAN.md)

This is the argument that ky-ui does not weaken the security of the Ky products that use it:
what it must protect, where the trust boundaries are, and why the design and the code hold at
each one. Paths are relative to the repository root.

ky-ui is small: shared stylesheets, the theme modules (`src/theme.js`, `src/themes.js`), the
Settings menu button (`src/menu.js`), the app rail marks and link check (`src/appmarks.js`), the
update notice (`src/update.js`), and the tooling that copies them into consumer repositories. It
handles no credentials and no user data. Its security job is
to stay out of the way of each product's own protections and to make sure the copy a product
ships is the copy that was reviewed here.

## Security requirements

1. **The shipped code cannot be used to inject script or markup** into a product page, whatever
   is in the browser's storage, the suite directory's app list or the re-fetched entry document.
2. **The shipped code works under a strict Content Security Policy** (`script-src 'self'`, no
   `unsafe-inline`), so no product has to loosen its policy to adopt it.
3. **Shipped files add no third-party code** to a product.
4. **A consumer's copy is the reviewed copy.** An accidental edit to a vendored file fails the
   consumer's build or tests, and a copy that is out of date with `main` is reported.
5. **The tooling cannot be turned against the machine or repositories it runs on**: the sync
   tool writes only inside the named consumer asset directories, and the freshness check runs
   no consumer code and uses no credentials.

## Threat model

| Attacker | Can | Wants |
|---|---|---|
| Script or extension in the same origin, or a user | Write any value to `localStorage` | Get that value interpreted as markup or script |
| Contributor to a consumer repository | Edit the vendored `ky-ui/` files | Ship changed theme code under the ky-ui version label |
| Someone who controls a consumer repository's contents | Put symlinks or odd file types where the sync tool writes | Make a sync write outside the consumer's asset directory |
| Public consumer repository content | Be cloned by `check-suite.mjs` | Run code in the ky-ui CI job, or read its token |
| Admin of the suite directory (KyIdentity) | Set any app `url` in `/api/suite/apps` | Run script in a product's origin when its rail link is clicked, for example to read KyNotes plaintext |

Out of scope: a compromised ky-ui `main` branch (the ruleset requires a pull request and green
`test` and `browser` jobs), and a product's own pages, routes and CSP, which the product owns.

## Trust boundaries

1. **Browser storage → `theme.js`.** A stored theme is untrusted. Only one of three fixed names
   reaches the document.
2. **ky-ui → consumer repository.** `scripts/sync-consumers.mjs` writes the release copy and a
   `VERSION` manifest of SHA-256 hashes. Each public consumer runs the copied `check-vendor.mjs`
   as an npm `prebuild`/`pretest` script or in CI.
3. **Public consumer branches → ky-ui CI.** `scripts/check-suite.mjs` clones them as data and
   compares bytes.
4. **Suite directory → app rail.** An app `url` is untrusted. The README contract has products
   render it only through `appHref`, which returns an `http:` or `https:` URL or null, and drop
   the entry on null, so a `javascript:`, `data:` or `vbscript:` URL never becomes a link
   (README "App rail").
5. **Served entry document → `update.js`.** The re-fetched page is parsed by the inert
   `DOMParser` (its scripts do not run); only asset URLs are compared, redirects are not
   followed, and the notice is built with `textContent`.

## Secure design principles applied

- **Economy of mechanism.** The shipped code is a few hundred lines of JavaScript plus
  stylesheets, with no framework, no build step and no runtime dependencies.
- **Fail-safe defaults.** An unknown or unreadable stored theme becomes `system`. Storage that
  throws is ignored, and the theme still applies.
- **Least privilege.** CI workflows run with `contents: read`; the freshness job checks out
  without persisted credentials and clones with credential helpers disabled.
- **Complete mediation.** Every consumer target's path is validated before any file is written,
  so a bad path stops the whole sync rather than leaving some consumers updated. Writability is
  not checked: a write error (a read-only file, a full disk) stops the sync with earlier
  consumers already updated; fix it and run the sync again.
- **Separation.** Browser UI stays here; Go protocol and crypto code stays in `ky-primitives`
  (AGENTS.md, README "Boundary").

## Common weaknesses and how they are countered

| Weakness | Counter | Where |
|---|---|---|
| Script URLs in the app rail (CWE-79) | `appHref` keeps only `http:`/`https:` after URL parsing, so case and whitespace tricks fail; the README contract drops rejected entries | `src/appmarks.js`, `test/appmarks.test.js`, `browser/rail.spec.js` |
| DOM-based XSS from stored values (CWE-79) | A stored choice is checked against a fixed list of three names; anything else becomes `system`. The module only sets `dataset.kyTheme` and `style.colorScheme`. No `innerHTML`, `eval`, `new Function` or `document.write` in `src/` | `src/theme.js` (`normalizeTheme`, `applyTheme`), `test/theme.test.js` |
| CSP weakening | The documented bootstrap is external scripts only; a browser test serves the README's own snippet under `default-src 'self'; script-src 'self'` and requires zero violations | `README.md` "Use", `browser/readme.spec.js` |
| Storage access throwing in restricted browsers | Every storage access is inside `try`; the theme still applies | `src/theme.js` (`readChoice`, `saveChoice`, `readStoredTheme`), `browser/theme.spec.js` "restricted storage" |
| Third-party code in products | No `dependencies` in `package.json`; stylesheets have no `@import` or `url()`; Playwright is a pinned development dependency only (`package-lock.json`) | `package.json`, `src/*.css` |
| Silent drift of vendored copies | `VERSION` records a SHA-256 for each copied file; `check-vendor.mjs` refuses a mismatch and accepts only plain lowercase filenames; `check-suite.mjs` regenerates the release copy and requires exact bytes in every public consumer, daily and on each push to `main` | `src/check-vendor.mjs`, `scripts/check-suite.mjs`, `.github/workflows/consumer-freshness.yml` |
| Path traversal and symlink writes in the sync tool (CWE-22, CWE-59) | Each target directory is resolved with `realpath` and must stay inside its checkout; a symlinked target directory or a non-regular existing file is refused; every target is checked before anything is written | `scripts/sync-consumers.mjs`, `test/sync.test.js` |
| Code execution or credential exposure in the freshness job | Consumers are cloned with `--depth=1` after `--`, with global and system git config disabled, no prompt and no askpass; the repository name must match a plain pattern; only file bytes are compared, no consumer script runs; the checkout does not persist credentials | `scripts/check-suite.mjs`, `.github/workflows/consumer-freshness.yml` |
| Test fixture exposure | The browser fixture server listens on `127.0.0.1` only and serves a fixed file list | `browser/server.mjs` |

## Residual risk

- **`check-vendor.mjs` catches accidents, not tampering.** The `VERSION` manifest sits beside the
  files it describes, so whoever edits both passes the check. The daily `check-suite.mjs`
  comparison against ky-ui `main` is what catches a deliberate change, for the public consumers.
- **Saved-choice first paint is not guaranteed for module adapters.** Modules are deferred, so a saved
  theme can apply after the first frame (README "Use"). Products using the synchronous classic
  `themes-browser.js` bootstrap apply it before paint. This is cosmetic, not a security issue.
- **No formatter runs in CI** (ESLint does, in `npm run check`), and the `src/*.d.ts` files are
  kept in step with their modules by review only.
- **Releases are not tagged or signed.** A release is a `package.json` version; consumers get it
  through reviewed pull requests, not a registry.
- **The rail is only as safe as each product's rendering.** ky-ui does not render the rail; a
  product that sets the `href` without `appHref` and has no strict CSP is still exposed until it
  adopts the 0.11 contract (PLAN.md).
- No independent security audit has been done.

## Evidence

- **Tests:** `npm test` (Node test runner) covers theme logic, `appHref`, `update.js`, the
  status and muted-text contrast gate, and the sync tool's preflight, symlink refusal and drift
  detection. `npm run test:browser` runs the shipped files in Chromium
  at two widths in light and dark, including restricted storage and the README snippet under a
  strict CSP. CI requires both jobs.
- **Static analysis:** CodeQL code scanning (default setup) and OpenSSF Scorecard
  (`.github/workflows/scorecard.yml`).
- **Release integrity:** the `consumer-freshness` workflow and each consumer's
  `check-vendor.mjs` run.

A pull request that changes a trust boundary or a security requirement must update this page in
the same change.
