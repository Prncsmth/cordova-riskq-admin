"use client";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCards from "@/components/dashboard/StatsCards";
import LiveMapPreview from "@/components/dashboard/LiveMapPreview";

export default function DashboardPage() {
  return (
    <div className="space-y-8">

      <DashboardHeader />

      <StatsCards />

      <div className="grid gap-6 xl:grid-cols-3">

        <div className="xl:col-span-2">
          <LiveMapPreview />
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">

          <h2 className="text-xl font-semibold">
            Emergency Status
          </h2>

          <div className="mt-6 space-y-5">

            <Status
              title="Active"
              value={12}
              color="bg-red-500"
            />

            <Status
              title="Responding"
              value={5}
              color="bg-yellow-500"
            />

            <Status
              title="Resolved"
              value={34}
              color="bg-green-500"
            />

          </div>

          <button className="mt-8 w-full rounded-xl bg-red-700 py-3 text-white transition hover:bg-red-800">
            View Emergencies
          </button>

        </div>

      </div>

    </div>
  );
}

function Status({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">

      <div className="flex items-center gap-3">

        <div className={`h-3 w-3 rounded-full ${color}`} />

        <span>{title}</span>

      </div>

      <span className="font-bold">
        {value}
      </span>

    </div>
  );
}