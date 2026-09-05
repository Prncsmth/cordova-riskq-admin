# Admin Authentication — Design Spec

## Context

`cordova-riskq-admin` (this repo) is a Next.js admin dashboard for the Cordova RISKQ
emergency system. It currently has no real backend connection: the login page
(`src/app/(auth)/login/page.tsx`) accepts any input and fakes a login via
`localStorage.setItem("riskq_admin_authenticated", "true")`, and every data hook
(`useUsers`, `useEmergencies`, etc.) just sets empty local state.

A real backend already exists at `CordovaRiskQ-Bacnkend` (Express 5 + Prisma 7 +
Postgres, JWT auth via `jsonwebtoken`, password hashing via `bcrypt`). It currently
serves a separate citizen-facing mobile app (`CordovaRiskQ-Frontend`, Expo/React
Native) and only exposes `auth` (register/login/google) and `user` routes against a
generic `User` model with no admin/role concept.

This spec scopes **only** admin authentication: getting a real admin login working
end-to-end between `cordova-riskq-admin` and `CordovaRiskQ-Bacnkend`, with the
dashboard gated behind it. Wiring up real data for emergencies, responders, live
map/sockets, announcements, audit logs, and reports are separate follow-up efforts,
each to get their own spec.

## Goals

- Real admin login: correct credentials succeed, incorrect ones are rejected.
- Admin identity is fully separate from citizen `User` accounts — a citizen account
  must never be able to log into the admin portal, and vice versa.
- Dashboard routes are inaccessible without a valid session; logging out (or an
  expired/invalid token) sends you back to `/login`.
- A way to create the first admin account, since there is no public signup.

## Non-goals

- Any real data wiring for emergencies, responders, users, announcements, audit
  logs, reports, settings, or live map/socket tracking. These stay mocked/empty for
  now and are out of scope for this spec.
- Self-service admin account creation via the UI (a seed script is enough for now).
- Password reset / forgot-password flow.
- httpOnly-cookie session storage (see Decisions below).

## Architecture

The backend gets a new, self-contained admin-auth slice, kept fully separate from
the existing citizen auth code so the mobile app is untouched:

- A new `Admin` Prisma model, distinct from `User`.
- A new `POST /api/admin/auth/login` endpoint.
- A new `authenticateAdmin` middleware that only accepts tokens carrying an
  `adminId` claim (citizen tokens carry `userId` and are rejected).

The frontend replaces its fake login with a real request to that endpoint, stores
the returned JWT + admin profile, and gates the `(dashboard)` route group behind
having a valid session.

```
┌─────────────────────────┐        POST /api/admin/auth/login        ┌──────────────────────────┐
│  cordova-riskq-admin     │ ───────────────────────────────────────▶ │  CordovaRiskQ-Bacnkend    │
│  (Next.js)                │ ◀─────────────────────────────────────  │  (Express + Prisma)       │
│                            │      { admin, token } or 401            │                            │
│  login page → apiFetch    │                                          │  admin-auth.controller    │
│  localStorage: token+admin│      subsequent requests:                │  → admin-auth.service     │
│  AdminLayout guard        │      Authorization: Bearer <token>       │  → authenticateAdmin mw   │
└─────────────────────────┘                                          └──────────────────────────┘
```

## Backend design (`CordovaRiskQ-Bacnkend`)

**`prisma/schema.prisma`** — new model:

