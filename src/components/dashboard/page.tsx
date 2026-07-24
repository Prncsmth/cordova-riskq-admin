import LiveMapPreview from "@/app/(dashboard)/dashboard/PreviewMap";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Dashboard
        </h1>

        <p className="mt-2 text-slate-500">
          Cordova RISKQ emergency operations overview
        </p>
      </div>

      {/* Your Stat Cards Here */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        
        {/* Live Map */}
        <div className="xl:col-span-2">
          <LiveMapPreview />
        </div>

        {/* Emergency Status */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">
            Emergency Status
          </h2>

          <div className="mt-6 space-y-4">
            <div className="flex justify-between">
              <span>Active</span>
              <span className="font-bold text-red-600">
                12
              </span>
            </div>

            <div className="flex justify-between">
              <span>Responding</span>
              <span className="font-bold text-yellow-600">
                5
              </span>
            </div>

            <div className="flex justify-between">
              <span>Resolved</span>
              <span className="font-bold text-green-600">
                34
              </span>
            </div>
          </div>

          <Link
            href="/emergencies"
                className="mt-6 block w-full rounded-lg bg-red-700 py-3 text-center text-sm font-medium text-white hover:bg-red-800">
                View Emergencies
        </Link>
        </div>

      </div>

    </div>
  );
}