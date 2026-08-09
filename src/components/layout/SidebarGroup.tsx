import type { LucideIcon } from "lucide-react";
import SidebarItem from "./SidebarItem";

type SidebarGroupProps = {
  label: string;
  items: { href: string; label: string; icon: LucideIcon }[];
};

export default function SidebarGroup({ label, items }: SidebarGroupProps) {
  return (
    <div className="space-y-1">
      <p className="px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
        {label}
      </p>

      <div className="space-y-1">
        {items.map((item) => (
          <SidebarItem key={item.href} {...item} />
        ))}
      </div>
    </div>
  );
}
