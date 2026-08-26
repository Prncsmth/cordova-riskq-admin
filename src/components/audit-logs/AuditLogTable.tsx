"use client";

import { useMemo, useState } from "react";
import { Search, Siren, ShieldCheck, Megaphone, Users as UsersIcon, ScrollText } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Badge from "@/components/ui/Badge";
import type { AuditLog } from "@/types/audit-log";
import type { BadgeVariant } from "@/components/ui/Badge";

// Mock data for UI — replace with real API data once backend endpoints are available.
const logs: AuditLog[] = [
  { id: "LOG-901", adminId: "Admin User", action: "Updated incident status", entityType: "Emergency", entityId: "INC-2026-0091", createdAt: "10 min ago" },
  { id: "LOG-900", adminId: "Admin User", action: "Verified responder", entityType: "Responder", entityId: "RES-001", createdAt: "1 hr ago" },
  { id: "LOG-899", adminId: "Admin User", action: "Published announcement", entityType: "Announcement", entityId: "ANN-014", createdAt: "3 hr ago" },
  { id: "LOG-898", adminId: "Admin User", action: "Suspended user account", entityType: "User", entityId: "USR-233", createdAt: "5 hr ago" },
];

const entityStyles: Record<string, { icon: LucideIcon; variant: BadgeVariant; tile: string }> = {
  Emergency: { icon: Siren, variant: "danger", tile: "bg-danger-light text-danger" },
  Responder: { icon: ShieldCheck, variant: "info", tile: "bg-info-light text-info" },
  Announcement: { icon: Megaphone, variant: "warning", tile: "bg-warning-light text-warning" },
  User: { icon: UsersIcon, variant: "success", tile: "bg-success-light text-success" },
};

const defaultEntityStyle = { icon: ScrollText, variant: "default" as BadgeVariant, tile: "bg-background text-muted" };

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const entityFilters = ["All", ...Array.from(new Set(logs.map((log) => log.entityType)))];

export default function AuditLogTable() {
  const [query, setQuery] = useState("");
  const [entityFilter, setEntityFilter] = useState("All");

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      const matchesEntity = entityFilter === "All" || log.entityType === entityFilter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        q.length === 0 ||
        log.action.toLowerCase().includes(q) ||
        log.adminId.toLowerCase().includes(q) ||
        log.id.toLowerCase().includes(q) ||
        (log.entityId ?? "").toLowerCase().includes(q);
      return matchesEntity && matchesQuery;
    });
  }, [query, entityFilter]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex flex-col gap-3 border-b border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search actions, admins, IDs..."
            className="w-full rounded-xl border border-border bg-background/60 py-2 pl-9 pr-3 text-sm text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {entityFilters.map((entity) => (
            <button
              key={entity}
              type="button"
              onClick={() => setEntityFilter(entity)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95 ${
                entityFilter === entity
                  ? "bg-linear-to-b from-primary to-primary-dark text-white shadow-sm"
                  : "bg-background text-muted hover:bg-primary-light/40 hover:text-primary"
              }`}
            >
              {entity}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-background/60">
            <tr>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Action</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Admin</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Entity</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {filtered.map((log) => {
              const style = entityStyles[log.entityType] ?? defaultEntityStyle;
              const Icon = style.icon;

              return (
                <tr key={log.id} className="transition-colors hover:bg-background/70">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${style.tile}`}>
                        <Icon size={16} />
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{log.action}</p>
                        <p className="text-xs text-muted">{log.id}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linear-to-b from-primary to-primary-dark text-[10px] font-semibold text-white">
                        {initials(log.adminId)}
                      </span>
                      <span className="text-foreground">{log.adminId}</span>
                    </div>
                  </td>

                  <td className="p-4">
                    <Badge variant={style.variant}>
                      {log.entityType}
                      {log.entityId ? ` · ${log.entityId}` : ""}
                    </Badge>
                  </td>

                  <td className="p-4 text-muted">{log.createdAt}</td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="p-10 text-center text-sm text-muted">
                  No matching activity found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
