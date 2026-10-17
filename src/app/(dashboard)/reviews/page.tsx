// src/app/(dashboard)/reviews/page.tsx
"use client";

import { useState } from "react";
import { Check, Star, X } from "lucide-react";
import { useReviews } from "@/hooks/useReviews";
import type { ReviewStatus } from "@/types/review";

const FILTERS: Array<"All" | ReviewStatus> = ["pending", "approved", "rejected", "All"];
const FILTER_LABEL: Record<"All" | ReviewStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  All: "All",
};
const STATUS_STYLE: Record<ReviewStatus, string> = {
  pending: "bg-warning/15 text-warning",
  approved: "bg-success/15 text-success",
  rejected: "bg-danger/10 text-danger",
};
const PAGE_SIZE = 20;

export default function ReviewsPage() {
  const [status, setStatus] = useState<"All" | ReviewStatus>("pending");
  const [page, setPage] = useState(1);
  const { reviews, total, pendingCount, loading, error, actionError, updateStatus } = useReviews(
    status,
    page,
    PAGE_SIZE,
  );
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reviews</h1>
        <p className="text-sm text-muted">
          Ratings and comments from the public website. Only approved reviews are shown on the site.
          {pendingCount > 0 ? ` ${pendingCount} waiting for review.` : " Nothing waiting right now."}
        </p>
      </div>

      {actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{actionError}</div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border/70 bg-surface shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5 border-b border-border/70 p-4">
          {FILTERS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setStatus(value);
                setPage(1);
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95 ${
                status === value ? "bg-primary text-white" : "bg-background text-muted hover:text-foreground"
              }`}
            >
              {FILTER_LABEL[value]}
              {value === "pending" && pendingCount > 0 ? ` (${pendingCount})` : ""}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="p-10 text-center text-sm text-muted">Loading reviews…</p>
        ) : error ? (
          <p className="p-10 text-center text-sm text-red-700">{error}</p>
        ) : reviews.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted">No reviews here.</p>
        ) : (
          <ul className="divide-y divide-border/70">
            {reviews.map((review) => (
              <li key={review.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex" aria-label={`${review.rating} out of 5 stars`}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          size={15}
                          className={n <= review.rating ? "fill-amber-400 text-amber-400" : "text-border"}
                        />
                      ))}
                    </span>
                    <span className="font-medium text-foreground">{review.name || "Anonymous"}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[review.status]}`}>
                      {FILTER_LABEL[review.status]}
                    </span>
                  </div>
                  {review.title && <p className="mt-1.5 font-semibold text-foreground">{review.title}</p>}
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted">{review.comment}</p>
                  <p className="mt-1.5 text-xs text-text-tertiary">{new Date(review.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {review.status !== "approved" && (
                    <button
                      type="button"
                      onClick={() => updateStatus(review.id, "approved")}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-success px-3 py-2 text-xs font-semibold text-white transition active:scale-95"
                    >
                      <Check size={14} /> Approve
                    </button>
                  )}
                  {review.status !== "rejected" && (
                    <button
                      type="button"
                      onClick={() => updateStatus(review.id, "rejected")}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition active:scale-95"
                    >
                      <X size={14} /> Reject
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border/70 p-4 text-sm text-muted">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="disabled:opacity-40">
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
