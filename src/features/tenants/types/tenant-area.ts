import { type LucideIcon } from "lucide-react";

export interface TenantAreaOption {
  id: string;
  name: string;
  icon: LucideIcon;
  subLocations: string[];
  businessTypes: string[];
  tenantCount: number;
}
