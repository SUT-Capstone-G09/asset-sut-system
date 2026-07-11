import React, { useState } from "react";
import { Store, X, User, Hash, CreditCard, FileText, Pencil, ExternalLink } from "lucide-react";
import { MapElement } from "@/features/space-rental/types/floor-plan";
import { mockStallContracts } from "@/features/space-rental/data/mock-stall-contracts";
import { RentalSpace } from "@/features/space-rental/types/rental-space";
import { cn } from "@/lib/utils";

interface CanteenStallsSectionProps {
  location: RentalSpace;
  stalls: MapElement[];
  occupiedStallsCount: number;
  vacantStallsCount: number;
  inactiveStallsCount: number;
  totalStallsCount: number;
  occupancyPercent: number;
}

export default function CanteenStallsSection({
  location,
  stalls,
  occupiedStallsCount,
  vacantStallsCount,
  inactiveStallsCount,
  totalStallsCount,
  occupancyPercent,
}: CanteenStallsSectionProps) {
  const [expandedStallId, setExpandedStallId] = useState<string | null>(null);

  if (stalls.length === 0) {
    return (
      <div className="rounded-[7px] border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
        <p className="text-[13px] font-bold text-slate-400">ยังไม่มีการตั้งค่าผังแผงร้านค้าย่อย</p>
        <p className="text-[10px] text-slate-400 mt-1">
          สามารถเพิ่มแผงร้านค้าและจัดแบ่งแผนผังได้ทางเมนู "แก้ไขแปลนผัง (Floor Plan)" ด้านล่าง
        </p>
      </div>
    );
  }

  return (
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
                    <div
                      className={cn(
                        "size-8 rounded-[5px] border flex items-center justify-center font-black text-xs shrink-0 transition-all shadow-sm",
                        stall.status === "occupied"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : stall.status === "open"
                          ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      )}
                    >
                      {stall.label || stall.id}
                    </div>

                    {/* Shop Name */}
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "text-[12px] font-bold truncate text-left",
                          stall.status === "occupied"
                            ? "text-slate-700 font-bold"
                            : "text-slate-400 italic font-medium"
                        )}
                      >
                        {stall.status === "occupied"
                          ? contract?.tenantName || stall.name
                          : "แผงว่าง (รอเปิดให้เช่า)"}
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
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                              ผู้เช่าแผง / ผู้ประกอบการ
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <User size={12} className="text-[#f26522]" />
                              <span className="text-[12px] font-bold text-slate-700 truncate">
                                {contract?.ownerName || "ไม่ระบุ"}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                              เบอร์ติดต่อ
                            </span>
                            <span className="text-[12px] font-bold text-slate-700 font-mono block mt-0.5">
                              {contract?.phone || "ไม่ระบุ"}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3.5 text-left">
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                              หมวดหมู่อาหาร
                            </span>
                            <span className="text-[12px] font-bold text-[#f26522] mt-0.5 block">
                              {contract?.category || "ไม่ระบุ"}
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                              เลขที่สัญญาแผงย่อย
                            </span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Hash size={11} className="text-slate-400" />
                              <span className="text-[12px] font-bold text-slate-700 font-mono">
                                {contract?.contractNumber || "CON-ST-TEMP"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2.5 border-t border-dashed border-slate-100 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="px-2 py-0.5 bg-[#f26522]/10 text-[#f26522] border border-[#f26522]/20 rounded text-[10px] font-black">
                              ค่าเช่าแผงรายเดือน: {contract?.price.toLocaleString()} ฿
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">
                            สิ้นสุดสัญญา: {contract?.endDate || "ไม่ระบุ"}
                          </span>
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
                          <p className="text-[12px] font-bold text-slate-700">
                            แผงว่าง `{stall.label || stall.id}` พร้อมเปิดรับผู้สมัคร
                          </p>
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
                          <p className="text-[12px] font-bold text-slate-700">
                            แผง `{stall.label}` ปิดปรับปรุงระบบชั่วคราว
                          </p>
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
  );
}
