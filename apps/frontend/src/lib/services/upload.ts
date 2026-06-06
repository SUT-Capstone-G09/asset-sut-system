import { apiClient } from "./api-client";

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const result = await apiClient.upload<{ url: string }>("/upload", formData);
  return result.url;
}
