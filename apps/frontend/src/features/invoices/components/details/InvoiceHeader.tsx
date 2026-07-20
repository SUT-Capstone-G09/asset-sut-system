"use client";

import React from "react";
import { FileText } from "lucide-react";

export function InvoiceHeader() {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-black tracking-tight text-slate-900">
        อัปโหลดใบแจ้งหนี้
      </h1>
      <p className="text-sm text-slate-400">
        เลือกผู้เช่าและอัปโหลดไฟล์ใบแจ้งหนี้เพื่อดึงข้อมูลเข้าสู่ระบบ
      </p>
    </div>
  );
}
