import { apiClient } from "./api-client";

export interface UploadResult {
  object_key: string;
  url: string;
  file_name: string;
  content_type: string;
  size: number;
  expires_in: number;
}

export async function uploadFile(file: File, folder?: string): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  if (folder) formData.append("folder", folder);
  return apiClient.upload<UploadResult>("/uploads", formData);
}
