import Link from "next/link";
import { BellRing, ShieldCheck, CheckCircle2, Building2, UserPlus, History } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRecentActivity, type AdminActivityType } from "@/hooks/useRecentActivity";
import { timeAgo } from "@/lib/utils";

const ICON_BY_TYPE: Record<AdminActivityType, { icon: LucideIcon; color: string; bg: string }> = {
  sos_alert: { icon: BellRing, color: "text-danger", bg: "bg-danger-light" },
  responder_joined: { icon: ShieldCheck, color: "text-info", bg: "bg-info-light" },
  incident_resolved: { icon: CheckCircle2, color: "text-success", bg: "bg-success-light" },
  evacuation_center_updated: { icon: Building2, color: "text-warning", bg: "bg-warning-light" },
  user_registered: { icon: UserPlus, color: "text-primary", bg: "bg-primary-light" },
};

export default function RecentActivity() {
  const { activities, loading, error } = useRecentActivity();

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-surface shadow-xs">
      <div className="flex items-center justify-between border-b border-border/70 p-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
            <History size={15} />
          </span>
          <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
        </div>
        <Link href="/audit-logs" className="text-sm font-medium text-primary hover:text-primary-dark">
          View All
        </Link>
      </div>

      {loading ? (
        <p className="p-10 text-center text-sm text-muted">Loading recent activity…</p>
      ) : error ? (
        <p className="p-10 text-center text-sm text-red-700">{error}</p>
      ) : activities.length === 0 ? (
        <p className="p-10 text-center text-sm text-muted">No recent activity.</p>
      ) : (
        <div className="divide-y divide-border/70">
          {activities.map((activity, index) => {
            const { icon: Icon, color, bg } = ICON_BY_TYPE[activity.type];
            return (
              <div key={index} className="flex items-start gap-3 p-4 transition-colors hover:bg-background/50">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${bg}`}>
                  <Icon size={16} className={color} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{activity.title}</p>
                  <p className="truncate text-sm text-muted">{activity.detail}</p>
                </div>

                <span className="shrink-0 text-xs text-text-tertiary">{timeAgo(activity.occurredAt)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
