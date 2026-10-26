import json, subprocess, hashlib
D='/home/yoshi/git/busnes.app/ky-ui/.claude/worktrees/fleet-appearance/'
inp={r['repository']:r for r in json.load(open(D+'reviews/2026-10-26-fleet/runtime-review-inputs-v2.json'))['repositories']}
cons=json.load(open(D+'consumers.json'))
def run(*a): return subprocess.run(a,capture_output=True,text=True).stdout
src={}
for line in run('git','-C',D,'ls-tree','f9fb930','src/').splitlines():
    meta,path=line.split('\t'); src[path.split('/')[-1]]=meta.split()[2]
sets={}
for repo,ap in cons.items():
    r=inp[repo]; c=r['checkout']
    t={}
    for line in run('git','-C',c,'ls-tree',r['head'],ap+'/').splitlines():
        meta,path=line.split('\t'); t[path.split('/')[-1]]=meta.split()[2]
    sets[repo]=t
    shared={f:(t.get(f)==src.get(f)) for f in ['tokens.css','navigation.css','appearance.css','appearance-themes.css','themes.js','themes.d.ts','theme.js','theme.d.ts','check-vendor.mjs']}
    print(repo, sorted(t), 'src-equal', all(shared.values()), [f for f,v in shared.items() if not v])
first=next(iter(sets.values()))
print('all consumers identical tree:', all(s==first for s in sets.values()))
print('generated blobs', {k:first[k][:10] for k in ['palettes.ts','palettes-browser.js','themes-browser.js','VERSION']})
