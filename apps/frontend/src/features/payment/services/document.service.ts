import { apiClient } from "@/lib/services/api-client";

export interface DocumentDTO {
  id: number;
  booking_id: number;
  document_type_id: number;
  document_type: string;
  file_name: string;
  file_url: string;
  content_type: string;
  method: string;
  created_at: string;
}

export interface CreateDocumentPayload {
  booking_id: number;
  document_type_id: number;
  file_name: string;
  bucket_name: string;
  object_key: string;
  file_url: string;
  content_type?: string;
  method_id: number;
}

export async function getDocumentsByBookingId(bookingId: number): Promise<DocumentDTO[]> {
  return apiClient.get<DocumentDTO[]>(`/bookings/${bookingId}/documents`);
}

export async function getDocumentById(id: number): Promise<DocumentDTO> {
  return apiClient.get<DocumentDTO>(`/documents/${id}`);
}

export async function createDocument(payload: CreateDocumentPayload): Promise<DocumentDTO> {
  return apiClient.post<DocumentDTO>("/documents", payload);
}

export async function deleteDocument(id: number): Promise<void> {
  return apiClient.delete(`/documents/${id}`);
}
