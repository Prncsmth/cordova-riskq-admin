import Link from "next/link";
import { BellRing, ShieldCheck, CheckCircle2, Building2, UserPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Activity = {
  icon: LucideIcon;
  color: string;
  bg: string;
  title: string;
  detail: string;
  time: string;
};

// Mock data for UI — replace with real API/socket data once backend endpoints are available.
const activities: Activity[] = [
  {
    icon: BellRing,
    color: "text-danger",
    bg: "bg-danger-light",
    title: "New SOS alert received",
    detail: "Poblacion, Cordova",
    time: "2 min ago",
  },
  {
    icon: ShieldCheck,
    color: "text-info",
    bg: "bg-info-light",
    title: "Responder Mark Dela Cruz",
    detail: "accepted an incident",
    time: "5 min ago",
  },
  {
    icon: CheckCircle2,
    color: "text-success",
    bg: "bg-success-light",
    title: "Incident #INC-2026-0089",
    detail: "has been resolved",
    time: "12 min ago",
  },
  {
    icon: Building2,
    color: "text-warning",
    bg: "bg-warning-light",
    title: "Evacuation center updated",
    detail: "Gabi Evacuation Center",
    time: "20 min ago",
  },
  {
    icon: UserPlus,
    color: "text-primary",
    bg: "bg-primary-light",
    title: "New user registered",
    detail: "Juan Dela Cruz",
    time: "35 min ago",
  },
];

export default function RecentActivity() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-border p-5">
        <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
        <Link href="/audit-logs" className="text-sm font-medium text-primary hover:text-primary-dark">
          View All
        </Link>
      </div>

      <div className="divide-y divide-border">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div key={index} className="flex items-start gap-3 p-4">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${activity.bg}`}>
                <Icon size={16} className={activity.color} />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{activity.title}</p>
                <p className="truncate text-sm text-muted">{activity.detail}</p>
              </div>

              <span className="shrink-0 text-xs text-muted">{activity.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
