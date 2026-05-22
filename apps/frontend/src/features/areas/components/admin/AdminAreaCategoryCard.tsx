"use client";

import React from "react";
import { ArrowRight, Utensils, Home, GraduationCap, Wrench, Landmark, Handshake, LibraryBig, Dumbbell, Store, BriefcaseBusiness, ShieldCheck, Building2, Warehouse, Trees, BookOpen, HeartPulse, Waves, BadgeHelp, LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Location } from "@/features/areas/types/location";
import { mockFloorPlans } from "@/features/areas/data/floor-plans";

export const categoryIconMap: Record<string, LucideIcon> = {
  "โรงอาหาร": Utensils,
  "หอพักนักศึกษา": Home,
  "อาคารเรียนรวม": GraduationCap,
  "อาคารเครื่องมือ": Wrench,
  "อาคารัฐสีมาคุณากร": Landmark,
  "อาคารบริการหอพัก": Handshake,
  "อาคารบรรณสาร": LibraryBig,
  "อาคารกีฬา": Dumbbell,
  "กลุ่มอาคารกิจการนักศึกษา": Store,
  "อาคารบริหาร": BriefcaseBusiness,
  "อาคารรักษาความปลอดภัย": ShieldCheck,
  "สุรสัมนาคาร": Building2,
  "สุรพัฒน์ 2": Warehouse,
  "สุรพัฒน์ 3": Warehouse,
  "บ้านพักบุคลากร": Trees,
  "อาคารสำนักฟาร์ม": BookOpen,
  "โรงพยาบาลมหาวิทยาลัยเทคโนโลยีสุรนารี": HeartPulse,
  "อ่างเก็บน้ำสระสามแสน": Waves,
  "อื่นๆ": BadgeHelp,
};

interface AdminAreaCategoryCardProps {
  categoryName: string;
  locations: Location[];
  isSelected: boolean;
  onSelect: () => void;
  viewMode?: "grid" | "list";
}

export default function AdminAreaCategoryCard({
  categoryName,
  locations,
  isSelected,
  onSelect,
  viewMode = "grid",
}: AdminAreaCategoryCardProps) {
  // Resolve Lucide Icon
  const Icon = categoryIconMap[categoryName] || Building2;

  // Calculate statistics across all locations in this category
  const stats = React.useMemo(() => {
    let totalUnits = 0;
    let occupied = 0;
    let vacant = 0;

    locations.forEach((loc) => {
      const floorPlan = mockFloorPlans.find((fp) => fp.locationId === loc.id);
      if (floorPlan) {
        totalUnits += floorPlan.stalls.length;
        occupied += floorPlan.stalls.filter((s) => s.status === "occupied").length;
        vacant += floorPlan.stalls.filter((s) => s.status === "vacant").length;
      } else {
        if (loc.category === "โรงอาหาร") {
          const count = loc.subStallCount || 0;
          const occ = Math.floor(count * 0.75);
          totalUnits += count;
          occupied += occ;
          vacant += count - occ;
        } else {
          totalUnits += 1;
          if (loc.status === "active") {
            occupied += 1;
          } else {
            vacant += 1;
          }
        }
      }
    });

    return { totalUnits, occupied, vacant };
  }, [locations]);

  // ---- LIST VIEW ----
  if (viewMode === "list") {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "group w-full flex items-center gap-4 px-5 py-3.5 rounded-xl border text-left transition-all duration-200",
          isSelected
            ? "border-[#f26522] bg-[#f26522]/5 shadow-sm"
            : "border-slate-100 bg-white hover:border-[#f26522]/40 hover:bg-slate-50/60"
        )}
      >
        {/* Icon */}
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
            isSelected
              ? "bg-[#f26522] text-white"
              : "bg-[#f26522]/10 text-[#f26522] group-hover:bg-[#f26522] group-hover:text-white"
          )}
        >
          <Icon size={18} strokeWidth={2.5} />
        </div>

        {/* Name & Details */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 truncate">{categoryName}</p>
          <p className="text-xs text-slate-400 truncate mt-0.5">
            มี {locations.length} สถานที่ย่อย
            {locations.length > 0 && ` (${locations.map(l => l.name).slice(0, 2).join(", ")})`}
          </p>
        </div>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-6 shrink-0 px-6 border-r border-slate-100 mr-2">
          <div className="text-right">
            <span className="text-xs text-slate-400 block leading-none mb-0.5">มีผู้เช่า</span>
            <span className="text-sm font-bold text-emerald-600">{stats.occupied} ยูนิต</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block leading-none mb-0.5">ว่าง</span>
            <span className="text-sm font-bold text-amber-500">{stats.vacant} ยูนิต</span>
          </div>
        </div>

        {/* Arrow */}
        <ArrowRight
          size={16}
          className={cn(
            "shrink-0 transition-all duration-200",
            isSelected
              ? "text-[#f26522] translate-x-0.5"
              : "text-slate-400 group-hover:text-[#f26522] group-hover:translate-x-0.5"
          )}
        />
      </button>
    );
  }

  // ---- GRID VIEW ----
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        isSelected
          ? "border-[#f26522] shadow-md ring-1 ring-[#f26522]/20 bg-[#f26522]/2"
          : "border-slate-100 shadow-sm hover:border-[#f26522]/40 hover:shadow-md hover:bg-slate-50/50"
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="group flex h-full w-full flex-col text-left outline-none"
      >
        <div
          className={cn(
            "absolute inset-y-0 left-0 w-1.5 transition-all duration-300",
            isSelected ? "bg-[#f26522]" : "bg-transparent group-hover:bg-[#f26522]/40"
          )}
        />

        <div className="flex flex-1 flex-col justify-between p-6 w-full pl-7">
          <div className="flex w-full items-start justify-between">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300",
                isSelected
                  ? "bg-[#f26522] text-white shadow-sm"
                  : "bg-[#f26522]/10 text-[#f26522] group-hover:bg-[#f26522] group-hover:text-white group-hover:shadow-sm"
              )}
            >
              <Icon size={24} strokeWidth={2.5} />
            </div>
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300",
                isSelected
                  ? "bg-[#f26522]/10 text-[#f26522]"
                  : "text-slate-400 group-hover:text-[#f26522] group-hover:bg-[#f26522]/5"
              )}
            >
              <ArrowRight
                size={20}
                className={cn(
                  "transition-transform duration-300",
                  isSelected ? "translate-x-1" : "group-hover:translate-x-1"
                )}
              />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <h3 className="text-xl font-bold tracking-tight text-slate-800">{categoryName}</h3>

            {/* Total Locations tag */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                {locations.length} สถานที่ย่อย
              </span>
            </div>

            {/* Occupied vs Vacant stat line */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">มีผู้เช่า</span>
                <span className="text-lg font-black text-emerald-600">{stats.occupied} <span className="text-[10px] font-bold text-slate-400">ยูนิต</span></span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">ว่าง</span>
                <span className="text-lg font-black text-amber-500">{stats.vacant} <span className="text-[10px] font-bold text-slate-400">ยูนิต</span></span>
              </div>
            </div>
          </div>
        </div>
      </button>
    </Card>
  );
}
