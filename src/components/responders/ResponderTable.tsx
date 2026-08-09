import Badge from "@/components/ui/Badge";
import Link from "next/link";

const responders = [
  {
    id: "RES-001",
    name: "Juan Dela Cruz",
    phone: "09123456789",
    status: "Available",
  },
  {
    id: "RES-002",
    name: "Pedro Santos",
    phone: "09234567890",
    status: "On Duty",
  },
  {
    id: "RES-003",
    name: "Maria Garcia",
    phone: "09345678901",
    status: "Offline",
  },
];

export default function ResponderTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-background">
            <tr>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted">ID</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted">Name</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted">Phone</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted">Status</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {responders.map((responder) => (
              <tr key={responder.id} className="hover:bg-background">
                <td className="p-4 font-semibold text-foreground">{responder.id}</td>
                <td className="p-4 text-foreground">{responder.name}</td>
                <td className="p-4 text-muted">{responder.phone}</td>
                <td className="p-4">
                  <Badge
                    variant={
                      responder.status === "Available"
                        ? "success"
                        : responder.status === "On Duty"
                          ? "warning"
                          : "default"
                    }
                  >
                    {responder.status}
                  </Badge>
                </td>
                <td className="p-4">
                  <Link
                    href={`/responders/${responder.id}`}
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
