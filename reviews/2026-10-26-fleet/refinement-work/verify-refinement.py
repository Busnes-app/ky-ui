"""Recompute every total from refinement-scores.json and check inventory, hashes and schema."""
import hashlib, json, statistics
from decimal import Decimal, ROUND_HALF_UP

r1 = lambda x: Decimal(str(x)).quantize(Decimal("0.1"), ROUND_HALF_UP)
d = json.load(open("refinement-scores.json"))
inp = json.load(open("refinement-review-inputs.json"))["files"]
base_keys = list(json.load(open("release-scores.json"))["files"][0].keys())
errors = []
assert list(d.keys()) == ["rubric_version", "reviewer_model", "reviewed_at", "reviewer", "weights", "rounding", "input_set", "duplicate_checks", "files"]
assert sorted(f["file"] for f in d["files"]) == sorted(f["file"] for f in inp), "per-file list != inputs"
for f in d["files"]:
    if set(f) != set(base_keys) | {"phase", "paired_file", "product", "stage"}:
        errors.append(("schema", f["file"], sorted(set(f) ^ (set(base_keys) | {"phase", "paired_file", "product", "stage"}))))
    if hashlib.sha256(open(f["file"], "rb").read()).hexdigest() != f["sha256"]:
        errors.append(("hash", f["file"]))
    q = r1(sum(Decimal(str(d["weights"][k])) * f["scores"][k] for k in d["weights"]))
    if float(q) != f["total"]:
        errors.append(("total", f["file"], float(q), f["total"]))
    k = r1(statistics.fmean(f["ky_fit"]["scores"].values()))
    if float(k) != f["ky_fit"]["total"]:
        errors.append(("ky_fit", f["file"], float(k), f["ky_fit"]["total"]))
    if any(not isinstance(v, int) or not 0 <= v <= 10 for v in [*f["scores"].values(), *f["ky_fit"]["scores"].values()]):
        errors.append(("range", f["file"]))
    if len(f["observations"]) != 6 or len(f["ky_fit"]["observations"]) != 5:
        errors.append(("obs", f["file"]))
print("rows", len(d["files"]), "unique", len({f["sha256"] for f in d["files"]}), "followers", sum(bool(f["duplicate_of"]) for f in d["files"]))
print("errors", errors or "none")
