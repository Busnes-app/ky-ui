"""Diff v3-check outputs, head vs pre-F7, per product and OS scheme. Writes evidence/v3-f7-analysis.json."""
import json, re, sys
from pathlib import Path

E = Path(__file__).resolve().parent.parent / 'evidence'
LEGACY = {'patina', 'cyber', 'nord', 'paper', 'oled'}

def rgb(s):
    if s.startswith('color(srgb'):
        return [round(float(v) * 255) for v in re.findall(r'[\d.]+', s)[:3]]
    return [float(v) for v in re.findall(r'[\d.]+', s)[:3]]

def lum(c):
    c = [v / 255 for v in c]
    c = [v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]

def ratio(a, b):
    x, y = lum(a), lum(b)
    return round((max(x, y) + 0.05) / (min(x, y) + 0.05), 2)

out, problems = {}, []
for prod in ['pulse', 'drive', 'base']:
    for scheme in ['light', 'dark']:
        head = {r['id']: r for r in json.load(open(E / f'v3-{prod}-head-{scheme}-1280.json'))}
        before = {r['id']: r for r in json.load(open(E / f'v3-{prod}-before-{scheme}-1280.json'))}
        assert set(head) == set(before) and len(head) == 22, (prod, scheme)
        rows = []
        for pid, h in head.items():
            b = before[pid]
            suite = not pid.startswith('busnes-') and pid not in LEGACY
            row = {
                'id': pid, 'suite': suite,
                'rest_head': ratio(rgb(h['color']), rgb(h['background'])),
                'rest_before': ratio(rgb(b['color']), rgb(b['background'])),
                'hover_px_max_head': h['hoverPxMax'], 'hover_px_max_before': b['hoverPxMax'],
                'focus_px_max_head': h['focusPxMax'], 'focus_visible_head': h['focusVisible'],
                'fill_same': h['background'] == b['background'],
                'status_same': (h['danger'], h['success']) == (b['danger'], b['success']),
                'label_same': h['color'] == b['color'],
                'label_is_bg': rgb(h['color']) == rgb(h['bg']),
            }
            rows.append(row)
            if not (row['fill_same'] and row['status_same']):
                problems.append((prod, scheme, pid, 'fill/status changed'))
            if suite and not row['label_is_bg']:
                problems.append((prod, scheme, pid, 'suite label not --bg'))
            if not suite and not row['label_same']:
                problems.append((prod, scheme, pid, 'legacy/busnes label changed'))
            if suite and min(row['rest_head'], row['hover_px_max_head'], row['focus_px_max_head']) < 4.5:
                problems.append((prod, scheme, pid, 'suite below 4.5'))
            if not h['focusVisible']:
                problems.append((prod, scheme, pid, 'Tab focus not :focus-visible'))
        s = [r for r in rows if r['suite']]
        nl = [r for r in rows if not r['suite']]
        out[f'{prod}-{scheme}'] = {
            'suite_min_rest_head': min(r['rest_head'] for r in s),
            'suite_min_hover_px_head': min(r['hover_px_max_head'] for r in s),
            'suite_min_focus_px_head': min(r['focus_px_max_head'] for r in s),
            'suite_min_rest_before': min(r['rest_before'] for r in s),
            'non_suite_rest_head': {r['id']: r['rest_head'] for r in nl},
            'non_suite_hover_px_head': {r['id']: r['hover_px_max_head'] for r in nl},
            'rows': rows,
        }
json.dump({'problems': problems, 'results': out}, open(E / 'v3-f7-analysis.json', 'w'), indent=1)
for k, v in out.items():
    print(k, {x: v[x] for x in v if x != 'rows'})
print('problems:', problems)
sys.exit(1 if problems else 0)
