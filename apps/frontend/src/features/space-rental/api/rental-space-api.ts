import { mockLocationsDTO } from "../data/mock-rental-spaces";
import { mockFloorPlans } from "../data/mock-floor-plans";
import { mockStallContracts } from "../data/mock-stall-contracts";
import { mockBuildings } from "../data/mock-buildings";
import { RentalSpace, RentalSpaceDTO, mapDTOToRentalSpace } from "../types/rental-space";
import { Building } from "../types/building";

// จำลองการเรียก API ของพื้นที่เช่าย่อย (Rental Spaces)
export const rentalSpaceApi = {
  // ดึงพื้นที่เช่าย่อยทั้งหมด
  getAll: async (): Promise<RentalSpace[]> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return mockLocationsDTO.map(mapDTOToRentalSpace);
  },

  // ดึงยูนิตย่อยภายในตึกหนึ่งๆ (ขยายข้อมูล Stall จาก Floor Plan อัตโนมัติถ้ามี)
  getByBuilding: async (buildingName: string, buildingId: number): Promise<RentalSpace[]> => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    // เช็คว่าตึกนี้มีแปลนย่อยไหม (เช่น โรงอาหาร)
    const fp = mockFloorPlans.find((f) => f.locationId === String(buildingId));
    if (fp) {
      const shops = fp.elements.filter((el) => el.type === "area" && el.areaType === "shop");
      return shops.map((shop) => {
        const labelKey = shop.label || "";
        const contract = mockStallContracts[labelKey];
        
        return {
          id: `${buildingId}-${shop.id}`,
          name: contract?.tenantName && contract.tenantName !== "-" ? contract.tenantName : shop.name,
          description: shop.description || `${shop.name} ภายใน ${buildingName}`,
          coordinates: [14.8804616, 102.0161729],
          address: "มหาวิทยาลัยเทคโนโลยีสุรนารี",
          image: "https://beta.sut.ac.th/damt/wp-content/uploads/sites/189/2021/01/1-2.jpg",
          area: shop.areaType === "shop" ? "โรงอาหาร" : "ทั่วไป",
          building: buildingName,
          status: shop.status === "open" ? "available" : shop.status === "occupied" ? "occupied" : "maintenance",
          price: contract?.price || 5000,
          size: "15 ตร.ม.",
          areaCode: shop.label || shop.name,
          tenantName: contract?.tenantName || "-",
          contractNumber: contract?.contractNumber || "",
          contractEndDate: contract?.endDate || "",
        } as RentalSpace;
      });
    }

    // หากไม่มีแปลน ให้ดึงจากยูนิตเช่าเดี่ยวของตึกนั้นโดยตรง
    return mockLocationsDTO
      .filter((loc) => loc.building?.name === buildingName)
      .map(mapDTOToRentalSpace);
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
