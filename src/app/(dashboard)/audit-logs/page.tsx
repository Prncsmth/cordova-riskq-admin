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

      <AuditLogTable />
    </div>
  );
}
