import { apiClient, ApiError } from "./api-client";

export interface SignatureResult {
  url: string;
  updated_at: string;
}

export async function getSavedSignature(): Promise<SignatureResult | null> {
  try {
    return await apiClient.get<SignatureResult>("/me/signature");
  } catch (err) {
    // 404 = genuinely no signature saved yet, not an error.
    // Anything else (network blip, 5xx, expired session) should surface
    // to the caller instead of silently looking like "no signature".
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
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
