"use client";

import { useEffect, useState } from "react";
import { Waves, Sun, CloudSun, CloudLightning, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Badge from "@/components/ui/Badge";

function getGreeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const TIDE_BADGE_VARIANT = {
  Normal: "success",
  Watch: "warning",
  Warning: "danger",
} as const;

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

export default function DashboardHeader() {
  const { user } = useAuth();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  const WeatherIcon = weatherIcons[weather.condition].icon;

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

        <div className="flex items-center gap-2.5">
          <div className="glass-strong flex items-center gap-2 rounded-xl border border-(--glass-border) px-4 py-2.5 text-sm font-medium text-foreground shadow-sm">
            <WeatherIcon size={16} className={weatherIcons[weather.condition].color} strokeWidth={2.25} />
            <span>{weather.temperatureC}&deg;C</span>
            <span className="hidden text-muted sm:inline">&middot; {weather.description}</span>
          </div>

          <div className="glass-strong flex items-center gap-2 rounded-xl border border-(--glass-border) px-4 py-2.5 text-sm font-medium text-foreground shadow-sm">
            <Calendar size={16} className="text-muted" strokeWidth={2.25} />
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

      {/* Single accent (the Badge) carries the tide level; icon/label/banner
          stay neutral so the status isn't repeated in four places at once. */}
      <div className="relative mt-4 flex items-center gap-3 rounded-2xl border border-border/60 bg-background/60 p-3">
        <Waves size={20} className="shrink-0 text-muted" strokeWidth={2.25} />

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">Tide Level</p>
            <Badge variant={TIDE_BADGE_VARIANT[tide.level]} solid>
              {tide.level}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-muted">{tide.message}</p>
        </div>
      </div>
    </div>
  );
}
