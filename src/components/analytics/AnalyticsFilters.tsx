"use client";

import { DATE_RANGES, type DateRangePreset } from "@/lib/dateRanges";

export default function AnalyticsFilters({
  range,
  onRangeChange,
}: {
  range: DateRangePreset;
  onRangeChange: (range: DateRangePreset) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {DATE_RANGES.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onRangeChange(r)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95 ${
            range === r
              ? "bg-primary text-white shadow-sm hover:bg-primary-dark"
              : "border border-border bg-surface text-muted hover:bg-primary-light/40 hover:text-primary"
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
