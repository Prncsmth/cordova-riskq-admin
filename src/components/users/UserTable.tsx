import Badge from "@/components/ui/Badge";
import Link from "next/link";

const users = [
  {
    id: "USR-001",
    name: "John Doe",
    email: "john@example.com",
    status: "Active",
  },
  {
    id: "USR-002",
    name: "Jane Doe",
    email: "jane@example.com",
    status: "Suspended",
  },
];

export default function UserTable() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">User</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Email</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Status</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-900">{user.name}</td>
                <td className="p-4 text-slate-700">{user.email}</td>
                <td className="p-4">
                  <Badge
                    variant={
                      user.status === "Active"
                        ? "success"
                        : "danger"
                    }
                  >
                    {user.status}
                  </Badge>
                </td>
                <td className="p-4">
                  <Link
                    href={`/users/${user.id}`}
                    className="font-medium text-red-700 hover:text-red-900"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
