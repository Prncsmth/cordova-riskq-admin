export default function RecentActivity() {
  const activities = [
    "Responder Juan Dela Cruz accepted an emergency",
    "Admin updated emergency EMG-001",
    "New responder application received",
    "User account suspended",
  ];

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b p-5">
        <h2 className="font-semibold">Recent Activity</h2>
      </div>

      <div className="divide-y divide-slate-200">
        {activities.map((activity, index) => (
          <div key={index} className="p-5 text-sm text-slate-600">
            {activity}
          </div>
        ))}
      </div>
    </div>
  );
}