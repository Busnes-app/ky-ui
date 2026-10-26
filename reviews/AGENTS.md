# UI review evidence

## Purpose

Keep competitive screenshot reviews and staged implementation evidence reproducible.

## Ownership

- Dated council directories own source inventories, independent assessments, rubric versions, scores, decisions and implementation evidence.
- Original user screenshots remain at their supplied location; avoid committing personal mail, contacts or account details.

## Local Contracts

- Identify each screen from its visible content; filenames can be wrong. Distinguish the KyMessages operator console from Element chat.
- Rank comparable surfaces separately. Missing evidence is unscored, not zero.
- Record reviewer/model, input hashes, scoring weights and arithmetic. Re-scoring unchanged screenshots measures a rubric change, not a product improvement.
- Label scratch application captures, synthetic fixtures and proposals accurately. Preserve before/after screenshots for every redesign stage, with viewport, theme, source revision and capture conditions.
- Claim 9/10 only from reviewed implementation evidence and separately verified interaction/accessibility gates.

## Work Guidance

- Link actionable findings to product source and to the reusable skill in `../skills/`.
- Keep private originals outside the repository. Use synthetic data for implementation captures.
- Fleet collectors verify source-manifest hashes before copying captures; final-image duplicate checks and score verifiers precede spreadsheet/gallery generation. Local worktree maps stay uncommitted.
- Dated council exports use their local `export-*.py` scripts. Keep review rounds distinct in workbook scores and gates; retain their source JSON alongside generated artifacts.
- Correct provenance in a new inventory version. Dirty-worktree captures identify the rendered bundle hash as well as the checkout revision and source diff.
- Capture and runtime-review drivers are immutable archival text (`.mjs.txt`, `.sh.txt`), with original paths and checksums in their dated archive manifest. They require the recorded product harness and are not runnable shared-package tools.
- When a security correction supersedes an archived driver, retain its bytes and direct reproduction instructions to the corrected version.

## Verification

- Compare the complete source image inventory against per-file scores and recompute weighted totals before publishing a ranking.
- Run the affected product's required checks for implementation evidence; record failures and untested states.

## Child DOX Index

None.
