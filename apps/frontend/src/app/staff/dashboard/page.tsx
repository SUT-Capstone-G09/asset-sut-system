"use client";

import { BookingDashboardStats } from "@/features/dashboard/components/BookingDashboardStats";
import { BookingDashboardUsageChart } from "@/features/dashboard/components/BookingDashboardUsageChart";
import { BookingDashboardProportionChart } from "@/features/dashboard/components/BookingDashboardProportionChart";
import { BookingDashboardOccupancy } from "@/features/dashboard/components/BookingDashboardOccupancy";
import { BookingDashboardPendingRequests } from "@/features/dashboard/components/BookingDashboardPendingRequests";
import { BookingDashboardRecentBookings } from "@/features/dashboard/components/BookingDashboardRecentBookings";
import { useStaffBookings } from "@/features/bookings/hooks/useStaffBookings";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StaffDashboardPage() {
  const { bookings, loading, error, reload } = useStaffBookings();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">แดชบอร์ด</h1>
        <p className="text-sm text-slate-500">ภาพรวมพื้นที่ขอใช้บริการในอาคารที่คุณดูแล</p>
      </div>

      {loading && bookings.length === 0 ? (
        <div className="p-8 text-center text-slate-500">กำลังโหลดข้อมูล...</div>
      ) : error && bookings.length === 0 ? (
        <div className="p-8 text-center text-red-500">{error}</div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-end mb-4">
            <Button variant="outline" size="sm" onClick={reload} className="gap-2">
              <RefreshCw size={14} /> รีเฟรช
            </Button>
          </div>

          <BookingDashboardStats bookings={bookings} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BookingDashboardUsageChart bookings={bookings} />
            </div>
            <div className="lg:col-span-1">
              <BookingDashboardProportionChart bookings={bookings} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BookingDashboardRecentBookings bookings={bookings} onReload={reload} />
            </div>
            <div className="lg:col-span-1 flex flex-col gap-6">
              <BookingDashboardOccupancy bookings={bookings} />
              <BookingDashboardPendingRequests bookings={bookings} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
