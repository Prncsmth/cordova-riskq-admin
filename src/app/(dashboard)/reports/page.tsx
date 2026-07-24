import Card from "@/components/ui/Card";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-slate-900">Reports</h1>

        <p className="max-w-3xl text-sm text-slate-500">
          View emergency and response performance analytics with a clean layout and red admin accents.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Total Emergencies
          </p>

          <p className="mt-4 text-3xl font-bold text-slate-900">1,248</p>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-slate-600">
            Average Response Time
          </p>

          <p className="mt-3 text-3xl font-bold text-slate-900">8.4 min</p>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-slate-600">
            Resolution Rate
          </p>

          <p className="mt-3 text-3xl font-bold text-slate-900">94%</p>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Emergency Analytics
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Performance summaries and response metrics.
            </p>
          </div>

          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
            This Month
          </span>
        </div>

        <div className="mt-6 flex h-72 items-center justify-center rounded-3xl bg-slate-100 text-sm text-slate-500">
          Chart integration will appear here.
        </div>
      </Card>
    </div>
  );
}