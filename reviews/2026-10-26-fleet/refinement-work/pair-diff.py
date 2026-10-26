"""Pixel diff of each before/after pair in refinement-review-inputs.json (rubric near-duplicate test)."""
import json, sys
import numpy as np
from PIL import Image

rows = json.load(open("refinement-review-inputs.json"))["files"]
out = []
for r in rows:
    if r["phase"] != "before":
        continue
    a = np.asarray(Image.open(r["file"]).convert("RGB"), dtype=np.int16)
    b = np.asarray(Image.open(r["paired_file"]).convert("RGB"), dtype=np.int16)
    rec = {"before": r["file"], "after": r["paired_file"], "before_size": list(a.shape[1::-1]), "after_size": list(b.shape[1::-1])}
    h, w = min(a.shape[0], b.shape[0]), min(a.shape[1], b.shape[1])
    d = np.abs(a[:h, :w] - b[:h, :w]).max(axis=2)
    rec["top_aligned_changed_px_fraction"] = round(float((d > 0).mean()), 6)
    rec["top_aligned_max_channel_delta"] = int(d.max())
    rows_changed = np.where((d > 8).any(axis=1))[0]
    rec["first_changed_row"] = int(rows_changed[0]) if len(rows_changed) else None
    rec["same_size"] = a.shape == b.shape
    rec["near_duplicate"] = bool(a.shape == b.shape and (d > 0).mean() < 0.001 and d.max() <= 8)
    out.append(rec)
json.dump(out, open(sys.argv[1], "w"), indent=1)
for x in out:
    print(x["before"].split("/")[-1], x["before_size"], x["after_size"], x["top_aligned_changed_px_fraction"], x["top_aligned_max_channel_delta"], x["first_changed_row"], "NEAR" if x["near_duplicate"] else "")
