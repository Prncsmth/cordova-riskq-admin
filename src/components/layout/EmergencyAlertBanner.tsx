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
        className={`pointer-events-auto flex items-center gap-3 rounded-2xl border shadow-lg backdrop-blur transition-all ${
          alert.isSos
            ? "w-full max-w-lg border-danger/40 bg-danger p-5 text-white"
            : "w-full max-w-md border-danger/20 bg-surface p-4 text-foreground"
        }`}
      >
        <span className="relative flex shrink-0 items-center justify-center">
          {/* Pulsing ring only on SOS -- the loudest visual cue on the page,
              reserved for the case that actually needs someone's attention
              right now. */}
          {alert.isSos && (
            <span className="absolute h-12 w-12 animate-ping rounded-full bg-white/40" />
          )}
          <span
            className={`relative flex items-center justify-center rounded-full ${
              alert.isSos ? "h-12 w-12 bg-white/15" : "h-10 w-10 bg-danger-light text-danger"
            }`}
          >
            <Siren size={alert.isSos ? 22 : 19} className={alert.isSos ? "text-white" : ""} />
          </span>
        </span>

        <div className="min-w-0 flex-1">
          <span
            className={`mb-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              alert.isSos ? "bg-white/20 text-white" : "bg-danger-light text-danger"
            }`}
          >
            {alert.isSos ? "SOS" : "Incident Report"}
          </span>
          <p className={`font-semibold ${alert.isSos ? "text-base" : "text-sm"}`}>{alert.title}</p>
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
