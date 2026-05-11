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
  X, ExternalLink, Calendar
} from "lucide-react";
import { Location } from "@/features/areas/types/location";
import { cn } from "@/lib/utils";

interface Props {
  location: Location | null;
  open: boolean;
  onClose: () => void;
}

export default function AdminAreaDrawer({ location, open, onClose }: Props) {
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
        className={cn(
          "w-full max-w-[680px]",
          "p-0 border-l border-slate-100",
          "bg-white shadow-[−20px_0_60px_rgba(0,0,0,0.06)]",
          "overflow-y-auto"
        )}
      >
        {/* Header */}
        <SheetHeader 
          className={cn(
            "px-5 pt-6 pb-4",
            "sticky top-0 bg-white/90 backdrop-blur-md z-20",
            "border-b border-slate-100",
            "flex flex-row items-center justify-between space-y-0"
          )}
        >
            <div className="space-y-1">
            <SheetTitle className="text-base font-bold text-slate-900 tracking-tight text-left">
              {location.name}
            </SheetTitle>

            <SheetDescription asChild>
              <div className="flex items-center gap-1.5 text-left">
                <div className="flex items-center gap-1 px-2 py-0.5 bg-[#f26522]/8 rounded">
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
            className={cn(
              "size-8 rounded-xl",
              "bg-slate-50 text-slate-400",
              "hover:bg-slate-100 hover:text-slate-700",
              "transition-all flex items-center justify-center"
            )}
          >
            <X size={15} />
          </button>
        </SheetHeader>

        <div className="px-5 py-5 space-y-6">

          {/* Image */}
          <div className="space-y-2">
            <div className="relative rounded-xl overflow-hidden h-48 w-full bg-slate-100">
              <img
                src={location.image}
                alt={location.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              
              <button className={cn(
                "absolute bottom-3 right-3",
                "size-8 rounded-lg",
                "bg-black/20 backdrop-blur-sm text-white",
                "hover:bg-white hover:text-slate-900 transition-all",
                "flex items-center justify-center"
              )}>
                <ExternalLink size={14} />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "aspect-square rounded-lg overflow-hidden bg-slate-100",
                    "border border-transparent hover:border-[#f26522]",
                    "transition-all cursor-pointer"
                  )}
                >
                  <img
                    src={location.image}
                    className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity"
                  />
                </div>
              ))}
              <div className={cn(
                "aspect-square rounded-lg",
                "bg-slate-50 border border-dashed border-slate-200",
                "flex items-center justify-center",
                "text-slate-400 font-semibold text-xs",
                "hover:bg-slate-100 transition-colors cursor-pointer"
              )}>
                +4
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-2 gap-3">
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

          {/* Info */}
          <div className="space-y-2">
            {infoItems.map((item) => (
              <div
                key={item.label}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl",
                  "bg-slate-50 hover:bg-white border border-transparent",
                  "hover:border-slate-100 hover:shadow-sm transition-all"
                )}
              >
                <div className="size-8 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                  <item.icon size={15} className="text-[#f26522]" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-medium text-slate-400 mb-0.5 tracking-wide">
                    {item.label}
                  </p>
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Admin Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2 pb-6">
            <AdminActionButton
              label="แก้ไขข้อมูล"
              icon={Pencil}
              variant="secondary"
            />
            <AdminActionButton
              label="จัดการสัญญา"
              icon={FileText}
              variant="primary"
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function HighlightCard({ icon: Icon, label, value, subValue, theme }: any) {
  const themes = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100"
  };

  return (
    <div className={cn("p-5 rounded-[28px] border transition-all hover:scale-[1.02]", themes[theme as keyof typeof themes])}>
      <div className="flex items-center gap-2 mb-3 opacity-80">
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

function AdminActionButton({ label, icon: Icon, variant }: any) {
  return (
    <button
      className={cn(
        `
        h-12 px-4
        inline-flex items-center gap-3
        rounded-xl
        border
        transition-colors
        text-sm font-medium
        `,
        variant === "primary"
          ? `
            bg-[#f26522]
            border-[#f26522]
            text-white
            hover:bg-[#dd5b1c]
          `
          : `
            bg-white
            border-gray-200
            text-gray-700
            hover:bg-gray-50
          `
      )}
    >
      <Icon size={16} strokeWidth={2.2} />

      <span>{label}</span>
    </button>
  );
}