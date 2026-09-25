# Ky UI rollout plan

This is the implementation plan for the five follow-up fixes identified after the server theme work.

## 0. Establish the base

- Land `ky-ui` as a dependency-free, versioned browser package.
- Use Busnes Light/Dark as the shared default and follow the OS until a local choice exists.
- Publish tokens, theme application, and navigation state CSS without taking ownership of product layouts.
- Verify the package with deterministic Node tests.

Done when every exported primitive has a documented contract and `npm test` is green.

## 1. Migrate KyMark

- Replace the Patina/Cyan root palette with `ky-ui` tokens.
- Remove the duplicate `.nav-item.active` rule.
- Preserve KyMark-specific card, bookmark, and toolbar layout locally.
- Check light, dark, keyboard focus, and narrow viewport states.

Done when no legacy palette token controls the application shell and the active page is distinguishable without color alone.

## 2. Improve KyDNS selected navigation

- Adopt `ky-ui/navigation.css` for the selected page.
- Keep the horizontal navigation shape, but add the quiet selected surface and slim accent rail.
- Retain the existing named theme choices and OS default behavior.

Done when selected, hovered, focused, and disabled states are distinct in both themes and at mobile widths.

## 3. Replace gallery-only screenshots with real states

- Capture rendered desktop and mobile states from KyDNS, KyRecovery, KySignOn (KyIdentity), KyMark, KyVault, KyNotes, KyPost, KyYard, and KyForge.
- Cover Busnes Light, Busnes Dark, selected navigation, empty/loading/error, and one representative application screen per product.
- Store the images beside the owning product or in a clearly versioned visual-regression fixture directory.

Done when each product has screenshots of its actual shell and at least one real application surface, not only generic templates.

## 4. Clean the KyNotes embedded bundle

- Regenerate `internal/web/dist` from the current source build.
- Confirm the generated index references only current BlockNote chunks.
- Remove unreferenced stale hashed assets from the embedded output.
- Make the build/check fail if stale output is committed again.

Done when a clean build produces the checked-in asset set and the editor loads without selecting an obsolete chunk.

## 5. Migrate shared styling across the suite

- Status: in progress — the versioned consumer sync and canonical token aliases are landed; product-specific palette removal continues in the consumer PRs.

- Map each product's existing variables to `--ky-*` during a small, reviewable migration.
- Move only shared tokens, theme persistence, focus treatment, and navigation states into `ky-ui`.
- Keep page grids, forms, editor rules, tables, and product-specific components in their owning repositories.
- Remove dead duplicate shell rules after each product is migrated; KyYard's redundant legacy shell block is an early cleanup candidate.
- Add a versioned release/copy step so servers consume a known `ky-ui` version rather than remote runtime CSS.

### Complete the product scope

- KyYard: add the actual repository and asset path to the consumer manifest, map shell variables to shared tokens, remove the redundant legacy shell block after checking its callers, and preserve deployment controls and responsive navigation. Deliver in its own worktree and PR with light/dark desktop/mobile screenshots.
- KyForge: identify every served shell and CSS entry point, add its repository and asset path to the consumer manifest, and migrate token and navigation state ownership while preserving build/job/log layouts. Deliver in its own worktree and PR with the same visual evidence.
- Suggested follow-up: migrate `ky-server-base` so newly created servers inherit the shared layer. Track it separately from the nine existing products.

### Repair and verify the existing migration first

Review baseline: ky-ui #1 and consumer PRs KyMark #43, KyDNS #39, KyRecovery #29, KyIdentity #63, KyVault #57, KyNotes #26, KyPost #227.

1. Fix KyRecovery's theme selector mismatch. The script selects `busnes-light`/`busnes-dark`, but the light warning/error overrides still select `light`. Verify the rendered warning, error, muted text and wash contrast in both themes. Replace the contrast check's first-literal lookup with checks of the active palette; preserving unused fallback literals does not validate what users see.
2. Remove competing Busnes definitions. KyMark's attribute-qualified local variables outrank shared `:root` aliases, and KyPost still writes literal Busnes values inline. Keep one palette source and adapt stylesheet-free tests to that source instead of retaining production duplication to satisfy tests. Preserve mail-specific semantic aliases.
3. Make shared navigation styles effective. Importing `.ky-nav-item` rules does nothing for markup that lacks that class. Migrate actual navigation states, preserving each product's geometry and named-theme colors. Verify keyboard focus, current-page semantics, disabled states and stable item height on mobile.
4. Harden the existing copy workflow. Replace machine-specific checkout assumptions such as `kyvault-audit` with explicit repository/path configuration; validate all destinations before writing so a missing checkout does not silently become a new directory. Pin an identifiable release or content digest and check freshness in CI. A published npm package is optional; build-time vendoring is sufficient.
5. Consolidate theme choice handling only through adapters that preserve existing storage keys, named choices, OS following and cross-tab changes. Verify first paint, unavailable storage, named-to-Busnes switching and system preference changes. Keep product layouts local.
6. Capture real rendered evidence before calling the migration complete. Include both themes, desktop/mobile, a representative operational screen and focus/selected/error states. Validate the served embedded bundles as well as the frontend source builds.

Done when all nine named web products use the shared token source and active navigation treatment, each product still owns its layout, and rendered checks pass in both themes. Copied files and green compilation alone do not satisfy this gate.

## Release gates

- `ky-ui` unit tests are green.
- Each migrated product's existing tests/build are green.
- Keyboard focus and selected state are visible in both themes.
- No product-specific asset, route, or backend behavior moved into the shared package.
- A visual diff is reviewed for desktop and mobile before each product migration is merged.
