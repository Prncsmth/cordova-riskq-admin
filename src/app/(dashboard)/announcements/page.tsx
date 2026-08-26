"use client";

import { useState } from "react";
import AnnouncementForm from "@/components/announcements/AnnouncementForm";
import AnnouncementPreview from "@/components/announcements/AnnouncementPreview";
import AnnouncementTable from "@/components/announcements/AnnouncementTable";
import type { AnnouncementAudience, AnnouncementPriority } from "@/types/announcement";

export default function AnnouncementsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState<AnnouncementPriority>("Normal");
  const [audience, setAudience] = useState<AnnouncementAudience>("All Users");

  function handlePublish() {
    // No backend endpoint yet — this just resets the draft so the flow is
    // demonstrable end-to-end once the API is wired up.
    setTitle("");
    setBody("");
    setPriority("Normal");
    setAudience("All Users");
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
          onTitleChange={setTitle}
          onBodyChange={setBody}
          onPriorityChange={setPriority}
          onAudienceChange={setAudience}
          onPublish={handlePublish}
        />

        <AnnouncementPreview title={title} body={body} priority={priority} audience={audience} />
      </div>

      <div>
        <h2 className="px-1 pb-3 text-xs font-bold uppercase tracking-widest text-muted">Recent Announcements</h2>
        <AnnouncementTable />
      </div>
    </div>
  );
}
