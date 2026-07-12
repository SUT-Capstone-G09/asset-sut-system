"use client";

import React, { useState } from "react";
import { Pencil, FileText } from "lucide-react";
import SpaceEditDrawer from "./SpaceEditDrawer";
import { RentalSpace } from "../../types/rental-space";
import { Building } from "../../types/building";
import { cn } from "@/lib/utils";

// Sub-components
import SpaceOverviewGrid from "./SpaceOverviewGrid";
import SpaceLocationDetails from "./SpaceLocationDetails";
import InteractiveGallery from "./InteractiveGallery";

interface SpaceDetailInfoTabProps {
  location: RentalSpace;
  building: Building;
  onUpdateLocation: (updatedLoc: RentalSpace) => void;
}

export default function SpaceDetailInfoTab({
  location,
  building,
  onUpdateLocation,
}: SpaceDetailInfoTabProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Status mapping
  const getStatusDetails = (status?: string) => {
    switch (status) {
      case "available":
        return {
          text: "ว่าง (Available)",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
          dot: "bg-emerald-500",
        };
      case "occupied":
        return {
          text: "เช่าแล้ว (Occupied)",
          bg: "bg-blue-50 text-blue-700 border-blue-200/60",
          dot: "bg-blue-500",
        };
      case "maintenance":
        return {
          text: "ปิดปรับปรุง (Maintenance)",
          bg: "bg-rose-50 text-rose-700 border-rose-200/60",
          dot: "bg-rose-500",
        };
      default:
        return {
          text: "ไม่ทราบสถานะ",
          bg: "bg-slate-50 text-slate-700 border-slate-200/60",
          dot: "bg-slate-500",
        };
    }
  };

  const statusInfo = getStatusDetails(location.status);
  const tags: string[] = (location as any).tags ?? [];

  const handleImageUploaded = (newImageUrl: string) => {
    onUpdateLocation({
      ...location,
      image: newImageUrl,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Title Block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              {location.name}
            </h2>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                statusInfo.bg
              )}
            >
              <span className={cn("size-2 rounded-full animate-pulse", statusInfo.dot)} />
              {statusInfo.text}
            </span>
          </div>
          <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">
            Area Code: <span className="text-slate-600 font-black">{location.roomNumber || "N/A"}</span>
          </p>
        </div>

        <button
          onClick={() => setIsEditOpen(true)}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[7px] border border-slate-200 bg-white hover:bg-slate-50 active:scale-[0.98] text-xs font-bold text-slate-600 transition-all shrink-0 shadow-sm"
        >
          <Pencil size={14} strokeWidth={2.5} />
          แก้ไขข้อมูล
        </button>
      </div>

      {/* 1. Overview */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-[#f26522] rounded-full shadow-[0_0_10px_rgba(242,101,34,0.25)]" />
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">
            ข้อมูลภาพรวม
          </h3>
        </div>
        <SpaceOverviewGrid location={location} />
      </div>

      {/* 2. Location Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-[#f26522] rounded-full shadow-[0_0_10px_rgba(242,101,34,0.25)]" />
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">
            ข้อมูลสถานที่ตั้ง
          </h3>
        </div>
        <SpaceLocationDetails building={building} roomNumber={location.roomNumber} />
      </div>

      {/* 3. Description & Tags */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-[#f26522] rounded-full shadow-[0_0_10px_rgba(242,101,34,0.25)]" />
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">
            รายละเอียดและแท็ก
          </h3>
        </div>
        <div className="p-5 rounded-[7px] border border-slate-200/60 bg-white space-y-4">
          <div>
            <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase block mb-1">
              Description (รายละเอียด)
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              {location.description || "ไม่มีรายละเอียดเพิ่มเติมสำหรับพื้นที่นี้"}
            </p>
          </div>
          
          <hr className="border-slate-100" />

          <div>
            <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase block mb-2">
              Tags (แท็กค้นหา)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {tags.length > 0 ? (
                tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200"
                  >
                    #{tag}
                  </span>
                ))
              ) : (
                <span className="text-slate-400 text-xs italic">ไม่มีแท็กระบุไว้</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Gallery */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-[#f26522] rounded-full shadow-[0_0_10px_rgba(242,101,34,0.25)]" />
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">
            แกลเลอรีรูปภาพ
          </h3>
        </div>
        <InteractiveGallery
          primaryImage={location.image}
          images={(location as any).images}
          onImageUploaded={handleImageUploaded}
        />
      </div>

      {/* Edit drawer */}
      <SpaceEditDrawer
        location={location}
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onUpdateLocation={onUpdateLocation}
      />

    </div>
  );
}
