"use client";

import React from "react";
import { Banknote, Maximize2, Tag, Building2 } from "lucide-react";
import { RentalSpace } from "../../types/rental-space";

interface SpaceOverviewGridProps {
  location: RentalSpace;
}

export default function SpaceOverviewGrid({ location }: SpaceOverviewGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Price */}
      <div className="p-4 rounded-md border border-slate-200/60 bg-white hover:border-brand-primary/30 hover:shadow-sm transition-all flex flex-col justify-between h-24">
        <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
          <Banknote size={12} className="text-emerald-500" />
          Price (ราคาเช่า)
        </span>
        <p className="text-base font-black text-slate-800 tracking-tight truncate">
          {location.price ? `${location.price.toLocaleString("th-TH")} ฿` : "N/A"}
        </p>
        <span className="text-[9px] font-bold text-slate-400">ต่อเดือน</span>
      </div>

      {/* Area */}
      <div className="p-4 rounded-md border border-slate-200/60 bg-white hover:border-brand-primary/30 hover:shadow-sm transition-all flex flex-col justify-between h-24">
        <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
          <Maximize2 size={12} className="text-blue-500" />
          Area (ขนาดพื้นที่)
        </span>
        <p className="text-base font-black text-slate-800 tracking-tight truncate">
          {location.size || "ไม่ระบุ"}
        </p>
        <span className="text-[9px] font-bold text-slate-400">ตารางเมตร</span>
      </div>

      {/* Code */}
      <div className="p-4 rounded-md border border-slate-200/60 bg-white hover:border-brand-primary/30 hover:shadow-sm transition-all flex flex-col justify-between h-24">
        <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
          <Tag size={12} className="text-amber-500" />
          Code (รหัสพื้นที่)
        </span>
        <p className="text-base font-black text-slate-800 tracking-tight truncate">
          {location.areaCode || "N/A"}
        </p>
        <span className="text-[9px] font-bold text-slate-400">Area Code</span>
      </div>

      {/* Status */}
      <div className="p-4 rounded-md border border-slate-200/60 bg-white hover:border-brand-primary/30 hover:shadow-sm transition-all flex flex-col justify-between h-24">
        <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
          <Building2 size={12} className="text-indigo-500" />
          Status (สถานะ)
        </span>
        <p className="text-base font-black text-slate-800 tracking-tight truncate">
          {location.status === "available" ? "ว่าง" : location.status === "occupied" ? "เช่าแล้ว" : "ปิดปรับปรุง"}
        </p>
        <span className="text-[9px] font-bold text-slate-400">สถานะปัจจุบัน</span>
      </div>
    </div>
  );
}
