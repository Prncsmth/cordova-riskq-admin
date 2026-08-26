import AdminProfile from "@/components/settings/AdminProfile";
import EmergencySettings from "@/components/settings/EmergencySettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">System Settings</h1>

        <p className="text-sm text-muted">
          Configure Cordova RISKQ administration settings.
        </p>
      </div>

      <AdminProfile />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="space-y-6">
          <EmergencySettings />
          <NotificationSettings />
        </div>

        <SecuritySettings />
      </div>
    </div>
  );
}
