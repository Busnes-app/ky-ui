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

Refresh the checked-in consumer copies with `npm run sync:consumers -- --root=/path/to/suite-worktrees`. It writes only `tokens.css`, `navigation.css`, and `VERSION` into the seven web products. `npm run check:consumers -- --root=/path/to/suite-worktrees` verifies that every copy matches this package exactly.

## Boundary

The package is browser UI infrastructure. `ky-primitives` remains the home for Go protocol, crypto, and recovery primitives; it should not absorb CSS or browser behavior.

## Verification

```sh
npm test
```
