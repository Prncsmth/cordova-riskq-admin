import { Mail, MessageSquare, MonitorSmartphone } from "lucide-react";
import Card from "@/components/ui/Card";
import Switch from "@/components/ui/Switch";
import SettingRow from "@/components/settings/SettingRow";

export default function NotificationSettings() {
  return (
    <section>
      <h2 className="px-1 pb-2 text-xs font-bold uppercase tracking-[0.12em] text-muted">
        Notifications
      </h2>

      <Card className="divide-y divide-border/70">
        <SettingRow
          icon={Mail}
          label="Email Notifications"
          description="Daily summaries and critical system alerts"
        >
          <Switch defaultChecked label="Email Notifications" />
        </SettingRow>

        <SettingRow
          icon={MessageSquare}
          label="SMS Alerts"
          description="Text message alerts for high-priority SOS activity"
        >
          <Switch label="SMS Alerts" />
        </SettingRow>

        <SettingRow
          icon={MonitorSmartphone}
          label="Browser Push Notifications"
          description="Real-time push notifications for this admin dashboard"
        >
          <Switch defaultChecked label="Browser Push Notifications" />
        </SettingRow>
      </Card>
    </section>
  );
}
