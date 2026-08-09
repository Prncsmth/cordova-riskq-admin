import SosAlertTable from "@/components/sos-alerts/SosAlertTable";

export default function SosAlertsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">SOS Alerts</h1>
        <p className="text-sm text-muted">
          Emergency SOS alerts received from citizens across Cordova.
        </p>
      </div>

      <SosAlertTable />
    </div>
  );
}
