import { Bell } from "lucide-react";
import Card from "@/components/ui/Card";
import Switch from "@/components/ui/Switch";
import SettingRow from "@/components/settings/SettingRow";

export default function EmergencySettings() {
  return (
    <section>
      <h2 className="px-1 pb-2 text-xs font-bold uppercase tracking-[0.12em] text-muted">
        Emergency Operations
      </h2>

      <Card className="divide-y divide-border/70">
        <SettingRow
          icon={Bell}
          label="Emergency Notifications"
          description="Get notified the moment a new incident is reported"
        >
          <Switch defaultChecked label="Emergency Notifications" />
        </SettingRow>
      </Card>
    </section>
  );
}
