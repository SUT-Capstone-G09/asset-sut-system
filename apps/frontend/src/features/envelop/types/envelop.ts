export type DocumentStatus =
  | "draft"
  | "on_sale"
  | "unavailable"
  | "archived";

export interface EnvelopAttachment {
  id: string;
  name: string;
  sizeBytes: number;
  url: string;
}

export interface EnvelopDocument {
  id: string;
  name: string;
  location: string;
  amount: number;
  documentStatus: DocumentStatus;
  date: string; // e.g. "12/05/2568"
  attachments?: EnvelopAttachment[];
}

export type PaymentStatus =
  | "pending_payment"
  | "payment_submitted"
  | "paid"
  | "rejected"
  | "cancelled"
  | "expired";

export interface EnvelopPayment {
  id: string;
  ref: string;
  tenantName: string;
  location: string;
  amount: number;
  date: string;
  status: PaymentStatus;
  slipUrl?: string;
  receiptUrl?: string;
  rejectionReason?: string;
  paidAt?: string;
}
