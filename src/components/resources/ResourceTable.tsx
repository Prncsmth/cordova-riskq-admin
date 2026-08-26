"use client";

import { useMemo, useState } from "react";
import { Search, LifeBuoy, HeartPulse, Flame, Zap, Package } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Badge from "@/components/ui/Badge";
import type { Resource } from "@/types/resource";

// Mock data for UI — replace with real API data once backend endpoints are available.
const resources: Resource[] = [
  { id: "EQP-501", name: "Rescue Boat", category: "Water Rescue", quantity: 3, status: "Available", location: "Poblacion Depot" },
  { id: "EQP-502", name: "Ambulance", category: "Medical", quantity: 5, status: "In Use", location: "Gabi Station" },
  { id: "EQP-503", name: "Fire Truck", category: "Fire", quantity: 2, status: "Available", location: "Poblacion Depot" },
  { id: "EQP-504", name: "Generator Set", category: "Utility", quantity: 4, status: "Maintenance", location: "Day-as Depot" },
];

const statusVariant = {
  Available: "success",
  "In Use": "warning",
  Maintenance: "danger",
} as const;

const categoryStyles: Record<string, { icon: LucideIcon; tile: string }> = {
  "Water Rescue": { icon: LifeBuoy, tile: "bg-info-light text-info" },
  Medical: { icon: HeartPulse, tile: "bg-success-light text-success" },
  Fire: { icon: Flame, tile: "bg-danger-light text-danger" },
  Utility: { icon: Zap, tile: "bg-warning-light text-warning" },
};

const defaultCategoryStyle = { icon: Package, tile: "bg-background text-muted" };

const categoryFilters = ["All", ...Array.from(new Set(resources.map((r) => r.category)))];

export default function ResourceTable() {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const filtered = useMemo(() => {
    return resources.filter((resource) => {
      const matchesCategory = categoryFilter === "All" || resource.category === categoryFilter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        q.length === 0 ||
        resource.name.toLowerCase().includes(q) ||
        resource.id.toLowerCase().includes(q) ||
        resource.location.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, categoryFilter]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex flex-col gap-3 border-b border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search equipment, ID, location..."
            className="w-full rounded-xl border border-border bg-background/60 py-2 pl-9 pr-3 text-sm text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {categoryFilters.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setCategoryFilter(category)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95 ${
                categoryFilter === category
                  ? "bg-linear-to-b from-primary to-primary-dark text-white shadow-sm"
                  : "bg-background text-muted hover:bg-primary-light/40 hover:text-primary"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-background/60">
            <tr>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted">Equipment</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted">Category</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted">Qty</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted">Location</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {filtered.map((resource) => {
              const style = categoryStyles[resource.category] ?? defaultCategoryStyle;
              const Icon = style.icon;

              return (
                <tr key={resource.id} className="transition-colors hover:bg-background/70">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${style.tile}`}>
                        <Icon size={16} />
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{resource.name}</p>
                        <p className="text-xs text-muted">{resource.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-muted">{resource.category}</td>
                  <td className="p-4 font-medium text-foreground">{resource.quantity}</td>
                  <td className="p-4 text-muted">{resource.location}</td>
                  <td className="p-4">
                    <Badge variant={statusVariant[resource.status]} solid={resource.status === "Maintenance"}>
                      {resource.status}
                    </Badge>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-sm text-muted">
                  No matching equipment found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
