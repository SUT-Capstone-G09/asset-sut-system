export interface Building {
  id: number;
  name: string;
  description?: string;
  building_type_id?: number;
  building_type_name?: string; // เช่น โรงอาหาร, อาคารเรียนรวม, หอพัก
  coordinates?: [number, number]; // [lat, lng]
  address?: string;
  floor_count?: number;
  rental_space_count: number;
  has_floor_plan: boolean;
  blueprint_url?: string; // พิกัดรูปแปลนพิมพ์เขียวอาคาร (ซิงก์ตรงกับ Go backend)
  created_at?: string;
  updated_at?: string;
}

