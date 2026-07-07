import { apiClient } from "@/lib/services/api-client";

export interface InvoiceDTO {
  id: number;
  booking_id: number;
  status: string;
  status_id: number;
  total_amount: number;
  created_at: string;
}

export interface CreatePaymentPayload {
  invoice_id: number;
  amount_paid: number;
  method_id: number;
}

export interface VerifyPaymentPayload {
  status_id: number;
  note?: string;
}

export interface PaymentTransactionDTO {
  id: number;
  invoice_id: number;
  booking_id: number;
  user_name: string;
  location_name: string;
  amount_paid: number;
  method: string;
  status: string;
  status_id: number;
  slip_document_id?: number;
  verify_by?: number;
  verifier_name: string;
  paid_at?: string;
  created_at: string;
}

export async function getInvoiceByBookingId(bookingId: number): Promise<InvoiceDTO> {
  return apiClient.get<InvoiceDTO>(`/bookings/${bookingId}/invoice`);
}

export async function getTransactionsByInvoiceId(invoiceId: number): Promise<PaymentTransactionDTO[]> {
  return apiClient.get<PaymentTransactionDTO[]>(`/invoices/${invoiceId}/transactions`);
}

export async function createPayment(payload: CreatePaymentPayload): Promise<PaymentTransactionDTO> {
  return apiClient.post<PaymentTransactionDTO>("/payments", payload);
}

export async function verifyPayment(
  transactionId: number,
  payload: VerifyPaymentPayload
): Promise<PaymentTransactionDTO> {
  return apiClient.post<PaymentTransactionDTO>(`/payments/${transactionId}/verify`, payload);
}

export async function attachSlip(transactionId: number, documentId: number): Promise<void> {
  return apiClient.put(`/payments/${transactionId}/slip/${documentId}`);
}

export async function getAllPayments(): Promise<PaymentTransactionDTO[]> {
  return apiClient.get<PaymentTransactionDTO[]>("/payments");
}

export interface PaymentStatusDTO {
  id: number;
  status: string;
}

// The seeded status list (and therefore each status's ID) can change over
// time — look statuses up by name instead of hardcoding IDs in callers.
export async function getPaymentStatuses(): Promise<PaymentStatusDTO[]> {
  return apiClient.get<PaymentStatusDTO[]>("/payments/statuses");
}

// ── QR generation ──────────────────────────────────────────────────────────

export type QRMode = "promptpay" | "biller";

export interface GenerateQRResponse {
  booking_id: number;
  amount: number;
  payload: string;
  qr_code_url: string;
  expires_in: number;
}

export async function generateQR(
  bookingId: number,
  mode: QRMode = "biller"
): Promise<GenerateQRResponse> {
  return apiClient.post<GenerateQRResponse>("/payments/qr", {
    booking_id: bookingId,
    mode,
  });
}

// ── Slip verification (EasySlip) ───────────────────────────────────────────

export interface VerifySlipResponse {
  transaction_id: number;
  status: "auto_verified" | "mismatch";
  trans_ref: string;
  ref1: string;
  amount: number;
  match_amount: boolean;
  match_ref: boolean;
  receiver_matched: boolean;
  receiver_flag: boolean;
  reasons?: string[];
}

export async function verifySlip(
  bookingId: number,
  documentId: number
): Promise<VerifySlipResponse> {
  return apiClient.post<VerifySlipResponse>("/payments/verify-slip", {
    booking_id: bookingId,
    document_id: documentId,
  });
}
