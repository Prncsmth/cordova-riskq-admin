"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useEmergencies } from "@/hooks/useEmergencies";
import { playEmergencyAlertSound, type EmergencyAlertKind } from "@/lib/emergencyAlertSound";
import EmergencyAlertBanner from "@/components/layout/EmergencyAlertBanner";

const SOUND_STORAGE_KEY = "riskq_admin_emergency_sound";
// Only a routine incident report auto-dismisses -- SOS stays on screen
// until an admin actually looks at it or dismisses it themselves.
const AUTO_DISMISS_MS = 10000;

export type EmergencyAlert = {
  id: string;
  title: string;
  detail: string;
  isSos: boolean;
};

type EmergencyAlertContextValue = {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  testSound: (kind: EmergencyAlertKind) => void;
  alert: EmergencyAlert | null;
  dismissAlert: () => void;
};

const EmergencyAlertContext = createContext<EmergencyAlertContextValue | null>(null);

export function EmergencyAlertProvider({ children }: { children: React.ReactNode }) {
  // Its own useEmergencies() call -- independent of whatever page-level
  // components (RecentIncidents, EmergencyTable, useLiveMapMarkers, ...)
  // also call it for. Each call keeps its own live-merged list, so this one
  // existing purely to watch for brand-new arrivals doesn't interfere with,
  // or double up on, however many other components render from it.
  const { emergencies } = useEmergencies();
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [alert, setAlert] = useState<EmergencyAlert | null>(null);
  // null until the first load resolves -- distinguishes "every incident
  // already pending when the dashboard opened" (not a real arrival, no
  // alert) from a genuine new arrival afterward.
  const knownIds = useRef<Set<string> | null>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const soundEnabledRef = useRef(soundEnabled);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    const saved = localStorage.getItem(SOUND_STORAGE_KEY);
    if (saved !== null) setSoundEnabledState(saved === "true");
  }, []);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabledState(enabled);
    localStorage.setItem(SOUND_STORAGE_KEY, String(enabled));
  }, []);

  const dismissAlert = useCallback(() => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    setAlert(null);
  }, []);

  const testSound = useCallback((kind: EmergencyAlertKind) => {
    playEmergencyAlertSound(kind);
  }, []);

  useEffect(() => {
    const previous = knownIds.current;
    const next = new Set(emergencies.map((e) => e.id));

    if (previous) {
      const arrivals = emergencies.filter((e) => !previous.has(e.id));
      // One sound + one banner even if a burst landed between renders --
      // the newest arrival wins rather than stacking toasts.
      const newest = arrivals.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0];

      if (newest) {
        const isSos = newest.source === "sos";
        setAlert({
          id: newest.id,
          title: isSos ? "SOS Alert" : "New Incident Reported",
          detail: `${newest.type} — ${newest.locationName}`,
          isSos,
        });
        if (soundEnabledRef.current) playEmergencyAlertSound(isSos ? "sos" : "incident");

        if (dismissTimer.current) clearTimeout(dismissTimer.current);
        dismissTimer.current = isSos ? null : setTimeout(() => setAlert(null), AUTO_DISMISS_MS);
      }
    }

    knownIds.current = next;
  }, [emergencies]);

  return (
    <EmergencyAlertContext.Provider
      value={{ soundEnabled, setSoundEnabled, testSound, alert, dismissAlert }}
    >
      {children}
      <EmergencyAlertBanner />
    </EmergencyAlertContext.Provider>
  );
}

export function useEmergencyAlert() {
  const context = useContext(EmergencyAlertContext);
  if (!context) {
    throw new Error("useEmergencyAlert must be used within EmergencyAlertProvider");
  }
  return context;
}
