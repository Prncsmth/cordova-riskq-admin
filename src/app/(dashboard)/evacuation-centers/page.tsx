import EvacuationCenterList from "@/components/evacuation-centers/EvacuationCenterList";

export default function EvacuationCentersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Evacuation Centers</h1>
        <p className="text-sm text-muted">
          Monitor occupancy and capacity across evacuation centers.
        </p>
      </div>

      <EvacuationCenterList />
    </div>
  );
}
