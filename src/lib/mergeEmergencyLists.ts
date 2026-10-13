import type { Emergency, EmergencyStatus } from "@/types/emergency";

// The closed statuses GET /admin/history returns. An incident closed live
// with one of these is kept as a history row (instead of vanishing until the
// next reload); "Expired" isn't in history, so it isn't kept either -- the
// list then looks the same before and after a refresh.
export const HISTORY_EMERGENCY_STATUSES: readonly EmergencyStatus[] = ["Resolved", "Cancelled"];

// Of two copies of the same incident, the one the server updated last.
// Compared on updatedAt rather than on where the copy came from: GET
// /incidents can resolve after a socket close event and hand back an older
// "Responding" snapshot, which must not hide the newer "Resolved". On a tie
// (or an unparseable time) the later source -- `candidate` -- wins.
function newerOf(current: Emergency, candidate: Emergency): Emergency {
  const currentAt = Date.parse(current.updatedAt);
  const candidateAt = Date.parse(candidate.updatedAt);
  if (Number.isFinite(currentAt) && Number.isFinite(candidateAt) && currentAt > candidateAt) {
    return current;
  }
  return candidate;
}

// One list for pages that show live + closed incidents together, newest
// first, one row per incident (the most recently updated copy of each).
// Sources are folded in history, closedLive, live order, so on equal
// updatedAt a live close beats the history snapshot loaded at mount and a
// still-live incident beats both.
export function mergeEmergencyLists(
  live: Emergency[],
  history: Emergency[],
  closedLive: Emergency[],
): Emergency[] {
  const byId = new Map<string, Emergency>();
  for (const e of [...history, ...closedLive, ...live]) {
    const existing = byId.get(e.id);
    byId.set(e.id, existing ? newerOf(existing, e) : e);
  }
  return [...byId.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
