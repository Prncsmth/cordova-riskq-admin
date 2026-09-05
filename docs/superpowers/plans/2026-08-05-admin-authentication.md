# Admin Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fake, always-succeeds admin login in `cordova-riskq-admin` with a real login against a new admin identity in the existing `CordovaRiskQ-Bacnkend` backend, and gate the admin dashboard behind it.

**Architecture:** The backend gets a new, self-contained admin-auth slice (separate `Admin` Prisma model, `POST /api/admin/auth/login`, `authenticateAdmin` middleware) kept apart from the existing citizen `User`/`/api/auth/*` code. The frontend replaces its fake login with a real call to that endpoint, stores the JWT + admin profile in `localStorage`, and gates the `(dashboard)` route group behind having a valid session.

**Tech Stack:** Backend — Express 5, Prisma 7 (Postgres), `bcrypt`, `jsonwebtoken`, `zod`. Frontend — Next.js (App Router), React, TypeScript.

## Global Constraints

- Two separate git repositories are involved. Backend tasks operate in `C:\Users\kianr\CordovaRiskQ-Bacnkend`; frontend tasks operate in `C:\Users\kianr\cordova-riskq-admin` (this repo). Each task's Files section states which repo it's in — `cd` there before running commands, and commit within that repo.
- The backend's `.env` has `PORT=8000`. The frontend's `constants.ts` defaults `API_URL`/`SOCKET_URL` to port 5000 — Task 5 fixes this via `.env.local`. Both dev servers must be running (`npm run dev` in each repo) for any manual curl/browser verification step.
- Neither repo has an automated test framework (no Jest/Vitest/etc). Verification steps use `npm run build` / `tsc --noEmit` (type-check) plus manual `curl` (backend) or browser checks (frontend), matching existing project conventions and the approved spec's Testing section.
- Admin identity must stay fully separate from the citizen `User` model/table/auth code — never reuse `authenticate.middleware.ts`, `auth.service.ts`, or the `User` table for admin accounts.
- Follow existing code conventions exactly: `asyncHandler` wrapping controllers, `AppError` for thrown HTTP errors, the `validate(schema)` middleware for request validation, zod for schemas, the `@/*` path alias, and the `{ success: boolean, ... }` response envelope.
- Reference spec: `docs/superpowers/specs/2026-08-05-admin-authentication-design.md`.

---

### Task 1: Backend — `Admin` Prisma model + migration

**Repo:** `C:\Users\kianr\CordovaRiskQ-Bacnkend`

**Files:**
- Modify: `prisma/schema.prisma`

**Interfaces:**
- Produces: `Admin` Prisma model (`id, email, password, name, role, createdAt, updatedAt`) and a regenerated Prisma Client exposing `prisma.admin.*`, consumed by Task 2 and Task 3.

- [ ] **Step 1: Add the `Admin` model to the schema**

Append this model to `prisma/schema.prisma`, after the existing `User` model:

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

- [ ] **Step 2: Run the migration**

Run: `npx prisma migrate dev --name add_admin`

This creates a new file under `prisma/migrations/<timestamp>_add_admin/migration.sql` and regenerates the Prisma Client at `src/generated/prisma`.

- [ ] **Step 3: Verify the migration and generated client**

Run: `grep -r 'CREATE TABLE "Admin"' prisma/migrations`
Expected: one match, inside the new `add_admin` migration's `migration.sql`.

