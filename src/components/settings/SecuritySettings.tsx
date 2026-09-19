"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Monitor, LogOut } from "lucide-react";
import Card from "@/components/ui/Card";
import SettingRow from "@/components/settings/SettingRow";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";

export default function SecuritySettings() {
  const router = useRouter();
  const { token, logout: clearSession } = useAuth();

  const [changingPassword, setChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function logout() {
    clearSession();
    router.push("/login");
  }

  function startChangingPassword() {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setSuccess(false);
    setChangingPassword(true);
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation don't match.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await apiFetch("/users/change-password", {
        method: "POST",
        body: JSON.stringify({ oldPassword, newPassword }),
        token: token ?? undefined,
      });
      setSuccess(true);
      setChangingPassword(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="px-1 pb-2 text-xs font-bold uppercase tracking-[0.12em] text-text-tertiary">
          Security
        </h2>

        <Card className="divide-y divide-border/70">
          {changingPassword ? (
            <div className="space-y-3 px-1 py-4">
              <div className="flex items-center gap-2">
                <Lock size={17} className="text-primary" />
                <p className="text-sm font-semibold text-foreground">Change Password</p>
              </div>

              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Current password"
                className="w-full rounded-xl border border-border bg-background/60 px-3 py-2 text-sm text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className="w-full rounded-xl border border-border bg-background/60 px-3 py-2 text-sm text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full rounded-xl border border-border bg-background/60 px-3 py-2 text-sm text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
              />

              {error && <p className="text-xs text-red-600">{error}</p>}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={saving || !oldPassword || !newPassword || !confirmPassword}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-all duration-150 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save Password"}
                </button>
                <button
                  type="button"
                  onClick={() => setChangingPassword(false)}
                  disabled={saving}
                  className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs transition-all duration-150 hover:border-primary/40 hover:bg-primary-light/30"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <SettingRow
              icon={Lock}
              label="Password"
              description={success ? "Password updated." : "Change your account password"}
            >
              <button
                type="button"
                onClick={startChangingPassword}
                className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs transition-all duration-150 hover:border-primary/40 hover:bg-primary-light/30 active:scale-[0.97]"
              >
                Change
              </button>
            </SettingRow>
          )}

          <SettingRow icon={Monitor} label="Active Sessions" description="1 device currently signed in">
            <button
              type="button"
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs transition-all duration-150 hover:border-primary/40 hover:bg-primary-light/30 active:scale-[0.97]"
            >
              Manage
            </button>
          </SettingRow>
        </Card>
      </div>

      <div>
        <h2 className="px-1 pb-2 text-xs font-bold uppercase tracking-[0.12em] text-text-tertiary">
          Account
        </h2>

        <Card>
          <button type="button" onClick={logout} className="block w-full text-left">
            <SettingRow icon={LogOut} label="Log Out" danger>
              <span className="text-xs font-medium text-danger/70">Log out</span>
            </SettingRow>
          </button>
        </Card>
      </div>
    </section>
  );
}
