"use client";

import { ShieldCheck } from "lucide-react";

export default function SystemSummary() {
  const now = new Date();

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success-light">
          <ShieldCheck size={18} className="text-success" />
        </span>
        <p className="text-sm text-foreground">
          Cordova RISKQ is actively monitoring and responding to incidents.
        </p>
      </div>

      <p className="text-xs text-muted">
        Last updated: {now.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
      </p>
    </div>
  );
}
