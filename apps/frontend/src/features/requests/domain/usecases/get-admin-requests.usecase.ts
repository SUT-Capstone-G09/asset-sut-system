import { IAdminRequestRepository } from "../repositories/admin-request.repository.interface";
import { AdminRequestItem } from "../entities/admin-request-item.entity";

export class GetAdminRequestsUseCase {
  constructor(private repository: IAdminRequestRepository) {}

  async execute(): Promise<AdminRequestItem[]> {
    return this.repository.getAdminRequests();
  }
}
