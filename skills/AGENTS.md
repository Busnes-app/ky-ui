# Suite design skill

## Purpose

Maintain reusable instructions for designing and evaluating the Ky web suite.

## Ownership

- `ky-suite-ui/` owns the skill entrypoint and task-specific references.
- Product runtime CSS, components and routes remain in their product repositories; shared tokens remain in `../src/`.

## Local Contracts

- Preserve the Busnes identity, existing named themes, saved theme choices and product security/authorization boundaries.
- Separate screenshot-visible quality from verified behavior. A review skill must expose missing evidence and score calculations.
- Keep competitive quality independent of a provider's resemblance to Ky branding.
- Treat 9/10 as an acceptance target requiring current evidence, not a mandated review outcome.
- Every redesign stage includes before/after screenshots and stated capture conditions.
- Council delivery includes a spreadsheet and reviewable PRs. KyCalendar uses one left navigation region, never two adjacent panels.

## Work Guidance

- Read the existing shared tokens and the target product's owning instructions before prescribing changes.
- Keep the skill portable across Ky products and avoid duplicating runtime palette values as another source of truth.

## Verification

- Validate skill frontmatter with the skill-creator validator.
- Exercise the skill on the council screenshot set and check score arithmetic and evidence coverage.

## Child DOX Index

None.
