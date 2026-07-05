"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Download,
  MapPin,
  MoreVertical,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { MyBooking, BookingStatus } from "@/features/bookings/data/mock-my-bookings";
import { useMyBookings } from "@/features/bookings/hooks/useMyBookings";

type TabKey = "ทั้งหมด" | "รออนุมัติ" | "อนุมัติแล้ว" | "เสร็จสิ้น" | "ยกเลิก";

const STATUS_STYLE: Record<BookingStatus, { label: string; className: string }> = {
  รออนุมัติ: { label: "รออนุมัติ", className: "bg-orange-100 text-orange-600" },
  อนุมัติแล้ว: { label: "อนุมัติแล้ว", className: "bg-blue-100 text-blue-600" },
  เสร็จสิ้น: { label: "เสร็จสิ้น", className: "bg-gray-100 text-gray-500" },
  ยกเลิก: { label: "ยกเลิก", className: "bg-gray-100 text-gray-600" },
  ปฏิเสธ: { label: "ปฏิเสธ", className: "bg-red-100 text-red-500" },
};

const ITEMS_PER_PAGE = 5;

function filterByTab(bookings: MyBooking[], tab: TabKey): MyBooking[] {
  if (tab === "ทั้งหมด") return bookings;
  if (tab === "ยกเลิก") return bookings.filter((b) => b.status === "ยกเลิก" || b.status === "ปฏิเสธ");
  return bookings.filter((b) => b.status === tab);
}

function countByTab(bookings: MyBooking[], tab: TabKey): number {
  return filterByTab(bookings, tab).length;
}

