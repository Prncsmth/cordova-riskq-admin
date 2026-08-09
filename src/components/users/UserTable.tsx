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
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-background">
            <tr>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted">User</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted">Email</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted">Status</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-background">
                <td className="p-4 font-medium text-foreground">{user.name}</td>
                <td className="p-4 text-foreground">{user.email}</td>
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
                    className="font-medium text-primary hover:text-primary-dark"
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
