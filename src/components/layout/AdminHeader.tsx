"use client";

import { Menu } from "lucide-react";
import UserMenu from "./UserMenu";
import NotificationsMenu from "./NotificationsMenu";
import { ThemeToggle } from "./ThemeProvider";
import { useSidebar } from "./SidebarContext";

export default function AdminHeader() {
  const { collapsed, toggle } = useSidebar();

  return (
    <header className="glass sticky top-0 z-30 flex h-20 items-center border-b border-(--glass-border) px-6">
      <div className="flex w-full items-center gap-4">
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl text-foreground/80 transition-all duration-150 hover:bg-black/4 hover:text-foreground active:scale-95 dark:hover:bg-white/6 lg:flex"
        >
          <Menu size={20} strokeWidth={2.25} />
        </button>

        <div className="flex flex-1 items-center justify-end gap-4">
          <ThemeToggle />

          <NotificationsMenu />

          <span className="h-8 w-px bg-border/60" />

          <UserMenu />
        </div>
      </div>
    </header>
  );
}
