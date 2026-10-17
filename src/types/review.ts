export type ReviewStatus = "pending" | "approved" | "rejected";

// A rating + comment sent from the public website's Reviews section.
export interface Review {
  id: string;
  name: string | null;
  rating: number;
  title: string | null;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}
