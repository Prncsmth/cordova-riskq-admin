import ResourceTable from "@/components/resources/ResourceTable";

export default function ResourcesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Equipment / Resources</h1>
        <p className="text-sm text-muted">
          Track emergency equipment and resource availability.
        </p>
      </div>

      <ResourceTable />
    </div>
  );
}
