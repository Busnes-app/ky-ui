#!/usr/bin/env python3
"""Freeze review-fix evidence; keep it separate from the scored refinement round."""
import hashlib
import json
from pathlib import Path
import re
import shutil
import struct
import subprocess

ROOT = Path(__file__).resolve().parent
repositories = json.loads((ROOT / 'refinement-r1-r3-response.json').read_text())['repositories']
pulse = json.loads((ROOT / 'refinement-r2-response.json').read_text())
repositories[pulse['repository']] = dict(pulse, evidence_dir='docs/ui-review-followups-2026-10-26')
captures, sources = [], []
for product, response in repositories.items():
    checkout = Path(response['worktree'])
    evidence = checkout / response['evidence_dir']
    destination = ROOT / 'followup-products' / product
    for path in evidence.rglob('*'):
        if not path.is_file():
            continue
        target = destination / path.relative_to(evidence)
        if path.suffix in ('.mjs', '.js', '.sh'):
            target = target.with_name(target.name + '.txt')
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.exists() and target.read_bytes() != path.read_bytes():
            raise ValueError(f'Frozen follow-up artifact changed: {target}')
        shutil.copyfile(path, target)
    for manifest in sorted(evidence.rglob('*manifest*.json')):
        data = json.loads(manifest.read_text())
        for entry in data.get('files', data.get('shots', [])):
            matches = list(evidence.rglob(Path(entry['file']).name))
            if len(matches) != 1:
                raise ValueError((product, entry['file'], matches))
            image = matches[0]
            blob = image.read_bytes()
            assert blob[:8] == b'\x89PNG\r\n\x1a\n'
            assert hashlib.sha256(blob).hexdigest() == entry['sha256'], image
            width, height = struct.unpack('>II', blob[16:24])
            viewport = entry['viewport']
            if isinstance(viewport, dict):
                viewport = f"{viewport['width']}x{viewport['height']}"
            stage = data.get('prefix', manifest.stem.removeprefix('manifest-'))
            checkout_revision = data.get('head', data.get('source_commit'))
            diff_hash = data.get('uncommitted_diff_sha256', data.get('uncommitted_source_sha256'))
            bundle = data.get('embedded_index_sha256')
            caveat = 'Locked-session state is modelled by clearing storage except cookies. Other unreachable states stay N/A in the product README.' if product == 'KyNotes-server' else ''
            if product == 'KyIdentity-server' and diff_hash:
                caveat = f'Checkout {checkout_revision} had uncommitted changes (diff SHA256 {diff_hash}); the checkout revision alone is not the served UI source. Rendered bundle index SHA256 {bundle} is the reliable artifact link. Recorded diff hashes cannot be reproduced from committed trees.'
                if bundle.startswith('a01f5e4c2421'):
                    caveat += ' This intermediate bundle reconstructs from 08f3147 without its empty-cell phone CSS rule; admin-after captures precede that rule.'
                elif bundle.startswith('7ff014818e3f'):
                    caveat += ' This final bundle is byte-identical to committed 08f3147.'
                elif bundle.startswith('22ea47e7846d'):
                    caveat += ' BEFORE uses the unchanged committed base bundle despite unbuilt source edits.'
            captures.append({
                'file': str((destination / image.relative_to(evidence)).relative_to(ROOT)),
                'product': product, 'surface': entry['surface'], 'stage': stage,
                'phase': 'before' if 'before' in stage else 'after',
                'viewport': viewport, 'theme': entry.get('theme', entry.get('theme_source')),
                'width': width, 'height': height, 'sha256': entry['sha256'],
                'checkout_revision': checkout_revision,
                'served_revision': data.get('server_source', {}).get('commit', checkout_revision),
                'bundle_index_sha256': bundle,
                'source_diff_sha256': diff_hash,
                'source_manifest': str((destination / manifest.relative_to(evidence)).relative_to(ROOT)),
                'driver': data['driver'], 'fixture': data['fixture'],
                'rating': None, 'rating_reason': 'Follow-up behavior/disclosure evidence; not scored in the frozen refinement round.',
                'caveat': caveat,
            })
    def git(*args):
        return subprocess.check_output(['git', *args], cwd=checkout, text=True).strip()
    base_match = re.search(r'\b[0-9a-f]{7,40}\b', response['base'])
    if base_match is None:
        raise ValueError(f'Missing base revision for {product}')
    base = git('rev-parse', '--verify', base_match.group() + '^{commit}')
    sources.append({'repository': product, 'checkout': str(checkout), 'pr': response['pr'],
                    'head': git('rev-parse', 'HEAD'), 'review_base': git('rev-parse', base),
                    'evidence': str(evidence), 'changed_paths': git('diff', '--name-only', base, 'HEAD').splitlines()})
for name, value in [('followup-captures-v2.json', captures), ('followup-source-inputs.json', {'scope': 'R1/R2 fixes and R3 disclosure; no new score or baseline replacement', 'repositories': sources})]:
    target = ROOT / name
    rendered = json.dumps(value, indent=2) + '\n'
    if target.exists() and target.read_text() != rendered:
        raise ValueError(f'Create a new input revision rather than overwrite {target}')
    target.write_text(rendered)
print(f'{len(sources)} repositories; {len(captures)} follow-up captures; all hashes verified; scoring N/A')
