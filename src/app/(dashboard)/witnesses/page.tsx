import WitnessTable from "@/components/witnesses/WitnessTable";

export default function WitnessesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Witnesses</h1>
        <p className="text-sm text-muted">
          Witnesses associated with recorded incidents.
        </p>
      </div>

      <WitnessTable />
    </div>
  );
}
