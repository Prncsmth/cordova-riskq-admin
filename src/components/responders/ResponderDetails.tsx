import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export default function ResponderDetails({
  id,
}: {
  id: string;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <h2 className="font-semibold">Responder Information</h2>

        <div className="mt-5 space-y-4">
          <div>
            <p className="text-xs text-muted">Responder ID</p>
            <p>{id}</p>
          </div>

          <div>
            <p className="text-xs text-muted">Name</p>
            <p>Juan Dela Cruz</p>
          </div>

          <div>
            <p className="text-xs text-muted">Contact</p>
            <p>09123456789</p>
          </div>

          <div>
            <p className="text-xs text-muted">Status</p>
            <Badge variant="success">Available</Badge>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold">Responder Statistics</h2>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-background p-4">
            <p className="text-xs text-muted">Completed</p>
            <p className="mt-1 text-2xl font-bold">42</p>
          </div>

          <div className="rounded-lg bg-background p-4">
            <p className="text-xs text-muted">Active</p>
            <p className="mt-1 text-2xl font-bold">1</p>
          </div>
        </div>
      </Card>
    </div>
  );
}