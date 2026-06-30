export interface Location {
  id: string;
  name: string;
  zoneId: string; // maps to tenantAreaOptions id
}

export interface Tenant {
  id: string;
  name: string;
  locationId: string;
  contractNo: string;
  currentPeriod: string;
  outstandingAmount: number;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
  shortName: string; // e.g. "BK", "SF"
}
