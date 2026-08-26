"use client";

import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { useResponders } from "@/hooks/useResponders";
import { formatDate } from "@/lib/utils";

export default function ResponderDetails({
  id,
}: {
  id: string;
}) {
  const { responders, loading, error } = useResponders();
  const responder = responders.find((r) => r.id === id);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-white p-10 text-center text-sm text-muted shadow-sm">
        Loading responder…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-sm text-red-700 shadow-sm">
        {error}
      </div>
    );
  }

  if (!responder) {
    return (
      <EmptyState
        title="Responder not found"
        description={`No responder matches "${id}". They may have been reverted to citizen.`}
      />
    );
  }

  return (
    <Card>
      <h2 className="font-semibold">Responder Information</h2>

      <div className="mt-5 space-y-4">
        <div>
          <p className="text-xs text-muted">Responder ID</p>
          <p>{responder.id}</p>
        </div>

        <div>
          <p className="text-xs text-muted">Name</p>
          <p>{responder.name}</p>
        </div>

        <div>
          <p className="text-xs text-muted">Email</p>
          <p>{responder.email}</p>
        </div>

        <div>
          <p className="text-xs text-muted">Contact</p>
          <p>{responder.phone ?? "Not provided"}</p>
        </div>

        <div>
          <p className="text-xs text-muted">Joined</p>
          <p>{formatDate(responder.createdAt)}</p>
        </div>
      </div>
    </Card>
  );
}
