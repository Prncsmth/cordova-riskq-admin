// src/app/(dashboard)/announcements/page.tsx
"use client";

import { useState } from "react";
import AnnouncementForm from "@/components/announcements/AnnouncementForm";
import AnnouncementPreview from "@/components/announcements/AnnouncementPreview";
import AnnouncementTable from "@/components/announcements/AnnouncementTable";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import type { AnnouncementAudience, AnnouncementPriority } from "@/types/announcement";

export default function AnnouncementsPage() {
  const { announcements, loading, error, actionError, create, remove } = useAnnouncements();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState<AnnouncementPriority>("Normal");
  const [audience, setAudience] = useState<AnnouncementAudience>("All Users");
  const [barangay, setBarangay] = useState("");

  async function handlePublish() {
    try {
      await create({
        title,
        content: body,
        priority,
        audience,
        barangayName: audience === "Specific Barangay" ? barangay : undefined,
      });
      setTitle("");
      setBody("");
      setPriority("Normal");
      setAudience("All Users");
      setBarangay("");
    } catch {
      // surfaced via useAnnouncements' actionError state, rendered in the table
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
          onBarangayChange={setBarangay}
          onPublish={handlePublish}
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
          onDelete={remove}
        />
      </div>
    </div>
  );
}
