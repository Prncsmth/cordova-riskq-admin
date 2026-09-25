"use client";

import { useMemo, useState } from "react";
import { Phone, Search } from "lucide-react";
import Badge from "@/components/ui/Badge";
import type { BadgeVariant } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { HOTLINE_CATEGORIES } from "@/types/hotline";
import type { Hotline, HotlineCategory } from "@/types/hotline";

const categoryFilters = ["All", ...HOTLINE_CATEGORIES] as const;

const CATEGORY_LABEL: Record<HotlineCategory, string> = {
  police: "Police & Safety",
  fire: "Fire & Rescue",
  medical: "Medical & Health",
  maritime: "Maritime",
};

const CATEGORY_BADGE_VARIANT: Record<HotlineCategory, BadgeVariant> = {
  police: "info",
  fire: "danger",
  medical: "success",
  maritime: "warning",
};

type HotlineEdits = { name: string; number: string; category: HotlineCategory };

function EditableHotline({
  hotline,
  pending,
  onSave,
}: {
  hotline: Hotline;
  pending: boolean;
  onSave: (edits: HotlineEdits) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<HotlineEdits>(hotline);

  if (!editing) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-semibold text-foreground">{hotline.name}</p>
        <Badge variant={CATEGORY_BADGE_VARIANT[hotline.category]}>
          {CATEGORY_LABEL[hotline.category] ?? hotline.category}
        </Badge>
        <button
          type="button"
          onClick={() => {
            setDraft(hotline);
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
    <div className="space-y-2">
      <div className="grid gap-2 sm:grid-cols-3">
        <input
          value={draft.name}
          onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Agency name"
          className="rounded-lg border border-border bg-background/60 px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
        <input
          value={draft.number}
          onChange={(e) => setDraft((prev) => ({ ...prev, number: e.target.value }))}
          placeholder="Number"
          className="rounded-lg border border-border bg-background/60 px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
        <select
          value={draft.category}
          onChange={(e) =>
            setDraft((prev) => ({ ...prev, category: e.target.value as HotlineCategory }))
          }
          className="rounded-lg border border-border bg-background/60 px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        >
          {HOTLINE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {CATEGORY_LABEL[category]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          disabled={pending || draft.name.trim().length === 0 || draft.number.trim().length === 0}
          onClick={() => {
            onSave(draft);
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

export default function HotlineList({
  hotlines,
  loading,
  error,
  actionError,
  updateHotline,
}: {
  hotlines: Hotline[];
  loading: boolean;
  error: string | null;
  actionError: string | null;
  updateHotline: (id: string, data: Partial<HotlineEdits>) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<(typeof categoryFilters)[number]>("All");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return hotlines.filter((hotline) => {
      const matchesCategory = categoryFilter === "All" || hotline.category === categoryFilter;

      const q = query.trim().toLowerCase();
      const matchesQuery =
        q.length === 0 ||
        hotline.name.toLowerCase().includes(q) ||
        hotline.number.toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [hotlines, query, categoryFilter]);

  async function handleSave(hotline: Hotline, edits: HotlineEdits) {
    setPendingId(hotline.id);
    try {
      await updateHotline(hotline.id, edits);
    } catch {
      // surfaced via actionError, rendered below
    } finally {
      setPendingId(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted shadow-sm">
        Loading hotlines…
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

  if (hotlines.length === 0) {
    return (
      <EmptyState title="No hotlines yet" description="Seeded emergency hotlines will appear here." />
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
            placeholder="Search hotlines or number..."
            className="w-full rounded-xl border border-border bg-background/60 py-2 pl-9 pr-3 text-sm text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {categoryFilters.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setCategoryFilter(category)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-all duration-150 active:scale-95 ${
                categoryFilter === category
                  ? "bg-primary hover:bg-primary-dark text-white shadow-sm"
                  : "bg-background text-muted hover:bg-primary-light/40 hover:text-primary"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/60 p-10 text-center">
          <p className="font-semibold text-foreground">No hotlines match your filters</p>
          <p className="mt-1 text-sm text-muted">Try a different search term or category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((hotline) => (
            <div
              key={hotline.id}
              className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-surface p-4 shadow-xs sm:flex-row sm:items-start"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light/40 text-primary">
                <Phone size={18} />
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <EditableHotline
                  hotline={hotline}
                  pending={pendingId === hotline.id}
                  onSave={(edits) => handleSave(hotline, edits)}
                />
                <p className="text-sm text-muted">{hotline.number}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
