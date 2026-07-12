export interface RequestType {
  id: number;
  name: string;
  description?: string;
}

export interface CreateRequestInput {
  title: string;
  description: string;
  location: string;
  request_type_id: number;
  contact_info: string;
  incident_date?: string | null;
  evidence_urls?: string[];
}

export interface RequestEntity {
  id: number;
  refcode: string;
  title: string;
  description: string;
  location: string;
  request_type_id: number;
  status_id: number;
  contact_info: string;
  incident_date?: string | null;
  evidence_urls?: string[];
  user_id: number;
  created_at: string;
}
