# Admin Server-Side Pagination — Design Spec

## Context

The admin dashboard's list pages (Users, Responders, SOS Alerts, Announcements) each
fetch their entire dataset once on mount and do search/filtering client-side against
the full in-memory array. This works fine at today's data volumes but doesn't scale:
as users/alerts/announcements accumulate, these pages become long, slow-to-render
scrolls.

Two backend endpoints already solve this correctly for their own resource:
`sos.service.listForAdmin` and `historyService.list` both implement the same
`{ resource[], total, page, limit }` contract, with `page`/`limit` clamped
(`page > 0 ? floor(page) : 1`, `limit > 0 ? min(floor(limit), 100) : 20`) and
Prisma's `skip`/`take` + a parallel `count()`. This spec generalizes that proven
pattern to the remaining three list families: Users, Responders (a filtered view of
the same Users endpoint), and Announcements.

This follows two prior bounded changes in this same session: (1) dashboard widgets
(Recent Incidents, Recent Activity) already got capped row counts + internal scroll,
and (2) Evacuation Centers/Witnesses/Resources were evaluated and excluded — see
Non-goals.

## Goals

- Users, Responders, SOS Alerts, and Announcements pages fetch one page of data at a
  time from the backend instead of everything at once.
- Search and filters (name/email search on Users, duty/unit/search on Responders,
  the New/Acknowledged/Resolved status filter on SOS Alerts, title/content search +
  priority filter on Announcements) run server-side against the full dataset, not
  just the currently-loaded page — so a search finds a match anywhere, not just on
  the page you're viewing.
- One shared `<Pagination>` UI component (page-size select: 10/25/50, plus
  Previous | 1 2 3 … | Next) used identically across all four pages.
- Consistent backend contract: every affected endpoint returns
  `{ success, <resource>[], total, page, limit }`.

## Non-goals

- **Emergencies / Incident Reports.** These merge a live feed (`GET /incidents`,
  unpaginated by design) with a paginated history feed
  (`GET /admin/history`) via `useEmergenciesWithHistory`. Paginating a merge of two
  independently-paginated sources is a different problem and gets its own spec if
  it's ever needed.
- **Evacuation Centers.** Already fully wired (`useEvacuationCenters`), and it's an
  inherently small, bounded dataset — physical shelters in one municipality, not an
  ever-growing log. Pagination doesn't earn its cost here.
- **Witnesses / Resources.** Removed from the app entirely in a prior change this
  session — not applicable.
- **URL-synced state.** Page/search/filter state lives in component state
  (`useState`), not the URL query string. Reload or navigating away resets to page 1
  — an accepted tradeoff to keep this project's scope contained. Can be revisited
  later if bookmarking/sharing filtered views becomes a real need.
- **Any new data-fetching library.** Stays consistent with this codebase's existing
  hand-rolled `useEffect` + `apiFetch` pattern; no TanStack Query or similar.

## Architecture

```
┌───────────────────────────────┐  GET /admin/users?search=&role=&page=&limit=   ┌──────────────────────────┐
│  cordova-riskq-admin           │  GET /admin/sos-alerts?alertStatus=&search=... │  CordovaRiskQ-Bacnkend    │
│                                  │  GET /admin/announcements?search=&...          │                            │
│  usePaginatedQuery() (shared)  │ ───────────────────────────────────────────▶  │  admin.service /          │
│    page, pageSize, search       │ ◀───────────────────────────────────────────  │  sos.service /            │
│    debounced refetch            │   { users/alerts/announcements, total,          │  announcement.service     │
│                                  │     page, limit }                              │  (skip/take + count())    │
│  <Pagination /> (shared UI)     │                                                 │                            │
└───────────────────────────────┘                                                 └──────────────────────────┘
```

### Shared frontend primitives

**`usePaginationState()`** (new, `src/hooks/usePaginationState.ts`) — a small hook
owning `page`, `pageSize`, and `search` state, with:
- `setPage`, `setPageSize` (resets `page` to 1 when page size changes), `setSearch`
  (debounced 300ms before it actually changes the returned value, so typing doesn't
  fire a request per keystroke).
