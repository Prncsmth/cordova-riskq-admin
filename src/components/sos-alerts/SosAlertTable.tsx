import Badge from "@/components/ui/Badge";
import type { SosAlert } from "@/types/sos-alert";

// Mock data for UI — replace with real API data once backend endpoints are available.
const alerts: SosAlert[] = [
  { id: "SOS-1042", userName: "Ana Reyes", locationName: "Poblacion, Cordova", latitude: 10.2551, longitude: 123.9505, status: "New", receivedAt: "2 min ago" },
  { id: "SOS-1041", userName: "Mark Villanueva", locationName: "Day-as, Cordova", latitude: 10.2508, longitude: 123.9469, status: "Acknowledged", receivedAt: "18 min ago" },
  { id: "SOS-1040", userName: "Liza Fernandez", locationName: "Gabi, Cordova", latitude: 10.2562, longitude: 123.9452, status: "Resolved", receivedAt: "1 hr ago" },
  { id: "SOS-1039", userName: "Carlo Bautista", locationName: "Ajoya, Cordova", latitude: 10.2495, longitude: 123.9481, status: "Resolved", receivedAt: "3 hr ago" },
];

const statusVariant = {
  New: "danger",
  Acknowledged: "warning",
  Resolved: "success",
} as const;

export default function SosAlertTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-background">
            <tr>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">ID</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">User</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Location</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Received</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {alerts.map((alert) => (
              <tr key={alert.id} className="hover:bg-background">
                <td className="p-4 font-semibold text-foreground">{alert.id}</td>
                <td className="p-4 text-foreground">{alert.userName}</td>
                <td className="p-4 text-muted">{alert.locationName}</td>
                <td className="p-4 text-muted">{alert.receivedAt}</td>
                <td className="p-4">
                  <Badge variant={statusVariant[alert.status]}>{alert.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
