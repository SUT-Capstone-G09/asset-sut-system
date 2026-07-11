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
  AlertCircle,
} from "lucide-react";
import { Booking, BOOKING_STATUS_CONFIG } from "../../types/booking";
import { cn } from "@/lib/utils";
import React, { useState, useMemo } from "react";
import BookingEditDrawer from "./BookingEditDrawer";
import { mockRooms } from "../../data/rooms";
import { addonService, Addon } from "@/lib/services/addon.service";
import { getHoursFromTimeSlot } from "../../utils/time";
import ImageUpload from "@/components/ui/image-upload";
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
      | "approved"
      | "rejected"
      | "cancelled"
      | "completed",
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
  initialMode?: "view" | "edit";
}

export default function BookingDrawer({
  booking,
  open,
  onClose,
  onUpdateStatus,
  onEdit,
  onDelete,
  initialMode = "view",
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
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();
  const [editedExpenses, setEditedExpenses] = useState<any[]>([]);
  const [housekeeperPrice, setHousekeeperPrice] = useState(0);
  const [housekeeperCount, setHousekeeperCount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [expenseSearchQuery, setExpenseSearchQuery] = useState("");
  const [masterAddons, setMasterAddons] = useState<Addon[]>([]);

  React.useEffect(() => {
    if (open) {
      setIsEditOpen(initialMode === "edit");
      addonService.getAll()
        .then(setMasterAddons)
        .catch((err) => console.error("Failed to load master addons in drawer:", err));
    } else {
      setIsEditOpen(false);
    }
  }, [open, initialMode]);

  React.useEffect(() => {
    if (booking) {
      const customExps = (booking.expenses || []).filter(
        (exp) =>
          !exp.name.startsWith("ค่าห้อง") &&
          !exp.name.startsWith("ค่าแม่บ้าน") &&
          !exp.name.startsWith("ส่วนลด"),
      );
      setEditedExpenses(customExps);
      setHousekeeperPrice(booking.housekeeperPrice || 0);
      setHousekeeperCount(booking.housekeeperCount || 0);
      const discountExp = (booking.expenses || []).find((exp) => exp.name.startsWith("ส่วนลด"));
      setDiscount(discountExp ? Math.abs(discountExp.amount) : 0);
      setIsEditingExpenses(false);
    }
  }, [booking]);

  const handleAddExpenseItem = () => {
    setEditedExpenses((prev) => [...prev, { name: "", amount: 0, unitPrice: 0, quantity: 1 }]);
  };

  const handleRemoveExpenseItem = (index: number) => {
    setEditedExpenses((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleExpenseChange = (
    index: number,
    key: "name" | "amount" | "unitPrice" | "quantity",
    value: any,
  ) => {
    setEditedExpenses((prev) =>
      prev.map((exp, idx) => {
        if (idx === index) {
          if (key === "name") return { ...exp, name: value };
          
          let newUnitPrice = exp.unitPrice || 0;
          let newQuantity = exp.quantity || 1;
          let newAmount = exp.amount || 0;
          
          if (key === "quantity") {
            newQuantity = Math.max(1, Number(value) || 1);
            newAmount = newUnitPrice * newQuantity;
          } else if (key === "unitPrice") {
            newUnitPrice = Number(value) || 0;
            newAmount = newUnitPrice * newQuantity;
          } else if (key === "amount") {
            newAmount = Number(value) || 0;
            newUnitPrice = newAmount / newQuantity;
          }
          
          return {
            ...exp,
            unitPrice: newUnitPrice,
            quantity: newQuantity,
            amount: newAmount,
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
  // Use actual seeded basePrice from backend if available, fallback to computed
  const actualHourlyRate = booking?.basePrice ? (booking.basePrice / hours) : hourlyRate;
  const actualDailyRate = booking?.basePrice ? booking.basePrice : dailyRate;
  const roomFeeAmount = booking?.basePrice || (useDaily ? dailyRate : hourlyRate * hours);
  
  const roomFeeName = useDaily
    ? "ค่าห้องรายวัน"
    : `ค่าห้องรายชั่วโมง (${actualHourlyRate} บาท/ชม. x ${hours} ชม.)`;

  const housekeeperFeeName = `ค่าแม่บ้าน (${housekeeperPrice} บาท/คน x ${housekeeperCount} คน)`;
  const housekeeperFeeAmount = housekeeperPrice * housekeeperCount;

  const totalExpensesComputed = Math.max(
    0,
    roomFeeAmount +
      housekeeperFeeAmount +
      editedExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) -
      discount
  );

  const handleSaveExpenses = () => {
    if (!booking) return;

    const finalExpenses: import("../../types/booking").BookingExpense[] = [
      { 
        name: roomFeeName, 
        unitPrice: booking?.basePrice ? (useDaily ? booking.basePrice : booking.basePrice / hours) : (useDaily ? dailyRate : hourlyRate),
        quantity: useDaily ? 1 : hours,
        amount: booking?.basePrice || roomFeeAmount 
      },
      ...(housekeeperFeeAmount > 0
        ? [{ 
            name: housekeeperFeeName, 
            unitPrice: housekeeperPrice, 
            quantity: housekeeperCount, 
            amount: housekeeperFeeAmount 
          }]
        : []),
      ...editedExpenses.map(exp => ({
        name: exp.name,
        unitPrice: exp.unitPrice || exp.amount, // Default to total amount if unit price is missing
        quantity: exp.quantity || 1, // Default to 1 if missing
        amount: exp.amount
      })),
      ...(discount > 0
        ? [{ name: `ส่วนลด`, unitPrice: discount, quantity: 1, amount: discount }]
        : []),
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
                      if (val === "approved" && booking.status === "pending") {
                        setShowApproveModal(true);
                      } else {
                        onUpdateStatus(booking.id, val as any);
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
                        className="text-xs font-bold text-amber-700 focus:bg-amber-50"
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="size-1.5 rounded-full bg-amber-500" />
                          <span>รออนุมัติ</span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="approved"
                        className="text-xs font-bold text-emerald-700 focus:bg-emerald-50"
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="size-1.5 rounded-full bg-emerald-500" />
                          <span>อนุมัติ</span>
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

                      <SelectItem
                        value="completed"
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



            {/* Section 4: Actions */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 pl-1">
                <Pencil size={14} className="text-[#f26522]" />
                ปุ่มจัดการคำขอจองพื้นที่
              </h3>

              <div className="flex flex-col gap-3">
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
                  กรุณาตรวจสอบว่าคุณได้ <span className="font-bold">จัดการค่าใช้จ่าย</span> เรียบร้อยแล้ว ก่อนทำการอนุมัติรายการนี้
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/booking/${booking.id}/expenses`)}
                className="h-11 rounded-[7px] font-bold border-slate-200 text-slate-600 bg-white hover:bg-slate-100"
              >
                จัดการค่าใช้จ่าย
              </Button>
              
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

      <BookingEditDrawer
        booking={booking}
        open={isEditOpen}
        recurrenceMode={
          booking.recurringGroupId ? selectedRecurrenceMode : "this"
        }
        onClose={() => {
          if (initialMode === "edit") {
            onClose();
          } else {
            setIsEditOpen(false);
          }
        }}
        onSave={(updated) => {
          onEdit(
            updated,
            booking.recurringGroupId ? selectedRecurrenceMode : "this",
          );
          if (initialMode === "edit") {
            onClose();
          } else {
            setIsEditOpen(false);
          }
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

