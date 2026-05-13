export interface Location {
  id: string;
  name: string;
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
