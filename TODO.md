# TODO

Running tracker of what's real (backend-wired) vs. still mock on the admin side.
See `PROGRESS.md` for the one-time visual redesign summary this builds on.

## Real (backend-wired)

- [x] Login — real `POST /api/admin-auth/login`, JWT stored in `localStorage`, dashboard layout redirects to `/login` when unauthenticated
- [x] Users — list (`GET /admin/users`), search (name/email/ID), role change citizen <-> responder (`PATCH /admin/users/:id/role`), unit assignment (BDRRMO/MDRRMO) on promotion
- [x] Responders — list (derived from `/admin/users`, filtered to `role: "responder"`), duty status + unit columns, duty/unit filters, search

## Mock (static UI only, no backend wiring)

- [ ] Dashboard — KPI cards, incident trend chart, live map preview, recent incidents/activity, responder status donut, evacuation center capacity, quick actions, system summary
- [ ] Analytics
- [ ] Emergencies (list + detail)
- [ ] SOS Alerts
- [ ] Live Map
- [ ] Incident Reports
- [ ] Reports
- [ ] Announcements
- [ ] Audit Logs
- [ ] Evacuation Centers
- [ ] Resources
- [ ] Witnesses
- [ ] Settings
- [ ] Notifications (admin-facing)

## Known gaps

- [ ] Responder detail page has no assignment/incident history — deliberately deferred (see `docs/superpowers/specs/2026-08-23-admin-role-management-design.md`); needs a new backend endpoint over `IncidentResponder`
- [ ] `UserMenu`'s "Admin User" / "Super Admin" display name isn't wired to the real logged-in admin

## Next steps (pick one — each is independent)

- Wire Dashboard stat cards to real counts — several are already derivable from `/admin/users` and `/admin/responders/summary`
- Wire Emergencies / Live Map / SOS Alerts to the real `Incident` / `SosAlert` backend models (already exist and are used by the mobile responder app)
- Wire Announcements to the real `Announcement` model (already used by the mobile citizen notification pipeline)
- Evacuation Centers / Resources / Witnesses have no backend models yet — would need schema design first
