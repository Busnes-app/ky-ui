#!/usr/bin/env python3
"""Collect immutable product captures using fleet-paths.local.json; verify hashes.

Run from this dated review directory after reviewing the input worktree map.
The map stays local; source manifests preserve original capture conditions.
"""
from pathlib import Path
import json,re,hashlib,shutil,struct
root=Path(__file__).resolve().parents[2]
out=root/'reviews/2026-10-26-fleet'
paths=json.loads((root/'fleet-paths.local.json').read_text())
rows=[]
for product,worktree in paths.items():
 src=Path(worktree)/'docs/ui-fleet-2026-10-26'
 index={}
 for m in sorted(src.rglob('*manifest*.json')):
  if 'f1-' in str(m): continue
  j=json.loads(m.read_text())
  for x in j.get('files',j.get('shots',[])):
   name=x['file']; matches=list(src.rglob(Path(name).name))
   matches=[f for f in matches if f.suffix=='.png' and 'f1-' not in str(f)]
   if len(matches)!=1: raise ValueError((product,name,matches))
   p=matches[0]; b=p.read_bytes(); digest=hashlib.sha256(b).hexdigest()
   if x['sha256']!=digest: raise ValueError(('HASH',p))
   rel=p.relative_to(src); dest=out/'products'/product/rel
   dest.parent.mkdir(parents=True,exist_ok=True); shutil.copy2(p,dest)
   mr=m.relative_to(src); md=out/'products'/product/mr; md.parent.mkdir(parents=True,exist_ok=True); shutil.copy2(m,md)
   stage=x.get('stage',j.get('prefix') or (j.get('stage','')+'-'+j.get('phase','')))
   if not stage: stage=re.search(r'-(\d+)-(before|after|confirm)',name).group(0)[1:]
   match=re.search(r'(\d+)-(before|after|confirm)',stage)
   if not match: raise ValueError(('STAGE',stage,name))
   phase='before' if match[2]=='before' else 'after'
   viewport=x.get('viewport'); viewport=f"{viewport['width']}x{viewport['height']}" if isinstance(viewport,dict) else viewport
   if not viewport: raise ValueError(('VIEWPORT',name))
   stage_def=next((s for s in j.get('stages',[]) if s['id']==x.get('stage')), {})
   theme=x.get('theme', x.get('theme_source', j.get('theme_source','')))
   if not theme and 'os_scheme' in x: theme='OS '+x['os_scheme']
   scheme=x.get('os_scheme') or ('dark' if 'dark' in str(theme).lower() else 'light' if 'light' in str(theme).lower() else '')
   if not scheme: raise ValueError(('THEME',name,theme))
   width,height=struct.unpack('>II',b[16:24])
   row={'file':str(dest.relative_to(out)),'product':product,'stage':match[1],'phase':phase,'surface':x['surface'],'viewport':viewport,'theme':'OS '+scheme,'sha256':digest,'image_dimensions':f'{width}x{height}','width':width,'height':height,'bytes':len(b),'source_revision':j.get('source_commit',j.get('head',stage_def.get('commit'))),'source_diff_sha256':j.get('uncommitted_source_sha256',j.get('uncommitted_diff_sha256',stage_def.get('uncommitted_diff_sha256'))),'source_manifest':str(md.relative_to(out)),'captured_at':x.get('captured_run_at',j.get('captured_at',j.get('captured',j.get('generated')))),'driver':x.get('browser',j.get('driver')),'fixture':j.get('fixture'),'overflow_px':x.get('overflow_px'),'caveat':('Full-page image; viewport and image dimensions differ. ' if f'{width}x{height}'!=viewport else '')+('Captured with source edits; revision plus archived source patch identifies the source.' if j.get('uncommitted_source_sha256',j.get('uncommitted_diff_sha256')) else ''),'gallery_example':False,'rating_input':False,'diagnostic':x.get('diagnostic')}
   saved=re.search(r'saved choice ([a-z0-9-]+)', str(x.get('theme_source','')), re.I)
   saved_id=saved.group(1).lower() if saved else None
   if product=='KyDrive-server' and x['surface'] in ['delete-dialog-sky','delete-dialog-forest']:
    saved_id=x['surface'].rsplit('-',1)[1]
    row['caveat']+=' Capture metadata correction: saved '+saved_id+' is applied by capture.mjs/deleteDialog; original manifest theme field describes OS mode and incorrectly says no saved choice. Images unchanged.'
   row['os_scheme']=scheme
   row['saved_theme']=saved_id
   if saved_id: row['theme']=saved_id+' (saved); OS '+scheme
   index[str(rel)]=row
 for phase in ['before','after']:
  mf=src/('f1-'+phase)/'manifest.json'
  if not mf.exists(): continue
  meta=json.loads(mf.read_text())
  target_manifest=out/'products'/product/mf.relative_to(src); target_manifest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(mf,target_manifest)
  for x in meta['shots']:
   file=mf.parent/x['file']; b=file.read_bytes();digest=hashlib.sha256(b).hexdigest();assert digest==x['sha256']
   dest=out/'products'/product/file.relative_to(src);shutil.copy2(file,dest);w,h=struct.unpack('>II',b[16:24])
   rows.append({'file':str(dest.relative_to(out)),'product':product,'stage':'F1','phase':phase,'capture_kind':'regression','surface':'appearance-status-contrast','viewport':x['viewport'],'theme':x['theme'],'sha256':digest,'image_dimensions':f'{w}x{h}','width':w,'height':h,'bytes':len(b),'source_revision':meta['source_revision'],'source_manifest':str(target_manifest.relative_to(out)),'captured_at':meta['captured_at'],'caveat':meta['viewport_note'],'rating_input':False,'gallery_example':False})
 rows.extend(index.values())
 # Every original PNG must be inventoried; debug F1 probes are a separate evidence set.
 original={str(f.relative_to(src)) for f in src.rglob('*.png') if not any(t.startswith('f1-') for t in f.relative_to(src).parts)}
 missing=original-set(index)
 for rel in sorted(missing):
  p=src/rel; b=p.read_bytes(); dest=out/'products'/product/rel; dest.parent.mkdir(parents=True,exist_ok=True); shutil.copy2(p,dest)
  width,height=struct.unpack('>II',b[16:24])
  rows.append({'file':str(dest.relative_to(out)),'product':product,'phase':'diagnostic','stage':'historical','surface':'behavior diagnostic','viewport':None,'theme':None,'sha256':hashlib.sha256(b).hexdigest(),'image_dimensions':f'{width}x{height}','width':width,'height':height,'bytes':len(b),'source_revision':None,'caveat':'Historical behavior screenshot outside the design-capture manifest; conditions and revision not independently recorded. Excluded from ratings.','rating_input':False,'gallery_example':False})
 for f in src.rglob('*'):
  if f.is_file() and f.suffix in ['.patch','.txt']:
   target=out/'products'/product/f.relative_to(src); target.parent.mkdir(parents=True,exist_ok=True); shutil.copy2(f,target)
