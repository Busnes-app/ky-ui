# ky-ui

## Purpose

Provide the shared browser design language for Ky* web products: Busnes Light/Dark and control tokens, theme selection, accessible navigation states, and reusable design/review guidance.

## Ownership

- `src/tokens.css` owns shared visual tokens.
- `src/navigation.css` owns reusable selected, hover, focus, and responsive navigation states.
- `src/appearance.css` owns the shared responsive Appearance radio-card grid and preview styling; products retain catalogs, persistence adapters and page composition.
- `src/theme.js` owns theme choice normalization, OS fallback, persistence, and application to a document.
- `consumers.json` lists the active product repositories and `ky-server-base`; `scripts/sync-consumers.mjs` validates their worktrees before copying shared assets, generated palette previews, and a version/hash manifest.
- Product repositories own their page layouts, routes, product-specific components, and backend assets.
- `skills/` owns the reusable suite design skill; `reviews/` owns comparative screenshot evidence and staged acceptance records.
- `scripts/check-suite.mjs` checks public consumer default branches read-only with credential helpers disabled; no consumer code runs. Archived products stay outside the active inventory; no cross-repository private token is used.

## Local Contracts

- The default theme follows the operating system until a browser-local choice is saved.
- Explicit `busnes-light` and `busnes-dark` choices override the OS.
- Shared selectors are prefixed with `ky-` or use explicit `data-ky-*`/ARIA state to avoid product CSS collisions.
- Compatibility aliases map existing product variables to shared tokens. Product adapters retain saved theme keys and named palettes. Navigation primitives own state styling only; products own geometry.
- The selected page remains obvious without relying on color alone: use a surface change and an accent rail.
- This package is browser-facing and stays separate from the Go-only `ky-primitives` library.
- Integration examples use same-origin external scripts compatible with `script-src 'self'`; deferred modules do not promise saved-choice application before first paint.

## Work Guidance

- Keep the shipped primitives dependency-free. Playwright is a development-only dependency for browser verification.
- Add tokens and interaction primitives here; keep product composition and layout local to each product.
- Type, spacing, control, field-border and overlay tokens are shared alongside the palette. Self-host Space Grotesk in consumers; the font stack does not fetch a font.
- `--consumer=<inventory name>` scopes both sync and check to the named consumers. Preflight every selected destination before any write; use an explicit worktree map for a partial rollout.
- Run `npm run sync:consumers -- --root=<suite worktree root>` for a release copy, and `npm run check:consumers -- --root=<suite worktree root>` before merging consumer changes.
- Update `PLAN.md` when a rollout step changes or a product migration is completed.
- Before distributing a source copy, update `CHANGELOG.md` with major changes,
  upgrade impact, source revision and known vulnerability IDs; bump the package
  version when shipped assets change. Keep pending changes separate.

## Verification

Run `npm run check` (ESLint recommended checks with zero warnings, then unit tests) and `npm run test:browser` from this directory (install Chromium first, as described in README). Fix lint findings or document a narrowly scoped false positive beside its suppression. For a rollout, also run `npm run check:consumers -- --root=<suite worktree root>` after syncing the consumer copies; `npm run check:suite` checks public default branches.

## Child DOX Index

- `browser/AGENTS.md` owns the shared primitive browser fixture and regression checks (not product integration coverage).
- `skills/AGENTS.md` owns the suite design skill and its references.
- `reviews/AGENTS.md` owns comparative scores, provenance and staged visual evidence.
