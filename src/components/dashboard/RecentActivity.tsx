import Link from "next/link";
import { History } from "lucide-react";
import { useRecentActivity } from "@/hooks/useRecentActivity";
import { ACTIVITY_TYPE_STYLE } from "@/lib/adminActivity";
import { timeAgo } from "@/lib/utils";

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
        <div className="max-h-[420px] divide-y divide-border/70 overflow-y-auto">
          {activities.map((activity, index) => {
            const { icon: Icon, color, bg } = ACTIVITY_TYPE_STYLE[activity.type];
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
