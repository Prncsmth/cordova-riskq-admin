import UserTable from "@/components/users/UserTable";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>

        <p className="text-sm text-slate-500">
          Manage registered Cordova RISKQ users.
        </p>
      </div>

      <UserTable />
    </div>
  );
}