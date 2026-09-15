export type EvacuationCenterCategory = "school" | "evacuation_center";
export type EvacuationCenterStatus = "open" | "full";

export const KNOWN_FACILITIES = ["Water", "Power", "Medical Aid", "Restrooms"] as const;

export interface EvacuationCenter {
  id: string;
  name: string;
  address: string;
  category: EvacuationCenterCategory;
  facilities: string[];
  latitude: number;
  longitude: number;
  status: EvacuationCenterStatus;
}
