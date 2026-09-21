"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useResponderSummary } from "@/hooks/useResponders";

// Colors reference the theme's CSS vars directly (not Tailwind classes,
// since Recharts needs a real color value for SVG `fill`) so they switch
// with dark mode instead of staying pinned to their light-mode hex.
export default function ResponderStatusDonut() {
  const { summary, loading, error } = useResponderSummary();

  const data = useMemo(() => {
    const onDuty = summary?.onDuty ?? 0;
    const offDuty = summary?.offDuty ?? 0;
    return [
      { name: "On Duty", value: onDuty, color: "var(--success)" },
      { name: "Off Duty", value: offDuty, color: "var(--muted)" },
    ];
  }, [summary]);

  const total = summary?.total ?? 0;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-border/70 bg-surface p-6 text-center text-sm text-muted shadow-xs">
        Loading responder status…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700 shadow-xs">
        {error}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-surface p-6 shadow-xs">
      <div className="flex items-center gap-2.5">
        <ShieldCheck size={18} className="shrink-0 text-success" />
        <h2 className="text-lg font-semibold text-foreground">Responder Status</h2>
      </div>

      {total === 0 ? (
        <div className="flex flex-1 items-center justify-center py-8 text-center text-sm text-muted">
          No responders yet.
        </div>
      ) : (
        <>
      <div className="relative mx-auto mt-3 h-44 w-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={55}
              outerRadius={78}
              paddingAngle={4}
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-foreground">{total}</span>
          <span className="text-xs font-medium text-text-tertiary">Responders</span>
        </div>
      </div>

      <div className="mt-4 space-y-1">
        {data.map((entry) => (
          <div
            key={entry.name}
            className="flex items-center justify-between rounded-xl px-2 py-1.5 text-sm transition-colors hover:bg-background/60"
          >
            <span className="flex items-center gap-2 text-foreground">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}
            </span>
            <span className="font-medium text-muted">
              {entry.value} <span className="text-muted/70">({Math.round((entry.value / total) * 100)}%)</span>
            </span>
          </div>
        ))}
      </div>

      <Link
        href="/responders"
        className="mt-5 block w-full rounded-xl bg-primary py-2.5 text-center text-sm font-medium text-white shadow-xs transition-all duration-150 hover:bg-primary-dark active:scale-[0.98]"
      >
        View Responders
      </Link>
        </>
      )}
    </div>
  );
}
