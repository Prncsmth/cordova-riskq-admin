import { Mail, Phone, Calendar, Hash } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { MOCK_USERS } from "@/lib/mockUsers";
import type { User } from "@/types/user";

const ROLE_BADGE_VARIANT: Record<User["role"], "info" | "success" | "default"> = {
  admin: "info",
  responder: "success",
  citizen: "default",
};

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

  return (
    <div className="grid gap-6">
      <Card>
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-linear-to-b from-primary to-primary-dark text-xl font-bold text-white shadow-sm ring-1 ring-primary/10">
            {initials(user.name)}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-foreground">{user.name}</h2>
            <p className="text-sm text-muted">{user.id}</p>
          </div>

          <Badge variant={ROLE_BADGE_VARIANT[user.role]}>{user.role}</Badge>
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
    </div>
  );
}
