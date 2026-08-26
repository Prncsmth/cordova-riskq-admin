import { ScrollText, Users as UsersIcon, Clock } from "lucide-react";
import Card from "@/components/ui/Card";
import AuditLogTable from "@/components/audit-logs/AuditLogTable";

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-sm text-muted">
          Track administrative actions performed across the system.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="flex items-center gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
            <ScrollText size={19} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Actions Today</p>
            <p className="mt-1 text-2xl font-bold text-foreground">4</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-info-light text-info">
            <UsersIcon size={19} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Active Admins</p>
            <p className="mt-1 text-2xl font-bold text-foreground">1</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-success-light text-success">
            <Clock size={19} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Last Action</p>
            <p className="mt-1 text-2xl font-bold text-foreground">10 min ago</p>
          </div>
        </Card>
      </div>

      <AuditLogTable />
    </div>
  );
}
