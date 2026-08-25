"use client";

import { useState } from "react";

const ranges = ["Today", "This Week", "This Month", "This Year"] as const;

export default function AnalyticsFilters() {
  const [range, setRange] = useState<(typeof ranges)[number]>("This Month");

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {ranges.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => setRange(r)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95 ${
            range === r
              ? "bg-linear-to-b from-primary to-primary-dark text-white shadow-sm"
              : "border border-border bg-white text-muted hover:bg-primary-light/40 hover:text-primary"
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
