"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import SidebarItem from "./SidebarItem";

type SidebarGroupProps = {
  label: string;
  items: { href: string; label: string; icon: LucideIcon }[];
};

export default function SidebarGroup({ label, items }: SidebarGroupProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-4 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-black/50 transition hover:text-black/70"
        aria-expanded={open}
      >
        <span>{label}</span>
        <ChevronDown
          size={14}
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
