#!/usr/bin/env python3
"""Build an offline, single-file gallery of the final paired design captures."""
import base64
from collections import defaultdict
from html import escape
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
captures = json.loads((ROOT / 'captures.json').read_text())
score_path = ROOT / 'release-scores.json'
scores = {r['file']: r for r in json.loads(score_path.read_text())['files']} if score_path.exists() else {}
by = defaultdict(list)
for capture in captures:
    if capture.get('rating_input') and capture.get('paired_file'):
        by[capture['product']].append(capture)

def img(file, label):
    data = base64.b64encode((ROOT / file).read_bytes()).decode()
    return f'<figure><figcaption>{escape(label)}</figcaption><img loading="lazy" src="data:image/png;base64,{data}" alt="{escape(label, quote=True)}"></figure>'

parts = ['''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Ky web fleet — before and after</title>
<style>
*{box-sizing:border-box}body{margin:0;color:var(--foreground,#182326);font:1rem/1.5 var(--font-sans,system-ui,sans-serif)}main{max-width:90rem;margin:auto}h1{font-size:1.5rem;margin:0 0 1rem}p{max-width:75ch}a{color:inherit;text-underline-offset:.2em}nav{display:flex;flex-wrap:wrap;gap:.5rem 1rem;margin-block:1.5rem}label{display:inline-flex;align-items:center;gap:.5rem;margin:0 1rem 1rem 0}select{min-height:2.5rem;font:inherit;border:1px solid #566461;border-radius:.5rem;padding:.25rem .5rem;background:#fff;color:#182326}summary{cursor:pointer;font-weight:600;padding-block:1rem;border-top:1px solid var(--border,#566461)}summary:focus-visible,a:focus-visible,select:focus-visible{outline:2px solid #bf3f18;outline-offset:3px}.pair{color:#182326;background:#fff;padding:1rem;margin:0 0 1.5rem;border-radius:.5rem}.pair h3{font-size:1.0625rem;margin:0 0 .5rem}.meta{color:#566461;font-size:.875rem;overflow-wrap:anywhere}.images{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}figure{margin:0;min-width:0}figcaption{font-weight:600;margin:0 0 .5rem}img{max-width:100%;height:auto;display:block;border:1px solid #566461}code{overflow-wrap:anywhere;font-size:.8125rem}small{font-size:.875rem}.pair[hidden]{display:none}@media(max-width:45rem){.images{grid-template-columns:1fr}}
</style><main><h1>Ky web fleet: before and after</h1><p>Captured implementations with synthetic data. Every pair retains its original viewport, theme, source revision and hash. A visual score describes the picture; it does not establish behavior, accessibility or a whole-product 9/10.</p>
<label>Screen size <select id="device"><option value="all">All sizes</option><option value="desktop">Desktop</option><option value="mobile">Phone</option></select></label><label>Device theme <select id="scheme"><option value="all">Light and dark</option><option value="light">Light</option><option value="dark">Dark</option></select></label><nav aria-label="Products">''']
for index, product in enumerate(sorted(by)):
    parts.append(f'<a href="#product-{index}">{escape(product)}</a>')
parts.append('</nav>')
count = 0
for index, (product, rows) in enumerate(sorted(by.items())):
    parts.append(f'<details id="product-{index}"{ " open" if index == 0 else ""}><summary>{escape(product)} — {len(rows)} matched views</summary>')
    for row in sorted(rows, key=lambda x: (x['surface'], x['viewport'], x['theme'])):
        rating = scores.get(row['file'], {})
        quality = rating.get('total')
        fit = rating.get('ky_fit', {}).get('total')
        device = 'mobile' if row['viewport'].startswith('390x') else 'desktop'
        scheme = row.get('os_scheme') or ('dark' if 'dark' in row['theme'] else 'light')
        text = f"{row['surface']} · {row['viewport']} · {row['theme']}"
        parts.append(f'<section class="pair" data-device="{device}" data-scheme="{scheme}"><h3>{escape(text)}</h3>')
        parts.append(f'<p class="meta">Quality: {quality if quality is not None else "not rated"}/10 · Ky fit: {fit if fit is not None else "not rated"}/10</p>')
        parts.append('<div class="images">' + img(row['paired_file'], product + ' — before, ' + text) + img(row['file'], product + ' — after, ' + text) + '</div>')
        parts.append(f'<p class="meta">After revision: <code>{escape(str(row.get("source_revision") or "not recorded"))}</code><br>Source edits: <code>{escape(str(row.get("source_diff_sha256") or "none recorded"))}</code><br>SHA-256: <code>{row["sha256"]}</code><br>{escape(row.get("caveat", ""))}</p></section>')
        count += 1
    parts.append('</details>')
parts.append('''<p><small>All images are embedded in this file. The workbook contains the complete capture inventory, numerical scoring, check records and PR links. Older stages remain historical evidence. No new competitor comparison is implied by this fleet gallery.</small></p></main><script>
const selects=[document.getElementById('device'),document.getElementById('scheme')];
function filter(){for(const row of document.querySelectorAll('.pair'))row.hidden=selects.some(select=>select.value!=='all'&&row.dataset[select.id]!==select.value)}
for(const select of selects)select.addEventListener('change',filter);
</script></html>''')
file = ROOT / 'fleet-gallery.html'
file.write_text(''.join(parts))
print(f'{file}: {count} before/after pairs, {file.stat().st_size} bytes; no external assets')
