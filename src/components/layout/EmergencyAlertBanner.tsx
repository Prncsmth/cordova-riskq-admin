"use client";

import Link from "next/link";
import { Siren, X } from "lucide-react";
import { useEmergencyAlert } from "@/components/layout/EmergencyAlertProvider";

export default function EmergencyAlertBanner() {
  const { alert, dismissAlert } = useEmergencyAlert();

  if (!alert) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex justify-center px-4">
      <div
        role="alert"
        className={`pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl border p-4 shadow-lg backdrop-blur ${
          alert.isSos
            ? "border-danger/30 bg-danger text-white"
            : "border-danger/20 bg-surface text-foreground"
        }`}
      >
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            alert.isSos ? "bg-white/15" : "bg-danger-light text-danger"
          }`}
        >
          <Siren size={19} className={alert.isSos ? "text-white" : ""} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{alert.title}</p>
          <p className={`truncate text-xs ${alert.isSos ? "text-white/85" : "text-muted"}`}>
            {alert.detail}
          </p>
        </div>

        <Link
          href={`/emergencies/${alert.id}`}
          onClick={dismissAlert}
          className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
            alert.isSos
              ? "bg-white/15 hover:bg-white/25"
              : "bg-danger-light text-danger hover:bg-danger/15"
          }`}
        >
          View
        </Link>

        <button
          type="button"
          onClick={dismissAlert}
          aria-label="Dismiss"
          className={`shrink-0 rounded-full p-1 transition ${
            alert.isSos ? "hover:bg-white/15" : "hover:bg-black/5"
          }`}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
