import type { HistoryRecord } from "@/hooks/useIncidentHistory";

export function formatMinutes(seconds: number): string {
  const totalMinutes = seconds / 60;
  if (totalMinutes < 60) {
    return `${totalMinutes.toFixed(1)} min`;
  }

  const roundedMinutes = Math.round(totalMinutes);

  if (roundedMinutes < 60 * 24) {
    const hours = Math.floor(roundedMinutes / 60);
    const minutes = roundedMinutes % 60;
    return `${hours}h ${minutes}m`;
  }

  const totalHours = Math.floor(roundedMinutes / 60);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return `${days}d ${hours}h`;
}

export function computeAvgResponseTime(records: HistoryRecord[]): string {
  const withResponseTime = records
    .map((r) => r.responseTimeSeconds)
    .filter((s): s is number => s !== null);

  if (withResponseTime.length === 0) return "—";

  const avgSeconds = withResponseTime.reduce((sum, s) => sum + s, 0) / withResponseTime.length;
  return formatMinutes(avgSeconds);
}

export function computeResolutionRate(records: HistoryRecord[]): string {
  if (records.length === 0) return "—";
  const completed = records.filter((r) => r.status === "completed").length;
  return `${Math.round((completed / records.length) * 100)}%`;
}
