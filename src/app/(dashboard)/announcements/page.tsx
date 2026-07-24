import Card from "@/components/ui/Card";

export default function AnnouncementsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Announcements</h1>

        <p className="text-sm text-slate-500">
          Publish emergency and system announcements.
        </p>
      </div>

      <Card>
        <h2 className="font-semibold">
          Create Announcement
        </h2>

        <form className="mt-5 space-y-4">
          <input
            placeholder="Announcement title"
            className="w-full rounded-lg border p-3"
          />

          <textarea
            placeholder="Write announcement..."
            rows={5}
            className="w-full rounded-lg border p-3"
          />

          <button className="rounded-lg bg-red-800 px-5 py-3 font-semibold text-white">
            Publish Announcement
          </button>
        </form>
      </Card>
    </div>
  );
}