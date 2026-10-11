"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import SidebarItem from "./SidebarItem";
import { useSidebar } from "./SidebarContext";

type SidebarGroupProps = {
  label: string;
  items: { href: string; label: string; icon: LucideIcon }[];
};

export default function SidebarGroup({ label, items }: SidebarGroupProps) {
  const [open, setOpen] = useState(true);
  const { collapsed } = useSidebar();

  if (collapsed) {
    return (
      <div className="space-y-1 border-t border-border-muted pt-3 first:border-t-0 first:pt-0">
        {items.map((item) => (
          <SidebarItem key={item.href} {...item} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Deliberately muted, not an interactive-link color shift on hover
          (no hover:text-primary) -- this toggles local collapse state, not
          navigation, and shouldn't read like a clickable nav item the way
          SidebarItem's active/hover states do. The faint persistent
          background is what marks it as section chrome at rest, not just
          on hover. */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 rounded-md bg-background/60 px-3 py-1.5 text-[9px] font-bold uppercase text-muted transition-colors hover:bg-background"
        aria-expanded={open}
      >
        {/* text-[9px] (not [10px]) and no tracking-wide -- "Emergency
            Operations", the longest group label, was right at the edge of
            truncating inside the sidebar's width at the larger/wider
            setting. text-muted replaces text-text-tertiary, which isn't a
            real token anywhere in globals.css -- it was rendering as
            whatever color the text inherited by default, not an
            intentional gray. */}
        <span className="min-w-0 truncate">{label}</span>
        <ChevronDown
          size={12}
          strokeWidth={2.5}
          className={`shrink-0 transition-transform duration-200 ${
            open ? "rotate-0" : "-rotate-90"
          }`}
        />
      </button>

      {open && (
        <div className="space-y-1">
          {items.map((item) => (
            <SidebarItem key={item.href} {...item} />
          ))}
        </div>
      )}
    </div>
  );
}
