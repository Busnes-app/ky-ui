#!/usr/bin/env python3
"""Validate reviewer evidence and recompute every reported score with Decimal."""
from collections import defaultdict
from decimal import Decimal, ROUND_HALF_UP
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
WEIGHTS = {'hierarchy': '0.20', 'typography': '0.15', 'density_layout': '0.20', 'color': '0.15', 'visible_affordances': '0.15', 'coherence': '0.15'}
FIT = {'palette_tokens', 'type_geometry', 'shell', 'accent_discipline', 'suite_cohesion'}
COHORTS = {'mail-list', 'mail-read', 'compose', 'calendar-grid', 'calendar-list', 'event-editor', 'contacts-list', 'contact-editor', 'settings', 'admin-console', 'member-home', 'chat', 'notes', 'drive', 'auth'}
inputs = json.loads((ROOT / 'visual-review-inputs.json').read_text())['files']
review = json.loads((ROOT / 'release-scores.json').read_text())
assert review['rubric_version'] == 'ky-suite-v2'
assert review['reviewer_model'] == 'claude-opus-5-5'
assert {k: Decimal(str(v)) for k, v in review['weights'].items()} == {k: Decimal(v) for k, v in WEIGHTS.items()}
files = {x['file']: x for x in review['files']}
assert len(files) == len(review['files']), 'Repeated score row'
assert set(files) == {x['file'] for x in inputs}, 'Missing or unexpected score row'
round1 = lambda value: float(Decimal(str(value)).quantize(Decimal('0.1'), rounding=ROUND_HALF_UP))
summary = defaultdict(list)
for source in inputs:
    row = files[source['file']]
    assert row['sha256'] == source['sha256'] == hashlib.sha256((ROOT / row['file']).read_bytes()).hexdigest()
    duplicate = source.get('duplicate_of')
    if duplicate:
        assert row.get('duplicate_of') == duplicate
        canonical = files[duplicate]
        for key in ['scores', 'ky_fit', 'total']:
            assert row[key] == canonical[key], (row['file'], 'duplicate differs', key)
        continue
    assert row['cohort'] in COHORTS
    if row.get('unscored_reason'):
        assert row.get('total') is None
        continue
    assert set(row['scores']) == set(WEIGHTS)
    assert set(row['observations']) == set(WEIGHTS)
    for key, value in row['scores'].items():
        assert type(value) is int and 0 <= value <= 10
        assert isinstance(row['observations'][key], str) and row['observations'][key].strip()
    total = round1(sum(Decimal(WEIGHTS[k]) * v for k, v in row['scores'].items()))
    assert row['total'] == total, (row['file'], row['total'], total)
    fit = row['ky_fit']
    assert set(fit['scores']) == FIT and set(fit['observations']) == FIT
    assert all(type(v) is int and 0 <= v <= 10 for v in fit['scores'].values())
    assert all(isinstance(v, str) and v.strip() for v in fit['observations'].values())
    fit_total = round1(sum(Decimal(v) for v in fit['scores'].values()) / 5)
    assert fit['total'] == fit_total
    for key in ['observed_product', 'observed_surface', 'state', 'theme', 'viewport', 'confidence', 'caveat']:
        assert row.get(key), (row['file'], key)
    summary[(source['product'], row['cohort'])].append((total, fit_total))
cohorts = []
for (product, cohort), values in sorted(summary.items()):
    cohorts.append({'product': product, 'cohort': cohort, 'n': len(values),
                    'mean': round1(sum(Decimal(str(x[0])) for x in values) / len(values)),
                    'brand_fit': round1(sum(Decimal(str(x[1])) for x in values) / len(values)),
                    'lowest_file': min(x[0] for x in values),
                    'comparison': 'Ky captured surfaces only; states, schemes and viewports may differ. No competitor comparison or whole-product ranking.'})
(ROOT / 'cohort-results.json').write_text(json.dumps(cohorts, indent=2) + '\n')
print(f"Verified {len(files)} score rows, {len(cohorts)} product/cohort summaries; duplicates excluded from means")
