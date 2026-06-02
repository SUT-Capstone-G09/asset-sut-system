"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Circle,
  CreditCard,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import PageContainer from "@/components/layout/PageContainer";
import { useAuthContext } from "@/lib/context/auth-context";
import { useMyBookings } from "@/features/bookings/hooks/useMyBookings";
import { MyBooking } from "@/features/bookings/data/mock-my-bookings";

// ── Step mapping ──────────────────────────────────────────────────────────────
const STEPS = [
  { key: "pending", label: "รอดำเนินการอนุมัติ", sublabel: "Pending Approval" },
  { key: "approved", label: "รอชำระเงิน", sublabel: "Pending Payment" },
  { key: "completed", label: "เสร็จสิ้น", sublabel: "Completed" },
];

function statusToStep(status: string): number {
  if (status === "รออนุมัติ") return 0;
  if (status === "อนุมัติแล้ว") return 1;
  if (status === "ที่ผ่านมา") return 2;
  return 0;
}

// ── Status badge ─────────────────────────────────────────────────────────────
const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  รออนุมัติ: { label: "รอดำเนินการ", className: "bg-orange-100 text-orange-600" },
  อนุมัติแล้ว: { label: "รอชำระเงิน", className: "bg-blue-100 text-blue-600" },
  ที่ผ่านมา: { label: "เสร็จสิ้น", className: "bg-green-100 text-green-600" },
  ยกเลิก: { label: "ยกเลิก", className: "bg-red-100 text-red-500" },
  ปฏิเสธ: { label: "ปฏิเสธ", className: "bg-red-100 text-red-500" },
};

// ── Stepper ───────────────────────────────────────────────────────────────────
function MiniStepper({ booking }: { booking: MyBooking }) {
  const stepIdx = statusToStep(booking.status);
  const isCancelled = booking.status === "ยกเลิก" || booking.status === "ปฏิเสธ";

  return (
    <div className="flex items-center justify-between relative mt-4">
      <div className="absolute top-5 left-[calc(16.66%)] right-[calc(16.66%)] h-0.5 bg-gray-100 z-0" />
      <div
        className="absolute top-5 left-[calc(16.66%)] h-0.5 bg-brand-primary z-0 transition-all"
        style={{
          width: isCancelled
            ? "0%"
            : stepIdx === 0
            ? "0%"
            : stepIdx === 1
            ? "50%"
            : "100%",
        }}
      />
      {STEPS.map((step, idx) => {
        const done = !isCancelled && idx < stepIdx;
        const active = !isCancelled && idx === stepIdx;
        return (
          <div key={step.key} className="flex flex-col items-center gap-1 z-10 flex-1">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                done
                  ? "bg-brand-primary border-brand-primary"
                  : active
                  ? "bg-white border-brand-primary"
                  : "bg-white border-gray-200"
              )}
            >
              {done ? (
                <CheckCircle2 className="w-5 h-5 text-white" />
              ) : active ? (
                <Circle className="w-3 h-3 fill-brand-primary text-brand-primary" />
              ) : (
                <Circle className="w-3 h-3 text-gray-200 fill-gray-200" />
              )}
            </div>
            <p
              className={cn(
                "text-[10px] font-semibold text-center leading-tight",
                done || active ? "text-brand-primary" : "text-gray-300"
              )}
            >
              {step.label}
            </p>
            <p className="text-[9px] text-gray-300 text-center">{step.sublabel}</p>
          </div>
        );
      })}
    </div>
  );
}

