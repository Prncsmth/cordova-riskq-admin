"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { MOCK_NOTIFICATIONS } from "@/lib/mockNotifications";

export default function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS.slice(0, 5));
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-muted transition-all duration-150 hover:bg-primary-light/40 hover:text-primary active:scale-95"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-semibold text-white shadow-sm ring-2 ring-(--glass)">
            {unreadCount}
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
            {notifications.map((n) => {
              const Icon = n.icon;
              return (
                <Link
                  key={n.id}
                  href={n.href}
                  onClick={() => {
                    markRead(n.id);
                    setOpen(false);
                  }}
                  className={`flex items-start gap-3 border-b border-(--glass-border) px-4 py-3 transition-colors last:border-b-0 hover:bg-primary-light/20 ${
                    n.read ? "" : "bg-primary-light/10"
                  }`}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${n.bg}`}>
                    <Icon size={16} className={n.color} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{n.title}</p>
                    <p className="truncate text-xs text-muted">{n.detail}</p>
                    <p className="mt-0.5 text-xs text-muted">{n.time}</p>
                  </div>

                  {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </Link>
              );
            })}

            {notifications.length === 0 && (
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