Run: `grep -c "admin" src/generated/prisma/index.d.ts`
Expected: a non-zero count (the generated client now has an `admin` delegate).

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat: add Admin model, separate from citizen User"
```

---

### Task 2: Backend — seed script for the first admin account

**Repo:** `C:\Users\kianr\CordovaRiskQ-Bacnkend`

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `prisma.admin` (Task 1), `@/lib/prisma`.
- Produces: a seeded `Admin` row in the database, used by Task 3+ for manual login testing. Re-running is safe (upsert by email).

- [ ] **Step 1: Write the seed script**

Create `prisma/seed.ts`:

```typescript
import bcrypt from "bcrypt";
import { prisma } from "../src/lib/prisma";

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL || "admin@cordova-riskq.local";
  const password = process.env.ADMIN_SEED_PASSWORD || "ChangeMe123!";
  const name = process.env.ADMIN_SEED_NAME || "System Administrator";

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.admin.upsert({
    where: { email },
    update: {},
    create: { email, password: hashedPassword, name, role: "super_admin" },
  });

  console.log(`Seeded admin: ${admin.email} (${admin.role})`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Note: this reads `../src/lib/prisma` via a relative import rather than the `@/*` alias — `prisma/seed.ts` lives outside `src/`, which is outside the `@/*` alias's `include` in `tsconfig.json`, so a relative import is the reliable choice here.

- [ ] **Step 2: Add a convenience script**

In `package.json`, add `"db:seed": "tsx prisma/seed.ts"` to `scripts`, next to the existing `db:generate`/`db:migrate` entries:

```json
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts"
  },
```

- [ ] **Step 3: Run the seed script and verify**

Run: `npm run db:seed`
Expected output: `Seeded admin: admin@cordova-riskq.local (super_admin)` (or your overridden `ADMIN_SEED_EMAIL`/`ADMIN_SEED_NAME` if you set them in `.env` first).

Run it again: `npm run db:seed`
Expected: same output, no error (confirms the upsert is idempotent — safe to rerun).

- [ ] **Step 4: Commit**

```bash
git add prisma/seed.ts package.json
git commit -m "feat: add seed script for first admin account"
```

---

### Task 3: Backend — `POST /api/admin/auth/login`

**Repo:** `C:\Users\kianr\CordovaRiskQ-Bacnkend`

**Files:**
- Create: `src/validations/admin-auth.validation.ts`
- Create: `src/services/admin-auth.service.ts`
- Create: `src/controllers/admin-auth.controller.ts`
- Create: `src/routes/admin-auth.routes.ts`
- Modify: `src/routes/index.ts`

**Interfaces:**
- Consumes: `prisma.admin` (Task 1), seeded admin (Task 2), `signToken` from `@/utils/jwt`, `AppError` from `@/utils/AppError`, `asyncHandler` from `@/utils/asyncHandler`, `validate` from `@/middlewares/validate.middleware`.
- Produces: `POST /api/admin/auth/login` → `200 { success: true, user: { id, email, name, role }, token }` or `401 { success: false, message }`. Also exports `adminAuthService.login(email, password)` and `adminAuthController.login`, both consumed by Task 4.

- [ ] **Step 1: Write the validation schema**

Create `src/validations/admin-auth.validation.ts`:

```typescript
import { z } from "zod";

export const adminLoginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});
```

- [ ] **Step 2: Write the service**

Create `src/services/admin-auth.service.ts`:

```typescript
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/utils/AppError";
import { signToken } from "@/utils/jwt";

function toPublicAdmin(admin: {
    id: string;
    email: string;
    name: string;
    role: string;
}) {
    return { id: admin.id, email: admin.email, name: admin.name, role: admin.role };
}

export const adminAuthService = {
    async login(email: string, password: string) {
        const admin = await prisma.admin.findUnique({ where: { email } });
        if (!admin) throw new AppError("Invalid email or password", 401);

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) throw new AppError("Invalid email or password", 401);

        const token = signToken({ adminId: admin.id, role: admin.role });
        return { user: toPublicAdmin(admin), token };
    },
};
```

- [ ] **Step 3: Write the controller**

Create `src/controllers/admin-auth.controller.ts`:

```typescript
import { Request, Response } from "express";
import { adminAuthService } from "@/services/admin-auth.service";
import { asyncHandler } from "@/utils/asyncHandler";

export const adminAuthController = {
    login: asyncHandler(async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const result = await adminAuthService.login(email, password);
        res.status(200).json({ success: true, ...result });
    }),
};
```

- [ ] **Step 4: Write the routes and mount them**

Create `src/routes/admin-auth.routes.ts`:

```typescript
import { Router } from "express";
import { adminAuthController } from "@/controllers/admin-auth.controller";
import { validate } from "@/middlewares/validate.middleware";
import { adminLoginSchema } from "@/validations/admin-auth.validation";

const router = Router();

router.post("/admin/auth/login", validate(adminLoginSchema), adminAuthController.login);

export default router;
```

Modify `src/routes/index.ts` to mount it:

```typescript
import { Router } from "express";
import testRoutes from "@/routes/test.routes";
import authRoutes from "@/routes/auth.routes";
import userRoutes from "@/routes/user.routes";
import adminAuthRoutes from "@/routes/admin-auth.routes";

// Central router — mount all feature route files here.
// As you add new resources, do: router.use(entityRoutes) below.
const router = Router();

router.use(testRoutes);
router.use(authRoutes);
router.use(userRoutes);
router.use(adminAuthRoutes);

export default router;
```

- [ ] **Step 5: Verify it type-checks**

Run: `npm run build`
Expected: completes with no TypeScript errors.

- [ ] **Step 6: Verify the endpoint manually**

Start the server: `npm run dev` (leave it running in a separate terminal).

With the seeded admin from Task 2, run:

```bash
curl -i -X POST http://localhost:8000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cordova-riskq.local","password":"ChangeMe123!"}'
```

Expected: `HTTP/1.1 200 OK` and a JSON body like
`{"success":true,"user":{"id":"...","email":"admin@cordova-riskq.local","name":"System Administrator","role":"super_admin"},"token":"..."}`.
Copy the `token` value somewhere — Task 4 needs it.

Then verify rejection with a wrong password:

```bash
curl -i -X POST http://localhost:8000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cordova-riskq.local","password":"wrong"}'
```

Expected: `HTTP/1.1 401 Unauthorized` and `{"success":false,"message":"Invalid email or password"}`.

- [ ] **Step 7: Commit**

```bash
git add src/validations/admin-auth.validation.ts src/services/admin-auth.service.ts src/controllers/admin-auth.controller.ts src/routes/admin-auth.routes.ts src/routes/index.ts
git commit -m "feat: add admin login endpoint"
```

---

### Task 4: Backend — `authenticateAdmin` middleware + `GET /api/admin/auth/me`

**Repo:** `C:\Users\kianr\CordovaRiskQ-Bacnkend`

**Files:**
- Create: `src/middlewares/authenticateAdmin.middleware.ts`
- Modify: `src/services/admin-auth.service.ts`
- Modify: `src/controllers/admin-auth.controller.ts`
- Modify: `src/routes/admin-auth.routes.ts`

**Interfaces:**
- Consumes: `verifyToken` from `@/utils/jwt`, `AppError`, `adminAuthService`/`adminAuthController` (Task 3).
- Produces: `authenticateAdmin` Express middleware and exported `AuthenticatedAdminRequest` interface (`adminId?: string; adminRole?: string`) — this is what will protect admin-only data routes in later specs (emergencies, responders, etc.). `adminAuthService.getById(adminId)`. `GET /api/admin/auth/me` → `200 { success: true, user }` when a valid admin token is presented.

- [ ] **Step 1: Write the middleware**

Create `src/middlewares/authenticateAdmin.middleware.ts`:

```typescript
import { NextFunction, Request, Response } from "express";
import { AppError } from "@/utils/AppError";
import { verifyToken } from "@/utils/jwt";

export interface AuthenticatedAdminRequest extends Request {
    adminId?: string;
    adminRole?: string;
}

export function authenticateAdmin(
    req: AuthenticatedAdminRequest,
    res: Response,
    next: NextFunction
) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return next(new AppError("Missing or invalid Authorization header", 401));
    }

    const token = header.slice("Bearer ".length);

    try {
        const payload = verifyToken(token) as { adminId?: string; role?: string };
        if (!payload.adminId) {
            return next(new AppError("Invalid or expired token", 401));
        }
        req.adminId = payload.adminId;
        req.adminRole = payload.role;
        next();
    } catch {
        next(new AppError("Invalid or expired token", 401));
    }
}
```

This rejects citizen tokens (they carry `userId`, not `adminId`), so a citizen account can never pass as an admin even if it somehow obtained a valid JWT.

- [ ] **Step 2: Add `getById` to the service**

In `src/services/admin-auth.service.ts`, add a second method to the exported object (after `login`):

```typescript
    async getById(adminId: string) {
        const admin = await prisma.admin.findUnique({ where: { id: adminId } });
        if (!admin) throw new AppError("Admin not found", 404);
        return toPublicAdmin(admin);
    },
```

The full file's exported object now reads:

```typescript
export const adminAuthService = {
    async login(email: string, password: string) {
        const admin = await prisma.admin.findUnique({ where: { email } });
        if (!admin) throw new AppError("Invalid email or password", 401);

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) throw new AppError("Invalid email or password", 401);

        const token = signToken({ adminId: admin.id, role: admin.role });
        return { user: toPublicAdmin(admin), token };
    },

    async getById(adminId: string) {
        const admin = await prisma.admin.findUnique({ where: { id: adminId } });
        if (!admin) throw new AppError("Admin not found", 404);
        return toPublicAdmin(admin);
    },
};
```

- [ ] **Step 3: Add `me` to the controller**

Rewrite `src/controllers/admin-auth.controller.ts` in full:

```typescript
import { Request, Response } from "express";
import { AuthenticatedAdminRequest } from "@/middlewares/authenticateAdmin.middleware";
import { adminAuthService } from "@/services/admin-auth.service";
import { asyncHandler } from "@/utils/asyncHandler";

export const adminAuthController = {
    login: asyncHandler(async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const result = await adminAuthService.login(email, password);
        res.status(200).json({ success: true, ...result });
    }),

    me: asyncHandler(async (req: AuthenticatedAdminRequest, res: Response) => {
        const user = await adminAuthService.getById(req.adminId!);
        res.status(200).json({ success: true, user });
    }),
};
```

- [ ] **Step 4: Add the protected route**

Rewrite `src/routes/admin-auth.routes.ts` in full:

```typescript
import { Router } from "express";
import { adminAuthController } from "@/controllers/admin-auth.controller";
import { authenticateAdmin } from "@/middlewares/authenticateAdmin.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { adminLoginSchema } from "@/validations/admin-auth.validation";

const router = Router();

router.post("/admin/auth/login", validate(adminLoginSchema), adminAuthController.login);
router.get("/admin/auth/me", authenticateAdmin, adminAuthController.me);

export default router;
```

- [ ] **Step 5: Verify it type-checks**

Run: `npm run build`
Expected: completes with no TypeScript errors.

- [ ] **Step 6: Verify the endpoint manually**

With the dev server still running (`npm run dev`), and using a fresh token from a login call:

```bash
curl -s -X POST http://localhost:8000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cordova-riskq.local","password":"ChangeMe123!"}'
```

Copy the `token` field from the response, then:

```bash
curl -i http://localhost:8000/api/admin/auth/me \
  -H "Authorization: Bearer PASTE_TOKEN_HERE"
```

Expected: `HTTP/1.1 200 OK` and `{"success":true,"user":{"id":"...","email":"admin@cordova-riskq.local",...}}`.

Then verify rejection without a token:

```bash
curl -i http://localhost:8000/api/admin/auth/me
```

Expected: `HTTP/1.1 401 Unauthorized` and `{"success":false,"message":"Missing or invalid Authorization header"}`.

And with a garbage token:

```bash
curl -i http://localhost:8000/api/admin/auth/me -H "Authorization: Bearer garbage"
```

Expected: `HTTP/1.1 401 Unauthorized` and `{"success":false,"message":"Invalid or expired token"}`.

- [ ] **Step 7: Commit**

```bash
git add src/middlewares/authenticateAdmin.middleware.ts src/services/admin-auth.service.ts src/controllers/admin-auth.controller.ts src/routes/admin-auth.routes.ts
git commit -m "feat: add authenticateAdmin middleware and GET /admin/auth/me"
```

---

### Task 5: Frontend — point at the backend, teach `apiFetch` about tokens

**Repo:** `C:\Users\kianr\cordova-riskq-admin`

**Files:**
- Create: `.env.local`
- Modify: `src/lib/api.ts`

**Interfaces:**
- Consumes: `API_URL` from `./constants`.
- Produces: `apiFetch<T>(endpoint, options): Promise<T>` (now attaches `Authorization: Bearer <token>` automatically and handles session expiry), plus exported `TOKEN_KEY` and `ADMIN_KEY` string constants — consumed by Task 6.

- [ ] **Step 1: Point the frontend at the backend's actual port**

Create `.env.local` in the project root:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
```

(The backend's `.env` has `PORT=8000`, but `src/lib/constants.ts` defaults to port 5000 — this file overrides that for local dev. It's already gitignored.)

- [ ] **Step 2: Update `apiFetch`**

Replace the full contents of `src/lib/api.ts`:

```typescript
import { API_URL } from "./constants";

export const TOKEN_KEY = "riskq_admin_token";
export const ADMIN_KEY = "riskq_admin_admin";

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ADMIN_KEY);
      window.location.href = "/login";
    }
    throw new Error("Session expired");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? "API request failed");
  }

  return response.json();
}
```

- [ ] **Step 3: Verify it type-checks**

Run: `npx tsc --noEmit`
Expected: completes with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/api.ts
git commit -m "feat: attach auth token to apiFetch and handle session expiry"
```

