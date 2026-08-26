import { Pencil } from "lucide-react";
import Card from "@/components/ui/Card";

export default function AdminProfile() {
  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-primary/8 blur-3xl" />

      <div className="relative flex items-center gap-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-linear-to-b from-primary to-primary-dark text-xl font-bold text-white shadow-sm ring-1 ring-primary/10">
          AU
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold text-foreground">Admin User</p>
          <p className="text-sm text-muted">admin@cordovariskq.gov.ph</p>

          <span className="mt-2 inline-flex items-center rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/15">
            Super Admin
          </span>
        </div>

        <button
          type="button"
          className="flex items-center gap-1.5 rounded-xl border border-border bg-white px-3.5 py-2 text-sm font-medium text-foreground shadow-xs transition-all duration-150 hover:border-primary/40 hover:bg-primary-light/30 active:scale-[0.97]"
        >
          <Pencil size={14} />
          Edit Profile
        </button>
      </div>
    </Card>
  );
}
