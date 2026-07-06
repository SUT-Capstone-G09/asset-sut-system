import React from "react";
import { Store, Building, Phone, Mail } from "lucide-react";

interface TenantProfileSummaryProps {
  tenant: {
    ownerName: string;
    businessType: string;
    name: string;
    subLocation: string;
    phone?: string;
  };
  areaName: string;
}

export default function TenantProfileSummary({ tenant, areaName }: TenantProfileSummaryProps) {
  return (
    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block border-b border-slate-100 pb-3">
        ผู้ประกอบการ / คู่สัญญาเช่า
      </span>

      <div className="space-y-1">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{tenant.ownerName}</h2>
        <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md">
          {tenant.businessType}
        </span>
      </div>

      <div className="space-y-3.5 pt-2 text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-2.5">
          <Store size={14} className="text-slate-400 shrink-0" />
          <span>ร้านค้า: {tenant.name}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Building size={14} className="text-slate-400 shrink-0" />
          <span>พื้นที่: {areaName} ({tenant.subLocation})</span>
        </div>
        <div className="flex items-center gap-2.5 border-t border-slate-100 pt-3">
          <Phone size={14} className="text-slate-400 shrink-0" />
          <span>เบอร์โทร: {tenant.phone || "081-234-5678"}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Mail size={14} className="text-slate-400 shrink-0" />
          <span>อีเมล: {tenant.ownerName.includes("สมชาย") ? "somchai.s@outlook.com" : "tenant.owner@outlook.com"}</span>
        </div>
      </div>
    </div>
  );
}
