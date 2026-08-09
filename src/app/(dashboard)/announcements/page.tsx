import Card from "@/components/ui/Card";

export default function AnnouncementsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Announcements</h1>

        <p className="text-sm text-muted">
          Publish emergency and system announcements.
        </p>
      </div>

      <Card>
        <h2 className="font-semibold text-foreground">
          Create Announcement
        </h2>

        <form className="mt-5 space-y-4">
          <input
            placeholder="Announcement title"
            className="w-full rounded-lg border border-border p-3 outline-none focus:border-primary"
          />

          <textarea
            placeholder="Write announcement..."
            rows={5}
            className="w-full rounded-lg border border-border p-3 outline-none focus:border-primary"
          />

          <button className="rounded-lg bg-primary px-5 py-3 font-semibold text-white transition hover:bg-primary-dark">
            Publish Announcement
          </button>
        </form>
      </Card>
    </div>
  );
}
