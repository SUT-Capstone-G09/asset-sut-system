"use client";

import { tenantAreaOptions } from "@/features/space-rental/data/tenant-areas";
import { generateMockTenants, MockTenant, MockContract } from "@/features/space-rental/data/mock-tenants";

export interface RenewalRequest {
  id: string;
  contractNo: string;
  shopName: string;
  ownerName: string;
  tenantType: "individual" | "juristic";
  documentName: string;
  documentUrl?: string; // stores base64 PDF of response form
  intent?: "intend" | "not_intend";
  suggestions?: string;
  subLocation?: string;
  expiryDate?: string;
  status: "pending" | "approved" | "rejected";
  date: string;
  note?: string;
}

const STORAGE_KEY_TENANTS = "mock_store_tenants";
const STORAGE_KEY_REQUESTS = "contract_renewal_requests";

export const mockContractStore = {
  // 1. Get all tenants (Single Source of Truth)
  getTenants(): MockTenant[] {
    if (typeof window === "undefined") return [];
    
    const stored = localStorage.getItem(STORAGE_KEY_TENANTS);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const hasActivePf = Array.isArray(parsed) && parsed.some(p => p.id === "learning-buildings-0-0" && p.contracts?.[0]?.status === "active");
        if ((Array.isArray(parsed) && parsed.length > 15) || hasActivePf) {
          localStorage.removeItem(STORAGE_KEY_TENANTS);
          localStorage.removeItem(STORAGE_KEY_REQUESTS);
        } else {
          return parsed;
        }
      } catch (e) {}
    }
    
    // Consistent Tenants aligned with Space Rental Management system
    const consistentTenants: MockTenant[] = [
      {
        id: "cafeterias-0-0",
        name: "ร้านก๋วยเตี๋ยวเรือแสนดี",
        subLocation: "โรงอาหารพราวแสดทอง",
        businessType: "อาหารและเครื่องดื่ม",
        ownerName: "คุณ สมศรี รสดี",
        contractStartDate: "2024-01-01",
        contractEndDate: "2026-12-31",
        phone: "081-234-5678",
        nationalId: "1-3012-10001-0",
        taxId: "0105560010100",
        deposit: 10000,
        scholarship: 2000,
        terms: "ต้องเปิดบริการอย่างน้อย 6 วันต่อสัปดาห์ และแต่งกายถูกต้องตามระเบียบที่กำหนด",
        note: "สัญญาแผงเช่าย่อยโรงอาหาร",
        contracts: [
          {
            id: "ct-cafeterias-0-0-current",
            contractNumber: "CON-ST-101",
            startDate: "2024-01-01",
            endDate: "2026-12-31",
            monthlyRental: 5000,
            deposit: 10000,
            scholarship: 2000,
            status: "expiring",
          }
        ]
      },
      {
        id: "cafeterias-0-1",
        name: "ร้านส้มตำจัดจ้าน",
        subLocation: "โรงอาหารพราวแสดทอง",
        businessType: "อาหารและเครื่องดื่ม",
        ownerName: "คุณ มานะ มีโชค",
        contractStartDate: "2024-01-01",
        contractEndDate: "2026-11-30",
        phone: "089-876-5432",
        nationalId: "1-3012-10002-0",
        taxId: "0105560010200",
        deposit: 10000,
        scholarship: 2000,
        terms: "รักษาความสะอาดภายในร้าน",
        note: "สัญญาแผงเช่าย่อยโรงอาหาร",
        contracts: [
          {
            id: "ct-cafeterias-0-1-current",
            contractNumber: "CON-ST-102",
            startDate: "2024-01-01",
            endDate: "2026-11-30",
            monthlyRental: 5000,
            deposit: 10000,
            scholarship: 2000,
            status: "expiring",
          }
        ]
      },
      {
        id: "cafeterias-0-2",
        name: "ร้านชาบู & สุกี้โบราณ",
        subLocation: "โรงอาหารพราวแสดทอง",
        businessType: "อาหารและเครื่องดื่ม",
        ownerName: "คุณ สุขใจ รักดี",
        contractStartDate: "2024-01-01",
        contractEndDate: "2026-10-31",
        phone: "02-123-4567",
        nationalId: "1-3012-10003-0",
        taxId: "0105560010300",
        deposit: 15000,
        scholarship: 3000,
        terms: "ห้ามปล่อยน้ำมันทิ้งลงท่อระบายน้ำโดยตรง",
        note: "สัญญาแผงเช่าย่อยโรงอาหาร",
        contracts: [
          {
            id: "ct-cafeterias-0-2-current",
            contractNumber: "CON-ST-103",
            startDate: "2024-01-01",
            endDate: "2026-10-31",
            monthlyRental: 7500,
            deposit: 15000,
            scholarship: 3000,
            status: "expiring",
          }
        ]
      },
      {
        id: "cafeterias-0-3",
        name: "ร้านเครื่องดื่ม & น้ำผลไม้คั้นสด",
        subLocation: "โรงอาหารพราวแสดทอง",
        businessType: "เครื่องดื่ม",
        ownerName: "คุณ วิภาดา ชื่นใจ",
        contractStartDate: "2024-01-01",
        contractEndDate: "2026-08-31",
        phone: "085-555-6789",
        nationalId: "1-3012-10004-0",
        taxId: "0105560010400",
        deposit: 9000,
        scholarship: 2000,
        terms: "วัตถุดิบต้องมีความสดใหม่ทุกวัน",
        note: "สัญญาแผงเช่าย่อยโรงอาหาร",
        contracts: [
          {
            id: "ct-cafeterias-0-3-current",
            contractNumber: "CON-ST-104",
            startDate: "2024-01-01",
            endDate: "2026-08-31",
            monthlyRental: 4500,
            deposit: 9000,
            scholarship: 2000,
            status: "expiring",
          }
        ]
      },
      {
        id: "cafeterias-0-4",
        name: "ร้านขนมหวานสไตล์ไทย",
        subLocation: "โรงอาหารพราวแสดทอง",
        businessType: "ขนมหวาน",
        ownerName: "คุณ กิตติคุณ อิ่มอร่อย",
        contractStartDate: "2024-01-01",
        contractEndDate: "2026-12-31",
        phone: "086-444-1234",
        nationalId: "1-3012-10005-0",
        taxId: "0105560010500",
        deposit: 9000,
        scholarship: 2000,
        terms: "รักษาความสะอาดภายในพื้นที่",
        note: "สัญญาแผงเช่าย่อยโรงอาหาร",
        contracts: [
          {
            id: "ct-cafeterias-0-4-current",
            contractNumber: "CON-ST-105",
            startDate: "2024-01-01",
            endDate: "2026-12-31",
            monthlyRental: 4500,
            deposit: 9000,
            scholarship: 2000,
            status: "expiring",
          }
        ]
      },
      {
        id: "learning-buildings-0-0",
        name: "บริษัท กาแฟพันธุ์ไทย จำกัด",
        subLocation: "อาคารเรียนรวม 1",
        businessType: "อาหารและเครื่องดื่ม",
        ownerName: "คุณ สมปอง พันธุ์ไทย",
        contractStartDate: "2025-09-01",
        contractEndDate: "2026-09-30",
        phone: "083-999-8888",
        nationalId: "0105556094056",
        taxId: "0105556094056",
        deposit: 30000,
        scholarship: 5000,
        terms: "ปฏิบัติตามกฎและระเบียบการเช่าพื้นที่อาคารเรียนอย่างเคร่งครัด",
        note: "สัญญาร้านค้าแบบเช่าพื้นที่อาคาร",
        contracts: [
          {
            id: "ct-learning-0-0-current",
            contractNumber: "CON-70-0456",
            startDate: "2025-09-01",
            endDate: "2026-09-30",
            monthlyRental: 15000,
            deposit: 30000,
            scholarship: 5000,
            status: "expiring",
          }
        ]
      },
      {
        id: "cafeterias-1-5",
        name: "บริษัท ซีพี ออลล์ จำกัด (มหาชน)",
        subLocation: "โรงอาหารกาสะลองคำ",
        businessType: "ร้านสะดวกซื้อ",
        ownerName: "คุณ ชัยรัตน์ พัฒนา",
        contractStartDate: "2024-01-01",
        contractEndDate: "2026-12-31",
        phone: "02-071-9000",
        nationalId: "0107538000497",
        taxId: "0107538000497",
        deposit: 50000,
        scholarship: 10000,
        terms: "เปิดให้บริการตลอด 24 ชั่วโมง",
        note: "สัญญาร้านค้าสะดวกซื้อใต้หอพัก/โรงอาหาร",
        contracts: [
          {
            id: "ct-cafeterias-1-5-current",
            contractNumber: "CON-69-0124",
            startDate: "2024-01-01",
            endDate: "2026-12-31",
            monthlyRental: 25000,
            deposit: 50000,
            scholarship: 10000,
            status: "expiring",
          }
        ]
      },
      {
        id: "surapat-2-0-0",
        name: "บริษัท ไปรษณีย์ไทย จำกัด",
        subLocation: "สุรพัฒน์ 2",
        businessType: "บริการ",
        ownerName: "คุณ ไปรษณีย์ ไทย",
        contractStartDate: "2025-07-01",
        contractEndDate: "2026-08-31",
        phone: "02-831-3131",
        nationalId: "0105546112521",
        taxId: "0105546112521",
        deposit: 36000,
        scholarship: 5000,
        terms: "ให้บริการขนส่งและไปรษณียภัณฑ์ตามมาตรฐานสากล",
        note: "สัญญาเช่าพื้นที่อาคารบริการ",
        contracts: [
          {
            id: "ct-surapat2-0-0-current",
            contractNumber: "CON-70-0987",
            startDate: "2025-07-01",
            endDate: "2026-08-31",
            monthlyRental: 18000,
            deposit: 36000,
            scholarship: 5000,
            status: "expiring",
          }
        ]
      }
    ];
    
    localStorage.setItem(STORAGE_KEY_TENANTS, JSON.stringify(consistentTenants));
    return consistentTenants;
  },

  // 2. Save all tenants
  saveTenants(tenants: MockTenant[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY_TENANTS, JSON.stringify(tenants));
  },

  // 3. Get all renewal requests
  getRenewalRequests(): RenewalRequest[] {
    if (typeof window === "undefined") return [];
    
    const stored = localStorage.getItem(STORAGE_KEY_REQUESTS);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Automatically clear cache if it contains the hardcoded CON-ST-101 pending request or old req-2 so the user can test
        if (Array.isArray(parsed) && (parsed.some(r => r.contractNo === "CON-ST-101" && r.id === "req-1") || parsed.some(r => r.id === "req-2" && !r.intent))) {
          localStorage.removeItem(STORAGE_KEY_REQUESTS);
        } else {
          return parsed;
        }
      } catch (e) {}
    }
    
    // Initial mock requests if empty, mapped to our new consistent contracts
    const mockInitial: RenewalRequest[] = [
      {
        id: "req-2",
        contractNo: "CON-ST-102",
        shopName: "ร้านส้มตำจัดจ้าน",
        ownerName: "คุณ มานะ มีโชค",
        tenantType: "juristic",
        documentName: "เอกสารขอต่ออายุสัญญา_ส้มตำจัดจ้าน.pdf",
        documentUrl: "generate_on_demand",
        intent: "intend",
        suggestions: "ขออนุญาตปรับปรุงฝาผนังและขยายระบบดูดควันเพิ่มเติมสำหรับการต่อสัญญาฉบับใหม่",
        status: "pending",
        date: "2026-07-19",
      }
    ];
    
    localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(mockInitial));
    return mockInitial;
  },

  // 4. Save all renewal requests
  saveRenewalRequests(requests: RenewalRequest[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(requests));
  },

  // 5. Add a new renewal request from operator
  addRenewalRequest(req: RenewalRequest): void {
    const list = this.getRenewalRequests();
    const updated = [req, ...list];
    this.saveRenewalRequests(updated);
  },

  // 6. Update request status (Approve / Reject)
  updateRequestStatus(id: string, newStatus: "approved" | "rejected"): void {
    const requests = this.getRenewalRequests();
    const request = requests.find((r) => r.id === id);
    
    if (!request) return;
    
    request.status = newStatus;
    this.saveRenewalRequests(requests);

    // If approved, dynamically update the tenant's contract status and extend the date!
    if (newStatus === "approved") {
      const tenants = this.getTenants();
      let updated = false;
      
      const updatedTenants = tenants.map((tenant) => {
        if (tenant.contracts) {
          const contractIndex = tenant.contracts.findIndex(
            (c) => c.contractNumber === request.contractNo
          );
          
          if (contractIndex !== -1) {
            const contract = tenant.contracts[contractIndex];
            
            // Extend contract endDate by 1 year
            const currentEndDate = new Date(contract.endDate);
            if (!isNaN(currentEndDate.getTime())) {
              const extendedYear = currentEndDate.getFullYear() + 1;
              const newEndDateStr = `${extendedYear}-12-31`;
              
              tenant.contracts[contractIndex] = {
                ...contract,
                endDate: newEndDateStr,
                status: "active", // Transition from expiring to active
              };
              
              // Also update the tenant top-level fields
              tenant.contractEndDate = newEndDateStr;
              updated = true;
            }
          }
        }
        return tenant;
      });

      if (updated) {
        this.saveTenants(updatedTenants);
      }
    }
  }
};
