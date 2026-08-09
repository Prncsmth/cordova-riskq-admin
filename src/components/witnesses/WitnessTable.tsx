import Badge from "@/components/ui/Badge";
import type { Witness } from "@/types/witness";

// Mock data for UI — replace with real API data once backend endpoints are available.
const witnesses: Witness[] = [
  { id: "WIT-201", name: "Rosa Manalo", phone: "09171234567", incidentId: "INC-2026-0091", statementGiven: true, createdAt: "12 min ago" },
  { id: "WIT-200", name: "Ben Aquino", phone: "09281234567", incidentId: "INC-2026-0089", statementGiven: false, createdAt: "1 hr ago" },
  { id: "WIT-199", name: "Grace Lim", phone: "09391234567", incidentId: "INC-2026-0088", statementGiven: true, createdAt: "3 hr ago" },
];

export default function WitnessTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-background">
            <tr>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">ID</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Name</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Phone</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Incident</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Statement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {witnesses.map((witness) => (
              <tr key={witness.id} className="hover:bg-background">
                <td className="p-4 font-semibold text-foreground">{witness.id}</td>
                <td className="p-4 text-foreground">{witness.name}</td>
                <td className="p-4 text-muted">{witness.phone}</td>
                <td className="p-4 text-muted">{witness.incidentId}</td>
                <td className="p-4">
                  <Badge variant={witness.statementGiven ? "success" : "default"}>
                    {witness.statementGiven ? "Given" : "Pending"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
