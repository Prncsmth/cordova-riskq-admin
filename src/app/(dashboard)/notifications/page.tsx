"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Bell, MailOpen } from "lucide-react";
import Card from "@/components/ui/Card";
import { MOCK_NOTIFICATIONS, notificationTypeLabels, type NotificationType } from "@/lib/mockNotifications";

const typeFilters: (NotificationType | "All")[] = ["All", ...(Object.keys(notificationTypeLabels) as NotificationType[])];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<(typeof typeFilters)[number]>("All");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      const matchesType = typeFilter === "All" || n.type === typeFilter;
      const q = query.trim().toLowerCase();
      const matchesQuery = q.length === 0 || n.title.toLowerCase().includes(q) || n.detail.toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });
  }, [notifications, query, typeFilter]);

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
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
            className="flex items-center gap-1.5 self-start rounded-xl border border-border bg-white px-3.5 py-2 text-sm font-medium text-foreground shadow-xs transition-all duration-150 hover:border-primary/40 hover:bg-primary-light/30 active:scale-[0.97] sm:self-auto"
          >
            <MailOpen size={14} />
            Mark all as read
          </button>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="flex items-center gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
            <Bell size={19} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Total</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{notifications.length}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center">
            {unreadCount > 0 && (
              <span className="absolute inline-flex h-11 w-11 animate-ping rounded-full bg-danger-light opacity-60" />
            )}
            <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-danger-light text-danger">
              <Bell size={19} />
            </span>
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Unread</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{unreadCount}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-success-light text-success">
            <MailOpen size={19} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Read</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{notifications.length - unreadCount}</p>
          </div>
        </Card>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/70 bg-white shadow-sm">
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
                    ? "bg-linear-to-b from-primary to-primary-dark text-white shadow-sm"
                    : "bg-background text-muted hover:bg-primary-light/40 hover:text-primary"
                }`}
              >
                {type === "All" ? "All" : notificationTypeLabels[type]}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-border/70">
          {filtered.map((n) => {
            const Icon = n.icon;
            return (
              <Link
                key={n.id}
                href={n.href}
                onClick={() => markRead(n.id)}
                className={`flex items-start gap-3 p-4 transition-colors hover:bg-background/50 ${n.read ? "" : "bg-primary-light/10"}`}
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${n.bg}`}>
                  <Icon size={16} className={n.color} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{n.title}</p>
                  <p className="text-sm text-muted">{n.detail}</p>
                  <p className="mt-1 text-xs text-muted">{n.time}</p>
                </div>

                {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
              </Link>
            );
          })}

          {filtered.length === 0 && (
            <p className="p-10 text-center text-sm text-muted">No notifications match your filters.</p>
          )}
        </div>
      </div>
    </div>
  );
}
