// src/components/announcements/AnnouncementTable.tsx
"use client";

import { useMemo, useState } from "react";
import { Search, Megaphone, Trash2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import type { Announcement } from "@/types/announcement";

const priorityFilters = ["All", "Normal", "Urgent"] as const;

export default function AnnouncementTable({
  announcements,
  loading,
  error,
  actionError,
  onDelete,
}: {
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
  actionError: string | null;
  onDelete: (id: string) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<(typeof priorityFilters)[number]>("All");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return announcements.filter((a) => {
      const matchesPriority = priorityFilter === "All" || a.priority === priorityFilter;
      const q = query.trim().toLowerCase();
      const matchesQuery = q.length === 0 || a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q);
      return matchesPriority && matchesQuery;
    });
  }, [query, priorityFilter, announcements]);

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
      <div className="rounded-2xl border border-border bg-white p-10 text-center text-sm text-muted shadow-sm">
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

      <div className="overflow-hidden rounded-2xl border border-border/70 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
        <div className="flex flex-col gap-3 border-b border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search announcements..."
              className="w-full rounded-xl border border-border bg-background/60 py-2 pl-9 pr-3 text-sm text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {priorityFilters.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriorityFilter(p)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95 ${
                  priorityFilter === p
                    ? "bg-linear-to-b from-primary to-primary-dark text-white shadow-sm"
                    : "bg-background text-muted hover:bg-primary-light/40 hover:text-primary"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-border/70">
          {filtered.map((a) => (
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
                <p className="mt-1.5 text-xs text-muted">
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

          {filtered.length === 0 && (
            <p className="p-10 text-center text-sm text-muted">No announcements match your filters.</p>
          )}
        </div>
      </div>
    </div>
  );
}
