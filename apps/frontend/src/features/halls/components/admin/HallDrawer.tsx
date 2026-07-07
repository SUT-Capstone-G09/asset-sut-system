"use client"

import React, { useState } from "react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  X,
  MapPin,
  Wrench,
  Pencil,
  Trash2,
  FileText,
  Building,
  CreditCard,
  LayoutGrid,
} from "lucide-react";
import { Hall } from "../../types/hall";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import HallEditDrawer from "./HallEditDrawer";
import HallFloorPlanModal from "./floorplan/HallFloorPlanModal";
import { useAppDialog } from "../../hooks/useAppDialog";
import { toast } from "sonner";

interface HallDrawerProps {
  hall: Hall | null;
  open: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: "available" | "maintenance") => void;
  onEdit: (updatedHall: Hall) => void;
  onDelete: (id: string) => void;
  canDelete?: boolean;
  onFloorPlanChange?: () => void;
}

export default function HallDrawer({
  hall,
  open,
  onClose,
  onUpdateStatus,
  onEdit,
  onDelete,
  canDelete = true,
  onFloorPlanChange,
}: HallDrawerProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isFloorPlanOpen, setIsFloorPlanOpen] = useState(false);
  const { confirm, dialog } = useAppDialog();

  if (!hall) return null;

  const isAvailable = hall.status === "available";

  const handleDelete = async () => {
    const ok = await confirm({
      title: "ลบโถงพื้นที่?",
      message: `ต้องการลบ "${hall.name}" ใช่หรือไม่? การลบไม่สามารถย้อนกลับได้`,
      confirmText: "ลบ",
      variant: "danger",
    });
    if (!ok) return;
    onDelete(hall.id);
    toast.success("ลบโถงพื้นที่เรียบร้อยแล้ว");
    onClose();
  };

  const handleToggleStatus = () => {
    const nextStatus = isAvailable ? "maintenance" : "available";
    onUpdateStatus(hall.id, nextStatus);
    toast.success(`เปลี่ยนสถานะเป็น ${nextStatus === "available" ? "ใช้งานได้" : "ปิดปรับปรุง"} เรียบร้อยแล้ว`);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full sm:max-w-[540px] p-0 border-none bg-slate-50/50 backdrop-blur-md flex flex-col h-full shadow-2xl"
        >
          {/* a11y: ชื่อ/คำอธิบายสำหรับ screen reader (ซ่อนด้วยสายตา) */}
          <SheetTitle className="sr-only">รายละเอียดโถงพื้นที่ {hall.name}</SheetTitle>
          <SheetDescription className="sr-only">ข้อมูล สถานะ ราคา และการจัดการผังพื้นที่ของ {hall.name}</SheetDescription>

          {/* Header Image */}
          <div className="relative h-64 w-full shrink-0 bg-slate-200">
            <img src={hall.image} alt={hall.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 size-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-black/60 transition-all flex items-center justify-center cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="absolute bottom-5 inset-x-6 text-left">
              <span className="px-2.5 py-0.5 rounded-[4px] bg-[#f26522] text-white text-[9px] font-black uppercase tracking-wider">
                {hall.category}
              </span>
              <h2 className="text-2xl font-black text-white truncate mt-2 leading-tight">{hall.name}</h2>
              <p className="text-xs font-bold text-white/70 mt-1 flex items-center gap-1.5">
                <Building size={14} className="text-[#f26522]" />
                {hall.building}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            {/* Status */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between text-left">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">สถานะการใช้งาน</span>
              <div className="flex items-center gap-2 mt-2">
                <div className={cn("size-3 rounded-full animate-pulse", isAvailable ? "bg-emerald-500" : "bg-red-400")} />
                <span className={cn("text-base font-black", isAvailable ? "text-emerald-600" : "text-red-500")}>
                  {isAvailable ? "ใช้งานได้" : "ปิดปรับปรุง"}
                </span>
              </div>
            </div>

            {/* Floor Plan Management */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4 text-left">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <LayoutGrid size={14} className="text-[#f26522]" />
                ผังพื้นที่ (Floor Plan)
              </h3>
              <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                อัปโหลดรูปผัง top-view, ตั้งสเกลระยะจริง, ปรับกรอบกริด และระบายช่องห้ามจอง
              </p>
              <Button
                onClick={() => setIsFloorPlanOpen(true)}
                className="w-full h-11 rounded-[7px] bg-[#f26522] hover:bg-[#d8561d] text-white font-bold gap-2 shadow-lg shadow-[#f26522]/20 cursor-pointer"
              >
                <LayoutGrid size={16} />
                จัดการผังพื้นที่
              </Button>
            </div>

            {/* Rates */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4 text-left">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CreditCard size={14} className="text-[#f26522]" />
                อัตราค่าใช้จ่าย
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">รายชั่วโมง (Hourly)</span>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>บุคลากรภายใน:</span>
                      <span className="text-[#f26522]">{hall.rates?.hourlyInternal || 0} ฿</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>บุคคลภายนอก:</span>
                      <span>{hall.rates?.hourlyExternal || 0} ฿</span>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">รายวัน (Daily)</span>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>บุคลากรภายใน:</span>
                      <span className="text-[#0284c7]">{hall.rates?.dailyInternal || 0} ฿</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>บุคคลภายนอก:</span>
                      <span>{hall.rates?.dailyExternal || 0} ฿</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {hall.notes && (
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-3 text-left">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FileText size={14} />
                  หมายเหตุ / คำอธิบายเพิ่มเติม
                </h3>
                <p className="text-xs font-semibold text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-[7px] border border-slate-100">
                  {hall.notes}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 bg-white flex items-center gap-3 shrink-0">
            <Button
              onClick={handleToggleStatus}
              className={cn(
                "flex-1 h-12 rounded-[7px] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer",
                isAvailable
                  ? "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20"
                  : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
              )}
            >
              <Wrench size={16} className="mr-2" />
              {isAvailable ? "เปลี่ยนเป็นปิดปรับปรุง" : "เปิดให้พร้อมใช้งาน"}
            </Button>

            <button
              onClick={() => setIsEditOpen(true)}
              title="แก้ไขข้อมูลโถง"
              className="size-12 rounded-[7px] border border-slate-200 text-slate-500 hover:bg-[#f26522] hover:text-white hover:border-transparent transition-all flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Pencil size={18} />
            </button>

            {canDelete && (
              <button
                onClick={handleDelete}
                title="ลบโถง"
                className="size-12 rounded-[7px] border border-red-100 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white hover:border-transparent transition-all flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <HallEditDrawer
        hall={hall}
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={(updatedHall) => {
          onEdit(updatedHall);
          Object.assign(hall, updatedHall);
        }}
      />

      <HallFloorPlanModal
        hallId={hall.id}
        hallName={hall.name}
        open={isFloorPlanOpen}
        onClose={() => setIsFloorPlanOpen(false)}
        onSaved={onFloorPlanChange}
      />

      {dialog}
    </>
  );
}
