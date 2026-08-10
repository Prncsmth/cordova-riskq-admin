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

const inter = Inter({ subsets: ["latin"], weight: ["600", "700"] });

export default function AdminSidebar() {
  return (
    <aside
      className={`${inter.className} fixed inset-y-0 left-0 z-40 hidden w-72 flex-col bg-white shadow-xl lg:flex`}
    >

      {/* Logo / Header */}
      <div className="flex h-20 shrink-0 items-center border-b border-border bg-white px-6">
        <div className="flex items-center gap-3">

          {/* Logo */}
          <div className="relative h-12 w-12 shrink-0">
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
            <h1 className={`${inter.className} text-xl font-bold`}>
              <span style={{ color: "#A70707" }}>CORDOVA</span>{" "}
              <span style={{ color: "#FE6B47" }}>RISKQ</span>
            </h1>

            <p className="text-xs font-bold text-black">
              
            </p>
          </div>

        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto p-4">
        <SidebarGroup
          label="Overview"
          items={[
            { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
          ]}
        />

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

      {/* System status */}
      <div className="shrink-0 border-t border-border p-4">
        <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-3 text-xs font-bold text-black">
          <span className="h-2 w-2 shrink-0 rounded-full bg-success" />
          <span>
            <span className="block font-bold text-black">System Status</span>
            All systems operational
          </span>
        </div>
      </div>

    </aside>
  );
}
