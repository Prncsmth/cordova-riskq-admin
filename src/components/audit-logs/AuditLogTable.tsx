import type { AuditLog } from "@/types/audit-log";

// Mock data for UI — replace with real API data once backend endpoints are available.
const logs: AuditLog[] = [
  { id: "LOG-901", adminId: "Admin User", action: "Updated incident status", entityType: "Emergency", entityId: "INC-2026-0091", createdAt: "10 min ago" },
  { id: "LOG-900", adminId: "Admin User", action: "Verified responder", entityType: "Responder", entityId: "RES-001", createdAt: "1 hr ago" },
  { id: "LOG-899", adminId: "Admin User", action: "Published announcement", entityType: "Announcement", entityId: "ANN-014", createdAt: "3 hr ago" },
  { id: "LOG-898", adminId: "Admin User", action: "Suspended user account", entityType: "User", entityId: "USR-233", createdAt: "5 hr ago" },
];

export default function AuditLogTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-background">
            <tr>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Log ID</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Admin</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Action</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Entity</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-background">
                <td className="p-4 font-semibold text-foreground">{log.id}</td>
                <td className="p-4 text-foreground">{log.adminId}</td>
                <td className="p-4 text-muted">{log.action}</td>
                <td className="p-4 text-muted">{log.entityType} {log.entityId}</td>
                <td className="p-4 text-muted">{log.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
