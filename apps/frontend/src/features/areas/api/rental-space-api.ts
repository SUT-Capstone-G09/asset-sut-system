import { mockLocations } from "../data/mock-rental-spaces";
import { mockFloorPlans } from "../data/mock-floor-plans";
import { mockStallContracts } from "../data/mock-stall-contracts";
import { RentalSpace } from "../types/rental-space";

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
          roomNumber: shop.label || shop.name,
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
