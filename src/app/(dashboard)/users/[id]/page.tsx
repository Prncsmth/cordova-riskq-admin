import UserDetails from "@/components/users/UserDetails";

export default async function UserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Details</h1>

      <UserDetails id={id} />
    </div>
  );
}