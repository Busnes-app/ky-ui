# Runtime source review: Ky UI cohesion PRs (2026-10-26)

An independent adversarial pass over every changed runtime source file in the four PRs. It
answers the CONTRIBUTING requirement for an adversarial review, and it covers what the
autonomous Calendar `4cacdb7` security review could not, because that review's input was
truncated by generated bundles. It does not critique aesthetics. Reviewer: Claude Opus 5.5
(`claude-opus-5-5`), acting as the council's runtime-source review sub-agent.

## Reviewed heads

| Repo | Worktree | Base | Head | PR |
|---|---|---|---|---|
| ky-ui | `ky-ui/.claude/worktrees/ui-cohesion` | `41daa93` | `4c97460` | Busnes-app/ky-ui#18 |
| KyPost-Server | `kypost-server/.claude/worktrees/ui-cohesion` | `3037caf8` | `d1395936` | Busnes-app/KyPost-Server#480 |
| KyCalendar | `KyCalendar/.claude/worktrees/ui-cohesion` | `9a527d2` | `95be60c` | Busnes-app/KyCalendar#79 |
| KyMessage-Server | `KyMessage-Server/.claude/worktrees/ui-cohesion` | `0514749` | `e3556c4` | Busnes-app/KyMessage-Server#93 |

All three product worktrees were clean at these heads. ky-ui held only this untracked council
directory.

Contracts read: the workspace `AGENTS.md`, each repo's `CONTRIBUTING.md` adversarial-review
section (KyPost's "Every PR Must Pass Hostile AI Code Review" in full), `frontend/AGENTS.md`
(KyPost), `reviews/AGENTS.md` (ky-ui) and the `typescript-best-practices` skill.

## Verdict

**2 actionable findings.** F1 is a contrast regression on the primary navigation of two
products, and I recommend fixing it before Calendar #79 and Messages #93 merge. F2 is a
keyboard focus loss in the KyPost reader. No security, auth-boundary or data-loss defects were
found.

| # | Severity | Where | Summary |
|---|---|---|---|
| F1 | High | ky-ui `src/navigation.css:4`, with KyCalendar `web/src/styles/theme.css:242` and KyMessages `web/src/styles/theme.css:204` | Unselected nav rows hover to an accent fill at 2.5:1 (light) and 1.9:1 (dark) |
| F2 | Medium | KyPost `frontend/src/pages/ReadPage.tsx:1789` | The reader's Show/Hide Remote Content button remounts on activation, so keyboard focus falls to `<body>` |

## Findings

### F1 — High: nav hover in KyCalendar and KyMessages paints the accent behind body ink

**Cause.** ky-ui `src/navigation.css:4` moved the hover guards into `:where()`, which drops
the shared hover from specificity (0,4,0) to (0,2,0). The intent was to keep hover below the
selected state, and for that it works. But both products have a global primary-button hover
at (0,2,1), `button:hover:not(:disabled), .btn:hover { background: color-mix(in srgb,
var(--accent) 86%, var(--ink-strong)); }`:

- In KyCalendar it is pre-existing, at `web/src/styles/theme.css:242`.
- In KyMessages this PR adds it, at `web/src/styles/theme.css:204`. It replaces `button:hover
  { opacity: .9 }`.

Each product's own `.app-nav button:hover` is also (0,2,1), at KyCalendar `theme.css:153` and
KyMessages `theme.css:135`, but it sits earlier in the same sheet, so the global rule wins.
Before this change the shared (0,4,0) hover beat both rules.

Selected rows are unaffected, because `[class].ky-nav-item[aria-current="page"]` is (0,3,0).
KyPost is unaffected: its primary hover is already `:where(button):hover:not(:disabled)`
(`frontend/src/styles.css:1117`), and `.sidebar a:hover` gives the nav its tint. The other
consumers listed in `consumers.json` were checked in their local default checkouts (KyDNS,
KyYard, ky-server-base; a grep found no global `button:hover` rule in KyRecovery, KyIdentity or KyNotes).
Their global hover only sets opacity or filter, so the next sync does not regress them.

**Measured** in real Chromium (Playwright 1280×900). Each product's source CSS was loaded in
its import order, the pointer was over an unselected `.ky-nav-item` inside `.app-header
.app-nav`, and the reading was taken after the 150 ms transition:

| Build | Busnes Light hover bg / ratio | Busnes Dark hover bg / ratio |
|---|---|---|
| KyCalendar base `9a527d2` | 242,239,231 / **13.98** | 43,56,58 / **10.57** |
| KyCalendar head `95be60c` | 168,59,26 / **2.53** | 245,149,114 / **1.94** |
| KyMessages base `0514749` | 242,239,231 / **13.98** | 43,56,58 / **10.57** |
| KyMessages head `e3556c4` | 168,59,26 / **2.53** | 245,149,114 / **1.94** |
| Either head with the fix below | Calendar 13.98, Messages 12.27 | 10.57 |

The heads fail the shared contract's contrast gate (`skills/ky-suite-ui/references/rubric.md:132`,
text ≥ 4.5:1 in every shipped theme). They also break accent discipline: orange belongs to the
primary action, the selection and focus (`rubric.md:83`, `design-contract.md:35`). ky-ui's
`browser/theme.spec.js` hover check cannot see this, because its fixture has no global button
rule.

