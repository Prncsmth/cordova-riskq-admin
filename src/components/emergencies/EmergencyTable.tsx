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
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">ID</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Type</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Location</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Responder</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Status</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {emergencies.map((emergency) => (
              <tr key={emergency.id} className="hover:bg-slate-50">
                <td className="p-4 font-semibold text-slate-900">{emergency.id}</td>
                <td className="p-4 text-slate-700">{emergency.type}</td>
                <td className="p-4 text-slate-700">{emergency.location}</td>
                <td className="p-4 text-slate-700">{emergency.responder}</td>
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
