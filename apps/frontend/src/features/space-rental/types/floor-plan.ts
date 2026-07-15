import { CommercialCategoryType } from '../constants';

export interface MapElement {
  id: string; // เช่น "101"
  name: string; // เช่น "Fashion Store"
  type: 'area' | 'wall';
  areaType?: 'shop' | 'toilet' | 'seating' | 'other';
  customAreaType?: string;
  status: 'open' | 'reserved' | 'occupied' | 'maintenance' | 'unavailable';
  x: number; // พิกเซลในตารางพิกัด
  y: number; // พิกเซลในตารางพิกัด
  width: number; // ความกว้าง (พิกเซล)
  height: number; // ความสูง (พิกเซล)
  rotation: number; // องศา (0-360)
  layerId: string; // เช่น "shops", "toilet", "areas"
  zone: string; // เช่น "Dining Zone"
  tenant?: string;
  description?: string;
  tags?: string[];
  fillColor?: string;
  strokeColor?: string;
  locked?: boolean;
  visible?: boolean;
  label?: string;
}

export interface MapLayer {
  id: string; // เช่น "shops", "toilet"
  name: string; // เช่น "ร้านค้า", "ห้องน้ำ"
  visible: boolean;
  locked: boolean;
  color: string; // สีแสดงเลเยอร์ในแถบควบคุม
}

export type CanvasMode = 'select' | 'area' | 'wall';

// เพื่อความเข้ากันได้ย้อนหลังกับ Viewer/Card
export type StallStatus = MapElement['status'];
export type FloorPlanStall = MapElement;

export interface FloorPlanData {
  id: string;
  locationId: string;       // ผูกกับ Location ID (เช่น "1" = โรงอาหารพราวแสดทอง)
  name: string;
  elements: MapElement[];
  layers: MapLayer[];
  updatedAt: string;
}
