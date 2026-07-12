import { DashboardItem } from "../entities/dashboard-item.entity";

export interface IDashboardRepository {
  getDashboardItems(): Promise<DashboardItem[]>;
}
