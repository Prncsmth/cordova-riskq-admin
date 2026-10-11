import AdminProfile from "@/components/settings/AdminProfile";
import EmergencySettings from "@/components/settings/EmergencySettings";
import SystemInfo from "@/components/settings/SystemInfo";
import SecuritySettings from "@/components/settings/SecuritySettings";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">System Settings</h1>

        <p className="text-sm text-muted">
          Manage your profile, emergency alerts, and account security.
        </p>
      </div>

      <AdminProfile />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="space-y-6">
          <EmergencySettings />
          <SystemInfo />
        </div>

        <SecuritySettings />
      </div>
    </div>
  );
}
