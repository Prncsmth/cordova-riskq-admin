import { TriangleAlert } from "lucide-react";
import { UNATTENDED_THRESHOLD_MS } from "@/lib/unattended";

// Row tint for an unattended incident -- a step stronger than the existing
// "New" SOS tint, without changing the row's size or layout.
export const UNATTENDED_ROW_CLASS = "bg-danger-light/40";

const THRESHOLD_MINUTES = UNATTENDED_THRESHOLD_MS / 60_000;

// Shown next to the incident's own status badge (which stays as-is), so the
// status filters and counts still line up with what the row says.
export default function UnattendedBadge() {
  return (
    <span
      title={`Pending with no responder for over ${THRESHOLD_MINUTES} minutes`}
      className="inline-flex items-center gap-1 rounded-full bg-danger px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-xs"
    >
      <TriangleAlert size={11} />
      Unattended
    </span>
  );
}
