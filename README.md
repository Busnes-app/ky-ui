# ky-ui

`ky-ui` is the small shared browser foundation for the Ky* servers. It provides the Busnes Light/Dark design tokens, OS-aware theme selection, and the selected-navigation treatment used across the suite.

It deliberately does not provide a framework, router, component runtime, or product page layouts. Each server keeps its own composition and imports the shared CSS/JS primitives.

## Use

```html
<link rel="stylesheet" href="/assets/ky-ui/tokens.css">
<link rel="stylesheet" href="/assets/ky-ui/navigation.css">
<script type="module">
  import { applyTheme } from "/assets/ky-ui/theme.js";
  applyTheme();
</script>
```

For a server-rendered page, call `applyTheme()` in the document head when possible to reduce theme flash. Product CSS should map its existing local variables to the `--ky-*` tokens during migration, then delete the duplicate token definitions once all consumers are moved.

Refresh the checked-in consumer copies with `npm run sync:consumers -- --root=/path/to/suite-worktrees`. `consumers.json` names the nine products and server base. For differently named checkouts, pass `--paths=/path/to/paths.json`, a JSON object mapping those repository names to absolute checkout paths. Every destination is validated before writing.

The copy includes CSS, theme preference helpers, generated palette previews and `VERSION` with SHA-256 hashes. `npm run check:consumers -- --paths=/path/to/paths.json` compares copies to the source. Each consumer runs `node path/to/ky-ui/check-vendor.mjs` in CI to detect accidental local edits. That check verifies the recorded copy; it does not claim a newer release is available. Bump the package version when releasing changes.

`tokens.css` is the palette source. Generated `palettes.ts` and `palettes-browser.js` support swatches and consumers that require literal values without duplicating maintained palettes. Product adapters use `readChoice` and `saveChoice` with their existing storage keys. Navigation uses `.ky-nav-item` plus ARIA state or existing active/selected classes and product colors; spacing and orientation stay local.

## Boundary

The package is browser UI infrastructure. `ky-primitives` remains the home for Go protocol, crypto, and recovery primitives; it should not absorb CSS or browser behavior.

## Verification

```sh
npm test
```
