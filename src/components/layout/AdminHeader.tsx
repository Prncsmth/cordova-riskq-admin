"use client";

import { Bell } from "lucide-react";
import UserMenu from "./UserMenu";
import { ThemeToggle } from "./ThemeProvider";

export default function AdminHeader() {
  return (
    <header className="border-b border-border bg-white px-6 py-3 shadow-sm">
      <div className="flex items-center justify-end gap-4">
        <ThemeToggle />

        <button
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-muted transition hover:bg-primary-light/40 hover:text-primary"
        >
          <Bell size={19} />
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-semibold text-white">
            8
          </span>
        </button>

        <span className="h-8 w-px bg-border" />

        <UserMenu />
      </div>
    </header>
  );
}
