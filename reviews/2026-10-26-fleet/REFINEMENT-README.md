# Seven-product refinement and review follow-ups

The 9/10 target is not achieved. Claude Opus 5.5 scored the implemented refinement
screens at 6.1–8.0 for quality and 6.8–8.0 for Ky fit. No new competitor comparison
or whole-product acceptance is claimed. The original baseline records and exports
remain unchanged.

## Read the results

- `Ky-Web-Refinement-2026-10-26.xlsx`: 152 score rows, 76 matched pairs, 152 embedded
  before/after pictures, capture provenance, checks, PRs and separate review rounds.
- `refinement-gallery.html`: offline gallery with the 76 scored pairs and all
  follow-up stages. Its images are embedded; no network or library is required.
- `refinement-review.md` / `refinement-scores.json`: independent visual findings,
  rubric, per-dimension evidence, arithmetic, duplicates and scoring drift.
- `refinement-runtime-review.md` / `.json`: independent source/runtime review.
- `followup-runtime-review.md` / `.json`: fresh independent confirmation of R1–R3.
- `followup-review-responses.json`: correction of E1 and disposition of optional nits.

The scored round covers Identity, Notes, Recovery, DNS, Pulse, Drive and the server
template. Its 216 staged captures include 152 selected inputs (146 exact-unique
images); 64 intermediate captures are not rated. The 108 follow-up captures are
separate evidence with numerical scores N/A. Post, Calendar, Messages and Yard
retain their earlier evidence; these seven products are not a comparable ranking
of all shipped interfaces.

Before/after capture conditions match within each product. Browser versions,
tasks, and full-page versus viewport capture modes differ across products.
Identity's earlier missing fonts were a fixture error: both new before/after
sets load the fonts. Notes Appearance after retains Save/toast state absent before;
that negative delta is confounded and is not a proven product regression.

## Fixes and limits

R1 (Identity's empty delegate Manage menu) and R2 (Pulse Backup badge alignment)
were independently reproduced before and verified fixed afterward. R3 resolves
the disclosure gap for Notes' older secondary controls; it does not add danger
styling or claim all 13 controls were captured. N1's DOM-versus-AX documentation
is corrected. The original seven implementation PRs and Pulse #51 were merged
by the owner; the PR sheets record their observation time and exact heads.

Remaining limits include native disclosure dismissal, duplicate phone table labels,
partly visible focused navigation items, short-page DNS shell height, original
palette contrast gaps, destructive neutral outlines, uncaptured Notes states,
and unavailable Safari coverage. The follow-up reviewer viewed 8 supplemental
images at full resolution; the other 100 were checked by hashes and facts.
These supplemental captures are not a new complete visual scoring round.

`followup-captures.json` is the original reviewed inventory. Version 2 adds E1's
dirty-checkout and rendered-bundle caveats without changing any picture/hash.
The intermediate Identity bundle is `a01f5e4c2421…`; the final committed bundle
is `7ff014818e3f…`. Before Notes was served from git-archived `e1b726b`, rather
than the capture checkout's revision. Locked-session screenshots are modelled;
unreachable device-link/reset/error states remain explicit N/A.

## Reproduce the exports

Use Python with openpyxl and Pillow, from this directory:

```sh
python refinement-work/verify-refinement.py
python export-refinement.py --output-dir .
```

The exporter verifies source image hashes, reopens the workbook, checks row and
embedded-image counts, and rejects formulas. CSVs go to `refinement-csvs/`, leaving
the baseline CSVs intact. Without `--output-dir`, a portable bundle is generated
in `refinement-delivery/` instead.

`collect-refinement.py` and `collect-followups.py` require the original recorded
product worktrees; generated inventories and archived manifests are included for
read-only verification when those worktrees are unavailable.

Capture and runtime harnesses are archived text, not executable shared-package
code. `refinement-harness-archives.json` records original names and SHA-256.
Restore original filenames and the recorded disposable product fixture before
running them. Product READMEs are verbatim archives and describe that original
environment. Scoring scripts remain Python and require no product server.
