"use client";

import { Download } from "lucide-react";
import { DATE_RANGES, type DateRangePreset } from "@/lib/dateRanges";

const CATEGORY_OPTIONS = [
  { value: "", label: "All Categories" },
  { value: "fire", label: "Fire" },
  { value: "medical", label: "Medical" },
  { value: "flood", label: "Flood" },
  { value: "road-accident", label: "Road Accident" },
  { value: "other", label: "Other" },
];

export default function ReportFilters({
  range,
  onRangeChange,
  category,
  onCategoryChange,
  barangay,
  onBarangayChange,
  onExport,
  exportDisabled,
}: {
  range: DateRangePreset;
  onRangeChange: (range: DateRangePreset) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  barangay: string;
  onBarangayChange: (barangay: string) => void;
  onExport: () => void;
  exportDisabled: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-surface p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
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

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="rounded-xl border border-border bg-background/60 px-3 py-2 text-sm text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <input
          value={barangay}
          onChange={(e) => onBarangayChange(e.target.value)}
          placeholder="Filter by barangay..."
          className="rounded-xl border border-border bg-background/60 px-3 py-2 text-sm text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
        />

        <button
          type="button"
          onClick={onExport}
          disabled={exportDisabled}
          className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-sm font-medium text-foreground shadow-xs transition-all duration-150 hover:border-primary/40 hover:bg-primary-light/30 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download size={14} />
          Export Report
        </button>
      </div>
    </div>
  );
}
