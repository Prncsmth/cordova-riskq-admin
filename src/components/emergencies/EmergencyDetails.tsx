"use client";

import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useEmergency } from "@/hooks/useEmergencies";

const statusVariant = {
  Active: "danger",
  Responding: "warning",
  Resolved: "success",
  Cancelled: "default",
} as const;

export default function EmergencyDetails({
  id,
}: {
  id: string;
}) {
  const { emergency, loading, error } = useEmergency(id);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-white p-10 text-center text-sm text-muted shadow-sm">
        Loading incident…
      </div>
    );
  }

  if (error || !emergency) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-sm text-red-700 shadow-sm">
        {error ?? "Incident not found."}
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <h2 className="text-lg font-semibold">
          Emergency Information
        </h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted">Emergency ID</p>
            <p className="font-semibold">{emergency.id}</p>
          </div>

          <div>
            <p className="text-xs text-muted">Type</p>
            <p className="font-semibold">{emergency.type}</p>
          </div>

          <div>
            <p className="text-xs text-muted">Location</p>
            <p className="font-semibold">{emergency.locationName}</p>
          </div>

          <div>
            <p className="text-xs text-muted">Status</p>
            <Badge variant={statusVariant[emergency.status]}>{emergency.status}</Badge>
          </div>

          {emergency.description && (
            <div className="sm:col-span-2">
              <p className="text-xs text-muted">Details</p>
              <p className="font-medium">{emergency.description}</p>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold">Assigned Responder</h2>

        <div className="mt-5">
          {emergency.responderId ? (
            <p className="font-medium">{emergency.responderId}</p>
          ) : (
            <p className="text-sm text-muted">No responder assigned yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
}