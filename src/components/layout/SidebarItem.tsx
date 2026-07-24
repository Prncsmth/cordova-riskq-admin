"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarItemProps = {
  href: string;
  label: string;
  icon?: string;
};

export default function SidebarItem({
  href,
  label,
  icon = "•",
}: SidebarItemProps) {
  const pathname = usePathname();

  const active =
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
        active
          ? "bg-red-800 text-white"
          : "text-slate-600 hover:bg-red-50 hover:text-red-800"
      }`}
    >
      <span>{icon}</span>
      {label}
    </Link>
  );
}