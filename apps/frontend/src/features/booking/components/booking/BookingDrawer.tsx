"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MapPin,
  Pencil,
  Building2,
  Maximize2,
  FileText,
  X,
  ExternalLink,
  Calendar,
  CreditCard,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  AlertCircle,
  Hash,
} from "lucide-react";
import { Booking, BOOKING_STATUS_CONFIG } from "../../types/booking";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { useAuthContext } from "@/lib/context/auth-context";
import BookingEditDrawer from "./BookingEditDrawer";
import HallBookingAreaSection from "./HallBookingAreaSection";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const getRecurrenceText = (booking: Booking): string => {
  if (!booking.repeat) return "";
  let freq = "";
  if (booking.repeatFrequency === "daily") freq = "ทุกวัน";
  else if (booking.repeatFrequency === "weekly") {
    const daysMap = [
      "อาทิตย์",
      "จันทร์",
      "อังคาร",
      "พุธ",
      "พฤหัสบดี",
      "ศุกร์",
      "เสาร์",
    ];
    const days = (booking.repeatDaysOfWeek || [])
      .map((d) => daysMap[d])
      .join(", ");
    freq = `ทุกสัปดาห์ (${days ? `เฉพาะวัน${days}` : "ทุกวัน"})`;
  } else if (booking.repeatFrequency === "monthly") freq = "ทุกเดือน";
  else if (booking.repeatFrequency === "custom") {
    const unitMap = { day: "วัน", week: "สัปดาห์", month: "เดือน" };
    const unit = unitMap[booking.repeatCustomUnit || "day"] || "วัน";
    freq = `ทุก ๆ ${booking.repeatCustomInterval || 1} ${unit}`;
  }

  let end = "";
  if (booking.repeatEndDateType === "date" && booking.repeatEndDate) {
    end = ` (สิ้นสุด ณ วันที่ ${booking.repeatEndDate})`;
  } else if (booking.repeatEndDateType === "count" && booking.repeatEndCount) {
    end = ` (สิ้นสุดหลังจากทำซ้ำครบ ${booking.repeatEndCount} ครั้ง)`;
  } else {
    end = " (ไม่มีวันสิ้นสุด)";
  }

  return `${freq}${end}`;
};

// Mirrors validBookingTransitions in apps/backend/internal/services/booking.go —
// keeps the dropdown from offering a move the backend will reject anyway.
// rejected/cancelled/completed are terminal.
const VALID_NEXT_BOOKING_STATUS: Record<string, string[]> = {
  pending: ["approved", "rejected", "cancelled"],
  approved: ["completed", "cancelled"],
  rejected: [],
  cancelled: [],
  completed: [],
};

interface Props {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
  onUpdateStatus: (
    id: string,
    status:
      | "pending"
      | "approved"
      | "rejected"
      | "cancelled"
      | "completed",
  ) => Promise<void> | void;
  onEdit: (updated: Booking) => void;
  initialMode?: "view" | "edit";
}

