import { Users as UsersIcon, UserCheck, UserX, UserPlus } from "lucide-react";
import Card from "@/components/ui/Card";
import UserTable from "@/components/users/UserTable";

const stats = [
  { label: "Total Users", value: "5", icon: UsersIcon, color: "text-primary", bg: "bg-primary-light" },
  { label: "Active", value: "3", icon: UserCheck, color: "text-success", bg: "bg-success-light" },
  { label: "Suspended", value: "2", icon: UserX, color: "text-danger", bg: "bg-danger-light" },
  { label: "New This Week", value: "3", icon: UserPlus, color: "text-info", bg: "bg-info-light" },
];

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Users</h1>

        <p className="text-sm text-muted">
          Manage registered Cordova RISKQ users.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
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

      <UserTable />
    </div>
  );
}
