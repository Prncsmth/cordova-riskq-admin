"use client";

import Image from "next/image";
import { Inter } from "next/font/google";
import {
  LayoutDashboard,
  Siren,
  Bell,
  FileText,
  ShieldCheck,
  Users as UsersIcon,
  Eye,
  Building2,
  Wrench,
  BarChart3,
  FileBarChart,
  Settings,
  Map,
  Megaphone,
  ScrollText,
} from "lucide-react";
import SidebarGroup from "./SidebarGroup";
import SidebarItem from "./SidebarItem";
import { useSidebar } from "./SidebarContext";

const inter = Inter({ subsets: ["latin"], weight: ["600", "700"] });

export default function AdminSidebar() {
  const { collapsed } = useSidebar();

  return (
    <aside
      className={`${inter.className} glass fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-(--glass-border) shadow-xl transition-transform duration-300 lg:flex ${
        collapsed ? "-translate-x-full" : "translate-x-0"
      }`}
    >

      {/* Logo / Header */}
      <div className="flex h-20 shrink-0 items-center border-b border-(--glass-border) px-6">
        <div className="flex items-center gap-3">

          {/* Logo */}
          <div className="relative h-12 w-12 shrink-0 drop-shadow-sm">
            <Image
              src="/images/logo.png"
              alt="Cordova RISKQ Logo"
              fill
              priority
              sizes="48px"
              className="object-contain"
            />
          </div>

          {/* Text */}
          <div>
            <h1 className={`${inter.className} flex items-center text-xl font-bold tracking-tight`}>
              <span className="inline-flex items-center" style={{ color: "var(--brand-cordova)" }}>
                C
                <Image
                  src="/images/cordova-logo.png"
                  alt="O"
                  width={18}
                  height={18}
                  className="mx-0.5 inline-block object-contain"
                />
                RDOVA
              </span>
              &nbsp;
              <span style={{ color: "#FE6B47" }}>RISKQ</span>
            </h1>
          </div>

        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto p-4">
        <div className="space-y-1">
          <SidebarItem href="/dashboard" label="Dashboard" icon={LayoutDashboard} />
        </div>

        <SidebarGroup
          label="Emergency Operations"
          items={[
            { href: "/emergencies", label: "Live Incidents", icon: Siren },
            { href: "/sos-alerts", label: "SOS Alerts", icon: Bell },
            { href: "/incident-reports", label: "Incident Reports", icon: FileText },
            { href: "/live-map", label: "Live Map", icon: Map },
          ]}
        />

        <SidebarGroup
          label="People"
          items={[
            { href: "/responders", label: "Responders", icon: ShieldCheck },
            { href: "/users", label: "Users", icon: UsersIcon },
            { href: "/witnesses", label: "Witnesses", icon: Eye },
          ]}
        />

        <SidebarGroup
          label="Resources"
          items={[
            { href: "/evacuation-centers", label: "Evacuation Centers", icon: Building2 },
            { href: "/resources", label: "Equipment / Resources", icon: Wrench },
          ]}
        />

        <SidebarGroup
          label="System"
          items={[
            { href: "/analytics", label: "Analytics", icon: BarChart3 },
            { href: "/reports", label: "Reports", icon: FileBarChart },
            { href: "/announcements", label: "Announcements", icon: Megaphone },
            { href: "/audit-logs", label: "Audit Logs", icon: ScrollText },
            { href: "/settings", label: "Settings", icon: Settings },
          ]}
        />
      </nav>

    </aside>
  );
}
