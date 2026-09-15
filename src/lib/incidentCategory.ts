import type { EmergencyType } from "@/types/emergency";

const CATEGORY_TO_TYPE: Record<string, EmergencyType> = {
  medical: "Medical",
  fire: "Fire",
  "road-accident": "Accident",
  flood: "Disaster",
  sos: "Other",
  other: "Other",
};

export function categoryToEmergencyType(category: string): EmergencyType {
  return CATEGORY_TO_TYPE[category] ?? "Other";
}
