"use client";

import React, { useEffect, useRef, useState } from "react";
import { Pencil, CheckCircle2, Upload, X } from "lucide-react";
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
import { DocumentStatus, EnvelopDocument } from "../types/envelop";

const vacantSpaces = [
  { id: "v1", name: "ล็อค A1 (ร้านอาหาร)", areaId: "cafeterias", location: "โรงอาหารพราวแสดทอง" },
  { id: "v2", name: "ล็อค B2 (ร้านน้ำ)", areaId: "cafeterias", location: "โรงอาหารกาสะลองคำ" },
  { id: "v3", name: "พื้นที่ว่าง (มินิมาร์ท)", areaId: "learning-buildings", location: "อาคารเรียนรวม 1" },
  { id: "v4", name: "ลานอเนกประสงค์", areaId: "student-affairs", location: "ลานกิจกรรม" },
];

const statusOptions: { value: DocumentStatus; label: string; color: string }[] = [
  { value: "พร้อมใช้งาน", label: "พร้อมใช้งาน", color: "text-emerald-600" },
  { value: "ใช้งานอยู่", label: "ใช้งานอยู่", color: "text-blue-600" },
  { value: "หมดอายุ", label: "หมดอายุ", color: "text-red-500" },
];

interface EditEnvelopDocumentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  document: EnvelopDocument | null;
  onSubmit?: (id: string, data: EditEnvelopDocumentFormData) => void;
}

export interface EditEnvelopDocumentFormData {
  title: string;
  areaId: string;
  location: string;
  price: number;
  documentStatus: DocumentStatus;
  files: File[];
  allowOnlineSubmit: boolean;
  note: string;
}

