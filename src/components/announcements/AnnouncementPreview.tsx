import Image from "next/image";
import { Megaphone } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { AnnouncementAudience, AnnouncementPriority } from "@/types/announcement";

type AnnouncementPreviewProps = {
  title: string;
  body: string;
  priority: AnnouncementPriority;
  audience: AnnouncementAudience;
};

export default function AnnouncementPreview({ title, body, priority, audience }: AnnouncementPreviewProps) {
  const isUrgent = priority === "Urgent";

  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Live Preview</p>
      <p className="mt-0.5 text-xs text-muted">How this will appear to {audience.toLowerCase()}</p>

      <div
        className={`mt-4 rounded-2xl border p-4 shadow-sm ${
          isUrgent ? "border-danger/20 bg-danger-light/50" : "border-border bg-background/60"
        }`}
      >
        <div className="flex items-start gap-3">
          <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-white shadow-xs ring-1 ring-black/5">
            <Image src="/images/logo.png" alt="" fill sizes="32px" className="object-contain p-1" />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-foreground">Cordova RISKQ</p>
              <span className="text-[11px] text-muted">now</span>
            </div>

            <p className="mt-1 truncate text-sm font-semibold text-foreground">
              {title.trim() || "Announcement title"}
            </p>
            <p className="mt-0.5 line-clamp-3 text-xs text-muted">
              {body.trim() || "Your announcement message will appear here as you type."}
            </p>
          </div>

          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${isUrgent ? "bg-danger" : "bg-primary"}`}>
            <Megaphone size={13} className="text-white" />
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        <Badge variant={isUrgent ? "danger" : "default"} solid={isUrgent}>
          {priority}
        </Badge>
        <Badge variant="info">{audience}</Badge>
      </div>
    </Card>
  );
}
