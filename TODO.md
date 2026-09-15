# TODO

Running tracker of what's real (backend-wired) vs. still mock on the admin side.
See `PROGRESS.md` for the one-time visual redesign summary this builds on.

## Real (backend-wired)

- [x] Login — real `POST /api/auth/login` (same endpoint the mobile app uses; requires the account's `User.role === "admin"`), JWT stored in `localStorage`, dashboard layout redirects to `/login` when unauthenticated. Note: the backend also has a separate `Admin` table + `POST /api/admin-auth/login` (`admin-auth.*`), but the admin frontend doesn't use it — untouched, possibly a parallel/abandoned initiative.
- [x] Users — list (`GET /admin/users`), search (name/email/ID), role change citizen <-> responder (`PATCH /admin/users/:id/role`), unit assignment (BDRRMO/MDRRMO) on promotion
- [x] Responders — list (derived from `/admin/users`, filtered to `role: "responder"`), duty status + unit columns, duty/unit filters, search
- [x] Emergencies (list) — real via `useEmergenciesWithHistory()`, which merges live incidents (`useEmergencies()` -> `GET /incidents`, non-terminal only) with historical ones (`GET /admin/history`, terminal-only), so all four status stat cards and filters (Active/Responding/Resolved/Cancelled) populate correctly
- [x] Emergencies (detail) — real via `useEmergency(id)` -> `GET /incidents/:id`, works for any incident including terminal ones
- [x] Dashboard: Recent Incidents widget — real, reuses `useEmergencies()` (live-only by design, unaffected by the history merge)
- [x] Dashboard: Responder Status donut — real, derived from `useResponders()` (On Duty / Off Duty; the old mock "Busy" category was dropped, the backend only tracks a boolean duty status)
- [x] Incident Reports — real, uses the same `useEmergenciesWithHistory()` merge as Emergencies so its Active/Responding/Resolved/Cancelled filters all populate too
- [x] Live Map + Dashboard live map preview — incident markers are real (`useLiveMapMarkers()` -> `useEmergencies()`), each with a "View Details" popup link to `/emergencies/[id]`. Responder/evacuation layers intentionally render empty (0) — no backend data exists for either (see Known gaps)
- [x] Dashboard: KPI cards — Active Incidents, SOS Alerts Today (new `Emergency.source` field, `"sos"` vs `"report"`, plus a new `isToday()` helper), and Total Responders are all real now. People Assisted stays "Not tracked yet" — no backend concept exists for it.
- [x] Dashboard: Incident Overview trend chart — real, 14-day daily bucket of `useEmergenciesWithHistory()` split into "Incidents" and "SOS Alerts" series (`isSameDay()` helper). Note: history is capped at the most recent 100 terminal incidents (ordered by `updatedAt`, not `createdAt`) — fine at current volume, could under-count older days once the city has more than ~100 resolved/cancelled incidents total.
- [x] Dashboard: Quick Actions — no data, just navigation links; nothing to wire
- [x] Dashboard: System Summary — static status banner + a live client-side clock; nothing to wire
- [x] Dashboard: Recent Activity widget — real via new `GET /admin/activity` (derives a feed from `SosAlert`/`IncidentResponder`/`Incident`/`EvacuationCenter`/`User`, no dedicated audit-log model) for the initial load, plus live `admin:activity` socket events pushed from the 5 write sites that produce each activity type. "View All" still links to Audit Logs, which stays mock.
- [x] SOS Alerts — real via the already-existing `GET /admin/sos-alerts` (backend route/controller/service were already built, just unused by the frontend). `SosAlert.status` itself never changes after creation, so the New/Acknowledged/Resolved badge is derived from the linked Incident's status instead (`pending` -> New, `lobby`/`on_the_way`/`arrived` -> Acknowledged, `completed`/`cancelled` -> Resolved), same pattern as `useEmergencies.ts`. Stat cards on the page are now real counts.
- [x] Announcements — already fully real (`useAnnouncements.ts`: list/create/delete against `GET`/`POST`/`DELETE /admin/announcements`, including the "All Users" audience triggering real citizen notifications via `notificationService.createForAllCitizens`). This tracker had it miscategorized as Mock; no code changes were needed, just correcting the tracker.

## Mock (static UI only, no backend wiring)

- [ ] Dashboard: Evacuation Center Capacity — blocked on the same missing `EvacuationCenter` backend model as the full Evacuation Centers page (see Next steps)
- [ ] Analytics
- [ ] Reports
- [ ] Audit Logs
- [ ] Evacuation Centers
- [ ] Resources
- [ ] Witnesses
- [ ] Settings
- [ ] Notifications (admin-facing)

## Known gaps

- [ ] Live Map's responder layer has no data source at all — `User` has no lat/lng field (mobile only uses on-device GPS transiently, nothing persisted); would need real backend location tracking, not just a new endpoint
- [ ] Live Map's evacuation-center layer has no data source — no backend model exists for evacuation centers yet
- [ ] Responder detail page has no assignment/incident history — deliberately deferred (see `docs/superpowers/specs/2026-08-23-admin-role-management-design.md`); needs a new backend endpoint over `IncidentResponder`
- [ ] `UserMenu`'s "Admin User" / "Super Admin" display name isn't wired to the real logged-in admin
- [ ] The admin-facing `GET /incidents/:id` response (`buildResponderFacingIncident`) doesn't include `source` or `reporterId` at all — `useEmergency(id)` (the detail hook) silently gets `source: "report"` (defaulted) and `userId: undefined` for every incident viewed via detail. Only affects the single-incident detail view; the list endpoint (`GET /incidents`, used everywhere else) has both fields.

## Next steps (pick one — each is independent)

- Reports page — check whether it's a duplicate of Incident Reports or something distinct (e.g. generated/exportable reports); `GET /admin/history`'s filters (date range, category, barangay) may already cover it
- Evacuation Centers / Resources / Witnesses have no backend models yet — would need schema design first
