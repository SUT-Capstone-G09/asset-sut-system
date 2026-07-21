import { mockLocations } from "../data/mock-rental-spaces";
import { mockFloorPlans } from "../data/mock-floor-plans";
import { mockStallContracts } from "../data/mock-stall-contracts";
import { mockBuildings } from "../data/mock-buildings";
import { RentalSpace } from "../types/rental-space";
import { Building } from "../types/building";

// จำลองการเรียก API ของพื้นที่เช่าย่อย (Rental Spaces)
export const rentalSpaceApi = {
  // ดึงพื้นที่เช่าย่อยทั้งหมด
  getAll: async (): Promise<RentalSpace[]> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return [...mockLocations];
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
    return mockLocations.filter((loc) => loc.building === buildingName);
  },

  // อัปเดตข้อมูลพื้นที่เช่า (เช่น มอบสิทธิ์, แก้ไขสถานะ)
  update: async (id: string, data: Partial<RentalSpace>): Promise<RentalSpace | null> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // หาตำแหน่งใน mock array
    const index = mockLocations.findIndex((loc) => loc.id === id);
    if (index !== -1) {
      mockLocations[index] = {
        ...mockLocations[index],
        ...data,
      } as RentalSpace;
      return { ...mockLocations[index] };
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
    
    const spacesCount = mockLocations.filter((loc) => 
      buildingNames.includes(loc.building || "")
    ).length;

    return {
      buildings,
      totalSpacesCount: spacesCount,
    };
  }
};
