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
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 px-4 py-1 text-[10px] font-bold uppercase tracking-wide text-text-tertiary transition hover:text-primary"
        aria-expanded={open}
      >
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
