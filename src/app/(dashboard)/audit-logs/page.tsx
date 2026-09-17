"use client";

import { ScrollText, BellRing, Clock } from "lucide-react";
import Card from "@/components/ui/Card";
import AuditLogTable from "@/components/audit-logs/AuditLogTable";
import { useRecentActivity } from "@/hooks/useRecentActivity";
import { isToday, timeAgo } from "@/lib/utils";

const FEED_LIMIT = 50;

export default function AuditLogsPage() {
  const { activities, loading, error } = useRecentActivity(FEED_LIMIT);

  const eventsToday = activities.filter((a) => isToday(a.occurredAt)).length;
  const sosAlertsToday = activities.filter((a) => a.type === "sos_alert" && isToday(a.occurredAt)).length;
  const lastEvent = activities.length > 0 ? timeAgo(activities[0].occurredAt) : "—";

  const stats = [
    { label: "Events Today", value: eventsToday, icon: ScrollText, color: "text-primary", bg: "bg-primary-light" },
    { label: "SOS Alerts Today", value: sosAlertsToday, icon: BellRing, color: "text-danger", bg: "bg-danger-light" },
    { label: "Last Event", value: lastEvent, icon: Clock, color: "text-success", bg: "bg-success-light" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-sm text-muted">
          System activity across incidents, responders, evacuation centers, and users.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="flex items-center gap-4">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${stat.bg} ${stat.color}`}>
                <Icon size={19} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <AuditLogTable activities={activities} loading={loading} error={error} />
    </div>
  );
}
