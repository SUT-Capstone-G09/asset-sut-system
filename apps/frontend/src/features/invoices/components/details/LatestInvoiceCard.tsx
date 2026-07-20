"use client";

import React from "react";
import {
  FileText,
  ChevronRight,
  Inbox,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SavedInvoice, Tenant } from "../../types";

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

interface LatestInvoiceCardProps {
  tenant: Tenant | null;
  /** All saved invoices across all tenants */
  savedInvoices: SavedInvoice[];
  /** Called when the user clicks "view all history" */
  onViewHistory?: (tenant: Tenant) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LatestInvoiceCard({
  tenant,
  savedInvoices,
  onViewHistory,
}: LatestInvoiceCardProps) {
  // Empty state — no tenant selected
  if (!tenant) {
    return (
      <div className="bg-white border border-slate-100 rounded-md shadow-sm p-6 flex flex-col items-center justify-center text-center min-h-[140px]">
        <Inbox size={22} className="text-slate-300 mb-2" />
        <p className="text-xs font-medium text-slate-500">ประวัติใบแจ้งหนี้</p>
        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
          เลือกผู้เช่าเพื่อดูใบแจ้งหนี้ล่าสุด
        </p>
      </div>
    );
  }

  // Filter to current tenant only, sorted newest first
  const tenantInvoices = savedInvoices
    .filter((inv) => inv.tenant.id === tenant.id)
    .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());

  const latest = tenantInvoices[0] ?? null;
  const totalCount = tenantInvoices.length;

  return (
    <div className="bg-white border border-slate-100 rounded-md shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-orange-500 shrink-0" />
          <p className="text-sm font-bold text-slate-700">ใบแจ้งหนี้ล่าสุด</p>
        </div>
        {totalCount > 0 && (
          <span className="text-[10px] font-semibold bg-orange-100 text-orange-600 rounded-full px-2 py-0.5">
            {totalCount} รายการทั้งหมด
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {!latest ? (
          /* No invoices yet for this tenant */
          <div className="flex flex-col items-center text-center py-4">
            <Inbox size={20} className="text-slate-300 mb-2" />
            <p className="text-xs text-slate-500 font-medium">ยังไม่มีใบแจ้งหนี้</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              กดดำเนินการต่อเพื่ออัปโหลดใบแจ้งหนี้แรก
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Invoice No + uploaded badge */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-slate-400">เลขที่เอกสาร</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  {latest.invoiceNo || "—"}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0">
                <CheckCircle size={10} />
                อัปโหลดแล้ว
              </span>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-100" />

            {/* Detail rows */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">วันที่เอกสาร</span>
                <span className="font-medium text-slate-700">
                  {latest.invoiceDate || "—"}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">ไฟล์เอกสาร</span>
                <span
                  className="font-medium text-slate-700 truncate max-w-[140px]"
                  title={latest.fileName}
                >
                  {latest.fileName}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">วันที่บันทึก</span>
                <span className="font-medium text-slate-700">
                  {formatDate(latest.savedAt)}
                </span>
              </div>
              <div className="flex justify-between text-xs border-t border-slate-100 pt-2 mt-1">
                <span className="text-slate-500 font-semibold">ยอดรวมค้างชำระ</span>
                <span className="font-bold text-orange-600">
                  {formatAmount(latest.totalAmount)} บาท
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer: View history link */}
      {totalCount > 0 && (
        <button
          type="button"
          onClick={() => onViewHistory?.(tenant)}
          className="w-full flex items-center justify-between px-5 py-3 border-t border-slate-100 text-xs font-semibold text-orange-500 hover:bg-orange-50 transition-colors group"
        >
          <span>ดูประวัติใบแจ้งหนี้ทั้งหมด ({totalCount} รายการ)</span>
          <ChevronRight
            size={14}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </button>
      )}
    </div>
  );
}
