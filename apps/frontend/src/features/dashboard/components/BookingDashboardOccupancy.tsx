"use client";

import { useMemo } from "react";
import type { BookingResponseDTO } from "@/features/bookings/services/booking.service";

interface BookingDashboardOccupancyProps {
  bookings: BookingResponseDTO[];
}

export function BookingDashboardOccupancy({ bookings }: BookingDashboardOccupancyProps) {
  const occupancies = useMemo(() => {
    const counts = new Map<string, number>();
    
    bookings.forEach((b) => {
      const locationName = b.timeslots?.[0]?.location_name ?? "ไม่ได้ระบุพื้นที่";
      counts.set(locationName, (counts.get(locationName) || 0) + 1);
    });

    const maxCount = Math.max(...Array.from(counts.values()), 1);

    return Array.from(counts.entries())
      .map(([name, value]) => ({
        name,
        // Since we don't have actual max capacity, we scale them against the max booked location
        // or just use a mock max value. Let's use value relative to the max count * 1.2 to give it some headroom.
        percentage: Math.min(Math.round((value / (maxCount * 1.2)) * 100) + 10, 100) 
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3); // Show top 3
  }, [bookings]);

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
      <h3 className="text-base font-bold text-gray-900 mb-6">
        พื้นที่ยอดนิยม (Occupancy)
      </h3>
      <div className="space-y-5 flex-1">
        {occupancies.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-gray-900">{item.name}</span>
              <span className="text-orange-500">{item.percentage}%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
