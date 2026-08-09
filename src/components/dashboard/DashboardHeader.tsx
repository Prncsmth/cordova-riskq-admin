"use client";

function getGreeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardHeader() {
  const now = new Date();

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {getGreeting(now.getHours())}, Admin
        </h1>

        <p className="mt-1 text-sm text-muted">
          Here&apos;s what&apos;s happening in Cordova today.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground shadow-sm">
        {now.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "2-digit",
        })}
      </div>
    </div>
  );
}
