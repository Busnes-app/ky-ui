# KyPost frontend lint review — 2026-10-26

Scope: `kypost-server/.claude/worktrees/ui-cohesion/frontend`. The `npm run lint` baseline was 0 errors and 18 warnings; after the change it reports 0 errors and 0 warnings and passes `--max-warnings 0`. All changes are uncommitted for the parent to commit.

Rule of thumb applied: an effect that runs on a trigger and reads other values without re-running on them uses React 19.3's `useEffectEvent`, so the linter still checks the rest of the deps. Only proven false positives get a disable: a next-line disable with the reason above it. No file-level or rule-level disables.

## Dispositions

| # | Location (`frontend/src/…`) | Warning | Disposition |
|---|---|---|---|
| 1 | `App.tsx:189` (now 159, 179, 186) | `chooseMailbox` missing | Valid. Wrapped as the `fallBackToPrimary` effect event (`chooseMailbox("")` + notice). Async answers now see the current sign-in and folder lists. The trigger deps are unchanged and the `live` guard is kept |
| 2 | `App.tsx:199` (now 199) | `chooseMailbox` missing | Valid. Same effect event. The `onMailboxGone` handler still drops ids other than the selection |
| 3 | `App.tsx:468` (now 460–475) | `loadMailboxFolders`, `mailboxFolderList` missing | Valid. Body moved unchanged into the `syncMailboxFolders` effect event. It still fires only on `[auth?.authenticated, selectedMailbox]`. Adding the per-render loaders to deps would re-read on every render, a fetch loop |
| 4 | `App.tsx:473` (now 477–481) | `loadArchiveFolders` missing | Valid. `reloadArchiveFolders = useEffectEvent(loadArchiveFolders)`. Triggers unchanged. `useFolderList`'s seq and mailbox guard still drops stale answers |
| 5 | `admin/sections/Logs.tsx:142` | `active` missing | Valid stale read. The mount-only list load read the initial `active`. Now it uses a functional `setActive(current => …)`, the frontend AGENTS rule for state derived from the current value. There is no visible change, because tabs render only after the list arrives |
| 6 | `admin/sections/MailAddresses.tsx:65` | `refreshGeneration.current` in cleanup | False positive. It is a generation counter, not a DOM node. The cleanup must bump the live value to drop in-flight reads, and copying it into a variable would break that. Next-line disable with the reason |
| 7 | `admin/sections/MailDomain.tsx:85` | `refreshGeneration.current` in cleanup | False positive, same as #6 |
| 8 | `admin/sections/Quarantine.tsx:70` | `readGeneration.current` in cleanup | False positive, same as #6 |
| 9 | `admin/sections/SenderBlocks.tsx:90` | `readGeneration.current` in cleanup | False positive, same as #6 |
| 10 | `components/CaptchaWidget.tsx:98` | Unused `eslint-disable` | Removed. The deps `[provider, callbackName]` are complete; `onToken` goes through `onTokenRef` |
| 11 | `hooks/useCompose.ts:269` | `composeFrom`, `composeMailbox`, `composeOpen`, `mailboxOf` missing | Valid. `fillMissingFrom` effect event, triggered only by `[mailboxes]` (fill From when the list arrives). Adding `composeFrom` would refill a From the user cleared. Mailbox pinning is unchanged |
| 12 | `pages/ContactsPage.tsx:154` | `refresh` missing | Valid. Mount-only load through `refreshOnMount = useEffectEvent(refresh)`. Still runs once |
| 13 | `pages/ReadPage.tsx:539` | `loadInbox` missing | Valid. `reloadInbox = useEffectEvent(loadInbox)` for the first load and the 15s poll. Still re-runs per folder `[mailbox]`. `loadIdRef`, the cursor reset and the cache clearing are unchanged |
| 14 | `pages/ReadPage.tsx:579` | `openEmailDetails` missing | Valid. Push deep-link opens through `openLinkedEmail = useEffectEvent(openEmailDetails)`. The triggers and the `message`/`tab` param stripping are unchanged, so the reader does not reopen |
| 15 | `pages/ReadPage.tsx:596` | `loadInbox` missing | Valid. The `mailbox-move-complete` listener calls `reloadInbox` |
| 16 | `pages/ReadPage.tsx:613` | `selected` missing | Valid. The guard now reads `selected?.messageId === undefined`, so the effect uses only its declared dep. `messageId` is a required string, so this is exactly `!selected`. Labels are still re-read per opened message, not on every record update |
| 17 | `pages/ReadPage.tsx:669` | `clockTick` unnecessary in `useMemo` | Root cause: a memo over an impure `Date.now()` that used `clockTick` only to bust its cache. Removed the memo, so `formatUpdatedLabel(lastLoadedAt, Date.now())` runs each render. The 30s tick (`const [, setClockTick]`) still forces the re-render, so "Updated …", snooze and scheduled times stay fresh. The label is never staler than before |
| 18 | `pages/ReadPage.tsx:719` | `setCurrentPage` missing | Valid. It is a raw `useState` setter from `usePagination` and is stable. It was added to deps, as `ContactsPage` already does. No extra runs |

No request-cancellation, mailbox-pinning, step-up or credential path changed. The four generation-counter guards are unchanged.

## Docs

`frontend/AGENTS.md` Verification: lint must now report 0 errors **and 0 warnings**. It also states the `useEffectEvent` vs. documented-disable rule.

## Checks (Node v26.12.1, pinned toolchain first on PATH)

- `node src/ky-ui/check-vendor.mjs`: ky-ui 0.3.0 vendor files verified
- `npm run lint -- --max-warnings 0`: 0 problems. `--no-inline-config` on the four admin files shows the new disables hide only the four ref warnings
- `npm run typecheck`: clean
- `npm test -- --run` (6G cap): 109 files, 1185/1185 passed. Changed flows are covered by `App.mailboxes.test.tsx` (mailbox fallbacks, "fills From once the mailbox list arrives after compose opened") and the `ReadPage*.test.tsx` suites (deep link, labels, move, polling). No new test was added: no behavior changed, and Logs (#5) has no observable difference
- `npm run build` (6G cap): passes. Only the documented `@hpke/common` "crypto externalized" notice appears
- `npm audit` (app and `lint/`): 0 vulnerabilities

## Noted, not changed

- The `CaptchaWidget.tsx` header comment says the repo has "no ESLint". That is stale, but outside the warning lines.
- The `ReadPage.tsx` folder-switch effect repeats its "Belt alongside…" comment block. It predates this change.
