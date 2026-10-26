# Fleet UI rollout

## Required scope

Apply the approved Busnes cream/charcoal/orange web identity to the ten active Ky
web products and the server template. Every application exposes the same Appearance
theme-preview card picker through a navigation link, without a compact theme
dropdown in the navigation/sidebar or its phone-header presentation. Appearance
descriptions, theme names and mode text wrap consistently in shared styles. Native clients follow in a separate pass.

`consumers.json` owns the active repository/asset paths. Use one isolated worktree
and reviewable PR per repository, preserving product workflows and authorization.

| Consumer | Surfaces to preserve |
| --- | --- |
| KyIdentity | Applications, account security, directory and administration |
| KyNotes | Notebooks, list/editor workspace and encrypted queue |
| KyYard | Containers, endpoints, deployment controls and scoped administration |
| KyDrive | Private/group workspaces, files and editor integration |
| KyPulse | Monitoring, alerts and operational history |
| KyDNS | Horizontal navigation, DNS tables and operational status |
| KyRecovery | Capsules, ceremony, replication and recovery status |
| KyPost | Mail folders, reader, compose, contacts and administration |
| KyCalendar | One left navigation region, calendar views and administration |
| KyMessages | Console, authentication and MemberHome; stock Element stays configuration-only |
| ky-server-base | Scaffold shell and defaults inherited by future products |

KyForge, KyMark and KyVault are archived and excluded from new UI work. Existing
installations stay untouched. KyQuickStart and KyQuickStart-AI have command-line or
terminal interfaces, not browser interfaces; marketing sites and native clients are
outside this web pass. Record any additional discovered surface explicitly.

## Shared contract

- Version 0.4.0 adds `appearance.css` to the complete release copy. Products render
  native grouped radios with the documented markup and actual palette previews;
  the common catalog retains all 22 retained named themes plus Match system;
  product adapters keep saved keys, legacy aliases, OS following, cross-tab updates
  and restricted-storage behavior. The picker applies choices immediately and states
  that they are stored in this browser.
- Shared runtime colors, typography, control geometry and navigation states remain
  in ky-ui. Page composition, routing, authorization and content stay product-owned.
  Preserve existing accessible responsive navigation instead of imposing a sidebar
  where the product uses horizontal navigation.
- Use scoped consumer sync and an explicit worktree map. Preflight every selected
  destination before writing and verify exact vendor bytes. Served bundles must be
  rebuilt from the changed source.

## Evidence and acceptance

- Claude Opus 5.5 reviews the contract and staged implementation screenshots using
  `skills/ky-suite-ui`. A target score is not an achieved score.
- Capture matched before/after task and Appearance views with synthetic data at
  1280×900 and 390×844, Busnes Light/Dark, recording source revision or patch hash,
  fixture, theme source, browser, date and image hashes. Retain honest missing states.
- Export fleet inventory, ratings, capture pairs, checks, remaining gates and PR links
  to a spreadsheet. Separate visual scores from behavior gates.
- Check keyboard selection/focus, immediate theme application and saved reload,
  cross-tab and OS changes, named-theme retention, restricted storage and overflow.
  Screenshots or Chromium tests alone do not certify full accessibility.
- Run affected checks during iteration and each repository's full required checks
  before hand-back. Keep CI and autonomous review green at the current PR head;
  source review must account for generated-bundle truncation.
- Use T3's event-driven PR watchers while work remains and unwatch before hand-back.
  Merging and deployment remain the owner's actions. Fleet default-branch freshness
  stays incomplete until the consumer PRs merge; local vendor integrity is separate.

## Rollout status

Implementation, council scoring and product checks are in progress. The earlier
three-product pass is recorded in `reviews/2026-10-26-council`; its scores are not
reused as evidence of this rollout or of competitor superiority.
