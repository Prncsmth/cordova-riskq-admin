// "Unattended" is a derived, admin-only view state -- never stored and never
// sent to the backend. An incident is unattended while it is still pending
// (no responder has joined) and more than UNATTENDED_THRESHOLD_MS have passed
// since it was created. It applies to SOS and citizen reports alike.
//
// Not the same as the backend's "expired" status (shown as "Expired"): that
// is a closed SOS the backend's expiry sweep gave up on; this is a live one
// that still needs someone to act.
export const UNATTENDED_THRESHOLD_MS = 2 * 60 * 1000;

// How often time-dependent views re-check, so an incident crossing the
// threshold is picked up within this long even when no new data arrives.
export const UNATTENDED_CHECK_INTERVAL_MS = 10 * 1000;

// The admin labels for the backend's "pending": "Active" on an Emergency
// (useEmergencies' STATUS_TO_EMERGENCY_STATUS), "New" on an SOS alert
// (the backend's sosAlertStatus.ts).
const PENDING_LABELS: ReadonlySet<string> = new Set(["Active", "New"]);

export function isUnattendedIncident(incident: { status: string; createdAt: string }, now: number): boolean {
  if (!PENDING_LABELS.has(incident.status)) return false;
  const createdAt = Date.parse(incident.createdAt);
  return Number.isFinite(createdAt) && now - createdAt > UNATTENDED_THRESHOLD_MS;
}
