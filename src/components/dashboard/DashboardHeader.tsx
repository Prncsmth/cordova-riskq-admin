"use client";

import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

function getGreeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardHeader() {
  const { user } = useAuth();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  return (
    <div className="rounded-3xl border border-border/60 bg-surface p-5 shadow-xs lg:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {now ? getGreeting(now.getHours()) : "Welcome"}
            {user?.name ? `, ${user.name}` : ""}!
          </h1>

          <p className="mt-1 text-sm text-muted">
            Here&apos;s what&apos;s happening in Cordova today.
          </p>
        </div>

        <div className="glass-strong flex items-center gap-2.5 self-start rounded-xl border border-(--glass-border) px-4 py-2.5 text-sm font-medium text-foreground shadow-sm lg:self-auto">
          <Calendar size={16} className="text-muted" strokeWidth={2.25} />
          {now
            ? now.toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : " "}
        </div>
      </div>
    </div>
  );
}
