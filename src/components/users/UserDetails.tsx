"use client";

import { Mail, Phone, Calendar, Hash } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { useUser } from "@/hooks/useUser";
import { formatDate, timeAgo } from "@/lib/utils";
import type { User } from "@/types/user";

const ROLE_BADGE_VARIANT: Record<User["role"], "info" | "success" | "default"> = {
  admin: "info",
  responder: "success",
  citizen: "default",
};

// Solid-fill counterparts to ROLE_BADGE_VARIANT's soft badge tints, for the
// avatar circle -- mirrors Badge's own solidStyles color choices so the two
// stay visually paired.
const ROLE_AVATAR_STYLE: Record<User["role"], string> = {
  admin: "bg-info",
  responder: "bg-success",
  citizen: "bg-muted",
};

const ROLE_LABEL: Record<User["role"], string> = {
  admin: "Admin",
  responder: "Responder",
  citizen: "Citizen",
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
  const { user, loading, error } = useUser(id);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted shadow-sm">
        Loading user…
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
          <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white shadow-xs ${ROLE_AVATAR_STYLE[user.role]}`}>
            {initials(user.name)}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-foreground">{user.name}</h2>
            <p className="text-sm text-muted">
              {ROLE_LABEL[user.role]} &middot; Joined {timeAgo(user.createdAt)}
            </p>
          </div>

          <Badge variant={ROLE_BADGE_VARIANT[user.role]}>{user.role}</Badge>
        </div>

        <div className="mt-8 grid gap-5 border-t border-border/70 pt-6 sm:grid-cols-2">
          <div className="flex items-start gap-2.5">
            <Mail size={16} className="mt-0.5 shrink-0 text-muted" />
            <div>
              <p className="text-xs text-muted">Email</p>
              <p className="text-sm font-medium text-foreground">{user.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Phone size={16} className="mt-0.5 shrink-0 text-muted" />
            <div>
              <p className="text-xs text-muted">Phone</p>
              <p className="text-sm font-medium text-foreground">{user.phone ?? "Not provided"}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Calendar size={16} className="mt-0.5 shrink-0 text-muted" />
            <div>
              <p className="text-xs text-muted">Joined</p>
              <p className="text-sm font-medium text-foreground">{formatDate(user.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Hash size={16} className="mt-0.5 shrink-0 text-muted" />
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
