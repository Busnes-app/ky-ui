# Suite rollout review

All changes are in separate PRs built from isolated worktrees. None are merged or deployed by this rollout.

| Repository | Pull request |
| --- | --- |
| ky-ui | [PR #3](https://github.com/Busnes-app/ky-ui/pull/3) |
| KyMark-server | [PR #44](https://github.com/Busnes-app/KyMark-server/pull/44) |
| KyDNS-server | [PR #40](https://github.com/Busnes-app/KyDNS-server/pull/40) |
| KyRecovery-server | [PR #30](https://github.com/Busnes-app/KyRecovery-server/pull/30) |
| KyIdentity-server | [PR #64](https://github.com/Busnes-app/KyIdentity-server/pull/64) |
| KyVault-server | [PR #58](https://github.com/Busnes-app/KyVault-server/pull/58) |
| KyNotes-server | [PR #27](https://github.com/Busnes-app/KyNotes-server/pull/27) |
| KyPost-Server | [PR #228](https://github.com/Busnes-app/KyPost-Server/pull/228) |
| KyYard-server | [PR #74](https://github.com/Busnes-app/KyYard-server/pull/74) |
| KyForge-Server | [PR #33](https://github.com/Busnes-app/KyForge-Server/pull/33) |
| ky-server-base | [PR #39](https://github.com/Busnes-app/ky-server-base/pull/39) |

Review ky-ui first, then consumer PRs. Consumers vendor the exact 0.2.0 bytes and do not require runtime network access to ky-ui. The planning-only ky-ui #2 is superseded by #3.

## Evidence

Each consumer includes UI-VERIFICATION.md and four actual application captures: light/dark at 1280×900 and 390×844 CSS pixels. Product layouts remain distinct. Browser checks found and fixed clipped KyMark actions, overflowing KyForge queues, KyNotes Lock/Save controls and KyPost search. KyRecovery's inverted background/text aliases and stylesheet ordering are corrected.

Local verification passed: 8 shared tests; all ten consumer hash/freshness checks; all eight React production builds; Identity 162, Vault 83, Notes 26, Post 912, Yard 227, Forge 6 and base 7 frontend tests. Mark has no frontend test script. DNS web tests, Recovery server/active-palette contrast tests, and Notes embedded-asset tests/comparison passed. One concurrent Yard test run flaked; an isolated full rerun passed.

Base's five named palettes were also checked in the browser and remained distinct after selection/persistence. Keyboard navigation showed a visible focus outline in base and Post. This is not an exhaustive accessibility or named-theme/page matrix audit.

## Limits and remaining review

- KyVault captures use the actual React UI with explicitly labeled read-only browser fixtures. No live KyIdentity SSO or vault unlock was exercised; backend authentication was not changed.
- Preview data is synthetic/empty. Post has no connected mail or Ollama service; Yard had no deployment/container mutations. Production integration flows are not certified by these captures.
- Base and Forge have a pre-existing inline service-worker registration blocked by CSP. CSP remains unchanged; treat that as a separate repair.
- Hosted CI and current-head review are separate merge gates. Consult the linked PR checks before merging; PR creation is not a green-review claim.
- Generated embedded assets were rebuilt, replacing obsolete hashed chunks (recoverable in Git). Scratch servers, databases and credentials are excluded from every PR. Original dirty checkouts were left untouched.

DOX closeout: nearest owning AGENTS.md files document generated-file ownership and verification. Ancestor instructions were left unchanged because repository ownership and parent-level structure did not change.
