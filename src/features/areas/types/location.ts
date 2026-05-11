export interface Location {
  id: string;
  name: string;
  description: string;
  coordinates: [number, number]; // [lat, lng]
  address: string;
  image: string;
  category: string;
  
  // เพิ่มฟิลด์สำหรับ Admin & Management
  status?: "active" | "vacant" | "inactive";
  subStallCount?: number;
  price?: number;
  size?: string;
  roomNumber?: string;
  tenantName?: string;
  contractEndDate?: string;
  occupancyRate?: number; // สำหรับกรณีมีแผงย่อย
}
