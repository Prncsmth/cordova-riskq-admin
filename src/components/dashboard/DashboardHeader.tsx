"use client";

import { Bell, ShieldCheck } from "lucide-react";

export default function DashboardHeader() {
  const date = new Date();

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          Emergency Operations Center
        </h1>

        <p className="mt-2 text-slate-500">
          Monitor emergencies, responders, and incidents across Cordova.
        </p>
      </div>

      <div className="flex items-center gap-4">

        <div className="rounded-xl border bg-white px-5 py-3 shadow-sm">

          <div className="flex items-center gap-2">

            <ShieldCheck
              size={18}
              className="text-green-600"
            />

            <span className="font-semibold text-green-700">
              System Online
            </span>

          </div>

          <p className="mt-1 text-xs text-slate-500">
            {date.toLocaleDateString()}
          </p>

        </div>

        <button className="rounded-xl border bg-white p-3 shadow-sm transition hover:bg-red-50">
          <Bell className="text-red-600" />
        </button>

      </div>

    </div>
  );
}