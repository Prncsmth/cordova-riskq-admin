import Card from "@/components/ui/Card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          System Settings
        </h1>

        <p className="text-sm text-muted">
          Configure Cordova RISKQ administration settings.
        </p>
      </div>

      <Card>
        <h2 className="font-semibold text-foreground">
          Emergency Settings
        </h2>

        <div className="mt-5 space-y-4">
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="accent-primary" />
            <span className="text-sm text-foreground">
              Enable emergency notifications
            </span>
          </label>

          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="accent-primary" />
            <span className="text-sm text-foreground">
              Enable responder alerts
            </span>
          </label>

          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="accent-primary" />
            <span className="text-sm text-foreground">
              Enable live location tracking
            </span>
          </label>
        </div>
      </Card>
    </div>
  );
}
