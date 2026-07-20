"use client";

import React from "react";
import { HelpCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InvoiceHelpCard() {
  return (
    <div className="bg-white border border-slate-100 rounded-md p-5 shadow-sm text-center">
      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
        <HelpCircle size={20} className="text-slate-400" />
      </div>
      <p className="text-sm font-semibold text-slate-700">ต้องการความช่วยเหลือ?</p>
      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
        ศึกษาวิธีการอัปโหลดใบแจ้งหนี้ หรือ ติดต่อกับงานของเรา
      </p>
      <Button
        variant="outline"
        size="sm"
        className="mt-4 w-full rounded-md border-slate-200 text-slate-600 text-xs gap-1.5 hover:bg-slate-50"
      >
        ดูคู่มือการใช้งาน
        <ExternalLink size={12} />
      </Button>
    </div>
  );
}
