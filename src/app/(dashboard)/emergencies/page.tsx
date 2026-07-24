import EmergencyTable from "@/components/emergencies/EmergencyTable";

export default function EmergenciesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Emergencies</h1>

        <p className="mt-1 text-sm text-slate-500">
          Monitor and manage all emergency incidents.
        </p>
      </div>

      <EmergencyTable />
    </div>
  );
}