export default function BookingDrawer({
  booking,
  open,
  onClose,
  onUpdateStatus,
  onEdit,
  initialMode = "view",
}: Props) {
  const { user } = useAuthContext();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();

  React.useEffect(() => {
    (() => {
      setIsEditOpen(open && initialMode === "edit");
    })();
  }, [open, initialMode]);

  if (!booking) return null;

  const currentStatus =
    BOOKING_STATUS_CONFIG[booking.status] || BOOKING_STATUS_CONFIG.pending;

  const validNextStatuses = VALID_NEXT_BOOKING_STATUS[booking.status] ?? [];
  const isStatusSelectable = (status: string) =>
    status === booking.status || validNextStatuses.includes(status);

  // มีพื้นที่บูธที่ผู้ขอเลือก (การจองโถงแบบจำหน่ายสินค้า per_sqm) → แสดง section ผังพื้นที่ที่เลือก
  const hasBoothArea = (booking.hallPurposes || []).some(
    (p) => p.pricingModel === "per_sqm" && (p.selectedCells?.length ?? 0) > 0,
  );

  const infoItems = [
    {
      icon: MapPin,
      label: "อาคาร / สถานที่",
      value: booking.building,
    },
    {
      icon: Maximize2,
      label: "จำนวนผู้เข้าร่วมสูงสุด",
      value: `${booking.attendees} คน`,
    },
  ];

  const handleApproveConfirm = async () => {
    setActionLoading(true);
    try {
      await onUpdateStatus(booking.id, "approved");
      setShowApproveModal(false);
      onClose();
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = () => {
    onUpdateStatus(booking.id, "rejected");
    alert("ปฏิเสธคำขอจองแล้ว!");
    onClose();
  };

  const handlePending = () => {
    onUpdateStatus(booking.id, "pending");
    alert("เปลี่ยนสถานะการจองเป็นรออนุมัติสำเร็จ!");
    onClose();
  };

  const handleCancelConfirm = async () => {
    setActionLoading(true);
    try {
      await onUpdateStatus(booking.id, "cancelled");
      setShowCancelModal(false);
      onClose();
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditClick = () => {
    setIsEditOpen(true);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full sm:max-w-[640px] p-0 border-none bg-white flex flex-col h-full shadow-2xl"
        >
          {/* Header */}
          <SheetHeader className="px-6 py-5 border-b border-slate-100 flex flex-row items-center justify-between space-y-0 shrink-0 bg-white">
            <div className="space-y-1">
              <SheetTitle className="text-lg font-bold text-slate-900 tracking-tight text-left">
                {booking.roomName}
              </SheetTitle>

              <SheetDescription asChild>
                <div className="flex items-center gap-1.5 text-left">
                  <Select
                    value={booking.status}
                    onValueChange={async (val) => {
                      if (val === "approved" && booking.status === "pending") {
                        setShowApproveModal(true);
                        return;
                      }
                      if (val === "cancelled") {
                        setShowCancelModal(true);
                        return;
                      }
                      try {
                        await onUpdateStatus(booking.id, val as any);
                      } catch (err) {
                        alert(
                          err instanceof Error
                            ? err.message
                            : "เปลี่ยนสถานะไม่สำเร็จ"
                        );
                      }
                    }}
                  >
                    <SelectTrigger
                      className={cn(
                        "h-9 px-3.5 py-1 text-xs font-black uppercase tracking-wider rounded-[7px] border focus:ring-0 focus:ring-offset-0 cursor-pointer flex items-center shadow-none border-slate-200",
                        currentStatus.drawerBg,
                        currentStatus.drawerText,
                      )}
                    >
                      <SelectValue placeholder="เลือกสถานะ" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-[200]">
                      <SelectItem
                        value="pending"
                        disabled={!isStatusSelectable("pending")}
                        className="text-xs font-bold text-amber-700 focus:bg-amber-50"
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="size-1.5 rounded-full bg-amber-500" />
                          <span>รออนุมัติ</span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="approved"
                        disabled={!isStatusSelectable("approved")}
                        className="text-xs font-bold text-emerald-700 focus:bg-emerald-50"
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="size-1.5 rounded-full bg-emerald-500" />
                          <span>อนุมัติ</span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="rejected"
                        disabled={!isStatusSelectable("rejected")}
                        className="text-xs font-bold text-red-600 focus:bg-red-50"
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="size-1.5 rounded-full bg-red-500" />
                          <span>ปฏิเสธ</span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="cancelled"
                        disabled={!isStatusSelectable("cancelled")}
                        className="text-xs font-bold text-slate-600 focus:bg-slate-50"
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="size-1.5 rounded-full bg-slate-400" />
                          <span>ยกเลิก</span>
                        </div>
                      </SelectItem>

                      <SelectItem
                        value="completed"
                        disabled={!isStatusSelectable("completed")}
                        className="text-xs font-bold text-teal-700 focus:bg-teal-50"
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="size-1.5 rounded-full bg-teal-500" />
                          <span>เสร็จสิ้น</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="size-0.5 rounded-full bg-slate-300" />
                  <span className="text-[10px] text-slate-400">
                    ID: {booking.id}
                  </span>
                </div>
              </SheetDescription>
            </div>

            <button
              onClick={onClose}
              className="size-9 rounded-[7px] bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center justify-center group"
            >
              <X
                size={18}
                className="transition-transform group-hover:rotate-90"
              />
            </button>
          </SheetHeader>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
            {/* Image Preview */}
            <div className="relative rounded-[7px] overflow-hidden h-56 w-full bg-slate-100 group">
              <img
                src={booking.image}
                alt={booking.roomName}
                suppressHydrationWarning={true}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              <button className="absolute bottom-3 right-3 size-9 rounded-[7px] bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-slate-900 transition-all flex items-center justify-center">
                <ExternalLink size={16} />
              </button>
            </div>

            {/* Section 1: General Info */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 pl-1">
                <Building2 size={14} className="text-[#f26522]" />
                ข้อมูลของห้องและพื้นที่
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {infoItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-[7px] bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all group"
                  >
                    <div className="size-8 rounded-[7px] bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0 group-hover:border-[#f26522]/20 group-hover:bg-[#f26522]/5 transition-colors">
                      <item.icon
                        size={15}
                        className="text-[#6d6e70] group-hover:text-[#f26522] transition-colors"
                        strokeWidth={2}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold text-slate-400 mb-0.5 uppercase tracking-widest">
                        {item.label}
                      </p>
                      <p className="text-[12px] font-bold text-slate-700 truncate">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section 2: Requester Details */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 pl-1">
                <User size={14} className="text-[#f26522]" />
                ข้อมูลผู้ยื่นคำขอจองพื้นที่
              </h3>

              <div className="rounded-[7px] border border-slate-100 bg-[#f26522]/5 p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                      ชื่อ-นามสกุล ผู้ขอใช้งาน
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-[4px] bg-white flex items-center justify-center border border-[#f26522]/10 shrink-0">
                        <User size={12} className="text-[#f26522]" />
                      </div>
                      <span className="text-[13px] font-bold text-slate-700 truncate">
                        {booking.requesterName}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                      รหัสประจำตัว (ID)
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-[4px] bg-white flex items-center justify-center border border-[#f26522]/10 shrink-0">
                        <CreditCard size={12} className="text-[#f26522]" />
                      </div>
                      <span className="text-[13px] font-bold text-slate-700 font-mono">
                        {booking.requesterId}
                      </span>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-200/40" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                      เบอร์โทรศัพท์ติดต่อ
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-[4px] bg-white flex items-center justify-center border border-[#f26522]/10 shrink-0">
                        <Phone size={12} className="text-[#f26522]" />
                      </div>
                      <span className="text-[13px] font-bold text-slate-700 font-mono">
                        {booking.contactPhone || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                      อีเมลสถาบัน
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-[4px] bg-white flex items-center justify-center border border-[#f26522]/10 shrink-0">
                        <Mail size={12} className="text-[#f26522]" />
                      </div>
                      <span className="text-[13px] font-bold text-slate-700 truncate">
                        {booking.contactEmail || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section 3: Booking Details & Purpose */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 pl-1">
                <FileText size={14} className="text-[#f26522]" />
                รายละเอียดการจองใช้พื้นที่
              </h3>

              {booking.timeslots && booking.timeslots.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {booking.timeslots.map((ts) => (
                    <div key={ts.id} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-[7px] border border-slate-100 bg-slate-50 flex items-center gap-3">
                        <Calendar size={20} className="text-[#f26522]" />
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            วันที่ต้องการใช้
                          </span>
                          <span className="text-sm font-bold text-slate-700">
                            {ts.date}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 rounded-[7px] border border-slate-100 bg-slate-50 flex items-center gap-3">
                        <Clock size={20} className="text-[#f26522]" />
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            ช่วงเวลา
                          </span>
                          <span className="text-sm font-bold text-slate-700">
                            {ts.timeSlot}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-[7px] border border-slate-100 bg-slate-50 flex items-center gap-3">
                    <Calendar size={20} className="text-[#f26522]" />
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                        วันที่ต้องการใช้
                      </span>
                      <span className="text-sm font-bold text-slate-700">
                        {booking.date}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-[7px] border border-slate-100 bg-slate-50 flex items-center gap-3">
                    <Clock size={20} className="text-[#f26522]" />
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                        ช่วงเวลา
                      </span>
                      <span className="text-sm font-bold text-slate-700">
                        {booking.timeSlot}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Created Date */}
              <div className="p-4 rounded-[7px] border border-slate-100 bg-slate-50 flex items-center gap-3">
                <Hash size={20} className="text-[#f26522]" />
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                    วันที่ยื่นคำขอจอง
                  </span>
                  <span className="text-sm font-bold text-slate-700">
                    {booking.createdAt}
                  </span>
                </div>
              </div>

              {booking.repeat && (
                <div className="p-4 rounded-[7px] border border-emerald-100 bg-emerald-50/40 space-y-2 text-left">
                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider block">
                    การตั้งค่าการทำซ้ำ (Repeat Settings)
                  </span>
                  <p className="text-[13px] text-emerald-800 font-bold leading-relaxed">
                    ทำซ้ำ: {getRecurrenceText(booking)}
                  </p>
                </div>
              )}

              <div className="p-4 rounded-[7px] border border-slate-100 bg-slate-50/50 space-y-2 text-left">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                  วัตถุประสงค์ในการขอใช้พื้นที่
                </span>
                <p className="text-[13px] text-slate-700 font-medium leading-relaxed">
                  {booking.purpose}
                </p>
              </div>

              {/* Notes */}
              {booking.notes && (
                <div className="p-4 rounded-[7px] border border-slate-100 bg-slate-50/50 space-y-1 text-left">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                    หมายเหตุเพิ่มเติม
                  </span>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {booking.notes}
                  </p>
                </div>
              )}

              {/* Attached Documents */}
              {booking.attachedDocuments &&
                booking.attachedDocuments.length > 0 && (
                  <div className="space-y-2 text-left">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block pl-1">
                      เอกสารแนบจากผู้ขอใช้
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {booking.attachedDocuments.map((doc, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-[7px] bg-slate-50 border border-slate-100 hover:bg-white hover:border-[#f26522]/20 hover:shadow-sm transition-all group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText
                              size={14}
                              className="text-[#6d6e70] group-hover:text-[#f26522] transition-colors shrink-0"
                            />
                            <span className="text-xs font-bold text-slate-600 truncate">
                              {(() => {
                                try {
                                  return decodeURIComponent(doc.split('?')[0].split('/').pop() || 'เอกสารแนบ');
                                } catch (e) {
                                  return doc.split('?')[0].split('/').pop() || 'เอกสารแนบ';
                                }
                              })()}
                            </span>
                          </div>
                          <a
                            href={doc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-[#f26522] hover:text-[#d8561d] transition-colors cursor-pointer shrink-0"
                          >
                            ดาวน์โหลด/ดูไฟล์
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Section: พื้นที่ที่เลือก (โถง — จำหน่ายสินค้า per_sqm) */}
            {hasBoothArea && (
              <>
                <hr className="border-slate-100" />
                <HallBookingAreaSection
                  locationId={booking.locationId}
                  purposes={booking.hallPurposes}
                />
              </>
            )}

            {/* Section 4: Actions */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 pl-1">
                <Pencil size={14} className="text-[#f26522]" />
                ปุ่มจัดการคำขอจองพื้นที่
              </h3>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleEditClick}
                  className="h-12 rounded-[7px] bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Pencil size={16} />
                  แก้ไขข้อมูล
                </button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Approve Confirmation Modal */}
      {booking && (
        <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
          <DialogContent className="max-w-md rounded-2xl border-none shadow-2xl p-0 overflow-hidden z-[300]">
            <DialogHeader className="p-6 pb-0 border-b-0">
              <DialogTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500" size={24} />
                ยืนยันการอนุมัติการจอง
              </DialogTitle>
            </DialogHeader>
            
            <div className="p-6 pt-4 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center space-y-2">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">ยอดชำระทั้งหมด</span>
                <span className="text-3xl font-black text-[#f26522]">
                  {(() => {
                    const total = booking.totalPrice !== undefined 
                      ? booking.totalPrice 
                      : (booking.basePrice || 0) + (booking.expenses || []).reduce((acc, exp) => acc + (exp.amount || 0), 0);
                    
                    return total === 0 
                      ? "ไม่มีค่าใช้จ่าย" 
                      : `฿${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
                  })()}
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

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              {user?.role !== "staff" ? (
                <Button
                  variant="outline"
                  onClick={() => router.push(`/admin/booking/${booking.id}/expenses`)}
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
                  onClick={() => setShowApproveModal(false)}
                  className="h-11 rounded-[7px] font-bold text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                >
                  ยกเลิก
                </Button>
                <Button
                  onClick={handleApproveConfirm}
                  disabled={actionLoading}
                  className="h-11 rounded-[7px] font-bold bg-[var(--color-brand-primary)] hover:opacity-90 text-white min-w-[120px]"
                >
                  {actionLoading ? (
                    <div className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    "ยืนยันการอนุมัติ"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Cancel Confirmation Modal */}
      {booking && (
        <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
          <DialogContent className="max-w-md rounded-2xl border-none shadow-2xl p-0 overflow-hidden z-[300]">
            <DialogHeader className="p-6 pb-0 border-b-0">
              <DialogTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
                <XCircle className="text-slate-400" size={24} />
                ยืนยันการยกเลิกคำขอจอง
              </DialogTitle>
            </DialogHeader>

            <div className="p-6 pt-4">
              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <AlertCircle className="text-slate-400 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  คุณแน่ใจหรือไม่ที่จะยกเลิกคำขอจองนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowCancelModal(false)}
                className="h-11 rounded-[7px] font-bold text-slate-500 hover:bg-slate-200 hover:text-slate-700"
              >
                ปิด
              </Button>
              <Button
                onClick={handleCancelConfirm}
                disabled={actionLoading}
                className="h-11 rounded-[7px] font-bold bg-red-600 hover:bg-red-700 text-white min-w-[120px]"
              >
                {actionLoading ? (
                  <div className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  "ยืนยันการยกเลิก"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <BookingEditDrawer
        booking={booking}
        open={isEditOpen}
        onClose={() => {
          if (initialMode === "edit") {
            onClose();
          } else {
            setIsEditOpen(false);
          }
        }}
        onSave={(updated) => {
          onEdit(updated);
          if (initialMode === "edit") {
            onClose();
          } else {
            setIsEditOpen(false);
          }
        }}
      />
    </>
  );
}

