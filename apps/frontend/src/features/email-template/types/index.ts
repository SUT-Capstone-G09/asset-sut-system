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

// ── Broadcast (bulk send) ─────────────────────────────
export type AudienceType = "all" | "roles" | "requester_types" | "users";

export interface AudienceSpec {
  type: AudienceType;
  roles?: string[];
  requester_type_ids?: number[];
  user_ids?: number[];
}

export interface SendBroadcastPayload {
  template_key: string;
  audience: AudienceSpec;
  data?: Record<string, string>;
}

export interface Recipient {
  user_id: number;
  email: string;
  name: string;
}

export interface PreviewAudienceResponse {
  count: number;
  sample: Recipient[];
}

export interface CreateBroadcastResponse {
  broadcast_id: number;
  total_recipients: number;
}

export interface BroadcastCounts {
  pending: number;
  sending: number;
  sent: number;
  failed: number;
}

export interface BroadcastSummary {
  id: number;
  template_key: string;
  audience_type: AudienceType;
  audience_desc: string;
  total_recipients: number;
  created_at: string;
  counts: BroadcastCounts;
}

export interface RequesterTypeOption {
  id: number;
  type: string;
}

export interface AudienceOptions {
  roles: string[];
  requester_types: RequesterTypeOption[];
}
