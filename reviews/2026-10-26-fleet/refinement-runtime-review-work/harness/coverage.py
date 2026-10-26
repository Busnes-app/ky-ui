# Per-repository coverage: every changed path base..head classified, with head blob ids for non-evidence files.
import json, subprocess, hashlib, os
ROOT='/home/yoshi/git/busnes.app/ky-ui/.claude/worktrees/fleet-appearance/reviews/2026-10-26-fleet'
src=json.load(open(f'{ROOT}/refinement-source-inputs.json'))
def git(wt,*a): return subprocess.run(['git','-C',wt,*a],capture_output=True,text=True,check=True).stdout
RUNTIME_READ={'web/src/components/AdminUsers.tsx','web/src/index.css','web/src/main.tsx','web/src/styles.css','internal/server/static/css/styles.css','internal/server/static/index.html',
 'internal/web/static/app.css','internal/web/static/charts.js','internal/web/static/nav.js','internal/web/templates/dashboard.html','internal/web/templates/layout.html',
 'web/src/pages/AppDetail.tsx','web/src/styles/theme.css','web/src/App.tsx','web/src/components/AppHeader.tsx','web/src/pages/Settings.tsx','web/src/pages/Dashboard.tsx'}
TEST={'web/src/workspaceWiring.test.ts'}
DEPS={'web/package.json','web/package-lock.json'}
CI={'.github/workflows/ci.yml','.github/workflows/release.yml'}
out=[]
for r in src['repositories']:
    wt=r['checkout']; head=r['head']; base=r['review_base']
    names=git(wt,'diff','--name-only',base,head).split()
    assert sorted(names)==sorted(r['changed_paths']), r['repository']
    cats={}; files=[]
    for p in names:
        if p.startswith('docs/ui-visual-refinement-2026-10-26/'): c='evidence (driver/manifests/CSV/screenshots; not runtime)'
        elif '/dist/' in p or p.startswith('web/dist') : c='generated bundle (rebuilt, byte-identical)' if r['repository']!='KyDrive-server' else 'generated'
        elif p in RUNTIME_READ: c='runtime source (diff read in full; behaviour executed)'
        elif p in TEST: c='test (diff read)'
        elif p in DEPS: c='upstream dependency bump via master merge (not certified; bundle reproduces from pinned lock)'
        elif p in CI: c='upstream CI (owner merge; not runtime)'
        else: c='docs (diff read)'
        cats[c]=cats.get(c,0)+1
        blob=None
        if not c.startswith('evidence'):
            try: blob=git(wt,'rev-parse',f'{head}:{p}').strip()
            except subprocess.CalledProcessError: blob='deleted'
            files.append({'path':p,'category':c,'head_blob':blob})
    out.append({'repository':r['repository'],'pr':r['pr'],'review_base':base,'head':head,'checkout_head_equals_pin':git(wt,'rev-parse','HEAD').strip()==head,
        'tracked_tree_clean':git(wt,'status','--porcelain','--untracked-files=no')=='','base_is_ancestor':subprocess.run(['git','-C',wt,'merge-base','--is-ancestor',base,head]).returncode==0,
        'changed_paths':len(names),'by_category':cats,'non_evidence_files':files})
inputs={}
for f in ['refinement-review-inputs.json','refinement-captures.json','refinement-source-inputs.json','refinement-notes-identity-response.json','refinements-operations-response.json',
          'runtime-source-review.json','runtime-source-review-v2.json','runtime-source-review-v3.json','review-responses.json','f4-f6-response.json','f7-response.json','f2-first-paint/f2-response.json',
          'release-scores.json','visual-review-inputs-v3.json']:
    p=f'{ROOT}/{f}'; inputs[f]=hashlib.sha256(open(p,'rb').read()).hexdigest() if os.path.exists(p) else 'absent'
json.dump({'inputs_sha256':inputs,'repositories':out},open('/tmp/claude-refine-review/evidence/coverage.json','w'),indent=1)
for o in out: print(o['repository'],o['head'][:8],o['checkout_head_equals_pin'],o['tracked_tree_clean'],o['base_is_ancestor'],o['changed_paths'],o['by_category'])
print(json.dumps(inputs,indent=0))
