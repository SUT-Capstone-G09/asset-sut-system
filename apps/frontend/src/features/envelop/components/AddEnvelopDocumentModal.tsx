"use client";

import React, { useRef, useState } from "react";
import { FileText, Upload, CheckCircle2, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tenantAreaOptions } from "@/features/tenants/data/tenant-areas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface AddEnvelopDocumentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: AddEnvelopDocumentFormData) => void;
}

export interface AddEnvelopDocumentFormData {
  title: string;
  areaId: string;
  location: string;
  price: number;
  file: File | null;
  allowOnlineSubmit: boolean;
  note: string;
}

export function AddEnvelopDocumentModal({
  isOpen,
  onOpenChange,
  onSubmit,
}: AddEnvelopDocumentModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [form, setForm] = useState<AddEnvelopDocumentFormData>({
    title: "",
    areaId: "",
    location: "",
    price: 0,
    file: null,
    allowOnlineSubmit: true,
    note: "",
  });

  const selectedArea = tenantAreaOptions.find((a) => a.id === form.areaId);

  const resetForm = () => {
    setForm({
      title: "",
      areaId: "",
      location: "",
      price: 0,
      file: null,
      allowOnlineSubmit: true,
      note: "",
    });
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setForm((f) => ({ ...f, file: dropped }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setForm((f) => ({ ...f, file: selected }));
  };

  const handleSubmit = () => {
    onSubmit?.(form);
    handleClose();
  };

  const canSubmit = form.title.trim().length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
        <DialogDescription className="sr-only">
          แบบฟอร์มเพิ่มซองเอกสารใหม่
        </DialogDescription>
        <div className="p-6 space-y-5">
          {/* Header */}
          <DialogHeader className="pb-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                <FileText size={18} strokeWidth={2} />
              </div>
              <DialogTitle className="text-lg font-black text-slate-900">
                เพิ่มซองเอกสารใหม่
              </DialogTitle>
            </div>
          </DialogHeader>

          {/* ชื่อเอกสาร */}
          <div className="space-y-1.5">
            <Label
              htmlFor="envelop-title"
              className="text-[11px] font-bold uppercase tracking-widest text-slate-400"
            >
              ชื่อซองเอกสาร (Document Title)
            </Label>
            <Input
              id="envelop-title"
              placeholder="ระบุชื่อซองเอกสาร..."
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="h-11 rounded-xl border-slate-200 text-sm focus-visible:ring-slate-900"
            />
          </div>

          {/* สถานที่ */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                className="text-[11px] font-bold uppercase tracking-widest text-slate-400"
              >
                โซนพื้นที่
              </Label>
              <Select
                value={form.areaId}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, areaId: v, location: "" }))
                }
              >
                <SelectTrigger
                  id="envelop-area"
                  className="h-11 rounded-xl border-slate-200 text-sm w-full"
                >
                  <SelectValue placeholder="เลือกโซนพื้นที่" />
                </SelectTrigger>
                <SelectContent>
                  {tenantAreaOptions.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label
                className="text-[11px] font-bold uppercase tracking-widest text-slate-400"
              >
                สถานที่ย่อย
              </Label>
              <Select
                value={form.location}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, location: v }))
                }
                disabled={!form.areaId}
              >
                <SelectTrigger
                  id="envelop-location"
                  className="h-11 rounded-xl border-slate-200 text-sm w-full"
                >
                  <SelectValue placeholder={form.areaId ? "เลือกสถานที่" : "เลือกโซนก่อน"} />
                </SelectTrigger>
                <SelectContent>
                  {selectedArea?.subLocations.map((sub) => (
                    <SelectItem key={sub} value={sub}>
                      {sub}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ราคา */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="envelop-price"
                className="text-[11px] font-bold uppercase tracking-widest text-slate-400"
              >
                ราคาจำหน่าย (THB)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                  ฿
                </span>
                <Input
                  id="envelop-price"
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  value={form.price === 0 ? "" : form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))
                  }
                  className="h-11 pl-7 rounded-xl border-slate-200 text-sm focus-visible:ring-slate-900 w-full"
                />
              </div>
            </div>
          </div>

          {/* ไฟล์เอกสาร */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              ไฟล์เอกสาร (PDF/ZIP)
            </Label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !form.file && fileInputRef.current?.click()}
              className={cn(
                "relative flex flex-col items-center justify-center py-8 px-4 rounded-xl border-2 border-dashed transition-all cursor-pointer",
                isDragging
                  ? "bg-slate-100 border-slate-400"
                  : form.file
                  ? "bg-emerald-50 border-emerald-200 cursor-default"
                  : "bg-slate-50 border-slate-200 hover:border-slate-400 hover:bg-slate-100"
              )}
            >
              {form.file ? (
                <div className="flex flex-col items-center text-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                    <CheckCircle2 size={20} />
                  </div>
                  <p className="text-sm font-bold text-slate-800">{form.file.name}</p>
                  <p className="text-xs text-slate-400">
                    {(form.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setForm((f) => ({ ...f, file: null }));
                    }}
                    className="mt-2 text-xs font-bold text-red-500 hover:underline flex items-center gap-1"
                  >
                    <X size={12} /> ลบและเลือกใหม่
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center gap-1">
                  <Upload size={28} className="text-slate-300 mb-2" />
                  <p className="text-sm font-semibold text-slate-700">
                    ลากไฟล์มาวางที่นี่ หรือ{" "}
                    <span className="text-slate-900 underline underline-offset-2">
                      คลิกเพื่ออัปโหลด
                    </span>
                  </p>
                  <p className="text-xs text-slate-400">
                    รองรับไฟล์ PDF, ZIP ขนาดไม่เกิน 20MB
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.zip"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* เปิดรับการส่งใบสมัครออนไลน์ */}
          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-600"
                >
                  <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                  <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                  <circle cx="12" cy="20" r="1" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  เปิดรับการส่งใบสมัครออนไลน์
                </p>
                <p className="text-xs text-slate-400">
                  อนุญาตให้ผู้สมัครส่งเอกสารผ่านระบบ
                </p>
              </div>
            </div>
            <Switch
              id="envelop-online-submit"
              checked={form.allowOnlineSubmit}
              onCheckedChange={(v: boolean) =>
                setForm((f) => ({ ...f, allowOnlineSubmit: v }))
              }
            />
          </div>

          {/* หมายเหตุ */}
          <div className="space-y-1.5">
            <Label
              htmlFor="envelop-note"
              className="text-[11px] font-bold uppercase tracking-widest text-slate-400"
            >
              หมายเหตุ (ถ้ามี)
            </Label>
            <Textarea
              id="envelop-note"
              placeholder="ระบุหมายเหตุเพิ่มเติม..."
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              className="resize-none rounded-xl border-slate-200 focus-visible:ring-slate-900 h-20 text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-11 rounded-xl border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
            >
              ยกเลิก
            </Button>
            <Button
              disabled={!canSubmit}
              onClick={handleSubmit}
              className={cn(
                "flex-1 h-11 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
                canSubmit
                  ? "bg-[#EA580C] hover:bg-[#C2410C] text-white"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              )}
            >
              <FileText size={16} />
              เพิ่มเอกสาร
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
