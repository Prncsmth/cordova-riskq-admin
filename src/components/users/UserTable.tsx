"use client";

import { useState } from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { useUsers } from "@/hooks/useUsers";
import { User } from "@/types/user";

const ROLE_BADGE_VARIANT: Record<User["role"], "info" | "success" | "default"> = {
  admin: "info",
  responder: "success",
  citizen: "default",
};

export default function UserTable() {
  const { users, loading, error, changeRole } = useUsers();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleToggleRole(user: User) {
    const nextRole = user.role === "citizen" ? "responder" : "citizen";
    setPendingId(user.id);
    try {
      await changeRole(user.id, nextRole);
    } finally {
      setPendingId(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-white p-10 text-center text-sm text-muted shadow-sm">
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
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-background">
            <tr>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted">User</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted">Email</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted">Role</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted">Action</th>
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
  );
}
