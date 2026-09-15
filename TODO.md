# TODO

Running tracker of what's real (backend-wired) vs. still mock on the admin side.
See `PROGRESS.md` for the one-time visual redesign summary this builds on.

## Real (backend-wired)

- [x] Login — real `POST /api/auth/login` (same endpoint the mobile app uses; requires the account's `User.role === "admin"`), JWT stored in `localStorage`, dashboard layout redirects to `/login` when unauthenticated. Note: the backend also has a separate `Admin` table + `POST /api/admin-auth/login` (`admin-auth.*`), but the admin frontend doesn't use it — untouched, possibly a parallel/abandoned initiative.
- [x] Users — list (`GET /admin/users`), search (name/email/ID), role change citizen <-> responder (`PATCH /admin/users/:id/role`), unit assignment (BDRRMO/MDRRMO) on promotion
- [x] Responders — list (derived from `/admin/users`, filtered to `role: "responder"`), duty status + unit columns, duty/unit filters, search
- [x] Emergencies (list) — real via `useEmergencies()` -> `GET /incidents`, but only ever shows non-terminal incidents (pending/lobby/on_the_way/arrived) since that's all the endpoint returns — its "Resolved"/"Cancelled" stat cards are always 0 (see Known gaps)
- [x] Emergencies (detail) — real via `useEmergency(id)` -> `GET /incidents/:id`, works for any incident including terminal ones
- [x] Dashboard: Recent Incidents widget — real, reuses `useEmergencies()`
- [x] Dashboard: Responder Status donut — real, derived from `useResponders()` (On Duty / Off Duty; the old mock "Busy" category was dropped, the backend only tracks a boolean duty status)
- [x] Incident Reports — real, merges live incidents (`useEmergencies()`) with historical ones (`GET /admin/history`, terminal-only) into one list so the Active/Responding/Resolved/Cancelled filters all actually populate now

## Mock (static UI only, no backend wiring)

- [ ] Dashboard — KPI cards (partial: Total Responders is real, Active Incidents/SOS Alerts Today/People Assisted aren't), incident trend chart, live map preview, evacuation center capacity, quick actions, system summary
- [ ] Analytics
- [ ] SOS Alerts
- [ ] Live Map
- [ ] Reports
- [ ] Announcements
- [ ] Audit Logs
- [ ] Evacuation Centers
- [ ] Resources
- [ ] Witnesses
- [ ] Settings
- [ ] Notifications (admin-facing)

## Known gaps

- [ ] Emergencies list page's "Resolved"/"Cancelled" stat cards are always 0 — same gap Incident Reports just had; needs the same `/admin/history` merge applied there
- [ ] LiveMap incident/responder markers now link "View Details" to `/emergencies/[id]` / `/responders/[id]`, but Live Map itself still renders mock markers (`defaultMarkers`) with fake ids like `inc-1` — those links 404 until Live Map is wired to real data
- [ ] Responder detail page has no assignment/incident history — deliberately deferred (see `docs/superpowers/specs/2026-08-23-admin-role-management-design.md`); needs a new backend endpoint over `IncidentResponder`
- [ ] `UserMenu`'s "Admin User" / "Super Admin" display name isn't wired to the real logged-in admin

## Next steps (pick one — each is independent)

- Apply the Emergencies list page's known gap above (small, mirrors today's Incident Reports fix)
- Wire remaining Dashboard KPI cards (Active Incidents, SOS Alerts Today derivable from `useEmergencies()`; People Assisted has no backend concept yet)
- Incident Overview trend chart — needs to reconcile live (`useEmergencies`) + historical (`/admin/history`) data into one time series; scope carefully before starting
- Reports page — check whether it's a duplicate of Incident Reports or something distinct (e.g. generated/exportable reports); `GET /admin/history`'s filters (date range, category, barangay) may already cover it
- Wire Live Map / SOS Alerts to the real `Incident` / `SosAlert` backend models
- Wire Announcements to the real `Announcement` model (already used by the mobile citizen notification pipeline)
- Evacuation Centers / Resources / Witnesses have no backend models yet — would need schema design first
