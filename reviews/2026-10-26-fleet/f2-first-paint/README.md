# F2 first-paint fix: evidence (2026-10-26)

Implementer evidence for fleet review finding F2 (`../runtime-source-review.md`).
KyDNS and KyRecovery lost their saved-theme-before-paint guarantee when their
theme scripts became deferred modules. The fix uses ky-ui 0.4.1's generated
classic `themes-browser.js` and product `theme.js` as synchronous `<head>` scripts.
This record is the implementer's and claims no review verdict. `f2-response.json`
holds the machine-readable result: commits, PRs, checks and per-consumer sync state.

## Files

- `first-paint.mjs`: appendix A harness, adapted. It also delays `themes-browser.js`,
  takes `DELAY` (ms) and `NOSHOT=1`, adds fix cases and takes a screenshot about
  300 ms after commit. It serves committed bytes on an ephemeral loopback port.
- `results-timing-d800.jsonl` and `results-timing-d0.jsonl`: timing runs with no
  screenshots. These are the measurements of record.
- `results-d800.jsonl` and `screenshots/`: the same cases with first-frame screenshots.
  The screenshot can itself trigger an observed mutation (Recovery head `applied`
  317 ms), so use these for pictures, not timing.
- `ceremony-check.mjs` and `results-ceremony.jsonl`: the KyRecovery ceremony page
  under its real CSP, head control `2738beb` against fix `71affc9`.

Conditions: Linux 7.2.10-1-cachyos, Node 24.22.0, Playwright 1.63.0 headless Chromium
from this worktree. No product server, account or personal data was used.

## Result (800 ms script delay)

| Product | Revision | Saved / OS | FCP ms | Theme applied ms | Painted before saved theme |
|---|---|---|---|---|---|
| KyDNS | base `e301d07` | Ocean / light | 876 | 855 | no |
| KyDNS | head `28bf59e` | Ocean / light | 64 | 840 | **yes** |
| KyDNS | fix `0949de5` | Ocean / light | 864 | 839 | no |
| KyDNS | head `28bf59e` | Busnes Light / dark | 68 | 836 | **yes** |
| KyDNS | fix `0949de5` | Busnes Light / dark | 860 | 834 | no |
| KyDNS | fix | Cliffs (legacy) / dark; none / dark | 876; 864 | 839; 839 | no; no |
| KyRecovery | base `b60e571` | light / dark | 908 | 836 | no |
| KyRecovery | head `2738beb` | light / dark; ocean / light | 116; 84 | 854; 850 | **yes; yes** |
| KyRecovery | fix `71affc9` | light / dark; ocean / light | 916; 896 | 855; 852 | no; no |
| KyRecovery | fix | dark / light; sky / dark; none / light | 904; 904; 916 | 851; 850; 852 | no |

With no delay, none of the 16 runs flashes. Final colours equal the saved palette in
every row. The stored value is never rewritten.

## Known limits

- Chromium only. Other engines block parsing on classic head scripts by specification,
  but that is unmeasured here.
- Under the artificial 800 ms delay, the fixed first frame uses the fallback font
  until Space Grotesk loads. The pre-Appearance base revisions behave the same way.
- The harness has no `/favicon.*` routes, so every Recovery run logs 1–2 favicon 404s.
