"use client";

import { useRouter } from "next/navigation";
import { Lock, ShieldCheck, Monitor, LogOut } from "lucide-react";
import Card from "@/components/ui/Card";
import Switch from "@/components/ui/Switch";
import SettingRow from "@/components/settings/SettingRow";

export default function SecuritySettings() {
  const router = useRouter();

  function logout() {
    localStorage.removeItem("riskq_admin_authenticated");
    router.push("/login");
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="px-1 pb-2 text-xs font-bold uppercase tracking-[0.12em] text-muted">
          Security
        </h2>

        <Card className="divide-y divide-border/70">
          <SettingRow icon={Lock} label="Password" description="Last changed 3 months ago">
            <button
              type="button"
              className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs transition-all duration-150 hover:border-primary/40 hover:bg-primary-light/30 active:scale-[0.97]"
            >
              Change
            </button>
          </SettingRow>

          <SettingRow
            icon={ShieldCheck}
            label="Two-Factor Authentication"
            description="Add an extra verification step when signing in"
          >
            <Switch label="Two-Factor Authentication" />
          </SettingRow>

          <SettingRow icon={Monitor} label="Active Sessions" description="1 device currently signed in">
            <button
              type="button"
              className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs transition-all duration-150 hover:border-primary/40 hover:bg-primary-light/30 active:scale-[0.97]"
            >
              Manage
            </button>
          </SettingRow>
        </Card>
      </div>

      <div>
        <h2 className="px-1 pb-2 text-xs font-bold uppercase tracking-[0.12em] text-muted">
          Account
        </h2>

        <Card>
          <button type="button" onClick={logout} className="block w-full text-left">
            <SettingRow icon={LogOut} label="Log Out" danger>
              <span className="text-xs font-medium text-danger/70">Admin User</span>
            </SettingRow>
          </button>
        </Card>
      </div>
    </section>
  );
}
