"use client";

import { useState } from "react";
import { Download } from "lucide-react";

const ranges = ["Today", "This Week", "This Month", "This Year"] as const;

export default function ReportFilters() {
  const [range, setRange] = useState<(typeof ranges)[number]>("This Month");

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

      <button
        type="button"
        className="flex items-center gap-1.5 self-start rounded-xl border border-border bg-white px-3.5 py-2 text-sm font-medium text-foreground shadow-xs transition-all duration-150 hover:border-primary/40 hover:bg-primary-light/30 active:scale-[0.97] sm:self-auto"
      >
        <Download size={14} />
        Export Report
      </button>
    </div>
  );
}
