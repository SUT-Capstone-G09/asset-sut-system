"use client";

import React, { useState } from "react";
import { FileText, Upload, X } from "lucide-react";
import { FileDropzone } from "@/components/ui/file-dropzone";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tenantAreaOptions } from "@/features/tenants/data/tenant-areas";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const vacantSpaces = [
  { id: "v1", name: "ล็อค A1 (ร้านอาหาร)", areaId: "cafeterias", location: "โรงอาหารพราวแสดทอง" },
  { id: "v2", name: "ล็อค B2 (ร้านน้ำ)", areaId: "cafeterias", location: "โรงอาหารกาสะลองคำ" },
  { id: "v3", name: "พื้นที่ว่าง (มินิมาร์ท)", areaId: "learning-buildings", location: "อาคารเรียนรวม 1" },
  { id: "v4", name: "ลานอเนกประสงค์", areaId: "student-affairs", location: "ลานกิจกรรม" },
];

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
  files: File[];
  allowOnlineSubmit: boolean;
  note: string;
}

const INITIAL_FORM_STATE: AddEnvelopDocumentFormData = {
  title: "",
  areaId: "",
  location: "",
  price: 0,
  files: [],
  allowOnlineSubmit: false,
  note: "",
};

export function AddEnvelopDocumentModal({
  isOpen,
  onOpenChange,
  onSubmit,
}: AddEnvelopDocumentModalProps) {
  const [form, setForm] = useState<AddEnvelopDocumentFormData>(INITIAL_FORM_STATE);

  const selectedArea = tenantAreaOptions.find((a) => a.id === form.areaId);

  const resetForm = () => setForm(INITIAL_FORM_STATE);

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = () => {
    onSubmit?.(form);
    handleClose();
  };

  const canSubmit = form.title.trim().length > 0;

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full sm:max-w-[640px] p-0 border-none bg-white flex flex-col h-full shadow-2xl"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-6 py-5 border-b border-slate-100 flex flex-row items-center justify-between space-y-0 shrink-0 bg-white">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-[7px] bg-[#f26522]/10 flex items-center justify-center shrink-0">
                <FileText size={20} className="text-[#f26522]" strokeWidth={3} />
              </div>
              <SheetTitle className="text-xl font-bold text-slate-900 tracking-tight">
                เพิ่มซองเอกสารใหม่
              </SheetTitle>
              <SheetDescription className="sr-only">
                แบบฟอร์มเพิ่มซองเอกสารใหม่
              </SheetDescription>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="size-9 rounded-[7px] bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center justify-center group"
            >
              <X size={18} className="transition-transform group-hover:rotate-90" />
            </button>
          </SheetHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">

            {/* Section: ข้อมูลซองเอกสาร */}
            <div className="space-y-5">
              <div className="flex items-center gap-2.5" style={{ color: "#f26522" }}>
                <div className="size-8 rounded-[7px] bg-[#f26522]/10 flex items-center justify-center shadow-sm border border-slate-100">
                  <FileText size={16} strokeWidth={2.5} />
                </div>
                <h3 className="text-sm font-bold text-slate-700">ข้อมูลซองเอกสาร</h3>
              </div>

              {/* ทุกช่องอยู่ใน grid เดียวกัน → ขนาดเท่ากันทุกช่อง */}
              <div className="grid grid-cols-2 gap-4">

                {/* พื้นที่ว่าง */}
                <div className="space-y-2.5">
                  <Label htmlFor="envelop-title" className="text-xs font-bold text-slate-500 ml-1">
                    พื้นที่ว่าง (Vacant Area)
                  </Label>
                  <Select
                    value={form.title}
                    onValueChange={(v) => {
                      const space = vacantSpaces.find((s) => s.name === v);
                      if (space) {
                        setForm((f) => ({ ...f, title: space.name, areaId: space.areaId, location: space.location }));
                      } else {
                        setForm((f) => ({ ...f, title: v }));
                      }
                    }}
                  >
                    <SelectTrigger id="envelop-title" className="rounded-[7px] !h-12 bg-slate-50 border-transparent focus:bg-white focus:ring-1 focus:ring-[#f26522]/30 transition-all text-sm w-full">
                      <SelectValue placeholder="เลือกพื้นที่ว่าง..." />
                    </SelectTrigger>
                    <SelectContent>
                      {vacantSpaces.map((space) => (
                        <SelectItem key={space.id} value={space.name}>{space.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* ดันแถวแรกให้มีแค่ช่องเดียว */}
                <div className="hidden sm:block" />

                {/* โซนพื้นที่ */}
                <div className="space-y-2.5">
                  <Label className="text-xs font-bold text-slate-500 ml-1">โซนพื้นที่</Label>
                  <Select value={form.areaId} disabled={true}>
                    <SelectTrigger id="envelop-area" className="rounded-[7px] !h-12 bg-slate-50 border-transparent transition-all text-sm opacity-60 w-full">
                      <SelectValue placeholder="— (Auto-fill) —" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenantAreaOptions.map((area) => (
                        <SelectItem key={area.id} value={area.id}>{area.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* สถานที่ย่อย */}
                <div className="space-y-2.5">
                  <Label className="text-xs font-bold text-slate-500 ml-1">สถานที่ย่อย</Label>
                  <Select value={form.location} disabled={true}>
                    <SelectTrigger id="envelop-location" className="rounded-[7px] !h-12 bg-slate-50 border-transparent transition-all text-sm opacity-60 w-full">
                      <SelectValue placeholder="— (Auto-fill) —" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedArea?.subLocations.map((sub) => (
                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* ราคาจำหน่าย */}
                <div className="space-y-2.5">
                  <Label htmlFor="envelop-price" className="text-xs font-bold text-slate-500 ml-1">
                    ราคาจำหน่าย (บาท)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium pointer-events-none">฿</span>
                    <Input
                      id="envelop-price"
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder="0.00"
                      value={form.price === 0 ? "" : form.price}
                      onChange={(e) => setForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                      className="rounded-[7px] !h-12 pl-7 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#f26522]/30 transition-all text-sm w-full"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-100" />

            {/* Section: ไฟล์เอกสาร */}
            <div className="space-y-5">
              <div className="flex items-center gap-2.5" style={{ color: "#f26522" }}>
                <div className="size-8 rounded-[7px] bg-[#f26522]/10 flex items-center justify-center shadow-sm border border-slate-100">
                  <Upload size={16} strokeWidth={2.5} />
                </div>
                <h3 className="text-sm font-bold text-slate-700">ไฟล์เอกสาร</h3>
              </div>

              <FileDropzone
                files={form.files}
                onFilesChange={(files) => setForm((f) => ({ ...f, files }))}
                multiple
                accept=".pdf,.zip"
                hint="PDF, ZIP ไม่เกิน 20MB · เลือกได้หลายไฟล์"
              />

              {/* Toggle: เปิดรับออนไลน์ */}
              <div className="flex items-center justify-between rounded-[7px] bg-slate-50 px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-[7px] bg-[#f26522]/10 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#f26522]">
                      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                      <circle cx="12" cy="20" r="1" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">เปิดรับการส่งใบสมัครออนไลน์</p>
                    <p className="text-xs text-slate-400">อนุญาตให้ผู้สมัครส่งเอกสารผ่านระบบ</p>
                  </div>
                </div>
                <Switch
                  id="envelop-online-submit"
                  checked={form.allowOnlineSubmit}
                  onCheckedChange={(v: boolean) => setForm((f) => ({ ...f, allowOnlineSubmit: v }))}
                  className="data-[state=checked]:bg-[#f26522]"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-100" />

            {/* หมายเหตุ */}
            <div className="space-y-2.5">
              <Label htmlFor="envelop-note" className="text-xs font-bold text-slate-500 ml-1">
                หมายเหตุ (ถ้ามี)
              </Label>
              <Textarea
                id="envelop-note"
                placeholder="ระบุหมายเหตุเพิ่มเติม..."
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                className="rounded-[7px] min-h-[100px] bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#f26522]/30 transition-all p-4 resize-none text-sm"
              />
            </div>

          </div>


          {/* Sticky Footer */}
          <div className="px-6 py-5 border-t border-slate-100 flex items-center gap-4 bg-white/90 backdrop-blur-md shrink-0">
            <Button
              variant="ghost"
              onClick={handleClose}
              className="flex-1 h-12 rounded-[7px] font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
            >
              ยกเลิก
            </Button>
            <Button
              disabled={!canSubmit}
              onClick={handleSubmit}
              className={cn(
                "flex-1 h-12 rounded-[7px] bg-[#f26522] hover:bg-[#d8561d] text-white font-bold shadow-lg shadow-[#f26522]/20 transition-all hover:scale-[1.02] active:scale-[0.98] gap-2 flex items-center justify-center",
                !canSubmit && "opacity-50 cursor-not-allowed hover:scale-100 active:scale-100 hover:bg-[#f26522]"
              )}
            >
              <FileText size={18} />
              เพิ่มเอกสาร
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
