import Link from "next/link";
import { Megaphone, PlusCircle, UsersRound, FileBarChart, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const actions: { label: string; href: string; icon: LucideIcon; color: string }[] = [
  { label: "Broadcast Alert", href: "/announcements", icon: Megaphone, color: "text-danger" },
  { label: "Add Incident", href: "/emergencies", icon: PlusCircle, color: "text-warning" },
  { label: "Manage Responders", href: "/responders", icon: UsersRound, color: "text-success" },
  { label: "View Reports", href: "/reports", icon: FileBarChart, color: "text-info" },
];

export default function QuickActions() {
  return (
    <div className="rounded-2xl border border-border/70 bg-surface p-6 shadow-xs">
      <div className="flex items-center gap-2.5">
        <Zap size={18} className="shrink-0 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className="flex flex-col items-start gap-3 rounded-xl border border-border/70 bg-background p-4 transition-colors duration-150 hover:border-primary/30 hover:bg-primary-light/20 active:scale-[0.98]"
            >
              <Icon size={20} className={action.color} />
              <span className="text-sm font-medium text-foreground">{action.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
