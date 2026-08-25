"use client";

import { useEffect, useState } from "react";
import { Waves, Sun, CloudSun, CloudLightning } from "lucide-react";

function getGreeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

// Mock data for UI — replace with a real weather API once available.
// August sits in the Philippine rainy season, and cloud cover here lines up
// with the tide advisory below — same incoming weather system driving both.
const weather = {
  condition: "Cloudy" as const,
  temperatureC: 29,
  description: "Partly cloudy, chance of rain",
};

const weatherIcons = {
  Sunny: { icon: Sun, color: "text-warning" },
  Cloudy: { icon: CloudSun, color: "text-info" },
  Stormy: { icon: CloudLightning, color: "text-primary" },
};

// Mock data for UI — replace with real tide-gauge data once available.
// Cordova is a coastal municipality (mangrove channel + Camotes Sea), so
// tide level is operationally relevant for flood/evacuation planning.
const tide = {
  level: "Watch" as const,
  message: "Elevated tide levels expected this afternoon — monitor Day-as and Buagsong for coastal flooding.",
};

const tideStyles = {
  Normal: { bg: "bg-success-light", ring: "bg-success", text: "text-success" },
  Watch: { bg: "bg-warning-light", ring: "bg-warning", text: "text-warning" },
  Warning: { bg: "bg-danger-light", ring: "bg-danger", text: "text-danger" },
};

export default function DashboardHeader() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  const tideStyle = tideStyles[tide.level];
  const WeatherIcon = weatherIcons[weather.condition].icon;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-linear-to-br from-primary-light/70 via-white to-secondary/10 p-6 shadow-sm lg:p-8">
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-secondary/10 blur-3xl" />

      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {now ? getGreeting(now.getHours()) : "Welcome"}, Admin
          </h1>

          <p className="mt-1 text-sm text-muted">
            Here&apos;s what&apos;s happening in Cordova today.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="glass-strong flex items-center gap-2 rounded-xl border border-(--glass-border) px-4 py-2.5 text-sm font-medium text-foreground shadow-sm">
            <WeatherIcon size={16} className={weatherIcons[weather.condition].color} strokeWidth={2.25} />
            <span>{weather.temperatureC}&deg;C</span>
            <span className="hidden text-muted sm:inline">&middot; {weather.description}</span>
          </div>

          <div className="glass-strong rounded-xl border border-(--glass-border) px-4 py-2.5 text-sm font-medium text-foreground shadow-sm">
            {now
              ? now.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                })
              : " "}
          </div>
        </div>
      </div>

      <div className={`relative mt-5 flex items-center gap-3 rounded-2xl border border-(--glass-border) p-3.5 ${tideStyle.bg}`}>
        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center">
          <span className={`absolute inline-flex h-9 w-9 animate-ping rounded-full opacity-30 ${tideStyle.ring}`} />
          <span className={`relative flex h-9 w-9 items-center justify-center rounded-full ${tideStyle.ring}`}>
            <Waves size={16} className="text-white" strokeWidth={2.5} />
          </span>
        </span>

        <div className="min-w-0">
          <p className={`text-sm font-semibold ${tideStyle.text}`}>Tide Level: {tide.level}</p>
          <p className="text-xs text-foreground/70">{tide.message}</p>
        </div>
      </div>
    </div>
  );
}
