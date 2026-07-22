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

export interface DocumentTypeDTO {
  id: number;
  type: string;
}

// Cached for the page session — the list is effectively static seed data,
// no need to re-fetch it on every document upload.
let cachedDocumentTypes: DocumentTypeDTO[] | null = null;

export async function getDocumentTypes(): Promise<DocumentTypeDTO[]> {
  if (!cachedDocumentTypes) {
    cachedDocumentTypes = await apiClient.get<DocumentTypeDTO[]>("/document-types");
  }
  return cachedDocumentTypes;
}

// Resolves a document_type_id by name (e.g. "booking_form") instead of
// hardcoding the numeric id, which would silently break if the seed order
// ever changed. Falls back to "other", then to 4 (the seeded id for "other"
// at the time of writing) if even the lookup itself fails.
export async function getDocumentTypeId(typeName: string): Promise<number> {
  const types = await getDocumentTypes().catch(() => []);
  return (
    types.find((t) => t.type === typeName)?.id ??
    types.find((t) => t.type === "other")?.id ??
    4
  );
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
