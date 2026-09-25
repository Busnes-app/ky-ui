# Shared UI rollout

## Required scope

Nine products **and ky-server-base** ship the same versioned browser foundation.
`consumers.json` is the repository/asset-path inventory. Each repository gets its
own worktree and PR. The base is required so new servers inherit the foundation.

| Consumer | Product-owned surface to preserve |
| --- | --- |
| KyMark | Bookmark folders, search, import/export and encrypted vault |
| KyDNS | Horizontal navigation, DNS tables and operational status |
| KyRecovery | Capsules, ceremony, replication and warning/error states |
| KyIdentity | Applications, security, directory and administration |
| KyVault | Vault groups, entries, unlock and recovery |
| KyNotes | List/editor workspace and encrypted local queue |
| KyPost | Mail folders, reader, compose and administration |
| KyYard | Containers/endpoints, deployment controls and scoped administration |
| KyForge | ITSM work items, queues, approvals, directory and recovery |
| ky-server-base | Scaffold shell and inherited future product defaults |

## Implementation

1. **One palette source.** Version 0.2.0 owns Busnes CSS values. Consumer CSS maps
   semantic variables to shared tokens; palette swatches and stylesheet-free
   renderers use generated palette objects. Preserve named themes and saved keys.
2. **Effective selected navigation.** Mark actual navigation elements, retain
   current-page semantics, and share the quiet selected surface, accent rail,
   hover and focus states. Products keep geometry. Selection must not resize items.
3. **Safe release copies.** Preflight every checkout, support explicit worktree
   mappings, reject symlink destinations, record version plus file hashes, and
   verify consumer bytes in builds/CI. Local integrity does not establish latest
   upstream version: the central `--check` does that against the selected release.
4. **Repair earlier gaps.** Check KyRecovery's active light/dark aliases and
   contrast, remove KyYard's unused shell, keep KyMark controls reachable on small
   screens, rebuild KyNotes' embedded output and compare it with source in CI.
5. **Theme adapters.** Share restricted-storage-safe read/write and event helpers;
   preserve product choice validation and special semantic aliases. Test OS
   following, explicit and legacy choices, cross-tab changes, unavailable storage,
   first paint and named-to-Busnes switching.
6. **Rendered evidence.** Each consumer PR includes screenshots and the exact
   capture conditions. Exercise desktop/mobile, light/dark, selected/focus states
   and representative operational or honest empty/loading/error surfaces. Verify
   disabled states and stable mobile item dimensions. Do not describe
   fixture-backed captures as live integration tests.

## Merge gates

- Shared tests, consumer tests/builds and vendor checks pass.
- Served assets correspond to the changed sources; embedded bundles are rebuilt.
- Screenshots are reviewed for navigation, readable status and reachable controls.
- Existing theme choices are preserved. Name any broken theme or unrelated browser
  issue explicitly in the evidence instead of silently counting it as verified.
- Each PR passes CI and clears review at its current head. Merging is a human action.

This implementation carries forward the merged planning PR #2, with ky-server-base
required and KyForge scoped to its actual ITSM surfaces. PR creation is not
proof that the visual, CI or review gates have passed; record evidence in each PR.

## Post-rollout regression automation

- Shared primitive browser tests run in ky-ui CI at 390px/1280px in light/dark Chromium: layout, navigation focus/selection/disabled states, dialogs, theme transitions, cross-tab updates and denied storage. This is a contract fixture, not coverage of every product layout.
- ky-server-base and KyForge run real-server browser checks, including CSP-safe worker activation, mobile Settings, pairing keyboard behavior, authentication errors and populated UI. Each has its own worktree and PR; publishing depends on the browser job.
- Suite freshness runs daily, on default-branch pushes and manually. The central job checks nine public consumers without Git credentials; private KyForge checks public ky-ui main from its own repository using the check-only consumer selector. Both workflows must be green to cover all ten; existing vendor checks remain local-integrity gates. Merge ky-ui #4 before KyForge #34 so the upstream selector exists when Forge's workflow starts.
- Other products retain their current tests and rendered rollout evidence. Product-specific E2E flows, live KyVault SSO and complete accessibility audits are not claimed by these checks.
