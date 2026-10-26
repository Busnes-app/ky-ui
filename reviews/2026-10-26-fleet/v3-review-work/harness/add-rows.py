"""Append reviewer score rows (JSON array on stdin) to v3-review-work/scores-draft.jsonl after shape checks.
Rows for an already-recorded file replace the earlier row at finalize time (last wins)."""
import json, sys
from pathlib import Path

D = Path(__file__).resolve().parents[1] / 'scores-draft.jsonl'
R = Path(__file__).resolve().parents[2]
names = {f['file'] for f in json.load(open(R / 'visual-review-inputs-v3.json'))['files']}
DIMS = {'hierarchy', 'typography', 'density_layout', 'color', 'visible_affordances', 'coherence'}
FIT = {'palette_tokens', 'type_geometry', 'shell', 'accent_discipline', 'suite_cohesion'}
REQ = ['file', 'observed_product', 'observed_surface', 'cohort', 'state', 'theme', 'viewport', 'artifacts',
       'filename_matches_content', 'confidence', 'caveat']
rows = json.load(sys.stdin)
with open(D, 'a') as out:
    for r in rows:
        assert r['file'] in names, r['file']
        for k in REQ:
            assert k in r, (r['file'], k)
        if not r.get('unscored_reason'):
            assert set(r['scores']) == DIMS == set(r['observations']), r['file']
            assert all(type(v) is int and 0 <= v <= 10 for v in r['scores'].values()), r['file']
            assert set(r['ky_fit']['scores']) == FIT == set(r['ky_fit']['observations']), r['file']
        out.write(json.dumps(r) + '\n')
print('appended', len(rows))
