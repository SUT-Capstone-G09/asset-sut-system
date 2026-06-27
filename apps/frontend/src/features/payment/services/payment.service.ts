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
