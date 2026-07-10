"use client";

import React from "react";
import { ArrowRight, Building2, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { RentalSpace } from "@/features/areas/types/rental-space";
import { mockFloorPlans } from "@/features/areas/data/mock-floor-plans";
import { COMMERCIAL_CATEGORY_ICONS } from "@/utils/commercial-category-icons";
import { calculateBuildingStats } from "@/features/areas/utils/calculate-building-stats";

export const categoryIconMap: Record<string, LucideIcon> = COMMERCIAL_CATEGORY_ICONS;

interface BuildingCardProps {
  buildingName: string;
  locations: RentalSpace[];
  isSelected: boolean;
  onSelect: () => void;
  viewMode?: "grid" | "list";
}

export default function BuildingCard({
  buildingName,
  locations,
  isSelected,
  onSelect,
  viewMode = "grid",
}: BuildingCardProps) {
  const parentArea = locations[0]?.area || "อื่นๆ";
  const Icon = categoryIconMap[parentArea] || Building2;

  const stats = React.useMemo(
    () => calculateBuildingStats(locations, mockFloorPlans),
    [locations]
  );

  // List View
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
          <p className="text-sm font-bold text-slate-800 truncate">
            {buildingName}
          </p>

          <p className="mt-0.5 text-xs text-slate-400">
            {locations.length} สถานที่ย่อย
          </p>
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

  // Grid View
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
            
          </div>

          <div className="mt-6 space-y-4">
            <h3 className="text-xl font-bold tracking-tight text-slate-800">
              {buildingName}
            </h3>

            <p className="text-sm text-slate-500">
              {locations.length} สถานที่ย่อย
            </p>

            {/* Total vs Vacant stat line */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              {/* Total Units */}
              <div className="space-y-0.5">
                <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  พื้นที่ทั้งหมด
                </span>

                <p className="text-lg font-black text-slate-800">
                  {stats.totalUnits}
                  <span className="ml-1 text-[10px] font-bold text-slate-400">
                    ยูนิต
                  </span>
                </p>
              </div>

              {/* Vacant Units */}
              <div className="space-y-0.5">
                <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  ว่าง
                </span>

                <p className="text-lg font-black text-brand-primary">
                  {stats.vacant}
                  <span className="ml-1 text-[10px] font-bold text-slate-400">
                    ยูนิต
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </button>
    </Card>
  );
}
