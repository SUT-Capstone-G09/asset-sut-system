export interface DashboardItem {
  id: string;
  type: 'requests' | 'inquiries';
  category: string;
  date: string;
  location: string;
  detail: string;
  status: string;
  statusLabel: string;
  statusClass: string;
  subject?: string;
}
