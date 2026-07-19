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
  areaCode?: string;
  tenantName?: string;
  contractEndDate?: string;
  contractName?: string;
  citizenId?: string;
  contractNumber?: string;
  occupancyRate?: number; // อัตราการเข้าเช่า (สำหรับกรณีโรงอาหารที่มีแผงย่อย)
}

// RentalSpaceDTO เป็นโครงสร้างข้อมูลดิบระดับ JSON ที่ส่งมาจาก API หลังบ้าน (ถอดจาก GORM Model ใน Go)
export interface RentalSpaceDTO {
  id: number;
  name: string;
  description?: string;
  size?: string;
  area_code?: string;
  base_price?: number;
  status: "vacant" | "occupied" | "maintenance";
  building_id?: number;
  building?: {
    id: number;
    name: string;
    address: string;
    lat: number;
    lng: number;
    building_type?: {
      name: string;
    }
  };
  images?: Array<{ url: string; is_primary: boolean }>;
  // ข้อมูลจาก Active Contract (ถ้ามี)
  active_contract?: {
    contract_no: string;
    end_date: string;
    business_type?: {
      name: string;
    };
    tenant_profile?: {
      business_name: string;
      national_id: string;
      user?: {
        profile?: {
          first_name: string;
          last_name: string;
        }
      }
    }
  };
}

// mapDTOToRentalSpace แปลงข้อมูลระดับ DTO (Database schema) ให้กลายเป็นโมเดลสำหรับใช้เรนเดอร์ในคอมโพเนนต์หน้าบ้าน
export function mapDTOToRentalSpace(dto: RentalSpaceDTO): RentalSpace {
  const contract = dto.active_contract;
  const tenant = contract?.tenant_profile;
  const contactUser = tenant?.user?.profile;
  const categoriesMap: Record<string, CommercialCategoryType> = {
    "อาหารและเครื่องดื่ม": "food_beverage",
    "ร้านค้าและบริการ": "retail_services",
    "บริการตู้อัตโนมัติ": "automated_services",
    "อินเทอร์เน็ตไร้สาย": "wireless_connectivity",
  };
  const bizTypeName = contract?.business_type?.name || "";
  const mappedCategory = categoriesMap[bizTypeName] || "retail_services";

  return {
    id: String(dto.id),
    name: dto.name,
    description: dto.description || "",
    areaCode: dto.area_code || "",
    size: dto.size || "",
    price: dto.base_price || 0,
    status: dto.status === "vacant" ? "available" : dto.status,
    building: dto.building?.name || "",
    area: dto.building?.building_type?.name || "ทั่วไป",
    address: dto.building?.address || "",
    coordinates: dto.building?.lat != null && dto.building?.lng != null 
      ? [dto.building.lat, dto.building.lng] 
      : undefined,
    image: dto.images?.find(img => img.is_primary)?.url || dto.images?.[0]?.url || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800",
    locationCategory: [mappedCategory],
    
    // ข้อมูลสัญญาเช่าเชิงรุก
    tenantName: tenant?.business_name || "-",
    contractNumber: contract?.contract_no || "",
    contractEndDate: contract?.end_date ? new Date(contract.end_date).toLocaleDateString("th-TH") : "",
    contractName: contactUser ? `${contactUser.first_name} ${contactUser.last_name}`.trim() : "",
    citizenId: tenant?.national_id || "",
  };
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
  areaCode: string;                        
  tenantName?: string;
  contractEndDate?: string;
  contractName?: string;
  citizenId?: string;
  contractNumber?: string;
  occupancyRate?: number;
}