(`.env.local` is gitignored and won't be staged — that's expected.)

---

### Task 6: Frontend — `loginAdmin`/`logoutAdmin` and a real `useAuth`

**Repo:** `C:\Users\kianr\cordova-riskq-admin`

**Files:**
- Modify: `src/lib/auth.ts`
- Modify: `src/hooks/useAuth.ts`

**Interfaces:**
- Consumes: `apiFetch`, `TOKEN_KEY`, `ADMIN_KEY` (Task 5); existing `LoginResponse`, `AdminUser` types from `@/types/auth.ts` (already in the codebase, untouched by this plan).
- Produces: `loginAdmin(email, password): Promise<AdminUser>`, `logoutAdmin(): void`, `getStoredAdmin(): AdminUser | null` from `@/lib/auth` — and `useAuth(): { authenticated: boolean; admin: AdminUser | null }` from `@/hooks/useAuth`. Both consumed by Task 7 and Task 8.

- [ ] **Step 1: Replace `src/lib/auth.ts`**

`src/lib/auth.ts` currently just duplicates `api.ts` verbatim and nothing imports it — replace its full contents with the admin session module:

```typescript
import { apiFetch, TOKEN_KEY, ADMIN_KEY } from "./api";
import { AdminUser, LoginResponse } from "@/types/auth";

export async function loginAdmin(
  email: string,
  password: string
): Promise<AdminUser> {
  const { user, token } = await apiFetch<LoginResponse>("/admin/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ADMIN_KEY, JSON.stringify(user));

  return user;
}

export function logoutAdmin() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ADMIN_KEY);
}

export function getStoredAdmin(): AdminUser | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(ADMIN_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Replace `src/hooks/useAuth.ts`**

Replace its full contents:

```typescript
"use client";

