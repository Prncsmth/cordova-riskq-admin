"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import { SidebarProvider, useSidebar } from "./SidebarContext";
import { useAuth } from "@/hooks/useAuth";

function AdminLayoutInner({ children }: { children: ReactNode }) {
  const { collapsed, toggle } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const { authenticated, isHydrated } = useAuth();
  // Treat the Live Map route as a fullscreen workspace: hide header and
  // remove page padding so the map can fill the viewport next to the sidebar.
  // Use a contains check since the route may include prefixes or trailing
  // segments (e.g. localized or grouped routes).
  const isFullscreenMap = typeof pathname === "string" && pathname.includes("live-map");

  useEffect(() => {
    if (isHydrated && !authenticated) {
      router.replace("/login");
    }
  }, [isHydrated, authenticated, router]);

  // Auth is only known after the localStorage-backed token has been read on
  // the client, so render a stable loading shell for the SSR pass and the
  // first client render instead of branching on `authenticated` early —
  // that branch is what caused the hydration mismatch this replaces.
  if (!isHydrated || !authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground">
      <AdminSidebar />

      <button
        type="button"
        onClick={toggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={`glass fixed top-1/2 z-50 hidden h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-(--glass-border) text-foreground shadow-md transition-[left] duration-300 hover:scale-110 active:scale-95 lg:flex ${
          collapsed ? "left-0" : "left-72"
        }`}
      >
        {collapsed ? <PanelLeftOpen size={15} strokeWidth={2.25} /> : <PanelLeftClose size={15} strokeWidth={2.25} />}
      </button>

      <div
        className={`transition-[padding] duration-300 ${collapsed ? "lg:pl-0" : "lg:pl-72"}`}
      >
        {!isFullscreenMap && <AdminHeader />}

        <main className={isFullscreenMap ? "" : "p-6 lg:p-8"}>{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </SidebarProvider>
  );
}
