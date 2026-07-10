import React from "react";
import { Calendar, User, CreditCard, FileText, Hash } from "lucide-react";
import { RentalSpace } from "@/features/areas/types/rental-space";
import { HighlightCard } from "./HighlightCard";

interface SingleTenantSectionProps {
  location: RentalSpace;
}

export default function SingleTenantSection({ location }: SingleTenantSectionProps) {
  if (!location.tenantName || location.tenantName === "-") {
    return (
      <div className="rounded-[7px] border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
        <p className="text-[13px] font-bold text-slate-400">ยังไม่มีการทำสัญญา (พื้นที่ว่าง)</p>
        <p className="text-[10px] text-slate-400 mt-1">สามารถทำการเพิ่มข้อมูลผู้เช่าได้โดยคลิกที่ปุ่ม "มอบสิทธิ์ผู้เช่า" ด้านล่าง</p>
      </div>
    );
  }

  return (
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
  );
}
