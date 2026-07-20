"use client";

import React, { useMemo, useState } from "react";
import { CloudUpload, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Tenant, InvoiceExtractedData, SavedInvoice } from "../../types";
import { PdfViewer } from "../../../../components/ui/PdfViewer";
import { InvoiceDataPanel, computeInvoiceSummary } from "../details/InvoiceDataPanel";
import { createMockExtractedData } from "../../data/mock";


// ─── Props ────────────────────────────────────────────────────────────────────

interface ReviewInvoiceModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: Tenant | null;
  file: File | null;
  onRestart: () => void;
  onSave: (invoice: SavedInvoice) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ReviewInvoiceModal({
  isOpen,
  onOpenChange,
  tenant,
  file,
  onRestart,
  onSave,
}: ReviewInvoiceModalProps) {
  // Track edits from InvoiceDataPanel
  const [editedData, setEditedData] = useState<InvoiceExtractedData | null>(null);

  // In the future: fetch from backend when file changes
  // For now: simulate extraction with mock data.
  const initialData = useMemo<InvoiceExtractedData | null>(
    () => (file ? createMockExtractedData(file.name) : null),
    [file]
  );

  // When file changes, reset edits
  React.useEffect(() => {
    setEditedData(null);
  }, [file]);

  const extractedData = editedData ?? initialData;

  if (!tenant || !file) return null;

  const handleClose = () => onOpenChange(false);

  const handleSave = () => {
    if (!extractedData) return;
    const summary = computeInvoiceSummary(
      extractedData.columns,
      extractedData.rows,
      0 // outstanding debt — editable field not yet wired to summary; default 0
    );
    const invoice: SavedInvoice = {
      id: crypto.randomUUID(),
      savedAt: new Date().toISOString(),
      tenant,
      fileName: file.name,
      invoiceNo: extractedData.metadata.invoiceNo ?? "",
      invoiceDate: extractedData.metadata.invoiceDate ?? "",
      subtotal: summary.subtotal,
      outstandingDebt: summary.outstanding,
      totalAmount: summary.grandTotal,
      lineItems: extractedData.rows,
      columns: extractedData.columns,
    };
    onSave(invoice);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="
          sm:max-w-[1400px] w-[95vw] max-h-[90vh]
          p-0 gap-0 overflow-hidden rounded-xl
          border-none shadow-2xl flex flex-col
        "
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <CloudUpload size={20} className="text-orange-500 shrink-0" />
            <div>
              <DialogTitle className="text-base font-bold text-orange-500 leading-tight">
                อัปโหลดและตรวจสอบเอกสารใบแจ้งหนี้
              </DialogTitle>
              <p className="text-[11px] text-slate-400 mt-0.5">
                การตรวจสอบความถูกต้องก่อนบันทึก
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 transition-colors rounded-md p-1.5 hover:bg-slate-100"
            aria-label="ปิด"
          >
            ✕
          </button>
        </div>

        {/* ── Two-panel body ── */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* Left panel — PDF viewer */}
          <div className="flex-1 min-w-0 flex flex-col bg-slate-50 min-h-[40vh] md:min-h-0">
            <PdfViewer file={file} className="flex-1" />
          </div>

          {/* Right panel — extracted data */}
          <div className="w-full md:w-[400px] lg:w-[550px] xl:w-[670px] shrink-0 flex flex-col bg-white overflow-hidden h-[50vh] md:h-auto">
            <InvoiceDataPanel
              data={extractedData}
              className="flex-1"
              onChange={setEditedData}
            />
          </div>
        </div>

        {/* ── Footer ── */}
        <Separator />
        <div className="flex items-center justify-between px-6 py-4 shrink-0">
          {/* Restart button */}
          <button
            onClick={onRestart}
            className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
          >
            <RotateCcw size={14} />
            เริ่มกระบวนการใหม่
          </button>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={handleClose}
              className="text-slate-600 hover:bg-slate-100 rounded-md"
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleSave}
              className="bg-orange-400 hover:bg-orange-500 text-white rounded-md px-5 transition-colors shadow-sm shadow-orange-200"
            >
              บันทึกข้อมูล
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
