#!/usr/bin/env python3
"""Freeze the seven-product refinement inventory without changing baseline records."""
import hashlib
import json
from pathlib import Path
import shutil
import struct
import subprocess

ROOT = Path(__file__).resolve().parent


def git(checkout, *args):
    return subprocess.check_output(['git', *args], cwd=checkout, text=True).strip()


responses = [json.loads((ROOT / name).read_text()) for name in (
    'refinements-operations-response.json', 'refinement-notes-identity-response.json')]
captures, sources, selected = [], [], []
for response in responses:
    for product, entry in response['repositories'].items():
        checkout = Path(entry['worktree'])
        evidence = checkout / 'docs/ui-visual-refinement-2026-10-26'
        output = ROOT / 'refinement-products' / product
        output.mkdir(parents=True, exist_ok=True)
        # Each product owns its files; the collector only writes its separate snapshot.
        for path in evidence.rglob('*'):
            if not path.is_file():
                continue
            target = output / path.relative_to(evidence)
            if path.suffix in ('.js', '.mjs', '.ts'):
                target = target.with_name(target.name + '.txt')
            target.parent.mkdir(parents=True, exist_ok=True)
            if target.exists() and target.read_bytes() != path.read_bytes():
                raise ValueError(f'Frozen evidence changed: {target}')
            shutil.copyfile(path, target)
        manifests = sorted(evidence.rglob('*manifest*.json'))
        rows = []
        for manifest in manifests:
            data = json.loads(manifest.read_text())
            stage = data.get('prefix', manifest.stem.removeprefix('manifest-'))
            for shot in data.get('files', data.get('shots', [])):
                matches = list(evidence.rglob(Path(shot['file']).name))
                if len(matches) != 1:
                    raise ValueError((product, shot['file'], matches))
                path = matches[0]
                blob = path.read_bytes()
                digest = hashlib.sha256(blob).hexdigest()
                if digest != shot['sha256'] or blob[:8] != b'\x89PNG\r\n\x1a\n':
                    raise ValueError(f'Invalid capture: {path}')
                width, height = struct.unpack('>II', blob[16:24])
                viewport = shot['viewport']
                if isinstance(viewport, dict):
                    viewport = f"{viewport['width']}x{viewport['height']}"
                row = {
                    'file': str((output / path.relative_to(evidence)).relative_to(ROOT)),
                    'product': product, 'surface': shot['surface'], 'stage': stage,
                    'phase': 'before' if 'before' in stage else 'after',
                    'viewport': viewport,
                    'theme': shot.get('theme', shot.get('theme_source')),
                    'sha256': digest, 'width': width, 'height': height, 'bytes': len(blob),
                    'source_revision': data.get('head', data.get('source_commit')),
                    'source_diff_sha256': data.get('uncommitted_diff_sha256', data.get('uncommitted_source_sha256')),
                    'source_manifest': str((output / manifest.relative_to(evidence)).relative_to(ROOT)),
                    'captured_at': data.get('captured', data.get('captured_at')),
                    'driver': data['driver'], 'fixture': data['fixture'],
                    'overflow_px': shot.get('overflow_px'),
                    'full_page': shot.get('full_page', 'source conditions say full page'),
                    'caveat': 'Identity before and after both use corrected font fixture; historical font drift is not a product improvement.' if 'Identity' in product else '',
                }
                rows.append(row)
        captures.extend(rows)
        # Explicitly exclude superseded closed-Manage frames and pre-merge Notes bundle.
        if 'Identity' in product:
            before = [r for r in rows if r['phase'] == 'before']
            after = [r for r in rows if r['stage'] == 'kyidentity-01-confirm' and r['surface'] != 'users-manage']
            after += [r for r in rows if r['stage'] == 'kyidentity-01-confirm-manage']
        elif 'Notes' in product:
            before = [r for r in rows if r['phase'] == 'before']
            after = [r for r in rows if r['stage'] == 'kynotes-02-current-bundle']
        else:
            before = [r for r in rows if r['phase'] == 'before']
            latest = max(r['stage'] for r in rows if r['phase'] == 'after')
            after = [r for r in rows if r['stage'] == latest]
        def key(row):
            # Both manifest families retain OS light/dark in their filename suffix.
            return row['surface'], row['viewport'], Path(row['file']).stem.rsplit('-', 1)[1]
        before_map = {key(r): r for r in before}
        if len(before_map) != len(before) or len(after) != len(before):
            raise ValueError(f'Unmatched capture count: {product}')
        for row in after:
            previous = before_map[key(row)]
            selected.extend([dict(previous, paired_file=row['file']), dict(row, paired_file=previous['file'])])
        head = git(checkout, 'rev-parse', 'HEAD')
        bases = sorted({r['source_revision'] for r in before})
        if len(bases) != 1:
            raise ValueError((product, bases))
        sources.append({'repository': product, 'checkout': str(checkout), 'head': head,
                        'review_base': bases[0], 'pr': entry['pr'],
                        'evidence': str(evidence),
                        'capture_sources': sorted({r['source_revision'] for r in after}),
                        'changed_paths': git(checkout, 'diff', '--name-only', bases[0], head).splitlines()})
hashes = {}
for row in selected:
    row['duplicate_of'] = hashes.get(row['sha256'])
    hashes.setdefault(row['sha256'], row['file'])
for name, value in (
    ('refinement-captures.json', captures),
    ('refinement-review-inputs.json', {'rubric': 'ky-suite-v2', 'selection': 'Matched corrected-fixture before and latest implemented after; prior failed/intermediate stages stay in inventory.', 'files': selected}),
    ('refinement-source-inputs.json', {'scope': 'Independent seven-product visual refinement confirmation; no baseline replacement', 'repositories': sources}),
):
    path = ROOT / name
    rendered = json.dumps(value, indent=2) + '\n'
    if path.exists() and path.read_text() != rendered:
        raise ValueError(f'Frozen input changed; create a new revision: {path}')
    path.write_text(rendered)
print(f'{len(sources)} products; {len(captures)} staged images; {len(selected)} rating inputs; {len(hashes)} exact-unique images')
