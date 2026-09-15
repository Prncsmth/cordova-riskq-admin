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

## Mock (static UI only, no backend wiring)

- [ ] Dashboard — KPI cards (partial: Total Responders is real, Active Incidents/SOS Alerts Today/People Assisted aren't), incident trend chart, evacuation center capacity, quick actions, system summary
- [ ] Analytics
- [ ] SOS Alerts
- [ ] Reports
- [ ] Announcements
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

## Next steps (pick one — each is independent)

- Wire remaining Dashboard KPI cards (Active Incidents, SOS Alerts Today derivable from `useEmergencies()`; People Assisted has no backend concept yet)
- Incident Overview trend chart — needs to reconcile live (`useEmergencies`) + historical (`/admin/history`) data into one time series; scope carefully before starting
- Reports page — check whether it's a duplicate of Incident Reports or something distinct (e.g. generated/exportable reports); `GET /admin/history`'s filters (date range, category, barangay) may already cover it
- Wire SOS Alerts to the real `SosAlert` backend model
- Wire Announcements to the real `Announcement` model (already used by the mobile citizen notification pipeline)
- Evacuation Centers / Resources / Witnesses have no backend models yet — would need schema design first