**Verify.** Sign in to KyCalendar or KyMessages at ≥ 721 px in either Busnes theme and hover
any unselected sidebar item. It fills orange with low-contrast text. Scripted: in a Playwright
page that links the product's `theme.css` (plus `ui.css` for Calendar), `ky-ui/tokens.css`
and `ky-ui/navigation.css`, hover `.app-nav .ky-nav-item:not(.active)`, wait 500 ms, and read
`getComputedStyle(el).backgroundColor`.

**Smallest fix**, one selector in each product. Keep its specificity at (0,2,1) and take nav
items out of it:

```css
button:not(:where(.ky-nav-item)):hover:not(:disabled), .btn:hover { … }
```

I verified this on temporary copies. Unselected hover returns to the `.app-nav button:hover`
surface, at the ratios in the last table row. Selected-row hover is unchanged: Calendar
14.36/13.03, Messages 16.06/13.03, identical to head. `.btn-secondary`, `.btn-ghost` and
`.btn-danger` hover keep their higher-specificity rules. Please add a product browser
assertion for unselected-row hover contrast, because the shared fixture cannot catch this.

### F2 — Medium: the reader's remote-content toggle drops keyboard focus

`ReadPage.tsx:1781–1789` builds the reader tools from an array and keys each button by
`label`. The remote-content tool's label flips between "Show Remote Content" and "Hide Remote
Content" when it is activated. The new key makes React unmount that button and mount a new
one, so a keyboard or screen-reader user who presses Enter or Space on it loses focus to
`<body>` inside the modal reader. The base code rendered this as a fixed JSX button, so focus
was kept. The other tools have constant labels and are unaffected.

**Verify.** Open a message, Tab to "Show Remote Content" and press Enter: focus is no longer on
the toggle (`document.activeElement === document.body`). I reproduced the mechanism with the
PR's own `react`, `react-dom` and `jsdom`: a focused button keyed by its changing label
reports `same node: false`, with `activeElement` `BODY`. The existing `ReadPage.test.tsx`
clicks the toggle by role name but never asserts focus.

**Smallest fix.** Give each tool a stable key. For example, add `key: "remote"` (and a fixed
key for each other tool) to the array entries and use `key={key}`, or key by index. Keep
`aria-label`/`label` dynamic. Optionally assert `toHaveFocus()` after the toggle in the
existing remote-content test.

## Checklist outcomes (no finding)

- **Roles and auth boundaries.** KyMessages `TwoFactorSetup` moved inside `Settings` as
  `children` and stays under `isAdmin && activeTab === 'settings'`. KyCalendar admins get an
  empty slot (`:empty { display: none }`) and never mount `CalendarPage`. KyPost's account
  block only displays `auth.username` and an Admin label. No route or guard changed.
- **Stale requests and effect cleanup.** Every new or changed effect keeps its abort or
  cancelled guard: KyPost labels `[selected?.messageId]`; KyMessages Health, Dashboard and
  Audit use `AbortController`. KyCalendar `fetchEvents` sets `eventsFailed` from late
  callbacks exactly as the pre-existing `setError` does. FullCalendar drops stale results by
  `fetchId`, so a slow, superseded failure can still flag the list. That is a pre-existing
  pattern, and the new text matches the alert it accompanies, so it is not raised.
- **`useEffectEvent` trigger semantics** (KyPost React ^19.3.1). `syncMailboxFolders`,
  `reloadArchiveFolders`, `reloadInbox`, `openLinkedEmail`, `refreshOnMount`,
  `fillMissingFrom` and `fallBackToPrimary` are called only from effects or from callbacks
  those effects register (interval, window listener, `onMailboxGone`). The dependency lists
  keep the base triggers. None is called during render or passed down. Polling now reads the
  current `loadInbox`, which fixes a stale closure.
- **Re-render loops.** KyCalendar's inline `views` and new `loading` callback re-run
  FullCalendar's `resetOptions` on each render (the wrapper always did), but a `NOTHING`
  action never refetches (`reduceEventSources`), so no loop. KyPost's `setCurrentPage` dep is
  a `useState` setter.
- **Stable portal and sidebar drafts.** There is one `createPortal` target (`setSidebarSlot`
  plus a `useCallback` ref with stable deps). The `<details>` is controlled by `open`, and a
  closed state keeps its children mounted. Escape returns focus to the summary. This matches
  the recorded `resize.spec.mjs`.
