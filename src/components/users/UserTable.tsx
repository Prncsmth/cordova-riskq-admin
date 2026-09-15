"use client";

import { useState } from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { User } from "@/types/user";
import type { ResponderUnit } from "@/types/responder";

const ROLE_BADGE_VARIANT: Record<User["role"], "info" | "success" | "default"> = {
  admin: "info",
  responder: "success",
  citizen: "default",
};

export default function UserTable({
  users,
  loading,
  error,
  actionError,
  changeRole,
}: {
  users: User[];
  loading: boolean;
  error: string | null;
  actionError: string | null;
  changeRole: (id: string, role: "citizen" | "responder", unit?: ResponderUnit) => Promise<void>;
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [unitSelections, setUnitSelections] = useState<Record<string, ResponderUnit>>({});

  function getUnitSelection(userId: string): ResponderUnit {
    return unitSelections[userId] ?? "BDRRMO";
  }

  async function handleToggleRole(user: User) {
    const nextRole = user.role === "citizen" ? "responder" : "citizen";
    setPendingId(user.id);
    try {
      await changeRole(user.id, nextRole, nextRole === "responder" ? getUnitSelection(user.id) : undefined);
    } catch {
      // surfaced via useUsers' actionError state, rendered below
    } finally {
      setPendingId(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted shadow-sm">
        Loading users…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-sm text-red-700 shadow-sm">
        {error}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <EmptyState
        title="No users yet"
        description="Registered citizens and responders will appear here."
      />
    );
  }

  return (
    <div className="space-y-4">
      {actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-background">
              <tr>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">User</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Email</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Role</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-background">
                  <td className="p-4 font-medium text-foreground">{user.name}</td>
                  <td className="p-4 text-foreground">{user.email}</td>
                  <td className="p-4">
                    <Badge variant={ROLE_BADGE_VARIANT[user.role]}>{user.role}</Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/users/${user.id}`}
                        className="font-medium text-primary hover:text-primary-dark"
                      >
                        View
                      </Link>

                      {user.role === "citizen" && (
                        <select
                          value={getUnitSelection(user.id)}
                          onChange={(e) =>
                            setUnitSelections((prev) => ({ ...prev, [user.id]: e.target.value as ResponderUnit }))
                          }
                          disabled={pendingId === user.id}
                          className="rounded-lg border border-border bg-background/60 py-1.5 px-2 text-xs text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                        >
                          <option value="BDRRMO">BDRRMO</option>
                          <option value="MDRRMO">MDRRMO</option>
                        </select>
                      )}

                      {user.role !== "admin" && (
                        <Button
                          variant="outline"
                          disabled={pendingId === user.id}
                          onClick={() => handleToggleRole(user)}
                        >
                          {user.role === "citizen" ? "Promote to Responder" : "Revert to Citizen"}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