- Resets `page` to 1 whenever `search` (or a filter, passed by the caller) changes —
  landing on page 4 of a new search with only 2 result pages would be confusing.

Each affected hook (`useUsers`, `useResponders`, `useSosAlerts`, `useAnnouncements`)
takes this state as input, includes it in the `useEffect` dependency array that
triggers the fetch, and returns `total`/`totalPages` alongside its existing
`loading`/`error`. Client-side `useMemo` filtering is removed from each table
component — filtering is now a request parameter, not a render-time computation.

**`<Pagination>`** (new, `src/components/ui/Pagination.tsx`) — presentational,
takes `page`, `totalPages`, `pageSize`, `onPageChange`, `onPageSizeChange`. Renders
the page-size `<select>` (10/25/50) and Previous | 1 2 3 … | Next (ellipsis-collapsed
for more than ~7 pages: always show first, last, current ±1). Disabled
Previous/Next at the boundaries. Matches the visual style of the existing
`statusFilters`/`priorityFilters` pill buttons already used on these pages.

### Backend changes

All four follow the exact `sos.service.listForAdmin` shape: clamp `page`/`limit`,
build a `where` clause from the provided filters, run `count()` and `findMany()` in
parallel, return `{ success, <resource>, total, page, limit }`.

- **`GET /admin/users`** (`admin.service.listUsers`) — add `search` (name/email
  `contains`, case-insensitive), `role`, `page`, `limit`. Used by both `useUsers`
  (no `role` filter) and `useResponders` (`role=responder`).
- **Responders' duty/unit filters** — add `duty` (`isOnDuty` boolean) and `unit`
  query params to the same `/admin/users` endpoint, since they're just additional
  `where` clauses on the same underlying query.
- **`GET /admin/sos-alerts`** (`sos.service.listForAdmin`) — add `search` (matches
  reporter name or the linked incident's `locationLabel`) and `alertStatus`
  (`New`/`Acknowledged`/`Resolved`, the same derived bucket the frontend already
  computes from `incidentStatus`). Since `SosAlert` has no direct relation field to
  `Incident` in the Prisma schema, this reuses the existing two-step pattern already
  in this file for the `barangay` filter: look up matching `Incident` rows by status
  bucket, collect their `sosAlertId`s, then filter `SosAlert` by
  `id: { in: sosAlertIds }`.
- **`GET /admin/announcements`** (`announcement.service.listForAdmin`) — add
  `search` (title/content `contains`), `priority`, `page`, `limit`, and drop the
  current hardcoded `take: 50`.

## Data flow (Users page example)

1. User types in the search box → `usePaginationState`'s debounced `search` updates
   300ms after the last keystroke → `page` resets to 1.
2. `useUsers({ search, role, page, pageSize })`'s effect re-fires, calls
   `GET /admin/users?search=...&page=1&limit=25`.
3. Backend returns `{ users, total: 143, page: 1, limit: 25 }`.
4. Hook computes `totalPages = Math.ceil(total / limit)` and returns it.
5. `<Pagination totalPages={6} page={1} .../>` renders; clicking "2" calls
   `setPage(2)`, which re-triggers the same effect with `page=2`.

## Error handling

Unchanged from the existing per-hook pattern: fetch failures set `error`, rendered
by each table's existing error state (`RecentIncidents.tsx`-style
loading/error/empty branches, already present on every affected table). A failed
page-change attempt leaves the previously-loaded page visible with the error message
shown below it, rather than clearing the table — avoids a jarring blank state from a
transient network blip.

## Testing

- Backend: unit tests (`node:test`, matching `incidentRoster.test.ts`'s style) for
  any new pure logic — specifically the SOS Alerts `alertStatus` → incident-status-
  bucket mapping, since that's the one piece with real branching logic. The
  skip/take/count wiring itself mirrors already-shipped, unit-tested-elsewhere-by-
  precedent code (`sos.service.listForAdmin`), so no new tests needed for that part.
- Frontend: no test runner configured in this repo (confirmed in a prior session) —
  verified via `npm run build` + `npm run lint`, plus manual reasoning through the
  pagination math (page 1 of 0 results, exact multiples of page size, last partial
  page).
