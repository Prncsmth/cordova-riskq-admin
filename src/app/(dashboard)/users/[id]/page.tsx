import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import UserDetails from "@/components/users/UserDetails";

export default async function UserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/users"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-primary"
        >
          <ChevronLeft size={15} />
          Back to Users
        </Link>

        <h1 className="mt-2 text-2xl font-bold text-foreground">User Details</h1>
      </div>

      <UserDetails id={id} />
    </div>
  );
}
