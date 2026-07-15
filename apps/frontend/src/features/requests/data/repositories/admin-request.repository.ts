import { IAdminRequestRepository } from "../../domain/repositories/admin-request.repository.interface";
import { AdminRequestItem } from "../../domain/entities/admin-request-item.entity";
import { apiClient } from "@/lib/services/api-client";

export class AdminRequestRepository implements IAdminRequestRepository {
  async getAdminRequests(): Promise<AdminRequestItem[]> {
    try {
      const response = await apiClient.get<any[]>("/requests/all");
      if (Array.isArray(response)) {
        return response.map((req: any) => {
          let formattedDate = "";
          try {
            if (req.created_at) {
              const dateObj = new Date(req.created_at);
              const year = dateObj.getFullYear() + 543;
              const dateStr = dateObj.toLocaleDateString("th-TH", {
                day: "numeric",
                month: "short",
              });
              formattedDate = `${dateStr} ${year % 100}`;
            }
          } catch (e) {
            formattedDate = req.created_at;
          }

          let statusVal = "PENDING";
          const dbStatus = req.status?.status?.toLowerCase() || "";
          if (dbStatus === "in_progress" || dbStatus === "in progress") {
            statusVal = "IN-PROGRESS";
          } else if (dbStatus === "completed" || dbStatus === "resolved") {
            statusVal = "COMPLETED";
          } else if (dbStatus === "cancelled") {
            statusVal = "CANCELLED";
          } else if (dbStatus === "reject") {
            statusVal = "REJECT";
          }

          return {
            id: req.refcode || `REQ-${req.id}`,
            type: req.request_type?.name || "แจ้งซ่อม",
            title: req.title,
            asset: req.refcode || "-",
            sender: req.user?.profile ? `${req.user.profile.first_name} ${req.user.profile.last_name}` : req.contact_info,
            location: req.location,
            status: statusVal,
            date: formattedDate,
            email: req.user?.email || ""
          };
        });
      }
      return [];
    } catch (error) {
      console.warn("Backend admin requests API error, returning fallback mock data:", error);
      throw error;
    }
  }
}
