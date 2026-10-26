# Skill author notes: `ky-suite-ui`

Author: Claude Opus 5.5 (`claude-opus-5-5`), design sub-agent, 2026-10-26. This round wrote the
skill only. It changed no product code, scored no files and re-ranked nothing.

## Files

- `ky-ui/skills/ky-suite-ui/SKILL.md`: the entrypoint, with the Rate, Redesign and Accept modes.
- `ky-ui/skills/ky-suite-ui/references/rubric.md`: rubric `ky-suite-v2`.
- `ky-ui/skills/ky-suite-ui/references/design-contract.md`: the portable suite contract.

## Inputs read

- **Contracts.** Root, `ky-ui`, `ky-ui/skills` and `ky-ui/reviews` `AGENTS.md`.
- **Authoring guidance.** skill-creator and writing-for-agents (with `SKILL-MECHANICS.md`).
- **impeccable.** `SKILL.md` and `reference/operate.md`, read only and not modified.
- **This council.** `initial-review.md`, `initial-scores.json` (structure and rubric) and
  `source-evidence.md`.
- **Tokens.** `ky-ui/src/tokens.css` and `navigation.css` at 947bf96. `src/` is unchanged on
  `origin/main`.
- **Read-only snapshot.** `/tmp/council-b.Mwkf`, for the font and theme facts.

## Decisions

- **Weights carried over.** The quality weights are the initial ones, so drift between the
  rounds comes from the anchors, the state and theme rules, and the cohort splits, not from
  reweighting.
- **Brand fit kept separate.** `ky_fit` is scored on Ky screens only and never enters
  `total`. This keeps competitor quality from being judged by how much a competitor
  resembles Busnes.
- **Cohorts.**
  - Calendar is split into grid, list and editor; contacts into list and editor.
  - KyMessages gets the `admin-console`, `member-home` and `chat` cohorts.
  - Provider and cross-cohort means are no longer published as rankings.
  - A Ky gap is flagged when its comparison is unmatched in state, theme or viewport.
- **Blind re-rank, then drift.** Every file is scored before the prior scores are loaded.
  Each |delta| ≥ 0.5 needs a cause. Ky and competitor drift are reported separately, as a
  check against moving the rubric in Ky's favour.
- **Acceptance.** 9/10 needs implemented screens ≥ 9.0 in every shipped cohort, `ky_fit`
  ≥ 9.0 and five behavior gates. Each gate needs evidence, and an untested gate fails
  acceptance.
- **Section heading 17px/600.** This size was not in the brief. It sits between the 15px
  body and the 24px title, and the parent can change it.
- **Theme control in Settings.** The account region holds identity, role and sign-out.
  This follows the initial review's shell finding.

## Defects avoided

- **No palette copy.** The skill and its references contain no hex values. Every color
  role names a `--ky-*` token.
- **Field-border gap.** The 3:1 field-border rule could not be met with existing tokens.
  Measured from `tokens.css`, light `--ky-line-strong` is 2.28:1 on bg and 2.31:1 on panel,
  so the contract asks for an upstream `--ky-field-border` instead of a local override.
  Dark measures 3.61 and 3.49:1. Other measured pairs: light ink 5.73/6.19:1, accent
  4.93/5.33:1, button text on accent 5.33:1; dark button text on accent 6.47:1.
- **Duplicate threshold tested.** The rule (< 0.1% of pixels and max delta ≤ 8) was run
  read-only on all 40 originals, which have 40 distinct SHA-256 hashes. It matches only
  `KyPost-live-03` and `KyPost-live-Contacts-01` (1 px, delta 1). The look-alike pairs
  `tuta-01`/`tuta-03` (1.75% of pixels) and `tuta-02`/`tuta-04` (4.09%) are not
  duplicates.
- **Element stays stock.** The skill has no instruction to restyle or rewrite Element.
- **Bounded verification.** Each stage gets one inspect, fix and confirm round.

## Validation

- `skill-creator/scripts/quick_validate.py ky-ui/skills/ky-suite-ui` reports "Skill is valid!".
- The skill's behavior is still unproven. The next task tests it on all 40 unchanged
  originals.

## Open items for the parent

- `skills/AGENTS.md` already indexes `ky-suite-ui/`. Its DOX pass found no change needed,
  and `references/` is covered by "task-specific references".
- Possible ky-ui changes, none made:
  - Add the `--ky-field-border`, space, type, control-radius and font-stack tokens.
  - Add KyCalendar and KyMessages to `consumers.json`.
- `agents/openai.yaml` was not created, because the brief limited the skill to `SKILL.md`
  plus two references. Without it, Codex lists the skill from frontmatter only.

## Invocation

```text
Use $ky-suite-ui (Rate mode) on every PNG in ~/Pictures/KyPost-UI-Councel/.
Write round "rerank-2026-10-27" to ky-ui/reviews/2026-10-26-council/,
score blind, then report drift against initial-scores.json.
```
