"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Clock, Eye, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const handleAction = async (id: number, status: string) => {
    setActionLoading(id);
    try {
      await updateBookingStatus(id, { status });
      reload();
    } finally {
      setActionLoading(null);
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

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {Object.entries(STATUS_STYLE).map(([key, { label, className }]) => {
          const count = bookings.filter((b) => b.status === key).length;
          return (
            <div key={key} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <p className="text-2xl font-bold text-gray-800">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
                      <span className={cn("text-xs px-2.5 py-1 rounded-full border font-medium", style.className)}>
                        {style.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        {b.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              className="h-7 px-2.5 text-xs bg-green-500 hover:bg-green-600 text-white gap-1"
                              disabled={actionLoading === b.id}
                              onClick={() => handleAction(b.id, "approved")}
                            >
                              <CheckCircle size={12} /> อนุมัติ
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2.5 text-xs border-red-200 text-red-500 hover:bg-red-50 gap-1"
                              disabled={actionLoading === b.id}
                              onClick={() => handleAction(b.id, "rejected")}
                            >
                              <XCircle size={12} /> ปฏิเสธ
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-gray-400 hover:text-gray-700"
                          onClick={() => setSelected(selected?.id === b.id ? null : b)}
                        >
                          <Eye size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-gray-900">รายละเอียด #{selected.id}</h3>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-400">ผู้ขอ:</span> <span className="font-medium">{selected.user_name}</span></div>
            <div><span className="text-gray-400">วัตถุประสงค์:</span> <span className="font-medium">{selected.purpose}</span></div>
            <div><span className="text-gray-400">ราคาพื้นที่:</span> <span className="font-medium">฿{selected.base_price.toLocaleString()}</span></div>
            <div><span className="text-gray-400">ราคาบริการเสริม:</span> <span className="font-medium">฿{selected.addon_price.toLocaleString()}</span></div>
            <div><span className="text-gray-400">ราคารวม:</span> <span className="font-bold text-brand-primary">฿{selected.total_price.toLocaleString()}</span></div>
            <div><span className="text-gray-400">วันที่ขอ:</span> <span className="font-medium">{formatThaiDate(selected.created_at)}</span></div>
          </div>
          {selected.timeslots?.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">ช่วงเวลาที่จอง</p>
              <div className="flex flex-col gap-1.5">
                {selected.timeslots.map((ts) => (
                  <div key={ts.id} className="flex items-center gap-3 px-3 py-2 bg-orange-50 rounded-lg text-sm">
                    <Clock size={13} className="text-brand-primary shrink-0" />
                    <span className="font-medium text-gray-700">{ts.location_name}</span>
                    <span className="text-gray-500">{formatThaiDate(ts.date)} · {formatTime(ts.start_time)}–{formatTime(ts.end_time)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
