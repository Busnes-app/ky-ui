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

- Capture rendered desktop and mobile states from KyDNS, KyRecovery, KySignOn, KyMark, KyVault, KyNotes, and KyPost.
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

Done when all seven web products use one token source, each product still owns its layout, and visual checks pass in both themes.

## Release gates

- `ky-ui` unit tests are green.
- Each migrated product's existing tests/build are green.
- Keyboard focus and selected state are visible in both themes.
- No product-specific asset, route, or backend behavior moved into the shared package.
- A visual diff is reviewed for desktop and mobile before each product migration is merged.
