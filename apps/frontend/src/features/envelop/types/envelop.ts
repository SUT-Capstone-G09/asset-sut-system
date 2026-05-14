export type DocumentStatus = "พร้อมใช้งาน" | "ใช้งานอยู่" | "หมดอายุ";

export interface EnvelopDocument {
  id: string;
  name: string;
  location: string;
  documentStatus: DocumentStatus;
  date: string; // e.g. "12/05/2568"
}

export type PaymentStatus = "รอชำระ" | "รอตรวจสอบ" | "จ่ายแล้ว" | "ปฏิเสธ";

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
