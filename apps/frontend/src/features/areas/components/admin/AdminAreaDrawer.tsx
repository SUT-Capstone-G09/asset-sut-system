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
  X, ExternalLink, Calendar, LayoutGrid
} from "lucide-react";
import { Location } from "@/features/areas/types/location";
import { cn } from "@/lib/utils";
import AdminAreaEditDrawer from "./AdminAreaEditDrawer";
import React, { useState } from "react";

interface Props {
  location: Location | null;
  open: boolean;
  onClose: () => void;
}

export default function AdminAreaDrawer({ location, open, onClose }: Props) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  if (!location) return null;

  const infoItems = [
    {
      icon: Building2,
      label: "รหัสห้อง / ชื่อพื้นที่",
      value: location.roomNumber || "ไม่ระบุ",
    },
    {
      icon: Maximize2,
      label: "ขนาดพื้นที่เช่า",
      value: location.size || "ไม่ระบุ",
    },
    {
      icon: Banknote,
      label: "อัตราเช่าต่อเดือน",
      value: location.price ? `${location.price.toLocaleString()} บาท` : "ไม่ระบุ",
    },
    {
      icon: FileText,
      label: "หมายเหตุเพิ่มเติม",
      value: location.description || "-",
    },
  ];

  return (
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
              {location.name}
            </SheetTitle>

            <SheetDescription asChild>
              <div className="flex items-center gap-1.5 text-left">
                <div className="flex items-center gap-1 px-2 py-0.5 bg-[#f26522]/10 rounded-[7px]">
                  <MapPin size={10} className="text-[#f26522]" strokeWidth={2.5} />
                  <span className="text-[9px] font-semibold tracking-wide text-[#f26522]">
                    {location.category}
                  </span>
                </div>
                <span className="size-0.5 rounded-full bg-slate-300" />
                <span className="text-[10px] text-slate-400">#{location.id}</span>
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

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">

          {/* Image Section */}
          <div className="space-y-3">
            <div className="relative rounded-[7px] overflow-hidden h-56 w-full bg-slate-100 group">
              <img
                src={location.image}
                alt={location.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              <button className="absolute bottom-3 right-3 size-9 rounded-[7px] bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-slate-900 transition-all flex items-center justify-center">
                <ExternalLink size={16} />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-square rounded-[7px] overflow-hidden bg-slate-100 border border-transparent hover:border-[#f26522] transition-all cursor-pointer">
                  <img src={location.image} className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity" />
                </div>
              ))}
              <div className="aspect-square rounded-[7px] bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-400 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer">
                +4
              </div>
            </div>
          </div>

          {/* Highlights Grid */}
          <div className="grid grid-cols-2 gap-4">
            <HighlightCard
              icon={Banknote}
              label="ราคาเช่า"
              value={location.price ? `${location.price.toLocaleString()} ฿` : "N/A"}
              subValue="ต่อเดือน"
              theme="emerald"
            />
            <HighlightCard
              icon={Calendar}
              label="สิ้นสุดสัญญา"
              value={location.contractEndDate || "ไม่มีสัญญา"}
              subValue="วันหมดอายุ"
              theme="amber"
            />
          </div>

          {/* Info Items List */}
          <div className="space-y-3">
            {infoItems.map((item) => (
              <div key={item.label} className="flex items-center gap-4 px-5 py-4 rounded-[7px] bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all group">
                <div className="size-10 rounded-[7px] bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0 group-hover:border-[#f26522]/20 group-hover:bg-[#f26522]/5 transition-colors">
                  <item.icon size={18} className="text-[#6d6e70] group-hover:text-[#f26522] transition-colors" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase tracking-widest">
                    {item.label}
                  </p>
                  <p className="text-[13px] font-bold text-slate-700 truncate">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Admin Actions */}
          <div className="space-y-3 pt-4 pb-4">
            {location.category === "โรงอาหาร" && (
              <AdminActionButton
                label="แก้ไขแปลนผัง (Floor Plan)"
                icon={LayoutGrid}
                variant="primary"
                className="w-full"
              />
            )}

            <div className="grid grid-cols-2 gap-3">
              <AdminActionButton
                label="แก้ไขข้อมูล"
                icon={Pencil}
                variant="secondary"
                onClick={() => setIsEditOpen(true)}
              />
              <AdminActionButton
                label="จัดการสัญญา"
                icon={FileText}
                variant="secondary"
              />
            </div>
          </div>
        </div>
      </SheetContent>

      <AdminAreaEditDrawer 
        location={location}
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />
    </Sheet>
  );
}

function HighlightCard({ icon: Icon, label, value, subValue, theme }: any) {
  const themes = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100"
  };

  return (
    <div className={cn("p-5 rounded-[7px] border transition-all hover:scale-[1.02]", themes[theme as keyof typeof themes])}>
      <div className="flex items-center gap-2 mb-3 opacity-70">
        <Icon size={16} strokeWidth={3} />
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <div className="space-y-0.5">
        <p className="text-xl font-black text-slate-900 leading-tight">{value}</p>
        <p className="text-[10px] font-bold opacity-60 uppercase">{subValue}</p>
      </div>
    </div>
  );
}

function AdminActionButton({ label, icon: Icon, variant, className, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-12 px-4 inline-flex items-center justify-center gap-3 rounded-[7px] border transition-all text-[13px] font-bold active:scale-[0.98]",
        variant === "primary"
          ? "bg-[#f26522] border-[#f26522] text-white shadow-lg shadow-[#f26522]/20 hover:bg-[#d8561d]"
          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
        className
      )}
    >
      <Icon size={16} strokeWidth={2.5} />
      <span>{label}</span>
    </button>
  );
}