import { useState } from "react";
import { AdminUser } from "@/types/auth";
import { getStoredAdmin } from "@/lib/auth";

export function useAuth() {
  const [admin] = useState<AdminUser | null>(() => getStoredAdmin());

  return { authenticated: admin !== null, admin };
}
```

- [ ] **Step 3: Verify it type-checks**

Run: `npx tsc --noEmit`
Expected: completes with no errors. (This also confirms `AdminUser`/`LoginResponse` in `src/types/auth.ts` line up with what `admin-auth.service.ts` returns on the backend — both use `{ id, email, name, role }` for the user and `role: "admin" | "super_admin"`.)

- [ ] **Step 4: Commit**

```bash
git add src/lib/auth.ts src/hooks/useAuth.ts
git commit -m "feat: add real admin login/logout and session hook"
```

---

### Task 7: Frontend — wire the login page to `loginAdmin`

**Repo:** `C:\Users\kianr\cordova-riskq-admin`

**Files:**
- Modify: `src/app/(auth)/login/page.tsx`

**Interfaces:**
- Consumes: `loginAdmin` (Task 6).
- Produces: a working login form (leaf UI, nothing else depends on this file).

- [ ] **Step 1: Replace the fake submit handler with a real one, and add error display**

Replace the full contents of `src/app/(auth)/login/page.tsx`:

```tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Mail,
  Lock,
  Eye,
  Shield,  
} from "lucide-react";
import { loginAdmin } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await loginAdmin(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FE6B47]">

      <div className="grid min-h-screen lg:grid-cols-5">

        {/* LEFT PANEL */}

        <section
          className="relative hidden lg:flex lg:col-span-2 overflow-hidden"
          style={{
            backgroundImage: "url('/images/cordova-hall.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          
        >
          
          {/* Overlay */}

          <div className="absolute inset-0 bg-linear-to-r from-red-950/90 via-red-900/80 to-red-950/95" />

          {/* Watermark */}

          <Image
            src="/images/cordova-logo.png"
            alt=""
            fill
            className="object-contain opacity-10 scale-125"
          />

          <div className="relative z-10 flex flex-col justify-between p-12 text-white">

            <div />

            <div>

              <div className="w-12 h-1 bg-red-500 rounded-full mb-6" />

              <h2 className="text-5xl font-bold leading-tight">

                Serving with

                <br />

                <span className="text-white">
                  PRIDE,
                  <br />
                  DUTY,
                  <br />
                  COMPASSION
                </span>

              </h2>

            </div>

            <div className="rounded-2xl bg-white/10 backdrop-blur-xl p-6">

              <h3 className="font-semibold">
                Emergency Operations
              </h3>

              <p className="text-red-100">
                Always Ready. Always Here.
              </p>

            </div>

          </div>

        </section>

        {/* RIGHT PANEL */}

        <section className="flex items-center justify-center bg-linear-to-r from-white via-gray-50 to-white p-10 lg:col-span-3">

          <div className="w-full max-w-xl rounded-[36px] bg-white p-12 shadow-2xl">

            {/* Logos */}


            <div className="my-10 border-t" />

            <h2 className="text-center text-3xl font-bold">
              Administrator Login
            </h2>

            <p className="text-center text-gray-500 mt-2 mb-8">
              Please sign in to continue.
            </p>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              <div className="relative">

                <Mail
                  className="absolute left-4 top-4 text-gray-400"
                  size={20}
                />

                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className="w-full rounded-xl border pl-12 pr-4 py-4 outline-none focus:border-red-700"
                />

              </div>

              <div className="relative">

                <Lock
                  className="absolute left-4 top-4 text-gray-400"
                  size={20}
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  className="w-full rounded-xl border pl-12 pr-12 py-4 outline-none focus:border-red-700"
                />

                <Eye
                  className="absolute right-4 top-4 text-gray-400"
                  size={20}
                />

              </div>

              <div className="flex justify-between text-sm">

                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  Remember me
                </label>

              </div>

              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}

              <button
                disabled={loading}
                className="w-full rounded-xl bg-linear-to-r from-red-700 to-red-900 py-4 text-lg font-bold text-white shadow-lg hover:scale-[1.02] transition"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>

            </form>

            <div className="mt-10 flex items-center justify-center gap-2 text-gray-500">

              <Shield size={18} />

              Secure Access

            </div>

            <p className="mt-4 text-center text-sm text-gray-400">
              Cordova RiskQ Admin Portal
              <br />
              Version 1.0.0
            </p>

          </div>

        </section>

      </div>

    </main>
  );
}
```

- [ ] **Step 2: Verify it type-checks**

Run: `npx tsc --noEmit`
Expected: completes with no errors.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(auth)/login/page.tsx"
git commit -m "feat: wire login page to real admin login"
```

