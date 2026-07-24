import ResponderTable from "@/components/responders/ResponderTable";

export default function RespondersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Responders</h1>

        <p className="text-sm text-slate-500">
          Monitor and manage emergency responders.
        </p>
      </div>

      <ResponderTable />
    </div>
  );
}