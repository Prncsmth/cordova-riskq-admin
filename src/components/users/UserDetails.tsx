import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export default function UserDetails({
  id,
}: {
  id: string;
}) {
  return (
    <Card>
      <div className="flex items-center gap-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-red-800">
          JD
        </div>

        <div>
          <h2 className="text-lg font-semibold">
            John Doe
          </h2>

          <p className="text-sm text-slate-500">
            {id}
          </p>
        </div>

        <div className="ml-auto">
          <Badge variant="success">Active</Badge>
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <div>
          <p className="text-xs text-slate-500">Email</p>
          <p>john@example.com</p>
        </div>

        <div>
          <p className="text-xs text-slate-500">Phone</p>
          <p>09123456789</p>
        </div>
      </div>
    </Card>
  );
}