import { apiClient } from "./api-client";

// Mirrors maxUploadSize in apps/backend/internal/controllers/upload.go —
// checking here too lets us reject an oversized file the moment it's picked
// instead of only after the whole booking form has been submitted.
export const MAX_UPLOAD_SIZE_MB = 10;

export interface UploadResult {
  bucket_name: string;
  object_key: string;
  url: string;
  file_name: string;
  content_type: string;
  size: number;
  expires_in: number;
}

// Predefined folders — keep names consistent with what MinIO stores
export const UPLOAD_FOLDERS = {
  LOCATION_PICS: process.env.NEXT_PUBLIC_UPLOAD_FOLDER_LOCATIONS || "location-pics",
  PAYMENT_QR: process.env.NEXT_PUBLIC_UPLOAD_FOLDER_PAYMENT || "payment-qr",
  PAYMENT_SLIP: process.env.NEXT_PUBLIC_UPLOAD_FOLDER_PAYMENT_SLIP || "payment-slip",
  PAYMENT_RECEIPT: process.env.NEXT_PUBLIC_UPLOAD_FOLDER_RECEIPT || "payment-receipt",
  BOOKING_DOCS: process.env.NEXT_PUBLIC_UPLOAD_FOLDER_BOOKING || "booking-docs",
} as const;

export type UploadFolder = (typeof UPLOAD_FOLDERS)[keyof typeof UPLOAD_FOLDERS];

/** อัปโหลดไปยัง MinIO หรือ Drive
 * @param bookingDate ISO date string "YYYY-MM-DD" — ใช้จัดกลุ่ม folder ตามเดือนที่จอง
 */
export async function uploadFile(
  file: File,
  folder?: UploadFolder | string,
  bookingDate?: string,
  locationName?: string,
  bookingId?: number,
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  if (folder) formData.append("folder", folder);
  if (bookingDate) formData.append("booking_date", bookingDate);
  if (locationName) formData.append("location_name", locationName);
  if (bookingId) formData.append("booking_id", String(bookingId));
  return apiClient.upload<UploadResult>("/uploads", formData);
}