export default function MyBookingsView() {
  const { bookings, loading } = useMyBookings();
  const [activeTab, setActiveTab] = useState<TabKey>("ทั้งหมด");
  const [page, setPage] = useState(1);

  const upcoming = bookings.filter((b) => b.upcomingLabel);
  const needsAction = bookings.filter((b) => b.needsPayment).length;

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "รออนุมัติ").length,
    approved: bookings.filter((b) => b.status === "อนุมัติแล้ว").length,
    cancelled: bookings.filter((b) => b.status === "ยกเลิก" || b.status === "ปฏิเสธ").length,
  };

  const tabs: TabKey[] = ["ทั้งหมด", "รออนุมัติ", "อนุมัติแล้ว", "เสร็จสิ้น", "ยกเลิก"];

  const filtered = filterByTab(bookings, activeTab);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-400 text-sm">
        กำลังโหลด...
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">การจองของฉัน</h1>
          <p className="text-sm text-gray-500 mt-1">ติดตามและจัดการคำขอจองพื้นที่ทั้งหมดของคุณ</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-10 gap-2 border-gray-200 text-gray-600 font-medium">
            <Download size={15} />
            ส่งออก
          </Button>
          <Link href="/bookings/search">
            <Button className="h-10 gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold">
              <Plus size={15} />
              จองใหม่
            </Button>
          </Link>
        </div>
      </div>

      {/* Alert banner */}
      {needsAction > 0 && (
        <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl px-5 py-3.5 mb-6">
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className="text-orange-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-orange-800">
                คุณมี {needsAction} คำขอที่ต้องดำเนินการ
              </p>
              <p className="text-xs text-orange-600 mt-0.5">
                กรุณาตรวจสอบชำระเงินและเอกสารเพิ่มเติมสำหรับการจองที่อนุมัติแล้ว
              </p>
            </div>
          </div>
          <button className="text-sm font-semibold text-orange-600 hover:text-orange-800 transition-colors whitespace-nowrap ml-4">
            ดูรายละเอียด
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="ทั้งหมด" value={stats.total} valueClass="text-gray-900" />
        <StatCard label="รอดำเนินการ" value={stats.pending} valueClass="text-orange-500" dotClass="bg-orange-400" />
        <StatCard label="อนุมัติแล้ว" value={stats.approved} valueClass="text-blue-500" dotClass="bg-blue-400" />
        <StatCard label="ยกเลิก/ปฏิเสธ" value={stats.cancelled} valueClass="text-gray-500" dotClass="bg-gray-400" />
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={16} className="text-brand-primary" />
            <h2 className="font-bold text-gray-900">กำลังจะมาถึง</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcoming.map((b) => (
              <UpcomingCard key={b.id} booking={b} />
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-4 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const count = countByTab(bookings, tab);
            return (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                  activeTab === tab
                    ? "border-brand-primary text-brand-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}
              >
                {tab}
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full font-semibold",
                  activeTab === tab ? "bg-brand-primary/10 text-brand-primary" : "bg-gray-100 text-gray-400"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b border-gray-100 hover:bg-gray-50">
              <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 w-[100px]">เลขที่</TableHead>
              <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4">ห้อง</TableHead>
              <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 w-[160px]">วันที่จอง</TableHead>
              <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 w-[130px]">เวลา</TableHead>
              <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 w-[100px] text-right">ราคา</TableHead>
              <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 w-[150px]">สถานะ</TableHead>
              <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 w-[72px] text-center">การจัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-16 text-center text-gray-400 text-sm">ไม่มีรายการ</TableCell>
              </TableRow>
            ) : (
              paginated.map((b) => <BookingRow key={b.id} booking={b} />)
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
          <p className="text-sm text-gray-400">
            แสดง {filtered.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(page * ITEMS_PER_PAGE, filtered.length)} จาก {filtered.length} รายการ
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-100 text-gray-400 hover:border-gray-300 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-100 text-gray-400 hover:border-gray-300 disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  valueClass,
  dotClass,
}: {
  label: string;
  value: number;
  valueClass: string;
  dotClass?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-2">
        {dotClass && <span className={cn("w-2 h-2 rounded-full", dotClass)} />}
        <p className="text-sm text-gray-500">{label}</p>
      </div>
      <p className={cn("text-4xl font-bold tabular-nums", valueClass)}>
        {String(value).padStart(2, "0")}
        <span className="text-sm font-normal text-gray-400 ml-1.5">รายการ</span>
      </p>
    </div>
  );
}

function UpcomingCard({ booking }: { booking: MyBooking }) {
  const badgeColors: Record<string, string> = {
    พรุ่งนี้: "bg-brand-primary text-white",
    "อีก 3 วัน": "bg-gray-700 text-white",
    สัปดาห์หน้า: "bg-gray-100 text-gray-600",
  };
  const badgeClass = booking.upcomingLabel ? badgeColors[booking.upcomingLabel] ?? "bg-gray-100 text-gray-600" : "";

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-start justify-between mb-3">
        {booking.upcomingLabel && (
          <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", badgeClass)}>
            {booking.upcomingLabel}
          </span>
        )}
        <button className="text-gray-300 hover:text-gray-500 transition-colors ml-auto">
          <MoreVertical size={16} />
        </button>
      </div>
      <p className="font-bold text-gray-900 mb-1">{booking.room.name}</p>
      <p className="flex items-center gap-1 text-xs text-gray-400 mb-3">
        <MapPin size={11} className="text-brand-primary shrink-0" />
        {booking.room.building}
      </p>
      <div className="bg-gray-50 rounded-lg px-3 py-2.5">
        <p className="text-xs font-semibold text-gray-700">
          {booking.startTime} – {booking.endTime}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{booking.date}</p>
      </div>
    </div>
  );
}

function BookingRow({ booking }: { booking: MyBooking }) {
  const style = STATUS_STYLE[booking.status];
  return (
    <TableRow className="hover:bg-gray-50/60">
      <TableCell className="px-6 py-4">
        <span className="text-xs font-mono text-gray-400">#{booking.id}</span>
      </TableCell>

      <TableCell className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-gray-100">
            <img src={booking.room.image} alt={booking.room.name} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800">{booking.room.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{booking.room.building}</p>
          </div>
        </div>
      </TableCell>

      <TableCell className="px-4 py-4">
        {booking.dateEnd ? (
          <>
            <p className="text-sm text-gray-700">{booking.date}</p>
            <p className="text-sm text-gray-700">– {booking.dateEnd}</p>
            <p className="text-xs text-gray-400 mt-0.5">{booking.days} วัน</p>
          </>
        ) : (
          <p className="text-sm text-gray-700">{booking.date}</p>
        )}
      </TableCell>

      <TableCell className="px-4 py-4">
        <span className="text-sm text-gray-700 whitespace-nowrap">
          {booking.startTime} – {booking.endTime}
        </span>
      </TableCell>

      <TableCell className="px-4 py-4 text-right">
        <span className="text-sm font-semibold text-gray-800">฿{booking.price.toLocaleString()}</span>
      </TableCell>

      <TableCell className="px-4 py-4">
        <div className="flex flex-col gap-1.5">
          <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full w-fit", style.className)}>
            {style.label}
          </span>
          {booking.waitDays && (
            <span className="text-xs text-gray-400 pl-0.5">รอ {booking.waitDays} วัน</span>
          )}
          {booking.needsPayment && (
            <span className="flex items-center gap-1 text-xs text-orange-500 font-medium pl-0.5">
              <CreditCard size={11} />
              รอชำระเงิน
            </span>
          )}
        </div>
      </TableCell>

      <TableCell className="px-6 py-4 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <Link
            href={`/my-bookings/${booking.bookingId}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-400 rounded-lg px-2.5 py-1.5 transition-colors whitespace-nowrap"
          >
            ดูรายละเอียด
          </Link>
          {booking.status === "อนุมัติแล้ว" && (
            <Link
              href={`/payment/${booking.bookingId}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-700 border border-orange-200 hover:border-orange-400 rounded-lg px-2.5 py-1.5 transition-colors whitespace-nowrap"
            >
              <CreditCard size={12} />
              ชำระเงิน
            </Link>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
