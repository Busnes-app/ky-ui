# Shared Appearance release candidate

These are synthetic shared-component fixture captures at source `f48e7a0`,
including the distinct suite/base Patina variants: 22 named themes plus Match
system. They are not product screens or visual acceptance scores. The earlier
21-theme prototype is historical and is not part of this release evidence.

`manifest.json` records source asset hashes, Chromium capture conditions, input
hashes and the crop removing only empty fixture space. The original viewport is
1280×900 or 390×900; the image shows the full theme group, not that viewport.
Product captures use their separate 390×844/1280×900 conditions.

Checked: Node 26 zero-warning ESLint, 14 unit tests and 32 Chromium contracts. The
contracts cover native radio keyboard selection, focus, persistence, cross-tab
changes, system following, denied storage, forced colors and contained layout.
`catalog-parity.json` records an independent read-only comparison against immutable
original source revisions: 15 Identity + 15 KyPost + 5 base palettes. It does not verify
runtime CSS precedence or computed contrast across product pages.

Apps retain their storage keys, legacy adapters and first-paint behavior. Product
integration, complete named-theme/accessibility coverage and 9/10 acceptance are
separate gates. No merge or deployment is implied.
