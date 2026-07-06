export type ContractStatus = "active" | "expiring" | "expired" | "terminated";

export interface ContractItem {
  id: string;
  contractNumber: string;
  startDate: string;
  endDate: string;
  monthlyRental: number;
  deposit: number;
  scholarship: number;
  terms?: string;
  note?: string;
  status: ContractStatus;
  tenantId: string;
  tenantName: string;
  shopName: string;
  businessType: string;
  subLocation: string;
  areaId: string;
  areaName: string;
  pdfUrl?: string;
}
