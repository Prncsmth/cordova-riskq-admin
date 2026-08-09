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
      className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-bold transition ${
        active
          ? "bg-primary text-white shadow-sm"
          : "text-black hover:bg-gray-100"
      }`}
    >
      <Icon size={17} strokeWidth={2} className="shrink-0" />
      {label}
    </Link>
  );
}
