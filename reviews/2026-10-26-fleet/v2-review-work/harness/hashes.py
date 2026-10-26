import json, subprocess
D='/home/yoshi/git/busnes.app/ky-ui/.claude/worktrees/fleet-appearance/reviews/2026-10-26-fleet/'
inp={r['repository']:r for r in json.load(open(D+'runtime-review-inputs-v2.json'))['repositories']}
prior=json.load(open(D+'runtime-source-review.json'))
def blob(repo,rev,path):
    r=subprocess.run(['git','-C',repo,'rev-parse',f'{rev}:{path}'],capture_output=True,text=True)
    return r.stdout.strip() if r.returncode==0 else None
res={}
for pr in prior['repositories']:
    name=pr['repository']; v=inp[name]; c=v['checkout']
    rows=[]
    for f in pr['files']:
        if f['coverage']=='omitted': continue
        a=blob(c,v['previous_review_head'],f['path']); b=blob(c,v['head'],f['path'])
        rows.append({'path':f['path'],'prior_coverage':f['coverage'],'blob_prev':a,'blob_head':b,'unchanged':a==b and a is not None})
    res[name]=rows
    ch=[r for r in rows if not r['unchanged']]
    print(name,'prior-covered',len(rows),'unchanged',len(rows)-len(ch),'changed:',[ (r['path'],r['prior_coverage']) for r in ch])
json.dump(res,open('/tmp/claude-fleet-review-v2/prior-hashes.json','w'),indent=1)
