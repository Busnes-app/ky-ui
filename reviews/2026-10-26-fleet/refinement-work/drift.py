"""Drift crosscheck: new blind BEFORE (and AFTER) scores vs release-scores.json, run only after scores were fixed."""
import json, re, statistics, sys

old = json.load(open("release-scores.json"))["files"]
new = json.load(open("refinement-scores.json"))["files"]
pat = re.compile(r"^(ky[a-z]+)-\d+[a-z]?-(?:after|before|confirm|current-bundle)(?:-manage)?-(.+)-(desktop|mobile)-(light|dark)\.png$")

def key(path, theme):
    m = pat.match(path.split("/")[-1])
    if not m:
        return None
    prod, surf, vp, osmode = m.groups()
    return (prod, surf, vp, osmode)

old_by = {}
for o in old:
    k = key(o["file"], o["theme"])
    if k:
        old_by[k] = o
rows = []
for n in new:
    if n["duplicate_of"]:
        continue
    k = key(n["file"], n["theme"])
    o = old_by.get(k)
    if not o:
        continue
    rows.append({"key": "-".join(k), "phase": n["phase"], "new_file": n["file"], "old_file": o["file"],
                 "same_image": o["sha256"] == n["sha256"], "prior_total": o["total"], "total": n["total"],
                 "delta": round(n["total"] - o["total"], 1), "prior_ky_fit": o["ky_fit"]["total"],
                 "ky_fit": n["ky_fit"]["total"], "ky_fit_delta": round(n["ky_fit"]["total"] - o["ky_fit"]["total"], 1)})
json.dump(rows, open(sys.argv[1], "w"), indent=1)
for ph in ("before", "after"):
    r = [x for x in rows if x["phase"] == ph]
    print(ph, "matched", len(r), "same_image", sum(x["same_image"] for x in r),
          "mean_delta", round(statistics.fmean(x["delta"] for x in r), 2), "mean_ky_delta", round(statistics.fmean(x["ky_fit_delta"] for x in r), 2))
for x in rows:
    if x["phase"] == "before":
        print(f"{x['key']:45} same={x['same_image']!s:5} old={x['prior_total']} new={x['total']} d={x['delta']:+} | ky {x['prior_ky_fit']}->{x['ky_fit']} d={x['ky_fit_delta']:+}")
