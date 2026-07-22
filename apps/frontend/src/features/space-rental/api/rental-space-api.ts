import { mockLocationsDTO } from "../data/mock-rental-spaces";
import { mockBuildings } from "../data/mock-buildings";
import { RentalSpace, RentalSpaceDTO, mapDTOToRentalSpace } from "../types/rental-space";
import { Building } from "../types/building";
import { resolveBuildingStallSpaces } from "../utils/stall-resolver";

// จำลองการเรียก API ของพื้นที่เช่าย่อย (Rental Spaces)
export const rentalSpaceApi = {
  // ดึงพื้นที่เช่าย่อยทั้งหมด
  getAll: async (): Promise<RentalSpace[]> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return mockLocationsDTO.map(mapDTOToRentalSpace);
  },

  // ดึงยูนิตย่อยภายในตึกหนึ่ง ๆ (ขยายข้อมูล Stall จาก Floor Plan อัตโนมัติถ้ามี)
  getByBuilding: async (buildingName: string, buildingId: number): Promise<RentalSpace[]> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return resolveBuildingStallSpaces(buildingId, buildingName);
  },

  // อัปเดตข้อมูลพื้นที่เช่า (เช่น มอบสิทธิ์, แก้ไขสถานะ)
  update: async (id: string, data: Partial<RentalSpace>): Promise<RentalSpace | null> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // หาตำแหน่งใน mock array (ไอดีถูกจัดเก็บเป็นตัวเลขใน DTO)
    const index = mockLocationsDTO.findIndex((loc) => String(loc.id) === id);
    if (index !== -1) {
      const current = mockLocationsDTO[index];
      const dtoUpdate: Partial<RentalSpaceDTO> = {};
      
      if (data.name !== undefined) dtoUpdate.name = data.name;
      if (data.description !== undefined) dtoUpdate.description = data.description;
      if (data.size !== undefined) dtoUpdate.size = data.size;
      if (data.areaCode !== undefined) dtoUpdate.area_code = data.areaCode;
      if (data.price !== undefined) dtoUpdate.base_price = data.price;
      if (data.status !== undefined) {
        dtoUpdate.status = data.status === "available" ? "vacant" : data.status;
      }
      if (data.image !== undefined) {
        dtoUpdate.images = [{ url: data.image, is_primary: true }];
      }
      if (data.building !== undefined || data.area !== undefined) {
        dtoUpdate.building = {
          id: current.building?.id || 0,
          name: data.building !== undefined ? data.building : (current.building?.name || ""),
          address: current.building?.address || "",
          lat: current.building?.lat || 0,
          lng: current.building?.lng || 0,
          building_type: {
            name: data.area !== undefined ? data.area : (current.building?.building_type?.name || "")
          }
        };
      }
      
      mockLocationsDTO[index] = {
        ...current,
        ...dtoUpdate,
      } as RentalSpaceDTO;
      
      return mapDTOToRentalSpace(mockLocationsDTO[index]);
    }
    return null;
  },
};

// จำลองการเรียก API ของอาคารเชิงพาณิชย์ (Buildings)
export const buildingApi = {
  // ดึงข้อมูลอาคารด้วย ID
  getById: async (buildingId: number): Promise<Building | null> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockBuildings.find((b) => b.id === buildingId) || null;
  },

  // ดึงกลุ่มประเภทตึกทั้งหมด
  getAllTypes: async (): Promise<{ value: string; label: string }[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const types = new Set<string>();
    mockBuildings.forEach((b) => {
      if (b.building_type_name) {
        types.add(b.building_type_name);
      }
    });
    return Array.from(types).map((type) => ({ value: type, label: type }));
  },

  // ดึงข้อมูลอาคารตามประเภท และจำนวนสถิติรวมของยูนิตย่อย
  getByType: async (buildingType: string): Promise<{
    buildings: Building[];
    totalSpacesCount: number;
  }> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const buildings = mockBuildings.filter((b) => b.building_type_name === buildingType);
    const buildingNames = buildings.map((b) => b.name);
    
    const spacesCount = mockLocationsDTO.filter((loc) => 
      buildingNames.includes(loc.building?.name || "")
    ).length;

    return {
      buildings,
      totalSpacesCount: spacesCount,
    };
  }
};
