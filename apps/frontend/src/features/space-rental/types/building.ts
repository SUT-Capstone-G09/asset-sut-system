export interface Building {
  id: number;
  name: string;
  building_type_id?: number;
  building_type_name?: string; // เช่น โรงอาหาร, อาคารเรียนรวม, หอพัก
  coordinates?: [number, number]; // [lat, lng]
  address?: string;
  rental_space_count: number;
  has_floor_plan: boolean;
  floor_plan_image?: string; // พิกัดรูปแปลน static ของอาคาร
  created_at?: string;
  updated_at?: string;
}

