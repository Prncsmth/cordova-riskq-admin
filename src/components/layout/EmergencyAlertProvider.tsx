"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useEmergencies } from "@/hooks/useEmergencies";
import { useNow } from "@/hooks/useNow";
import { isUnattendedIncident } from "@/lib/unattended";
import {
  playEmergencyAlertSound,
  unlockEmergencyAlertAudio,
  type EmergencyAlertKind,
} from "@/lib/emergencyAlertSound";
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
  const { emergencies, loading } = useEmergencies();
  // Lazy initializer instead of defaulting to true + patching in a mount
  // effect -- Next's recommended pattern for client-only persisted state
  // (see preventing-flash-before-hydration.md), and avoids the
  // react-hooks/set-state-in-effect cascading-render lint error.
  const [soundEnabled, setSoundEnabledState] = useState(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem(SOUND_STORAGE_KEY);
    return saved === null ? true : saved === "true";
  });
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

  // Browsers won't play audio for a background-triggered alert until the
  // page has seen a real user gesture -- prime it on whichever comes first,
  // then stop listening. Without this, a dispatcher who just loads the
  // dashboard and watches it (the actual point of this screen) never hears
  // the very first alert.
  useEffect(() => {
    function handleFirstInteraction() {
      unlockEmergencyAlertAudio();
      document.removeEventListener("pointerdown", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    }
    document.addEventListener("pointerdown", handleFirstInteraction);
    document.addEventListener("keydown", handleFirstInteraction);
    return () => {
      document.removeEventListener("pointerdown", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };
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
    // Wait for the initial GET /incidents before taking the baseline --
    // seeding it from the still-empty pre-load list made every incident
    // already pending look like a new arrival, so the newest one popped up
    // (with sound) again on every page refresh.
    if (loading) return;

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
  }, [emergencies, loading]);

  // Sounds once when an incident crosses into UNATTENDED (lib/unattended.ts).
  // `now` re-runs this every UNATTENDED_CHECK_INTERVAL_MS so the crossing is
  // noticed even when no new data arrives; a plain re-render doesn't re-run
  // it at all.
  //
  // alertedUnattendedIds holds exactly the incidents unattended as of the
  // last check, so one that stays unattended never sounds again, and one
  // that's picked up and later back to pending can sound again. null until
  // the first load resolves: incidents already unattended when the dashboard
  // opens are seeded silently -- their badges already say so, and a refresh
  // shouldn't replay an alarm for every old incident.
  const now = useNow();
  const alertedUnattendedIds = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (loading) return;

    const unattended = emergencies.filter((e) => isUnattendedIncident(e, now));
    const previous = alertedUnattendedIds.current;
    alertedUnattendedIds.current = new Set(unattended.map((e) => e.id));
    if (!previous) return;

    const newlyUnattended = unattended.filter((e) => !previous.has(e.id));
    // One sound per check however many crossed at once -- the SOS siren if
    // any of them is an SOS.
    if (newlyUnattended.length > 0 && soundEnabledRef.current) {
      playEmergencyAlertSound(newlyUnattended.some((e) => e.source === "sos") ? "sos" : "incident");
    }
  }, [emergencies, loading, now]);

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
