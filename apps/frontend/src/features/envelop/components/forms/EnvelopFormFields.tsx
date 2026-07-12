"use client";

import { FileText, Pencil, Upload } from "lucide-react";
import { FileDropzone, ExistingFile } from "@/components/ui/file-dropzone";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tenantAreaOptions } from "@/features/tenants/data/tenant-areas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { DocumentStatus } from "../../types/envelop";

const vacantSpaces = [
  { id: "v1", name: "ล็อค A1 (ร้านอาหาร)", areaId: "cafeterias", location: "โรงอาหารพราวแสดทอง" },
  { id: "v2", name: "ล็อค B2 (ร้านน้ำ)", areaId: "cafeterias", location: "โรงอาหารกาสะลองคำ" },
  { id: "v3", name: "พื้นที่ว่าง (มินิมาร์ท)", areaId: "learning-buildings", location: "อาคารเรียนรวม 1" },
  { id: "v4", name: "ลานอเนกประสงค์", areaId: "student-affairs", location: "ลานกิจกรรม" },
];

const statusOptions: { value: DocumentStatus; label: string; color: string }[] = [
  { value: "draft",       label: "ร่าง",           color: "text-slate-500" },
  { value: "on_sale",     label: "เปิดขาย",        color: "text-emerald-600" },
  { value: "unavailable", label: "ปิดชั่วคราว",   color: "text-amber-600" },
  { value: "archived",    label: "ปิดถาวร",       color: "text-red-500" },
];

interface EnvelopFormFieldsProps {
  form: any;
  setForm: any;
  isEdit?: boolean;
  existingFiles?: ExistingFile[];
}

export default function EnvelopFormFields({ form, setForm, isEdit = false, existingFiles = [] }: EnvelopFormFieldsProps) {
  const selectedArea = tenantAreaOptions.find((a) => a.id === form.areaId);
  
  // คำนวณไฟล์เดิมที่ยังไม่ได้ถูกลบเฉพาะโหมดแก้ไข
  const visibleExistingFiles = isEdit 
    ? existingFiles.filter((a) => !form.removedAttachmentIds?.includes(a.id))
    : undefined;

  return (
    <div className="space-y-6">

      {/* Section: ข้อมูลซองเอกสาร */}
      <div className="space-y-5">
        <div className="flex items-center gap-2.5" style={{ color: "#f26522" }}>
          <div className="size-8 rounded-[7px] bg-[#f26522]/10 flex items-center justify-center shadow-sm border border-slate-100">
            {isEdit ? <Pencil size={16} strokeWidth={2.5} /> : <FileText size={16} strokeWidth={2.5} />}
          </div>
          <h3 className="text-sm font-bold text-slate-700">ข้อมูลซองเอกสาร</h3>
        </div>

        {/* Grid สำหรับจัดวาง Layout */}
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
                  setForm((f: any) => ({ ...f, title: space.name, areaId: space.areaId, location: space.location }));
                } else {
                  setForm((f: any) => ({ ...f, title: v }));
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
                onChange={(e) => setForm((f: any) => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                className="rounded-[7px] !h-12 pl-7 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#f26522]/30 transition-all text-sm w-full"
              />
            </div>
          </div>

          {/* สถานะเอกสาร (เฉพาะ Edit) */}
          {isEdit && (
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-slate-500 ml-1">สถานะเอกสาร</Label>
              <Select
                value={form.documentStatus}
                onValueChange={(v) => setForm((f: any) => ({ ...f, documentStatus: v as DocumentStatus }))}
              >
                <SelectTrigger id="envelop-status" className="rounded-[7px] !h-12 bg-slate-50 border-transparent focus:bg-white focus:ring-1 focus:ring-[#f26522]/30 transition-all text-sm w-full">
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
          )}

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
          onFilesChange={(files) => setForm((f: any) => ({ ...f, files }))}
          existingFiles={visibleExistingFiles}
          onExistingFileRemove={isEdit ? (id) =>
            setForm((f: any) => ({
              ...f,
              removedAttachmentIds: [...(f.removedAttachmentIds || []), id],
            })) : undefined
          }
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
            onCheckedChange={(v: boolean) => setForm((f: any) => ({ ...f, allowOnlineSubmit: v }))}
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
          onChange={(e) => setForm((f: any) => ({ ...f, note: e.target.value }))}
          className="rounded-[7px] min-h-[100px] bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#f26522]/30 transition-all p-4 resize-none text-sm"
        />
      </div>

    </div>
  );
}
