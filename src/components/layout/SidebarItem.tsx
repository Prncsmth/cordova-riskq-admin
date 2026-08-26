"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

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

  const active =
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-150 ${
        active
          ? "bg-linear-to-b from-primary to-primary-dark text-white shadow-[0_4px_12px_-2px_rgba(122,17,40,0.4)]"
          : "text-foreground/80 hover:bg-black/4 hover:text-foreground active:scale-[0.98] dark:hover:bg-white/6"
      }`}
    >
      <Icon size={17} strokeWidth={2.25} className={`shrink-0 ${active ? "drop-shadow-sm" : ""}`} />
      {label}
    </Link>
  );
}
