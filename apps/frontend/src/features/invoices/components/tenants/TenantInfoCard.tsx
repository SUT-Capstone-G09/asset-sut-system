"use client";

import React from "react";
import { Upload, ArrowRight, AlertCircle, User, Phone, Mail, Building2, MapPin, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tenant } from "../../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface TenantInfoCardProps {
  tenant: Tenant | null;
  onProceed: () => void;
}

const STATUS_STYLE: Record<Tenant["status"], string> = {
  Active: "bg-emerald-100 text-emerald-600 border-emerald-200",
  Inactive: "bg-slate-100 text-slate-500 border-slate-200",
  Expired: "bg-red-100 text-red-500 border-red-200",
};

const STATUS_LABEL: Record<Tenant["status"], string> = {
  Active: "Active",
  Inactive: "Inactive",
  Expired: "Expired",
};

const AVATAR_BG: Record<string, string> = {
  M: "bg-orange-500",
  K: "bg-sky-500",
  B: "bg-violet-500",
  S: "bg-pink-500",
  T: "bg-amber-500",
  F: "bg-rose-500",
  default: "bg-slate-500",
};

function getAvatarBg(shortName: string) {
  const first = shortName[0]?.toUpperCase() ?? "D";
  return AVATAR_BG[first] ?? AVATAR_BG.default;
}

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-slate-400 shrink-0 pt-0.5">{label}</span>
      <span className="text-xs font-medium text-slate-700 text-right">{value}</span>
    </div>
  );
}

export function TenantInfoCard({ tenant, onProceed }: TenantInfoCardProps) {
  if (!tenant) {
    return (
      <div className="bg-white border border-slate-100 rounded-md shadow-sm p-8 flex flex-col items-center justify-center text-center min-h-[260px]">
        <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mb-4">
          <Upload size={26} className="text-slate-300" />
        </div>
        <h3 className="text-base font-bold text-slate-700">ข้อมูลผู้เช่าที่เลือก</h3>
        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
          เลือกผู้เช่าจากรายการทางซ้าย<br />เพื่อดูข้อมูลและดำเนินการต่อ
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 rounded-md shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-50">
        <h3 className="text-sm font-bold text-slate-700">ข้อมูลผู้เช่าที่เลือก</h3>
      </div>

      {/* Tenant Identity */}
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3.5">
          {/* Avatar */}
          <div
            className={cn(
              "w-12 h-12 rounded-md flex items-center justify-center font-bold text-white text-sm shrink-0",
              getAvatarBg(tenant.shortName)
            )}
          >
            {tenant.shortName}
          </div>
          {/* Name + Status */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-slate-900 text-sm leading-tight truncate">{tenant.name}</p>
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border",
                  STATUS_STYLE[tenant.status]
                )}
              >
                {STATUS_LABEL[tenant.status]}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">รหัสผู้เช่า: {tenant.shopCode}</p>
          </div>
        </div>

        <Separator />

        {/* Detail Rows */}
        <div className="space-y-3">
          <InfoRow label="ชื่อผู้ติดต่อ" value={tenant.contactName} />
          <InfoRow label="เบอร์โทรศัพท์" value={tenant.phone} />
          <InfoRow label="อีเมล" value={
            <span className="text-orange-500 break-all">{tenant.email}</span>
          } />
          <InfoRow
            label="ชั้น / ห้อง"
            value={
              <span>
                {tenant.floor} <span className="text-slate-300 mx-1">-</span> {tenant.room}
              </span>
            }
          />
          <InfoRow label="โซน" value={tenant.zone} />
          <InfoRow label="วันที่เริ่มสัญญา" value={tenant.contractStartDate} />
        </div>
      </div>

      {/* Action */}
      <div className="px-5 pb-4 space-y-3">
        <Button
          onClick={onProceed}
          className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-md flex items-center justify-center gap-2 shadow-sm shadow-orange-200 transition-all active:scale-[0.98]"
        >
          ดำเนินการต่อ
          <ArrowRight size={16} />
        </Button>

      </div>
    </div>
  );
}
