export interface Location {
  id: string;
  name: string;
  description: string;
  coordinates: [number, number]; // [lat, lng]
  address: string;
  image: string;
  category: string;
  building?: string;
  
  // เพิ่มฟิลด์สำหรับ Admin & Management
  status?: "active" | "vacant" | "inactive";
  subStallCount?: number;
  price?: number;
  size?: string;
  roomNumber?: string;
  tenantName?: string;
  contractEndDate?: string;
  contractName?: string;
  citizenId?: string;
  contractNumber?: string;
  occupancyRate?: number; // สำหรับกรณีมีแผงย่อย
}

export interface BaseLocation {
  id: string;
  name: string;
  description: string;
  coordinates: [number, number];
  address: string;
  image: string;
  category: string;
  building?: string;
}

export interface AdminLocation extends BaseLocation {
  status: "active" | "vacant" | "inactive";
  subStallCount?: number;
  price: number;                            
  size: string;                              
  roomNumber: string;                        
  tenantName?: string;
  contractEndDate?: string;
  contractName?: string;
  citizenId?: string;
  contractNumber?: string;
  occupancyRate?: number;
}