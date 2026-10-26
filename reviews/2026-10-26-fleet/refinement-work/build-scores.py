"""Build refinement-scores.json, refinement-cohorts.json and refinement-visual-coverage.json.

Run from the council root: python3 -I refinement-work/build-scores.py
Reads only refinement-review-inputs.json, the images it lists and score-spec.py.
"""
import hashlib, json, runpy, statistics
from collections import defaultdict
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

import numpy as np
from PIL import Image

spec = runpy.run_path(str(Path(__file__).with_name("score-spec.py")))
G, Q, K = spec["G"], spec["Q"], spec["K"]
W = {"hierarchy": 0.20, "typography": 0.15, "density_layout": 0.20, "color": 0.15, "visible_affordances": 0.15, "coherence": 0.15}
r1 = lambda x: float(Decimal(str(x)).quantize(Decimal("0.1"), ROUND_HALF_UP))
inputs = json.load(open("refinement-review-inputs.json"))
rows_in = inputs["files"]

def theme_of(r):
    t = r["theme"].lower()
    scheme = "dark" if "dark" in t else "light"
    for named in ("sky", "forest"):
        if f"saved choice {named}" in t:
            return f"{named} (saved; OS {scheme})", False
    return scheme, scheme == "dark"

def vp_of(r):
    vp = "desktop" if r["viewport"].startswith("1280") else "mobile"
    fp = r["full_page"] in (True, "source conditions say full page")
    shot = "full-page" if fp and r["height"] != int(r["viewport"].split("x")[1]) else "viewport-height"
    return vp, f"{vp} {r['viewport']} css, captured {r["width"]}x{r["height"]} ({shot}); {r["driver"]}"

# Hash check and exact-duplicate map (first by name wins).
by_hash = defaultdict(list)
for r in rows_in:
    h = hashlib.sha256(open(r["file"], "rb").read()).hexdigest()
    assert h == r["sha256"], r["file"]
    by_hash[h].append(r["file"])
canon = {h: sorted(fs)[0] for h, fs in by_hash.items()}

out, by_file, task_view = [], {}, {}
for r in sorted(rows_in, key=lambda r: r["file"]):
    vp, vp_text = vp_of(r)
    theme, is_os_dark = theme_of(r)
    s = G[(r["product"], r["surface"], r["phase"], vp)]
    scores = dict(zip(Q, s["q"]))
    obs = dict(zip(Q, s["obs"]))
    if is_os_dark:
        for dim, (val, note) in s["dark"].items():
            scores[dim], obs[dim] = val, note
    ks, kobs = dict(zip(K, s["k"])), dict(zip(K, s["kobs"]))
    row = {
        "file": r["file"], "sha256": r["sha256"],
        "observed_product": r["product"].replace("-server", "").replace("ky-server-base", "Ky Server Base (Busnes.app)"),
        "observed_surface": r["surface"], "cohort": s["cohort"], "state": s["state"], "theme": theme,
        "viewport": vp_text, "artifacts": "; ".join(s["art"]) or "none", "filename_matches_content": s["fmc"],
        "confidence": s["conf"], "caveat": s["cav"] + (" Filename says users-manage; image is the Users table with inline icon actions (no Manage menu exists in this build)." if not s["fmc"] else ""),
        "scores": scores, "observations": obs,
        "ky_fit": {"scores": ks, "observations": kobs, "total": r1(statistics.fmean(ks.values()))},
        "duplicate_of": None, "total": r1(sum(Decimal(str(W[d])) * scores[d] for d in Q)),
        "phase": r["phase"], "paired_file": r["paired_file"], "product": r["product"], "stage": r["stage"],
    }
    task_view[r["file"]] = s["task_view"]
    c = canon[r["sha256"]]
    if c != r["file"]:
        row["duplicate_of"] = c
    out.append(row)
    by_file[r["file"]] = row

# Followers inherit the canonical scores verbatim.
for row in out:
    if row["duplicate_of"]:
        src = by_file[row["duplicate_of"]]
        for key in ("scores", "observations", "ky_fit", "total"):
            row[key] = json.loads(json.dumps(src[key]))

# Field order of release-scores.json, then the four comparison fields.
ORDER = ["file", "observed_product", "observed_surface", "cohort", "state", "theme", "viewport", "artifacts",
         "filename_matches_content", "confidence", "caveat", "scores", "observations", "ky_fit", "sha256",
         "duplicate_of", "total", "phase", "paired_file", "product", "stage"]
