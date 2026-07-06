import { IDashboardRepository } from "../../domain/repositories/dashboard.repository.interface";
import { DashboardItem } from "../../domain/entities/dashboard-item.entity";
import { apiClient } from "@/lib/services/api-client";

export class DashboardRepository implements IDashboardRepository {
  async getDashboardItems(): Promise<DashboardItem[]> {
    let requestsList: DashboardItem[] = [];

    try {
      const response = await apiClient.get<any[]>("/requests");
      if (Array.isArray(response)) {
        requestsList = response.map((req: any) => {
          const category = req.request_type?.name || "แจ้งซ่อมทั่วไป";
          
          let formattedDate = "";
          try {
            if (req.created_at) {
              const dateObj = new Date(req.created_at);
              // Format to Thai Buddhist Era year
              const year = dateObj.getFullYear() + 543;
              const dateStr = dateObj.toLocaleDateString("th-TH", {
                day: "numeric",
                month: "long",
              });
              formattedDate = `${dateStr} ${year}`;
            }
          } catch (e) {
            formattedDate = req.created_at;
          }

          let statusLabel = "รอดำเนินการ";
          let statusClass = "bg-yellow-50 text-yellow-600 border-yellow-100";
          const dbStatus = req.status?.status?.toLowerCase() || "";
          
          if (dbStatus === "pending") {
            statusLabel = "รอดำเนินการ";
            statusClass = "bg-yellow-50 text-yellow-600 border-yellow-100";
          } else if (dbStatus === "inprogress" || dbStatus === "in_progress" || dbStatus === "in progress") {
            statusLabel = "กำลังดำเนินการ";
            statusClass = "bg-blue-50 text-blue-600 border-blue-100";
          } else if (dbStatus === "resolved" || dbStatus === "completed" || dbStatus === "success") {
            statusLabel = "เสร็จสิ้น";
            statusClass = "bg-green-50 text-green-600 border-green-100";
          }

          return {
            id: req.refcode || `REQ-${req.id}`,
            type: "requests",
            category: category,
            date: formattedDate,
            location: req.location,
            detail: req.description,
            status: req.status?.status || "Pending",
            statusLabel: statusLabel,
            statusClass: statusClass
          };
        });
      }
    } catch (error) {
      console.warn("Backend API error, falling back to mock requests:", error);
      // Fallback fallback if API fails
      requestsList = [
        {
          id: "REQ-2026-000123",
          type: "requests",
          category: "แจ้งซ่อมครุภัณฑ์ไฟฟ้า",
          date: "12 กรกฎาคม 2569",
          location: "อาคารวิชาการ 1",
          detail: "เครื่องปรับอากาศในห้องทำงาน B1213 มีเสียงดังผิดปกติและไม่ทำความเย็น แจ้งขอตรวจสอบและดำเนินการแก้ไขเร่งด่วน เนื่องจากส่งผลกระทบต่อการทำงาน",
          status: "InProgress",
          statusLabel: "กำลังดำเนินการ",
          statusClass: "bg-blue-50 text-blue-600 border-blue-100"
        },
        {
          id: "REQ-2026-000098",
          type: "requests",
          category: "แจ้งซ่อมงานอาคาร/โยธา",
          date: "05 กรกฎาคม 2569",
          location: "อาคารเรียนรวม 2 ชั้น 4",
          detail: "ประตูกระจกห้องเรียน 2402 ชำรุด กลอนประตูล็อกไม่ได้ เกรงว่าจะไม่ปลอดภัยช่วงค่ำครับ",
          status: "Resolved",
          statusLabel: "เสร็จสิ้น",
          statusClass: "bg-green-50 text-green-600 border-green-100"
        }
      ];
    }

    const inquiriesList: DashboardItem[] = [
      {
        id: "INQ-2026-000042",
        type: "inquiries",
        category: "สอบถามข้อมูลพื้นที่",
        date: "วันนี้, 16:18 น.",
        location: "อาคารเรียนรวม 1",
        subject: "วิธีการขอเช่าพื้นที่เพื่อเปิดร้านกาแฟ",
        detail: "ต้องการสอบถามขั้นตอนและเอกสารที่ต้องใช้ในการขอเช่าพื้นที่เชิงพาณิชย์บริเวณอาคารเรียนรวม 1 สำหรับเปิดร้านกาแฟครับ",
        status: "Replied",
        statusLabel: "เจ้าหน้าที่ตอบกลับแล้ว",
        statusClass: "bg-orange-50 text-orange-600 border-orange-100"
      }
    ];

    return [...requestsList, ...inquiriesList];
  }
}
