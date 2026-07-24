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
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">ID</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Name</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Phone</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Status</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {responders.map((responder) => (
              <tr key={responder.id} className="hover:bg-slate-50">
                <td className="p-4 font-semibold text-slate-900">{responder.id}</td>
                <td className="p-4 text-slate-700">{responder.name}</td>
                <td className="p-4 text-slate-700">{responder.phone}</td>
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
                    className="font-medium text-red-700 hover:text-red-900"
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
