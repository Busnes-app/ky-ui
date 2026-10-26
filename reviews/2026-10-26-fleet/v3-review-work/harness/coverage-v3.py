"""Per-file coverage at v3 pinned heads, read by fixed commit (git show), never the moving worktree.
Inputs: runtime-review-inputs-v3.json, runtime-source-review-v2.json. Output: evidence/coverage-v3.json."""
import hashlib, json, subprocess
from pathlib import Path

R = Path(__file__).resolve().parents[2]
inputs = json.load(open(R / 'runtime-review-inputs-v3.json'))
v2 = {r['repository']: r for r in json.load(open(R / 'runtime-source-review-v2.json'))['repositories']}

def git(c, *a):
    return subprocess.run(['git', '-C', c, *a], capture_output=True, check=True).stdout

def blob(c, rev, path):
    try:
        return git(c, 'rev-parse', f'{rev}:{path}').decode().strip()
    except subprocess.CalledProcessError:
        return None

# Classification of files new since the v2 head (read in full by me in this round, or evidence).
READ = {
    'web/src/styles/theme.css': 'runtime-diff-read-full (F7 rule; whole .btn-danger/button state rules read)',
    'web/browser/danger-button.spec.mjs': 'test-read-full and executed (head pass, pre-F7 fail)',
    'web/AGENTS.md': 'docs-diff-read',
    'web/dist/index.html': 'generated; diff read (asset names only)',
}

def classify(path):
    if path in READ:
        return READ[path]
    if path.startswith('web/dist/assets/'):
        return 'generated; reproducible rebuild byte-equal (Pulse/Base) + F7 rule string present'
    if path.startswith('docs/ui-fleet-2026-10-26/'):
        return 'evidence-omitted from source coverage (images scored in phase 2 where in input set)'
    if path in ('go.mod', 'go.sum', 'internal/auth/totp_strength_test.go', 'internal/auth/AGENTS.md',
                'docs/ASSURANCE-CASE.md', 'docs/STRONG-CRYPTO.md'):
        return 'upstream-backend (#70 TOTP key minimum via master merge); identified, NOT certified'
    if path in ('CHANGELOG.md', 'UI-VERIFICATION.md'):
        return 'docs-diff-read'
    return 'UNCLASSIFIED'

out = []
for r in inputs['repositories']:
    c, head, prev = r['checkout'], r['head'], r['previous_review_head']
    pv2 = v2[r['repository']]
    prior = {f['path']: f for f in pv2['prior_covered_files']}
    for f in pv2['new_changes']:
        prior.setdefault(f['path'], {'path': f['path'], 'prior_coverage': 'v2:' + f['coverage']})
    files = []
    for path, f in sorted(prior.items()):
        cov = f.get('prior_coverage', '')
        if 'evidence' in cov or path.endswith('.png'):
            continue
        b_head, b_prev = blob(c, head, path), blob(c, prev, path)
        sha = hashlib.sha256(git(c, 'show', f'{head}:{path}')).hexdigest() if b_head else None
        files.append({'path': path, 'prior_coverage': cov, 'blob_v3': b_head, 'sha256_v3': sha,
                      'unchanged_since_v2_head': b_head == b_prev and b_head is not None})
    new = []
    for path in r['new_changes_since_review']:
        b = blob(c, head, path)
        new.append({'path': path, 'coverage': classify(path), 'blob_v3': b,
                    'sha256_v3': hashlib.sha256(git(c, 'show', f'{head}:{path}')).hexdigest() if b else None})
    out.append({'repository': r['repository'], 'head': head, 'v2_head': prev,
                'prior_covered_count': len(files),
                'prior_covered_unchanged': sum(x['unchanged_since_v2_head'] for x in files),
                'prior_changed': [x['path'] for x in files if not x['unchanged_since_v2_head']],
                'new_changes_count': len(new),
                'unclassified': [x['path'] for x in new if x['coverage'] == 'UNCLASSIFIED'],
                'prior_covered_files': files, 'new_changes': new})
json.dump(out, open(R / 'v3-review-work/evidence/coverage-v3.json', 'w'), indent=1)
for x in out:
    print(x['repository'], x['head'][:8], 'prior', x['prior_covered_unchanged'], '/', x['prior_covered_count'],
          'changed', x['prior_changed'], 'new', x['new_changes_count'], 'unclassified', x['unclassified'])
