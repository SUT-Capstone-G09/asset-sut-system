"use client";

import React, { useState } from "react";
import { CloudUpload, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tenant, SavedInvoice } from "../../types";
import { FileDropZone } from "@/components/ui/FileDropZone";
import { ReviewInvoiceModal } from "./ReviewInvoiceModal";

interface UploadInvoiceModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: Tenant | null;
  onSave?: (invoice: SavedInvoice) => void;
}

export function UploadInvoiceModal({
  isOpen,
  onOpenChange,
  tenant,
  onSave,
}: UploadInvoiceModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") setFile(dropped);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleRemove = () => setFile(null);

  const handleClose = () => {
    onOpenChange(false);
    setFile(null);
  };

  /** Open the review modal without closing the upload modal */
  const handleOpenReview = () => {
    if (!file) return;
    setIsReviewOpen(true);
    // Hide upload modal behind review modal
    onOpenChange(false);
  };

  /** Called from ReviewInvoiceModal — restart the whole flow */
  const handleRestart = () => {
    setIsReviewOpen(false);
    setFile(null);
    onOpenChange(true);
  };

  /** Called from ReviewInvoiceModal — save and close everything */
  const handleSave = (invoice: SavedInvoice) => {
    setIsReviewOpen(false);
    setFile(null);
    onSave?.(invoice);
  };

  if (!tenant) return null;

  return (
    <>
      {/* ── Upload Modal ── */}
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-xl min-h-[400px] sm:min-h-[520px] p-0 gap-0 overflow-hidden rounded-md border-none shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2.5">
              <CloudUpload size={20} className="text-orange-500 shrink-0" />
              <DialogTitle className="text-base font-bold text-orange-500">
                นำเข้าเอกสารใบแจ้งหนี้
              </DialogTitle>
            </div>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600 transition-colors rounded-md p-1 hover:bg-slate-100"
              aria-label="ปิด"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="px-6 pb-5 space-y-4 flex-1 flex flex-col">
            <FileDropZone
              file={file}
              isDragging={isDragging}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onFileChange={handleFileChange}
              onRemove={handleRemove}
              className="flex-1"
            />

            {/* Info Banner */}
            <div className="flex items-start gap-2.5 bg-orange-50 border border-orange-200 rounded-md px-4 py-3">
              <Info size={15} className="text-orange-400 shrink-0 mt-0.5" />
              <p className="text-xs text-orange-600 leading-relaxed">
                โปรดตรวจสอบความถูกต้องเพื่อให้หน่วยงานที่เบิกจ่ายสามารถประมวลผลได้อย่างถูกต้อง
              </p>
            </div>
          </div>

          {/* Footer */}
          <Separator />
          <div className="flex items-center justify-end gap-3 px-6 py-4">
            <Button
              variant="ghost"
              onClick={handleClose}
              className="text-slate-600 hover:bg-slate-100 rounded-md"
            >
              ยกเลิก
            </Button>
            <Button
              disabled={!file}
              onClick={handleOpenReview}
              className="bg-orange-400 hover:bg-orange-500 text-white rounded-md px-5 disabled:bg-orange-200 disabled:text-white disabled:cursor-not-allowed transition-colors"
            >
              ดำเนินการต่อและตรวจสอบเอกสาร
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Review Modal ── */}
      <ReviewInvoiceModal
        isOpen={isReviewOpen}
        onOpenChange={setIsReviewOpen}
        tenant={tenant}
        file={file}
        onRestart={handleRestart}
        onSave={handleSave}
      />
    </>
  );
}
