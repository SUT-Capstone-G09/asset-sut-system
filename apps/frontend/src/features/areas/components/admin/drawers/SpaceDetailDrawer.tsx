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
  X, ExternalLink, Calendar, LayoutGrid,
  Store, User
} from "lucide-react";
import { RentalSpace } from "@/features/areas/types/rental-space";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import React from "react";
import { getCanteenStallStats } from "@/features/areas/utils/stall-helpers";
import { HighlightCard } from "./sections/HighlightCard";
import CanteenStallsSection from "./sections/CanteenStallsSection";
import SingleTenantSection from "./sections/SingleTenantSection";

interface Props {
  location: RentalSpace | null;
  open: boolean;
  onClose: () => void;
  onEditClick?: () => void;
  onAssignTenantClick?: () => void;
  onCreateContractClick?: () => void;
}

export default function SpaceDetailDrawer({ 
  location, 
  open, 
  onClose,
  onEditClick,
  onAssignTenantClick,
  onCreateContractClick
}: Props) {
  const router = useRouter();

  if (!location) return null;

  const {
    stalls,
    occupied: occupiedStallsCount,
    vacant: vacantStallsCount,
    inactive: inactiveStallsCount,
    total: totalStallsCount,
    occupancyPercent
  } = getCanteenStallStats(location.id);

  const isCanteen = location.area === "โรงอาหาร";

  const infoItems = [
    {
      icon: MapPin,
      label: "อาคาร / สถานที่",
      value: location.building || "ไม่ระบุ",
    },
    {
      icon: Building2,
      label: isCanteen ? "รหัสศูนย์อาหาร" : "รหัสห้อง / ชื่อพื้นที่",
      value: location.roomNumber || "ไม่ระบุ",
    },
    {
      icon: Maximize2,
      label: isCanteen ? "ขนาดพื้นที่รวม" : "ขนาดพื้นที่เช่า",
      value: location.size || "ไม่ระบุ",
    },
    ...(isCanteen
      ? [
          {
            icon: Calendar,
            label: "เวลาเปิดให้บริการ",
            value: "06:00 - 20:00 น.",
          },
        ]
      : [
          {
            icon: Banknote,
            label: "อัตราเช่าต่อเดือน",
            value: location.price ? `${location.price.toLocaleString()} บาท` : "ไม่ระบุ",
          },
        ]),
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
                    {location.area}
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
                suppressHydrationWarning={true}
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
                  <img src={location.image} suppressHydrationWarning={true} className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity" />
                </div>
              ))}
              <div className="aspect-square rounded-[7px] bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-400 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer">
                +4
              </div>
            </div>
          </div>

          {/* Section 1: General Info */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 pl-1">
              <Building2 size={14} className="text-[#f26522]" />
              ข้อมูลทั่วไปของพื้นที่
            </h3>
            
            {isCanteen ? (
              // CANTEEN METRICS & INFO
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <HighlightCard
                  icon={MapPin}
                  label="อาคาร / สถานที่"
                  value={location.building || "ไม่ระบุ"}
                  subValue="สถานที่ตั้งศูนย์อาหาร"
                  theme="blue"
                  className="w-full"
                />
                <HighlightCard
                  icon={Store}
                  label="ความจุแผงค้าย่อย"
                  value={`${totalStallsCount} แผง`}
                  subValue="จำนวนแผงค้าย่อยทั้งหมด"
                  theme="orange"
                  className="w-full"
                />
              </div>
            ) : (
              // SINGLE TENANT METRICS & INFO
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 h-full flex">
                  <HighlightCard
                    icon={Banknote}
                    label="ราคาเช่า"
                    value={location.price ? `${location.price.toLocaleString()} ฿` : "N/A"}
                    subValue="ต่อเดือน"
                    theme="emerald"
                    className="w-full flex-1"
                  />
                </div>
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {infoItems.map((item) => (
                    <div key={item.label} className="flex items-center gap-3 px-4 py-3.5 rounded-[7px] bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all group">
                      <div className="size-8 rounded-[7px] bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0 group-hover:border-[#f26522]/20 group-hover:bg-[#f26522]/5 transition-colors">
                        <item.icon size={15} className="text-[#6d6e70] group-hover:text-[#f26522] transition-colors" strokeWidth={2} />
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
            )}
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Contract & Tenant Info OR Canteen Sub-stalls */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 pl-1">
              {location.area === "โรงอาหาร" ? (
                <>
                  <Building2 size={14} className="text-[#f26522]" />
                  ผังแผงร้านค้าย่อยภายในโรงอาหาร
                </>
              ) : (
                <>
                  <FileText size={14} className="text-[#f26522]" />
                  ข้อมูลสัญญาเช่าและผู้ประกอบการ
                </>
              )}
            </h3>

            {location.area === "โรงอาหาร" ? (
              <CanteenStallsSection
                location={location}
                stalls={stalls}
                occupiedStallsCount={occupiedStallsCount}
                vacantStallsCount={vacantStallsCount}
                inactiveStallsCount={inactiveStallsCount}
                totalStallsCount={totalStallsCount}
                occupancyPercent={occupancyPercent}
              />
            ) : (
              <SingleTenantSection location={location} />
            )}
          </div>

          <hr className="border-slate-100" />

          {/* Section 3: Notes & Management */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 pl-1">
              <Pencil size={14} className="text-[#f26522]" />
              หมายเหตุ & ปุ่มจัดการพื้นที่
            </h3>

            {/* Notes Card */}
            <div className="rounded-[7px] border border-slate-100 bg-slate-50/50 p-4 flex gap-3 group hover:bg-white hover:border-slate-200 transition-all">
              <div className="size-8 rounded-[7px] bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0">
                <FileText size={15} className="text-[#6d6e70]" />
              </div>
              <div className="flex-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">
                  หมายเหตุเพิ่มเติม / รายละเอียด
                </span>
                <p className="text-[12px] text-slate-600 leading-relaxed">
                  {location.description || "-"}
                </p>
              </div>
            </div>

            {/* Admin Actions buttons */}
            <div className="space-y-3 pt-2">
              {location.area === "โรงอาหาร" ? (
                <>
                  <AdminActionButton
                    label="แก้ไขแปลนผัง (Floor Plan)"
                    icon={LayoutGrid}
                    variant="primary"
                    className="w-full"
                    onClick={() => router.push(`/admin/areas/floor-plan/${location.id}`)}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <AdminActionButton
                      label="แก้ไขข้อมูล (อยู่ระหว่างพัฒนา)"
                      icon={Pencil}
                      variant="secondary"
                      className="opacity-75 text-slate-400 bg-slate-50 hover:bg-slate-50 border-slate-200 cursor-not-allowed"
                    />
                    <AdminActionButton
                      label="จัดการสัญญา (อยู่ระหว่างพัฒนา)"
                      icon={FileText}
                      variant="secondary"
                      className="opacity-75 text-slate-400 bg-slate-50 hover:bg-slate-50 border-slate-200 cursor-not-allowed"
                    />
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  {/* Primary Action Button based on flow state */}
                  {location.status === "available" && (!location.tenantName || location.tenantName === "-") && (
                    <AdminActionButton
                      label="มอบสิทธิ์ผู้เช่า"
                      icon={User}
                      variant="primary"
                      className="w-full"
                      onClick={onAssignTenantClick}
                    />
                  )}

                  {(!location.contractNumber || location.contractNumber === "") && location.tenantName && location.tenantName !== "-" && (
                    <AdminActionButton
                      label="ทำสัญญาเช่าพื้นที่"
                      icon={FileText}
                      variant="primary"
                      className="w-full"
                      onClick={onCreateContractClick}
                    />
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <AdminActionButton
                      label="แก้ไขข้อมูล"
                      icon={Pencil}
                      variant="secondary"
                      onClick={onEditClick}
                    />
                    <AdminActionButton
                      label={location.status === "occupied" ? "จัดการสัญญา" : "ประวัติสัญญา (อยู่ระหว่างพัฒนา)"}
                      icon={FileText}
                      variant="secondary"
                      className={cn(location.status !== "occupied" ? "opacity-75 text-slate-400 bg-slate-50 hover:bg-slate-50 border-slate-200 cursor-not-allowed" : "")}
                      onClick={location.status === "occupied" ? onCreateContractClick : undefined}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
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