// ── Current Booking Card ──────────────────────────────────────────────────────
function CurrentBookingCard({ booking }: { booking: MyBooking }) {
  const badge = STATUS_STYLE[booking.status];
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
      <div className="flex items-start justify-between mb-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          สถานะการจองปัจจุบัน
        </p>
        {badge && (
          <span
            className={cn(
              "text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1",
              badge.className
            )}
          >
            <Circle className="w-2 h-2 fill-current" />
            {badge.label}
          </span>
        )}
      </div>
      <h2 className="text-xl font-bold text-gray-900 mt-2">
        {booking.room.name}
      </h2>
      <p className="text-sm text-gray-400 mt-0.5">
        {booking.date} · {booking.startTime} – {booking.endTime}
      </p>

      <MiniStepper booking={booking} />

      <div className="mt-5 flex items-center gap-2">
        <Link href={`/my-bookings/${booking.bookingId}`} className="flex-1">
          <Button
            variant="outline"
            className="w-full gap-2 border-gray-200 text-gray-600 hover:text-brand-primary hover:border-brand-primary"
          >
            ดูรายละเอียด
            <ArrowRight size={14} />
          </Button>
        </Link>
        {booking.status === "อนุมัติแล้ว" && (
          <Link href={`/payment/${booking.bookingId}`}>
            <Button className="gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold">
              <CreditCard size={14} />
              ชำระเงิน
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

// ── Booking History Row ───────────────────────────────────────────────────────
function HistoryRow({ booking }: { booking: MyBooking }) {
  const badge = STATUS_STYLE[booking.status];
  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-gray-50 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
        <Calendar size={16} className="text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">
          {booking.room.name}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {booking.date} · {booking.startTime} – {booking.endTime}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {badge && (
          <span
            className={cn(
              "text-xs font-semibold px-2.5 py-1 rounded-full",
              badge.className
            )}
          >
            {badge.label}
          </span>
        )}
        <Link
          href={`/my-bookings/${booking.bookingId}`}
          className="text-xs text-brand-primary font-semibold hover:underline"
        >
          ดูรายละเอียด →
        </Link>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { bookings, loading } = useMyBookings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user && user.role !== "requester") {
      router.replace("/admin/dashboard");
    }
  }, [mounted, user, router]);

  if (!mounted) return null;
  if (user && user.role !== "requester") return null;

  const firstName = user?.first_name || user?.email?.split("@")[0] || "คุณ";

  const activeBooking =
    bookings.find(
      (b) =>
        b.status === "รออนุมัติ" ||
        b.status === "อนุมัติแล้ว"
    ) ?? bookings[0];

  const recentBookings = bookings
    .filter((b) => b !== activeBooking)
    .slice(0, 5);

  const needsPaymentCount = bookings.filter((b) => b.needsPayment).length;

  return (
    <PageContainer>
      <div className="max-w-[1100px] mx-auto px-6 py-10">
        {/* Alert banner */}
        {needsPaymentCount > 0 && (
          <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl px-5 py-3.5 mb-6">
            <div className="flex items-center gap-3">
              <AlertTriangle size={18} className="text-orange-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-orange-800">
                  คุณมี {needsPaymentCount} คำขอที่ต้องดำเนินการ
                </p>
                <p className="text-xs text-orange-600 mt-0.5">
                  กรุณาตรวจสอบชำระเงินและเอกสารเพิ่มเติมสำหรับการจองที่อนุมัติแล้ว
                </p>
              </div>
            </div>
            <Link
              href="/my-bookings"
              className="text-sm font-semibold text-orange-600 hover:text-orange-800 transition-colors whitespace-nowrap ml-4"
            >
              ดูรายละเอียด
            </Link>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              ยินดีต้อนรับ, {firstName}
            </h1>
            <p className="text-gray-400 mt-1">
              Here is your booking summary.
            </p>
          </div>
          <Link href="/bookings">
            <Button className="gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold">
              <Plus size={15} />
              จองใหม่
            </Button>
          </Link>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2/3 */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Current booking */}
            {loading ? (
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 h-[260px] animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-40 mb-3" />
                <div className="h-6 bg-gray-100 rounded w-56 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-32" />
              </div>
            ) : activeBooking ? (
              <CurrentBookingCard booking={activeBooking} />
            ) : (
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center gap-3 min-h-[180px]">
                <Calendar size={32} className="text-gray-200" />
                <p className="text-sm text-gray-400">ยังไม่มีการจองที่กำลังดำเนินการ</p>
                <Link href="/bookings">
                  <Button
                    size="sm"
                    className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold"
                  >
                    จองพื้นที่
                  </Button>
                </Link>
              </div>
            )}

            {/* Recent bookings */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">
                  ประวัติการจอง{" "}
                  <span className="text-gray-400 font-normal text-sm">
                    (Booking History)
                  </span>
                </h2>
                <Link
                  href="/my-bookings"
                  className="text-sm font-semibold text-brand-primary hover:text-brand-primary/80 flex items-center gap-1"
                >
                  View All <ArrowRight size={13} />
                </Link>
              </div>

              {loading ? (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-12 bg-gray-50 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : recentBookings.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  ยังไม่มีประวัติการจอง
                </p>
              ) : (
                <div>
                  {recentBookings.map((b) => (
                    <HistoryRow key={b.id} booking={b} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right 1/3 — stats + promo */}
          <div className="flex flex-col gap-6">
            {/* Stats */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
                ภาพรวมการจอง
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <StatBox
                  label="ทั้งหมด"
                  value={bookings.length}
                  valueClass="text-gray-900"
                />
                <StatBox
                  label="รอดำเนินการ"
                  value={
                    bookings.filter((b) => b.status === "รออนุมัติ").length
                  }
                  valueClass="text-orange-500"
                />
                <StatBox
                  label="อนุมัติแล้ว"
                  value={
                    bookings.filter((b) => b.status === "อนุมัติแล้ว").length
                  }
                  valueClass="text-blue-500"
                />
                <StatBox
                  label="เสร็จสิ้น"
                  value={
                    bookings.filter((b) => b.status === "ที่ผ่านมา").length
                  }
                  valueClass="text-green-500"
                />
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
                ลิงก์ด่วน
              </h3>
              <div className="flex flex-col gap-2">
                <Link
                  href="/bookings"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-brand-primary/5 hover:text-brand-primary transition-colors text-sm font-medium text-gray-600"
                >
                  <Plus size={15} className="text-brand-primary" />
                  จองพื้นที่ใหม่
                </Link>
                <Link
                  href="/my-bookings"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-brand-primary/5 hover:text-brand-primary transition-colors text-sm font-medium text-gray-600"
                >
                  <Calendar size={15} className="text-brand-primary" />
                  การจองทั้งหมด
                </Link>
              </div>
            </div>

            {/* Promo card */}
            <div className="bg-gradient-to-br from-brand-primary to-orange-600 rounded-2xl p-5 text-white shadow-lg shadow-brand-primary/20">
              <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-2">
                NEED HELP?
              </p>
              <h3 className="font-bold text-base leading-snug mb-3">
                มีคำถามเกี่ยวกับการจองพื้นที่?
              </h3>
              <p className="text-xs opacity-80 mb-4 leading-relaxed">
                ติดต่อทีมงานของเราเพื่อรับความช่วยเหลือและข้อมูลเพิ่มเติม
              </p>
              <Link href="/requests">
                <button className="bg-white text-brand-primary text-xs font-bold px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors">
                  ติดต่อเรา →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function StatBox({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: number;
  valueClass: string;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 text-center">
      <p className={cn("text-2xl font-bold tabular-nums", valueClass)}>
        {String(value).padStart(2, "0")}
      </p>
      <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}
