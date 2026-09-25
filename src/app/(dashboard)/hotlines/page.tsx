"use client";

import { Phone } from "lucide-react";
import Card from "@/components/ui/Card";
import HotlineList from "@/components/hotlines/HotlineList";
import { useHotlines } from "@/hooks/useHotlines";

export default function HotlinesPage() {
  const { hotlines, loading, error, actionError, updateHotline } = useHotlines();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Emergency Hotlines</h1>
        <p className="text-sm text-muted">
          Manage the agency contact numbers citizens see in the app.
        </p>
      </div>

      <Card className="flex items-center gap-4 shadow-md sm:w-fit">
        <Phone size={22} className="shrink-0 text-primary" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Total Hotlines
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">{hotlines.length}</p>
        </div>
      </Card>

      <HotlineList
        hotlines={hotlines}
        loading={loading}
        error={error}
        actionError={actionError}
        updateHotline={updateHotline}
      />
    </div>
  );
}
