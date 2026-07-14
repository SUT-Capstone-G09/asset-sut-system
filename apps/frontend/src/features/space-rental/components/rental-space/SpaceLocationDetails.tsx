"use client";

import React from "react";
import { Building2, Layers, MapPin } from "lucide-react";
import { Building } from "../../types/building";

interface SpaceLocationDetailsProps {
  building: Building;
  areaCode?: string;
}

export default function SpaceLocationDetails({
  building,
  areaCode,
}: SpaceLocationDetailsProps) {
  
  // Deduce floor number
  const getFloorFromRoom = (room?: string) => {
    if (!room) return "ไม่ระบุ";
    const parts = room.split("-");
    const numPart = parts.length > 1 ? parts[1] : parts[0];
    const match = numPart.match(/\d/);
    return match ? `ชั้น ${match[0]}` : "ชั้น 1";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Building info */}
      <div className="flex items-start gap-3 p-4 rounded-md border border-slate-200/60 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all group">
        <div className="size-8 rounded-md bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
          <Building2 size={15} className="text-brand-primary" />
        </div>
        <div className="min-w-0">
          <span className="text-[9px] font-black text-slate-400 tracking-wider uppercase">
            Building (ชื่ออาคาร)
          </span>
          <p className="text-xs font-bold text-slate-700 mt-0.5 truncate">
            {building.name}
          </p>
        </div>
      </div>

      {/* Floor info */}
      <div className="flex items-start gap-3 p-4 rounded-md border border-slate-200/60 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all group">
        <div className="size-8 rounded-md bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
          <Layers size={15} className="text-indigo-500" />
        </div>
        <div className="min-w-0">
          <span className="text-[9px] font-black text-slate-400 tracking-wider uppercase">
            Floor (ชั้น)
          </span>
          <p className="text-xs font-bold text-slate-700 mt-0.5 truncate">
            {getFloorFromRoom(areaCode)}
          </p>
        </div>
      </div>

      {/* Address info */}
      <div className="flex items-start gap-3 p-4 rounded-md border border-slate-200/60 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all group">
        <div className="size-8 rounded-md bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
          <MapPin size={15} className="text-emerald-500" />
        </div>
        <div className="min-w-0">
          <span className="text-[9px] font-black text-slate-400 tracking-wider uppercase">
            Address (ที่อยู่)
          </span>
          <p className="text-xs font-bold text-slate-700 mt-0.5 truncate">
            {building.address || "มหาวิทยาลัยเทคโนโลยีสุรนารี"}
          </p>
        </div>
      </div>
    </div>
  );
}
