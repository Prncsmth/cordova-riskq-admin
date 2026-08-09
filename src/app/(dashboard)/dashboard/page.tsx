"use client";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCards from "@/components/dashboard/StatsCards";
import IncidentOverviewChart from "@/components/dashboard/IncidentOverviewChart";
import LiveMapPreview from "@/app/(dashboard)/dashboard/PreviewMap";
import RecentIncidents from "@/components/dashboard/RecentIncidents";
import RecentActivity from "@/components/dashboard/RecentActivity";
import ResponderStatusDonut from "@/components/dashboard/ResponderStatusDonut";
import EvacuationCenterCapacity from "@/components/dashboard/EvacuationCenterCapacity";
import QuickActions from "@/components/dashboard/QuickActions";
import SystemSummary from "@/components/dashboard/SystemSummary";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader />

      <StatsCards />

      <div className="grid gap-6 xl:grid-cols-2">
        <IncidentOverviewChart />
        <LiveMapPreview />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <RecentIncidents />
        <RecentActivity />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ResponderStatusDonut />
        <EvacuationCenterCapacity />
        <QuickActions />
      </div>

      <SystemSummary />
    </div>
  );
}
