import { Mail, Phone, Calendar, Hash, UserX, UserCheck } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { MOCK_USERS } from "@/lib/mockUsers";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function UserDetails({ id }: { id: string }) {
  const user = MOCK_USERS.find((u) => u.id === id);

  if (!user) {
    return (
      <EmptyState
        title="User not found"
        description={`No user matches "${id}". They may have been removed.`}
      />
    );
  }

  const isActive = user.status === "Active";

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="md:col-span-2">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-linear-to-b from-primary to-primary-dark text-xl font-bold text-white shadow-sm ring-1 ring-primary/10">
            {initials(user.name)}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-foreground">{user.name}</h2>
            <p className="text-sm text-muted">{user.id}</p>
          </div>

          <Badge variant={isActive ? "success" : "danger"} solid={!isActive}>
            {user.status}
          </Badge>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-info-light text-info">
              <Mail size={15} />
            </span>
            <div>
              <p className="text-xs text-muted">Email</p>
              <p className="text-sm font-medium text-foreground">{user.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success-light text-success">
              <Phone size={15} />
            </span>
            <div>
              <p className="text-xs text-muted">Phone</p>
              <p className="text-sm font-medium text-foreground">{user.phone ?? "Not provided"}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warning-light text-warning">
              <Calendar size={15} />
            </span>
            <div>
              <p className="text-xs text-muted">Joined</p>
              <p className="text-sm font-medium text-foreground">{user.createdAt}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
              <Hash size={15} />
            </span>
            <div>
              <p className="text-xs text-muted">User ID</p>
              <p className="text-sm font-medium text-foreground">{user.id}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-foreground">Account Actions</h2>
        <p className="mt-1 text-sm text-muted">
          {isActive
            ? "Suspend this account if it violates platform guidelines."
            : "This account is currently suspended and cannot sign in."}
        </p>

        <button
          type="button"
          className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:brightness-110 active:scale-[0.98] ${
            isActive ? "bg-linear-to-b from-danger to-danger/80" : "bg-linear-to-b from-success to-success/80"
          }`}
        >
          {isActive ? <UserX size={16} /> : <UserCheck size={16} />}
          {isActive ? "Suspend Account" : "Reactivate Account"}
        </button>
      </Card>
    </div>
  );
}
