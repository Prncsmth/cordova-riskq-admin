import ResponderDetails from "@/components/responders/ResponderDetails";

export default async function ResponderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Responder Details
      </h1>

      <ResponderDetails id={id} />
    </div>
  );
}