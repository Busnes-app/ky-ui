import json, subprocess, sys
D='/home/yoshi/git/busnes.app/ky-ui/.claude/worktrees/fleet-appearance/reviews/2026-10-26-fleet/'
inp=json.load(open(D+'runtime-review-inputs-v2.json'))
def g(repo,*a):
    r=subprocess.run(['git','-C',repo,*a],capture_output=True,text=True); return r.returncode, r.stdout.strip()
out=[]
for r in inp['repositories']:
    c=r['checkout']; h=r['head']; b=r['review_base']; p=r['previous_review_head']
    rec={'repository':r['repository'],'checkout':c,'head':h}
    rec['head_exists']=g(c,'cat-file','-e',h+'^{commit}')[0]==0
    rec['worktree_HEAD']=g(c,'rev-parse','HEAD')[1]
    rec['worktree_at_pin']=rec['worktree_HEAD']==h
    rec['merge_base_eq_review_base']=g(c,'merge-base',b,h)[1]==b
    rec['prev_is_ancestor']=g(c,'merge-base','--is-ancestor',p,h)[0]==0
    rc,names=g(c,'diff','--name-only',p,h)
    names=set(names.splitlines()) if names else set()
    listed=set(r['new_changes_since_review'])
    rec['diff_prev_head_count']=len(names); rec['listed_count']=len(listed)
    rec['unlisted_in_diff']=sorted(names-listed); rec['listed_not_in_diff']=sorted(listed-names)
    rec['status_dirty']=g(c,'status','--porcelain','--untracked-files=no')[1][:500]
    out.append(rec)
json.dump(out,open('/tmp/claude-fleet-review-v2/pins.json','w'),indent=1)
for x in out:
    print(x['repository'],'exists',x['head_exists'],'atpin',x['worktree_at_pin'],'mb',x['merge_base_eq_review_base'],'prevAnc',x['prev_is_ancestor'],'diff',x['diff_prev_head_count'],'listed',x['listed_count'],'unlisted',len(x['unlisted_in_diff']),'missing',len(x['listed_not_in_diff']),'dirty',bool(x['status_dirty']))
