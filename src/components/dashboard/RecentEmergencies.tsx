import Badge from "@/components/ui/Badge";

const emergencies = [
  {
    id: "EMG-001",
    type: "Medical",
    location: "Poblacion",
    status: "Active",
  },
  {
    id: "EMG-002",
    type: "Fire",
    location: "Dapitan",
    status: "Responding",
  },
  {
    id: "EMG-003",
    type: "Accident",
    location: "Catarman",
    status: "Resolved",
  },
];

export default function RecentEmergencies() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b p-5">
        <h2 className="font-semibold">Recent Emergencies</h2>
      </div>

      <div className="divide-y divide-slate-200">
        {emergencies.map((emergency) => (
          <div
            key={emergency.id}
            className="flex items-center justify-between p-5"
          >
            <div>
              <p className="font-medium">{emergency.id}</p>
              <p className="text-sm text-slate-500">
                {emergency.type} · {emergency.location}
              </p>
            </div>

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
          </div>
        ))}
      </div>
    </div>
  );
}