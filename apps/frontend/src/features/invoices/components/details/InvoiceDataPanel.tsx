"use client";

import React, { useState, useCallback, useEffect } from "react";
import { PlusCircle, AlertCircle, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  InvoiceExtractedData,
  InvoiceTableColumn,
  InvoiceTableRow,
  InvoiceMetadata,
} from "../../types";

// ─── Utility: compute table summary ──────────────────────────────────────────

/**
 * Parses a locale-formatted number string (e.g. "2,176.00") to float.
 * Returns 0 if the value cannot be parsed.
 */
function parseAmount(value: string | undefined): number {
  if (!value) return 0;
  const cleaned = value.replace(/,/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/** Formats a number to 2 decimal places with thousand separators */
function formatAmount(value: number): string {
  return value.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export interface InvoiceSummary {
  subtotal: number;        // รวม (sum of `total` column)
  outstanding: number;     // ยอดหนี้ค้างชำระ (editable)
  grandTotal: number;      // รวมยอดค้างชำระทั้งสิ้น = subtotal + outstanding
}

/**
 * Computes summary from the rows using the column flagged `highlight: true`
 * (which represents the "total" / "รวมค้างชำระ" column).
 */
export function computeInvoiceSummary(
  columns: InvoiceTableColumn[],
  rows: InvoiceTableRow[],
  outstanding: number
): InvoiceSummary {
  const totalCol = columns.find((c) => c.highlight);
  const subtotal = totalCol
    ? rows.reduce((sum, row) => sum + parseAmount(row[totalCol.key]), 0)
    : 0;
  const grandTotal = subtotal + outstanding;
  return { subtotal, outstanding, grandTotal };
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface InvoiceDataPanelProps {
  data: InvoiceExtractedData | null;
  className?: string;
  /** Called whenever any editable value changes */
  onChange?: (updated: InvoiceExtractedData) => void;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface EditableFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}

function EditableField({ label, value, placeholder, onChange }: EditableFieldProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {label && (
        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        type="text"
        value={value}
        placeholder={placeholder ?? "—"}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "px-3 py-2 text-sm font-medium rounded-md border w-full",
          "bg-white border-slate-200 text-slate-700",
          "focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400",
          "transition-colors placeholder:text-slate-300"
        )}
      />
    </div>
  );
}

interface EditableTableProps {
  columns: InvoiceTableColumn[];
  rows: InvoiceTableRow[];
  onRowChange: (rowIdx: number, key: string, value: string) => void;
  onRowDelete: (rowIdx: number) => void;
  onRowAdd: () => void;
}

function EditableTable({ columns, rows, onRowChange, onRowDelete, onRowAdd }: EditableTableProps) {
  if (columns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-300 gap-2">
        <AlertCircle size={24} />
        <p className="text-xs">ไม่พบข้อมูลตารางในเอกสาร</p>
      </div>
    );
  }

  return (
    <div className="overflow-auto rounded-md border border-slate-200">
      <table className="w-full table-fixed text-xs border-collapse min-w-[400px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-2.5 py-2.5 font-semibold text-slate-500 whitespace-nowrap",
                  col.align === "right" && "text-right",
                  col.align === "center" && "text-center",
                  (!col.align || col.align === "left") && "text-left"
                )}
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
            {/* Delete column header */}
            <th className="w-8 px-1" />
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="px-3 py-8 text-center text-slate-300 italic"
              >
                ไม่มีข้อมูล
              </td>
            </tr>
          ) : (
            rows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-b border-slate-100 last:border-0 group"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-1.5 py-1",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center"
                    )}
                  >
                    <input
                      type="text"
                      value={row[col.key] ?? ""}
                      onChange={(e) => onRowChange(rowIdx, col.key, e.target.value)}
                      className={cn(
                        "w-full px-2 py-1.5 rounded border border-transparent text-xs",
                        "bg-transparent hover:bg-white hover:border-slate-200",
                        "focus:bg-white focus:border-orange-300 focus:ring-1 focus:ring-orange-200 focus:outline-none",
                        "transition-all",
                        col.align === "right" && "text-right",
                        col.align === "center" && "text-center",
                        col.highlight && "font-bold text-orange-500"
                      )}
                    />
                  </td>
                ))}
                {/* Delete button */}
                <td className="px-1 py-1 w-8">
                  <button
                    onClick={() => onRowDelete(rowIdx)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-red-400 hover:text-red-600 transition-all"
                    title="ลบแถว"
                  >
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

interface SummaryTableProps {
  columns: InvoiceTableColumn[];
  rows: InvoiceTableRow[];
  outstanding: number;
  onOutstandingChange: (v: number) => void;
}

function SummaryTable({ columns, rows, outstanding, onOutstandingChange }: SummaryTableProps) {
  const summary = computeInvoiceSummary(columns, rows, outstanding);
  const [outstandingInput, setOutstandingInput] = useState(formatAmount(outstanding));

  // sync from outside if prop changes
  useEffect(() => {
    setOutstandingInput(formatAmount(outstanding));
  }, [outstanding]);

  const handleOutstandingBlur = () => {
    const parsed = parseAmount(outstandingInput);
    onOutstandingChange(parsed);
    setOutstandingInput(formatAmount(parsed));
  };

  return (
    <div className="rounded-md border border-slate-200 overflow-hidden">
      <table className="w-full text-xs border-collapse">
        <tbody>
          {/* รวม */}
          <tr className="border-b border-slate-200 bg-slate-50/80">
            <td className="px-3 py-2.5 font-semibold text-slate-600">รวม</td>
            <td className="px-3 py-2.5 text-right font-bold text-slate-700">
              {formatAmount(summary.subtotal)}
            </td>
          </tr>
          {/* ยอดหนี้ค้างชำระ — editable */}
          <tr className="border-b border-slate-200">
            <td className="px-3 py-2 text-slate-500">ยอดหนี้ค้างชำระ</td>
            <td className="px-3 py-2 text-right">
              <input
                type="text"
                value={outstandingInput}
                onChange={(e) => setOutstandingInput(e.target.value)}
                onBlur={handleOutstandingBlur}
                className={cn(
                  "w-28 px-2 py-1 text-right text-xs rounded border",
                  "border-slate-200 bg-white text-slate-700",
                  "focus:outline-none focus:ring-1 focus:ring-orange-300 focus:border-orange-400",
                  "transition-colors"
                )}
              />
            </td>
          </tr>
          {/* รวมยอดค้างชำระทั้งสิ้น */}
          <tr className="bg-slate-50">
            <td className="px-3 py-3 font-bold text-slate-700">
              รวมยอดค้างชำระทั้งสิ้น
            </td>
            <td className="px-3 py-3 text-right font-bold text-orange-500 text-sm">
              {formatAmount(summary.grandTotal)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ─── Loading / Error States ───────────────────────────────────────────────────

function PendingState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400 py-16">
      <Loader2 size={32} className="animate-spin text-orange-400" />
      <p className="text-sm font-medium">กำลังประมวลผลเอกสาร...</p>
      <p className="text-xs text-slate-300">กรุณารอสักครู่</p>
    </div>
  );
}

function ErrorState({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400 py-16">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
        <AlertCircle size={22} className="text-red-400" />
      </div>
      <p className="text-sm font-semibold text-red-500">ไม่สามารถดึงข้อมูลได้</p>
      {message && (
        <p className="text-xs text-slate-400 max-w-[260px] text-center leading-relaxed">
          {message}
        </p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function InvoiceDataPanel({ data, className, onChange }: InvoiceDataPanelProps) {
  // Local editable state — initialised from prop, kept in sync via useEffect
  const [metadata, setMetadata] = useState<InvoiceMetadata>(data?.metadata ?? {});
  const [rows, setRows] = useState<InvoiceTableRow[]>(data?.rows ?? []);
  const [outstanding, setOutstanding] = useState(0);

  // Re-initialise when data prop changes (new file loaded)
  useEffect(() => {
    if (data?.status === "success") {
      setMetadata(data.metadata);
      setRows(data.rows);
      setOutstanding(0);
    }
  }, [data]);

  // Propagate changes up
  const notify = useCallback(
    (nextMeta: InvoiceMetadata, nextRows: InvoiceTableRow[], nextOutstanding: number) => {
      if (!data || !onChange) return;
      onChange({
        ...data,
        metadata: nextMeta,
        rows: nextRows,
      });
      // outstanding is local-only until backend integration
      void nextOutstanding;
    },
    [data, onChange]
  );

  // ── Metadata handlers ──
  const handleMetaChange = (key: keyof InvoiceMetadata, value: string) => {
    const next = { ...metadata, [key]: value };
    setMetadata(next);
    notify(next, rows, outstanding);
  };

  // ── Row handlers ──
  const handleRowChange = (rowIdx: number, key: string, value: string) => {
    const next = rows.map((r, i) => (i === rowIdx ? { ...r, [key]: value } : r));
    setRows(next);
    notify(metadata, next, outstanding);
  };

  const handleRowDelete = (rowIdx: number) => {
    const next = rows.filter((_, i) => i !== rowIdx);
    setRows(next);
    notify(metadata, next, outstanding);
  };

  const handleRowAdd = () => {
    if (!data) return;
    // Create an empty row with a key for every column
    const emptyRow = data.columns.reduce<InvoiceTableRow>((acc, col) => {
      acc[col.key] = "";
      return acc;
    }, {});
    const next = [...rows, emptyRow];
    setRows(next);
    notify(metadata, next, outstanding);
  };

  const handleOutstandingChange = (v: number) => {
    setOutstanding(v);
    notify(metadata, rows, v);
  };

  // ── Render ──
  return (
    <div className={cn("flex flex-col h-full overflow-hidden", className)}>
      {/* Panel header */}
      <div className="px-5 py-3.5 border-b border-slate-200 bg-white shrink-0">
        <h3 className="text-sm font-bold text-slate-700">
          ข้อมูลที่วิเคราะห์จากเอกสาร
        </h3>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* ── Pending ── */}
        {(!data || data.status === "pending") && <PendingState />}

        {/* ── Error ── */}
        {data?.status === "error" && <ErrorState message={data.errorMessage} />}

        {/* ── Success ── */}
        {data?.status === "success" && (
          <>
            {/* Metadata section */}
            <section className="space-y-3">
              <EditableField
                label="ชื่อหน่วยงาน / โครงการที่นิติกรจ่าย"
                value={metadata.tenantName ?? ""}
                placeholder="กรอกชื่อหน่วยงาน..."
                onChange={(v) => handleMetaChange("tenantName", v)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <EditableField
                  label="เลขที่เอกสารเบิกจ่าย / ใบคำขอรับเงิน"
                  value={metadata.invoiceNo ?? ""}
                  placeholder="เลขที่เอกสาร..."
                  onChange={(v) => handleMetaChange("invoiceNo", v)}
                />
                <EditableField
                  label="วันที่เอกสาร (ลงวันที่)"
                  value={metadata.invoiceDate ?? ""}
                  placeholder="วว/ดด/ปปปป"
                  onChange={(v) => handleMetaChange("invoiceDate", v)}
                />
              </div>
            </section>

            {/* Table section */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-orange-500">
                  รายการข้อมูลการเงิน
                </p>
                <button
                  onClick={handleRowAdd}
                  className="flex items-center gap-1 text-[11px] font-medium text-orange-400 hover:text-orange-600 transition-colors"
                >
                  <PlusCircle size={13} />
                  เพิ่มรายการเบิกจ่าย
                </button>
              </div>

              <EditableTable
                columns={data.columns}
                rows={rows}
                onRowChange={handleRowChange}
                onRowDelete={handleRowDelete}
                onRowAdd={handleRowAdd}
              />
            </section>

            {/* Summary section */}
            <section>
              <SummaryTable
                columns={data.columns}
                rows={rows}
                outstanding={outstanding}
                onOutstandingChange={handleOutstandingChange}
              />
            </section>
          </>
        )}
      </div>
    </div>
  );
}