---

### Task 8: Frontend — gate the dashboard, fix logout, verify end-to-end

**Repo:** `C:\Users\kianr\cordova-riskq-admin`

**Files:**
- Modify: `src/components/layout/AdminLayout.tsx`
- Modify: `src/components/layout/AdminHeader.tsx`

**Interfaces:**
- Consumes: `useAuth` (Task 6), `logoutAdmin` (Task 6).
- Produces: every route under `(dashboard)` (they all render through `AdminLayout`) is inaccessible without a valid session. This is the last task — it also carries the full end-to-end manual verification of the whole plan.

- [ ] **Step 1: Guard `AdminLayout`**

Replace the full contents of `src/components/layout/AdminLayout.tsx`:

```tsx
"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const { authenticated } = useAuth();

  useEffect(() => {
    if (!authenticated) {
      router.replace("/login");
    }
  }, [authenticated, router]);

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <AdminSidebar /> 
        
      <div className="lg:pl-72">
        <AdminHeader />

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
```

(This is a plain client-side check, not Next.js middleware — the token lives in `localStorage`, which isn't reachable from edge middleware.)

- [ ] **Step 2: Fix `AdminHeader`'s logout**

Replace the full contents of `src/components/layout/AdminHeader.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { logoutAdmin } from "@/lib/auth";

export default function AdminHeader() {
  const router = useRouter();

  function logout() {
    logoutAdmin();
    router.push("/login");
  }

  return (
    <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">System Administrator</p>
    
        </div>

        <button
          onClick={logout}
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Verify it type-checks**

Run: `npx tsc --noEmit`
Expected: completes with no errors.

- [ ] **Step 4: Full end-to-end manual verification**

With the backend dev server running (`npm run dev` in `CordovaRiskQ-Bacnkend`) and the seeded admin from Task 2 in place, start the frontend: `npm run dev` in `cordova-riskq-admin`.

In a browser:

1. Visit `http://localhost:3000/dashboard` directly, with no prior login. Expected: immediately redirected to `/login`.
2. On `/login`, submit the wrong password for `admin@cordova-riskq.local`. Expected: an inline red error message appears under the form; you stay on `/login`; the button returns to "Sign In" (not stuck on "Signing In...").
3. Submit the correct credentials (`admin@cordova-riskq.local` / `ChangeMe123!`, or your overridden `ADMIN_SEED_*` values). Expected: redirected to `/dashboard`.
4. Open browser dev tools → Application → Local Storage. Expected: `riskq_admin_token` holds a JWT string, `riskq_admin_admin` holds a JSON object with `id`, `email`, `name`, `role`.
5. Reload the `/dashboard` page. Expected: you remain logged in (no redirect to `/login`).
6. Click "Logout" in the header. Expected: both `riskq_admin_token` and `riskq_admin_admin` are removed from Local Storage, and you're redirected to `/login`.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/AdminLayout.tsx src/components/layout/AdminHeader.tsx
git commit -m "feat: gate dashboard routes behind real admin session"
```
