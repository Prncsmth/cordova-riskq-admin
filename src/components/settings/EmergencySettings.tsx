"use client";

import { Bell, Volume2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Switch from "@/components/ui/Switch";
import SettingRow from "@/components/settings/SettingRow";
import { useEmergencyAlert } from "@/components/layout/EmergencyAlertProvider";

export default function EmergencySettings() {
  const { soundEnabled, setSoundEnabled, testSound } = useEmergencyAlert();

  return (
    <section>
      <h2 className="px-1 pb-2 text-xs font-bold uppercase tracking-[0.12em] text-muted">
        Emergency Operations
      </h2>

      <Card className="divide-y divide-border/70">
        <SettingRow
          icon={Bell}
          label="Emergency Alert Sound"
          description="Play a sound the instant a new incident or SOS alert comes in"
        >
          <Switch
            checked={soundEnabled}
            onChange={setSoundEnabled}
            label="Emergency Alert Sound"
          />
        </SettingRow>

        <SettingRow
          icon={Volume2}
          label="Test Alert Sound"
          description="Preview what the emergency alert sounds like"
        >
          <button
            type="button"
            onClick={testSound}
            className="rounded-xl border border-border px-3.5 py-2 text-sm font-medium text-foreground transition hover:bg-background/60 active:scale-[0.98]"
          >
            Play Test
          </button>
        </SettingRow>
      </Card>
    </section>
  );
}
