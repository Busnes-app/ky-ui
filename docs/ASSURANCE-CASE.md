# Assurance case

[Overview](../README.md) · [Contributing](../CONTRIBUTING.md) · [Rollout plan](../PLAN.md)

This is the argument that ky-ui does not weaken the security of the Ky products that use it:
what it must protect, where the trust boundaries are, and why the design and the code hold at
each one. Paths are relative to the repository root.

ky-ui is small: two stylesheets, one theme module (`src/theme.js`), and the tooling that copies
them into consumer repositories. It handles no credentials and no user data. Its security job is
to stay out of the way of each product's own protections and to make sure the copy a product
ships is the copy that was reviewed here.

## Security requirements

1. **The shipped code cannot be used to inject script or markup** into a product page, whatever
   is in the browser's storage.
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

Out of scope: a compromised ky-ui `main` branch (the ruleset requires a pull request and green
`test` and `browser` jobs), and a product's own pages, routes and CSP, which the product owns.

## Trust boundaries

1. **Browser storage → `theme.js`.** A stored theme is untrusted. Only one of three fixed names
   reaches the document.
2. **ky-ui → consumer repository.** `scripts/sync-consumers.mjs` writes the release copy and a
   `VERSION` manifest of SHA-256 hashes. Each public consumer runs the copied `check-vendor.mjs`
   as an npm `prebuild`/`pretest` script or in CI (KyForge-Server is private and not checked here).
3. **Public consumer branches → ky-ui CI.** `scripts/check-suite.mjs` clones them as data and
   compares bytes.

## Secure design principles applied

- **Economy of mechanism.** The shipped code is 75 lines of JavaScript and two stylesheets, with
  no framework, no build step and no runtime dependencies.
- **Fail-safe defaults.** An unknown or unreadable stored theme becomes `system`. Storage that
  throws is ignored, and the theme still applies.
- **Least privilege.** CI workflows run with `contents: read`; the freshness job checks out
  without persisted credentials and clones with credential helpers disabled.
- **Complete mediation.** Every consumer target is validated before any file is written, so a
  bad target stops the whole sync rather than leaving some consumers updated.
- **Separation.** Browser UI stays here; Go protocol and crypto code stays in `ky-primitives`
  (AGENTS.md, README "Boundary").

## Common weaknesses and how they are countered

| Weakness | Counter | Where |
|---|---|---|
| DOM-based XSS from stored values (CWE-79) | A stored choice is checked against a fixed list of three names; anything else becomes `system`. The module only sets `dataset.kyTheme` and `style.colorScheme`. No `innerHTML`, `eval`, `new Function` or `document.write` in `src/` | `src/theme.js` (`normalizeTheme`, `applyTheme`), `test/theme.test.js` |
| CSP weakening | The documented bootstrap is external scripts only; a browser test serves the README's own snippet under `default-src 'self'; script-src 'self'` and requires zero violations | `README.md` "Use", `browser/readme.spec.js` |
| Storage access throwing in restricted browsers | Every storage access is inside `try`; the theme still applies | `src/theme.js` (`readChoice`, `saveChoice`, `readStoredTheme`), `browser/theme.spec.js` "restricted storage" |
| Third-party code in products | No `dependencies` in `package.json`; stylesheets have no `@import` or `url()`; Playwright is a pinned development dependency only (`1.63.0`, `package-lock.json`) | `package.json`, `src/*.css` |
| Silent drift of vendored copies | `VERSION` records a SHA-256 for each copied file; `check-vendor.mjs` refuses a mismatch and accepts only plain lowercase filenames; `check-suite.mjs` regenerates the release copy and requires exact bytes in every public consumer, daily and on each push to `main` | `src/check-vendor.mjs`, `scripts/check-suite.mjs`, `.github/workflows/consumer-freshness.yml` |
| Path traversal and symlink writes in the sync tool (CWE-22, CWE-59) | Each target directory is resolved with `realpath` and must stay inside its checkout; a symlinked target directory or a non-regular existing file is refused; every target is checked before anything is written | `scripts/sync-consumers.mjs`, `test/sync.test.js` |
| Code execution or credential exposure in the freshness job | Consumers are cloned with `--depth=1` after `--`, with global and system git config disabled, no prompt and no askpass; the repository name must match a plain pattern; only file bytes are compared, no consumer script runs; the checkout does not persist credentials | `scripts/check-suite.mjs`, `.github/workflows/consumer-freshness.yml` |
| Test fixture exposure | The browser fixture server listens on `127.0.0.1` only and serves a fixed file list | `browser/server.mjs` |

## Residual risk

- **`check-vendor.mjs` catches accidents, not tampering.** The `VERSION` manifest sits beside the
  files it describes, so whoever edits both passes the check. The daily `check-suite.mjs`
  comparison against ky-ui `main` is what catches a deliberate change, and only for the public
  consumers; KyForge-Server is private and runs its own comparator.
- **Saved-choice first paint is not guaranteed for module adapters.** Modules are deferred, so a saved
  theme can apply after the first frame (README "Use"). Products using the synchronous classic
  `themes-browser.js` bootstrap apply it before paint. This is cosmetic, not a security issue.
- **No linter or formatter runs in CI**, and `src/theme.d.ts` is kept in step with
  `src/theme.js` by review only.
- **Releases are not tagged or signed.** A release is a `package.json` version; consumers get it
  through reviewed pull requests, not a registry.
- No independent security audit has been done.

## Evidence

- **Tests:** `npm test` (Node test runner) covers theme logic and the sync tool's preflight,
  symlink refusal and drift detection. `npm run test:browser` runs the shipped files in Chromium
  at two widths in light and dark, including restricted storage and the README snippet under a
  strict CSP. CI requires both jobs.
- **Static analysis:** CodeQL code scanning (default setup) and OpenSSF Scorecard
  (`.github/workflows/scorecard.yml`).
- **Release integrity:** the `consumer-freshness` workflow and each consumer's
  `check-vendor.mjs` run.

A pull request that changes a trust boundary or a security requirement must update this page in
the same change.
