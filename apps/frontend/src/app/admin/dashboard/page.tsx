"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingDashboardStats } from "@/features/dashboard/components/BookingDashboardStats";
import { BookingDashboardUsageChart } from "@/features/dashboard/components/BookingDashboardUsageChart";
import { BookingDashboardProportionChart } from "@/features/dashboard/components/BookingDashboardProportionChart";
import { BookingDashboardOccupancy } from "@/features/dashboard/components/BookingDashboardOccupancy";
import { BookingDashboardPendingRequests } from "@/features/dashboard/components/BookingDashboardPendingRequests";
import { BookingDashboardRecentBookings } from "@/features/dashboard/components/BookingDashboardRecentBookings";
import { useAdminBookings } from "@/features/bookings/hooks/useAdminBookings";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

function BookingDashboardTab() {
  const { bookings, loading, error, reload } = useAdminBookings();

  if (loading && bookings.length === 0) return <div className="p-8 text-center text-slate-500">กำลังโหลดข้อมูล...</div>;
  if (error && bookings.length === 0) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-6 mt-6 animate-in fade-in duration-300">
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
  );
}

export default function DashboardPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">แดชบอร์ด</h1>
        <p className="text-sm text-slate-500">ภาพรวมของระบบการจัดการพื้นที่และสัญญาเช่า</p>
      </div>

      <Tabs defaultValue="booking" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-xl inline-flex h-auto mb-2">
          <TabsTrigger 
            value="lease" 
            className="py-2.5 px-8 rounded-lg data-[state=active]:bg-white data-[state=active]:text-[var(--color-brand-primary)] data-[state=active]:shadow-sm text-sm font-bold text-slate-500"
          >
            สัญญาเช่า
          </TabsTrigger>
          <TabsTrigger 
            value="booking"
            className="py-2.5 px-8 rounded-lg data-[state=active]:bg-white data-[state=active]:text-[var(--color-brand-primary)] data-[state=active]:shadow-sm text-sm font-bold text-slate-500"
          >
            พื้นที่ขอใช้บริการ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lease" className="mt-6">
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
            <h3 className="text-lg font-bold text-slate-700">หน้าว่างสำหรับสัญญาเช่า</h3>
            <p className="text-sm text-slate-500 mt-2">ยังไม่มีข้อมูลในส่วนนี้</p>
          </div>
        </TabsContent>

        <TabsContent value="booking">
          <BookingDashboardTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}