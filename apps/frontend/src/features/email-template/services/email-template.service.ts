import { apiClient } from "@/lib/services/api-client";
import type {
  EmailTemplate,
  CreateEmailTemplatePayload,
  UpdateEmailTemplatePayload,
} from "../types";

// Optional q searches name/key/subject server-side (see GET /email/templates?q=).
export const getEmailTemplates = (q?: string) => {
  const query = q?.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
  return apiClient.get<EmailTemplate[]>(`/email/templates${query}`);
};

export const getEmailTemplate = (id: number) =>
  apiClient.get<EmailTemplate>(`/email/templates/${id}`);

export const createEmailTemplate = (payload: CreateEmailTemplatePayload) =>
  apiClient.post<EmailTemplate>("/email/templates", payload);

export const updateEmailTemplate = (
  id: number,
  payload: UpdateEmailTemplatePayload,
) => apiClient.put<EmailTemplate>(`/email/templates/${id}`, payload);

export const deleteEmailTemplate = (id: number) =>
  apiClient.delete<void>(`/email/templates/${id}`);
