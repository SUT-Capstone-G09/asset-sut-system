"use client";

import React, { useEffect, useState } from "react";
import { Pencil, CheckCircle2, X } from "lucide-react";
import { tenantAreaOptions } from "@/features/tenants/data/tenant-areas";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DocumentStatus, EnvelopDocument } from "../types/envelop";
import EnvelopFormFields from "./forms/EnvelopFormFields";

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
  files: File[];              // ไฟล์ใหม่ที่ผู้ใช้เพิ่ง upload
  removedAttachmentIds: string[]; // id ของไฟล์เดิมที่ต้องการลบ
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
    documentStatus: "draft",
    files: [],
    removedAttachmentIds: [],
    allowOnlineSubmit: true,
    note: "",
  });

  // Pre-fill form when document changes
  useEffect(() => {
    if (document) {
      const matchedArea = tenantAreaOptions.find((area) =>
        area.subLocations.includes(document.location)
      );
      setForm({
        title: document.name,
        areaId: matchedArea?.id ?? "",
        location: document.location,
        price: document.amount ?? 0,
        documentStatus: document.documentStatus,
        files: [],
        removedAttachmentIds: [],
        allowOnlineSubmit: true,
        note: "",
      });
    }
  }, [document])

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
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <EnvelopFormFields form={form} setForm={setForm} isEdit existingFiles={document.attachments ?? []} />
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