out = [{k: row[k] for k in ORDER} for row in out]
assert all(len(r) == len(ORDER) for r in out)
by_file = {r["file"]: r for r in out}

# Global near-duplicate scan among unique files of equal size.
uniq = [row for row in out if not row["duplicate_of"]]
arrays = {row["file"]: np.asarray(Image.open(row["file"]).convert("RGB"), dtype=np.int16) for row in uniq}
near = []
files = sorted(arrays)
for i, a in enumerate(files):
    for b in files[i + 1:]:
        A, B = arrays[a], arrays[b]
        if A.shape != B.shape:
            continue
        d = np.abs(A - B).max(axis=2)
        frac = float((d > 0).mean())
        if frac < 0.01:
            near.append({"a": a, "b": b, "changed_px_fraction": round(frac, 6), "max_channel_delta": int(d.max()),
                         "near_duplicate_per_rubric": frac < 0.001 and int(d.max()) <= 8})

doc = {
    "rubric_version": "ky-suite-v2",
    "reviewer_model": "claude-opus-5-5",
    "reviewed_at": "2026-10-26",
    "reviewer": "Claude Opus 5.5, independent refinement screenshot reviewer (scores fixed blind to release-scores.json)",
    "weights": W,
    "rounding": "total = sum(Decimal(weight)*score) in exact decimal, then Decimal(str(x)).quantize(Decimal('0.1'), ROUND_HALF_UP); ky_fit.total = mean of five ky_fit scores, same rounding; N/A excluded from means (none used)",
    "input_set": {"file": "refinement-review-inputs.json",
                  "sha256": hashlib.sha256(open("refinement-review-inputs.json", "rb").read()).hexdigest(),
                  "rows": len(out), "before": sum(r["phase"] == "before" for r in out), "after": sum(r["phase"] == "after" for r in out),
                  "unique_sha256": len(uniq), "inventory": "refinement-captures.json (216; 64 intermediate stages not selected as rating inputs)"},
    "duplicate_checks": {"exact": [{"canonical": canon[h], "followers": sorted(f for f in fs if f != canon[h])} for h, fs in by_hash.items() if len(fs) > 1],
                         "near_scan_unique_same_size_lt_1pct": near,
                         "method": "sha256 for exact; per-pixel max channel delta for near (rubric: <0.1% pixels and delta<=8)"},
    "files": out,
}
json.dump(doc, open("refinement-scores.json", "w"), indent=1, ensure_ascii=False)

# Cohort summaries: per phase, per cohort/task_view, deduplicated within phase only.
def summarise(rows):
    seen, q, k = set(), [], []
    for r in rows:
        if r["sha256"] in seen:
            continue
        seen.add(r["sha256"])
        q.append(r["total"]); k.append(r["ky_fit"]["total"])
    return {"n": len(q), "quality_mean": r1(statistics.fmean(q)), "quality_min": min(q), "quality_max": max(q),
            "ky_fit_mean": r1(statistics.fmean(k)), "ky_fit_min": min(k), "ky_fit_max": max(k)}

groups = defaultdict(list)
for r in out:
    groups[(r["cohort"], task_view[r["file"]], r["product"], r["phase"])].append(r)
cohort_rows = []
for (cohort, tv, prod, ph), rows in sorted(groups.items()):
    cohort_rows.append({"cohort": cohort, "task_view": tv, "product": prod, "phase": ph, **summarise(rows)})
by_cohort_phase = defaultdict(list)
for r in out:
    by_cohort_phase[(r["cohort"], task_view[r["file"]], r["phase"])].append(r)
cohort_totals = [{"cohort": c, "task_view": tv, "phase": ph, "products": sorted({r["product"] for r in rows}), **summarise(rows)}
                 for (c, tv, ph), rows in sorted(by_cohort_phase.items())]
by_prod_phase = defaultdict(list)
for r in out:
    by_prod_phase[(r["product"], r["phase"])].append(r)
product_coverage = [{"product": p, "phase": ph, "label": "coverage summary across task views — not a ranking", **summarise(rows)}
                    for (p, ph), rows in sorted(by_prod_phase.items())]
