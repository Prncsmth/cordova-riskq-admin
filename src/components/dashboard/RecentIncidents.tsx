import Link from "next/link";
import Badge from "@/components/ui/Badge";

// Mock data for UI — replace with real API data once backend endpoints are available.
const incidents = [
  { id: "INC-2026-0091", type: "Fire Incident", location: "Poblacion, Cordova", time: "10 min ago", status: "Active" as const },
  { id: "INC-2026-0090", type: "Medical Emergency", location: "Gabi, Cordova", time: "25 min ago", status: "Active" as const },
  { id: "INC-2026-0089", type: "Flood Report", location: "Day-as, Cordova", time: "1 hr ago", status: "Investigating" as const },
  { id: "INC-2026-0088", type: "Road Accident", location: "Ajoya, Cordova", time: "2 hr ago", status: "Investigating" as const },
  { id: "INC-2026-0087", type: "Fire Incident", location: "Poblacion, Cordova", time: "3 hr ago", status: "Resolved" as const },
];

const statusVariant = {
  Active: "danger",
  Investigating: "warning",
  Resolved: "success",
} as const;

export default function RecentIncidents() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-border p-5">
        <h2 className="text-lg font-semibold text-foreground">Recent Incidents</h2>
        <Link href="/emergencies" className="text-sm font-medium text-primary hover:text-primary-dark">
          View All
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-background">
            <tr>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.1em] text-muted">Type</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.1em] text-muted">Location</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.1em] text-muted">Time</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.1em] text-muted">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {incidents.map((incident) => (
              <tr key={incident.id} className="hover:bg-background">
                <td className="p-4 font-medium text-foreground">{incident.type}</td>
                <td className="p-4 text-muted">{incident.location}</td>
                <td className="p-4 text-muted">{incident.time}</td>
                <td className="p-4">
                  <Badge variant={statusVariant[incident.status]}>{incident.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
