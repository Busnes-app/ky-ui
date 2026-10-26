"""Assemble runtime-source-review-v3.json from coverage-v3.json and v3-f7-analysis.json."""
import json, datetime
from pathlib import Path

R = Path(__file__).resolve().parents[2]
E = R / 'v3-review-work/evidence'
cov = json.load(open(E / 'coverage-v3.json'))
ana = json.load(open(E / 'v3-f7-analysis.json'))
summary = {k: {x: v[x] for x in v if x != 'rows'} for k, v in ana['results'].items()}

doc = {
 'schema': 'ky-fleet-runtime-source-review/3',
 'date': '2026-10-26',
 'reviewed_at': datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds'),
 'reviewer_model': 'claude-opus-5-5',
 'reviewer': 'Claude Opus 5.5, independent review sub-agent; implemented none of the changes',
 'kind': 'source + behaviour review at fixed heads (phase 1); not visual acceptance',
 'inputs': 'runtime-review-inputs-v3.json',
 'prior_reviews': ['runtime-source-review.json', 'runtime-source-review-v2.json'],
 'verdict': 'F7 fixed and independently verified; no new introduced medium/blocker finding; phase 2 started',
 'phase2_started': True,
 'new_findings': [
  {'id': 'G2', 'severity': 'low', 'verdict': 'CONFIRMED', 'regression': False,
   'title': 'Filled danger button on some preserved legacy palettes is below 4.5:1 (pre-existing; identical before and after F7)',
   'evidence': 'v3-review-work/evidence/v3-f7-analysis.json non_suite_rest_head / non_suite_hover_px_head',
   'detail': 'Pulse/Base rest: paper 3.97, nord 4.69; hover (opacity 0.9) paper 3.49, nord 4.10, cyber 4.14, patina/oled 4.30. Drive rest: patina/oled 3.76, cyber 3.90, nord 4.09; hover 3.33-3.88. Fill, label and status tokens are byte-identical to the pre-F7 heads for these palettes, so F7 did not cause it. The brief requires exact legacy palettes, so any fix needs an owner decision. Not measured at review_base.',
   'blocks_this_round': False, 'blocks_9_acceptance': True},
  {'id': 'N1', 'severity': 'nit', 'verdict': 'CONFIRMED', 'regression': False,
   'title': 'F7 specs and UI-VERIFICATION call the focus state "keyboard focus" but use programmatic element.focus()',
   'detail': 'Label/fill are not focus-dependent in these CSS files, and my real Tab-key run matched :focus-visible in all 22 palettes x 3 products x 2 schemes with passing suite contrast, so the claim holds in effect. Wording/test-method only.'},
  {'id': 'N2', 'severity': 'nit', 'verdict': 'CONFIRMED', 'regression': False,
   'title': 'Drive browser specs reuse test-results/file-management-session.json across server runs',
   'detail': 'With a session file left by an earlier run in the same tree, the first authenticated POST (personal-workspace) on a fresh server returned non-OK (status not captured; cause unproven, stale cookie/CSRF is the likely path); my cross-check passed once I deleted my own scratch file. CI starts clean. Pattern copied from the existing file-management spec; test robustness only.'},
 ],
 'prior_findings_disposition': {
  'F1': 'Status text fix still in place: theme.css F1 block unchanged; --danger/--success computed values identical pre-F7 vs head for all 22 palettes x 3 products x 2 OS schemes; product ui.spec (includes status contrast and CSP) re-executed 4/4 on Pulse, Drive, Base heads.',
  'F2': 'Fixed; all DNS/Recovery/ky-ui files blob-identical to v2 heads (heads unchanged). Verdict carries by hash; not re-executed.',
  'F3': 'Unchanged pre-existing acceptance gap (hash identity); prevents 9/10 acceptance.',
  'F4': 'Fixed (Notes executed in v2; Identity source-only in v2). Heads unchanged; carries by hash.',
  'F5': 'Accepted recorded placement; unchanged.',
  'F6': 'Base/Pulse nav.spec re-executed at v3 heads: 2 passed, 2 skipped (by design) each. AppHeader files blob-identical. Recovery/Drive unchanged by hash.',
  'F7': 'FIXED, independently verified. Implementer specs re-run on my own builds from git archive of the pinned commits: head pass (Pulse min rest 5.89/hover 5.03; Drive 5.83/6.60; Base 5.83/4.97), pre-F7 parents fail on the same six light palettes (min 1.18-1.27). My own cross-check (computed colours + screenshot pixels + real Tab focus, all 22 palettes): suite min rest 5.83, hover 4.97, focus 5.83; suite labels equal --bg; fills, status tokens and Busnes/legacy labels unchanged versus pre-F7.',
  'G1': 'Unchanged pre-existing Yard gap (Yard head unchanged); prevents 9/10 acceptance.',
 },
 'f7_summary': summary,
 'other_checks': {
  'scope_of_new_changes': 'Only Base/Drive/Pulse moved. Runtime source change in each is one 3-line CSS rule (+2 comment lines) in web/src/styles/theme.css using the exact F1 :not() qualifier; .btn-danger-quiet is unaffected (different class token). Pulse/Base JS bundles byte-identical across the rename; only CSS bundles changed.',
  'generated_parity': 'Pulse and Base: vite build of the pinned head reproduced committed web/dist byte-for-byte. Drive dist is not committed; my build contains the rule.',
  'csp': 'No Go/server source changed in Pulse/Drive; Base only go.mod/go.sum and an auth test (upstream #70). Product ui.spec CSP-violation checks passed at all three heads.',
  'other_btn_danger_controls': 'Pulse Unpair and Remove webhook, Drive Revoke computer use the same class and rule; not rendered (static only).',
  'ports': '5391/5392 were free before each run and after; each run used the product harness own disposable server on 5391, serially.',
 },
 'upstream_backend_not_certified': [
  {'repository': 'ky-server-base', 'commits': '73cdf19 (#70) via 925bfe3', 'summary': 'TOTP key minimum: go.mod/go.sum dependency bumps, internal/auth/totp_strength_test.go, docs. Not reviewed.'},
  {'repository': 'KyIdentity-server', 'commits': '2d7fc73 (#166)', 'summary': 'carried from v2: backup deposit step-up removal. Not reviewed.'},
  {'repository': 'KyNotes-server', 'commits': '937573e (#111)', 'summary': 'carried from v2. Not reviewed.'},
  {'repository': 'KyYard-server', 'commits': 'd69a64de, 26305324, a4c4ea30 (#154)', 'summary': 'carried from v2: strong-crypto profile. Not reviewed.'},
 ],
 'executed_checks': [
  'Pins: 12/12 worktree HEAD == pin, tracked tree clean (ky-ui: only root-owned reviews/AGENTS.md modified), previous_review_head ancestor of head, listed changes == git diff prev..head (12/12).',
  'Separated upstream from F7: prev..merge-base diff empty for Pulse/Drive; Base only Go/docs (#70).',
  'coverage-v3.py: blob + sha256 of every prior-covered non-evidence file and every new file at the fixed commit.',
  'git archive of 6 commits (3 heads, 3 pre-F7 parents 0c71a33/a949b9a/925bfe3) into scratch; vite rebuild parity (Pulse, Base); Drive npm run build x2; go build x6.',
  'Implementer danger-button.spec.mjs on 6 builds: heads 2 passed/2 skipped; parents 2 failed/2 skipped.',
  'Reviewer v3-check.spec.mjs on 6 builds (22 palettes, OS light+dark, rest/hover/real Tab focus) + analyze-v3.py: problems [].',
  'Product ui.spec.mjs on Pulse/Drive/Base heads: 4 passed each.',
  'Product nav.spec.mjs on Pulse/Base heads: 2 passed, 2 skipped each.',
 ],
 'reported_not_reexecuted': [
  'Pulse 96 unit/20 browser, Base 10/8, Drive 100/50 full suites; make lint/tidy-check/test-race; release-notes checks.',
  'Notes CI Go HTTP 600s timeout and the targeted upload race rerun (root-owned).',
  'Current-head CI on PRs Pulse#49, Drive#82, Base#73 (root-owned).',
 ],
 'limits': [
  'Chromium only; 1280 px only for colour (390 px skipped by the specs, as designed).',
  'Pulse Delete is on a disabled synthetic app; Drive confirmation always cancelled; Base button is an injected diagnostic.',
  'Pixel max estimates the label core colour; a conservative median-of-far-pixels estimate is recorded too and runs ~1-2 points lower for every palette including untouched Busnes (anti-aliasing), so it is not a WCAG measure.',
  'Disabled .btn-danger (opacity 0.5) not measured.',
  'F2/F3/F4/F5 rest on hash identity this round.',
 ],
 'harness_dir': 'v3-review-work/harness',
 'evidence_dir': 'v3-review-work/evidence',
 'repositories': cov,
}
json.dump(doc, open(R / 'runtime-source-review-v3.json', 'w'), indent=1)
print('ok', len(cov))
