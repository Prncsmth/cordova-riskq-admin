import EmergencyDetails from "@/components/emergencies/EmergencyDetails";

export default async function EmergencyDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Emergency Details
        </h1>

        <p className="text-sm text-muted">
          Incident ID: {id}
        </p>
      </div>

      <EmergencyDetails id={id} />
    </div>
  );
}