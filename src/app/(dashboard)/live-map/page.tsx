"use client";

import dynamic from "next/dynamic";

const LiveMap = dynamic(
  () => import("@/components/map/LiveMap"),
  {
    ssr: false,
  }
);

export default function LiveMapPage() {
  return (
    <div className="h-screen">
      <LiveMap />
    </div>
  );
}