"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Bell, MailOpen } from "lucide-react";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { ACTIVITY_TYPE_STYLE, ACTIVITY_TYPE_HREF } from "@/lib/adminActivity";
import { timeAgo } from "@/lib/utils";
import type { AdminActivityType } from "@/hooks/useRecentActivity";

// GET /notifications returns at most the 50 newest (last 24 hours) --
// paged client-side below.
const FEED_LIMIT = 50;
const typeFilters = ["All", ...Object.keys(ACTIVITY_TYPE_STYLE)] as (AdminActivityType | "All")[];

export default function NotificationsPage() {
  const { items, loading, error, unreadCount, markRead, markAllRead } = useAdminNotifications(FEED_LIMIT);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<(typeof typeFilters)[number]>("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // Notifications with a mark-read request in flight (button disabled).
  const [marking, setMarking] = useState<Set<string>>(new Set());

  async function handleMarkRead(key: string, activity: (typeof items)[number]["activity"]) {
    if (marking.has(key)) return;
    setMarking((prev) => new Set(prev).add(key));
    try {
      await markRead(activity);
    } finally {
      setMarking((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  }

  const filtered = useMemo(() => {
    return items.filter(({ activity }) => {
      const matchesType = typeFilter === "All" || activity.type === typeFilter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        q.length === 0 ||
        activity.title.toLowerCase().includes(q) ||
        activity.detail.toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });
  }, [items, query, typeFilter]);

  // Reset to page 1 when filters change, during render rather than in an effect.
  const [prevFilterKey, setPrevFilterKey] = useState({ query, typeFilter });
  if (prevFilterKey.query !== query || prevFilterKey.typeFilter !== typeFilter) {
    setPrevFilterKey({ query, typeFilter });
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  // Clamped at render time so live notifications shifting the list never
  // leave the admin on an out-of-range page.
  const effectivePage = Math.min(page, totalPages);
  const paginated = filtered.slice((effectivePage - 1) * pageSize, effectivePage * pageSize);

  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted">All system activity and alerts across Cordova RISKQ.</p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="flex items-center gap-1.5 self-start rounded-xl border border-border bg-surface px-3.5 py-2 text-sm font-medium text-foreground shadow-xs transition-all duration-150 hover:border-primary/40 hover:bg-primary-light/30 active:scale-[0.97] sm:self-auto"
          >
            <MailOpen size={14} />
            Mark all as read
          </button>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="flex items-center gap-4 shadow-md">
          <Bell size={22} className="shrink-0 text-primary" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">Total</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{items.length}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 shadow-md">
          <Bell size={22} className="shrink-0 text-danger" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">Unread</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{unreadCount}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 shadow-md">
          <MailOpen size={22} className="shrink-0 text-success" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">Read</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{items.length - unreadCount}</p>
          </div>
        </Card>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/70 bg-surface shadow-xs">
        <div className="flex flex-col gap-3 border-b border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notifications..."
              className="w-full rounded-xl border border-border bg-background/60 py-2 pl-9 pr-3 text-sm text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {typeFilters.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTypeFilter(type)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95 ${
                  typeFilter === type
                    ? "bg-primary text-white shadow-sm hover:bg-primary-dark"
                    : "bg-background text-muted hover:bg-primary-light/40 hover:text-primary"
                }`}
              >
                {type === "All" ? "All" : ACTIVITY_TYPE_STYLE[type].label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="p-10 text-center text-sm text-muted">Loading notifications…</p>
        ) : error ? (
          <p className="p-10 text-center text-sm text-red-700">{error}</p>
        ) : items.length === 0 ? (
          <EmptyState title="You're all caught up" description="New activity will show up here." />
        ) : (
          <div className="divide-y divide-border/70">
            {paginated.map(({ activity, key, read }) => {
              const style = ACTIVITY_TYPE_STYLE[activity.type];
              const Icon = style.icon;
              return (
                // Opening it navigates only; marking read is its own action,
                // and a read one stays listed until it's 24 hours old.
                <Link
                  key={key}
                  href={ACTIVITY_TYPE_HREF[activity.type]}
                  className={`flex items-start gap-3 p-4 transition-colors hover:bg-background/50 ${read ? "" : "bg-primary-light/10"}`}
                >
                  <Icon size={20} className={`mt-0.5 shrink-0 ${style.color}`} />

                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{activity.title}</p>
                    <p className="text-sm text-muted">{activity.detail}</p>
                    <p className="mt-1 text-xs text-text-tertiary">{timeAgo(activity.occurredAt)}</p>
                  </div>

                  {!read && (
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          void handleMarkRead(key, activity);
                        }}
                        disabled={marking.has(key)}
                        className="rounded-lg px-2.5 py-1 text-xs font-semibold text-primary transition hover:bg-primary-light/40 disabled:opacity-50"
                      >
                        {marking.has(key) ? "Marking…" : "Mark as read"}
                      </button>
                      <span className="h-2 w-2 rounded-full bg-primary" aria-label="Unread" />
                    </div>
                  )}
                </Link>
              );
            })}

            {filtered.length === 0 && (
              <p className="p-10 text-center text-sm text-muted">No notifications match your filters.</p>
            )}
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <Pagination
            page={effectivePage}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>
    </div>
  );
}
