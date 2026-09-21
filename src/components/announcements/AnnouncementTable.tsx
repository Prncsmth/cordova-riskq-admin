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
              <Megaphone size={20} className={`shrink-0 ${a.priority === "Urgent" ? "text-danger" : "text-primary"}`} />

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
