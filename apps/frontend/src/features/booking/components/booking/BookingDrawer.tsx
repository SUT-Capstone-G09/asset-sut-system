"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  MapPin, Pencil, Banknote,
  Building2, Maximize2, FileText,
  X, ExternalLink, Calendar, LayoutGrid,
  CreditCard, Hash, User, Clock, CheckCircle2, XCircle, Phone, Mail, Trash2,
  Briefcase, Download
} from "lucide-react";
import { Booking } from "../../types/booking";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import BookingEditDrawer from "./BookingEditDrawer";

interface Props {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: "pending" | "pending_payment" | "verifying_payment" | "approved" | "rejected") => void;
  onEdit: (updated: Booking) => void;
  onDelete: (id: string) => void;
}

export default function BookingDrawer({ 
  booking, 
  open, 
  onClose, 
  onUpdateStatus,
  onEdit,
  onDelete
}: Props) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (!booking) return null;

  const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    pending: {
      label: "รออนุมัติ",
      bg: "bg-amber-50 border-amber-100",
      text: "text-amber-700",
      dot: "bg-amber-500",
    },
    pending_payment: {
      label: "รอชำระเงิน",
      bg: "bg-sky-50 border-sky-100",
      text: "text-sky-700",
      dot: "bg-sky-500",
    },
    verifying_payment: {
      label: "รอตรวจสอบการชำระเงิน",
      bg: "bg-indigo-50 border-indigo-100",
      text: "text-indigo-700",
      dot: "bg-indigo-500",
    },
    approved: {
      label: "อนุมัติแล้ว",
      bg: "bg-emerald-50 border-emerald-100",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    },
    rejected: {
      label: "ปฏิเสธ",
      bg: "bg-red-50 border-red-100",
      text: "text-red-700",
      dot: "bg-red-500",
    },
  };

  const currentStatus = statusConfig[booking.status] || statusConfig.pending;

  const infoItems = [
    {
      icon: MapPin,
      label: "อาคาร / สถานที่",
      value: booking.building,
    },
    {
      icon: Building2,
      label: "เลขที่ห้อง / ชื่อห้อง",
      value: booking.roomNumber,
    },
    {
      icon: LayoutGrid,
      label: "ประเภทห้อง",
      value: booking.category,
    },
    {
      icon: Maximize2,
      label: "จำนวนผู้เข้าร่วมสูงสุด",
      value: `${booking.attendees} คน`,
    },
  ];

  const handleApprove = () => {
    onUpdateStatus(booking.id, "approved");
    alert("อนุมัติคำขอจองสำเร็จ!");
    onClose();
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

  const handleDelete = () => {
    if (confirm("คุณแน่ใจหรือไม่ที่จะลบรายการขอจองนี้?")) {
      onDelete(booking.id);
      alert("ลบรายการขอจองสำเร็จ!");
      onClose();
    }
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
                  <div className={cn("flex items-center gap-1 px-2.5 py-0.5 rounded-[7px] border", currentStatus.bg)}>
                    <div className={cn("size-1.5 rounded-full animate-pulse", currentStatus.dot)} />
                    <span className={cn("text-[9px] font-bold tracking-wide uppercase", currentStatus.text)}>
                      {currentStatus.label}
                    </span>
                  </div>
                  <span className="size-0.5 rounded-full bg-slate-300" />
                  <span className="text-[10px] text-slate-400">ID: {booking.id}</span>
                </div>
              </SheetDescription>
            </div>

            <button
              onClick={onClose}
              className="size-9 rounded-[7px] bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center justify-center group"
            >
              <X size={18} className="transition-transform group-hover:rotate-90" />
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
                  <div key={item.label} className="flex items-center gap-3 px-4 py-3.5 rounded-[7px] bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all group">
                    <div className="size-8 rounded-[7px] bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0 group-hover:border-[#f26522]/20 group-hover:bg-[#f26522]/5 transition-colors">
                      <item.icon size={15} className="text-[#6d6e70] group-hover:text-[#f26522] transition-colors" strokeWidth={2} />
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-[7px] border border-slate-100 bg-slate-50 flex items-center gap-3">
                  <Calendar size={20} className="text-[#f26522]" />
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">วันที่ต้องการใช้</span>
                    <span className="text-sm font-bold text-slate-700">{booking.date}</span>
                  </div>
                </div>
                
                <div className="p-4 rounded-[7px] border border-slate-100 bg-slate-50 flex items-center gap-3">
                  <Clock size={20} className="text-[#f26522]" />
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">ช่วงเวลา</span>
                    <span className="text-sm font-bold text-slate-700">{booking.timeSlot}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-[7px] border border-slate-100 bg-slate-50/50 space-y-2 text-left">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">วัตถุประสงค์ในการขอใช้พื้นที่</span>
                <p className="text-[13px] text-slate-700 font-medium leading-relaxed">{booking.purpose}</p>
              </div>



              {/* Notes */}
              {booking.notes && (
                <div className="p-4 rounded-[7px] border border-slate-100 bg-slate-50/50 space-y-1 text-left">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">หมายเหตุเพิ่มเติม</span>
                  <p className="text-xs text-slate-500 leading-relaxed">{booking.notes}</p>
                </div>
              )}

              {/* Attached Documents */}
              {booking.attachedDocuments && booking.attachedDocuments.length > 0 && (
                <div className="space-y-2 text-left">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block pl-1">เอกสารแนบจากผู้ขอใช้</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {booking.attachedDocuments.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-[7px] bg-slate-50 border border-slate-100 hover:bg-white hover:border-[#f26522]/20 hover:shadow-sm transition-all group">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText size={14} className="text-[#6d6e70] group-hover:text-[#f26522] transition-colors shrink-0" />
                          <span className="text-xs font-bold text-slate-600 truncate">{doc}</span>
                        </div>
                        <a
                          href="#"
                          onClick={(e) => { e.preventDefault(); alert(`ดาวน์โหลดไฟล์: ${doc}`); }}
                          className="text-[10px] font-bold text-[#f26522] hover:text-[#d8561d] transition-colors cursor-pointer shrink-0"
                        >
                          ดาวน์โหลด
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section: Expenses (if any) */}
            {booking.expenses && booking.expenses.length > 0 && (
              <>
                <hr className="border-slate-100" />
                <div className="space-y-4">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 pl-1">
                    <Banknote size={14} className="text-[#f26522]" />
                    ค่าใช้จ่าย (Expenses)
                  </h3>
                  
                  <div className="rounded-[7px] border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                    {booking.expenses.map((exp, index) => (
                      <div key={index} className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-500">{exp.name}</span>
                        <span className="font-extrabold text-slate-700">฿ {Number(exp.amount).toLocaleString()}</span>
                      </div>
                    ))}
                    <hr className="border-slate-200/60" />
                    <div className="flex justify-between items-center text-sm font-black">
                      <span className="text-slate-600">ยอดรวมสุทธิ (Total)</span>
                      <span className="text-[#f26522] text-sm">
                        ฿ {booking.expenses.reduce((sum, item) => sum + Number(item.amount), 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Section: Receipt (if uploaded) */}
            {booking.receiptImage && (
              <>
                <hr className="border-slate-100" />
                <div className="space-y-4 text-left">
                  <div className="flex justify-between items-center pr-1">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 pl-1">
                      <Briefcase size={14} className="text-[#f26522]" />
                      หลักฐานใบเสร็จรับเงิน (Receipt)
                    </h3>
                    <a
                      href={booking.receiptImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <ExternalLink size={10} />
                      เปิดดูไฟล์หลักฐาน
                    </a>
                  </div>
                  
                  <div className="relative rounded-[7px] overflow-hidden border border-slate-200 aspect-video w-full bg-slate-50 group max-w-sm">
                    <img
                      src={booking.receiptImage}
                      alt="Receipt"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <a
                      href={booking.receiptImage}
                      download="receipt.png"
                      onClick={(e) => {
                        if (booking.receiptImage?.startsWith("data:")) {
                          // Allow default download
                        } else {
                          e.preventDefault();
                          alert("ดาวน์โหลดใบเสร็จสำเร็จ!");
                        }
                      }}
                      className="absolute bottom-3 right-3 size-9 rounded-[7px] bg-black/45 backdrop-blur-md text-white hover:bg-white hover:text-slate-900 transition-all flex items-center justify-center cursor-pointer"
                      title="ดาวน์โหลดใบเสร็จ"
                    >
                      <Download size={16} />
                    </a>
                  </div>
                </div>
              </>
            )}

            <hr className="border-slate-100" />

            {/* Section 4: Actions */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 pl-1">
                <Pencil size={14} className="text-[#f26522]" />
                ปุ่มจัดการคำขอจองพื้นที่
              </h3>

              <div className="flex flex-col gap-3">
                {booking.status === "pending" && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleApprove}
                      className="h-12 rounded-[7px] bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 shadow-md shadow-emerald-600/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 size={18} />
                      อนุมัติการจอง
                    </button>
                    <button
                      onClick={handleReject}
                      className="h-12 rounded-[7px] bg-red-600 text-white font-bold text-sm hover:bg-red-700 shadow-md shadow-red-600/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <XCircle size={18} />
                      ปฏิเสธการจอง
                    </button>
                  </div>
                )}

                {booking.status === "pending_payment" && (
                  <div className="bg-sky-50 border border-sky-100 rounded-[7px] p-4 text-center text-xs font-bold text-sky-700 select-none">
                    รอผู้ขอใช้พื้นที่ดำเนินการชำระเงินและแนบหลักฐานใบเสร็จ
                  </div>
                )}

                {booking.status === "verifying_payment" && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleApprove}
                      className="h-12 rounded-[7px] bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 shadow-md shadow-emerald-600/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 size={18} />
                      อนุมัติการจ่ายเงิน
                    </button>
                    <button
                      onClick={() => {
                        onUpdateStatus(booking.id, "pending_payment");
                        alert("ปฏิเสธหลักฐานชำระเงินแล้ว!");
                        onClose();
                      }}
                      className="h-12 rounded-[7px] bg-red-600 text-white font-bold text-sm hover:bg-red-700 shadow-md shadow-red-600/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <XCircle size={18} />
                      ปฏิเสธสลิปชำระเงิน
                    </button>
                  </div>
                )}

                {booking.status === "approved" && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleReject}
                      className="h-12 rounded-[7px] bg-red-600 text-white font-bold text-sm hover:bg-red-700 shadow-md shadow-red-600/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <XCircle size={18} />
                      เปลี่ยนเป็นปฏิเสธการจอง
                    </button>
                    <button
                      onClick={handlePending}
                      className="h-12 rounded-[7px] bg-amber-600 text-white font-bold text-sm hover:bg-amber-700 shadow-md shadow-amber-600/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Clock size={18} />
                      เปลี่ยนเป็นรออนุมัติ
                    </button>
                  </div>
                )}

                {booking.status === "rejected" && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleApprove}
                      className="h-12 rounded-[7px] bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 shadow-md shadow-emerald-600/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 size={18} />
                      เปลี่ยนเป็นอนุมัติการจอง
                    </button>
                    <button
                      onClick={handlePending}
                      className="h-12 rounded-[7px] bg-amber-600 text-white font-bold text-sm hover:bg-amber-700 shadow-md shadow-amber-600/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Clock size={18} />
                      เปลี่ยนเป็นรออนุมัติ
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setIsEditOpen(true)}
                    className="h-12 rounded-[7px] bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Pencil size={16} />
                    แก้ไขข้อมูล
                  </button>
                  <button
                    onClick={handleDelete}
                    className="h-12 rounded-[7px] bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Trash2 size={16} />
                    ลบคำขอจอง
                  </button>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <BookingEditDrawer
        booking={booking}
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={(updated) => {
          onEdit(updated);
          setIsEditOpen(false);
        }}
      />
    </>
  );
}
