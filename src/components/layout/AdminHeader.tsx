"use client";

import UserMenu from "./UserMenu";
import NotificationsMenu from "./NotificationsMenu";
import { ThemeToggle } from "./ThemeProvider";

export default function AdminHeader() {
  return (
    <header className="glass sticky top-0 z-30 border-b border-(--glass-border) px-6 py-3">
      <div className="flex items-center justify-end gap-4">
        <ThemeToggle />

        <NotificationsMenu />

        <span className="h-8 w-px bg-border/60" />

        <UserMenu />
      </div>
    </header>
  );
}
