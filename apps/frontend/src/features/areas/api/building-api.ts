import { mockBuildings } from "../data/mock-buildings";
import { Building } from "../types/building";

// จำลองการเรียก API ตึกเชิงพาณิชย์ (เมื่อ backend พร้อม ค่อยเปลี่ยนโค้ดด้านในเป็น fetch/axios)
export const buildingApi = {
  // ดึงรายการตึกทั้งหมด
  getAll: async (): Promise<Building[]> => {
    // จำลองดีเลย์ 800ms
    await new Promise((resolve) => setTimeout(resolve, 800));
    return [...mockBuildings];
  },

  // ดึงรายละเอียดตึกด้วย ID
  getById: async (id: number): Promise<Building | null> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const building = mockBuildings.find((b) => b.id === id);
    return building ? { ...building } : null;
  },

  // เพิ่มตึกใหม่
  create: async (data: Partial<Building>): Promise<Building> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const newBuilding: Building = {
      id: mockBuildings.length + 1,
      name: data.name || "อาคารใหม่",
      building_type_id: data.building_type_id,
      building_type_name: data.building_type_name,
      rental_space_count: 0,
      has_floor_plan: false,
    };
    mockBuildings.push(newBuilding);
    return newBuilding;
  },
};
