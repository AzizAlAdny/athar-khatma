# tasks.md — Needs Feature (Work in Progress)

> Follows `rules/karpathy-guidelines.mdc`: surgical changes, simplicity first, goal-driven verification.

## Context
Uncommitted changes implement the "Needs" feature:
- Seekers manage and delete their own needs.
- Khatma users browse community needs and pledge a gift.

## Completed (uncommitted)
- [x] API: `NeedController::destroy()` — delete a need; seekers limited to their own, admins any. (`athar-api/app/Http/Controllers/Api/NeedController.php`)
- [x] API route: `DELETE /needs/{id}` (auth). (`athar-api/routes/api.php`)
- [x] Client API: `deleteMyNeed(id)` -> `DELETE /needs/{id}`. (`client/src/services/api.ts`)
- [x] Seeker "My Needs" page: list own needs + delete with confirm. (`client/src/pages/needs/index.tsx`)
- [x] Khatma "Browse Needs" page. (`client/src/pages/needs/browse.tsx`)
- [x] Nav/sidebar/header + home CTAs wired to `/needs/browse`. (`Sidebar.tsx`, `Header.tsx`, `pages/index.tsx`)

## Critical bug fixed (was blocking commit)
`client/src/pages/needs/browse.tsx` did not compile:
1. Orphaned JSX after the component — a loading spinner `<div>` plus a dangling `) : needs.length > 0 ? (` at module top level (leftover from an interrupted ternary restructure).
2. In-component ternary was inverted: `{loading ? (<needs grid>) : (<empty state>)}` — showed the grid while loading (no data yet) and always the empty state once loaded.

### Fix applied (surgical)
Restored the intended three-way ternary:
`{loading ? (<spinner>) : needs.length > 0 ? (<needs grid>) : (<empty state>)}`
and removed the orphaned trailing block. Only the opening branch + the orphan were touched.

## Known limitation (intentionally NOT addressed — no speculative work)
- "تقديم العطاء" (pledge) in `browse.tsx` is client-side only; no fulfillment API exists yet. Left as-is per guideline #2.

## Verification
- [ ] `npx tsc --noEmit` (in `client/`) reports no errors for `browse.tsx`.
- [ ] Manual: browse page shows spinner while loading, grid when needs exist, empty state otherwise.