by={}
for r in rows:
 if r['phase']=='diagnostic' or r.get('diagnostic') or r.get('capture_kind')=='regression': continue
 by.setdefault((r['product'],r['surface'],r['viewport'],r['theme']),[]).append(r)
for key,group in by.items():
 after=[r for r in group if r['phase']=='after']
 if not after: continue
 final=max(after,key=lambda x:(int(x['stage']),x['captured_at'] or ''))
 final['rating_input']=True
 before=[r for r in group if r['phase']=='before']
 if before:
  initial=min(before,key=lambda x:(int(x['stage']),x['captured_at'] or ''))
  final['paired_file']=initial['file']
  final['gallery_example']=final['surface']=='appearance'
 elif len(after)>1:
  earlier=[r for r in after if int(r['stage'])<int(final['stage'])]
  if earlier:
   prior=max(earlier,key=lambda x:(int(x['stage']),x['captured_at'] or ''))
   final['paired_file']=prior['file']
   final['pair_note']='Prior after-stage is the before state for this change.'
for r in rows:
 if r.get('rating_input') and r.get('paired_file') and r['surface'] in ['app-delete-sky','delete-dialog-sky'] and r.get('os_scheme')=='light': r['gallery_example']=True
seen={}
for r in sorted(rows,key=lambda x:x['file']):
 r['duplicate_of']=seen.get(r['sha256'])
 seen.setdefault(r['sha256'],r['file'])
(out/'captures.json').write_text(json.dumps(sorted(rows,key=lambda x:x['file']),indent=2)+'\n')
inputs=[r.copy() for r in rows if r['rating_input']]
current_seen={}
for r in sorted(inputs,key=lambda x:x['file']):
 r['duplicate_of']=current_seen.get(r['sha256'])
 if r['duplicate_of']: r['duplicate_kind']='exact'
 current_seen.setdefault(r['sha256'],r['file'])
(out/'visual-review-inputs.json').write_text(json.dumps({'rubric':'ky-suite-v2','selection':'Latest captured state per product, surface, viewport and OS scheme; earlier stages are historical evidence, not current score inputs. Input set must be revalidated after pending runtime fixes.','files':inputs},indent=2)+'\n')
print('captures',len(rows),'rating inputs',len(inputs),'unique',len({r['sha256'] for r in inputs}))
for name in paths: print(name,len([r for r in rows if r['product']==name]),len([r for r in inputs if r['product']==name]))
