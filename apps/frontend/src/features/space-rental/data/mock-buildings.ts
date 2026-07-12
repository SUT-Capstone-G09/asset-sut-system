import { Building } from "../types/building";

export interface BuildingType {
  id: number;
  name: string;
}

// ข้อมูลประเภทอาคารจำลอง
export const mockBuildingTypes: BuildingType[] = [
  { id: 101, name: "โรงอาหาร" },
  { id: 102, name: "อาคารเรียนรวม" },
  { id: 103, name: "หอพักนักศึกษา" },
  { id: 104, name: "อาคารเครื่องมือ" },
];

// ข้อมูลตึกจำลอง สอดคล้องกับโมเดล Buildings และ BuildingResponse DTO
export const mockBuildings: Building[] = [
  {
    id: 1,
    name: "โรงอาหารพราวแสดทอง",
    building_type_id: 101,
    building_type_name: "โรงอาหาร",
    address: "มหาวิทยาลัยเทคโนโลยีสุรนารี",
    coordinates: [14.8804616, 102.0161729],
    rental_space_count: 8,
    has_floor_plan: true,
    floor_plan_image: "/floor_plan_mockup.png",
  },
  {
    id: 2,
    name: "โรงอาหารกาสะลองคำ",
    building_type_id: 101,
    building_type_name: "โรงอาหาร",
    address: "มหาวิทยาลัยเทคโนโลยีสุรนารี",
    coordinates: [14.8968604, 102.0130207],
    rental_space_count: 8,
    has_floor_plan: true,
  },
  {
    id: 3,
    name: "โรงอาหารคอนตะวัน",
    building_type_id: 101,
    building_type_name: "โรงอาหาร",
    address: "มหาวิทยาลัยเทคโนโลยีสุรนารี",
    coordinates: [14.8913538, 102.0177823],
    rental_space_count: 8,
    has_floor_plan: true,
  },
  {
    id: 4,
    name: "โรงอาหารครัวท่านท้าว",
    building_type_id: 101,
    building_type_name: "โรงอาหาร",
    address: "มหาวิทยาลัยเทคโนโลยีสุรนารี",
    coordinates: [14.8769302, 102.0176714],
    rental_space_count: 8,
    has_floor_plan: true,
  },
  {
    id: 5,
    name: "โรงอาหารเด่นทองกวาว",
    building_type_id: 101,
    building_type_name: "โรงอาหาร",
    address: "มหาวิทยาลัยเทคโนโลยีสุรนารี",
    coordinates: [14.8788526, 102.0199821],
    rental_space_count: 8,
    has_floor_plan: true,
  },
  {
    id: 6,
    name: "โรงอาหารเรียนรวม2",
    building_type_id: 101,
    building_type_name: "โรงอาหาร",
    address: "มหาวิทยาลัยเทคโนโลยีสุรนารี",
    coordinates: [14.881058, 102.015958],
    rental_space_count: 8,
    has_floor_plan: true,
  },
  {
    id: 7,
    name: "อาคารเรียนรวม 1",
    building_type_id: 102,
    building_type_name: "อาคารเรียนรวม",
    address: "มหาวิทยาลัยเทคโนโลยีสุรนารี",
    coordinates: [14.8821983, 102.0159421],
    rental_space_count: 1,
    has_floor_plan: false,
  },
  {
    id: 8,
    name: "สุรพัฒน์ 2",
    building_type_id: undefined,
    building_type_name: undefined,
    address: "มหาวิทยาลัยเทคโนโลยีสุรนารี",
    rental_space_count: 1,
    has_floor_plan: false,
  },
];


