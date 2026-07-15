export interface MockContract {
  id: string;
  contractNumber: string;
  startDate: string;
  endDate: string;
  monthlyRental: number;
  deposit: number;
  scholarship: number;
  terms?: string;
  note?: string;
  status: "active" | "expiring" | "expired" | "terminated";
  pdfUrl?: string;
}

export interface MockTenant {
  id: string;
  name: string;
  subLocation: string;
  businessType: string;
  ownerName: string;
  contractEndDate: string;
  image?: string;
  bannerUrl?: string; // Maps to banner_url in backend database schema
  phone?: string;
  nationalId?: string;
  deposit?: number;
  scholarship?: number;
  terms?: string;
  note?: string;
  contractStartDate?: string;
  taxId?: string;
  contracts?: MockContract[];
}

const getMockBannerUrl = (businessType: string, index: number): string => {
  const foodImages = [
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80",
    "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&q=80"
  ];
  const dessertImages = [
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80",
    "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&q=80"
  ];
  const convenienceStoreImages = [
    "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&q=80",
    "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=500&q=80"
  ];
  const drinkImages = [
    "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=500&q=80",
    "https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?w=500&q=80",
    "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=500&q=80"
  ];
  const serviceImages = [
    "https://images.unsplash.com/photo-1545173168-9f19472ef7f4?w=500&q=80",
    "https://images.unsplash.com/photo-1521791136368-1a86827076b2?w=500&q=80"
  ];

  switch (businessType) {
    case "อาหารและเครื่องดื่ม":
      return foodImages[index % foodImages.length];
    case "ขนมหวาน":
      return dessertImages[index % dessertImages.length];
    case "ร้านสะดวกซื้อ":
      return convenienceStoreImages[index % convenienceStoreImages.length];
    case "เครื่องดื่ม":
      return drinkImages[index % drinkImages.length];
    case "บริการ":
    default:
      return serviceImages[index % serviceImages.length];
  }
};

export const generateMockTenants = (areaId: string, subLocations: string[]): MockTenant[] => {
  const tenants: MockTenant[] = [];
  const businessTypes = ["อาหารและเครื่องดื่ม", "ขนมหวาน", "ร้านสะดวกซื้อ", "เครื่องดื่ม", "บริการ"];
  
  // Create some specific ones if it's cafeterias to make the demo look good
  const specificNames: Record<string, string[]> = {
    "โรงอาหารพราวแสดทอง": ["ร้านป้าณี อาหารตามสั่ง", "ก๋วยเตี๋ยวเรืออยุธยา", "น้ำปั่นผลไม้สด ชื่นใจ"],
    "โรงอาหารกาสะลองคำ": ["ข้าวมันไก่ตอน สูตรไหหลำ", "ข้าวราดแกง 10 อย่าง", "ร้านกาแฟสด All Day"],
    "โรงอาหารคอนตะวัน": ["ข้าวไข่เจียวทรงเครื่อง", "ลูกชิ้นทอด ปิ้งย่าง", "ร้านน้ำผลไม้ปั่น"],
    "โรงอาหารครัวท่านท้าว": ["อาหารอิสลาม ฮาลาล", "ส้มตำ ไก่ย่างรสเด็ด", "ขนมหวานน้ำกะทิ"],
    "โรงอาหารเด่นทองกวาว": ["สเต็กคุณลุง", "อาหารญี่ปุ่น ทาโกะยากิ", "เครปญี่ปุ่น"],
    "โรงอาหารเรียนรวม2": ["ข้าวมันไก่ทอด", "ก๋วยเตี๋ยวต้มยำโบราณ", "ชานมไข่มุก"],
  };

  subLocations.forEach((sub, index) => {
    // Determine how many tenants in this sub location deterministically
    const numTenants = specificNames[sub] ? specificNames[sub].length : ((index + 3) % 4) + 2;
    
    for (let i = 0; i < numTenants; i++) {
      const name = specificNames[sub] ? specificNames[sub][i] : `ร้านค้า ${sub} ${i + 1}`;
      const businessTypeIndex = (index + i) % businessTypes.length;
      const ownerIndex = (index + i) % 6;
      const yearOffset = (index + i) % 3; // 0, 1, 2 => 2025, 2026, 2027
      const businessType = businessTypes[businessTypeIndex];
      const bannerUrl = getMockBannerUrl(businessType, i + index);
      
      const tenantId = `${areaId}-${index}-${i}`;
      const contractEndDate = `202${5 + yearOffset}-12-31`;
      const contractStartDate = `202${3 + yearOffset}-01-01`;
      const phone = `08${(10000000 + index * 100000 + i * 999).toString().substring(0, 8)}`;
      const nationalId = `1-3012-${(10000 + index * 100 + i).toString()}-0`;
      const taxId = `01055600${(10000 + index * 100 + i).toString()}`;
      const monthlyRental = 5000 + (i * 500);
      const depositVal = 10000;
      const scholarshipVal = 2000;
      const termsVal = "ต้องเปิดบริการอย่างน้อย 6 วันต่อสัปดาห์ และแต่งกายถูกต้องตามระเบียบที่กำหนด";
      const noteVal = "ไม่มีหมายเหตุเพิ่มเติม";

      const mockContractsList: MockContract[] = [];
      const currentContractStatus = (yearOffset === 0) ? "expiring" : "active";

      mockContractsList.push({
        id: `ct-${tenantId}-current`,
        contractNumber: `CT-202${3 + yearOffset}-${(100 + index * 10 + i).toString()}`,
        startDate: contractStartDate,
        endDate: contractEndDate,
        monthlyRental,
        deposit: depositVal,
        scholarship: scholarshipVal,
        terms: termsVal,
        note: noteVal,
        status: currentContractStatus,
      });

      if (yearOffset > 0) {
        mockContractsList.push({
          id: `ct-${tenantId}-past`,
          contractNumber: `CT-202${1 + yearOffset}-${(100 + index * 10 + i).toString()}`,
          startDate: `202${1 + yearOffset}-01-01`,
          endDate: `202${2 + yearOffset}-12-31`,
          monthlyRental: monthlyRental - 500,
          deposit: depositVal,
          scholarship: scholarshipVal,
          terms: "รักษาความสะอาดพื้นที่",
          note: "หมดสัญญาปกติ",
          status: "expired",
        });
      }

      tenants.push({
        id: tenantId,
        name,
        subLocation: sub,
        businessType,
        ownerName: `คุณ ${["สมชาย", "สมหญิง", "มาลี", "วิชัย", "นารี", "ปรีชา"][ownerIndex]} ใจดี`,
        contractEndDate,
        contractStartDate,
        bannerUrl,
        phone,
        nationalId,
        taxId,
        deposit: depositVal,
        scholarship: scholarshipVal,
        terms: termsVal,
        note: noteVal,
        contracts: mockContractsList,
      });
    }
  });

  return tenants;
};
