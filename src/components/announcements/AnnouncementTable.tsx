"use client";

import { useMemo, useState } from "react";
import { Search, Megaphone } from "lucide-react";
import Badge from "@/components/ui/Badge";
import type { Announcement } from "@/types/announcement";

// Mock data for UI — replace with real API data once backend endpoints are available.
const announcements: Announcement[] = [
  { id: "ANN-014", title: "Storm Signal No. 1 Raised", content: "PAGASA has raised Storm Signal No. 1 over Cordova. Secure loose objects and monitor updates.", priority: "Urgent", audience: "All Users", published: true, createdAt: "3 hr ago", updatedAt: "3 hr ago" },
  { id: "ANN-013", title: "Scheduled Water Interruption", content: "MCWD advises a scheduled water service interruption in Poblacion and Gabi this weekend.", priority: "Normal", audience: "All Users", published: true, createdAt: "1 day ago", updatedAt: "1 day ago" },
  { id: "ANN-012", title: "Responder Briefing Reminder", content: "All on-duty responders are reminded of the 6 AM briefing at the Poblacion station.", priority: "Normal", audience: "Responders Only", published: true, createdAt: "2 days ago", updatedAt: "2 days ago" },
  { id: "ANN-011", title: "Flood Advisory — Day-as", content: "Rising water levels reported in Day-as. Residents near the mangrove channel should stay alert.", priority: "Urgent", audience: "Specific Barangay", published: true, createdAt: "4 days ago", updatedAt: "4 days ago" },
];

const priorityFilters = ["All", "Normal", "Urgent"] as const;

export default function AnnouncementTable() {
  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<(typeof priorityFilters)[number]>("All");

  const filtered = useMemo(() => {
    return announcements.filter((a) => {
      const matchesPriority = priorityFilter === "All" || a.priority === priorityFilter;
      const q = query.trim().toLowerCase();
      const matchesQuery = q.length === 0 || a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q);
      return matchesPriority && matchesQuery;
    });
  }, [query, priorityFilter]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex flex-col gap-3 border-b border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search announcements..."
            className="w-full rounded-xl border border-border bg-background/60 py-2 pl-9 pr-3 text-sm text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {priorityFilters.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriorityFilter(p)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95 ${
                priorityFilter === p
                  ? "bg-linear-to-b from-primary to-primary-dark text-white shadow-sm"
                  : "bg-background text-muted hover:bg-primary-light/40 hover:text-primary"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-border/70">
        {filtered.map((a) => (
          <div key={a.id} className="flex items-start gap-3 p-4 transition-colors hover:bg-background/50">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${a.priority === "Urgent" ? "bg-danger-light text-danger" : "bg-primary-light text-primary"}`}>
              <Megaphone size={16} />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-foreground">{a.title}</p>
                <Badge variant={a.priority === "Urgent" ? "danger" : "default"} solid={a.priority === "Urgent"}>
                  {a.priority}
                </Badge>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{a.content}</p>
              <p className="mt-1.5 text-xs text-muted">{a.audience} &middot; {a.createdAt}</p>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="p-10 text-center text-sm text-muted">No announcements match your filters.</p>
        )}
      </div>
    </div>
  );
}
