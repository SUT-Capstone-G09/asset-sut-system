"use client";

import { cn } from "@/lib/utils";

const bookings = [
  {
    userInitial: "SK",
    userName: "Somchai K.",
    area: "Meeting Room A (Zone 4)",
    date: "22 พ.ค. 2569",
    time: "10:00",
    status: "SUCCESS",
    statusClass: "bg-emerald-50 text-emerald-600",
  },
  {
    userInitial: "WP",
    userName: "Wipada P.",
    area: "Focus Pod #12",
    date: "22 พ.ค. 2569",
    time: "09:45",
    status: "PENDING",
    statusClass: "bg-amber-50 text-amber-600",
  },
  {
    userInitial: "TR",
    userName: "Tanawat R.",
    area: "Conference Room B",
    date: "22 พ.ค. 2569",
    time: "09:15",
    status: "SUCCESS",
    statusClass: "bg-emerald-50 text-emerald-600",
  },
  {
    userInitial: "KP",
    userName: "Kanya P.",
    area: "Workshop Area",
    date: "21 พ.ค. 2569",
    time: "17:30",
    status: "CANCELLED",
    statusClass: "bg-rose-50 text-rose-600",
  },
];

export function BookingDashboardRecentBookings() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="flex justify-between items-center p-6 pb-4">
        <h3 className="text-base font-bold text-gray-900">
          รายการจองล่าสุด (Recent Booking)
        </h3>
        <button className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors">
          ดูทั้งหมด
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50/50 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-3 font-medium">ผู้ใช้งาน</th>
              <th className="px-6 py-3 font-medium">พื้นที่เช่างาน</th>
              <th className="px-6 py-3 font-medium">วันที่ / เวลา</th>
              <th className="px-6 py-3 font-medium">สถานะ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {bookings.map((booking, index) => (
              <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 font-medium shrink-0">
                      {booking.userInitial}
                    </div>
                    <span className="font-medium text-gray-900">
                      {booking.userName}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{booking.area}</td>
                <td className="px-6 py-4 text-gray-600">
                  {booking.date} |<br />
                  {booking.time}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full font-semibold text-[10px] tracking-wider",
                      booking.statusClass
                    )}
                  >
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
