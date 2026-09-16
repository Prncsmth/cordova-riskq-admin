# Admin Server-Side Pagination Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace fetch-everything-and-filter-client-side on the Users, Responders, SOS Alerts, and Announcements admin pages with real server-side pagination and search/filtering.

**Architecture:** Backend endpoints gain `search`/filter/`page`/`limit` query params and return `{ <resource>[], total, page, limit }`, following the exact pattern already proven in `sos.service.listForAdmin`/`historyService.list` (clamp page/limit, `Promise.all([count(), findMany({skip, take})])`). Frontend gets one shared debounced-search pagination-state hook and one shared `<Pagination>` UI component, applied identically across all four pages' data hooks and table components.

**Tech Stack:** Next.js 16 (App Router) + TypeScript on the frontend (`cordova-riskq-admin`), Express 5 + Prisma 7 + Postgres on the backend (`CordovaRiskQ-Bacnkend`, sibling repo at `C:\Users\kianr\CordovaRiskQ-Bacnkend`). Backend tests use Node's built-in `node:test` + `node:assert/strict` (`npm test` runs `tsx --test src/**/*.test.ts`) — no test runner exists on the frontend.

**Spec:** `docs/superpowers/specs/2026-09-16-admin-pagination-design.md`

## Global Constraints

- Backend pagination contract everywhere: `page` defaults to 1 if missing/invalid (`page > 0 ? Math.floor(page) : 1`), `limit` defaults to 20 and is capped at 100 (`limit > 0 ? Math.min(Math.floor(limit), 100) : 20`) — copy this clamping logic verbatim from `sos.service.ts`'s existing `listForAdmin`.
- No new npm dependencies on either repo (no data-fetching library, no debounce library — hand-roll with `setTimeout`).
- Frontend page-size options are always `[10, 25, 50]`.
- Out of scope: Emergencies/Incident Reports pages, Evacuation Centers page, URL-synced state. Do not touch `useEmergenciesWithHistory`, `useEvacuationCenters`, or any router/query-string code.

---

### Task 1: Backend — pure SOS alert-status bucket helper

**Files:**
- Create: `CordovaRiskQ-Bacnkend/src/services/sosAlertStatus.ts`
- Test: `CordovaRiskQ-Bacnkend/src/services/sosAlertStatus.test.ts`

**Interfaces:**
- Produces: `AlertStatus` type (`"New" | "Acknowledged" | "Resolved"`), `incidentStatusToAlertStatus(incidentStatus: string | undefined): AlertStatus`, `filterAlertIdsByStatus(allAlertIds: string[], incidentStatusByAlertId: Map<string, string>, alertStatus: AlertStatus): string[]`, `countAlertsByStatus(allAlertIds: string[], incidentStatusByAlertId: Map<string, string>): { New: number; Acknowledged: number; Resolved: number; total: number }` — Task 2 imports all four.

- [x] **Step 1: Write the failing tests**

```typescript
// src/services/sosAlertStatus.test.ts
import assert from "node:assert/strict";
import { test } from "node:test";

import {
    countAlertsByStatus,
    filterAlertIdsByStatus,
    incidentStatusToAlertStatus,
} from "@/services/sosAlertStatus";

test("incidentStatusToAlertStatus maps each incident lifecycle stage to its bucket", () => {
    assert.equal(incidentStatusToAlertStatus("pending"), "New");
    assert.equal(incidentStatusToAlertStatus("lobby"), "Acknowledged");
    assert.equal(incidentStatusToAlertStatus("on_the_way"), "Acknowledged");
    assert.equal(incidentStatusToAlertStatus("arrived"), "Acknowledged");
    assert.equal(incidentStatusToAlertStatus("completed"), "Resolved");
    assert.equal(incidentStatusToAlertStatus("cancelled"), "Resolved");
});

test("incidentStatusToAlertStatus treats a missing incident as New", () => {
    assert.equal(incidentStatusToAlertStatus(undefined), "New");
});

test("filterAlertIdsByStatus returns only ids whose bucket matches", () => {
    const statusByAlertId = new Map([
        ["a1", "pending"],
        ["a2", "arrived"],
        ["a3", "completed"],
        // a4 has no entry -- no linked incident yet
    ]);

    assert.deepEqual(
        filterAlertIdsByStatus(["a1", "a2", "a3", "a4"], statusByAlertId, "New"),
        ["a1", "a4"],
    );
    assert.deepEqual(
        filterAlertIdsByStatus(["a1", "a2", "a3", "a4"], statusByAlertId, "Acknowledged"),
        ["a2"],
    );
    assert.deepEqual(
        filterAlertIdsByStatus(["a1", "a2", "a3", "a4"], statusByAlertId, "Resolved"),
        ["a3"],
    );
});

test("countAlertsByStatus buckets every id and reports the total", () => {
    const statusByAlertId = new Map([
        ["a1", "pending"],
        ["a2", "lobby"],
        ["a3", "completed"],
        ["a4", "cancelled"],
    ]);

    assert.deepEqual(
        countAlertsByStatus(["a1", "a2", "a3", "a4", "a5"], statusByAlertId),
        { New: 2, Acknowledged: 1, Resolved: 2, total: 5 },
    );
});
```

- [x] **Step 2: Run tests to verify they fail**

