# Contributing

[Overview](README.md) · [Assurance case](docs/ASSURANCE-CASE.md) · [Rollout plan](PLAN.md)

## How changes land

- Open a pull request against `main`. Every change goes through one; the branch ruleset
  requires the `test` and `browser` jobs of `.github/workflows/ci.yml` to pass.
- Report bugs and propose features in [GitHub issues](https://github.com/Busnes-app/ky-ui/issues).
  Report vulnerabilities privately, as the organisation's
  [security policy](https://github.com/Busnes-app/.github/blob/main/SECURITY.md) explains.
- A change to shipped files (`src/`) is a release: bump `version` in `package.json`, sync the
  consumer copies, and open one PR per consumer, as [README.md](README.md) and
  [AGENTS.md](AGENTS.md) describe. Update [PLAN.md](PLAN.md) when a rollout step changes.

## Tests

A change in behaviour comes with a test that fails without it: `test/` for theme logic and the
sync tool, `browser/` for anything a browser renders. Run what CI runs:

```bash
npm test
npm ci && npx playwright install chromium && npm run test:browser
```

Before merging consumer changes, also run
`npm run check:consumers -- --root=<suite worktree root>`.

## Coding standard

There is no adopted external style guide, and no linter or formatter runs in CI. The rules
below are this repository's own; the right-hand column says what, if anything, checks each.

| Rule | Checked by |
|---|---|
| JavaScript is ECMAScript modules (`"type": "module"`), so it always runs in strict mode | Node and the browser, on every `npm test` and `npm run test:browser` |
| Shipped files use no runtime dependencies and no build step; Playwright is a development dependency only | Review (`package.json` has no `dependencies`) |
| Shared selectors start with `ky-` or use `data-ky-*` / ARIA state | Review; the `browser` job exercises the shipped selectors |
| Integration code works under `script-src 'self'`: no inline script, no `unsafe-inline` | `browser/readme.spec.js` serves the README snippet under that policy |
| `src/theme.d.ts` matches `src/theme.js`'s exports | Review only |

Beyond that: keep to the naming, quoting and comment density of the file you are editing.
