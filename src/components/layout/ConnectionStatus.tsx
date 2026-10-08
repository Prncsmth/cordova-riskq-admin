"use client";

import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import { useSocketConnectionStatus, type SocketConnectionStatus } from "@/hooks/useSocket";

const STATUS_CONFIG: Record<SocketConnectionStatus, { label: string; variant: BadgeVariant; dot: string }> = {
  connected: { label: "Realtime Connected", variant: "success", dot: "bg-success" },
  connecting: { label: "Connecting…", variant: "warning", dot: "bg-warning" },
  disconnected: { label: "Realtime Disconnected", variant: "danger", dot: "bg-danger" },
};

// Reflects the dashboard's actual Socket.IO connection, not navigator.onLine
// -- the blind spot this closes is specifically "the dashboard looks normal
// but realtime incident/SOS updates silently stopped," which general
// internet connectivity can't tell you (see useSocketConnectionStatus).
export default function ConnectionStatus() {
  const status = useSocketConnectionStatus();
  const config = STATUS_CONFIG[status];

  return (
    <span title={status === "disconnected" ? "Realtime updates may be delayed while disconnected." : undefined}>
      <Badge variant={config.variant}>
        <span className={`mr-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${config.dot}`} />
        <span className="hidden sm:inline">{config.label}</span>
      </Badge>
    </span>
  );
}
