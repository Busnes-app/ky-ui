# Contributing to ky-ui

ky-ui is the small shared browser foundation for the Ky servers: Busnes Light/Dark design tokens, OS-aware theme selection, and the selected-navigation treatment. Contributions must stay small and framework-light and keep the tokens and theme behavior consistent across every product that embeds it.

## Before contributing

Read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) and [SECURITY.md](SECURITY.md),
the [README](README.md), and any AGENTS.md in the subtree you are about to
touch. Open an issue before proposing a feature larger than a bug fix or
documentation change.

Keep changes small, reuse existing code, and fix the shared root cause rather
than the reported symptom. New non-trivial logic ships with a runnable test or
self-check.

## Security requirements

- This is shared front-end code loaded by many products; a defect ships everywhere. Keep it minimal and avoid dependencies that parse untrusted input.
- Do not introduce inline-script or eval patterns, or anything that would force a product to weaken its Content Security Policy.
- Preserve existing named themes and saved user choices.
- Do not add telemetry, phone-home, analytics, or unconfigured third-party
  services.
- Do not add silent security fallbacks; fail closed with a readable error and a
  remediation step.
- Name and document any security trade-off in [SECURITY.md](SECURITY.md) before
  it merges.

## Verification

Run the checks that apply to the files you changed, and the repository's
full required checks before hand-off. Record the exact commands and their
results in the pull request.

## AI attribution

AI-assisted contributions are welcome; undisclosed ones are not. Disclose
material AI assistance in the pull request — the tool, what it changed, and what
you personally ran, read, and verified — and add a commit trailer naming any
tool that materially contributed. You are the author of the code you submit for
every purpose, regardless of how it was produced.

## Pull requests

Branch off `main` with a focused name, and use a Conventional Commit subject
(`fix:`, `feat:`, `docs:`, `refactor:`, `test:`, or `chore:`). The pull request
explains why the change exists, the verification performed, the security impact,
and any known limitations.

Every pull request gets an adversarial review pass; see
[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md#hostile-reviews-are-about-code-never-people)
for what that is and the boundary it keeps.

## Licence

ky-ui is licensed under the MIT License. See [LICENSE.txt](LICENSE.txt).

The repository follows the [REUSE](https://reuse.software/) specification: `REUSE.toml`
names the license and copyright of every file, and `LICENSES/` holds the license text.
Review screenshots show Ky products only; never commit third-party product screenshots
or owner reference images here. Copied third-party material would need its own
`REUSE.toml` entry with its original license. CI runs `reuse lint`.

