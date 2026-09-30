// src/components/support-requests/SupportRequestTable.tsx
"use client";

import { useState } from "react";
import { Search, LifeBuoy, Mail, Phone } from "lucide-react";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import { REQUESTER_ROLE_LABEL, type SupportRequest, type SupportRequestStatus } from "@/types/support-request";

const statusFilters = ["All", "open", "in_progress", "resolved"] as const;

const STATUS_LABEL: Record<SupportRequestStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
};

const STATUS_VARIANT: Record<SupportRequestStatus, BadgeVariant> = {
  open: "danger",
  in_progress: "warning",
  resolved: "success",
};

export default function SupportRequestTable({
  supportRequests,
  loading,
  error,
  actionError,
  onUpdateStatus,
  freshIds,
  searchInput,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  supportRequests: SupportRequest[];
  loading: boolean;
  error: string | null;
  actionError: string | null;
  onUpdateStatus: (id: string, status: SupportRequestStatus) => Promise<void>;
  freshIds: string[];
  searchInput: string;
  onSearchChange: (value: string) => void;
  statusFilter: "All" | SupportRequestStatus;
  onStatusFilterChange: (value: "All" | SupportRequestStatus) => void;
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleStatus(id: string, status: SupportRequestStatus) {
    setPendingId(id);
    try {
      await onUpdateStatus(id, status);
    } catch {
      // surfaced via useSupportRequests' actionError state, rendered below
    } finally {
      setPendingId(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted shadow-sm">
        Loading support requests…
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
              placeholder="Search by name, email or message..."
              className="w-full rounded-xl border border-border bg-background/60 py-2 pl-9 pr-3 text-sm text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {statusFilters.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onStatusFilterChange(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95 ${
                  statusFilter === s
                    ? "bg-primary text-white shadow-xs"
                    : "bg-background text-muted hover:bg-primary-light/40 hover:text-primary"
                }`}
              >
                {s === "All" ? "All" : STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-border/70">
          {supportRequests.map((r) => (
            <div
              key={r.id}
              className={`flex items-start gap-3 p-4 transition-colors hover:bg-background/50 ${
                freshIds.includes(r.id) ? "bg-primary-light/30 ring-1 ring-inset ring-primary/30" : ""
              }`}
            >
              <LifeBuoy
                size={20}
                className={`mt-0.5 shrink-0 ${r.status === "open" ? "text-danger" : "text-primary"}`}
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-foreground">{r.subject || `${r.topic} support request`}</p>
                  <Badge variant={STATUS_VARIANT[r.status]} solid={r.status === "open"}>
                    {STATUS_LABEL[r.status]}
                  </Badge>
                  <Badge>{r.topic}</Badge>
                  {freshIds.includes(r.id) && (
                    <Badge variant="info" solid>
                      New
                    </Badge>
                  )}
                </div>

                <p className="mt-1 whitespace-pre-wrap text-sm text-muted">{r.message}</p>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-tertiary">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="font-medium text-foreground/80">{r.user.name || "Unnamed user"}</span>
                    {r.user.role && (
                      <Badge variant={r.user.role === "responder" ? "info" : "default"}>
                        {REQUESTER_ROLE_LABEL[r.user.role] ?? r.user.role}
                      </Badge>
                    )}
                  </span>
                  <a href={`mailto:${r.user.email}`} className="inline-flex items-center gap-1 hover:text-primary">
                    <Mail size={12} />
                    {r.user.email}
                  </a>
                  {r.user.mobile && (
                    <a href={`tel:${r.user.mobile}`} className="inline-flex items-center gap-1 hover:text-primary">
                      <Phone size={12} />
                      {r.user.mobile}
                    </a>
                  )}
                  <span>{new Date(r.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <select
                value={r.status}
                disabled={pendingId === r.id}
                onChange={(e) => handleStatus(r.id, e.target.value as SupportRequestStatus)}
                aria-label={`Change status of ${r.subject || r.topic} request`}
                className="shrink-0 rounded-xl border border-border bg-background/60 px-2.5 py-1.5 text-xs font-semibold text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 disabled:opacity-50"
              >
                {(Object.keys(STATUS_LABEL) as SupportRequestStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {supportRequests.length === 0 && (
            <p className="p-10 text-center text-sm text-muted">No support requests match your search and filters.</p>
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
