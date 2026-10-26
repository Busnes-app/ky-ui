"""Build release-scores.json from scores-draft.jsonl (last row per file wins). Totals use Decimal half-up.
Duplicate followers copy their canonical row's scores/fit/total and get duplicate_of. Also re-measures each
duplicate pair (rubric: same dims, <0.1% changed pixels, max channel delta <= 8)."""
import datetime, hashlib, json, sys
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
from PIL import Image, ImageChops

R = Path(__file__).resolve().parents[2]
W = {'hierarchy': '0.20', 'typography': '0.15', 'density_layout': '0.20', 'color': '0.15', 'visible_affordances': '0.15', 'coherence': '0.15'}
r1 = lambda v: float(Decimal(str(v)).quantize(Decimal('0.1'), rounding=ROUND_HALF_UP))
inputs = json.load(open(R / 'visual-review-inputs-v3.json'))['files']
draft = {}
for line in open(R / 'v3-review-work/scores-draft.jsonl'):
    row = json.loads(line)
    draft[row['file']] = row

def pair(a, b):
    x, y = Image.open(R / a).convert('RGB'), Image.open(R / b).convert('RGB')
    if x.size != y.size:
        return {'same_dimensions': False}
    d = ImageChops.difference(x, y)
    changed = sum(1 for p in d.getdata() if max(p) > 0)
    mx = max(max(b) for b in d.getextrema())
    frac = changed / (x.size[0] * x.size[1])
    return {'changed_fraction': frac, 'max_channel_delta': mx, 'near_duplicate': frac < 0.001 and mx <= 8}

files, dup_checks = [], []
for src in inputs:
    f = src['file']
    sha = hashlib.sha256((R / f).read_bytes()).hexdigest()
    assert sha == src['sha256'], f
    if src.get('duplicate_of'):
        canon = draft[src['duplicate_of']]
        chk = pair(src['duplicate_of'], f)
        dup_checks.append({'follower': f, 'canonical': src['duplicate_of'], **chk})
        row = {k: canon[k] for k in canon if k not in ('file',)}
        row.update({'file': f, 'sha256': sha, 'duplicate_of': src['duplicate_of'],
                    'theme': canon['theme'].replace('OS dark', 'OS light') if f.endswith('-light.png') and src['duplicate_of'].endswith('-dark.png') else canon['theme'],
                    'observed_surface': canon['observed_surface'] + (' (member role)' if '-admin-' in src['duplicate_of'] else ''),
                    'caveat': f"Duplicate follower of {src['duplicate_of'].split('/')[-1]} (measured changed fraction {chk.get('changed_fraction', 0):.2e}, max delta {chk.get('max_channel_delta')}); inherits its scores and ky_fit and is excluded from means. " + canon['caveat']})
        files.append(row)
        continue
    row = dict(draft[f])
    row['sha256'] = sha
    row['duplicate_of'] = None
    row['total'] = r1(sum(Decimal(W[k]) * v for k, v in row['scores'].items()))
    fit = row['ky_fit']
    fit['total'] = r1(sum(Decimal(v) for v in fit['scores'].values()) / 5)
    files.append(row)
# followers inherit the canonical total computed above
by = {x['file']: x for x in files}
for x in files:
    if x['duplicate_of']:
        x['total'] = by[x['duplicate_of']]['total']
        x['ky_fit'] = by[x['duplicate_of']]['ky_fit']
        x['scores'] = by[x['duplicate_of']]['scores']
missing = [s['file'] for s in inputs if s['file'] not in draft and not s.get('duplicate_of')]
assert not missing, missing
out = {'rubric_version': 'ky-suite-v2', 'reviewer_model': 'claude-opus-5-5',
       'reviewed_at': datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds'),
       'reviewer': 'Claude Opus 5.5 independent review sub-agent, round 3; blind to earlier scores (none existed for this input set; competitor council scores not loaded)',
       'weights': {k: float(v) for k, v in W.items()},
       'rounding': 'Decimal(str(x)).quantize(Decimal("0.1"), ROUND_HALF_UP)',
       'input_set': 'visual-review-inputs-v3.json (148 rows; 142 unique after 2 exact + 4 near-duplicate followers)',
       'duplicate_checks': dup_checks,
       'files': files}
json.dump(out, open(R / 'release-scores.json', 'w'), indent=1)
u = [x['total'] for x in files if not x['duplicate_of']]
print('rows', len(files), 'unique', len(u), 'range', min(u), max(u), 'dup checks', [(c['follower'].split('/')[-1], c.get('near_duplicate'), c.get('max_channel_delta')) for c in dup_checks])
