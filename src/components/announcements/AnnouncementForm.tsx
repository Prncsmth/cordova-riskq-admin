import { Megaphone } from "lucide-react";
import Card from "@/components/ui/Card";
import { CORDOVA_BARANGAY_NAMES } from "@/constants/barangays";
import type { AnnouncementAudience, AnnouncementPriority } from "@/types/announcement";

const priorities: AnnouncementPriority[] = ["Normal", "Urgent"];
const audiences: AnnouncementAudience[] = ["All Users", "Responders Only", "Specific Barangay"];

type AnnouncementFormProps = {
  title: string;
  body: string;
  priority: AnnouncementPriority;
  audience: AnnouncementAudience;
  barangay: string;
  onTitleChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onPriorityChange: (value: AnnouncementPriority) => void;
  onAudienceChange: (value: AnnouncementAudience) => void;
  onBarangayChange: (value: string) => void;
  onPublish: () => void;
  isPublishing: boolean;
};

export default function AnnouncementForm({
  title,
  body,
  priority,
  audience,
  barangay,
  onTitleChange,
  onBodyChange,
  onPriorityChange,
  onAudienceChange,
  onBarangayChange,
  onPublish,
  isPublishing,
}: AnnouncementFormProps) {
  return (
    <Card>
      <div className="flex items-center gap-2.5">
        <Megaphone size={18} className="shrink-0 text-primary" />
        <h2 className="font-semibold text-foreground">Create Announcement</h2>
      </div>

      <form
        className="mt-5 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onPublish();
        }}
      >
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-tertiary">Title</label>
          <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Announcement title"
            className="w-full rounded-xl border border-border bg-surface p-3 text-sm shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-tertiary">Message</label>
          <textarea
            value={body}
            onChange={(e) => onBodyChange(e.target.value)}
            placeholder="Write announcement..."
            rows={5}
            className="w-full rounded-xl border border-border bg-surface p-3 text-sm shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-tertiary">Priority</label>
            <div className="flex gap-1.5">
              {priorities.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPriorityChange(p)}
                  className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-150 active:scale-[0.97] ${
                    priority === p
                      ? p === "Urgent"
                        ? "bg-danger text-white shadow-xs"
                        : "bg-primary text-white shadow-xs"
                      : "border border-border bg-surface text-muted hover:bg-primary-light/30"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-tertiary">Audience</label>
            <select
              value={audience}
              onChange={(e) => onAudienceChange(e.target.value as AnnouncementAudience)}
              className="w-full rounded-xl border border-border bg-surface p-2.5 text-sm shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
            >
              {audiences.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        {audience === "Specific Barangay" && (
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-tertiary">Barangay</label>
            <select
              value={barangay}
              onChange={(e) => onBarangayChange(e.target.value)}
              required
              className="w-full rounded-xl border border-border bg-surface p-2.5 text-sm shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
            >
              <option value="" disabled>
                Select a barangay
              </option>
              {CORDOVA_BARANGAY_NAMES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={isPublishing}
          className="w-full rounded-xl bg-primary px-5 py-3 font-semibold text-white shadow-xs transition-all duration-150 hover:bg-primary-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isPublishing ? "Publishing…" : "Publish Announcement"}
        </button>
      </form>
    </Card>
  );
}