```prisma
model Admin {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  role      String   @default("admin") // "admin" | "super_admin"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Kept separate from `User` rather than adding a `role` field to it — admins are
RiskQ staff, not app users, and separating the tables means there's no shared
credential surface between the citizen app and the admin portal.

**`src/validations/admin-auth.validation.ts`**

```ts
export const adminLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
```

**`src/services/admin-auth.service.ts`** — `login(email, password)`:
- `prisma.admin.findUnique({ where: { email } })`; if missing, throw
  `AppError("Invalid email or password", 401)`.
- `bcrypt.compare(password, admin.password)`; if false, same 401.
- `signToken({ adminId: admin.id, role: admin.role })` (reuses the existing
  `signToken`/`JWT_SECRET` from `utils/jwt.ts` — no new secret needed).
- Returns `{ admin: { id, email, name, role }, token }`.

**`src/controllers/admin-auth.controller.ts`** + **`src/routes/admin-auth.routes.ts`**
follow the exact shape of `auth.controller.ts`/`auth.routes.ts`:

```ts
router.post("/admin/auth/login", validate(adminLoginSchema), adminAuthController.login);
```

Mounted in `src/routes/index.ts` alongside the existing routers.

**`src/middlewares/authenticateAdmin.middleware.ts`** — mirrors
`authenticate.middleware.ts`, but:

```ts
const payload = verifyToken(token) as { adminId?: string; role?: string };
if (!payload.adminId) {
  return next(new AppError("Invalid or expired token", 401));
}
req.adminId = payload.adminId;
req.adminRole = payload.role;
```

This is what protects any future admin-only data routes (emergencies, responders,
etc.) in later specs — not used by anything yet in this spec, since there are no
protected data routes to guard.

**Seed script** (`prisma/seed.ts`, run once via `npx tsx prisma/seed.ts`): creates
one `Admin` row from hardcoded or env-provided email/password/name, hashing the
password with `bcrypt.hash(password, 10)` — same cost factor as citizen registration.
Rerun (with different values) to create additional admins later.

## Frontend design (`cordova-riskq-admin`)

**`src/lib/constants.ts`**: no changes — `API_URL` already resolves to the
backend's `/api` base.

**`src/lib/api.ts`** (`apiFetch`): attach the stored token automatically, and
handle expired/invalid sessions centrally:

```ts
export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("riskq_admin_token") : null;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem("riskq_admin_token");
    localStorage.removeItem("riskq_admin_admin");
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Session expired");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? "API request failed");
  }

  return response.json();
}
```

**`src/lib/auth.ts`**: add `loginAdmin(email, password)` calling
`apiFetch<LoginResponse>("/admin/auth/login", { method: "POST", body: JSON.stringify({ email, password }) })`
and storing `token`/`user` into `localStorage` under `riskq_admin_token` /
`riskq_admin_admin` (replacing the old boolean `riskq_admin_authenticated` flag).

**`src/hooks/useAuth.ts`**: read both keys, expose
`{ authenticated, admin }` where `admin: AdminUser | null` (using the existing
`AdminUser` type in `src/types/auth.ts`, which already has the `role` field this
design produces).

**`src/app/(auth)/login/page.tsx`**: replace the fake `setTimeout` with a real call
to `loginAdmin`; on failure, show an inline error message under the form instead of
silently redirecting; on success, redirect to `/dashboard` as today.

**`src/components/layout/AdminLayout.tsx`**: becomes a client component that calls
`useAuth()` on mount and redirects to `/login` if `authenticated` is false. This
guards every route under the `(dashboard)` group, since they all render through
this layout. (Plain client-side check, not Next.js middleware — the token lives in
`localStorage`, which isn't reachable from edge middleware.)

**`src/components/layout/AdminHeader.tsx`**: update `logout()` to clear
`riskq_admin_token` and `riskq_admin_admin` instead of the old boolean key.

## Error handling

- Wrong credentials → backend returns 401 with a message; login page shows it
  inline, no redirect.
- Any subsequent API call getting a 401 (expired/invalid/missing token) → handled
  once, centrally, in `apiFetch`: session is cleared and the browser is sent to
  `/login`. Individual pages/hooks don't need their own 401 handling.
- Zod validation errors on the login request (e.g. malformed email) → 400 with a
  message, surfaced the same way as a 401.

## Testing

Neither repo currently has an automated test suite, so verification here is
manual, consistent with existing project conventions:

- **Backend**: run the seed script, then `curl`/Postman `POST /api/admin/auth/login`
  with the seeded credentials — expect 200 + `{ admin, token }`; with a wrong
  password — expect 401.
- **Frontend**: with both servers running, log in with the seeded admin from the
  browser — confirm redirect to `/dashboard`, confirm `riskq_admin_token` is set in
  localStorage, confirm a page reload keeps you logged in, confirm visiting
  `/dashboard` directly with no token redirects to `/login`, confirm Logout clears
  storage and redirects.

## Decisions made during design

- **Separate `Admin` model** over a `role` field on the citizen `User` model — no
  shared credential surface between the mobile app and the admin portal.
- **Seed script only** for creating admins, no admin-management UI yet — there's
  exactly one admin portal operator today; a create-admin endpoint can be added
  later if/when multi-admin management is actually needed.
- **`localStorage` + `Authorization: Bearer` header** over httpOnly cookies —
  matches the pattern the backend and mobile app already use, and is simplest to
  wire into the existing `apiFetch` helper. Revisit if the admin portal later needs
  stronger XSS hardening.
