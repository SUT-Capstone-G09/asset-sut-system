"use client";

import React, { useEffect, useState } from "react";
import { Pencil, CheckCircle2 } from "lucide-react";
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
import { DocumentStatus, EnvelopDocument } from "../types/envelop";

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
  allowOnlineSubmit: boolean;
  note: string;
}

export function EditEnvelopDocumentModal({
  isOpen,
  onOpenChange,
  document,
  onSubmit,
}: EditEnvelopDocumentModalProps) {
  const [form, setForm] = useState<EditEnvelopDocumentFormData>({
    title: "",
    areaId: "",
    location: "",
    price: 0,
    documentStatus: "พร้อมใช้งาน",
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
        allowOnlineSubmit: true,
        note: "",
      });
    }
  }, [document]);

  const selectedArea = tenantAreaOptions.find((a) => a.id === form.areaId);

  const handleClose = () => {
    onOpenChange(false);
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
        <DialogDescription className="sr-only">
          แบบฟอร์มแก้ไขซองเอกสาร
        </DialogDescription>
        <div className="p-6 space-y-5">
          {/* Header */}
          <DialogHeader className="pb-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-700 text-white flex items-center justify-center shrink-0">
                <Pencil size={16} strokeWidth={2} />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-slate-900">
                  แก้ไขซองเอกสาร
                </DialogTitle>
                <p className="text-xs text-slate-400 mt-0.5">
                  รหัสเอกสาร: {document.id}
                </p>
              </div>
            </div>
          </DialogHeader>

          {/* ชื่อเอกสาร */}
          <div className="space-y-1.5">
            <Label
              htmlFor="edit-envelop-title"
              className="text-[11px] font-bold uppercase tracking-widest text-slate-400"
            >
              ชื่อซองเอกสาร (Document Title)
            </Label>
            <Input
              id="edit-envelop-title"
              placeholder="ระบุชื่อซองเอกสาร..."
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="h-11 rounded-xl border-slate-200 text-sm focus-visible:ring-slate-900"
            />
          </div>

          {/* สถานที่ */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                โซนพื้นที่
              </Label>
              <Select
                value={form.areaId}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, areaId: v, location: "" }))
                }
              >
                <SelectTrigger
                  id="edit-envelop-area"
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
              <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                สถานที่ย่อย
              </Label>
              <Select
                value={form.location}
                onValueChange={(v) => setForm((f) => ({ ...f, location: v }))}
                disabled={!form.areaId}
              >
                <SelectTrigger
                  id="edit-envelop-location"
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

          {/* ราคา + สถานะ */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-envelop-price"
                className="text-[11px] font-bold uppercase tracking-widest text-slate-400"
              >
                ราคาจำหน่าย (THB)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                  ฿
                </span>
                <Input
                  id="edit-envelop-price"
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

            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                สถานะ
              </Label>
              <Select
                value={form.documentStatus}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, documentStatus: v as DocumentStatus }))
                }
              >
                <SelectTrigger
                  id="edit-envelop-status"
                  className="h-11 rounded-xl border-slate-200 text-sm w-full"
                >
                  <SelectValue placeholder="เลือกสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className={cn("font-medium", opt.color)}>
                        {opt.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              id="edit-envelop-online-submit"
              checked={form.allowOnlineSubmit}
              onCheckedChange={(v: boolean) =>
                setForm((f) => ({ ...f, allowOnlineSubmit: v }))
              }
            />
          </div>

          {/* หมายเหตุ */}
          <div className="space-y-1.5">
            <Label
              htmlFor="edit-envelop-note"
              className="text-[11px] font-bold uppercase tracking-widest text-slate-400"
            >
              หมายเหตุ (ถ้ามี)
            </Label>
            <Textarea
              id="edit-envelop-note"
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
              <CheckCircle2 size={16} />
              บันทึกการแก้ไข
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
