"use client";

import React from "react";
import { Calendar, CreditCard, ShieldCheck, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tenant } from "../types";
import { Button } from "@/components/ui/button";

interface InvoiceSummaryProps {
  tenant: Tenant | null;
  onUploadClick: () => void;
}

export function InvoiceSummary({ tenant, onUploadClick }: InvoiceSummaryProps) {
  if (!tenant) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 bg-white border border-slate-100 rounded-3xl shadow-sm">
        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
          <Upload size={32} className="text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">ข้อมูลเบื้องต้น</h3>
        <p className="text-sm text-slate-400 text-center mt-1">
          กรุณาเลือกผู้เช่าเพื่อดำเนินการอัพโหลดใบแจ้งหนี้
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-6 border-b border-slate-50">
        <h3 className="text-lg font-bold text-slate-800">ข้อมูลเบื้องต้น</h3>
      </div>

      <div className="flex-1 p-8 space-y-8">
        <div className="grid grid-cols-1 gap-6">
          <InfoItem
            icon={<Calendar size={18} />}
            label="งวดการเช่าปัจจุบัน"
            value={tenant.currentPeriod}
          />
          <InfoItem
            icon={<CreditCard size={18} />}
            label="ยอดค้างชำระทั้งหมด"
            value={`${tenant.outstandingAmount.toLocaleString()} บาท`}
            highlight={tenant.outstandingAmount > 0}
          />
          <InfoItem
            icon={<ShieldCheck size={18} />}
            label="สถานะสัญญาล่าสุด"
            value={tenant.status}
            statusBadge
          />
        </div>
      </div>

      <div className="p-6 bg-slate-50/50">
        <Button
          onClick={onUploadClick}
          className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-slate-200 transition-all active:scale-[0.98]"
        >
          <Upload size={20} />
          อัพโหลดใบแจ้งหนี้
        </Button>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
  highlight = false,
  statusBadge = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
  statusBadge?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
          {icon}
        </div>
        <span className="text-sm font-medium text-slate-500">{label}</span>
      </div>
      {statusBadge ? (
        <span className={cn(
          "px-3 py-1 rounded-full text-[11px] font-bold tracking-wider",
          value === "ACTIVE" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
        )}>
          {value}
        </span>
      ) : (
        <span className={cn(
          "text-lg font-bold",
          highlight ? "text-red-500" : "text-slate-900"
        )}>
          {value}
        </span>
      )}
    </div>
  );
}
