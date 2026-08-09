import Link from "next/link";
import { Megaphone, PlusCircle, UsersRound, FileBarChart } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const actions: { label: string; href: string; icon: LucideIcon; color: string; bg: string }[] = [
  { label: "Broadcast Alert", href: "/announcements", icon: Megaphone, color: "text-danger", bg: "bg-danger-light" },
  { label: "Add Incident", href: "/emergencies", icon: PlusCircle, color: "text-warning", bg: "bg-warning-light" },
  { label: "Manage Responders", href: "/responders", icon: UsersRound, color: "text-success", bg: "bg-success-light" },
  { label: "View Reports", href: "/reports", icon: FileBarChart, color: "text-info", bg: "bg-info-light" },
];

export default function QuickActions() {
  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className={`flex flex-col items-start gap-3 rounded-xl p-4 transition hover:brightness-95 ${action.bg}`}
            >
              <Icon size={20} className={action.color} />
              <span className={`text-sm font-medium ${action.color}`}>{action.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
