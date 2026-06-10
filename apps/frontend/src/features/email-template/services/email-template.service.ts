import { apiClient } from "@/lib/services/api-client";
import type {
  EmailTemplate,
  CreateEmailTemplatePayload,
  UpdateEmailTemplatePayload,
} from "../types";

export const getEmailTemplates = () =>
  apiClient.get<EmailTemplate[]>("/email/templates");

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
