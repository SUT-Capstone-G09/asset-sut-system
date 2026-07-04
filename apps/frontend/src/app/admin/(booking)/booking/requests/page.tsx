"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Clock, Eye, RefreshCw, AlertCircle, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookingDashboardStats } from "@/features/dashboard/components/BookingDashboardStats";
import { BookingDashboardUsageChart } from "@/features/dashboard/components/BookingDashboardUsageChart";
import { BookingDashboardProportionChart } from "@/features/dashboard/components/BookingDashboardProportionChart";
import { BookingDashboardOccupancy } from "@/features/dashboard/components/BookingDashboardOccupancy";
import { BookingDashboardPendingRequests } from "@/features/dashboard/components/BookingDashboardPendingRequests";
import BookingDrawer from "@/features/booking/components/booking/BookingDrawer";
import { bookingDTOToAdminBooking } from "@/features/booking/hooks/useBookingFilters";
import { AdminLocationDTO } from "@/features/booking/services/locationService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useAdminBookings } from "@/features/bookings/hooks/useAdminBookings";
import { updateBookingStatus } from "@/features/bookings/services/booking.service";
import type { BookingResponseDTO } from "@/features/bookings/services/booking.service";

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  pending:   { label: "รออนุมัติ",   className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  approved:  { label: "อนุมัติแล้ว", className: "bg-green-50 text-green-700 border-green-200" },
  rejected:  { label: "ปฏิเสธ",      className: "bg-red-50 text-red-700 border-red-200" },
  cancelled: { label: "ยกเลิก",      className: "bg-gray-100 text-gray-500 border-gray-200" },
  completed: { label: "เสร็จสิ้น",   className: "bg-blue-50 text-blue-700 border-blue-200" },
};

function formatThaiDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export default function BookingRequestsPage() {
  const { bookings, loading, error, reload } = useAdminBookings();
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selected, setSelected] = useState<BookingResponseDTO | null>(null);
  
  const router = useRouter();
  const [approveModalBooking, setApproveModalBooking] = useState<BookingResponseDTO | null>(null);

  const handleAction = async (id: number, status: string) => {
    setActionLoading(id);
    try {
      await updateBookingStatus(id, { status });
      reload();
    } finally {
      setActionLoading(null);
      if (status === "approved") {
        setApproveModalBooking(null);
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">คำขอจองพื้นที่</h1>
          <p className="text-sm text-gray-500 mt-0.5">รายการคำขอจองพื้นที่จาก users ทั้งหมด</p>
        </div>
        <Button variant="outline" size="sm" onClick={reload} className="gap-2">
          <RefreshCw size={14} /> รีเฟรช
        </Button>
      </div>

      {/* Dashboard Section */}
      <div className="space-y-6 mb-8">
        <BookingDashboardStats bookings={bookings} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BookingDashboardUsageChart bookings={bookings} />
          </div>
          <div className="lg:col-span-1">
            <BookingDashboardProportionChart bookings={bookings} />
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">กำลังโหลด...</div>
        ) : error ? (
          <div className="flex items-center justify-center py-16 text-red-400 text-sm">{error}</div>
        ) : bookings.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">ยังไม่มีคำขอ</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">ผู้ขอ</th>
                <th className="px-4 py-3 text-left">วัตถุประสงค์</th>
                <th className="px-4 py-3 text-left">สถานที่ / วันเวลา</th>
                <th className="px-4 py-3 text-right">ราคา</th>
                <th className="px-4 py-3 text-center">สถานะ</th>
                <th className="px-4 py-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.map((b) => {
                const slot = b.timeslots?.[0];
                const style = STATUS_STYLE[b.status] ?? STATUS_STYLE.pending;
                return (
                  <tr key={b.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-mono">#{b.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{b.user_name}</p>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="text-gray-700 truncate">{b.purpose}</p>
                    </td>
                    <td className="px-4 py-3">
                      {slot ? (
                        <>
                          <p className="font-medium text-gray-800">{slot.location_name}</p>
                          <p className="text-gray-400 text-xs mt-0.5">
                            {formatThaiDate(slot.date)} · {formatTime(slot.start_time)}–{formatTime(slot.end_time)}
                          </p>
                        </>
                      ) : (
                        <span className="text-gray-300">–</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">
                      ฿{b.total_price.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("text-xs px-2.5 py-1 rounded-full border font-medium whitespace-nowrap", style.className)}>
                        {style.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl">
                          <DropdownMenuItem 
                            onClick={() => setSelected(selected?.id === b.id ? null : b)}
                            className="text-gray-700 cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            ดูรายละเอียด
                          </DropdownMenuItem>
                          
                          {b.status === "pending" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setApproveModalBooking(b)}
                                disabled={actionLoading === b.id}
                                className="text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50 cursor-pointer"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                อนุมัติ
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleAction(b.id, "rejected")}
                                disabled={actionLoading === b.id}
                                className="text-rose-600 focus:text-rose-700 focus:bg-rose-50 cursor-pointer"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                ปฏิเสธ
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
            </div>
          </div>
          
          {/* Right side Widgets */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <BookingDashboardOccupancy bookings={bookings} />
            <BookingDashboardPendingRequests bookings={bookings} />
          </div>
        </div>
      </div>

      {/* BookingDrawer from existing booking page */}
      <BookingDrawer
        booking={selected ? bookingDTOToAdminBooking(selected, new Map<number, AdminLocationDTO>()) : null}
        open={!!selected}
        onClose={() => setSelected(null)}
        onUpdateStatus={handleAction}
        onEdit={() => {}} // No-op for now unless requested
        onDelete={() => {}} // No-op for now unless requested
      />

      {/* Approve Confirmation Modal */}
      <Dialog open={!!approveModalBooking} onOpenChange={(open) => !open && setApproveModalBooking(null)}>
        <DialogContent className="max-w-md rounded-2xl border-none shadow-2xl p-0 overflow-hidden z-[300]">
          <DialogHeader className="p-6 pb-0 border-b-0">
            <DialogTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
              <CheckCircle className="text-emerald-500" size={24} />
              ยืนยันการอนุมัติการจอง
            </DialogTitle>
          </DialogHeader>
          
          {approveModalBooking && (
            <div className="p-6 pt-4 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center space-y-2">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">ยอดชำระทั้งหมด</span>
                <span className="text-3xl font-black text-[#f26522]">
                  {approveModalBooking.total_price === 0 
                    ? "ไม่มีค่าใช้จ่าย" 
                    : `฿${approveModalBooking.total_price.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                </span>
              </div>

              <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-xl border border-amber-100">
                <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-amber-800 font-medium leading-relaxed">
                  กรุณาตรวจสอบว่าคุณได้ <span className="font-bold">จัดการค่าใช้จ่าย</span> เรียบร้อยแล้ว ก่อนทำการอนุมัติรายการนี้
                </p>
              </div>
            </div>
          )}

          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => approveModalBooking && router.push(`/admin/booking/${approveModalBooking.id}/expenses`)}
              className="h-11 rounded-[7px] font-bold border-slate-200 text-slate-600 bg-white hover:bg-slate-100"
            >
              จัดการค่าใช้จ่าย
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setApproveModalBooking(null)}
                className="h-11 rounded-[7px] font-bold text-slate-500 hover:bg-slate-200 hover:text-slate-700"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={() => approveModalBooking && handleAction(approveModalBooking.id, "approved")}
                disabled={actionLoading === approveModalBooking?.id}
                className="h-11 rounded-[7px] font-bold bg-emerald-500 hover:bg-emerald-600 text-white min-w-[120px]"
              >
                {actionLoading === approveModalBooking?.id ? (
                  <div className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  "ยืนยันการอนุมัติ"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
