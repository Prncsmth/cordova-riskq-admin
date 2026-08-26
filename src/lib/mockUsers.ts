import type { User } from "@/types/user";

// Mock data for UI — replace with real API data once backend endpoints are
// available. Shared between UserTable (the list) and UserDetails (the
// detail view) so clicking into a user actually shows that user's record.
export const MOCK_USERS: User[] = [
  { id: "USR-001", name: "John Doe", email: "john@example.com", phone: "09171234567", role: "citizen", createdAt: "2 days ago" },
  { id: "USR-002", name: "Jane Doe", email: "jane@example.com", phone: "09281234567", role: "responder", createdAt: "1 week ago" },
  { id: "USR-003", name: "Mark Villanueva", email: "mark.v@example.com", phone: "09391234567", role: "citizen", createdAt: "3 days ago" },
  { id: "USR-004", name: "Liza Fernandez", email: "liza.f@example.com", phone: "09451234567", role: "citizen", createdAt: "5 hr ago" },
  { id: "USR-005", name: "Carlo Bautista", email: "carlo.b@example.com", phone: "09561234567", role: "responder", createdAt: "2 weeks ago" },
];
