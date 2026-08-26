"use client";

import { Users as UsersIcon, UserPlus } from "lucide-react";
import Card from "@/components/ui/Card";
import UserTable from "@/components/users/UserTable";
import { useUsers } from "@/hooks/useUsers";

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export default function UsersPage() {
  const { users, loading, error, actionError, changeRole } = useUsers();

  const newThisWeek = users.filter(
    (u) => Date.now() - new Date(u.createdAt).getTime() < ONE_WEEK_MS
  ).length;

  const stats = [
    { label: "Total Users", value: users.length, icon: UsersIcon, color: "text-primary", bg: "bg-primary-light" },
    { label: "New This Week", value: newThisWeek, icon: UserPlus, color: "text-info", bg: "bg-info-light" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Users</h1>

        <p className="text-sm text-muted">
          Manage registered Cordova RISKQ users.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="flex items-center gap-4">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${stat.bg} ${stat.color}`}>
                <Icon size={19} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <UserTable
        users={users}
        loading={loading}
        error={error}
        actionError={actionError}
        changeRole={changeRole}
      />
    </div>
  );
}