Run: `cd CordovaRiskQ-Bacnkend && npx tsx --test src/services/sosAlertStatus.test.ts`
Expected: FAIL with `Cannot find module '@/services/sosAlertStatus'` (file doesn't exist yet).

- [x] **Step 3: Write the implementation**

```typescript
// src/services/sosAlertStatus.ts
// Pure derivation of a SosAlert's admin-facing status bucket from its linked
// Incident's lifecycle status -- SosAlert.status itself never changes after
// creation (always "active"), so this is the real source of truth the
// frontend's New/Acknowledged/Resolved badge is built from. No Prisma --
// unit-tested directly. Mirrors the equivalent mapping already duplicated in
// cordova-riskq-admin's useSosAlerts.ts.

export type AlertStatus = "New" | "Acknowledged" | "Resolved";

const INCIDENT_STATUS_TO_ALERT_STATUS: Record<string, AlertStatus> = {
    pending: "New",
    lobby: "Acknowledged",
    on_the_way: "Acknowledged",
    arrived: "Acknowledged",
    completed: "Resolved",
    cancelled: "Resolved",
};

export function incidentStatusToAlertStatus(incidentStatus: string | undefined): AlertStatus {
    if (!incidentStatus) return "New";
    return INCIDENT_STATUS_TO_ALERT_STATUS[incidentStatus] ?? "New";
}

export function filterAlertIdsByStatus(
    allAlertIds: string[],
    incidentStatusByAlertId: Map<string, string>,
    alertStatus: AlertStatus,
): string[] {
    return allAlertIds.filter(
        (id) => incidentStatusToAlertStatus(incidentStatusByAlertId.get(id)) === alertStatus,
    );
}

export function countAlertsByStatus(
    allAlertIds: string[],
    incidentStatusByAlertId: Map<string, string>,
): { New: number; Acknowledged: number; Resolved: number; total: number } {
    const counts = { New: 0, Acknowledged: 0, Resolved: 0, total: allAlertIds.length };
    for (const id of allAlertIds) {
        counts[incidentStatusToAlertStatus(incidentStatusByAlertId.get(id))]++;
    }
    return counts;
}
```

- [x] **Step 4: Run tests to verify they pass**

Run: `cd CordovaRiskQ-Bacnkend && npm test`
Expected: All tests pass, including the new `sosAlertStatus.test.ts` file (check the summary line for `pass` count increasing by 5 and `fail: 0`).

- [x] **Step 5: Commit**

```bash
cd CordovaRiskQ-Bacnkend
git add src/services/sosAlertStatus.ts src/services/sosAlertStatus.test.ts
git commit -m "feat(admin): add pure SOS alert-status bucket helper"
```

---

### Task 2: Backend — SOS Alerts search, alertStatus filter, and summary endpoint

**Files:**
- Modify: `CordovaRiskQ-Bacnkend/src/services/sos.service.ts`
- Modify: `CordovaRiskQ-Bacnkend/src/controllers/sos.controller.ts`
- Modify: `CordovaRiskQ-Bacnkend/src/routes/sos.routes.ts`

**Interfaces:**
- Consumes: `incidentStatusToAlertStatus`, `filterAlertIdsByStatus`, `countAlertsByStatus`, `AlertStatus` from `@/services/sosAlertStatus` (Task 1).
- Produces: `sosService.listForAdmin` gains `search?: string` and `alertStatus?: AlertStatus` on its filters param (no return-shape change — still `{ alerts, total, page, limit }`). New `sosService.getAdminSummary(): Promise<{ total: number; New: number; Acknowledged: number; Resolved: number }>`. New route `GET /admin/sos-alerts/summary` → `{ success: true, summary }`.

- [x] **Step 1: Add search + alertStatus filtering to `listForAdmin`**

In `src/services/sos.service.ts`, add the import and extend `SosAlertAdminFilters` and `listForAdmin`:

```typescript
import { prisma } from "@/lib/prisma";
import { incidentService } from "@/services/incident.service";
import { type AlertStatus, countAlertsByStatus, filterAlertIdsByStatus } from "@/services/sosAlertStatus";

export type SosAlertAdminFilters = {
    status?: string;
    barangay?: string;
    search?: string;
    alertStatus?: AlertStatus;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
};
```

Replace the body of `listForAdmin` (keep `trigger` untouched) with:

```typescript
    async listForAdmin(filters: SosAlertAdminFilters) {
        const page = filters.page && filters.page > 0 ? Math.floor(filters.page) : 1;
        const limit =
            filters.limit && filters.limit > 0 ? Math.min(Math.floor(filters.limit), 100) : 20;

        let barangayAlertIds: string[] | undefined;
        if (filters.barangay) {
            const matches = await prisma.incident.findMany({
                where: {
                    sosAlertId: { not: null },
                    locationLabel: { contains: filters.barangay, mode: "insensitive" },
                },
                select: { sosAlertId: true },
            });
            barangayAlertIds = matches.map((m) => m.sosAlertId as string);
        }

        let searchAlertIds: string[] | undefined;
        if (filters.search) {
            const [byName, byLocation] = await Promise.all([
                prisma.sosAlert.findMany({
                    where: { user: { name: { contains: filters.search, mode: "insensitive" } } },
                    select: { id: true },
                }),
                prisma.incident.findMany({
                    where: {
                        sosAlertId: { not: null },
                        locationLabel: { contains: filters.search, mode: "insensitive" },
                    },
                    select: { sosAlertId: true },
                }),
            ]);
            searchAlertIds = Array.from(
                new Set([...byName.map((a) => a.id), ...byLocation.map((i) => i.sosAlertId as string)]),
            );
        }

        let statusAlertIds: string[] | undefined;
        if (filters.alertStatus) {
            const [allAlerts, linkedIncidents] = await Promise.all([
                prisma.sosAlert.findMany({ select: { id: true } }),
                prisma.incident.findMany({
                    where: { sosAlertId: { not: null } },
                    select: { sosAlertId: true, status: true },
                }),
            ]);
            const incidentStatusByAlertId = new Map(
                linkedIncidents.map((i) => [i.sosAlertId as string, i.status]),
            );
            statusAlertIds = filterAlertIdsByStatus(
                allAlerts.map((a) => a.id),
                incidentStatusByAlertId,
                filters.alertStatus,
            );
        }

        // Multiple id-based filters (barangay/search/alertStatus) must
        // intersect (AND), not overwrite one another -- each narrows the
        // candidate set further.
        const idFilterSets = [barangayAlertIds, searchAlertIds, statusAlertIds].filter(
            (s): s is string[] => s !== undefined,
        );
        let combinedIds: string[] | undefined;
        if (idFilterSets.length > 0) {
            combinedIds = idFilterSets.reduce((acc, ids) => acc.filter((id) => ids.includes(id)));
            if (combinedIds.length === 0) {
                return { alerts: [], total: 0, page, limit };
            }
        }

        const where = {
            ...(filters.status ? { status: filters.status } : {}),
            ...(combinedIds ? { id: { in: combinedIds } } : {}),
            ...(filters.startDate || filters.endDate
                ? { createdAt: { gte: filters.startDate, lte: filters.endDate } }
                : {}),
        };

        const [total, alerts] = await Promise.all([
            prisma.sosAlert.count({ where }),
            prisma.sosAlert.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
                include: { user: { select: { name: true, mobile: true } } },
            }),
        ]);

        const linkedIncidents = await prisma.incident.findMany({
            where: { sosAlertId: { in: alerts.map((a) => a.id) } },
            select: { sosAlertId: true, id: true, locationLabel: true, status: true },
        });
        const incidentByAlertId = new Map(linkedIncidents.map((i) => [i.sosAlertId as string, i]));

        return {
            alerts: alerts.map((alert) => {
                const incident = incidentByAlertId.get(alert.id);
                return {
                    id: alert.id,
                    status: alert.status,
                    latitude: alert.latitude,
                    longitude: alert.longitude,
                    locationLabel: incident?.locationLabel ?? null,
                    createdAt: alert.createdAt,
                    reporter: { id: alert.userId, name: alert.user.name, mobile: alert.user.mobile },
                    incidentId: incident?.id ?? null,
                    incidentStatus: incident?.status ?? null,
                };
            }),
            total,
            page,
            limit,
        };
    },

    async getAdminSummary() {
        const [allAlerts, linkedIncidents] = await Promise.all([
            prisma.sosAlert.findMany({ select: { id: true } }),
            prisma.incident.findMany({
                where: { sosAlertId: { not: null } },
                select: { sosAlertId: true, status: true },
            }),
        ]);
        const incidentStatusByAlertId = new Map(
            linkedIncidents.map((i) => [i.sosAlertId as string, i.status]),
        );
        return countAlertsByStatus(allAlerts.map((a) => a.id), incidentStatusByAlertId);
    },
};
```

- [x] **Step 2: Add the controller action**

In `src/controllers/sos.controller.ts`, update `listForAdmin` to read the two new query params and add `getAdminSummary`:

```typescript
import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares/authenticate.middleware";
import { sosService } from "@/services/sos.service";
import { asyncHandler } from "@/utils/asyncHandler";
import { queryDate, queryInt, queryString } from "@/utils/queryParams";
import type { AlertStatus } from "@/services/sosAlertStatus";

const ALERT_STATUSES: AlertStatus[] = ["New", "Acknowledged", "Resolved"];

function queryAlertStatus(value: unknown): AlertStatus | undefined {
    const str = queryString(value);
    return str && (ALERT_STATUSES as string[]).includes(str) ? (str as AlertStatus) : undefined;
}

export const sosController = {
    trigger: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const alert = await sosService.trigger(req.userId!, req.body);
        res.status(201).json({ success: true, alert });
    }),

    listForAdmin: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const result = await sosService.listForAdmin({
            status: queryString(req.query.status),
            barangay: queryString(req.query.barangay),
            search: queryString(req.query.search),
            alertStatus: queryAlertStatus(req.query.alertStatus),
            startDate: queryDate(req.query.startDate),
            endDate: queryDate(req.query.endDate),
            page: queryInt(req.query.page),
            limit: queryInt(req.query.limit),
        });
        res.status(200).json({ success: true, ...result });
    }),

    getAdminSummary: asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
        const summary = await sosService.getAdminSummary();
        res.status(200).json({ success: true, summary });
    }),
};
```

- [x] **Step 3: Add the route**

In `src/routes/sos.routes.ts`, add above the existing `listForAdmin` route:

```typescript
router.get("/admin/sos-alerts/summary", authenticate, requireAdmin, sosController.getAdminSummary);
```

(Keep it above `router.get("/admin/sos-alerts", ...)` — Express matches routes in registration order, and `/admin/sos-alerts/summary` must not be captured by anything treating the rest of the path as an `:id`-style param. There is no such param route here, but keeping the more specific path first is the safer convention.)

- [x] **Step 4: Type-check and run the full backend test suite**

Run: `cd CordovaRiskQ-Bacnkend && npx tsc --noEmit && npm test`
Expected: `tsc` reports no errors; all tests pass (same count as Task 1's end state — this task added no new test files, only service/controller/route code).

- [x] **Step 5: Commit**

```bash
cd CordovaRiskQ-Bacnkend
git add src/services/sos.service.ts src/controllers/sos.controller.ts src/routes/sos.routes.ts
git commit -m "feat(admin): add search, alertStatus filter, and summary endpoint for SOS alerts"
```

---

### Task 3: Backend — Users listing search/role/duty/unit/pagination + newThisWeek

**Files:**
- Modify: `CordovaRiskQ-Bacnkend/src/services/admin.service.ts`
- Modify: `CordovaRiskQ-Bacnkend/src/controllers/admin.controller.ts`
- Modify: `CordovaRiskQ-Bacnkend/src/routes/admin.routes.ts`

**Interfaces:**
- Produces: `adminService.listUsers(filters: { search?: string; role?: string; duty?: boolean; unit?: string; page?: number; limit?: number }): Promise<{ users: AdminUserRow[]; total: number; newThisWeek: number; page: number; limit: number }>` where `AdminUserRow` keeps its existing shape (`id, name, email, mobile, role, unit, isOnDuty, createdAt`). Task 7 (Users frontend) and Task 8 (Responders frontend) both call `GET /admin/users` with this new contract.

- [x] **Step 1: Rewrite `listUsers` in `admin.service.ts`**

```typescript
import { prisma } from "@/lib/prisma";
import { AppError } from "@/utils/AppError";
import { mergeRecentActivity, type AdminActivityItem } from "@/services/adminActivity";

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const adminService = {
    async listUsers(filters: {
        search?: string;
        role?: string;
        duty?: boolean;
        unit?: string;
        page?: number;
        limit?: number;
    }) {
        const page = filters.page && filters.page > 0 ? Math.floor(filters.page) : 1;
        const limit =
            filters.limit && filters.limit > 0 ? Math.min(Math.floor(filters.limit), 100) : 20;

        const where = {
            ...(filters.role ? { role: filters.role } : {}),
            ...(filters.duty !== undefined ? { isOnDuty: filters.duty } : {}),
            ...(filters.unit ? { unit: filters.unit } : {}),
            ...(filters.search
                ? {
                      OR: [
                          { name: { contains: filters.search, mode: "insensitive" as const } },
                          { email: { contains: filters.search, mode: "insensitive" as const } },
                      ],
                  }
                : {}),
        };

        const [total, newThisWeek, users] = await Promise.all([
            prisma.user.count({ where }),
            prisma.user.count({
                where: { ...where, createdAt: { gte: new Date(Date.now() - ONE_WEEK_MS) } },
            }),
            prisma.user.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
        ]);

        return {
            users: users.map((user) => ({
                id: user.id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                role: user.role,
                unit: user.unit,
                isOnDuty: user.isOnDuty,
                createdAt: user.createdAt,
            })),
            total,
            newThisWeek,
            page,
            limit,
        };
    },

    async updateUserRole(targetUserId: string, role: string, unit?: string | null) {
```

(Keep everything from `updateUserRole` onward — `getResponderSummary` and `getRecentActivity` — completely unchanged.)

- [x] **Step 2: Update the controller**

In `src/controllers/admin.controller.ts`, replace `listUsers`:

```typescript
import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares/authenticate.middleware";
import { adminService } from "@/services/admin.service";
import { asyncHandler } from "@/utils/asyncHandler";
import { queryInt, queryString } from "@/utils/queryParams";

function queryBool(value: unknown): boolean | undefined {
    const str = queryString(value);
    if (str === "true") return true;
    if (str === "false") return false;
    return undefined;
}

export const adminController = {
    listUsers: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const result = await adminService.listUsers({
            search: queryString(req.query.search),
            role: queryString(req.query.role),
            duty: queryBool(req.query.duty),
            unit: queryString(req.query.unit),
            page: queryInt(req.query.page),
            limit: queryInt(req.query.limit),
        });
        res.status(200).json({ success: true, ...result });
    }),
```

(Leave `updateUserRole`, `getResponderSummary`, and `getRecentActivity` untouched.)

- [x] **Step 3: No route changes needed**

`GET /admin/users` in `src/routes/admin.routes.ts` already points at `adminController.listUsers` with no param-shape declaration to update — Express routes don't declare query param names. Confirm by reading the file that the line is unchanged:

```typescript
router.get("/admin/users", authenticate, requireAdmin, adminController.listUsers);
```

- [x] **Step 4: Type-check and run the full backend test suite**

Run: `cd CordovaRiskQ-Bacnkend && npx tsc --noEmit && npm test`
Expected: No type errors; all tests still pass (this task adds no test files — Prisma-touching CRUD listing isn't unit-tested elsewhere in this codebase either, matching existing convention).

- [x] **Step 5: Commit**

```bash
cd CordovaRiskQ-Bacnkend
git add src/services/admin.service.ts src/controllers/admin.controller.ts
git commit -m "feat(admin): add search/role/duty/unit filters and pagination to GET /admin/users"
```

---

### Task 4: Backend — Announcements search/priority/pagination

**Files:**
- Modify: `CordovaRiskQ-Bacnkend/src/services/announcement.service.ts`
- Modify: `CordovaRiskQ-Bacnkend/src/controllers/announcement.controller.ts`

**Interfaces:**
- Produces: `announcementService.listForAdmin(filters: { search?: string; priority?: string; page?: number; limit?: number }): Promise<{ announcements: Announcement[]; total: number; page: number; limit: number }>`. Task 10 (Announcements frontend) calls `GET /admin/announcements` with this new contract.

- [x] **Step 1: Rewrite `listForAdmin`**

In `src/services/announcement.service.ts`, replace the `listForAdmin` method (leave `getActive`, `create`, `remove` untouched):

```typescript
    async listForAdmin(filters: {
        search?: string;
        priority?: string;
        page?: number;
        limit?: number;
    }) {
        const page = filters.page && filters.page > 0 ? Math.floor(filters.page) : 1;
        const limit =
            filters.limit && filters.limit > 0 ? Math.min(Math.floor(filters.limit), 100) : 20;

        const where = {
            ...(filters.priority ? { priority: filters.priority } : {}),
            ...(filters.search
                ? {
                      OR: [
                          { title: { contains: filters.search, mode: "insensitive" as const } },
                          { content: { contains: filters.search, mode: "insensitive" as const } },
                      ],
                  }
                : {}),
        };

        const [total, announcements] = await Promise.all([
            prisma.announcement.count({ where }),
            prisma.announcement.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
        ]);

        return { announcements, total, page, limit };
    },
```

- [x] **Step 2: Update the controller**

In `src/controllers/announcement.controller.ts`:

```typescript
import { Request, Response } from "express";
import { AuthenticatedRequest } from "@/middlewares/authenticate.middleware";
import { announcementService } from "@/services/announcement.service";
import { asyncHandler } from "@/utils/asyncHandler";
import { queryInt, queryString } from "@/utils/queryParams";

export const announcementController = {
    getActive: asyncHandler(async (req: Request, res: Response) => {
        const barangay = typeof req.query.barangay === "string" ? req.query.barangay : undefined;
        const announcement = await announcementService.getActive(barangay);
        res.status(200).json({ success: true, announcement });
    }),

    listForAdmin: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const result = await announcementService.listForAdmin({
            search: queryString(req.query.search),
            priority: queryString(req.query.priority),
            page: queryInt(req.query.page),
            limit: queryInt(req.query.limit),
        });
        res.status(200).json({ success: true, ...result });
    }),
```

(Leave `create` and `remove` untouched.)

- [x] **Step 3: Type-check and run the full backend test suite**

Run: `cd CordovaRiskQ-Bacnkend && npx tsc --noEmit && npm test`
Expected: No type errors; all tests pass.

- [x] **Step 4: Commit**

```bash
cd CordovaRiskQ-Bacnkend
git add src/services/announcement.service.ts src/controllers/announcement.controller.ts
git commit -m "feat(admin): add search/priority filters and pagination to GET /admin/announcements"
```

---

### Task 5: Frontend — shared pagination state hook

**Files:**
- Create: `cordova-riskq-admin/src/hooks/usePaginationState.ts`

**Interfaces:**
- Produces: `usePaginationState(initialPageSize?: number): { page: number; setPage: (page: number) => void; pageSize: number; setPageSize: (size: number) => void; searchInput: string; setSearchInput: (value: string) => void; search: string; resetPage: () => void }`. Tasks 7-10 use this in every affected hook.

- [x] **Step 1: Write the hook**

```typescript
// src/hooks/usePaginationState.ts
"use client";

import { useEffect, useState } from "react";

const SEARCH_DEBOUNCE_MS = 300;

// Shared page/pageSize/search state for the Users, Responders, SOS Alerts,
// and Announcements pages. `search` is the debounced value a data hook
// should actually fetch with; `searchInput` is what the text box binds to
// so typing feels instant while the network request waits.
export function usePaginationState(initialPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(handle);
  }, [searchInput]);

  function setPageSize(size: number) {
    setPageSizeState(size);
    setPage(1);
  }

  function resetPage() {
    setPage(1);
  }

  return { page, setPage, pageSize, setPageSize, searchInput, setSearchInput, search, resetPage };
}
```

- [x] **Step 2: Build to verify it compiles**

Run: `cd cordova-riskq-admin && npm run build`
Expected: Build succeeds (this file isn't imported anywhere yet, so it just needs to type-check standalone — Next.js's build still type-checks every file in `src/`).

- [x] **Step 3: Commit**

```bash
cd cordova-riskq-admin
git add src/hooks/usePaginationState.ts
git commit -m "feat(admin): add shared usePaginationState hook"
```

---

### Task 6: Frontend — shared Pagination UI component

**Files:**
- Create: `cordova-riskq-admin/src/components/ui/Pagination.tsx`

**Interfaces:**
- Produces: `<Pagination page={number} totalPages={number} pageSize={number} onPageChange={(page: number) => void} onPageSizeChange={(size: number) => void} />` default-exported. Tasks 7-10 render it at the bottom of each table.

- [x] **Step 1: Write the component**

```typescript
// src/components/ui/Pagination.tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

// Collapses a long page range to first, last, current +/-1, with ellipsis
// markers ("start"/"end") filling the gaps. Shows every page when there
// are 7 or fewer.
function getPageNumbers(current: number, total: number): (number | "start-ellipsis" | "end-ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = Array.from(pages)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const result: (number | "start-ellipsis" | "end-ellipsis")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i];
    const prev = sorted[i - 1];
    if (prev !== undefined && p - prev > 1) {
      result.push(p - prev === 2 ? prev + 1 : p === total ? "end-ellipsis" : "start-ellipsis");
    }
    result.push(p);
  }
  return result;
}

type PaginationProps = {
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

export default function Pagination({ page, totalPages, pageSize, onPageChange, onPageSizeChange }: PaginationProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-sm text-muted">
        <span>Rows per page</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded-lg border border-border bg-background/60 py-1.5 px-2 text-sm text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-background/70 disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>

          {getPageNumbers(page, totalPages).map((entry, index) =>
            typeof entry === "number" ? (
              <button
                key={entry}
                type="button"
                onClick={() => onPageChange(entry)}
                className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-medium transition ${
                  entry === page ? "bg-primary text-white shadow-xs" : "text-muted hover:bg-background/70"
                }`}
              >
                {entry}
              </button>
            ) : (
              <span key={`${entry}-${index}`} className="px-1 text-sm text-muted">
                …
              </span>
            ),
          )}

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-background/70 disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
```

- [x] **Step 2: Build to verify it compiles**

Run: `cd cordova-riskq-admin && npm run build`
Expected: Build succeeds.

- [x] **Step 3: Commit**

```bash
cd cordova-riskq-admin
git add src/components/ui/Pagination.tsx
git commit -m "feat(admin): add shared Pagination UI component"
```

---

### Task 7: Frontend — Users page pagination

**Files:**
- Modify: `cordova-riskq-admin/src/hooks/useUsers.ts`
- Modify: `cordova-riskq-admin/src/components/users/UserTable.tsx`
- Modify: `cordova-riskq-admin/src/app/(dashboard)/users/page.tsx`

**Interfaces:**
- Consumes: `usePaginationState` (Task 5), `<Pagination>` (Task 6), the new `GET /admin/users` contract (Task 3: `{ users, total, newThisWeek, page, limit }`).
- Produces: `useUsers(pagination: ReturnType<typeof usePaginationState>)` — now takes the shared pagination state as a parameter instead of managing nothing itself — returning `{ users, total, newThisWeek, loading, error, actionError, changeRole }`.

- [x] **Step 1: Rewrite `useUsers.ts`**

```typescript
"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { usePaginationState } from "@/hooks/usePaginationState";
import { User, UserRole } from "@/types/user";

