import Badge from "@/components/ui/Badge";
import Link from "next/link";

const emergencies = [
  {
    id: "EMG-001",
    type: "Medical Emergency",
    location: "Poblacion Occidental",
    status: "Active",
    responder: "Juan Dela Cruz",
  },
  {
    id: "EMG-002",
    type: "Fire",
    location: "Dapitan",
    status: "Responding",
    responder: "Pedro Santos",
  },
  {
    id: "EMG-003",
    type: "Road Accident",
    location: "Catarman",
    status: "Resolved",
    responder: "Maria Garcia",
  },
];

export default function EmergencyTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-background">
            <tr>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted">ID</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted">Type</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted">Location</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted">Responder</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted">Status</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {emergencies.map((emergency) => (
              <tr key={emergency.id} className="hover:bg-background">
                <td className="p-4 font-semibold text-foreground">{emergency.id}</td>
                <td className="p-4 text-foreground">{emergency.type}</td>
                <td className="p-4 text-foreground">{emergency.location}</td>
                <td className="p-4 text-foreground">{emergency.responder}</td>
                <td className="p-4">
                  <Badge
                    variant={
                      emergency.status === "Active"
                        ? "danger"
                        : emergency.status === "Resolved"
                          ? "success"
                          : "warning"
                    }
                  >
                    {emergency.status}
                  </Badge>
                </td>
                <td className="p-4">
                  <Link
                    href={`/emergencies/${emergency.id}`}
                    className="font-medium text-primary hover:text-primary-dark"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
