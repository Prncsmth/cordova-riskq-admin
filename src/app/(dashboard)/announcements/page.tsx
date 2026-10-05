// src/app/(dashboard)/announcements/page.tsx
"use client";

import { useState } from "react";
import AnnouncementForm from "@/components/announcements/AnnouncementForm";
import AnnouncementPreview from "@/components/announcements/AnnouncementPreview";
import AnnouncementTable from "@/components/announcements/AnnouncementTable";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { usePaginationState } from "@/hooks/usePaginationState";
import type { Announcement, AnnouncementAudience, AnnouncementPriority } from "@/types/announcement";

export default function AnnouncementsPage() {
  const pagination = usePaginationState();
  const [priorityFilter, setPriorityFilter] = useState<"All" | AnnouncementPriority>("All");

  const { announcements, total, loading, error, actionError, create, update, remove } = useAnnouncements(
    pagination,
    priorityFilter,
  );
  const totalPages = Math.max(1, Math.ceil(total / pagination.pageSize));

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState<AnnouncementPriority>("Normal");
  const [audience, setAudience] = useState<AnnouncementAudience>("All Users");
  // Only ever set from an older announcement being edited -- new ones can't
  // target a barangay any more (see AnnouncementForm's audiences).
  const [barangay, setBarangay] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  function handlePriorityFilterChange(value: "All" | AnnouncementPriority) {
    setPriorityFilter(value);
    pagination.resetPage();
  }

  function resetForm() {
    setTitle("");
    setBody("");
    setPriority("Normal");
    setAudience("All Users");
    setBarangay("");
    setEditingId(null);
  }

  function handleEdit(announcement: Announcement) {
    setEditingId(announcement.id);
    setTitle(announcement.title);
    setBody(announcement.content);
    setPriority(announcement.priority);
    setAudience(announcement.audience);
    setBarangay(announcement.barangayName ?? "");
  }

  async function handlePublish() {
    // "All Users" fans out to a real citizen notification per recipient --
    // a double-click/double-submit here would send it twice.
    if (isPublishing) return;
    setIsPublishing(true);
    try {
      const input = {
        title,
        content: body,
        priority,
        audience,
        barangayName: audience === "Specific Barangay" ? barangay : undefined,
      };
      if (editingId) {
        await update(editingId, input);
      } else {
        await create(input);
      }
      resetForm();
    } catch {
      // surfaced via useAnnouncements' actionError state, rendered in the table
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Announcements</h1>

        <p className="text-sm text-muted">
          Publish emergency and system announcements.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr] xl:items-start">
        <AnnouncementForm
          title={title}
          body={body}
          priority={priority}
          audience={audience}
          barangay={barangay}
          onTitleChange={setTitle}
          onBodyChange={setBody}
          onPriorityChange={setPriority}
          onAudienceChange={setAudience}
          onPublish={handlePublish}
          isPublishing={isPublishing}
          editingId={editingId}
          onCancelEdit={resetForm}
        />

        <AnnouncementPreview title={title} body={body} priority={priority} audience={audience} />
      </div>

      <div>
        <h2 className="px-1 pb-3 text-xs font-bold uppercase tracking-widest text-muted">Recent Announcements</h2>
        <AnnouncementTable
          announcements={announcements}
          loading={loading}
          error={error}
          actionError={actionError}
          onEdit={handleEdit}
          onDelete={remove}
          searchInput={pagination.searchInput}
          onSearchChange={pagination.setSearchInput}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={handlePriorityFilterChange}
          page={pagination.page}
          totalPages={totalPages}
          pageSize={pagination.pageSize}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
        />
      </div>
    </div>
  );
}
