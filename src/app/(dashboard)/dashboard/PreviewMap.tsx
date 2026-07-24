"use client";

import dynamic from "next/dynamic";

const LiveMap = dynamic(
  () => import("@/components/map/LiveMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-slate-500">
        Loading live map...
      </div>
    ),
  }
);

export default function LiveMapPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <h2 className="text-lg font-semibold">Live Map</h2>
          <p className="text-sm text-slate-500">
            Monitor active responders and incidents
          </p>
        </div>

        <span className="flex items-center gap-2 text-green-600 font-medium">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Live
        </span>
      </div>

      <div className="h-`130`">
        <LiveMap />
      </div>
    </div>
  );
}