- **Scroll-cue observers.** Scroll, `ResizeObserver` and `MutationObserver` (childList and
  subtree) are all disconnected in cleanup. `data-cue` writes are attribute changes, which are
  not observed, so there is no feedback loop.
- **Native details controls.** KyCalendar's summary `preventDefault` plus state toggle keeps
  the native button role and `aria-expanded`. KyPost Contacts derives `open` from the stored
  contact, not the live form. React writes `open` only when that derived value changes, so a
  user-opened group stays open while typing.
- **Keyboard activation and accessible names.**
  - FullCalendar's `createAriaKeyboardAttrs` handles Enter and Space, so `role="button"` on
    grid events is honest.
  - Multi-column day headers keep FullCalendar's full-date `aria-label` (`buildNavLinkAttrs`).
  - Sign out (Calendar, Messages) and Logout (Post) labels are clipped, not `display: none`,
    on phones.
  - Icon-only Close, Plus and tool buttons carry an `aria-label`.
  - The SVG icons are `aria-hidden`.
- **Contact collapsed-group validation.** The form-level `onInvalidCapture` opens the
  enclosing `<details>` synchronously, during the `invalid` dispatch. Every field stays in the
  DOM.
- **PGP, remote images, sandbox and cancellation.** `showImagesFor` (per message),
  `processEmailHtml`, `EmailBodyFrame` and `FRAME_SANDBOX` are unchanged. The decrypted
  subject moved to the dialog title through the same `decrypted[...]` lookup. There is no new
  HTML sink.
- **Health report clearing and network recheck.** A failed check sets `report` to null, and
  `NetworkCheck key={round}` remounts on "Check again". Tests cover both.
- **Offline Matrix state.** `unreachable()` matches only a `TypeError` from fetch
  (Chrome, Firefox and Safari wording). AbortError is a `DOMException` and is excluded.
  Dashboard hides the sync row when the server is unreached and does not invent one.
- **Badge state accuracy.** Backup's local copies show muted for 0 copies or an unknown list
  and danger on error. The schedule badge is success only when a backup can actually run.
- **Scoped consumer sync.** `--consumer` without `--check` now writes only the named
  consumers, after the same symlink, regular-file and escape preflight. The test proves an
  unrelated consumer's bytes stay untouched.
- **Test waits.** The 5 s `findBy` timeouts (KyPost `App.mailboxes`, `App.mobileSettings`,
  `App.lazy`; KyCalendar `App.test`) wait for the same content assertions, with no weakened
  matcher, mock or runtime change. They can absorb latency but cannot hide a wrong render.

Considered and not raised:

- The conditional KyPost batch bar unmounts after an action. The base disabled the focused
  button instead, which also drops focus under HTML focus fixup, so it is not a regression.
- Phone Contacts hides the "Contact Info" and "Actions" headers with `display: none` on a
  `display: grid` row. The cell text is self-describing, and the WebKit table-semantics impact
  is unproven here.
- Settings and Health panels now render an `h1`, so some routes have a second `h1`. That is
  not a WCAG failure.

## File inventory and source coverage

Every runtime file in each `base..head` diff was read in full diff form, with callers or
context opened where a finding was credible.

- **Excluded from reading:** the generated `web/dist/**` (Calendar: 8 assets plus
  `index.html`; Messages: 4 assets plus `index.html`), `reviews/**` and the vendor copies.
- **Not reviewed for runtime correctness:** docs (`AGENTS.md`, `CHANGELOG.md`, `PLAN.md`,
  `README.md`, `UI-VERIFICATION.md`, `skills/**`).

**ky-ui (8 runtime/test/package files):** `src/navigation.css`, `src/tokens.css`,
`scripts/sync-consumers.mjs`, `consumers.json`, `package.json` and `package-lock.json` (version bump only),
`test/sync.test.js`, `browser/theme.spec.js`.

**KyPost (44 runtime/test files):**
- Shell: `App.tsx`.
- Pages: `pages/ReadPage.tsx`, `pages/ContactsPage.tsx`, `pages/read/icons.tsx`,
  `pages/AppsPage.tsx`, `pages/ScheduledPage.tsx`, `pages/SecurityPage.tsx`,
  `pages/admin/ServerPanel.tsx`, and `pages/settings/{Appearance,Automation,Mail,Notifications}Panel.tsx`.
- Components and hooks: `components/{ComposeWindow,ReauthGate,CaptchaWidget}.tsx`,
  `hooks/useCompose.ts`.
