# Security Policy

ky-ui is shared browser code (theme tokens, theme selection, navigation styling) embedded by the suite's web products. Its security relevance is that it runs inside every product's page, so its defects are their defects.

## Reporting vulnerabilities

Report security vulnerabilities privately through GitHub Security Advisories:
<https://github.com/Yoshiofthewire/ky-ui/security/advisories>. Do not open a public issue.
Include the affected area, reproduction steps, impact, and affected versions.
We aim to acknowledge reports within two business days and will coordinate a fix
and disclosure.

## Trust boundaries and limitations

- Because many products load ky-ui, a vulnerability or heavy dependency here affects all of them. Prefer the platform and the standard library; justify every new dependency.
- Nothing in ky-ui should require a product to allow `unsafe-inline` or `unsafe-eval`, or otherwise relax its CSP.
- ky-ui handles presentation only; it must not read, store, or transmit user data or credentials.

## Handling requirements

- Keep theme state in the browser; follow the OS until a browser-local choice is saved, and never phone home.
- Ship no network calls and no third-party asset loads from the shared foundation.

## Security-sensitive changes

Changes that touch injected markup or styles, add a dependency, or affect what a product must allow in its CSP require tests for both the expected path and the relevant
failure or attack path, plus a description of the trust boundary in the pull
request.

## Related documents

- [CONTRIBUTING.md](CONTRIBUTING.md) — contribution and review requirements
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) — community expectations
- [README.md](README.md) — what this project is and how to run it

