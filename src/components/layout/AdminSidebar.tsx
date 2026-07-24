"use client";

import Image from "next/image";
import SidebarItem from "./SidebarItem";

export default function AdminSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 bg-red-950    shadow-xl lg:block">
      
      {/* Logo / Header */}
      <div className="flex h-20 items-center border-b border-red-900 px-6">
        <div className="flex items-center gap-3">
          
          {/* Logo */}
          <div className="relative h-12 w-12 shrink-0">
            <Image
              src="/images/logo.png"
              alt="Cordova RISKQ Logo"
              fill
              priority
              className="object-contain"
            />
          </div>

          {/* Text */}
          <div>
            <h1 className="text-xl font-bold text-white">
              CORDOVA RISKQ
            </h1>

            <p className="text-xs text-slate-300">
              Admin Portal
            </p>
          </div>

        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 p-4">
        <SidebarItem href="/dashboard" label="Dashboard" icon="▦" />
        <SidebarItem href="/live-map" label="Live Map" icon="⌖" />
        <SidebarItem href="/emergencies" label="Emergencies" icon="!" />
        <SidebarItem href="/responders" label="Responders" icon="♟" />
        <SidebarItem href="/users" label="Users" icon="●" />
        <SidebarItem href="/reports" label="Reports" icon="▤" />
        <SidebarItem href="/announcements" label="Announcements" icon="◉" />
        <SidebarItem href="/audit-logs" label="Audit Logs" icon="▥" />
        <SidebarItem href="/settings" label="Settings" icon="⚙" />
      </nav>

    </aside>
  );
}