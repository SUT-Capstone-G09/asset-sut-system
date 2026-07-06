"use client";

import React, { useState } from "react";
import { X, FileText, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Tenant } from "../types";

interface UploadInvoiceModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: Tenant | null;
}

export function UploadInvoiceModal({
  isOpen,
  onOpenChange,
  tenant,
}: UploadInvoiceModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleConfirm = () => {
    // In a real app, this would upload the file
    alert(`อัพโหลดใบแจ้งหนี้สำหรับ ${tenant?.name} สำเร็จ!${note ? `\nหมายเหตุ: ${note}` : ""}`);
    onOpenChange(false);
    setFile(null);
    setNote("");
  };

  if (!tenant) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-[15px] border-none shadow-2xl">
        <div className="p-8 space-y-6">
          <DialogHeader className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-2">
              <FileText size={24} />
            </div>
            <DialogTitle className="text-xl font-black text-slate-900">
              ยืนยันการอัปโหลดใบแจ้งหนี้
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-400 text-center max-w-md">
              กรุณาตรวจสอบรายละเอียดความถูกต้องก่อนดำเนินการบันทึกข้อมูลเข้าสู่ระบบ
            </DialogDescription>
          </DialogHeader>

          {/* Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative group flex flex-col items-center justify-center py-12 px-6 rounded-3xl border-2 border-dashed transition-all",
              isDragging
                ? "bg-orange-50 border-orange-400"
                : file
                ? "bg-emerald-50 border-emerald-200"
                : "bg-slate-50 border-slate-200 hover:border-orange-300"
            )}
          >
            {file ? (
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <p className="text-sm font-bold text-slate-800 mb-1">{file.name}</p>
                <p className="text-xs text-slate-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • PDF
                </p>
                <button
                  onClick={() => setFile(null)}
                  className="mt-4 text-xs font-bold text-red-500 hover:underline"
                >
                  ลบไฟล์และเลือกใหม่
                </button>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-white text-slate-300 flex items-center justify-center mb-4 shadow-sm">
                  <Upload size={28} />
                </div>
                <h4 className="text-base font-bold text-slate-800">
                  ลากไฟล์ PDF มาที่นี่เพื่ออัปโหลด
                </h4>
                <p className="text-xs text-slate-400 mt-1 mb-6">
                  รองรับไฟล์ใบแจ้งหนี้รูปแบบ PDF ขนาดไม่เกิน 10MB ต่อไฟล์
                </p>
                <label className="cursor-pointer h-11 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center transition-all">
                  เลือกไฟล์จากเครื่อง
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    onChange={handleFileChange}
                  />
                </label>
              </>
            )}
          </div>

          {/* Note Area */}
          <div className="space-y-2">
            <Label htmlFor="note" className="text-sm font-bold text-slate-700">
              หมายเหตุ (ถ้ามี)
            </Label>
            <Textarea
              id="note"
              placeholder="ระบุหมายเหตุเพิ่มเติมเกี่ยวกับใบแจ้งหนี้นี้..."
              className="resize-none rounded-2xl border-slate-200 focus:border-orange-400 focus:ring-orange-400 h-24 text-sm"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-12 rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
            >
              ยกเลิก
            </Button>
            <Button
              disabled={!file}
              onClick={handleConfirm}
              className={cn(
                "flex-1 h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
                file
                  ? "bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              )}
            >
              <CheckCircle2 size={18} />
              ยืนยันการอัปโหลด
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
