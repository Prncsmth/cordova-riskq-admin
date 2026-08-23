"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import { SidebarProvider, useSidebar } from "./SidebarContext";
import { useAuth } from "@/hooks/useAuth";

function AdminLayoutInner({ children }: { children: ReactNode }) {
  const { collapsed, toggle } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const { authenticated } = useAuth();
  const isFullscreenMap = collapsed && pathname === "/live-map";

  useEffect(() => {
    if (!authenticated) {
      router.replace("/login");
    }
  }, [authenticated, router]);

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminSidebar />

      <button
        type="button"
        onClick={toggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={`fixed top-24 z-50 hidden h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-md transition-[left] duration-300 hover:bg-background lg:flex ${
          collapsed ? "left-0" : "left-72"
        }`}
      >
        <ChevronLeft
          size={16}
          strokeWidth={2.5}
          className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`transition-[padding] duration-300 ${collapsed ? "lg:pl-0" : "lg:pl-72"}`}
      >
        {!isFullscreenMap && <AdminHeader />}

        <main className={isFullscreenMap ? "" : "p-6"}>{children}</main>
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
