import { apiClient } from "./api-client";

export interface SignatureResult {
  url: string;
  updated_at: string;
}

export async function getSavedSignature(): Promise<SignatureResult | null> {
  try {
    return await apiClient.get<SignatureResult>("/me/signature");
  } catch {
    return null; // no saved signature yet
  }
}

export async function saveSignature(file: File): Promise<SignatureResult> {
  const formData = new FormData();
  formData.append("file", file);
  return apiClient.upload<SignatureResult>("/me/signature", formData);
}

export async function deleteSavedSignature(): Promise<void> {
  await apiClient.delete("/me/signature");
}
