export interface EmailTemplate {
  id: number;
  key: string;
  name: string;
  subject: string;
  project_data: string;
  compiled_html: string;
  is_active: boolean;
}

export interface CreateEmailTemplatePayload {
  key: string;
  name: string;
  subject: string;
  project_data: string;
  compiled_html: string;
  is_active?: boolean;
}

export interface UpdateEmailTemplatePayload {
  name?: string;
  subject?: string;
  project_data?: string;
  compiled_html?: string;
  is_active?: boolean;
}
