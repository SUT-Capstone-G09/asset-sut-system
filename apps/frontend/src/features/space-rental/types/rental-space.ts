import { CommercialCategoryType } from '../constants';

// RentalSpace คือโมเดลฝั่งหน้าบ้านที่แสดงผลข้อมูลพื้นที่เช่าพาณิชย์
// (สอดคล้องกับโมเดล RentalSpaces และ RentalSpaceResponse ของ API หลังบ้าน)
export interface RentalSpace {
  id: string;
  name: string;
  description: string;
  image: string;
  area: string;      // ชื่อพื้นที่หลัก/โซนหลัก (เช่น โรงอาหาร, หอพักนักศึกษา)
  building?: string; // ชื่ออาคาร/สถานที่ย่อย (เช่น โรงอาหารกาสะลองคำ, หอพักสุรนิเวศ 1)
  // สำหรับ backward-compat — source of truth ย้ายไปอยู่ที่ Building แล้ว
  address?: string;
  coordinates?: [number, number]; // [lat, lng]
  locationCategory?: CommercialCategoryType[];
  
  // ฟิลด์ส่วนขยายสำหรับงานระบบ Admin & Management
  status?: "available" | "occupied" | "maintenance"; // ปรับสถานะตาม DTO ของหลังบ้าน
  subStallCount?: number;
  price?: number;
  size?: string;
  roomNumber?: string;
  tenantName?: string;
  contractEndDate?: string;
  contractName?: string;
  citizenId?: string;
  contractNumber?: string;
  occupancyRate?: number; // อัตราการเข้าเช่า (สำหรับกรณีโรงอาหารที่มีแผงย่อย)
}

export interface BaseRentalSpace {
  id: string;
  name: string;
  description: string;
  image: string;
  area: string;
  building?: string;
  address?: string;
  coordinates?: [number, number];
  locationCategory?: CommercialCategoryType[];
}

export interface AdminRentalSpace extends BaseRentalSpace {
  status: "available" | "occupied" | "maintenance";
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