pairs = []
for r in out:
    if r["phase"] != "before":
        continue
    a = by_file[r["paired_file"]]
    pairs.append({"product": r["product"], "surface": r["observed_surface"], "task_view": task_view[r["file"]], "cohort": r["cohort"],
                  "viewport": r["viewport"].split(" ")[0], "theme": r["theme"], "before": r["file"], "after": a["file"],
                  "byte_identical": r["sha256"] == a["sha256"],
                  "quality_before": r["total"], "quality_after": a["total"], "quality_delta": r1(a["total"] - r["total"]),
                  "ky_fit_before": r["ky_fit"]["total"], "ky_fit_after": a["ky_fit"]["total"], "ky_fit_delta": r1(a["ky_fit"]["total"] - r["ky_fit"]["total"]),
                  "dimension_deltas": {d: a["scores"][d] - r["scores"][d] for d in Q},
                  "matched": True})
after_unique = [r for r in out if r["phase"] == "after"]
cohorts_doc = {
    "rubric_version": "ky-suite-v2", "reviewer_model": "claude-opus-5-5", "source": "refinement-scores.json",
    "dedupe_rule": "means use unique sha256 within each phase; DNS desktop appearance after is byte-identical to before and is counted in both phases as evidence of an unchanged surface",
    "warning": "Products differ in fixture, browser (Chromium 153 vs 156) and full-page vs viewport capture; compare matched pairs within a product, never rank unlike task views.",
    "cohort_product_phase": cohort_rows, "cohort_phase": cohort_totals, "product_phase_coverage": product_coverage,
    "matched_pairs": pairs, "task_view_by_file": task_view,
    "post_drift_revisions": spec["REVISIONS"],
    "after_ranges": {"quality": [min(r["total"] for r in after_unique), max(r["total"] for r in after_unique)],
                     "ky_fit": [min(r["ky_fit"]["total"] for r in after_unique), max(r["ky_fit"]["total"] for r in after_unique)]},
    "before_ranges": {"quality": [min(r["total"] for r in out if r["phase"] == "before"), max(r["total"] for r in out if r["phase"] == "before")],
                      "ky_fit": [min(r["ky_fit"]["total"] for r in out if r["phase"] == "before"), max(r["ky_fit"]["total"] for r in out if r["phase"] == "before")]},
    "any_after_file_quality_ge_9": any(r["total"] >= 9 for r in after_unique),
    "any_after_file_ky_fit_ge_9": any(r["ky_fit"]["total"] >= 9 for r in after_unique),
    "any_after_cohort_quality_ge_9": any(c["quality_mean"] >= 9 for c in cohort_totals if c["phase"] == "after"),
    "any_after_cohort_ky_fit_ge_9": any(c["ky_fit_mean"] >= 9 for c in cohort_totals if c["phase"] == "after"),
}
json.dump(cohorts_doc, open("refinement-cohorts.json", "w"), indent=1, ensure_ascii=False)

caps = json.load(open("refinement-captures.json"))
sel = {r["file"] for r in out}
coverage = {
    "selected_rows": len(out), "unique_viewed_full_resolution": len(uniq),
    "viewing_method": "each unique image opened individually with the image Read tool at native size (390x2003 shown at 389x2000)",
    "captures_inventory": len(caps), "not_selected": sorted(c["file"] for c in caps if c["file"] not in sel),
    "not_selected_reason": "intermediate/failed stages retained by the implementer; not final rating inputs per brief",
    "per_file_matches_inventory": sorted(sel) == sorted(r["file"] for r in rows_in),
}
json.dump(coverage, open("refinement-visual-coverage.json", "w"), indent=1)

# Console summary for the review document.
print("rows", len(out), "unique", len(uniq), "near pairs", len(near))
print("ranges", json.dumps({"before": cohorts_doc["before_ranges"], "after": cohorts_doc["after_ranges"]}))
for c in cohort_totals:
    print(f"{c['cohort']:14} {c['task_view']:18} {c['phase']:6} n={c['n']:2} Q={c['quality_mean']} [{c['quality_min']}-{c['quality_max']}] K={c['ky_fit_mean']} [{c['ky_fit_min']}-{c['ky_fit_max']}] {','.join(p.replace('-server','') for p in c['products'])}")
for p in product_coverage:
    print(f"{p['product']:18} {p['phase']:6} n={p['n']:2} Q={p['quality_mean']} K={p['ky_fit_mean']}")
for k in ("any_after_file_quality_ge_9", "any_after_file_ky_fit_ge_9", "any_after_cohort_quality_ge_9", "any_after_cohort_ky_fit_ge_9"):
    print(k, cohorts_doc[k])
