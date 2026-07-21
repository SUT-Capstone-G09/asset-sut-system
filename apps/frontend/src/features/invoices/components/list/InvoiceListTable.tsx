"use client";

import React from "react";
import { FileText, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SavedInvoice } from "../../types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatAmount(value: number): string {
  return value.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface InvoiceListTableProps {
  invoices: SavedInvoice[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InvoiceListTable({ invoices }: InvoiceListTableProps) {
  if (invoices.length === 0) return null;

  return (
    <div className="bg-white border border-slate-100 rounded-md shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
        <FileText size={16} className="text-orange-500 shrink-0" />
        <h2 className="text-sm font-bold text-slate-800">
          ใบแจ้งหนี้ที่บันทึกแล้ว
        </h2>
        <span className="ml-auto text-xs font-semibold bg-orange-100 text-orange-600 rounded-full px-2 py-0.5">
          {invoices.length} รายการ
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <th className="px-5 py-3 text-left whitespace-nowrap">ผู้เช่า</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">เลขที่เอกสาร</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">วันที่เอกสาร</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">ชื่อไฟล์</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">ยอดรวม (บาท)</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">วันที่บันทึก</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, idx) => (
              <tr
                key={inv.id}
                className={cn(
                  "border-b border-slate-100 last:border-0 transition-colors hover:bg-orange-50/40",
                  idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                )}
              >
                {/* Tenant */}
                <td className="px-5 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {inv.tenant.shortName}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 leading-tight">
                        {inv.tenant.name}
                      </p>
                      <p className="text-slate-400 text-[10px]">{inv.tenant.shopCode}</p>
                    </div>
                  </div>
                </td>

                {/* Invoice No */}
                <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-700">
                  {inv.invoiceNo || "—"}
                </td>

                {/* Invoice Date */}
                <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                  {inv.invoiceDate || "—"}
                </td>

                {/* File name */}
                <td className="px-4 py-3 max-w-[180px]">
                  <p className="truncate text-slate-500" title={inv.fileName}>
                    {inv.fileName}
                  </p>
                </td>

                {/* Total Amount */}
                <td className="px-4 py-3 text-right font-semibold text-orange-600 whitespace-nowrap">
                  {formatAmount(inv.totalAmount)}
                </td>

                {/* Saved At */}
                <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                  {formatDate(inv.savedAt)}
                </td>

                {/* Status — always uploaded = approved */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <CheckCircle size={10} />
                    อัปโหลดแล้ว
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
