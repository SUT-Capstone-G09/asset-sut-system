import { apiClient } from "@/lib/services/api-client";
import type {
  AudienceOptions,
  AudienceSpec,
  BroadcastRecipient,
  BroadcastSummary,
  CreateBroadcastResponse,
  PreviewAudienceResponse,
  Recipient,
  SendBroadcastPayload,
} from "../types";

export const previewAudience = (audience: AudienceSpec) =>
  apiClient.post<PreviewAudienceResponse>("/email/broadcasts/preview", {
    audience,
  });

export const sendBroadcast = (payload: SendBroadcastPayload) =>
  apiClient.post<CreateBroadcastResponse>("/email/broadcasts", payload);

export const listBroadcasts = () =>
  apiClient.get<BroadcastSummary[]>("/email/broadcasts");

export const getBroadcast = (id: number) =>
  apiClient.get<BroadcastSummary>(`/email/broadcasts/${id}`);

// Per-recipient delivery status. Pass a status (e.g. "failed") to narrow down to
// the recipients who did not receive the email.
export const getBroadcastRecipients = (id: number, status?: string) =>
  apiClient.get<BroadcastRecipient[]>(
    `/email/broadcasts/${id}/recipients${status ? `?status=${encodeURIComponent(status)}` : ""}`,
  );

export const getAudienceOptions = () =>
  apiClient.get<AudienceOptions>("/email/audiences/options");

export const searchRecipients = (q: string) =>
  apiClient.get<Recipient[]>(
    `/email/recipients/search?q=${encodeURIComponent(q)}`,
  );

export function extractTemplateVariables(...sources: string[]): string[] {
  const re = /\{\{\s*\.(\w+)\s*\}\}/g;
  const found = new Set<string>();
  for (const src of sources) {
    for (const m of src.matchAll(re)) {
      if (m[1] !== "userName") found.add(m[1]);
    }
  }
  return [...found];
}
