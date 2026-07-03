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
  CreditCard, Hash, User, Store
} from "lucide-react";
import { Location } from "@/features/areas/types/location";
import { cn } from "@/lib/utils";
import AdminAreaEditDrawer from "./AdminAreaEditDrawer";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { mockFloorPlans } from "@/features/areas/data/floor-plans";
import { MapElement } from "@/features/areas/types/floor-plan";

interface Props {
  location: Location | null;
  open: boolean;
  onClose: () => void;
}

export default function AdminAreaDrawer({ location, open, onClose }: Props) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [expandedStallId, setExpandedStallId] = useState<string | null>(null);

  if (!location) return null;

  const floorPlan = mockFloorPlans.find(fp => fp.locationId === location.id);
  const stalls: MapElement[] = floorPlan ? floorPlan.elements.filter(el => el.type === "area" && el.areaType === "shop") : [];
  const occupiedStallsCount = stalls.filter(s => s.status === "occupied").length;
  const vacantStallsCount = stalls.filter(s => s.status === "open").length;
  const inactiveStallsCount = stalls.filter(s => s.status === "maintenance").length;
  const totalStallsCount = stalls.length;
  const occupancyPercent = totalStallsCount > 0 ? Math.round((occupiedStallsCount / totalStallsCount) * 100) : 0;

  const isCanteen = location.category === "โรงอาหาร";

  // ข้อมูลจำลองสัญญาของแผงย่อยสำหรับโรงอาหาร
  const mockStallContracts: Record<string, {
    tenantName: string;
    ownerName: string;
    phone: string;
    category: string;
    contractNumber: string;
    price: number;
    endDate: string;
  }> = {
    "A01": {
      tenantName: "ร้านก๋วยเตี๋ยวเรือแสนดี",
      ownerName: "นางสมศรี รสดี",
      phone: "081-234-5678",
      category: "ก๋วยเตี๋ยว / อาหารเส้น",
      contractNumber: "CON-ST-101",
      price: 5000,
      endDate: "31 ธ.ค. 2569",
    },
    "A02": {
      tenantName: "ร้านส้มตำจัดจ้าน",
      ownerName: "นายมานะ มีโชค",
      phone: "089-876-5432",
      category: "อาหารอีสาน / ส้มตำ",
      contractNumber: "CON-ST-102",
      price: 5000,
      endDate: "30 พ.ย. 2569",
    },
    "B01": {
      tenantName: "ร้านชาบู & สุกี้โบราณ",
      ownerName: "บริษัท ชาบูกรู๊ป จำกัด (ผู้แทน)",
      phone: "02-123-4567",
      category: "สุกี้ / ชาบูปิ้งย่าง",
      contractNumber: "CON-ST-103",
      price: 7500,
      endDate: "31 ต.ค. 2569",
    },
    "B03": {
      tenantName: "ร้านเครื่องดื่ม & น้ำผลไม้คั้นสด",
      ownerName: "น.ส.วิภาดา ชื่นใจ",
      phone: "085-555-6789",
      category: "เครื่องดื่ม / เบเกอรี่",
      contractNumber: "CON-ST-104",
      price: 4500,
      endDate: "31 ส.ค. 2569",
    },
    "B04": {
      tenantName: "ร้านขนมหวานสไตล์ไทย",
      ownerName: "นายกิตติคุณ อิ่มอร่อย",
      phone: "086-444-1234",
      category: "ของหวาน / ไอศกรีม",
      contractNumber: "CON-ST-105",
      price: 4500,
      endDate: "31 ธ.ค. 2569",
    },
  };

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
    <>
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
              // CANTEEN METRICS & INFO (โชว์แค่ อาคาร/สถานที่ และ ความจุแผงค้าย่อย ตาม Requirement)
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
              {location.category === "โรงอาหาร" ? (
                <>
                  <Store size={14} className="text-[#f26522]" />
                  ผังแผงร้านค้าย่อยภายในโรงอาหาร
                </>
              ) : (
                <>
                  <FileText size={14} className="text-[#f26522]" />
                  ข้อมูลสัญญาเช่าและผู้ประกอบการ
                </>
              )}
            </h3>

            {location.category === "โรงอาหาร" ? (
              // CANTEEN LAYOUT
              stalls.length === 0 ? (
                <div className="rounded-[7px] border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                  <p className="text-[13px] font-bold text-slate-400">ยังไม่มีการตั้งค่าผังแผงร้านค้าย่อย</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    สามารถเพิ่มแผงร้านค้าและจัดแบ่งแผนผังได้ทางเมนู "แก้ไขแปลนผัง (Floor Plan)" ด้านล่าง
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Occupancy Stats Card */}
                  <div className="rounded-[7px] border border-slate-100 bg-[#f26522]/5 p-5 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                        ภาพรวมอัตราการเช่าแผงร้านค้า (Occupancy Rate)
                      </span>
                      <span className="text-[12px] font-black text-[#f26522]">
                        {occupiedStallsCount} / {totalStallsCount} แผง ({occupancyPercent}%)
                      </span>
                    </div>

                    {/* Custom progress bar */}
                    <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
                      <div 
                        className="h-full bg-gradient-to-r from-[#f26522] to-[#d8561d] transition-all duration-500 rounded-full"
                        style={{ width: `${occupancyPercent}%` }}
                      />
                    </div>

                    {/* Stats badges */}
                    <div className="grid grid-cols-3 gap-3 pt-1 text-center">
                      <div className="p-2 bg-white rounded-[5px] border border-slate-100 shadow-sm">
                        <span className="text-[9px] font-bold text-slate-400 block uppercase">มีผู้เช่าแล้ว</span>
                        <span className="text-sm font-black text-emerald-600">{occupiedStallsCount} แผง</span>
                      </div>
                      <div className="p-2 bg-white rounded-[5px] border border-slate-100 shadow-sm">
                        <span className="text-[9px] font-bold text-slate-400 block uppercase">ว่างรอผู้เช่า</span>
                        <span className="text-sm font-black text-amber-500">{vacantStallsCount} แผง</span>
                      </div>
                      <div className="p-2 bg-white rounded-[5px] border border-slate-100 shadow-sm">
                        <span className="text-[9px] font-bold text-slate-400 block uppercase">ปิดปรับปรุง</span>
                        <span className="text-sm font-black text-slate-500">{inactiveStallsCount} แผง</span>
                      </div>
                    </div>
                  </div>

                  {/* List of sub-stalls inside canteen (Interactive Accordion Grid) */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block pl-1">
                      ทำเนียบแผงร้านค้าย่อย (คลิกที่แผงเพื่อดูรายละเอียดสัญญา)
                    </span>
                    <div className="flex flex-col gap-2">
                      {stalls.map((stall) => {
                        const isExpanded = expandedStallId === stall.id;
                        const contract = stall.label ? mockStallContracts[stall.label] : undefined;

                        return (
                          <div key={stall.id} className="transition-all duration-300">
                            <div 
                              onClick={() => setExpandedStallId(isExpanded ? null : stall.id)}
                              className={cn(
                                "flex items-center justify-between p-3 rounded-[7px] border transition-all cursor-pointer select-none group",
                                isExpanded 
                                  ? "bg-slate-50 border-slate-200 shadow-sm rounded-b-none" 
                                  : "bg-slate-50/50 border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-sm"
                              )}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {/* Stall label (e.g. A01) */}
                                <div className={cn(
                                  "size-8 rounded-[5px] border flex items-center justify-center font-black text-xs shrink-0 transition-all shadow-sm",
                                  stall.status === "occupied" 
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                    : stall.status === "open"
                                      ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                                      : "bg-slate-100 text-slate-500 border-slate-200"
                                )}>
                                  {stall.label || stall.id}
                                </div>
                                
                                {/* Shop Name */}
                                <div className="min-w-0">
                                  <p className={cn(
                                    "text-[12px] font-bold truncate text-left",
                                    stall.status === "occupied" ? "text-slate-700 font-bold" : "text-slate-400 italic font-medium"
                                  )}>
                                    {stall.status === "occupied" ? (contract?.tenantName || stall.name) : "แผงว่าง (รอเปิดให้เช่า)"}
                                  </p>
                                </div>
                              </div>

                              {/* Status Badge */}
                              <div className="flex items-center gap-2">
                                {stall.status === "occupied" && (
                                  <span className="bg-emerald-50 text-emerald-600 border border-emerald-100/70 px-2.5 py-0.5 rounded-[4px] text-[9px] font-black uppercase tracking-wider shrink-0">
                                    มีผู้เช่า
                                  </span>
                                )}
                                {stall.status === "open" && (
                                  <span className="bg-amber-50 text-amber-500 border border-amber-100/70 px-2.5 py-0.5 rounded-[4px] text-[9px] font-black uppercase tracking-wider shrink-0">
                                    ว่าง
                                  </span>
                                )}
                                {stall.status === "maintenance" && (
                                  <span className="bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-0.5 rounded-[4px] text-[9px] font-black uppercase tracking-wider shrink-0">
                                    ปิดปรับปรุง
                                  </span>
                                )}
                                <svg 
                                  className={cn(
                                    "size-4 text-slate-400 transition-transform duration-200 shrink-0",
                                    isExpanded ? "transform rotate-180 text-[#f26522]" : "group-hover:text-slate-600"
                                  )}
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>

                            {/* Expanded sub-contract panel */}
                            {isExpanded && (
                              <div className="p-4 bg-white border-x border-b border-slate-200 rounded-b-[7px] space-y-4 transition-all duration-300">
                                {stall.status === "occupied" ? (
                                  <>
                                    <div className="grid grid-cols-2 gap-3.5 text-left">
                                      <div className="space-y-0.5">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">ผู้เช่าแผง / ผู้ประกอบการ</span>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                          <User size={12} className="text-[#f26522]" />
                                          <span className="text-[12px] font-bold text-slate-700 truncate">{contract?.ownerName || "ไม่ระบุ"}</span>
                                        </div>
                                      </div>
                                      <div className="space-y-0.5">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">เบอร์ติดต่อ</span>
                                        <span className="text-[12px] font-bold text-slate-700 font-mono block mt-0.5">{contract?.phone || "ไม่ระบุ"}</span>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3.5 text-left">
                                      <div className="space-y-0.5">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">หมวดหมู่อาหาร</span>
                                        <span className="text-[12px] font-bold text-[#f26522] mt-0.5 block">{contract?.category || "ไม่ระบุ"}</span>
                                      </div>
                                      <div className="space-y-0.5">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">เลขที่สัญญาแผงย่อย</span>
                                        <div className="flex items-center gap-1 mt-0.5">
                                          <Hash size={11} className="text-slate-400" />
                                          <span className="text-[12px] font-bold text-slate-700 font-mono">{contract?.contractNumber || "CON-ST-TEMP"}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="pt-2.5 border-t border-dashed border-slate-100 flex flex-wrap items-center justify-between gap-2">
                                      <div className="flex items-center gap-2">
                                        <div className="px-2 py-0.5 bg-[#f26522]/10 text-[#f26522] border border-[#f26522]/20 rounded text-[10px] font-black">
                                          ค่าเช่าแผงรายเดือน: {contract?.price.toLocaleString()} ฿
                                        </div>
                                      </div>
                                      <span className="text-[10px] text-slate-400 font-medium">สิ้นสุดสัญญา: {contract?.endDate || "ไม่ระบุ"}</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                      <button className="h-8 text-[11px] font-bold bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-[5px] transition-all flex items-center justify-center gap-1.5 active:scale-95">
                                        <FileText size={12} />
                                        <span>ใบเสร็จ / การเงิน</span>
                                      </button>
                                      <button className="h-8 text-[11px] font-bold bg-[#f26522]/5 border border-[#f26522]/20 text-[#f26522] hover:bg-[#f26522]/10 rounded-[5px] transition-all flex items-center justify-center gap-1.5 active:scale-95">
                                        <Pencil size={12} />
                                        <span>แก้ไขสัญญาย่อย</span>
                                      </button>
                                    </div>
                                  </>
                                ) : stall.status === "open" ? (
                                  <div className="text-center py-2 space-y-3">
                                    <div className="inline-flex items-center justify-center size-10 rounded-full bg-amber-50 text-amber-500 border border-amber-100">
                                      <Store size={18} />
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-[12px] font-bold text-slate-700">แผงว่าง `{stall.label || stall.id}` พร้อมเปิดรับผู้สมัคร</p>
                                      <p className="text-[10px] text-slate-400 leading-relaxed max-w-xs mx-auto text-center">
                                        แผงนี้ว่างอยู่ คุณสามารถลงทะเบียนผู้ประกอบการใหม่ ทำสัญญารายแผง หรือเปิดรับสมัครร้านค้าทางออนไลน์ได้ทันที
                                      </p>
                                    </div>
                                    <div className="flex gap-2 justify-center pt-2">
                                      <button className="h-8 px-4 text-[11px] font-bold bg-[#f26522] text-white hover:bg-[#d8561d] rounded-[5px] transition-all shadow-sm active:scale-95">
                                        + ออกสัญญาแผง
                                      </button>
                                      <button className="h-8 px-4 text-[11px] font-bold bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-[5px] transition-all active:scale-95">
                                        เปิดรับสมัครร้านค้า
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  // Inactive / Maintenance
                                  <div className="text-center py-2 space-y-3">
                                    <div className="inline-flex items-center justify-center size-10 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                                      <X size={18} />
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-[12px] font-bold text-slate-700">แผง `{stall.label}` ปิดปรับปรุงระบบชั่วคราว</p>
                                      <p className="text-[10px] text-slate-400 leading-relaxed max-w-xs mx-auto text-center">
                                        อยู่ระหว่างปรับปรุงระบบระบายน้ำทิ้ง ท่อดักไขมัน และเครื่องดูดอากาศ คาดว่าจะแล้วเสร็จและพร้อมเปิดจองอีกครั้งในวันที่ 15 มิ.ย. 2569
                                      </p>
                                    </div>
                                    <div className="flex justify-center pt-1">
                                      <button className="h-8 px-4 text-[11px] font-bold bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-[5px] transition-all flex items-center gap-1.5 active:scale-95">
                                        <span>รายงานปัญหาเทคนิค</span>
                                        <ExternalLink size={11} />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )
            ) : (
              // SINGLE TENANT LAYOUT
              !location.tenantName || location.tenantName === "-" ? (
                <div className="rounded-[7px] border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                  <p className="text-[13px] font-bold text-slate-400">ยังไม่มีการทำสัญญา (พื้นที่ว่าง)</p>
                  <p className="text-[10px] text-slate-400 mt-1">สามารถทำการเพิ่มข้อมูลผู้เช่าและสัญญาได้ทางเมนูแก้ไขข้อมูล</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1 h-full flex">
                    <HighlightCard
                      icon={Calendar}
                      label="สิ้นสุดสัญญา"
                      value={location.contractEndDate || "ไม่มีสัญญา"}
                      subValue="วันหมดอายุ"
                      theme="amber"
                      className="w-full flex-1"
                    />
                  </div>
                  <div className="md:col-span-2 rounded-[7px] border border-slate-100 bg-[#f26522]/5 p-5 space-y-4 flex flex-col justify-between">
                    {/* Row 1: Tenant & ID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                          ผู้ประกอบการ / บริษัท
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="size-6 rounded-[4px] bg-white flex items-center justify-center border border-[#f26522]/10 shrink-0">
                            <User size={12} className="text-[#f26522]" />
                          </div>
                          <span className="text-[13px] font-bold text-slate-700 truncate">
                            {location.tenantName}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                          เลขบัตรประชาชน / เลขทะเบียนนิติบุคคล
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="size-6 rounded-[4px] bg-white flex items-center justify-center border border-[#f26522]/10 shrink-0">
                            <CreditCard size={12} className="text-[#f26522]" />
                          </div>
                          <span className="text-[13px] font-bold text-slate-700">
                            {location.citizenId || "ไม่ระบุ"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Row 2: Contract Name & Number */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                          ชื่อสัญญา
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="size-6 rounded-[4px] bg-white flex items-center justify-center border border-[#f26522]/10 shrink-0">
                            <FileText size={12} className="text-[#f26522]" />
                          </div>
                          <span className="text-[13px] font-bold text-slate-700 truncate">
                            {location.contractName || "ไม่ระบุ"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                          เลขที่สัญญา
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="size-6 rounded-[4px] bg-white flex items-center justify-center border border-[#f26522]/10 shrink-0">
                            <Hash size={12} className="text-[#f26522]" />
                          </div>
                          <span className="text-[13px] font-bold text-slate-700 font-mono">
                            {location.contractNumber || "ไม่ระบุ"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
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
              {location.category === "โรงอาหาร" && (
                <AdminActionButton
                  label="แก้ไขแปลนผัง (Floor Plan)"
                  icon={LayoutGrid}
                  variant="primary"
                  className="w-full"
                  onClick={() => router.push(`/admin/areas/floor-plan/${location.id}`)}
                />
              )}

              <div className="grid grid-cols-2 gap-3">
                <AdminActionButton
                  label={location.category === "โรงอาหาร" ? "แก้ไขข้อมูล (อยู่ระหว่างพัฒนา)" : "แก้ไขข้อมูล"}
                  icon={Pencil}
                  variant="secondary"
                  className={cn(location.category === "โรงอาหาร" ? "opacity-75 text-slate-400 bg-slate-50 hover:bg-slate-50 border-slate-200 cursor-not-allowed" : "")}
                  onClick={location.category === "โรงอาหาร" ? undefined : () => setIsEditOpen(true)}
                />
                <AdminActionButton
                  label={location.category === "โรงอาหาร" ? "จัดการสัญญา (อยู่ระหว่างพัฒนา)" : "จัดการสัญญา"}
                  icon={FileText}
                  variant="secondary"
                  className={cn(location.category === "โรงอาหาร" ? "opacity-75 text-slate-400 bg-slate-50 hover:bg-slate-50 border-slate-200 cursor-not-allowed" : "")}
                  onClick={undefined}
                />
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>

    <AdminAreaEditDrawer 
      location={location}
      open={isEditOpen}
      onClose={() => setIsEditOpen(false)}
    />

  </>
  );
}

function HighlightCard({ icon: Icon, label, value, subValue, theme, className }: any) {
  const themes = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    orange: "bg-[#f26522]/5 text-[#f26522] border-[#f26522]/10",
  };

  return (
    <div className={cn("p-5 rounded-[7px] border transition-all hover:scale-[1.02] flex flex-col justify-between", themes[theme as keyof typeof themes], className)}>
      <div>
        <div className="flex items-center gap-2 mb-3 opacity-70">
          <Icon size={16} strokeWidth={3} />
          <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </div>
        <div className="space-y-0.5">
          <p className="text-xl font-black text-slate-900 leading-tight">{value}</p>
        </div>
      </div>
      <p className="text-[10px] font-bold opacity-60 uppercase mt-2">{subValue}</p>
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