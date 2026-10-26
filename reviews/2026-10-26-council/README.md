# Ky UI council — 2026-10-26

Open `Ky-UI-Council-2026-10-26.xlsx` for the spreadsheet: comparable original
ratings, per-dimension evidence, implementation rounds, behavior gates, stage
screenshots, verification and PR links. `council.html` is the offline screenshot
gallery; the spreadsheet is the primary result.

## Read the evidence

- Initial and improved-rubric ratings describe the same 40 supplied images
  (39 unique). Their score difference measures methodology, not a redesign gain.
- `review-rounds.json` identifies historical and current implementation rounds.
  Scores describe the captured revision; a file called “final” can be superseded
  by a subsequent corrective stage. Missing evidence is untested or N/A.
- Ky fit is separate from brand-neutral visual quality. A within-product
  summary is not a provider ranking or a certification of the whole product.
- Original screenshots remain outside Git. Only new synthetic application
  captures and explicitly labeled shared primitive fixtures are embedded here.
- `screenshots/` holds stage manifests and before/after PNGs. `source-stages/`
  holds source patches and hashes; archived capture scripts end in `.mjs.txt`.
- Product implementation notes and `verification.md` distinguish executed
  checks, capture conditions and limitations. CI and autonomous PR review are
  separate current-head gates; consult the live PR before merging.

## Rebuild exports

Use Python with `openpyxl==3.1.5` and Pillow installed in a tool environment,
not an application dependency. From this directory:

```sh
python export-workbook.py
python export-gallery.py
```

The workbook exporter verifies original totals with decimal half-up rounding,
reopens the saved XLSX and checks row counts and exact score values. It also
exports CSVs. Keep the `screenshots` folder beside the XLSX for full-image links;
the workbook embeds selected examples and the HTML gallery embeds its images.

The 9/10 target requires current visual evidence and passing behavior gates.
The report records the measured result, including incomplete or failing gates.
