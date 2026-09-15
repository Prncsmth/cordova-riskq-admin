"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
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
}: {
  responders: Responder[];
  loading: boolean;
  error: string | null;
}) {
  const [query, setQuery] = useState("");
  const [dutyFilter, setDutyFilter] = useState<DutyFilter>("all");
  const [unitFilter, setUnitFilter] = useState<UnitFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return responders.filter((responder) => {
      if (q.length > 0) {
        const matchesQuery =
          responder.name.toLowerCase().includes(q) ||
          responder.email.toLowerCase().includes(q) ||
          responder.id.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      if (dutyFilter === "on-duty" && !responder.isOnDuty) return false;
      if (dutyFilter === "off-duty" && responder.isOnDuty) return false;

      if (unitFilter === "unclassified" && responder.unit !== null) return false;
      if (unitFilter === "BDRRMO" || unitFilter === "MDRRMO") {
        if (responder.unit !== unitFilter) return false;
      }

      return true;
    });
  }, [responders, query, dutyFilter, unitFilter]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted shadow-sm">
        Loading responders…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-sm text-red-700 shadow-sm">
        {error}
      </div>
    );
  }

  if (responders.length === 0) {
    return (
      <EmptyState
        title="No responders yet"
        description="Citizens promoted to responder will appear here."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-surface shadow-xs">
      <div className="flex flex-col gap-3 border-b border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, ID..."
            className="w-full rounded-xl border border-border bg-background/60 py-2 pl-9 pr-3 text-sm text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
        </div>

        <div className="flex gap-3">
          <select
            value={dutyFilter}
            onChange={(e) => setDutyFilter(e.target.value as DutyFilter)}
            className="rounded-xl border border-border bg-background/60 py-2 px-3 text-sm text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
          >
            <option value="all">All duty status</option>
            <option value="on-duty">On Duty</option>
            <option value="off-duty">Off Duty</option>
          </select>

          <select
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value as UnitFilter)}
            className="rounded-xl border border-border bg-background/60 py-2 px-3 text-sm text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
          >
            <option value="all">All units</option>
            <option value="BDRRMO">BDRRMO</option>
            <option value="MDRRMO">MDRRMO</option>
            <option value="unclassified">Unclassified</option>
          </select>
        </div>
      </div>

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
            {filtered.map((responder) => (
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

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-10 text-center text-sm text-muted">
                  No responders match your search and filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
