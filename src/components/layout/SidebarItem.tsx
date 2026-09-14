"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { useSidebar } from "./SidebarContext";

type SidebarItemProps = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export default function SidebarItem({
  href,
  label,
  icon: Icon,
}: SidebarItemProps) {
  const pathname = usePathname();
  const { collapsed } = useSidebar();

  const active =
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`group relative flex items-center rounded-full text-sm font-bold transition-all duration-200 ${
        collapsed ? "mx-auto h-11 w-11 justify-center" : "w-full gap-3 px-4 py-2.5"
      } ${
        active
          ? "bg-[#C1121F] text-white shadow-[0_4px_12px_-2px_rgba(193,18,31,0.4)]"
          : "text-foreground/80 hover:bg-black/4 hover:text-foreground active:scale-[0.98] dark:hover:bg-white/6"
      }`}
    >
      <Icon size={17} strokeWidth={2.25} className="shrink-0" />

      <span
        className={`overflow-hidden whitespace-nowrap transition-all duration-200 ease-in-out ${
          collapsed ? "w-0 -translate-x-2 opacity-0" : "w-auto translate-x-0 opacity-100"
        }`}
      >
        {label}
      </span>

      {collapsed && (
        <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1.5 text-xs font-semibold text-background opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
          {label}
        </span>
      )}
    </Link>
  );
}
