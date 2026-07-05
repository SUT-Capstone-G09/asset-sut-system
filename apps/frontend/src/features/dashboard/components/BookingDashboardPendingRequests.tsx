"use client";

import { useMemo } from "react";
import type { BookingResponseDTO } from "@/features/bookings/services/booking.service";

interface BookingDashboardPendingRequestsProps {
  bookings: BookingResponseDTO[];
}

export function BookingDashboardPendingRequests({ bookings }: BookingDashboardPendingRequestsProps) {
  const pendingRequests = useMemo(() => {
    return bookings
      .filter((b) => b.status === "pending")
      .slice(0, 2)
      .map((b) => {
        const firstSlot = b.timeslots?.[0];
        const dateStr = firstSlot
          ? new Date(firstSlot.date).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" })
          : "";
        const startTime = firstSlot ? new Date(firstSlot.start_time).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false }) : "";
        const endTime = firstSlot ? new Date(firstSlot.end_time).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false }) : "";
        
        return {
          room: firstSlot?.location_name ?? "ไม่ระบุ",
          details: `${b.purpose} | ${dateStr} ${startTime} - ${endTime}`,
        };
      });
  }, [bookings]);

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
      <h3 className="text-base font-bold text-gray-900 mb-6">
        คำขอที่รอดำเนินการ
      </h3>
      <div className="space-y-3 flex-1">
        {pendingRequests.map((req, index) => (
          <div
            key={index}
            className="p-3 bg-orange-50/50 rounded-lg border border-orange-100/50"
          >
            <h4 className="text-sm font-bold text-orange-500 mb-0.5">
              {req.room}
            </h4>
            <p className="text-xs text-gray-500">{req.details}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
