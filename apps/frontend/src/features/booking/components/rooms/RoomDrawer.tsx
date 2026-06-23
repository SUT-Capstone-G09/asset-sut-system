"use client"

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import {
  X,
  MapPin,
  Users,
  CheckSquare,
  Wrench,
  Pencil,
  Trash2,
  FileText,
  Building,
  CreditCard,
  Paperclip
} from "lucide-react";
import { Room } from "../../types/room";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import RoomEditDrawer from "./RoomEditDrawer";

interface RoomDrawerProps {
  room: Room | null;
  open: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: "available" | "maintenance") => void;
  onEdit: (updatedRoom: Room) => void;
  onDelete: (id: string) => void;
  canDelete?: boolean;
}

export default function RoomDrawer({
  room,
  open,
  onClose,
  onUpdateStatus,
  onEdit,
  onDelete,
  canDelete = true,
}: RoomDrawerProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (!room) return null;

  const isAvailable = room.status === "available";

  const handleDelete = () => {
    if (confirm(`คุณต้องการลบข้อมูลห้อง ${room.roomName} ใช่หรือไม่?`)) {
      onDelete(room.id);
      onClose();
      alert("ลบข้อมูลห้องสำเร็จ!");
    }
  };

  const handleToggleStatus = () => {
    const nextStatus = isAvailable ? "maintenance" : "available";
    onUpdateStatus(room.id, nextStatus);
    alert(`เปลี่ยนสถานะห้องเป็น ${nextStatus === "available" ? "ใช้งานได้" : "ปิดปรับปรุง"} สำเร็จ!`);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full sm:max-w-[540px] p-0 border-none bg-slate-50/50 backdrop-blur-md flex flex-col h-full shadow-2xl"
        >
          {/* Header Image */}
          <div className="relative h-64 w-full shrink-0 bg-slate-200">
            <img
              src={room.image}
              alt={room.roomName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

            {/* Back/Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 size-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-black/60 transition-all flex items-center justify-center cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Overlay Title */}
            <div className="absolute bottom-5 inset-x-6 text-left">
              <span className="px-2.5 py-0.5 rounded-[4px] bg-[#f26522] text-white text-[9px] font-black uppercase tracking-wider">
                {room.category}
              </span>
              <h2 className="text-2xl font-black text-white truncate mt-2 leading-tight">
                {room.roomName}
              </h2>
              <p className="text-xs font-bold text-white/70 mt-1 flex items-center gap-1.5">
                <Building size={14} className="text-[#f26522]" />
                {room.building}
              </p>
            </div>
          </div>

          {/* Details Scroll Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            {/* Status and Capacity Overview */}
            <div className="grid grid-cols-2 gap-4">
              {/* Status Box */}
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between text-left">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">สถานะการใช้งาน</span>
                <div className="flex items-center gap-2 mt-2">
                  <div className={cn("size-3 rounded-full animate-pulse", isAvailable ? "bg-emerald-500" : "bg-red-400")} />
                  <span className={cn("text-base font-black", isAvailable ? "text-emerald-600" : "text-red-500")}>
                    {isAvailable ? "ใช้งานได้" : "ปิดปรับปรุง"}
                  </span>
                </div>
              </div>

              {/* Capacity Box */}
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between text-left">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">ความจุห้อง</span>
                <div className="flex items-baseline gap-1 mt-2 text-slate-900">
                  <span className="text-2xl font-black">{room.capacity}</span>
                  <span className="text-xs font-bold text-slate-500">ที่นั่ง</span>
                </div>
              </div>
            </div>

            {/* Spec Details Card */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4 text-left">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">รายละเอียดห้อง</h3>
              
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                <div>
                  <span className="text-xs text-slate-400 font-bold block mb-0.5">รหัสห้อง</span>
                  <span className="font-bold text-slate-700">{room.roomNumber}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold block mb-0.5">ประเภทห้อง</span>
                  <span className="font-bold text-slate-700">{room.category}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-slate-400 font-bold block mb-0.5">สถานที่ตั้ง</span>
                  <span className="font-bold text-[#f26522] flex items-center gap-1">
                    <MapPin size={14} />
                    {room.building}
                  </span>
                </div>
              </div>
            </div>

            {/* Rates Card */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4 text-left">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CreditCard size={14} className="text-[#f26522]" />
                อัตราค่าใช้จ่าย
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Hourly rates */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">รายชั่วโมง (Hourly)</span>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>บุคลากรภายใน:</span>
                      <span className="text-[#f26522]">{room.rates?.hourlyInternal || 0} ฿</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>บุคคลภายนอก:</span>
                      <span>{room.rates?.hourlyExternal || 0} ฿</span>
                    </div>
                  </div>
                </div>

                {/* Daily rates */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">รายวัน (Daily)</span>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>บุคลากรภายใน:</span>
                      <span className="text-[#0284c7]">{room.rates?.dailyInternal || 0} ฿</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>บุคคลภายนอก:</span>
                      <span>{room.rates?.dailyExternal || 0} ฿</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Equipment Card */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4 text-left">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">อุปกรณ์ภายในห้อง</h3>
              
              {room.equipment && room.equipment.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {room.equipment.map((eq, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-slate-600">
                      <div className="size-5 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckSquare size={13} strokeWidth={2.5} />
                      </div>
                      <span className="text-xs font-bold truncate">{eq}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-bold text-center py-4">ไม่มีข้อมูลอุปกรณ์</p>
              )}
            </div>

            {/* Documents Card */}
            {room.documents && room.documents.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4 text-left">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Paperclip size={14} className="text-[#f26522]" />
                  เอกสารแนบ
                </h3>
                
                <div className="space-y-2">
                  {room.documents.map((doc, i) => (
                    <div 
                      key={i} 
                      onClick={() => alert(`ดาวน์โหลดไฟล์: ${doc}`)}
                      className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-100 bg-slate-50 text-xs font-bold text-slate-600 hover:bg-slate-100/50 hover:text-[#f26522] hover:border-[#f26522]/20 cursor-pointer transition-all"
                    >
                      <FileText size={15} className="text-[#f26522] shrink-0" />
                      <span className="truncate flex-1">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes Section */}
            {room.notes && (
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-3 text-left">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FileText size={14} />
                  หมายเหตุ / คำอธิบายเพิ่มเติม
                </h3>
                <p className="text-xs font-semibold text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-[7px] border border-slate-100">
                  {room.notes}
                </p>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="p-4 border-t border-slate-100 bg-white flex items-center gap-3 shrink-0">
            {/* Status Toggle Button */}
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

            {/* Edit Icon Button */}
            <button
              onClick={() => setIsEditOpen(true)}
              title="แก้ไขข้อมูลห้อง"
              className="size-12 rounded-[7px] border border-slate-200 text-slate-500 hover:bg-[#f26522] hover:text-white hover:border-transparent transition-all flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Pencil size={18} />
            </button>

            {/* Delete Icon Button - admin only */}
            {canDelete && (
              <button
                onClick={handleDelete}
                title="ลบห้อง"
                className="size-12 rounded-[7px] border border-red-100 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white hover:border-transparent transition-all flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <RoomEditDrawer
        room={room}
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={(updatedRoom) => {
          onEdit(updatedRoom);
          // Sync current local drawer context
          Object.assign(room, updatedRoom);
        }}
      />
    </>
  );
}
