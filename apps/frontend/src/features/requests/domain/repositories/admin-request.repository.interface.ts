import { AdminRequestItem } from "../entities/admin-request-item.entity";

export interface IAdminRequestRepository {
  getAdminRequests(): Promise<AdminRequestItem[]>;
}
