"use client";

import SidebarItem from "./SidebarItem";

export default function AdminSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white lg:block">
      <div className="flex h-16 items-center border-b px-6">
        <div>
          <h1 className="text-lg font-bold text-red-800">
            Cordova RISKQ
          </h1>

          <p className="text-xs text-slate-500">
            Admin Portal
          </p>
        </div>
      </div>

      <nav className="space-y-1 p-4">
        <SidebarItem href="/dashboard" label="Dashboard" icon="▦" />
        <SidebarItem href="/live-map" label="Live Map" icon="⌖" />
        <SidebarItem href="/emergencies" label="Emergencies" icon="!" />
        <SidebarItem href="/responders" label="Responders" icon="♟" />
        <SidebarItem href="/users" label="Users" icon="●" />
        <SidebarItem href="/reports" label="Reports" icon="▤" />
        <SidebarItem
          href="/announcements"
          label="Announcements"
          icon="◉"
        />
        <SidebarItem href="/audit-logs" label="Audit Logs" icon="▥" />
        <SidebarItem href="/settings" label="Settings" icon="⚙" />
      </nav>
    </aside>
  );
}