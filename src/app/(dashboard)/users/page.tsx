"use client";

import { Users as UsersIcon, UserPlus } from "lucide-react";
import Card from "@/components/ui/Card";
import UserTable from "@/components/users/UserTable";
import { useUsers } from "@/hooks/useUsers";
import { usePaginationState } from "@/hooks/usePaginationState";

export default function UsersPage() {
  const pagination = usePaginationState();
  const { users, total, newThisWeek, loading, error, actionError, changeRole } = useUsers(pagination);
  const totalPages = Math.max(1, Math.ceil(total / pagination.pageSize));

  const stats = [
    { label: "Total Users", value: total, icon: UsersIcon, color: "text-primary" },
    { label: "New This Week", value: newThisWeek, icon: UserPlus, color: "text-info" },
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
            <Card key={stat.label} className="flex items-center gap-4 shadow-md">
              <Icon size={22} className={`shrink-0 ${stat.color}`} />
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
        searchInput={pagination.searchInput}
        onSearchChange={pagination.setSearchInput}
        page={pagination.page}
        totalPages={totalPages}
        pageSize={pagination.pageSize}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />
    </div>
  );
}