export function EditEnvelopDocumentModal({
  isOpen,
  onOpenChange,
  document,
  onSubmit,
}: EditEnvelopDocumentModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [form, setForm] = useState<EditEnvelopDocumentFormData>({
    title: "",
    areaId: "",
    location: "",
    price: 0,
    documentStatus: "พร้อมใช้งาน",
    files: [],
    allowOnlineSubmit: true,
    note: "",
  });

  // Pre-fill form when document changes
  useEffect(() => {
    if (document) {
      // Try to find the matching areaId from the location string
      const matchedArea = tenantAreaOptions.find((area) =>
        area.subLocations.includes(document.location)
      );
      setForm({
        title: document.name,
        areaId: matchedArea?.id ?? "",
        location: document.location,
        price: 0,
        documentStatus: document.documentStatus,
        files: [],
        allowOnlineSubmit: true,
        note: "",
      });
    }
  }, [document]);

  const selectedArea = tenantAreaOptions.find((a) => a.id === form.areaId);

  const handleClose = () => {
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
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length > 0) setForm((f) => ({ ...f, files: [...f.files, ...dropped] }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length > 0) setForm((f) => ({ ...f, files: [...f.files, ...selected] }));
  };

  const handleSubmit = () => {
    if (document) {
      onSubmit?.(document.id, form);
    }
    handleClose();
  };

  const canSubmit = form.title.trim().length > 0;

  if (!document) return null;

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
                <Pencil size={20} className="text-[#f26522]" strokeWidth={3} />
              </div>
              <div className="flex flex-col text-left">
                <SheetTitle className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
                  แก้ไขซองเอกสาร
                </SheetTitle>
                <SheetDescription className="text-xs text-slate-400 mt-0.5">
                  รหัสเอกสาร: {document.id}
                </SheetDescription>
              </div>
            </div>

            {/* Close Button */}
            <button 
              type="button"
              onClick={handleClose} 
              className="size-9 rounded-[7px] bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center justify-center group shrink-0"
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
                  <Pencil size={16} strokeWidth={2.5} />
                </div>
                <h3 className="text-sm font-bold text-slate-700">ข้อมูลซองเอกสาร</h3>
              </div>

              {/* ทุกช่องอยู่ใน grid เดียวกัน → ขนาดเท่ากันทุกช่อง */}
              <div className="grid grid-cols-2 gap-4">

                {/* พื้นที่ว่าง */}
                <div className="space-y-2.5">
                  <Label htmlFor="edit-envelop-title" className="text-xs font-bold text-slate-500 ml-1">
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
                    <SelectTrigger id="edit-envelop-title" className="rounded-[7px] !h-12 bg-slate-50 border-transparent focus:bg-white focus:ring-1 focus:ring-[#f26522]/30 transition-all text-sm w-full">
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
                    <SelectTrigger id="edit-envelop-area" className="rounded-[7px] !h-12 bg-slate-50 border-transparent transition-all text-sm opacity-60 w-full">
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
                    <SelectTrigger id="edit-envelop-location" className="rounded-[7px] !h-12 bg-slate-50 border-transparent transition-all text-sm opacity-60 w-full">
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
                  <Label htmlFor="edit-envelop-price" className="text-xs font-bold text-slate-500 ml-1">
                    ราคาจำหน่าย (บาท)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium pointer-events-none">฿</span>
                    <Input
                      id="edit-envelop-price"
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

                {/* สถานะเอกสาร */}
                <div className="space-y-2.5">
                  <Label className="text-xs font-bold text-slate-500 ml-1">สถานะเอกสาร</Label>
                  <Select
                    value={form.documentStatus}
                    onValueChange={(v) => setForm((f) => ({ ...f, documentStatus: v as DocumentStatus }))}
                  >
                    <SelectTrigger id="edit-envelop-status" className="rounded-[7px] !h-12 bg-slate-50 border-transparent focus:bg-white focus:ring-1 focus:ring-[#f26522]/30 transition-all text-sm w-full">
                      <SelectValue placeholder="เลือกสถานะ" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className={cn("font-medium", opt.color)}>{opt.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "relative rounded-[7px] border-2 border-dashed p-4 transition-all",
                  isDragging ? "bg-orange-50 border-[#f26522]" : "bg-slate-50 border-slate-200"
                )}
              >
                {form.files.length > 0 && (
                  <div className="max-h-52 overflow-y-auto pr-0.5 mb-3">
                    <div className="grid grid-cols-3 gap-3">
                      {form.files.map((file, index) => {
                        const isPdf = file.name.toLowerCase().endsWith(".pdf");
                        return (
                          <div key={index} className="group relative flex flex-col items-center p-3 bg-white rounded-[7px] border border-slate-200 shadow-sm hover:shadow-md transition-all">
                            <div className="absolute top-2 right-2 hidden group-hover:flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setForm((f) => ({ ...f, files: f.files.filter((_, i) => i !== index) })); }}
                                className="w-6 h-6 flex items-center justify-center rounded-md bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
                              >
                                <X size={12} />
                              </button>
                            </div>
                            <div className="w-12 h-14 mb-2 flex items-end justify-center">
                              {isPdf ? (
                                <svg viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                  <rect width="48" height="56" rx="6" fill="#EEF0FF"/>
                                  <path d="M32 2L46 16H32V2Z" fill="#C7CBFF"/>
                                  <path d="M32 2H8C5.8 2 4 3.8 4 6v44c0 2.2 1.8 4 4 4h32c2.2 0 4-1.8 4-4V16L32 2Z" fill="#C7CBFF" fillOpacity="0.4"/>
                                  <text x="7" y="44" fontFamily="Arial" fontSize="11" fontWeight="bold" fill="#6366f1">PDF</text>
                                </svg>
                              ) : (
                                <svg viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                  <rect width="48" height="56" rx="6" fill="#EEF0FF"/>
                                  <path d="M32 2L46 16H32V2Z" fill="#C7CBFF"/>
                                  <rect x="10" y="26" width="8" height="8" rx="1" fill="#6366f1"/>
                                  <rect x="20" y="26" width="8" height="8" rx="1" fill="#6366f1"/>
                                  <rect x="30" y="26" width="8" height="8" rx="1" fill="#6366f1"/>
                                  <rect x="10" y="36" width="8" height="8" rx="1" fill="#6366f1"/>
                                  <rect x="20" y="36" width="8" height="8" rx="1" fill="#6366f1"/>
                                </svg>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 font-medium text-center leading-tight line-clamp-2 break-all w-full">{file.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {form.files.length === 0 ? (
                  <div
                    className="flex flex-col items-center text-center gap-1 cursor-pointer py-6 rounded-[7px] hover:bg-white/60 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={24} className="text-slate-300 mb-1" />
                    <p className="text-sm font-semibold text-slate-700">
                      ลากไฟล์มาวางที่นี่ หรือ{" "}
                      <span className="text-[#f26522] underline underline-offset-2">คลิกเพื่ออัปโหลด</span>
                    </p>
                    <p className="text-xs text-slate-400">PDF, ZIP ไม่เกิน 20MB · เลือกได้หลายไฟล์</p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[7px] border border-dashed border-slate-300 text-slate-500 text-sm font-medium hover:border-[#f26522] hover:bg-white hover:text-[#f26522] transition-all"
                  >
                    <Upload size={14} />
                    เพิ่มไฟล์ · PDF, ZIP ไม่เกิน 20MB
                  </button>
                )}
                <input ref={fileInputRef} type="file" multiple accept=".pdf,.zip" className="hidden" onChange={handleFileChange} />
              </div>

              {/* Toggle */}
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
                  id="edit-envelop-online-submit"
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
              <Label htmlFor="edit-envelop-note" className="text-xs font-bold text-slate-500 ml-1">
                หมายเหตุ (ถ้ามี)
              </Label>
              <Textarea
                id="edit-envelop-note"
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
              <CheckCircle2 size={18} />
              บันทึกการแก้ไข
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
