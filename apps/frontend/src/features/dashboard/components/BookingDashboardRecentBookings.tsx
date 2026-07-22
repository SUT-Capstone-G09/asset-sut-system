"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { MoreHorizontal, Eye, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateBookingStatus } from "@/features/bookings/services/booking.service";
import type { BookingResponseDTO } from "@/features/bookings/services/booking.service";
import { useAuthContext } from "@/lib/context/auth-context";
import BookingDrawer from "@/features/booking/components/booking/BookingDrawer";
import { bookingDTOToAdminBooking } from "@/features/booking/hooks/useBookingFilters";
import { AdminLocationDTO } from "@/features/booking/services/locationService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  pending:   { label: "รออนุมัติ",   className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  approved:  { label: "อนุมัติแล้ว", className: "bg-blue-50 text-blue-700 border-blue-200" },
  rejected:  { label: "ปฏิเสธ",      className: "bg-red-50 text-red-700 border-red-200" },
  cancelled: { label: "ยกเลิก",      className: "bg-gray-100 text-gray-500 border-gray-200" },
  completed: { label: "เสร็จสิ้น",   className: "bg-green-50 text-green-700 border-green-200" },
};

function formatThaiDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function BookingDashboardRecentBookings({ bookings, onReload }: { bookings: BookingResponseDTO[], onReload?: () => void }) {
  const { user } = useAuthContext();
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selected, setSelected] = useState<BookingResponseDTO | null>(null);
  const [approveModalBooking, setApproveModalBooking] = useState<BookingResponseDTO | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const portalBase = pathname.startsWith("/staff") ? "/staff" : "/admin";

  const handleAction = async (
    id: string,
    status: "pending" | "approved" | "rejected" | "cancelled" | "completed",
  ) => {
    const numericId = Number(id);
    setActionLoading(numericId);
    try {
      await updateBookingStatus(numericId, { status });
      onReload?.();
    } finally {
      setActionLoading(null);
      if (status === "approved") {
        setApproveModalBooking(null);
      }
    }
  };

  const recentBookings = [...bookings].sort((a, b) => b.id - a.id).slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="flex justify-between items-center p-6 pb-4">
        <h3 className="text-base font-bold text-gray-900">
          รายการจองล่าสุด (Recent Booking)
        </h3>
        <Link 
          href={`${portalBase}/booking`}
          className="text-xs font-semibold text-[var(--color-brand-primary)] hover:opacity-80 transition-opacity"
        >
          ดูทั้งหมด
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50/50 text-gray-500 font-medium border-y border-gray-100">
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
            {recentBookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                  ไม่มีรายการจอง
                </td>
              </tr>
            ) : (
              recentBookings.map((booking) => {
                const slot = booking.timeslots?.[0];
                const style = STATUS_STYLE[booking.status] || STATUS_STYLE.pending;

                return (
                  <tr key={booking.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-mono">#{booking.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{booking.user_name}</p>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="text-gray-700 truncate">{booking.purpose}</p>
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
                      ฿{booking.total_price.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("text-xs px-2.5 py-1 rounded-full border font-medium whitespace-nowrap", style.className)}>
                        {style.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl">
                          <DropdownMenuItem 
                            onClick={() => setSelected(selected?.id === booking.id ? null : booking)}
                            className="text-gray-700 cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            ดูรายละเอียด
                          </DropdownMenuItem>
                          
                          {booking.status === "pending" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => setApproveModalBooking(booking)}
                                disabled={actionLoading === booking.id}
                                className="text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50 cursor-pointer"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                อนุมัติ
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleAction(String(booking.id), "rejected")}
                                disabled={actionLoading === booking.id}
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
              })
            )}
          </tbody>
        </table>
      </div>

      <BookingDrawer
        booking={selected ? bookingDTOToAdminBooking(selected, new Map<number, AdminLocationDTO>()) : null}
        open={!!selected}
        onClose={() => setSelected(null)}
        onUpdateStatus={handleAction}
        onEdit={() => {}} // No-op for now unless requested
      />

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
                  {user?.role !== "staff" ? (
                    <>กรุณาตรวจสอบว่าคุณได้ <span className="font-bold">จัดการค่าใช้จ่าย</span> เรียบร้อยแล้ว ก่อนทำการอนุมัติรายการนี้</>
                  ) : (
                    <>โปรดตรวจสอบรายการจองให้ครบถ้วนก่อนทำการอนุมัติ</>
                  )}
                </p>
              </div>
            </div>
          )}

          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
            {user?.role !== "staff" ? (
              <Button
                variant="outline"
                onClick={() => approveModalBooking && router.push(`${portalBase}/booking/${approveModalBooking.id}/expenses`)}
                className="h-11 rounded-[7px] font-bold border-slate-200 text-slate-600 bg-white hover:bg-slate-100"
              >
                จัดการค่าใช้จ่าย
              </Button>
            ) : (
              <div />
            )}
            
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setApproveModalBooking(null)}
                className="h-11 rounded-[7px] font-bold text-slate-500 hover:bg-slate-200 hover:text-slate-700"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={() => approveModalBooking && handleAction(String(approveModalBooking.id), "approved")}
                disabled={actionLoading === approveModalBooking?.id}
                className="h-11 rounded-[7px] font-bold bg-[var(--color-brand-primary)] hover:opacity-90 text-white min-w-[120px]"
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
