"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Search } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { KNOWN_FACILITIES } from "@/types/evacuation-center";
import type { EvacuationCenter, EvacuationCenterStatus } from "@/types/evacuation-center";

const MiniMap = dynamic(() => import("@/components/map/MiniMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-xs text-muted">
      Loading map...
    </div>
  ),
});

const statusFilters = ["All", "Open", "Full"] as const;

function EditableFacilities({
  center,
  pending,
  onSave,
}: {
  center: EvacuationCenter;
  pending: boolean;
  onSave: (facilities: string[]) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<string[]>(center.facilities);

  if (!editing) {
    return (
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {center.facilities.map((f) => (
          <span key={f} className="rounded-full bg-background px-2.5 py-1 text-xs text-muted">
            {f}
          </span>
        ))}
        <button
          type="button"
          onClick={() => {
            setSelected(center.facilities);
            setEditing(true);
          }}
          className="text-xs font-medium text-primary hover:text-primary-dark"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap gap-3">
        {KNOWN_FACILITIES.map((facility) => (
          <label key={facility} className="flex items-center gap-1.5 text-xs text-foreground">
            <input
              type="checkbox"
              checked={selected.includes(facility)}
              onChange={(e) =>
                setSelected((prev) =>
                  e.target.checked ? [...prev, facility] : prev.filter((f) => f !== facility)
                )
              }
            />
            {facility}
          </label>
        ))}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          disabled={pending}
          onClick={() => {
            onSave(selected);
            setEditing(false);
          }}
        >
          Save
        </Button>
        <Button variant="outline" disabled={pending} onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export default function EvacuationCenterList({
  centers,
  loading,
  error,
  actionError,
  updateCenter,
}: {
  centers: EvacuationCenter[];
  loading: boolean;
  error: string | null;
  actionError: string | null;
  updateCenter: (id: string, data: { status?: EvacuationCenterStatus; facilities?: string[] }) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]>("All");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return centers.filter((center) => {
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Open" ? center.status === "open" : center.status === "full");

      const q = query.trim().toLowerCase();
      const matchesQuery =
        q.length === 0 ||
        center.name.toLowerCase().includes(q) ||
        center.address.toLowerCase().includes(q);

      return matchesStatus && matchesQuery;
    });
  }, [centers, query, statusFilter]);

  async function handleToggleStatus(center: EvacuationCenter) {
    setPendingId(center.id);
    try {
      await updateCenter(center.id, { status: center.status === "open" ? "full" : "open" });
    } catch {
      // surfaced via actionError, rendered below
    } finally {
      setPendingId(null);
    }
  }

  async function handleSaveFacilities(center: EvacuationCenter, facilities: string[]) {
    setPendingId(center.id);
    try {
      await updateCenter(center.id, { facilities });
    } catch {
      // surfaced via actionError, rendered below
    } finally {
      setPendingId(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted shadow-sm">
        Loading evacuation centers…
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

  if (centers.length === 0) {
    return (
      <EmptyState
        title="No evacuation centers yet"
        description="Seeded evacuation centers will appear here."
      />
    );
  }

  return (
    <div className="space-y-5">
      {actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-surface p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search centers or address..."
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
                  ? "bg-primary hover:bg-primary-dark text-white shadow-sm"
                  : "bg-background text-muted hover:bg-primary-light/40 hover:text-primary"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/60 p-10 text-center">
          <p className="font-semibold text-foreground">No centers match your filters</p>
          <p className="mt-1 text-sm text-muted">Try a different search term or status.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((center) => (
            <div
              key={center.id}
              className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-surface p-4 shadow-xs sm:flex-row sm:items-center"
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                <MiniMap latitude={center.latitude} longitude={center.longitude} label={center.name} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground">{center.name}</p>
                  <Badge variant={center.status === "full" ? "danger" : "success"} solid={center.status === "full"}>
                    {center.status === "full" ? "Full" : "Open"}
                  </Badge>
                </div>
                <p className="text-sm text-muted">{center.address}</p>

                <EditableFacilities
                  center={center}
                  pending={pendingId === center.id}
                  onSave={(facilities) => handleSaveFacilities(center, facilities)}
                />
              </div>

              <Button
                variant="outline"
                disabled={pendingId === center.id}
                onClick={() => handleToggleStatus(center)}
                className="w-full sm:w-auto sm:shrink-0"
              >
                {center.status === "open" ? "Mark as Full" : "Mark as Open"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
