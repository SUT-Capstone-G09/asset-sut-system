import { IDashboardRepository } from "../repositories/dashboard.repository.interface";
import { DashboardItem } from "../entities/dashboard-item.entity";

export class GetDashboardItemsUseCase {
  constructor(private repository: IDashboardRepository) {}

  async execute(): Promise<DashboardItem[]> {
    return this.repository.getDashboardItems();
  }
}
