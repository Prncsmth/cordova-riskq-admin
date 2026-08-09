export type ResourceStatus = "Available" | "In Use" | "Maintenance";

export interface Resource {
  id: string;
  name: string;
  category: string;
  quantity: number;
  status: ResourceStatus;
  location: string;
}
