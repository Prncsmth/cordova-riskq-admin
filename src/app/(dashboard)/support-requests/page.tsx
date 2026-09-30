// src/app/(dashboard)/support-requests/page.tsx
"use client";

import { useState } from "react";
import SupportRequestTable from "@/components/support-requests/SupportRequestTable";
import { usePaginationState } from "@/hooks/usePaginationState";
import { useSupportRequests } from "@/hooks/useSupportRequests";
import type { SupportRequestStatus } from "@/types/support-request";

export default function SupportRequestsPage() {
  const pagination = usePaginationState();
  const [statusFilter, setStatusFilter] = useState<"All" | SupportRequestStatus>("All");

  const { supportRequests, total, openCount, loading, error, actionError, updateStatus } =
    useSupportRequests(pagination, statusFilter);
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
          Messages sent from the mobile app&apos;s Contact Support form.
          {openCount > 0 ? ` ${openCount} open.` : " Nothing open right now."}
        </p>
      </div>

      <SupportRequestTable
        supportRequests={supportRequests}
        loading={loading}
        error={error}
        actionError={actionError}
        onUpdateStatus={updateStatus}
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
