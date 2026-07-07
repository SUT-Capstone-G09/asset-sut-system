import { IRequestRepository } from "../../domain/repositories/request.repository.interface";
import { CreateRequestInput, RequestEntity, RequestType } from "../../domain/entities/request.entity";
import { apiClient } from "@/lib/services/api-client";

export class RequestRepository implements IRequestRepository {
  async createRequest(input: CreateRequestInput): Promise<RequestEntity> {
    try {
      const response = await apiClient.post<RequestEntity>("/requests", input);
      return response;
    } catch (error) {
      console.warn("Backend API error, falling back to mock response:", error);
      // Fallback for demo when backend route is not ready or fails
      return {
        id: Math.floor(Math.random() * 1000) + 1,
        refcode: `REQ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`,
        title: input.title,
        description: input.description,
        location: input.location,
        request_type_id: input.request_type_id,
        status_id: 1, // Pending/Draft
        contact_info: input.contact_info,
        incident_date: input.incident_date,
        evidence_urls: input.evidence_urls,
        user_id: 1,
        created_at: new Date().toISOString(),
      };
    }
  }

  async getRequestTypes(): Promise<RequestType[]> {
    try {
      const response = await apiClient.get<RequestType[]>("/request-types");
      return response;
    } catch (error) {
      console.warn("Backend request types API error, falling back to default request types:", error);
      // Fallback for default request types
      return [
        { id: 1, name: "แจ้งซ่อมครุภัณฑ์", description: "แจ้งซ่อมแซมครุภัณฑ์และอุปกรณ์ต่างๆ" },
        { id: 2, name: "แจ้งปัญหาการใช้งานพื้นที่", description: "แจ้งปัญหาเกี่ยวกับพื้นที่ อาคาร หรือสิ่งอำนวยความสะดวก" },
      ];
    }
  }

  async getRequestDetail(refcode: string): Promise<any> {
    try {
      return await apiClient.get<any>(`/requests/${refcode}`);
    } catch (error) {
      console.warn("Backend API error fetching request detail, throwing error:", error);
      throw error;
    }
  }
}
