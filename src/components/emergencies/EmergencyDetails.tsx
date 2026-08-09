import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export default function EmergencyDetails({
  id,
}: {
  id: string;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <h2 className="text-lg font-semibold">
          Emergency Information
        </h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted">Emergency ID</p>
            <p className="font-semibold">{id}</p>
          </div>

          <div>
            <p className="text-xs text-muted">Type</p>
            <p className="font-semibold">Medical Emergency</p>
          </div>

          <div>
            <p className="text-xs text-muted">Location</p>
            <p className="font-semibold">Poblacion Occidental</p>
          </div>

          <div>
            <p className="text-xs text-muted">Status</p>
            <Badge variant="danger">Active</Badge>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold">Assigned Responder</h2>

        <div className="mt-5">
          <p className="font-medium">Juan Dela Cruz</p>

          <p className="text-sm text-muted">
            Available · 1.2 km away
          </p>
        </div>

        <button className="mt-5 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
          Reassign Responder
        </button>
      </Card>
    </div>
  );
}