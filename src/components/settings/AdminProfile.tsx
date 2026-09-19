"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import Card from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { initials } from "@/lib/utils";

export default function AdminProfile() {
  const { user, token, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  function startEditing() {
    setName(user!.name);
    setError(null);
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await apiFetch("/users/me", {
        method: "PUT",
        body: JSON.stringify({ name, email: user!.email }),
        token: token ?? undefined,
      });
      updateUser({ name });
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-primary/8 blur-3xl" />

      <div className="relative flex items-center gap-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-white shadow-xs ring-1 ring-primary/10">
          {initials(user.name || user.email)}
        </div>

        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="space-y-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full max-w-xs rounded-xl border border-border bg-background/60 px-3 py-2 text-sm text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || name.trim().length === 0}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-all duration-150 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                  className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs transition-all duration-150 hover:border-primary/40 hover:bg-primary-light/30"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-lg font-semibold text-foreground">{user.name || "Unnamed Admin"}</p>
              <p className="text-sm text-muted">{user.email}</p>

              <span className="mt-2 inline-flex items-center rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/15">
                Administrator
              </span>
            </>
          )}
        </div>

        {!editing && (
          <button
            type="button"
            onClick={startEditing}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-sm font-medium text-foreground shadow-xs transition-all duration-150 hover:border-primary/40 hover:bg-primary-light/30 active:scale-[0.97]"
          >
            <Pencil size={14} />
            Edit Profile
          </button>
        )}
      </div>
    </Card>
  );
}
