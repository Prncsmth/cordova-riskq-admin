"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import type { Responder, ResponderUnit } from "@/types/responder";
import { formatDate } from "@/lib/utils";

type DutyFilter = "all" | "on-duty" | "off-duty";
type UnitFilter = "all" | ResponderUnit | "unclassified";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ResponderTable({
  responders,
  loading,
  error,
  searchInput,
  onSearchChange,
  dutyFilter,
  onDutyFilterChange,
  unitFilter,
  onUnitFilterChange,
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  responders: Responder[];
  loading: boolean;
  error: string | null;
  searchInput: string;
  onSearchChange: (value: string) => void;
  dutyFilter: DutyFilter;
  onDutyFilterChange: (value: DutyFilter) => void;
  unitFilter: UnitFilter;
  onUnitFilterChange: (value: UnitFilter) => void;
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-sm text-red-700 shadow-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-surface shadow-xs">
      <div className="flex flex-col gap-3 border-b border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search name, email..."
            className="w-full rounded-xl border border-border bg-background/60 py-2 pl-9 pr-3 text-sm text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
        </div>

        <div className="flex gap-3">
          <select
            value={dutyFilter}
            onChange={(e) => onDutyFilterChange(e.target.value as DutyFilter)}
            className="rounded-xl border border-border bg-background/60 py-2 px-3 text-sm text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
          >
            <option value="all">All duty status</option>
            <option value="on-duty">On Duty</option>
            <option value="off-duty">Off Duty</option>
          </select>

          <select
            value={unitFilter}
            onChange={(e) => onUnitFilterChange(e.target.value as UnitFilter)}
            className="rounded-xl border border-border bg-background/60 py-2 px-3 text-sm text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
          >
            <option value="all">All units</option>
            <option value="BDRRMO">BDRRMO</option>
            <option value="MDRRMO">MDRRMO</option>
            <option value="unclassified">Unclassified</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="p-10 text-center text-sm text-muted">Loading responders…</p>
      ) : responders.length === 0 ? (
        <EmptyState
          title="No responders found"
          description="Try a different search or filter combination."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-background/60">
              <tr>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Responder</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Phone</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Duty</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Unit</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Joined</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {responders.map((responder) => (
                <tr key={responder.id} className="transition-colors hover:bg-background/70">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white shadow-xs">
                        {initials(responder.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{responder.name}</p>
                        <p className="text-xs text-muted">{responder.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-muted">{responder.phone ?? "Not provided"}</td>
                  <td className="p-4">
                    <Badge variant={responder.isOnDuty ? "success" : "default"}>
                      {responder.isOnDuty ? "On Duty" : "Off Duty"}
                    </Badge>
                  </td>
                  <td className="p-4 text-muted">{responder.unit ?? "Unclassified"}</td>
                  <td className="p-4 text-muted">{formatDate(responder.createdAt)}</td>
                  <td className="p-4">
                    <Link
                      href={`/responders/${responder.id}`}
                      className="font-medium text-primary hover:text-primary-dark"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
