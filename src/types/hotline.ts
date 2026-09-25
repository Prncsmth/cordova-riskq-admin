export type HotlineCategory = "police" | "fire" | "medical" | "maritime";

export const HOTLINE_CATEGORIES: HotlineCategory[] = ["police", "fire", "medical", "maritime"];

export interface Hotline {
  id: string;
  name: string;
  number: string;
  category: HotlineCategory;
}
