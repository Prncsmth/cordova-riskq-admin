"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function UserMenu() {
  const router = useRouter();
  const { logout: clearSession } = useAuth();
  const [open, setOpen] = useState(false);
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

  function logout() {
    clearSession();
    router.push("/login");
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-all duration-150 hover:bg-primary-light/40 active:scale-[0.98]"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-b from-primary to-primary-dark text-sm font-semibold text-white shadow-sm">
          AU
        </span>

        <span className="hidden sm:block">
          <span className="block text-sm font-semibold text-foreground">Admin User</span>
          <span className="block text-xs text-muted">Super Admin</span>
        </span>

        <ChevronDown size={16} className="hidden text-muted sm:block" />
      </button>

      {open && (
        <div className="glass-strong absolute right-0 z-50 mt-2 w-52 origin-top-right rounded-2xl border border-(--glass-border) p-1.5 shadow-lg">
          <div className="border-b border-(--glass-border) px-3 py-2 sm:hidden">
            <p className="text-sm font-semibold text-foreground">Admin User</p>
            <p className="text-xs text-muted">Super Admin</p>
          </div>

          <button
            onClick={() => router.push("/settings")}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground transition hover:bg-primary-light/40"
          >
            <User size={16} />
            Account Settings
          </button>

          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-danger transition hover:bg-danger-light"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
