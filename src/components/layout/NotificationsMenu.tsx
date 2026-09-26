"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { ACTIVITY_TYPE_STYLE, ACTIVITY_TYPE_HREF } from "@/lib/adminActivity";
import { timeAgo } from "@/lib/utils";

export default function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  // Was 5 -- that wasn't just "how many rows show in the dropdown", it was
  // the hard cap on the entire underlying activity list (see
  // useRecentActivity), so the unread badge structurally could never show
  // more than 5 no matter how many notifications actually happened. The
  // dropdown below is already scrollable (max-h-96 overflow-y-auto), so a
  // larger limit both fixes the count and surfaces more real history.
  const { items, unreadCount, markRead, markAllRead } = useAdminNotifications(20);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-muted transition-all duration-150 hover:bg-primary-light/40 hover:text-primary active:scale-95"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white shadow-sm ring-2 ring-(--glass)">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="glass-strong absolute right-0 z-50 mt-2 w-80 origin-top-right overflow-hidden rounded-2xl border border-(--glass-border) shadow-lg">
          <div className="flex items-center justify-between border-b border-(--glass-border) px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-medium text-primary hover:text-primary-dark"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items.map(({ activity, key, read }) => {
              const style = ACTIVITY_TYPE_STYLE[activity.type];
              const Icon = style.icon;
              return (
                <Link
                  key={key}
                  href={ACTIVITY_TYPE_HREF[activity.type]}
                  onClick={() => {
                    markRead(activity);
                    setOpen(false);
                  }}
                  className={`flex items-start gap-3 border-b border-(--glass-border) px-4 py-3 transition-colors last:border-b-0 hover:bg-primary-light/20 ${
                    read ? "" : "bg-primary-light/10"
                  }`}
                >
                  <Icon size={20} className={`mt-0.5 shrink-0 ${style.color}`} />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{activity.title}</p>
                    <p className="truncate text-xs text-muted">{activity.detail}</p>
                    <p className="mt-0.5 text-xs text-muted">{timeAgo(activity.occurredAt)}</p>
                  </div>

                  {!read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </Link>
              );
            })}

            {items.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-muted">You&apos;re all caught up.</p>
            )}
          </div>

          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-(--glass-border) px-4 py-2.5 text-center text-xs font-medium text-primary transition hover:bg-primary-light/20 hover:text-primary-dark"
          >
            View all activity
          </Link>
        </div>
      )}
    </div>
  );
}
