# ky-ui

## Purpose

Provide the shared browser design language for Ky* web products: Busnes Light/Dark tokens, theme selection, and accessible navigation state styles.

## Ownership

- `src/tokens.css` owns shared visual tokens.
- `src/navigation.css` owns reusable selected, hover, focus, and responsive navigation states.
- `src/theme.js` owns theme choice normalization, OS fallback, persistence, and application to a document.
- `consumers.json` lists nine product repositories and `ky-server-base`; `scripts/sync-consumers.mjs` validates their worktrees before copying shared assets, generated palette previews, and a version/hash manifest.
- Product repositories own their page layouts, routes, product-specific components, and backend assets.
- `scripts/check-suite.mjs` checks nine public consumer default branches read-only with credential helpers disabled; no consumer code runs. Private KyForge checks public ky-ui main from its own scheduled workflow via check-only `--consumer=KyForge-Server`. Both workflows gate suite freshness; no cross-repository private token.

## Local Contracts

- The default theme follows the operating system until a browser-local choice is saved.
- Explicit `busnes-light` and `busnes-dark` choices override the OS.
- Shared selectors are prefixed with `ky-` or use explicit `data-ky-*`/ARIA state to avoid product CSS collisions.
- Compatibility aliases map existing product variables to shared tokens. Product adapters retain saved theme keys and named palettes. Navigation primitives own state styling only; products own geometry.
- The selected page remains obvious without relying on color alone: use a surface change and an accent rail.
- This package is browser-facing and stays separate from the Go-only `ky-primitives` library.

## Work Guidance

- Keep the shipped primitives dependency-free. Playwright is a development-only dependency for browser verification.
- Add tokens and interaction primitives here; keep product composition and layout local to each product.
- Run `npm run sync:consumers -- --root=<suite worktree root>` for a release copy, and `npm run check:consumers -- --root=<suite worktree root>` before merging consumer changes.
- Update `PLAN.md` when a rollout step changes or a product migration is completed.

## Verification

Run `npm test` and `npm run test:browser` from this directory (install Chromium first, as described in README). For a rollout, also run `npm run check:consumers -- --root=<suite worktree root>` after syncing the consumer copies; `npm run check:suite` checks public default branches.

## Child DOX Index

- `browser/AGENTS.md` owns the shared primitive browser fixture and regression checks (not product integration coverage).