type AdminUserRow = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  createdAt: string;
};

function toUser(row: AdminUserRow): User {
  return {
    id: row.id,
    name: row.name ?? "",
    email: row.email,
    role: row.role,
    createdAt: row.createdAt,
  };
}

export function useUsers(pagination: ReturnType<typeof usePaginationState>) {
  const { token } = useAuth();
  const { page, pageSize, search } = pagination;
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [newThisWeek, setNewThisWeek] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
    if (search) params.set("search", search);

    apiFetch<{ success: true; users: AdminUserRow[]; total: number; newThisWeek: number }>(
      `/admin/users?${params.toString()}`,
      { token },
    )
      .then((response) => {
        if (!cancelled) {
          setUsers(response.users.map(toUser));
          setTotal(response.total);
          setNewThisWeek(response.newThisWeek);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load users.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, page, pageSize, search]);

  const changeRole = useCallback(
    async (id: string, role: "citizen" | "responder", unit?: "BDRRMO" | "MDRRMO") => {
      if (!token) return;

      setActionError(null);

      try {
        const response = await apiFetch<{ success: true; user: AdminUserRow }>(
          `/admin/users/${id}/role`,
          {
            method: "PATCH",
            body: JSON.stringify(role === "responder" ? { role, unit } : { role }),
            token,
          }
        );

        setUsers((prev) =>
          prev.map((u) => (u.id === id ? toUser(response.user) : u))
        );
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Failed to change role.");
        throw err;
      }
    },
    [token]
  );

  return { users, total, newThisWeek, loading, error, actionError, changeRole };
}
```

- [x] **Step 2: Update `UserTable.tsx`** — drop client-side filtering, take `search`/`onSearchChange` and pagination props instead of owning its own `query` state

```typescript
"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import { User } from "@/types/user";
import type { ResponderUnit } from "@/types/responder";

const ROLE_BADGE_VARIANT: Record<User["role"], "info" | "success" | "default"> = {
  admin: "info",
  responder: "success",
  citizen: "default",
};

export default function UserTable({
  users,
  loading,
  error,
  actionError,
  changeRole,
  searchInput,
  onSearchChange,
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  users: User[];
  loading: boolean;
  error: string | null;
  actionError: string | null;
  changeRole: (id: string, role: "citizen" | "responder", unit?: ResponderUnit) => Promise<void>;
  searchInput: string;
  onSearchChange: (value: string) => void;
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [unitSelections, setUnitSelections] = useState<Record<string, ResponderUnit>>({});

  function getUnitSelection(userId: string): ResponderUnit {
    return unitSelections[userId] ?? "BDRRMO";
  }

  async function handleToggleRole(user: User) {
    const nextRole = user.role === "citizen" ? "responder" : "citizen";
    setPendingId(user.id);
    try {
      await changeRole(user.id, nextRole, nextRole === "responder" ? getUnitSelection(user.id) : undefined);
    } catch {
      // surfaced via useUsers' actionError state, rendered below
    } finally {
      setPendingId(null);
    }
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-sm text-red-700 shadow-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="border-b border-border p-4">
          <div className="relative w-full sm:max-w-xs">
            <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={searchInput}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search name, email..."
              className="w-full rounded-xl border border-border bg-background/60 py-2 pl-9 pr-3 text-sm text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
          </div>
        </div>

        {loading ? (
          <p className="p-10 text-center text-sm text-muted">Loading users…</p>
        ) : users.length === 0 ? (
          <EmptyState
            title="No users found"
            description="Try a different search, or check back once citizens register."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-background">
                <tr>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">User</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Email</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Role</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-background">
                    <td className="p-4 font-medium text-foreground">{user.name}</td>
                    <td className="p-4 text-foreground">{user.email}</td>
                    <td className="p-4">
                      <Badge variant={ROLE_BADGE_VARIANT[user.role]}>{user.role}</Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <Link
                          href={`/users/${user.id}`}
                          className="font-medium text-primary hover:text-primary-dark"
                        >
                          View
                        </Link>

                        {user.role === "citizen" && (
                          <select
                            value={getUnitSelection(user.id)}
                            onChange={(e) =>
                              setUnitSelections((prev) => ({ ...prev, [user.id]: e.target.value as ResponderUnit }))
                            }
                            disabled={pendingId === user.id}
                            className="rounded-lg border border-border bg-background/60 py-1.5 px-2 text-xs text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                          >
                            <option value="BDRRMO">BDRRMO</option>
                            <option value="MDRRMO">MDRRMO</option>
                          </select>
                        )}

                        {user.role !== "admin" && (
                          <Button
                            variant="outline"
                            disabled={pendingId === user.id}
                            onClick={() => handleToggleRole(user)}
                          >
                            {user.role === "citizen" ? "Promote to Responder" : "Revert to Citizen"}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </div>
  );
}
```

- [x] **Step 3: Update `users/page.tsx`** to own the `usePaginationState()` instance and wire it through

```typescript
"use client";

import { Users as UsersIcon, UserPlus } from "lucide-react";
import Card from "@/components/ui/Card";
import UserTable from "@/components/users/UserTable";
import { useUsers } from "@/hooks/useUsers";
import { usePaginationState } from "@/hooks/usePaginationState";

export default function UsersPage() {
  const pagination = usePaginationState();
  const { users, total, newThisWeek, loading, error, actionError, changeRole } = useUsers(pagination);
  const totalPages = Math.max(1, Math.ceil(total / pagination.pageSize));

  const stats = [
    { label: "Total Users", value: total, icon: UsersIcon, color: "text-primary", bg: "bg-primary-light" },
    { label: "New This Week", value: newThisWeek, icon: UserPlus, color: "text-info", bg: "bg-info-light" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Users</h1>

        <p className="text-sm text-muted">
          Manage registered Cordova RISKQ users.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="flex items-center gap-4">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${stat.bg} ${stat.color}`}>
                <Icon size={19} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <UserTable
        users={users}
        loading={loading}
        error={error}
        actionError={actionError}
        changeRole={changeRole}
        searchInput={pagination.searchInput}
        onSearchChange={pagination.setSearchInput}
        page={pagination.page}
        totalPages={totalPages}
        pageSize={pagination.pageSize}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />
    </div>
  );
}
```

- [x] **Step 4: Build and lint**

Run: `cd cordova-riskq-admin && npm run build && npm run lint`
Expected: Build succeeds. Lint error count is unchanged or lower than before this task (baseline going into this plan: 13 pre-existing `react-hooks/set-state-in-effect` errors — this task doesn't touch that pattern in a new way, so the count should stay the same).

- [x] **Step 5: Manual verification**

Run: `cd cordova-riskq-admin && npm run dev`, open `/users`, confirm: the table shows at most 10 rows with working Previous/Next and a page-size selector; typing in the search box (wait ~300ms) narrows results without a full page reload; "Total Users" and "New This Week" stat cards show real counts (not just the current page's row count).

- [x] **Step 6: Commit**

```bash
cd cordova-riskq-admin
git add src/hooks/useUsers.ts src/components/users/UserTable.tsx "src/app/(dashboard)/users/page.tsx"
git commit -m "feat(admin): paginate and server-search the Users page"
```

---

### Task 8: Frontend — Responders page pagination

**Files:**
- Modify: `cordova-riskq-admin/src/hooks/useResponders.ts`
- Modify: `cordova-riskq-admin/src/components/responders/ResponderTable.tsx`
- Modify: `cordova-riskq-admin/src/app/(dashboard)/responders/page.tsx`

**Interfaces:**
- Consumes: `usePaginationState` (Task 5), `<Pagination>` (Task 6), `GET /admin/users` with `role`/`duty`/`unit`/`search`/`page`/`limit` (Task 3), the pre-existing `GET /admin/responders/summary` (already built — confirmed present in `admin.routes.ts`/`admin.controller.ts`, unused by the frontend until now).
- Produces: `useResponders(pagination, filters: { duty: "all" | "on-duty" | "off-duty"; unit: "all" | "BDRRMO" | "MDRRMO" | "unclassified" })` returning `{ responders, total, loading, error }`. New `useResponderSummary()` hook returning `{ summary: { total, onDuty, offDuty, bdrrmo, mdrrmo, unclassified } | null, loading, error }`.

- [x] **Step 1: Rewrite `useResponders.ts`** — add pagination/search/duty/unit params, and a separate summary hook

```typescript
"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { usePaginationState } from "@/hooks/usePaginationState";
import { Responder } from "@/types/responder";

type AdminUserRow = {
  id: string;
  name: string | null;
  email: string;
  mobile: string | null;
  role: string;
  unit: string | null;
  isOnDuty: boolean;
  createdAt: string;
};

type DutyFilter = "all" | "on-duty" | "off-duty";
type UnitFilter = "all" | "BDRRMO" | "MDRRMO" | "unclassified";

function toResponder(row: AdminUserRow): Responder {
  return {
    id: row.id,
    name: row.name ?? "",
    email: row.email,
    phone: row.mobile,
    isOnDuty: row.isOnDuty,
    unit: row.unit === "BDRRMO" || row.unit === "MDRRMO" ? row.unit : null,
    createdAt: row.createdAt,
  };
}

export function useResponders(
  pagination: ReturnType<typeof usePaginationState>,
  filters: { duty: DutyFilter; unit: UnitFilter },
) {
  const { token } = useAuth();
  const { page, pageSize, search } = pagination;
  const { duty, unit } = filters;
  const [responders, setResponders] = useState<Responder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ role: "responder", page: String(page), limit: String(pageSize) });
    if (search) params.set("search", search);
    if (duty === "on-duty") params.set("duty", "true");
    if (duty === "off-duty") params.set("duty", "false");
    if (unit === "BDRRMO" || unit === "MDRRMO") params.set("unit", unit);
    // "unclassified" (unit === null) isn't expressible as a single equality
    // query param the backend supports yet -- filtered client-side below as
    // a narrow exception, same as today's behavior for this one option.

    apiFetch<{ success: true; users: AdminUserRow[]; total: number }>(
      `/admin/users?${params.toString()}`,
      { token },
    )
      .then((response) => {
        if (!cancelled) {
          const mapped = response.users.map(toResponder);
          if (unit === "unclassified") {
            setResponders(mapped.filter((r) => r.unit === null));
            setTotal(mapped.filter((r) => r.unit === null).length);
          } else {
            setResponders(mapped);
            setTotal(response.total);
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load responders.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, page, pageSize, search, duty, unit]);

  return { responders, total, loading, error };
}

export function useResponderSummary() {
  const { token } = useAuth();
  const [summary, setSummary] = useState<{
    total: number;
    onDuty: number;
    offDuty: number;
    bdrrmo: number;
    mdrrmo: number;
    unclassified: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setError(null);

    apiFetch<{ success: true; summary: typeof summary }>("/admin/responders/summary", { token })
      .then((response) => {
        if (!cancelled) setSummary(response.summary);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load responder summary.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return { summary, loading, error };
}
```

- [x] **Step 2: Update `ResponderTable.tsx`** — drop client-side filtering/search, take filter state and pagination props from the parent

```typescript
"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import type { Responder, ResponderUnit } from "@/types/responder";
import { formatDate } from "@/lib/utils";

type DutyFilter = "all" | "on-duty" | "off-duty";
type UnitFilter = "all" | ResponderUnit | "unclassified";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ResponderTable({
  responders,
  loading,
  error,
  searchInput,
  onSearchChange,
  dutyFilter,
  onDutyFilterChange,
  unitFilter,
  onUnitFilterChange,
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  responders: Responder[];
  loading: boolean;
  error: string | null;
  searchInput: string;
  onSearchChange: (value: string) => void;
  dutyFilter: DutyFilter;
  onDutyFilterChange: (value: DutyFilter) => void;
  unitFilter: UnitFilter;
  onUnitFilterChange: (value: UnitFilter) => void;
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-sm text-red-700 shadow-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-surface shadow-xs">
      <div className="flex flex-col gap-3 border-b border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search name, email..."
            className="w-full rounded-xl border border-border bg-background/60 py-2 pl-9 pr-3 text-sm text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
        </div>

        <div className="flex gap-3">
          <select
            value={dutyFilter}
            onChange={(e) => onDutyFilterChange(e.target.value as DutyFilter)}
            className="rounded-xl border border-border bg-background/60 py-2 px-3 text-sm text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
          >
            <option value="all">All duty status</option>
            <option value="on-duty">On Duty</option>
            <option value="off-duty">Off Duty</option>
          </select>

          <select
            value={unitFilter}
            onChange={(e) => onUnitFilterChange(e.target.value as UnitFilter)}
            className="rounded-xl border border-border bg-background/60 py-2 px-3 text-sm text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
          >
            <option value="all">All units</option>
            <option value="BDRRMO">BDRRMO</option>
            <option value="MDRRMO">MDRRMO</option>
            <option value="unclassified">Unclassified</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="p-10 text-center text-sm text-muted">Loading responders…</p>
      ) : responders.length === 0 ? (
        <EmptyState
          title="No responders found"
          description="Try a different search or filter combination."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-background/60">
              <tr>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Responder</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Phone</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Duty</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Unit</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Joined</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {responders.map((responder) => (
                <tr key={responder.id} className="transition-colors hover:bg-background/70">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white shadow-xs">
                        {initials(responder.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{responder.name}</p>
                        <p className="text-xs text-muted">{responder.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-muted">{responder.phone ?? "Not provided"}</td>
                  <td className="p-4">
                    <Badge variant={responder.isOnDuty ? "success" : "default"}>
                      {responder.isOnDuty ? "On Duty" : "Off Duty"}
                    </Badge>
                  </td>
                  <td className="p-4 text-muted">{responder.unit ?? "Unclassified"}</td>
                  <td className="p-4 text-muted">{formatDate(responder.createdAt)}</td>
                  <td className="p-4">
                    <Link
                      href={`/responders/${responder.id}`}
                      className="font-medium text-primary hover:text-primary-dark"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
```

- [x] **Step 3: Update `responders/page.tsx`**

```typescript
"use client";

import { useState } from "react";
import { ShieldCheck, ShieldHalf, ShieldOff } from "lucide-react";
import Card from "@/components/ui/Card";
import ResponderTable from "@/components/responders/ResponderTable";
import { useResponders, useResponderSummary } from "@/hooks/useResponders";
import { usePaginationState } from "@/hooks/usePaginationState";
import type { ResponderUnit } from "@/types/responder";

type DutyFilter = "all" | "on-duty" | "off-duty";
type UnitFilter = "all" | ResponderUnit | "unclassified";

export default function RespondersPage() {
  const pagination = usePaginationState();
  const [dutyFilter, setDutyFilter] = useState<DutyFilter>("all");
  const [unitFilter, setUnitFilter] = useState<UnitFilter>("all");

  const { responders, total, loading, error } = useResponders(pagination, {
    duty: dutyFilter,
    unit: unitFilter,
  });
  const { summary } = useResponderSummary();
  const totalPages = Math.max(1, Math.ceil(total / pagination.pageSize));

  function handleDutyFilterChange(value: DutyFilter) {
    setDutyFilter(value);
    pagination.resetPage();
  }

  function handleUnitFilterChange(value: UnitFilter) {
    setUnitFilter(value);
    pagination.resetPage();
  }

  const statCards = [
    { label: "Total Responders", value: summary?.total ?? 0, icon: ShieldCheck, color: "text-primary", bg: "bg-primary-light" },
    { label: "On Duty", value: summary?.onDuty ?? 0, icon: ShieldHalf, color: "text-success", bg: "bg-success-light" },
    { label: "Off Duty", value: summary?.offDuty ?? 0, icon: ShieldOff, color: "text-muted", bg: "bg-background" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Responders</h1>

        <p className="text-sm text-muted">
          Monitor and manage emergency responders.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 sm:max-w-xl">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="flex items-center gap-4">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${card.bg} ${card.color}`}>
                <Icon size={19} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{card.label}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{card.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <ResponderTable
        responders={responders}
        loading={loading}
        error={error}
        searchInput={pagination.searchInput}
        onSearchChange={pagination.setSearchInput}
        dutyFilter={dutyFilter}
        onDutyFilterChange={handleDutyFilterChange}
        unitFilter={unitFilter}
        onUnitFilterChange={handleUnitFilterChange}
        page={pagination.page}
        totalPages={totalPages}
        pageSize={pagination.pageSize}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />
    </div>
  );
}
```

- [x] **Step 4: Build and lint**

Run: `cd cordova-riskq-admin && npm run build && npm run lint`
Expected: Build succeeds; lint error count unchanged from before this task.

- [x] **Step 5: Manual verification**

Run: `cd cordova-riskq-admin && npm run dev`, open `/responders`, confirm: pagination controls work, duty/unit filter changes reset to page 1, "Unclassified" unit filter still works (client-side exception, documented in the hook), and the three stat cards show real aggregate counts from `/admin/responders/summary` (not just the current page).

- [x] **Step 6: Commit**

```bash
cd cordova-riskq-admin
git add src/hooks/useResponders.ts src/components/responders/ResponderTable.tsx "src/app/(dashboard)/responders/page.tsx"
git commit -m "feat(admin): paginate and server-search the Responders page"
```

---

### Task 9: Frontend — SOS Alerts page pagination

**Files:**
- Modify: `cordova-riskq-admin/src/hooks/useSosAlerts.ts`
- Modify: `cordova-riskq-admin/src/components/sos-alerts/SosAlertTable.tsx`
- Modify: `cordova-riskq-admin/src/app/(dashboard)/sos-alerts/page.tsx`

**Interfaces:**
- Consumes: `usePaginationState` (Task 5), `<Pagination>` (Task 6), the extended `GET /admin/sos-alerts` (search + alertStatus, Task 2), new `GET /admin/sos-alerts/summary` (Task 2).
- Produces: `useSosAlerts(pagination, alertStatus: "All" | AlertStatus)` returning `{ alerts, total, loading, error }`. New `useSosAlertSummary()` returning `{ summary: { total, New, Acknowledged, Resolved } | null, loading, error }`.

- [x] **Step 1: Rewrite `useSosAlerts.ts`**

```typescript
"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { usePaginationState } from "@/hooks/usePaginationState";
import type { SosAlert, SosAlertStatus } from "@/types/sos-alert";

type RawSosAlert = {
  id: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  locationLabel: string | null;
  createdAt: string;
  reporter: { id: string; name: string | null; mobile: string | null };
  incidentId: string | null;
  incidentStatus: string | null;
};

const INCIDENT_STATUS_TO_ALERT_STATUS: Record<string, SosAlertStatus> = {
  pending: "New",
  lobby: "Acknowledged",
  on_the_way: "Acknowledged",
  arrived: "Acknowledged",
  completed: "Resolved",
  cancelled: "Resolved",
};

function toSosAlert(raw: RawSosAlert): SosAlert {
  return {
    id: raw.id,
    userName: raw.reporter.name ?? "Unknown",
    locationName: raw.locationLabel ?? "Location unavailable",
    latitude: raw.latitude ?? 0,
    longitude: raw.longitude ?? 0,
    status: raw.incidentStatus ? (INCIDENT_STATUS_TO_ALERT_STATUS[raw.incidentStatus] ?? "New") : "New",
    createdAt: raw.createdAt,
  };
}

export function useSosAlerts(pagination: ReturnType<typeof usePaginationState>, alertStatus: "All" | SosAlertStatus) {
  const { token } = useAuth();
  const { page, pageSize, search } = pagination;
  const [alerts, setAlerts] = useState<SosAlert[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
    if (search) params.set("search", search);
    if (alertStatus !== "All") params.set("alertStatus", alertStatus);

    apiFetch<{ success: true; alerts: RawSosAlert[]; total: number }>(
      `/admin/sos-alerts?${params.toString()}`,
      { token },
    )
      .then((response) => {
        if (!cancelled) {
          setAlerts(response.alerts.map(toSosAlert));
          setTotal(response.total);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load SOS alerts.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, page, pageSize, search, alertStatus]);

  return { alerts, total, loading, error };
}

export function useSosAlertSummary() {
  const { token } = useAuth();
  const [summary, setSummary] = useState<{
    total: number;
    New: number;
    Acknowledged: number;
    Resolved: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setError(null);

    apiFetch<{ success: true; summary: typeof summary }>("/admin/sos-alerts/summary", { token })
      .then((response) => {
        if (!cancelled) setSummary(response.summary);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load SOS alert summary.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return { summary, loading, error };
}
```

- [x] **Step 2: Update `SosAlertTable.tsx`** — drop client-side filtering, take search/status-filter/pagination as props

```typescript
"use client";

import { Search } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import type { SosAlert, SosAlertStatus } from "@/types/sos-alert";
import { timeAgo } from "@/lib/utils";

type SosAlertTableProps = {
  alerts: SosAlert[];
  loading: boolean;
  error: string | null;
  searchInput: string;
  onSearchChange: (value: string) => void;
  statusFilter: "All" | SosAlertStatus;
  onStatusFilterChange: (value: "All" | SosAlertStatus) => void;
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

const statusVariant = {
  New: "danger",
  Acknowledged: "warning",
  Resolved: "success",
} as const;

const statusFilters = ["All", "New", "Acknowledged", "Resolved"] as const;

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function SosAlertTable({
  alerts,
  loading,
  error,
  searchInput,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: SosAlertTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-surface shadow-xs">
      <div className="flex flex-col gap-3 border-b border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search user, location..."
            className="w-full rounded-xl border border-border bg-background/60 py-2 pl-9 pr-3 text-sm text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {statusFilters.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onStatusFilterChange(status)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95 ${
                statusFilter === status
                  ? "bg-primary text-white shadow-xs"
                  : "bg-background text-muted hover:bg-primary-light/40 hover:text-primary"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="p-10 text-center text-sm text-muted">Loading SOS alerts…</p>
      ) : error ? (
        <p className="p-10 text-center text-sm text-red-700">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-background/60">
              <tr>
                <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">User</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Location</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Received</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {alerts.map((alert) => (
                <tr
                  key={alert.id}
                  className={`transition-colors hover:bg-background/70 ${alert.status === "New" ? "bg-danger-light/20" : ""}`}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center">
                        {alert.status === "New" && (
                          <span className="absolute inline-flex h-9 w-9 animate-ping rounded-full bg-danger opacity-30" />
                        )}
                        <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white shadow-xs">
                          {initials(alert.userName)}
                        </span>
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{alert.userName}</p>
                        <p className="text-xs text-muted">{alert.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-muted">{alert.locationName}</td>
                  <td className="p-4 text-muted">{timeAgo(alert.createdAt)}</td>
                  <td className="p-4">
                    <Badge variant={statusVariant[alert.status]} solid={alert.status === "New"}>
                      {alert.status}
                    </Badge>
                  </td>
                </tr>
              ))}

              {alerts.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-sm text-muted">
                    No SOS alerts match your search and filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
```

- [x] **Step 3: Update `sos-alerts/page.tsx`**

```typescript
"use client";

import { useState } from "react";
import { BellRing, CheckCheck, ShieldCheck, Siren } from "lucide-react";
import Card from "@/components/ui/Card";
import SosAlertTable from "@/components/sos-alerts/SosAlertTable";
import { useSosAlerts, useSosAlertSummary } from "@/hooks/useSosAlerts";
import { usePaginationState } from "@/hooks/usePaginationState";
import type { SosAlertStatus } from "@/types/sos-alert";

export default function SosAlertsPage() {
  const pagination = usePaginationState();
  const [statusFilter, setStatusFilter] = useState<"All" | SosAlertStatus>("All");

  const { alerts, total, loading, error } = useSosAlerts(pagination, statusFilter);
  const { summary } = useSosAlertSummary();
  const totalPages = Math.max(1, Math.ceil(total / pagination.pageSize));

  function handleStatusFilterChange(value: "All" | SosAlertStatus) {
    setStatusFilter(value);
    pagination.resetPage();
  }

  const stats = [
    {
      label: "Total Alerts",
      value: String(summary?.total ?? 0),
      icon: Siren,
      color: "text-primary",
      bg: "bg-primary-light",
    },
    {
      label: "New",
      value: String(summary?.New ?? 0),
      icon: BellRing,
      color: "text-danger",
      bg: "bg-danger-light",
      pulse: true,
    },
    {
      label: "Acknowledged",
      value: String(summary?.Acknowledged ?? 0),
      icon: CheckCheck,
      color: "text-warning",
      bg: "bg-warning-light",
    },
    {
      label: "Resolved",
      value: String(summary?.Resolved ?? 0),
      icon: ShieldCheck,
      color: "text-success",
      bg: "bg-success-light",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">SOS Alerts</h1>
        <p className="text-sm text-muted">
          Emergency SOS alerts received from citizens across Cordova.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="flex items-center gap-4">
              <span className="relative flex h-11 w-11 shrink-0 items-center justify-center">
                {stat.pulse && (
                  <span className={`absolute inline-flex h-11 w-11 animate-ping rounded-full ${stat.bg} opacity-60`} />
                )}
                <span className={`relative flex h-11 w-11 items-center justify-center rounded-full ${stat.bg} ${stat.color}`}>
                  <Icon size={19} />
                </span>
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <SosAlertTable
        alerts={alerts}
        loading={loading}
        error={error}
        searchInput={pagination.searchInput}
        onSearchChange={pagination.setSearchInput}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        page={pagination.page}
        totalPages={totalPages}
        pageSize={pagination.pageSize}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />
    </div>
  );
}
```

- [x] **Step 4: Build and lint**

Run: `cd cordova-riskq-admin && npm run build && npm run lint`
Expected: Build succeeds; lint error count unchanged.

- [x] **Step 5: Manual verification**

Run: `cd cordova-riskq-admin && npm run dev`, open `/sos-alerts`, confirm: pagination works, clicking a status pill resets to page 1 and filters server-side, search narrows by user/location, and the four stat cards reflect true totals from `/admin/sos-alerts/summary` (not just the loaded page).

- [ ] **Step 6: Commit**

```bash
cd cordova-riskq-admin
git add src/hooks/useSosAlerts.ts src/components/sos-alerts/SosAlertTable.tsx "src/app/(dashboard)/sos-alerts/page.tsx"
git commit -m "feat(admin): paginate and server-search the SOS Alerts page"
```

---

### Task 10: Frontend — Announcements page pagination

**Files:**
- Modify: `cordova-riskq-admin/src/hooks/useAnnouncements.ts`
- Modify: `cordova-riskq-admin/src/components/announcements/AnnouncementTable.tsx`
- Modify: `cordova-riskq-admin/src/app/(dashboard)/announcements/page.tsx`

**Interfaces:**
- Consumes: `usePaginationState` (Task 5), `<Pagination>` (Task 6), the extended `GET /admin/announcements` (Task 4).
- Produces: `useAnnouncements(pagination, priority: "All" | AnnouncementPriority)` returning `{ announcements, total, loading, error, actionError, create, remove }` — `create`/`remove` keep their existing signatures, just re-fetch the current page afterward instead of doing an optimistic local splice (simpler and correct now that the local list is only one page, not the full set).

- [x] **Step 1: Rewrite `useAnnouncements.ts`**

```typescript
"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { usePaginationState } from "@/hooks/usePaginationState";
import type { Announcement, AnnouncementAudience, AnnouncementPriority } from "@/types/announcement";

type CreateAnnouncementInput = {
  title: string;
  content: string;
  priority: AnnouncementPriority;
  audience: AnnouncementAudience;
  barangayName?: string;
};

export function useAnnouncements(
  pagination: ReturnType<typeof usePaginationState>,
  priority: "All" | AnnouncementPriority,
) {
  const { token } = useAuth();
  const { page, pageSize, search } = pagination;
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
    if (search) params.set("search", search);
    if (priority !== "All") params.set("priority", priority);

    apiFetch<{ success: true; announcements: Announcement[]; total: number }>(
      `/admin/announcements?${params.toString()}`,
      { token },
    )
      .then((response) => {
        if (!cancelled) {
          setAnnouncements(response.announcements);
          setTotal(response.total);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load announcements.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, page, pageSize, search, priority, refetchToken]);

  const create = useCallback(
    async (input: CreateAnnouncementInput) => {
      if (!token) return;

      setActionError(null);

      try {
        await apiFetch<{ success: true; announcement: Announcement }>("/admin/announcements", {
          method: "POST",
          body: JSON.stringify(input),
          token,
        });
        setRefetchToken((t) => t + 1);
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Failed to publish announcement.");
        throw err;
      }
    },
    [token],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!token) return;

      setActionError(null);

      try {
        await apiFetch<{ success: true }>(`/admin/announcements/${id}`, {
          method: "DELETE",
          token,
        });
        setRefetchToken((t) => t + 1);
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Failed to delete announcement.");
        throw err;
      }
    },
    [token],
  );

  return { announcements, total, loading, error, actionError, create, remove };
}
```

- [x] **Step 2: Update `AnnouncementTable.tsx`** — drop client-side filtering, take search/priority-filter/pagination as props

```typescript
// src/components/announcements/AnnouncementTable.tsx
"use client";

import { useState } from "react";
import { Search, Megaphone, Trash2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import type { Announcement, AnnouncementPriority } from "@/types/announcement";

const priorityFilters = ["All", "Normal", "Urgent"] as const;

export default function AnnouncementTable({
  announcements,
  loading,
  error,
  actionError,
  onDelete,
  searchInput,
  onSearchChange,
  priorityFilter,
  onPriorityFilterChange,
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
  actionError: string | null;
  onDelete: (id: string) => Promise<void>;
  searchInput: string;
  onSearchChange: (value: string) => void;
  priorityFilter: "All" | AnnouncementPriority;
  onPriorityFilterChange: (value: "All" | AnnouncementPriority) => void;
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setPendingId(id);
    try {
      await onDelete(id);
    } catch {
      // surfaced via useAnnouncements' actionError state, rendered below
    } finally {
      setPendingId(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted shadow-sm">
        Loading announcements…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-sm text-red-700 shadow-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border/70 bg-surface shadow-xs">
        <div className="flex flex-col gap-3 border-b border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={searchInput}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search announcements..."
              className="w-full rounded-xl border border-border bg-background/60 py-2 pl-9 pr-3 text-sm text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {priorityFilters.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onPriorityFilterChange(p)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95 ${
                  priorityFilter === p
                    ? "bg-primary text-white shadow-xs"
                    : "bg-background text-muted hover:bg-primary-light/40 hover:text-primary"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-border/70">
          {announcements.map((a) => (
            <div key={a.id} className="flex items-start gap-3 p-4 transition-colors hover:bg-background/50">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${a.priority === "Urgent" ? "bg-danger-light text-danger" : "bg-primary-light text-primary"}`}>
                <Megaphone size={16} />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-foreground">{a.title}</p>
                  <Badge variant={a.priority === "Urgent" ? "danger" : "default"} solid={a.priority === "Urgent"}>
                    {a.priority}
                  </Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{a.content}</p>
                <p className="mt-1.5 text-xs text-text-tertiary">
                  {a.audience}
                  {a.barangayName ? ` (${a.barangayName})` : ""} &middot; {new Date(a.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(a.id)}
                disabled={pendingId === a.id}
                aria-label={`Delete ${a.title}`}
                className="shrink-0 rounded-full p-2 text-muted transition hover:bg-danger-light hover:text-danger disabled:opacity-50"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}

          {announcements.length === 0 && (
            <p className="p-10 text-center text-sm text-muted">No announcements match your search and filters.</p>
          )}
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </div>
  );
}
```

- [x] **Step 3: Update `announcements/page.tsx`**

```typescript
// src/app/(dashboard)/announcements/page.tsx
"use client";

import { useState } from "react";
import AnnouncementForm from "@/components/announcements/AnnouncementForm";
import AnnouncementPreview from "@/components/announcements/AnnouncementPreview";
import AnnouncementTable from "@/components/announcements/AnnouncementTable";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { usePaginationState } from "@/hooks/usePaginationState";
import type { AnnouncementAudience, AnnouncementPriority } from "@/types/announcement";

export default function AnnouncementsPage() {
  const pagination = usePaginationState();
  const [priorityFilter, setPriorityFilter] = useState<"All" | AnnouncementPriority>("All");

  const { announcements, total, loading, error, actionError, create, remove } = useAnnouncements(
    pagination,
    priorityFilter,
  );
  const totalPages = Math.max(1, Math.ceil(total / pagination.pageSize));

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState<AnnouncementPriority>("Normal");
  const [audience, setAudience] = useState<AnnouncementAudience>("All Users");
  const [barangay, setBarangay] = useState("");

  function handlePriorityFilterChange(value: "All" | AnnouncementPriority) {
    setPriorityFilter(value);
    pagination.resetPage();
  }

  async function handlePublish() {
    try {
      await create({
        title,
        content: body,
        priority,
        audience,
        barangayName: audience === "Specific Barangay" ? barangay : undefined,
      });
      setTitle("");
      setBody("");
      setPriority("Normal");
      setAudience("All Users");
      setBarangay("");
    } catch {
      // surfaced via useAnnouncements' actionError state, rendered in the table
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Announcements</h1>

        <p className="text-sm text-muted">
          Publish emergency and system announcements.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr] xl:items-start">
        <AnnouncementForm
          title={title}
          body={body}
          priority={priority}
          audience={audience}
          barangay={barangay}
          onTitleChange={setTitle}
          onBodyChange={setBody}
          onPriorityChange={setPriority}
          onAudienceChange={setAudience}
          onBarangayChange={setBarangay}
          onPublish={handlePublish}
        />

        <AnnouncementPreview title={title} body={body} priority={priority} audience={audience} />
      </div>

      <div>
        <h2 className="px-1 pb-3 text-xs font-bold uppercase tracking-widest text-muted">Recent Announcements</h2>
        <AnnouncementTable
          announcements={announcements}
          loading={loading}
          error={error}
          actionError={actionError}
          onDelete={remove}
          searchInput={pagination.searchInput}
          onSearchChange={pagination.setSearchInput}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={handlePriorityFilterChange}
          page={pagination.page}
          totalPages={totalPages}
          pageSize={pagination.pageSize}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
        />
      </div>
    </div>
  );
}
```

- [x] **Step 4: Build and lint**

Run: `cd cordova-riskq-admin && npm run build && npm run lint`
Expected: Build succeeds; lint error count unchanged.

- [x] **Step 5: Manual verification**

Run: `cd cordova-riskq-admin && npm run dev`, open `/announcements`, confirm: publishing a new announcement makes it appear (it refetches the current page), deleting one works, pagination and search/priority filters work against the full dataset rather than just the loaded page.

- [ ] **Step 6: Commit**

```bash
cd cordova-riskq-admin
git add src/hooks/useAnnouncements.ts src/components/announcements/AnnouncementTable.tsx "src/app/(dashboard)/announcements/page.tsx"
git commit -m "feat(admin): paginate and server-search the Announcements page"
```

---

### Task 11: Final end-to-end verification

**Files:** None (verification only).

- [x] **Step 1: Full backend verification**

Run: `cd CordovaRiskQ-Bacnkend && npx tsc --noEmit && npm test`
Expected: No type errors; every test passes (Task 1's 5 new tests plus every pre-existing test, ~41 total based on the 36 passing before this plan started).

- [x] **Step 2: Full frontend verification**

Run: `cd cordova-riskq-admin && npm run build && npm run lint`
Expected: Build succeeds with all routes listed (no `/witnesses` or `/resources` — those were removed in a prior change and should stay gone). Lint error count matches the pre-plan baseline of 13 (all pre-existing `react-hooks/set-state-in-effect` errors on other hooks) — this plan's new/modified hooks (`useUsers`, `useResponders`, `useSosAlerts`, `useAnnouncements`, `usePaginationState`) follow the same early-return-then-setState pattern already established throughout this codebase, so the count should not have grown.

- [x] **Step 3: Manual smoke test across all four pages**

Run: `cd cordova-riskq-admin && npm run dev`. For each of `/users`, `/responders`, `/sos-alerts`, `/announcements`: change the page-size selector (10/25/50) and confirm the row count and page count both update; click through to the last page and confirm Next disables; type a search term that matches nothing and confirm the empty state renders (not a blank table); clear the search and confirm the full result set returns.

- [x] **Step 4: Update `TODO.md`**

Add a line to the "Real (backend-wired)" section of `cordova-riskq-admin/TODO.md`:

```markdown
- [x] Users/Responders/SOS Alerts/Announcements pagination — all four pages now fetch one page at a time with server-side search/filtering (`GET /admin/users`, `/admin/sos-alerts`, `/admin/announcements` all gained `page`/`limit`/`search` + resource-specific filters), replacing the earlier fetch-everything-and-filter-client-side pattern. Shared `<Pagination>` component + `usePaginationState` hook. Emergencies/Incident Reports and Evacuation Centers were deliberately excluded (see `docs/superpowers/specs/2026-09-16-admin-pagination-design.md`).
```

- [ ] **Step 5: Commit**

```bash
cd cordova-riskq-admin
git add TODO.md
git commit -m "docs: mark admin pagination as done in TODO.md"
```
