import EmergencyTable from "@/components/emergencies/EmergencyTable";

export default function EmergenciesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Live Incidents</h1>

        <p className="mt-1 text-sm text-muted">
          Monitor and manage all emergency incidents.
        </p>
      </div>

      <EmergencyTable />
    </div>
  );
}