import Link from "next/link";
import { Megaphone, PlusCircle, UsersRound, FileBarChart, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const actions: { label: string; href: string; icon: LucideIcon; color: string; bg: string }[] = [
  { label: "Broadcast Alert", href: "/announcements", icon: Megaphone, color: "text-danger", bg: "bg-danger-light" },
  { label: "Add Incident", href: "/emergencies", icon: PlusCircle, color: "text-warning", bg: "bg-warning-light" },
  { label: "Manage Responders", href: "/responders", icon: UsersRound, color: "text-success", bg: "bg-success-light" },
  { label: "View Reports", href: "/reports", icon: FileBarChart, color: "text-info", bg: "bg-info-light" },
];

export default function QuickActions() {
  return (
    <div className="rounded-2xl border border-border/70 bg-surface p-6 shadow-xs">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
          <Zap size={15} />
        </span>
        <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className={`flex flex-col items-start gap-3 rounded-xl border border-border/50 p-4 transition-all duration-150 hover:brightness-95 active:scale-[0.98] ${action.bg}`}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 shadow-xs ring-1 ring-black/5">
                <Icon size={17} className={action.color} />
              </span>
              <span className={`text-sm font-medium ${action.color}`}>{action.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
