"use client";

import { ShieldCheck } from "lucide-react";
import Card from "@/components/ui/Card";
import ResponderTable from "@/components/responders/ResponderTable";
import { useResponders } from "@/hooks/useResponders";

export default function RespondersPage() {
  const { responders, loading, error } = useResponders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Responders</h1>

        <p className="text-sm text-muted">
          Monitor and manage emergency responders.
        </p>
      </div>

      <Card className="flex max-w-xs items-center gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
          <ShieldCheck size={19} />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Total Responders</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{responders.length}</p>
        </div>
      </Card>

      <ResponderTable responders={responders} loading={loading} error={error} />
    </div>
  );
}