- Admin sections: `admin/sections/{ApplicationRuntime,AssignMailbox,LabelRules,Logs,MailAddresses,MailDefaults,MailDomain,Quarantine,SenderBlocks}.tsx`.
- Settings sections: `settings/sections/{CardDavClient,EmailServer,Filters,MyLabels,NotificationPrefs,PromptTuning,SystemHealth}.tsx`.
- Styles and config: `styles.css` (all added and removed lines), `test/setup.ts`,
  `vite.config.ts`.
- Tests: `App.{lazy,mailboxes,mobileSettings}.test.tsx`,
  `pages/{ContactsPage,ReadPage}.test.tsx`, `settings/sections/SystemHealth.test.tsx`.
- Vendor: `ky-ui/{VERSION,navigation.css,tokens.css}`.

**KyCalendar (18 runtime/test files):**
- App and components: `App.tsx`, `components/{AppHeader,CalendarSidebar,EventDialog}.tsx`.
- Page: `pages/CalendarPage.tsx`.
- Styles: `styles/{calendar,theme,ui}.css`.
- Test setup and tests: `test-setup.ts`, `App.test.tsx`, `pages/CalendarPage.test.tsx`,
  `browser/{calendar,groups,month,resize}.spec.mjs`.
- Vendor: `ky-ui/{VERSION,navigation.css,tokens.css}`.

**KyMessages (29 runtime/test files):**
- App and API: `App.tsx`, `api.ts`.
- Components: `components/{AppHeader,BrandingPanel,CaptchaWidget,ChatNotSetUp,NetworkCheck,TwoFactorSetup}.tsx`.
- Pages: `pages/{Agents,Audit,Backup,ChangePassword,Dashboard,Health,Login,MemberHome,Rooms,SCIMAdmin,Settings,Users}.tsx`.
- Styles: `styles/theme.css`.
- Tests: `components/{AppHeader,NetworkCheck}.test.tsx`, `pages/{Backup,Dashboard,Health}.test.tsx`.
- Vendor: `ky-ui/{VERSION,navigation.css,tokens.css}`.

FullCalendar 6.1.22 internals were read where behaviour depended on them: `getSegAnchorAttrs`,
`createAriaKeyboardAttrs`, `buildNavLinkAttrs`, `resetOptions`, `processRawCalendarOptions`,
`reduceEventSources` and `isSourceDirty`.

## Checks

**Run in this pass** (results above; scratch files only under `/tmp/kyreview-probe`, outside
every repo):

| Check | Result |
|---|---|
| Vendor bytecheck: `node scripts/sync-consumers.mjs --check --paths=/dev/stdin` with `--consumer=` KyPost-Server, KyCalendar and KyMessage-Server pointed at these worktrees | `Checked 3 consumers at 0.3.0`, exit 0 |
| SHA-256 of all 8 vendor files in each product | Identical across all three products. The 5 copied files match ky-ui `src/` byte for byte. |
| Chromium nav-hover probe on head, base and the proposed fix (F1) | Numbers in the F1 table |
| React and jsdom key-remount focus probe with KyPost's own deps (F2) | Focus moved to `BODY` |
| KyPost vitest: `ReadPage`, `ContactsPage`, `App.mobileSettings`, `App.mailboxes`, `App.lazy` | 5 files, 39 tests passed |
| KyCalendar vitest: `CalendarPage`, `App` | 2 files, 18 tests passed |
| KyMessages vitest: `Health`, `Backup`, `Dashboard`, `AppHeader`, `NetworkCheck` | 5 files, 39 tests passed |

All vitest runs used `systemd-run --user --scope -p MemoryMax=6G -p MemorySwapMax=0`.

**Recorded by the implementers, not re-run here:**

- Shared: 8 unit, 20 browser and zero-warning lint.
- KyPost: 1189 full suite, typecheck, lint, build and audit 0.
- KyCalendar: 155 `make ci`, 28 Chromium and a repeatable build.
- KyMessages: 157 `make ci`, 7 Chromium/Firefox and 48 state/focus/contrast/overflow.
- Real PR CI covers backend, Docker, Postgres and relay.

## Limits

- **Generated bundles.** `web/dist` was not read. Bundle-to-source correspondence rests on the
  recorded local byte-identical builds and real PR CI, not on this pass.
- **F1 harness.** F1 was measured on a minimal page with each product's real stylesheets and
  real nav classes, not on the signed-in app. The cascade is fully determined by those
  stylesheets.
- **Contacts validation in real browsers.** The open-on-invalid behaviour is proven in jsdom
  only. Real Chromium, Firefox and WebKit focus/bubble behaviour for a control inside a
  just-opened `<details>` is unproven.
- **Browsers not exercised.** WebKit and assistive technologies were not run.
- **KyPost load failures.** The 7/23 under-load failure causation is still unresolved. This
  pass found no render loop or effect retrigger in the diff that would explain it, but that
  does not prove a cause.
- **Hand-off.** MySlop returns 401 (known), so no hand-off was posted.
