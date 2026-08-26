import { Activity } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

export default function IncidentOverviewChart() {
  return (
    <div className="rounded-2xl border border-border/70 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
          <Activity size={15} />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Incident Overview</h2>
          <p className="text-sm text-muted">Incidents and SOS alerts trend</p>
        </div>
      </div>

      <div className="mt-6">
        <EmptyState
          title="Not tracked yet"
          description="Trend data needs incident history and an SOS listing endpoint, neither of which the backend exposes yet."
        />
      </div>
    </div>
  );
}
