"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import Badge from "@/components/ui/Badge";
import type { Witness } from "@/types/witness";

// Mock data for UI — replace with real API data once backend endpoints are available.
const witnesses: Witness[] = [
  { id: "WIT-201", name: "Rosa Manalo", phone: "09171234567", incidentId: "INC-2026-0091", statementGiven: true, createdAt: "12 min ago" },
  { id: "WIT-200", name: "Ben Aquino", phone: "09281234567", incidentId: "INC-2026-0089", statementGiven: false, createdAt: "1 hr ago" },
  { id: "WIT-199", name: "Grace Lim", phone: "09391234567", incidentId: "INC-2026-0088", statementGiven: true, createdAt: "3 hr ago" },
];

const statusFilters = ["All", "Given", "Pending"] as const;

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function WitnessTable() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]>("All");

  const filtered = useMemo(() => {
    return witnesses.filter((witness) => {
      const status = witness.statementGiven ? "Given" : "Pending";
      const matchesStatus = statusFilter === "All" || status === statusFilter;

      const q = query.trim().toLowerCase();
      const matchesQuery =
        q.length === 0 ||
        witness.name.toLowerCase().includes(q) ||
        witness.id.toLowerCase().includes(q) ||
        witness.incidentId.toLowerCase().includes(q);

      return matchesStatus && matchesQuery;
    });
  }, [query, statusFilter]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex flex-col gap-3 border-b border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search witness, ID, incident..."
            className="w-full rounded-xl border border-border bg-background/60 py-2 pl-9 pr-3 text-sm text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {statusFilters.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95 ${
                statusFilter === status
                  ? "bg-linear-to-b from-primary to-primary-dark text-white shadow-sm"
                  : "bg-background text-muted hover:bg-primary-light/40 hover:text-primary"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-background/60">
            <tr>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Witness</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Phone</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Incident</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Reported</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Statement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {filtered.map((witness) => (
              <tr key={witness.id} className="transition-colors hover:bg-background/70">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-b from-primary to-primary-dark text-xs font-semibold text-white shadow-sm">
                      {initials(witness.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{witness.name}</p>
                      <p className="text-xs text-muted">{witness.id}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-muted">{witness.phone}</td>
                <td className="p-4">
                  <Link
                    href={`/emergencies/${witness.incidentId}`}
                    className="font-medium text-primary hover:text-primary-dark"
                  >
                    {witness.incidentId}
                  </Link>
                </td>
                <td className="p-4 text-muted">{witness.createdAt}</td>
                <td className="p-4">
                  <Badge variant={witness.statementGiven ? "success" : "warning"} solid={!witness.statementGiven}>
                    {witness.statementGiven ? "Given" : "Pending"}
                  </Badge>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-sm text-muted">
                  No witnesses match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
