# ky-ui

## Purpose

Provide the shared browser design language for Ky* web products: Busnes Light/Dark tokens, theme selection, and accessible navigation state styles.

## Ownership

- `src/tokens.css` owns shared visual tokens.
- `src/navigation.css` owns reusable selected, hover, focus, and responsive navigation states.
- `src/theme.js` owns theme choice normalization, OS fallback, persistence, and application to a document.
- Product repositories own their page layouts, routes, product-specific components, and backend assets.

## Local Contracts

- The default theme follows the operating system until a browser-local choice is saved.
- Explicit `busnes-light` and `busnes-dark` choices override the OS.
- Shared selectors are prefixed with `ky-` or use explicit `data-ky-*`/ARIA state to avoid product CSS collisions.
- The selected page remains obvious without relying on color alone: use a surface change and an accent rail.
- This package is browser-facing and stays separate from the Go-only `ky-primitives` library.

## Work Guidance

- Keep this package dependency-free unless a concrete product requirement proves a dependency necessary.
- Add tokens and interaction primitives here; keep product composition and layout local to each product.
- Update `PLAN.md` when a rollout step changes or a product migration is completed.

## Verification

Run `npm test` from this directory. The test suite must cover theme normalization, OS resolution, persistence, and document application.

## Child DOX Index

No child DOX files.
