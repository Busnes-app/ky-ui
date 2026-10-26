#!/usr/bin/env python3
"""Verify near duplicates in the final visual review input set with Pillow."""
from PIL import Image, ImageChops
from pathlib import Path
import itertools
import json

root = Path(__file__).resolve().parent
input_path = root / 'visual-review-inputs.json'
inputs = json.loads(input_path.read_text())
rows = inputs['files']
small = {r['file']: Image.open(root / r['file']).convert('RGB').resize((64, 64)) for r in rows}
comparisons = 0
candidates = []
near = []
for a, b in itertools.combinations(rows, 2):
    if a['image_dimensions'] != b['image_dimensions']:
        continue
    comparisons += 1
    if a['sha256'] == b['sha256']:
        continue
    if max(x[1] for x in ImageChops.difference(small[a['file']], small[b['file']]).getextrema()) > 8:
        continue
    candidates.append((a, b))
for a, b in candidates:
    diff = ImageChops.difference(Image.open(root / a['file']).convert('RGB'), Image.open(root / b['file']).convert('RGB'))
    max_delta = max(x[1] for x in diff.getextrema())
    if max_delta > 8:
        continue
    pixels = diff.tobytes()
    changed = sum(any(pixels[i:i+3]) for i in range(0, len(pixels), 3))
    fraction = changed / (diff.width * diff.height)
    record = {'first': a['file'], 'second': b['file'], 'changed_fraction': fraction, 'max_channel_delta': max_delta, 'near_duplicate': fraction < 0.001}
    near.append(record)
result = {'input_files': len(rows), 'same_dimension_pairs': comparisons, 'full_resolution_candidates': len(candidates), 'rule': 'Same dimensions, <0.1% changed pixels and maximum channel delta<=8. Thumbnail max difference>8 excludes max original delta<=8; full-resolution comparison for remaining pairs.', 'comparisons': near}
(root / 'near-duplicates.json').write_text(json.dumps(result, indent=2) + '\n')
# Lexicographically first file is the canonical member. The final inputs remain listed.
canonical = {r['file']: r.get('duplicate_of') or r['file'] for r in rows}
def canonical_file(file):
    while canonical[file] != file:
        file = canonical[file]
    return file
for pair in near:
    if pair['near_duplicate']:
        first, second = sorted([canonical_file(pair['first']), canonical_file(pair['second'])])
        canonical[max(first, second)] = min(first, second)
for r in rows:
    if canonical_file(r['file']) != r['file']:
        prior = r.get('duplicate_of')
        r['duplicate_of'] = canonical_file(r['file'])
        r['duplicate_kind'] = r.get('duplicate_kind', 'near') if prior else 'near'
input_path.write_text(json.dumps(inputs, indent=2) + '\n')
print(f"{len(rows)} inputs; {comparisons} dimension-matched pairs; {sum(p['near_duplicate'] for p in near)} near duplicates")
