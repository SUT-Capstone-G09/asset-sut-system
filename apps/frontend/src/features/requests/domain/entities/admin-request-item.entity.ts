export interface AdminRequestItem {
  id: string;
  type: string;
  title: string;
  asset?: string;
  sender: string;
  location: string;
  status: string;
  date: string;
  email?: string;
}
