"use client";

import { useEffect, useState } from "react";
import { UNATTENDED_CHECK_INTERVAL_MS } from "@/lib/unattended";

// The current time, refreshed every intervalMs -- lets a view re-evaluate a
// time-dependent state (e.g. isUnattendedIncident) when no new data arrives.
export function useNow(intervalMs = UNATTENDED_CHECK_INTERVAL_MS): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}
