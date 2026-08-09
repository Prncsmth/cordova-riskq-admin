import Badge from "@/components/ui/Badge";
import type { Resource } from "@/types/resource";

// Mock data for UI — replace with real API data once backend endpoints are available.
const resources: Resource[] = [
  { id: "EQP-501", name: "Rescue Boat", category: "Water Rescue", quantity: 3, status: "Available", location: "Poblacion Depot" },
  { id: "EQP-502", name: "Ambulance", category: "Medical", quantity: 5, status: "In Use", location: "Gabi Station" },
  { id: "EQP-503", name: "Fire Truck", category: "Fire", quantity: 2, status: "Available", location: "Poblacion Depot" },
  { id: "EQP-504", name: "Generator Set", category: "Utility", quantity: 4, status: "Maintenance", location: "Day-as Depot" },
];

const statusVariant = {
  Available: "success",
  "In Use": "warning",
  Maintenance: "danger",
} as const;

export default function ResourceTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-background">
            <tr>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">ID</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Name</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Category</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Qty</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Location</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {resources.map((resource) => (
              <tr key={resource.id} className="hover:bg-background">
                <td className="p-4 font-semibold text-foreground">{resource.id}</td>
                <td className="p-4 text-foreground">{resource.name}</td>
                <td className="p-4 text-muted">{resource.category}</td>
                <td className="p-4 text-muted">{resource.quantity}</td>
                <td className="p-4 text-muted">{resource.location}</td>
                <td className="p-4">
                  <Badge variant={statusVariant[resource.status]}>{resource.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
