"use client";

import { Wifi } from "lucide-react";
import Card from "@/components/ui/Card";
import SettingRow from "@/components/settings/SettingRow";
import ConnectionStatus from "@/components/layout/ConnectionStatus";

// Read-only system status, not an editable setting -- reuses the same
// Socket.IO connection state the header's indicator already exposes
// (useSocketConnectionStatus) rather than standing up a second health
// check just for this page.
export default function SystemInfo() {
  return (
    <section>
      <h2 className="px-1 pb-2 text-xs font-bold uppercase tracking-[0.12em] text-muted">
        System
      </h2>

      <Card className="divide-y divide-border/70">
        <SettingRow
          icon={Wifi}
          label="Realtime Connection"
          description="Live incident and SOS updates from the server"
        >
          <ConnectionStatus />
        </SettingRow>
      </Card>
    </section>
  );
}
