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
  Banknote,
  Building2,
  Maximize2,
  FileText,
  X,
  ExternalLink,
  Calendar,
  LayoutGrid,
  CreditCard,
  Hash,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  Trash2,
  Briefcase,
  Download,
  Plus,
  Search,
} from "lucide-react";
import { Booking, BOOKING_STATUS_CONFIG } from "../../types/booking";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import BookingEditDrawer from "./BookingEditDrawer";
import { mockRooms } from "../../data/rooms";
import { mockExpenses } from "../../data/expenses";
import { getHoursFromTimeSlot } from "../../utils/time";
import ImageUpload from "@/features/areas/components/admin/forms/ImageUpload";

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
    freq = `ทุกๆ ${booking.repeatCustomInterval || 1} ${unit}`;
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

interface Props {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
  onUpdateStatus: (
    id: string,
    status:
      | "pending"
      | "pending_payment"
      | "verifying_payment"
      | "approved"
      | "rejected",
  ) => void;
  onEdit: (updated: Booking, mode: "this" | "following" | "all") => void;
  onDelete: (
    idOrFilter:
      | string
      | {
          id: string;
          recurringGroupId: string;
          mode: "this" | "following" | "all";
          date: string;
        },
  ) => void;
}

export default function BookingDrawer({
  booking,
  open,
  onClose,
  onUpdateStatus,
  onEdit,
  onDelete,
}: Props) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [recurrenceDialogOpen, setRecurrenceDialogOpen] = useState(false);
  const [recurrenceActionType, setRecurrenceActionType] = useState<
    "edit" | "delete" | null
  >(null);
  const [selectedRecurrenceMode, setSelectedRecurrenceMode] = useState<
    "this" | "following" | "all"
  >("this");

  const [isEditingExpenses, setIsEditingExpenses] = useState(false);
  const [editedExpenses, setEditedExpenses] = useState<any[]>([]);
  const [housekeeperPrice, setHousekeeperPrice] = useState(0);
  const [housekeeperCount, setHousekeeperCount] = useState(0);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [expenseSearchQuery, setExpenseSearchQuery] = useState("");

  React.useEffect(() => {
    if (booking) {
      const customExps = (booking.expenses || []).filter(
        (exp) =>
          !exp.name.startsWith("ค่าห้อง") && !exp.name.startsWith("ค่าแม่บ้าน"),
      );
      setEditedExpenses(customExps);
      setHousekeeperPrice(booking.housekeeperPrice || 0);
      setHousekeeperCount(booking.housekeeperCount || 0);
      setIsEditingExpenses(false);
    }
  }, [booking]);

  const handleAddExpenseItem = () => {
    setEditedExpenses((prev) => [...prev, { name: "", amount: 0 }]);
  };

  const handleRemoveExpenseItem = (index: number) => {
    setEditedExpenses((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleExpenseChange = (
    index: number,
    key: "name" | "amount",
    value: any,
  ) => {
    setEditedExpenses((prev) =>
      prev.map((exp, idx) => {
        if (idx === index) {
          return {
            ...exp,
            [key]: key === "amount" ? Number(value) || 0 : value,
          };
        }
        return exp;
      }),
    );
  };

  // Helper values for auto-calculated expenses
  const room = booking
    ? mockRooms.find(
        (r) =>
          r.roomNumber === booking.roomNumber ||
          r.roomName === booking.roomName,
      )
    : null;
  const isInternal = booking
    ? booking.requesterType === "student" || booking.requesterType === "staff"
    : false;
  const hours = booking ? getHoursFromTimeSlot(booking.timeSlot || "") : 0;
  const useDaily = hours > 4;
  const hourlyRate = isInternal
    ? (room?.rates?.hourlyInternal ?? 150)
    : (room?.rates?.hourlyExternal ?? 400);
  const dailyRate = isInternal
    ? (room?.rates?.dailyInternal ?? 1000)
    : (room?.rates?.dailyExternal ?? 2500);
  const roomFeeName = useDaily
    ? "ค่าห้องรายวัน"
    : `ค่าห้องรายชั่วโมง (${hourlyRate} บาท/ชม. x ${hours} ชม.)`;
  const roomFeeAmount = useDaily ? dailyRate : hourlyRate * hours;

  const housekeeperFeeName = `ค่าแม่บ้าน (${housekeeperPrice} บาท/คน x ${housekeeperCount} คน)`;
  const housekeeperFeeAmount = housekeeperPrice * housekeeperCount;

  const totalExpensesComputed =
    roomFeeAmount +
    housekeeperFeeAmount +
    editedExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const handleSaveExpenses = () => {
    if (!booking) return;

    const finalExpenses = [
      { name: roomFeeName, amount: roomFeeAmount },
      ...(housekeeperFeeAmount > 0
        ? [{ name: housekeeperFeeName, amount: housekeeperFeeAmount }]
        : []),
      ...editedExpenses,
    ];

    const updated: Booking = {
      ...booking,
      expenses: finalExpenses,
      housekeeperPrice,
      housekeeperCount,
      expenseStatus: "draft",
    };
    onEdit(updated, "this");
    setIsEditingExpenses(false);
    alert("บันทึกค่าใช้จ่ายชั่วคราวแล้ว (ต้องกดแจ้งผู้ใช้เพื่อส่งข้อมูล)");
  };

  const handleNotifyExpenses = () => {
    if (!booking) return;
    const updated: Booking = {
      ...booking,
      expenseStatus: "sent",
    };
    onEdit(updated, "this");
    alert("แจ้งค่าใช้จ่ายไปยังผู้ขอใช้พื้นที่สำเร็จแล้ว!");
  };

  if (!booking) return null;

  const currentStatus =
    BOOKING_STATUS_CONFIG[booking.status] || BOOKING_STATUS_CONFIG.pending;

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
    if (booking.recurringGroupId) {
      setRecurrenceActionType("delete");
      setSelectedRecurrenceMode("this");
      setRecurrenceDialogOpen(true);
    } else {
      if (confirm("คุณแน่ใจหรือไม่ที่จะลบรายการขอจองนี้?")) {
        onDelete(booking.id);
        alert("ลบรายการขอจองสำเร็จ!");
        onClose();
      }
    }
  };

  const handleEditClick = () => {
    if (booking.recurringGroupId) {
      setRecurrenceActionType("edit");
      setSelectedRecurrenceMode("this");
      setRecurrenceDialogOpen(true);
    } else {
      setIsEditOpen(true);
    }
  };

  const handleConfirmRecurrenceAction = () => {
    setRecurrenceDialogOpen(false);
    if (recurrenceActionType === "delete") {
      onDelete({
        id: booking.id,
        recurringGroupId: booking.recurringGroupId!,
        mode: selectedRecurrenceMode,
        date: booking.date,
      });
      alert("ลบรายการขอจองสำเร็จ!");
      onClose();
    } else if (recurrenceActionType === "edit") {
      setIsEditOpen(true);
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
                  <Select
                    value={booking.status}
                    onValueChange={(val) => {
                      onUpdateStatus(booking.id, val as any);
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
                        className="text-xs font-bold text-amber-700 focus:bg-amber-50"
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="size-1.5 rounded-full bg-amber-500" />
                          <span>รออนุมัติ</span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="pending_payment"
                        className="text-xs font-bold text-sky-700 focus:bg-sky-50"
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="size-1.5 rounded-full bg-sky-500" />
                          <span>รอชำระเงิน</span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="verifying_payment"
                        className="text-xs font-bold text-indigo-700 focus:bg-indigo-50"
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="size-1.5 rounded-full bg-indigo-500" />
                          <span>รอตรวจสอบการชำระเงิน</span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="approved"
                        className="text-xs font-bold text-emerald-700 focus:bg-emerald-50"
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="size-1.5 rounded-full bg-emerald-500" />
                          <span>อนุมัติแล้ว</span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="rejected"
                        className="text-xs font-bold text-red-600 focus:bg-red-50"
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="size-1.5 rounded-full bg-red-500" />
                          <span>ปฏิเสธ</span>
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
                              {doc}
                            </span>
                          </div>
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              alert(`ดาวน์โหลดไฟล์: ${doc}`);
                            }}
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

            {/* Section: Expenses (either has expenses, or status is pending_payment, or is editing) */}
            {((booking.expenses && booking.expenses.length > 0) ||
              booking.status === "pending_payment" ||
              isEditingExpenses) && (
              <>
                <hr className="border-slate-100" />
                <div className="space-y-4">
                  <div className="flex justify-between items-center pr-1">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 pl-1">
                      <Banknote size={14} className="text-[#f26522]" />
                      ค่าใช้จ่าย (Expenses)
                    </h3>
                    {booking.status === "pending_payment" && (
                      <span
                        className={cn(
                          "text-[9px] font-black px-2 py-0.5 rounded-[5px] border uppercase tracking-wider",
                          booking.expenseStatus === "sent"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-amber-50 text-amber-700 border-amber-100",
                        )}
                      >
                        {booking.expenseStatus === "sent"
                          ? "แจ้งผู้ใช้งานแล้ว"
                          : "ฉบับร่าง (ยังไม่ได้แจ้ง)"}
                      </span>
                    )}
                  </div>

                  {isEditingExpenses ? (
                    /* Inline Editor Mode (drawn from BookingFormFields.tsx design) */
                    <div className="space-y-4">
                      {/* Housekeeper Settings card */}
                      <div className="bg-slate-50/50 p-4 border border-slate-200/60 rounded-xl space-y-3 mb-4 text-left">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#f26522]" />
                          <span className="text-xs font-extrabold text-slate-700">
                            ตั้งค่าค่าบริการแม่บ้าน (Housekeeper Settings)
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5 text-left">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                              ราคาค่าแม่บ้านต่อคน (฿)
                            </span>
                            <input
                              type="number"
                              min="0"
                              placeholder="เช่น 450"
                              value={housekeeperPrice || ""}
                              onChange={(e) =>
                                setHousekeeperPrice(Number(e.target.value) || 0)
                              }
                              className="w-full h-10 px-3 bg-white border border-slate-200 focus:outline-none focus:border-[#f26522] rounded-[7px] text-xs font-bold text-slate-700"
                            />
                          </div>
                          <div className="space-y-1.5 text-left">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                              จำนวนแม่บ้าน (คน)
                            </span>
                            <input
                              type="number"
                              min="0"
                              placeholder="เช่น 2"
                              value={housekeeperCount || ""}
                              onChange={(e) =>
                                setHousekeeperCount(Number(e.target.value) || 0)
                              }
                              className="w-full h-10 px-3 bg-white border border-slate-200 focus:outline-none focus:border-[#f26522] rounded-[7px] text-xs font-bold text-slate-700"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Header for list and Add button */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">
                          รายการค่าใช้จ่ายทั้งหมด
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsAddExpenseModalOpen(true)}
                          className="text-xs font-bold text-[#f26522] hover:text-[#d8561d] transition-colors flex items-center gap-1 cursor-pointer focus:outline-none bg-transparent border-none py-1 px-2 rounded hover:bg-slate-50"
                        >
                          <Plus size={14} strokeWidth={2.5} />
                          เพิ่มรายการ
                        </button>
                      </div>

                      {/* List of expenses including read-only ones */}
                      <div className="space-y-3.5 bg-slate-50/30 border border-slate-200/60 rounded-[7px] p-4 text-left">
                        {/* 1. Room Fee (Read-only) */}
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs font-bold text-slate-400 truncate flex-1 select-none">
                            {roomFeeName}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center rounded-lg border border-slate-200/50 bg-slate-50/80 w-[160px] h-10 shadow-sm overflow-hidden">
                              <input
                                type="text"
                                readOnly
                                value={roomFeeAmount}
                                className="w-full h-full px-3 outline-none border-none text-left font-bold text-slate-400 bg-transparent text-xs cursor-not-allowed"
                              />
                              <div className="h-full px-3 bg-slate-100 border-l border-slate-100 flex items-center text-[10px] font-bold text-slate-400 select-none">
                                บาท
                              </div>
                            </div>
                            <div className="size-8 shrink-0" />
                          </div>
                        </div>

                        {/* 2. Housekeeper Fee (Read-only, if count/price > 0) */}
                        {housekeeperFeeAmount > 0 && (
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-xs font-bold text-slate-400 truncate flex-1 select-none">
                              {housekeeperFeeName}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center rounded-lg border border-slate-200/50 bg-slate-50/80 w-[160px] h-10 shadow-sm overflow-hidden">
                                <input
                                  type="text"
                                  readOnly
                                  value={housekeeperFeeAmount}
                                  className="w-full h-full px-3 outline-none border-none text-left font-bold text-slate-400 bg-transparent text-xs cursor-not-allowed"
                                />
                                <div className="h-full px-3 bg-slate-100 border-l border-slate-100 flex items-center text-[10px] font-bold text-slate-400 select-none">
                                  บาท
                                </div>
                              </div>
                              <div className="size-8 shrink-0" />
                            </div>
                          </div>
                        )}

                        {/* 3. Custom Expenses (Editable) */}
                        {editedExpenses.map((exp, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between gap-4 group"
                          >
                            <span className="text-xs font-bold text-slate-500 truncate flex-1 select-none">
                              {exp.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center rounded-lg border border-slate-200 bg-white focus-within:ring-1 focus-within:ring-[#f26522]/30 focus-within:border-[#f26522] transition-all overflow-hidden w-[160px] h-10 shadow-sm">
                                <input
                                  type="number"
                                  value={exp.amount || ""}
                                  onChange={(e) =>
                                    handleExpenseChange(
                                      index,
                                      "amount",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full h-full px-3 outline-none border-none text-left font-bold text-slate-700 bg-transparent text-xs"
                                  placeholder="0"
                                />
                                <div className="h-full px-3 bg-slate-50 border-l border-slate-100 flex items-center text-[10px] font-bold text-slate-400 select-none">
                                  บาท
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveExpenseItem(index)}
                                className="size-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center cursor-pointer shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:bg-red-50 focus:text-red-500"
                                title="ลบรายการ"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Total Sum */}
                        <div className="flex items-center justify-between pt-4 border-t border-dashed border-slate-200">
                          <span className="text-xs font-black text-slate-700 select-none">
                            ยอดรวมสุทธิ (Total)
                          </span>
                          <span className="text-sm font-black text-slate-800">
                            {totalExpensesComputed.toLocaleString()} บาท
                          </span>
                        </div>
                      </div>

                      {/* Inline editor action buttons */}
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingExpenses(false);
                            // Restore original housekeeper settings and filter original custom expenses
                            const customExps = (booking.expenses || []).filter(
                              (exp) =>
                                !exp.name.startsWith("ค่าห้อง") &&
                                !exp.name.startsWith("ค่าแม่บ้าน"),
                            );
                            setEditedExpenses(customExps);
                            setHousekeeperPrice(booking.housekeeperPrice || 0);
                            setHousekeeperCount(booking.housekeeperCount || 0);
                          }}
                          className="flex-1 h-10 rounded-[7px] bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold text-xs transition-all cursor-pointer"
                        >
                          ยกเลิก
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveExpenses}
                          className="flex-1 h-10 rounded-[7px] bg-[#f26522] text-white hover:bg-[#d8561d] font-bold text-xs shadow-sm transition-all cursor-pointer"
                        >
                          บันทึกค่าใช้จ่าย
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Read-only List Mode */
                    <div className="rounded-[7px] border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                      {(booking.expenses || []).map((exp, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center text-xs"
                        >
                          <span className="font-bold text-slate-500">
                            {exp.name}
                          </span>
                          <span className="font-extrabold text-slate-700">
                            ฿ {Number(exp.amount).toLocaleString()}
                          </span>
                        </div>
                      ))}
                      {(!booking.expenses || booking.expenses.length === 0) && (
                        <p className="text-xs text-slate-400 text-center py-2">
                          ไม่มีค่าใช้จ่ายสำหรับคำขอนี้
                        </p>
                      )}
                      <hr className="border-slate-200/60" />
                      <div className="flex justify-between items-center text-sm font-black">
                        <span className="text-slate-600">
                          ยอดรวมสุทธิ (Total)
                        </span>
                        <span className="text-[#f26522] text-sm">
                          ฿{" "}
                          {(booking.expenses || [])
                            .reduce((sum, item) => sum + Number(item.amount), 0)
                            .toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Buttons when status is pending_payment and not in editing mode */}
                  {booking.status === "pending_payment" &&
                    !isEditingExpenses && (
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                          onClick={() => {
                            const customExps = (booking.expenses || []).filter(
                              (exp) =>
                                !exp.name.startsWith("ค่าห้อง") &&
                                !exp.name.startsWith("ค่าแม่บ้าน"),
                            );
                            setEditedExpenses(customExps);
                            setHousekeeperPrice(booking.housekeeperPrice || 0);
                            setHousekeeperCount(booking.housekeeperCount || 0);
                            setIsEditingExpenses(true);
                          }}
                          className="h-10 rounded-[7px] bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Pencil size={12} />
                          แก้ไขค่าใช้จ่าย
                        </button>
                        <button
                          onClick={handleNotifyExpenses}
                          disabled={booking.expenseStatus === "sent"}
                          className={cn(
                            "h-10 rounded-[7px] font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm",
                            booking.expenseStatus === "sent"
                              ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                              : "bg-[#f26522] text-white hover:bg-[#d8561d] shadow-[#f26522]/10",
                          )}
                        >
                          <Banknote size={12} />
                          แจ้งค่าใช้จ่าย
                        </button>
                      </div>
                    )}

                  {/* Modal Popup Dialog for Selecting Expenses (drawn from BookingFormFields.tsx design) */}
                  <Dialog
                    open={isAddExpenseModalOpen}
                    onOpenChange={setIsAddExpenseModalOpen}
                  >
                    <DialogContent className="w-[95vw] max-w-[420px] p-6 bg-white rounded-[24px] border-none shadow-2xl flex flex-col gap-4 overflow-hidden transform -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
                      <DialogHeader className="text-left pb-2 border-b border-slate-100 relative pr-6">
                        <DialogTitle className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                          <Banknote
                            className="text-[#f26522]"
                            size={18}
                            strokeWidth={2.5}
                          />
                          เลือกรายการค่าใช้จ่ายเพิ่มเติม
                        </DialogTitle>
                      </DialogHeader>

                      {/* Search Field */}
                      <div className="relative">
                        <Search
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                          size={14}
                        />
                        <input
                          type="text"
                          placeholder="ค้นหารายการ หรือหมวดหมู่..."
                          value={expenseSearchQuery}
                          onChange={(e) =>
                            setExpenseSearchQuery(e.target.value)
                          }
                          className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f26522]/10 focus:border-[#f26522] focus:bg-white transition-all font-bold"
                        />
                      </div>

                      {/* Expenses List */}
                      <div className="max-h-[260px] overflow-y-auto custom-scrollbar space-y-2 pr-1 text-left">
                        {mockExpenses.filter((exp) => {
                          const displayName = exp.itemName.startsWith("ค่า")
                            ? exp.itemName
                            : `ค่า${exp.itemName}`;
                          return (
                            displayName
                              .toLowerCase()
                              .includes(expenseSearchQuery.toLowerCase()) ||
                            exp.category
                              .toLowerCase()
                              .includes(expenseSearchQuery.toLowerCase())
                          );
                        }).length > 0 ? (
                          mockExpenses
                            .filter((exp) => {
                              const displayName = exp.itemName.startsWith("ค่า")
                                ? exp.itemName
                                : `ค่า${exp.itemName}`;
                              return (
                                displayName
                                  .toLowerCase()
                                  .includes(expenseSearchQuery.toLowerCase()) ||
                                exp.category
                                  .toLowerCase()
                                  .includes(expenseSearchQuery.toLowerCase())
                              );
                            })
                            .map((exp) => {
                              const displayName = exp.itemName.startsWith("ค่า")
                                ? exp.itemName
                                : `ค่า${exp.itemName}`;
                              return (
                                <button
                                  key={exp.id}
                                  type="button"
                                  onClick={() => {
                                    setEditedExpenses((prev) => [
                                      ...prev,
                                      {
                                        name: displayName,
                                        amount: exp.pricePerUnit,
                                      },
                                    ]);
                                    setIsAddExpenseModalOpen(false);
                                    setExpenseSearchQuery("");
                                  }}
                                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-[#f26522]/20 hover:bg-[#f26522]/5 hover:shadow-sm transition-all group text-left cursor-pointer bg-white"
                                >
                                  <div className="min-w-0 flex-1 pr-3">
                                    <p className="text-xs font-black text-slate-700 group-hover:text-[#f26522] transition-colors truncate">
                                      {displayName}
                                    </p>
                                    <p className="text-[9px] font-bold text-slate-400 mt-0.5 tracking-wider uppercase">
                                      {exp.category}
                                    </p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="text-xs font-black text-slate-800 bg-slate-50 group-hover:bg-[#f26522]/10 group-hover:text-[#f26522] px-2.5 py-1 rounded-lg transition-colors">
                                      ฿{exp.pricePerUnit.toLocaleString()}
                                    </span>
                                  </div>
                                </button>
                              );
                            })
                        ) : (
                          <div className="text-center py-8 text-xs font-bold text-slate-400">
                            ไม่พบรายการค่าใช้จ่าย
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </>
            )}

            {/* Section: Receipt (if uploaded) */}
            {booking.receiptImage ? (
              <>
                <hr className="border-slate-100" />
                <div className="space-y-4 text-left">
                  <div className="flex justify-between items-center pr-1">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 pl-1">
                      <Briefcase size={14} className="text-[#f26522]" />
                      หลักฐานใบเสร็จรับเงิน (Receipt)
                    </h3>
                    <div className="flex items-center gap-2.5">
                      <a
                        href={booking.receiptImage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <ExternalLink size={10} />
                        เปิดดูไฟล์หลักฐาน
                      </a>
                      <span className="size-1 rounded-full bg-slate-300" />
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("คุณแน่ใจหรือไม่ที่จะยกเลิกหลักฐานชำระเงินเดิม?")) {
                            const updated = {
                              ...booking,
                              receiptImage: undefined,
                              status: booking.status === "verifying_payment" ? "pending_payment" : booking.status,
                            };
                            onEdit(updated, "this");
                            alert("ยกเลิกหลักฐานการชำระเงินสำเร็จ กรุณาอัปโหลดสลิปใหม่");
                          }
                        }}
                        className="text-[10px] font-bold text-red-500 hover:text-red-600 hover:underline cursor-pointer focus:outline-none bg-transparent border-none p-0"
                      >
                        เปลี่ยนไฟล์หลักฐาน
                      </button>
                    </div>
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
            ) : (
              /* If no receipt image but payment is required (has expenses) */
              booking.expenses && booking.expenses.length > 0 && (
                <>
                  <hr className="border-slate-100" />
                  <div className="space-y-4 text-left">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 pl-1">
                      <Briefcase size={14} className="text-[#f26522]" />
                      อัปโหลดหลักฐานการชำระเงิน (Upload Receipt Slip)
                    </h3>
                    <div className="max-w-sm">
                      <ImageUpload
                        value=""
                        onChange={(url) => {
                          if (url) {
                            const updated = {
                              ...booking,
                              receiptImage: url,
                              status: booking.status === "pending_payment" ? "verifying_payment" : booking.status,
                            };
                            onEdit(updated, "this");
                            alert("อัปโหลดหลักฐานการชำระเงินสำเร็จ!");
                          }
                        }}
                      />
                    </div>
                  </div>
                </>
              )
            )}

            {/* Section: Official Receipt (Only if status is approved) */}
            {booking.status === "approved" && (
              <>
                <hr className="border-slate-100" />
                <div className="space-y-4 text-left">
                  <div className="flex justify-between items-center pr-1">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 pl-1">
                      <FileText size={14} className="text-[#f26522]" />
                      ใบเสร็จรับเงินอย่างเป็นทางการ (Official Receipt)
                    </h3>
                    {booking.officialReceipt && (
                      <div className="flex items-center gap-2.5">
                        <a
                          href={booking.officialReceipt}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <ExternalLink size={10} />
                          เปิดดูใบเสร็จ
                        </a>
                        <span className="size-1 rounded-full bg-slate-300" />
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("คุณแน่ใจหรือไม่ที่จะยกเลิกใบเสร็จรับเงินอย่างเป็นทางการเดิม?")) {
                              const updated = {
                                ...booking,
                                officialReceipt: undefined,
                              };
                              onEdit(updated, "this");
                              alert("ยกเลิกใบเสร็จรับเงินอย่างเป็นทางการสำเร็จ");
                            }
                          }}
                          className="text-[10px] font-bold text-red-500 hover:text-red-600 hover:underline cursor-pointer focus:outline-none bg-transparent border-none p-0"
                        >
                          เปลี่ยนไฟล์ใบเสร็จ
                        </button>
                      </div>
                    )}
                  </div>

                  {booking.officialReceipt ? (
                    <div className="relative rounded-[7px] overflow-hidden border border-slate-200 aspect-video w-full bg-slate-50 group max-w-sm">
                      <img
                        src={booking.officialReceipt}
                        alt="Official Receipt"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <a
                        href={booking.officialReceipt}
                        download="official_receipt.png"
                        onClick={(e) => {
                          if (booking.officialReceipt?.startsWith("data:")) {
                            // Allow default download
                          } else {
                            e.preventDefault();
                            alert("ดาวน์โหลดใบเสร็จรับเงินสำเร็จ!");
                          }
                        }}
                        className="absolute bottom-3 right-3 size-9 rounded-[7px] bg-black/45 backdrop-blur-md text-white hover:bg-white hover:text-slate-900 transition-all flex items-center justify-center cursor-pointer"
                        title="ดาวน์โหลดใบเสร็จ"
                      >
                        <Download size={16} />
                      </a>
                    </div>
                  ) : (
                    <div className="max-w-sm">
                      <ImageUpload
                        value=""
                        onChange={(url) => {
                          if (url) {
                            const updated = {
                              ...booking,
                              officialReceipt: url,
                            };
                            onEdit(updated, "this");
                            alert("อัปโหลดใบเสร็จรับเงินอย่างเป็นทางการสำเร็จ!");
                          }
                        }}
                      />
                    </div>
                  )}
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
                {booking.status === "pending_payment" &&
                  (booking.expenseStatus === "sent" ? (
                    <div className="bg-sky-50 border border-sky-100 rounded-[7px] p-4 text-center text-xs font-bold text-sky-700 select-none">
                      แจ้งค่าใช้จ่ายเรียบร้อยแล้ว
                      รอผู้ขอใช้พื้นที่ดำเนินการชำระเงินและแนบหลักฐานใบเสร็จ
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-100 rounded-[7px] p-4 text-center text-xs font-bold text-amber-700 select-none">
                      กรุณากรอกค่าใช้จ่ายและกด "แจ้งค่าใช้จ่าย"
                      เพื่อส่งข้อมูลให้ผู้ใช้ดำเนินการชำระเงิน
                    </div>
                  ))}

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

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleEditClick}
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
        recurrenceMode={
          booking.recurringGroupId ? selectedRecurrenceMode : "this"
        }
        onClose={() => setIsEditOpen(false)}
        onSave={(updated) => {
          onEdit(
            updated,
            booking.recurringGroupId ? selectedRecurrenceMode : "this",
          );
          setIsEditOpen(false);
        }}
      />

      <Dialog
        open={recurrenceDialogOpen}
        onOpenChange={setRecurrenceDialogOpen}
      >
        <DialogContent className="w-[95vw] max-w-[440px] p-6 bg-white rounded-[20px] border-none shadow-2xl flex flex-col gap-4 overflow-hidden transform -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 text-left">
          <DialogHeader className="pb-2 border-b border-slate-100">
            <DialogTitle className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
              {recurrenceActionType === "edit" ? (
                <>
                  <Pencil
                    className="text-[#f26522]"
                    size={18}
                    strokeWidth={2.5}
                  />
                  <span>คุณต้องการแก้ไขรายการนี้อย่างไร?</span>
                </>
              ) : (
                <>
                  <Trash2
                    className="text-red-500"
                    size={18}
                    strokeWidth={2.5}
                  />
                  <span>คุณต้องการลบรายการนี้อย่างไร?</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Option 1: Only this event */}
            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all cursor-pointer group">
              <input
                type="radio"
                name="recurrenceMode"
                value="this"
                checked={selectedRecurrenceMode === "this"}
                onChange={() => setSelectedRecurrenceMode("this")}
                className="accent-[#f26522] size-4 mt-0.5 cursor-pointer shrink-0"
              />
              <div className="space-y-0.5 select-none">
                <p className="text-xs font-black text-slate-700">
                  {recurrenceActionType === "edit"
                    ? "แก้ไขเฉพาะรอบนี้เท่านั้น"
                    : "ลบเฉพาะรอบนี้เท่านั้น"}{" "}
                  (Only this event)
                </p>
                <p className="text-[10px] text-slate-400 font-medium text-left">
                  {recurrenceActionType === "edit"
                    ? "ปลดล็อกห้องให้ว่างแค่เฉพาะวันนี้ วันอื่นในสัปดาห์ถัดๆ ไปยังคงจองอยู่เหมือนเดิม"
                    : "ปลดล็อกห้องให้ว่างแค่เฉพาะวันนี้ วันอื่นยังคงจองอยู่เหมือนเดิม"}
                </p>
              </div>
            </label>

            {/* Option 2: This and following events */}
            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all cursor-pointer group">
              <input
                type="radio"
                name="recurrenceMode"
                value="following"
                checked={selectedRecurrenceMode === "following"}
                onChange={() => setSelectedRecurrenceMode("following")}
                className="accent-[#f26522] size-4 mt-0.5 cursor-pointer shrink-0"
              />
              <div className="space-y-0.5 select-none">
                <p className="text-xs font-black text-slate-700">
                  {recurrenceActionType === "edit"
                    ? "แก้ไขตั้งแต่รอบนี้เป็นต้นไป"
                    : "ลบตั้งแต่รอบนี้เป็นต้นไป"}{" "}
                  (This and following events)
                </p>
                <p className="text-[10px] text-slate-400 font-medium text-left">
                  {recurrenceActionType === "edit"
                    ? "เปลี่ยนแปลงตารางตั้งแต่รอบนี้ยาวไปจนจบ"
                    : "ลบตารางตั้งแต่รอบนี้เป็นต้นไปจนจบ"}
                </p>
              </div>
            </label>

            {/* Option 3: All events */}
            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all cursor-pointer group">
              <input
                type="radio"
                name="recurrenceMode"
                value="all"
                checked={selectedRecurrenceMode === "all"}
                onChange={() => setSelectedRecurrenceMode("all")}
                className="accent-[#f26522] size-4 mt-0.5 cursor-pointer shrink-0"
              />
              <div className="space-y-0.5 select-none">
                <p className="text-xs font-black text-slate-700">
                  {recurrenceActionType === "edit"
                    ? "แก้ไขทั้งหมด"
                    : "ลบทั้งหมด"}{" "}
                  (All events)
                </p>
                <p className="text-[10px] text-slate-400 font-medium text-left">
                  {recurrenceActionType === "edit"
                    ? "เปลี่ยนโครงสร้างตารางทั้งหมดตั้งแต่วันแรกที่เริ่มสร้าง"
                    : "ลบตารางทั้งหมดตั้งแต่วันแรกที่เริ่มสร้าง"}
                </p>
              </div>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setRecurrenceDialogOpen(false)}
              className="flex-1 h-10 rounded-lg border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleConfirmRecurrenceAction}
              className={cn(
                "flex-1 h-10 rounded-lg text-white font-bold text-xs shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer",
                recurrenceActionType === "edit"
                  ? "bg-[#f26522] hover:bg-[#d8561d] shadow-[#f26522]/10"
                  : "bg-red-600 hover:bg-red-700 shadow-red-600/10",
              )}
            >
              ยืนยัน
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
