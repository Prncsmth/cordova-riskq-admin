"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

// Collapses a long page range to first, last, current +/-1, with ellipsis
// markers ("start"/"end") filling the gaps. Shows every page when there
// are 7 or fewer.
function getPageNumbers(current: number, total: number): (number | "start-ellipsis" | "end-ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = Array.from(pages)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const result: (number | "start-ellipsis" | "end-ellipsis")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i];
    const prev = sorted[i - 1];
    if (prev !== undefined && p - prev > 1) {
      result.push(p - prev === 2 ? prev + 1 : p === total ? "end-ellipsis" : "start-ellipsis");
    }
    result.push(p);
  }
  return result;
}

type PaginationProps = {
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

export default function Pagination({ page, totalPages, pageSize, onPageChange, onPageSizeChange }: PaginationProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-sm text-muted">
        <span>Rows per page</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded-lg border border-border bg-background/60 py-1.5 px-2 text-sm text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-background/70 disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>

          {getPageNumbers(page, totalPages).map((entry, index) =>
            typeof entry === "number" ? (
              <button
                key={entry}
                type="button"
                onClick={() => onPageChange(entry)}
                className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-medium transition ${
                  entry === page ? "bg-primary text-white shadow-xs" : "text-muted hover:bg-background/70"
                }`}
              >
                {entry}
              </button>
            ) : (
              <span key={`${entry}-${index}`} className="px-1 text-sm text-muted">
                …
              </span>
            ),
          )}

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-background/70 disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
