// src/app/(dashboard)/support-requests/page.tsx
"use client";

import { useState } from "react";
import { LifeBuoy } from "lucide-react";
import SupportRequestTable from "@/components/support-requests/SupportRequestTable";
import { usePaginationState } from "@/hooks/usePaginationState";
import { useSupportRequests } from "@/hooks/useSupportRequests";
import { REQUESTER_ROLE_LABEL, type SupportRequestStatus } from "@/types/support-request";

export default function SupportRequestsPage() {
  const pagination = usePaginationState();
  const [statusFilter, setStatusFilter] = useState<"All" | SupportRequestStatus>("All");

  const {
    supportRequests,
    total,
    openCount,
    loading,
    error,
    actionError,
    updateStatus,
    freshIds,
    latestArrival,
  } = useSupportRequests(pagination, statusFilter);
  const totalPages = Math.max(1, Math.ceil(total / pagination.pageSize));

  function handleStatusFilterChange(value: "All" | SupportRequestStatus) {
    setStatusFilter(value);
    pagination.resetPage();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Support Requests</h1>

        <p className="text-sm text-muted">
          Messages sent by citizens and responders from the mobile app&apos;s Contact Support form.
          {openCount > 0 ? ` ${openCount} open.` : " Nothing open right now."}
        </p>
      </div>

      {latestArrival && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary-light/30 p-4 text-sm text-foreground"
        >
          <LifeBuoy size={18} className="shrink-0 text-primary" />
          <p>
            <span className="font-semibold">New support request</span> from{" "}
            {latestArrival.userName || "a user"}
            {latestArrival.userRole && ` (${REQUESTER_ROLE_LABEL[latestArrival.userRole] ?? latestArrival.userRole})`}
            {latestArrival.subject ? ` — ${latestArrival.subject}` : ` (${latestArrival.topic})`}
          </p>
        </div>
      )}

      <SupportRequestTable
        supportRequests={supportRequests}
        loading={loading}
        error={error}
        actionError={actionError}
        onUpdateStatus={updateStatus}
        freshIds={freshIds}
        searchInput={pagination.searchInput}
        onSearchChange={pagination.setSearchInput}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        page={pagination.page}
        totalPages={totalPages}
        pageSize={pagination.pageSize}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />
    </div>
  );
}
