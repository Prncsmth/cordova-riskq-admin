import Card from "@/components/ui/Card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          System Settings
        </h1>

        <p className="text-sm text-slate-500">
          Configure Cordova RISKQ administration settings.
        </p>
      </div>

      <Card>
        <h2 className="font-semibold">
          Emergency Settings
        </h2>

        <div className="mt-5 space-y-4">
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked />
            <span className="text-sm">
              Enable emergency notifications
            </span>
          </label>

          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked />
            <span className="text-sm">
              Enable responder alerts
            </span>
          </label>

          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked />
            <span className="text-sm">
              Enable live location tracking
            </span>
          </label>
        </div>
      </Card>
    </div>
  );
}